const deployDutchXAndDependencies = require("@gnosis.pm/dx-mgn-pool/src/migrations/migrations-truffle-5/2_deploy_DutchX_and_Dependencies")

module.exports = (deployer, network, accounts) =>
  deployDutchXAndDependencies({
    artifacts,
    deployer,
    network,
    accounts,
    web3,
  })
