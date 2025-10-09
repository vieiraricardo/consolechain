import { GluegunCommand } from 'gluegun'
import { consoleMain } from '../lib/console'

const command: GluegunCommand = {
  name: 'consolechain',
  description: 'Interactive console for smart contract interaction',
  run: consoleMain,
}

export default command
