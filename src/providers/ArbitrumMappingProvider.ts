import { TokenList } from '@uniswap/token-lists'
import { generateTokenList } from '../arb-token-lists/src/lib/token_list_gen'
import { compareTokenInfos } from '../utils'
import { MappingProvider } from './MappingProvider'

/**
 * The Arbitrum team maintains an (unpublished) package to `arbify` an L1
 * token list.
 *
 * The provider simply invokes this package which we host as a submodule.
 */

export class ArbitrumMappingProvider implements MappingProvider {
  async provide(l1TokenList: TokenList): Promise<TokenList> {
    const arbedTokenList = (await generateTokenList(
      l1TokenList,
      /*prevArbTokenList=*/ undefined,
      {
        includeAllL1Tokens: true,
      }
    )) as unknown as TokenList

    return {
      ...arbedTokenList,
      tokens: arbedTokenList.tokens.sort(compareTokenInfos),
    }
  }
}
