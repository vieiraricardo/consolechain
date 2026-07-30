import { GluegunCommand } from 'gluegun'
import chalk from 'chalk'
import { saveConfig, isValidPrivateKey } from '../lib/config'

const command: GluegunCommand = {
  name: 'set-pk',
  description: 'Set your private key for signing transactions',
  run: async (toolbox) => {
    const { parameters } = toolbox
    const privateKey = parameters.first

    if (!privateKey) {
      console.log(
        chalk.red('Error: Private key required\n') +
          chalk.gray('Usage: consolechain set-pk <your-private-key>'),
      )
      return
    }

    // Validate private key format
    if (!isValidPrivateKey(privateKey)) {
      console.log(
        chalk.red('Error: Invalid private key format\n') +
          chalk.gray(
            'Private key must be a 64-character hexadecimal string (with or without 0x prefix)',
          ),
      )
      return
    }

    try {
      // Ensure it has 0x prefix
      const normalizedKey = privateKey.startsWith('0x')
        ? privateKey
        : `0x${privateKey}`

      await saveConfig({ privateKey: normalizedKey })

      console.log(chalk.green('\n✓ Private key saved successfully'))
      console.log(
        chalk.gray(
          'Set CONSOLECHAIN_ENCRYPTION_KEY environment variable to encrypt your key\n',
        ),
      )
    } catch (error: any) {
      console.log(chalk.red(`\nError saving private key: ${error.message}\n`))
    }
  },
}

export default command
