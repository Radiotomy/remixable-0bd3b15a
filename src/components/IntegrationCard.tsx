import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Zap, AlertCircle, CheckCircle, Settings } from 'lucide-react'
import { Integration } from '@/data/integrations'

interface IntegrationCardProps {
  integration: Integration;
  onConnect: (integration: Integration) => void;
}

const IntegrationCard = ({ integration, onConnect }: IntegrationCardProps) => {
  const getCategoryColor = (category: Integration['category']) => {
    switch (category) {
      case 'free':
        return 'bg-accent/20 text-accent-foreground border-accent/30';
      case 'api-key':
        return 'bg-primary/20 text-primary-foreground border-primary/30';
      case 'premium':
        return 'bg-destructive/20 text-destructive-foreground border-destructive/30';
      default:
        return 'bg-secondary text-secondary-foreground';
    }
  };

  const getStatusIcon = (status: Integration['status']) => {
    switch (status) {
      case 'ready':
        return <CheckCircle className="w-4 h-4 text-accent" />;
      case 'setup-required':
        return <Settings className="w-4 h-4 text-primary" />;
      case 'coming-soon':
        return <AlertCircle className="w-4 h-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getComplexityColor = (complexity: Integration['complexity']) => {
    switch (complexity) {
      case 'easy':
        return 'text-accent';
      case 'medium':
        return 'text-primary';
      case 'advanced':
        return 'text-destructive';
      default:
        return 'text-muted-foreground';
    }
  };

  const getCategoryLabel = (category: Integration['category']) => {
    switch (category) {
      case 'free':
        return '🟢 Free';
      case 'api-key':
        return '🟡 API Key Required';
      case 'premium':
        return '🔴 Premium Service';
      default:
        return category;
    }
  };

  const isConnectable = integration.status === 'ready' || integration.status === 'setup-required';

  return (
    <Card className="group relative overflow-hidden transition-all duration-300 hover:shadow-lg hover:border-primary/50 h-full flex flex-col">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-card/50 to-muted/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      
      <CardHeader className="relative z-10 pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="text-2xl">{integration.icon}</div>
            <div>
              <CardTitle className="text-lg leading-tight">{integration.name}</CardTitle>
              <div className="flex items-center gap-2 mt-1">
                {getStatusIcon(integration.status)}
                <span className="text-sm text-muted-foreground capitalize">
                  {integration.status.replace('-', ' ')}
                </span>
              </div>
            </div>
          </div>
          <Badge variant="outline" className={getCategoryColor(integration.category)}>
            {getCategoryLabel(integration.category)}
          </Badge>
        </div>
        <CardDescription className="text-sm leading-relaxed mt-2">
          {integration.description}
        </CardDescription>
      </CardHeader>

      <CardContent className="relative z-10 flex-1 space-y-4 pt-0">
        {/* Cost info if available */}
        {integration.costInfo && (
          <div className="p-3 bg-muted/30 rounded-lg border">
            <p className="text-sm text-muted-foreground">
              <strong>Pricing:</strong> {integration.costInfo}
            </p>
          </div>
        )}

        {/* Setup info */}
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span className="text-muted-foreground">Setup: {integration.estimatedSetupTime}</span>
          </div>
          <div className="flex items-center gap-2">
            <Zap className={`w-4 h-4 ${getComplexityColor(integration.complexity)}`} />
            <span className={`capitalize ${getComplexityColor(integration.complexity)}`}>
              {integration.complexity}
            </span>
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2">
          <p className="text-sm font-medium">Key Features:</p>
          <div className="flex flex-wrap gap-1">
            {integration.features.slice(0, 4).map((feature, index) => (
              <Badge key={index} variant="secondary" className="text-xs">
                {feature}
              </Badge>
            ))}
            {integration.features.length > 4 && (
              <Badge variant="secondary" className="text-xs">
                +{integration.features.length - 4} more
              </Badge>
            )}
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-1">
          {integration.tags.slice(0, 3).map((tag, index) => (
            <Badge key={index} variant="outline" className="text-xs">
              {tag}
            </Badge>
          ))}
        </div>
      </CardContent>

      <CardFooter className="relative z-10 pt-0">
        <Button
          onClick={() => onConnect(integration)}
          disabled={!isConnectable}
          className="w-full"
          variant={integration.status === 'ready' ? 'default' : 'outline'}
        >
          {integration.status === 'ready' && 'Connect Now'}
          {integration.status === 'setup-required' && 'Setup Required'}
          {integration.status === 'coming-soon' && 'Coming Soon'}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default IntegrationCard;