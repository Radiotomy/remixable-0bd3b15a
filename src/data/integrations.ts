export interface Integration {
  id: string;
  name: string;
  description: string;
  category: 'free' | 'api-key' | 'premium';
  status: 'ready' | 'setup-required' | 'coming-soon';
  icon: string;
  complexity: 'easy' | 'medium' | 'advanced';
  estimatedSetupTime: string;
  costInfo?: string;
  tags: string[];
  documentation?: string;
  features: string[];
  type: 'web3' | 'ai' | 'payments' | 'communication' | 'storage' | 'analytics' | 'social' | 'defi' | 'developer';
}

export const integrations: Integration[] = [
  // Currently Ready Integrations
  {
    id: 'supabase',
    name: 'Supabase',
    description: 'Complete backend solution with database, auth, and real-time features',
    category: 'free',
    status: 'ready',
    icon: '🗄️',
    complexity: 'easy',
    estimatedSetupTime: '2 minutes',
    tags: ['database', 'auth', 'real-time', 'backend'],
    features: ['PostgreSQL Database', 'User Authentication', 'Real-time subscriptions', 'File Storage'],
    type: 'storage'
  },
  {
    id: 'fireproof',
    name: 'Fireproof',
    description: 'Local-first database with real-time sync capabilities',
    category: 'free',
    status: 'ready',
    icon: '🔥',
    complexity: 'easy',
    estimatedSetupTime: '1 minute',
    tags: ['database', 'local-first', 'sync'],
    features: ['Local Storage', 'Real-time Sync', 'Offline Support', 'Encryption'],
    type: 'storage'
  },
  {
    id: 'base-chain',
    name: 'Base Chain',
    description: 'Ethereum L2 blockchain with low fees and fast transactions',
    category: 'free',
    status: 'ready',
    icon: '🔵',
    complexity: 'easy',
    estimatedSetupTime: '1 minute',
    tags: ['blockchain', 'ethereum', 'l2'],
    features: ['Low Gas Fees', 'Fast Transactions', 'Ethereum Compatible', 'Coinbase Integration'],
    type: 'web3'
  },
  {
    id: 'wallet-connect',
    name: 'Wallet Connection',
    description: 'Connect to popular Web3 wallets including Coinbase Wallet',
    category: 'free',
    status: 'ready',
    icon: '👛',
    complexity: 'easy',
    estimatedSetupTime: '1 minute',
    tags: ['wallet', 'web3', 'connection'],
    features: ['Multiple Wallets', 'Secure Connection', 'Transaction Signing', 'Balance Checking'],
    type: 'web3'
  },
  {
    id: 'usdc-payments',
    name: 'USDC Payments',
    description: 'Accept cryptocurrency payments with USDC stablecoin',
    category: 'free',
    status: 'ready',
    icon: '💰',
    complexity: 'medium',
    estimatedSetupTime: '5 minutes',
    tags: ['payments', 'crypto', 'stablecoin'],
    features: ['Stable Value', 'Fast Settlement', 'Global Access', 'Low Fees'],
    type: 'payments'
  },

  // API Key Required Integrations
  {
    id: 'openrouter',
    name: 'OpenRouter AI',
    description: 'Access 20+ AI models including GPT-4, Claude, and Gemini',
    category: 'api-key',
    status: 'ready',
    icon: '🤖',
    complexity: 'easy',
    estimatedSetupTime: '3 minutes',
    costInfo: 'Pay-per-use, starts at $0.01 per 1K tokens',
    tags: ['ai', 'llm', 'generation'],
    features: ['20+ AI Models', 'Code Generation', 'Text Processing', 'Image Analysis'],
    type: 'ai'
  },
  {
    id: 'stripe',
    name: 'Stripe Payments',
    description: 'Accept credit cards, subscriptions, and digital payments',
    category: 'api-key',
    status: 'ready',
    icon: '💳',
    complexity: 'medium',
    estimatedSetupTime: '10 minutes',
    costInfo: '2.9% + $0.30 per transaction',
    tags: ['payments', 'subscriptions', 'credit-cards'],
    features: ['Credit Cards', 'Subscriptions', 'Invoicing', 'Global Support'],
    type: 'payments'
  },

  // Free/Open Source - Coming Soon
  {
    id: 'rainbow-kit',
    name: 'Rainbow Kit',
    description: 'Beautiful wallet connection UI with extensive wallet support',
    category: 'free',
    status: 'coming-soon',
    icon: '🌈',
    complexity: 'easy',
    estimatedSetupTime: '5 minutes',
    tags: ['wallet', 'ui', 'web3'],
    features: ['Beautiful UI', '100+ Wallets', 'Custom Themes', 'Mobile Support'],
    type: 'web3'
  },
  {
    id: 'the-graph',
    name: 'The Graph',
    description: 'Decentralized protocol for indexing and querying blockchain data',
    category: 'free',
    status: 'coming-soon',
    icon: '📊',
    complexity: 'advanced',
    estimatedSetupTime: '30 minutes',
    tags: ['indexing', 'graphql', 'blockchain'],
    features: ['GraphQL API', 'Real-time Data', 'Decentralized', 'Multi-chain'],
    type: 'web3'
  },
  {
    id: 'ipfs',
    name: 'IPFS Storage',
    description: 'Decentralized file storage with Pinata integration',
    category: 'free',
    status: 'coming-soon',
    icon: '📁',
    complexity: 'medium',
    estimatedSetupTime: '15 minutes',
    tags: ['storage', 'decentralized', 'files'],
    features: ['Decentralized Storage', 'Content Addressing', 'Permanent Links', 'CDN Integration'],
    type: 'storage'
  },
  {
    id: 'ens',
    name: 'ENS Domains',
    description: 'Ethereum Name Service for human-readable blockchain addresses',
    category: 'free',
    status: 'coming-soon',
    icon: '🏷️',
    complexity: 'medium',
    estimatedSetupTime: '10 minutes',
    tags: ['domains', 'identity', 'ethereum'],
    features: ['Human Readable Names', 'Reverse Resolution', 'Metadata', 'Cross-chain'],
    type: 'web3'
  },

  // DeFi Protocols
  {
    id: 'uniswap',
    name: 'Uniswap V3',
    description: 'Decentralized exchange protocol for token swapping',
    category: 'free',
    status: 'coming-soon',
    icon: '🦄',
    complexity: 'advanced',
    estimatedSetupTime: '45 minutes',
    tags: ['dex', 'swap', 'amm'],
    features: ['Token Swapping', 'Liquidity Provision', 'Price Oracles', 'Concentrated Liquidity'],
    type: 'defi'
  },
  {
    id: 'aave',
    name: 'Aave Protocol',
    description: 'Decentralized lending and borrowing protocol',
    category: 'free',
    status: 'coming-soon',
    icon: '👻',
    complexity: 'advanced',
    estimatedSetupTime: '60 minutes',
    tags: ['lending', 'borrowing', 'defi'],
    features: ['Lending', 'Borrowing', 'Flash Loans', 'Yield Farming'],
    type: 'defi'
  },
  {
    id: 'compound',
    name: 'Compound Finance',
    description: 'Algorithmic money markets for lending and borrowing',
    category: 'free',
    status: 'coming-soon',
    icon: '🏛️',
    complexity: 'advanced',
    estimatedSetupTime: '60 minutes',
    tags: ['lending', 'interest', 'defi'],
    features: ['Algorithmic Interest', 'cTokens', 'Governance', 'Liquidation'],
    type: 'defi'
  },

  // API Key Required Services
  {
    id: 'openai',
    name: 'OpenAI API',
    description: 'GPT models, DALL-E image generation, and Whisper speech recognition',
    category: 'api-key',
    status: 'coming-soon',
    icon: '🧠',
    complexity: 'easy',
    estimatedSetupTime: '5 minutes',
    costInfo: 'Starting at $0.002 per 1K tokens',
    tags: ['ai', 'gpt', 'image-generation'],
    features: ['GPT Models', 'Image Generation', 'Speech Recognition', 'Fine-tuning'],
    type: 'ai'
  },
  {
    id: 'anthropic',
    name: 'Anthropic Claude',
    description: 'Advanced AI assistant with large context windows',
    category: 'api-key',
    status: 'coming-soon',
    icon: '🎭',
    complexity: 'easy',
    estimatedSetupTime: '5 minutes',
    costInfo: 'Starting at $0.008 per 1K tokens',
    tags: ['ai', 'claude', 'assistant'],
    features: ['Large Context', 'Code Analysis', 'Document Processing', 'Reasoning'],
    type: 'ai'
  },
  {
    id: 'sendgrid',
    name: 'SendGrid Email',
    description: 'Reliable email delivery service with templates and analytics',
    category: 'api-key',
    status: 'coming-soon',
    icon: '📧',
    complexity: 'easy',
    estimatedSetupTime: '10 minutes',
    costInfo: 'Free tier: 100 emails/day, then $14.95/month',
    tags: ['email', 'templates', 'analytics'],
    features: ['Email Templates', 'Analytics', 'A/B Testing', 'Global Delivery'],
    type: 'communication'
  },
  {
    id: 'twilio',
    name: 'Twilio SMS',
    description: 'SMS, voice, and video communication APIs',
    category: 'api-key',
    status: 'coming-soon',
    icon: '📱',
    complexity: 'medium',
    estimatedSetupTime: '15 minutes',
    costInfo: 'Pay-per-use, SMS from $0.0075',
    tags: ['sms', 'voice', 'communication'],
    features: ['SMS Messaging', 'Voice Calls', 'Video Chat', 'Phone Numbers'],
    type: 'communication'
  },
  {
    id: 'google-maps',
    name: 'Google Maps',
    description: 'Maps, geocoding, and location services',
    category: 'api-key',
    status: 'coming-soon',
    icon: '🗺️',
    complexity: 'medium',
    estimatedSetupTime: '20 minutes',
    costInfo: '$200 monthly credit, then pay-per-use',
    tags: ['maps', 'location', 'geocoding'],
    features: ['Interactive Maps', 'Geocoding', 'Places API', 'Directions'],
    type: 'storage'
  },
  {
    id: 'github',
    name: 'GitHub API',
    description: 'Repository management, issue tracking, and CI/CD integration',
    category: 'api-key',
    status: 'coming-soon',
    icon: '🐙',
    complexity: 'medium',
    estimatedSetupTime: '15 minutes',
    costInfo: 'Free for public repos, GitHub Pro for private',
    tags: ['git', 'repositories', 'ci-cd'],
    features: ['Repository Access', 'Issue Management', 'Pull Requests', 'Actions'],
    type: 'developer'
  },

  // Social Media APIs
  {
    id: 'twitter',
    name: 'Twitter/X API',
    description: 'Post tweets, read timelines, and analyze social data',
    category: 'api-key',
    status: 'coming-soon',
    icon: '🐦',
    complexity: 'medium',
    estimatedSetupTime: '25 minutes',
    costInfo: 'Basic: $100/month, Pro: $5,000/month',
    tags: ['social', 'posting', 'analytics'],
    features: ['Tweet Posting', 'Timeline Reading', 'User Analytics', 'Direct Messages'],
    type: 'social'
  },
  {
    id: 'discord',
    name: 'Discord Bot API',
    description: 'Create Discord bots for community engagement',
    category: 'api-key',
    status: 'coming-soon',
    icon: '💬',
    complexity: 'medium',
    estimatedSetupTime: '30 minutes',
    costInfo: 'Free for most use cases',
    tags: ['discord', 'bot', 'community'],
    features: ['Message Handling', 'Slash Commands', 'Role Management', 'Voice Integration'],
    type: 'social'
  },

  // Analytics & Monitoring
  {
    id: 'google-analytics',
    name: 'Google Analytics',
    description: 'Web analytics and user behavior tracking',
    category: 'api-key',
    status: 'coming-soon',
    icon: '📈',
    complexity: 'easy',
    estimatedSetupTime: '10 minutes',
    costInfo: 'Free tier available, GA4 Premium from $50k/year',
    tags: ['analytics', 'tracking', 'insights'],
    features: ['User Tracking', 'Conversion Analysis', 'Real-time Data', 'Custom Reports'],
    type: 'analytics'
  },
  {
    id: 'mixpanel',
    name: 'Mixpanel',
    description: 'Product analytics with event tracking and user segmentation',
    category: 'api-key',
    status: 'coming-soon',
    icon: '🎯',
    complexity: 'medium',
    estimatedSetupTime: '20 minutes',
    costInfo: 'Free tier: 20M events, then $20/month',
    tags: ['analytics', 'events', 'segmentation'],
    features: ['Event Tracking', 'User Segmentation', 'Funnel Analysis', 'A/B Testing'],
    type: 'analytics'
  }
];

export const getIntegrationsByCategory = (category: Integration['category']) => {
  return integrations.filter(integration => integration.category === category);
};

export const getIntegrationsByType = (type: Integration['type']) => {
  return integrations.filter(integration => integration.type === type);
};

export const getIntegrationsByStatus = (status: Integration['status']) => {
  return integrations.filter(integration => integration.status === status);
};