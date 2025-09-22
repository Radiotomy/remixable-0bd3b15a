import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DatabaseSelector } from './DatabaseSelector';
import { BaseInfrastructureConfig } from './BaseInfrastructureConfig';
import { StorageSelector } from './StorageSelector';
import { CostCalculator } from './CostCalculator';
import { getRecommendedStack } from '@/data/infrastructure';
import { Settings, Zap, Brain, DollarSign } from 'lucide-react';

interface InfrastructureSelection {
  database?: string;
  rpc?: string;
  storage?: string;
  paymaster?: string;
}

interface InfrastructureWizardProps {
  appType?: string;
  onSelectionChange?: (selection: InfrastructureSelection) => void;
  onComplete?: (selection: InfrastructureSelection) => void;
}

export const InfrastructureWizard = ({ 
  appType = 'default', 
  onSelectionChange,
  onComplete 
}: InfrastructureWizardProps) => {
  const [selection, setSelection] = useState<InfrastructureSelection>({});
  const [activeTab, setActiveTab] = useState('database');
  const [useRecommended, setUseRecommended] = useState(false);

  const recommendedStack = getRecommendedStack(appType);

  useEffect(() => {
    if (useRecommended) {
      setSelection(recommendedStack);
      onSelectionChange?.(recommendedStack);
    }
  }, [useRecommended, recommendedStack, onSelectionChange]);

  const handleSelectionChange = (category: string, value: string) => {
    const newSelection = { ...selection, [category]: value };
    setSelection(newSelection);
    onSelectionChange?.(newSelection);
  };

  const handleComplete = () => {
    onComplete?.(selection);
  };

  const isComplete = selection.database && selection.rpc && selection.storage;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full">
          <Settings className="w-4 h-4" />
          <span className="text-sm font-medium">Infrastructure Configuration</span>
        </div>
        <h2 className="text-2xl font-bold">Configure Your App's Infrastructure</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Choose the best database, blockchain infrastructure, and storage options for your {appType} app.
          All options are optimized for Base chain and cost efficiency.
        </p>
      </div>

      {/* Quick Setup Option */}
      <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-accent/5">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            Quick Setup (Recommended)
          </CardTitle>
          <CardDescription>
            Use our optimized stack for {appType} apps. You can customize later.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex flex-wrap gap-2 mb-4">
            <Badge variant="outline">
              🔥 {recommendedStack.database}
            </Badge>
            <Badge variant="outline">
              ⚗️ {recommendedStack.rpc}
            </Badge>
            <Badge variant="outline">
              📁 {recommendedStack.storage}
            </Badge>
            <Badge variant="outline">
              🔵 {recommendedStack.paymaster}
            </Badge>
          </div>
          <Button 
            onClick={() => setUseRecommended(true)}
            disabled={useRecommended}
            className="w-full"
          >
            {useRecommended ? '✓ Using Recommended Stack' : 'Use Recommended Stack'}
          </Button>
        </CardContent>
      </Card>

      {/* Custom Configuration */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="database" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-primary"></span>
            Database
          </TabsTrigger>
          <TabsTrigger value="blockchain" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-accent"></span>
            Blockchain
          </TabsTrigger>
          <TabsTrigger value="storage" className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500"></span>
            Storage
          </TabsTrigger>
          <TabsTrigger value="costs" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Costs
          </TabsTrigger>
        </TabsList>

        <TabsContent value="database" className="space-y-6">
          <DatabaseSelector
            appType={appType}
            selectedDatabase={selection.database}
            onSelect={(database) => handleSelectionChange('database', database)}
          />
        </TabsContent>

        <TabsContent value="blockchain" className="space-y-6">
          <BaseInfrastructureConfig
            selectedRPC={selection.rpc}
            selectedPaymaster={selection.paymaster}
            onRPCSelect={(rpc) => handleSelectionChange('rpc', rpc)}
            onPaymasterSelect={(paymaster) => handleSelectionChange('paymaster', paymaster)}
          />
        </TabsContent>

        <TabsContent value="storage" className="space-y-6">
          <StorageSelector
            selectedStorage={selection.storage}
            onSelect={(storage) => handleSelectionChange('storage', storage)}
          />
        </TabsContent>

        <TabsContent value="costs" className="space-y-6">
          <CostCalculator selection={selection} />
        </TabsContent>
      </Tabs>

      {/* Action Buttons */}
      <div className="flex justify-between items-center pt-6 border-t">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          {isComplete ? (
            <>
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
              Configuration complete
            </>
          ) : (
            <>
              <span className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></span>
              {4 - Object.keys(selection).length} steps remaining
            </>
          )}
        </div>
        
        <div className="flex gap-3">
          <Button variant="outline" onClick={() => setSelection({})}>
            Reset
          </Button>
          <Button 
            onClick={handleComplete}
            disabled={!isComplete}
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90"
          >
            <Brain className="w-4 h-4 mr-2" />
            Apply Configuration
          </Button>
        </div>
      </div>
    </div>
  );
};