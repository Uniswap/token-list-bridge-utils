import { config } from 'dotenv'
import { ChainId } from '../constants/chainId'
import { getRpcUrl } from '../utils'

// MAINNET_RPC value is required for arb-sdk. fall back to https://cloudflare-eth.com/ if MAINNET_RPC not provided in an .env file
config()
process.env.MAINNET_RPC ??= getRpcUrl(ChainId.MAINNET)
