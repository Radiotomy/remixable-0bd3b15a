import { useState } from "react";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useProjectManager } from "@/hooks/useProjectManager";
import { Button } from "@/components/ui/button";
import { CategoryTabs } from "@/components/CategoryTabs";
import { TemplateCard } from "@/components/TemplateCard";
import { ChatInterface } from "@/components/ChatInterface";
import { GeneratedAppPreview } from "@/components/GeneratedAppPreview";
import { ModelSelector, ModelConfig, ModelParameters } from "@/components/ModelSelector";
import { InfrastructureWizard } from "@/components/InfrastructureWizard";
import { templates, Template } from "@/data/templates";

interface WorkspaceBuilderProps {
  user: SupabaseUser | null;
}

export const WorkspaceBuilder = ({ user }: WorkspaceBuilderProps) => {
  const [activeCategory, setActiveCategory] = useState("all");
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();
  const { saveProject } = useProjectManager();
  const [generatedApp, setGeneratedApp] = useState<{
    title: string;
    description: string;
    features: string[];
    code?: {
      components: Record<string, string>;
      hooks: Record<string, string>;
      utils: Record<string, string>;
      types: string;
      config: string;
    };
    backend?: {
      schema: string;
      edgeFunctions: Record<string, string>;
      rls: string[];
    };
    deployment?: {
      envVars: Record<string, string>;
      buildCommands: string[];
    };
    previewUrl?: string;
  } | null>(null);
  const [selectedModels, setSelectedModels] = useState<{
    code?: ModelConfig;
    text?: ModelConfig;
    image?: ModelConfig;
  }>({});
  const [showModelSelector, setShowModelSelector] = useState(false);
  const [showInfrastructureWizard, setShowInfrastructureWizard] = useState(false);
  const [infrastructureConfig, setInfrastructureConfig] = useState<any>(null);

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
      toast({
        title: "Model selection required",
        description: "Please select an AI model before generating",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedApp(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-app', {
        body: {
          prompt: `Create a ${template.title} app: ${template.description}. Include these features: ${template.features.join(', ')}`,
          template: template.id,
          category: template.category,
          infrastructure: infrastructureConfig
        }
      });

      if (error) throw error;

      console.log('Generation result:', data);
      
      if (data.success && data.data) {
        setGeneratedApp({
          title: data.data.title,
          description: data.data.description,
          features: data.data.features,
          code: data.data.code,
          backend: data.data.backend,
          deployment: data.data.deployment
        });
      } else {
        console.error('Generation failed:', data.error);
        // Fallback to basic generation
        setGeneratedApp({
          title: template.title,
          description: template.description,
          features: template.features,
          previewUrl: "#"
        });
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
      toast({
        title: "Model selection required",
        description: "Please select an AI model before generating",
      });
      return;
    }

    setIsGenerating(true);
    setGeneratedApp(null);
    
    try {
      const { data, error } = await supabase.functions.invoke('generate-app', {
        body: {
          prompt: `Create a web application: ${prompt}`,
          category: 'custom',
          infrastructure: infrastructureConfig
        }
      });

      if (error) throw error;

      console.log('Generation result:', data);
      
      if (data.success && data.data) {
        setGeneratedApp({
          title: data.data.title,
          description: data.data.description,
          features: data.data.features,
          code: data.data.code,
          backend: data.data.backend,
          deployment: data.data.deployment
        });
      } else {
        console.error('Generation failed:', data.error);
        // Fallback to basic generation
        setGeneratedApp({
          title: "Custom AI App",
          description: `Generated app based on: "${prompt}"`,
          features: ["AI-Powered", "Custom Logic", "Modern UI", "Responsive Design", "Real-time Updates"],
          previewUrl: "#"
        });
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

  const handleSaveProject = async () => {
    if (!generatedApp || !user) {
      toast({
        title: "Please sign in",
        description: "You need to be signed in to save projects",
        variant: "destructive",
      });
      return;
    }

    try {
      await saveProject({
        title: generatedApp.title,
        description: generatedApp.description,
        category: activeCategory === 'all' ? 'custom' : activeCategory,
        template_id: undefined,
        code: generatedApp.code || { components: {}, hooks: {}, utils: {}, types: '', config: '' },
        preview_data: {
          backend: generatedApp.backend,
          deployment: generatedApp.deployment,
          infrastructure: infrastructureConfig
        },
        is_published: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        user_id: user.id
      });

      toast({
        title: "Project saved!",
        description: "Your app has been saved to your workspace",
      });
    } catch (error) {
      console.error('Save error:', error);
      toast({
        title: "Failed to save",
        description: "There was an error saving your project",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="space-y-8">
      {/* Category Navigation */}
      <div className="flex justify-center">
        <CategoryTabs 
          activeCategory={activeCategory}
          onCategoryChange={setActiveCategory}
        />
      </div>

      {/* Configuration Buttons */}
      <div className="flex justify-center gap-4">
        <Button
          variant="outline"
          onClick={() => setShowModelSelector(!showModelSelector)}
        >
          Configure AI Models ({Object.keys(selectedModels).length} selected)
        </Button>
        <Button 
          variant="outline"
          onClick={() => setShowInfrastructureWizard(!showInfrastructureWizard)}
        >
          Infrastructure Setup
        </Button>
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

      {/* Infrastructure Wizard */}
      {showInfrastructureWizard && (
        <div className="mb-8">
          <InfrastructureWizard 
            appType={activeCategory === "all" ? "default" : activeCategory}
            onSelectionChange={setInfrastructureConfig}
            onComplete={(config) => {
              setInfrastructureConfig(config);
              setShowInfrastructureWizard(false);
            }}
          />
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={() => setShowInfrastructureWizard(false)}
            >
              Hide Infrastructure Setup
            </Button>
          </div>
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
        
        <GeneratedAppPreview 
          isGenerating={isGenerating}
          generatedApp={generatedApp}
          onSave={handleSaveProject}
        />
      </div>
    </div>
  );
};
