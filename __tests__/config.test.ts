import { isValidPrivateKey } from '../src/lib/config'

describe('isValidPrivateKey', () => {
  it('should accept valid private key with 0x prefix', () => {
    const validKey = '0x' + 'a'.repeat(64)
    expect(isValidPrivateKey(validKey)).toBe(true)
  })

  it('should accept valid private key without 0x prefix', () => {
    const validKey = 'a'.repeat(64)
    expect(isValidPrivateKey(validKey)).toBe(true)
  })

  it('should reject keys that are too short', () => {
    expect(isValidPrivateKey('0x1234')).toBe(false)
  })

  it('should reject keys that are too long', () => {
    const tooLong = '0x' + 'a'.repeat(65)
    expect(isValidPrivateKey(tooLong)).toBe(false)
  })

  it('should reject keys with invalid characters', () => {
    const invalidKey = '0x' + 'z'.repeat(64)
    expect(isValidPrivateKey(invalidKey)).toBe(false)
  })

  it('should reject empty string', () => {
    expect(isValidPrivateKey('')).toBe(false)
  })
})
