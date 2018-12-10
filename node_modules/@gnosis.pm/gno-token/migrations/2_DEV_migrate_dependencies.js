/* global artifacts */
/* eslint no-undef: "error" */

const migrateMath = require('@gnosis.pm/util-contracts/src/migrations/2_deploy_math.js')

module.exports = function (deployer, network, accounts) {
  const deployParams = { artifacts, deployer, network, accounts }

  if (network === 'development') {
    return migrateMath(deployParams)
  } else {
    console.log('Not in development, so nothing to do. Current network is %s', network)
  }
}
