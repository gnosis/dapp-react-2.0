// API
import { getTokensAPI } from './Tokens'
import { getWeb3API } from './ProviderWeb3'
import { getDxPoolAPI } from './DxPool'
import { getAppContracts } from './Contracts'
import { fromWei, toBN } from '../api/utils'

import { BN_4_PERCENT } from '../globals'

// API singleton
let appAPI

// API initialiser
export const getAPI = async () => {
  if (appAPI) return appAPI

  appAPI = await init()
  return appAPI
}

// ============
// WEB3
// ============

export const getCurrentAccount = async () => {
  const { Web3 } = await getAPI()

  return Web3.getCurrentAccount()
}

export const getCurrentNetwork = async () => {
  const { Web3 } = await getAPI()

  return Web3.getNetwork()
}

export const getCurrentNetworkId = async () => {
  const { Web3 } = await getAPI()

  return Web3.getNetworkId()
}

// TODO: possibly remove - testing only
export const getBlockTime = async (blockNumber = 'latest') => {
  const { Web3 } = await getAPI()

  const blockInfo = await Web3.getBlockInfo(blockNumber)
  return blockInfo.timestamp
}

export const getAccountAndTimestamp = async () => {
  const [account, timestamp] = await Promise.all([
    getCurrentAccount(),
    getBlockTime(),
  ])

  return {
    account,
    timestamp,
  }
}

export const fillDefaultAccount = account => (!account ? getCurrentAccount() : account)

export const fillNetworkId = netId => (!netId ? getCurrentNetworkId() : netId)

// ============
// DX MGN POOL
// ============

export const getPoolContracts = async () => {
  const { DxPool: { getDxPool, getPoolAddresses } } = await getAPI()
  
  const [pool1Address, pool2Address] = await getPoolAddresses()
  
  return Promise.all([getDxPool(pool1Address), getDxPool(pool2Address)])
}

/**
 * getPoolInternalState
 * @returns { BN[] } - BN value of current state: [0 == Pooling // 1 == PoolingEnded // 2 == DepositWithdrawnFromDx // 3 == MgnUnlocked]
 */
export const getPoolInternalState = async () => {
  const [dxMP1, dxMP2] = await getPoolContracts()

  return Promise.all([
    dxMP1.updateAndGetCurrentState.call(),
    dxMP2.updateAndGetCurrentState.call(),
  ])
}

/**
 * getTotalPoolShares
 * @returns { BN[] } - [<totalPoolShare1>, <totalPoolShare2>]
 */
export const getTotalPoolShares = async () => {
  const [dxPool1, dxPool2] = await getPoolContracts()

  const [totalPoolShare1, totalPoolShare2] = await Promise.all([
    dxPool1.totalPoolShares.call(),
    dxPool2.totalPoolShares.call(),
  ])

  return [totalPoolShare1, totalPoolShare2]
}

export const getMGNTokenAddress = async () => {
  const { DxPool: { getMGNAddress, getPoolAddresses } } = await getAPI()
  const [pool1Address] = await getPoolAddresses()

  return getMGNAddress(pool1Address)
}

export const getMGNTokenLockedBalance = async (userAddress) => {
  userAddress = await fillDefaultAccount(userAddress)
  
  const { DxPool: { getMGNAddress, getMGNLockedBalance, getPoolAddresses } } = await getAPI()
  const [pool1Address] = await getPoolAddresses()
  const mgnAddress = await getMGNAddress(pool1Address)

  return getMGNLockedBalance(mgnAddress, userAddress)
}

/**
 * getAllMGNTokenBalances
 * @param { string } userAddress 
 * @returns { BN[] } - Array of BN values
 */
export const getAllMGNTokenBalances = async (userAddress) => {
  userAddress = await fillDefaultAccount(userAddress)
  
  const { DxPool: { getMGNAddress, getMGNLockedBalance, getMGNUnlockedBalance, getMGNBalance, getPoolAddresses } } = await getAPI()
  const [pool1Address] = await getPoolAddresses()
  const mgnAddress = await getMGNAddress(pool1Address)

  return Promise.all([
    getMGNLockedBalance(mgnAddress, userAddress),
    getMGNUnlockedBalance(mgnAddress, userAddress),
    getMGNBalance(mgnAddress, userAddress),
  ])
}

export const getPoolTokensInfo = async (userAccount) => {
  userAccount = await fillDefaultAccount(userAccount)
  const [{ Contracts: { hft } }, [dxPool1]] = await Promise.all([
    getAPI(),
    getPoolContracts(),
  ])

  const [dtAddress, stAddress] = await Promise.all([
    dxPool1.depositToken.call(),
    dxPool1.secondaryToken.call(),
  ])

  const [depositToken, secondaryToken] = await Promise.all([
    hft.at(dtAddress),
    hft.at(stAddress),
  ])

  return [
    {
      title: 'Deposit Token',
      name: await depositToken.name.call() || 'Unknown token name',
      symbol: await depositToken.symbol.call() || 'Unknown token symbol',
      decimals: (await depositToken.decimals.call()).toNumber() || 18,
      balance: await depositToken.balanceOf.call(userAccount),
    },
    {
      title: 'Secondary Token',
      name: await secondaryToken.name.call() || 'Unknown token name',
      symbol: await secondaryToken.symbol.call() || 'Unknown token symbol',
      decimals: (await secondaryToken.decimals.call()).toNumber() || 18,
      balance: await secondaryToken.balanceOf.call(userAccount),
    },
  ]
}

export const calculateUserParticipation = async (address) => {
  address = await fillDefaultAccount(address)
  const [dxPool1, dxPool2] = await getPoolContracts()

  const [participationsByAddress1, participationsByAddress2] = await Promise.all([
    dxPool1.poolSharesByAddress.call(address),
    dxPool2.poolSharesByAddress.call(address),
  ])
  
  // Accum all indices
  const totalUserParticipation1 = participationsByAddress1.reduce((accum, item) => accum.add(item), toBN(0))
  const totalUserParticipation2 = participationsByAddress2.reduce((accum, item) => accum.add(item), toBN(0))
  
  return [totalUserParticipation1, totalUserParticipation2]
}

export const approveAndDepositIntoDxMgnPool = async (pool, depositAmount, userAccount) => {
  userAccount = await fillDefaultAccount(userAccount)
  const {
    DxPool: {
      dxMP1Address,
      dxMP2Address,
      dxMP1DepositTokenAddress, 
      dxMP1SecondaryTokenAddress, 
      depositIntoPool1, 
      depositIntoPool2, 
    },
  } = await getAPI()

  const tokenAddress = (pool === 1 ? dxMP1DepositTokenAddress : dxMP1SecondaryTokenAddress)
  const poolAddress = (pool === 1 ? dxMP1Address : dxMP2Address)
  
  // Check token allowance - do we need to approve?
  const tokenAllowance = await allowance(tokenAddress, userAccount, poolAddress)
  // Approve deposit amount if necessary
  if (tokenAllowance.lt(toBN(depositAmount))) await approve(tokenAddress, poolAddress, depositAmount, userAccount)

  // Check if token = WETH and make deposits if necessary
  await depositIfETH(tokenAddress, depositAmount, userAccount)

  return pool === 1 ? depositIntoPool1(depositAmount, userAccount) : depositIntoPool2(depositAmount, userAccount)
}

export const lockAllMgn = async (userAccount) => {
  const { DxPool: { dxMP1Address, lockMGN, getMGNAddress } } = await getAPI()
  userAccount = await fillDefaultAccount(userAccount)
  
  const mgnAddress = await getMGNAddress(dxMP1Address)
  const mgnBalance = await getTokenBalance(mgnAddress, undefined, userAccount)
  
  if (mgnBalance.lte(toBN(0))) throw new Error('You have zero lockable MGN Balance')

  return lockMGN(mgnBalance.add(toBN(1)), mgnAddress, userAccount)
}

/**
 * calculateClaimableMgnAndDeposits
 * @description Returns BN numbers in object format
 * @param {string} userAccount 
 * @returns {{ totalClaimableMgn: "BN{}", totalClaimableMgn2: "BN{}", totalClaimableDeposit: "BN{}", totalClaimableDeposit2: "BN{}" }}
 */
export const calculateClaimableMgnAndDeposits = async (userAccount) => {
  userAccount = await fillDefaultAccount(userAccount)
  const { DxPool: { calculateClaimableMgnAndDeposits1, calculateClaimableMgnAndDeposits2 } } = await getAPI()

  const [{ 0: claimableMgn, 1: claimableDeposits }, { 0: claimableMgn2, 1: claimableDeposits2 }] = await Promise.all([
    calculateClaimableMgnAndDeposits1(userAccount),
    calculateClaimableMgnAndDeposits2(userAccount),
  ])
  
  // Accum all indices
  const totalClaimableMgn       = claimableMgn.reduce((accum, item) => accum.add(item), toBN(0))
  const totalClaimableMgn2      = claimableMgn2.reduce((accum, item) => accum.add(item), toBN(0))
  const totalClaimableDeposit  = claimableDeposits.reduce((accum, item) => accum.add(item), toBN(0))
  const totalClaimableDeposit2 = claimableDeposits2.reduce((accum, item) => accum.add(item), toBN(0))

  return {
    totalClaimableMgn,
    totalClaimableMgn2,
    totalClaimableDeposit,
    totalClaimableDeposit2,
  }
}

/**
 * getCurrentPoolingEndTimes
 * @returns { Promise<"BN"[]> } - Promise<BN[]>
 */
export const getCurrentPoolingEndTimes = async () => {
  const { DxPool: { getCurrentPoolingEndTime1, getCurrentPoolingEndTime2 } } = await getAPI()

  const [currentPoolingEndTime1, currentPoolingEndTime2] = await Promise.all([
    getCurrentPoolingEndTime1(),
    getCurrentPoolingEndTime2(),
  ])

  return [currentPoolingEndTime1, currentPoolingEndTime2]
}

/**
 * calculateDxMgnPoolState
 * @description Grabs all relevant DxMgnPool state as a batch
 * @param { string } userAccount - Address
 */
export const calculateDxMgnPoolState = async (userAccount) => {
  userAccount = await fillDefaultAccount(userAccount)

  const [
    mgnAddress, 
    [mgnLockedBalance, mgnUnlockedBalance, mgnBalance], 
    [totalShare1, totalShare2], 
    [totalContribution1, totalContribution2],
    [depositTokenObj, secondaryTokenObj],
    [pool1State, pool2State],
    [currentPoolingEndTime1, currentPoolingEndTime2],
  ] = await Promise.all([
    getMGNTokenAddress(),
    getAllMGNTokenBalances(userAccount),
    getTotalPoolShares(),
    calculateUserParticipation(userAccount),
    getPoolTokensInfo(),
    getPoolInternalState(),
    getCurrentPoolingEndTimes(),
  ])

  return {
    mgnAddress,
    mgnLockedBalance,
    mgnUnlockedBalance, 
    mgnBalance,
    totalShare1,
    totalShare2,
    totalContribution1,
    totalContribution2,
    depositTokenObj,
    secondaryTokenObj,
    pool1State, 
    pool2State,
    currentPoolingEndTime1,
    currentPoolingEndTime2,
  }
}

/**
 * withdrawMGNandDepositsFromAllPools
 */
export const withdrawMGNandDepositsFromAllPools = async (userAccount) => {
  userAccount = await fillDefaultAccount(userAccount)
  const { DxPool } = await getAPI()

  return DxPool.withdrawMGNandDepositsFromPools(userAccount)
}

/**
 * withdrawMGNandDepositsFromSinglePool
 * @param { string } userAccount 
 * @param { 'POOL1' | 'POOL2' } pool 
 */
export const withdrawMGNandDepositsFromSinglePool = async (userAccount, pool) => {
  if (!pool) throw new Error('No pool specified!')
  userAccount = await fillDefaultAccount(userAccount)
  
  const { DxPool: { withdrawDepositPool1, withdrawDepositPool2, withdrawMagnoliaPool1, withdrawMagnoliaPool2 } } = await getAPI()

  if (pool === 'POOL1') {
    const withdrawDep1Rec = await withdrawDepositPool1.call(userAccount) && await withdrawDepositPool1(userAccount)
		console.debug('TCL: withdrawMGNandDepositsFromSinglePool -> withdrawDepositPool1', withdrawDep1Rec)
    const withdrawMgn1Rec = await withdrawMagnoliaPool1.call(userAccount) && await withdrawMagnoliaPool1(userAccount)
		console.debug('TCL: withdrawMGNandDepositsFromSinglePool -> withdrawDepositPool1', withdrawMgn1Rec)
  } else {
    const withdrawDep2Rec = await withdrawDepositPool2.call(userAccount) && await withdrawDepositPool2(userAccount)
    console.debug('TCL: withdrawMGNandDepositsFromSinglePool -> withdrawMagnoliaPool2', withdrawDep2Rec)
    const withdrawMgn2Rec = await withdrawMagnoliaPool2.call(userAccount) && await withdrawMagnoliaPool2(userAccount)
		console.debug('TCL: withdrawMGNandDepositsFromSinglePool -> withdrawMagnoliaPool2', withdrawMgn2Rec)
  }
}

/**
 * withdrawMGNandDepositsFromAllPoolsManually
 * @description Calls individual withdrawMagnolia & Deposit as opposed to using delegate call (which is broken)
 * @param { string } userAccount
 */
// export const withdrawMGNandDepositsFromAllPoolsManually = async (userAccount, pool) => {
//   userAccount = await fillDefaultAccount(userAccount)
//   const { 
//     DxPool: { 
//       getParticipationStatus1, getParticipationStatus2,
//       withdrawDepositPool1, withdrawDepositPool2, 
//       withdrawMagnoliaPool1, withdrawMagnoliaPool2,
//     }, 
//   } = await getAPI()

//   const [hasParticipated1, hasParticipated2] = await Promise.all([getParticipationStatus1(userAccount), getParticipationStatus2(userAccount)])
// 	console.debug('TCL: withdrawMGNandDepositsFromAllPoolsManually -> hasParticipated1, hasParticipated2', hasParticipated1, hasParticipated2)

//   let pool1Receipt, pool2Receipt

//   // check Pool 1 status and run actions
//   // must NOT have participated yet AND have claimable Deposit
//   if (!hasParticipated1) {
//     pool1Receipt = await Promise.all([
//       withdrawDepositPool1(userAccount),
//       withdrawMagnoliaPool1(userAccount),
//     ])
//   }
//   // check Pool 2 status and run actions
//   if (!hasParticipated2) {
//     pool2Receipt = await Promise.all([
//       withdrawDepositPool2(userAccount),
//       withdrawMagnoliaPool2(userAccount),
//     ])
//   }

//   return [pool1Receipt, pool2Receipt]
// }

// ============
// MISC
// ============

/**
 * checkIfAccount
 * @param [string} account
 * @returns {string} accountAddress as string
 */
export const checkIfAccount = account => account || getCurrentAccount()


/**
 * checkIfFalseAllowance
 * WARNING - APPROVES MAX AMOUNT
 * @param {BigNumber} amount
 * @param {*} account
 * @param {*} address
 * @type {BigNumber | boolean}
 * @returns {BigNumber | boolean}
 */
// eslint-disable-next-line
export const checkIfFalseAllowance = async (amount, account, address) => {
  const { Tokens } = await getAPI()
  try {
    /**
     * Checklist
        * 1. check Allowance in Token
        * 2a. Allowance > amount
            * return false
        * 2b. Allowance < amount
            * amtLeft = amount - Allowance
            * const amtToApprove = (2 ** 255) -  amtLeft
            * return amtToApprove
     */

    const amountApprovedRemaining = await Tokens.allowance('gno', account, address)

    console.info('Amount Approved Remaining = ', amountApprovedRemaining)

    // IF there is NOT ENOUGH Allowance, RETURN amount needed to Approve
    if (amountApprovedRemaining.lt(amount)) {
      // BigNumber convert here
      // toApprove = (2^255) - amountAlreadyAllowed
      const toApprove = (toBN(2).pow(toBN(255))).sub(toBN(amountApprovedRemaining))

      console.info('Approved amount = ', toApprove)

      return toApprove
    }
    return false
  } catch (e) {
    console.error(e)
  }
}

// ================
// ERC20 TOKENS
// ================

export async function allowance(tokenAddress, account, spender) {
  const { Tokens } = await getAPI()
  account = await checkIfAccount(account)

  return Tokens.allowance(tokenAddress, account, spender)
}

export async function approve(tokenAddress, spender, amount, account) {
  const { Tokens } = await getAPI()
  account = await checkIfAccount(account)

  return Tokens.approve(tokenAddress, spender, amount, { from: account })
}

export async function getTokenBalance(tokenAddress, formatFromWei, account) {
  const { Tokens } = await getAPI()
  account = await checkIfAccount(account)

  const bal = await Tokens.getTokenBalance(tokenAddress, account)

  return formatFromWei ? fromWei(bal) : bal
}

export const transfer = async (tokenAddress, amount, to, account) => {
  const { Tokens } = await getAPI()
  account = await checkIfAccount(account)

  return Tokens.transfer(tokenAddress, to, amount, { from: account })
}

export async function depositETH(tokenAddress, depositAmount, userAccount) {
  const { Tokens } = await getAPI()
  userAccount = await checkIfAccount(userAccount)

  return Tokens.depositETH(tokenAddress, { from: userAccount, value: depositAmount })
}

export const getState = async ({ account, timestamp: time } = {}) => {
  const statePromises = Promise.all([
    time || getBlockTime(),
    getCurrentNetwork(),
  ])

  account = await checkIfAccount(account)

  const [timestamp, network] = await statePromises

  const refreshedState = {
    account,
    timestamp,
    network,
  }

  console.info('Refreshed STATE = ', refreshedState)

  return refreshedState
}

/* 
 * HELPERS
 */

 /**
 * checkEthTokenBalance > returns false or EtherToken Balance
 * @param token
 * @param weiAmount
 * @param account
 * @returns boolean | BigNumber <false, amt>
 */
async function checkEthTokenBalance(
  tokenAddress,
  weiAmount,
  account,
) {
  // explicit conversion - TODO: fix this brekaing in prod builds
  weiAmount = toBN(weiAmount)
  // BYPASS[return false] => if token is not ETHER
  const ethAddress = await isETH(tokenAddress)

  if (!ethAddress) return false

  const wrappedETH = await getTokenBalance(ethAddress, false, account)
  // BYPASS[return false] => if wrapped Eth is enough
  // wrappedETH must be GREATER THAN OR EQUAL to WEI_AMOUNT * 1.1 (10% added for gas costs)
  if (wrappedETH.gte((weiAmount.mul(BN_4_PERCENT).div(toBN(100))))) return (console.debug('Enough WETH balance, skipping deposit.'), false)

  // Else return amount needed to wrap to make tx happen
  return weiAmount.sub(wrappedETH)
}

/**
 * isEth
 * @param {string} tokenAddress 
 * @param {string} netId 
 * @returns {boolean} - is token passed in WETH?
 */
async function isETH(tokenAddress, netId) {
  netId = await fillNetworkId(netId)

  let ETH_ADDRESS
  
  if (netId === '1') {
    // Mainnet
    const { MAINNET_WETH } = require('../globals')
    ETH_ADDRESS = MAINNET_WETH
  } else {
    // Rinkeby
    const { RINKEBY_WETH } = require('../globals')
    ETH_ADDRESS = RINKEBY_WETH
  }
  
  return tokenAddress.toUpperCase() === ETH_ADDRESS.toUpperCase() ? ETH_ADDRESS : false
}

async function depositIfETH(tokenAddress, weiAmount, userAccount) {
  const wethBalance = await checkEthTokenBalance(tokenAddress, weiAmount, userAccount)

  // WETH
  if (wethBalance) return depositETH(tokenAddress, wethBalance, userAccount)

  return false
}

async function init() {
  const [Web3, Tokens, DxPool] = await Promise.all([
    getWeb3API(),
    getTokensAPI(),
    getDxPoolAPI(),
  ])

  const Contracts = await getAppContracts()

  console.debug('​API init -> ', { Web3, Tokens, DxPool, Contracts })
  return { Web3, Tokens, DxPool, Contracts }
}
