import { MappingProvider } from './MappingProvider'
import { MappedTokenData } from '../constants/types'
import bnbMappings from '../local_mappings/bnb.json'

// barring a better external source, we use a local source of mappings for bnb
export class BnbMappingProvider implements MappingProvider {
  async provide(): Promise<MappedTokenData> {
    const tokens = bnbMappings as MappedTokenData
    return tokens
  }
}
