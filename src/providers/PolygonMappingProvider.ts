import axios from 'axios'
import { MappingProvider } from './MappingProvider'
import { PolygonMappedTokenData } from '../constants/types'

// called from https://mapper.polygon.technology
const url =
  'https://api-polygon-tokens.polygon.technology/api/v1/info/all-mappings'
const access_token = '504afd90-3228-4df9-9d88-9b4d70646101'

/**
 * The Polygon team manually maintains the mapping via user submissions at
 * https://mapper.polygon.technology.
 *
 * This provider provides the l1->l2(Polygon) token mappings.
 */
export class PolygonMappingProvider implements MappingProvider {
  async provide(): Promise<PolygonMappedTokenData> {
    const response = await axios.get(url, {
      headers: { 'x-access-token': access_token },
    })
    const tokens: PolygonMappedTokenData = {}

    for (const token of response.data) {
      if (token.isPos) {
        tokens[token.rootToken.toLowerCase()] = token
      }
    }
    return tokens
  }
}
