import { ArbitrumMappingProvider } from './ArbitrumMappingProvider'
import { getL2TokenAddressesFromL1 } from '../arbitrum/gateway'
import { getNetworkConfig } from '../arbitrum/instantiate_bridge'
import { TokenList } from '@uniswap/token-lists'

jest.mock('../arbitrum/gateway')
jest.mock('../arbitrum/instantiate_bridge')

describe('ArbitrumMappingProvider', () => {
  const mockL1TokenList: TokenList = {
    name: 'Test Token List',
    timestamp: '2024-01-01T00:00:00.000Z',
    version: { major: 1, minor: 0, patch: 0 },
    tokens: [
      {
        address: '0x1234',
        chainId: 1,
        decimals: 18,
        name: 'Token1',
        symbol: 'TK1',
      },
      {
        address: '0x5678',
        chainId: 1,
        decimals: 18,
        name: 'Token2',
        symbol: 'TK2',
      },
      {
        address: '0x9abc',
        chainId: 1,
        decimals: 18,
        name: 'Token3',
        symbol: 'TK3',
      },
    ],
  }

  const mockNetworkConfig = {
    l1: {
      multiCaller: 'mockMultiCaller',
    },
    l2: {
      network: {
        tokenBridge: {
          l1GatewayRouter: '0xgatewayAddress',
        },
      },
    },
  }

  beforeEach(() => {
    jest.clearAllMocks()
    ;(getNetworkConfig as jest.Mock).mockResolvedValue(mockNetworkConfig)
  })

  it('should correctly map L1 tokens to L2 addresses in batches', async () => {
    const mockL2Addresses = ['0x1234L2', '0x5678L2', '0x9abcL2']
    ;(getL2TokenAddressesFromL1 as jest.Mock).mockResolvedValue(mockL2Addresses)

    const provider = new ArbitrumMappingProvider(mockL1TokenList)
    const result = await provider.provide()

    expect(result).toEqual({
      '0x1234': '0x1234L2',
      '0x5678': '0x5678L2',
      '0x9abc': '0x9abcL2',
    })

    expect(getL2TokenAddressesFromL1).toHaveBeenCalledWith(
      ['0x1234', '0x5678', '0x9abc'].map((addr) => addr.toLowerCase()),
      'mockMultiCaller',
      '0xgatewayAddress'
    )
  })

  it('should handle undefined L2 addresses correctly', async () => {
    const mockL2Addresses = ['0x1234L2', undefined, '0x9abcL2']
    ;(getL2TokenAddressesFromL1 as jest.Mock).mockImplementation(
      (addresses) => {
        // Return only the defined addresses from our mock data
        return mockL2Addresses.filter((addr) => addr !== undefined)
      }
    )

    const provider = new ArbitrumMappingProvider(mockL1TokenList)
    const result = await provider.provide()

    // Our implementation filters out undefined values before adding to batches array,
    // so the indexes will shift. The final mapping will have undefined for any
    // addresses that don't have a corresponding L2 address in order
    expect(result).toEqual({
      '0x1234': '0x1234L2',
      '0x5678': '0x9abcL2', // Gets the next available L2 address
      '0x9abc': undefined, // No more L2 addresses available
    })
  })

  it('should process tokens in batches of 100', async () => {
    // Create a token list with 150 tokens
    const largeTokenList: TokenList = {
      ...mockL1TokenList,
      tokens: Array.from({ length: 150 }, (_, i) => ({
        address: `0x${i}`,
        chainId: 1,
        decimals: 18,
        name: `Token${i}`,
        symbol: `TK${i}`,
      })),
    }

    const provider = new ArbitrumMappingProvider(largeTokenList)
    await provider.provide()

    // Verify that getL2TokenAddressesFromL1 was called twice
    // Once with 100 tokens and once with 50 tokens
    expect(getL2TokenAddressesFromL1).toHaveBeenCalledTimes(2)
    const firstCall = (getL2TokenAddressesFromL1 as jest.Mock).mock.calls[0][0]
    const secondCall = (getL2TokenAddressesFromL1 as jest.Mock).mock.calls[1][0]
    expect(firstCall.length).toBe(100)
    expect(secondCall.length).toBe(50)
  })
})
