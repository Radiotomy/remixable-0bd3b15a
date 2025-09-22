import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Sparkles, 
  Coins, 
  Smartphone, 
  Rocket,
  Database,
  Code2,
  Wallet,
  Zap,
  Users,
  TrendingUp,
  Globe,
  Shield
} from 'lucide-react';
import { TokenCreationWizard } from './TokenCreationWizard';
import { MiniAppGenerator } from './MiniAppGenerator';

interface EnhancedGenerationConfig {
  includeTokenEconomy: boolean;
  generateMiniApp: boolean;
  enableGaslessTransactions: boolean;
  includeSocialLogin: boolean;
  enableOnchainIdentity: boolean;
  enableRevenueSharing: boolean;
}

interface EnhancedAppGenerationProps {
  appName: string;
  appDescription: string;
  onGenerate: (config: EnhancedGenerationConfig) => void;
  isGenerating?: boolean;
}

export const EnhancedAppGeneration = ({ 
  appName, 
  appDescription, 
  onGenerate, 
  isGenerating = false 
}: EnhancedAppGenerationProps) => {
  const [config, setConfig] = useState<EnhancedGenerationConfig>({
    includeTokenEconomy: true,
    generateMiniApp: true,
    enableGaslessTransactions: true,
    includeSocialLogin: true,
    enableOnchainIdentity: true,
    enableRevenueSharing: true,
  });
  
  const [showTokenWizard, setShowTokenWizard] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  const updateConfig = (updates: Partial<EnhancedGenerationConfig>) => {
    setConfig(prev => ({ ...prev, ...updates }));
  };

  const features = [
    {
      id: 'onchainKit',
      title: 'OnchainKit Integration',
      description: 'Wallet connection, transactions, and identity components',
      icon: Wallet,
      enabled: true,
      category: 'web3',
      benefits: ['One-click wallet connection', 'Secure transactions', 'Onchain identity']
    },
    {
      id: 'tokenEconomy',
      title: 'Token Economy',
      description: 'Launch app tokens with revenue sharing',
      icon: Coins,
      enabled: config.includeTokenEconomy,
      category: 'tokenomics',
      toggle: () => updateConfig({ includeTokenEconomy: !config.includeTokenEconomy }),
      benefits: ['Revenue sharing', 'Community ownership', 'Token incentives']
    },
    {
      id: 'miniApp',
      title: 'BASE Mini App',
      description: 'Mobile-optimized app for BASE ecosystem',
      icon: Smartphone,
      enabled: config.generateMiniApp,
      category: 'mobile',
      toggle: () => updateConfig({ generateMiniApp: !config.generateMiniApp }),
      benefits: ['Mobile distribution', 'Native BASE integration', 'App store presence']
    },
    {
      id: 'gasless',
      title: 'Gasless Transactions',
      description: 'Users transact without holding ETH',
      icon: Zap,
      enabled: config.enableGaslessTransactions,
      category: 'ux',
      toggle: () => updateConfig({ enableGaslessTransactions: !config.enableGaslessTransactions }),
      benefits: ['No gas fees', 'Better UX', 'Wider adoption']
    },
    {
      id: 'socialLogin',
      title: 'Social Login',
      description: 'Email, phone, and social authentication',
      icon: Users,
      enabled: config.includeSocialLogin,
      category: 'auth',
      toggle: () => updateConfig({ includeSocialLogin: !config.includeSocialLogin }),
      benefits: ['Easy onboarding', 'No seed phrases', 'Familiar UX']
    },
    {
      id: 'identity',
      title: 'Onchain Identity',
      description: 'BASE Names and verifiable credentials',
      icon: Shield,
      enabled: config.enableOnchainIdentity,
      category: 'identity',
      toggle: () => updateConfig({ enableOnchainIdentity: !config.enableOnchainIdentity }),
      benefits: ['Human-readable addresses', 'Verified profiles', 'Cross-app identity']
    },
    {
      id: 'revenue',
      title: 'Revenue Sharing',
      description: 'Automatic revenue distribution to token holders',
      icon: TrendingUp,
      enabled: config.enableRevenueSharing,
      category: 'monetization',
      toggle: () => updateConfig({ enableRevenueSharing: !config.enableRevenueSharing }),
      benefits: ['Passive income', 'Community rewards', 'Sustainable growth']
    },
    {
      id: 'deployment',
      title: 'One-Click Deploy',
      description: 'Deploy to Vercel, Netlify, or custom domains',
      icon: Rocket,
      enabled: true,
      category: 'deployment',
      benefits: ['Instant deployment', 'Custom domains', 'Production ready']
    }
  ];

  const categoryColors = {
    web3: 'from-blue-500 to-cyan-500',
    tokenomics: 'from-yellow-500 to-orange-500',
    mobile: 'from-purple-500 to-pink-500',
    ux: 'from-green-500 to-emerald-500',
    auth: 'from-indigo-500 to-blue-500',
    identity: 'from-red-500 to-pink-500',
    monetization: 'from-emerald-500 to-teal-500',
    deployment: 'from-orange-500 to-red-500'
  };

  const enabledFeatures = features.filter(f => f.enabled);
  const totalValue = enabledFeatures.length * 1000; // Mock value calculation

  return (
    <div className="space-y-6">
      <Card className="glass border-border/50">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl flex items-center justify-center gap-2">
            <Sparkles className="w-8 h-8 text-primary" />
            Enhanced App Generation
          </CardTitle>
          <p className="text-muted-foreground">
            Generate a complete Web3 application with advanced features and integrations
          </p>
        </CardHeader>

        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="features">Features</TabsTrigger>
              <TabsTrigger value="advanced">Advanced</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="mt-6">
              <div className="space-y-6">
                {/* App Summary */}
                <Card className="bg-gradient-to-br from-primary/5 to-accent/5 border-primary/20">
                  <CardContent className="p-6">
                    <h3 className="text-xl font-semibold mb-2">{appName}</h3>
                    <p className="text-muted-foreground mb-4">{appDescription}</p>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-primary">{enabledFeatures.length}</div>
                        <div className="text-sm text-muted-foreground">Features</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-accent">{totalValue.toLocaleString()}</div>
                        <div className="text-sm text-muted-foreground">Est. Value</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-500">BASE</div>
                        <div className="text-sm text-muted-foreground">Blockchain</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-500">5min</div>
                        <div className="text-sm text-muted-foreground">Deploy Time</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Feature Preview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {enabledFeatures.slice(0, 6).map((feature) => {
                    const Icon = feature.icon;
                    const gradient = categoryColors[feature.category as keyof typeof categoryColors];
                    
                    return (
                      <Card key={feature.id} className="relative overflow-hidden">
                        <div className={`absolute inset-0 bg-gradient-to-br opacity-10 ${gradient}`} />
                        <CardContent className="relative p-4">
                          <div className="flex items-center gap-3">
                            <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center`}>
                              <Icon className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <h4 className="font-medium">{feature.title}</h4>
                              <p className="text-sm text-muted-foreground">{feature.description}</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>

                {/* Generation CTA */}
                <div className="text-center">
                  <Button 
                    size="lg" 
                    onClick={() => onGenerate(config)}
                    disabled={isGenerating}
                    className="bg-accent hover:bg-accent/90 text-accent-foreground px-8"
                  >
                    {isGenerating ? (
                      <>
                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Generate Enhanced App
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="features" className="mt-6">
              <div className="space-y-4">
                {features.map((feature) => {
                  const Icon = feature.icon;
                  const gradient = categoryColors[feature.category as keyof typeof categoryColors];
                  
                  return (
                    <Card 
                      key={feature.id} 
                      className={`transition-all ${feature.enabled ? 'ring-1 ring-primary/20 bg-primary/5' : 'opacity-60'}`}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-start gap-4">
                            <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0`}>
                              <Icon className="w-6 h-6 text-white" />
                            </div>
                            
                            <div className="space-y-2">
                              <div className="flex items-center gap-2">
                                <h4 className="font-medium">{feature.title}</h4>
                                <Badge variant="secondary" className="text-xs">
                                  {feature.category}
                                </Badge>
                              </div>
                              
                              <p className="text-sm text-muted-foreground">
                                {feature.description}
                              </p>
                              
                              <div className="flex flex-wrap gap-1">
                                {feature.benefits.map((benefit) => (
                                  <Badge key={benefit} variant="outline" className="text-xs">
                                    {benefit}
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          </div>
                          
                          {feature.toggle && (
                            <Button
                              variant={feature.enabled ? "default" : "outline"}
                              size="sm"
                              onClick={feature.toggle}
                            >
                              {feature.enabled ? 'Enabled' : 'Enable'}
                            </Button>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </TabsContent>

            <TabsContent value="advanced" className="mt-6">
              <div className="space-y-6">
                <Alert>
                  <Sparkles className="w-4 h-4" />
                  <AlertDescription>
                    Advanced features provide additional customization and integration options for your application.
                  </AlertDescription>
                </Alert>

                {config.includeTokenEconomy && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Coins className="w-5 h-5" />
                        Token Economy Configuration
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground mb-4">
                        Customize your app's token economy, revenue sharing, and community ownership model.
                      </p>
                      <Button onClick={() => setShowTokenWizard(true)}>
                        Configure Token
                      </Button>
                    </CardContent>
                  </Card>
                )}

                {config.generateMiniApp && (
                  <MiniAppGenerator
                    appName={appName}
                    appDescription={appDescription}
                    onGenerateManifest={(manifest) => {
                      console.log('Mini app manifest generated:', manifest);
                    }}
                  />
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Token Creation Wizard Modal */}
      <TokenCreationWizard
        isOpen={showTokenWizard}
        onClose={() => setShowTokenWizard(false)}
        onCreateToken={(tokenConfig) => {
          console.log('Token configured:', tokenConfig);
          setShowTokenWizard(false);
        }}
        appName={appName}
      />
    </div>
  );
};