import { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { 
  databaseOptions, 
  rpcProviders, 
  storageOptions, 
  paymasterServices 
} from '@/data/infrastructure';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Database, 
  Globe, 
  HardDrive,
  Zap,
  AlertCircle,
  CheckCircle
} from 'lucide-react';

interface InfrastructureSelection {
  database?: string;
  rpc?: string;
  storage?: string;
  paymaster?: string;
}

interface CostCalculatorProps {
  selection: InfrastructureSelection;
}

interface UsageMetrics {
  monthlyActiveUsers: number;
  storageGB: number;
  rpcRequestsPerMonth: number;
  sponsoredTransactions: number;
}

export const CostCalculator = ({ selection }: CostCalculatorProps) => {
  const [usage, setUsage] = useState<UsageMetrics>({
    monthlyActiveUsers: 1000,
    storageGB: 5,
    rpcRequestsPerMonth: 100000,
    sponsoredTransactions: 500
  });

  const [timeframe, setTimeframe] = useState<'monthly' | 'yearly'>('monthly');

  const selectedDatabase = databaseOptions.find(db => db.id === selection.database);
  const selectedRPC = rpcProviders.find(rpc => rpc.id === selection.rpc);
  const selectedStorage = storageOptions.find(storage => storage.id === selection.storage);
  const selectedPaymaster = paymasterServices.find(pm => pm.id === selection.paymaster);

  const costBreakdown = useMemo(() => {
    const breakdown = {
      database: 0,
      rpc: 0,
      storage: 0,
      paymaster: 0,
      total: 0,
      warnings: [] as string[],
      freeTierUsage: [] as string[]
    };

    // Database costs
    if (selectedDatabase) {
      switch (selectedDatabase.id) {
        case 'fireproof':
        case 'orbitdb':
        case 'gunjs':
        case 'ceramic':
          breakdown.database = 0;
          breakdown.freeTierUsage.push('Database: 100% Free');
          break;
        case 'planetscale':
          if (usage.monthlyActiveUsers > 10000) {
            breakdown.database = 29;
            breakdown.warnings.push('PlanetScale: Free tier limited to 10K rows/month');
          } else {
            breakdown.database = 0;
            breakdown.freeTierUsage.push('Database: Within free tier');
          }
          break;
        case 'upstash':
          const requestsPerDay = usage.rpcRequestsPerMonth / 30;
          if (requestsPerDay > 10000) {
            const extraRequests = (requestsPerDay - 10000) * 30;
            breakdown.database = (extraRequests / 100000) * 0.2;
          } else {
            breakdown.database = 0;
            breakdown.freeTierUsage.push('Database: Within free tier (10K commands/day)');
          }
          break;
      }
    }

    // RPC costs
    if (selectedRPC) {
      switch (selectedRPC.id) {
        case 'base-public':
          breakdown.rpc = 0;
          if (usage.rpcRequestsPerMonth > 10000000) {
            breakdown.warnings.push('Public RPC: May be rate-limited at high usage');
          } else {
            breakdown.freeTierUsage.push('RPC: 100% Free (rate limited)');
          }
          break;
        case 'alchemy':
          if (usage.rpcRequestsPerMonth > 300000000) {
            breakdown.rpc = 49;
            breakdown.warnings.push('Alchemy: Exceeding free tier');
          } else {
            breakdown.rpc = 0;
            breakdown.freeTierUsage.push('RPC: Within free tier (300M requests/month)');
          }
          break;
        case 'quicknode':
          if (usage.rpcRequestsPerMonth > 50000000) {
            breakdown.rpc = 9;
            breakdown.warnings.push('QuickNode: Exceeding free tier');
          } else {
            breakdown.rpc = 0;
            breakdown.freeTierUsage.push('RPC: Within free tier (50M requests/month)');
          }
          break;
        case 'chainbase':
          if (usage.rpcRequestsPerMonth > 100000000) {
            breakdown.rpc = 19;
          } else {
            breakdown.rpc = 0;
            breakdown.freeTierUsage.push('RPC: Within free tier (100M requests/month)');
          }
          break;
      }
    }

    // Storage costs
    if (selectedStorage) {
      switch (selectedStorage.id) {
        case 'filecoin':
          breakdown.storage = 0;
          breakdown.freeTierUsage.push('Storage: Free via Web3.Storage');
          break;
        case 'ipfs':
          if (usage.storageGB > 1) {
            breakdown.storage = Math.ceil((usage.storageGB - 1) / 100) * 20;
          } else {
            breakdown.storage = 0;
            breakdown.freeTierUsage.push('Storage: Within free tier (1GB)');
          }
          break;
        case 'arweave':
          breakdown.storage = usage.storageGB * 5; // One-time payment
          break;
        case 'supabase-storage':
          if (usage.storageGB > 1) {
            breakdown.storage = (usage.storageGB - 1) * 0.021;
          } else {
            breakdown.storage = 0;
            breakdown.freeTierUsage.push('Storage: Within free tier (1GB)');
          }
          break;
      }
    }

    // Paymaster costs
    if (selectedPaymaster && usage.sponsoredTransactions > 0) {
      switch (selectedPaymaster.id) {
        case 'coinbase-paymaster':
          const gasPerTransaction = 0.01; // Estimated
          const totalGasCost = usage.sponsoredTransactions * gasPerTransaction;
          if (totalGasCost > 10) {
            breakdown.paymaster = totalGasCost - 10;
          } else {
            breakdown.paymaster = 0;
            breakdown.freeTierUsage.push('Paymaster: Within free tier ($10/month)');
          }
          break;
        case 'pimlico':
          if (usage.sponsoredTransactions > 100) {
            breakdown.paymaster = ((usage.sponsoredTransactions - 100) / 1000) * 5;
          } else {
            breakdown.paymaster = 0;
            breakdown.freeTierUsage.push('Paymaster: Within free tier (100 UserOps)');
          }
          break;
        case 'alchemy-aa':
          if (usage.sponsoredTransactions > 1000) {
            breakdown.paymaster = ((usage.sponsoredTransactions - 1000) / 1000) * 10;
          } else {
            breakdown.paymaster = 0;
            breakdown.freeTierUsage.push('Paymaster: Within free tier (1000 txns)');
          }
          break;
      }
    }

    breakdown.total = breakdown.database + breakdown.rpc + breakdown.storage + breakdown.paymaster;

    if (timeframe === 'yearly') {
      breakdown.database *= 12;
      breakdown.rpc *= 12;
      breakdown.storage = selectedStorage?.id === 'arweave' ? breakdown.storage : breakdown.storage * 12;
      breakdown.paymaster *= 12;
      breakdown.total = breakdown.database + breakdown.rpc + breakdown.storage + breakdown.paymaster;
    }

    return breakdown;
  }, [selection, usage, timeframe, selectedDatabase, selectedRPC, selectedStorage, selectedPaymaster]);

  const handleUsageChange = (key: keyof UsageMetrics, value: number) => {
    setUsage(prev => ({ ...prev, [key]: value }));
  };

  const getCostColor = (cost: number) => {
    if (cost === 0) return 'text-green-400';
    if (cost < 50) return 'text-blue-400';
    if (cost < 200) return 'text-orange-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Cost Calculator</h3>
        <p className="text-muted-foreground">
          Estimate your infrastructure costs based on projected usage
        </p>
      </div>

      {/* Timeframe Toggle */}
      <div className="flex justify-center">
        <div className="flex p-1 glass rounded-lg">
          <Button
            variant={timeframe === 'monthly' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTimeframe('monthly')}
          >
            Monthly
          </Button>
          <Button
            variant={timeframe === 'yearly' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setTimeframe('yearly')}
          >
            Yearly
          </Button>
        </div>
      </div>

      {/* Usage Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5" />
            Usage Projections
          </CardTitle>
          <CardDescription>
            Adjust these values based on your expected app usage
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Users className="w-4 h-4" />
              Monthly Active Users: {usage.monthlyActiveUsers.toLocaleString()}
            </Label>
            <Slider
              value={[usage.monthlyActiveUsers]}
              onValueChange={(value) => handleUsageChange('monthlyActiveUsers', value[0])}
              max={100000}
              step={100}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <HardDrive className="w-4 h-4" />
              Storage Needed: {usage.storageGB}GB
            </Label>
            <Slider
              value={[usage.storageGB]}
              onValueChange={(value) => handleUsageChange('storageGB', value[0])}
              max={1000}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Globe className="w-4 h-4" />
              RPC Requests/Month: {usage.rpcRequestsPerMonth.toLocaleString()}
            </Label>
            <Slider
              value={[usage.rpcRequestsPerMonth]}
              onValueChange={(value) => handleUsageChange('rpcRequestsPerMonth', value[0])}
              max={500000000}
              step={10000}
              className="w-full"
            />
          </div>

          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Zap className="w-4 h-4" />
              Sponsored Transactions/Month: {usage.sponsoredTransactions.toLocaleString()}
            </Label>
            <Slider
              value={[usage.sponsoredTransactions]}
              onValueChange={(value) => handleUsageChange('sponsoredTransactions', value[0])}
              max={10000}
              step={10}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Cost Breakdown */}
      <Card className="border-primary/20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            {timeframe === 'monthly' ? 'Monthly' : 'Yearly'} Cost Breakdown
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Database className="w-4 h-4" />
                  Database
                </span>
                <span className={getCostColor(costBreakdown.database)}>
                  ${costBreakdown.database.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  RPC Provider
                </span>
                <span className={getCostColor(costBreakdown.rpc)}>
                  ${costBreakdown.rpc.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <HardDrive className="w-4 h-4" />
                  Storage
                </span>
                <span className={getCostColor(costBreakdown.storage)}>
                  ${costBreakdown.storage.toFixed(2)}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="flex items-center gap-2">
                  <Zap className="w-4 h-4" />
                  Gasless Txns
                </span>
                <span className={getCostColor(costBreakdown.paymaster)}>
                  ${costBreakdown.paymaster.toFixed(2)}
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <div className="p-4 glass rounded-lg text-center">
                <div className="text-2xl font-bold text-primary">
                  ${costBreakdown.total.toFixed(2)}
                </div>
                <div className="text-sm text-muted-foreground">
                  Total {timeframe} cost
                </div>
              </div>

              {costBreakdown.total === 0 && (
                <div className="flex items-center gap-2 text-green-400 text-sm">
                  <CheckCircle className="w-4 h-4" />
                  100% Free tier usage!
                </div>
              )}
            </div>
          </div>

          {/* Free Tier Usage */}
          {costBreakdown.freeTierUsage.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-green-400">Free Tier Benefits</h4>
              <div className="space-y-1">
                {costBreakdown.freeTierUsage.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <CheckCircle className="w-3 h-3 text-green-400" />
                    {benefit}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Warnings */}
          {costBreakdown.warnings.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-orange-400">Usage Warnings</h4>
              <div className="space-y-1">
                {costBreakdown.warnings.map((warning, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <AlertCircle className="w-3 h-3 text-orange-400" />
                    {warning}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Cost Optimization Tips */}
          <div className="p-3 glass rounded-lg">
            <h4 className="text-sm font-medium mb-2">💡 Cost Optimization Tips</h4>
            <div className="text-xs text-muted-foreground space-y-1">
              {costBreakdown.total > 50 && (
                <div>• Consider using free alternatives like Fireproof + IPFS for lower costs</div>
              )}
              {usage.rpcRequestsPerMonth > 100000000 && (
                <div>• Implement request caching to reduce RPC usage</div>
              )}
              {usage.storageGB > 10 && (
                <div>• Use IPFS for public assets and centralized storage for private data</div>
              )}
              <div>• Start with free tiers and scale based on actual usage</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};