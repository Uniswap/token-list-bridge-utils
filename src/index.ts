import { TokenList } from '@uniswap/token-lists'
import { generateTokenList } from './arb-token-lists/src/lib/token_list_gen'
import { getTokenListObj } from './arb-token-lists/src/lib/utils'

export const sum = (a: number, b: number) => {
  if ('development' === process.env.NODE_ENV) {
    console.log('dev only output')
  }
  return a + b
}

const supportedChains = { 1: true, 10: true }

type L1Address = string
type L2Address = string

export function getImplementatinInChain(
  chainId: keyof typeof supportedChains,
  addressToLookup: string
) {
  switch (chainId) {
  }
}

interface MappingProvider {
  provide(pathOrUrl: string): Promise<TokenList>
}

class ArbitrumMappingProvider implements MappingProvider {
  async provide(pathOrUrl: string): Promise<TokenList> {
    const l1TokenList = await getTokenListObj(pathOrUrl)
    return generateTokenList(l1TokenList)
  }
}

class PolygonMappingProvider implements MappingProvider {
  provide(pathOrUrl: any): Promise<TokenList> {
    throw new Error('Method not implemented.')
  }
}
