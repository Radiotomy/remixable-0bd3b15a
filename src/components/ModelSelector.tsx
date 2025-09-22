import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { useFireproofProjects } from '@/hooks/useFireproof';

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  category: 'code' | 'text' | 'image';
  pricing?: {
    input: number;
    output: number;
  };
  contextLength?: number;
  description: string;
}

export interface ModelParameters {
  temperature: number;
  maxTokens: number;
  topP: number;
}

interface ModelSelectorProps {
  onModelSelect: (category: string, model: ModelConfig, parameters: ModelParameters) => void;
  selectedModels?: {
    code?: ModelConfig;
    text?: ModelConfig;
    image?: ModelConfig;
  };
}

const AVAILABLE_MODELS: ModelConfig[] = [
  // Code Generation Models
  {
    id: 'anthropic/claude-3.5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    category: 'code',
    pricing: { input: 3, output: 15 },
    contextLength: 200000,
    description: 'Excellent for complex code generation and refactoring'
  },
  {
    id: 'openai/gpt-4-turbo',
    name: 'GPT-4 Turbo',
    provider: 'OpenAI',
    category: 'code',
    pricing: { input: 10, output: 30 },
    contextLength: 128000,
    description: 'Powerful coding assistant with broad knowledge'
  },
  {
    id: 'meta-llama/codellama-34b-instruct',
    name: 'CodeLlama 34B',
    provider: 'Meta',
    category: 'code',
    pricing: { input: 0.8, output: 0.8 },
    contextLength: 16000,
    description: 'Specialized for code completion and generation'
  },
  
  // Text Generation Models
  {
    id: 'anthropic/claude-3-opus',
    name: 'Claude 3 Opus',
    provider: 'Anthropic',
    category: 'text',
    pricing: { input: 15, output: 75 },
    contextLength: 200000,
    description: 'Most capable model for complex reasoning'
  },
  {
    id: 'openai/gpt-4',
    name: 'GPT-4',
    provider: 'OpenAI',
    category: 'text',
    pricing: { input: 30, output: 60 },
    contextLength: 8000,
    description: 'Reliable and well-rounded language model'
  },
  {
    id: 'google/gemini-pro',
    name: 'Gemini Pro',
    provider: 'Google',
    category: 'text',
    pricing: { input: 0.5, output: 1.5 },
    contextLength: 32000,
    description: 'Fast and efficient for general text tasks'
  },
  
  // Image Generation Models
  {
    id: 'black-forest-labs/flux-pro',
    name: 'FLUX Pro',
    provider: 'Black Forest Labs',
    category: 'image',
    pricing: { input: 0.055, output: 0 },
    description: 'High-quality image generation with artistic control'
  },
  {
    id: 'openai/dall-e-3',
    name: 'DALL-E 3',
    provider: 'OpenAI',
    category: 'image',
    pricing: { input: 0.040, output: 0 },
    description: 'Creative and detailed image generation'
  },
  {
    id: 'stability-ai/stable-diffusion-xl',
    name: 'Stable Diffusion XL',
    provider: 'Stability AI',
    category: 'image',
    pricing: { input: 0.003, output: 0 },
    description: 'Fast and cost-effective image generation'
  }
];

const DEFAULT_PARAMETERS: ModelParameters = {
  temperature: 0.7,
  maxTokens: 2000,
  topP: 1
};

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  onModelSelect, 
  selectedModels = {} 
}) => {
  const [parameters, setParameters] = useState<ModelParameters>(DEFAULT_PARAMETERS);
  const [activeCategory, setActiveCategory] = useState<string>('code');
  const { saveProject } = useFireproofProjects();

  // Load saved preferences
  useEffect(() => {
    const savedPrefs = localStorage.getItem('remixable-model-preferences');
    if (savedPrefs) {
      try {
        const prefs = JSON.parse(savedPrefs);
        if (prefs.parameters) {
          setParameters(prefs.parameters);
        }
      } catch (error) {
        console.error('Error loading model preferences:', error);
      }
    }
  }, []);

  const handleModelSelect = (category: string, modelId: string) => {
    const model = AVAILABLE_MODELS.find(m => m.id === modelId);
    if (model) {
      onModelSelect(category, model, parameters);
      
      // Save preferences
      const preferences = {
        selectedModels: { ...selectedModels, [category]: model },
        parameters
      };
      localStorage.setItem('remixable-model-preferences', JSON.stringify(preferences));
    }
  };

  const handleParameterChange = (param: keyof ModelParameters, value: number[]) => {
    const newParameters = { ...parameters, [param]: value[0] };
    setParameters(newParameters);
  };

  const getModelsByCategory = (category: string) => {
    return AVAILABLE_MODELS.filter(model => model.category === category);
  };

  const formatPrice = (price: number) => {
    return `$${price.toFixed(3)}/1M tokens`;
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>AI Model Selection</CardTitle>
        <CardDescription>
          Choose your preferred models for different generation tasks
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeCategory} onValueChange={setActiveCategory}>
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="code">Code Generation</TabsTrigger>
            <TabsTrigger value="text">Text Generation</TabsTrigger>
            <TabsTrigger value="image">Image Generation</TabsTrigger>
          </TabsList>
          
          <TabsContent value="code" className="space-y-4">
            <div>
              <Label htmlFor="code-model">Code Generation Model</Label>
              <Select
                value={selectedModels.code?.id || ''}
                onValueChange={(value) => handleModelSelect('code', value)}
              >
                <SelectTrigger id="code-model">
                  <SelectValue placeholder="Select a code generation model" />
                </SelectTrigger>
                <SelectContent>
                  {getModelsByCategory('code').map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <span className="font-medium">{model.name}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {model.provider}
                          </Badge>
                        </div>
                        {model.pricing && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {formatPrice(model.pricing.input)}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedModels.code && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedModels.code.description}
                </p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="text" className="space-y-4">
            <div>
              <Label htmlFor="text-model">Text Generation Model</Label>
              <Select
                value={selectedModels.text?.id || ''}
                onValueChange={(value) => handleModelSelect('text', value)}
              >
                <SelectTrigger id="text-model">
                  <SelectValue placeholder="Select a text generation model" />
                </SelectTrigger>
                <SelectContent>
                  {getModelsByCategory('text').map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <span className="font-medium">{model.name}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {model.provider}
                          </Badge>
                        </div>
                        {model.pricing && (
                          <span className="text-xs text-muted-foreground ml-2">
                            {formatPrice(model.pricing.input)}
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedModels.text && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedModels.text.description}
                </p>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="image" className="space-y-4">
            <div>
              <Label htmlFor="image-model">Image Generation Model</Label>
              <Select
                value={selectedModels.image?.id || ''}
                onValueChange={(value) => handleModelSelect('image', value)}
              >
                <SelectTrigger id="image-model">
                  <SelectValue placeholder="Select an image generation model" />
                </SelectTrigger>
                <SelectContent>
                  {getModelsByCategory('image').map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex items-center justify-between w-full">
                        <div>
                          <span className="font-medium">{model.name}</span>
                          <Badge variant="secondary" className="ml-2 text-xs">
                            {model.provider}
                          </Badge>
                        </div>
                        {model.pricing && (
                          <span className="text-xs text-muted-foreground ml-2">
                            ${model.pricing.input.toFixed(3)}/image
                          </span>
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {selectedModels.image && (
                <p className="text-sm text-muted-foreground mt-1">
                  {selectedModels.image.description}
                </p>
              )}
            </div>
          </TabsContent>
        </Tabs>

        {(activeCategory === 'code' || activeCategory === 'text') && (
          <div className="mt-6 space-y-4 border-t pt-4">
            <h4 className="text-sm font-medium">Generation Parameters</h4>
            
            <div className="space-y-3">
              <div>
                <Label htmlFor="temperature">
                  Temperature: {parameters.temperature}
                </Label>
                <Slider
                  id="temperature"
                  min={0}
                  max={2}
                  step={0.1}
                  value={[parameters.temperature]}
                  onValueChange={(value) => handleParameterChange('temperature', value)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Higher values make output more creative, lower values more focused
                </p>
              </div>

              <div>
                <Label htmlFor="maxTokens">
                  Max Tokens: {parameters.maxTokens}
                </Label>
                <Slider
                  id="maxTokens"
                  min={100}
                  max={4000}
                  step={100}
                  value={[parameters.maxTokens]}
                  onValueChange={(value) => handleParameterChange('maxTokens', value)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Maximum length of the generated response
                </p>
              </div>

              <div>
                <Label htmlFor="topP">
                  Top P: {parameters.topP}
                </Label>
                <Slider
                  id="topP"
                  min={0.1}
                  max={1}
                  step={0.1}
                  value={[parameters.topP]}
                  onValueChange={(value) => handleParameterChange('topP', value)}
                  className="mt-2"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Controls diversity of output by focusing on top probability tokens
                </p>
              </div>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};