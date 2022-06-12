const setPrivateKey = require('../lib/privateKey')

const command = {
  name: 'set-pk',
  run: setPrivateKey,
}

module.exports = command
