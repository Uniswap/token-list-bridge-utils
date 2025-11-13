import { ChainId } from '../constants/chainId'
import { Contract } from 'web3-eth-contract'
import { ArbitrumMappingProvider } from './ArbitrumMappingProvider'
import { OptimismMappingProvider } from './OptimismMappingProvider'
import { PolygonMappingProvider } from './PolygonMappingProvider'
import { BnbMappingProvider } from './BnbMappingProvider'
import { UnichainMappingProvider } from './UnichainMappingProvider'
import { TokenInfo, TokenList } from '@uniswap/token-lists'
import { ethers } from 'ethers'
import {
  compareTokenInfos,
  getRpcUrl,
  getTokenSymbolFromContract,
} from '../utils'
import ERC20Abi from '../abis/erc20'
// TODO: use ethers for contract calls (without performance reduction).
import Web3 from 'web3'
import {
  GenericMappedTokenData,
  PolygonMappedTokenData,
  MappedTokenData,
  MappedToken,
} from '../constants/types'
import { AvalancheMappingProvider } from './AvalancheMappingProvider'
import { BaseMappingProvider } from './BaseMappingProvider'
import { CeloMappingProvider } from './CeloMappingProvider'
import { SoneiumMappingProvider } from './SoneiumMappingProvider'
import { isTokenExcluded } from '../constants/excludedTokens'

const web3 = new Web3()

// chains we support fetching mappings for (can be different than the l2ChainIds arg for buildList)
const CHAINS_WITH_MAPPING_PROVIDERS = [
  ChainId.ARBITRUM_ONE,
  ChainId.POLYGON,
  ChainId.OPTIMISM,
  ChainId.BNB,
  ChainId.AVALANCHE,
  ChainId.CELO,
  ChainId.BASE,
  ChainId.UNICHAIN,
  ChainId.SONEIUM,
]

export async function buildList(
  l2ChainIds: Array<ChainId>,
  l1TokenList: TokenList
): Promise<TokenList> {
  const multiChainedTokens: TokenInfo[] = []
  const chainIdToMappingsMap = await generateTokenMappings(
    l2ChainIds,
    l1TokenList
  )
  for (const l1Token of l1TokenList.tokens) {
    if (l1Token.chainId === ChainId.MAINNET) {
      const chainIdToChildTokenDetailsMap: {
        [key: number]: {
          childTokenValid: boolean
          childTokenAddress: string | undefined
          decimals?: number
        }
      } = {}
      const l2MappingExtension = {
        extensions: {
          bridgeInfo: {} as any,
        },
      }
      // build out the extensions.bridgeInfo data containing mappings for each L2 chain
      await Promise.all(
        l2ChainIds.map(async (chainId) => {
          chainIdToChildTokenDetailsMap[chainId] = await getChildTokenDetails(
            l1Token,
            chainId,
            chainIdToMappingsMap
          )
          const childTokenAddress =
            chainIdToChildTokenDetailsMap[chainId].childTokenAddress

          // Only add bridgeInfo if child token is valid and not excluded
          if (
            chainIdToChildTokenDetailsMap[chainId].childTokenValid &&
            childTokenAddress &&
            !isTokenExcluded(chainId, childTokenAddress)
          ) {
            l2MappingExtension.extensions.bridgeInfo[chainId] = {
              tokenAddress: childTokenAddress,
            }
          }
        })
      )

      // build the TokenInfo objects with bridgeInfo extension
      l2ChainIds.concat([ChainId.MAINNET]).forEach((chainId) => {
        const tokenAddress =
          chainId === ChainId.MAINNET
            ? l1Token.address
            : chainIdToChildTokenDetailsMap[chainId]?.childTokenAddress

        // Skip if token is excluded on this chain
        if (tokenAddress && isTokenExcluded(chainId, tokenAddress)) {
          return
        }

        if (
          chainId === ChainId.MAINNET ||
          chainIdToChildTokenDetailsMap[chainId].childTokenValid
        ) {
          const tokenInfo: TokenInfo =
            chainId === ChainId.MAINNET
              ? ({
                  ...l1Token,
                  extensions:
                    Object.keys(l2MappingExtension.extensions.bridgeInfo)
                      .length > 0
                      ? {
                          bridgeInfo: l2MappingExtension.extensions.bridgeInfo,
                        }
                      : undefined,
                } as unknown as TokenInfo)
              : ({
                  ...l1Token,
                  decimals:
                    chainIdToChildTokenDetailsMap[chainId].decimals ??
                    l1Token.decimals,
                  chainId: chainId,
                  address:
                    chainIdToChildTokenDetailsMap[chainId].childTokenAddress,
                  extensions: {
                    bridgeInfo: {
                      [ChainId.MAINNET]: {
                        tokenAddress: ethers.utils.getAddress(l1Token.address),
                      },
                    },
                  },
                } as unknown as TokenInfo)

          multiChainedTokens.push(tokenInfo)
        }
      })
    }
  }

  // build and return final chainified token list
  const tokenList = {
    name: `(ChainIds: ${l2ChainIds}) ${l1TokenList.name}`,
    timestamp: new Date().toISOString(),
    version: l1TokenList.version,
    tokens: multiChainedTokens.sort(compareTokenInfos),
  }

  return tokenList
}

// using a symbol lookup contract call to check whether the token exists on the L2
async function hasExistingTokenContract(address: string, chainId: ChainId) {
  web3.setProvider(getRpcUrl(chainId))
  try {
    const contract: Contract = new web3.eth.Contract(ERC20Abi, address)
    await getTokenSymbolFromContract(contract)
  } catch (e) {
    return false
  }

  return true
}

function getMappingProvider(chainId: ChainId, l1TokenList: TokenList) {
  switch (chainId) {
    case ChainId.ARBITRUM_ONE:
      return new ArbitrumMappingProvider(l1TokenList)
    case ChainId.OPTIMISM:
      return new OptimismMappingProvider()
    case ChainId.POLYGON:
      return new PolygonMappingProvider()
    case ChainId.BNB:
      return new BnbMappingProvider()
    case ChainId.AVALANCHE:
      return new AvalancheMappingProvider()
    case ChainId.CELO:
      return new CeloMappingProvider()
    case ChainId.BASE:
      return new BaseMappingProvider()
    case ChainId.UNICHAIN:
      return new UnichainMappingProvider()
    case ChainId.SONEIUM:
      return new SoneiumMappingProvider()
    default:
      throw new Error(`Chain ${chainId} not supported for fetching mappings.`)
  }
}

async function generateTokenMappings(
  chainIds: ChainId[],
  l1TokenList: TokenList
) {
  const chainIdToMappingsMap: {
    [key: number]:
      | PolygonMappedTokenData
      | GenericMappedTokenData
      | MappedTokenData
  } = {}

  for (const chainId of chainIds) {
    if (CHAINS_WITH_MAPPING_PROVIDERS.includes(chainId)) {
      chainIdToMappingsMap[chainId] = await getMappingProvider(
        chainId,
        l1TokenList
      ).provide()
    }
  }

  return chainIdToMappingsMap
}

// handles both string and object cases for childToken (Polygon mappings return object)
async function getChildTokenDetails(
  l1Token: TokenInfo,
  chainId: ChainId,
  chainIdToMappingsMap: {
    [key: number]:
      | PolygonMappedTokenData
      | GenericMappedTokenData
      | MappedTokenData
  }
): Promise<{
  childTokenValid: boolean
  childTokenAddress: string | undefined
  decimals?: number | undefined
}> {
  const bridgeInfo = l1Token?.extensions?.bridgeInfo
  let existingMapping: undefined | string
  if (bridgeInfo && typeof bridgeInfo === 'object') {
    const bridgeInfoForChain = bridgeInfo[chainId]
    if (bridgeInfoForChain && typeof bridgeInfoForChain === 'object') {
      existingMapping = bridgeInfoForChain.tokenAddress as string
    }
  }
  // use the externally fetched mappings if manual entry doesn't exist for the token/chain mapping
  // and the given chain is supported for fetching mappings
  if (
    CHAINS_WITH_MAPPING_PROVIDERS.includes(chainId) &&
    existingMapping === undefined
  ) {
    const childToken =
      chainIdToMappingsMap[chainId][l1Token.address.toLowerCase()]

    const childTokenAddress = childToken
      ? ethers.utils.getAddress(
          typeof childToken === 'object' ? childToken.childToken : childToken
        )
      : undefined
    const childTokenValid = Boolean(
      childTokenAddress &&
        (chainId === ChainId.UNICHAIN // barring a unichain rpc url, we skip the contract call. Since we're using a manually curated list of tokens, we can assume they exist.
          ? true
          : await hasExistingTokenContract(childTokenAddress, chainId))
    )
    const decimals =
      childToken &&
      (chainId === ChainId.BNB ||
        chainId === ChainId.AVALANCHE ||
        chainId === ChainId.CELO)
        ? (childToken as MappedToken).decimals
        : undefined
    return {
      childTokenValid: childTokenValid,
      childTokenAddress: childTokenAddress,
      decimals: decimals,
    }
  }
  return {
    childTokenValid: !!existingMapping,
    childTokenAddress: existingMapping,
  }
}
