const ethers = require('ethers')
const fs = require('fs')
const { env } = require('node:process')
const erc721 = require('../abi/ERC721.json')
const erc1155 = require('../abi/ERC1155.json')
const erc20 = require('../abi/ERC20.json')
const rpc = require('../lib/rpc')

const configPath = `${env['HOME']}/.config/consolechain.json`
const config = fs.existsSync(configPath) ? require(configPath) : ''
const defaultAbi = {
  721: erc721,
  1155: erc1155,
  20: erc20,
}

module.exports = (address, standardOrAbi, chain) => {
  const provider = new ethers.providers.JsonRpcProvider(rpc[chain])

  const signer = config?.privateKey
    ? new ethers.Wallet(config.privateKey, provider)
    : provider

  const abi =
    typeof standardOrAbi === 'object'
      ? standardOrAbi
      : defaultAbi[standardOrAbi]

  const contract = new ethers.Contract(address, abi, signer)

  return contract
}
