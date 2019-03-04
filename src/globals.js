import { toBN } from './api/utils'

export const ETHEREUM_NETWORKS = {
  MAIN: 'MAIN',
  MORDEN: 'MORDEN',
  ROPSTEN: 'ROPSTEN',
  RINKEBY: 'RINKEBY',
  KOVAN: 'KOVAN',
  UNKNOWN: 'UNKNOWN',
}

export const networkById = {
  1: ETHEREUM_NETWORKS.MAIN,
  2: ETHEREUM_NETWORKS.MORDEN,
  3: ETHEREUM_NETWORKS.ROPSTEN,
  4: ETHEREUM_NETWORKS.RINKEBY,
  42: ETHEREUM_NETWORKS.KOVAN,
}

export const GAS_LIMIT = 400000
export const GAS_PRICE = 5e9

export const FIXED_DECIMAL_AMOUNT = 4
export const DATA_LOAD_STRING = 'loading...'

export const WEBSOCKET_URLS = {
  MAIN: 'wss://mainnet.infura.io/ws/v3/fb2b930672ff4872bfcad69671f2dfd4',
  RINKEBY: 'wss://rinkeby.infura.io/ws/v3/fb2b930672ff4872bfcad69671f2dfd4',
  KOVAN: 'wss://kovan.infura.io/ws/v3/fb2b930672ff4872bfcad69671f2dfd4',
  MORDEN: 'wss://morden.infura.io/ws/v3/fb2b930672ff4872bfcad69671f2dfd4',
  ROPSTEN: 'wss://ropsten.infura.io/ws/v3/fb2b930672ff4872bfcad69671f2dfd4',
  LOCAL: 'ws://localhost:8545/ws',
}

export const INFURA_URLS = {
  MAIN: 'https://mainnet.infura.io/v3/fb2b930672ff4872bfcad69671f2dfd4',
  RINKEBY: 'https://rinkeby.infura.io/v3/fb2b930672ff4872bfcad69671f2dfd4',
}

export const MAINNET_WETH = require('@gnosis.pm/util-contracts/networks.json').EtherToken['1'].address
export const RINKEBY_WETH = require('@gnosis.pm/util-contracts/networks.json').EtherToken['4'].address

export const BN_4_PERCENT = toBN(104)

export const POOL_STATES = {
  POOLING: 'Pooling',
  POOLING_ENDED: 'Pooling Ended',
  DEPOSIT_WITHDRAW_FROM_DX: 'Deposit Withdrawn From Dx',
  MGN_UNLOCKED: 'Mgn Unlocked',
}
