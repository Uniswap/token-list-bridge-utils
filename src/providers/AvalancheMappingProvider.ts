import { MappingProvider } from './MappingProvider'
import { MappedTokenData } from '../constants/types'
import avaxMappings from '../local_mappings/avax.json'

// barring a better external source, we use a local source of mappings for avalanche
export class AvalancheMappingProvider implements MappingProvider {
  async provide(): Promise<MappedTokenData> {
    const tokens = avaxMappings as MappedTokenData
    return tokens
  }
}
