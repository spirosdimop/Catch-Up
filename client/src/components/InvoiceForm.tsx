import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Plus, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Client, Project, Invoice } from "@shared/schema";

// Create a schema for invoice form
const invoiceFormSchema = z.object({
  clientId: z.coerce.number({
    required_error: "Client is required",
    invalid_type_error: "Client is required",
  }),
  projectId: z.coerce.number().optional(),
  amount: z.coerce.number({
    required_error: "Amount is required",
    invalid_type_error: "Amount must be a number",
  }).min(0, "Amount must be greater than or equal to 0"),
  issueDate: z.date({
    required_error: "Issue date is required",
  }),
  dueDate: z.date({
    required_error: "Due date is required",
  }),
  status: z.string({
    required_error: "Status is required",
  }),
  notes: z.string().optional(),
  items: z.array(z.object({
    description: z.string().min(1, "Description is required"),
    quantity: z.coerce.number().min(1, "Quantity must be at least 1"),
    rate: z.coerce.number().min(0, "Rate must be at least 0"),
  })).optional(),
});

type InvoiceFormValues = z.infer<typeof invoiceFormSchema>;

interface InvoiceFormProps {
  clients: Client[];
  projects: Project[];
  defaultValues?: Invoice;
  onSubmit: (data: InvoiceFormValues) => void;
  isSubmitting: boolean;
}

export default function InvoiceForm({ 
  clients, 
  projects, 
  defaultValues, 
  onSubmit, 
  isSubmitting 
}: InvoiceFormProps) {
  const [selectedClientId, setSelectedClientId] = useState<number | undefined>(
    defaultValues?.clientId
  );

  // Filter projects by selected client
  const filteredProjects = selectedClientId 
    ? projects.filter(project => project.clientId === selectedClientId)
    : [];

  // Create form with validation
  const form = useForm<InvoiceFormValues>({
    resolver: zodResolver(invoiceFormSchema),
    defaultValues: defaultValues 
      ? {
          ...defaultValues,
          issueDate: new Date(defaultValues.issueDate),
          dueDate: new Date(defaultValues.dueDate),
          amount: Number(defaultValues.amount),
          items: [],
        }
      : {
          clientId: undefined,
          projectId: undefined,
          amount: undefined,
          issueDate: new Date(),
          dueDate: new Date(new Date().setDate(new Date().getDate() + 14)), // Default to due in 14 days
          status: "Draft",
          notes: "",
          items: [{
            description: "",
            quantity: 1,
            rate: 0
          }]
        },
  });

  // Watch items to calculate total
  const items = form.watch("items") || [];
  
  // Calculate total from items
  const calculateTotal = () => {
    return items.reduce((total, item) => {
      const itemTotal = (item.quantity || 0) * (item.rate || 0);
      return total + itemTotal;
    }, 0);
  };

  // Update total amount when items change
  const updateTotalAmount = () => {
    const total = calculateTotal();
    form.setValue("amount", total);
  };

  // Add new item
  const addItem = () => {
    const currentItems = form.getValues("items") || [];
    form.setValue("items", [
      ...currentItems,
      { description: "", quantity: 1, rate: 0 }
    ]);
  };

  // Remove item
  const removeItem = (index: number) => {
    const currentItems = form.getValues("items") || [];
    form.setValue("items", currentItems.filter((_, i) => i !== index));
    updateTotalAmount();
  };

  // Handle client change
  const handleClientChange = (clientId: string) => {
    const id = parseInt(clientId);
    setSelectedClientId(id);
    form.setValue("clientId", id);
    form.setValue("projectId", undefined); // Reset project when client changes
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="clientId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Client*</FormLabel>
                <Select 
                  onValueChange={handleClientChange}
                  value={field.value?.toString()}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a client" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {clients.map((client) => (
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

          <FormField
            control={form.control}
            name="projectId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Project</FormLabel>
                <Select 
                  onValueChange={(value) => field.onChange(parseInt(value))}
                  value={field.value?.toString()}
                  disabled={!selectedClientId || filteredProjects.length === 0}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder={
                        !selectedClientId 
                          ? "Select a client first" 
                          : filteredProjects.length === 0 
                            ? "No projects for this client" 
                            : "Select a project"
                      } />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {filteredProjects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="issueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Issue Date*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "MMM d, yyyy")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="dueDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Due Date*</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "MMM d, yyyy")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                      disabled={(date) => 
                        date < form.getValues().issueDate || date < new Date("1900-01-01")
                      }
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status*</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select invoice status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Draft">Draft</SelectItem>
                    <SelectItem value="Sent">Sent</SelectItem>
                    <SelectItem value="Paid">Paid</SelectItem>
                    <SelectItem value="Overdue">Overdue</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Amount*</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    placeholder="Invoice amount" 
                    {...field}
                    value={field.value?.toString() || ""}
                    disabled={items.length > 0}
                  />
                </FormControl>
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
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Invoice notes" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-2">
          <div className="flex justify-between items-center">
            <FormLabel>Invoice Items</FormLabel>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addItem}
            >
              <Plus className="h-4 w-4 mr-1" /> Add Item
            </Button>
          </div>

          {items.map((item, index) => (
            <div key={index} className="grid grid-cols-12 gap-2 items-start border p-3 rounded-md">
              <div className="col-span-6">
                <FormField
                  control={form.control}
                  name={`items.${index}.description`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Description</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="Item description" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name={`items.${index}.quantity`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Qty</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Qty" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            updateTotalAmount();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-2">
                <FormField
                  control={form.control}
                  name={`items.${index}.rate`}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-xs">Rate</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          placeholder="Rate" 
                          {...field} 
                          onChange={(e) => {
                            field.onChange(e);
                            updateTotalAmount();
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <div className="col-span-1 pt-8">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeItem(index)}
                  className="h-8 w-8 p-0"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="col-span-1 pt-8 text-right font-medium text-sm">
                ${((item.quantity || 0) * (item.rate || 0)).toFixed(2)}
              </div>
            </div>
          ))}

          {items.length > 0 && (
            <div className="flex justify-end">
              <div className="text-base font-semibold">
                Total: ${calculateTotal().toFixed(2)}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : defaultValues ? "Update Invoice" : "Create Invoice"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
