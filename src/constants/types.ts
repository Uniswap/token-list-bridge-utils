export interface PolygonMappedToken {
  rootToken: string
  childToken: string
  isPos?: boolean
}

export interface MappedToken {
  childToken: string
  decimals: number
}

export type GenericMappedTokenData = { [key: string]: string | undefined }

// Polygon has its own type here since their api gives us more info than just the mapped token address
export type PolygonMappedTokenData = { [key: string]: PolygonMappedToken }

export type MappedTokenData = { [key: string]: MappedToken }

export interface PolygonWrappedToken {
  wrappedTokenAddress: string
  wrappedNetworkId?: number
  tags: string[]
  originChainBridgeAdapter?: string
  wrappedChainBridgeAdapter?: string
}

export interface PolygonTokenMapping {
  chainId: number
  name: string
  symbol: string
  decimals: number
  originTokenAddress: string
  originNetworkId: number
  tags: string[]
  wrappedTokens: PolygonWrappedToken[]
  logoURI: string
}

export interface PolygonTokenListResponse {
  name: string
  version: number
  logoURI: string
  description: string
  tags: Record<string, { name: string; description: string }>
  timestamp: string
  tokens: PolygonTokenMapping[]
}
