/**
 * Parses command line parameters into appropriate types
 * Handles hex strings, arrays, and regular strings
 */
export function parseParams(params: string[]): any[] {
  return params.map((value) => {
    // Preserve hex strings and addresses
    if (/^0x[A-Fa-f0-9]+$/i.test(value)) {
      return value
    }

    // Parse arrays
    if (/^\[.*\]$/.test(value)) {
      try {
        return JSON.parse(value)
      } catch (error) {
        throw new Error(`Invalid array format: ${value}`)
      }
    }

    // Parse numbers
    if (/^\d+$/.test(value)) {
      return value // Keep as string, let ethers handle conversion
    }

    // Parse booleans
    if (value === 'true') return true
    if (value === 'false') return false

    // Return as string for everything else
    return value
  })
}
