import { TokenList } from '@uniswap/token-lists'
import { cloneDeep, groupBy, merge } from 'lodash'
import { ChainId } from './constants/chainId'
import { getMappingProvider } from './providers'
import {
  compareTokenInfos,
  getTokenList,
  TokenListOrFetchableTokenList
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

  const optimisimed = await chainifyTokenList(
    ChainId.OPTIMISM,
    l1TokenListOrPathOrUrl
  )
  const polygoned = await chainifyTokenList(
    ChainId.POLYGON,
    l1TokenListOrPathOrUrl
  )
  const arbified = await chainifyTokenList(
    ChainId.ARBITRUM_ONE,
    l1TokenListOrPathOrUrl
  )

  return mergeTokenLists(
    l1TokenList, // providing l1 first to make sure duplicated tokens resolve to this list
    mergeTokenLists(mergeTokenLists(arbified, optimisimed), polygoned)
  )
}

/**
 * Given a network and a TokenList, returns the TokenList with `extensions` filled.
 * @param chainId chainId to operate on
 * @param l1TokenListOrPathOrUrl either an L1 TokenList object or a path/url to a TokenList
 * @returns L1 TokenList with `extensions` filled for the given network
 */
export async function chainifyTokenList(
  chainId: ChainId,
  l1TokenListOrPathOrUrl: TokenListOrFetchableTokenList
): Promise<TokenList> {
  try {
    const tokenList = await getMappingProvider(chainId).provide(
      await getTokenList(l1TokenListOrPathOrUrl)
    )
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
    if (merged.extensions?.bridgeInfo) {
      // remove reference to self-chain from merge
      // @ts-expect-error TokenList schema doesn't yet define objects
      delete merged.extensions.bridgeInfo[merged.chainId]
    }
    return merged
  })

  return cloneDeep({
    ...primary,
    tokens: merged.sort(compareTokenInfos),
  })
}