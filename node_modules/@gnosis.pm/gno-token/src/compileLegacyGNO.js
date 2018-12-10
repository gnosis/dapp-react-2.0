const compilerUtils = require('./util/compilerUtils')
const path = require('path')
const fs = require('fs')

// Compiles the Original GNO contracts using a legacy compiler version
// GNO was deployed usign v0.4.10
//  https://github.com/ethereum/solc-js/tree/v0.4.10
//  https://etherscan.io/address/0x6810e776880c02933d47db1b9fc05908e5386b96#code
const COMPILER_VERSION = 'v0.4.10+commit.f0d539ae'
const LEGACY_CONTRACTS_SOURCE_DIR = path.join(__dirname, '..', 'contracts-legacy')
const LEGACY_CONTRACTS_BUILD_DIR = path.join(__dirname, '..', 'build', 'legacy-contracts')

async function loadSources () {
  const sources = {}

  fs.readdirSync(LEGACY_CONTRACTS_SOURCE_DIR).forEach(file => {
    sources[file] = fs.readFileSync(path.join(LEGACY_CONTRACTS_SOURCE_DIR, file), {
      encoding: 'utf8'
    })
  })

  return sources
}

async function compile () {
  if (!fs.existsSync(LEGACY_CONTRACTS_BUILD_DIR)) {
    fs.mkdirSync(LEGACY_CONTRACTS_BUILD_DIR)
  }

  const sources = await loadSources()
  const sourceNames = Object.keys(sources)
  // const solc = await compilerUtils.loadCompiler(COMPILER_VERSION)
  console.log(`Compiling ${sourceNames.length} sources: ${sourceNames.join(', ')}`)
  const solc = await compilerUtils.loadCompilerLocal(COMPILER_VERSION)
  var output = solc.compile({ sources }, 1)
  console.log('All sources were compiled')
  console.log(`Saving compiled contracts in ${LEGACY_CONTRACTS_BUILD_DIR}`)
  if (output.errors) {
    output.errors.forEach(error => {
      console.error(error)
    })
    process.exit(1)
    // TODO: Just set the exit code, do not exit
  } else {
    const contractNames = Object.keys(output.contracts)
    contractNames.forEach(contractNameRaw => {
      const [ , contractName ] = contractNameRaw.split(':')
      const compiledContract = output.contracts[contractNameRaw]

      const filePath = path.join(LEGACY_CONTRACTS_BUILD_DIR, contractName + '.json')
      console.log(`Writing compiled contract: ${contractName}`)
      fs.writeFileSync(filePath, JSON.stringify(compiledContract))
    })
    console.log('All compiled contracts were generated')
  }
}

// Compile contracts
compile()
  .then(() => {
    console.log('The GNO contract has been compiled')
  })
  .catch(error => {
    console.error('Error compiling the GNO contract: ' + error.name)
    console.error(error)
    process.exit(1)
  })
