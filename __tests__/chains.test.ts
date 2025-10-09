import { isValidChain, getChainConfig, AVAILABLE_CHAINS } from '../src/config/chains'

describe('Chain validation', () => {
  it('should validate correct chain names', () => {
    expect(isValidChain('ethereum')).toBe(true)
    expect(isValidChain('polygon')).toBe(true)
    expect(isValidChain('syscoin')).toBe(true)
  })

  it('should reject invalid chain names', () => {
    expect(isValidChain('invalid')).toBe(false)
    expect(isValidChain('Bitcoin')).toBe(false)
    expect(isValidChain('')).toBe(false)
  })

  it('should return chain config for valid chains', () => {
    const config = getChainConfig('ethereum')
    expect(config).toHaveProperty('rpcUrl')
    expect(config).toHaveProperty('explorer')
  })

  it('should throw error for invalid chains', () => {
    expect(() => getChainConfig('invalid' as any)).toThrow('Invalid chain')
  })

  it('should have all required chains', () => {
    const requiredChains = ['ethereum', 'polygon', 'syscoin']
    requiredChains.forEach((chain) => {
      expect(AVAILABLE_CHAINS).toContain(chain)
    })
  })
})
