import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import Stripe from 'https://esm.sh/stripe@14.21.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, stripe-signature',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const signature = req.headers.get('stripe-signature')
    if (!signature) {
      console.error('Missing stripe-signature header')
      throw new Error('No stripe-signature header')
    }

    const body = await req.text()
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    
    if (!stripeWebhookSecret) {
      console.error('STRIPE_WEBHOOK_SECRET not configured')
      throw new Error('Webhook secret not configured')
    }

    if (!stripeSecretKey) {
      console.error('STRIPE_SECRET_KEY not configured')
      throw new Error('Stripe secret key not configured')
    }

    // Verify Stripe webhook signature
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2023-10-16',
    })

    let event
    try {
      event = stripe.webhooks.constructEvent(body, signature, stripeWebhookSecret)
      console.log('Webhook signature verified successfully')
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message)
      return new Response(JSON.stringify({ error: 'Invalid signature' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      })
    }

    console.log('Stripe webhook event:', event.type)

    switch (event.type) {
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionUpdate(supabaseClient, event.data.object)
        break
      
      case 'customer.subscription.deleted':
        await handleSubscriptionCanceled(supabaseClient, event.data.object)
        break
      
      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(supabaseClient, event.data.object)
        break
      
      case 'invoice.payment_failed':
        await handlePaymentFailed(supabaseClient, event.data.object)
        break
      
      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    })

  } catch (error) {
    console.error('Stripe webhook error:', error)
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

async function handleSubscriptionUpdate(supabaseClient: any, subscription: any) {
  const { error } = await supabaseClient
    .from('user_subscriptions')
    .update({
      status: subscription.status,
      current_period_start: new Date(subscription.current_period_start * 1000).toISOString(),
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end,
    })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error updating subscription:', error)
    throw error
  }
}

async function handleSubscriptionCanceled(supabaseClient: any, subscription: any) {
  const { error } = await supabaseClient
    .from('user_subscriptions')
    .update({ status: 'canceled' })
    .eq('stripe_subscription_id', subscription.id)

  if (error) {
    console.error('Error canceling subscription:', error)
    throw error
  }
}

async function handlePaymentSucceeded(supabaseClient: any, invoice: any) {
  // Map Stripe customer ID to our user_id
  const { data: subscription, error: subError } = await supabaseClient
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', invoice.customer)
    .single()

  if (subError || !subscription) {
    console.error('Failed to map customer to user:', subError)
    throw new Error(`Cannot find user for customer ${invoice.customer}`)
  }

  // Record successful payment with proper user_id
  const { error } = await supabaseClient
    .from('payment_transactions')
    .insert({
      user_id: subscription.user_id,
      amount: invoice.amount_paid / 100, // Convert from cents
      currency: invoice.currency,
      payment_method: 'stripe',
      status: 'completed',
      stripe_payment_intent_id: invoice.payment_intent,
    })

  if (error) {
    console.error('Error recording payment:', error)
    throw error
  }
}

async function handlePaymentFailed(supabaseClient: any, invoice: any) {
  // Map Stripe customer ID to our user_id
  const { data: subscription, error: subError } = await supabaseClient
    .from('user_subscriptions')
    .select('user_id')
    .eq('stripe_customer_id', invoice.customer)
    .single()

  if (subError || !subscription) {
    console.error('Failed to map customer to user:', subError)
    throw new Error(`Cannot find user for customer ${invoice.customer}`)
  }

  // Record failed payment with proper user_id
  const { error } = await supabaseClient
    .from('payment_transactions')
    .insert({
      user_id: subscription.user_id,
      amount: invoice.amount_due / 100, // Convert from cents
      currency: invoice.currency,
      payment_method: 'stripe',
      status: 'failed',
      stripe_payment_intent_id: invoice.payment_intent,
    })

  if (error) {
    console.error('Error recording failed payment:', error)
    throw error
  }
}