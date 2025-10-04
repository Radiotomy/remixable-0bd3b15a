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
    id: 'openai/gpt-5-2025-08-07',
    name: 'GPT-5',
    provider: 'OpenAI',
    category: 'code',
    tier: 'flagship',
    pricing: { input: 2.5, output: 10, currency: 'USD' },
    contextLength: 200000,
    description: 'OpenAI flagship with exceptional reasoning and broad knowledge',
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
    id: 'openai/gpt-5-mini-2025-08-07',
    name: 'GPT-5 Mini',
    provider: 'OpenAI',
    category: 'code',
    tier: 'balanced',
    pricing: { input: 0.15, output: 0.6, currency: 'USD' },
    contextLength: 200000,
    description: 'Cost-efficient GPT-5 variant with strong performance',
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
      'Good for most tasks'
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

  // Google Models
  {
    id: 'google/gemini-2.5-pro',
    name: 'Gemini 2.5 Pro',
    provider: 'Google',
    category: 'code',
    tier: 'flagship',
    pricing: { input: 1.25, output: 5, currency: 'USD' },
    contextLength: 2000000,
    description: 'Massive context window for handling large codebases',
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
    description: 'Fast and affordable with excellent multimodal support',
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
      'Slightly less nuanced than flagship models'
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

  // Specialized Models
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
        CODE_GENERATION_MODELS.find(m => m.id === 'openai/gpt-5-2025-08-07')!,
        CODE_GENERATION_MODELS.find(m => m.id === 'google/gemini-2.5-pro')!
      ],
      reasoning: 'Complex projects need superior reasoning and architectural capabilities. Claude Opus 4 excels at understanding intricate requirements and making sound design decisions.'
    };
  }

  // Large codebase analysis
  if (projectLower.includes('refactor') || projectLower.includes('legacy') || projectLower.includes('migration')) {
    return {
      primary: CODE_GENERATION_MODELS.find(m => m.id === 'google/gemini-2.5-pro')!,
      alternatives: [
        CODE_GENERATION_MODELS.find(m => m.id === 'anthropic/claude-opus-4-20250514')!,
        CODE_GENERATION_MODELS.find(m => m.id === 'anthropic/claude-sonnet-4-20250514')!
      ],
      reasoning: 'The 2M token context window of Gemini 2.5 Pro allows it to analyze entire codebases at once, making it ideal for refactoring and migration projects.'
    };
  }

  // Algorithm-heavy projects
  if (projectLower.includes('algorithm') || projectLower.includes('data structure') || projectLower.includes('backend')) {
    return {
      primary: CODE_GENERATION_MODELS.find(m => m.id === 'deepseek/deepseek-coder-v2')!,
      alternatives: [
        CODE_GENERATION_MODELS.find(m => m.id === 'anthropic/claude-sonnet-4-20250514')!,
        CODE_GENERATION_MODELS.find(m => m.id === 'openai/gpt-5-mini-2025-08-07')!
      ],
      reasoning: 'DeepSeek Coder V2 specializes in algorithmic thinking and data structures, offering excellent performance at a lower cost for backend-focused work.'
    };
  }

  // Budget-conscious / MVP / Startup
  if (complexity === 'simple' || projectLower.includes('mvp') || projectLower.includes('prototype') || projectLower.includes('startup')) {
    return {
      primary: CODE_GENERATION_MODELS.find(m => m.id === 'openai/gpt-5-mini-2025-08-07')!,
      alternatives: [
        CODE_GENERATION_MODELS.find(m => m.id === 'google/gemini-2.5-flash')!,
        CODE_GENERATION_MODELS.find(m => m.id === 'anthropic/claude-3-5-haiku-20241022')!
      ],
      reasoning: 'GPT-5 Mini offers excellent performance at a fraction of the cost, perfect for startups and MVPs that need to move fast without breaking the bank.'
    };
  }

  // Standard web apps (default)
  return {
    primary: CODE_GENERATION_MODELS.find(m => m.id === 'anthropic/claude-sonnet-4-20250514')!,
    alternatives: [
      CODE_GENERATION_MODELS.find(m => m.id === 'openai/gpt-5-mini-2025-08-07')!,
      CODE_GENERATION_MODELS.find(m => m.id === 'google/gemini-2.5-flash')!
    ],
    reasoning: 'Claude Sonnet 4 provides the best balance of intelligence, speed, and cost for typical web applications. It excels at React, TypeScript, and modern frameworks.'
  };
}
