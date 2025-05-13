import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Bot, Calendar, Send, User, Clock, AlertCircle, Settings, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";

// Message types
type Message = {
  id: number;
  text: string;
  sender: 'user' | 'ai';
  timestamp: Date;
}

// Response types from OpenAI endpoints
type SchedulingAction = 'create' | 'reschedule' | 'cancel' | 'suggest_times';
type SchedulingStatus = 'confirmed' | 'pending' | 'conflict' | 'cancelled';

interface SchedulingResponse {
  action: SchedulingAction;
  event_title?: string;
  start_time?: string;
  end_time?: string;
  status: SchedulingStatus;
  notes: string;
  event_id?: number;
}

export default function AIAssistant() {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("chat");
  
  // General chat state
  const [inputValue, setInputValue] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 1,
      text: "Hi there! I'm your AI assistant. How can I help you with your freelance business today?",
      sender: 'ai',
      timestamp: new Date()
    }
  ]);
  
  // Scheduling assistant state
  const [schedulingRequest, setSchedulingRequest] = useState("");
  const [isProcessingScheduling, setIsProcessingScheduling] = useState(false);
  const [schedulingResponse, setSchedulingResponse] = useState<SchedulingResponse | null>(null);
  
  // Schedule summary state
  const [timeframe, setTimeframe] = useState("upcoming week");
  const [isFetchingSummary, setIsFetchingSummary] = useState(false);
  const [scheduleSummary, setScheduleSummary] = useState("");
  
  // App settings state
  const [settingsInput, setSettingsInput] = useState("");
  const [isProcessingSettings, setIsProcessingSettings] = useState(false);
  const [settingsResult, setSettingsResult] = useState<Record<string, any> | null>(null);
  
  // Fetch user's calendar events for reference
  const { data: events, isLoading: isLoadingEvents } = useQuery({
    queryKey: ['/api/events'],
    refetchOnWindowFocus: false,
  });

  // Handle general chat submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!inputValue.trim()) return;
    
    // Check if it looks like a scheduling request
    const schedulingKeywords = ['schedule', 'meeting', 'calendar', 'appointment', 'book'];
    const isSchedulingRequest = schedulingKeywords.some(keyword => 
      inputValue.toLowerCase().includes(keyword)
    );
    
    // Check if it looks like a settings request
    const settingsKeywords = ['settings', 'preferences', 'language', 'status', 'availability'];
    const isSettingsRequest = settingsKeywords.some(keyword => 
      inputValue.toLowerCase().includes(keyword)
    );
    
    // If it's a scheduling request, redirect to scheduling tab
    if (isSchedulingRequest && activeTab === 'chat') {
      // Add user message
      const userMessage: Message = {
        id: messages.length + 1,
        text: inputValue,
        sender: 'user',
        timestamp: new Date()
      };
      
      // Add AI redirect message
      const redirectMessage: Message = {
        id: messages.length + 2,
        text: "I notice you want to schedule something. Let me switch you to the Scheduling Assistant tab to help with that.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage, redirectMessage]);
      setInputValue("");
      
      // Switch to scheduling tab and set the input
      setActiveTab('scheduling');
      setSchedulingRequest(inputValue);
      return;
    }
    
    // If it's a settings request, redirect to settings tab
    if (isSettingsRequest && activeTab === 'chat') {
      // Add user message
      const userMessage: Message = {
        id: messages.length + 1,
        text: inputValue,
        sender: 'user',
        timestamp: new Date()
      };
      
      // Add AI redirect message
      const redirectMessage: Message = {
        id: messages.length + 2,
        text: "I see you want to change your settings. Let me switch you to the App Settings tab to help with that.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, userMessage, redirectMessage]);
      setInputValue("");
      
      // Switch to settings tab and set the input
      setActiveTab('settings');
      setSettingsInput(inputValue);
      return;
    }
    
    // Add user message for regular chat
    const userMessage: Message = {
      id: messages.length + 1,
      text: inputValue,
      sender: 'user',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    
    // Create a temporary message to show that the AI is typing
    const tempId = Date.now();
    const typingMessage: Message = {
      id: tempId,
      text: "Thinking...",
      sender: 'ai',
      timestamp: new Date()
    };
    
    setMessages(prev => [...prev, typingMessage]);
    
    try {
      // Call OpenAI API through our backend
      const response = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: userMessage.text,
          history: messages.map(msg => ({
            role: msg.sender === 'user' ? 'user' : 'assistant',
            content: msg.text
          }))
        })
      });
      
      if (!response.ok) {
        throw new Error('Failed to get AI response');
      }
      
      const data = await response.json();
      
      // Remove the temporary typing message
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      
      // Add the real AI response
      const aiMessage: Message = {
        id: messages.length + 2,
        text: data.message || "I'm sorry, I couldn't process that request.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, aiMessage]);
    } catch (error) {
      console.error('Error getting AI response:', error);
      
      // Remove the temporary typing message
      setMessages(prev => prev.filter(msg => msg.id !== tempId));
      
      // Add error message
      const errorMessage: Message = {
        id: messages.length + 2,
        text: "Sorry, I'm having trouble connecting. Please try again later.",
        sender: 'ai',
        timestamp: new Date()
      };
      
      setMessages(prev => [...prev, errorMessage]);
      
      toast({
        title: "Connection Error",
        description: "Failed to get a response from the AI assistant.",
        variant: "destructive"
      });
    }
  };
  
  // Handle scheduling request submission
  const handleSchedulingRequest = async () => {
    if (!schedulingRequest.trim()) {
      toast({
        title: "Empty request",
        description: "Please enter a scheduling request to process.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessingScheduling(true);
    setSchedulingResponse(null);
    
    try {
      const response = await fetch('/api/ai/scheduling', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          request: schedulingRequest,
          schedule: events, // Pass the user's existing schedule
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process scheduling request');
      }
      
      const data = await response.json();
      setSchedulingResponse(data);
      
      // Show confirmation toast based on action
      if (data.action === 'create' && data.status === 'confirmed') {
        toast({
          title: "Event Created",
          description: `Event "${data.event_title}" has been scheduled.`,
        });
      }
    } catch (error) {
      console.error('Error processing scheduling request:', error);
      toast({
        title: "Error",
        description: "Failed to process your scheduling request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingScheduling(false);
    }
  };
  
  // Handle schedule summary request
  const handleScheduleSummary = async () => {
    setIsFetchingSummary(true);
    setScheduleSummary("");
    
    try {
      const response = await fetch('/api/ai/schedule-summary', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          timeframe: timeframe,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to generate schedule summary');
      }
      
      const { summary } = await response.json();
      setScheduleSummary(summary || "No scheduled events found for this timeframe.");
    } catch (error) {
      console.error('Error generating schedule summary:', error);
      toast({
        title: "Error",
        description: "Failed to generate your schedule summary. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsFetchingSummary(false);
    }
  };
  
  // Handle app settings submission
  const handleAppSettings = async () => {
    if (!settingsInput.trim()) {
      toast({
        title: "Empty request",
        description: "Please enter instructions for app settings changes.",
        variant: "destructive",
      });
      return;
    }
    
    setIsProcessingSettings(true);
    setSettingsResult(null);
    
    try {
      const response = await fetch('/api/ai/app-settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: settingsInput
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to process app settings');
      }
      
      const result = await response.json();
      setSettingsResult(result);
      
      toast({
        title: "Settings Processed",
        description: "Your app settings have been successfully updated.",
      });
    } catch (error) {
      console.error('Error processing app settings:', error);
      toast({
        title: "Error",
        description: "Failed to process your app settings request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsProcessingSettings(false);
    }
  };

  return (
    <div className="space-y-6 p-6">
      <PageTitle 
        title="AI Assistant" 
        description="Get help and insights for your freelance business" 
        icon={<Bot className="h-6 w-6 text-primary" />}
      />
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="chat">
            <Bot className="h-4 w-4 mr-2" />
            General Assistant
          </TabsTrigger>
          <TabsTrigger value="scheduling">
            <Calendar className="h-4 w-4 mr-2" />
            Scheduling Assistant
          </TabsTrigger>
          <TabsTrigger value="summary">
            <Clock className="h-4 w-4 mr-2" />
            Schedule Summary
          </TabsTrigger>
          <TabsTrigger value="settings">
            <Settings className="h-4 w-4 mr-2" />
            App Settings
          </TabsTrigger>
        </TabsList>
        
        {/* General Chat Tab */}
        <TabsContent value="chat" className="mt-0">
          <Card className="h-[calc(100vh-300px)] flex flex-col">
            <CardHeader>
              <CardTitle>Virtual Assistant</CardTitle>
              <CardDescription>
                Ask for advice, guidance, or information about managing your freelance business
              </CardDescription>
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
        </TabsContent>
        
        {/* Scheduling Assistant Tab */}
        <TabsContent value="scheduling" className="mt-0">
          <Card className="h-[calc(100vh-300px)] flex flex-col">
            <CardHeader>
              <CardTitle>Scheduling Assistant</CardTitle>
              <CardDescription>
                Let AI help you schedule meetings and appointments by analyzing your calendar
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Create Calendar Event</h3>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                  <p className="text-sm text-yellow-800 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Enter meeting details below to create a calendar event. Be specific about who, when, and what the meeting is about.
                  </p>
                </div>
                <Textarea 
                  placeholder="Example: 'Schedule a meeting with George tomorrow at 2pm to discuss project progress'"
                  value={schedulingRequest}
                  onChange={(e) => setSchedulingRequest(e.target.value)}
                  className="h-32 mb-4"
                />
                <Button 
                  onClick={handleSchedulingRequest} 
                  className="w-full"
                  disabled={isProcessingScheduling || !schedulingRequest.trim()}
                >
                  {isProcessingScheduling ? "Creating Event..." : "Add to Calendar"}
                </Button>
              </div>
              
              {schedulingResponse && (
                <div className="border rounded-lg p-4 mt-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    {schedulingResponse.action === 'create' && (
                      <>
                        <span className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs mr-2">
                          Event Created
                        </span>
                        <span>{schedulingResponse.event_title}</span>
                      </>
                    )}
                    {schedulingResponse.action === 'suggest_times' && (
                      <>
                        <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs mr-2">
                          Suggestions
                        </span>
                        <span>Available Time Slots</span>
                      </>
                    )}
                    {schedulingResponse.action === 'reschedule' && (
                      <>
                        <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded text-xs mr-2">
                          Rescheduled
                        </span>
                        <span>{schedulingResponse.event_title}</span>
                      </>
                    )}
                    {schedulingResponse.action === 'cancel' && (
                      <>
                        <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-xs mr-2">
                          Cancelled
                        </span>
                        <span>{schedulingResponse.event_title}</span>
                      </>
                    )}
                  </h3>
                  
                  {(schedulingResponse.start_time && schedulingResponse.end_time) && (
                    <div className="flex items-center text-sm text-muted-foreground mb-2">
                      <Calendar className="h-4 w-4 mr-1" />
                      <span>
                        {new Date(schedulingResponse.start_time).toLocaleDateString()} | 
                        {new Date(schedulingResponse.start_time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})} - 
                        {new Date(schedulingResponse.end_time).toLocaleTimeString([], {hour: '2-digit', minute: '2-digit'})}
                      </span>
                    </div>
                  )}
                  
                  <div className="text-sm mt-3">
                    <p>{schedulingResponse.notes}</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Schedule Summary Tab */}
        <TabsContent value="summary" className="mt-0">
          <Card className="h-[calc(100vh-300px)] flex flex-col">
            <CardHeader>
              <CardTitle>Schedule Summary</CardTitle>
              <CardDescription>
                Get a summary and insights about your upcoming schedule
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Select Timeframe</h3>
                <div className="flex gap-2 mb-4">
                  <Input 
                    placeholder="e.g., today, this week, next month"
                    value={timeframe}
                    onChange={(e) => setTimeframe(e.target.value)}
                    className="flex-1"
                  />
                  <Button 
                    onClick={handleScheduleSummary} 
                    disabled={isFetchingSummary || !timeframe.trim()}
                  >
                    {isFetchingSummary ? "Generating..." : "Generate Summary"}
                  </Button>
                </div>
              </div>
              
              {isLoadingEvents && (
                <div className="text-center py-8 text-muted-foreground">
                  Loading your calendar data...
                </div>
              )}
              
              {scheduleSummary && (
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <Calendar className="h-5 w-5 mr-2 text-primary" />
                    Schedule Summary for {timeframe}
                  </h3>
                  <div className="mt-2 whitespace-pre-line">
                    {scheduleSummary}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* App Settings Tab */}
        <TabsContent value="settings" className="mt-0">
          <Card className="h-[calc(100vh-300px)] flex flex-col">
            <CardHeader>
              <CardTitle>App Settings Control</CardTitle>
              <CardDescription>
                Control your app settings using natural language
              </CardDescription>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto">
              <div className="mb-6">
                <h3 className="text-lg font-semibold mb-2">Change Settings</h3>
                <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-md mb-4">
                  <p className="text-sm text-yellow-800 flex items-center">
                    <AlertCircle className="h-4 w-4 mr-2" />
                    Describe the settings you want to change in natural language. The AI will convert your request into the appropriate settings.
                  </p>
                </div>
                
                <div className="mb-4 space-y-2">
                  <h4 className="text-sm font-medium">Supported Settings:</h4>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="outline">availability</Badge>
                    <Badge variant="outline">auto_reply_enabled</Badge>
                    <Badge variant="outline">language</Badge>
                    <Badge variant="outline">preferred_route_type</Badge>
                    <Badge variant="outline">notification_preferences</Badge>
                    <Badge variant="outline">default_reply_message</Badge>
                  </div>
                </div>
                
                <Textarea 
                  placeholder="Example: 'Set my status to busy and enable auto-reply with the message that I'll be back tomorrow'"
                  value={settingsInput}
                  onChange={(e) => setSettingsInput(e.target.value)}
                  className="h-32 mb-4"
                />
                <Button 
                  onClick={handleAppSettings} 
                  className="w-full"
                  disabled={isProcessingSettings || !settingsInput.trim()}
                >
                  {isProcessingSettings ? "Processing..." : "Update Settings"}
                </Button>
              </div>
              
              {settingsResult && (
                <div className="border rounded-lg p-4 mt-4">
                  <h3 className="text-lg font-semibold mb-2 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                    Settings Updated
                  </h3>
                  
                  <div className="mt-4 bg-gray-50 p-4 rounded-md">
                    <h4 className="text-sm font-medium mb-2">Changed Settings:</h4>
                    <pre className="text-sm bg-black text-white p-4 rounded-md overflow-auto">
                      {JSON.stringify(settingsResult, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}