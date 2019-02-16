// API
import { getTokensAPI } from './Tokens'
import { getWeb3API } from './ProviderWeb3'
import { getDxPoolAPI } from './DxPool'
import { getAppContracts } from './Contracts'
import { fromWei, toBN } from '../api/utils'

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

// ============
// DX MGN POOL
// ============

export const getPoolContracts = async () => {
  const { getDxPool, getPoolAddresses } = await getDxPoolAPI()
  
  const [pool1Address, pool2Address] = await getPoolAddresses()
  
  return Promise.all([getDxPool(pool1Address), getDxPool(pool2Address)])
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
  const { getMGNAddress, getPoolAddresses } = await getDxPoolAPI()
  const [pool1Address] = await getPoolAddresses()

  return getMGNAddress(pool1Address)
}

export const getMGNTokenBalance = async (userAddress) => {
  userAddress = await fillDefaultAccount(userAddress)
  
  const { getMGNAddress, getMGNBalance, getPoolAddresses } = await getDxPoolAPI()
  const [pool1Address] = await getPoolAddresses()
  const mgnAddress = await getMGNAddress(pool1Address)

  return getMGNBalance(mgnAddress, userAddress)
}

export const getPoolTokensInfo = async () => {
  const [{ hft }, [dxPool1]] = await Promise.all([
    getAppContracts(),
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
    },
    {
      title: 'Secondary Token',
      name: await secondaryToken.name.call() || 'Unknown token name',
      symbol: await secondaryToken.symbol.call() || 'Unknown token symbol',
      decimals: (await secondaryToken.decimals.call()).toNumber() || 18,
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
  const [totalUserParticipation1] = participationsByAddress1.reduce((accum, item) => accum.add(item), [toBN(0)])
  const [totalUserParticipation2] = participationsByAddress2.reduce((accum, item) => accum.add(item), [toBN(0)])

  return [totalUserParticipation1, totalUserParticipation2]
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
    mgnBalance, 
    [totalShare1, totalShare2], 
    [totalContribution1, totalContribution2],
    [depositTokenObj, secondaryTokenObj],
  ] = await Promise.all([
    getMGNTokenAddress(),
    getMGNTokenBalance(userAccount),
    getTotalPoolShares(),
    calculateUserParticipation(userAccount),
    getPoolTokensInfo(),
  ])

  return [
    mgnAddress,
    mgnBalance,
    totalShare1,
    totalShare2,
    totalContribution1,
    totalContribution2,
    depositTokenObj,
    secondaryTokenObj,
  ]
}

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
 * checkIf]alseAllowance
 * @param {BigNumber} amount
 * @param {*} account
 * @param {*} address
 * @type {BigNumber | boolean}
 * @returns {BigNumber | boolean}
 */
// eslint-disable-next-line
export const checkIfFalseAllowance = async (amount, account, address) => {
  const { Tokens, Web3: { toBN: BN } } = await getAPI()
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
      const toApprove = (BN(2).pow(BN(255))).sub(BN(amountApprovedRemaining))

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

export const allowance = async (tokenName, account, spender) => {
  const { Tokens } = await getAPI()
  account = await checkIfAccount(account)

  return Tokens.allowance(tokenName, account, spender)
}

export const approve = async (tokenName, spender, amount, account) => {
  const { Tokens } = await getAPI()
  account = await checkIfAccount(account)

  return Tokens.approve(tokenName, spender, amount, { from: account })
}

export const getTokenBalance = async (tokenName, formatFromWei, account) => {
  const { Tokens } = await getAPI()
  account = await checkIfAccount(account)

  const bal = await Tokens.getTokenBalance(tokenName, account)

  return formatFromWei ? fromWei(bal) : bal
}

export const transfer = async (tokenName, amount, to, account) => {
  const { Tokens } = await getAPI()
  account = await checkIfAccount(account)

  return Tokens.transfer(tokenName, to, amount, { from: account })
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

async function init() {
  const [Web3, Tokens, DxPool] = await Promise.all([
    getWeb3API(),
    getTokensAPI(),
    getDxPoolAPI(),
  ])

  console.log('​API init -> ', { Web3, Tokens, DxPool })
  return { Web3, Tokens, DxPool }
}
