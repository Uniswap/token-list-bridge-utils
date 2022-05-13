import axios from 'axios'
import { MappingProvider } from './MappingProvider'
import { PolygonMappedTokenData } from '../constants/types'

const url = 'https://tokenmapper.api.matic.today/api/v1/mapping?'
const params = 'map_type=[%22POS%22]&chain_id=137&limit=200&offset='

/**
 * The Polygon team manually maintains the mapping via user submissions at
 * https://mapper.polygon.technology.
 *
 * This provider provides the l1->l2(Polygon) token mappings.
 */
export class PolygonMappingProvider implements MappingProvider {
  async provide(): Promise<PolygonMappedTokenData> {
    let offset = 0
    const tokens: PolygonMappedTokenData = {}
    while (true) {
      const response = await axios.get(`${url}${params}${offset}`)

      if (response.data.message === 'success') {
        for (const token of response.data.data.mapping) {
          tokens[token.root_token.toLowerCase()] = token
        }

        if (response.data.data.has_next_page === true) {
          offset += 200
          continue
        }
      }
      break
    }
    return tokens
  }
}
