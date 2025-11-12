import { isTokenExcluded, EXCLUDED_TOKENS } from './excludedTokens'
import { ChainId } from './chainId'

describe('excludedTokens', () => {
  describe('isTokenExcluded', () => {
    it('returns true for excluded tokens on Arbitrum', () => {
      expect(
        isTokenExcluded(
          ChainId.ARBITRUM_ONE,
          '0xfEb4DfC8C4Cf7Ed305bb08065D08eC6ee6728429'
        )
      ).toBe(true)
    })

    it('returns true for excluded tokens on Polygon', () => {
      expect(
        isTokenExcluded(
          ChainId.POLYGON,
          '0x553d3D295e0f695B9228246232eDF400ed3560B5'
        )
      ).toBe(true)
    })

    it('returns true for excluded tokens on Unichain', () => {
      expect(
        isTokenExcluded(
          ChainId.UNICHAIN,
          '0x89f7C0870794103744C8042630CC1C846a858E57'
        )
      ).toBe(true)
    })

    it('is case-insensitive for token addresses', () => {
      expect(
        isTokenExcluded(
          ChainId.ARBITRUM_ONE,
          '0xFEB4DFC8C4CF7ED305BB08065D08EC6EE6728429'
        )
      ).toBe(true)

      expect(
        isTokenExcluded(
          ChainId.POLYGON,
          '0X553D3D295E0F695B9228246232EDF400ED3560B5'
        )
      ).toBe(true)
    })

    it('returns false for non-excluded tokens', () => {
      expect(
        isTokenExcluded(
          ChainId.ARBITRUM_ONE,
          '0x0000000000000000000000000000000000000000'
        )
      ).toBe(false)

      expect(
        isTokenExcluded(
          ChainId.POLYGON,
          '0x0000000000000000000000000000000000000000'
        )
      ).toBe(false)
    })

    it('returns false for chains without exclusions', () => {
      expect(
        isTokenExcluded(
          ChainId.OPTIMISM,
          '0xfEb4DfC8C4Cf7Ed305bb08065D08eC6ee6728429'
        )
      ).toBe(false)

      expect(
        isTokenExcluded(
          ChainId.BASE,
          '0x553d3D295e0f695B9228246232eDF400ed3560B5'
        )
      ).toBe(false)
    })

    it('returns false when excluded token is checked against wrong chain', () => {
      // Arbitrum excluded token checked on Polygon
      expect(
        isTokenExcluded(
          ChainId.POLYGON,
          '0xfEb4DfC8C4Cf7Ed305bb08065D08eC6ee6728429'
        )
      ).toBe(false)

      // Polygon excluded token checked on Arbitrum
      expect(
        isTokenExcluded(
          ChainId.ARBITRUM_ONE,
          '0x553d3D295e0f695B9228246232eDF400ed3560B5'
        )
      ).toBe(false)
    })
  })

  describe('EXCLUDED_TOKENS', () => {
    it('contains the correct chains', () => {
      expect(EXCLUDED_TOKENS[ChainId.ARBITRUM_ONE]).toBeDefined()
      expect(EXCLUDED_TOKENS[ChainId.POLYGON]).toBeDefined()
      expect(EXCLUDED_TOKENS[ChainId.UNICHAIN]).toBeDefined()
    })

    it('stores addresses in lowercase', () => {
      const arbitrumExcluded = Array.from(
        EXCLUDED_TOKENS[ChainId.ARBITRUM_ONE]
      )
      expect(arbitrumExcluded.every((addr) => addr === addr.toLowerCase())).toBe(
        true
      )

      const polygonExcluded = Array.from(EXCLUDED_TOKENS[ChainId.POLYGON])
      expect(polygonExcluded.every((addr) => addr === addr.toLowerCase())).toBe(
        true
      )

      const unichainExcluded = Array.from(EXCLUDED_TOKENS[ChainId.UNICHAIN])
      expect(
        unichainExcluded.every((addr) => addr === addr.toLowerCase())
      ).toBe(true)
    })
  })
})
