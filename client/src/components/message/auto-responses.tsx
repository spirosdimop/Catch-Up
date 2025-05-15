import React, { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { Pen, Trash2, Plus, MessageSquare } from 'lucide-react';

// Interface for auto response template
interface AutoResponse {
  id: number;
  type: 'missed_call' | 'reschedule' | 'cancellation' | 'confirmation' | 'emergency' | 'general';
  name: string;
  content: string;
  isDefault: boolean;
}

interface AutoResponsesProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const AutoResponses: React.FC<AutoResponsesProps> = ({ open, onOpenChange }) => {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedResponse, setSelectedResponse] = useState<AutoResponse | null>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Query for auto responses
  const { data: autoResponses = [], isLoading } = useQuery<AutoResponse[], Error>({
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
  
  // Grouped responses by type
  const responsesByType = {
    general: autoResponses.filter(r => r.type === 'general'),
    missed_call: autoResponses.filter(r => r.type === 'missed_call'),
    reschedule: autoResponses.filter(r => r.type === 'reschedule'),
    cancellation: autoResponses.filter(r => r.type === 'cancellation'),
    confirmation: autoResponses.filter(r => r.type === 'confirmation'),
    emergency: autoResponses.filter(r => r.type === 'emergency')
  };
  
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
      setIsAddDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/auto-responses'] });
    },
    onError: (error) => {
      toast({
        title: 'Error adding auto-response',
        description: error.message,
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
      setIsEditDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/auto-responses'] });
    },
    onError: (error) => {
      toast({
        title: 'Error updating auto-response',
        description: error.message,
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
        description: error.message,
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
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Form state for add/edit
  const [formState, setFormState] = useState({
    name: '',
    type: 'general',
    content: '',
    isDefault: false
  });
  
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
  };
  
  // Open add dialog
  const handleAddNew = () => {
    resetForm();
    setIsAddDialogOpen(true);
  };
  
  // Open edit dialog
  const handleEdit = (response: AutoResponse) => {
    setSelectedResponse(response);
    setFormState({
      name: response.name,
      type: response.type,
      content: response.content,
      isDefault: response.isDefault
    });
    setIsEditDialogOpen(true);
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
  
  // Handle add submission
  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formState.name || !formState.content) {
      toast({
        title: 'Missing information',
        description: 'Please fill out all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    addResponseMutation.mutate({
      name: formState.name,
      type: formState.type as any,
      content: formState.content,
      isDefault: formState.isDefault
    });
  };
  
  // Handle edit submission
  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedResponse || !formState.name || !formState.content) {
      toast({
        title: 'Missing information',
        description: 'Please fill out all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    updateResponseMutation.mutate({
      id: selectedResponse.id,
      name: formState.name,
      type: formState.type as any,
      content: formState.content,
      isDefault: formState.isDefault
    });
  };
  
  // Render a response card
  const renderResponseCard = (response: AutoResponse) => {
    return (
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
          <CardDescription className="text-gray-500">
            Type: {response.type.replace('_', ' ')}
          </CardDescription>
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
    );
  };
  
  // Get section title and icon based on type
  const getSectionInfo = (type: string) => {
    switch (type) {
      case 'missed_call':
        return { title: 'Missed Call Responses', bgColor: 'bg-blue-50' };
      case 'reschedule':
        return { title: 'Reschedule Responses', bgColor: 'bg-purple-50' };
      case 'cancellation':
        return { title: 'Cancellation Responses', bgColor: 'bg-red-50' };
      case 'confirmation':
        return { title: 'Confirmation Responses', bgColor: 'bg-green-50' };
      case 'emergency':
        return { title: 'Emergency Responses', bgColor: 'bg-amber-50' };
      default:
        return { title: 'General Responses', bgColor: 'bg-gray-50' };
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white text-[#0A2540] border-gray-200 max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl text-[#0A2540]">Auto-Response Messages</DialogTitle>
          <DialogDescription className="text-gray-500">
            Create and manage auto-response templates for different message types. Set default responses that will be used when sending messages.
          </DialogDescription>
        </DialogHeader>
        
        <div className="py-4">
          <Button
            onClick={handleAddNew}
            className="mb-6 bg-[#0A2540] hover:bg-[#082030] text-white"
          >
            <Plus className="mr-2 h-4 w-4" />
            Add New Auto-Response
          </Button>
          
          {isLoading ? (
            <div className="text-center py-8">
              <p>Loading auto-responses...</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* General Responses */}
              <div>
                <h3 className="text-lg font-medium text-[#0A2540] mb-3 flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-gray-500" />
                  {getSectionInfo('general').title}
                </h3>
                <div className={`rounded-lg p-4 ${getSectionInfo('general').bgColor}`}>
                  {responsesByType.general.length > 0 ? (
                    responsesByType.general.map(renderResponseCard)
                  ) : (
                    <p className="text-gray-500 text-center py-4">No general responses yet. Click "Add New" to create one.</p>
                  )}
                </div>
              </div>
              
              {/* Missed Call Responses */}
              <div>
                <h3 className="text-lg font-medium text-[#0A2540] mb-3 flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-blue-500" />
                  {getSectionInfo('missed_call').title}
                </h3>
                <div className={`rounded-lg p-4 ${getSectionInfo('missed_call').bgColor}`}>
                  {responsesByType.missed_call.length > 0 ? (
                    responsesByType.missed_call.map(renderResponseCard)
                  ) : (
                    <p className="text-gray-500 text-center py-4">No missed call responses yet. Click "Add New" to create one.</p>
                  )}
                </div>
              </div>
              
              {/* Reschedule Responses */}
              <div>
                <h3 className="text-lg font-medium text-[#0A2540] mb-3 flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-purple-500" />
                  {getSectionInfo('reschedule').title}
                </h3>
                <div className={`rounded-lg p-4 ${getSectionInfo('reschedule').bgColor}`}>
                  {responsesByType.reschedule.length > 0 ? (
                    responsesByType.reschedule.map(renderResponseCard)
                  ) : (
                    <p className="text-gray-500 text-center py-4">No reschedule responses yet. Click "Add New" to create one.</p>
                  )}
                </div>
              </div>
              
              {/* Cancellation Responses */}
              <div>
                <h3 className="text-lg font-medium text-[#0A2540] mb-3 flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-red-500" />
                  {getSectionInfo('cancellation').title}
                </h3>
                <div className={`rounded-lg p-4 ${getSectionInfo('cancellation').bgColor}`}>
                  {responsesByType.cancellation.length > 0 ? (
                    responsesByType.cancellation.map(renderResponseCard)
                  ) : (
                    <p className="text-gray-500 text-center py-4">No cancellation responses yet. Click "Add New" to create one.</p>
                  )}
                </div>
              </div>
              
              {/* Confirmation Responses */}
              <div>
                <h3 className="text-lg font-medium text-[#0A2540] mb-3 flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-green-500" />
                  {getSectionInfo('confirmation').title}
                </h3>
                <div className={`rounded-lg p-4 ${getSectionInfo('confirmation').bgColor}`}>
                  {responsesByType.confirmation.length > 0 ? (
                    responsesByType.confirmation.map(renderResponseCard)
                  ) : (
                    <p className="text-gray-500 text-center py-4">No confirmation responses yet. Click "Add New" to create one.</p>
                  )}
                </div>
              </div>
              
              {/* Emergency Responses */}
              <div>
                <h3 className="text-lg font-medium text-[#0A2540] mb-3 flex items-center">
                  <MessageSquare className="mr-2 h-5 w-5 text-amber-500" />
                  {getSectionInfo('emergency').title}
                </h3>
                <div className={`rounded-lg p-4 ${getSectionInfo('emergency').bgColor}`}>
                  {responsesByType.emergency.length > 0 ? (
                    responsesByType.emergency.map(renderResponseCard)
                  ) : (
                    <p className="text-gray-500 text-center py-4">No emergency responses yet. Click "Add New" to create one.</p>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        
        <DialogFooter>
          <Button 
            onClick={() => onOpenChange(false)}
            className="bg-[#0A2540] hover:bg-[#082030] text-white"
          >
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
      
      {/* Add Response Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="bg-white text-[#0A2540] border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg text-[#0A2540]">Add Auto-Response</DialogTitle>
            <DialogDescription className="text-gray-500">
              Create a new auto-response template that you can use when sending messages.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddSubmit} className="space-y-4 py-2">
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
                className="rounded border-gray-300 text-[#0A2540] focus:ring-[#0A2540]"
              />
              <Label htmlFor="isDefault" className="text-[#0A2540]">
                Set as default response for this type
              </Label>
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsAddDialogOpen(false)}
                className="border-gray-300 text-[#0A2540] hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#0A2540] hover:bg-[#082030] text-white"
                disabled={addResponseMutation.isPending}
              >
                {addResponseMutation.isPending ? 'Saving...' : 'Save Response'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Edit Response Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="bg-white text-[#0A2540] border-gray-200">
          <DialogHeader>
            <DialogTitle className="text-lg text-[#0A2540]">Edit Auto-Response</DialogTitle>
            <DialogDescription className="text-gray-500">
              Update your auto-response template.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleEditSubmit} className="space-y-4 py-2">
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="edit-name" className="text-[#0A2540]">
                Template Name
              </Label>
              <Input 
                id="edit-name"
                value={formState.name}
                onChange={(e) => handleFormChange('name', e.target.value)}
                className="bg-white border-gray-200 text-[#0A2540]"
                required
              />
            </div>
            
            <div className="grid w-full items-center gap-2">
              <Label htmlFor="edit-type" className="text-[#0A2540]">
                Response Type
              </Label>
              <Select 
                value={formState.type} 
                onValueChange={(value) => handleFormChange('type', value)}
              >
                <SelectTrigger id="edit-type" className="bg-white border-gray-200 text-[#0A2540]">
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
              <Label htmlFor="edit-content" className="text-[#0A2540]">
                Message Content
              </Label>
              <Textarea 
                id="edit-content"
                value={formState.content}
                onChange={(e) => handleFormChange('content', e.target.value)}
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
                id="edit-isDefault"
                checked={formState.isDefault}
                onChange={(e) => handleFormChange('isDefault', e.target.checked)}
                className="rounded border-gray-300 text-[#0A2540] focus:ring-[#0A2540]"
              />
              <Label htmlFor="edit-isDefault" className="text-[#0A2540]">
                Set as default response for this type
              </Label>
            </div>
            
            <DialogFooter className="pt-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditDialogOpen(false)}
                className="border-gray-300 text-[#0A2540] hover:bg-gray-50"
              >
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="bg-[#0A2540] hover:bg-[#082030] text-white"
                disabled={updateResponseMutation.isPending}
              >
                {updateResponseMutation.isPending ? 'Saving...' : 'Update Response'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default AutoResponses;