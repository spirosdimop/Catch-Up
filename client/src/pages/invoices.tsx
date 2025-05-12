import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { 
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, MoreVertical, FileText, Eye, Edit, Trash2, Download } from "lucide-react";
import { Invoice, Client, InvoiceStatus } from "@shared/schema";
import { format, addDays } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const invoiceFormSchema = z.object({
  invoiceNumber: z.string().min(1, "Invoice number is required"),
  clientId: z.coerce.number({
    required_error: "Client is required",
    invalid_type_error: "Client is required",
  }),
  issueDate: z.string().min(1, "Issue date is required"),
  dueDate: z.string().min(1, "Due date is required"),
  amount: z.coerce.number().min(0, "Amount must be a positive number"),
  status: z.enum(["draft", "sent", "paid", "overdue", "canceled"], {
    required_error: "Status is required",
  }),
  notes: z.string().optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

export default function Invoices() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [deleteInvoiceId, setDeleteInvoiceId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState<Invoice | null>(null);

  const { data: invoices, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: {
      invoiceNumber: "",
      clientId: undefined,
      issueDate: format(new Date(), "yyyy-MM-dd"),
      dueDate: format(addDays(new Date(), 14), "yyyy-MM-dd"),
      amount: 0,
      status: "draft",
      notes: "",
    },
  });

  const createInvoiceMutation = useMutation({
    mutationFn: async (invoiceData: InvoiceFormValues) => {
      // Format the dates
      const formattedData = {
        ...invoiceData,
        issueDate: new Date(invoiceData.issueDate).toISOString(),
        dueDate: new Date(invoiceData.dueDate).toISOString(),
      };
      return apiRequest("POST", "/api/invoices", formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Invoice created",
        description: "The invoice has been created successfully",
      });
      setFormDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create invoice",
        variant: "destructive",
      });
    },
  });

  const updateInvoiceMutation = useMutation({
    mutationFn: async ({ id, invoiceData }: { id: number; invoiceData: InvoiceFormValues }) => {
      // Format the dates
      const formattedData = {
        ...invoiceData,
        issueDate: new Date(invoiceData.issueDate).toISOString(),
        dueDate: new Date(invoiceData.dueDate).toISOString(),
      };
      return apiRequest("PUT", `/api/invoices/${id}`, formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Invoice updated",
        description: "The invoice has been updated successfully",
      });
      setFormDialogOpen(false);
      setEditingInvoice(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update invoice",
        variant: "destructive",
      });
    },
  });

  const deleteInvoiceMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/invoices/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/invoices"] });
      toast({
        title: "Invoice deleted",
        description: "The invoice has been deleted successfully",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete invoice",
        variant: "destructive",
      });
    },
  });

  const isLoading = invoicesLoading || clientsLoading;

  // Get client name by ID
  const getClientName = (clientId: number) => {
    const client = clients?.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format status for display
  const formatStatus = (status: string) => {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return "Draft";
      case InvoiceStatus.SENT:
        return "Sent";
      case InvoiceStatus.PAID:
        return "Paid";
      case InvoiceStatus.OVERDUE:
        return "Overdue";
      case InvoiceStatus.CANCELED:
        return "Canceled";
      default:
        return status;
    }
  };

  // Get status style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case InvoiceStatus.DRAFT:
        return "bg-gray-100 text-gray-800";
      case InvoiceStatus.SENT:
        return "bg-blue-100 text-blue-800";
      case InvoiceStatus.PAID:
        return "bg-green-100 text-green-800";
      case InvoiceStatus.OVERDUE:
        return "bg-red-100 text-red-800";
      case InvoiceStatus.CANCELED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter invoices based on search query and status filter
  const filteredInvoices = invoices?.filter(invoice => {
    // Text search
    const matchesSearch = !searchQuery || 
      invoice.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      getClientName(invoice.clientId).toLowerCase().includes(searchQuery.toLowerCase());
    
    // Status filter
    const matchesStatus = !statusFilter || invoice.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const handleDeleteClick = (id: number) => {
    setDeleteInvoiceId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteInvoiceId) {
      deleteInvoiceMutation.mutate(deleteInvoiceId);
    }
  };

  const openEditDialog = (invoice: Invoice) => {
    setEditingInvoice(invoice);
    form.reset({
      invoiceNumber: invoice.invoiceNumber,
      clientId: invoice.clientId,
      issueDate: format(new Date(invoice.issueDate), "yyyy-MM-dd"),
      dueDate: format(new Date(invoice.dueDate), "yyyy-MM-dd"),
      amount: invoice.amount,
      status: invoice.status,
      notes: invoice.notes || "",
    });
    setFormDialogOpen(true);
  };

  const openNewInvoiceDialog = () => {
    setEditingInvoice(null);
    
    // Generate a new invoice number (simple implementation)
    const nextInvoiceNumber = `INV-${new Date().getFullYear()}-${String(invoices?.length || 0 + 1).padStart(3, '0')}`;
    
    form.reset({
      invoiceNumber: nextInvoiceNumber,
      clientId: undefined,
      issueDate: format(new Date(), "yyyy-MM-dd"),
      dueDate: format(addDays(new Date(), 14), "yyyy-MM-dd"),
      amount: 0,
      status: "draft",
      notes: "",
    });
    
    setFormDialogOpen(true);
  };

  const onSubmit = (values: InvoiceFormValues) => {
    if (editingInvoice) {
      updateInvoiceMutation.mutate({ id: editingInvoice.id, invoiceData: values });
    } else {
      createInvoiceMutation.mutate(values);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Invoices</h2>
          <p className="mt-1 text-sm text-gray-500">Manage your invoices and payments</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={openNewInvoiceDialog}>
            <Plus className="mr-2 h-4 w-4" /> New Invoice
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search invoices..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value="draft">Draft</SelectItem>
                  <SelectItem value="sent">Sent</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-gray-500">Loading invoices...</div>
          ) : filteredInvoices && filteredInvoices.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Invoice #</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Issue Date</TableHead>
                  <TableHead>Due Date</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="w-[120px]">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
                    <TableCell className="font-medium">{invoice.invoiceNumber}</TableCell>
                    <TableCell>{getClientName(invoice.clientId)}</TableCell>
                    <TableCell>{format(new Date(invoice.issueDate), "MMM d, yyyy")}</TableCell>
                    <TableCell>{format(new Date(invoice.dueDate), "MMM d, yyyy")}</TableCell>
                    <TableCell>{formatCurrency(invoice.amount)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusStyle(invoice.status)}`}>
                        {formatStatus(invoice.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button variant="ghost" size="icon" title="View Invoice">
                          <Eye className="h-4 w-4" />
                        </Button>
                        <Button variant="ghost" size="icon" title="Download Invoice">
                          <Download className="h-4 w-4" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => openEditDialog(invoice)}>
                              <Edit className="h-4 w-4 mr-2" /> Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              className="text-red-600"
                              onClick={() => handleDeleteClick(invoice.id)}
                            >
                              <Trash2 className="h-4 w-4 mr-2" /> Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-10 text-center text-gray-500">
              {searchQuery || statusFilter
                ? "No invoices found matching your filters" 
                : "No invoices yet. Create your first invoice!"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this invoice?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the invoice and all associated items.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteInvoiceMutation.isPending}>
              {deleteInvoiceMutation.isPending ? "Deleting..." : "Delete Invoice"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Invoice Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>{editingInvoice ? "Edit Invoice" : "Create New Invoice"}</DialogTitle>
            <DialogDescription>
              {editingInvoice 
                ? "Update the invoice details below." 
                : "Enter the details for the new invoice."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Invoice Number</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <FileText className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                          <Input className="pl-8" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="clientId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client</FormLabel>
                      <Select
                        value={field.value?.toString() || ""}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select a client" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {clients?.map((client) => (
                            <SelectItem key={client.id} value={client.id.toString()}>
                              {client.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="issueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Issue Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="dueDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Due Date</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="amount"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Amount</FormLabel>
                      <FormControl>
                        <div className="relative">
                          <span className="absolute left-2.5 top-2.5 text-gray-500">$</span>
                          <Input className="pl-8" type="number" step="0.01" min="0" {...field} />
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={field.onChange}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select status" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="draft">Draft</SelectItem>
                          <SelectItem value="sent">Sent</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="overdue">Overdue</SelectItem>
                          <SelectItem value="canceled">Canceled</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <FormField
                control={form.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Notes (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="Add any additional notes here" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setFormDialogOpen(false)}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit"
                  disabled={createInvoiceMutation.isPending || updateInvoiceMutation.isPending}
                >
                  {(createInvoiceMutation.isPending || updateInvoiceMutation.isPending)
                    ? "Saving..."
                    : editingInvoice ? "Update Invoice" : "Create Invoice"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
