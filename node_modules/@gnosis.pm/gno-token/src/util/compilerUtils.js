const solc = require('solc')
const path = require('path')

async function loadCompiler (version) {
  return new Promise((resolve, reject) => {
    solc.loadRemoteVersion(version, (err, solcLegacy) => {
      if (err) {
        reject(err)
      } else {
        resolve(solcLegacy)
      }
    })
  })
}

async function loadCompilerLocal (version) {
  const solJsonFileName = 'soljson-' + version + '.js'
  const solJsonPath = path.join(__dirname, '..', 'vendor', 'solc-compiler', solJsonFileName)
  return solc.setupMethods(require(solJsonPath))
}

module.exports = {
  loadCompiler,
  loadCompilerLocal
}
