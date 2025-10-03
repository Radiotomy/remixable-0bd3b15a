import { http, createConfig } from 'wagmi'
import { base, baseGoerli } from 'wagmi/chains'
import { coinbaseWallet, metaMask, walletConnect } from 'wagmi/connectors'

const projectId = 'your-walletconnect-project-id' // TODO: Replace with actual project ID

export const config = createConfig({
  chains: [base, baseGoerli],
  connectors: [
    coinbaseWallet({
      appName: 'Remixable',
      appLogoUrl: 'https://remixable.ai/logo.png',
    }),
    metaMask(),
    walletConnect({ projectId }),
  ],
  transports: {
    [base.id]: http(),
    [baseGoerli.id]: http(),
  },
})

// Base chain configuration
export const BASE_CHAIN_ID = base.id
export const BASE_TESTNET_CHAIN_ID = baseGoerli.id

// USDC contract addresses on Base
export const USDC_CONTRACT_ADDRESS: Record<number, `0x${string}`> = {
  [base.id]: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  [baseGoerli.id]: '0x036CbD53842c5426634e7929541eC2318f3dCF7e'
} as const

// Contract addresses (deployed on BASE mainnet)
export const CONTRACT_ADDRESSES: Record<number, {
  rmxToken: `0x${string}`;
  tokenFactory: `0x${string}`;
  revenueDistribution: `0x${string}`;
}> = {
  [base.id]: {
    rmxToken: '0x0000000000000000000000000000000000000000', // Will be updated after deployment
    tokenFactory: '0x0000000000000000000000000000000000000000',
    revenueDistribution: '0x0000000000000000000000000000000000000000',
  },
  [baseGoerli.id]: {
    rmxToken: '0x0000000000000000000000000000000000000000',
    tokenFactory: '0x0000000000000000000000000000000000000000', 
    revenueDistribution: '0x0000000000000000000000000000000000000000',
  }
} as const

// Platform wallet address for receiving payments
// Configurable via environment variable for flexibility and security
export const PLATFORM_WALLET_ADDRESS: `0x${string}` = 
  (import.meta.env.VITE_PLATFORM_WALLET as `0x${string}`) || 
  '0x742d35Cc5E6C4b8b4f1C8aF6260a3F0a1b5C4eE0'