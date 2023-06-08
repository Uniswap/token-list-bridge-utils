import { MappingProvider } from './MappingProvider'
import { MappedTokenData } from '../constants/types'
import bnbmappings from '../local_mappings/bnb.json'

// barring a better external source, we use a local source of mappings for avalanche
export class AvalancheMappingProvider implements MappingProvider {
  async provide(): Promise<MappedTokenData> {
    const tokens = bnbmappings as MappedTokenData
    return tokens
  }
}
