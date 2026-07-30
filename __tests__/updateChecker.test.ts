import {
  semverGreaterThan,
  isUpdateAvailable,
  isCacheFresh,
  formatUpdateNotice,
} from '../src/lib/updateChecker'

describe('semverGreaterThan', () => {
  it('returns true when first arg is newer', () => {
    expect(semverGreaterThan('0.2.3', '0.2.2')).toBe(true)
    expect(semverGreaterThan('1.0.0', '0.9.9')).toBe(true)
    expect(semverGreaterThan('0.10.0', '0.9.0')).toBe(true)
  })

  it('returns false when equal or older', () => {
    expect(semverGreaterThan('0.2.2', '0.2.2')).toBe(false)
    expect(semverGreaterThan('0.2.1', '0.2.2')).toBe(false)
  })

  it('returns false for malformed input', () => {
    expect(semverGreaterThan('not-a-version', '0.2.2')).toBe(false)
    expect(semverGreaterThan('0.2.2', 'not-a-version')).toBe(false)
  })
})

describe('isUpdateAvailable', () => {
  it('is true only when latest is newer than current', () => {
    expect(isUpdateAvailable('0.2.2', '0.2.3')).toBe(true)
  })

  it('is false when equal, older, or null', () => {
    expect(isUpdateAvailable('0.2.2', '0.2.2')).toBe(false)
    expect(isUpdateAvailable('0.2.2', '0.2.1')).toBe(false)
    expect(isUpdateAvailable('0.2.2', null)).toBe(false)
  })
})

describe('isCacheFresh', () => {
  it('is true when within the interval', () => {
    expect(isCacheFresh({ lastCheck: 999, latestVersion: '0.2.3' }, 1000, 2000)).toBe(true)
  })

  it('is false when stale', () => {
    expect(isCacheFresh({ lastCheck: 0, latestVersion: '0.2.3' }, 3000, 2000)).toBe(false)
  })

  it('is false when cache is null', () => {
    expect(isCacheFresh(null, 1000, 2000)).toBe(false)
  })
})

describe('formatUpdateNotice', () => {
  it('returns the exact one-line notice', () => {
    expect(formatUpdateNotice('0.2.2', '0.2.3', 'consolechain')).toBe(
      'Update available 0.2.2 → 0.2.3 — run "npm i -g consolechain" to update',
    )
  })
})
