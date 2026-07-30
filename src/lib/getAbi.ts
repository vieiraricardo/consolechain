import { existsSync, readFileSync } from 'fs'
import { resolve } from 'path'

/**
 * Loads an ABI from a file path
 * Supports both absolute and relative paths
 * @param abiPath Path to the ABI file
 * @returns The ABI array
 */
export function getAbi(abiPath: string): any[] {
  // Try absolute path first
  let resolvedPath = abiPath

  // If not found, try relative to current working directory
  if (!existsSync(resolvedPath)) {
    resolvedPath = resolve(process.cwd(), abiPath)
  }

  if (!existsSync(resolvedPath)) {
    throw new Error(
      `ABI file not found: ${abiPath}\nSearched paths:\n- ${abiPath}\n- ${resolvedPath}`,
    )
  }

  try {
    const abiData = JSON.parse(readFileSync(resolvedPath, 'utf8'))
    // Handle both {abi: [...]} and [...] formats
    return abiData.abi || abiData
  } catch (error) {
    throw new Error(
      `Failed to load ABI from ${resolvedPath}: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    )
  }
}
