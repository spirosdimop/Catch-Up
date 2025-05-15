import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import ComposeDialog from '@/components/message/compose-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
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
  Settings,
  Save,
  Pen,
  Trash2
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

// Interface for auto response template
interface AutoResponse {
  id: number;
  type: 'missed_call' | 'reschedule' | 'cancellation' | 'confirmation' | 'emergency' | 'general';
  name: string;
  content: string;
  isDefault: boolean;
}

const MessagesRedesign = () => {
  // State for dialogs
  const [isComposeOpen, setIsComposeOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('all');
  const [activeSection, setActiveSection] = useState('messages'); // 'messages' or 'autoResponses'
  
  // State for auto-response form
  const [formState, setFormState] = useState<{
    name: string;
    type: 'missed_call' | 'reschedule' | 'cancellation' | 'confirmation' | 'emergency' | 'general';
    content: string;
    isDefault: boolean;
  }>({
    name: '',
    type: 'general',
    content: '',
    isDefault: false
  });
  const [selectedResponse, setSelectedResponse] = useState<AutoResponse | null>(null);
  const [editMode, setEditMode] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for messages
  const { data: messages = [], isLoading: isLoadingMessages } = useQuery<Message[], Error>({
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
  
  // Query for auto responses
  const { data: autoResponses = [], isLoading: isLoadingResponses } = useQuery<AutoResponse[], Error>({
    queryKey: ['/api/auto-responses'],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", '/api/auto-responses');
        const data = await response.json();
        return Array.isArray(data) ? data : [];
      } catch (error) {
        console.error('Failed to fetch auto responses', error);
        return [];
      }
    }
  });
  
  // Add auto response mutation
  const addResponseMutation = useMutation({
    mutationFn: async (responseData: Omit<AutoResponse, 'id'>) => {
      const response = await apiRequest('POST', '/api/auto-responses', responseData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Auto-response added',
        description: 'Your auto-response template has been saved successfully.',
      });
      resetForm();
      queryClient.invalidateQueries({ queryKey: ['/api/auto-responses'] });
    },
    onError: (error) => {
      toast({
        title: 'Error adding auto-response',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });
  
  // Update auto response mutation
  const updateResponseMutation = useMutation({
    mutationFn: async (responseData: AutoResponse) => {
      const response = await apiRequest('PATCH', `/api/auto-responses/${responseData.id}`, responseData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Auto-response updated',
        description: 'Your auto-response template has been updated successfully.',
      });
      resetForm();
      setEditMode(false);
      queryClient.invalidateQueries({ queryKey: ['/api/auto-responses'] });
    },
    onError: (error) => {
      toast({
        title: 'Error updating auto-response',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });
  
  // Delete auto response mutation
  const deleteResponseMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest('DELETE', `/api/auto-responses/${id}`);
    },
    onSuccess: () => {
      toast({
        title: 'Auto-response deleted',
        description: 'Your auto-response template has been deleted successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auto-responses'] });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting auto-response',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
  });
  
  // Set as default mutation
  const setAsDefaultMutation = useMutation({
    mutationFn: async ({ id, type }: { id: number, type: string }) => {
      // First, set all responses of this type to not default
      const responses = autoResponses.filter(r => r.type === type);
      const updatePromises = responses.map(r => 
        apiRequest('PATCH', `/api/auto-responses/${r.id}`, { ...r, isDefault: false })
      );
      await Promise.all(updatePromises);
      
      // Then set the selected one as default
      const response = await apiRequest('PATCH', `/api/auto-responses/${id}`, { isDefault: true });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Default updated',
        description: 'Your default auto-response has been updated.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/auto-responses'] });
    },
    onError: (error) => {
      toast({
        title: 'Error setting default',
        description: error instanceof Error ? error.message : 'An unknown error occurred',
        variant: 'destructive',
      });
    },
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
  
  // Group responses by type
  const responsesByType = {
    general: autoResponses.filter(r => r.type === 'general'),
    missed_call: autoResponses.filter(r => r.type === 'missed_call'),
    reschedule: autoResponses.filter(r => r.type === 'reschedule'),
    cancellation: autoResponses.filter(r => r.type === 'cancellation'),
    confirmation: autoResponses.filter(r => r.type === 'confirmation'),
    emergency: autoResponses.filter(r => r.type === 'emergency')
  };
  
  // Handle form changes
  const handleFormChange = (field: string, value: string | boolean) => {
    setFormState(prev => ({
      ...prev,
      [field]: value
    }));
  };
  
  // Reset form
  const resetForm = () => {
    setFormState({
      name: '',
      type: 'general',
      content: '',
      isDefault: false
    });
    setSelectedResponse(null);
    setEditMode(false);
  };
  
  // Handle edit
  const handleEdit = (response: AutoResponse) => {
    setSelectedResponse(response);
    setFormState({
      name: response.name,
      type: response.type,
      content: response.content,
      isDefault: response.isDefault
    });
    setEditMode(true);
  };
  
  // Handle delete
  const handleDelete = (id: number) => {
    if (confirm('Are you sure you want to delete this auto-response template?')) {
      deleteResponseMutation.mutate(id);
    }
  };
  
  // Handle set as default
  const handleSetAsDefault = (id: number, type: string) => {
    setAsDefaultMutation.mutate({ id, type });
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.content) {
      toast({
        title: 'Missing information',
        description: 'Please fill out all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    if (editMode && selectedResponse) {
      updateResponseMutation.mutate({
        id: selectedResponse.id,
        name: formState.name,
        type: formState.type,
        content: formState.content,
        isDefault: formState.isDefault
      });
    } else {
      addResponseMutation.mutate({
        name: formState.name,
        type: formState.type,
        content: formState.content,
        isDefault: formState.isDefault
      });
    }
  };

  // Helper functions for auto-response section display
  const getSectionInfo = (type: string) => {
    switch (type) {
      case 'missed_call':
        return { 
          title: 'Missed Call Templates', 
          bgColor: 'bg-blue-50' 
        };
      case 'reschedule':
        return { 
          title: 'Reschedule Templates', 
          bgColor: 'bg-purple-50' 
        };
      case 'cancellation':
        return { 
          title: 'Cancellation Templates', 
          bgColor: 'bg-red-50' 
        };
      case 'confirmation':
        return { 
          title: 'Confirmation Templates', 
          bgColor: 'bg-green-50' 
        };
      case 'emergency':
        return { 
          title: 'Emergency Templates', 
          bgColor: 'bg-amber-50' 
        };
      case 'general':
      default:
        return { 
          title: 'General Message Templates', 
          bgColor: 'bg-gray-50' 
        };
    }
  };
  
  const getIconColor = (type: string) => {
    switch (type) {
      case 'missed_call': return 'text-blue-500';
      case 'reschedule': return 'text-purple-500';
      case 'cancellation': return 'text-red-500';
      case 'confirmation': return 'text-green-500';
      case 'emergency': return 'text-amber-500';
      case 'general':
      default: return 'text-gray-500';
    }
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
      
      {/* Toggle between messages and auto-responses */}
      <div className="mb-6">
        <Tabs 
          defaultValue="messages" 
          value={activeSection} 
          onValueChange={setActiveSection}
          className="w-full"
        >
          <TabsList className="w-full md:w-auto bg-gray-100">
            <TabsTrigger value="messages" className="text-sm data-[state=active]:bg-white">
              <MessageSquare className="mr-2 h-4 w-4" />
              Messages
            </TabsTrigger>
            <TabsTrigger value="autoResponses" className="text-sm data-[state=active]:bg-white">
              <Settings className="mr-2 h-4 w-4" />
              Auto-Responses
            </TabsTrigger>
          </TabsList>
        </Tabs>
      </div>
      
      {/* Search and filters for messages section */}
      {activeSection === 'messages' && (
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
      )}
      
      {/* Message categories - only show when messages section is active */}
      {activeSection === 'messages' && (
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
      )}
      
      {/* Auto-responses section */}
      {activeSection === 'autoResponses' && (
        <div className="space-y-6">
          {/* Add/Edit Form */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#0A2540]">
                {editMode ? 'Edit Auto-Response' : 'Create Auto-Response'}
              </CardTitle>
              <CardDescription>
                Create templates for automatic responses that will be used when sending messages.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="name" className="text-[#0A2540]">
                    Template Name
                  </Label>
                  <Input 
                    id="name"
                    value={formState.name}
                    onChange={(e) => handleFormChange('name', e.target.value)}
                    placeholder="E.g. Standard Confirmation"
                    className="bg-white border-gray-200 text-[#0A2540]"
                    required
                  />
                </div>
                
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="type" className="text-[#0A2540]">
                    Response Type
                  </Label>
                  <Select 
                    value={formState.type} 
                    onValueChange={(value) => handleFormChange('type', value)}
                  >
                    <SelectTrigger id="type" className="bg-white border-gray-200 text-[#0A2540]">
                      <SelectValue placeholder="Select response type" />
                    </SelectTrigger>
                    <SelectContent className="bg-white border-gray-200 text-[#0A2540]">
                      <SelectItem value="general">General Message</SelectItem>
                      <SelectItem value="missed_call">Missed Call</SelectItem>
                      <SelectItem value="reschedule">Reschedule Request</SelectItem>
                      <SelectItem value="cancellation">Cancellation</SelectItem>
                      <SelectItem value="confirmation">Confirmation</SelectItem>
                      <SelectItem value="emergency">Emergency Alert</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid w-full items-center gap-2">
                  <Label htmlFor="content" className="text-[#0A2540]">
                    Message Content
                  </Label>
                  <Textarea 
                    id="content"
                    value={formState.content}
                    onChange={(e) => handleFormChange('content', e.target.value)}
                    placeholder="Type your message template here..."
                    className="min-h-[150px] bg-white border-gray-200 text-[#0A2540]"
                    required
                  />
                  <p className="text-xs text-gray-500">
                    Use {'{client}'} to include the client's name, and {'{date}'} to include the appointment date.
                  </p>
                </div>
                
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isDefault"
                    checked={formState.isDefault}
                    onChange={(e) => handleFormChange('isDefault', e.target.checked)}
                    className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <Label 
                    htmlFor="isDefault" 
                    className="text-sm text-gray-700 cursor-pointer"
                  >
                    Set as default for this message type
                  </Label>
                </div>
                
                <div className="flex flex-wrap gap-2 justify-end pt-2">
                  {editMode && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={resetForm}
                      className="bg-white text-gray-600 border-gray-200 hover:bg-gray-100"
                    >
                      Cancel
                    </Button>
                  )}
                  <Button 
                    type="submit"
                    className="bg-[#0A2540] hover:bg-[#082030] text-white"
                  >
                    {editMode ? (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save Changes
                      </>
                    ) : (
                      <>
                        <Plus className="mr-2 h-4 w-4" />
                        Add Response
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
          
          {/* Existing Auto-Response Templates */}
          {Object.entries(responsesByType).map(([type, responses]) => {
            if (responses.length === 0) return null;
            
            const { title, bgColor } = getSectionInfo(type);
            
            return (
              <div key={type}>
                <h3 className="text-lg font-medium text-[#0A2540] mb-3 flex items-center">
                  <MessageSquare className={`mr-2 h-5 w-5 ${getIconColor(type)}`} />
                  {title}
                </h3>
                <div className={`rounded-lg p-4 ${bgColor}`}>
                  {responses.map(response => (
                    <Card key={response.id} className="bg-white border-gray-200 shadow-sm mb-3">
                      <CardHeader className="pb-2">
                        <div className="flex justify-between items-start">
                          <div className="flex items-center">
                            <CardTitle className="text-[#0A2540] text-base">{response.name}</CardTitle>
                            {response.isDefault && (
                              <Badge className="ml-2 bg-green-100 text-green-800 hover:bg-green-200">Default</Badge>
                            )}
                          </div>
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-gray-500 hover:text-[#0A2540]"
                              onClick={() => handleEdit(response)}
                            >
                              <Pen className="h-4 w-4" />
                              <span className="sr-only">Edit</span>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0 text-gray-500 hover:text-red-600"
                              onClick={() => handleDelete(response.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                              <span className="sr-only">Delete</span>
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <p className="text-sm text-gray-600">{response.content}</p>
                      </CardContent>
                      {!response.isDefault && (
                        <CardFooter className="pt-0">
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="ml-auto text-sm text-blue-600 hover:text-blue-800 hover:bg-blue-50"
                            onClick={() => handleSetAsDefault(response.id, response.type)}
                          >
                            Set as default
                          </Button>
                        </CardFooter>
                      )}
                    </Card>
                  ))}
                </div>
              </div>
            );
          })}
          
          {/* Show "No templates" message if there are no templates */}
          {Object.values(responsesByType).every(responses => responses.length === 0) && (
            <Card className="bg-white border-gray-200 shadow-sm">
              <CardContent className="text-center p-8">
                <MessageSquare className="mx-auto h-12 w-12 mb-4 text-gray-300" />
                <h3 className="text-lg font-medium text-gray-700 mb-2">No Auto-Response Templates</h3>
                <p className="text-gray-500 max-w-md mx-auto mb-4">
                  You haven't created any auto-response templates yet. Create your first template above.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      )}
      
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
    </div>
  );
};

export default MessagesRedesign;