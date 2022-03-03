import {
  arbedSampleTokenList,
  polygonedSampleTokenList,
  sampleL1TokenList,
} from './fixtures'
import { verifyExtensions } from './verify'

describe(verifyExtensions, () => {
  it('passes list without extensions', () => {
    expect(verifyExtensions(sampleL1TokenList)).toBe(sampleL1TokenList)
  })

  it('passes a list with extensions', () => {
    expect(verifyExtensions(polygonedSampleTokenList)).toBe(
      polygonedSampleTokenList
    )
    expect(verifyExtensions(arbedSampleTokenList)).toBe(arbedSampleTokenList)
  })
})
