import { stdin as input, stdout as output } from 'process'
import { createInterface } from 'readline'
import { isAddress, FunctionFragment } from 'ethers'
import chalk from 'chalk'
import { ConsoleChainToolbox, ConsoleOptions } from '../types'
import { getContract } from './getContract'
import { getAbi } from './getAbi'
import { parseParams } from './parseParams'
import { parseAbiFunctionParams } from './parseAbiFunctionParams'
import { loadHistory, saveToHistory } from './history'
import { selectChainInteractive, getChainByName } from './selectChain'

let completions: string[] = []

function completer(line: string): [string[], string] {
  const hits = completions.filter((c) => c.startsWith(line))
  return [hits.length ? hits : completions, line]
}

/**
 * Main console function - interactive REPL for smart contract interaction
 */
export async function consoleMain(toolbox: ConsoleChainToolbox): Promise<void> {
  try {
    const {
      parameters: { argv: args, options },
    } = toolbox

    const [, , address] = args
    const opts = options as ConsoleOptions

    // Validate address
    if (!address || !isAddress(address)) {
      console.log(
        chalk.red('Error: Invalid Ethereum address provided\n') +
          chalk.gray(
            'Usage: consolechain <address> [--chain <chain> | --rpc <url> | --interactive] [--abi <path> | --standard <20|721|1155>]',
          ),
      )
      return
    }

    // Determine chain/RPC
    let rpcUrls: string[]
    let explorerUrl: string
    let chainName: string

    const customRpc = opts.rpc || opts.r
    const chainArg = opts.chain || opts.c

    if (customRpc) {
      // Use custom RPC (no fallback)
      rpcUrls = [customRpc]
      explorerUrl = ''
      chainName = 'Custom RPC'
      console.log(chalk.gray(`Using custom RPC: ${customRpc}\n`))
    } else if (chainArg) {
      // Search for chain by name
      const selection = await getChainByName(chainArg)
      rpcUrls = selection.rpcUrls
      explorerUrl = selection.explorerUrl
      chainName = selection.chain.name
    } else {
      // ALWAYS ask user to select chain interactively
      const selection = await selectChainInteractive()
      rpcUrls = selection.rpcUrls
      explorerUrl = selection.explorerUrl
      chainName = selection.chain.name
    }

    // Get ABI
    const standard = opts.standard || opts.s
    // Convert number to string if needed (e.g., 20 -> '20')
    const standardStr = standard ? String(standard) : undefined
    const standardOrAbi = opts.abi ? getAbi(opts.abi) : standardStr

    if (!standardOrAbi) {
      console.log(
        chalk.red('Error: You must specify either --abi or --standard\n') +
          chalk.gray(
            'Example: consolechain 0x... --chain ethereum --standard 721',
          ),
      )
      return
    }

    // Create contract instance with RPC fallback
    const contract = await getContract(address, standardOrAbi as any, rpcUrls)
    const explorer = explorerUrl

    // Setup autocomplete
    completions = Object.values(contract.interface.fragments)
      .filter((f) => f.type === 'function')
      .map((f) => (f as any).name)

    // Add special commands
    completions.push('help', 'exit', 'clear')

    // Create readline interface with history
    const history = loadHistory()
    const readline = createInterface({
      input,
      output,
      prompt: chalk.gray.bold('Ξ '),
      completer,
      history,
      historySize: 1000,
    })

    console.log(chalk.green(`\n✓ Connected to ${chalk.bold(chainName)}`))
    console.log(chalk.gray(`Contract: ${address}`))
    console.log(chalk.gray(`Primary RPC: ${rpcUrls[0]}`))
    if (rpcUrls.length > 1) {
      console.log(chalk.gray(`Fallback RPCs: ${rpcUrls.length - 1} available`))
    }
    console.log(
      chalk.gray(
        `Type 'help' for available commands, or use <TAB> for autocomplete\n`,
      ),
    )

    readline.prompt()

    readline.on('line', async (inputLine: string) => {
      try {
        const trimmed = inputLine.trim()

        // Handle empty input
        if (!trimmed) {
          readline.prompt()
          return
        }

        // Save to history
        saveToHistory(trimmed)

        // Handle special commands
        if (trimmed === 'exit') {
          console.log(chalk.gray('Goodbye!'))
          readline.close()
          process.exit(0)
        }

        if (trimmed === 'clear') {
          console.clear()
          readline.prompt()
          return
        }

        if (trimmed === 'help') {
          console.log(chalk.cyan('\nAvailable commands:'))
          console.log(chalk.gray('  help          - Show this help message'))
          console.log(chalk.gray('  exit          - Exit the console'))
          console.log(chalk.gray('  clear         - Clear the screen'))
          console.log(chalk.gray('  <method> -h   - Show method signature'))
          console.log(
            chalk.gray('  <method> [...args] - Call contract method\n'),
          )
          console.log(chalk.cyan('Contract methods:'))
          completions
            .filter((c) => !['help', 'exit', 'clear'].includes(c))
            .forEach((method) => console.log(chalk.gray(`  ${method}`)))
          console.log()
          readline.prompt()
          return
        }

        // Parse input
        const matches = trimmed.match(/'([^']*)'|\S+/g)
        if (!matches) {
          readline.prompt()
          return
        }

        const [method, ...params] = matches
          .filter(Boolean)
          .map((s) => s.replace(/'/g, ''))

        // Show method help
        if (params[0] === '-h' || params[0] === '--help') {
          const matchingFragments = contract.interface.fragments.filter(
            (f) => f.type === 'function' && (f as any).name === method,
          )

          if (matchingFragments.length > 0) {
            console.log()
            matchingFragments.forEach((fragment) => {
              if (fragment.type === 'function') {
                console.log(
                  chalk.greenBright.bold(
                    '  ' +
                      parseAbiFunctionParams(
                        (fragment as any).name,
                        fragment.inputs,
                      ),
                  ),
                )
              }
            })
            console.log()
          } else {
            console.log(chalk.red(`Method ${method} not found\n`))
          }
          readline.prompt()
          return
        }

        // Call contract method
        const parsedParams = parseParams(params)

        // Handle function overloads by finding the correct signature
        const allFragments = contract.interface.fragments.filter(
          (f) => f.type === 'function' && (f as any).name === method,
        )

        let response

        if (allFragments.length === 1) {
          // Single match - call directly
          response = await contract[method](...parsedParams)
        } else if (allFragments.length > 1) {
          // Multiple overloads - find by parameter count
          const matchingFragment = allFragments.find(
            (f) =>
              f.type === 'function' && f.inputs.length === parsedParams.length,
          )

          if (matchingFragment && matchingFragment.type === 'function') {
            // Cast to FunctionFragment to access function-specific properties
            const funcFragment = matchingFragment as FunctionFragment

            // Use fragment directly to avoid ambiguity
            const data = contract.interface.encodeFunctionData(
              funcFragment,
              parsedParams,
            )

            // Check if it's a view/pure function or a transaction
            if (
              funcFragment.stateMutability === 'view' ||
              funcFragment.stateMutability === 'pure'
            ) {
              const contractAddress = await contract.getAddress()
              const provider = contract.runner?.provider
              if (!provider) {
                throw new Error('No provider available')
              }
              const result = await provider.call({
                to: contractAddress,
                data: data,
              })
              response = contract.interface.decodeFunctionResult(
                funcFragment,
                result,
              )[0]
            } else {
              const contractAddress = await contract.getAddress()
              if (
                !contract.runner ||
                typeof (contract.runner as any).sendTransaction !== 'function'
              ) {
                throw new Error(
                  'No signer available for sending transactions.\n' +
                    'Please set your private key using: consolechain setPrivateKey',
                )
              }

              console.log(
                chalk.gray(`  Sending transaction to ${contractAddress}...`),
              )

              response = await (contract.runner as any).sendTransaction({
                to: contractAddress,
                data: data,
              })
            }
          } else {
            const signatures = allFragments
              .map((f) => f.format('full'))
              .join('\n  ')
            throw new Error(
              `No ${method} signature matches ${parsedParams.length} parameter(s).\n` +
                `Available signatures:\n  ${signatures}`,
            )
          }
        } else {
          // No match - try directly (will throw helpful error)
          response = await contract[method](...parsedParams)
        }

        // Format response
        if (response?.hash) {
          console.log(
            chalk.cyan('\n  Transaction sent:'),
            chalk.blueBright.bold(`${explorer}/tx/${response.hash}\n`),
          )
        } else if (typeof response === 'object' && response !== null) {
          console.log(
            chalk.whiteBright(
              '\n  ' + JSON.stringify(response, null, 2) + '\n',
            ),
          )
        } else {
          console.log(chalk.whiteBright('\n  ' + response?.toString() + '\n'))
        }

        readline.prompt()
      } catch (error: any) {
        let errorMessage =
          error?.error?.reason || error?.reason || error.message

        // Add helpful context for common errors
        if (
          error.code === 'UNKNOWN_ERROR' &&
          errorMessage.includes('Unable to perform request')
        ) {
          errorMessage =
            'Transaction failed: Unable to send transaction.\n' +
            '  Possible causes:\n' +
            '  - Insufficient funds for gas\n' +
            '  - RPC endpoint issue\n' +
            '  - Invalid transaction parameters\n' +
            '  Original error: ' +
            error.message
        } else if (error.code === 'INSUFFICIENT_FUNDS') {
          errorMessage = 'Insufficient funds to pay for gas fees'
        } else if (
          error.code === 'NONCE_EXPIRED' ||
          error.code === 'REPLACEMENT_UNDERPRICED'
        ) {
          errorMessage = 'Transaction nonce issue: ' + errorMessage
        }

        console.log(chalk.redBright(`\n  Error: ${errorMessage}\n`))
        readline.prompt()
      }
    })

    readline.on('close', () => {
      console.log(chalk.gray('\nGoodbye!'))
      process.exit(0)
    })
  } catch (error: any) {
    console.log(chalk.redBright(`\nFatal error: ${error.message}\n`))
    process.exit(1)
  }
}
