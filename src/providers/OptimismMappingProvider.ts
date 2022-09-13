import { MappingProvider } from './MappingProvider'
import { ChainId } from '../constants/chainId'
import { getTokenList } from '../utils'
import { GenericMappedTokenData } from '../constants/types'

const optimismTokenListURL =
  'https://raw.githubusercontent.com/' +
  'ethereum-optimism/ethereum-optimism.github.io/2138386277e4156d159615d1840882cecc398437/optimism.tokenlist.json'

/**
 * The Optimism L2 mapping (linked above) is manually maintained by the Optimism team.
 *
 * This provider provides the l1->l2(Optimism) token mappings.
 */
export class OptimismMappingProvider implements MappingProvider {
  async provide(): Promise<GenericMappedTokenData> {
    const tokens: { [key: string]: string | undefined } = {}

    let optimismTokens = await getTokenList(optimismTokenListURL)

    for (const token of optimismTokens.tokens) {
      if (token.chainId === ChainId.MAINNET) {
        tokens[token.address.toLowerCase()] =
          token?.extensions?.bridgeInfo![ChainId.OPTIMISM].tokenAddress
      }
    }

    return tokens
  }
}
