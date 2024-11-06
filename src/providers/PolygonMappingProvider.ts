import axios from 'axios'
import { MappingProvider } from './MappingProvider'
import {
  PolygonMappedTokenData,
  PolygonTokenListResponse,
  PolygonWrappedToken,
} from '../constants/types'

const url =
  'https://api-polygon-tokens.polygon.technology/tokenlists/mapped.tokenlist.json'

const POS_BRIDGE_TAG = 'pos'

/**
 *
 * This provider provides the l1->l2(Polygon) token mappings.
 */
export class PolygonMappingProvider implements MappingProvider {
  async provide(): Promise<PolygonMappedTokenData> {
    const response = await axios.get<PolygonTokenListResponse>(url)
    const tokens: PolygonMappedTokenData = {}

    for (const token of response.data.tokens) {
      const posToken = token.wrappedTokens.find(
        (wrapped: PolygonWrappedToken) => wrapped.tags.includes(POS_BRIDGE_TAG)
      )

      if (posToken) {
        tokens[token.originTokenAddress.toLowerCase()] = {
          rootToken: token.originTokenAddress,
          childToken: posToken.wrappedTokenAddress,
          isPos: true,
        }
      }
    }
    return tokens
  }
}
