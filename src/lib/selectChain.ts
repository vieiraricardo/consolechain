import { prompt } from 'enquirer'
import chalk from 'chalk'
import { getChains, searchChains, getBestExplorer } from './chainlist'
import { getAllRpcUrls } from './getRpcUrls'
import { ChainlistChain } from '../types'

interface ChainSelection {
  chain: ChainlistChain
  rpcUrls: string[]
  explorerUrl: string
}

/**
 * Interactive chain selection - always called when chain not specified
 * Shows only chain slug for simplicity
 */
export async function selectChainInteractive(
  searchQuery?: string,
): Promise<ChainSelection> {
  console.log(chalk.cyan('\n🔗 Select a blockchain network\n'))

  // Fetch chains
  const allChains = await getChains()

  let results: ChainlistChain[]

  if (searchQuery) {
    // Use provided search query
    results = searchChains(allChains, searchQuery.trim())
  } else {
    // Ask user to search
    const { query } = await prompt<{ query: string }>({
      type: 'input',
      name: 'query',
      message: 'Search (name, symbol, or chain ID):',
      initial: '',
    })

    results = query.trim()
      ? searchChains(allChains, query.trim())
      : allChains.filter((c) => c.status === 'active').slice(0, 50)
  }

  if (results.length === 0) {
    console.log(chalk.red('\n❌ No chains found\n'))
    throw new Error('No chains found')
  }

  // Limit results
  const limitedResults = results.slice(0, 30)

  if (results.length > 30) {
    console.log(
      chalk.yellow(
        `Found ${results.length} chains, showing first 30. Refine search to narrow.\n`,
      ),
    )
  }

  // Show chain names in list
  const choices = limitedResults.map((chain) => chain.name)

  const { selectedChain: chainName } = await prompt<{ selectedChain: string }>({
    type: 'select',
    name: 'selectedChain',
    message: 'Select chain:',
    choices: choices,
  })

  // Find the selected chain
  const selectedChain = limitedResults.find((chain) => chain.name === chainName)

  if (!selectedChain) {
    throw new Error(`Chain not found: ${chainName}`)
  }

  // Get all RPCs (prioritized) and explorer
  const rpcUrls = getAllRpcUrls(selectedChain)
  const explorerUrl = getBestExplorer(selectedChain)

  console.log(chalk.green(`\n✓ Selected: ${chalk.bold(selectedChain.name)}`))
  console.log(chalk.gray(`  Chain ID: ${selectedChain.chainId}`))
  console.log(chalk.gray(`  Primary RPC: ${rpcUrls[0]}`))
  console.log(chalk.gray(`  Fallback RPCs: ${rpcUrls.length - 1}`))
  if (explorerUrl) {
    console.log(chalk.gray(`  Explorer: ${explorerUrl}`))
  }
  console.log()

  return {
    chain: selectedChain,
    rpcUrls,
    explorerUrl,
  }
}

/**
 * Gets chain by name/id without interaction
 * Returns all RPCs for fallback
 */
export async function getChainByName(name: string): Promise<ChainSelection> {
  const allChains = await getChains()
  const results = searchChains(allChains, name)

  if (results.length === 0) {
    throw new Error(`Chain not found: ${name}`)
  }

  // If multiple results, try to find exact match
  let selectedChain = results[0]

  if (results.length > 1) {
    const exactMatch = results.find(
      (chain) =>
        chain.name.toLowerCase() === name.toLowerCase() ||
        chain.shortName.toLowerCase() === name.toLowerCase() ||
        chain.chainSlug?.toLowerCase() === name.toLowerCase() ||
        chain.chainId.toString() === name,
    )

    if (exactMatch) {
      selectedChain = exactMatch
    }
  }

  const rpcUrls = getAllRpcUrls(selectedChain)
  const explorerUrl = getBestExplorer(selectedChain)

  return {
    chain: selectedChain,
    rpcUrls,
    explorerUrl,
  }
}
