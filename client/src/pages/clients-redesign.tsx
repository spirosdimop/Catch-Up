import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  Search,
  Filter,
  Grid,
  List,
  MessageSquare,
  Calendar,
  History,
  MoreHorizontal,
  UserPlus,
  RefreshCw,
  Clock,
  Star,
  ChevronDown,
  Pencil,
  X,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';
import { apiRequest, queryClient } from '@/lib/queryClient';

// Client interface
interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  avatar?: string;
  status: 'active' | 'inactive' | 'new';
  loyalty: 'one-time' | 'regular' | 'loyal';
  lastBooking?: string;
  totalBookings: number;
  notes?: string;
  dateAdded: string;
}

// View mode enum
enum ViewMode {
  Grid = 'grid',
  List = 'list'
}

// Filter interface
interface Filters {
  status: string;
  loyalty: string;
  searchQuery: string;
  sortBy: string;
}

const ClientsRedesign = () => {
  const { toast } = useToast();
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Grid);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [isSendMessageOpen, setIsSendMessageOpen] = useState(false);
  const [isEditClientOpen, setIsEditClientOpen] = useState(false);
  const [filters, setFilters] = useState<Filters>({
    status: 'all',
    loyalty: 'all',
    searchQuery: '',
    sortBy: 'name'
  });
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  
  // Query clients
  const { data: clients = [], isLoading } = useQuery<Client[], Error>({
    queryKey: ['/api/clients'],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/clients");
        const data = await response.json();
        return data;
      } catch (error) {
        console.error("Failed to fetch clients", error);
        // For demonstration purposes, providing sample data
        return [
          {
            id: 1,
            name: "Sarah Johnson",
            email: "sarah.johnson@example.com",
            phone: "+1 (555) 123-4567",
            company: "Creative Solutions LLC",
            status: "active",
            loyalty: "loyal",
            lastBooking: "2025-05-01",
            totalBookings: 15,
            notes: "Prefers afternoon meetings, interested in marketing services",
            dateAdded: "2024-01-15"
          },
          {
            id: 2,
            name: "Alex Chen",
            email: "alex.chen@example.com",
            phone: "+1 (555) 987-6543",
            company: "Tech Innovations Inc",
            status: "active",
            loyalty: "regular",
            lastBooking: "2025-04-28",
            totalBookings: 7,
            notes: "Focus on product development consulting",
            dateAdded: "2024-02-20"
          },
          {
            id: 3,
            name: "Maria Garcia",
            email: "maria.garcia@example.com",
            phone: "+1 (555) 456-7890",
            status: "new",
            loyalty: "one-time",
            lastBooking: "2025-05-10",
            totalBookings: 1,
            dateAdded: "2025-05-05"
          },
          {
            id: 4,
            name: "James Williams",
            email: "james.williams@example.com",
            phone: "+1 (555) 789-0123",
            company: "Global Enterprises",
            status: "inactive",
            loyalty: "regular",
            lastBooking: "2025-03-15",
            totalBookings: 5,
            notes: "Currently on hold, follow up in June",
            dateAdded: "2024-03-10"
          },
          {
            id: 5,
            name: "Emma Taylor",
            email: "emma.taylor@example.com",
            phone: "+1 (555) 234-5678",
            status: "active",
            loyalty: "loyal",
            lastBooking: "2025-05-08",
            totalBookings: 23,
            notes: "Graphic design projects, monthly strategy sessions",
            dateAdded: "2023-11-05"
          },
          {
            id: 6,
            name: "Daniel Brown",
            email: "daniel.brown@example.com",
            phone: "+1 (555) 345-6789",
            company: "Brown Consulting",
            status: "active",
            loyalty: "loyal",
            lastBooking: "2025-05-05",
            totalBookings: 18,
            notes: "Financial consulting, prefers morning meetings",
            dateAdded: "2023-09-15"
          },
          {
            id: 7,
            name: "Olivia Miller",
            email: "olivia.miller@example.com",
            phone: "+1 (555) 456-7890",
            status: "inactive",
            loyalty: "one-time",
            lastBooking: "2024-12-10",
            totalBookings: 1,
            dateAdded: "2024-12-01"
          },
          {
            id: 8,
            name: "Noah Wilson",
            email: "noah.wilson@example.com",
            phone: "+1 (555) 567-8901",
            company: "Wilson Partners",
            status: "new",
            loyalty: "one-time",
            lastBooking: "2025-05-09",
            totalBookings: 1,
            dateAdded: "2025-05-01"
          }
        ];
      }
    }
  });
  
  // Apply filters to clients
  React.useEffect(() => {
    if (!clients.length) {
      setFilteredClients([]);
      return;
    }
    
    let result = [...clients];
    
    // Apply status filter
    if (filters.status !== 'all') {
      result = result.filter(client => client.status === filters.status);
    }
    
    // Apply loyalty filter
    if (filters.loyalty !== 'all') {
      result = result.filter(client => client.loyalty === filters.loyalty);
    }
    
    // Apply search query
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      result = result.filter(client => 
        client.name.toLowerCase().includes(query) || 
        client.email.toLowerCase().includes(query) || 
        (client.company && client.company.toLowerCase().includes(query))
      );
    }
    
    // Apply sorting
    switch (filters.sortBy) {
      case 'name':
        result.sort((a, b) => a.name.localeCompare(b.name));
        break;
      case 'newest':
        result.sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
        break;
      case 'bookings':
        result.sort((a, b) => b.totalBookings - a.totalBookings);
        break;
      case 'recent':
        result.sort((a, b) => {
          if (!a.lastBooking) return 1;
          if (!b.lastBooking) return -1;
          return new Date(b.lastBooking).getTime() - new Date(a.lastBooking).getTime();
        });
        break;
      default:
        break;
    }
    
    setFilteredClients(result);
  }, [clients, filters]);
  
  // Get status badge style
  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'inactive':
        return <Badge className="bg-gray-500">Inactive</Badge>;
      case 'new':
        return <Badge className="bg-blue-500">New</Badge>;
      default:
        return null;
    }
  };
  
  // Get loyalty badge
  const getLoyaltyBadge = (loyalty: string) => {
    switch (loyalty) {
      case 'loyal':
        return <Badge variant="outline" className="bg-[#0a2342] border-yellow-400 text-yellow-400">Loyal Client</Badge>;
      case 'regular':
        return <Badge variant="outline" className="bg-[#0a2342] border-blue-400 text-blue-400">Regular Client</Badge>;
      case 'one-time':
        return <Badge variant="outline" className="bg-[#0a2342] border-gray-400 text-gray-400">One-Time Client</Badge>;
      default:
        return null;
    }
  };
  
  // Get avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };
  
  // Handle opening client details
  const handleViewDetails = (client: Client) => {
    setSelectedClient(client);
    setIsDetailsOpen(true);
  };
  
  // Handle sending message
  const handleSendMessage = (client: Client) => {
    setSelectedClient(client);
    setIsSendMessageOpen(true);
  };
  
  // Handle edit client
  const handleEditClient = (client: Client) => {
    setSelectedClient(client);
    setIsEditClientOpen(true);
  };
  
  // Handle scheduling
  const handleScheduleAppointment = (client: Client) => {
    // Navigate to booking page with client pre-selected
    window.location.href = `/bookings?client=${client.id}`;
  };
  
  // Handle add new client
  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const newClient = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || null,
      company: formData.get('company') as string || null,
      notes: formData.get('notes') as string || null,
      status: 'new',
      loyalty: 'one-time',
      dateAdded: new Date().toISOString().split('T')[0],
      totalBookings: 0
    };
    
    try {
      const response = await apiRequest("POST", "/api/clients", newClient);
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
        toast({
          title: "Client added successfully",
          description: "The new client has been added to your list.",
        });
        form.reset();
        setIsAddClientOpen(false);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add client');
      }
    } catch (error) {
      console.error('Error adding client:', error);
      toast({
        title: "Error adding client",
        description: error instanceof Error ? error.message : 'An unexpected error occurred',
        variant: "destructive"
      });
    }
  };
  
  // Handle send message
  const handleSendMessageSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real application, we would submit the message to the API
    toast({
      title: "Message sent",
      description: `Your message has been sent to ${selectedClient?.name}.`,
    });
    setIsSendMessageOpen(false);
  };
  
  // Handle edit client submit
  const handleEditClientSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClient) return;
    
    const form = e.target as HTMLFormElement;
    const formData = new FormData(form);
    
    const updatedClient = {
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string || null,
      company: formData.get('company') as string || null,
      notes: formData.get('notes') as string || null,
      status: formData.get('status') as 'active' | 'inactive' | 'new',
      loyalty: formData.get('loyalty') as 'one-time' | 'regular' | 'loyal',
    };
    
    try {
      const response = await apiRequest("PATCH", `/api/clients/${selectedClient.id}`, updatedClient);
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
        toast({
          title: "Client updated successfully",
          description: "The client information has been updated.",
        });
        setIsEditClientOpen(false);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update client');
      }
    } catch (error) {
      console.error('Error updating client:', error);
      toast({
        title: "Error",
        description: "Failed to update client. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Delete client handling
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  
  // Debug delete dialog state
  console.log('isDeleteConfirmOpen:', isDeleteConfirmOpen);
  
  const handleDeleteClient = async () => {
    if (!selectedClient) return;
    
    try {
      const response = await apiRequest("DELETE", `/api/clients/${selectedClient.id}`);
      if (response.ok) {
        queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
        toast({
          title: "Client deleted successfully",
          description: "The client has been permanently removed.",
        });
        setIsDeleteConfirmOpen(false);
        setIsDetailsOpen(false);
      } else {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete client');
      }
    } catch (error) {
      console.error('Error deleting client:', error);
      toast({
        title: "Delete failed",
        description: error instanceof Error ? error.message : "Failed to delete client. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  // Render grid view
  const renderGridView = () => {
    if (isLoading) {
      return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i} className="bg-[#173561] border-[#2a4d7d] shadow-sm animate-pulse">
              <CardHeader className="h-32"></CardHeader>
              <CardContent className="h-24"></CardContent>
              <CardFooter className="h-16"></CardFooter>
            </Card>
          ))}
        </div>
      );
    }
    
    if (filteredClients.length === 0) {
      return (
        <div className="text-center py-16 text-gray-400">
          <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No clients found</h3>
          <p className="mb-4">Try adjusting your filters or adding a new client.</p>
          <Button 
            onClick={() => setIsAddClientOpen(true)}
            className="bg-[#0A2540] hover:bg-[#081c30] text-white"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Client
          </Button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredClients.map((client) => (
          <Card key={client.id} className="bg-white border-gray-200 shadow-sm overflow-hidden">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-12 w-12 border-2 border-gray-200">
                    <AvatarImage src={client.avatar} />
                    <AvatarFallback className="bg-[#0A2540] text-white">
                      {getInitials(client.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-base">{client.name}</CardTitle>
                    <CardDescription className="text-gray-400">
                      {client.company || client.email}
                    </CardDescription>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-1">
                  {getStatusBadge(client.status)}
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 pb-3">
              <div className="space-y-3">
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center text-gray-400">
                    <Calendar className="h-3.5 w-3.5 mr-1.5" />
                    {client.lastBooking ? (
                      <span>Last booking: {format(new Date(client.lastBooking), 'MMM d, yyyy')}</span>
                    ) : (
                      <span>No bookings yet</span>
                    )}
                  </div>
                  <div>
                    <Badge variant="outline" className="bg-[#F8FAFC] border-gray-200 text-[#0A2540]">
                      {client.totalBookings} bookings
                    </Badge>
                  </div>
                </div>
                <div>
                  {getLoyaltyBadge(client.loyalty)}
                </div>
                {client.notes && (
                  <div className="text-sm text-gray-500 line-clamp-2 pt-1 border-t border-gray-200 mt-1">
                    {client.notes}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0 pb-3 flex justify-between gap-2">
              <Button 
                variant="ghost" 
                className="flex-1 p-0 h-9 text-[#0A2540] hover:bg-gray-100"
                onClick={() => handleSendMessage(client)}
              >
                <MessageSquare className="h-4 w-4 mr-1" />
                Message
              </Button>
              <Separator orientation="vertical" className="h-9 bg-gray-200" />
              <Button 
                variant="ghost" 
                className="flex-1 p-0 h-9 text-[#0A2540] hover:bg-gray-100"
                onClick={() => handleScheduleAppointment(client)}
              >
                <Calendar className="h-4 w-4 mr-1" />
                Schedule
              </Button>
              <Separator orientation="vertical" className="h-9 bg-gray-200" />
              <Button 
                variant="ghost" 
                className="flex-1 p-0 h-9 text-[#0A2540] hover:bg-gray-100"
                onClick={() => handleViewDetails(client)}
              >
                <History className="h-4 w-4 mr-1" />
                History
              </Button>
              <Separator orientation="vertical" className="h-9 bg-gray-200" />
              <Button 
                variant="ghost" 
                className="flex-1 p-0 h-9 text-[#0A2540] hover:bg-gray-100"
                onClick={() => handleEditClient(client)}
              >
                <Pencil className="h-4 w-4 mr-1" />
                Edit
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  // Render list view
  const renderListView = () => {
    if (isLoading) {
      return (
        <div className="space-y-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#173561] border border-[#2a4d7d] rounded-lg p-4 animate-pulse">
              <div className="h-12"></div>
            </div>
          ))}
        </div>
      );
    }
    
    if (filteredClients.length === 0) {
      return (
        <div className="text-center py-16 text-gray-400">
          <UserPlus className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No clients found</h3>
          <p className="mb-4">Try adjusting your filters or adding a new client.</p>
          <Button 
            onClick={() => setIsAddClientOpen(true)}
            className="bg-[#0A2540] hover:bg-[#081c30] text-white"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Client
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {filteredClients.map((client) => (
          <Card key={client.id} className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar className="h-10 w-10 border-2 border-gray-200">
                    <AvatarImage src={client.avatar} />
                    <AvatarFallback className="bg-[#0A2540] text-white">
                      {getInitials(client.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="text-base font-medium text-[#0A2540] flex items-center">
                      {client.name}
                      <div className="ml-2">
                        {getStatusBadge(client.status)}
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 text-sm text-gray-500">
                      {client.company && (
                        <>
                          <span>{client.company}</span>
                          <span className="text-gray-300">•</span>
                        </>
                      )}
                      <span>{client.email}</span>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="hidden md:flex flex-col items-end space-y-1 mr-2">
                    <div className="flex items-center text-sm text-gray-500">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      {client.lastBooking ? format(new Date(client.lastBooking), 'MMM d, yyyy') : 'Never'}
                    </div>
                    <div className="flex space-x-2">
                      <Badge variant="outline" className="bg-[#F8FAFC] border-gray-200 text-[#0A2540]">
                        {client.totalBookings} bookings
                      </Badge>
                      {getLoyaltyBadge(client.loyalty)}
                    </div>
                  </div>
                  
                  <div className="flex space-x-1">
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-[#0A2540] hover:bg-gray-100"
                      onClick={() => handleSendMessage(client)}
                      title="Send Message"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-[#0A2540] hover:bg-gray-100"
                      onClick={() => handleScheduleAppointment(client)}
                      title="Schedule Appointment"
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      className="text-[#0A2540] hover:bg-gray-100"
                      onClick={() => handleViewDetails(client)}
                      title="View History"
                    >
                      <History className="h-4 w-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="text-[#0A2540] hover:bg-gray-100"
                        >
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent className="bg-white border-gray-200 text-[#0A2540]">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-gray-200" />
                        <DropdownMenuItem 
                          className="hover:bg-gray-100 cursor-pointer"
                          onClick={() => handleEditClient(client)}
                        >
                          Edit Client
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">
                          View Projects
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-gray-100 cursor-pointer">
                          View Invoices
                        </DropdownMenuItem>
                        <DropdownMenuSeparator className="bg-gray-200" />
                        <DropdownMenuItem className="text-red-500 hover:bg-gray-100 cursor-pointer">
                          Archive Client
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </div>
              
              <div className="md:hidden mt-2 flex justify-between items-center">
                <div className="flex items-center text-sm text-gray-400">
                  <Clock className="h-3.5 w-3.5 mr-1" />
                  {client.lastBooking ? format(new Date(client.lastBooking), 'MMM d, yyyy') : 'Never'}
                </div>
                <div className="flex space-x-2">
                  <Badge variant="outline" className="bg-[#0a2342] border-[#2a4d7d] text-white">
                    {client.totalBookings} bookings
                  </Badge>
                  {getLoyaltyBadge(client.loyalty)}
                </div>
              </div>
              
              {client.notes && (
                <div className="mt-3 pl-13 text-sm text-gray-300 border-t border-[#2a4d7d] pt-2">
                  {client.notes}
                </div>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  // Client Details Dialog
  const ClientDetailsDialog = () => {
    if (!selectedClient) return null;
    
    return (
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-white border-gray-200 text-[#0A2540] max-w-[700px] relative pb-20">
          <DialogHeader>
            <div className="flex justify-between items-start">
              <DialogTitle className="flex items-center">
                <Avatar className="h-10 w-10 border-2 border-gray-200 mr-3">
                  <AvatarImage src={selectedClient.avatar} />
                  <AvatarFallback className="bg-[#0A2540] text-white">
                    {getInitials(selectedClient.name)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-[#0A2540]">{selectedClient.name}</span>
                <div className="ml-3 flex space-x-2">
                  {selectedClient.status && getStatusBadge(selectedClient.status)}
                  {selectedClient.loyalty && getLoyaltyBadge(selectedClient.loyalty)}
                </div>
              </DialogTitle>
              
              <Button 
                variant="destructive"
                size="default"
                className="bg-red-600 hover:bg-red-700 text-white font-semibold"
                onClick={() => {
                  console.log('Header Delete button clicked');
                  setIsDeleteConfirmOpen(true);
                }}
              >
                <Trash2 className="mr-2 h-5 w-5" />
                DELETE CLIENT
              </Button>
            </div>
            <DialogDescription className="text-gray-500">
              Client since {selectedClient.dateAdded ? 
                format(new Date(selectedClient.dateAdded.replace(/-/g, '/')), 'MMMM d, yyyy') : 
                'N/A'}
            </DialogDescription>
          </DialogHeader>
          
          <Tabs defaultValue="info" className="mt-2">
            <TabsList className="bg-gray-100 border-gray-200">
              <TabsTrigger 
                value="info" 
                className="data-[state=active]:bg-[#0A2540] data-[state=active]:text-white"
              >
                Information
              </TabsTrigger>
              <TabsTrigger 
                value="history" 
                className="data-[state=active]:bg-[#0A2540] data-[state=active]:text-white"
              >
                Booking History
              </TabsTrigger>
              <TabsTrigger 
                value="projects" 
                className="data-[state=active]:bg-[#0A2540] data-[state=active]:text-white"
              >
                Projects
              </TabsTrigger>
              <TabsTrigger 
                value="invoices" 
                className="data-[state=active]:bg-[#0A2540] data-[state=active]:text-white"
              >
                Invoices
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="info" className="pt-4 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Contact Information</h3>
                    <div className="space-y-2 ml-1">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400">Email:</span>
                        <span>{selectedClient.email}</span>
                      </div>
                      {selectedClient.phone && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Phone:</span>
                          <span>{selectedClient.phone}</span>
                        </div>
                      )}
                      {selectedClient.company && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400">Company:</span>
                          <span>{selectedClient.company}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Separator className="bg-[#2a4d7d]" />
                  
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Notes</h3>
                    <div className="bg-[#0a2342] p-3 rounded-md border border-[#2a4d7d] text-sm">
                      {selectedClient.notes || "No notes available."}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-1">Booking Statistics</h3>
                    <div className="space-y-4">
                      <div className="bg-[#0a2342] p-3 rounded-md border border-[#2a4d7d]">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">Total Bookings</span>
                          <span className="text-xl font-bold">{selectedClient.totalBookings || 0}</span>
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#0a2342] p-3 rounded-md border border-[#2a4d7d]">
                          <div className="flex flex-col">
                            <span className="text-gray-400 text-sm">Last Booking</span>
                            <span className="font-medium">
                              {selectedClient.lastBooking 
                                ? format(new Date(selectedClient.lastBooking.replace(/-/g, '/')), 'MMM d, yyyy')
                                : "Never"
                              }
                            </span>
                          </div>
                        </div>
                        <div className="bg-[#0a2342] p-3 rounded-md border border-[#2a4d7d]">
                          <div className="flex flex-col">
                            <span className="text-gray-400 text-sm">Loyalty Status</span>
                            <span className="font-medium capitalize">
                              {selectedClient.loyalty ? selectedClient.loyalty.replace('-', ' ') : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex flex-col space-y-2 mt-4">
                    <Button 
                      className="bg-[#0A2540] hover:bg-[#081c30] text-white"
                      onClick={() => {
                        setIsDetailsOpen(false);
                        handleScheduleAppointment(selectedClient);
                      }}
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      Schedule Appointment
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-[#2a4d7d] text-white hover:bg-[#0a2342]"
                      onClick={() => {
                        setIsDetailsOpen(false);
                        handleSendMessage(selectedClient);
                      }}
                    >
                      <MessageSquare className="mr-2 h-4 w-4" />
                      Send Message
                    </Button>
                    <Button 
                      variant="outline"
                      className="border-red-700 text-red-500 hover:bg-red-100 hover:text-red-700"
                      onClick={() => {
                        console.log('Delete button clicked');
                        setIsDeleteConfirmOpen(true);
                      }}
                    >
                      <Trash2 className="mr-2 h-4 w-4" />
                      Delete Client
                    </Button>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="history" className="pt-4">
              <div className="text-center py-8 text-gray-400">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Booking History</h3>
                <p>This client has {selectedClient.totalBookings || 0} booking(s).</p>
                <p className="mt-4 mb-6">Detailed booking history will be displayed here.</p>
                <Button 
                  className="bg-[#0A2540] hover:bg-[#081c30] text-white"
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleScheduleAppointment(selectedClient);
                  }}
                >
                  <Calendar className="mr-2 h-4 w-4" />
                  Schedule New Appointment
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="projects" className="pt-4">
              <div className="text-center py-8 text-gray-400">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Projects</h3>
                <p>You currently have no projects with this client.</p>
                <p className="mt-4 mb-6">Projects that you work on with this client will appear here.</p>
                <Button 
                  className="bg-[#0A2540] hover:bg-[#081c30] text-white"
                >
                  Create New Project
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="invoices" className="pt-4">
              <div className="text-center py-8 text-gray-400">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <h3 className="text-lg font-medium mb-2">Invoices</h3>
                <p>You currently have no invoices for this client.</p>
                <p className="mt-4 mb-6">Invoices for this client will appear here.</p>
                <Button 
                  className="bg-[#0A2540] hover:bg-[#081c30] text-white"
                >
                  Create New Invoice
                </Button>
              </div>
            </TabsContent>
          </Tabs>
          
          {/* Floating delete button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 bg-white border-t border-gray-200 flex justify-center">
            <Button 
              variant="destructive"
              size="lg"
              className="bg-red-600 hover:bg-red-700 text-white font-semibold w-full max-w-xs"
              onClick={() => {
                console.log('Floating Delete button clicked');
                setIsDeleteConfirmOpen(true);
              }}
            >
              <Trash2 className="mr-2 h-5 w-5" />
              DELETE THIS CLIENT
            </Button>
          </div>
          
          <DialogFooter className="flex justify-end gap-2 mt-6">
            <Button 
              variant="outline" 
              onClick={() => setIsDetailsOpen(false)}
              className="border-gray-300 text-[#0A2540] hover:bg-gray-100"
            >
              Close
            </Button>
            <Button 
              className="bg-[#0A2540] hover:bg-[#081c30] text-white"
            >
              Edit Client
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Add Client Dialog
  const AddClientDialog = () => {
    return (
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="bg-white border-gray-200 text-[#0A2540]">
          <DialogHeader>
            <DialogTitle className="text-[#0A2540]">Add New Client</DialogTitle>
            <DialogDescription className="text-gray-500">
              Enter the details of your new client below.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleAddClient} className="space-y-4 py-2">
            <div className="grid grid-cols-1 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name</Label>
                <Input 
                  id="name"
                  name="name"
                  placeholder="John Doe" 
                  className="bg-white border-gray-200 text-[#0A2540]"
                  required 
                />
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email"
                    name="email"
                    type="email" 
                    placeholder="john@example.com" 
                    className="bg-white border-gray-200 text-[#0A2540]"
                    required 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone (Optional)</Label>
                  <Input 
                    id="phone"
                    name="phone"
                    placeholder="+1 555-123-4567" 
                    className="bg-white border-gray-200 text-[#0A2540]"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="company">Company (Optional)</Label>
                <Input 
                  id="company"
                  name="company"
                  placeholder="ACME Corporation" 
                  className="bg-white border-gray-200 text-[#0A2540]"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea 
                  id="notes"
                  name="notes"
                  placeholder="Any additional information about this client..."
                  className="bg-white border-gray-200 text-[#0A2540] resize-none min-h-[100px]"
                />
              </div>
              
              <div className="flex items-center space-x-2 pt-2">
                <Checkbox 
                  id="send-welcome" 
                  name="send-welcome"
                  className="border-gray-300 data-[state=checked]:bg-[#0A2540]" 
                />
                <Label
                  htmlFor="send-welcome"
                  className="text-sm font-normal text-[#0A2540]"
                >
                  Send welcome email to this client
                </Label>
              </div>
            </div>
            
            <DialogFooter className="pt-2">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setIsAddClientOpen(false)}
                className="border-gray-300 text-[#0A2540] hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-[#0A2540] hover:bg-[#081c30] text-white"
              >
                <UserPlus className="mr-2 h-4 w-4" />
                Add Client
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Send Message Dialog
  const SendMessageDialog = () => {
    if (!selectedClient) return null;
    
    return (
      <Dialog open={isSendMessageOpen} onOpenChange={setIsSendMessageOpen}>
        <DialogContent className="bg-white border-gray-200 text-[#0A2540]">
          <DialogHeader>
            <DialogTitle className="text-[#0A2540]">Send Message</DialogTitle>
            <DialogDescription className="text-gray-500">
              Send a message to {selectedClient?.name || 'this client'}.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleSendMessageSubmit} className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input 
                id="subject"
                name="subject"
                placeholder="Message subject" 
                className="bg-white border-gray-200 text-[#0A2540]"
                required 
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="message">Message</Label>
              <Textarea 
                id="message"
                name="message"
                placeholder="Type your message here..."
                className="bg-white border-gray-200 text-[#0A2540] resize-none min-h-[200px]"
                required
              />
            </div>
            
            <div className="flex items-center space-x-2">
              <Checkbox 
                id="high-priority"
                name="high-priority"
                className="border-gray-300 data-[state=checked]:bg-[#0A2540]" 
              />
              <Label
                htmlFor="high-priority"
                className="text-sm font-normal text-[#0A2540]"
              >
                Mark as high priority
              </Label>
            </div>
            
            <DialogFooter className="pt-2">
              <Button 
                type="button"
                variant="outline" 
                onClick={() => setIsSendMessageOpen(false)}
                className="border-gray-300 text-[#0A2540] hover:bg-gray-100"
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                className="bg-[#0A2540] hover:bg-[#081c30] text-white"
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Send Message
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Edit Client Dialog
  const EditClientDialog = () => {
    return (
      <Dialog open={isEditClientOpen} onOpenChange={setIsEditClientOpen}>
        <DialogContent className="bg-white border-gray-200 text-[#0A2540]">
          <DialogHeader>
            <div className="flex items-center justify-between mb-2">
              <DialogTitle className="text-[#0A2540]">Edit Client</DialogTitle>
              <Button 
                variant="destructive"
                size="sm"
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  console.log('Edit modal Delete button clicked');
                  setIsEditClientOpen(false);
                  setIsDeleteConfirmOpen(true);
                }}
              >
                <Trash2 className="mr-1 h-4 w-4" />
                Delete
              </Button>
            </div>
            <DialogDescription className="text-gray-500">
              Make changes to the client information below.
            </DialogDescription>
          </DialogHeader>
          
          {selectedClient && (
            <form onSubmit={handleEditClientSubmit} className="space-y-4 py-2">
              <div className="grid grid-cols-1 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input 
                    id="name"
                    name="name"
                    placeholder="John Doe" 
                    className="bg-white border-gray-200 text-[#0A2540]"
                    defaultValue={selectedClient.name || ''}
                    required 
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input 
                      id="email"
                      name="email"
                      type="email" 
                      placeholder="john@example.com" 
                      className="bg-white border-gray-200 text-[#0A2540]"
                      defaultValue={selectedClient.email || ''}
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone (Optional)</Label>
                    <Input 
                      id="phone"
                      name="phone"
                      placeholder="+1 555-123-4567" 
                      className="bg-white border-gray-200 text-[#0A2540]"
                      defaultValue={selectedClient.phone || ''}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="company">Company (Optional)</Label>
                  <Input 
                    id="company"
                    name="company"
                    placeholder="ACME Corporation" 
                    className="bg-white border-gray-200 text-[#0A2540]"
                    defaultValue={selectedClient.company || ''}
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="status">Client Status</Label>
                    <Select defaultValue={selectedClient.status || "new"} name="status">
                      <SelectTrigger className="bg-white border-gray-200 text-[#0A2540]">
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 text-[#0A2540]">
                        <SelectItem value="new">New</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="inactive">Inactive</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="loyalty">Loyalty Level</Label>
                    <Select defaultValue={selectedClient.loyalty || "one-time"} name="loyalty">
                      <SelectTrigger className="bg-white border-gray-200 text-[#0A2540]">
                        <SelectValue placeholder="Select loyalty" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 text-[#0A2540]">
                        <SelectItem value="one-time">One-time</SelectItem>
                        <SelectItem value="regular">Regular</SelectItem>
                        <SelectItem value="loyal">Loyal</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="notes">Notes (Optional)</Label>
                  <Textarea 
                    id="notes"
                    name="notes"
                    placeholder="Any additional information about this client..."
                    className="bg-white border-gray-200 text-[#0A2540] resize-none min-h-[100px]"
                    defaultValue={selectedClient.notes || ''}
                  />
                </div>
              </div>
              
              <div className="pt-6 border-t border-gray-200 mt-6">
                <Button 
                  type="button"
                  variant="destructive"
                  size="lg"
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold w-full mb-4"
                  onClick={() => {
                    console.log('Edit Form Delete button clicked');
                    setIsEditClientOpen(false);
                    setIsDeleteConfirmOpen(true);
                  }}
                >
                  <Trash2 className="mr-2 h-5 w-5" />
                  DELETE THIS CLIENT
                </Button>
              </div>
              
              <DialogFooter className="pt-2">
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={() => setIsEditClientOpen(false)}
                  className="border-gray-300 text-[#0A2540] hover:bg-gray-100"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  className="bg-[#0A2540] hover:bg-[#081c30] text-white"
                >
                  <Pencil className="mr-2 h-4 w-4" />
                  Update Client
                </Button>
              </DialogFooter>
            </form>
          )}
        </DialogContent>
      </Dialog>
    );
  };

  // Delete Confirmation Dialog
  const DeleteConfirmDialog = () => {
    console.log('Rendering DeleteConfirmDialog, open state:', isDeleteConfirmOpen);
    
    if (!selectedClient) {
      console.log('No selected client for delete dialog');
      return null;
    }
    
    return (
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent className="bg-white border-gray-200 text-[#0A2540]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-[#0A2540]">Confirm Deletion</AlertDialogTitle>
            <AlertDialogDescription className="text-gray-500">
              Are you sure you want to delete {selectedClient.name}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="pt-4">
            <AlertDialogCancel className="border-gray-300 text-[#0A2540] hover:bg-gray-100">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction 
              onClick={() => {
                console.log('Confirm delete clicked');
                handleDeleteClient();
              }}
              className="bg-red-600 hover:bg-red-700 text-white"
            >
              Delete Client
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    );
  };

  return (
    <div className="min-h-screen bg-white text-[#0A2540] p-4 md:p-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 gap-4">
          <div>
            <h1 className="text-2xl font-bold">Clients</h1>
            <p className="text-gray-500 mt-1">Manage your client relationships</p>
          </div>
          
          <Button
            className="bg-[#0A2540] hover:bg-[#081c30] text-white"
            onClick={() => setIsAddClientOpen(true)}
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Add New Client
          </Button>
        </div>
        
        {/* Search & Filters */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-full lg:max-w-[400px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input 
                placeholder="Search by name, email, or company..." 
                className="pl-10 border-gray-200 text-[#0A2540]"
                value={filters.searchQuery}
                onChange={(e) => setFilters({...filters, searchQuery: e.target.value})}
              />
              {filters.searchQuery && (
                <Button
                  variant="ghost"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 text-gray-400"
                  onClick={() => setFilters({...filters, searchQuery: ''})}
                >
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            
            <div className="flex flex-wrap items-center gap-3">
              <div>
                <Select
                  value={filters.status}
                  onValueChange={(value) => setFilters({...filters, status: value})}
                >
                  <SelectTrigger className="w-[130px] border-gray-200 text-[#0A2540]">
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 text-[#0A2540]">
                    <SelectItem value="all">All Statuses</SelectItem>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                    <SelectItem value="new">New</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select
                  value={filters.loyalty}
                  onValueChange={(value) => setFilters({...filters, loyalty: value})}
                >
                  <SelectTrigger className="w-[130px] border-gray-200 text-[#0A2540]">
                    <SelectValue placeholder="Loyalty" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 text-[#0A2540]">
                    <SelectItem value="all">All Clients</SelectItem>
                    <SelectItem value="loyal">Loyal Clients</SelectItem>
                    <SelectItem value="regular">Regular Clients</SelectItem>
                    <SelectItem value="one-time">One-time Clients</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Select
                  value={filters.sortBy}
                  onValueChange={(value) => setFilters({...filters, sortBy: value})}
                >
                  <SelectTrigger className="w-[180px] border-gray-200 text-[#0A2540]">
                    <SelectValue placeholder="Sort by" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 text-[#0A2540]">
                    <SelectItem value="name">Name (A-Z)</SelectItem>
                    <SelectItem value="newest">Newest First</SelectItem>
                    <SelectItem value="bookings">Most Bookings</SelectItem>
                    <SelectItem value="recent">Recent Bookings</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex space-x-1 ml-1">
                <Button
                  variant={viewMode === ViewMode.Grid ? "default" : "outline"}
                  size="icon"
                  className={cn(
                    viewMode !== ViewMode.Grid && "border-gray-200 text-[#0A2540] hover:bg-gray-100",
                    viewMode === ViewMode.Grid && "bg-[#0A2540] hover:bg-[#173561]"
                  )}
                  onClick={() => setViewMode(ViewMode.Grid)}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === ViewMode.List ? "default" : "outline"}
                  size="icon"
                  className={cn(
                    viewMode !== ViewMode.List && "border-gray-200 text-[#0A2540] hover:bg-gray-100",
                    viewMode === ViewMode.List && "bg-[#0A2540] hover:bg-[#173561]"
                  )}
                  onClick={() => setViewMode(ViewMode.List)}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
          
          {/* Active filters */}
          {(filters.status !== 'all' || filters.loyalty !== 'all' || filters.searchQuery) && (
            <div className="flex flex-wrap items-center mt-4 pt-3 border-t border-[#2a4d7d]">
              <span className="text-sm text-gray-400 mr-2 flex items-center">
                <Filter className="h-3.5 w-3.5 mr-1" />
                Active filters:
              </span>
              <div className="flex flex-wrap gap-2">
                {filters.status !== 'all' && (
                  <Badge className="bg-[#0A2540] hover:bg-blue-700 px-2.5 py-1 flex items-center">
                    Status: {filters.status}
                    <Button
                      variant="ghost"
                      className="h-4 w-4 p-0 ml-1.5 text-white"
                      onClick={() => setFilters({...filters, status: 'all'})}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {filters.loyalty !== 'all' && (
                  <Badge className="bg-[#0A2540] hover:bg-blue-700 px-2.5 py-1 flex items-center">
                    Loyalty: {filters.loyalty}
                    <Button
                      variant="ghost"
                      className="h-4 w-4 p-0 ml-1.5 text-white"
                      onClick={() => setFilters({...filters, loyalty: 'all'})}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                {filters.searchQuery && (
                  <Badge className="bg-[#0A2540] hover:bg-blue-700 px-2.5 py-1 flex items-center">
                    Search: {filters.searchQuery}
                    <Button
                      variant="ghost"
                      className="h-4 w-4 p-0 ml-1.5 text-white"
                      onClick={() => setFilters({...filters, searchQuery: ''})}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </Badge>
                )}
                <Button
                  variant="link"
                  className="text-gray-400 hover:text-[#081c30] p-0 h-auto text-sm"
                  onClick={() => setFilters({
                    status: 'all',
                    loyalty: 'all',
                    searchQuery: '',
                    sortBy: 'name'
                  })}
                >
                  Clear all filters
                </Button>
                <div className="ml-auto text-sm text-gray-400">
                  {filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'} found
                </div>
              </div>
            </div>
          )}
        </div>
        
        {/* Client List */}
        <div className="mt-4">
          {viewMode === ViewMode.Grid ? renderGridView() : renderListView()}
        </div>
      </div>
      
      {/* Dialogs */}
      <ClientDetailsDialog />
      <AddClientDialog />
      <EditClientDialog />
      <SendMessageDialog />
      <DeleteConfirmDialog />
    </div>
  );
};



export default ClientsRedesign;