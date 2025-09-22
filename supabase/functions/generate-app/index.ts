import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateAppRequest {
  prompt: string;
  template?: string;
  category?: string;
  infrastructure?: {
    database: string;
    storage: string;
    rpc: string;
    paymaster?: string;
  };
  userId?: string;
}

interface GeneratedApp {
  title: string;
  description: string;
  features: string[];
  code: {
    components: Record<string, string>;
    hooks: Record<string, string>;
    utils: Record<string, string>;
    types: string;
    config: string;
  };
  backend: {
    schema: string;
    edgeFunctions: Record<string, string>;
    rls: string[];
  };
  deployment: {
    envVars: Record<string, string>;
    buildCommands: string[];
  };
}

class AppGenerator {
  private openrouterKey: string;
  private supabase: any;

  constructor() {
    this.openrouterKey = Deno.env.get('OPENROUTER_API_KEY')!;
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    this.supabase = createClient(supabaseUrl, supabaseKey);
  }

  async generateFullApp(request: GenerateAppRequest): Promise<GeneratedApp> {
    console.log('Generating full app with infrastructure:', request.infrastructure);
    
    // Analyze prompt and determine app requirements
    const analysis = await this.analyzeAppRequirements(request.prompt, request.template);
    
    // Generate React components with proper integration
    const components = await this.generateComponents(analysis, request.infrastructure);
    
    // Generate hooks and utilities
    const hooks = await this.generateHooks(analysis, request.infrastructure);
    const utils = await this.generateUtils(analysis);
    
    // Generate TypeScript types
    const types = await this.generateTypes(analysis);
    
    // Generate app configuration
    const config = await this.generateConfig(analysis, request.infrastructure);
    
    // Generate backend schema and functions
    const backend = await this.generateBackend(analysis, request.infrastructure);
    
    // Generate deployment configuration
    const deployment = await this.generateDeployment(analysis, request.infrastructure);

    return {
      title: analysis.title,
      description: analysis.description,
      features: analysis.features,
      code: {
        components,
        hooks,
        utils,
        types,
        config
      },
      backend,
      deployment
    };
  }

  private async analyzeAppRequirements(prompt: string, template?: string) {
    const systemPrompt = `You are an expert full-stack app architect. Analyze the user's request and return a comprehensive app specification.

    User prompt: "${prompt}"
    Template: ${template || 'none'}
    
    Return a detailed JSON specification with:
    - title: App name
    - description: Brief description  
    - features: Array of key features
    - dataModels: Array of data entities needed
    - apiEndpoints: Array of API endpoints needed
    - integrations: Array of third-party integrations
    - uiComponents: Array of UI components needed
    - complexity: 'simple' | 'medium' | 'complex'
    
    Focus on practical, buildable features that can be implemented with React, Supabase, and modern web APIs.`;

    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${this.openrouterKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'anthropic/claude-3.5-sonnet',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    try {
      return JSON.parse(analysisText);
    } catch (e) {
      // Fallback if JSON parsing fails
      return {
        title: 'Generated App',
        description: prompt,
        features: ['Modern UI', 'Responsive Design', 'Interactive Features'],
        dataModels: ['User', 'Content'],
        apiEndpoints: ['/api/data', '/api/users'],
        integrations: [],
        uiComponents: ['Header', 'MainContent', 'Footer'],
        complexity: 'simple'
      };
    }
  }

  private async generateComponents(analysis: any, infrastructure?: any): Promise<Record<string, string>> {
    const components: Record<string, string> = {};
    
    // Generate App.tsx with proper setup
    components['App.tsx'] = `import React from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
${infrastructure?.database === 'fireproof' ? "import { FireproofProvider } from '@/hooks/useFireproof';" : ''}
import { Header } from '@/components/Header';
import { MainContent } from '@/components/MainContent';
import { Footer } from '@/components/Footer';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      ${infrastructure?.database === 'fireproof' ? '<FireproofProvider>' : ''}
      <TooltipProvider>
        <div className="min-h-screen bg-background">
          <Header />
          <MainContent />
          <Footer />
        </div>
        <Toaster />
        <Sonner />
      </TooltipProvider>
      ${infrastructure?.database === 'fireproof' ? '</FireproofProvider>' : ''}
    </QueryClientProvider>
  );
}

export default App;`;

    // Generate Header component
    components['Header.tsx'] = `import React from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center justify-between px-4">
        <div className="flex items-center space-x-2">
          <h1 className="text-xl font-bold gradient-text">${analysis.title}</h1>
        </div>
        <nav className="flex items-center space-x-4">
          <Button variant="ghost">Home</Button>
          <Button variant="ghost">About</Button>
          <Button variant="outline">Get Started</Button>
        </nav>
      </div>
    </header>
  );
};`;

    // Generate MainContent component based on analysis
    components['MainContent.tsx'] = `import React from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
${analysis.dataModels?.includes('User') ? "import { useAuth } from '@/hooks/useAuth';" : ''}
${infrastructure?.database === 'fireproof' ? "import { useFireproofData } from '@/hooks/useFireproofData';" : ''}

export const MainContent = () => {
  ${analysis.dataModels?.includes('User') ? 'const { user, signIn, signOut } = useAuth();' : ''}
  ${infrastructure?.database === 'fireproof' ? 'const { data, loading, error } = useFireproofData();' : ''}

  return (
    <main className="container px-4 py-8 mx-auto">
      {/* Hero Section */}
      <section className="text-center space-y-6 py-16">
        <h2 className="text-4xl font-bold tracking-tight sm:text-5xl gradient-text">
          ${analysis.title}
        </h2>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          ${analysis.description}
        </p>
        <div className="flex flex-wrap justify-center gap-2 mt-4">
          ${analysis.features?.map((feature: string) => `<Badge variant="secondary">${feature}</Badge>`).join('\n          ')}
        </div>
        <Button size="lg" className="mt-6">
          Get Started
        </Button>
      </section>

      {/* Features Grid */}
      <section className="py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          ${analysis.features?.map((feature: string, i: number) => `
          <Card className="glass">
            <CardHeader>
              <CardTitle className="text-lg">${feature}</CardTitle>
              <CardDescription>
                Discover the power of ${feature.toLowerCase()} in our application.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm">
                Learn More
              </Button>
            </CardContent>
          </Card>
          `).join('')}
        </div>
      </section>

      ${infrastructure?.database === 'fireproof' ? `
      {/* Data Section */}
      <section className="py-16">
        <h3 className="text-3xl font-bold text-center mb-12">Your Data</h3>
        {loading && <div className="text-center">Loading...</div>}
        {error && <div className="text-center text-red-500">Error: {error}</div>}
        {data && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.map((item: any, index: number) => (
              <Card key={index} className="glass">
                <CardContent className="p-4">
                  <pre className="text-sm">{JSON.stringify(item, null, 2)}</pre>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>
      ` : ''}
    </main>
  );
};`;

    // Generate Footer component
    components['Footer.tsx'] = `import React from 'react';

export const Footer = () => {
  return (
    <footer className="border-t bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex items-center justify-between px-4 py-6">
        <p className="text-sm text-muted-foreground">
          © 2024 ${analysis.title}. Built with Remixable.
        </p>
        <div className="flex items-center space-x-4">
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
            Privacy
          </a>
          <a href="#" className="text-sm text-muted-foreground hover:text-foreground">
            Terms
          </a>
        </div>
      </div>
    </footer>
  );
};`;

    return components;
  }

  private async generateHooks(analysis: any, infrastructure?: any): Promise<Record<string, string>> {
    const hooks: Record<string, string> = {};

    // Generate useAuth hook if user management is needed
    if (analysis.dataModels?.includes('User')) {
      hooks['useAuth.ts'] = `import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User } from '@supabase/supabase-js';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
        setLoading(false);
      }
    );

    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { error };
  };

  const signUp = async (email: string, password: string) => {
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: \`\${window.location.origin}/\`
      }
    });
    return { error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  return {
    user,
    loading,
    signIn,
    signUp,
    signOut,
  };
};`;
    }

    // Generate Fireproof hook if selected
    if (infrastructure?.database === 'fireproof') {
      hooks['useFireproofData.ts'] = `import { useState, useEffect } from 'react';
import { useFireproof } from '@fireproof/react';

export const useFireproofData = () => {
  const { database } = useFireproof('${analysis.title.toLowerCase().replace(/\s+/g, '-')}-db');
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const result = await database.allDocs();
        setData(result.rows.map(row => row.doc));
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [database]);

  const addData = async (doc: any) => {
    try {
      const result = await database.put(doc);
      setData(prev => [...prev, result]);
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const updateData = async (id: string, updates: any) => {
    try {
      const existing = await database.get(id);
      const updated = { ...existing, ...updates };
      const result = await database.put(updated);
      setData(prev => prev.map(item => item._id === id ? result : item));
      return result;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  const deleteData = async (id: string) => {
    try {
      await database.remove(id);
      setData(prev => prev.filter(item => item._id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
      throw err;
    }
  };

  return {
    data,
    loading,
    error,
    addData,
    updateData,
    deleteData,
    database
  };
};`;
    }

    return hooks;
  }

  private async generateUtils(analysis: any): Promise<Record<string, string>> {
    return {
      'api.ts': `export const API_BASE_URL = process.env.NODE_ENV === 'production' 
  ? 'https://your-app.vercel.app' 
  : 'http://localhost:3000';

export const api = {
  async get(endpoint: string) {
    const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`);
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    return response.json();
  },

  async post(endpoint: string, data: any) {
    const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    return response.json();
  },

  async put(endpoint: string, data: any) {
    const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    return response.json();
  },

  async delete(endpoint: string) {
    const response = await fetch(\`\${API_BASE_URL}\${endpoint}\`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error(\`HTTP error! status: \${response.status}\`);
    }
    return response.json();
  }
};`
    };
  }

  private async generateTypes(analysis: any): Promise<string> {
    const dataModels = analysis.dataModels || [];
    
    let types = `// Generated TypeScript types for ${analysis.title}\n\n`;
    
    dataModels.forEach((model: string) => {
      types += `export interface ${model} {\n`;
      types += `  id: string;\n`;
      types += `  createdAt: string;\n`;
      types += `  updatedAt: string;\n`;
      
      // Add model-specific fields based on common patterns
      if (model === 'User') {
        types += `  email: string;\n`;
        types += `  name?: string;\n`;
        types += `  avatar?: string;\n`;
      } else if (model === 'Post' || model === 'Content') {
        types += `  title: string;\n`;
        types += `  content: string;\n`;
        types += `  authorId: string;\n`;
        types += `  published: boolean;\n`;
      } else {
        types += `  name: string;\n`;
        types += `  description?: string;\n`;
      }
      
      types += `}\n\n`;
    });

    types += `export interface AppConfig {\n`;
    types += `  name: string;\n`;
    types += `  version: string;\n`;
    types += `  features: string[];\n`;
    types += `}\n`;

    return types;
  }

  private async generateConfig(analysis: any, infrastructure?: any): Promise<string> {
    return `// App configuration for ${analysis.title}

export const appConfig = {
  name: "${analysis.title}",
  description: "${analysis.description}",
  version: "1.0.0",
  features: ${JSON.stringify(analysis.features || [], null, 2)},
  
  infrastructure: {
    database: "${infrastructure?.database || 'supabase'}",
    storage: "${infrastructure?.storage || 'supabase'}",
    rpc: "${infrastructure?.rpc || 'alchemy'}",
    paymaster: "${infrastructure?.paymaster || 'none'}"
  },

  api: {
    baseUrl: process.env.NODE_ENV === 'production' 
      ? 'https://your-app.vercel.app' 
      : 'http://localhost:3000',
    timeout: 10000
  },

  ui: {
    theme: {
      defaultMode: 'dark',
      colors: {
        primary: 'hsl(262.1, 83.3%, 57.8%)',
        secondary: 'hsl(220, 14.3%, 95.9%)',
        accent: 'hsl(142.1, 76.2%, 36.3%)'
      }
    }
  }
};`;
  }

  private async generateBackend(analysis: any, infrastructure?: any): Promise<any> {
    const dataModels = analysis.dataModels || [];
    let schema = '';
    let edgeFunctions: Record<string, string> = {};
    let rls: string[] = [];

    // Generate database schema
    if (dataModels.length > 0) {
      schema += `-- Database schema for ${analysis.title}\n\n`;
      
      dataModels.forEach((model: string) => {
        const tableName = model.toLowerCase() + 's';
        schema += `CREATE TABLE IF NOT EXISTS public.${tableName} (\n`;
        schema += `  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,\n`;
        schema += `  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n`;
        schema += `  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),\n`;
        
        if (model === 'User') {
          schema += `  user_id UUID REFERENCES auth.users NOT NULL,\n`;
          schema += `  email TEXT,\n`;
          schema += `  name TEXT,\n`;
          schema += `  avatar_url TEXT\n`;
        } else if (model === 'Post' || model === 'Content') {
          schema += `  title TEXT NOT NULL,\n`;
          schema += `  content TEXT,\n`;
          schema += `  user_id UUID REFERENCES auth.users NOT NULL,\n`;
          schema += `  published BOOLEAN DEFAULT false\n`;
        } else {
          schema += `  name TEXT NOT NULL,\n`;
          schema += `  description TEXT,\n`;
          schema += `  user_id UUID REFERENCES auth.users NOT NULL\n`;
        }
        
        schema += `);\n\n`;

        // Enable RLS
        schema += `ALTER TABLE public.${tableName} ENABLE ROW LEVEL SECURITY;\n\n`;

        // Add RLS policies
        rls.push(`CREATE POLICY "Users can view their own ${tableName}" ON public.${tableName} FOR SELECT USING (auth.uid() = user_id);`);
        rls.push(`CREATE POLICY "Users can create their own ${tableName}" ON public.${tableName} FOR INSERT WITH CHECK (auth.uid() = user_id);`);
        rls.push(`CREATE POLICY "Users can update their own ${tableName}" ON public.${tableName} FOR UPDATE USING (auth.uid() = user_id);`);
        rls.push(`CREATE POLICY "Users can delete their own ${tableName}" ON public.${tableName} FOR DELETE USING (auth.uid() = user_id);`);

        // Add update trigger
        schema += `CREATE TRIGGER update_${tableName}_updated_at\n`;
        schema += `  BEFORE UPDATE ON public.${tableName}\n`;
        schema += `  FOR EACH ROW\n`;
        schema += `  EXECUTE FUNCTION public.update_updated_at_column();\n\n`;
      });
    }

    // Generate API edge functions
    if (analysis.apiEndpoints?.length > 0) {
      analysis.apiEndpoints.forEach((endpoint: string) => {
        const functionName = endpoint.replace('/api/', '').replace(/\//g, '-');
        edgeFunctions[functionName] = this.generateEdgeFunction(functionName, analysis);
      });
    }

    return {
      schema,
      edgeFunctions,
      rls
    };
  }

  private generateEdgeFunction(functionName: string, analysis: any): string {
    return `import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.57.4';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey, {
      auth: { 
        persistSession: false,
        autoRefreshToken: false 
      }
    });

    // Get user from auth header
    const authHeader = req.headers.get('Authorization');
    if (authHeader) {
      const { data: { user }, error } = await supabase.auth.getUser(
        authHeader.replace('Bearer ', '')
      );
      if (error) {
        throw new Error('Unauthorized');
      }
    }

    const { method } = req;
    const url = new URL(req.url);

    switch (method) {
      case 'GET':
        // Handle GET request for ${functionName}
        const { data, error } = await supabase
          .from('${functionName}')
          .select('*');
        
        if (error) throw error;
        
        return new Response(JSON.stringify(data), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      case 'POST':
        // Handle POST request for ${functionName}
        const body = await req.json();
        const { data: insertData, error: insertError } = await supabase
          .from('${functionName}')
          .insert(body)
          .select()
          .single();
        
        if (insertError) throw insertError;
        
        return new Response(JSON.stringify(insertData), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });

      default:
        return new Response('Method not allowed', { 
          status: 405,
          headers: corsHeaders 
        });
    }

  } catch (error) {
    console.error('Error in ${functionName} function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});`;
  }

  private async generateDeployment(analysis: any, infrastructure?: any): Promise<any> {
    return {
      envVars: {
        'NEXT_PUBLIC_APP_NAME': analysis.title,
        'NEXT_PUBLIC_APP_VERSION': '1.0.0',
        'NEXT_PUBLIC_SUPABASE_URL': 'your-supabase-url',
        'NEXT_PUBLIC_SUPABASE_ANON_KEY': 'your-supabase-anon-key',
        ...(infrastructure?.rpc === 'alchemy' && {
          'NEXT_PUBLIC_ALCHEMY_API_KEY': 'your-alchemy-key'
        }),
        ...(infrastructure?.database === 'fireproof' && {
          'NEXT_PUBLIC_FIREPROOF_DB': analysis.title.toLowerCase().replace(/\s+/g, '-') + '-db'
        })
      },
      buildCommands: [
        'npm install',
        'npm run build',
        'npm run start'
      ]
    };
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const generator = new AppGenerator();
    const request: GenerateAppRequest = await req.json();
    
    console.log('Generating app:', request.prompt);
    
    const result = await generator.generateFullApp(request);
    
    return new Response(JSON.stringify({
      success: true,
      data: result
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-app function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});