import { ChainId } from '../constants/chainId'
import { ArbitrumMappingProvider } from './ArbitrumMappingProvider'
import { OptimismMappingProvider } from './OptimismMappingProvider'
import { PolygonMappingProvider } from './PolygonMappingProvider'
import { TokenInfo, TokenList } from '@uniswap/token-lists'
import { toChecksumAddress } from 'ethereum-checksum-address'
import { compareTokenInfos } from '../utils'

export async function buildList(
  chainId: ChainId,
  l1TokenList: TokenList
): Promise<TokenList> {
  const tokenAddressMap = await getMappingProvider(
    chainId,
    l1TokenList
  ).provide()
  const mappedTokens = []
  for (const rootToken of l1TokenList.tokens) {
    const childToken = tokenAddressMap[rootToken.address.toLowerCase()]
    const childTokenValid = Boolean(
      childToken &&
        (typeof childToken === 'object' ? !childToken.deleted : true)
    )

    if (rootToken.chainId === ChainId.MAINNET) {
      // build extension info if available
      const toRootExtensions = childTokenValid
        ? {
            extensions: {
              bridgeInfo: {
                [rootToken.chainId]: {
                  tokenAddress: toChecksumAddress(rootToken.address),
                },
              },
            },
          }
        : {}

      const toChildExtensions = childTokenValid
        ? {
            extensions: {
              bridgeInfo: {
                [chainId]: {
                  tokenAddress: toChecksumAddress(
                    typeof childToken === 'object'
                      ? childToken.child_token
                      : childToken!
                  ),
                },
              },
            },
          }
        : {}

      const rootTokenInfo: TokenInfo = {
        ...rootToken,
        ...toChildExtensions,
      } as unknown as TokenInfo

      const childTokenInfo: TokenInfo = {
        ...rootToken,
        chainId: chainId,
        address: toChecksumAddress(
          typeof childToken === 'object' ? childToken.child_token : childToken!
        ),
        ...toRootExtensions,
      } as unknown as TokenInfo

      mappedTokens.push(rootTokenInfo)
      if (childTokenValid) {
        mappedTokens.push(childTokenInfo)
      }
    }
  }
  const tokenList = {
    name: `(ChainId: ${chainId}) ${l1TokenList.name}`,
    timestamp: new Date().toISOString(),
    version: l1TokenList.version,
    tokens: mappedTokens.sort(compareTokenInfos),
  }

  return tokenList
}

function getMappingProvider(chainId: ChainId, l1TokenList: TokenList) {
  switch (chainId) {
    case ChainId.ARBITRUM_ONE:
      return new ArbitrumMappingProvider(l1TokenList)
    case ChainId.OPTIMISM:
      return new OptimismMappingProvider()
    case ChainId.POLYGON:
      return new PolygonMappingProvider()
    default:
      throw new Error(`Chain ${chainId} not supported.`)
  }
}
