import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Wallet, LogOut, Copy, ExternalLink } from 'lucide-react'
import { useWallet } from '@/hooks/useWallet'
import { useToast } from '@/hooks/use-toast'

export const WalletConnect = () => {
  const {
    address,
    isConnected,
    chain,
    ethBalance,
    usdcBalance,
    connectWallet,
    disconnectWallet,
    isConnecting,
  } = useWallet()
  
  const { toast } = useToast()

  const copyAddress = () => {
    if (address) {
      navigator.clipboard.writeText(address)
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard',
      })
    }
  }

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  const openInExplorer = () => {
    if (address && chain) {
      const explorerUrl = chain.blockExplorers?.default?.url
      if (explorerUrl) {
        window.open(`${explorerUrl}/address/${address}`, '_blank')
      }
    }
  }

  if (!isConnected) {
    return (
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
            <Wallet className="w-6 h-6 text-primary" />
          </div>
          <CardTitle>Connect Your Wallet</CardTitle>
          <CardDescription>
            Connect your Web3 wallet to pay with crypto and access Base chain features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={connectWallet} 
            disabled={isConnecting}
            className="w-full"
          >
            {isConnecting ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Connected
          </CardTitle>
          <Badge variant="secondary" className="text-xs">
            {chain?.name || 'Unknown'}
          </Badge>
        </div>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Address */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Address</label>
          <div className="flex items-center gap-2">
            <code className="flex-1 text-sm bg-muted px-2 py-1 rounded">
              {formatAddress(address!)}
            </code>
            <Button size="sm" variant="ghost" onClick={copyAddress}>
              <Copy className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="ghost" onClick={openInExplorer}>
              <ExternalLink className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Balances */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">ETH Balance</label>
            <p className="text-sm text-muted-foreground">
              {parseFloat(ethBalance).toFixed(4)} ETH
            </p>
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">USDC Balance</label>
            <p className="text-sm text-muted-foreground">
              {parseFloat(usdcBalance).toFixed(2)} USDC
            </p>
          </div>
        </div>

        {/* Actions */}
        <div className="pt-4 border-t">
          <Button 
            variant="outline" 
            onClick={disconnectWallet}
            className="w-full"
          >
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect Wallet
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}