import { useState } from 'react'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Check, CreditCard, Wallet } from 'lucide-react'
import { useSubscription } from '@/hooks/useSubscription'
import { useWallet } from '@/hooks/useWallet'
import { useStripe } from '@/hooks/useStripe'
import { useToast } from '@/hooks/use-toast'

interface SubscriptionPlansProps {
  onPlanSelect?: (planId: string, paymentMethod: 'stripe' | 'crypto') => void
}

export const SubscriptionPlans = ({ onPlanSelect }: SubscriptionPlansProps) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly')
  const [selectedPlan, setSelectedPlan] = useState<string>('')
  const [paymentMethod, setPaymentMethod] = useState<'stripe' | 'crypto'>('stripe')
  const [loading, setLoading] = useState(false)
  
  const { plans, currentSubscription, createSubscription } = useSubscription()
  const { isConnected, connectWallet, processUSDCPayment, address } = useWallet()
  const { createCheckoutSession, loading: stripeLoading } = useStripe()
  const { toast } = useToast()

  const handlePlanSelect = async (planId: string) => {
    if (currentSubscription?.status === 'active') {
      toast({
        title: 'Already Subscribed',
        description: 'You already have an active subscription',
        variant: 'destructive',
      })
      return
    }

    setSelectedPlan(planId)
    setLoading(true)

    try {
      const plan = plans.find(p => p.id === planId)
      if (!plan) return

      if (paymentMethod === 'crypto') {
        if (!isConnected) {
          await connectWallet()
          setLoading(false)
          return
        }

        const amount = billingCycle === 'monthly' 
          ? plan.crypto_price_monthly_usdc 
          : plan.crypto_price_yearly_usdc

        if (amount > 0) {
          const success = await processUSDCPayment(amount)
          if (!success) {
            setLoading(false)
            return
          }
        }

        await createSubscription(planId, 'crypto', address)
      } else {
        // Stripe payment
        if (plan.price_monthly === 0) {
          // Free plan - create subscription directly
          await createSubscription(planId, 'stripe')
        } else {
          // Paid plan - redirect to Stripe Checkout
          await createCheckoutSession(planId)
          return // Don't continue after redirect
        }
      }

      onPlanSelect?.(planId, paymentMethod)
    } catch (error) {
      console.error('Error selecting plan:', error)
    } finally {
      setLoading(false)
      setSelectedPlan('')
    }
  }

  const getPrice = (plan: any) => {
    if (paymentMethod === 'crypto') {
      return billingCycle === 'monthly' 
        ? plan.crypto_price_monthly_usdc 
        : plan.crypto_price_yearly_usdc
    }
    return billingCycle === 'monthly' ? plan.price_monthly : plan.price_yearly
  }

  const getCurrency = () => paymentMethod === 'crypto' ? 'USDC' : 'USD'

  return (
    <div className="space-y-8">
      <div className="text-center space-y-4">
        <h2 className="text-3xl font-bold">Choose Your Plan</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan for your needs. Pay with traditional methods or crypto.
        </p>
      </div>

      {/* Billing Cycle Toggle */}
      <div className="flex justify-center">
        <Tabs value={billingCycle} onValueChange={(value: string) => setBillingCycle(value as 'monthly' | 'yearly')}>
          <TabsList>
            <TabsTrigger value="monthly">Monthly</TabsTrigger>
            <TabsTrigger value="yearly">
              Yearly
              <Badge variant="secondary" className="ml-2">Save 17%</Badge>
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Payment Method Selection */}
      <div className="flex justify-center">
        <Tabs value={paymentMethod} onValueChange={(value: string) => setPaymentMethod(value as 'stripe' | 'crypto')}>
          <TabsList>
            <TabsTrigger value="stripe">
              <CreditCard className="w-4 h-4 mr-2" />
              Card/Stripe
            </TabsTrigger>
            <TabsTrigger value="crypto">
              <Wallet className="w-4 h-4 mr-2" />
              Crypto (USDC)
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans.map((plan) => {
          const price = getPrice(plan)
          const isCurrentPlan = currentSubscription?.plan_id === plan.id
          const features = Array.isArray(plan.features) ? plan.features : JSON.parse(plan.features as string || '[]')

          return (
            <Card key={plan.id} className={`relative ${plan.name === 'Pro' ? 'border-primary' : ''}`}>
              {plan.name === 'Pro' && (
                <Badge className="absolute -top-2 left-1/2 transform -translate-x-1/2">
                  Most Popular
                </Badge>
              )}
              
              <CardHeader className="text-center">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="text-3xl font-bold">
                  {price === 0 ? 'Free' : `$${price} ${getCurrency()}`}
                  {price > 0 && (
                    <span className="text-sm font-normal text-muted-foreground">
                      /{billingCycle === 'monthly' ? 'month' : 'year'}
                    </span>
                  )}
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <ul className="space-y-3">
                  {features.map((feature, index) => (
                    <li key={index} className="flex items-center">
                      <Check className="w-4 h-4 text-primary mr-2 flex-shrink-0" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>

              <CardFooter>
                <Button
                  className="w-full"
                  variant={isCurrentPlan ? 'secondary' : 'default'}
                  disabled={loading || stripeLoading || isCurrentPlan}
                  onClick={() => handlePlanSelect(plan.id)}
                >
                  {(loading || stripeLoading) && selectedPlan === plan.id ? (
                    'Processing...'
                  ) : isCurrentPlan ? (
                    'Current Plan'
                  ) : paymentMethod === 'crypto' && !isConnected && price > 0 ? (
                    'Connect Wallet'
                  ) : (
                    `Select ${plan.name}`
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>

      {/* Current Subscription Info */}
      {currentSubscription && (
        <Card className="max-w-md mx-auto">
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <p><strong>Plan:</strong> {currentSubscription.subscription_plans.name}</p>
              <p><strong>Status:</strong> {currentSubscription.status}</p>
              <p><strong>Payment Method:</strong> {currentSubscription.payment_method}</p>
              {currentSubscription.current_period_end && (
                <p><strong>Next Billing:</strong> {new Date(currentSubscription.current_period_end).toLocaleDateString()}</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}