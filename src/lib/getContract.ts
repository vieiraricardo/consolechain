import { Contract, JsonRpcProvider, Wallet, InterfaceAbi } from 'ethers'
import { StandardType } from '../types'
import { loadConfig } from './config'
import * as erc721Module from '../abi/ERC721.json'
import * as erc1155Module from '../abi/ERC1155.json'
import * as erc20Module from '../abi/ERC20.json'
import chalk from 'chalk'

// Handle both ES modules and CommonJS
const erc721 = (erc721Module as any).default || erc721Module
const erc1155 = (erc1155Module as any).default || erc1155Module
const erc20 = (erc20Module as any).default || erc20Module

const STANDARD_ABIS: Record<StandardType, InterfaceAbi> = {
  '721': erc721 as InterfaceAbi,
  '1155': erc1155 as InterfaceAbi,
  '20': erc20 as InterfaceAbi,
}

/**
 * Creates a provider with fallback support
 * Tries multiple RPC URLs until one works
 */
async function createProviderWithFallback(
  rpcUrls: string[],
): Promise<JsonRpcProvider> {
  let lastError: Error | null = null

  for (let i = 0; i < rpcUrls.length; i++) {
    const rpcUrl = rpcUrls[i]
    try {
      const provider = new JsonRpcProvider(rpcUrl)

      // Test connection with a simple call
      await provider.getNetwork()

      return provider
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      if (i < rpcUrls.length - 1) {
        // Try next RPC
        continue
      }
    }
  }

  // All RPCs failed - show error and exit
  console.log(chalk.red(`\n❌ All ${rpcUrls.length} RPC(s) failed to connect`))
  console.log(
    chalk.gray(`Last error: ${lastError?.message || 'Unknown error'}\n`),
  )

  process.exit(1)
}

/**
 * Creates a contract instance with optional signer and RPC fallback
 * @param address Contract address
 * @param standardOrAbi Either a standard type ('20', '721', '1155') or a custom ABI
 * @param rpcUrlOrChain Either a direct RPC URL or a rpcUrls nameArrayofRPCURLs(firstis primary, rest are fallbacks)
 * @returns Contract instance
 */
export async function getContract(
  address: string,
  standardOrAbi: StandardType | InterfaceAbi,
  rpcUrls: string | string[],
): Promise<Contract> {
  // Normalize to array
  const urls = Array.isArray(rpcUrls) ? rpcUrls : [rpcUrls]

  if (urls.length === 0) {
    throw new Error('No RPC URLs provided')
  }

  // Create provider with fallback
  const provider = await createProviderWithFallback(urls)

  const config = loadConfig()
  const signerOrProvider = config?.privateKey
    ? new Wallet(config.privateKey, provider)
    : provider

  const abi =
    typeof standardOrAbi === 'string'
      ? STANDARD_ABIS[standardOrAbi as StandardType]
      : standardOrAbi

  return new Contract(address, abi, signerOrProvider)
}
