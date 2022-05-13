import { TokenInfo } from '@uniswap/token-lists'
import { chainify, chainifyTokenList, mergeTokenLists } from '.'
import { ChainId } from './constants/chainId'
import {
  DAI,
  DAI_ARBITRUM_ONE,
  DAI_OPTIMISM,
  DAI_POLYGON,
} from './constants/tokens'
import {
  arbedSampleTokenList,
  polygonedSampleTokenList,
  sampleL1TokenList,
  Tokens,
} from './fixtures'

jest.setTimeout(10000)

describe(chainifyTokenList, () => {
  it('no-ops on Optimism', async () => {
    const tokenList = await chainifyTokenList(
      ChainId.ARBITRUM_ONE,
      sampleL1TokenList
    )

    expect(tokenList).toEqual(tokenList)
  })

  it('outputs arbitrum list correctly', async () => {
    const tokenList = await chainifyTokenList(
      ChainId.ARBITRUM_ONE,
      sampleL1TokenList
    )

    expect(tokenList).not.toBeUndefined()
    expect(tokenList?.version).toEqual(arbedSampleTokenList.version)
    expect(
      tokenList?.tokens.map((t) => [
        t.address.toLowerCase(),
        t.chainId,
        JSON.parse(JSON.stringify(t.extensions).toLowerCase()),
      ])
    ).toEqual(
      // ignores other metadata
      arbedSampleTokenList.tokens.map((t) => [
        t.address.toLowerCase(),
        t.chainId,
        JSON.parse(JSON.stringify(t.extensions).toLowerCase()),
      ])
    )
  })

  it('outputs polygon list correctly', async () => {
    const tokenList = await chainifyTokenList(
      ChainId.POLYGON,
      sampleL1TokenList
    )

    expect(tokenList).toBeDefined()
    expect(tokenList?.version).toEqual(polygonedSampleTokenList.version)
    expect(
      tokenList?.tokens.map((t) => [t.address, t.chainId, t.extensions])
    ).toEqual(
      // ignores other metadata
      polygonedSampleTokenList.tokens.map((t) => [
        t.address,
        t.chainId,
        t.extensions,
      ])
    )
  })
})

describe(mergeTokenLists, () => {
  it('correctly deduplicates', () => {
    const merged = mergeTokenLists(sampleL1TokenList, sampleL1TokenList)

    expect(merged).toEqual(sampleL1TokenList)
  })

  it('deduplicates with address case insensitivity', () => {
    const allUpper = JSON.parse(JSON.stringify(sampleL1TokenList))
    allUpper.tokens = allUpper.tokens.map((t: TokenInfo) => ({
      ...t,
      address: t.address.toUpperCase(),
    }))

    const mergedLeft = mergeTokenLists(sampleL1TokenList, allUpper)
    expect(mergedLeft).toEqual(sampleL1TokenList)

    // should prefer the first provided token list
    const mergedRight = mergeTokenLists(allUpper, sampleL1TokenList)
    expect(mergedRight).not.toEqual(sampleL1TokenList)
    expect(mergedRight).toEqual(allUpper)
  })

  it('correctly merges multiple lists', () => {
    const withPolygon = mergeTokenLists(
      sampleL1TokenList,
      polygonedSampleTokenList
    )
    const plusArbitrum = mergeTokenLists(withPolygon, arbedSampleTokenList)

    expect(withPolygon.tokens).toEqual([
      {
        ...Tokens[ChainId.MAINNET]!.DAI,
        extensions: {
          bridgeInfo: {
            [ChainId.POLYGON]: {
              tokenAddress: DAI_POLYGON.address,
            },
          },
        },
      },
      {
        ...Tokens[ChainId.POLYGON]!.DAI,
        extensions: {
          bridgeInfo: {
            [ChainId.MAINNET]: {
              tokenAddress: DAI.address,
            },
          },
        },
      },
    ])

    expect(plusArbitrum.tokens).toEqual([
      {
        ...Tokens[ChainId.MAINNET]!.DAI,
        extensions: {
          bridgeInfo: {
            [ChainId.POLYGON]: {
              tokenAddress: DAI_POLYGON.address,
            },
            [ChainId.ARBITRUM_ONE]: {
              tokenAddress: DAI_ARBITRUM_ONE.address,
              // destBridgeAddress: arbBridgeL2Address,
              // originBridgeAddress: arbBridgeL1Address,
            },
          },
        },
      },
      {
        ...Tokens[ChainId.POLYGON]!.DAI,
        extensions: {
          bridgeInfo: {
            [ChainId.MAINNET]: {
              tokenAddress: DAI.address,
            },
          },
        },
      },
      {
        ...Tokens[ChainId.ARBITRUM_ONE]!.DAI,
        extensions: {
          bridgeInfo: {
            [ChainId.MAINNET]: {
              tokenAddress: DAI.address,
              // originBridgeAddress: arbBridgeL2Address,
              // destBridgeAddress: arbBridgeL1Address,
            },
          },
        },
      },
    ])
  })
})

describe(chainify, () => {
  it('provides bridge extensions', async () => {
    const chainified = await chainify(sampleL1TokenList)

    expect(chainified.tokens).toEqual([
      {
        ...Tokens[ChainId.MAINNET]!.DAI,
        extensions: {
          bridgeInfo: {
            [ChainId.OPTIMISM]: {
              tokenAddress: DAI_OPTIMISM.address,
            },
            [ChainId.POLYGON]: {
              tokenAddress: DAI_POLYGON.address,
            },
            [ChainId.ARBITRUM_ONE]: {
              tokenAddress: DAI_ARBITRUM_ONE.address,
              // destBridgeAddress: arbBridgeL2Address,
              // originBridgeAddress: arbBridgeL1Address,
            },
          },
        },
      },
      {
        ...Tokens[ChainId.OPTIMISM]!.DAI,
        name: 'Dai Stablecoin',
        extensions: {
          bridgeInfo: {
            [ChainId.MAINNET]: {
              tokenAddress: DAI.address,
            },
          },
        },
      },
      {
        ...Tokens[ChainId.POLYGON]!.DAI,
        extensions: {
          bridgeInfo: {
            [ChainId.MAINNET]: {
              tokenAddress: DAI.address,
            },
          },
        },
      },
      {
        ...Tokens[ChainId.ARBITRUM_ONE]!.DAI,
        extensions: {
          bridgeInfo: {
            [ChainId.MAINNET]: {
              tokenAddress: DAI.address,
              // originBridgeAddress: arbBridgeL2Address,
              // destBridgeAddress: arbBridgeL1Address,
            },
          },
        },
        name: 'Dai Stablecoin',
      },
    ])
  })
})
