import { ChainId } from './chainId'

/**
 * Tokens to exclude from being added to the token list.
 * Key: chainId, Value: Set of lowercase token addresses to exclude on that chain
 */
export const EXCLUDED_TOKENS: { [chainId: number]: Set<string> } = {
  [ChainId.ARBITRUM_ONE]: new Set([
    '0xfeb4dfc8c4cf7ed305bb08065d08ec6ee6728429',
  ]),
  [ChainId.POLYGON]: new Set([
    '0x553d3d295e0f695b9228246232edf400ed3560b5',
  ]),
  [ChainId.UNICHAIN]: new Set([
    '0x89f7c0870794103744c8042630cc1c846a858e57',
  ]),
}

/**
 * Check if a token address should be excluded on a given chain
 */
export function isTokenExcluded(
  chainId: number,
  tokenAddress: string
): boolean {
  const excludedSet = EXCLUDED_TOKENS[chainId]
  if (!excludedSet) return false
  return excludedSet.has(tokenAddress.toLowerCase())
}
