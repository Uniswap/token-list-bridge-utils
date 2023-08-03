import { MappingProvider } from './MappingProvider'
import { ChainId } from '../constants/chainId'
import { getTokenList } from '../utils'
import { GenericMappedTokenData } from '../constants/types'

const baseGoerliTokenListURL =
  'https://raw.githubusercontent.com/' +
  'ethereum-optimism/ethereum-optimism.github.io/master/optimism.tokenlist.json'

/**
 * The Base Goerli mapping (linked above) is manually maintained by the Coinbase team
 * in this repository: https://github.com/ethereum-optimism/ethereum-optimism.github.io.
 */
export class BaseGoerliMappingProvider implements MappingProvider {
  async provide(): Promise<GenericMappedTokenData> {
    const tokens: { [key: string]: string | undefined } = {}

    let allTokens = await getTokenList(baseGoerliTokenListURL)

    let opTokenId_baseGoerliAddressMap: Record<string, string> = {}
    allTokens.tokens.forEach((token) => {
      if (token.chainId === ChainId.BASE_GOERLI) {
        if (typeof token.extensions?.opTokenId === 'string') {
          opTokenId_baseGoerliAddressMap[token.extensions.opTokenId] =
            token.address
        }
      }
    })

    allTokens.tokens.forEach((token) => {
      if (
        token.chainId === ChainId.MAINNET &&
        typeof token.extensions?.opTokenId === 'string' &&
        token.extensions!.opTokenId in opTokenId_baseGoerliAddressMap
      ) {
        tokens[token.address.toLowerCase()] =
          opTokenId_baseGoerliAddressMap[token.extensions!.opTokenId]
      }
    })

    return tokens
  }
}
