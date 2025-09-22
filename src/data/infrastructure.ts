export interface DatabaseOption {
  id: string;
  name: string;
  description: string;
  type: 'local-first' | 'cloud' | 'decentralized';
  cost: 'free' | 'freemium' | 'paid';
  features: string[];
  pros: string[];
  cons: string[];
  setupComplexity: 'easy' | 'medium' | 'advanced';
  recommendedFor: string[];
  monthlyEstimate?: string;
  icon: string;
}

export interface RPCProvider {
  id: string;
  name: string;
  description: string;
  cost: 'free' | 'freemium' | 'paid';
  requestsPerMonth: number;
  latency: 'low' | 'medium' | 'high';
  reliability: 'high' | 'medium' | 'low';
  features: string[];
  icon: string;
}

export interface StorageOption {
  id: string;
  name: string;
  description: string;
  type: 'centralized' | 'decentralized' | 'hybrid';
  cost: 'free' | 'freemium' | 'paid';
  features: string[];
  costPerGB?: string;
  icon: string;
}

export interface PaymasterService {
  id: string;
  name: string;
  description: string;
  cost: 'free' | 'freemium' | 'paid';
  features: string[];
  gasCredits?: string;
  icon: string;
}

// Database Options
export const databaseOptions: DatabaseOption[] = [
  {
    id: 'fireproof',
    name: 'Fireproof',
    description: 'Local-first database with real-time sync capabilities',
    type: 'local-first',
    cost: 'free',
    features: ['Local Storage', 'Real-time Sync', 'Offline Support', 'Encryption', 'CRDT Support'],
    pros: ['100% Free', 'Lightning Fast', 'Offline-First', 'Zero Configuration'],
    cons: ['Newer Technology', 'Smaller Ecosystem'],
    setupComplexity: 'easy',
    recommendedFor: ['Social Apps', 'Productivity Apps', 'Collaborative Tools'],
    icon: '🔥'
  },
  {
    id: 'orbitdb',
    name: 'OrbitDB + IPFS',
    description: 'Decentralized database built on IPFS',
    type: 'decentralized',
    cost: 'free',
    features: ['Peer-to-Peer', 'IPFS Integration', 'Eventual Consistency', 'Decentralized'],
    pros: ['Fully Decentralized', 'Censorship Resistant', 'No Single Point of Failure'],
    cons: ['Complex Setup', 'Network Dependencies', 'Eventual Consistency'],
    setupComplexity: 'advanced',
    recommendedFor: ['DeFi Apps', 'DAOs', 'Decentralized Social'],
    icon: '🌐'
  },
  {
    id: 'gunjs',
    name: 'Gun.js',
    description: 'Real-time, decentralized graph database',
    type: 'decentralized',
    cost: 'free',
    features: ['Real-time Sync', 'Graph Database', 'P2P Network', 'Offline Support'],
    pros: ['Real-time Everything', 'Easy to Use', 'Decentralized by Default'],
    cons: ['Limited Querying', 'Data Model Constraints'],
    setupComplexity: 'medium',
    recommendedFor: ['Chat Apps', 'Real-time Collaboration', 'Gaming'],
    icon: '🔫'
  },
  {
    id: 'ceramic',
    name: 'Ceramic Network',
    description: 'Decentralized data network for composable applications',
    type: 'decentralized',
    cost: 'free',
    features: ['Composable Data', 'Self-sovereign Identity', 'Cross-app Data', 'Verifiable'],
    pros: ['Data Ownership', 'Cross-platform', 'Identity Integration'],
    cons: ['Complex Concepts', 'Learning Curve'],
    setupComplexity: 'advanced',
    recommendedFor: ['Identity Apps', 'Cross-platform Data', 'Web3 Social'],
    icon: '🏺'
  },
  {
    id: 'planetscale',
    name: 'PlanetScale',
    description: 'Serverless MySQL platform with branching',
    type: 'cloud',
    cost: 'freemium',
    features: ['MySQL Compatible', 'Database Branching', 'Serverless', 'Connection Pooling'],
    pros: ['Familiar SQL', 'Great Performance', 'Branching Workflow'],
    cons: ['Vendor Lock-in', 'Cost Scaling'],
    setupComplexity: 'easy',
    recommendedFor: ['Traditional Apps', 'E-commerce', 'Content Management'],
    monthlyEstimate: 'Free tier: 1 DB, then $29/month',
    icon: '🪐'
  },
  {
    id: 'upstash',
    name: 'Upstash Redis',
    description: 'Serverless Redis for caching and real-time features',
    type: 'cloud',
    cost: 'freemium',
    features: ['Redis Compatible', 'Serverless', 'Global Replication', 'REST API'],
    pros: ['Redis Performance', 'Global Edge', 'Pay-per-request'],
    cons: ['Memory-based', 'Cost for High Usage'],
    setupComplexity: 'easy',
    recommendedFor: ['Caching', 'Sessions', 'Real-time Features'],
    monthlyEstimate: 'Free tier: 10K commands/day, then $0.2 per 100K',
    icon: '⚡'
  }
];

// RPC Providers for Base Chain
export const rpcProviders: RPCProvider[] = [
  {
    id: 'alchemy',
    name: 'Alchemy',
    description: 'Enterprise-grade RPC with enhanced APIs',
    cost: 'freemium',
    requestsPerMonth: 300000000,
    latency: 'low',
    reliability: 'high',
    features: ['Enhanced APIs', 'Webhooks', 'Debug Tools', '99.9% Uptime'],
    icon: '⚗️'
  },
  {
    id: 'quicknode',
    name: 'QuickNode',
    description: 'Fast and reliable blockchain infrastructure',
    cost: 'freemium',
    requestsPerMonth: 50000000,
    latency: 'low',
    reliability: 'high',
    features: ['Global CDN', 'WebSocket Support', 'Analytics', 'Archive Data'],
    icon: '⚡'
  },
  {
    id: 'chainbase',
    name: 'Chainbase',
    description: 'Multi-chain RPC with data indexing',
    cost: 'freemium',
    requestsPerMonth: 100000000,
    latency: 'medium',
    reliability: 'high',
    features: ['Multi-chain', 'Data APIs', 'Real-time Indexing', 'Free Tier'],
    icon: '🔗'
  },
  {
    id: 'base-public',
    name: 'Base Public RPC',
    description: 'Free public RPC provided by Base',
    cost: 'free',
    requestsPerMonth: 10000000,
    latency: 'medium',
    reliability: 'medium',
    features: ['Completely Free', 'No API Key', 'Rate Limited', 'Community Support'],
    icon: '🔵'
  }
];

// Storage Options
export const storageOptions: StorageOption[] = [
  {
    id: 'ipfs',
    name: 'IPFS + Pinata',
    description: 'Decentralized file storage with CDN',
    type: 'decentralized',
    cost: 'freemium',
    features: ['Content Addressing', 'Global CDN', 'Immutable Links', 'Version Control'],
    costPerGB: 'Free: 1GB, then $20/month for 100GB',
    icon: '📁'
  },
  {
    id: 'arweave',
    name: 'Arweave',
    description: 'Permanent decentralized storage',
    type: 'decentralized',
    cost: 'paid',
    features: ['Permanent Storage', 'Pay Once Store Forever', 'Decentralized', 'Smart Contracts'],
    costPerGB: '~$5 one-time payment per GB',
    icon: '💎'
  },
  {
    id: 'filecoin',
    name: 'Filecoin + Web3.Storage',
    description: 'Decentralized storage marketplace',
    type: 'decentralized',
    cost: 'free',
    features: ['Free Storage', 'Decentralized Network', 'Cryptographic Proofs', 'IPFS Compatible'],
    costPerGB: 'Free tier available',
    icon: '💾'
  },
  {
    id: 'supabase-storage',
    name: 'Supabase Storage',
    description: 'S3-compatible object storage',
    type: 'centralized',
    cost: 'freemium',
    features: ['S3 Compatible', 'CDN Integration', 'Image Transformations', 'Access Control'],
    costPerGB: 'Free: 1GB, then $0.021/GB',
    icon: '🗄️'
  }
];

// Paymaster Services for Gasless Transactions
export const paymasterServices: PaymasterService[] = [
  {
    id: 'coinbase-paymaster',
    name: 'Coinbase Paymaster',
    description: 'Sponsored transactions for Base apps',
    cost: 'freemium',
    features: ['Gasless Transactions', 'User Onboarding', 'Base Integration', 'Smart Wallet Support'],
    gasCredits: 'Free tier: $10 credits/month',
    icon: '🔵'
  },
  {
    id: 'pimlico',
    name: 'Pimlico',
    description: 'ERC-4337 account abstraction infrastructure',
    cost: 'freemium',
    features: ['Account Abstraction', 'Bundler Service', 'Paymaster APIs', 'Multi-chain'],
    gasCredits: 'Free tier: 100 UserOps/month',
    icon: '🏦'
  },
  {
    id: 'alchemy-aa',
    name: 'Alchemy Account Kit',
    description: 'Complete account abstraction solution',
    cost: 'freemium',
    features: ['Smart Accounts', 'Gas Sponsorship', 'Social Login', 'Recovery'],
    gasCredits: 'Free tier: 1000 sponsored txns/month',
    icon: '⚗️'
  }
];

export const getRecommendedStack = (appType: string) => {
  const recommendations = {
    'social': {
      database: 'fireproof',
      rpc: 'alchemy',
      storage: 'ipfs',
      paymaster: 'coinbase-paymaster'
    },
    'defi': {
      database: 'orbitdb',
      rpc: 'quicknode',
      storage: 'arweave',
      paymaster: 'pimlico'
    },
    'gaming': {
      database: 'gunjs',
      rpc: 'chainbase',
      storage: 'filecoin',
      paymaster: 'alchemy-aa'
    },
    'productivity': {
      database: 'fireproof',
      rpc: 'base-public',
      storage: 'supabase-storage',
      paymaster: 'coinbase-paymaster'
    },
    'default': {
      database: 'fireproof',
      rpc: 'alchemy',
      storage: 'ipfs',
      paymaster: 'coinbase-paymaster'
    }
  };

  return recommendations[appType as keyof typeof recommendations] || recommendations.default;
};