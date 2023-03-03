import {
  BnbMappedTokenData,
  GenericMappedTokenData,
  PolygonMappedTokenData,
} from '../constants/types'

export interface MappingProvider {
  provide(): Promise<
    PolygonMappedTokenData | GenericMappedTokenData | BnbMappedTokenData
  >
}
