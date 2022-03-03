import { TokenInfo, TokenList } from '@uniswap/token-lists'
import axios from 'axios'
import { compareTokenInfos } from '../utils'
import { MappingProvider } from './MappingProvider'

interface PolygonMappedToken {
  chainId: number
  child_address_passed_by_user: boolean
  child_token: string
  count: number
  created_at: string
  decimals: number
  deleted: boolean
  id: number
  map_type: 'POS'
  mintable: boolean
  name: string
  new_child_token: string
  new_mintable: boolean
  owner: string
  reason: string
  reason_for_remapping: string
  remapping_allowed: boolean
  remapping_request_submitted: boolean
  remapping_verified: boolean
  root_token: string
  status: number
  symbol: string
  token_type: string // ERC20
  updated_at: string
  uri: string
}

type PolygonMappedTokenData = { [key: string]: PolygonMappedToken }

/**
 * The Polygon team manually maintains the mapping via user submissions at
 * https://mapper.polygon.technology.
 */
export class PolygonMappingProvider implements MappingProvider {
  async provide(l1TokenList: TokenList): Promise<TokenList> {
    const polygonTokens = await fetchPolygonMappedTokens()

    const mappedTokens = []
    for (const rootToken of l1TokenList.tokens) {
      const childToken = polygonTokens[rootToken.address.toLowerCase()]
      const childTokenValid = Boolean(childToken && !childToken.deleted)

      // build extension info if available
      const toRootExtensions = childTokenValid
        ? {
            extensions: {
              bridgeInfo: {
                [rootToken.chainId]: {
                  tokenAddress: childToken.root_token,
                },
              },
            },
          }
        : {}
      const toChildExtensions = childTokenValid
        ? {
            extensions: {
              bridgeInfo: {
                [childToken.chainId]: {
                  tokenAddress: childToken.child_token,
                },
              },
            },
          }
        : {}

      const rootTokenInfo: TokenInfo = {
        ...rootToken,
        ...toChildExtensions,
      } as unknown as TokenInfo

      const childTokenInfo: TokenInfo = {
        ...rootToken,
        chainId: childToken.chainId,
        name: childToken.name ?? rootToken.name,
        symbol: childToken.symbol ?? rootToken.symbol,
        address: childToken.child_token,
        ...toRootExtensions,
      } as unknown as TokenInfo

      mappedTokens.push(rootTokenInfo)
      mappedTokens.push(childTokenInfo)
    }

    const tokenList = {
      name: `Polygon ${l1TokenList.name}`,
      timestamp: new Date().toISOString(),
      version: l1TokenList.version,
      tokens: mappedTokens.sort(compareTokenInfos),
    }

    return tokenList
  }
}

const url = 'https://tokenmapper.api.matic.today/api/v1/mapping?'
const params = 'map_type=[%22POS%22]&chain_id=137&limit=200&offset='

async function fetchPolygonMappedTokens(): Promise<PolygonMappedTokenData> {
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
