import { build, GluegunToolbox } from 'gluegun'
import 'dotenv/config'
import { checkForUpdate } from './lib/updateChecker'
import chalk from 'chalk'

/**
 * Create the CLI and kick it off
 */
async function run(argv?: string[]): Promise<GluegunToolbox> {
  // Non-blocking update notice (throttled to once per 24h); never throws.
  await checkForUpdate({
    log: (msg) => console.error(chalk.yellow(msg)),
  }).catch(() => {})

  // Create a CLI runtime
  const cli = build()
    .brand('consolechain')
    .src(__dirname)
    .plugins('./node_modules', { matching: 'consolechain-*', hidden: true })
    .help() // provides default for help, h, --help, -h
    .version() // provides default for version, v, --version, -v
    .create()

  // Run it
  const toolbox = await cli.run(argv)

  // Send it back (for testing, mostly)
  return toolbox
}

module.exports = { run }
