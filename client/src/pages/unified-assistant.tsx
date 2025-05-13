import { useState } from "react";
import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, Send, User, Calendar, Settings, MessageSquare, ArrowRight, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";

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
    action: 'create' | 'reschedule' | 'cancel' | 'suggest_times';
    event_title?: string;
    start_time?: string;
    end_time?: string;
    status: 'confirmed' | 'pending' | 'conflict' | 'cancelled';
    notes: string;
    event_id?: number;
  };
  calendar_error?: string;
  message?: string;
  message_error?: string;
}

export default function UnifiedAssistant() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Message state
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Welcome to the unified assistant! I can help with settings, calendar events, and auto-response messages. How can I assist you today?",
      role: 'assistant',
      timestamp: new Date()
    }
  ]);
  
  // Conversation context
  const [inClarificationMode, setInClarificationMode] = useState(false);
  const [originalMessage, setOriginalMessage] = useState("");
  
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
          message: messageToSend
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
        
        return;
      }
      
      // Handle successful command processing
      let responseText = "I've processed your request:";
      
      // Format the response based on what was processed
      if (result.settings) {
        // Apply settings to localStorage
        try {
          const currentSettings = localStorage.getItem('appSettings') 
            ? JSON.parse(localStorage.getItem('appSettings') || '{}')
            : {};
            
          const newSettings = {
            ...currentSettings,
            ...result.settings
          };
          
          localStorage.setItem('appSettings', JSON.stringify(newSettings));
          console.log('Updated app settings in localStorage:', newSettings);
          
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
          console.error('Error updating settings in localStorage:', error);
          responseText += `\n\n✓ Settings processed, but there was an error saving them locally: ${Object.keys(result.settings).join(', ')}`;
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
        } else if (calendar.action === 'cancel') {
          responseText += `\n\n✓ Event canceled: "${calendar.event_title}"`;
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
          title="Unified Assistant" 
          description="Ask for anything - settings, calendar events, or auto-responses - in one place" 
          icon={<Bot className="h-6 w-6 text-primary" />}
        />
      </div>
      
      <Card className="h-[calc(100vh-200px)] flex flex-col">
        <CardHeader>
          <CardTitle>Unified Command Interface</CardTitle>
          <CardDescription>
            Use natural language to control settings, create events, or generate responses
          </CardDescription>
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
                  className={`p-3 rounded-lg max-w-[80%] ${
                    message.role === 'assistant' 
                      ? 'bg-muted' 
                      : message.role === 'user' 
                        ? 'bg-primary text-primary-foreground' 
                        : 'bg-yellow-100 text-yellow-800 text-sm'
                  }`}
                >
                  <div className="whitespace-pre-line">
                    {/* Process message text to convert markdown-style links to actual links */}
                    {message.text.split(/(\[.*?\]\(.*?\))/).map((part, i) => {
                      // Check if this part is a markdown link [text](url)
                      const linkMatch = part.match(/\[(.*?)\]\((.*?)\)/);
                      if (linkMatch) {
                        const [_, text, url] = linkMatch;
                        return (
                          <Link key={i} href={url} className="text-blue-500 hover:underline hover:text-blue-700">
                            {text}
                          </Link>
                        );
                      }
                      // Otherwise just return the text
                      return part;
                    })}
                  </div>
                  
                  {/* Add badges to indicate what was processed */}
                  {message.role === 'assistant' && message.text.includes('processed your request') && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {message.text.includes('Settings updated') && (
                        <Badge variant="outline" className="bg-blue-100 text-blue-800 hover:bg-blue-100">
                          <Settings className="h-3 w-3 mr-1" />
                          Settings
                        </Badge>
                      )}
                      {message.text.includes('Event created') && (
                        <Badge variant="outline" className="bg-green-100 text-green-800 hover:bg-green-100">
                          <Calendar className="h-3 w-3 mr-1" />
                          Calendar
                        </Badge>
                      )}
                      {message.text.includes('Auto-response') && (
                        <Badge variant="outline" className="bg-purple-100 text-purple-800 hover:bg-purple-100">
                          <MessageSquare className="h-3 w-3 mr-1" />
                          Message
                        </Badge>
                      )}
                    </div>
                  )}
                  
                  <p className={`text-xs mt-1 ${
                    message.role === 'assistant' 
                      ? 'text-muted-foreground' 
                      : message.role === 'user' 
                        ? 'text-primary-foreground/70' 
                        : 'text-yellow-600'
                  }`}>
                    {message.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                  </p>
                </div>
              </div>
            ))}
            
            {isLoading && (
              <div className="flex items-center justify-center py-4">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
                <span className="ml-2 text-sm text-muted-foreground">Processing your request...</span>
              </div>
            )}
          </div>
        </CardContent>
        
        <div className="p-4 mt-auto border-t">
          <form onSubmit={handleSubmit} className="flex gap-2">
            <Input 
              placeholder={inClarificationMode 
                ? "Please provide the requested information..." 
                : "Ask for anything - settings, calendar, auto-responses..."
              }
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              className="flex-1"
              disabled={isLoading}
            />
            <Button type="submit" disabled={isLoading || !inputValue.trim()}>
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </form>
          
          {inClarificationMode && (
            <p className="text-xs text-muted-foreground mt-2 flex items-center">
              <ArrowRight className="h-3 w-3 mr-1" />
              I need more details to complete your request
            </p>
          )}
        </div>
      </Card>
    </div>
  );
}