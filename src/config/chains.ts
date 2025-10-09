import { ChainName, ChainConfig } from '../types'

export const RPC_URLS: Record<ChainName, string> = {
  ethereum:
    process.env.ETHEREUM_RPC || 'https://mainnet.infura.io/v3/YOUR_INFURA_KEY',
  goerli:
    process.env.GOERLI_RPC || 'https://goerli.infura.io/v3/YOUR_INFURA_KEY',
  polygon: process.env.POLYGON_RPC || 'https://polygon-rpc.com',
  mumbai:
    process.env.MUMBAI_RPC || 'https://polygon-testnet.public.blastapi.io',
  syscoin: process.env.SYSCOIN_RPC || 'https://rpc.syscoin.org',
  bedrock: process.env.BEDROCK_RPC || 'https://rpc-tanenbaum.rollux.com',
  rollux: process.env.ROLLUX_RPC || 'https://rpc.rollux.com',
}

export const EXPLORERS: Record<ChainName, string> = {
  ethereum: 'https://etherscan.io',
  goerli: 'https://goerli.etherscan.io',
  polygon: 'https://polygonscan.com',
  mumbai: 'https://mumbai.polygonscan.com',
  syscoin: 'https://explorer.syscoin.org',
  bedrock: 'https://rollux.tanenbaum.io',
  rollux: 'https://explorer.rollux.com',
}

export const CHAINS: Record<ChainName, ChainConfig> = Object.keys(
  RPC_URLS,
).reduce(
  (acc, chain) => {
    const chainName = chain as ChainName
    acc[chainName] = {
      rpcUrl: RPC_URLS[chainName],
      explorer: EXPLORERS[chainName],
    }
    return acc
  },
  {} as Record<ChainName, ChainConfig>,
)

export const AVAILABLE_CHAINS = Object.keys(CHAINS) as ChainName[]

export function isValidChain(chain: string): chain is ChainName {
  return AVAILABLE_CHAINS.includes(chain as ChainName)
}

export function getChainConfig(chain: ChainName): ChainConfig {
  if (!isValidChain(chain)) {
    throw new Error(
      `Invalid chain: ${chain}. Available chains: ${AVAILABLE_CHAINS.join(', ')}`,
    )
  }
  return CHAINS[chain]
}
