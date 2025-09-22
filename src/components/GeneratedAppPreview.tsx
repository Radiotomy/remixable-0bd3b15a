import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  ExternalLink, 
  Download, 
  Share2, 
  Code2, 
  Database, 
  Server,
  FileText,
  Copy,
  Check
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface GeneratedAppData {
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
}

interface GeneratedAppPreviewProps {
  isGenerating?: boolean;
  generatedApp?: GeneratedAppData;
}

export const GeneratedAppPreview = ({ isGenerating = false, generatedApp }: GeneratedAppPreviewProps) => {
  const [copiedFile, setCopiedFile] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('preview');

  const copyToClipboard = async (content: string, fileName: string) => {
    try {
      await navigator.clipboard.writeText(content);
      setCopiedFile(fileName);
      setTimeout(() => setCopiedFile(null), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

  if (!isGenerating && !generatedApp) {
    return (
      <Card className="h-[600px] glass border-border/50 border-dashed flex items-center justify-center">
        <div className="text-center space-y-4 max-w-md">
          <div className="text-6xl opacity-20">🚀</div>
          <h3 className="text-lg font-medium text-muted-foreground">
            Your Full-Stack App Will Appear Here
          </h3>
          <p className="text-sm text-muted-foreground">
            Choose a template or describe your app to generate complete code with backend infrastructure
          </p>
        </div>
      </Card>
    );
  }

  if (isGenerating) {
    return (
      <Card className="h-[600px] glass border-border/50 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div className="relative">
            <div className="w-20 h-20 mx-auto bg-gradient-to-r from-primary to-accent rounded-2xl flex items-center justify-center animate-pulse">
              <Code2 className="w-10 h-10 text-white" />
            </div>
            <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl animate-ping" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-semibold">Generating Full-Stack App</h3>
            <p className="text-muted-foreground">Creating components, backend, and infrastructure...</p>
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

  if (!generatedApp) return null;

  return (
    <Card className="h-[600px] glass border-border/50 overflow-hidden">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-lg">{generatedApp.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{generatedApp.description}</p>
          </div>
          <div className="flex gap-2">
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
        <div className="flex flex-wrap gap-1.5 mt-3">
          {generatedApp.features.map((feature, index) => (
            <Badge key={index} variant="secondary" className="text-xs">
              {feature}
            </Badge>
          ))}
        </div>
      </CardHeader>

      <CardContent className="p-0 flex-1">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full">
          <TabsList className="grid w-full grid-cols-4 mx-4 mb-4">
            <TabsTrigger value="preview">Preview</TabsTrigger>
            <TabsTrigger value="frontend">Frontend</TabsTrigger>
            <TabsTrigger value="backend">Backend</TabsTrigger>
            <TabsTrigger value="deploy">Deploy</TabsTrigger>
          </TabsList>

          <TabsContent value="preview" className="mt-0 px-4">
            <div className="h-[400px] bg-background/50 rounded-lg border border-border/30 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
              <div className="relative h-full flex flex-col">
                {/* Mock Header */}
                <div className="h-14 bg-primary/10 border-b border-border/20 flex items-center px-4">
                  <div className="w-8 h-8 bg-primary/20 rounded-lg" />
                  <div className="ml-3 space-y-1">
                    <div className="text-sm font-medium">{generatedApp.title}</div>
                    <div className="text-xs text-muted-foreground">Live Preview</div>
                  </div>
                </div>

                {/* Mock Content */}
                <div className="flex-1 p-4 space-y-4">
                  <div className="text-center space-y-2">
                    <h3 className="text-lg font-semibold">{generatedApp.title}</h3>
                    <p className="text-sm text-muted-foreground">{generatedApp.description}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    {generatedApp.features.slice(0, 4).map((feature, i) => (
                      <div key={i} className="h-16 bg-muted/30 rounded-lg flex items-center justify-center animate-pulse">
                        <span className="text-xs text-center px-2">{feature}</span>
                      </div>
                    ))}
                  </div>

                  <div className="flex justify-center">
                    <Button size="sm" className="animate-pulse">
                      Get Started
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="frontend" className="mt-0 px-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {/* Components */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Code2 className="w-4 h-4" />
                    <h4 className="font-medium">Components</h4>
                  </div>
                  <div className="space-y-2">
                    {Object.entries(generatedApp.code.components).map(([name, code]) => (
                      <Card key={name} className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-mono">{name}</span>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => copyToClipboard(code, name)}
                          >
                            {copiedFile === name ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                          </Button>
                        </div>
                        <pre className="text-xs bg-muted/50 p-2 rounded overflow-x-auto max-h-32">
                          {code.split('\n').slice(0, 10).join('\n')}
                          {code.split('\n').length > 10 && '\n...'}
                        </pre>
                      </Card>
                    ))}
                  </div>
                </div>

                {/* Hooks */}
                {Object.keys(generatedApp.code.hooks).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="w-4 h-4" />
                      <h4 className="font-medium">Hooks</h4>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(generatedApp.code.hooks).map(([name, code]) => (
                        <Card key={name} className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-mono">{name}</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(code, name)}
                            >
                              {copiedFile === name ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                          <pre className="text-xs bg-muted/50 p-2 rounded overflow-x-auto max-h-32">
                            {code.split('\n').slice(0, 8).join('\n')}
                            {code.split('\n').length > 8 && '\n...'}
                          </pre>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="backend" className="mt-0 px-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {/* Database Schema */}
                {generatedApp.backend.schema && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Database className="w-4 h-4" />
                      <h4 className="font-medium">Database Schema</h4>
                    </div>
                    <Card className="p-3">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-mono">schema.sql</span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => copyToClipboard(generatedApp.backend.schema, 'schema.sql')}
                        >
                          {copiedFile === 'schema.sql' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </Button>
                      </div>
                      <pre className="text-xs bg-muted/50 p-2 rounded overflow-x-auto max-h-40">
                        {generatedApp.backend.schema}
                      </pre>
                    </Card>
                  </div>
                )}

                {/* Edge Functions */}
                {Object.keys(generatedApp.backend.edgeFunctions).length > 0 && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Server className="w-4 h-4" />
                      <h4 className="font-medium">Edge Functions</h4>
                    </div>
                    <div className="space-y-2">
                      {Object.entries(generatedApp.backend.edgeFunctions).map(([name, code]) => (
                        <Card key={name} className="p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-mono">{name}/index.ts</span>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => copyToClipboard(code, `${name}/index.ts`)}
                            >
                              {copiedFile === `${name}/index.ts` ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                            </Button>
                          </div>
                          <pre className="text-xs bg-muted/50 p-2 rounded overflow-x-auto max-h-32">
                            {code.split('\n').slice(0, 10).join('\n')}
                            {code.split('\n').length > 10 && '\n...'}
                          </pre>
                        </Card>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </ScrollArea>
          </TabsContent>

          <TabsContent value="deploy" className="mt-0 px-4">
            <ScrollArea className="h-[400px]">
              <div className="space-y-4">
                {/* Environment Variables */}
                <div>
                  <h4 className="font-medium mb-2">Environment Variables</h4>
                  <Card className="p-3">
                    <pre className="text-xs font-mono">
                      {Object.entries(generatedApp.deployment.envVars)
                        .map(([key, value]) => `${key}=${value}`)
                        .join('\n')}
                    </pre>
                  </Card>
                </div>

                {/* Build Commands */}
                <div>
                  <h4 className="font-medium mb-2">Build Commands</h4>
                  <Card className="p-3">
                    <pre className="text-xs font-mono">
                      {generatedApp.deployment.buildCommands.join('\n')}
                    </pre>
                  </Card>
                </div>

                {/* Deploy Button */}
                <Button className="w-full" size="lg">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Deploy to Production
                </Button>
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
};