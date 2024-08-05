import { Token } from '@uniswap/sdk-core'
import { TokenInfo, TokenList } from '@uniswap/token-lists'
import { ChainId } from '../constants/chainId'
import {
  DAI,
  DAI_ARBITRUM_ONE,
  DAI_BNB,
  DAI_AVALANCHE,
  DAI_OPTIMISM,
  DAI_POLYGON,
  USDT,
  USDT_BNB,
  COINBASE_WRAPPED_STAKED_ETH,
  COINBASE_WRAPPED_STAKED_ETH_ARBITRUM_ONE,
  COINBASE_WRAPPED_STAKED_ETH_BASE,
  COINBASE_WRAPPED_STAKED_ETH_OPTIMISM,
  DAI_BASE,
  USDT_CELO,
} from '../constants/tokens'
import { compareTokenInfos } from '../utils'

export const Tokens: Partial<Record<ChainId, Record<string, TokenInfo>>> = {
  [ChainId.MAINNET]: {
    DAI: tokenToTokenInfo(DAI),
    USDT: tokenToTokenInfo(USDT),
    COINBASE_WRAPPED_STAKED_ETH: tokenToTokenInfo(COINBASE_WRAPPED_STAKED_ETH),
  },
  [ChainId.ARBITRUM_ONE]: {
    DAI: tokenToTokenInfo(DAI_ARBITRUM_ONE),
    COINBASE_WRAPPED_STAKED_ETH: tokenToTokenInfo(
      COINBASE_WRAPPED_STAKED_ETH_ARBITRUM_ONE
    ),
  },
  [ChainId.POLYGON]: {
    DAI: tokenToTokenInfo(DAI_POLYGON),
  },
  [ChainId.OPTIMISM]: {
    DAI: tokenToTokenInfo(DAI_OPTIMISM),
    COINBASE_WRAPPED_STAKED_ETH: tokenToTokenInfo(
      COINBASE_WRAPPED_STAKED_ETH_OPTIMISM
    ),
  },
  [ChainId.BNB]: {
    DAI: tokenToTokenInfo(DAI_BNB),
    USDT: tokenToTokenInfo(USDT_BNB),
  },
  [ChainId.AVALANCHE]: {
    DAI: tokenToTokenInfo(DAI_AVALANCHE),
  },
  [ChainId.BASE]: {
    DAI: tokenToTokenInfo(DAI_BASE),
    COINBASE_WRAPPED_STAKED_ETH: tokenToTokenInfo(
      COINBASE_WRAPPED_STAKED_ETH_BASE
    ),
  },
  [ChainId.CELO]: {
    USDT: tokenToTokenInfo(USDT_CELO),
  },
}

export const sampleL1TokenList: TokenList = {
  name: 'Sample',
  timestamp: new Date(1646146610).toISOString(),
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
  tokens: [Tokens[ChainId.MAINNET]!.DAI],
}

export const sampleL1TokenList_2: TokenList = {
  name: 'Sample_2',
  timestamp: new Date(1646146610).toISOString(),
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
  tokens: [Tokens[ChainId.MAINNET]!.USDT],
}

export const sampleL1TokenList_3: TokenList = {
  name: 'Sample_3',
  timestamp: new Date(1646146610).toISOString(),
  version: {
    major: 1,
    minor: 0,
    patch: 0,
  },
  tokens: [Tokens[ChainId.MAINNET]!.COINBASE_WRAPPED_STAKED_ETH],
}

export const arbBridgeL2Address = '0x467194771dae2967aef3ecbedd3bf9a310c76c65'
export const arbBridgeL1Address = '0xd3b5b60020504bc3489d6949d545893982ba3011'

export const arbedSampleTokenList = {
  ...sampleL1TokenList,
  name: 'Arbed Sample',
  tokens: [
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
    } as unknown as TokenInfo,
    {
      ...(Tokens[ChainId.MAINNET]!.DAI as unknown as TokenInfo),
      extensions: {
        bridgeInfo: {
          [ChainId.ARBITRUM_ONE]: {
            tokenAddress: DAI_ARBITRUM_ONE.address,
            // destBridgeAddress: arbBridgeL2Address,
            // originBridgeAddress: arbBridgeL1Address,
          },
        },
      },
    } as unknown as TokenInfo,
  ].sort(compareTokenInfos),
}
export const polygonedSampleTokenList = {
  ...sampleL1TokenList,
  name: 'Polygoned Sample',
  tokens: [
    {
      ...Tokens[ChainId.POLYGON]!.DAI,
      extensions: {
        bridgeInfo: {
          [ChainId.MAINNET]: {
            tokenAddress: DAI.address,
          },
        },
      },
    } as unknown as TokenInfo,
    {
      ...(Tokens[ChainId.MAINNET]!.DAI as unknown as TokenInfo),
      extensions: {
        bridgeInfo: {
          [ChainId.POLYGON]: {
            tokenAddress: DAI_POLYGON.address,
          },
        },
      },
    } as unknown as TokenInfo,
  ].sort(compareTokenInfos),
}

export const avalanchedSampleTokenList = {
  ...sampleL1TokenList,
  name: 'Avalanched Sample',
  tokens: [
    {
      ...Tokens[ChainId.AVALANCHE]!.DAI,
      extensions: {
        bridgeInfo: {
          [ChainId.MAINNET]: {
            tokenAddress: DAI.address,
          },
        },
      },
    } as unknown as TokenInfo,
    {
      ...(Tokens[ChainId.MAINNET]!.DAI as unknown as TokenInfo),
      extensions: {
        bridgeInfo: {
          [ChainId.AVALANCHE]: {
            tokenAddress: DAI_AVALANCHE.address,
          },
        },
      },
    } as unknown as TokenInfo,
  ].sort(compareTokenInfos),
}

export const bnbedSampleTokenList = {
  ...sampleL1TokenList,
  name: 'BNBed Sample',
  tokens: [
    {
      ...Tokens[ChainId.BNB]!.DAI,
      extensions: {
        bridgeInfo: {
          [ChainId.MAINNET]: {
            tokenAddress: DAI.address,
          },
        },
      },
    } as unknown as TokenInfo,
    {
      ...(Tokens[ChainId.MAINNET]!.DAI as unknown as TokenInfo),
      extensions: {
        bridgeInfo: {
          [ChainId.BNB]: {
            tokenAddress: DAI_BNB.address,
          },
        },
      },
    } as unknown as TokenInfo,
  ].sort(compareTokenInfos),
}

export const bnbedSampleTokenList_2 = {
  ...sampleL1TokenList_2,
  name: 'BNBed Sample_2',
  tokens: [
    {
      ...Tokens[ChainId.BNB]!.USDT,
      extensions: {
        bridgeInfo: {
          [ChainId.MAINNET]: {
            tokenAddress: USDT.address,
          },
        },
      },
    } as unknown as TokenInfo,
    {
      ...(Tokens[ChainId.MAINNET]!.USDT as unknown as TokenInfo),
      extensions: {
        bridgeInfo: {
          [ChainId.BNB]: {
            tokenAddress: USDT_BNB.address,
          },
        },
      },
    } as unknown as TokenInfo,
  ].sort(compareTokenInfos),
}

export const celoedSampleTokenList = {
  ...sampleL1TokenList_2,
  name: 'Celo Sample',
  tokens: [
    {
      ...Tokens[ChainId.CELO]!.USDT,
      extensions: {
        bridgeInfo: {
          [ChainId.MAINNET]: {
            tokenAddress: USDT.address,
          },
        },
      },
    } as unknown as TokenInfo,
    {
      ...(Tokens[ChainId.MAINNET]!.USDT as unknown as TokenInfo),
      extensions: {
        bridgeInfo: {
          [ChainId.CELO]: {
            tokenAddress: USDT_CELO.address,
          },
        },
      },
    } as unknown as TokenInfo,
  ].sort(compareTokenInfos),
}

export const baseSampleTokenList_3 = {
  ...sampleL1TokenList_3,
  name: 'Base Sample_3',
  tokens: [
    {
      ...Tokens[ChainId.BASE]!.COINBASE_WRAPPED_STAKED_ETH,
      extensions: {
        bridgeInfo: {
          [ChainId.MAINNET]: {
            tokenAddress: COINBASE_WRAPPED_STAKED_ETH.address,
          },
        },
      },
    } as unknown as TokenInfo,
    {
      ...(Tokens[ChainId.MAINNET]!
        .COINBASE_WRAPPED_STAKED_ETH as unknown as TokenInfo),
      extensions: {
        bridgeInfo: {
          [ChainId.BASE]: {
            tokenAddress: COINBASE_WRAPPED_STAKED_ETH_BASE.address,
          },
        },
      },
    } as unknown as TokenInfo,
  ].sort(compareTokenInfos),
}

export const optimizedSampleTokenList = {
  ...sampleL1TokenList,
  name: 'Optimized Sample',
  tokens: [
    {
      ...Tokens[ChainId.OPTIMISM]!.DAI,
      extensions: {
        bridgeInfo: {
          [ChainId.MAINNET]: {
            tokenAddress: DAI.address,
          },
        },
      },
    } as unknown as TokenInfo,
    {
      ...(Tokens[ChainId.MAINNET]!.DAI as unknown as TokenInfo),
      extensions: {
        bridgeInfo: {
          [ChainId.OPTIMISM]: {
            tokenAddress: DAI_OPTIMISM.address,
          },
        },
      },
    } as unknown as TokenInfo,
  ].sort(compareTokenInfos),
}

function tokenToTokenInfo({
  chainId,
  address,
  name,
  decimals,
  symbol,
}: Token): TokenInfo {
  return {
    chainId,
    address: address,
    name: name ?? 'n/a',
    decimals,
    symbol: symbol ?? 'n/a',
  }
}
