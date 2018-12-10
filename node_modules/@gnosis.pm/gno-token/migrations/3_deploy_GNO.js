/* global artifacts */
/* eslint no-undef: "error" */

const deployGno = require('../src/migrations/3_deploy_GNO')

module.exports = function (deployer, network, accounts) {
  return deployGno({
    artifacts,
    deployer,
    network,
    accounts
  })
}
