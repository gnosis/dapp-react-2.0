const path = require('path')

const BASE_DIR = path.join(__dirname, '../..')
const BUILD_DIR = path.join(BASE_DIR, 'build/contracts')
const NETWORKS_FILE_PATH = path.join(BASE_DIR, 'networks.json')

// const DEPENDENCIES_CONTRACTS = [ 'Math' ]
// const BUILD_DIR_UTIL_CONTRACTS =
//   path.join(BASE_DIR, 'node_modules/@gnosis.pm/util-contracts/build/contracts')

module.exports = {
  buildPath: BUILD_DIR,
  networkFilePath: NETWORKS_FILE_PATH,
  buildDirDependencies: []
  // buildDirDependencies: [
  //   BUILD_DIR_UTIL_CONTRACTS
  // ],
  // extractNetworkFilter: ({ name }) => DEPENDENCIES_CONTRACTS.includes(name)
}
