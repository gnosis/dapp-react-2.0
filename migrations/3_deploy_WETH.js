const deployWETH = require("@gnosis.pm/dx-mgn-pool/src/migrations/migrations-truffle-5/3_deploy_WETH")

module.exports = (deployer, network, accounts) =>
  deployWETH({
    artifacts,
    deployer,
    network,
    accounts,
    web3,
  })
