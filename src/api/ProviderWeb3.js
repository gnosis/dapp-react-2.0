import Web3Eth from 'web3-eth'
import Web3Utils from 'web3-utils'

import { netIdToName, netIdToWebsocket, windowLoaded } from './utils'

/**
 * Web3Eth Provider API
 * Version: 1.0.0beta.xx
 * Will NOT work with Web3Eth@0.20.xx
*/

let appWeb3

export const getWeb3API = async () => {
  if (appWeb3) return appWeb3

  appWeb3 = await init()
  return appWeb3
}

// Grabs runtime provider - for now this is runtime only.
// if you wish to pass in your own provider on API setup,
// please add a parameter + necessary checks into getProvider
// and pass provider object during API init in src/api/index.js
const getProvider = async () => {
  if (typeof window !== 'undefined' && window.web3) {
    if (window.ethereum) {
      // TODO: be careful this doesn't override window.web3 @ 0.20.x
      // with a version 1.X.xx that breaks app...
      const providerWeb3 = window.web3 = window.ethereum
      try {
          // Request account access if needed
        await providerWeb3.enable()
        return providerWeb3
      } catch (error) {
          // User denied account access...
        console.error(error)
        throw new Error(error)
      }
    }
    // Legacy dapp browsers...
    return window.web3.currentProvider
  }
  // window.web3 or window doesnt exist
  return new Web3Eth('http://localhost:8545')
}

const setupWeb3 = async () => {
  await windowLoaded

  const provider = await getProvider()
  return new Web3Eth(provider)
}

const setupWeb3Watchdog = async (web3) => {
  const netId = await web3.net.getId()
  const websocket = netIdToWebsocket(netId)

  return new Web3Eth(websocket)
}

async function init() {
  const web3 = await setupWeb3()
  const web3WS = await setupWeb3Watchdog(web3)

  /* 
   * Web3Eth API Methods
   */

  const getAccounts = () => web3.getAccounts()
  const getBalance = account => web3.getBalance(account)

  /**
   * getCurrentAccount
   * @returns {string} currentAccount in Metamask || Provider web3.accounts[0]
  */
  const getCurrentAccount = async () => {
    const [account] = await getAccounts()

    return account
  }

  /**
   * getCurrentBalance
   * @returns {string} ETH balance in GWEI
  */
  const getCurrentBalance = async () => {
    const [account] = await getAccounts()

    return getBalance(account)
  }

  const getNetwork = async () => {
    const network = await web3.net.getId()
    
    return netIdToName(network)
  }

  const getNetworkId = async () => web3.net.getId()

  const utils = Web3Utils

  /**
   * toWei // fromWei
   * @type {BigNumber}
   * @param {BigNumber} amount
   * @param {string} x = format['ether', ... ]
   * @returns {string}
   */
  const toWei = (amount, x) => utils.toWei(amount, x)
  const fromWei = (amount, x) => utils.fromWei(amount, x)
  const toBN = amount => utils.toBN(amount)

  const getBlockInfo = blockNumber => web3.getBlock(blockNumber)

  return {
    web3,
    web3WS,
    get currentProvider() {
      return web3.currentProvider
    },
    getBlockInfo,
    getCurrentAccount,
    getCurrentBalance,
    getNetwork,
    getNetworkId,
    utils,
    toBN,
    fromWei,
    toWei,
  }
}
