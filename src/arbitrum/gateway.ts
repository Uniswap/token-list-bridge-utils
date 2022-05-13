import { MultiCaller } from '@arbitrum/sdk'
import { L1GatewayRouter__factory } from '@arbitrum/sdk/dist/lib/abi/factories/L1GatewayRouter__factory'

// ref: https://github.com/OffchainLabs/arb-token-lists/blob/0165d84d51746005aa2da0328c5ca2ac651480fb/src/lib/utils.ts#L42

export const getL2TokenAddressesFromL1 = async (
  l1TokenAddresses: string[],
  multiCaller: MultiCaller,
  l1GatewayRouterAddress: string
) => {
  const iFace = L1GatewayRouter__factory.createInterface()

  return await multiCaller.multiCall(
    l1TokenAddresses.map((addr) => ({
      encoder: () =>
        iFace.encodeFunctionData('calculateL2TokenAddress', [addr]),
      decoder: (returnData: string) =>
        iFace.decodeFunctionResult(
          'calculateL2TokenAddress',
          returnData
        )[0] as string,
      targetAddr: l1GatewayRouterAddress,
    }))
  )
}
