const deployPool = require("@gnosis.pm/dx-mgn-pool/src/migrations/migrations-truffle-5/4_deploy_Pool")

module.exports = (deployer, network, accounts) =>
  deployPool({
    artifacts,
    deployer,
    network,
    accounts,
    web3,
  })
