import { parseParams } from '../src/lib/parseParams'

describe('parseParams', () => {
  it('should preserve hex strings', () => {
    const result = parseParams(['0x1234567890abcdef'])
    expect(result[0]).toBe('0x1234567890abcdef')
  })

  it('should parse arrays', () => {
    const result = parseParams(['[1,2,3]'])
    expect(result[0]).toEqual([1, 2, 3])
  })

  it('should parse booleans', () => {
    const result = parseParams(['true', 'false'])
    expect(result[0]).toBe(true)
    expect(result[1]).toBe(false)
  })

  it('should handle regular strings', () => {
    const result = parseParams(['hello', 'world'])
    expect(result[0]).toBe('hello')
    expect(result[1]).toBe('world')
  })

  it('should keep numbers as strings', () => {
    const result = parseParams(['123', '456'])
    expect(result[0]).toBe('123')
    expect(result[1]).toBe('456')
  })

  it('should throw error on invalid array', () => {
    expect(() => parseParams(['[invalid]'])).toThrow('Invalid array format')
  })
})
