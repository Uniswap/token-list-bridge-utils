import { TokenList } from '@uniswap/token-lists'

/**
 * Verifies that for each token with extensions.bridgeInfo defined, for every
 * chainId there exists a token with that chainId at the root-level of the
 * token list.
 *
 * @returns input TokenList if valid, throws otherwise
 */
export function verifyExtensions(tokenList: TokenList) {
  for (const token of tokenList.tokens) {
    if (!token.extensions?.bridgeInfo) continue

    // if has extension, make sure that:
    // 1/ other token has root-level entry
    // 2/ other root entry has extension pointing to it
    for (const destChainId of Object.keys(token.extensions.bridgeInfo)) {
      const destTokens = tokenList.tokens.filter(
        (t) =>
          t.chainId === Number(destChainId) &&
          t.address ===
            // @ts-expect-error TokenList schema does not allow bridgeInfo objetcs yet
            token.extensions.bridgeInfo[destChainId].tokenAddress
      )

      if (destTokens.length > 1) {
        throw new Error(
          `TokenList has duplicate root-level tokens for ${token.symbol} ${token.chainId}`
        )
      }

      const destToken = destTokens[0]

      if (!destToken) {
        throw new Error(
          `TokenList is missing root-level TokenInfo for ${token.symbol} ${token.chainId}`
        )
      }

      // ensure destToken has an extension pointing back to this
      const srcToken: { tokenAddress: string } | undefined =
        // @ts-expect-error TokenList schema does not allow bridgeInfo objects yet
        destToken.extensions?.bridgeInfo[token.chainId]

      if (!srcToken) {
        throw new Error(
          `TokenList is missing root-level TokenInfo.extensions.bridgeInfo for ${token.symbol} ${token.chainId}`
        )
      }

      if (srcToken.tokenAddress !== token.address) {
        throw new Error(
          `TokenList has invalid root-level TokenInfo.extensions.bridgeInfo for ${token.symbol} ${token.chainId}. Expected ${token.address} but got ${srcToken.tokenAddress}`
        )
      }
    }
  }

  return tokenList
}
