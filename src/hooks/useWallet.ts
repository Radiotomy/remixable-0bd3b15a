import { useState, useCallback, useEffect } from 'react'
import { useAccount, useConnect, useDisconnect, useBalance, useSwitchChain, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits, formatEther, erc20Abi } from 'viem'
import { USDC_CONTRACT_ADDRESS, PLATFORM_WALLET_ADDRESS, BASE_CHAIN_ID } from '@/lib/web3.config'
import { useToast } from '@/hooks/use-toast'
import { supabase } from '@/integrations/supabase/client'

export const useWallet = () => {
  const [isProcessingPayment, setIsProcessingPayment] = useState(false)
  const [pendingPayment, setPendingPayment] = useState<{ amount: number, planId?: string } | null>(null)
  
  const { address, isConnected, chain } = useAccount()
  const { connect, connectors, isPending } = useConnect()
  const { disconnect } = useDisconnect()
  const { switchChain } = useSwitchChain()
  const { writeContract, data: hash, error: writeError } = useWriteContract()
  const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({ hash })
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

  // Handle transaction confirmation
  useEffect(() => {
    if (isConfirmed && hash && pendingPayment) {
      const handleConfirmedPayment = async () => {
        // Record successful payment in database
        const { error: dbError } = await supabase
          .from('payment_transactions')
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            amount: pendingPayment.amount,
            currency: 'USDC',
            payment_method: 'crypto',
            wallet_address: address,
            transaction_hash: hash,
            status: 'completed',
            subscription_id: pendingPayment.planId
          })

        if (dbError) {
          console.error('Database error:', dbError)
        }

        toast({
          title: 'Payment Confirmed',
          description: `Successfully paid ${pendingPayment.amount} USDC`,
        })

        setPendingPayment(null)
        setIsProcessingPayment(false)
      }

      handleConfirmedPayment()
    }
  }, [isConfirmed, hash, pendingPayment, address, toast])

  // Handle transaction errors
  useEffect(() => {
    if (writeError && pendingPayment) {
      const handleFailedPayment = async () => {
        // Record failed payment
        await supabase
          .from('payment_transactions')
          .insert({
            user_id: (await supabase.auth.getUser()).data.user?.id,
            amount: pendingPayment.amount,
            currency: 'USDC',
            payment_method: 'crypto',
            wallet_address: address,
            status: 'failed',
            subscription_id: pendingPayment.planId
          })

        toast({
          title: 'Payment Failed',
          description: writeError.message || 'Failed to process USDC payment',
          variant: 'destructive',
        })

        setPendingPayment(null)
        setIsProcessingPayment(false)
      }

      handleFailedPayment()
    }
  }, [writeError, pendingPayment, address, toast])

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

  const processUSDCPayment = useCallback(async (amountUSDC: number, planId?: string) => {
    if (!isConnected || !address) {
      toast({
        title: 'Wallet Not Connected',
        description: 'Please connect your wallet to make a payment',
        variant: 'destructive',
      })
      return false
    }

    // Check if on correct network
    if (chain?.id !== BASE_CHAIN_ID) {
      try {
        await switchChain({ chainId: BASE_CHAIN_ID })
      } catch (error) {
        toast({
          title: 'Network Error',
          description: 'Please switch to Base network to complete payment',
          variant: 'destructive',
        })
        return false
      }
    }

    const usdcContractAddress = USDC_CONTRACT_ADDRESS[BASE_CHAIN_ID]
    const amountWei = parseUnits(amountUSDC.toString(), 6) // USDC has 6 decimals

    // Check USDC balance
    if (usdcBalance && usdcBalance.value < amountWei) {
      toast({
        title: 'Insufficient Balance',
        description: `You need at least ${amountUSDC} USDC to complete this payment`,
        variant: 'destructive',
      })
      return false
    }

    setIsProcessingPayment(true)
    setPendingPayment({ amount: amountUSDC, planId })
    
    try {
      toast({
        title: 'Confirm Transaction',
        description: 'Please confirm the USDC transfer in your wallet',
      })

      // Execute USDC transfer
      writeContract({
        abi: erc20Abi,
        address: usdcContractAddress,
        functionName: 'transfer',
        args: [PLATFORM_WALLET_ADDRESS, amountWei],
        account: address,
        chain: chain,
      })

      // Return true to indicate transaction was initiated
      return true
    } catch (error: any) {
      console.error('Payment error:', error)
      
      // Record failed payment
      await supabase
        .from('payment_transactions')
        .insert({
          user_id: (await supabase.auth.getUser()).data.user?.id,
          amount: amountUSDC,
          currency: 'USDC',
          payment_method: 'crypto',
          wallet_address: address,
          status: 'failed',
          subscription_id: planId
        })

      toast({
        title: 'Payment Failed',
        description: error.message || 'Failed to process USDC payment',
        variant: 'destructive',
      })
      
      setPendingPayment(null)
      setIsProcessingPayment(false)
      return false
    }
  }, [isConnected, address, chain, usdcBalance, switchChain, writeContract, toast])

  const connectCoinbaseWallet = useCallback(() => {
    connectWallet('coinbase')
  }, [connectWallet])

  return {
    // Wallet state
    address,
    isConnected,
    chain,
    ethBalance: ethBalance ? formatEther(ethBalance.value) : '0',
    usdcBalance: usdcBalance ? formatUnits(usdcBalance.value, 6) : '0',
    
    // Wallet actions
    connectWallet,
    connectCoinbaseWallet, // Specific BASE wallet connection
    disconnectWallet,
    isConnecting: isPending,
    
    // Payment processing
    processUSDCPayment,
    isProcessingPayment: isProcessingPayment || isConfirming,
  }
}