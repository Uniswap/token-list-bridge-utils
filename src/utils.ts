import { TokenInfo, TokenList } from '@uniswap/token-lists'
import { readFileSync, existsSync } from 'fs'
import axios from 'axios'
import { ChainId } from './constants/chainId'
import { Contract } from 'web3-eth-contract'

export type TokenListOrFetchableTokenList = TokenList | string

export function compareTokenInfos(t1: TokenInfo, t2: TokenInfo) {
  if (t1.chainId === t2.chainId) {
    return t1.symbol.toLowerCase() < t2.symbol.toLowerCase() ? -1 : 1
  }
  return t1.chainId < t2.chainId ? -1 : 1
}

// ref: https://github.com/OffchainLabs/arb-token-lists/blob/master/src/lib/utils.ts

export async function getTokenList(
  l1TokenListOrPathOrUrl: TokenListOrFetchableTokenList
): Promise<TokenList> {
  if (typeof l1TokenListOrPathOrUrl === 'string') {
    return getTokenListObj(l1TokenListOrPathOrUrl)
  } else {
    return l1TokenListOrPathOrUrl
  }
}

export const getTokenListObjFromUrl = async (url: string) => {
  return (await axios.get(url)).data as TokenList
}

export const getTokenListObjFromLocalPath = async (path: string) => {
  return JSON.parse(readFileSync(path).toString()) as TokenList
}

export const getTokenListObj = async (pathOrUrl: string) => {
  const tokenList: TokenList = await (async (pathOrUrl: string) => {
    const localFileExists = existsSync(pathOrUrl)
    const looksLikeUrl = isValidHttpUrl(pathOrUrl)
    if (localFileExists) {
      return getTokenListObjFromLocalPath(pathOrUrl)
    } else if (looksLikeUrl) {
      return await getTokenListObjFromUrl(pathOrUrl)
    } else {
      throw new Error('Could not find token list')
    }
  })(pathOrUrl)
  isTokenList(tokenList)
  return tokenList
}

// https://stackoverflow.com/questions/5717093/check-if-a-javascript-string-is-a-url

function isValidHttpUrl(urlString: string) {
  let url

  try {
    url = new URL(urlString)
  } catch (_) {
    return false
  }

  return url.protocol === 'http:' || url.protocol === 'https:'
}

// typeguard:
export const isTokenList = (obj: any) => {
  const expectedListKeys = ['name', 'timestamp', 'version', 'tokens']
  const actualListKeys = new Set(Object.keys(obj))
  if (!expectedListKeys.every((key) => actualListKeys.has(key))) {
    throw new Error('tokenlist typeguard error: required list key not included')
  }
  const { version, tokens } = obj
  if (
    !['major', 'minor', 'patch'].every((key) => {
      return typeof version[key] === 'number'
    })
  ) {
    throw new Error('tokenlist typeguard error: invalid version')
  }
  if (
    !tokens.every((token: any) => {
      const tokenKeys = new Set(Object.keys(token))
      return ['chainId', 'address', 'name', 'decimals', 'symbol'].every(
        (key) => {
          return tokenKeys.has(key)
        }
      )
    })
  ) {
    throw new Error('tokenlist typeguard error: token missing required key')
  }
}

export function getRpcUrl(chainId: ChainId): string {
  switch (chainId) {
    case ChainId.MAINNET:
      return 'https://ethereum-rpc.publicnode.com'
    case ChainId.OPTIMISM:
      return 'https://rpc.ankr.com/optimism' // seems to have higher rate limit than https://mainnet.optimism.io/
    case ChainId.OPTIMISTIC_KOVAN:
      return 'https://kovan.optimism.io'
    case ChainId.ARBITRUM_ONE:
      return 'https://arb1.arbitrum.io/rpc'
    case ChainId.ARBITRUM_RINKEBY:
      return 'https://rinkeby.arbitrum.io/rpc'
    case ChainId.POLYGON:
      return 'https://polygon-rpc.com/'
    case ChainId.POLYGON_MUMBAI:
      return 'https://rpc-endpoints.superfluid.dev/mumbai'
    case ChainId.BNB:
      return 'https://bsc-dataseed1.binance.org'
    case ChainId.AVALANCHE:
      return 'https://api.avax.network/ext/bc/C/rpc'
    case ChainId.CELO:
      return 'https://forno.celo.org/'
    case ChainId.CELO_ALFAJORES:
      return 'https://alfajores-forno.celo-testnet.org/'
    case ChainId.BASE:
      return 'https://mainnet.base.org'
    default:
  }
  throw new Error('Unsupported ChainId')
}

export async function getTokenSymbolFromContract(tokenContract: Contract) {
  const symbol = await Promise.all([tokenContract.methods.symbol().call()])
  return symbol
}
