import { MappingProvider } from './MappingProvider'
import { GenericMappedTokenData } from '../constants/types'
import bnbmappings from '../local_mappings/bnb.json'

// barring a better external source, we use a local source of mappings for bnb
export class BnbMappingProvider implements MappingProvider {
  async provide(): Promise<GenericMappedTokenData> {
    const tokens = bnbmappings as GenericMappedTokenData
    return tokens
  }
}
