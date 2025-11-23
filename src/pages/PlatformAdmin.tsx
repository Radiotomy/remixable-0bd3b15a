import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/integrations/supabase/client"
import { useAdminAuth } from "@/hooks/useAdminAuth"
import { Coins, Rocket, Database, Shield, ExternalLink, Loader2 } from 'lucide-react'

interface ContractStatus {
  name: string
  address?: string
  deployed: boolean
  verified: boolean
  txHash?: string
  gasUsed?: string
  deployedAt?: string
}

export default function PlatformAdmin() {
  const { isAdmin, isLoading } = useAdminAuth()
  const [contracts, setContracts] = useState<ContractStatus[]>([
    { name: 'RMX Platform Token', deployed: false, verified: false },
    { name: 'Token Factory', deployed: false, verified: false },
    { name: 'Revenue Distribution', deployed: false, verified: false }
  ])
  const [isDeploying, setIsDeploying] = useState(false)
  const [platformStats, setPlatformStats] = useState({
    totalUsers: 0,
    totalProjects: 0,
    totalRevenue: 0,
    totalDeployments: 0
  })
  const { toast } = useToast()

  // All hooks must be called before any conditional returns
  useEffect(() => {
    if (isAdmin && !isLoading) {
      fetchPlatformStats()
    }
  }, [isAdmin, isLoading])

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying admin access...</p>
        </div>
      </div>
    )
  }

  // If not admin, don't render anything (hook will redirect)
  if (!isAdmin) {
    return null
  }

  const fetchPlatformStats = async () => {
    try {
      // Fetch platform statistics
      const { data: profiles } = await supabase.from('profiles').select('id')
      const { data: projects } = await supabase.from('projects').select('id')
      const { data: payments } = await supabase
        .from('payment_transactions')
        .select('amount')
        .eq('status', 'completed')

      const totalRevenue = payments?.reduce((sum, p) => sum + Number(p.amount), 0) || 0

      setPlatformStats({
        totalUsers: profiles?.length || 0,
        totalProjects: projects?.length || 0,
        totalRevenue,
        totalDeployments: 0 // Will be updated when we track deployments
      })
    } catch (error) {
      console.error('Error fetching platform stats:', error)
    }
  }

  const deployPlatformContracts = async () => {
    setIsDeploying(true)
    
    try {
      toast({
        title: "Deploying Platform Contracts",
        description: "Deploying RMX token and platform infrastructure to BASE mainnet..."
      })

      // Call the deploy-contracts edge function
      const { data, error } = await supabase.functions.invoke('deploy-contracts', {
        body: {
          tokenConfig: {
            name: 'Remixable Token',
            symbol: 'RMX',
            totalSupply: 1000000000, // 1 billion tokens
            decimals: 18
          },
          userAddress: '0x742d35Cc5E6C4b8b4f1C8aF6260a3F0a1b5C4eE0' // Platform wallet
        }
      })

      if (error) throw error

      // Update contract statuses with deployment results
      const deployment = data.deployment
      setContracts([
        {
          name: 'RMX Platform Token',
          address: deployment.rmxTokenAddress,
          deployed: true,
          verified: false,
          txHash: deployment.transactionHashes[0],
          gasUsed: deployment.gasUsed.toString(),
          deployedAt: deployment.deployed_at
        },
        {
          name: 'Token Factory',
          address: deployment.factoryAddress,
          deployed: true,
          verified: false,
          txHash: deployment.transactionHashes[1],
          deployedAt: deployment.deployed_at
        },
        {
          name: 'Revenue Distribution',
          address: deployment.revenueAddress,
          deployed: true,
          verified: false,
          txHash: deployment.transactionHashes[2],
          deployedAt: deployment.deployed_at
        }
      ])

      toast({
        title: "Platform Contracts Deployed",
        description: `Successfully deployed to BASE mainnet. Total gas: ${deployment.gasUsed}`
      })

    } catch (error: any) {
      console.error('Deployment error:', error)
      toast({
        title: "Deployment Failed",
        description: error.message || "Failed to deploy platform contracts",
        variant: "destructive"
      })
    } finally {
      setIsDeploying(false)
    }
  }

  const openBaseScan = (address: string) => {
    window.open(`https://basescan.org/address/${address}`, '_blank')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto py-8">
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-2">
            <Shield className="h-8 w-8 text-primary" />
            <h1 className="text-3xl font-bold text-foreground">Platform Administration</h1>
          </div>
          <p className="text-muted-foreground">
            Manage BASE contract deployments and RMX token operations
          </p>
        </div>

        <Alert className="mb-6 border-amber-200 bg-amber-50">
          <Shield className="h-4 w-4" />
          <AlertDescription>
            This section is restricted to platform administrators only. 
            All operations are performed on BASE mainnet and involve real transactions.
          </AlertDescription>
        </Alert>

        <Tabs defaultValue="contracts" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="contracts">Contract Deployment</TabsTrigger>
            <TabsTrigger value="token">RMX Token Management</TabsTrigger>
            <TabsTrigger value="analytics">Platform Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="contracts" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Rocket className="h-5 w-5" />
                  BASE Mainnet Contract Deployment
                </CardTitle>
                <CardDescription>
                  Deploy core platform contracts to BASE blockchain
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4">
                  {contracts.map((contract, index) => (
                    <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium">{contract.name}</h3>
                          <Badge variant={contract.deployed ? "default" : "secondary"}>
                            {contract.deployed ? "Deployed" : "Not Deployed"}
                          </Badge>
                          {contract.verified && (
                            <Badge variant="outline" className="text-green-600 border-green-600">
                              Verified
                            </Badge>
                          )}
                        </div>
                        {contract.address && (
                          <div className="text-sm text-muted-foreground space-y-1">
                            <p>Address: {contract.address}</p>
                            {contract.txHash && <p>Tx Hash: {contract.txHash}</p>}
                            {contract.gasUsed && <p>Gas Used: {contract.gasUsed}</p>}
                            {contract.deployedAt && <p>Deployed: {new Date(contract.deployedAt).toLocaleString()}</p>}
                          </div>
                        )}
                      </div>
                      {contract.address && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => openBaseScan(contract.address!)}
                        >
                          <ExternalLink className="h-4 w-4 mr-1" />
                          BaseScan
                        </Button>
                      )}
                    </div>
                  ))}
                </div>

                <Separator />

                <div className="flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Network: BASE Mainnet (Chain ID: 8453)
                  </div>
                  <Button 
                    onClick={deployPlatformContracts}
                    disabled={isDeploying || contracts.every(c => c.deployed)}
                    size="lg"
                  >
                    {isDeploying ? (
                      <>Deploying...</>
                    ) : contracts.every(c => c.deployed) ? (
                      "All Contracts Deployed"
                    ) : (
                      "Deploy All Contracts"
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="token" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Coins className="h-5 w-5" />
                  RMX Token Management
                </CardTitle>
                <CardDescription>
                  Manage platform token operations and distribution
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Token Distribution</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>Total Supply:</span>
                          <span className="font-mono">1,000,000,000 RMX</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform Reserve:</span>
                          <span className="font-mono">500,000,000 RMX</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Revenue Sharing Pool:</span>
                          <span className="font-mono">300,000,000 RMX</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Community Rewards:</span>
                          <span className="font-mono">200,000,000 RMX</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg">Revenue Sharing</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span>App Creators:</span>
                          <span className="font-mono">85%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>RMX Holders:</span>
                          <span className="font-mono">10%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Platform Fee:</span>
                          <span className="font-mono">5%</span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Database className="h-4 w-4" />
                    Total Users
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformStats.totalUsers}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Total Projects</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformStats.totalProjects}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Total Revenue</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">${platformStats.totalRevenue.toFixed(2)}</div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-lg">Deployments</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{platformStats.totalDeployments}</div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}