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

// Polygon has its own type here since its mappings carry more info than just the mapped token address
export type PolygonMappedTokenData = { [key: string]: PolygonMappedToken }

export type MappedTokenData = { [key: string]: MappedToken }
