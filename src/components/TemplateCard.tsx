import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Template } from "@/data/templates";
import { cn } from "@/lib/utils";
import { Sparkles, Zap, Star } from "lucide-react";

interface TemplateCardProps {
  template: Template;
  onSelect: (template: Template) => void;
}

export const TemplateCard = ({ template, onSelect }: TemplateCardProps) => {
  const getDifficultyIcon = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return <Sparkles className="w-4 h-4" />;
      case 'intermediate': return <Zap className="w-4 h-4" />;
      case 'advanced': return <Star className="w-4 h-4" />;
      default: return <Sparkles className="w-4 h-4" />;
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'beginner': return 'bg-green-500/10 text-green-400 border-green-500/20';
      case 'intermediate': return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20';
      case 'advanced': return 'bg-red-500/10 text-red-400 border-red-500/20';
      default: return 'bg-green-500/10 text-green-400 border-green-500/20';
    }
  };

  return (
    <Card className={cn(
      "group relative overflow-hidden transition-all duration-500 hover:scale-[1.02]",
      "glass border-border/50 hover:border-primary/50",
      "hover:shadow-2xl hover:shadow-primary/20"
    )}>
      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative p-6 space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{template.icon}</div>
            <div>
              <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
                {template.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {template.description}
              </p>
            </div>
          </div>
          <Badge 
            variant="outline" 
            className={cn(
              "capitalize text-xs flex items-center gap-1 transition-all duration-300",
              getDifficultyColor(template.difficulty)
            )}
          >
            {getDifficultyIcon(template.difficulty)}
            {template.difficulty}
          </Badge>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-muted-foreground">Key Features:</h4>
          <div className="flex flex-wrap gap-1.5">
            {template.features.slice(0, 3).map((feature, index) => (
              <Badge 
                key={index} 
                variant="secondary" 
                className="text-xs bg-muted/50 hover:bg-muted transition-colors"
              >
                {feature}
              </Badge>
            ))}
            {template.features.length > 3 && (
              <Badge variant="secondary" className="text-xs bg-muted/30">
                +{template.features.length - 3} more
              </Badge>
            )}
          </div>
        </div>

        {/* Action Button */}
        <Button 
          onClick={() => onSelect(template)}
          className={cn(
            "w-full mt-4 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300",
            "hover:shadow-lg hover:shadow-primary/25"
          )}
          variant="outline"
        >
          <Sparkles className="w-4 h-4 mr-2" />
          Generate App
        </Button>
      </div>
    </Card>
  );
};