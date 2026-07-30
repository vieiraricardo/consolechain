import { ParamType } from 'ethers'

/**
 * Formats ABI function parameters into a readable string
 * @param functionName The name of the function
 * @param inputs The function input parameters from the ABI
 * @returns A formatted string showing the function signature
 */
export function parseAbiFunctionParams(
  functionName: string,
  inputs: readonly ParamType[],
): string {
  const params = inputs
    .map((input) => `${input.name || '_'}: ${input.type}`)
    .join(', ')

  return `${functionName}(${params})`
}
