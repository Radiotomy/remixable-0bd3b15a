import { SubscriptionPlans } from '@/components/SubscriptionPlans'
import { WalletConnect } from '@/components/WalletConnect'
import { Button } from '@/components/ui/button'
import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'

const Pricing = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" asChild>
              <Link to="/">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <h1 className="text-xl font-semibold">Pricing</h1>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Subscription Plans */}
            <div className="lg:col-span-3">
              <SubscriptionPlans />
            </div>
            
            {/* Wallet Connection Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8">
                <WalletConnect />
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default Pricing