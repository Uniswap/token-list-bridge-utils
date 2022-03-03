import { TokenInfo, TokenList } from '@uniswap/token-lists'
import { getTokenListObj } from './arb-token-lists/src/lib/utils'

export type TokenListOrFetchableTokenList = TokenList | string

export function compareTokenInfos(t1: TokenInfo, t2: TokenInfo) {
  if (t1.chainId === t2.chainId) {
    return t1.symbol.toLowerCase() < t2.symbol.toLowerCase() ? -1 : 1
  }
  return t1.chainId < t2.chainId ? -1 : 1
}

export async function getTokenList(
  l1TokenListOrPathOrUrl: TokenListOrFetchableTokenList
): Promise<TokenList> {
  if (typeof l1TokenListOrPathOrUrl === 'string') {
    return getTokenListObj(l1TokenListOrPathOrUrl)
  } else {
    return l1TokenListOrPathOrUrl
  }
}
