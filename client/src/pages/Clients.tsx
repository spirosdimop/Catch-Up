import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Client, InsertClient } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/utils";
import { PlusIcon, SearchIcon, TrashIcon, PencilIcon, UserIcon, MailIcon, PhoneIcon, BuildingIcon, MapPinIcon } from "lucide-react";
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
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);

  // Fetch clients
  const { data: clients, isLoading } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    onSuccess: (data) => {
      console.log("Clients loaded successfully:", data);
    },
    onError: (error) => {
      console.error("Error loading clients:", error);
    }
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
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
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
      const res = await apiRequest("PATCH", `/api/clients/${id}`, client);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Client updated",
        description: "The client has been updated successfully.",
      });
    },
    onError: (error) => {
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
      await apiRequest("DELETE", `/api/clients/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      toast({
        title: "Client deleted",
        description: "The client has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting client",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle client form submission
  const handleSubmit = (data: InsertClient) => {
    if (selectedClient) {
      updateClientMutation.mutate({ id: selectedClient.id, client: data });
    } else {
      createClientMutation.mutate(data);
    }
  };

  // Handle client deletion
  const handleDeleteClient = (id: number) => {
    if (confirm("Are you sure you want to delete this client?")) {
      deleteClientMutation.mutate(id);
    }
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
        <div className="mt-4 md:mt-0">
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
                <CardContent className="p-6 relative">
                  <div className="absolute top-4 right-4 flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedClient(client);
                        setIsEditDialogOpen(true);
                      }}
                    >
                      <PencilIcon className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteClient(client.id)}
                    >
                      <TrashIcon className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <h3 className="text-lg font-semibold text-gray-900 mb-3">{client.name}</h3>
                  
                  <div className="space-y-2 text-sm">
                    {client.company && (
                      <div className="flex items-center text-gray-600">
                        <BuildingIcon className="h-4 w-4 mr-2" />
                        {client.company}
                      </div>
                    )}
                    <div className="flex items-center text-gray-600">
                      <MailIcon className="h-4 w-4 mr-2" />
                      {client.email}
                    </div>
                    {client.phone && (
                      <div className="flex items-center text-gray-600">
                        <PhoneIcon className="h-4 w-4 mr-2" />
                        {client.phone}
                      </div>
                    )}
                    {client.address && (
                      <div className="flex items-center text-gray-600">
                        <MapPinIcon className="h-4 w-4 mr-2" />
                        {client.address}
                      </div>
                    )}
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
    </div>
  );
}
