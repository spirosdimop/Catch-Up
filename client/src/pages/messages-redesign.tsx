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
import { Switch } from '@/components/ui/switch';
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
  
  // State for auto-send toggles per template type
  const [autoSendToggles, setAutoSendToggles] = useState<Record<string, boolean>>({
    missed_call: true,
    reschedule: true,
    cancellation: true,
    confirmation: true,
    emergency: true
  });
  
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
      
      {/* Auto-responses section - One input per category */}
      <div className="grid grid-cols-1 gap-6">
          {/* Missed Calls Response */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#0A2540] flex items-center">
                <Phone className="mr-2 h-5 w-5 text-blue-400" />
                Missed Calls Auto-Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="missed-call-toggle" className="text-sm text-muted-foreground">
                    Auto-send this response
                  </Label>
                  <Switch
                    id="missed-call-toggle"
                    checked={autoSendToggles.missed_call}
                    onCheckedChange={(checked) => {
                      setAutoSendToggles(prev => ({
                        ...prev,
                        missed_call: checked
                      }));
                    }}
                  />
                </div>
                <Textarea 
                  placeholder="Enter your default missed call response here... Use {client} to include the client's name."
                  className="min-h-[100px] bg-white border-gray-200 text-[#0A2540]"
                  value={responsesByType.missed_call[0]?.content || ""}
                  onChange={(e) => {
                    if (responsesByType.missed_call[0]) {
                      // Update existing response
                      updateResponseMutation.mutate({
                        ...responsesByType.missed_call[0],
                        content: e.target.value
                      });
                    } else {
                      // Create new response
                      addResponseMutation.mutate({
                        name: "Default Missed Call Response",
                        type: "missed_call",
                        content: e.target.value,
                        isDefault: true
                      });
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Reschedule Request Response */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#0A2540] flex items-center">
                <Calendar className="mr-2 h-5 w-5 text-purple-400" />
                Reschedule Request Auto-Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="reschedule-toggle" className="text-sm text-muted-foreground">
                    Auto-send this response
                  </Label>
                  <Switch
                    id="reschedule-toggle"
                    checked={autoSendToggles.reschedule}
                    onCheckedChange={(checked) => {
                      setAutoSendToggles(prev => ({
                        ...prev,
                        reschedule: checked
                      }));
                    }}
                  />
                </div>
                <Textarea 
                  placeholder="Enter your default reschedule response here... Use {client} and {date} to personalize."
                  className="min-h-[100px] bg-white border-gray-200 text-[#0A2540]"
                  value={responsesByType.reschedule[0]?.content || ""}
                  onChange={(e) => {
                    if (responsesByType.reschedule[0]) {
                      // Update existing response
                      updateResponseMutation.mutate({
                        ...responsesByType.reschedule[0],
                        content: e.target.value
                      });
                    } else {
                      // Create new response
                      addResponseMutation.mutate({
                        name: "Default Reschedule Response",
                        type: "reschedule",
                        content: e.target.value,
                        isDefault: true
                      });
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Cancellation Response */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#0A2540] flex items-center">
                <X className="mr-2 h-5 w-5 text-red-400" />
                Cancellation Auto-Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="cancellation-toggle" className="text-sm text-muted-foreground">
                    Auto-send this response
                  </Label>
                  <Switch
                    id="cancellation-toggle"
                    checked={autoSendToggles.cancellation}
                    onCheckedChange={(checked) => {
                      setAutoSendToggles(prev => ({
                        ...prev,
                        cancellation: checked
                      }));
                    }}
                  />
                </div>
                <Textarea 
                  placeholder="Enter your default cancellation response here... Use {client} to include the client's name."
                  className="min-h-[100px] bg-white border-gray-200 text-[#0A2540]"
                  value={responsesByType.cancellation[0]?.content || ""}
                  onChange={(e) => {
                    if (responsesByType.cancellation[0]) {
                      // Update existing response
                      updateResponseMutation.mutate({
                        ...responsesByType.cancellation[0],
                        content: e.target.value
                      });
                    } else {
                      // Create new response
                      addResponseMutation.mutate({
                        name: "Default Cancellation Response",
                        type: "cancellation",
                        content: e.target.value,
                        isDefault: true
                      });
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Confirmation Response */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#0A2540] flex items-center">
                <Check className="mr-2 h-5 w-5 text-green-400" />
                Confirmation Auto-Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="confirmation-toggle" className="text-sm text-muted-foreground">
                    Auto-send this response
                  </Label>
                  <Switch
                    id="confirmation-toggle"
                    checked={autoSendToggles.confirmation}
                    onCheckedChange={(checked) => {
                      setAutoSendToggles(prev => ({
                        ...prev,
                        confirmation: checked
                      }));
                    }}
                  />
                </div>
                <Textarea 
                  placeholder="Enter your default confirmation response here... Use {client} and {date} to personalize."
                  className="min-h-[100px] bg-white border-gray-200 text-[#0A2540]"
                  value={responsesByType.confirmation[0]?.content || ""}
                  onChange={(e) => {
                    if (responsesByType.confirmation[0]) {
                      // Update existing response
                      updateResponseMutation.mutate({
                        ...responsesByType.confirmation[0],
                        content: e.target.value
                      });
                    } else {
                      // Create new response
                      addResponseMutation.mutate({
                        name: "Default Confirmation Response",
                        type: "confirmation",
                        content: e.target.value,
                        isDefault: true
                      });
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* Emergency Response */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#0A2540] flex items-center">
                <AlertTriangle className="mr-2 h-5 w-5 text-amber-400" />
                Emergency Auto-Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-2">
                  <Label htmlFor="emergency-toggle" className="text-sm text-muted-foreground">
                    Auto-send this response
                  </Label>
                  <Switch
                    id="emergency-toggle"
                    checked={autoSendToggles.emergency}
                    onCheckedChange={(checked) => {
                      setAutoSendToggles(prev => ({
                        ...prev,
                        emergency: checked
                      }));
                    }}
                  />
                </div>
                <Textarea 
                  placeholder="Enter your default emergency response here... Use {client} to include the client's name."
                  className="min-h-[100px] bg-white border-gray-200 text-[#0A2540]"
                  value={responsesByType.emergency[0]?.content || ""}
                  onChange={(e) => {
                    if (responsesByType.emergency[0]) {
                      // Update existing response
                      updateResponseMutation.mutate({
                        ...responsesByType.emergency[0],
                        content: e.target.value
                      });
                    } else {
                      // Create new response
                      addResponseMutation.mutate({
                        name: "Default Emergency Response",
                        type: "emergency",
                        content: e.target.value,
                        isDefault: true
                      });
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
          
          {/* General Message Response */}
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-[#0A2540] flex items-center">
                <MessageSquare className="mr-2 h-5 w-5 text-gray-400" />
                General Auto-Response
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Textarea 
                  placeholder="Enter your default general message response here... Use {client} to include the client's name."
                  className="min-h-[100px] bg-white border-gray-200 text-[#0A2540]"
                  value={responsesByType.general[0]?.content || ""}
                  onChange={(e) => {
                    if (responsesByType.general[0]) {
                      // Update existing response
                      updateResponseMutation.mutate({
                        ...responsesByType.general[0],
                        content: e.target.value
                      });
                    } else {
                      // Create new response
                      addResponseMutation.mutate({
                        name: "Default General Response",
                        type: "general",
                        content: e.target.value,
                        isDefault: true
                      });
                    }
                  }}
                />
              </div>
            </CardContent>
          </Card>
        </div>

    </div>
  );
};

export default MessagesRedesign;