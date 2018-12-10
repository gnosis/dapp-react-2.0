const INITIAL_TOKEN_AMOUNT = 10e6 // 10M

function migrate ({
  artifacts,
  deployer,
  network,
  accounts,
  initialTokenAmount = INITIAL_TOKEN_AMOUNT
}) {
  const TokenGNO = artifacts.require('TokenGNO')
  const { Math } = _getDependencies(artifacts, network, deployer)

  return deployer
    .then(() => Math.deployed())
    .then(() => deployer.link(Math, TokenGNO))
    .then(() => {
      const owner = accounts[0]
      console.log('Deploying GNO with owner: %s', owner)
      return deployer.deploy(TokenGNO, initialTokenAmount * 1e18)
    })
}

function _getDependencies (artifacts, network, deployer) {
  let Math
  if (network === 'development') {
    Math = artifacts.require('Math')
  } else {
    const contract = require('truffle-contract')
    Math = contract(require('@gnosis.pm/util-contracts/build/contracts/Math'))
    Math.setProvider(deployer.provider)
  }

  return {
    Math
  }
}

module.exports = migrate
