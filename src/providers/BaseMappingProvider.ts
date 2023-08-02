import { MappingProvider } from './MappingProvider'
import { ChainId } from '../constants/chainId'
import { getTokenList } from '../utils'
import { GenericMappedTokenData } from '../constants/types'

const baseGoerliTokenListURL =
  'https://raw.githubusercontent.com/' +
  'ethereum-optimism/ethereum-optimism.github.io/master/optimism.tokenlist.json'

/**
 * The Base mapping (linked above) is manually maintained by the Coinbase team
 * in this repository: https://github.com/ethereum-optimism/ethereum-optimism.github.io.
 */
export class BaseMappingProvider implements MappingProvider {
  async provide(): Promise<GenericMappedTokenData> {
    const tokens: { [key: string]: string | undefined } = {}

    let allTokens = await getTokenList(baseGoerliTokenListURL)

    let opTokenId_baseAddressMap = {}
    allTokens.tokens.forEach((token) => {
      if (token.chainId === ChainId.BASE) {
        if (typeof token.extensions?.opTokenId === 'string') {
          opTokenId_baseAddressMap[token.extensions.opTokenId] =
            token.address
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
