import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useFireproofProjects } from '@/hooks/useFireproof';
import { CODE_GENERATION_MODELS, AIModel, getModelRecommendation } from '@/data/aiModels';
import { Info, Sparkles, TrendingUp, DollarSign, Zap, CheckCircle2 } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

export interface ModelConfig extends AIModel {}

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
  projectType?: string;
  complexity?: 'simple' | 'medium' | 'complex';
}

const AVAILABLE_MODELS: ModelConfig[] = CODE_GENERATION_MODELS;

const DEFAULT_PARAMETERS: ModelParameters = {
  temperature: 0.7,
  maxTokens: 2000,
  topP: 1
};

export const ModelSelector: React.FC<ModelSelectorProps> = ({ 
  onModelSelect, 
  selectedModels = {},
  projectType = '',
  complexity = 'medium'
}) => {
  const [parameters, setParameters] = useState<ModelParameters>(DEFAULT_PARAMETERS);
  const [activeCategory, setActiveCategory] = useState<string>('code');
  const [showRecommendation, setShowRecommendation] = useState(true);
  const [expandedModel, setExpandedModel] = useState<string | null>(null);
  const { saveProject } = useFireproofProjects();

  const recommendation = getModelRecommendation(projectType, complexity);

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

  const formatPrice = (pricing: { input: number; output: number }) => {
    return `$${pricing.input.toFixed(2)} in / $${pricing.output.toFixed(2)} out per 1M`;
  };

  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'flagship': return 'bg-gradient-to-r from-purple-500 to-pink-500';
      case 'balanced': return 'bg-gradient-to-r from-blue-500 to-cyan-500';
      case 'fast': return 'bg-gradient-to-r from-green-500 to-emerald-500';
      case 'specialized': return 'bg-gradient-to-r from-orange-500 to-amber-500';
      default: return 'bg-muted';
    }
  };

  const ModelDetailCard = ({ model }: { model: AIModel }) => {
    const isExpanded = expandedModel === model.id;
    
    return (
      <Collapsible
        open={isExpanded}
        onOpenChange={() => setExpandedModel(isExpanded ? null : model.id)}
        className="border rounded-lg p-4 space-y-3 hover:border-primary/50 transition-colors"
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-lg">{model.name}</h4>
              <Badge className={getTierBadgeColor(model.tier) + ' text-white border-0'}>
                {model.tier}
              </Badge>
              {model.recommended && (
                <Badge variant="outline" className="gap-1">
                  <Sparkles className="w-3 h-3" />
                  Recommended
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{model.description}</p>
            <div className="flex flex-wrap gap-3 text-xs text-muted-foreground">
              <span className="flex items-center gap-1">
                <DollarSign className="w-3 h-3" />
                {formatPrice(model.pricing)}
              </span>
              <span className="flex items-center gap-1">
                <TrendingUp className="w-3 h-3" />
                {model.contextLength.toLocaleString()} tokens
              </span>
              <span className="flex items-center gap-1">
                <Info className="w-3 h-3" />
                {model.provider}
              </span>
            </div>
          </div>
          <Button
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              handleModelSelect('code', model.id);
            }}
            variant={selectedModels.code?.id === model.id ? "default" : "outline"}
          >
            {selectedModels.code?.id === model.id ? (
              <>
                <CheckCircle2 className="w-4 h-4 mr-1" />
                Selected
              </>
            ) : 'Select'}
          </Button>
        </div>

        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm" className="w-full">
            {isExpanded ? 'Hide Details' : 'Show Details'}
          </Button>
        </CollapsibleTrigger>

        <CollapsibleContent className="space-y-4">
          <div>
            <h5 className="font-medium text-sm mb-2">Capabilities</h5>
            <div className="grid grid-cols-2 gap-2">
              {model.capabilities.map((cap) => (
                <div key={cap.name} className="flex items-center justify-between text-sm">
                  <span>{cap.name}</span>
                  <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                      <div
                        key={i}
                        className={`w-2 h-2 rounded-full ${
                          i < cap.rating ? 'bg-primary' : 'bg-muted'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h5 className="font-medium text-sm mb-2">Strengths</h5>
            <ul className="text-sm space-y-1">
              {model.strengths.map((strength, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-green-500">+</span>
                  <span>{strength}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-medium text-sm mb-2">Limitations</h5>
            <ul className="text-sm space-y-1">
              {model.weaknesses.map((weakness, i) => (
                <li key={i} className="flex items-start gap-2">
                  <span className="text-muted-foreground">-</span>
                  <span className="text-muted-foreground">{weakness}</span>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h5 className="font-medium text-sm mb-2">Best For</h5>
            <div className="flex flex-wrap gap-2">
              {model.bestFor.map((use, i) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {use}
                </Badge>
              ))}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    );
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5" />
          AI Model Selection
        </CardTitle>
        <CardDescription>
          Choose from the best AI models for code generation with detailed capabilities and recommendations
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* AI Recommendation */}
        {showRecommendation && recommendation && (
          <Card className="border-primary/50 bg-primary/5">
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Recommended for Your Project
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-semibold">{recommendation.primary.name}</h4>
                    <p className="text-sm text-muted-foreground">{recommendation.primary.provider}</p>
                  </div>
                  <Button
                    onClick={() => handleModelSelect('code', recommendation.primary.id)}
                    variant={selectedModels.code?.id === recommendation.primary.id ? "default" : "outline"}
                  >
                    {selectedModels.code?.id === recommendation.primary.id ? 'Selected' : 'Use This'}
                  </Button>
                </div>
                <p className="text-sm">{recommendation.reasoning}</p>
              </div>

              {recommendation.alternatives.length > 0 && (
                <div className="space-y-2">
                  <h5 className="text-sm font-medium">Alternative Recommendations:</h5>
                  <div className="flex flex-wrap gap-2">
                    {recommendation.alternatives.map((alt) => (
                      <Badge
                        key={alt.id}
                        variant="secondary"
                        className="cursor-pointer hover:bg-secondary/80"
                        onClick={() => handleModelSelect('code', alt.id)}
                      >
                        {alt.name}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        )}
        {/* Model List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium">Available Models ({AVAILABLE_MODELS.length})</h3>
            <div className="flex gap-2 text-xs">
              <Badge variant="outline">
                <span className={getTierBadgeColor('flagship') + ' w-2 h-2 rounded-full mr-1'}></span>
                Flagship
              </Badge>
              <Badge variant="outline">
                <span className={getTierBadgeColor('balanced') + ' w-2 h-2 rounded-full mr-1'}></span>
                Balanced
              </Badge>
              <Badge variant="outline">
                <span className={getTierBadgeColor('fast') + ' w-2 h-2 rounded-full mr-1'}></span>
                Fast
              </Badge>
            </div>
          </div>

          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
            {AVAILABLE_MODELS.map((model) => (
              <ModelDetailCard key={model.id} model={model} />
            ))}
          </div>
        </div>

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