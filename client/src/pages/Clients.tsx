import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Client, InsertClient } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { PlusIcon, SearchIcon, PencilIcon, MailIcon, PhoneIcon, EyeIcon, FolderIcon, CheckSquareIcon, FileTextIcon, MessageCircleIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ClientForm from "@/components/ClientForm";
import { Card, CardContent } from "@/components/ui/card";

export default function Clients() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCleanupDialogOpen, setIsCleanupDialogOpen] = useState(false);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [cleanupResults, setCleanupResults] = useState<{
    unconnected: { count: number; deleted: number; results: any[] };
    duplicates: { count: number; duplicateEmails: number; deleted: number; results: any[] };
    totalDeleted: number;
  } | null>(null);

  // Fetch clients
  const { data: clients, isLoading, refetch } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    onSuccess: (data) => {
      console.log("Clients loaded successfully:", data);
    },
    onError: (error) => {
      console.error("Error loading clients:", error);
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true // Refetch when window regains focus
  });

  // Fetch projects to show client-project relationships
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
  });

  // Fetch tasks to show client-task relationships
  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Fetch invoices to show client-invoice relationships
  const { data: invoices = [] } = useQuery({
    queryKey: ['/api/invoices'],
  });

  // Create client mutation
  const createClientMutation = useMutation({
    mutationFn: async (client: InsertClient) => {
      console.log("Creating client:", client);
      const res = await apiRequest("POST", "/api/clients", client);
      const newClient = await res.json();
      console.log("Client created:", newClient);
      return newClient;
    },
    onSuccess: (data) => {
      console.log("Client created successfully, invalidating queries");
      
      // Properly invalidate the cache
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      
      // Explicitly refetch to ensure fresh data
      refetch();
      
      setIsAddDialogOpen(false);
      toast({
        title: "Client created",
        description: "The client has been created successfully.",
      });
    },
    onError: (error) => {
      console.error("Error creating client:", error);
      toast({
        title: "Error creating client",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update client mutation
  const updateClientMutation = useMutation({
    mutationFn: async ({ id, client }: { id: number; client: Partial<InsertClient> }) => {
      console.log("Updating client:", id, client);
      const res = await apiRequest("PATCH", `/api/clients/${id}`, client);
      const updatedClient = await res.json();
      console.log("Client updated:", updatedClient);
      return updatedClient;
    },
    onSuccess: () => {
      console.log("Client updated successfully, invalidating queries");
      
      // Properly invalidate the cache
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      
      // Explicitly refetch to ensure fresh data
      refetch();
      
      setIsEditDialogOpen(false);
      toast({
        title: "Client updated",
        description: "The client has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating client:", error);
      toast({
        title: "Error updating client",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete client mutation
  const deleteClientMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log("Deleting client:", id);
      await apiRequest("DELETE", `/api/clients/${id}`);
      console.log("Client deleted successfully");
      return id;
    },
    onSuccess: () => {
      console.log("Client deleted, invalidating queries");
      
      // Properly invalidate the cache
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      
      // Explicitly refetch to ensure fresh data
      refetch();
      
      toast({
        title: "Client deleted",
        description: "The client has been deleted successfully.",
      });
    },
  });
  
  // Client cleanup mutation
  const cleanupClientsMutation = useMutation({
    mutationFn: async () => {
      console.log("Starting client database cleanup...");
      const res = await apiRequest("POST", "/api/clients/cleanup");
      const data = await res.json();
      console.log("Cleanup results:", data);
      return data;
    },
    onSuccess: (data) => {
      console.log("Client cleanup completed successfully:", data);
      
      // Store the results for display
      setCleanupResults(data);
      
      // Properly invalidate the cache
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      
      // Explicitly refetch to ensure fresh data
      refetch();
      
      // Close the dialog
      setIsCleanupDialogOpen(false);
      
      // Show success message
      toast({
        title: "Client database cleaned",
        description: `Removed ${data.totalDeleted} unnecessary clients`,
      });
    },
    onError: (error) => {
      console.error("Error cleaning up clients:", error);
      toast({
        title: "Error cleaning up clients",
        description: error.message,
        variant: "destructive",
      });
      
      // Close the dialog
      setIsCleanupDialogOpen(false);
    },
  });

  // Handle client form submission
  const handleSubmit = (data: InsertClient) => {
    try {
      console.log("Form submitted with data:", data);
      
      // Make sure all fields exist and have proper types
      const sanitizedData = {
        name: data.name,
        email: data.email,
        phone: data.phone || null,
        company: data.company || null,
        address: data.address || null
      };
      
      console.log("Sanitized data:", sanitizedData);
      
      if (selectedClient) {
        updateClientMutation.mutate({ 
          id: selectedClient.id, 
          client: sanitizedData 
        });
      } else {
        createClientMutation.mutate(sanitizedData);
      }
    } catch (error) {
      console.error("Error in form submission:", error);
      toast({
        title: "Error processing form",
        description: error instanceof Error ? error.message : "Unknown error occurred",
        variant: "destructive",
      });
    }
  };

  // Handle client deletion
  const handleDeleteClient = (id: number) => {
    if (confirm("Are you sure you want to delete this client?")) {
      deleteClientMutation.mutate(id);
    }
  };

  // Helper function to get client connections
  const getClientConnections = (clientId: number) => {
    const clientProjects = projects.filter((project: any) => project.clientId === clientId);
    const clientTasks = tasks.filter((task: any) => task.clientId === clientId);
    const clientInvoices = invoices.filter((invoice: any) => invoice.clientId === clientId);
    
    return {
      projects: clientProjects,
      tasks: clientTasks,
      invoices: clientInvoices,
      totalConnections: clientProjects.length + clientTasks.length + clientInvoices.length
    };
  };

  // Filter clients based on search term
  const filteredClients = clients?.filter(client => 
    searchTerm === "" || 
    client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.company?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    client.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Clients</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage your client relationships and contacts
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          <Button variant="outline" onClick={() => setIsCleanupDialogOpen(true)}>
            <TrashIcon className="mr-2 h-4 w-4" />
            Clean Up Clients
          </Button>
          <Button onClick={() => {
            setSelectedClient(null);
            setIsAddDialogOpen(true);
          }}>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Client
          </Button>
        </div>
      </div>

      <div className="mb-6 relative">
        <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search clients..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {isLoading ? (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-6 w-36 mb-4" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredClients?.length === 0 ? (
            <div className="col-span-full bg-white shadow rounded-lg p-8 text-center text-gray-500">
              No clients found. Create your first client to get started.
            </div>
          ) : (
            filteredClients?.map(client => (
              <Card key={client.id} className="overflow-hidden">
                <CardContent className="p-4">
                  {/* Client Name */}
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{client.name}</h3>
                  
                  {/* Email */}
                  <div className="flex items-center text-gray-600 mb-2">
                    <MailIcon className="h-4 w-4 mr-2" />
                    <span className="text-sm">{client.email}</span>
                  </div>

                  {/* Phone Number */}
                  {client.phone && (
                    <div className="flex items-center text-gray-600 mb-4">
                      <PhoneIcon className="h-4 w-4 mr-2" />
                      <span className="text-sm">{client.phone}</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-between items-center pt-3 border-t border-gray-200">
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedClient(client);
                          setIsViewDialogOpen(true);
                        }}
                        title="View Details"
                      >
                        <EyeIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Message functionality - you can implement this
                          toast({ title: "Message feature", description: "Message functionality to be implemented" });
                        }}
                        title="Send Message"
                      >
                        <MessageCircleIcon className="h-4 w-4" />
                      </Button>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedClient(client);
                        setIsEditDialogOpen(true);
                      }}
                      title="Edit Client"
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      )}

      {/* Add Client Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Client</DialogTitle>
          </DialogHeader>
          <ClientForm
            onSubmit={handleSubmit}
            isSubmitting={createClientMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Client Details Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Client Details</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="text-lg font-semibold mb-4">Basic Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="flex items-center">
                    <UserIcon className="h-5 w-5 mr-2 text-gray-500" />
                    <span className="font-medium">{selectedClient.name}</span>
                  </div>
                  <div className="flex items-center">
                    <MailIcon className="h-5 w-5 mr-2 text-gray-500" />
                    <span>{selectedClient.email}</span>
                  </div>
                  {selectedClient.phone && (
                    <div className="flex items-center">
                      <PhoneIcon className="h-5 w-5 mr-2 text-gray-500" />
                      <span>{selectedClient.phone}</span>
                    </div>
                  )}
                  {selectedClient.company && (
                    <div className="flex items-center">
                      <BuildingIcon className="h-5 w-5 mr-2 text-gray-500" />
                      <span>{selectedClient.company}</span>
                    </div>
                  )}
                  {selectedClient.address && (
                    <div className="flex items-center col-span-2">
                      <MapPinIcon className="h-5 w-5 mr-2 text-gray-500" />
                      <span>{selectedClient.address}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Connections */}
              {(() => {
                const connections = getClientConnections(selectedClient.id);
                return (
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold">Connections</h3>
                    
                    {/* Projects */}
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <div className="flex items-center mb-3">
                        <FolderIcon className="h-5 w-5 mr-2 text-blue-600" />
                        <h4 className="font-medium text-blue-900">Projects ({connections.projects.length})</h4>
                      </div>
                      {connections.projects.length > 0 ? (
                        <div className="space-y-2">
                          {connections.projects.map((project: any) => (
                            <div key={project.id} className="bg-white p-3 rounded border">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium">{project.name}</h5>
                                  {project.description && (
                                    <p className="text-sm text-gray-600 mt-1">{project.description}</p>
                                  )}
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  project.status === 'completed' ? 'bg-green-100 text-green-800' :
                                  project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                  project.status === 'on_hold' ? 'bg-yellow-100 text-yellow-800' :
                                  'bg-gray-100 text-gray-800'
                                }`}>
                                  {project.status.replace('_', ' ')}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-blue-700 italic">No projects assigned to this client</p>
                      )}
                    </div>

                    {/* Tasks */}
                    <div className="bg-green-50 p-4 rounded-lg">
                      <div className="flex items-center mb-3">
                        <CheckSquareIcon className="h-5 w-5 mr-2 text-green-600" />
                        <h4 className="font-medium text-green-900">Tasks ({connections.tasks.length})</h4>
                      </div>
                      {connections.tasks.length > 0 ? (
                        <div className="space-y-2">
                          {connections.tasks.map((task: any) => (
                            <div key={task.id} className="bg-white p-3 rounded border">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium">{task.title}</h5>
                                  {task.description && (
                                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                                  )}
                                  {task.deadline && (
                                    <p className="text-xs text-gray-500 mt-1">
                                      Due: {new Date(task.deadline).toLocaleDateString()}
                                    </p>
                                  )}
                                </div>
                                <div className="flex flex-col items-end space-y-1">
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    task.status === 'completed' ? 'bg-green-100 text-green-800' :
                                    task.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                                    task.status === 'review' ? 'bg-purple-100 text-purple-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {task.status.replace('_', ' ')}
                                  </span>
                                  <span className={`px-2 py-1 text-xs rounded-full ${
                                    task.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                    task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                    task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                  }`}>
                                    {task.priority}
                                  </span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-green-700 italic">No tasks assigned to this client</p>
                      )}
                    </div>

                    {/* Invoices */}
                    <div className="bg-purple-50 p-4 rounded-lg">
                      <div className="flex items-center mb-3">
                        <FileTextIcon className="h-5 w-5 mr-2 text-purple-600" />
                        <h4 className="font-medium text-purple-900">Invoices ({connections.invoices.length})</h4>
                      </div>
                      {connections.invoices.length > 0 ? (
                        <div className="space-y-2">
                          {connections.invoices.map((invoice: any) => (
                            <div key={invoice.id} className="bg-white p-3 rounded border">
                              <div className="flex justify-between items-start">
                                <div>
                                  <h5 className="font-medium">#{invoice.invoiceNumber}</h5>
                                  <p className="text-sm text-gray-600">
                                    Amount: ${invoice.amount}
                                  </p>
                                  <p className="text-xs text-gray-500">
                                    Due: {new Date(invoice.dueDate).toLocaleDateString()}
                                  </p>
                                </div>
                                <span className={`px-2 py-1 text-xs rounded-full ${
                                  invoice.status === 'paid' ? 'bg-green-100 text-green-800' :
                                  invoice.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                                  invoice.status === 'overdue' ? 'bg-red-100 text-red-800' :
                                  invoice.status === 'canceled' ? 'bg-gray-100 text-gray-800' :
                                  'bg-yellow-100 text-yellow-800'
                                }`}>
                                  {invoice.status}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-purple-700 italic">No invoices for this client</p>
                      )}
                    </div>

                    {/* Summary */}
                    <div className="bg-gray-100 p-4 rounded-lg">
                      <h4 className="font-medium mb-2">Summary</h4>
                      <p className="text-sm text-gray-700">
                        This client has {connections.totalConnections} total connections: {connections.projects.length} projects, {connections.tasks.length} tasks, and {connections.invoices.length} invoices.
                      </p>
                    </div>
                  </div>
                );
              })()}
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Edit Client Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Client</DialogTitle>
          </DialogHeader>
          {selectedClient && (
            <ClientForm
              onSubmit={handleSubmit}
              isSubmitting={updateClientMutation.isPending}
              defaultValues={selectedClient}
            />
          )}
        </DialogContent>
      </Dialog>
      
      {/* Cleanup Confirmation Dialog */}
      <Dialog open={isCleanupDialogOpen} onOpenChange={setIsCleanupDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Clean Up Client Database</DialogTitle>
          </DialogHeader>
          
          {cleanupResults ? (
            // Results view
            <div className="py-4">
              <h3 className="font-medium text-lg mb-4">Client cleanup completed</h3>
              
              <div className="space-y-4">
                <div className="bg-green-50 p-4 rounded-md border border-green-200">
                  <p className="text-green-700 font-medium">Removed {cleanupResults.totalDeleted} clients in total</p>
                </div>
                
                {cleanupResults.unconnected.count > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Unconnected Clients</h4>
                    <p className="text-sm text-gray-500 mb-2">
                      Clients that were not linked to any projects, events, or invoices.
                    </p>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
                      <p><span className="font-medium">Found:</span> {cleanupResults.unconnected.count}</p>
                      <p><span className="font-medium">Deleted:</span> {cleanupResults.unconnected.deleted}</p>
                    </div>
                    
                    {cleanupResults.unconnected.count > 0 && (
                      <div className="mt-2 max-h-40 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="p-2 text-left">Name</th>
                              <th className="p-2 text-left">Email</th>
                              <th className="p-2 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cleanupResults.unconnected.results.map((result) => (
                              <tr key={result.id} className="border-t">
                                <td className="p-2">{result.name}</td>
                                <td className="p-2">{result.email}</td>
                                <td className="p-2">
                                  {result.deleted ? (
                                    <span className="text-green-600">Deleted</span>
                                  ) : (
                                    <span className="text-red-600">Failed: {result.error}</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
                
                {cleanupResults.duplicates.count > 0 && (
                  <div>
                    <h4 className="font-medium mb-2">Duplicate Clients</h4>
                    <p className="text-sm text-gray-500 mb-2">
                      Clients with the same email address. One client per email was kept.
                    </p>
                    <div className="bg-gray-50 p-3 rounded border border-gray-200 text-sm">
                      <p><span className="font-medium">Found:</span> {cleanupResults.duplicates.count}</p>
                      <p><span className="font-medium">Duplicate emails:</span> {cleanupResults.duplicates.duplicateEmails}</p>
                      <p><span className="font-medium">Deleted:</span> {cleanupResults.duplicates.deleted}</p>
                    </div>
                    
                    {cleanupResults.duplicates.results.length > 0 && (
                      <div className="mt-2 max-h-40 overflow-y-auto">
                        <table className="w-full text-xs">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="p-2 text-left">Name</th>
                              <th className="p-2 text-left">Email</th>
                              <th className="p-2 text-left">Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {cleanupResults.duplicates.results.map((result) => (
                              <tr key={result.id} className="border-t">
                                <td className="p-2">{result.name}</td>
                                <td className="p-2">{result.email}</td>
                                <td className="p-2">
                                  {result.deleted ? (
                                    <span className="text-green-600">Deleted (kept {result.keepName})</span>
                                  ) : (
                                    <span className="text-red-600">Failed: {result.error}</span>
                                  )}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                )}
              </div>
              
              <div className="mt-6 flex justify-end">
                <Button onClick={() => {
                  setCleanupResults(null);
                  setIsCleanupDialogOpen(false);
                }}>
                  Close
                </Button>
              </div>
            </div>
          ) : (
            // Confirmation view
            <div className="py-4">
              <p className="mb-4">
                This will clean up your client database by:
              </p>
              <ul className="list-disc pl-5 mb-4 space-y-2 text-sm">
                <li>Removing clients that are not connected to any projects, events, or invoices</li>
                <li>Removing duplicate clients (keeping one per email address)</li>
              </ul>
              <p className="text-amber-600 font-medium mb-6">
                This action cannot be undone.
              </p>
              
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsCleanupDialogOpen(false)}>
                  Cancel
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => cleanupClientsMutation.mutate()}
                  disabled={cleanupClientsMutation.isPending}
                >
                  {cleanupClientsMutation.isPending ? "Cleaning..." : "Clean Up Database"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
