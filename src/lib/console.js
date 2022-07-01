const { stdin: input, stdout: output } = require('node:process')
const { ethers } = require('ethers')
const { createInterface } = require('readline')
const chalk = require('chalk')

const getContract = require('./getContract')
const getAbi = require('./getAbi')
const rpc = require('../lib/rpc')
const parseParams = require('./parseParams')
const parseAbiFunctionParams = require('./parseAbiFunctionParams')

let completions = []

function completer(line) {
  const hits = completions.filter((c) => c.startsWith(line))
  return [hits.length ? hits : completions, line]
}

async function main(toolbox) {
  try {
    const {
      parameters: { argv: args, options },
    } = toolbox

    const [, , address] = args
    const readline = createInterface({
      input,
      output,
      prompt: chalk.gray.bold('Ξ '),
      completer,
    })

    if (!ethers.utils.isAddress(address)) {
      console.log('invalid ethereum address')
      readline.close()
      return
    }

    const standard = options.standard || options.s
    const chain = options.chain || options.c
    const standardOrAbi = options?.abi ? getAbi(options.abi) : standard
    const contract = getContract(address, standardOrAbi, chain)
    const explorer = rpc.explorer[chain]

    completions = Object.values(contract.interface.functions).map(
      (fn) => fn.name
    )

    readline.prompt()

    readline.on('line', async (input) => {
      try {
        const [method, ...params] = input.split(' ').filter(Boolean)

        if (!method) {
          readline.write(null, { ctrl: true, name: 'u' })
          return
        }

        if (params[0] === '-h') {
          const methodParams = Object.entries(
            contract.interface.functions
          ).find((entries) => entries[0].match(method))

          console.log(
            chalk.greenBright.bold(
              parseAbiFunctionParams(method, methodParams[1].inputs)
            )
          )

          readline.write('\n', { ctrl: true, name: 'u' })
          return
        }

        const response = await contract[method](...parseParams(params))
        const receipt = response?.hash
          ? chalk.blueBright.bold(`${explorer}/tx/${response.hash}`)
          : chalk.whiteBright.bold(response.toString())

        console.log('  ' + receipt)

        readline.write('\n', { ctrl: true, name: 'u' })
      } catch (error) {
        console.log(chalk.redBright(error?.error?.reason || error.message))
        readline.write('\n', { ctrl: true, name: 'u' })
      }
    })
  } catch (error) {
    console.log(chalk.redBright(error.message))
  }
}

module.exports = main
