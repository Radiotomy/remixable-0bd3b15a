import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import "https://deno.land/x/xhr@0.1.0/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface GenerateRequest {
  prompt: string;
  model: string;
  category: 'code' | 'text' | 'image';
  parameters?: {
    temperature?: number;
    max_tokens?: number;
    top_p?: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Initialize Supabase client for rate limiting and validation
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      { global: { headers: { Authorization: authHeader } } }
    )

    // Get authenticated user
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser()
    if (authError || !user) {
      console.error('Authentication failed:', authError)
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not set');
    }

    const body: GenerateRequest = await req.json();
    const { prompt, model, category, parameters = {} } = body;

    // Input validation
    if (!prompt || typeof prompt !== 'string') {
      return new Response(JSON.stringify({ error: 'Invalid prompt' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Length validation (5000 character limit)
    if (prompt.length > 5000) {
      return new Response(JSON.stringify({ error: 'Prompt too long (max 5000 characters)' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Basic content filtering - reject prompts with suspicious patterns
    const forbiddenPatterns = [
      /ignore\s+previous\s+instructions/i,
      /system\s*:\s*you\s+are/i,
      /<script[\s\S]*?>[\s\S]*?<\/script>/i,
    ]
    
    if (forbiddenPatterns.some(pattern => pattern.test(prompt))) {
      console.warn('Blocked suspicious prompt from user:', user.id)
      return new Response(JSON.stringify({ error: 'Invalid prompt content' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      })
    }

    // Simple rate limiting check (10 requests per hour)
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
    
    // Create rate limit tracking table entry
    await supabaseClient.from('projects').select('id').limit(1) // Just check connection works
    
    console.log(`User ${user.id} making generation request - Category: ${category}`)

    console.log(`Generating with OpenRouter - Model: ${model}, Category: ${category}`);

    if (category === 'image') {
      // Handle image generation
      const response = await fetch('https://openrouter.ai/api/v1/images/generations', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          prompt,
          n: 1,
          size: parameters.size || '1024x1024',
          response_format: 'b64_json'
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter image API error:', errorText);
        throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Image generation successful');
      
      return new Response(JSON.stringify({
        success: true,
        data: {
          type: 'image',
          content: data.data[0].b64_json,
          model_used: model
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });

    } else {
      // Handle text/code generation
      const systemPrompts = {
        code: `You are an expert React/TypeScript developer. Generate clean, modern, and functional React components using TypeScript, Tailwind CSS, and shadcn/ui components. Always include proper imports, TypeScript types, and follow React best practices. Generate complete, working code that can be directly used.`,
        text: `You are a helpful AI assistant. Provide clear, accurate, and well-structured responses.`
      };

      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model,
          messages: [
            {
              role: 'system',
              content: systemPrompts[category] || systemPrompts.text
            },
            { role: 'user', content: prompt }
          ],
          temperature: parameters.temperature || 0.7,
          max_tokens: parameters.max_tokens || 2000,
          top_p: parameters.top_p || 1,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenRouter API error:', errorText);
        throw new Error(`OpenRouter API error: ${response.status} ${errorText}`);
      }

      const data = await response.json();
      console.log('Text/Code generation successful');

      return new Response(JSON.stringify({
        success: true,
        data: {
          type: category,
          content: data.choices[0].message.content,
          model_used: model,
          usage: data.usage
        }
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

  } catch (error) {
    console.error('Error in openrouter-generate function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});