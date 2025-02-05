import { MappingProvider } from './MappingProvider'
import { MappedTokenData } from '../constants/types'
import unichainMappings from '../local_mappings/unichain.json'

// we use a local source of mappings for unichain
export class UnichainMappingProvider implements MappingProvider {
  async provide(): Promise<MappedTokenData> {
    const tokens = unichainMappings as MappedTokenData
    return tokens
  }
}
