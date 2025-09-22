import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ExternalLink, Download, Share2, Code, Smartphone, Monitor } from "lucide-react";

interface AppPreviewProps {
  isGenerating?: boolean;
  generatedApp?: {
    title: string;
    description: string;
    features: string[];
    previewUrl?: string;
  };
}

export const AppPreview = ({ isGenerating = false, generatedApp }: AppPreviewProps) => {
  if (!isGenerating && !generatedApp) {
    return (
      <Card className="h-[500px] glass border-border/50 border-dashed flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl opacity-20">📱</div>
          <h3 className="text-lg font-medium text-muted-foreground">
            Your Generated App Will Appear Here
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose a template or describe your app in the chat to get started
          </p>
        </div>
      </Card>
    );
  }

  if (isGenerating) {
    return (
      <Card className="h-[500px] glass border-border/50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center animate-pulse">
              <Code className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl animate-ping" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Generating Your App</h3>
            <p className="text-muted-foreground">Creating components, styling, and functionality...</p>
            <div className="flex justify-center gap-1 mt-4">
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-primary rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="h-[500px] glass border-border/50 overflow-hidden">
      {/* Header */}
      <div className="p-4 border-b border-border/50 bg-muted/20">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-lg">{generatedApp?.title}</h3>
            <p className="text-sm text-muted-foreground">{generatedApp?.description}</p>
          </div>
          <div className="flex gap-2">
            <Button size="sm" variant="outline" className="h-8">
              <Smartphone className="w-4 h-4" />
            </Button>
            <Button size="sm" variant="outline" className="h-8">
              <Monitor className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Preview Content */}
      <div className="flex-1 p-4">
        <div className="h-full bg-background/50 rounded-lg border border-border/30 relative overflow-hidden">
          {/* Mock App Content */}
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
          <div className="relative h-full flex flex-col">
            {/* Mock Header */}
            <div className="h-16 bg-primary/10 border-b border-border/20 flex items-center px-4">
              <div className="w-8 h-8 bg-primary/20 rounded-lg" />
              <div className="ml-3 space-y-1">
                <div className="w-24 h-3 bg-foreground/20 rounded" />
                <div className="w-16 h-2 bg-foreground/10 rounded" />
              </div>
            </div>

            {/* Mock Content */}
            <div className="flex-1 p-4 space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-20 bg-muted/30 rounded-lg animate-pulse" />
                ))}
              </div>
              <div className="space-y-2">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-muted/20 rounded animate-pulse" style={{ width: `${100 - i * 20}%` }} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features & Actions */}
      <div className="p-4 border-t border-border/50 space-y-3">
        <div className="flex flex-wrap gap-1.5">
          {generatedApp?.features.map((feature, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>
        <div className="flex gap-2">
          <Button size="sm" className="flex-1">
            <ExternalLink className="w-4 h-4 mr-2" />
            Launch App
          </Button>
          <Button size="sm" variant="outline">
            <Share2 className="w-4 h-4 mr-2" />
            Share
          </Button>
          <Button size="sm" variant="outline">
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>
    </Card>
  );
};