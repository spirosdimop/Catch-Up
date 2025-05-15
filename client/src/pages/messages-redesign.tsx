import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import ComposeDialog from '@/components/message/compose-dialog';
import AutoResponses from '@/components/message/auto-responses';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Phone, 
  Calendar, 
  X, 
  Check, 
  AlertTriangle, 
  MessageSquare, 
  Plus, 
  Search,
  Clock,
  ArrowRight,
  Settings
} from 'lucide-react';
import { apiRequest } from '@/lib/queryClient';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

// Interface for message data
interface Message {
  id: number;
  type: 'missed_call' | 'reschedule' | 'cancellation' | 'confirmation' | 'emergency';
  sender: string;
  senderAvatar?: string;
  content: string;
  timestamp: Date;
  read: boolean;
  priority?: 'low' | 'medium' | 'high';
}

const MessagesRedesign = () => {
  // State for dialogs
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [isAutoResponsesOpen, setIsAutoResponsesOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  // Query for messages
  const { data: messages = [], isLoading } = useQuery<Message[], Error>({
    queryKey: ['/api/messages'],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", '/api/messages');
        const data = await response.json();
        return Array.isArray(data) ? data.map((message: any) => ({
          ...message,
          timestamp: new Date(message.timestamp)
        })) : [];
      } catch (error) {
        console.error('Failed to fetch messages', error);
        // Fallback to empty array instead of mock data
        return [];
      }
    }
  });

  // Filter messages based on search query and active tab
  const filteredMessages = messages.filter(message => {
    const matchesSearch = message.content.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          message.sender.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesTab = activeTab === 'all' || message.type === activeTab;
    return matchesSearch && matchesTab;
  });

  // Group messages by type
  const messagesByType = {
    missed_call: filteredMessages.filter(m => m.type === 'missed_call'),
    reschedule: filteredMessages.filter(m => m.type === 'reschedule'),
    cancellation: filteredMessages.filter(m => m.type === 'cancellation'),
    confirmation: filteredMessages.filter(m => m.type === 'confirmation'),
    emergency: filteredMessages.filter(m => m.type === 'emergency'),
  };

  // Render message card based on type
  const renderMessageCard = (message: Message) => {
    // Icon based on message type
    const getIcon = () => {
      switch (message.type) {
        case 'missed_call': return <Phone className="h-4 w-4" />;
        case 'reschedule': return <Calendar className="h-4 w-4" />;
        case 'cancellation': return <X className="h-4 w-4" />;
        case 'confirmation': return <Check className="h-4 w-4" />;
        case 'emergency': return <AlertTriangle className="h-4 w-4" />;
        default: return <MessageSquare className="h-4 w-4" />;
      }
    };

    // Color based on message type
    const getColor = () => {
      switch (message.type) {
        case 'missed_call': return 'bg-blue-100 text-blue-800';
        case 'reschedule': return 'bg-purple-100 text-purple-800';
        case 'cancellation': return 'bg-red-100 text-red-800';
        case 'confirmation': return 'bg-green-100 text-green-800';
        case 'emergency': return 'bg-amber-100 text-amber-800';
        default: return 'bg-gray-100 text-gray-800';
      }
    };

    // Title based on message type
    const getTitle = () => {
      switch (message.type) {
        case 'missed_call': return 'Missed Call';
        case 'reschedule': return 'Reschedule Request';
        case 'cancellation': return 'Cancellation';
        case 'confirmation': return 'Confirmation';
        case 'emergency': return 'Emergency Alert';
        default: return 'Message';
      }
    };

    return (
      <div key={message.id} className={`p-4 mb-3 rounded-lg ${!message.read ? 'bg-white' : 'bg-gray-50'} border border-gray-200 shadow-sm hover:shadow-md transition-shadow`}>
        <div className="flex items-start gap-3">
          <Avatar className="h-10 w-10 shrink-0">
            <AvatarImage src={message.senderAvatar} alt={message.sender} />
            <AvatarFallback>{message.sender.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between mb-1">
              <div className="flex items-center gap-2">
                <h3 className="font-medium text-sm text-gray-900">{message.sender}</h3>
                <Badge variant="outline" className={`text-xs px-2 py-0 ${getColor()}`}>
                  {getTitle()}
                </Badge>
              </div>
              <span className="text-xs text-gray-500">
                {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </span>
            </div>
            <p className="text-sm text-gray-600 mb-2 line-clamp-2">{message.content}</p>
            <div className="flex justify-end">
              <Button variant="ghost" size="sm" className="text-xs px-2">
                Reply <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-white text-[#0A2540] p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Message Center</h1>
      
      {/* Search, filters, and auto-responses button */}
      <div className="mb-6 flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input 
            placeholder="Search messages..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white border-gray-200 text-[#0A2540] placeholder:text-gray-400"
          />
        </div>
        
        <Button
          onClick={() => setIsAutoResponsesOpen(true)}
          variant="outline"
          className="bg-white border-gray-200 text-[#0A2540] hover:bg-gray-50"
        >
          <Settings className="mr-2 h-4 w-4" />
          Manage Auto-Responses
        </Button>
        
        <Tabs 
          defaultValue="all" 
          value={activeTab} 
          onValueChange={setActiveTab}
          className="w-full md:w-auto"
        >
          <TabsList className="w-full md:w-auto bg-gray-100">
            <TabsTrigger value="all" className="text-sm data-[state=active]:bg-white">All</TabsTrigger>
            <TabsTrigger value="missed_call" className="text-sm data-[state=active]:bg-white">Calls</TabsTrigger>
            <TabsTrigger value="reschedule" className="text-sm data-[state=active]:bg-white">Reschedule</TabsTrigger>
            <TabsTrigger value="emergency" className="text-sm data-[state=active]:bg-white">Emergency</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Message categories */}
      <div className="grid grid-cols-1 gap-6">
        {/* Missed Calls Section */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#0A2540] flex items-center">
              <Phone className="mr-2 h-5 w-5 text-blue-400" />
              Missed Calls
              {messagesByType.missed_call.length > 0 && (
                <Badge className="ml-2 bg-blue-500 hover:bg-blue-600">{messagesByType.missed_call.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {messagesByType.missed_call.length > 0 ? (
              messagesByType.missed_call.map(renderMessageCard)
            ) : (
              <div className="text-center p-4 text-gray-400">
                <Phone className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No missed calls</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Reschedule Requests Section */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#0A2540] flex items-center">
              <Calendar className="mr-2 h-5 w-5 text-purple-400" />
              Reschedule Requests
              {messagesByType.reschedule.length > 0 && (
                <Badge className="ml-2 bg-purple-500 hover:bg-purple-600">{messagesByType.reschedule.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {messagesByType.reschedule.length > 0 ? (
              messagesByType.reschedule.map(renderMessageCard)
            ) : (
              <div className="text-center p-4 text-gray-400">
                <Calendar className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No reschedule requests</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Cancellations Section */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#0A2540] flex items-center">
              <X className="mr-2 h-5 w-5 text-red-400" />
              Cancellations
              {messagesByType.cancellation.length > 0 && (
                <Badge className="ml-2 bg-red-500 hover:bg-red-600">{messagesByType.cancellation.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {messagesByType.cancellation.length > 0 ? (
              messagesByType.cancellation.map(renderMessageCard)
            ) : (
              <div className="text-center p-4 text-gray-400">
                <X className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No cancellations</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Confirmations Section */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#0A2540] flex items-center">
              <Check className="mr-2 h-5 w-5 text-green-400" />
              Confirmations
              {messagesByType.confirmation.length > 0 && (
                <Badge className="ml-2 bg-green-500 hover:bg-green-600">{messagesByType.confirmation.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {messagesByType.confirmation.length > 0 ? (
              messagesByType.confirmation.map(renderMessageCard)
            ) : (
              <div className="text-center p-4 text-gray-400">
                <Check className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No confirmations</p>
              </div>
            )}
          </CardContent>
        </Card>
        
        {/* Emergency Alerts Section */}
        <Card className="bg-white border-gray-200 shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-[#0A2540] flex items-center">
              <AlertTriangle className="mr-2 h-5 w-5 text-amber-400" />
              Emergency Alerts
              {messagesByType.emergency.length > 0 && (
                <Badge className="ml-2 bg-amber-500 hover:bg-amber-600">{messagesByType.emergency.length}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {messagesByType.emergency.length > 0 ? (
              messagesByType.emergency.map(renderMessageCard)
            ) : (
              <div className="text-center p-4 text-gray-400">
                <AlertTriangle className="mx-auto h-8 w-8 mb-2 opacity-50" />
                <p>No emergency alerts</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Floating Compose Message Button */}
      <div className="fixed bottom-8 right-8">
        <Button 
          onClick={() => setIsComposeOpen(true)}
          className="h-14 w-14 rounded-full bg-[#1d4ed8] hover:bg-blue-600 shadow-lg"
        >
          <Plus className="h-6 w-6" />
          <span className="sr-only">Compose Message</span>
        </Button>
      </div>
      
      {/* Compose Message Dialog */}
      <ComposeDialog open={isComposeOpen} onOpenChange={setIsComposeOpen} />
      
      {/* Auto Responses Dialog */}
      <AutoResponses open={isAutoResponsesOpen} onOpenChange={setIsAutoResponsesOpen} />
    </div>
  );
};

export default MessagesRedesign;