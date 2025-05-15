import { useState, useEffect, useRef } from "react";
import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, Send, User, Calendar, Settings, MessageSquare, ArrowRight, Loader2, Edit, Check } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { useAppSettings } from "@/lib/appSettingsContext";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";

// Message types
type MessageRole = 'user' | 'assistant' | 'system';

interface Message {
  id: number;
  text: string;
  role: MessageRole;
  timestamp: Date;
}

interface CommandResult {
  status: 'success' | 'needs_clarification';
  ask_user?: string;
  missing_fields?: string[];
  settings?: Record<string, any>;
  settings_error?: string;
  calendar?: {
    action: 'create' | 'reschedule' | 'cancel' | 'delete' | 'suggest_times';
    event_title?: string;
    start_time?: string;
    end_time?: string;
    status: 'confirmed' | 'pending' | 'conflict' | 'cancelled' | 'deleted';
    notes: string;
    event_id?: number;
  };
  calendar_error?: string;
  message?: string;
  message_error?: string;
  conversation_context?: string; // For maintaining conversation continuity between sessions
}

export default function AIAssistant() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { settings, updateSettings, applyLanguage } = useAppSettings();
  
  // Assistant name modal state
  const [nameModalOpen, setNameModalOpen] = useState(false);
  const [nameInputValue, setNameInputValue] = useState(settings.assistantName || 'Assistant');
  
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
          conversationContext: conversationContext // Send the context for better continuity
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
        <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
          <div>
            <CardTitle>AI Assistant</CardTitle>
            <CardDescription>
              Use natural language to control settings, create events, or generate responses
            </CardDescription>
          </div>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Reset conversation but keep in localStorage
                setMessages([createWelcomeMessage(settings.assistantName)]);
                // Reset context
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
                // Remove from localStorage
                localStorage.removeItem('aiAssistantMessages');
                localStorage.removeItem('aiAssistantContext');
                
                // Reset to default welcome message
                setMessages([
                  {
                    id: Date.now(),
                    text: "Welcome to the AI assistant! I can help with settings, calendar events, and auto-response messages. How can I assist you today?",
                    role: 'assistant',
                    timestamp: new Date()
                  }
                ]);
                
                // Reset conversation context
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
                    <AvatarFallback className={message.role === 'assistant' ? "bg-primary text-primary-foreground" : ""}>
                      {message.role === 'assistant' ? <Bot className="h-4 w-4" /> : <User className="h-4 w-4" />}
                    </AvatarFallback>
                  </Avatar>
                )}
                
                <div 
                  className={`rounded-lg px-3 py-2 max-w-[85%] break-words ${
                    message.role === 'user' 
                      ? 'bg-primary text-primary-foreground' 
                      : message.role === 'system'
                        ? 'bg-secondary/50 text-muted-foreground text-sm'
                        : 'bg-secondary'
                  }`}
                >
                  {/* To make links clickable */}
                  {message.text.split('\n').map((line, i) => {
                    if (line.includes('[View in Calendar](/calendar)')) {
                      return (
                        <div key={i} className="mt-2">
                          <Link href="/calendar">
                            <Button variant="outline" size="sm" className="flex items-center gap-1">
                              <Calendar className="h-3.5 w-3.5" />
                              View in Calendar
                              <ArrowRight className="h-3 w-3 ml-1" />
                            </Button>
                          </Link>
                        </div>
                      );
                    }
                    
                    // Highlight commands with ✓ prefix
                    if (line.startsWith('✓')) {
                      return (
                        <p key={i} className={`${i > 0 ? 'mt-2' : ''} text-emerald-500 dark:text-emerald-400`}>
                          {line}
                        </p>
                      );
                    }
                    
                    // Highlight warnings with ⚠️ prefix
                    if (line.includes('⚠️')) {
                      return (
                        <p key={i} className={`${i > 0 ? 'mt-2' : ''} text-amber-500 dark:text-amber-400`}>
                          {line}
                        </p>
                      );
                    }
                    
                    return <p key={i} className={i > 0 ? 'mt-2' : ''}>{line}</p>;
                  })}
                </div>
                
                {message.role !== 'system' && (
                  <div className="text-xs text-muted-foreground whitespace-nowrap mt-1">
                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </div>
                )}
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-start gap-3">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    <Bot className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-secondary text-secondary-foreground rounded-lg px-4 py-3 flex items-center">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span>Processing...</span>
                </div>
              </div>
            )}
          </div>
        </CardContent>
        
        <div className="p-4 border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input
              className="flex-1"
              placeholder={inClarificationMode 
                ? "Provide the requested information..." 
                : "Type your command or question..."
              }
              value={inputValue}
              onChange={e => setInputValue(e.target.value)}
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !inputValue.trim()}>
              {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </form>
          <div className="mt-2 text-xs text-muted-foreground">
            Try: "Change my language to Spanish" or "Schedule a client meeting tomorrow at 3pm"
          </div>
        </div>
      </Card>
    </div>
  );
}