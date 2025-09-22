import { useState, useEffect } from 'react'
import { supabase } from '@/integrations/supabase/client'
import { useToast } from '@/hooks/use-toast'
import type { Database } from '@/integrations/supabase/types'

type SubscriptionPlan = Database['public']['Tables']['subscription_plans']['Row']
type UserSubscription = Database['public']['Tables']['user_subscriptions']['Row'] & {
  subscription_plans: SubscriptionPlan
}

export const useSubscription = () => {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([])
  const [currentSubscription, setCurrentSubscription] = useState<UserSubscription | null>(null)
  const [loading, setLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    fetchPlans()
    fetchCurrentSubscription()
  }, [])

  const fetchPlans = async () => {
    try {
      const { data, error } = await supabase
        .from('subscription_plans')
        .select('*')
        .eq('is_active', true)
        .order('price_monthly', { ascending: true })

      if (error) throw error
      setPlans(data || [])
    } catch (error) {
      console.error('Error fetching plans:', error)
      toast({
        title: 'Error',
        description: 'Failed to load subscription plans',
        variant: 'destructive',
      })
    }
  }

  const fetchCurrentSubscription = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data, error } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          subscription_plans (*)
        `)
        .eq('user_id', user.id)
        .eq('status', 'active')
        .single()

        if (error && error.code !== 'PGRST116') throw error
      setCurrentSubscription(data as UserSubscription)
    } catch (error) {
      console.error('Error fetching subscription:', error)
    } finally {
      setLoading(false)
    }
  }

  const createSubscription = async (
    planId: string, 
    paymentMethod: 'stripe' | 'crypto',
    walletAddress?: string
  ) => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('User not authenticated')

      const { data, error } = await supabase
        .from('user_subscriptions')
        .insert({
          user_id: user.id,
          plan_id: planId,
          status: 'active',
          payment_method: paymentMethod,
          wallet_address: walletAddress,
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
        .select(`
          *,
          subscription_plans (*)
        `)
        .single()

      if (error) throw error
      setCurrentSubscription(data as UserSubscription)
      
      toast({
        title: 'Success',
        description: 'Subscription created successfully!',
      })

      return data
    } catch (error) {
      console.error('Error creating subscription:', error)
      toast({
        title: 'Error',
        description: 'Failed to create subscription',
        variant: 'destructive',
      })
      throw error
    }
  }

  const cancelSubscription = async () => {
    try {
      if (!currentSubscription) return

      const { error } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'canceled',
          cancel_at_period_end: true 
        })
        .eq('id', currentSubscription.id)

      if (error) throw error
      
      await fetchCurrentSubscription()
      
      toast({
        title: 'Success',
        description: 'Subscription canceled successfully',
      })
    } catch (error) {
      console.error('Error canceling subscription:', error)
      toast({
        title: 'Error',
        description: 'Failed to cancel subscription',
        variant: 'destructive',
      })
    }
  }

  return {
    plans,
    currentSubscription,
    loading,
    createSubscription,
    cancelSubscription,
    refreshSubscription: fetchCurrentSubscription
  }
}