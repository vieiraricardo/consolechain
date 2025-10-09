import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { dirname } from 'path'
import { homedir } from 'os'

const HISTORY_PATH = `${homedir()}/.config/consolechain_history`
const MAX_HISTORY_ENTRIES = 1000

/**
 * Loads command history from disk
 */
export function loadHistory(): string[] {
  if (!existsSync(HISTORY_PATH)) {
    return []
  }

  try {
    const historyData = readFileSync(HISTORY_PATH, 'utf8')
    return historyData.split('\n').filter(Boolean)
  } catch (error) {
    console.error('Failed to load history:', error)
    return []
  }
}

/**
 * Saves a command to history
 */
export function saveToHistory(command: string): void {
  if (!command || command.trim() === '') {
    return
  }

  const historyDir = dirname(HISTORY_PATH)
  if (!existsSync(historyDir)) {
    mkdirSync(historyDir, { recursive: true })
  }

  let history = loadHistory()

  // Remove duplicate if exists
  history = history.filter((cmd) => cmd !== command)

  // Add to end
  history.push(command)

  // Keep only last MAX_HISTORY_ENTRIES
  if (history.length > MAX_HISTORY_ENTRIES) {
    history = history.slice(-MAX_HISTORY_ENTRIES)
  }

  writeFileSync(HISTORY_PATH, history.join('\n'), 'utf8')
}
