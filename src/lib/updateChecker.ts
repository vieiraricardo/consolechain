import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'fs'
import { homedir } from 'os'
import { resolve } from 'path'

export interface CachedUpdate {
  lastCheck: number
  latestVersion: string
}

export interface CheckOptions {
  currentVersion: string
  pkgName: string
  registryUrl: string
  cachePath: string
  intervalMs: number
  timeoutMs: number
  fetchImpl: typeof fetch
  now: () => number
  log: (msg: string) => void
}

const REGISTRY_URL = 'https://registry.npmjs.org/consolechain/latest'
const CACHE_PATH = resolve(homedir(), '.config', 'consolechain-update.json')
const INTERVAL_MS = 24 * 60 * 60 * 1000
const TIMEOUT_MS = 1500

function getCurrentVersion(): string {
  try {
    const pkg = JSON.parse(
      readFileSync(resolve(__dirname, '../../package.json'), 'utf8'),
    )
    return pkg.version
  } catch {
    return '0.0.0'
  }
}

export function semverGreaterThan(a: string, b: string): boolean {
  const pa = a.split('.').map((n) => Number(n))
  const pb = b.split('.').map((n) => Number(n))
  if (pa.length !== 3 || pb.length !== 3) return false
  if (pa.some((n) => Number.isNaN(n)) || pb.some((n) => Number.isNaN(n)))
    return false
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return true
    if (pa[i] < pb[i]) return false
  }
  return false
}

export function isUpdateAvailable(
  current: string,
  latest: string | null,
): boolean {
  return latest !== null && semverGreaterThan(latest, current)
}

export function isCacheFresh(
  cache: CachedUpdate | null,
  now: number,
  intervalMs: number,
): boolean {
  return cache !== null && now - cache.lastCheck < intervalMs
}

export function formatUpdateNotice(
  current: string,
  latest: string,
  pkgName: string,
): string {
  return `Update available ${current} → ${latest} — run "npm i -g ${pkgName}" to update`
}

export function readCache(cachePath: string): CachedUpdate | null {
  if (!existsSync(cachePath)) return null
  try {
    return JSON.parse(readFileSync(cachePath, 'utf8')) as CachedUpdate
  } catch {
    return null
  }
}

export function writeCache(cachePath: string, cache: CachedUpdate): void {
  try {
    const dir = resolve(cachePath, '..')
    if (!existsSync(dir)) mkdirSync(dir, { recursive: true })
    writeFileSync(cachePath, JSON.stringify(cache), 'utf8')
  } catch {
    // Best-effort; never let cache writes affect the CLI.
  }
}

export async function fetchLatestVersion(
  registryUrl: string,
  timeoutMs: number,
  fetchImpl: typeof fetch = fetch,
): Promise<string | null> {
  const controller = new AbortController()
  const timer = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const response = await fetchImpl(registryUrl, { signal: controller.signal })
    if (!response.ok) return null
    const data: any = await response.json()
    return typeof data.version === 'string' ? data.version : null
  } catch {
    return null
  } finally {
    clearTimeout(timer)
  }
}

export const DEFAULTS = {
  registryUrl: REGISTRY_URL,
  cachePath: CACHE_PATH,
  intervalMs: INTERVAL_MS,
  timeoutMs: TIMEOUT_MS,
  pkgName: 'consolechain',
}

export async function checkForUpdate(
  opts: Partial<CheckOptions> = {},
): Promise<void> {
  try {
    const pkgName = opts.pkgName ?? DEFAULTS.pkgName
    const registryUrl = opts.registryUrl ?? DEFAULTS.registryUrl
    const cachePath = opts.cachePath ?? DEFAULTS.cachePath
    const intervalMs = opts.intervalMs ?? DEFAULTS.intervalMs
    const timeoutMs = opts.timeoutMs ?? DEFAULTS.timeoutMs
    const fetchImpl = opts.fetchImpl ?? fetch
    const now = opts.now ?? (() => Date.now())
    const log = opts.log ?? ((msg: string) => console.error(msg))
    const currentVersionStr = opts.currentVersion ?? getCurrentVersion()

    let latest: string | null = null
    const cache = readCache(cachePath)
    if (isCacheFresh(cache, now(), intervalMs)) {
      latest = cache!.latestVersion
    } else {
      latest = await fetchLatestVersion(registryUrl, timeoutMs, fetchImpl)
      if (latest !== null) {
        writeCache(cachePath, { lastCheck: now(), latestVersion: latest })
      }
    }

    if (isUpdateAvailable(currentVersionStr, latest)) {
      log(formatUpdateNotice(currentVersionStr, latest!, pkgName))
    }
  } catch {
    // Never let the update check affect the CLI.
  }
}
