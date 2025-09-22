import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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
      throw new Error('No stripe-signature header')
    }

    const body = await req.text()
    const stripeWebhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')
    
    // TODO: Verify Stripe webhook signature
    // For now, we'll parse the event directly (this should be secured in production)
    const event = JSON.parse(body)

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
  // Record successful payment
  const { error } = await supabaseClient
    .from('payment_transactions')
    .insert({
      user_id: invoice.customer, // This would need to be mapped to our user_id
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
  // Record failed payment
  const { error } = await supabaseClient
    .from('payment_transactions')
    .insert({
      user_id: invoice.customer, // This would need to be mapped to our user_id
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