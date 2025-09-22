import { useState } from "react";
import { Button } from "@/components/ui/button";
import { CategoryTabs } from "@/components/CategoryTabs";
import { TemplateCard } from "@/components/TemplateCard";
import { ChatInterface } from "@/components/ChatInterface";
import { AppPreview } from "@/components/AppPreview";
import { ModelSelector, ModelConfig, ModelParameters } from "@/components/ModelSelector";
import { templates, Template } from "@/data/templates";
import { supabase } from "@/integrations/supabase/client";
import { cn } from "@/lib/utils";
import { Sparkles, Zap, Github, Twitter } from "lucide-react";
import heroBackground from "@/assets/hero-background.jpg";
import appIcon from "@/assets/app-icon.png";

const Index = () => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedApp, setGeneratedApp] = useState<any>(null);
  const [selectedModels, setSelectedModels] = useState<{
    code?: ModelConfig;
    text?: ModelConfig;
    image?: ModelConfig;
  }>({});
  const [showModelSelector, setShowModelSelector] = useState(false);

  const filteredTemplates = activeCategory === "all" 
    ? templates 
    : templates.filter(template => template.category === activeCategory);

  const handleModelSelect = (category: string, model: ModelConfig, parameters: ModelParameters) => {
    setSelectedModels(prev => ({
      ...prev,
      [category]: model
    }));
    console.log(`Selected ${category} model:`, model.name, 'with parameters:', parameters);
  };

  const handleTemplateSelect = async (template: Template) => {
    if (!selectedModels.code) {
      setShowModelSelector(true);
      return;
    }

    setIsGenerating(true);
    setGeneratedApp(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('openrouter-generate', {
        body: {
          prompt: `Generate a React component for a ${template.title} app. ${template.description}. Use TypeScript, Tailwind CSS, and modern React patterns. Make it functional and well-structured.`,
          model: selectedModels.code.id,
          category: 'code',
          parameters: {
            temperature: 0.7,
            max_tokens: 2000
          }
        }
      });

      if (error) throw error;
      
      if (data.success) {
        setGeneratedApp({
          title: template.title,
          description: template.description,
          features: template.features,
          previewUrl: "#",
          code: data.data.content
        });
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Error generating app:', error);
      // Fallback to mock generation
      setGeneratedApp({
        title: template.title,
        description: template.description,
        features: template.features,
        previewUrl: "#"
      });
    }
    setIsGenerating(false);
  };

  const handleChatGenerate = async (prompt: string) => {
    if (!selectedModels.code) {
      setShowModelSelector(true);
      return;
    }

    setIsGenerating(true);
    setGeneratedApp(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('openrouter-generate', {
        body: {
          prompt: `Generate a complete React application based on this description: "${prompt}". Use TypeScript, Tailwind CSS, and modern React patterns. Create functional components with proper state management.`,
          model: selectedModels.code.id,
          category: 'code',
          parameters: {
            temperature: 0.8,
            max_tokens: 3000
          }
        }
      });

      if (error) throw error;
      
      if (data.success) {
        setGeneratedApp({
          title: "Custom AI App",
          description: `Generated app based on: "${prompt}"`,
          features: ["AI-Powered", "Custom Logic", "Modern UI", "Responsive Design", "Real-time Updates"],
          previewUrl: "#",
          code: data.data.content
        });
      } else {
        throw new Error(data.error || 'Generation failed');
      }
    } catch (error) {
      console.error('Error generating app:', error);
      // Fallback to mock generation
      setGeneratedApp({
        title: "Custom AI App",
        description: `Generated app based on: "${prompt}"`,
        features: ["AI-Powered", "Custom Logic", "Modern UI", "Responsive Design", "Real-time Updates"],
        previewUrl: "#"
      });
    }
    setIsGenerating(false);
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
                <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
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
                  <a href="/auth">
                    Sign In
                  </a>
                </Button>
                <Button className="bg-primary hover:bg-primary/90" asChild>
                  <a href="/pricing">
                    <Zap className="w-4 h-4 mr-2" />
                    Get Started
                  </a>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section */}
        <section 
          className="py-20 px-4 relative"
          style={{
            backgroundImage: `linear-gradient(rgba(36, 36, 49, 0.8), rgba(36, 36, 49, 0.9)), url(${heroBackground})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundAttachment: 'fixed'
          }}
        >
          <div className="container mx-auto text-center space-y-8 relative z-10">
            <div className="space-y-4">
              <h1 className="text-4xl md:text-6xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent">
                Build Any App with AI
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                Generate fully functional apps instantly using natural language. 
                Integrated with Farcaster Mini Apps and Base App ecosystem.
              </p>
            </div>
            
            <div className="flex flex-wrap justify-center gap-4">
              {["Media", "Sports", "Social", "Crypto", "Finance", "Utility"].map((category) => (
                <div key={category} className="px-4 py-2 glass rounded-full text-sm font-medium backdrop-blur-md">
                  {category} Apps
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Main Content */}
        <main className="container mx-auto px-4 pb-20">
          <div className="space-y-8">
            {/* Category Navigation */}
            <div className="flex justify-center">
              <CategoryTabs 
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>

            {/* Model Selector */}
            {showModelSelector && (
              <div className="mb-8">
                <ModelSelector
                  onModelSelect={handleModelSelect}
                  selectedModels={selectedModels}
                />
                <div className="mt-4 text-center">
                  <Button
                    variant="outline"
                    onClick={() => setShowModelSelector(false)}
                  >
                    Hide Model Selection
                  </Button>
                </div>
              </div>
            )}

            {!showModelSelector && (
              <div className="mb-6 text-center">
                <Button
                  variant="outline"
                  onClick={() => setShowModelSelector(true)}
                >
                  Configure AI Models ({Object.keys(selectedModels).length} selected)
                </Button>
              </div>
            )}

            {/* Templates Grid & Chat Interface */}
            <div className="grid lg:grid-cols-2 gap-8">
              {/* Templates */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">Choose a Template</h2>
                  <div className="h-px bg-gradient-to-r from-border to-transparent flex-1" />
                </div>
                
                <div className="grid gap-4 max-h-[600px] overflow-y-auto pr-2">
                  {filteredTemplates.map((template) => (
                    <TemplateCard
                      key={template.id}
                      template={template}
                      onSelect={handleTemplateSelect}
                    />
                  ))}
                </div>
              </div>

              {/* Chat Interface */}
              <div className="space-y-6">
                <div className="flex items-center gap-3">
                  <h2 className="text-2xl font-bold">Or Describe Your App</h2>
                  <div className="h-px bg-gradient-to-r from-border to-transparent flex-1" />
                </div>
                
                <ChatInterface 
                  onGenerate={handleChatGenerate}
                  isGenerating={isGenerating}
                />
              </div>
            </div>

            {/* App Preview */}
            <div className="space-y-6">
              <div className="flex items-center gap-3">
                <h2 className="text-2xl font-bold">Live Preview</h2>
                <div className="h-px bg-gradient-to-r from-border to-transparent flex-1" />
              </div>
              
              <AppPreview 
                isGenerating={isGenerating}
                generatedApp={generatedApp}
              />
            </div>
          </div>
        </main>

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
            
            <div className="mt-8 pt-8 border-t border-border/50 text-center text-sm text-muted-foreground">
              © 2024 Remixable. Built with AI, designed for developers.
            </div>
          </div>
        </footer>
      </div>
    </div>
  );
};

export default Index;