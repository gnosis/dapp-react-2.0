/* eslint-disable eqeqeq */
// API
import { getTokensAPI } from './Tokens'
import { getWeb3API } from './ProviderWeb3'
import { getAppContracts } from './Contracts'
import { fromWei, toBN } from 'utils'

import { Account, Web3AppAPI, Balance, TokensInterface, BigNumber } from 'types'

interface AppAPI {
  Web3: Web3AppAPI,
  Tokens: TokensInterface,
}

// API singleton
let appAPI: AppAPI

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

export const fillDefaultAccount = (account: Account) => (!account ? getCurrentAccount() : account)

export const fillNetworkId = (netId: string | number) => (!netId ? getCurrentNetworkId() : netId)

// ============
// MISC
// ============

/**
 * checkIfAccount
 * @param [string} account
 * @returns {string} accountAddress as string
 */
export const checkIfAccount = (account: Account) => account || getCurrentAccount()


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
export const checkIfFalseAllowance = async (amount: BigNumber, account: Account, address: Account) => {
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
      const toApprove = (toBN(2).pow(toBN(255))).sub(toBN(amountApprovedRemaining.toString()))

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

export async function allowance(tokenAddress: Account, account: Account, spender: Account) {
  const { Tokens } = await getAPI()
  account = await checkIfAccount(account)

  return Tokens.allowance(tokenAddress, account, spender)
}

export async function approve(tokenAddress: Account, spender: Account, amount: Balance, account: Account) {
  const { Tokens } = await getAPI()
  account = await checkIfAccount(account)

  return Tokens.approve(tokenAddress, spender, amount, { from: account })
}

export async function getTokenBalance(tokenAddress: Account, formatFromWei: boolean, account: Account) {
  const { Tokens } = await getAPI()
  account = await checkIfAccount(account)

  const bal = await Tokens.getTokenBalance(tokenAddress, account)

  return formatFromWei ? fromWei(bal) : bal
}

export const transfer = async (tokenAddress: Account, amount: Account, to: Account, account: Account) => {
  const { Tokens } = await getAPI()
  account = await checkIfAccount(account)

  return Tokens.transfer(tokenAddress, to, amount, { from: account })
}

export async function depositETH(tokenAddress: Account, depositAmount: Balance, userAccount: Account) {
  const { Tokens } = await getAPI()
  userAccount = await checkIfAccount(userAccount)

  return Tokens.depositETH(tokenAddress, { from: userAccount, value: depositAmount })
}

export const getState = async ({ account, timestamp: time }: { account?: Account, timestamp?: string } = {}) => {
  const statePromises = Promise.all<string | Promise<number>, Promise<"Mainnet" | "Morden" | "Ropsten" | "Rinkeby" | "Kovan" | "No network detected" | "Local Network">>([
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
/* async function checkEthTokenBalance(
  tokenAddress: Account,
  weiAmount: string | number | any,
  account: Account,
) {
  // explicit conversion - TODO: fix this brekaing in prod builds
  weiAmount = toBN(weiAmount)
  // BYPASS[return false] => if token is not ETHER
  const ethAddress = await isETH(tokenAddress)

  if (!ethAddress) return false

  const wrappedETH = await getTokenBalance(ethAddress, false, account)
  // BYPASS[return false] => if wrapped Eth is enough
  // wrappedETH must be GREATER THAN OR EQUAL to WEI_AMOUNT * 1.1 (10% added for gas costs)
  if ((wrappedETH as BigNumber).gte((weiAmount.mul(BN_4_PERCENT).div(toBN(100))))) return (console.debug('Enough WETH balance, skipping deposit.'), false)

  // Else return amount needed to wrap to make tx happen
  return weiAmount.sub(wrappedETH)
} */

/**
 * isEth
 * @param {string} tokenAddress 
 * @param {string} netId 
 * @returns {boolean} - is token passed in WETH?
 */
/* async function isETH(tokenAddress: Account, netId?: string | number) {
  netId = await fillNetworkId(netId)

  let ETH_ADDRESS
  
  if (netId == 1) {
    // Mainnet
    const { MAINNET_WETH } = require('../globals')
    ETH_ADDRESS = MAINNET_WETH
  } else {
    // Rinkeby
    const { RINKEBY_WETH } = require('../globals')
    ETH_ADDRESS = RINKEBY_WETH
  }
  return tokenAddress.toUpperCase() === ETH_ADDRESS.toUpperCase() ? ETH_ADDRESS : false
} */

/* async function depositIfETH(tokenAddress: Account, weiAmount: Balance, userAccount: Account) {
  const wethBalance = await checkEthTokenBalance(tokenAddress, weiAmount, userAccount)

  // WETH
  if (wethBalance) return depositETH(tokenAddress, wethBalance, userAccount)

  return false
} */

async function init() {
  const [Web3, Tokens] = await Promise.all([
    getWeb3API(),
    getTokensAPI(),
  ])

  const Contracts = await getAppContracts()

  console.debug('​API init -> ', { Web3, Tokens, Contracts })
  return { Web3, Tokens, Contracts }
}
