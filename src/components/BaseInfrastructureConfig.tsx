import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { rpcProviders, paymasterServices, RPCProvider, PaymasterService } from '@/data/infrastructure';
import { Activity, Zap, Shield, Globe, ChevronRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BaseInfrastructureConfigProps {
  selectedRPC?: string;
  selectedPaymaster?: string;
  onRPCSelect: (rpc: string) => void;
  onPaymasterSelect: (paymaster: string) => void;
}

export const BaseInfrastructureConfig = ({ 
  selectedRPC, 
  selectedPaymaster, 
  onRPCSelect, 
  onPaymasterSelect 
}: BaseInfrastructureConfigProps) => {
  const [activeTab, setActiveTab] = useState('rpc');

  const selectedRPCProvider = rpcProviders.find(rpc => rpc.id === selectedRPC);
  const selectedPaymasterService = paymasterServices.find(pm => pm.id === selectedPaymaster);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Base Chain Infrastructure</h3>
        <p className="text-muted-foreground">
          Configure your Base blockchain connection and gasless transaction capabilities
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="rpc" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            RPC Provider
          </TabsTrigger>
          <TabsTrigger value="paymaster" className="flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Gasless Transactions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="rpc" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4" />
              RPC providers handle blockchain communication. Free tiers are perfect for development.
            </div>

            <RadioGroup value={selectedRPC} onValueChange={onRPCSelect} className="space-y-3">
              {rpcProviders.map((provider) => (
                <RPCProviderCard
                  key={provider.id}
                  provider={provider}
                  isSelected={selectedRPC === provider.id}
                  onSelect={onRPCSelect}
                />
              ))}
            </RadioGroup>

            {selectedRPCProvider && (
              <ProviderDetails provider={selectedRPCProvider} />
            )}
          </div>
        </TabsContent>

        <TabsContent value="paymaster" className="space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Info className="w-4 h-4" />
              Paymaster services sponsor gas fees for better user onboarding.
            </div>

            <RadioGroup value={selectedPaymaster} onValueChange={onPaymasterSelect} className="space-y-3">
              {paymasterServices.map((service) => (
                <PaymasterCard
                  key={service.id}
                  service={service}
                  isSelected={selectedPaymaster === service.id}
                  onSelect={onPaymasterSelect}
                />
              ))}
            </RadioGroup>

            {selectedPaymasterService && (
              <PaymasterDetails service={selectedPaymasterService} />
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface RPCProviderCardProps {
  provider: RPCProvider;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const RPCProviderCard = ({ provider, isSelected, onSelect }: RPCProviderCardProps) => {
  const getCostColor = (cost: RPCProvider['cost']) => {
    switch (cost) {
      case 'free': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'freemium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'paid': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    }
  };

  const getReliabilityColor = (reliability: string) => {
    switch (reliability) {
      case 'high': return 'text-green-400';
      case 'medium': return 'text-orange-400';
      case 'low': return 'text-red-400';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <RadioGroupItem value={provider.id} id={provider.id} />
      <Label 
        htmlFor={provider.id} 
        className="flex-1 cursor-pointer"
        onClick={() => onSelect(provider.id)}
      >
        <Card className={cn(
          "transition-all hover:border-primary/30 hover:bg-muted/20",
          isSelected && "border-primary/50 bg-primary/5"
        )}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl">{provider.icon}</span>
                <div className="space-y-2 flex-1">
                  <h4 className="font-medium">{provider.name}</h4>
                  <p className="text-sm text-muted-foreground">{provider.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={cn('text-xs', getCostColor(provider.cost))}>
                      {provider.cost}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      <Activity className="w-3 h-3 mr-1" />
                      {provider.latency} latency
                    </Badge>
                    <Badge variant="outline" className={cn('text-xs', getReliabilityColor(provider.reliability))}>
                      <Shield className="w-3 h-3 mr-1" />
                      {provider.reliability}
                    </Badge>
                  </div>
                </div>
              </div>
              <ChevronRight className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                isSelected && "rotate-90 text-primary"
              )} />
            </div>
          </CardContent>
        </Card>
      </Label>
    </div>
  );
};

interface PaymasterCardProps {
  service: PaymasterService;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const PaymasterCard = ({ service, isSelected, onSelect }: PaymasterCardProps) => {
  const getCostColor = (cost: PaymasterService['cost']) => {
    switch (cost) {
      case 'free': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'freemium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'paid': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <RadioGroupItem value={service.id} id={service.id} />
      <Label 
        htmlFor={service.id} 
        className="flex-1 cursor-pointer"
        onClick={() => onSelect(service.id)}
      >
        <Card className={cn(
          "transition-all hover:border-primary/30 hover:bg-muted/20",
          isSelected && "border-primary/50 bg-primary/5"
        )}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl">{service.icon}</span>
                <div className="space-y-2 flex-1">
                  <h4 className="font-medium">{service.name}</h4>
                  <p className="text-sm text-muted-foreground">{service.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={cn('text-xs', getCostColor(service.cost))}>
                      {service.cost}
                    </Badge>
                    {service.gasCredits && (
                      <Badge variant="outline" className="text-xs">
                        <Zap className="w-3 h-3 mr-1" />
                        {service.gasCredits}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              <ChevronRight className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                isSelected && "rotate-90 text-primary"
              )} />
            </div>
          </CardContent>
        </Card>
      </Label>
    </div>
  );
};

const ProviderDetails = ({ provider }: { provider: RPCProvider }) => (
  <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <span className="text-2xl">{provider.icon}</span>
        {provider.name}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="grid md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <div className="text-sm font-medium">Monthly Requests</div>
          <div className="text-2xl font-bold text-primary">
            {(provider.requestsPerMonth / 1000000).toFixed(0)}M
          </div>
        </div>
        <div className="space-y-2">
          <div className="text-sm font-medium">Features</div>
          <div className="flex flex-wrap gap-1">
            {provider.features.slice(0, 3).map((feature, index) => (
              <Badge key={index} variant="outline" className="text-xs">
                {feature}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </CardContent>
  </Card>
);

const PaymasterDetails = ({ service }: { service: PaymasterService }) => (
  <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
    <CardHeader>
      <CardTitle className="flex items-center gap-2">
        <span className="text-2xl">{service.icon}</span>
        {service.name}
      </CardTitle>
    </CardHeader>
    <CardContent className="space-y-3">
      <div className="space-y-2">
        <div className="text-sm font-medium">Key Features</div>
        <div className="flex flex-wrap gap-1">
          {service.features.map((feature, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>
      </div>
      {service.gasCredits && (
        <div className="p-3 glass rounded-lg">
          <div className="text-sm font-medium">Free Tier</div>
          <div className="text-xs text-muted-foreground">{service.gasCredits}</div>
        </div>
      )}
    </CardContent>
  </Card>
);