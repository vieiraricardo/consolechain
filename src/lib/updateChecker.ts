import { existsSync, readFileSync } from 'fs'
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
    const pkg = JSON.parse(readFileSync(resolve(__dirname, '../../package.json'), 'utf8'))
    return pkg.version
  } catch {
    return '0.0.0'
  }
}

export function semverGreaterThan(a: string, b: string): boolean {
  const pa = a.split('.').map((n) => Number(n))
  const pb = b.split('.').map((n) => Number(n))
  if (pa.length !== 3 || pb.length !== 3) return false
  if (pa.some((n) => Number.isNaN(n)) || pb.some((n) => Number.isNaN(n))) return false
  for (let i = 0; i < 3; i++) {
    if (pa[i] > pb[i]) return true
    if (pa[i] < pb[i]) return false
  }
  return false
}

export function isUpdateAvailable(current: string, latest: string | null): boolean {
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

export const DEFAULTS = {
  registryUrl: REGISTRY_URL,
  cachePath: CACHE_PATH,
  intervalMs: INTERVAL_MS,
  timeoutMs: TIMEOUT_MS,
  pkgName: 'consolechain',
}
