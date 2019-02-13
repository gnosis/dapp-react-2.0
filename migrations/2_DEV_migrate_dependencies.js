/* global artifacts */
/* eslint no-undef: "error" */

const migrateDxMgnStack = require('@gnosis.pm/dx-mgn-pool/src/migrations/migrations-truffle-5/')

module.exports = (deployer, network, accounts) =>
  migrateDxMgnStack({
    artifacts,
    deployer,
    network,
    accounts,
    web3,
  })
