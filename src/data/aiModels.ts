export interface AIModelCapability {
  name: string;
  rating: 1 | 2 | 3 | 4 | 5; // 1=poor, 5=excellent
}

export interface AIModel {
  id: string;
  name: string;
  provider: string;
  category: 'code' | 'text' | 'image';
  tier: 'flagship' | 'balanced' | 'fast' | 'specialized';
  pricing: {
    input: number;  // per 1M tokens
    output: number; // per 1M tokens
    currency: string;
  };
  contextLength: number;
  description: string;
  capabilities: AIModelCapability[];
  strengths: string[];
  weaknesses: string[];
  bestFor: string[];
  recommended: boolean;
  releaseDate?: string;
}

export const CODE_GENERATION_MODELS: AIModel[] = [
  // Anthropic Models
  {
    id: 'anthropic/claude-opus-4-20250514',
    name: 'Claude Opus 4',
    provider: 'Anthropic',
    category: 'code',
    tier: 'flagship',
    pricing: { input: 15, output: 75, currency: 'USD' },
    contextLength: 200000,
    description: 'Most intelligent model with superior reasoning for complex applications',
    capabilities: [
      { name: 'Code Generation', rating: 5 },
      { name: 'Debugging', rating: 5 },
      { name: 'Architecture Design', rating: 5 },
      { name: 'Refactoring', rating: 5 },
      { name: 'Documentation', rating: 5 }
    ],
    strengths: [
      'Exceptional reasoning for complex systems',
      'Outstanding at understanding business requirements',
      'Best-in-class for full-stack applications',
      'Superior at architectural decisions'
    ],
    weaknesses: [
      'Most expensive option',
      'Slower response times',
      'Overkill for simple tasks'
    ],
    bestFor: [
      'Enterprise applications',
      'Complex full-stack projects',
      'Systems requiring deep reasoning',
      'Large-scale refactoring'
    ],
    recommended: true,
    releaseDate: '2025-05'
  },
  {
    id: 'anthropic/claude-sonnet-4-20250514',
    name: 'Claude Sonnet 4',
    provider: 'Anthropic',
    category: 'code',
    tier: 'balanced',
    pricing: { input: 3, output: 15, currency: 'USD' },
    contextLength: 200000,
    description: 'Perfect balance of intelligence and speed for most coding tasks',
    capabilities: [
      { name: 'Code Generation', rating: 5 },
      { name: 'Debugging', rating: 5 },
      { name: 'Architecture Design', rating: 4 },
      { name: 'Refactoring', rating: 5 },
      { name: 'Documentation', rating: 5 }
    ],
    strengths: [
      'Excellent cost-performance ratio',
      'Fast response times',
      'Great at modern frameworks (React, Next.js)',
      'Strong TypeScript support'
    ],
    weaknesses: [
      'Slightly less nuanced than Opus for very complex problems'
    ],
    bestFor: [
      'Most web applications',
      'React/TypeScript projects',
      'API development',
      'Standard CRUD apps'
    ],
    recommended: true,
    releaseDate: '2025-05'
  },
  {
    id: 'anthropic/claude-3-5-haiku-20241022',
    name: 'Claude 3.5 Haiku',
    provider: 'Anthropic',
    category: 'code',
    tier: 'fast',
    pricing: { input: 0.8, output: 4, currency: 'USD' },
    contextLength: 200000,
    description: 'Fastest Claude model for quick iterations and simple components',
    capabilities: [
      { name: 'Code Generation', rating: 4 },
      { name: 'Debugging', rating: 4 },
      { name: 'Architecture Design', rating: 3 },
      { name: 'Refactoring', rating: 4 },
      { name: 'Documentation', rating: 4 }
    ],
    strengths: [
      'Very fast response times',
      'Cost-effective',
      'Good for rapid prototyping'
    ],
    weaknesses: [
      'Less capable with complex logic',
      'May need more guidance'
    ],
    bestFor: [
      'Simple components',
      'UI iterations',
      'Quick prototypes',
      'Learning projects'
    ],
    recommended: false,
    releaseDate: '2024-10'
  },

  // OpenAI Models
  {
    id: 'openai/gpt-5.2',
    name: 'GPT-5.2',
    provider: 'OpenAI',
    category: 'code',
    tier: 'flagship',
    pricing: { input: 3, output: 12, currency: 'USD' },
    contextLength: 256000,
    description: 'OpenAI\'s latest with enhanced reasoning capabilities for complex problem-solving',
    capabilities: [
      { name: 'Code Generation', rating: 5 },
      { name: 'Debugging', rating: 5 },
      { name: 'Architecture Design', rating: 5 },
      { name: 'Refactoring', rating: 5 },
      { name: 'Documentation', rating: 5 }
    ],
    strengths: [
      'Enhanced reasoning over GPT-5',
      'Excellent for complex problem-solving',
      'Superior at multi-step planning',
      'Best-in-class code understanding'
    ],
    weaknesses: [
      'Higher cost than GPT-5',
      'May be slower for simple tasks'
    ],
    bestFor: [
      'Complex algorithmic challenges',
      'Multi-step code transformations',
      'Advanced debugging',
      'System design'
    ],
    recommended: true,
    releaseDate: '2025-12'
  },
  {
    id: 'openai/gpt-5',
    name: 'GPT-5',
    provider: 'OpenAI',
    category: 'code',
    tier: 'flagship',
    pricing: { input: 2.5, output: 10, currency: 'USD' },
    contextLength: 200000,
    description: 'Powerful all-rounder with excellent reasoning, long context, and multimodal support',
    capabilities: [
      { name: 'Code Generation', rating: 5 },
      { name: 'Debugging', rating: 5 },
      { name: 'Architecture Design', rating: 5 },
      { name: 'Refactoring', rating: 5 },
      { name: 'Documentation', rating: 5 }
    ],
    strengths: [
      'Excellent at understanding context',
      'Strong with diverse tech stacks',
      'Great documentation generation',
      'Well-rounded capabilities'
    ],
    weaknesses: [
      'Can be verbose',
      'Higher pricing tier'
    ],
    bestFor: [
      'Multi-language projects',
      'Complex business logic',
      'Documentation-heavy projects',
      'Cross-platform development'
    ],
    recommended: true,
    releaseDate: '2025-08'
  },
  {
    id: 'openai/gpt-5-mini',
    name: 'GPT-5 Mini',
    provider: 'OpenAI',
    category: 'code',
    tier: 'balanced',
    pricing: { input: 0.15, output: 0.6, currency: 'USD' },
    contextLength: 200000,
    description: 'Middle ground with lower cost while keeping most reasoning strengths',
    capabilities: [
      { name: 'Code Generation', rating: 4 },
      { name: 'Debugging', rating: 4 },
      { name: 'Architecture Design', rating: 4 },
      { name: 'Refactoring', rating: 4 },
      { name: 'Documentation', rating: 4 }
    ],
    strengths: [
      'Excellent value for money',
      'Fast responses',
      'Good for most tasks',
      'Keeps most GPT-5 capabilities'
    ],
    weaknesses: [
      'Slightly less capable than full GPT-5'
    ],
    bestFor: [
      'Budget-conscious projects',
      'Startups and MVPs',
      'Standard web apps',
      'Iterative development'
    ],
    recommended: true,
    releaseDate: '2025-08'
  },
  {
    id: 'openai/gpt-5-nano',
    name: 'GPT-5 Nano',
    provider: 'OpenAI',
    category: 'code',
    tier: 'fast',
    pricing: { input: 0.05, output: 0.2, currency: 'USD' },
    contextLength: 128000,
    description: 'Designed for speed and cost savings on high-volume simple tasks',
    capabilities: [
      { name: 'Code Generation', rating: 3 },
      { name: 'Debugging', rating: 3 },
      { name: 'Architecture Design', rating: 2 },
      { name: 'Refactoring', rating: 3 },
      { name: 'Documentation', rating: 3 }
    ],
    strengths: [
      'Extremely cost-effective',
      'Very fast response times',
      'Great for high-volume tasks'
    ],
    weaknesses: [
      'Lower performance on hard reasoning',
      'Less nuanced outputs',
      'May struggle with edge cases'
    ],
    bestFor: [
      'Simple code completions',
      'High-volume simple tasks',
      'Quick utility scripts',
      'Basic CRUD operations'
    ],
    recommended: false,
    releaseDate: '2025-08'
  },

  // Google Gemini Models
  {
    id: 'google/gemini-3-pro-preview',
    name: 'Gemini 3 Pro Preview',
    provider: 'Google',
    category: 'code',
    tier: 'flagship',
    pricing: { input: 1.5, output: 6, currency: 'USD' },
    contextLength: 2000000,
    description: 'Next-generation Gemini Pro with enhanced reasoning and massive context',
    capabilities: [
      { name: 'Code Generation', rating: 5 },
      { name: 'Debugging', rating: 5 },
      { name: 'Architecture Design', rating: 5 },
      { name: 'Refactoring', rating: 5 },
      { name: 'Documentation', rating: 5 }
    ],
    strengths: [
      'Massive 2M token context',
      'Enhanced reasoning over 2.5 Pro',
      'Can process entire large codebases',
      'Strong multimodal capabilities'
    ],
    weaknesses: [
      'Preview version may have quirks',
      'Can be slower with full context'
    ],
    bestFor: [
      'Very large codebase analysis',
      'Complex refactoring projects',
      'Enterprise migrations',
      'Multi-repository analysis'
    ],
    recommended: true,
    releaseDate: '2025-12'
  },
  {
    id: 'google/gemini-3-flash-preview',
    name: 'Gemini 3 Flash Preview',
    provider: 'Google',
    category: 'code',
    tier: 'balanced',
    pricing: { input: 0.1, output: 0.4, currency: 'USD' },
    contextLength: 1000000,
    description: 'Fast preview of next-gen Gemini with balanced speed and capability',
    capabilities: [
      { name: 'Code Generation', rating: 5 },
      { name: 'Debugging', rating: 4 },
      { name: 'Architecture Design', rating: 4 },
      { name: 'Refactoring', rating: 4 },
      { name: 'Documentation', rating: 4 }
    ],
    strengths: [
      'Excellent speed-to-quality ratio',
      'Large context window',
      'Very cost-effective',
      'Great for rapid iteration'
    ],
    weaknesses: [
      'Preview version - may have occasional issues',
      'Slightly less nuanced than Pro'
    ],
    bestFor: [
      'Daily development tasks',
      'Rapid prototyping',
      'Code generation at scale',
      'Team collaboration'
    ],
    recommended: true,
    releaseDate: '2025-12'
  },
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    category: 'code',
    tier: 'flagship',
    pricing: { input: 1.25, output: 5, currency: 'USD' },
    contextLength: 2000000,
    description: 'Top-tier Gemini for visual + text, big context, and complex reasoning',
    capabilities: [
      { name: 'Code Generation', rating: 5 },
      { name: 'Debugging', rating: 5 },
      { name: 'Architecture Design', rating: 4 },
      { name: 'Refactoring', rating: 5 },
      { name: 'Documentation', rating: 4 }
    ],
    strengths: [
      'Enormous 2M token context',
      'Can process entire codebases',
      'Excellent at code analysis',
      'Strong multimodal capabilities'
    ],
    weaknesses: [
      'Can be slower with large contexts',
      'Sometimes overly detailed'
    ],
    bestFor: [
      'Large codebase analysis',
      'Legacy code modernization',
      'Multi-file refactoring',
      'Code review and auditing'
    ],
    recommended: true,
    releaseDate: '2025'
  },
  {
    id: 'google/gemini-2.5-flash',
    name: 'Gemini 2.5 Flash',
    provider: 'Google',
    category: 'code',
    tier: 'balanced',
    pricing: { input: 0.075, output: 0.3, currency: 'USD' },
    contextLength: 1000000,
    description: 'Balanced Gemini with good multimodal and reasoning at lower cost',
    capabilities: [
      { name: 'Code Generation', rating: 4 },
      { name: 'Debugging', rating: 4 },
      { name: 'Architecture Design', rating: 4 },
      { name: 'Refactoring', rating: 4 },
      { name: 'Documentation', rating: 4 }
    ],
    strengths: [
      'Very cost-effective',
      'Fast response times',
      'Large context window',
      'Great for rapid development'
    ],
    weaknesses: [
      'Slightly less nuanced than Pro models'
    ],
    bestFor: [
      'High-volume development',
      'Prototyping',
      'Code generation at scale',
      'Team collaboration tools'
    ],
    recommended: true,
    releaseDate: '2025'
  },
  {
    id: 'google/gemini-2.5-flash-lite',
    name: 'Gemini 2.5 Flash Lite',
    provider: 'Google',
    category: 'code',
    tier: 'fast',
    pricing: { input: 0.02, output: 0.08, currency: 'USD' },
    contextLength: 500000,
    description: 'Fastest and cheapest Gemini for simple workloads',
    capabilities: [
      { name: 'Code Generation', rating: 3 },
      { name: 'Debugging', rating: 3 },
      { name: 'Architecture Design', rating: 2 },
      { name: 'Refactoring', rating: 3 },
      { name: 'Documentation', rating: 3 }
    ],
    strengths: [
      'Extremely fast',
      'Lowest cost option',
      'Good for classification tasks',
      'Efficient for simple code'
    ],
    weaknesses: [
      'Weakest on nuance and complexity',
      'Limited reasoning capabilities'
    ],
    bestFor: [
      'Code classification',
      'Simple summarization',
      'Basic completions',
      'High-volume simple tasks'
    ],
    recommended: false,
    releaseDate: '2025'
  },

  // Specialized Models
  {
    id: 'deepseek/deepseek-coder-v3',
    name: 'DeepSeek Coder V3',
    provider: 'DeepSeek',
    category: 'code',
    tier: 'specialized',
    pricing: { input: 0.1, output: 0.2, currency: 'USD' },
    contextLength: 128000,
    description: 'Latest code-specialized model with enhanced algorithmic capabilities',
    capabilities: [
      { name: 'Code Generation', rating: 5 },
      { name: 'Debugging', rating: 4 },
      { name: 'Architecture Design', rating: 3 },
      { name: 'Refactoring', rating: 4 },
      { name: 'Documentation', rating: 3 }
    ],
    strengths: [
      'Excellent at algorithms',
      'Strong data structure handling',
      'Great for competitive programming',
      'Very cost-effective'
    ],
    weaknesses: [
      'Less strong with UI/UX',
      'Limited architectural reasoning'
    ],
    bestFor: [
      'Backend algorithms',
      'Data processing',
      'Performance optimization',
      'Mathematical code'
    ],
    recommended: false,
    releaseDate: '2025'
  },
  {
    id: 'deepseek/deepseek-coder-v2',
    name: 'DeepSeek Coder V2',
    provider: 'DeepSeek',
    category: 'code',
    tier: 'specialized',
    pricing: { input: 0.14, output: 0.28, currency: 'USD' },
    contextLength: 128000,
    description: 'Code-specialized model with strong algorithmic capabilities',
    capabilities: [
      { name: 'Code Generation', rating: 5 },
      { name: 'Debugging', rating: 4 },
      { name: 'Architecture Design', rating: 3 },
      { name: 'Refactoring', rating: 4 },
      { name: 'Documentation', rating: 3 }
    ],
    strengths: [
      'Excellent at algorithms',
      'Strong with data structures',
      'Good for competitive programming',
      'Cost-effective'
    ],
    weaknesses: [
      'Less strong with UI/UX',
      'Limited architectural reasoning'
    ],
    bestFor: [
      'Backend algorithms',
      'Data processing',
      'Performance optimization',
      'Mathematical code'
    ],
    recommended: false,
    releaseDate: '2024'
  },
  {
    id: 'meta-llama/llama-3.3-70b-instruct',
    name: 'Llama 3.3 70B',
    provider: 'Meta',
    category: 'code',
    tier: 'balanced',
    pricing: { input: 0.4, output: 0.4, currency: 'USD' },
    contextLength: 128000,
    description: 'Latest Llama with improved code generation and instruction following',
    capabilities: [
      { name: 'Code Generation', rating: 4 },
      { name: 'Debugging', rating: 4 },
      { name: 'Architecture Design', rating: 3 },
      { name: 'Refactoring', rating: 4 },
      { name: 'Documentation', rating: 4 }
    ],
    strengths: [
      'Open-source friendly',
      'Improved instruction following',
      'Strong with Python and JavaScript',
      'Good cost-performance ratio'
    ],
    weaknesses: [
      'Less capable than flagship models',
      'May need more specific prompting'
    ],
    bestFor: [
      'Open-source projects',
      'Standard web development',
      'Learning purposes',
      'Privacy-sensitive projects'
    ],
    recommended: false,
    releaseDate: '2024-12'
  },
  {
    id: 'meta-llama/codellama-70b-instruct',
    name: 'CodeLlama 70B',
    provider: 'Meta',
    category: 'code',
    tier: 'specialized',
    pricing: { input: 0.9, output: 0.9, currency: 'USD' },
    contextLength: 100000,
    description: 'Open-source code specialist with strong completion capabilities',
    capabilities: [
      { name: 'Code Generation', rating: 4 },
      { name: 'Debugging', rating: 4 },
      { name: 'Architecture Design', rating: 3 },
      { name: 'Refactoring', rating: 3 },
      { name: 'Documentation', rating: 3 }
    ],
    strengths: [
      'Open-source friendly',
      'Good code completion',
      'Strong with Python and JavaScript'
    ],
    weaknesses: [
      'Weaker at complex reasoning',
      'Less up-to-date knowledge'
    ],
    bestFor: [
      'Code completion',
      'Simple scripts',
      'Learning purposes',
      'Privacy-sensitive projects'
    ],
    recommended: false,
    releaseDate: '2024'
  },
  {
    id: 'qwen/qwen-2.5-coder-32b-instruct',
    name: 'Qwen 2.5 Coder',
    provider: 'Alibaba',
    category: 'code',
    tier: 'specialized',
    pricing: { input: 0.18, output: 0.18, currency: 'USD' },
    contextLength: 32768,
    description: 'Efficient code model with multilingual support',
    capabilities: [
      { name: 'Code Generation', rating: 4 },
      { name: 'Debugging', rating: 3 },
      { name: 'Architecture Design', rating: 3 },
      { name: 'Refactoring', rating: 3 },
      { name: 'Documentation', rating: 4 }
    ],
    strengths: [
      'Good multilingual code support',
      'Cost-effective',
      'Fast processing'
    ],
    weaknesses: [
      'Smaller context window',
      'Less sophisticated reasoning'
    ],
    bestFor: [
      'International projects',
      'Simple utilities',
      'Budget projects',
      'Quick scripts'
    ],
    recommended: false,
    releaseDate: '2024'
  }
];

// Image Generation Models
export const IMAGE_GENERATION_MODELS: AIModel[] = [
  {
    id: 'google/gemini-3-pro-image-preview',
    name: 'Gemini 3 Pro Image',
    provider: 'Google',
    category: 'image',
    tier: 'flagship',
    pricing: { input: 2, output: 8, currency: 'USD' },
    contextLength: 100000,
    description: 'Next-generation image generation model from Google',
    capabilities: [
      { name: 'Image Quality', rating: 5 },
      { name: 'Text Understanding', rating: 5 },
      { name: 'Style Variety', rating: 5 },
      { name: 'Consistency', rating: 4 },
      { name: 'Speed', rating: 4 }
    ],
    strengths: [
      'Excellent image quality',
      'Strong text-to-image understanding',
      'Wide style range',
      'Good at complex scenes'
    ],
    weaknesses: [
      'Preview version',
      'Higher cost'
    ],
    bestFor: [
      'High-quality app graphics',
      'Marketing materials',
      'UI design mockups',
      'Creative content'
    ],
    recommended: true,
    releaseDate: '2025-12'
  },
  {
    id: 'google/gemini-2.5-flash-image',
    name: 'Gemini 2.5 Flash Image',
    provider: 'Google',
    category: 'image',
    tier: 'balanced',
    pricing: { input: 0.5, output: 2, currency: 'USD' },
    contextLength: 50000,
    description: 'Fast image generation based on text prompts (Nano banana)',
    capabilities: [
      { name: 'Image Quality', rating: 4 },
      { name: 'Text Understanding', rating: 4 },
      { name: 'Style Variety', rating: 4 },
      { name: 'Consistency', rating: 4 },
      { name: 'Speed', rating: 5 }
    ],
    strengths: [
      'Fast generation',
      'Cost-effective',
      'Good for rapid iteration',
      'Solid quality for most uses'
    ],
    weaknesses: [
      'Less detail than Pro',
      'May struggle with complex prompts'
    ],
    bestFor: [
      'Rapid prototyping visuals',
      'Icon generation',
      'Quick mockups',
      'Social media graphics'
    ],
    recommended: true,
    releaseDate: '2025'
  }
];

export interface ModelRecommendation {
  primary: AIModel;
  alternatives: AIModel[];
  reasoning: string;
}

export function getModelRecommendation(projectType: string, complexity: 'simple' | 'medium' | 'complex'): ModelRecommendation {
  const projectLower = projectType.toLowerCase();
  
  // Enterprise/Complex projects
  if (complexity === 'complex' || projectLower.includes('enterprise') || projectLower.includes('large-scale')) {
    return {
      primary: CODE_GENERATION_MODELS.find(m => m.id === 'anthropic/claude-opus-4-20250514')!,
      alternatives: [
        CODE_GENERATION_MODELS.find(m => m.id === 'openai/gpt-5.2')!,
        CODE_GENERATION_MODELS.find(m => m.id === 'google/gemini-3-pro-preview')!
      ],
      reasoning: 'Complex projects need superior reasoning and architectural capabilities. Claude Opus 4 excels at understanding intricate requirements and making sound design decisions.'
    };
  }

  // Large codebase analysis
  if (projectLower.includes('refactor') || projectLower.includes('legacy') || projectLower.includes('migration')) {
    return {
      primary: CODE_GENERATION_MODELS.find(m => m.id === 'google/gemini-3-pro-preview')!,
      alternatives: [
        CODE_GENERATION_MODELS.find(m => m.id === 'google/gemini-2.5-pro')!,
        CODE_GENERATION_MODELS.find(m => m.id === 'anthropic/claude-opus-4-20250514')!
      ],
      reasoning: 'The 2M token context window of Gemini 3 Pro allows it to analyze entire codebases at once, making it ideal for refactoring and migration projects.'
    };
  }

  // Algorithm-heavy projects
  if (projectLower.includes('algorithm') || projectLower.includes('data structure') || projectLower.includes('backend')) {
    return {
      primary: CODE_GENERATION_MODELS.find(m => m.id === 'deepseek/deepseek-coder-v3')!,
      alternatives: [
        CODE_GENERATION_MODELS.find(m => m.id === 'anthropic/claude-sonnet-4-20250514')!,
        CODE_GENERATION_MODELS.find(m => m.id === 'openai/gpt-5-mini')!
      ],
      reasoning: 'DeepSeek Coder V3 specializes in algorithmic thinking and data structures, offering excellent performance at a lower cost for backend-focused work.'
    };
  }

  // Budget-conscious / MVP / Startup
  if (complexity === 'simple' || projectLower.includes('mvp') || projectLower.includes('prototype') || projectLower.includes('startup')) {
    return {
      primary: CODE_GENERATION_MODELS.find(m => m.id === 'google/gemini-3-flash-preview')!,
      alternatives: [
        CODE_GENERATION_MODELS.find(m => m.id === 'openai/gpt-5-mini')!,
        CODE_GENERATION_MODELS.find(m => m.id === 'google/gemini-2.5-flash')!
      ],
      reasoning: 'Gemini 3 Flash Preview offers excellent performance at a fraction of the cost, perfect for startups and MVPs that need to move fast without breaking the bank.'
    };
  }

  // Standard web apps (default)
  return {
    primary: CODE_GENERATION_MODELS.find(m => m.id === 'anthropic/claude-sonnet-4-20250514')!,
    alternatives: [
      CODE_GENERATION_MODELS.find(m => m.id === 'google/gemini-3-flash-preview')!,
      CODE_GENERATION_MODELS.find(m => m.id === 'openai/gpt-5-mini')!
    ],
    reasoning: 'Claude Sonnet 4 provides the best balance of intelligence, speed, and cost for typical web applications. It excels at React, TypeScript, and modern frameworks.'
  };
}

// Get all models combined
export function getAllModels(): AIModel[] {
  return [...CODE_GENERATION_MODELS, ...IMAGE_GENERATION_MODELS];
}

// Get model by ID
export function getModelById(id: string): AIModel | undefined {
  return getAllModels().find(m => m.id === id);
}

// Get recommended models only
export function getRecommendedModels(): AIModel[] {
  return getAllModels().filter(m => m.recommended);
}
