import { PolygonMappedTokenData } from '../constants/types'

export interface MappingProvider {
  provide(): Promise<
    PolygonMappedTokenData | { [key: string]: string | undefined }
  >
}
