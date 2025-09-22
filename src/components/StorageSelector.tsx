import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { storageOptions, StorageOption } from '@/data/infrastructure';
import { Cloud, Globe, Database, ChevronRight, Info } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StorageSelectorProps {
  selectedStorage?: string;
  onSelect: (storage: string) => void;
}

export const StorageSelector = ({ selectedStorage, onSelect }: StorageSelectorProps) => {
  const selectedOption = storageOptions.find(option => option.id === selectedStorage);

  const getTypeIcon = (type: StorageOption['type']) => {
    switch (type) {
      case 'centralized': return <Cloud className="w-4 h-4" />;
      case 'decentralized': return <Globe className="w-4 h-4" />;
      case 'hybrid': return <Database className="w-4 h-4" />;
    }
  };

  const getCostColor = (cost: StorageOption['cost']) => {
    switch (cost) {
      case 'free': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'freemium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'paid': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold">Choose Storage Solution</h3>
        <p className="text-muted-foreground">
          Select how your app will store files, images, and other media assets
        </p>
      </div>

      {/* Storage Type Info */}
      <div className="grid md:grid-cols-3 gap-4 p-4 glass rounded-lg">
        <div className="text-center space-y-2">
          <Cloud className="w-6 h-6 mx-auto text-blue-400" />
          <div className="text-sm font-medium">Centralized</div>
          <div className="text-xs text-muted-foreground">Fast, reliable, traditional hosting</div>
        </div>
        <div className="text-center space-y-2">
          <Globe className="w-6 h-6 mx-auto text-green-400" />
          <div className="text-sm font-medium">Decentralized</div>
          <div className="text-xs text-muted-foreground">Censorship-resistant, permanent</div>
        </div>
        <div className="text-center space-y-2">
          <Database className="w-6 h-6 mx-auto text-purple-400" />
          <div className="text-sm font-medium">Hybrid</div>
          <div className="text-xs text-muted-foreground">Best of both worlds</div>
        </div>
      </div>

      {/* Storage Options */}
      <RadioGroup value={selectedStorage} onValueChange={onSelect} className="space-y-3">
        {storageOptions.map((option) => (
          <StorageCard
            key={option.id}
            option={option}
            isSelected={selectedStorage === option.id}
            onSelect={onSelect}
          />
        ))}
      </RadioGroup>

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
            <div className="space-y-2">
              <h5 className="font-medium">Key Features</h5>
              <div className="flex flex-wrap gap-2">
                {selectedOption.features.map((feature, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {feature}
                  </Badge>
                ))}
              </div>
            </div>

            {selectedOption.costPerGB && (
              <div className="p-3 glass rounded-lg">
                <div className="text-sm font-medium">Pricing</div>
                <div className="text-xs text-muted-foreground">{selectedOption.costPerGB}</div>
              </div>
            )}

            <div className="grid md:grid-cols-3 gap-4 text-center">
              <div className="space-y-1">
                <div className="text-sm font-medium">Type</div>
                <div className="flex items-center justify-center gap-1 text-xs text-muted-foreground">
                  {getTypeIcon(selectedOption.type)}
                  {selectedOption.type}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Cost Model</div>
                <div className="text-xs text-muted-foreground capitalize">{selectedOption.cost}</div>
              </div>
              <div className="space-y-1">
                <div className="text-sm font-medium">Best For</div>
                <div className="text-xs text-muted-foreground">
                  {selectedOption.type === 'decentralized' ? 'Web3 Apps' : 
                   selectedOption.type === 'centralized' ? 'Traditional Apps' : 'Flexible Apps'}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

interface StorageCardProps {
  option: StorageOption;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

const StorageCard = ({ option, isSelected, onSelect }: StorageCardProps) => {
  const getTypeIcon = (type: StorageOption['type']) => {
    switch (type) {
      case 'centralized': return <Cloud className="w-4 h-4" />;
      case 'decentralized': return <Globe className="w-4 h-4" />;
      case 'hybrid': return <Database className="w-4 h-4" />;
    }
  };

  const getCostColor = (cost: StorageOption['cost']) => {
    switch (cost) {
      case 'free': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'freemium': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'paid': return 'bg-orange-500/20 text-orange-400 border-orange-500/30';
    }
  };

  const getTypeColor = (type: StorageOption['type']) => {
    switch (type) {
      case 'centralized': return 'text-blue-400';
      case 'decentralized': return 'text-green-400';
      case 'hybrid': return 'text-purple-400';
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
          isSelected && "border-primary/50 bg-primary/5"
        )}>
          <CardContent className="p-4">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-3 flex-1">
                <span className="text-2xl">{option.icon}</span>
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium">{option.name}</h4>
                    {option.cost === 'free' && (
                      <Badge variant="secondary" className="text-xs">
                        Free
                      </Badge>
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground">{option.description}</p>
                  <div className="flex flex-wrap gap-2">
                    <Badge className={cn('text-xs', getCostColor(option.cost))}>
                      {option.cost}
                    </Badge>
                    <Badge variant="outline" className={cn('text-xs', getTypeColor(option.type))}>
                      {getTypeIcon(option.type)}
                      <span className="ml-1">{option.type}</span>
                    </Badge>
                  </div>
                  {option.costPerGB && (
                    <div className="text-xs text-muted-foreground">
                      {option.costPerGB}
                    </div>
                  )}
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