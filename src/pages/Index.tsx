import { useState, useEffect } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Sparkles, Zap, Github, Twitter, LogIn, LogOut, User, Code2, Rocket, Layers } from "lucide-react";
import { Link } from "react-router-dom";
import { LiveChatWidget } from "@/components/LiveChatWidget";
import heroBackground from "@/assets/hero-background.jpg";
// Using new branded assets with cache busting
const appIcon = `/icons/app-icon.png?v=${Date.now()}`;
const wordmark = `/icons/wordmark.png?v=${Date.now()}`;

const Index = () => {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
    }
  };


  return (
    <div className="min-h-screen bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 animated-gradient opacity-10" />
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-primary/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '3s' }} />
      
      <div className="relative z-10">
        {/* Header */}
        <header className="border-b border-border/50 bg-background/80 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img src={appIcon} alt="Remixable" className="w-10 h-10 rounded-xl" />
                <div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Remixable
                  </h1>
                  <p className="text-xs text-muted-foreground">AI-Powered No-Code Builder</p>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Github className="w-4 h-4 mr-2" />
                  GitHub
                </Button>
                <Button variant="outline" size="sm" className="hidden sm:flex">
                  <Twitter className="w-4 h-4 mr-2" />
                  Twitter
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/integrations">
                    Integrations
                  </Link>
                </Button>
                <Button variant="outline" size="sm" asChild>
                  <Link to="/help">
                    Help
                  </Link>
                </Button>
                {user ? (
                  <div className="flex items-center gap-2">
                    <Button variant="default" size="sm" asChild>
                      <Link to="/workspace" className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        My Projects
                      </Link>
                    </Button>
                    <Button variant="ghost" size="sm" className="flex items-center gap-2">
                      <User className="w-4 h-4" />
                      {user.email}
                    </Button>
                    <Button variant="outline" size="sm" onClick={handleSignOut}>
                      <LogOut className="w-4 h-4 mr-2" />
                      Sign Out
                    </Button>
                  </div>                
                ) : (
                  <Button variant="outline" size="sm" asChild>
                    <Link to="/auth" className="flex items-center gap-2">
                      <LogIn className="w-4 h-4" />
                      Sign In
                    </Link>
                  </Button>
                )}
                <Button className="bg-primary hover:bg-primary/90" asChild>
                  <Link to="/pricing">
                    <Zap className="w-4 h-4 mr-2" />
                    Get Started
                  </Link>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section 
          className="py-32 px-4 relative"
          style={{
            backgroundImage: `linear-gradient(rgba(36, 36, 49, 0.9), rgba(36, 36, 49, 0.95)), url(${heroBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="container mx-auto text-center space-y-12 relative z-10">
            <div className="space-y-6">
              <h1 className="text-5xl md:text-7xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Build Any App with AI
              </h1>
              <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
                Generate fully functional apps instantly using natural language. 
                No coding required. Integrated with Farcaster Mini Apps and Base App ecosystem.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {user ? (
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link to="/workspace">
                    <Rocket className="w-5 h-5 mr-2" />
                    Go to Workspace
                  </Link>
                </Button>
              ) : (
                <>
                  <Button size="lg" className="text-lg px-8 py-6" asChild>
                    <Link to="/auth">
                      <Sparkles className="w-5 h-5 mr-2" />
                      Start Building for Free
                    </Link>
                  </Button>
                  <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                    <Link to="/pricing">
                      View Pricing
                    </Link>
                  </Button>
                </>
              )}
            </div>
            
            <div className="flex flex-wrap justify-center gap-4 mt-8">
              {["Media", "Sports", "Social", "Crypto", "Finance", "Utility"].map((category) => (
                <div key={category} className="px-4 py-2 glass rounded-full text-sm font-medium backdrop-blur-md">
                  {category} Apps
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-20 px-4">
          <div className="container mx-auto">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold mb-4">
                Everything You Need to Build
              </h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Powerful AI-driven development platform with all the tools you need
              </p>
            </div>
            
            <div className="grid md:grid-cols-3 gap-8">
              <Card className="p-8 space-y-4 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Code2 className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">AI-Powered Generation</h3>
                <p className="text-muted-foreground">
                  Describe your app in natural language and watch AI generate production-ready code instantly.
                </p>
              </Card>
              
              <Card className="p-8 space-y-4 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-accent/10 flex items-center justify-center">
                  <Layers className="w-6 h-6 text-accent" />
                </div>
                <h3 className="text-xl font-bold">Full-Stack Templates</h3>
                <p className="text-muted-foreground">
                  Start with pre-built templates for any category - from social apps to crypto tools.
                </p>
              </Card>
              
              <Card className="p-8 space-y-4 hover:shadow-lg transition-shadow">
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Rocket className="w-6 h-6 text-primary" />
                </div>
                <h3 className="text-xl font-bold">One-Click Deploy</h3>
                <p className="text-muted-foreground">
                  Deploy your apps to production with integrated Farcaster and Base ecosystem support.
                </p>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-20 px-4 bg-muted/20">
          <div className="container mx-auto text-center space-y-8">
            <h2 className="text-3xl md:text-5xl font-bold">
              Ready to Build Your Next App?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Join thousands of builders creating amazing applications with AI
            </p>
            {user ? (
              <Button size="lg" className="text-lg px-8 py-6" asChild>
                <Link to="/workspace">
                  <Rocket className="w-5 h-5 mr-2" />
                  Go to Workspace
                </Link>
              </Button>
            ) : (
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Button size="lg" className="text-lg px-8 py-6" asChild>
                  <Link to="/auth">
                    <Sparkles className="w-5 h-5 mr-2" />
                    Get Started Free
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-lg px-8 py-6" asChild>
                  <Link to="/pricing">
                    View Plans
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </section>

        {/* Footer */}
        <footer className="border-t border-border/50 bg-muted/20 py-12">
          <div className="container mx-auto px-4">
            <div className="grid md:grid-cols-4 gap-8">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <img src={appIcon} alt="Remixable" className="w-8 h-8 rounded-lg" />
                  <span className="font-bold text-lg">Remixable</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  AI-powered no-code builder for the next generation of web applications.
                </p>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Platform</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>Templates</div>
                  <div>AI Builder</div>
                  <div>Farcaster Integration</div>
                  <div>Base App Support</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Categories</h4>
                <div className="space-y-2 text-sm text-muted-foreground">
                  <div>Media Apps</div>
                  <div>Social Apps</div>
                  <div>Crypto Apps</div>
                  <div>Finance Apps</div>
                </div>
              </div>
              
              <div className="space-y-3">
                <h4 className="font-semibold">Connect</h4>
                <div className="flex gap-3">
                  <Button size="sm" variant="outline">
                    <Github className="w-4 h-4" />
                  </Button>
                  <Button size="sm" variant="outline">
                    <Twitter className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-8 border-t border-border/50 text-center space-y-2">
              <p className="text-sm text-muted-foreground">
                Developed and Built with Love by Raditomy
              </p>
              <div className="flex justify-center gap-6 text-xs text-muted-foreground">
                <a href="mailto:support@remixable.app" className="hover:text-primary transition-colors">
                  support@remixable.app
                </a>
                <a href="mailto:dev@remixable.app" className="hover:text-primary transition-colors">
                  dev@remixable.app
                </a>
                <Link to="/help" className="hover:text-primary transition-colors">
                  Help Center
                </Link>
              </div>
              <p className="text-xs text-muted-foreground">
                © 2024 Remixable. All rights reserved.
              </p>
            </div>
          </div>
        </footer>
      </div>
      
      {/* Live Chat Widget */}
      <LiveChatWidget />
    </div>
  );
};

export default Index;