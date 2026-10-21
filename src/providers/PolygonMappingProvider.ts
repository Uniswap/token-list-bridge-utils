import { MappingProvider } from './MappingProvider'
import { PolygonMappedTokenData } from '../constants/types'
import polygonMappings from '../local_mappings/polygon.json'

// Polygon shut down its mapped token list API, so we use a snapshot of its PoS mappings
export class PolygonMappingProvider implements MappingProvider {
  async provide(): Promise<PolygonMappedTokenData> {
    return polygonMappings as PolygonMappedTokenData
  }
}
