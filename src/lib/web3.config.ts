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
  tokenVesting: `0x${string}`;
  revenueDistribution: `0x${string}`;
  rmxStaking: `0x${string}`;
  timelock: `0x${string}`;
  governor: `0x${string}`;
  tokenFactory: `0x${string}`;
}> = {
  [base.id]: {
    rmxToken: '0x0Bab8DbA1d4800F8E6A699c1ea9A0e5860c2C12B',
    tokenVesting: '0x35dba54a76736c930bbc2d5672fa3a297cb38bb8',
    revenueDistribution: '0x7352d9aa7d17a42db71421d7d5c28881618aeba6',
    rmxStaking: '0x5c03979381e6bd2ed2b6347f6cd9f4e995bdbcfe',
    timelock: '0xc079d282F43d95630DBc39d46F19cF4a09Ded7A4',
    governor: '0x9c59d488ad5798b6ae9bdd90d99e045d95196828',
    tokenFactory: '0xb75c63c7986bb8433f102f9ea3275e74d1c4c6ee',
  },
  [baseGoerli.id]: {
    rmxToken: '0x0000000000000000000000000000000000000000',
    tokenVesting: '0x0000000000000000000000000000000000000000',
    revenueDistribution: '0x0000000000000000000000000000000000000000',
    rmxStaking: '0x0000000000000000000000000000000000000000',
    timelock: '0x0000000000000000000000000000000000000000',
    governor: '0x0000000000000000000000000000000000000000',
    tokenFactory: '0x0000000000000000000000000000000000000000',
  }
} as const

// Platform wallet address for receiving payments
// Configurable via environment variable for flexibility and security
export const PLATFORM_WALLET_ADDRESS: `0x${string}` = 
  (import.meta.env.VITE_PLATFORM_WALLET as `0x${string}`) || 
  '0x742d35Cc5E6C4b8b4f1C8aF6260a3F0a1b5C4eE0'

// Governance constants
export const GOVERNANCE_CONFIG = {
  votingDelay: 7200,        // ~1 day in blocks (12s per block on Base)
  votingPeriod: 50400,      // ~7 days in blocks
  proposalThreshold: '100000', // 100,000 RMX to create proposal
  quorumPercentage: 4,      // 4% of total supply
  timelockDelay: 172800,    // 48 hours in seconds
} as const

// Vesting constants
export const VESTING_CONFIG = {
  teamCliffMonths: 6,
  teamVestingMonths: 24,
  partnershipRevocable: true,
  teamRevocable: false,
} as const
