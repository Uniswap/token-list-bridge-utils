import { TokenList } from '@uniswap/token-lists'

export interface MappingProvider {
  provide(l1TokenList: TokenList): Promise<TokenList>
}
