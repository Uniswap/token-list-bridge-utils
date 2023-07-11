import { TokenInfo } from '@uniswap/token-lists'
import { chainify, chainifyTokenList, mergeTokenLists } from '.'
import { ChainId } from './constants/chainId'
import {
  COINBASE_WRAPPED_STAKED_ETH,
  COINBASE_WRAPPED_STAKED_ETH_ARBITRUM_ONE,
  COINBASE_WRAPPED_STAKED_ETH_BASE_GOERLI,
  DAI,
  DAI_ARBITRUM_ONE,
  DAI_AVALANCHE,
  DAI_BNB,
  DAI_OPTIMISM,
  DAI_POLYGON,
} from './constants/tokens'
import {
  arbedSampleTokenList,
  optimizedSampleTokenList,
  polygonedSampleTokenList,
  bnbedSampleTokenList,
  sampleL1TokenList,
  Tokens,
  sampleL1TokenList_2,
  bnbedSampleTokenList_2,
  avalanchedSampleTokenList,
  sampleL1TokenList_3,
  baseGoerliSampleTokenList_3,
} from './fixtures'

jest.setTimeout(15000)

describe(chainifyTokenList, () => {
  it('outputs Optimism list correctly', async () => {
    const tokenList = await chainifyTokenList(
      [ChainId.OPTIMISM],
      sampleL1TokenList
    )

    expect(tokenList).toBeDefined()
    expect(tokenList?.version).toEqual(polygonedSampleTokenList.version)
    expect(
      tokenList?.tokens.map((t) => [t.address, t.chainId, t.extensions])
    ).toEqual(
      // ignores other metadata
      optimizedSampleTokenList.tokens.map((t) => [
        t.address,
        t.chainId,
        t.extensions,
      ])
    )
  })

  it('outputs arbitrum list correctly', async () => {
    const tokenList = await chainifyTokenList(
      [ChainId.ARBITRUM_ONE],
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
      [ChainId.POLYGON],
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

it('outputs avalanche list correctly', async () => {
  const tokenList = await chainifyTokenList(
    [ChainId.AVALANCHE],
    sampleL1TokenList
  )
  expect(tokenList).toBeDefined()
  expect(tokenList?.version).toEqual(avalanchedSampleTokenList.version)
  expect(
    tokenList?.tokens.map((t) => [t.address, t.chainId, t.extensions])
  ).toEqual(
    // ignores other metadata
    avalanchedSampleTokenList.tokens.map((t) => [
      t.address,
      t.chainId,
      t.extensions,
    ])
  )
})

it('outputs bnb list correctly', async () => {
  const tokenList = await chainifyTokenList([ChainId.BNB], sampleL1TokenList)
  expect(tokenList).toBeDefined()
  expect(tokenList?.version).toEqual(bnbedSampleTokenList.version)
  expect(
    tokenList?.tokens.map((t) => [t.address, t.chainId, t.extensions])
  ).toEqual(
    // ignores other metadata
    bnbedSampleTokenList.tokens.map((t) => [t.address, t.chainId, t.extensions])
  )
})

it('outputs bnb list correctly with different decimals', async () => {
  const tokenList = await chainifyTokenList([ChainId.BNB], sampleL1TokenList_2)
  expect(tokenList).toBeDefined()
  expect(tokenList?.version).toEqual(bnbedSampleTokenList_2.version)
  expect(
    tokenList?.tokens.map((t) => [t.address, t.chainId, t.extensions])
  ).toEqual(
    // ignores other metadata
    bnbedSampleTokenList_2.tokens.map((t) => [
      t.address,
      t.chainId,
      t.extensions,
    ])
  )
})

it('outputs base goerli list correctly', async () => {
  const tokenList = await chainifyTokenList(
    [ChainId.BASE_GOERLI],
    sampleL1TokenList_3
  )
  expect(tokenList).toBeDefined()
  expect(tokenList?.version).toEqual(baseGoerliSampleTokenList_3.version)
  expect(
    tokenList?.tokens.map((t) => [t.address, t.chainId, t.extensions])
  ).toEqual(
    // ignores other metadata
    baseGoerliSampleTokenList_3.tokens.map((t) => [
      t.address,
      t.chainId,
      t.extensions,
    ])
  )
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
  it('creates tokenMap correctly in chainify', async () => {
    const chainified = await chainify(sampleL1TokenList)

    expect(chainified.tokenMap).toEqual({
      '10_0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1': {
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
      '137_0x8f3Cf7ad23Cd3CaDbD9735AFf958023239c6A063': {
        ...Tokens[ChainId.POLYGON]!.DAI,
        extensions: {
          bridgeInfo: {
            [ChainId.MAINNET]: {
              tokenAddress: DAI.address,
            },
          },
        },
      },
      '1_0x6B175474E89094C44Da98b954EedeAC495271d0F': {
        ...Tokens[ChainId.MAINNET]!.DAI,
        extensions: {
          bridgeInfo: {
            [ChainId.BNB]: {
              tokenAddress: DAI_BNB.address,
            },
            [ChainId.AVALANCHE]: {
              tokenAddress: DAI_AVALANCHE.address,
            },
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
      '42161_0xDA10009cBd5D07dd0CeCc66161FC93D7c9000da1': {
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
      '43114_0xd586E7F844cEa2F87f50152665BCbc2C279D8d70': {
        ...Tokens[ChainId.AVALANCHE]!.DAI,
        name: 'Dai Stablecoin',
        symbol: 'DAI',
        extensions: {
          bridgeInfo: {
            [ChainId.MAINNET]: {
              tokenAddress: DAI.address,
            },
          },
        },
      },
      '56_0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3': {
        ...Tokens[ChainId.BNB]!.DAI,
        extensions: {
          bridgeInfo: {
            [ChainId.MAINNET]: {
              tokenAddress: DAI.address,
            },
          },
        },
      },
    })
  })

  it('provides bridge extensions', async () => {
    const chainified = await chainify(sampleL1TokenList)

    expect(chainified.tokens).toEqual([
      {
        ...Tokens[ChainId.MAINNET]!.DAI,
        extensions: {
          bridgeInfo: {
            [ChainId.BNB]: {
              tokenAddress: DAI_BNB.address,
            },
            [ChainId.AVALANCHE]: {
              tokenAddress: DAI_AVALANCHE.address,
            },
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
        ...Tokens[ChainId.BNB]!.DAI,
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
      {
        ...Tokens[ChainId.AVALANCHE]!.DAI,
        name: 'Dai Stablecoin',
        symbol: 'DAI',
        extensions: {
          bridgeInfo: {
            [ChainId.MAINNET]: {
              tokenAddress: DAI.address,
            },
          },
        },
      },
    ])
  })

  it('provides bridge extensions for base goerli list', async () => {
    const chainified = await chainify(sampleL1TokenList_3)

    expect(chainified.tokens).toEqual([
      {
        ...Tokens[ChainId.MAINNET]!.COINBASE_WRAPPED_STAKED_ETH,
        extensions: {
          bridgeInfo: {
            [ChainId.ARBITRUM_ONE]: {
              tokenAddress: COINBASE_WRAPPED_STAKED_ETH_ARBITRUM_ONE.address,
            },
            [ChainId.BASE_GOERLI]: {
              tokenAddress: COINBASE_WRAPPED_STAKED_ETH_BASE_GOERLI.address,
            },
          },
        },
      },
      {
        ...Tokens[ChainId.ARBITRUM_ONE]!.COINBASE_WRAPPED_STAKED_ETH,
        name: 'Coinbase Wrapped Staked ETH',
        extensions: {
          bridgeInfo: {
            [ChainId.MAINNET]: {
              tokenAddress: COINBASE_WRAPPED_STAKED_ETH.address,
            },
          },
        },
      },
      {
        ...Tokens[ChainId.BASE_GOERLI]!.COINBASE_WRAPPED_STAKED_ETH,
        name: 'Coinbase Wrapped Staked ETH',
        extensions: {
          bridgeInfo: {
            [ChainId.MAINNET]: {
              tokenAddress: COINBASE_WRAPPED_STAKED_ETH.address,
            },
          },
        },
      },
    ])
  })
})
