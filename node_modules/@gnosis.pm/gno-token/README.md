# GNO Token
The GNO token and related smart contracts.

The token and contract can be in **Etherscan**:

* **Mainnet**: https://etherscan.io/token/0x6810e776880c02933d47db1b9fc05908e5386b96
* **Rinkeby**: https://rinkeby.etherscan.io/token/0xd0dab4e640d95e9e8a47545598c33e31bdb53c7c
* **Kovan**: https://kovan.etherscan.io/token/0x6018bf616ec9db02f90c8c8529ddadc10a5c29dc

## Setup and show the networks
```bash
# Install dependencies
yarn install

# Compile and restore the network addresses
yarn restore

# Show current network addresses
yarn networks
```

## Execute migrations into a local ganache-cli
```bash
# Run ganache CLU
yarn rpc

# Execute the migrations for the dependencies
yarn migrate-dep

# Execute the migrations
yarn migrate
```

## Generate a new version
```bash
# In a release branch (i.e. release/vX.Y.X)
# Migrate the version to the testnets, at least rinkeby, and posibly mainnet
# You can optionally change the gas price using the GAS_PRICE_GWEI env variable
yarn restore
MNEMONIC=$MNEMONIC_GNO yarn migrate --network rinkeby

# Extract the network file
yarn networks-extract

# Verify the contract in Etherscan
# Folow the steps in "Verify contract"

# Commit the network file
git add network.json
git commit -m 'Update the networks file'

# Generate version using Semantic Version: https://semver.org/
# For example, for a minor version
npm version minor
git push
git push --tags

# Deploy npm package
npm publish --access=public

# Merge tag into develop, to deploy it to production, also merge it into master
git checkout develop
git merge vX.Y.X
```

## Verify contract
Flatten the smart contract:
```bash
npx truffle-flattener contracts/TokenGNO.sol > build/TokenGNO-EtherScan.sol
```

Go to Etherscan validation page:
* Go to[https://rinkeby.etherscan.io/verifyContract?a=]()
* Fill the information:
  * Use `build/TokenGNO-EtherScan.sol`
  * Set the exact compiler version used for the compilation i.e. `v0.4.24+commit.e67f0147`
  * Optimization: `No`
* Press validate