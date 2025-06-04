import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Invoice, Client, Project, InsertInvoice, InvoiceItem } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest, formatDate, formatCurrency, getStatusColor } from "@/lib/utils";
import { PlusIcon, SearchIcon, FileTextIcon, PencilIcon, TrashIcon, ArrowDownIcon, ArrowUpIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import InvoiceForm from "@/components/InvoiceForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Invoices() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);

  // Fetch invoices, clients, and projects
  const { data: invoices, isLoading: isLoadingInvoices } = useQuery<Invoice[]>({
    queryKey: ['/api/invoices'],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Create invoice mutation
  const createInvoiceMutation = useMutation({
    mutationFn: async (invoice: InsertInvoice) => {
      const res = await apiRequest("POST", "/api/invoices", invoice);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Invoice created",
        description: "The invoice has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating invoice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update invoice mutation
  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ id, invoice }: { id: number; invoice: Partial<InsertInvoice> }) => {
      const res = await apiRequest("PATCH", `/api/invoices/${id}`, invoice);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Invoice updated",
        description: "The invoice has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating invoice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete invoice mutation
  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/invoices/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/invoices'] });
      toast({
        title: "Invoice deleted",
        description: "The invoice has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting invoice",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle invoice form submission
  const handleSubmit = (data: InsertInvoice) => {
    if (selectedInvoice) {
      updateInvoiceMutation.mutate({ id: selectedInvoice.id, invoice: data });
    } else {
      createInvoiceMutation.mutate(data);
    }
  };

  // Handle invoice deletion
  const handleDeleteInvoice = (id: number) => {
    if (confirm("Are you sure you want to delete this invoice?")) {
      deleteInvoiceMutation.mutate(id);
    }
  };

  // Filter invoices based on search term and status filter
  const filteredInvoices = invoices?.filter(invoice => {
    // Get client and project for search
    const client = clients?.find(c => c.id === invoice.clientId);
    const project = invoice.projectId ? projects?.find(p => p.id === invoice.projectId) : null;
    
    // Search filter
    const matchesSearch = searchTerm === "" || 
      (client?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
       project?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
       invoice.id.toString().includes(searchTerm));
    
    // Status filter
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Map invoices with client and project data
  const invoicesWithDetails = filteredInvoices?.map(invoice => {
    const client = clients?.find(c => c.id === invoice.clientId);
    const project = invoice.projectId ? projects?.find(p => p.id === invoice.projectId) : null;
    return { ...invoice, client, project };
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Invoices</h2>
          <p className="mt-1 text-sm text-gray-500">
            Create and manage invoices for your clients
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => {
            setSelectedInvoice(null);
            setIsAddDialogOpen(true);
          }}>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Invoice
          </Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search invoices..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="Draft">Draft</SelectItem>
                  <SelectItem value="Sent">Sent</SelectItem>
                  <SelectItem value="Paid">Paid</SelectItem>
                  <SelectItem value="Overdue">Overdue</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isLoadingInvoices ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Project</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {invoicesWithDetails?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                      No invoices found. Create your first invoice to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  invoicesWithDetails?.map((invoice) => (
                    <TableRow key={invoice.id}>
                      <TableCell className="font-medium">INV-{invoice.id.toString().padStart(4, '0')}</TableCell>
                      <TableCell>{invoice.client?.name}</TableCell>
                      <TableCell>{invoice.project?.name || '-'}</TableCell>
                      <TableCell>{formatDate(invoice.issueDate)}</TableCell>
                      <TableCell>{formatDate(invoice.dueDate)}</TableCell>
                      <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getStatusColor(invoice.status)}-100 text-${getStatusColor(invoice.status)}-800`}>
                          {invoice.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedInvoice(invoice);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteInvoice(invoice.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add Invoice Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create New Invoice</DialogTitle>
            <DialogDescription>
              Create a new invoice for your client. Fill in the project details and add line items for services rendered.
            </DialogDescription>
          </DialogHeader>
          <InvoiceForm
            clients={clients || []}
            projects={projects || []}
            onSubmit={handleSubmit}
            isSubmitting={createInvoiceMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Invoice Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Invoice</DialogTitle>
            <DialogDescription>
              Update the invoice details, line items, and status. Changes will be saved automatically.
            </DialogDescription>
          </DialogHeader>
          {selectedInvoice && (
            <InvoiceForm
              clients={clients || []}
              projects={projects || []}
              onSubmit={handleSubmit}
              isSubmitting={updateInvoiceMutation.isPending}
              defaultValues={selectedInvoice}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
