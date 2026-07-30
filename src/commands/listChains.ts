import { GluegunCommand } from 'gluegun'
import chalk from 'chalk'
import { getChains, searchChains, formatChainInfo } from '../lib/chainlist'

const command: GluegunCommand = {
  name: 'list-chains',
  alias: ['ls', 'chains'],
  description: 'List available blockchain networks',
  run: async (toolbox) => {
    const { parameters, print } = toolbox
    const searchQuery = parameters.first

    try {
      print.info(chalk.cyan('📡 Fetching blockchain networks...\n'))

      const chains = await getChains()

      let filteredChains = chains

      // Filter if search query provided
      if (searchQuery) {
        filteredChains = searchChains(chains, searchQuery)

        if (filteredChains.length === 0) {
          print.error(
            chalk.red(`\n❌ No chains found matching: "${searchQuery}"\n`),
          )
          return
        }

        print.success(
          chalk.green(
            `\n✓ Found ${filteredChains.length} chains matching "${searchQuery}":\n`,
          ),
        )
      } else {
        print.success(
          chalk.green(`\n✓ Found ${chains.length} blockchain networks\n`),
        )
        print.info(
          chalk.gray('Showing popular networks (use search to find more)\n'),
        )

        // Show only popular chains by default
        const popularChainIds = [
          1, 137, 56, 42161, 10, 8453, 43114, 250, 25, 100,
        ]
        filteredChains = chains.filter((chain) =>
          popularChainIds.includes(chain.chainId),
        )
      }

      // Display chains
      filteredChains.slice(0, 50).forEach((chain) => {
        console.log(`  ${formatChainInfo(chain)}`)

        if (chain.explorers && chain.explorers.length > 0) {
          console.log(chalk.gray(`    Explorer: ${chain.explorers[0].url}`))
        }
        console.log()
      })

      if (filteredChains.length > 50) {
        print.warning(
          chalk.yellow(
            `\n⚠️  Showing first 50 of ${filteredChains.length} results\n`,
          ),
        )
        print.info(chalk.gray('Use a more specific search to narrow results\n'))
      }

      // Usage examples
      print.info(chalk.cyan('💡 Usage examples:\n'))
      console.log(chalk.gray('  consolechain list-chains ethereum'))
      console.log(chalk.gray('  consolechain list-chains polygon'))
      console.log(
        chalk.gray('  consolechain list-chains 137  # Search by chain ID'),
      )
      console.log()

      print.info(chalk.cyan('🚀 Connect to a chain:\n'))
      console.log(
        chalk.gray('  consolechain <address> --chain ethereum --standard 20'),
      )
      console.log(
        chalk.gray('  consolechain <address> --interactive --standard 721'),
      )
      console.log()
    } catch (error: any) {
      print.error(chalk.red(`\n❌ Error: ${error.message}\n`))

      if (error.message.includes('fetch')) {
        print.info(chalk.gray('Make sure you have an internet connection\n'))
      }
    }
  },
}

export default command
