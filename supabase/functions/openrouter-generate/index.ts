import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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
    const OPENROUTER_API_KEY = Deno.env.get('OPENROUTER_API_KEY');
    if (!OPENROUTER_API_KEY) {
      throw new Error('OPENROUTER_API_KEY is not set');
    }

    const body: GenerateRequest = await req.json();
    const { prompt, model, category, parameters = {} } = body;

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