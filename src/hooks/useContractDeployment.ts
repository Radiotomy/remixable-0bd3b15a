import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface TokenConfig {
  name: string
  symbol: string
  totalSupply: number
  description?: string
  [key: string]: any
}

interface DeploymentResult {
  tokenAddress: string
  factoryAddress: string
  revenueAddress: string
  transactionHash: string
  blockNumber: string
  gasUsed: string
  network: string
  chainId: number
}

export const useContractDeployment = () => {
  const [isDeploying, setIsDeploying] = useState(false)
  const [deploymentResult, setDeploymentResult] = useState<DeploymentResult | null>(null)
  const { toast } = useToast()

  const deployContracts = async (tokenConfig: TokenConfig): Promise<DeploymentResult | null> => {
    setIsDeploying(true)
    setDeploymentResult(null)

    try {
      // Get current user
      const { data: { user }, error: userError } = await supabase.auth.getUser()
      
      if (userError || !user) {
        throw new Error('User not authenticated')
      }

      toast({
        title: '🚀 Deploying to BASE Mainnet',
        description: `Deploying ${tokenConfig.name} (${tokenConfig.symbol}) contracts...`,
      })

      // Call deploy-contracts edge function
      const { data, error } = await supabase.functions.invoke('deploy-contracts', {
        body: {
          tokenConfig,
          userId: user.id
        }
      })

      if (error) {
        throw error
      }

      if (!data.success) {
        throw new Error(data.error || 'Deployment failed')
      }

      const result = data.deployment as DeploymentResult

      setDeploymentResult(result)

      toast({
        title: '✅ Deployment Successful!',
        description: `Token deployed at ${result.tokenAddress.slice(0, 6)}...${result.tokenAddress.slice(-4)}`,
      })

      return result

    } catch (error: any) {
      console.error('Deployment error:', error)
      
      toast({
        title: '❌ Deployment Failed',
        description: error.message || 'Failed to deploy contracts. Please try again.',
        variant: 'destructive',
      })

      return null
    } finally {
      setIsDeploying(false)
    }
  }

  return {
    deployContracts,
    isDeploying,
    deploymentResult,
  }
}
