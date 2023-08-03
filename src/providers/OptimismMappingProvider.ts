import { MappingProvider } from './MappingProvider'
import { ChainId } from '../constants/chainId'
import { getTokenList } from '../utils'
import { GenericMappedTokenData } from '../constants/types'

const optimismTokenListURL =
  'https://raw.githubusercontent.com/' +
  'ethereum-optimism/ethereum-optimism.github.io/master/optimism.tokenlist.json'

/**
 * The Optimism L2 mapping (linked above) is manually maintained by the Optimism team.
 *
 * This provider provides the l1->l2(Optimism) token mappings.
 */
export class OptimismMappingProvider implements MappingProvider {
  async provide(): Promise<GenericMappedTokenData> {
    const tokens: { [key: string]: string | undefined } = {}

    let allTokens = await getTokenList(optimismTokenListURL)

    let opTokenId_baseAddressMap: Record<string, string> = {}
    allTokens.tokens.forEach((token) => {
      if (token.chainId === ChainId.OPTIMISM) {
        if (typeof token.extensions?.opTokenId === 'string') {
          opTokenId_baseAddressMap[token.extensions.opTokenId] = token.address
        }
      }
    })

    allTokens.tokens.forEach((token) => {
      if (
        token.chainId === ChainId.MAINNET &&
        typeof token.extensions?.opTokenId === 'string' &&
        token.extensions!.opTokenId in opTokenId_baseAddressMap
      ) {
        tokens[token.address.toLowerCase()] =
          opTokenId_baseAddressMap[token.extensions!.opTokenId]
      }
    })

    return tokens
  }
}
