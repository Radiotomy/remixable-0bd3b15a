import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useContractDeployment } from '@/hooks/useContractDeployment';
import { 
  Coins, 
  TrendingUp, 
  Users, 
  Zap, 
  Shield, 
  Info,
  ArrowRight,
  Check
} from 'lucide-react';

interface TokenConfig {
  name: string;
  symbol: string;
  description: string;
  totalSupply: number;
  builderAllocation: number; // percentage
  communityAllocation: number; // percentage
  treasuryAllocation: number; // percentage
  tokenomicsModel: 'utility' | 'revenue-sharing' | 'governance' | 'hybrid';
  revenueSharing: {
    enabled: boolean;
    builderPercentage: number;
    holderPercentage: number;
    platformPercentage: number;
  };
  features: string[];
}

interface TokenCreationWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateToken: (config: TokenConfig) => void;
  appName: string;
}

export const TokenCreationWizard = ({ isOpen, onClose, onCreateToken, appName }: TokenCreationWizardProps) => {
  const [step, setStep] = useState(1);
  const { deployContracts, isDeploying } = useContractDeployment();
  const [config, setConfig] = useState<TokenConfig>({
    name: `${appName} Token`,
    symbol: appName.substring(0, 4).toUpperCase(),
    description: `The official token for ${appName} app`,
    totalSupply: 1000000,
    builderAllocation: 70,
    communityAllocation: 20,
    treasuryAllocation: 10,
    tokenomicsModel: 'hybrid',
    revenueSharing: {
      enabled: true,
      builderPercentage: 85,
      holderPercentage: 10,
      platformPercentage: 5,
    },
    features: ['Revenue Sharing', 'Governance Rights', 'App Access']
  });

  const tokenomicsModels = [
    {
      id: 'utility',
      name: 'Utility Token',
      description: 'Used for app features and services',
      icon: Zap,
      features: ['App Access', 'Feature Unlocks', 'Usage Credits']
    },
    {
      id: 'revenue-sharing',
      name: 'Revenue Sharing',
      description: 'Holders earn from app revenue',
      icon: TrendingUp,
      features: ['Revenue Distribution', 'Passive Income', 'Growth Incentive']
    },
    {
      id: 'governance',
      name: 'Governance Token',
      description: 'Community voting and decisions',
      icon: Users,
      features: ['Voting Rights', 'Proposal Creation', 'DAO Participation']
    },
    {
      id: 'hybrid',
      name: 'Hybrid Model',
      description: 'Combines utility, revenue, and governance',
      icon: Shield,
      features: ['All Benefits', 'Maximum Value', 'Community Ownership']
    }
  ];

  const updateConfig = (updates: Partial<TokenConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const nextStep = () => setStep(prev => Math.min(prev + 1, 4));
  const prevStep = () => setStep(prev => Math.max(prev - 1, 1));

  const handleCreateToken = async () => {
    const result = await deployContracts(config);
    if (result) {
      onCreateToken(config);
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto glass border-border/50">
        <CardHeader className="text-center pb-4">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Coins className="w-8 h-8 text-primary" />
            Create App Token
          </CardTitle>
          <p className="text-muted-foreground">
            Launch a token for your app to enable revenue sharing and community ownership
          </p>
          
          {/* Step Indicator */}
          <div className="flex justify-center gap-2 mt-4">
            {[1, 2, 3, 4].map((num) => (
              <div
                key={num}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium border ${
                  num === step
                    ? 'bg-primary text-primary-foreground border-primary'
                    : num < step
                    ? 'bg-accent text-accent-foreground border-accent'
                    : 'border-border text-muted-foreground'
                }`}
              >
                {num < step ? <Check className="w-4 h-4" /> : num}
              </div>
            ))}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {step === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Basic Token Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="tokenName">Token Name</Label>
                  <Input
                    id="tokenName"
                    value={config.name}
                    onChange={(e) => updateConfig({ name: e.target.value })}
                    placeholder="My App Token"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="tokenSymbol">Symbol</Label>
                  <Input
                    id="tokenSymbol"
                    value={config.symbol}
                    onChange={(e) => updateConfig({ symbol: e.target.value.toUpperCase() })}
                    placeholder="MYAPP"
                    maxLength={6}
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={config.description}
                  onChange={(e) => updateConfig({ description: e.target.value })}
                  placeholder="Describe your token's purpose and benefits"
                  rows={3}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="totalSupply">Total Supply</Label>
                <Input
                  id="totalSupply"
                  type="number"
                  value={config.totalSupply}
                  onChange={(e) => updateConfig({ totalSupply: parseInt(e.target.value) || 0 })}
                  placeholder="1000000"
                />
                <p className="text-sm text-muted-foreground">
                  Total number of tokens that will ever exist
                </p>
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Choose Token Model</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {tokenomicsModels.map((model) => {
                  const Icon = model.icon;
                  return (
                    <Card
                      key={model.id}
                      className={`cursor-pointer transition-all hover:scale-105 ${
                        config.tokenomicsModel === model.id
                          ? 'ring-2 ring-primary bg-primary/5'
                          : 'hover:bg-muted/50'
                      }`}
                      onClick={() => updateConfig({ tokenomicsModel: model.id as any })}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Icon className="w-8 h-8 text-primary flex-shrink-0" />
                          <div className="space-y-2">
                            <h4 className="font-medium">{model.name}</h4>
                            <p className="text-sm text-muted-foreground">
                              {model.description}
                            </p>
                            <div className="flex flex-wrap gap-1">
                              {model.features.map((feature) => (
                                <Badge key={feature} variant="secondary" className="text-xs">
                                  {feature}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>

              {config.tokenomicsModel === 'hybrid' && (
                <Alert>
                  <Info className="w-4 h-4" />
                  <AlertDescription>
                    <strong>Recommended:</strong> The hybrid model provides maximum value to both builders and holders, 
                    creating a sustainable token economy with multiple utility streams.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Token Distribution</h3>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Builder Allocation: {config.builderAllocation}%</Label>
                    <Slider
                      value={[config.builderAllocation]}
                      onValueChange={([value]) => {
                        const remaining = 100 - value;
                        const communityRatio = config.communityAllocation / (config.communityAllocation + config.treasuryAllocation);
                        updateConfig({ 
                          builderAllocation: value,
                          communityAllocation: Math.round(remaining * communityRatio),
                          treasuryAllocation: Math.round(remaining * (1 - communityRatio))
                        });
                      }}
                      max={80}
                      min={50}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Community Allocation: {config.communityAllocation}%</Label>
                    <Slider
                      value={[config.communityAllocation]}
                      onValueChange={([value]) => {
                        const remaining = 100 - config.builderAllocation - value;
                        updateConfig({ 
                          communityAllocation: value,
                          treasuryAllocation: remaining
                        });
                      }}
                      max={30}
                      min={10}
                      step={5}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Treasury Allocation: {config.treasuryAllocation}%</Label>
                    <div className="text-sm text-muted-foreground">
                      Automatically calculated: {config.treasuryAllocation}%
                    </div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-lg p-4">
                  <h4 className="font-medium mb-2">Distribution Preview</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Builder tokens:</span>
                      <span className="font-mono">{(config.totalSupply * config.builderAllocation / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Community tokens:</span>
                      <span className="font-mono">{(config.totalSupply * config.communityAllocation / 100).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Treasury tokens:</span>
                      <span className="font-mono">{(config.totalSupply * config.treasuryAllocation / 100).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {step === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-semibold">Revenue Distribution</h3>
              
              <div className="space-y-6">
                <Alert>
                  <TrendingUp className="w-4 h-4" />
                  <AlertDescription>
                    Configure how app revenue is automatically distributed between you, token holders, and the platform.
                  </AlertDescription>
                </Alert>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Builder Revenue: {config.revenueSharing.builderPercentage}%</Label>
                    <Slider
                      value={[config.revenueSharing.builderPercentage]}
                      onValueChange={([value]) => {
                        const remaining = 100 - value;
                        const holderRatio = config.revenueSharing.holderPercentage / (config.revenueSharing.holderPercentage + config.revenueSharing.platformPercentage);
                        updateConfig({ 
                          revenueSharing: {
                            ...config.revenueSharing,
                            builderPercentage: value,
                            holderPercentage: Math.round(remaining * holderRatio),
                            platformPercentage: Math.round(remaining * (1 - holderRatio))
                          }
                        });
                      }}
                      max={90}
                      min={70}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Token Holders: {config.revenueSharing.holderPercentage}%</Label>
                    <Slider
                      value={[config.revenueSharing.holderPercentage]}
                      onValueChange={([value]) => {
                        const remaining = 100 - config.revenueSharing.builderPercentage - value;
                        updateConfig({ 
                          revenueSharing: {
                            ...config.revenueSharing,
                            holderPercentage: value,
                            platformPercentage: remaining
                          }
                        });
                      }}
                      max={20}
                      min={5}
                      step={1}
                      className="w-full"
                    />
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    Platform fee: {config.revenueSharing.platformPercentage}% (automatically calculated)
                  </div>
                </div>

                <div className="bg-accent/10 rounded-lg p-4">
                  <h4 className="font-medium mb-2 text-accent-foreground">Revenue Distribution Summary</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>You receive:</span>
                      <span className="font-mono text-accent-foreground">{config.revenueSharing.builderPercentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Token holders receive:</span>
                      <span className="font-mono text-accent-foreground">{config.revenueSharing.holderPercentage}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Platform fee:</span>
                      <span className="font-mono text-accent-foreground">{config.revenueSharing.platformPercentage}%</span>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground mt-2">
                    More generous than industry standard! Compare: Ohara.ai takes 15-30%
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-6 border-t border-border">
            <div className="flex gap-2">
              {step > 1 && (
                <Button variant="outline" onClick={prevStep}>
                  Previous
                </Button>
              )}
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
            </div>
            
            <div className="flex gap-2">
              {step < 4 ? (
                <Button onClick={nextStep} className="flex items-center gap-2">
                  Next
                  <ArrowRight className="w-4 h-4" />
                </Button>
              ) : (
                <Button 
                  onClick={handleCreateToken} 
                  disabled={isDeploying}
                  className="flex items-center gap-2 bg-accent hover:bg-accent/90"
                >
                  <Coins className="w-4 h-4" />
                  {isDeploying ? 'Deploying to BASE...' : 'Create Token'}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};