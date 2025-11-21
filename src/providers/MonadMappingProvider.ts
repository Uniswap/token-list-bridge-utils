import { MappingProvider } from './MappingProvider'
import { MappedTokenData } from '../constants/types'
import monadMappings from '../local_mappings/monad.json'

// we use a local source of mappings for monad
export class MonadMappingProvider implements MappingProvider {
  async provide(): Promise<MappedTokenData> {
    const tokens = monadMappings as MappedTokenData
    return tokens
  }
}
