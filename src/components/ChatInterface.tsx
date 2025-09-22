import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Send, Sparkles, Bot, User, Loader2 } from "lucide-react";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatInterfaceProps {
  onGenerate: (prompt: string) => void;
  isGenerating?: boolean;
}

export const ChatInterface = ({ onGenerate, isGenerating = false }: ChatInterfaceProps) => {
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Hi! I'm your AI app builder. Describe the app you want to create, or choose from our templates above. I can generate full-featured applications in seconds!",
      timestamp: new Date()
    }
  ]);

  const handleSend = () => {
    if (!message.trim() || isGenerating) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    onGenerate(message);
    setMessage("");

    // Simulate AI response
    setTimeout(() => {
      const aiMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: `Great! I'm generating your "${message}" app now. This will include a modern React interface with all the features you requested. The app will be ready in just a few seconds!`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <Card className="flex flex-col h-[500px] glass border-border/50">
      {/* Chat Messages */}
      <div className="flex-1 p-4 space-y-4 overflow-y-auto">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={cn(
              "flex gap-3 max-w-[80%]",
              msg.role === 'user' ? "ml-auto flex-row-reverse" : ""
            )}
          >
            {/* Avatar */}
            <div className={cn(
              "flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center",
              msg.role === 'user' 
                ? "bg-primary text-primary-foreground" 
                : "bg-accent text-accent-foreground"
            )}>
              {msg.role === 'user' ? (
                <User className="w-4 h-4" />
              ) : (
                <Bot className="w-4 h-4" />
              )}
            </div>
            
            {/* Message Content */}
            <div className={cn(
              "rounded-xl px-4 py-3 text-sm",
              msg.role === 'user'
                ? "bg-primary text-primary-foreground"
                : "bg-muted text-foreground"
            )}>
              {msg.content}
            </div>
          </div>
        ))}
        
        {isGenerating && (
          <div className="flex gap-3 max-w-[80%]">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-accent text-accent-foreground flex items-center justify-center">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-muted rounded-xl px-4 py-3 flex items-center gap-2">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span className="text-sm">Generating your app...</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Area */}
      <div className="border-t border-border/50 p-4">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Describe the app you want to build... (e.g., 'Create a social media app with photo sharing and messaging')"
              className="resize-none pr-12 min-h-[60px] bg-background/50 backdrop-blur-sm"
              disabled={isGenerating}
            />
            <Badge 
              variant="secondary" 
              className="absolute bottom-2 right-2 text-xs bg-muted/50"
            >
              <Sparkles className="w-3 h-3 mr-1" />
              AI Powered
            </Badge>
          </div>
          <Button
            onClick={handleSend}
            disabled={!message.trim() || isGenerating}
            className="self-end h-[60px] px-6 bg-primary hover:bg-primary/90"
          >
            {isGenerating ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
      </div>
    </Card>
  );
};