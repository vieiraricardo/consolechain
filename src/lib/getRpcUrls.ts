import { ChainlistChain, ChainlistRpc } from '../types'

/**
 * Gets all available HTTP RPC URLs from a chain
 * Returns array with prioritized order (best first)
 */
export function getAllRpcUrls(chain: ChainlistChain): string[] {
  if (!chain || !chain.rpc || chain.rpc.length === 0) {
    throw new Error(
      `No RPC endpoints available for ${chain?.name || 'unknown chain'}`
    )
  }

  // Filter out websocket URLs
  const httpRpcs = chain.rpc.filter((rpc) => {
    const url = typeof rpc === 'string' ? rpc : rpc.url
    return url && url.startsWith('http')
  })

  if (httpRpcs.length === 0) {
    throw new Error(`No HTTP RPC endpoints available for ${chain.name}`)
  }

  // Categorize RPCs
  const openSourceRpcs: string[] = []
  const noTrackingRpcs: string[] = []
  const limitedTrackingRpcs: string[] = []
  const otherRpcs: string[] = []

  httpRpcs.forEach((rpc) => {
    const url = typeof rpc === 'string' ? rpc : rpc.url

    if (typeof rpc === 'object') {
      if (rpc.isOpenSource) {
        openSourceRpcs.push(url)
      } else if (rpc.tracking === 'none') {
        noTrackingRpcs.push(url)
      } else if (rpc.tracking === 'limited') {
        limitedTrackingRpcs.push(url)
      } else {
        otherRpcs.push(url)
      }
    } else {
      otherRpcs.push(url)
    }
  })

  // Return prioritized list
  return [
    ...openSourceRpcs,
    ...noTrackingRpcs,
    ...limitedTrackingRpcs,
    ...otherRpcs,
  ]
}
