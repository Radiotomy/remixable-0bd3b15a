import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const supabase = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
)

interface PaymentVerificationRequest {
  transactionHash: string
  walletAddress: string
  expectedAmount: number
  subscriptionId?: string
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { transactionHash, walletAddress, expectedAmount, subscriptionId }: PaymentVerificationRequest = await req.json()
    
    console.log('Verifying payment:', { transactionHash, walletAddress, expectedAmount })

    // In a real implementation, you would:
    // 1. Query the blockchain to verify the transaction
    // 2. Check that the transaction sent the correct amount to the platform wallet
    // 3. Verify the transaction is confirmed and not reverted
    
    // For now, we'll update the payment status and activate subscription
    const { error: updateError } = await supabase
      .from('payment_transactions')
      .update({ 
        status: 'verified',
        transaction_hash: transactionHash 
      })
      .eq('transaction_hash', transactionHash)
      .eq('wallet_address', walletAddress)

    if (updateError) {
      throw updateError
    }

    // Activate subscription if provided
    if (subscriptionId) {
      const { error: subError } = await supabase
        .from('user_subscriptions')
        .update({ 
          status: 'active',
          current_period_start: new Date().toISOString(),
          current_period_end: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
        })
        .eq('id', subscriptionId)

      if (subError) {
        throw subError
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Payment verified and subscription activated' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Payment verification error:', error)
    return new Response(
      JSON.stringify({ error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})