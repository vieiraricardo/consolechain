const fs = require('fs')
const { env } = require('node:process')

module.exports = (abiPath) => {
  const path = fs.existsSync(abiPath) ? abiPath : `${env['PWD']}/${abiPath}`
  const abi = fs.existsSync(path) ? require(path) : null

  if (!abi) {
    throw new Error('no such file or directory')
  } else {
    return abi?.abi || abi
  }
}
