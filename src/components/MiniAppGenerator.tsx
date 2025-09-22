import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Smartphone, 
  Globe, 
  Zap, 
  Shield, 
  Download,
  ExternalLink,
  Check,
  Info
} from 'lucide-react';

interface MiniAppConfig {
  name: string;
  description: string;
  icon: string;
  startUrl: string;
  display: 'standalone' | 'fullscreen' | 'minimal-ui' | 'browser';
  themeColor: string;
  backgroundColor: string;
  orientation: 'portrait' | 'landscape' | 'any';
  categories: string[];
  screenshots: string[];
  baseIntegration: boolean;
  gaslessTransactions: boolean;
  socialLogin: boolean;
}

interface MiniAppGeneratorProps {
  appName: string;
  appDescription: string;
  onGenerateManifest: (config: MiniAppConfig) => void;
}

export const MiniAppGenerator = ({ appName, appDescription, onGenerateManifest }: MiniAppGeneratorProps) => {
  const defaultConfig: MiniAppConfig = {
    name: appName,
    description: appDescription,
    icon: '/icon-512x512.png',
    startUrl: '/',
    display: 'standalone',
    themeColor: '#6B46C1',
    backgroundColor: '#0F0F23',
    orientation: 'portrait',
    categories: ['productivity', 'utilities'],
    screenshots: [
      '/screenshot-mobile.png',
      '/screenshot-desktop.png'
    ],
    baseIntegration: true,
    gaslessTransactions: true,
    socialLogin: true
  };

  const generateManifest = (config: MiniAppConfig) => {
    const manifest = {
      name: config.name,
      short_name: config.name.length > 12 ? config.name.substring(0, 12) : config.name,
      description: config.description,
      start_url: config.startUrl,
      display: config.display,
      theme_color: config.themeColor,
      background_color: config.backgroundColor,
      orientation: config.orientation,
      categories: config.categories,
      icons: [
        {
          src: '/icon-192x192.png',
          sizes: '192x192',
          type: 'image/png',
          purpose: 'any maskable'
        },
        {
          src: '/icon-512x512.png',
          sizes: '512x512',
          type: 'image/png'
        }
      ],
      screenshots: config.screenshots.map(src => ({
        src,
        sizes: '1280x720',
        type: 'image/png'
      })),
      // BASE Chain specific fields
      base_chain_integration: {
        enabled: config.baseIntegration,
        features: {
          wallet_connection: true,
          gasless_transactions: config.gaslessTransactions,
          social_login: config.socialLogin,
          onchain_identity: true
        }
      },
      // Mini App specific fields
      mini_app: {
        version: '1.0.0',
        api_version: '1.0',
        permissions: [
          'wallet',
          'identity',
          'notifications'
        ],
        supported_chains: [8453], // Base mainnet
        onchain_features: [
          'wallet-connection',
          'transaction-signing',
          'account-abstraction'
        ]
      }
    };

    return manifest;
  };

  const handleGenerate = () => {
    onGenerateManifest(defaultConfig);
  };

  const features = [
    {
      icon: Smartphone,
      title: 'Native Mobile Experience',
      description: 'Optimized for BASE mobile app integration',
      enabled: true
    },
    {
      icon: Zap,
      title: 'Gasless Transactions',
      description: 'Users can interact without holding ETH',
      enabled: defaultConfig.gaslessTransactions
    },
    {
      icon: Shield,
      title: 'Social Login',
      description: 'Login with email, phone, or social accounts',
      enabled: defaultConfig.socialLogin
    },
    {
      icon: Globe,
      title: 'BASE Chain Native',
      description: 'Deep integration with BASE ecosystem',
      enabled: defaultConfig.baseIntegration
    }
  ];

  return (
    <div className="space-y-6">
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="w-6 h-6 text-primary" />
            BASE Mini App Configuration
          </CardTitle>
          <p className="text-muted-foreground">
            Generate a BASE-compatible Mini App manifest for mobile distribution
          </p>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <Alert>
            <Info className="w-4 h-4" />
            <AlertDescription>
              BASE Mini Apps get priority placement in the BASE mobile app and access to exclusive features like gasless transactions and social login.
            </AlertDescription>
          </Alert>

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {features.map((feature) => {
              const Icon = feature.icon;
              return (
                <Card key={feature.title} className={`p-4 ${feature.enabled ? 'bg-accent/5 border-accent/20' : 'bg-muted/5'}`}>
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                      feature.enabled ? 'bg-accent/10' : 'bg-muted/10'
                    }`}>
                      <Icon className={`w-5 h-5 ${feature.enabled ? 'text-accent' : 'text-muted-foreground'}`} />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <h4 className="font-medium">{feature.title}</h4>
                        {feature.enabled && <Check className="w-4 h-4 text-accent" />}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>

          {/* App Configuration Preview */}
          <Card className="bg-muted/20 border-border/30">
            <CardHeader>
              <CardTitle className="text-lg">Manifest Preview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>App Name:</strong> {defaultConfig.name}
                </div>
                <div>
                  <strong>Display Mode:</strong> {defaultConfig.display}
                </div>
                <div>
                  <strong>Theme Color:</strong> 
                  <span className="inline-block w-4 h-4 rounded ml-2" style={{ backgroundColor: defaultConfig.themeColor }} />
                  {defaultConfig.themeColor}
                </div>
                <div>
                  <strong>Orientation:</strong> {defaultConfig.orientation}
                </div>
                <div className="md:col-span-2">
                  <strong>Categories:</strong> {defaultConfig.categories.map(cat => (
                    <Badge key={cat} variant="secondary" className="ml-1 text-xs">
                      {cat}
                    </Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Generation Actions */}
          <div className="flex justify-between items-center pt-4 border-t border-border">
            <div className="text-sm text-muted-foreground">
              Mini App manifests are automatically included in your generated app
            </div>
            <div className="flex gap-2">
              <Button variant="outline" className="flex items-center gap-2">
                <ExternalLink className="w-4 h-4" />
                Preview Manifest
              </Button>
              <Button onClick={handleGenerate} className="flex items-center gap-2">
                <Download className="w-4 h-4" />
                Generate Mini App
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};