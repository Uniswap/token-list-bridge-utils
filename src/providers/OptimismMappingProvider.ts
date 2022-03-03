import { TokenList } from '@uniswap/token-lists'
import { MappingProvider } from './MappingProvider'

/**
 * The Optimism L2 mapping is manually maintained by the Optimism team.
 *
 * This provider mostly no-ops, i.e. grabs the list and returns it.
 */
export class OptimismMappingProvider implements MappingProvider {
  async provide(l1TokenList: TokenList): Promise<TokenList> {
    return l1TokenList
  }
}
