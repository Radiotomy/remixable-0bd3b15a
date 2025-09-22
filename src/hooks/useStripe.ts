import { useState } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'

export const useStripe = () => {
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const createCheckoutSession = async (planId: string) => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase.functions.invoke('stripe-payments', {
        body: {
          action: 'create_checkout_session',
          planId,
          userId: user.id,
          successUrl: `${window.location.origin}/pricing?success=true`,
          cancelUrl: `${window.location.origin}/pricing?canceled=true`,
        }
      })

      if (error) {
        if (error.message?.includes('Stripe secret key')) {
          toast({
            title: 'Stripe Not Configured',
            description: 'Stripe payments are not yet configured. Please contact support.',
            variant: 'destructive',
          })
          return null
        }
        throw error
      }

      // Redirect to Stripe Checkout
      if (data.url) {
        window.location.href = data.url
      }

      return data
    } catch (error) {
      console.error('Stripe checkout error:', error)
      toast({
        title: 'Payment Error',
        description: 'Failed to create checkout session. Please try again.',
        variant: 'destructive',
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  const createCustomer = async (email: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase.functions.invoke('stripe-payments', {
        body: {
          action: 'create_customer',
          email,
          userId: user.id,
        }
      })

      if (error) throw error
      return data
    } catch (error) {
      console.error('Create customer error:', error)
      return null
    }
  }

  const cancelSubscription = async (subscriptionId: string) => {
    setLoading(true)
    try {
      const { data, error } = await supabase.functions.invoke('stripe-payments', {
        body: {
          action: 'cancel_subscription',
          subscriptionId,
        }
      })

      if (error) throw error

      toast({
        title: 'Subscription Canceled',
        description: 'Your subscription will be canceled at the end of the current period.',
      })

      return data
    } catch (error) {
      console.error('Cancel subscription error:', error)
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription. Please contact support.',
        variant: 'destructive',
      })
      return null
    } finally {
      setLoading(false)
    }
  }

  return {
    loading,
    createCheckoutSession,
    createCustomer,
    cancelSubscription,
  }
}