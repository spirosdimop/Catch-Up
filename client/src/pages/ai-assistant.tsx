import { useState, useRef, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Bot, User, Send, Loader2, Trash2, RefreshCw } from "lucide-react";
import { PageTitle } from "@/components/ui/page-title";
import { apiRequest } from "@/lib/queryClient";

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function AIAssistant() {
  const { toast } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: 'Hello! I\'m your AI assistant. I can help you with task management, productivity advice, project planning, and answer questions about your work. How can I assist you today?',
      timestamp: new Date()
    }
  ]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages are added
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Get user data for context
  const { data: tasks } = useQuery({
    queryKey: ['/api/tasks'],
  });

  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
  });

  const { data: clients } = useQuery({
    queryKey: ['/api/clients'],
  });

  // AI chat mutation
  const chatMutation = useMutation({
    mutationFn: async (message: string) => {
      // Add context about user's current data
      const contextualMessage = `
User's current data context:
- Tasks: ${Array.isArray(tasks) ? tasks.length : 0} total (${Array.isArray(tasks) ? tasks.filter((t: any) => !t.completed).length : 0} pending)
- Projects: ${Array.isArray(projects) ? projects.length : 0} total (${Array.isArray(projects) ? projects.filter((p: any) => p.status === 'in_progress').length : 0} active)
- Clients: ${Array.isArray(clients) ? clients.length : 0} total

User message: ${message}

Please provide helpful, actionable advice based on this context. Be conversational and specific.
`;

      return apiRequest('/api/ai/chat', 'POST', { message: contextualMessage });
    },
    onSuccess: (response: any) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: response.response,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: (error) => {
      console.error('AI chat error:', error);
      toast({
        title: "AI Error",
        description: "Failed to get AI response. Please check your OpenAI API key and try again.",
        variant: "destructive",
      });
    },
  });

  // Task suggestions mutation
  const taskSuggestionsMutation = useMutation({
    mutationFn: () => apiRequest('/api/ai/task-suggestions', 'POST', {}),
    onSuccess: (response: any) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Here are some task suggestions based on your current workload:\n\n${response.suggestions}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate task suggestions.",
        variant: "destructive",
      });
    },
  });

  // Task summary mutation
  const taskSummaryMutation = useMutation({
    mutationFn: () => apiRequest('/api/ai/task-summary', 'POST', {}),
    onSuccess: (response: any) => {
      const assistantMessage: ChatMessage = {
        id: Date.now().toString(),
        role: 'assistant',
        content: `Here's a summary of your current tasks:\n\n${response.summary}`,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMessage]);
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to generate task summary.",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || chatMutation.isPending) return;

    // Add user message
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: inputValue.trim(),
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    chatMutation.mutate(inputValue.trim());
    setInputValue('');
  };

  const clearChat = () => {
    setMessages([
      {
        id: '1',
        role: 'assistant',
        content: 'Hello! I\'m your AI assistant. I can help you with task management, productivity advice, project planning, and answer questions about your work. How can I assist you today?',
        timestamp: new Date()
      }
    ]);
  };

  const handleTaskSuggestions = () => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: 'Generate task suggestions for me',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    taskSuggestionsMutation.mutate();
  };

  const handleTaskSummary = () => {
    const userMessage: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: 'Give me a summary of my current tasks',
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    taskSummaryMutation.mutate();
  };

  const isLoading = chatMutation.isPending || taskSuggestionsMutation.isPending || taskSummaryMutation.isPending;

  return (
    <div className="space-y-6 p-6">
      <PageTitle 
        title="AI Assistant" 
        description="Chat with AI for productivity insights, task management, and project planning advice"
        icon={<Bot className="h-6 w-6 text-primary" />}
      />

      <Card className="h-[calc(100vh-200px)] flex flex-col">
        <CardHeader className="flex flex-row justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              AI Chat Assistant
            </CardTitle>
            <CardDescription>
              Ask questions about your work, get productivity advice, or request task insights
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTaskSummary}
              disabled={isLoading}
              className="hidden sm:flex"
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              Task Summary
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleTaskSuggestions}
              disabled={isLoading}
              className="hidden sm:flex"
            >
              <Bot className="h-4 w-4 mr-1" />
              Suggestions
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={clearChat}
              disabled={isLoading}
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Clear
            </Button>
          </div>
        </CardHeader>

        <CardContent className="flex-1 flex flex-col">
          <ScrollArea className="flex-1 pr-4">
            <div className="space-y-4 pb-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.role === 'user' ? 'flex-row-reverse' : ''
                  }`}
                >
                  <Avatar className="h-8 w-8 flex-shrink-0">
                    <AvatarFallback className={
                      message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-muted'
                    }>
                      {message.role === 'user' ? (
                        <User className="h-4 w-4" />
                      ) : (
                        <Bot className="h-4 w-4" />
                      )}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div
                    className={`max-w-[80%] rounded-lg px-3 py-2 ${
                      message.role === 'user'
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm whitespace-pre-wrap leading-relaxed">
                      {message.content}
                    </p>
                    <p className={`text-xs mt-1 opacity-70 ${
                      message.role === 'user' ? 'text-primary-foreground' : 'text-muted-foreground'
                    }`}>
                      {message.timestamp.toLocaleTimeString([], { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-3">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-muted">
                      <Bot className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                  <div className="bg-muted rounded-lg px-3 py-2">
                    <div className="flex items-center gap-2">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      <span className="text-sm text-muted-foreground">
                        AI is thinking...
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
            <div ref={messagesEndRef} />
          </ScrollArea>

          <div className="border-t pt-4">
            <form onSubmit={handleSubmit} className="flex gap-2">
              <Input
                type="text"
                placeholder="Ask AI about your tasks, projects, or productivity..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                disabled={isLoading}
                className="flex-1"
              />
              <Button type="submit" disabled={isLoading || !inputValue.trim()}>
                <Send className="h-4 w-4" />
              </Button>
            </form>
            
            <div className="flex gap-2 mt-2 sm:hidden">
              <Button
                variant="outline"
                size="sm"
                onClick={handleTaskSummary}
                disabled={isLoading}
                className="flex-1"
              >
                <RefreshCw className="h-4 w-4 mr-1" />
                Summary
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleTaskSuggestions}
                disabled={isLoading}
                className="flex-1"
              >
                <Bot className="h-4 w-4 mr-1" />
                Suggestions
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}