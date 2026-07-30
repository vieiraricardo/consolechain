// chalk v5 is ESM-only and can't be loaded by ts-jest (CommonJS). searchChains
// is pure and doesn't use chalk, so a passthrough mock lets the module load.
jest.mock('chalk', () => {
  const passthrough = (s: unknown) => s
  return { __esModule: true, default: new Proxy(passthrough, { get: () => passthrough }) }
})

import { searchChains } from '../src/lib/chainlist'
import { ChainlistChain } from '../src/types'

const testChains: ChainlistChain[] = [
  {
    name: 'Ethereum Mainnet',
    chain: 'ETH',
    rpc: ['https://rpc.ankr.com/eth'],
    faucets: [],
    nativeCurrency: { name: 'Ether', symbol: 'ETH', decimals: 18 },
    shortName: 'eth',
    chainId: 1,
    networkId: 1,
    chainSlug: 'ethereum',
  },
  {
    name: 'Polygon Mainnet',
    chain: 'Polygon',
    rpc: ['https://polygon-rpc.com'],
    faucets: [],
    nativeCurrency: { name: 'MATIC', symbol: 'MATIC', decimals: 18 },
    shortName: 'matic',
    chainId: 137,
    networkId: 137,
    chainSlug: 'polygon',
  },
]

describe('searchChains', () => {
  it('matches by numeric chain id when gluegun passes a number', () => {
    // gluegun's parameters.first returns a number at runtime for numeric CLI
    // args (e.g. `consolechain list-chains 137`), even though it is typed as
    // string. searchChains must tolerate that.
    const result = searchChains(testChains, 137)

    expect(result).toHaveLength(1)
    expect(result[0].chainId).toBe(137)
  })

  it('matches by case-insensitive name substring', () => {
    const result = searchChains(testChains, 'poly')

    expect(result).toHaveLength(1)
    expect(result[0].shortName).toBe('matic')
  })
})
