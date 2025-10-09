import { GluegunToolbox } from 'gluegun'

export type ChainName =
  | 'ethereum'
  | 'goerli'
  | 'polygon'
  | 'mumbai'
  | 'syscoin'
  | 'bedrock'
  | 'rollux'

export type StandardType = '20' | '721' | '1155'

export interface ChainConfig {
  rpcUrl: string
  explorer: string
}

export interface Config {
  privateKey?: string
}

export interface ConsoleOptions {
  chain?: string
  c?: string
  rpc?: string
  r?: string
  standard?: StandardType
  s?: StandardType
  abi?: string
  interactive?: boolean
  i?: boolean
}

export type ConsoleChainToolbox = GluegunToolbox

// Chainlist.org types
export interface ChainlistRpc {
  url: string
  tracking?: string
  isOpenSource?: boolean
}

export interface ChainlistExplorer {
  name: string
  url: string
  standard?: string
  icon?: string
}

export interface ChainlistNativeCurrency {
  name: string
  symbol: string
  decimals: number
}

export interface ChainlistChain {
  name: string
  chain: string
  rpc: (string | ChainlistRpc)[]
  faucets: string[]
  nativeCurrency: ChainlistNativeCurrency
  infoURL?: string
  shortName: string
  chainId: number
  networkId: number
  icon?: string
  explorers?: ChainlistExplorer[]
  status?: string
  tvl?: number
  chainSlug?: string
}

export interface CachedChainData {
  chains: ChainlistChain[]
  timestamp: number
}
