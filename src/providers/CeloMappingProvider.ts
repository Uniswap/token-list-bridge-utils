import { MappingProvider } from './MappingProvider'
import { MappedTokenData } from '../constants/types'
import celoMappings from '../local_mappings/celo.json'

// barring a better external source, we use a local source of mappings for celo
export class CeloMappingProvider implements MappingProvider {
  async provide(): Promise<MappedTokenData> {
    return celoMappings as MappedTokenData
  }
}
