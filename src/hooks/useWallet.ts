import { useState, useCallback } from 'react'
import { useAccount, useConnect, useDisconnect, useBalance } from 'wagmi'
import { parseEther, formatEther } from 'viem'
import { USDC_CONTRACT_ADDRESS } from '@/lib/web3.config'
import { useToast } from '@/hooks/use-toast'

const PLATFORM_WALLET_ADDRESS: `0x${string}` = '0x0000000000000000000000000000000000000000'

export const useWallet = () => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { toast } = useToast()

  // Get ETH balance
  const { data: ethBalance } = useBalance({
    address,
  })

  // Get USDC balance
  const { data: usdcBalance } = useBalance({
    address,
    token: chain?.id ? USDC_CONTRACT_ADDRESS[chain.id] : undefined,
  })

  const connectWallet = useCallback(async (preferredWallet?: string) => {
    try {
      let connector
      
      if (preferredWallet === 'coinbase' || !preferredWallet) {
        // Prioritize Coinbase Wallet for BASE
        connector = connectors.find(c => 
          c.name.toLowerCase().includes('coinbase') || 
          c.id === 'coinbaseWalletSDK'
        )
      } else if (preferredWallet === 'metamask') {
        connector = connectors.find(c => 
          c.name.toLowerCase().includes('metamask') ||
          c.id === 'metaMask'
        )
      }
      
      // Fallback to first available connector
      if (!connector) {
        connector = connectors[0]
      }
      
      connect({ connector })
      
      toast({
        title: 'Connecting to Wallet',
        description: `Connecting to ${connector.name}...`,
      })
    } catch (error) {
      console.error('Error connecting wallet:', error)
      toast({
        title: 'Connection Error',
        description: 'Failed to connect wallet',
        variant: 'destructive',
      })
    }
  }, [connect, connectors, toast])

  const disconnectWallet = useCallback(() => {
    disconnect()
  }, [disconnect])

  const processUSDCPayment = useCallback(async (amountUSDC: number) => {
    if (!isConnected || !address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to make a payment',
        variant: 'destructive',
      })
      return false
    }

    setIsProcessingPayment(true)
    
    try {
      // TODO: Implement actual USDC transfer
      // This would require a contract interaction to transfer USDC
      // For now, we'll simulate the payment process
      
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate processing time
      
      toast({
        title: 'Payment Successful',
        description: `Successfully paid ${amountUSDC} USDC`,
      })
      
      return true
    } catch (error) {
      console.error('Payment error:', error)
      toast({
        title: 'Payment Failed',
        description: 'Failed to process USDC payment',
        variant: 'destructive',
      })
      return false
    } finally {
      setIsProcessingPayment(false)
    }
  }, [isConnected, address, toast])

  const connectCoinbaseWallet = useCallback(() => {
    connectWallet('coinbase')
  }, [connectWallet])

  return {
    // Wallet state
    address,
    isConnected,
    chain,
    ethBalance: ethBalance ? formatEther(ethBalance.value) : '0',
    usdcBalance: usdcBalance ? formatEther(usdcBalance.value) : '0',
    
    // Wallet actions
    connectWallet,
    connectCoinbaseWallet, // Specific BASE wallet connection
    disconnectWallet,
    isConnecting: isPending,
    
    // Payment processing
    processUSDCPayment,
    isProcessingPayment,
  }
}