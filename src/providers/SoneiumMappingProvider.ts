import { MappingProvider } from './MappingProvider'
import { MappedTokenData } from '../constants/types'
import soneiumMappings from '../local_mappings/soneium.json'

// we use a local source of mappings for soneium
export class SoneiumMappingProvider implements MappingProvider {
  async provide(): Promise<MappedTokenData> {
    const tokens = soneiumMappings as MappedTokenData
    return tokens
  }
}
