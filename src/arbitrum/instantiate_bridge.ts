import './set_rpc.ts'
import { providers } from 'ethers'

const networkID = 42161

// ref: https://github.com/OffchainLabs/arb-token-lists/blob/master/src/lib/instantiate_bridge.ts
export const getNetworkConfig = async () => {
  const { getL1Network, getL2Network, MultiCaller } = await import(
    '@arbitrum/sdk'
  )
  const l2Network = await getL2Network(networkID)
  const l1Network = await getL1Network(l2Network.partnerChainID)

  const arbProvider = new providers.JsonRpcProvider(l2Network.rpcURL)
  const ethProvider = new providers.JsonRpcProvider(l1Network.rpcURL)

  const l1MultiCaller = await MultiCaller.fromProvider(ethProvider)
  const l2MultiCaller = await MultiCaller.fromProvider(arbProvider)

  return {
    l1: {
      network: l1Network,
      provider: ethProvider,
      multiCaller: l1MultiCaller,
    },
    l2: {
      network: l2Network,
      provider: arbProvider,
      multiCaller: l2MultiCaller,
    },
  }
}
