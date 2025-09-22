import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateAppRequest {
  prompt: string;
  template?: string;
  category?: string;
  infrastructure?: any;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not set');
    }

    const body: GenerateAppRequest = await req.json();
    const { prompt, template, category = 'web', infrastructure } = body;

    console.log(`Generating app with OpenRouter - Prompt: ${prompt}, Category: ${category}`);

    // Generate app structure using OpenRouter
    const appStructurePrompt = `
You are an expert React/TypeScript developer and app architect. Generate a complete, production-ready web application based on this request: "${prompt}"

Create a structured JSON response with the following format:
{
  "title": "App Name",
  "description": "Brief description of the app",
  "features": ["feature1", "feature2", "feature3"],
  "code": {
    "components": {
      "App.tsx": "complete React component code with imports",
      "HomePage.tsx": "homepage component with modern UI",
      "Header.tsx": "header component with navigation",
      "Footer.tsx": "footer component"
    },
    "hooks": {
      "useAppState.ts": "custom React hook for app state management",
      "useApi.ts": "custom hook for API calls"
    },
    "utils": {
      "helpers.ts": "utility functions",
      "constants.ts": "app constants"
    },
    "types": "TypeScript interfaces and types",
    "config": "App configuration object"
  },
  "backend": {
    "schema": "SQL schema for Supabase tables if needed",
    "edgeFunctions": {
      "api-handler": "Supabase edge function code if needed"
    },
    "rls": ["RLS policy statements if needed"]
  },
  "deployment": {
    "envVars": {"NEXT_PUBLIC_APP_NAME": "value"},
    "buildCommands": ["npm run build"]
  }
}

Requirements:
- Use modern React with TypeScript
- Use Tailwind CSS for styling with semantic design tokens
- Include shadcn/ui components where appropriate
- Make it responsive and accessible
- Include proper error handling
- Add loading states and smooth animations
- Follow React best practices and hooks patterns
- Include proper TypeScript types
- Make components reusable and well-structured

Generate complete, working code that can be immediately used. Focus on the specific functionality requested in: "${prompt}"
`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          {
            role: 'system',
            content: 'You are an expert React/TypeScript developer. Generate complete, production-ready code following modern best practices. Always respond with valid JSON.'
          },
          { role: 'user', content: appStructurePrompt }
        ],
        temperature: 0.7,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('OpenRouter API error:', errorText);
      throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Raw OpenRouter response:', generatedContent);

    // Parse the generated JSON response
    let appData;
    try {
      // Clean the response to extract JSON
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }
      appData = JSON.parse(jsonMatch[0]);
    } catch (parseError) {
      console.error('Failed to parse OpenRouter response:', parseError);
      // Fallback to structured generation
      appData = await generateFallbackApp(prompt, category);
    }

    // Generate additional components if needed
    if (appData.code?.components && Object.keys(appData.code.components).length < 3) {
      const additionalComponents = await generateAdditionalComponents(prompt, appData.title, OPENROUTER_API_KEY);
      appData.code.components = { ...appData.code.components, ...additionalComponents };
    }

    console.log('App generation successful:', appData.title);

    return new Response(JSON.stringify({
      success: true,
      data: appData
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-app function:', error);
    
    // Return fallback app on error
    const fallbackApp = {
      title: "Generated App",
      description: "AI-powered web application",
      features: ["Modern UI", "Responsive Design", "TypeScript", "Tailwind CSS"],
      code: {
        components: {
          "App.tsx": `import React from 'react';
import { Header } from './Header';
import { HomePage } from './HomePage';
import { Footer } from './Footer';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <HomePage />
      <Footer />
    </div>
  );
}

export default App;`,
          "HomePage.tsx": `import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export const HomePage = () => {
  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold">Welcome to Your App</h1>
        <p className="text-xl text-muted-foreground">Built with AI-powered generation</p>
        <Button size="lg">Get Started</Button>
      </div>
    </main>
  );
};`
        }
      }
    };

    return new Response(JSON.stringify({
      success: true,
      data: fallbackApp,
      fallback: true
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function generateFallbackApp(prompt: string, category: string) {
  return {
    title: extractAppTitle(prompt),
    description: `AI-generated ${category} application based on: ${prompt}`,
    features: ["Modern React UI", "TypeScript Support", "Responsive Design", "Tailwind Styling"],
    code: {
      components: {
        "App.tsx": generateAppComponent(prompt),
        "HomePage.tsx": generateHomeComponent(prompt),
        "Header.tsx": generateHeaderComponent(prompt)
      },
      hooks: {
        "useAppState.ts": generateAppStateHook()
      },
      utils: {
        "helpers.ts": generateHelpers(),
        "constants.ts": generateConstants(prompt)
      },
      types: generateTypes(),
      config: generateConfig(prompt)
    }
  };
}

async function generateAdditionalComponents(prompt: string, appTitle: string, apiKey: string) {
  const componentsPrompt = `Generate additional React components for the app "${appTitle}" based on "${prompt}". 

Return only a JSON object with component names as keys and complete React component code as values:
{
  "ComponentName.tsx": "complete React component code with proper imports and TypeScript"
}

Generate 2-3 useful components that would enhance this specific app.`;

  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [{ role: 'user', content: componentsPrompt }],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (response.ok) {
      const data = await response.json();
      const content = data.choices[0].message.content;
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
    }
  } catch (error) {
    console.error('Failed to generate additional components:', error);
  }
  
  return {};
}

function extractAppTitle(prompt: string): string {
  const words = prompt.split(' ').slice(0, 3);
  return words.map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ') + ' App';
}

function generateAppComponent(prompt: string): string {
  return `import React from 'react';
import { Header } from './Header';
import { HomePage } from './HomePage';
import { Footer } from './Footer';
import { Toaster } from '@/components/ui/toaster';

function App() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <Header />
      <main>
        <HomePage />
      </main>
      <Footer />
      <Toaster />
    </div>
  );
}

export default App;`;
}

function generateHomeComponent(prompt: string): string {
  const title = extractAppTitle(prompt);
  return `import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Sparkles } from 'lucide-react';

export const HomePage = () => {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = () => {
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center space-y-8">
        <div className="space-y-4">
          <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            ${title}
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Welcome to your AI-generated application. Built with modern React, TypeScript, and Tailwind CSS.
          </p>
        </div>
        
        <div className="flex justify-center gap-4 flex-wrap">
          <Badge variant="secondary">React</Badge>
          <Badge variant="secondary">TypeScript</Badge>
          <Badge variant="secondary">Tailwind</Badge>
          <Badge variant="secondary">AI-Generated</Badge>
        </div>

        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              Get Started
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Button 
              onClick={handleAction}
              disabled={isLoading}
              className="w-full"
              size="lg"
            >
              {isLoading ? 'Loading...' : 'Start Using App'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};`;
}

function generateHeaderComponent(prompt: string): string {
  const title = extractAppTitle(prompt);
  return `import React from 'react';
import { Button } from '@/components/ui/button';
import { Menu, Sparkles } from 'lucide-react';

export const Header = () => {
  return (
    <header className="border-b border-border/50 bg-background/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            <span className="text-xl font-bold">${title}</span>
          </div>
          
          <nav className="hidden md:flex items-center gap-6">
            <a href="#home" className="text-muted-foreground hover:text-foreground transition-colors">
              Home
            </a>
            <a href="#features" className="text-muted-foreground hover:text-foreground transition-colors">
              Features
            </a>
            <a href="#about" className="text-muted-foreground hover:text-foreground transition-colors">
              About
            </a>
          </nav>
          
          <Button variant="outline" size="sm" className="md:hidden">
            <Menu className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </header>
  );
};`;
}

function generateAppStateHook(): string {
  return `import { useState, useCallback } from 'react';

interface AppState {
  isLoading: boolean;
  user: any | null;
  error: string | null;
}

export const useAppState = () => {
  const [state, setState] = useState<AppState>({
    isLoading: false,
    user: null,
    error: null
  });

  const setLoading = useCallback((loading: boolean) => {
    setState(prev => ({ ...prev, isLoading: loading }));
  }, []);

  const setUser = useCallback((user: any) => {
    setState(prev => ({ ...prev, user }));
  }, []);

  const setError = useCallback((error: string | null) => {
    setState(prev => ({ ...prev, error }));
  }, []);

  return {
    ...state,
    setLoading,
    setUser,
    setError
  };
};`;
}

function generateHelpers(): string {
  return `export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(date);
};

export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength) + '...';
};

export const generateId = (): string => {
  return Math.random().toString(36).substr(2, 9);
};

export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};`;
}

function generateConstants(prompt: string): string {
  return `export const APP_NAME = '${extractAppTitle(prompt)}';
export const APP_VERSION = '1.0.0';
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

export const ROUTES = {
  HOME: '/',
  ABOUT: '/about',
  CONTACT: '/contact'
} as const;

export const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
} as const;`;
}

function generateTypes(): string {
  return `export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
}

export type Theme = 'light' | 'dark' | 'system';

export interface AppConfig {
  name: string;
  version: string;
  apiUrl: string;
}`;
}

function generateConfig(prompt: string): string {
  return `export const appConfig = {
  name: '${extractAppTitle(prompt)}',
  version: '1.0.0',
  description: 'AI-generated web application',
  author: 'Remixable AI',
  homepage: '/',
  repository: '',
  license: 'MIT'
};`;
}