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

const web3 = new Web3()

export async function buildList(
  chainId: ChainId,
  l1TokenList: TokenList
): Promise<TokenList> {
  web3.setProvider(getRpcUrl(chainId))
  const tokenAddressMap = await getMappingProvider(
    chainId,
    l1TokenList
  ).provide()
  const mappedTokens = []
  for (const rootToken of l1TokenList.tokens) {
    const childToken = tokenAddressMap[rootToken.address.toLowerCase()]
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

    if (rootToken.chainId === ChainId.MAINNET) {
      // build extension info if available
      const toRootExtensions = childTokenValid
        ? {
            extensions: {
              bridgeInfo: {
                [rootToken.chainId]: {
                  tokenAddress: ethers.utils.getAddress(rootToken.address),
                },
              },
            },
          }
        : {}

      const toChildExtensions = childTokenValid
        ? {
            extensions: {
              bridgeInfo: {
                [chainId]: {
                  tokenAddress: childTokenAddress,
                },
              },
            },
          }
        : {}

      const rootTokenInfo: TokenInfo = {
        ...rootToken,
        ...toChildExtensions,
      } as unknown as TokenInfo

      if (childTokenValid) {
        const childTokenInfo: TokenInfo = {
          ...rootToken,
          chainId: chainId,
          address: childTokenAddress,
          ...toRootExtensions,
        } as unknown as TokenInfo
        mappedTokens.push(childTokenInfo)
      }
      mappedTokens.push(rootTokenInfo)
    }
  }
  const tokenList = {
    name: `(ChainId: ${chainId}) ${l1TokenList.name}`,
    timestamp: new Date().toISOString(),
    version: l1TokenList.version,
    tokens: mappedTokens.sort(compareTokenInfos),
  }

  return tokenList
}

// using a symbol lookup contract call to check whether the token exists on the L2
async function hasExistingTokenContract(address: string, chainId: ChainId) {
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
