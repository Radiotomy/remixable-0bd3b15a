import { useState, useMemo } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Search, Filter } from 'lucide-react'
import { Link } from 'react-router-dom'
import IntegrationCard from '@/components/IntegrationCard'
import { integrations, Integration, getIntegrationsByCategory, getIntegrationsByType } from '@/data/integrations'
import { useToast } from '@/hooks/use-toast'

const Integrations = () => {
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedType, setSelectedType] = useState<string>('all')
  const { toast } = useToast()

  const handleConnectIntegration = (integration: Integration) => {
    if (integration.status === 'coming-soon') {
      toast({
        title: "Coming Soon",
        description: `${integration.name} integration is under development. Stay tuned!`,
      })
      return
    }

    if (integration.status === 'setup-required' || integration.category === 'api-key') {
      toast({
        title: "Setup Required",
        description: `${integration.name} requires additional configuration. Setup wizard coming soon!`,
      })
      return
    }

    toast({
      title: "Integration Connected",
      description: `${integration.name} has been added to your project!`,
    })
  }

  const filteredIntegrations = useMemo(() => {
    let filtered = integrations

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(integration =>
        integration.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        integration.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
      )
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(integration => integration.type === selectedType)
    }

    return filtered
  }, [searchQuery, selectedType])

  const freeIntegrations = getIntegrationsByCategory('free')
  const apiKeyIntegrations = getIntegrationsByCategory('api-key')
  const premiumIntegrations = getIntegrationsByCategory('premium')

  const integrationTypes = [
    { value: 'all', label: 'All', count: integrations.length },
    { value: 'web3', label: 'Web3', count: getIntegrationsByType('web3').length },
    { value: 'ai', label: 'AI & LLM', count: getIntegrationsByType('ai').length },
    { value: 'payments', label: 'Payments', count: getIntegrationsByType('payments').length },
    { value: 'defi', label: 'DeFi', count: getIntegrationsByType('defi').length },
    { value: 'communication', label: 'Communication', count: getIntegrationsByType('communication').length },
    { value: 'storage', label: 'Storage', count: getIntegrationsByType('storage').length },
    { value: 'analytics', label: 'Analytics', count: getIntegrationsByType('analytics').length },
    { value: 'social', label: 'Social', count: getIntegrationsByType('social').length },
    { value: 'developer', label: 'Developer', count: getIntegrationsByType('developer').length },
  ]

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div className="flex-1 flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold">Integration Marketplace</h1>
                <p className="text-muted-foreground">Connect your app to powerful services and APIs</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="bg-accent/20 text-accent-foreground">
                  {integrations.length} Integrations
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Search and Filters */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex flex-col lg:flex-row gap-4 mb-8">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search integrations, features, or tags..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-muted-foreground" />
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-background border border-input rounded-md px-3 py-2 text-sm"
            >
              {integrationTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label} ({type.count})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Integration Categories */}
        <Tabs defaultValue="all" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4 lg:w-auto lg:grid-cols-4">
            <TabsTrigger value="all">All ({integrations.length})</TabsTrigger>
            <TabsTrigger value="free">🟢 Free ({freeIntegrations.length})</TabsTrigger>
            <TabsTrigger value="api-key">🟡 API Key ({apiKeyIntegrations.length})</TabsTrigger>
            <TabsTrigger value="premium">🔴 Premium ({premiumIntegrations.length})</TabsTrigger>
          </TabsList>

          <TabsContent value="all" className="space-y-6">
            {filteredIntegrations.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No integrations found matching your criteria.</p>
                <p className="text-sm text-muted-foreground mt-2">Try adjusting your search or filters.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredIntegrations.map((integration) => (
                  <IntegrationCard
                    key={integration.id}
                    integration={integration}
                    onConnect={handleConnectIntegration}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="free" className="space-y-6">
            <div className="bg-accent/10 border border-accent/20 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-accent-foreground mb-2">🟢 Free Integrations</h3>
              <p className="text-sm text-muted-foreground">
                These integrations are completely free to use with no API keys required. 
                Perfect for getting started or building proof-of-concepts.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {freeIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={handleConnectIntegration}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="api-key" className="space-y-6">
            <div className="bg-primary/10 border border-primary/20 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-primary-foreground mb-2">🟡 API Key Required</h3>
              <p className="text-sm text-muted-foreground">
                These integrations require you to sign up with the service provider and provide your own API keys. 
                Most offer free tiers or pay-as-you-go pricing.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {apiKeyIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={handleConnectIntegration}
                />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="premium" className="space-y-6">
            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold text-destructive-foreground mb-2">🔴 Premium Services</h3>
              <p className="text-sm text-muted-foreground">
                These integrations require paid subscriptions or have higher usage costs. 
                Ideal for production applications with specific enterprise needs.
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {premiumIntegrations.map((integration) => (
                <IntegrationCard
                  key={integration.id}
                  integration={integration}
                  onConnect={handleConnectIntegration}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

export default Integrations