import { config } from 'dotenv'

// fall back to https://cloudflare-eth.com/ if MAINNET_RPC not provided in an .env file
config()
process.env.MAINNET_RPC =
  process.env.MAINNET_RPC || 'https://cloudflare-eth.com/'
