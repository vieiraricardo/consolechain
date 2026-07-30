import {
  semverGreaterThan,
  isUpdateAvailable,
  isCacheFresh,
  formatUpdateNotice,
  readCache,
  writeCache,
} from '../src/lib/updateChecker'
import { tmpdir } from 'os'
import { resolve } from 'path'
import { readFileSync, writeFileSync, mkdirSync } from 'fs'

const tmpCache = () => resolve(tmpdir(), `cc-update-${process.pid}-${Date.now()}.json`)

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

describe('readCache / writeCache', () => {
  it('returns null when the cache file does not exist', () => {
    expect(readCache(tmpCache())).toBeNull()
  })

  it('returns null when the cache file is corrupt', () => {
    const path = tmpCache()
    writeFileSync(path, '{ not json', 'utf8')
    expect(readCache(path)).toBeNull()
  })

  it('round-trips a written cache', () => {
    const path = tmpCache()
    writeCache(path, { lastCheck: 123, latestVersion: '0.2.3' })
    expect(readCache(path)).toEqual({ lastCheck: 123, latestVersion: '0.2.3' })
  })

  it('writeCache does not throw when the directory is missing', () => {
    const path = resolve(tmpdir(), `no-such-dir-${process.pid}-${Date.now()}`, 'cache.json')
    expect(() => writeCache(path, { lastCheck: 1, latestVersion: '0.2.3' })).not.toThrow()
  })
})

import { fetchLatestVersion } from '../src/lib/updateChecker'

const ok = (body: unknown) => ({ ok: true, json: async () => body })

describe('fetchLatestVersion', () => {
  it('returns the version field on a 200 response', async () => {
    const fetchImpl = async () => ok({ version: '0.2.3' }) as any
    expect(await fetchLatestVersion('https://x', 1000, fetchImpl)).toBe('0.2.3')
  })

  it('returns null on a non-200 response', async () => {
    const fetchImpl = async () => ({ ok: false, status: 500 }) as any
    expect(await fetchLatestVersion('https://x', 1000, fetchImpl)).toBeNull()
  })

  it('returns null when the body has no string version', async () => {
    const fetchImpl = async () => ok({ nope: true }) as any
    expect(await fetchLatestVersion('https://x', 1000, fetchImpl)).toBeNull()
  })

  it('returns null when fetch rejects', async () => {
    const fetchImpl = async () => {
      throw new Error('network down')
    }
    expect(await fetchLatestVersion('https://x', 1000, fetchImpl)).toBeNull()
  })

  it('returns null when the request times out (abort)', async () => {
    // Signal-aware fake fetch: hangs until the abort signal fires (like real fetch),
    // so the AbortController timeout is genuinely exercised. If abort never fired,
    // this promise would never settle and jest would time out.
    const fetchImpl = (_input: any, init?: RequestInit) =>
      new Promise<any>((_, reject) => {
        init?.signal?.addEventListener('abort', () => reject(new Error('aborted')))
      })
    expect(await fetchLatestVersion('https://x', 20, fetchImpl)).toBeNull()
  }, 2000)
})
