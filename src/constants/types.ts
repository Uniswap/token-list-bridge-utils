export interface PolygonMappedToken {
  rootToken: string
  childToken: string
  isPos?: boolean
}

export type GenericMappedTokenData = { [key: string]: string | undefined }

// Polygon has its own type here since their api gives us more info than just the mapped token address
export type PolygonMappedTokenData = { [key: string]: PolygonMappedToken }
