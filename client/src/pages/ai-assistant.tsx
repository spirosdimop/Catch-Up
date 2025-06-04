import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Bot, User, Edit, Send, Loader2, Settings } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useAppSettings } from "@/lib/appSettingsContext";
import { PageTitle } from "@/components/ui/page-title";

interface Message {
  id: number;
  text: string;
  role: 'user' | 'assistant' | 'system';
  timestamp: Date;
}

type MessageRole = 'user' | 'assistant' | 'system';

interface CommandResult {
  status: 'success' | 'error' | 'needs_clarification';
  settings?: any;
  settings_error?: string;
  calendar?: any;
  calendar_error?: string;
  message?: string;
  message_error?: string;
  ask_user?: string;
  missing_fields?: string[];
  conversation_context?: string;
}

// Available LLM models
const AVAILABLE_MODELS = [
  { id: 'gpt-4o', name: 'GPT-4o', description: 'Latest OpenAI model with enhanced capabilities' },
  { id: 'gpt-4-turbo', name: 'GPT-4 Turbo', description: 'Fast and capable OpenAI model' },
  { id: 'gpt-3.5-turbo', name: 'GPT-3.5 Turbo', description: 'Fast and cost-effective model' },
  { id: 'claude-3-sonnet', name: 'Claude 3 Sonnet', description: 'Anthropic\'s balanced model' },
  { id: 'claude-3-opus', name: 'Claude 3 Opus', description: 'Anthropic\'s most capable model' }
];

function AIAssistant() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings, updateSettings, applyLanguage } = useAppSettings();
  
  // Assistant name modal state
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [nameInputValue, setNameInputValue] = useState(settings.assistantName || 'Assistant');
  
  // Model selection state
  const [selectedModel, setSelectedModel] = useState('gpt-4o');
  
  // Message state
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Create welcome message with the assistant's name
  const createWelcomeMessage = (assistantName: string) => {
    return {
      id: Date.now(),
      text: `Hi, I'm ${assistantName}, your personal assistant! I can help with settings, calendar events, and auto-response messages. How can I assist you today?`,
      role: 'assistant' as MessageRole,
      timestamp: new Date()
    };
  };
  
  // Load messages from localStorage or use default welcome message
  const [messages, setMessages] = useState<Message[]>(() => {
    const savedMessages = localStorage.getItem('aiAssistantMessages');
    if (savedMessages) {
      try {
        // Parse stored messages and convert timestamp strings back to Date objects
        const parsedMessages = JSON.parse(savedMessages);
        return parsedMessages.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
      } catch (error) {
        console.error('Failed to parse saved messages:', error);
        // Return default message if parsing fails
        return [createWelcomeMessage(settings.assistantName)];
      }
    }
    
    // Default welcome message for first-time users
    return [createWelcomeMessage(settings.assistantName)];
  });
  
  // Conversation context
  const [inClarificationMode, setInClarificationMode] = useState(false);
  const [originalMessage, setOriginalMessage] = useState("");
  
  // Store conversation context between sessions
  const [conversationContext, setConversationContext] = useState<string>(() => {
    // Try to load saved conversation context from localStorage
    const savedContext = localStorage.getItem('aiAssistantContext');
    return savedContext || ""; // Return empty string if no context saved
  });
  
  // Save messages to localStorage whenever they change
  useEffect(() => {
    // We need to convert Date objects to strings for JSON serialization
    const messagesToSave = messages.map(msg => ({
      ...msg,
      timestamp: msg.timestamp.toISOString() // Convert Date to ISO string
    }));
    
    localStorage.setItem('aiAssistantMessages', JSON.stringify(messagesToSave));
  }, [messages]);
  
  // Save conversation context to localStorage whenever it changes
  useEffect(() => {
    if (conversationContext) {
      localStorage.setItem('aiAssistantContext', conversationContext);
    }
  }, [conversationContext]);
  
  // Handle command submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Store the user's message
    const userMessage: Message = {
      id: Date.now(),
      text: inputValue,
      role: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    
    // If we're in clarification mode, store the follow-up response
    const messageToSend = inputValue;
    
    // Clear input and show loading state
    setInputValue("");
    setIsLoading(true);
    
    try {
      const response = await fetch('/api/command', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: messageToSend,
          conversationContext: conversationContext, // Send the context for better continuity
          model: selectedModel // Include selected model in the request
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process command');
      }
      
      const result: CommandResult = await response.json();
      
      // Handle clarification needed
      if (result.status === 'needs_clarification') {
        const clarificationMessage: Message = {
          id: Date.now() + 1,
          text: result.ask_user || "I need more information. Could you please provide more details?",
          role: 'assistant',
          timestamp: new Date()
        };
        
        setMessages(prev => [...prev, clarificationMessage]);
        setInClarificationMode(true);
        
        // Show what fields are missing
        if (result.missing_fields && result.missing_fields.length > 0) {
          const fieldsList = result.missing_fields.join(', ');
          const missingFieldsMessage: Message = {
            id: Date.now() + 2,
            text: `Missing information: ${fieldsList}`,
            role: 'system',
            timestamp: new Date()
          };
          
          setMessages(prev => [...prev, missingFieldsMessage]);
        }
        
        // Capture conversation context even in clarification mode
        if (result.conversation_context) {
          setConversationContext(result.conversation_context);
        }
        
        return;
      }
      
      // Handle successful command processing
      let responseText = "I've processed your request:";
      
      // Format the response based on what was processed
      if (result.settings) {
        // Apply settings using the AppSettingsContext
        try {
          // Update settings through the context
          updateSettings(result.settings);
          
          // Ensure language is immediately applied if language was changed
          if (result.settings.language) {
            // Apply language change to the document
            applyLanguage();
          }
          
          console.log('Updated app settings:', result.settings);
          
          // Show which settings were updated
          responseText += `\n\n✓ Settings updated: ${Object.keys(result.settings).join(', ')}`;
          
          // Special message for language changes
          if (result.settings.language) {
            const languageNames: Record<string, string> = {
              'en': 'English',
              'es': 'Spanish',
              'fr': 'French',
              'de': 'German',
              'zh': 'Chinese',
              'ja': 'Japanese'
            };
            
            const languageName = languageNames[result.settings.language] || result.settings.language;
            responseText += `\n   Language changed to ${languageName}`;
          }
        } catch (error) {
          console.error('Error updating settings:', error);
          responseText += `\n\n✓ Settings processed, but there was an error applying them: ${Object.keys(result.settings).join(', ')}`;
        }
      } else if (result.settings_error) {
        responseText += `\n\n⚠️ ${result.settings_error}`;
      }
      
      if (result.calendar) {
        const calendar = result.calendar;
        
        if (calendar.action === 'create') {
          // Convert time to a human-readable format with 12-hour clock
          const startTime = new Date(calendar.start_time!);
          const formattedStartTime = startTime.toLocaleString('en-US', {
            weekday: 'long', 
            month: 'long', 
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
          });
          
          responseText += `\n\n✓ Event created: "${calendar.event_title}" on ${formattedStartTime}`;
          
          if (calendar.event_id) {
            responseText += `\n   Event ID: ${calendar.event_id} (saved in calendar)`;
            
            // Add a direct button to view the calendar
            setTimeout(() => {
              // After the message is displayed, invalidate the events query to refresh data
              queryClient.invalidateQueries({ queryKey: ['/api/events'] });
            }, 500);
          } else {
            responseText += `\n   ⚠️ Note: Event may not have been saved to calendar properly`;
          }
          
        } else if (calendar.action === 'reschedule') {
          responseText += `\n\n✓ Event rescheduled: "${calendar.event_title}"`;
          setTimeout(() => {
            queryClient.invalidateQueries({ queryKey: ['/api/events'] });
          }, 500);
        } else if (['cancel', 'delete'].includes(calendar.action)) {
          // Handle both cancel and delete actions the same way
          const status = calendar.status as 'deleted' | 'conflict' | 'cancelled' | 'confirmed' | 'pending';
          if (status === 'deleted') {
            responseText += `\n\n✓ Event deleted: "${calendar.event_title || 'Specified event'}"`;
            if (calendar.event_id) {
              responseText += ` (ID: ${calendar.event_id})`;
            }
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ['/api/events'] });
            }, 500);
          } else if (status === 'conflict') {
            responseText += `\n\n⚠️ Could not delete event: ${calendar.notes}`;
          } else {
            responseText += `\n\n✓ Event canceled: "${calendar.event_title}"`;
            setTimeout(() => {
              queryClient.invalidateQueries({ queryKey: ['/api/events'] });
            }, 500);
          }
        } else if (calendar.action === 'suggest_times') {
          responseText += `\n\n✓ Schedule suggestions created`;
        }
        
        // Add a button to view the calendar that will appear when rendered
        responseText += `\n\n✓ [View in Calendar](/calendar)`;
      } else if (result.calendar_error) {
        responseText += `\n\n⚠️ ${result.calendar_error}`;
      }
      
      if (result.message) {
        responseText += `\n\n✓ Auto-response message created: "${result.message}"`;
      } else if (result.message_error) {
        responseText += `\n\n⚠️ ${result.message_error}`;
      }
      
      // Add the complete response
      const assistantMessage: Message = {
        id: Date.now() + 1,
        text: responseText,
        role: 'assistant',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, assistantMessage]);
      
      // Exit clarification mode
      setInClarificationMode(false);
      setOriginalMessage("");
      
      // Update the conversation context if returned from server
      if (result.conversation_context) {
        setConversationContext(result.conversation_context);
      }
      
    } catch (error) {
      console.error('Error processing command:', error);
      
      // Add error message
      const errorMessage: Message = {
        id: Date.now() + 1,
        text: "Sorry, I couldn't process your request. Please try again.",
        role: 'system',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Error",
        description: "Failed to process your command. Please try again.",
        variant: "destructive",
      });
      
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <div className="page-title">
        <PageTitle 
          title="AI Assistant" 
          description="Ask for anything - settings, calendar events, or auto-responses - in one place" 
          icon={<Bot className="h-6 w-6 text-primary" />}
        />
      </div>
      
      <Card className="h-[calc(100vh-200px)] flex flex-col">
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription>
              Use natural language to control settings, create events, or generate responses
            </CardDescription>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 items-start sm:items-center">
            <div className="flex items-center gap-2">
              <Settings className="h-4 w-4 text-gray-500" />
              <Select value={selectedModel} onValueChange={setSelectedModel}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select AI Model" />
                </SelectTrigger>
                <SelectContent>
                  {AVAILABLE_MODELS.map((model) => (
                    <SelectItem key={model.id} value={model.id}>
                      <div className="flex flex-col">
                        <span className="font-medium">{model.name}</span>
                        <span className="text-xs text-gray-500">{model.description}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setMessages([createWelcomeMessage(settings.assistantName)]);
                  setConversationContext("");
                  setInClarificationMode(false);
                  setOriginalMessage("");
                }}
              >
                <Bot className="h-4 w-4 mr-1" />
                New Chat
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setNameModalOpen(true)}
              >
                <Edit className="h-4 w-4 mr-1" />
                Name Assistant
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.removeItem('aiAssistantMessages');
                  localStorage.removeItem('aiAssistantContext');
                  setMessages([createWelcomeMessage(settings.assistantName)]);
                  setConversationContext("");
                  setInClarificationMode(false);
                  setOriginalMessage("");
                  toast({
                    title: "Conversation history cleared",
                    description: "Your conversation history has been removed from local storage.",
                    duration: 3000,
                  });
                }}
              >
                Clear History
              </Button>
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="flex-1 overflow-y-auto space-y-4 pb-4">
          <div className="space-y-4">
            {messages.map(message => (
              <div 
                key={message.id}
                className={`flex items-start gap-3 ${message.role === 'user' ? 'ml-auto flex-row-reverse' : ''} ${message.role === 'system' ? 'ml-8' : ''}`}
              >
                {message.role !== 'system' && (
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {message.role === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                )}
                <div 
                  className={`rounded-lg px-4 py-2 max-w-[70%] ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : message.role === 'system'
                      ? 'bg-muted text-muted-foreground text-sm'
                      : 'bg-muted'
                  }`}
                >
                  <p className="whitespace-pre-wrap">{message.text}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString()}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback>
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted rounded-lg px-4 py-2">
                  <div className="flex items-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin" />
                    <span>Thinking...</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={inClarificationMode ? "Please provide more details..." : "Ask me anything..."}
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !inputValue.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </Card>
      
      {/* Assistant Name Modal */}
      <Dialog open={nameModalOpen} onOpenChange={setNameModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Name Your Assistant</DialogTitle>
            <DialogDescription>
              Give your AI assistant a custom name to personalize your experience.
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <Input
              value={nameInputValue}
              onChange={(e) => setNameInputValue(e.target.value)}
              placeholder="Enter assistant name..."
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNameModalOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              // Update the assistant name in settings
              updateSettings({ assistantName: nameInputValue });
              
              // Update the welcome message with the new name
              const updatedMessages = messages.map(msg => {
                if (msg.role === 'assistant' && msg.text.includes("Hi, I'm")) {
                  return {
                    ...msg,
                    text: `Hi, I'm ${nameInputValue}, your personal assistant! I can help with settings, calendar events, and auto-response messages. How can I assist you today?`
                  };
                }
                return msg;
              });
              
              setMessages(updatedMessages);
              setNameModalOpen(false);
              
              toast({
                title: "Assistant renamed",
                description: `Your assistant is now called ${nameInputValue}`,
                duration: 3000,
              });
            }}>
              Save Name
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

export default AIAssistant;