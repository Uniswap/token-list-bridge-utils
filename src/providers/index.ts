import { ChainId } from '../constants/chainId'
import { Contract } from 'web3-eth-contract'
import { ArbitrumMappingProvider } from './ArbitrumMappingProvider'
import { OptimismMappingProvider } from './OptimismMappingProvider'
import { PolygonMappingProvider } from './PolygonMappingProvider'
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
} from '../constants/types'

const web3 = new Web3()
const SUPPORTED_L2_CHAINS = [
  ChainId.ARBITRUM_ONE,
  ChainId.POLYGON,
  ChainId.OPTIMISM,
]

let polygonMappings: PolygonMappedTokenData | undefined
let arbitrumMappings: GenericMappedTokenData | undefined
let optimismMappings: GenericMappedTokenData | undefined

export async function buildList(
  l2ChainIds: Array<ChainId>,
  l1TokenList: TokenList
): Promise<TokenList> {
  const multiChainedTokens: TokenInfo[] = []
  validateChains(l2ChainIds)
  await generateTokenMappings(l2ChainIds, l1TokenList)

  for (const l1Token of l1TokenList.tokens) {
    const chainIdToChildTokenDetailsMap: {
      [key: number]: {
        childTokenValid: boolean
        childTokenAddress: string | undefined
      }
    } = {}

    if (l1Token.chainId === ChainId.MAINNET) {
      const completeExtensions = {
        extensions: {
          bridgeInfo: {},
        },
      }

      // build out the extensions.bridgeInfo data containing mappings for mainnet + all requested chains that the current token is valid in.
      await Promise.all(
        l2ChainIds.concat([ChainId.MAINNET]).map(async (chainId) => {
          if (chainId === ChainId.MAINNET) {
            completeExtensions.extensions.bridgeInfo[ChainId.MAINNET] = {
              tokenAddress: ethers.utils.getAddress(l1Token.address),
            }
          } else {
            chainIdToChildTokenDetailsMap[chainId] = await getChildTokenDetails(
              l1Token,
              chainId
            )
            if (chainIdToChildTokenDetailsMap[chainId].childTokenValid) {
              completeExtensions.extensions.bridgeInfo[chainId] = {
                tokenAddress:
                  chainIdToChildTokenDetailsMap[chainId].childTokenAddress,
              }
            }
          }
        })
      )

      // build the TokenInfo objects with bridgeInfo extension (omitting the TokenInfo's chain from the completeExtensions built above) and add them to multiChainedTokens
      l2ChainIds.concat([ChainId.MAINNET]).forEach((chainId) => {
        if (
          chainId === ChainId.MAINNET ||
          chainIdToChildTokenDetailsMap[chainId].childTokenValid
        ) {
          const extensionToAdd = omitKeyIfPresent(
            [chainId],
            completeExtensions.extensions.bridgeInfo
          )
          const tokenInfo: TokenInfo =
            chainId === ChainId.MAINNET
              ? ({
                  ...l1Token,
                  extensions:
                    Object.keys(extensionToAdd).length > 0
                      ? {
                          bridgeInfo: extensionToAdd,
                        }
                      : undefined,
                } as unknown as TokenInfo)
              : ({
                  ...l1Token,
                  chainId: chainId,
                  address:
                    chainIdToChildTokenDetailsMap[chainId].childTokenAddress,
                  extensions:
                    Object.keys(extensionToAdd).length > 0
                      ? {
                          bridgeInfo: extensionToAdd,
                        }
                      : undefined,
                } as unknown as TokenInfo)

          multiChainedTokens.push(tokenInfo)
        }
      })
    }
  }
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
  } catch {
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
    default:
      throw new Error(`Chain ${chainId} not supported.`)
  }
}

function getMappingsByChain(chainId: ChainId) {
  switch (chainId) {
    case ChainId.ARBITRUM_ONE:
      return arbitrumMappings
    case ChainId.OPTIMISM:
      return optimismMappings
    case ChainId.POLYGON:
      return polygonMappings
    default:
      throw new Error(`Chain ${chainId} not supported.`)
  }
}

async function generateTokenMappings(
  chainIds: ChainId[],
  l1TokenList: TokenList
) {
  arbitrumMappings = chainIds.includes(ChainId.ARBITRUM_ONE)
    ? ((await getMappingProvider(
        ChainId.ARBITRUM_ONE,
        l1TokenList
      ).provide()) as GenericMappedTokenData)
    : undefined

  polygonMappings = chainIds.includes(ChainId.POLYGON)
    ? ((await getMappingProvider(
        ChainId.POLYGON,
        l1TokenList
      ).provide()) as PolygonMappedTokenData)
    : undefined

  optimismMappings = chainIds.includes(ChainId.OPTIMISM)
    ? ((await getMappingProvider(
        ChainId.OPTIMISM,
        l1TokenList
      ).provide()) as GenericMappedTokenData)
    : undefined
}

// handles both string and object cases for childToken (Polygon mappings return object)
async function getChildTokenDetails(
  l1Token: TokenInfo,
  chainId: ChainId
): Promise<{
  childTokenValid: boolean
  childTokenAddress: string | undefined
}> {
  const childToken = getMappingsByChain(chainId)![l1Token.address.toLowerCase()]

  const childTokenAddress = childToken
    ? ethers.utils.getAddress(
        typeof childToken === 'object' ? childToken.child_token : childToken
      )
    : undefined
  const childTokenValid = Boolean(
    childTokenAddress &&
      (typeof childToken === 'object' ? !childToken.deleted : true) &&
      (await hasExistingTokenContract(childTokenAddress, chainId))
  )
  return {
    childTokenValid: childTokenValid,
    childTokenAddress: childTokenAddress,
  }
}

function omitKeyIfPresent(key: any, obj: { [x: string]: any }) {
  if (obj[key]) {
    const { [key]: omitted, ...rest } = obj
    return rest
  }

  return obj
}

function validateChains(requestedL2Chains: ChainId[]) {
  requestedL2Chains.forEach((chainId) => {
    if (!SUPPORTED_L2_CHAINS.includes(chainId)) {
      throw new Error(`Chain ${chainId} not supported.`)
    }
  })
}
