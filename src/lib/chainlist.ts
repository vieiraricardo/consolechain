import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { homedir } from 'os'
import { ChainlistChain, CachedChainData } from '../types'
import chalk from 'chalk'

const CHAINLIST_URL = 'https://chainlist.org/rpcs.json'
const CACHE_PATH = `${homedir()}/.config/consolechain_chains.json`
const CACHE_DURATION = 24 * 60 * 60 * 1000 // 24 hours

/**
 * Fetches chains from chainlist.org
 */
async function fetchChains(): Promise<ChainlistChain[]> {
  try {
    const response = await fetch(CHAINLIST_URL)
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`)
    }
    const data = await response.json()
    return data as ChainlistChain[]
  } catch (error) {
    throw new Error(
      `Failed to fetch chains from chainlist.org: ${
        error instanceof Error ? error.message : 'Unknown error'
      }`,
    )
  }
}

/**
 * Loads chains from cache
 */
function loadCache(): CachedChainData | null {
  if (!existsSync(CACHE_PATH)) {
    return null
  }

  try {
    const data = readFileSync(CACHE_PATH, 'utf8')
    return JSON.parse(data)
  } catch {
    console.warn(chalk.yellow('Warning: Failed to load chain cache'))
    return null
  }
}

/**
 * Saves chains to cache
 */
function saveCache(chains: ChainlistChain[]): void {
  try {
    const cacheDir = `${homedir()}/.config`
    if (!existsSync(cacheDir)) {
      mkdirSync(cacheDir, { recursive: true })
    }

    const data: CachedChainData = {
      chains,
      timestamp: Date.now(),
    }

    writeFileSync(CACHE_PATH, JSON.stringify(data), 'utf8')
  } catch {
    console.warn(chalk.yellow('Warning: Failed to save chain cache'))
  }
}

/**
 * Gets chains list with caching
 */
export async function getChains(
  forceRefresh = false,
): Promise<ChainlistChain[]> {
  if (!forceRefresh) {
    const cache = loadCache()
    if (cache && Date.now() - cache.timestamp < CACHE_DURATION) {
      return cache.chains
    }
  }

  console.log(chalk.gray('Fetching chain list from chainlist.org...'))
  const chains = await fetchChains()
  saveCache(chains)
  return chains
}

/**
 * Searches chains by name, shortName, or chainId
 */
export function searchChains(
  chains: ChainlistChain[],
  query: string,
): ChainlistChain[] {
  const lowerQuery = query.toLowerCase()

  return chains.filter((chain) => {
    const nameMatch = chain.name.toLowerCase().includes(lowerQuery)
    const shortNameMatch = chain.shortName.toLowerCase().includes(lowerQuery)
    const chainIdMatch = chain.chainId.toString() === query
    const slugMatch = chain.chainSlug?.toLowerCase().includes(lowerQuery)

    return nameMatch || shortNameMatch || chainIdMatch || slugMatch
  })
}

/**
 * Gets the best RPC URL from a chain
 * Prioritizes non-tracking, open source RPCs
 */
export function getBestRpc(chain: ChainlistChain): string {
  if (chain.rpc.length === 0) {
    throw new Error(`No RPC endpoints available for ${chain.name}`)
  }

  // Filter out websocket URLs
  const httpRpcs = chain.rpc.filter((rpc) => {
    const url = typeof rpc === 'string' ? rpc : rpc.url
    return url.startsWith('http')
  })

  if (httpRpcs.length === 0) {
    throw new Error(`No HTTP RPC endpoints available for ${chain.name}`)
  }

  // Prioritize open source and non-tracking RPCs
  const openSourceRpc = httpRpcs.find(
    (rpc) => typeof rpc === 'object' && rpc.isOpenSource,
  )
  if (openSourceRpc && typeof openSourceRpc !== 'string') {
    return openSourceRpc.url
  }

  const noTrackingRpc = httpRpcs.find(
    (rpc) => typeof rpc === 'object' && rpc.tracking === 'none',
  )
  if (noTrackingRpc && typeof noTrackingRpc !== 'string') {
    return noTrackingRpc.url
  }

  // Return first available
  const firstRpc = httpRpcs[0]
  return typeof firstRpc === 'string' ? firstRpc : firstRpc.url
}

/**
 * Gets the best explorer URL from a chain
 */
export function getBestExplorer(chain: ChainlistChain): string {
  if (!chain.explorers || chain.explorers.length === 0) {
    return chain.infoURL || ''
  }

  // Prefer EIP3091 standard explorers
  const eipExplorer = chain.explorers.find((e) => e.standard === 'EIP3091')
  if (eipExplorer) {
    return eipExplorer.url
  }

  return chain.explorers[0].url
}

/**
 * Formats chain info for display
 */
export function formatChainInfo(chain: ChainlistChain): string {
  const parts = [
    chalk.cyan.bold(chain.name),
    chalk.gray(`(Chain ID: ${chain.chainId})`),
  ]

  if (chain.shortName) {
    parts.push(chalk.gray(`[${chain.shortName}]`))
  }

  if (chain.nativeCurrency) {
    parts.push(chalk.yellow(`${chain.nativeCurrency.symbol}`))
  }

  return parts.join(' ')
}
