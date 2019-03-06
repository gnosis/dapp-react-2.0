/**
 * Contract deployment
 */
import TruffleContract from 'truffle-contract'
import { getWeb3API } from './ProviderWeb3'

// Deployed app contracts singleton API
let appContracts

// contract array, strings
// ADD HERE contracts you want to deploy - names should be exactly as read in build/contracts (without .json)
const contracts = [
  'Coordinator',
  'EtherToken',
  'TokenGNO',
  // 'TokenFRT',
  // 'TokenOWL',
  // 'TokenOWLProxy',
]

// to make access easier later...
const shortContractNames = {
  Coordinator: 'coord',
  EtherToken: 'eth',
  TokenGNO: 'gno',
  // TokenFRT: 'frt',
  // TokenOWL: 'owl',
  // TokenOWLProxy: 'owlProxy',
}

let req
// when not on local ganache, import what is available from @gnosis.pm/owl-token
// and later separately TokenGNO from @gnosis.pm/gno-token
if (process.env.FE_CONDITIONAL_ENV === 'development') {
  req = require.context(
    '../../build/contracts/',
    false,
    /(Coordinator|EtherToken|TokenGNO)\.json$/,
  )
} else {
  // only diff here = TokenGNO
  req = require.context(
    '@gnosis.pm/dx-mgn-pool/build/contracts/',
    false,
    /(Coordinator|EtherToken|TokenGNO)\.json$/,
  )
}

/**
 * reqKeys
 * @type { string }
 * e.g 'DutchExchange', 'MyCoolContract'
 */
const reqKeys = req.keys()

/**
 * contractArtifacts aka ContractJSONS
 * Array of imported contract artifacts (JSONs) from build/contracts
 * @type { JSON[] } - ContractJSONs
 *
 * e.g:
 *
 * [
 *  {
      "contractName": "CoolAppDependencies",
      "abi": [],
      ...
      "networks": {},
      "schemaVersion": "2.0.0",
      "updatedAt": "2018-12-10T15:39:53.946Z"
    },
    ...
 * ]
 */
const contractArtifacts = contracts.map((c) => {
  // Do we need to replace contractJSONS if we're on a different ENV?
  // then below is done
  if (process.env.FE_CONDITIONAL_ENV === 'production') {
    if (c === 'EtherToken')     return require('@gnosis.pm/util-contracts/build/contracts/EtherToken.json')
    if (c === 'TokenGNO')       return require('@gnosis.pm/gno-token/build/contracts/TokenGNO.json')
  }
  return req(reqKeys.find(key => key === `./${c}.json`))
})

// We keep a JSON file of addresses of deployed contracts for specific environments
// e.g Development SuperCoolContract may be different from Production SuperCoolContract
// inject network addresses
const
  networksMgnPool = require('@gnosis.pm/dx-mgn-pool/networks.json'),
  networksUtils   = require('@gnosis.pm/util-contracts/networks.json'),
  networksGNO     = require('@gnosis.pm/gno-token/networks.json')

// Loop through each IDX of contractArtifacts
// and re-assign network object (from above) to each contract JSON
for (const contrArt of contractArtifacts) {
  const { contractName } = contrArt
  // assigns networks but keeps local network ids (ganache)
  Object.assign(
    contrArt.networks,
    networksUtils[contractName],
    networksGNO[contractName],
    networksMgnPool[contractName],
  )
}

// TODO: change - dx-mgn-pool @0.1.0 has no networks-dev
// in development use different contract addresses
if (process.env.FE_CONDITIONAL_ENV === 'development') {
  // from networks-%ENV%.json
  const networksDxMgnPoolDev = require('../../test/networks-dev.json')

  for (const contrArt of contractArtifacts) {
    const { contractName } = contrArt
    // assign networks from the file, overriding from /build/contracts with same network id
    // but keeping local network ids
    Object.assign(contrArt.networks, networksDxMgnPoolDev[contractName])
  }
}

// TODO: change - dx-mgn-pool @0.1.0 has no networks-dev
// in development use different contract addresses
if (process.env.SHORT_TEST) {
  // from networks-%ENV%.json
  const networksDxMgnPoolDev = require('../../test/networks-david-short-test.json')

  for (const contrArt of contractArtifacts) {
    const { contractName } = contrArt
    // assign networks from the file, overriding from /build/contracts with same network id
    // but keeping local network ids
    Object.assign(contrArt.networks, networksDxMgnPoolDev[contractName])
  }
}

/**
 * TruffleWrappedContractArtifacts = TruffleContract(contract artifacts/json)
 * @returns {[string]} ContractsABI[] -> UNDEPLOYED
 *
 * Key
 * 0: Coordinator
 * 1: EtherToken
 * 2: TokenFNO
*/
const TruffleWrappedContractArtifacts = contractArtifacts.map(contractArtifact => TruffleContract(contractArtifact))

// Wrap and deploy HumanFriendlyToken/DxMgnPool/TokenFRT to interface with any contract addresses called
export const HumanFriendlyToken = TruffleContract(require('@gnosis.pm/util-contracts/build/contracts/HumanFriendlyToken.json'))
export const DxMgnPool = TruffleContract(require('@gnosis.pm/dx-mgn-pool/build/contracts/DxMgnPool.json'))
export const TokenMGN = TruffleContract(require('@gnosis.pm/dx-contracts/build/contracts/TokenFRT.json'))
export const EtherToken = TruffleContract(require('@gnosis.pm/util-contracts/build/contracts/EtherToken.json'))

/**
 * setContractProvider
 * Sets provider for each contract - provider is created in api/ProviderWeb3
 * @param string provider
 */
const setContractProvider =
  provider =>
    TruffleWrappedContractArtifacts
      .concat([
        DxMgnPool, 
        EtherToken,
        HumanFriendlyToken, 
        TokenMGN, 
      ])
      .forEach((c) => { c.setProvider(provider) })

/**
 * getPromisedInstances: () => Promise<ContractCode[]>
 * STARTS deployment of each contract in TruffleWrappedContracts array
 *
 * @returns Promise<Deployed_Contracts[]>
 */
const getPromisedInstances = () => Promise.all(TruffleWrappedContractArtifacts.map(c => c.deployed()))

/**
   * @name contractArrayToMap
   * @param { JSON[] } contractArr - ContractJSON[] - Array of contract JSONs to reduce over
   * @param { { [string]: string } } shortContractNamesMap - { [string]: string } - Mapping of names to assign as keys
   *
   * Map/reduce deployedContractsArray items to short name contract OBJECT
   * e.g [deployedContractCodeETH, deployedContractCodeGNO, ... ] = { 'eth': deployedContractCodeETH }
   */
const contractArrayToMap = (contractArr, shortContractNamesMap = shortContractNames) => contractArr.reduce((acc, contract, index) => {
  acc[shortContractNamesMap[contracts[index]]] = contract
  return acc
}, {})

/**
 * getAppContracts = async () => {
 * getContracts
 * @returns {{ coord: DContr, eth: DContr, gno: DContr, dxMP: TContr, hft: TContr }}
 */
export const getAppContracts = async (force) => {
  // Singleton logic - if contractsAPI already initialised, don't re-init
  // However, accepts a force param - to re-init anyways
  // useful for walletProvider changes etc
  if (appContracts && !force) return appContracts

  appContracts = await init()
  return appContracts
}

/**
 * init()
 * Initiates all contracts and return API
 * @returns { Object { dx: depCon, eth: depCon, frt: depCon, hft: depCon, owl: depCon, }
 */
async function init() {
  // get initialised Web3API to set inside contracts
  const { currentProvider } = await getWeb3API()

  // set Provider for each TC wrapped ContractABI
  setContractProvider(currentProvider)

  /* !!!AT THIS POINT: all contracts have their provider!!! */

  /**
   * @name deployedContractsArray
   * Get back all DEPLOYED, provider ready instances of CONTRACTS
   * @type { JSON[] } [ deployedContract1, deployedContract2, ... ]
   */
  let deployedContractsArray
  try {
    // Resolves earlier started contracts promise
    deployedContractsArray = await getPromisedInstances()
  } catch (error) {
    // in browser display an error
    // in prebuild react render don't do anything
    if (typeof window !== 'undefined') console.error(error)
    return {}
  }

  /**
   * @type {{ coord: Contract, eth: Contract, gno: Contract, hft: Contract, dxMP: Contract, mgn: Contract }}
   */
  const deployedContractsMap = contractArrayToMap(deployedContractsArray)
  
  deployedContractsMap.hft = HumanFriendlyToken
  deployedContractsMap.dxMP = DxMgnPool
  deployedContractsMap.mgn = TokenMGN
  deployedContractsMap.weth = EtherToken

  if (process.env.NODE_ENV === 'development') {
    // make it available globally
    window.React_DAPP_CONTRACTS = deployedContractsMap
  }

  console.debug('​deployedContractsMap', deployedContractsMap)
  return deployedContractsMap
}
