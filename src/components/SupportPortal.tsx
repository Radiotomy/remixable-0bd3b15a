import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageCircle, Mail, Clock, CheckCircle, AlertCircle, User, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SupportTicket {
  id: string;
  subject: string;
  priority: "low" | "medium" | "high" | "critical";
  status: "open" | "in-progress" | "resolved" | "closed";
  created: string;
  lastUpdate: string;
  description: string;
  responses: Array<{
    id: string;
    author: string;
    message: string;
    timestamp: string;
    isStaff: boolean;
  }>;
}

export const SupportPortal = () => {
  const { toast } = useToast();
  const [tickets, setTickets] = useState<SupportTicket[]>([
    {
      id: "TICK-001",
      subject: "Token deployment issue on BASE",
      priority: "high",
      status: "in-progress",
      created: "2024-01-15T10:30:00Z",
      lastUpdate: "2024-01-15T14:20:00Z",
      description: "Having trouble deploying my app token to BASE network...",
      responses: [
        {
          id: "1",
          author: "Support Team",
          message: "We're looking into this issue. Can you provide the transaction hash?",
          timestamp: "2024-01-15T14:20:00Z",
          isStaff: true
        }
      ]
    }
  ]);
  
  const [newTicket, setNewTicket] = useState({
    subject: "",
    priority: "medium" as const,
    description: ""
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const priorityColors = {
    low: "bg-green-500/10 text-green-500 border-green-500/20",
    medium: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    high: "bg-orange-500/10 text-orange-500 border-orange-500/20",
    critical: "bg-red-500/10 text-red-500 border-red-500/20"
  };

  const statusColors = {
    open: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    "in-progress": "bg-purple-500/10 text-purple-500 border-purple-500/20",
    resolved: "bg-green-500/10 text-green-500 border-green-500/20",
    closed: "bg-gray-500/10 text-gray-500 border-gray-500/20"
  };

  const handleSubmitTicket = async () => {
    if (!newTicket.subject || !newTicket.description) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const ticket: SupportTicket = {
      id: `TICK-${String(tickets.length + 1).padStart(3, '0')}`,
      subject: newTicket.subject,
      priority: newTicket.priority,
      status: "open",
      created: new Date().toISOString(),
      lastUpdate: new Date().toISOString(),
      description: newTicket.description,
      responses: []
    };

    setTickets(prev => [ticket, ...prev]);
    setNewTicket({ subject: "", priority: "medium", description: "" });
    setIsSubmitting(false);
    
    toast({
      title: "Ticket Created",
      description: `Your support ticket ${ticket.id} has been created successfully.`
    });
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Support Portal</h1>
          <p className="text-muted-foreground">Manage your support tickets and get help</p>
        </div>
        
        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <MessageCircle className="w-4 h-4 mr-2" />
              New Ticket
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[525px]">
            <DialogHeader>
              <DialogTitle>Create Support Ticket</DialogTitle>
              <DialogDescription>
                Describe your issue and we'll get back to you as soon as possible.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Subject</label>
                <Input
                  placeholder="Brief description of your issue"
                  value={newTicket.subject}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, subject: e.target.value }))}
                />
              </div>
              
              <div>
                <label className="text-sm font-medium">Priority</label>
                <select 
                  className="w-full p-2 rounded-md border border-border bg-background mt-1"
                  value={newTicket.priority}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, priority: e.target.value as any }))}
                >
                  <option value="low">Low - General question</option>
                  <option value="medium">Medium - Feature request</option>
                  <option value="high">High - Bug report</option>
                  <option value="critical">Critical - Service outage</option>
                </select>
              </div>
              
              <div>
                <label className="text-sm font-medium">Description</label>
                <Textarea
                  placeholder="Please provide detailed information about your issue..."
                  rows={6}
                  value={newTicket.description}
                  onChange={(e) => setNewTicket(prev => ({ ...prev, description: e.target.value }))}
                />
              </div>
              
              <Button 
                onClick={handleSubmitTicket}
                disabled={isSubmitting}
                className="w-full"
              >
                {isSubmitting ? "Creating..." : "Create Ticket"}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="tickets" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="tickets">My Tickets</TabsTrigger>
          <TabsTrigger value="knowledge">Knowledge Base</TabsTrigger>
          <TabsTrigger value="contact">Contact Info</TabsTrigger>
        </TabsList>
        
        <TabsContent value="tickets" className="space-y-4">
          {tickets.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <MessageCircle className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold mb-2">No Support Tickets</h3>
                <p className="text-muted-foreground mb-4">
                  You haven't created any support tickets yet. Click "New Ticket" to get started.
                </p>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>Create Your First Ticket</Button>
                  </DialogTrigger>
                </Dialog>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {tickets.map((ticket) => (
                <Card key={ticket.id} className="hover:shadow-md transition-shadow">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <CardTitle className="text-lg">{ticket.subject}</CardTitle>
                          <Badge variant="outline" className={priorityColors[ticket.priority]}>
                            {ticket.priority}
                          </Badge>
                          <Badge variant="outline" className={statusColors[ticket.status]}>
                            {ticket.status}
                          </Badge>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <div className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {ticket.id}
                          </div>
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            Created {formatDate(ticket.created)}
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Updated {formatDate(ticket.lastUpdate)}
                          </div>
                        </div>
                      </div>
                      
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-sm mb-4">
                      {ticket.description.length > 100 
                        ? `${ticket.description.substring(0, 100)}...` 
                        : ticket.description
                      }
                    </p>
                    
                    {ticket.responses.length > 0 && (
                      <div className="p-3 bg-muted/50 rounded-lg">
                        <div className="flex items-center gap-2 mb-2">
                          <Mail className="w-4 h-4 text-primary" />
                          <span className="text-sm font-medium">Latest Response</span>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {ticket.responses[ticket.responses.length - 1].message}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          by {ticket.responses[ticket.responses.length - 1].author} • {formatDate(ticket.responses[ticket.responses.length - 1].timestamp)}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
        
        <TabsContent value="knowledge" className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Getting Started</CardTitle>
                <CardDescription>Learn the basics of building with Remixable</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Creating your first app from templates</li>
                  <li>• Using the AI chat interface</li>
                  <li>• Infrastructure wizard setup</li>
                  <li>• BASE blockchain integration</li>
                  <li>• Farcaster Mini App deployment</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Advanced Features</CardTitle>
                <CardDescription>Explore advanced platform capabilities</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Integration marketplace usage</li>
                  <li>• Advanced AI model selection</li>
                  <li>• Database and storage options</li>
                  <li>• Smart contract deployment</li>
                  <li>• Custom domain configuration</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">Troubleshooting</CardTitle>
                <CardDescription>Common issues and solutions</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Template generation failures</li>
                  <li>• AI model connection issues</li>
                  <li>• Infrastructure setup problems</li>
                  <li>• BASE network connectivity</li>
                  <li>• Deployment and hosting issues</li>
                </ul>
              </CardContent>
            </Card>
            
            <Card className="hover:shadow-md transition-shadow cursor-pointer">
              <CardHeader>
                <CardTitle className="text-lg">API Documentation</CardTitle>
                <CardDescription>Technical reference and examples</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm">
                  <li>• Supabase edge functions</li>
                  <li>• OpenRouter AI integration</li>
                  <li>• Stripe payment webhooks</li>
                  <li>• BASE chain interactions</li>
                  <li>• Template generation APIs</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="contact" className="space-y-4">
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
                <div className="space-y-3">
                  <div>
                    <div className="font-medium">General Support</div>
                    <div className="text-sm text-muted-foreground">For account, billing, and general questions</div>
                    <a href="mailto:support@remixable.app" className="text-primary hover:underline text-sm">
                      support@remixable.app
                    </a>
                  </div>
                  <div>
                    <div className="font-medium">Development Support</div>
                    <div className="text-sm text-muted-foreground">For technical issues and API questions</div>
                    <a href="mailto:dev@remixable.app" className="text-primary hover:underline text-sm">
                      dev@remixable.app
                    </a>
                  </div>
                </div>
                
                <div className="p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4" />
                    <span className="font-medium text-sm">Response Times</span>
                  </div>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <div>Free: 48-72 hours</div>
                    <div>Pro: 12-24 hours</div>
                    <div>Enterprise: 2-4 hours</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" />
                  Live Chat
                </CardTitle>
                <CardDescription>Instant help when you need it</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Availability:</span>
                    <span>Mon-Fri, 9AM-6PM PST</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Average Response:</span>
                    <span>Under 5 minutes</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Languages:</span>
                    <span>English</span>
                  </div>
                </div>
                
                <Button className="w-full">
                  Start Live Chat
                  <MessageCircle className="w-4 h-4 ml-2" />
                </Button>
                
                <div className="p-3 bg-primary/5 rounded-lg border border-primary/20">
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle className="w-4 h-4 text-primary" />
                    <span className="font-medium text-sm text-primary">Live Chat Available</span>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Our support team is currently online and ready to help
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};