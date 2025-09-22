import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { 
  Search, BookOpen, Code, Coins, Settings, CreditCard, MessageCircle, 
  Mail, Phone, Zap, Shield, Globe, Rocket, Users, TrendingUp,
  ChevronRight, ExternalLink, Play, Download
} from "lucide-react";
import { Link } from "react-router-dom";

const Help = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [activeSection, setActiveSection] = useState("overview");

  const helpSections = [
    { id: "overview", title: "Getting Started", icon: BookOpen },
    { id: "tokenomics", title: "Tokenomics", icon: Coins },
    { id: "integrations", title: "Integrations", icon: Code },
    { id: "pricing", title: "Pricing & Billing", icon: CreditCard },
    { id: "deployment", title: "Deployment", icon: Rocket },
    { id: "support", title: "Support", icon: MessageCircle }
  ];

  const tokenomicsData = {
    remixToken: {
      name: "REMIX Token",
      symbol: "REMIX",
      network: "BASE",
      totalSupply: "1,000,000,000",
      distribution: [
        { category: "Community Rewards", percentage: 40, amount: "400,000,000" },
        { category: "Development Team", percentage: 20, amount: "200,000,000" },
        { category: "Treasury", percentage: 20, amount: "200,000,000" },
        { category: "Partnerships", percentage: 15, amount: "150,000,000" },
        { category: "Initial Liquidity", percentage: 5, amount: "50,000,000" }
      ]
    },
    revenueModel: {
      title: "App Token Revenue Distribution",
      splits: [
        { recipient: "App Builder", percentage: 85, description: "Developer/Creator rewards" },
        { recipient: "Token Holders", percentage: 10, description: "Community staking rewards" },
        { recipient: "Platform", percentage: 5, description: "Platform maintenance & growth" }
      ]
    }
  };

  const faqs = [
    {
      question: "How do I create my first app?",
      answer: "Simply describe your app idea in natural language or choose from our pre-built templates. Our AI will generate a fully functional app with smart contracts and deployment ready code."
    },
    {
      question: "What makes Remixable different from other no-code platforms?",
      answer: "Remixable is specifically built for the BASE ecosystem with native Web3 integration, tokenomics, and Farcaster Mini App support. Every app comes with built-in token economics."
    },
    {
      question: "How does the 85/10/5 revenue model work?",
      answer: "When users interact with your app and generate revenue through tokens or transactions, 85% goes to you (the builder), 10% is distributed to token holders as rewards, and 5% supports platform development."
    },
    {
      question: "Can I deploy my app to custom domains?",
      answer: "Yes! Pro and Enterprise plans include custom domain deployment with SSL certificates. You can deploy to Vercel, Netlify, or any hosting provider."
    },
    {
      question: "What BASE integrations are supported?",
      answer: "Full OnchainKit integration, Smart Wallet support, Gasless transactions, BASE Names Service, and automatic Farcaster Mini App compatibility."
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                <Zap className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  Remixable
                </h1>
                <p className="text-xs text-muted-foreground">Help Center</p>
              </div>
            </Link>
            
            <div className="flex items-center gap-3">
              <Button variant="outline" size="sm" asChild>
                <Link to="/pricing">Pricing</Link>
              </Button>
              <Button size="sm" asChild>
                <Link to="/">Back to App</Link>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid lg:grid-cols-4 gap-8">
          {/* Sidebar Navigation */}
          <div className="lg:col-span-1">
            <Card className="sticky top-24">
              <CardHeader>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="Search help articles..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </CardHeader>
              <CardContent className="space-y-2">
                {helpSections.map((section) => {
                  const Icon = section.icon;
                  return (
                    <Button
                      key={section.id}
                      variant={activeSection === section.id ? "secondary" : "ghost"}
                      className="w-full justify-start"
                      onClick={() => setActiveSection(section.id)}
                    >
                      <Icon className="w-4 h-4 mr-2" />
                      {section.title}
                    </Button>
                  );
                })}
              </CardContent>
            </Card>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3 space-y-8">
            {activeSection === "overview" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Getting Started with Remixable</h1>
                  <p className="text-muted-foreground">
                    Build and deploy AI-powered apps on the BASE network with built-in tokenomics
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card className="group hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary/10 rounded-lg flex items-center justify-center">
                          <Play className="w-5 h-5 text-primary" />
                        </div>
                        <div>
                          <CardTitle>Quick Start Tutorial</CardTitle>
                          <CardDescription>Create your first app in 5 minutes</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button className="w-full group-hover:scale-105 transition-transform">
                        Watch Tutorial
                        <ExternalLink className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>

                  <Card className="group hover:shadow-lg transition-shadow">
                    <CardHeader>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                          <Download className="w-5 h-5 text-accent" />
                        </div>
                        <div>
                          <CardTitle>Sample Projects</CardTitle>
                          <CardDescription>Download example apps and templates</CardDescription>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <Button variant="outline" className="w-full group-hover:scale-105 transition-transform">
                        Browse Examples
                        <ChevronRight className="w-4 h-4 ml-2" />
                      </Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Platform Overview</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="text-center p-4 rounded-lg border border-border/50">
                        <Code className="w-8 h-8 text-primary mx-auto mb-2" />
                        <h3 className="font-semibold">AI Code Generation</h3>
                        <p className="text-sm text-muted-foreground">Natural language to full-stack apps</p>
                      </div>
                      <div className="text-center p-4 rounded-lg border border-border/50">
                        <Coins className="w-8 h-8 text-accent mx-auto mb-2" />
                        <h3 className="font-semibold">Built-in Tokenomics</h3>
                        <p className="text-sm text-muted-foreground">Every app gets its own token economy</p>
                      </div>
                      <div className="text-center p-4 rounded-lg border border-border/50">
                        <Rocket className="w-8 h-8 text-primary mx-auto mb-2" />
                        <h3 className="font-semibold">One-Click Deploy</h3>
                        <p className="text-sm text-muted-foreground">Deploy to BASE network instantly</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Frequently Asked Questions</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Accordion type="single" collapsible>
                      {faqs.map((faq, index) => (
                        <AccordionItem key={index} value={`item-${index}`}>
                          <AccordionTrigger>{faq.question}</AccordionTrigger>
                          <AccordionContent>{faq.answer}</AccordionContent>
                        </AccordionItem>
                      ))}
                    </Accordion>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "tokenomics" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Tokenomics & Economy</h1>
                  <p className="text-muted-foreground">
                    Understanding REMIX token and app-specific token economics
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Coins className="w-5 h-5 text-primary" />
                      REMIX Platform Token
                    </CardTitle>
                    <CardDescription>
                      The native governance and utility token of the Remixable platform
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="space-y-3">
                        <h3 className="font-semibold">Token Details</h3>
                        <div className="space-y-2 text-sm">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Name:</span>
                            <span>{tokenomicsData.remixToken.name}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Symbol:</span>
                            <span>{tokenomicsData.remixToken.symbol}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Network:</span>
                            <Badge variant="secondary">{tokenomicsData.remixToken.network}</Badge>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Total Supply:</span>
                            <span>{tokenomicsData.remixToken.totalSupply}</span>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-3">
                        <h3 className="font-semibold">Token Distribution</h3>
                        <div className="space-y-2">
                          {tokenomicsData.remixToken.distribution.map((item, index) => (
                            <div key={index} className="flex items-center justify-between text-sm">
                              <div className="flex items-center gap-2">
                                <div 
                                  className="w-3 h-3 rounded-full" 
                                  style={{ backgroundColor: `hsl(${263 + index * 30}, 70%, 50%)` }}
                                />
                                <span>{item.category}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-medium">{item.percentage}%</div>
                                <div className="text-xs text-muted-foreground">{item.amount}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-accent" />
                      App Token Revenue Model
                    </CardTitle>
                    <CardDescription>
                      How revenue is distributed when users create and monetize apps
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {tokenomicsData.revenueModel.splits.map((split, index) => (
                        <div key={index} className="flex items-center justify-between p-4 rounded-lg border border-border/50">
                          <div>
                            <h4 className="font-semibold">{split.recipient}</h4>
                            <p className="text-sm text-muted-foreground">{split.description}</p>
                          </div>
                          <div className="text-right">
                            <div className="text-2xl font-bold text-primary">{split.percentage}%</div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="mt-6 p-4 bg-primary/5 rounded-lg border border-primary/20">
                      <h4 className="font-semibold text-primary mb-2">How It Works</h4>
                      <ul className="text-sm space-y-1 text-muted-foreground">
                        <li>• Users interact with apps and generate transaction fees</li>
                        <li>• 85% of revenue goes directly to the app creator</li>
                        <li>• 10% is distributed to app token holders as staking rewards</li>
                        <li>• 5% supports platform development and maintenance</li>
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "integrations" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Integrations & APIs</h1>
                  <p className="text-muted-foreground">
                    Connect your apps with external services and blockchain networks
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>BASE Ecosystem Integration</CardTitle>
                    <CardDescription>Native blockchain features and services</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="p-4 rounded-lg border border-border/50">
                        <h4 className="font-semibold mb-2">OnchainKit Integration</h4>
                        <p className="text-sm text-muted-foreground mb-3">Complete Web3 UI components and wallet integration</p>
                        <Badge variant="secondary">Auto-configured</Badge>
                      </div>
                      <div className="p-4 rounded-lg border border-border/50">
                        <h4 className="font-semibold mb-2">Smart Wallet Support</h4>
                        <p className="text-sm text-muted-foreground mb-3">Account abstraction with social login</p>
                        <Badge variant="secondary">Built-in</Badge>
                      </div>
                      <div className="p-4 rounded-lg border border-border/50">
                        <h4 className="font-semibold mb-2">Gasless Transactions</h4>
                        <p className="text-sm text-muted-foreground mb-3">Sponsored transactions for better UX</p>
                        <Badge variant="secondary">Available</Badge>
                      </div>
                      <div className="p-4 rounded-lg border border-border/50">
                        <h4 className="font-semibold mb-2">BASE Names Service</h4>
                        <p className="text-sm text-muted-foreground mb-3">Human-readable addresses</p>
                        <Badge variant="secondary">Integrated</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>External API Integrations</CardTitle>
                    <CardDescription>Connect with popular services and APIs</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <Tabs defaultValue="ai" className="w-full">
                      <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="ai">AI APIs</TabsTrigger>
                        <TabsTrigger value="social">Social</TabsTrigger>
                        <TabsTrigger value="payment">Payment</TabsTrigger>
                        <TabsTrigger value="data">Data</TabsTrigger>
                      </TabsList>
                      <TabsContent value="ai" className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg border border-border/50">
                            <h4 className="font-semibold">OpenAI GPT</h4>
                            <p className="text-sm text-muted-foreground">Advanced language models for content generation</p>
                          </div>
                          <div className="p-4 rounded-lg border border-border/50">
                            <h4 className="font-semibold">Anthropic Claude</h4>
                            <p className="text-sm text-muted-foreground">Constitutional AI for safe, helpful responses</p>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="social" className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg border border-border/50">
                            <h4 className="font-semibold">Farcaster Protocol</h4>
                            <p className="text-sm text-muted-foreground">Decentralized social network integration</p>
                          </div>
                          <div className="p-4 rounded-lg border border-border/50">
                            <h4 className="font-semibold">Lens Protocol</h4>
                            <p className="text-sm text-muted-foreground">Web3 social graph and profiles</p>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="payment" className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg border border-border/50">
                            <h4 className="font-semibold">Stripe</h4>
                            <p className="text-sm text-muted-foreground">Traditional payment processing</p>
                          </div>
                          <div className="p-4 rounded-lg border border-border/50">
                            <h4 className="font-semibold">USDC Payments</h4>
                            <p className="text-sm text-muted-foreground">Native crypto payments on BASE</p>
                          </div>
                        </div>
                      </TabsContent>
                      <TabsContent value="data" className="space-y-4">
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="p-4 rounded-lg border border-border/50">
                            <h4 className="font-semibold">Supabase</h4>
                            <p className="text-sm text-muted-foreground">PostgreSQL database and real-time subscriptions</p>
                          </div>
                          <div className="p-4 rounded-lg border border-border/50">
                            <h4 className="font-semibold">The Graph</h4>
                            <p className="text-sm text-muted-foreground">Blockchain data indexing and querying</p>
                          </div>
                        </div>
                      </TabsContent>
                    </Tabs>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "pricing" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Pricing & Billing</h1>
                  <p className="text-muted-foreground">
                    Flexible plans for creators, developers, and enterprises
                  </p>
                </div>

                <div className="grid md:grid-cols-3 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Starter</CardTitle>
                      <CardDescription>Perfect for trying out the platform</CardDescription>
                      <div className="text-3xl font-bold">Free</div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          3 app generations per month
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          Basic templates
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          Community support
                        </li>
                      </ul>
                      <Button variant="outline" className="w-full">Current Plan</Button>
                    </CardContent>
                  </Card>

                  <Card className="border-primary">
                    <CardHeader>
                      <CardTitle>Pro</CardTitle>
                      <CardDescription>For serious builders and creators</CardDescription>
                      <div className="text-3xl font-bold">$29<span className="text-sm font-normal">/month</span></div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          Unlimited app generations
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          Advanced AI models
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          Custom domains
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          Priority support
                        </li>
                      </ul>
                      <Button className="w-full">Upgrade to Pro</Button>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Enterprise</CardTitle>
                      <CardDescription>For teams and organizations</CardDescription>
                      <div className="text-3xl font-bold">Custom</div>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <ul className="space-y-2 text-sm">
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          White-label solutions
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          Team collaboration
                        </li>
                        <li className="flex items-center gap-2">
                          <div className="w-1.5 h-1.5 bg-primary rounded-full" />
                          Dedicated support
                        </li>
                      </ul>
                      <Button variant="outline" className="w-full">Contact Sales</Button>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>We support both traditional and crypto payments</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="font-semibold mb-3">Traditional Payment</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <CreditCard className="w-4 h-4" />
                            Credit/Debit Cards
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Globe className="w-4 h-4" />
                            Bank Transfers
                          </div>
                        </div>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-3">Crypto Payment</h4>
                        <div className="space-y-2">
                          <div className="flex items-center gap-2 text-sm">
                            <Coins className="w-4 h-4" />
                            USDC on BASE
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Shield className="w-4 h-4" />
                            ETH on BASE
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "deployment" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Deployment Guide</h1>
                  <p className="text-muted-foreground">
                    Deploy your apps to production with custom domains and SSL
                  </p>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>One-Click Deployment</CardTitle>
                    <CardDescription>Deploy to multiple platforms instantly</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid md:grid-cols-3 gap-4">
                      <div className="p-4 rounded-lg border border-border/50 text-center">
                        <Rocket className="w-8 h-8 text-primary mx-auto mb-2" />
                        <h4 className="font-semibold">Vercel</h4>
                        <p className="text-sm text-muted-foreground">Global edge network</p>
                      </div>
                      <div className="p-4 rounded-lg border border-border/50 text-center">
                        <Globe className="w-8 h-8 text-accent mx-auto mb-2" />
                        <h4 className="font-semibold">Netlify</h4>
                        <p className="text-sm text-muted-foreground">JAMstack deployment</p>
                      </div>
                      <div className="p-4 rounded-lg border border-border/50 text-center">
                        <Settings className="w-8 h-8 text-primary mx-auto mb-2" />
                        <h4 className="font-semibold">Railway</h4>
                        <p className="text-sm text-muted-foreground">Full-stack hosting</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Custom Domain Setup</CardTitle>
                    <CardDescription>Connect your own domain with automatic SSL</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">1</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">Purchase Domain</h4>
                          <p className="text-sm text-muted-foreground">Get a domain from any registrar (Namecheap, GoDaddy, etc.)</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">2</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">Configure DNS</h4>
                          <p className="text-sm text-muted-foreground">Point your domain to remixable.app using A records</p>
                        </div>
                      </div>
                      <div className="flex items-start gap-3">
                        <div className="w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                          <span className="text-xs font-bold text-primary">3</span>
                        </div>
                        <div>
                          <h4 className="font-semibold">Verify & Deploy</h4>
                          <p className="text-sm text-muted-foreground">We'll automatically provision SSL and deploy your app</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            {activeSection === "support" && (
              <div className="space-y-6">
                <div>
                  <h1 className="text-3xl font-bold mb-2">Support & Contact</h1>
                  <p className="text-muted-foreground">
                    Get help from our team and community
                  </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Mail className="w-5 h-5" />
                        Email Support
                      </CardTitle>
                      <CardDescription>Direct support from our team</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">General Support:</span>
                          <a href="mailto:support@remixable.app" className="text-primary hover:underline">
                            support@remixable.app
                          </a>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-muted-foreground">Development:</span>
                          <a href="mailto:dev@remixable.app" className="text-primary hover:underline">
                            dev@remixable.app
                          </a>
                        </div>
                      </div>
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <p className="text-sm text-muted-foreground">
                          Response time: 24-48 hours for general inquiries, 2-4 hours for Pro/Enterprise
                        </p>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <MessageCircle className="w-5 h-5" />
                        Live Chat Support
                      </CardTitle>
                      <CardDescription>Instant help when you need it</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Availability:</span>
                            <span>Mon-Fri, 9AM-6PM PST</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Response:</span>
                            <span>Usually within 5 minutes</span>
                          </div>
                        </div>
                        <Button className="w-full">
                          Start Live Chat
                          <MessageCircle className="w-4 h-4 ml-2" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <Card>
                  <CardHeader>
                    <CardTitle>Submit a Support Ticket</CardTitle>
                    <CardDescription>For complex issues or feature requests</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form className="space-y-4">
                      <div className="grid md:grid-cols-2 gap-4">
                        <div>
                          <label className="text-sm font-medium">Name</label>
                          <Input placeholder="Your name" />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Email</label>
                          <Input type="email" placeholder="your@email.com" />
                        </div>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Subject</label>
                        <Input placeholder="Brief description of your issue" />
                      </div>
                      <div>
                        <label className="text-sm font-medium">Priority</label>
                        <select className="w-full p-2 rounded-md border border-border bg-background">
                          <option>Low - General question</option>
                          <option>Medium - Feature request</option>
                          <option>High - Bug report</option>
                          <option>Critical - Service outage</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-sm font-medium">Description</label>
                        <Textarea 
                          placeholder="Please provide detailed information about your issue..."
                          rows={6}
                        />
                      </div>
                      <Button className="w-full">
                        Submit Ticket
                        <Mail className="w-4 h-4 ml-2" />
                      </Button>
                    </form>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Community Resources</CardTitle>
                    <CardDescription>Connect with other builders and developers</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid md:grid-cols-2 gap-4">
                      <Button variant="outline" className="h-auto p-4 flex-col items-start">
                        <div className="flex items-center gap-2 mb-2">
                          <Users className="w-5 h-5" />
                          <span className="font-semibold">Discord Community</span>
                        </div>
                        <p className="text-sm text-muted-foreground text-left">
                          Join our active community for real-time help and discussions
                        </p>
                      </Button>
                      <Button variant="outline" className="h-auto p-4 flex-col items-start">
                        <div className="flex items-center gap-2 mb-2">
                          <BookOpen className="w-5 h-5" />
                          <span className="font-semibold">GitHub Discussions</span>
                        </div>
                        <p className="text-sm text-muted-foreground text-left">
                          Browse technical discussions and contribute to the platform
                        </p>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-border/50 bg-muted/20 py-8 mt-16">
        <div className="container mx-auto px-4 text-center space-y-4">
          <div className="flex items-center justify-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">Remixable</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Developed and Built with Love by Raditomy
          </p>
          <div className="flex justify-center gap-6 text-sm text-muted-foreground">
            <a href="mailto:support@remixable.app" className="hover:text-primary transition-colors">
              Support
            </a>
            <Link to="/privacy" className="hover:text-primary transition-colors">
              Privacy
            </Link>
            <Link to="/terms" className="hover:text-primary transition-colors">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Help;