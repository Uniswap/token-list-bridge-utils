import { MappingProvider } from './MappingProvider'
import { getNetworkConfig } from '../arbitrum/instantiate_bridge'
import { getL2TokenAddressesFromL1 } from '../arbitrum/gateway'
import { TokenList } from '@uniswap/token-lists'

/**
 * This provider provides the l1->l2(Arbitrum) address mappings using the arbitrum SDK.
 */
export class ArbitrumMappingProvider implements MappingProvider {
  l1TokenList: TokenList

  constructor(l1TokenList: TokenList) {
    this.l1TokenList = l1TokenList
  }

  async provide(): Promise<{ [key: string]: string | undefined }> {
    let tokens: { [key: string]: string | undefined } = {}

    const { l1, l2 } = await getNetworkConfig()

    let tokenAddresses = this.l1TokenList.tokens.map((token) =>
      token.address.toLowerCase()
    )

    const l2AddressesFromL1 = await getL2TokenAddressesFromL1(
      tokenAddresses,
      l1.multiCaller,
      l2.network.tokenBridge.l1GatewayRouter
    )

    tokens = tokenAddresses.reduce(
      (obj, key, index) => ({ ...obj, [key]: l2AddressesFromL1[index] }),
      {}
    )

    return tokens
  }
}
