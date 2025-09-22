import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { MessageCircle, Send, X, User, Bot, Clock, CheckCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ChatMessage {
  id: string;
  content: string;
  isUser: boolean;
  timestamp: string;
  status?: "sending" | "sent" | "delivered";
}

interface SupportAgent {
  name: string;
  avatar: string;
  status: "online" | "away" | "busy";
  title: string;
}

export const LiveChatWidget = () => {
  const { toast } = useToast();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "1",
      content: "Hi! I'm Sarah from the Remixable support team. How can I help you today?",
      isUser: false,
      timestamp: new Date().toISOString(),
      status: "delivered"
    }
  ]);
  const [newMessage, setNewMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isConnected, setIsConnected] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const agent: SupportAgent = {
    name: "Sarah Johnson",
    avatar: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=32&h=32&fit=crop&crop=face",
    status: "online",
    title: "Senior Support Specialist"
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (!newMessage.trim()) return;

    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      content: newMessage.trim(),
      isUser: true,
      timestamp: new Date().toISOString(),
      status: "sending"
    };

    setMessages(prev => [...prev, userMessage]);
    setNewMessage("");
    setIsTyping(true);

    // Simulate message sending
    setTimeout(() => {
      setMessages(prev => 
        prev.map(msg => 
          msg.id === userMessage.id 
            ? { ...msg, status: "delivered" }
            : msg
        )
      );
    }, 500);

    // Simulate agent response
    setTimeout(() => {
      setIsTyping(false);
      const responses = [
        "Thanks for reaching out! I'll be happy to help you with that.",
        "That's a great question. Let me look into that for you right away.",
        "I understand your concern. Here's what I can do to help...",
        "Let me check our documentation on that topic for you.",
        "I'll need to gather some more information to better assist you."
      ];
      
      const randomResponse = responses[Math.floor(Math.random() * responses.length)];
      
      const agentMessage: ChatMessage = {
        id: (Date.now() + 1).toString(),
        content: randomResponse,
        isUser: false,
        timestamp: new Date().toISOString(),
        status: "delivered"
      };
      
      setMessages(prev => [...prev, agentMessage]);
    }, 2000);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const getStatusIcon = (status?: string) => {
    switch (status) {
      case "sending":
        return <Clock className="w-3 h-3 text-muted-foreground animate-spin" />;
      case "delivered":
        return <CheckCircle className="w-3 h-3 text-primary" />;
      default:
        return null;
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            size="lg"
            className="fixed bottom-6 right-6 z-50 rounded-full w-14 h-14 shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-110"
          >
            <MessageCircle className="w-6 h-6" />
          </Button>
        </DialogTrigger>
        
        <DialogContent className="sm:max-w-[400px] h-[600px] p-0 flex flex-col">
          {/* Chat Header */}
          <CardHeader className="pb-3 border-b">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className={`absolute -bottom-1 -right-1 w-3 h-3 rounded-full border-2 border-white ${
                    agent.status === "online" ? "bg-green-500" : 
                    agent.status === "away" ? "bg-yellow-500" : "bg-red-500"
                  }`} />
                </div>
                <div>
                  <CardTitle className="text-sm">{agent.name}</CardTitle>
                  <p className="text-xs text-muted-foreground">{agent.title}</p>
                </div>
              </div>
              
              <div className="flex items-center gap-2">
                <Badge variant={isConnected ? "secondary" : "destructive"} className="text-xs">
                  {isConnected ? "Online" : "Offline"}
                </Badge>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </CardHeader>

          {/* Chat Messages */}
          <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.isUser ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[80%] ${message.isUser ? "order-2" : "order-1"}`}>
                  <div
                    className={`px-3 py-2 rounded-lg text-sm ${
                      message.isUser
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {message.content}
                  </div>
                  <div className={`flex items-center gap-1 mt-1 text-xs text-muted-foreground ${
                    message.isUser ? "justify-end" : "justify-start"
                  }`}>
                    <span>{formatTime(message.timestamp)}</span>
                    {message.isUser && getStatusIcon(message.status)}
                  </div>
                </div>
                
                <div className={`flex-shrink-0 ${message.isUser ? "order-1 mr-2" : "order-2 ml-2"}`}>
                  {message.isUser ? (
                    <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center">
                      <User className="w-3 h-3 text-primary-foreground" />
                    </div>
                  ) : (
                    <img
                      src={agent.avatar}
                      alt={agent.name}
                      className="w-6 h-6 rounded-full object-cover"
                    />
                  )}
                </div>
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="flex items-center gap-2">
                  <img
                    src={agent.avatar}
                    alt={agent.name}
                    className="w-6 h-6 rounded-full object-cover"
                  />
                  <div className="bg-muted px-3 py-2 rounded-lg">
                    <div className="flex gap-1">
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.1s" }} />
                      <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </CardContent>

          {/* Chat Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={handleKeyPress}
                className="flex-1"
                disabled={!isConnected}
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || !isConnected}
                size="sm"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
            
            <div className="mt-2 text-xs text-muted-foreground">
              Typically replies within 5 minutes
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};