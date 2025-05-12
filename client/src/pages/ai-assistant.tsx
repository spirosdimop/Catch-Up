import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, Calendar, Send, User, Clock, AlertCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

type Message = {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

export default function AIAssistant() {
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi there! I'm your AI assistant. How can I help you with your freelance business today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponses = [
        "I can help you with that! Let me look into it.",
        "That's a great question about freelancing. Here's what I recommend...",
        "Based on your freelance business, you might want to consider these options...",
        "I've analyzed your request and here are some suggestions for your consideration."
      ];
      
      const randomResponse = aiResponses[Math.floor(Math.random() * aiResponses.length)];
      
      const aiMessage: Message = {
        id: messages.length + 2,
        text: randomResponse,
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    }, 1000);
  };

  return (
    <div className="space-y-6 p-6">
      <PageTitle 
        title="AI Assistant" 
        description="Get help and insights for your freelance business" 
        icon={<Bot className="h-6 w-6 text-primary" />}
      />
      
      <Card className="h-[calc(100vh-220px)] flex flex-col">
        <CardHeader>
          <CardTitle>Virtual Assistant</CardTitle>
        </CardHeader>
        <CardContent className="flex-1 overflow-y-auto space-y-4 pb-0">
          {messages.map(message => (
            <div 
              key={message.id}
              className={`flex items-start gap-3 max-w-[80%] ${message.sender === 'user' ? 'ml-auto flex-row-reverse' : ''}`}
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className={message.sender === 'ai' ? "bg-primary text-primary-foreground" : ""}>
                  {message.sender === 'ai' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                </AvatarFallback>
              </Avatar>
              <div className={`p-3 rounded-lg ${message.sender === 'ai' ? 'bg-muted' : 'bg-primary text-primary-foreground'}`}>
                <p>{message.text}</p>
                <p className={`text-xs mt-1 ${message.sender === 'ai' ? 'text-muted-foreground' : 'text-primary-foreground/70'}`}>
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>
            </div>
          ))}
        </CardContent>
        
        <div className="p-4 mt-auto">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input 
              placeholder="Ask anything about managing your freelance business..." 
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1"
            />
            <Button type="submit">
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
        </div>
      </Card>
    </div>
  );
}