/**
 * truffle exec trufflescripts/auction.js <step, step, ...>
 * to get REP locking nad accumulated REP data for
 * @flags:
 * -f, --fund <number>       fund each account with so much GNO and WETH (default 10000)
 * -d, --deposit <number>    deposit so much WETH and GNO from each account to ETH and GNO pools respectively (default 100)
 * --revert                  revert after script run including on errors (useful for testing) (default false)
 * steps - numbers of steps to go through (default [0, 1, 2, 3, 4, 3, 4, 5, 6, 7, 8, 9])
 * Steps:
 * 0 - fund accounts
 * 1 - create a WETH-GNO auction in DX
 * 2 - deposit to pools
 * 3 - pools participate in the WETH-GNO auction
 * 4 - master account fills the auction and buys it out so it clears
 * 5 - skipping time until poolingEndTime
 * 6 - claiming pool deposits from DX and unlocking minted MGN tokens
 * 7 - skipping time until unlocked MGN can be withdrawn
 * 8 - pools withdraw unlocked MGN
 * 9 - accounts withdraw deposits and MGN from the pools
 */

/**
 * examples:
 * $ npx truffle exectruffle exec trufflescripts/auction.js
 * will go through the complete Pooling lifecycle
 * 
 * $ npx truffle exectruffle exec trufflescripts/auction.js 0 1 2
 * accounts are funded, auction started, deposits to pools made, State == Pooling
 *
 */

const assert = require('assert')

const MintableERC20 = artifacts.require("ERC20Mintable.sol")
const EtherToken = artifacts.require("EtherToken")
const TokenFRT = artifacts.require("TokenFRT")

const DX = artifacts.require("DutchExchange")
const DXProxy = artifacts.require("DutchExchangeProxy")
const Coordinator = artifacts.require("Coordinator")
const DxMgnPool = artifacts.require("DxMgnPool")

const toWei = n => web3.utils.toWei(String(n))
const fromWei = n => web3.utils.fromWei(String(n))

const { getTime, increaseTimeBy, makeSnapshot, revertSnapshot } = require("./utils")(web3)

const argv = require("minimist")(process.argv.slice(4))

const DEFAULT_STEPS = [0, 1, 2, 3, 4, 3, 4, 5, 6, 7, 8, 9]

const { _, revert, f, d, fund, deposit } = argv
const steps = _.length ? _ : DEFAULT_STEPS
console.log('steps: ', steps)

const fundAmount = fund || f || 10000
const depositAmount = deposit || d || 100

const States = [
  'Pooling',
  'PoolingEnded',
  'DepositWithdrawnFromDx',
  'MgnUnlocked',
]
States.forEach((st) => { States[st] = st })

// const BN = require("bignumber.js")

// const decimals18 = new BN(1e18)
// const DAY_IN_SEC = new BN(24 * 60 * 60)

const main = async () => {
  console.log("Getting contracts\n")
  const contracts = await getContracts(argv)
  // const {
  //   dx,
  //   dxProxy,
  //   mgnToken,
  //   ethToken,
  //   gnoToken,
  //   coordinator,
  //   ethPool,
  //   gnoPool,
  // } = contracts

  Object.keys(contracts).forEach((c) => {
    const contr = contracts[c]
    console.log(`\t${c.padEnd(15)} ${contr.address} ${contr.constructor.contractName}`)
  })

  const accounts = await web3.eth.getAccounts()
  const [master, ...participatingAccounts] = accounts
  console.log("Participating accounts:\n\t", accounts.join("\n\t"))

  let snapshotId
  if (revert) {
    snapshotId = await makeSnapshot()
    console.log('\nTook snapshot', snapshotId, '\n')
  }

  let err

  try {
    for (const step of steps) {
      await runStep(step, participatingAccounts, contracts, master)
    }
  } catch (error) {
    console.error(error)
    err = error
  }


  if (revert) {
    await revertSnapshot(snapshotId)
    console.log('\nReverted snapshot', snapshotId, '\n')
  }

  if (err) throw err
}

async function runStep(step, accounts, contracts, master) {
  console.log()
  console.group('Step', step)
  switch (step) {
    case 0:
      await fundAccounts(accounts, contracts, master)
      break
    case 1:
      await createAuction(contracts)
      break
    case 2:
      await depositToPools(contracts, accounts)
      break
    case 3:
      await participateInAuction(contracts)
      break
    case 4:
      await fillAndClearAuctions(contracts, (Math.random() / 10 + 0.02).toFixed(3), master)
      await printMGNAccumulated(contracts, accounts)
      break
    case 5:
      await waitTillPoolingEnded(contracts)
      break
    case 6:
      await triggerMGNunlockAndClaimTokens(contracts)
      await printPoolBalances(contracts)
      break
    case 7:
      await waitTillwithdrawMGN(contracts)
      await printPoolBalances(contracts)
      break
    case 8:
      await withdrawUnlockedMagnolia(contracts)
      await printPoolBalances(contracts)
      break
    case 9:
      await withdrawFunds(contracts, accounts)
      await printAccountBalances(contracts, accounts)
      break

    default:
      throw new Error(`Invalid step ${step}. Valid steps are 0-7`)
  }
  console.groupEnd()
}

async function fundAccounts(accounts, { ethToken, ethPool, dx, gnoPool, gnoToken }, master) {
  console.log(`Funding accounts and approving token transfer to contracts`)

  const amount = fundAmount
  // console.log('amount: ', amount)
  // console.log('toWei(amount): ', toWei(amount))
  // console.log('accounts[0]: ', accounts[0])
  // await ethToken.deposit({ value: toWei(amount), from: accounts[0] })
  // console.log('accounts[0]: ', accounts[0])
  // console.log('ethToken: ', ethToken.address)
  // console.log('DEPOSITED')
  // await gnoToken.transfer(accounts[1], toWei(amount))
  // console.log('TRANSFERRED GNO')


  await Promise.all(accounts.concat(master).map(acc =>
      Promise.all([
        ethToken.deposit({ value: toWei(amount), from: acc }),
        ethToken.approve(ethPool.address, toWei(amount), { from: acc }),
        ethToken.approve(dx.address, toWei(amount), { from: acc }),

        // gnoToken.mint(acc, toWei(amount)),
        gnoToken.transfer(acc, toWei(amount)),
        gnoToken.approve(gnoPool.address, toWei(amount), { from: acc }),
        gnoToken.approve(dx.address, toWei(amount), { from: acc }),
      ])))
  
  console.log(`\tEach account now has ${amount} WETH and GNO tokens`)
  console.log('\tAll of them are approved for transfer to EthPool, GnoPool and DX\n')
}

async function createAuction({ dx, ethToken, gnoToken }) {
  console.log("Creating Auction")

  await dx.deposit(ethToken.address, toWei(1000))
  await dx.deposit(gnoToken.address, toWei(1000))
  console.log('DEPOSITED TO DX')
  await dx.addTokenPair(
    ethToken.address,
    gnoToken.address,
    toWei(1),
    toWei(1),
    1,
    1,
  )
  console.log('ADDED TOKEN PAIR')
  // approving Tokens for MGN generation
  await dx.updateApprovalOfToken(
    [ethToken.address, gnoToken.address],
    [true, true],
  )

  console.log('APPROVED TOKENS')

  const auctionIndex = await dx.getAuctionIndex.call(ethToken.address, gnoToken.address)
  
  console.log(`\tWETH-GNO auction created`)
  console.log('\tauctionIndex: ', auctionIndex.toString(), '\n')
}

async function depositToPools({ ethPool, gnoPool, ethToken, gnoToken }, accounts) {
  const amount = depositAmount
  console.log(`Depositing ${amount} WETH and GNO to EthPool and GnoPoll respectively from each account`)

  // console.log((await ethToken.balanceOf(accounts[0])).toString())
  // console.log((await ethToken.allowance(accounts[0], ethPool.address)).toString())
  // console.log(toWei(amount))
  // await printPoolState(ethPool)
  // console.log((await gnoToken.balanceOf(accounts[0])).toString())
  // console.log((await gnoToken.allowance(accounts[0], gnoPool.address)).toString())
  // await printPoolState(gnoPool)
  // console.log(toWei(amount))
  // await gnoPool.deposit(toWei(amount), { from: accounts[0] })

  // console.log('DEPOSITED')

  await Promise.all(accounts.map(acc => Promise.all([
    ethPool.deposit(toWei(amount), { from: acc }),
    gnoPool.deposit(toWei(amount), { from: acc }),
  ])))
  console.log('Deposit complete')
}

async function participateInAuction({ dx, ethPool, ethToken, gnoToken, coordinator }) {
  const auctionIndex = await dx.getAuctionIndex.call(ethToken.address, gnoToken.address)
  console.log(`Participating in WETH-GNO-${auctionIndex} auction`)
  
  await printPoolState(ethPool)

  const canParticipate = await coordinator.canParticipate.call()
  console.log('canParticipate: ', canParticipate)

  if (canParticipate) {
    await coordinator.participateInAuction()
    console.log(`Now Paritcipating in WETH-GNO-${auctionIndex} auction`)
  } else console.log('Can\t participate at this time')
}

async function fillAndClearAuctions({ dx, ethPool, gnoPool, ethToken, gnoToken }, percentOfPreviousPrice, buyer) {
  const auctionIndex = await dx.getAuctionIndex(ethToken.address, gnoToken.address)
  console.log(`Filling and clearing WETH-GNO-${auctionIndex} auction`)

  await printPoolState(ethPool)

  await printAuctionPrice(dx, ethToken, gnoToken)

  // Fund auctions (in case pool doesn't have enough funds)
  await dx.postSellOrder(ethToken.address, gnoToken.address, auctionIndex, toWei(1))
  await dx.postSellOrder(gnoToken.address, ethToken.address, auctionIndex, toWei(1))
  await printAuctionPrice(dx, ethToken, gnoToken)

  await waitUntilPriceIsXPercentOfPreviousPrice(dx, ethToken, gnoToken, +percentOfPreviousPrice)
  console.log(`At ${percentOfPreviousPrice * 100} % of previous price`)
  // make sure we buy it all and then claim our funds
  await printAuctionPrice(dx, ethToken, gnoToken)

  await dx.postBuyOrder(ethToken.address, gnoToken.address, auctionIndex, toWei(10000))
  console.log('BOUGHT 1')
  await printAuctionPrice(dx, ethToken, gnoToken)
  await dx.postBuyOrder(gnoToken.address, ethToken.address, auctionIndex, toWei(10000))
  console.log('BOUGHT 2')
  await printAuctionPrice(dx, ethToken, gnoToken)
  await dx.claimBuyerFunds(ethToken.address, gnoToken.address, buyer, auctionIndex)
  console.log('CLAIMED 1')
  
  await printAuctionPrice(dx, ethToken, gnoToken)
  await dx.claimBuyerFunds(gnoToken.address, ethToken.address, buyer, auctionIndex)
  console.log('CLAIMED 2')
  
  await printAuctionPrice(dx, ethToken, gnoToken)
  await dx.claimSellerFunds(gnoToken.address, ethToken.address, buyer, auctionIndex)
  console.log('CLAIMED 3')
  
  await printAuctionPrice(dx, ethToken, gnoToken)
  await dx.claimSellerFunds(ethToken.address, gnoToken.address, buyer, auctionIndex)
  console.log('CLAIMED 4')
  

  const newAuctionIndex = await dx.getAuctionIndex(ethToken.address, gnoToken.address)
  assert.equal(newAuctionIndex, auctionIndex.toNumber() + 1)

  const ethPoolEthBalance = await dx.sellerBalances(ethToken.address, gnoToken.address, auctionIndex, ethPool.address)
  const ethPoolGnoBalance = await dx.sellerBalances(gnoToken.address, ethToken.address, auctionIndex, ethPool.address)
  const gnoPoolEthBalance = await dx.sellerBalances(ethToken.address, gnoToken.address, auctionIndex, gnoPool.address)
  const gnoPoolGnoBalance = await dx.sellerBalances(gnoToken.address, ethToken.address, auctionIndex, gnoPool.address)
  console.log(`  - Cleared!`)
  console.log(`    ethPoolBalance: ${fromWei(ethPoolEthBalance)}ETH ${fromWei(ethPoolGnoBalance)}GNO`)
  console.log(`    gnoPoolBalance: ${fromWei(gnoPoolEthBalance)}ETH ${fromWei(gnoPoolGnoBalance)}GNO`)
}

async function printMGNAccumulated({ ethPool, gnoPool, mgnToken }, accounts) {
  const MgnInEthPool = await mgnToken.lockedTokenBalances(ethPool.address)
  console.log('Locked MGN in EthPool: ', fromWei(MgnInEthPool).toString())
  const MgnInGnoPool = await mgnToken.lockedTokenBalances(gnoPool.address)
  console.log('Locked MGN in GnoPool: ', fromWei(MgnInGnoPool).toString())

  const ethPoolTotalShares = await ethPool.totalPoolShares()
  const gnoPoolTotalShares = await gnoPool.totalPoolShares()

  const shares = await Promise.all(accounts.map(acc => Promise.all([
    ethPool.poolSharesByAddress(acc),
    gnoPool.poolSharesByAddress(acc),
  ])))

  accounts.forEach((acc, i) => {
    const [sharesInEthPool, sharesInGnoPool] = shares[i]
    const sumSharesInEthPool = sumBnArray(sharesInEthPool)
    const sumSharesInGnoPool = sumBnArray(sharesInGnoPool)

    const mgnFromEthPool = sumSharesInEthPool.mul(MgnInEthPool).div(ethPoolTotalShares)
    const mgnFromGnoPool = sumSharesInGnoPool.mul(MgnInGnoPool).div(gnoPoolTotalShares)
    const totalMgn = mgnFromEthPool.add(mgnFromGnoPool)

    console.log(`Account ${acc} has claim to ${fromWei(totalMgn)} MGN, ${fromWei(mgnFromEthPool)} from EthPool, ${fromWei(mgnFromGnoPool)} from GnoPool`)
  })
}

function sumBnArray(bns) {
  return bns.reduce((accum, bn) => accum.add(bn), web3.utils.toBN('0'))
}

async function waitTillPoolingEnded({ ethPool }) {
  console.log('Waiting until Pooling state ends')

  await printPoolState(ethPool)

  const poolingPeriodEndTime = await ethPool.poolingPeriodEndTime.call()
  const poolingTimeLeft = poolingPeriodEndTime.toNumber() - await getTime()
  console.log('Skipping till poolingPeriodEndTime')

  // claim and withdrawMGN after pool trading has ended
  await increaseTimeBy(poolingTimeLeft)
  await checkPoolingEnded(ethPool)
}


async function triggerMGNunlockAndClaimTokens({ ethPool, gnoPool }) {
  console.log('Triggering MGN unlock and claiming tokens')

  await printPoolState(ethPool)

  // claim and withdrawMGN after pool trading has ended

  await checkPoolingEnded(ethPool)
  
  await ethPool.triggerMGNunlockAndClaimTokens()
  await gnoPool.triggerMGNunlockAndClaimTokens()
}

async function checkPoolingEnded(pool) {
  const poolState = await printPoolState(pool)
  if (poolState === States.Pooling) {
    console.log('States is still Pooling')
    const auctionCount = await pool.auctionCount.call()
    console.log('auctionCount: ', auctionCount.toNumber())

    if (auctionCount.toNumber() % 2 !== 0) {
      console.log('It\'s not deposit token\'s turn. Paritcipate in one more auction')
    }
    console.log('Further steps will trhow errors')
  }
}

async function printPoolBalances({ ethToken, gnoToken, mgnToken, ethPool, gnoPool }) {
  const printBalances = async (pool) => {
    const ethBalance = await ethToken.balanceOf(pool.address)
    console.log('ETH: ', fromWei(ethBalance).toString())
    const gnoBalance = await gnoToken.balanceOf(pool.address)
    console.log('GNO: ', fromWei(gnoBalance).toString())
    const mgnBalance = await mgnToken.balanceOf(pool.address)
    console.log('MGN: ', fromWei(mgnBalance).toString())
    const mgnLockedBalance = await mgnToken.lockedTokenBalances(pool.address)
    console.log('Locked MGN: ', fromWei(mgnLockedBalance).toString())
    const mgnUnlockedBalance = await mgnToken.unlockedTokens(pool.address)
    console.log('Will be unlocked MGN: ', fromWei(mgnUnlockedBalance.amountUnlocked).toString())
  }

  console.group('EthPool:')
  await printBalances(ethPool)
  console.groupEnd()

  console.group('GnoPool:')
  await printBalances(gnoPool)
  console.groupEnd()
}

async function printAccountBalances({ ethToken, gnoToken, mgnToken }, accounts) {
  const balances = await Promise.all(accounts.map(acc => Promise.all([
      ethToken.balanceOf(acc),
      gnoToken.balanceOf(acc),
      mgnToken.balanceOf(acc),
      mgnToken.lockedTokenBalances(acc),
      mgnToken.unlockedTokens(acc),
      ])))

  accounts.forEach((acc, i) => {
    console.group('Account', acc)
    const [ETH, GNO, MGN, lMGN, uMGN] = balances[i]
    console.log('ETH: ', fromWei(ETH).toString())
    console.log('GNO: ', fromWei(GNO).toString())
    console.log('MGN: ', fromWei(MGN).toString())
    console.log('Locked MGN: ', fromWei(lMGN).toString())
    console.log('Will be unlocked MGN: ', fromWei(uMGN.amountUnlocked).toString())
    console.groupEnd()
  })
}

async function waitTillwithdrawMGN({ ethPool }) {
  console.log('Skipping 24h of lock period')
  await increaseTimeBy(60 * 60 * 25)

  await printPoolState(ethPool)
}

async function withdrawUnlockedMagnolia({ ethPool, gnoPool }) {
  console.log('Widthrawing Unlocked MGN')

  await printPoolState(ethPool)
  
  console.log('Withdrawing MGN')
  await ethPool.withdrawUnlockedMagnoliaFromDx()
  await gnoPool.withdrawUnlockedMagnoliaFromDx()

  console.log('MGN withdrawn')

  await printPoolState(ethPool)
}

async function withdrawFunds({ ethPool, gnoPool }, accounts) {
  console.log('Withrawing ETH, GNO and MGN from the pools')

  await Promise.all(accounts.map(acc => Promise.all([
      ethPool.withdrawDeposit({ from: acc }),
      gnoPool.withdrawDeposit({ from: acc }),
      ethPool.withdrawMagnolia({ from: acc }),
      gnoPool.withdrawMagnolia({ from: acc }),
    ])))
}

// const address2symbol = {}
// async function getTokenSymbol(address) {
//   address = address.toLowerCase()
//   if (address2symbol[address]) return address2symbol[address]

//   const request = {
//     data: "0x95d89b41",
//     to: address,
//   }

//   const symbolHex = await web3.eth.call(request)
//   return (address2symbol[address] = web3.eth.abi.decodeParameter(
//     "string",
//     symbolHex,
//   ))
// }

// const address2decimals = {}
// async function getTokenDecimals(address) {
//   address = address.toLowerCase()
//   if (address2decimals[address]) return address2decimals[address]

//   const request = {
//     data: "0x313ce567",
//     to: address,
//   }

//   const decimalsHex = await web3.eth.call(request)
//   return (address2decimals[address] = new BN(decimalsHex))
// }

async function getContracts() {
  const dxProxy = await DXProxy.deployed()
  const dx = await DX.at(dxProxy.address)

  const mgnToken = await TokenFRT.at(await dx.frtToken.call())
  
  const coordinator = await Coordinator.deployed()
  const ethPool = await DxMgnPool.at(await coordinator.dxMgnPool1.call())
  const gnoPool = await DxMgnPool.at(await coordinator.dxMgnPool2.call())
  
  const ethToken = await EtherToken.at(await ethPool.depositToken.call())
  const gnoToken = await MintableERC20.at(await gnoPool.depositToken.call())

  return {
    dx,
    mgnToken,
    ethToken,
    gnoToken,
    coordinator,
    ethPool,
    gnoPool,
  }
}


async function printPoolState(pool) {
  const poolStateN = await pool.updateAndGetCurrentState.call()
  const poolState = States[poolStateN.toNumber()]
  console.log('Pool State: ', poolState)
  return poolState
}

async function printAuctionPrice(dx, ST, BT) {
  const ind = await dx.getAuctionIndex(ST.address, BT.address)
  const { num, den } = await dx.getCurrentAuctionPrice(ST.address, BT.address, ind)
  const sellVol = await dx.sellVolumesCurrent(ST.address, BT.address)
  const buyVol = await dx.buyVolumes(ST.address, BT.address)
  
  console.log('Auction index', ind.toNumber(), 'price:', [num, den].map(n => n.toString()))
  console.log('sellVol: ', sellVol.toString())
  console.log('buyVol: ', buyVol.toString())
}

async function waitUntilPriceIsXPercentOfPreviousPrice(dx, ST, BT, p) {
  const getAuctionStart = await dx.getAuctionStart.call(ST.address, BT.address)
  const startingTimeOfAuction = getAuctionStart.toNumber()
  console.log('startingTimeOfAuction: ', startingTimeOfAuction)
  const timeToWaitFor = Math.ceil((86400 - p * 43200) / (1 + p)) + startingTimeOfAuction
  // wait until the price is good
  const incBy = timeToWaitFor - await getTime()
  console.log('await getTime(): ', await getTime())
  console.log('incBy: ', incBy)
  if (incBy < 0) {
    return
  }
  await increaseTimeBy(incBy)
}

module.exports = cb => main().then(() => cb(), cb)
