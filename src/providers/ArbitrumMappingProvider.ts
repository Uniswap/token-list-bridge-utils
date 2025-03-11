import { MappingProvider } from './MappingProvider'
import { getNetworkConfig } from '../arbitrum/instantiate_bridge'
import { getL2TokenAddressesFromL1 } from '../arbitrum/gateway'
import { TokenList } from '@uniswap/token-lists'
import { GenericMappedTokenData } from '../constants/types'

/**
 * This provider provides the l1->l2(Arbitrum) address mappings using the arbitrum SDK.
 */
export class ArbitrumMappingProvider implements MappingProvider {
  l1TokenList: TokenList

  constructor(l1TokenList: TokenList) {
    this.l1TokenList = l1TokenList
  }

  async provide(): Promise<GenericMappedTokenData> {
    let tokens: { [key: string]: string | undefined } = {}

    const { l1, l2 } = await getNetworkConfig()

    let tokenAddresses = this.l1TokenList.tokens.map((token) =>
      token.address.toLowerCase()
    )

    // batching calls to avoid rpc response size limits
    const batchSize = 100
    const batches: string[] = []
    for (let i = 0; i < tokenAddresses.length; i += batchSize) {
      const batch = tokenAddresses.slice(i, i + batchSize)
      const batchResults = await getL2TokenAddressesFromL1(
        batch,
        l1.multiCaller,
        l2.network.tokenBridge.l1GatewayRouter
      )
      const filteredResults = batchResults.filter(
        (addr): addr is string => addr !== undefined
      )
      batches.push(...filteredResults)
    }

    tokens = tokenAddresses.reduce(
      (obj, key, index) => ({ ...obj, [key]: batches[index] }),
      {}
    )

    return tokens
  }
}
