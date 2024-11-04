import { TokenList } from '@uniswap/token-lists'
import { cloneDeep, groupBy, merge } from 'lodash'
import { ChainId } from './constants/chainId'
import { buildList } from './providers'
import {
  compareTokenInfos,
  getTokenList,
  TokenListOrFetchableTokenList,
} from './utils'
import { verifyExtensions } from './verify'

/**
 * Adds bridgeInfo to the given token list for Optimism, Polygon and Arbitrum.
 * @param l1TokenListOrPathOrUrl
 * @returns TokenList with l2 bridgeInfo filled
 */
export async function chainify(
  l1TokenListOrPathOrUrl: TokenListOrFetchableTokenList
): Promise<TokenList> {
  const l1TokenList = await getTokenList(l1TokenListOrPathOrUrl)
  const l2Chains = [
    ChainId.POLYGON,
    ChainId.ARBITRUM_ONE,
    ChainId.OPTIMISM,
    ChainId.CELO,
    ChainId.BNB,
    ChainId.AVALANCHE,
    ChainId.BASE,
  ]

  const chainified = await chainifyTokenList(l2Chains, l1TokenListOrPathOrUrl)
  const merged = mergeTokenLists(
    l1TokenList, // providing l1 first to make sure duplicated tokens resolve to this list
    chainified
  )

  return merged
}

/**
 * Given a network and a TokenList, returns the TokenList with `extensions` filled.
 * @param l2ChainIds layer 2 chainIds to operate on
 * @param l1TokenListOrPathOrUrl either an L1 TokenList object or a path/url to a TokenList
 * @returns L1 TokenList with `extensions` filled for the given network
 */
export async function chainifyTokenList(
  l2ChainIds: Array<ChainId>,
  l1TokenListOrPathOrUrl: TokenListOrFetchableTokenList
): Promise<TokenList> {
  try {
    const l1TokenList = await getTokenList(l1TokenListOrPathOrUrl)
    const tokenList = await buildList(l2ChainIds, l1TokenList)
    return verifyExtensions(tokenList)
  } catch (e) {
    throw new Error(`An error occured: ${e}`)
  }
}

/** Merges two token lists, resolving conflicts to primary list. */
export function mergeTokenLists(
  primary: TokenList,
  secondary: TokenList
): TokenList {
  primary = cloneDeep(primary)
  secondary = cloneDeep(secondary)

  const grouped = groupBy(
    [...secondary.tokens, ...primary.tokens],
    (t) => `${t.chainId}-${t.address.toLowerCase()}`
  )

  const merged = Object.values(grouped).map((group) => {
    if (group.length === 1) {
      return group[0]
    }

    const merged = merge(group[0], group[1])
    if (
      merged.extensions?.bridgeInfo &&
      typeof merged.extensions.bridgeInfo === 'object'
    ) {
      // remove reference to self-chain from merge
      delete merged.extensions.bridgeInfo[merged.chainId]
    }
    return merged
  })

  return cloneDeep({
    ...primary,
    tokens: merged.sort(compareTokenInfos),
  })
}
