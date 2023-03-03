import { MappingProvider } from './MappingProvider'
import { BnbMappedTokenData, GenericMappedTokenData } from '../constants/types'
import bnbmappings from '../local_mappings/bnb.json'

// barring a better external source, we use a local source of mappings for bnb
export class BnbMappingProvider implements MappingProvider {
  async provide(): Promise<BnbMappedTokenData> {
    const tokens = bnbmappings as BnbMappedTokenData
    return tokens
  }
}
