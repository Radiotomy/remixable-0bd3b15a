import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { databaseOptions, DatabaseOption } from '@/data/infrastructure';
import { Check, Info, Zap, Cloud, Globe, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DatabaseSelectorProps {
  appType: string;
  selectedDatabase?: string;
  onSelect: (database: string) => void;
}

export const DatabaseSelector = ({ appType, selectedDatabase, onSelect }: DatabaseSelectorProps) => {
  const [selectedOption, setSelectedOption] = useState<DatabaseOption | null>(
    databaseOptions.find(db => db.id === selectedDatabase) || null
  );

  const getTypeIcon = (type: DatabaseOption['type']) => {
    switch (type) {
      case 'local-first': return <Zap className="w-4 h-4" />;
      case 'cloud': return <Cloud className="w-4 h-4" />;
      case 'decentralized': return <Globe className="w-4 h-4" />;
    }
  };

  const getCostColor = (cost: DatabaseOption['cost']) => {
    switch (cost) {
      case 'free': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'freemium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'paid': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    }
  };

  const getComplexityColor = (complexity: DatabaseOption['setupComplexity']) => {
    switch (complexity) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-orange-400';
      case 'advanced': return 'text-red-400';
    }
  };

  const handleSelect = (databaseId: string) => {
    const option = databaseOptions.find(db => db.id === databaseId);
    setSelectedOption(option || null);
    onSelect(databaseId);
  };

  const recommendedOptions = databaseOptions.filter(db => 
    db.recommendedFor.some(use => use.toLowerCase().includes(appType.toLowerCase()))
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Choose Your Database</h3>
        <p className="text-muted-foreground">
          Select the data storage solution that best fits your {appType} app needs
        </p>
      </div>

      {/* Recommended Section */}
      {recommendedOptions.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Info className="w-4 h-4" />
            Recommended for {appType} apps
          </div>
          <div className="grid gap-3">
            {recommendedOptions.map((option) => (
              <DatabaseCard
                key={option.id}
                option={option}
                isSelected={selectedDatabase === option.id}
                onSelect={handleSelect}
                isRecommended={true}
              />
            ))}
          </div>
        </div>
      )}

      {/* All Options */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium text-muted-foreground">All Database Options</h4>
        <RadioGroup value={selectedDatabase} onValueChange={handleSelect} className="space-y-3">
          {databaseOptions.map((option) => (
            <DatabaseCard
              key={option.id}
              option={option}
              isSelected={selectedDatabase === option.id}
              onSelect={handleSelect}
              isRecommended={recommendedOptions.includes(option)}
            />
          ))}
        </RadioGroup>
      </div>

      {/* Selected Option Details */}
      {selectedOption && (
        <Card className="border-primary/20 bg-gradient-to-r from-primary/5 to-transparent">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <span className="text-2xl">{selectedOption.icon}</span>
              {selectedOption.name}
              <Badge className={cn('text-xs', getCostColor(selectedOption.cost))}>
                {selectedOption.cost}
              </Badge>
            </CardTitle>
            <CardDescription>{selectedOption.description}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <h5 className="font-medium text-green-400">Pros</h5>
                <ul className="text-sm space-y-1">
                  {selectedOption.pros.map((pro, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Check className="w-3 h-3 text-green-400" />
                      {pro}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="space-y-2">
                <h5 className="font-medium text-orange-400">Considerations</h5>
                <ul className="text-sm space-y-1">
                  {selectedOption.cons.map((con, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <Info className="w-3 h-3 text-orange-400" />
                      {con}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {selectedOption.monthlyEstimate && (
              <div className="p-3 glass rounded-lg">
                <div className="text-sm font-medium">Cost Estimate</div>
                <div className="text-xs text-muted-foreground">{selectedOption.monthlyEstimate}</div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface DatabaseCardProps {
  option: DatabaseOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
  isRecommended: boolean;
}

const DatabaseCard = ({ option, isSelected, onSelect, isRecommended }: DatabaseCardProps) => {
  const getTypeIcon = (type: DatabaseOption['type']) => {
    switch (type) {
      case 'local-first': return <Zap className="w-4 h-4" />;
      case 'cloud': return <Cloud className="w-4 h-4" />;
      case 'decentralized': return <Globe className="w-4 h-4" />;
    }
  };

  const getCostColor = (cost: DatabaseOption['cost']) => {
    switch (cost) {
      case 'free': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'freemium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'paid': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    }
  };

  const getComplexityColor = (complexity: DatabaseOption['setupComplexity']) => {
    switch (complexity) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-orange-400';
      case 'advanced': return 'text-red-400';
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <RadioGroupItem value={option.id} id={option.id} />
      <Label 
        htmlFor={option.id} 
        className="flex-1 cursor-pointer"
        onClick={() => onSelect(option.id)}
      >
        <Card className={cn(
          "transition-all hover:border-primary/30 hover:bg-muted/20",
          isSelected && "border-primary/50 bg-primary/5",
          isRecommended && "ring-1 ring-accent/50"
        )}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl">{option.icon}</span>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{option.name}</h4>
                    {isRecommended && (
                      <Badge variant="secondary" className="text-xs">
                        Recommended
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={cn('text-xs', getCostColor(option.cost))}>
                      {option.cost}
                    </Badge>
                    <Badge variant="outline" className="text-xs">
                      {getTypeIcon(option.type)}
                      <span className="ml-1">{option.type}</span>
                    </Badge>
                    <Badge variant="outline" className={cn('text-xs', getComplexityColor(option.setupComplexity))}>
                      {option.setupComplexity}
                    </Badge>
                  </div>
                </div>
              </div>
              <ChevronRight className={cn(
                "w-4 h-4 text-muted-foreground transition-transform",
                isSelected && "rotate-90 text-primary"
              )} />
            </div>
          </CardContent>
        </Card>
      </Label>
    </div>
  );
};