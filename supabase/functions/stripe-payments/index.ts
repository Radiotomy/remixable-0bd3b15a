import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
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

    const { action, ...data } = await req.json()
    console.log('Stripe action:', action, data)

    // Get Stripe secret key from environment
    const stripeSecretKey = Deno.env.get('STRIPE_SECRET_KEY')
    if (!stripeSecretKey) {
      throw new Error('Stripe secret key not configured')
    }

    const stripe = createStripeClient(stripeSecretKey)

    switch (action) {
      case 'create_checkout_session':
        return await createCheckoutSession(supabaseClient, stripe, data)
      
      case 'create_customer':
        return await createCustomer(supabaseClient, stripe, data)
      
      case 'get_subscription':
        return await getSubscription(supabaseClient, stripe, data)
      
      case 'cancel_subscription':
        return await cancelSubscription(supabaseClient, stripe, data)
      
      default:
        throw new Error(`Unknown action: ${action}`)
    }

  } catch (error) {
    console.error('Stripe error:', error)
    return new Response(JSON.stringify({ 
      error: error.message,
      details: error.message.includes('Stripe secret key') ? 'Please configure Stripe API key in Supabase secrets' : undefined
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 400,
    })
  }
})

function createStripeClient(secretKey: string) {
  // Simple Stripe API client using fetch
  return {
    async post(endpoint: string, data: any) {
      const response = await fetch(`https://api.stripe.com/v1${endpoint}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${secretKey}`,
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: new URLSearchParams(data),
      })
      
      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Stripe API error: ${error}`)
      }
      
      return response.json()
    }
  }
}

async function createCheckoutSession(supabaseClient: any, stripe: any, data: any) {
  const { planId, userId, successUrl, cancelUrl } = data

  // Get plan details
  const { data: plan, error: planError } = await supabaseClient
    .from('subscription_plans')
    .select('*')
    .eq('id', planId)
    .single()

  if (planError || !plan) {
    throw new Error('Plan not found')
  }

  // Get or create Stripe customer
  const { data: userData, error: userError } = await supabaseClient
    .from('profiles')
    .select('email, stripe_customer_id')
    .eq('user_id', userId)
    .single()

  if (userError || !userData) {
    throw new Error('User not found')
  }

  let customerId = userData.stripe_customer_id

  // Create customer if doesn't exist
  if (!customerId) {
    const customer = await stripe.post('/customers', {
      email: userData.email,
      metadata: { user_id: userId }
    })
    customerId = customer.id

    // Update user with customer ID
    await supabaseClient
      .from('profiles')
      .update({ stripe_customer_id: customerId })
      .eq('user_id', userId)
  }

  // Create checkout session
  const session = await stripe.post('/checkout/sessions', {
    customer: customerId,
    payment_method_types: ['card'],
    line_items: JSON.stringify([{
      price_data: {
        currency: 'usd',
        product_data: {
          name: plan.name,
          description: plan.description,
        },
        unit_amount: plan.price_monthly * 100, // Convert to cents
        recurring: {
          interval: 'month'
        }
      },
      quantity: 1,
    }]),
    mode: 'subscription',
    success_url: successUrl,
    cancel_url: cancelUrl,
    metadata: {
      user_id: userId,
      plan_id: planId
    }
  })

  return new Response(JSON.stringify({ 
    sessionId: session.id,
    url: session.url 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function createCustomer(supabaseClient: any, stripe: any, data: any) {
  const { email, userId } = data

  const customer = await stripe.post('/customers', {
    email,
    metadata: { user_id: userId }
  })

  // Update user profile with customer ID
  await supabaseClient
    .from('profiles')
    .update({ stripe_customer_id: customer.id })
    .eq('user_id', userId)

  return new Response(JSON.stringify({ 
    customerId: customer.id 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function getSubscription(supabaseClient: any, stripe: any, data: any) {
  const { subscriptionId } = data

  const subscription = await stripe.post(`/subscriptions/${subscriptionId}`, {})

  return new Response(JSON.stringify({ 
    subscription 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

async function cancelSubscription(supabaseClient: any, stripe: any, data: any) {
  const { subscriptionId } = data

  const subscription = await stripe.post(`/subscriptions/${subscriptionId}`, {
    cancel_at_period_end: 'true'
  })

  return new Response(JSON.stringify({ 
    subscription 
  }), {
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}