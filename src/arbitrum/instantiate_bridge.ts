import './set_rpc.ts'
import { providers } from 'ethers'

const networkID = 42161

const l2Rpc = (chainId: number) => {
  if (chainId === 42161) return 'https://arb1.arbitrum.io/rpc'
  else if (chainId === 421611) return 'https://rinkeby.arbitrum.io/rpc'
  else if (chainId === 42170) return 'https://nova.arbitrum.io/rpc'
  else if (chainId === 421613) return 'https://goerli-rollup.arbitrum.io/rpc'
  throw new Error('No L2 RPC detected')
}

// ref: https://github.com/OffchainLabs/arb-token-lists/blob/master/src/lib/instantiate_bridge.ts
export const getNetworkConfig = async () => {
  const { getL1Network, getL2Network, MultiCaller } = await import(
    '@arbitrum/sdk'
  )
  const l2Network = await getL2Network(networkID)
  const l1Network = await getL1Network(l2Network.partnerChainID)

  const arbProvider = new providers.JsonRpcProvider(l2Rpc(l2Network.chainID))
  const ethProvider = new providers.JsonRpcProvider(process.env.MAINNET_RPC)

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
