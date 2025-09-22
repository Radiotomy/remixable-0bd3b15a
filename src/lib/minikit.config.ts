export const minikitConfig = {
  // App identification
  appName: "Remixable",
  appId: "remixable-ai-builder",
  version: "1.0.0",
  
  // Farcaster integration
  farcaster: {
    // Identity verification
    identity: {
      requireVerification: true,
      allowAnonymous: false,
    },
    
    // Wallet integration
    wallet: {
      supportedChains: ["base", "ethereum"],
      enablePayments: true,
      enableTransfers: true,
    },
    
    // Notifications
    notifications: {
      enabled: true,
      channels: ["app-generated", "template-updates", "community"],
    },
    
    // Frame configuration
    frame: {
      aspectRatio: "1.91:1",
      buttons: [
        {
          text: "🚀 Build App",
          action: "post",
          target: "/api/frame/build"
        },
        {
          text: "📱 Templates", 
          action: "post",
          target: "/api/frame/templates"
        },
        {
          text: "🔗 Open Builder",
          action: "link",
          target: "https://remixable.ai"
        }
      ],
    },
  },
  
  // Base App integration
  base: {
    chainId: 8453, // Base mainnet
    contracts: {
      // App registry contract (placeholder)
      registry: "0x1234567890123456789012345678901234567890",
      // Tipping contract for social features
      tipping: "0x0987654321098765432109876543210987654321",
    },
    
    // Social features
    social: {
      enableTipping: true,
      enableSharing: true,
      enableRemixing: true,
    },
  },
  
  // AI generation settings
  ai: {
    models: {
      primary: "gpt-4-turbo",
      fallback: "gpt-3.5-turbo",
    },
    
    generation: {
      maxTokens: 4000,
      temperature: 0.7,
      topP: 0.9,
    },
    
    templates: {
      basePrompt: "You are an expert React developer. Generate a complete, functional React component based on the user's request. Use modern React patterns, TypeScript, and Tailwind CSS.",
      categories: [
        "media", "sports", "video", "social", 
        "utility", "crypto", "finance"
      ],
    },
  },
  
  // Deployment settings
  deployment: {
    platform: "vercel",
    autoPublish: true,
    customDomains: true,
    
    // GitHub integration
    github: {
      autoCommit: true,
      branchPrefix: "remixable-",
      enablePR: false,
    },
  },
  
  // Analytics and monitoring
  analytics: {
    enabled: true,
    provider: "vercel",
    events: [
      "app_generated",
      "template_used", 
      "app_published",
      "app_remixed"
    ],
  },
  
  // Rate limiting
  rateLimits: {
    generation: {
      perMinute: 5,
      perHour: 50,
      perDay: 200,
    },
    
    publishing: {
      perHour: 10,
      perDay: 50,
    },
  },
};

export type MinikitConfig = typeof minikitConfig;