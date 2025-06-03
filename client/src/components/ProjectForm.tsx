import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useEffect } from "react";
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
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";
import { cn } from "@/lib/utils";
import { Client, Project, ProjectStatus } from "@shared/schema";

// Create a schema for project form
const projectFormSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  description: z.string().nullable().optional(),
  clientId: z.coerce.number().nullable().optional(), // Made optional for personal projects
  startDate: z.union([z.date(), z.string(), z.null()]).optional(),
  endDate: z.union([z.date(), z.string(), z.null()]).optional(),
  budget: z.coerce.number().nullable().optional(),
  status: z.enum([
    ProjectStatus.NOT_STARTED,
    ProjectStatus.IN_PROGRESS,
    ProjectStatus.ON_HOLD,
    ProjectStatus.COMPLETED
  ], {
    required_error: "Status is required",
  }),
}).transform(data => {
  // This ensures the form delivers the data in the format the server expects
  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return null;
    if (date instanceof Date) return date.toISOString();
    return date; // If it's already a string, return as is
  };

  return {
    ...data,
    startDate: formatDate(data.startDate),
    endDate: formatDate(data.endDate),
  };
});

// Type with dates as strings for form submission
type ProjectFormValues = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  clients: Client[];
  defaultValues?: Project;
  onSubmit: (data: any) => void; // Use any to work around type transformations
  isSubmitting: boolean;
}

export default function ProjectForm({ clients, defaultValues, onSubmit, isSubmitting }: ProjectFormProps) {
  // Create form with validation
  // Always set today's date for new projects
  const today = new Date();
  today.setHours(0, 0, 0, 0); // Reset time portion to ensure consistency
  const todayISOString = today.toISOString();
  
  const form = useForm<z.infer<typeof projectFormSchema>>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: defaultValues 
      ? {
          ...defaultValues,
          // Convert date strings or Date objects to the format expected by the form
          startDate: defaultValues.startDate 
            ? (typeof defaultValues.startDate === 'string' 
                ? defaultValues.startDate 
                : defaultValues.startDate.toISOString())
            : todayISOString, // Default to today if no start date
          endDate: defaultValues.endDate 
            ? (typeof defaultValues.endDate === 'string'
                ? defaultValues.endDate
                : defaultValues.endDate.toISOString())
            : null,
          budget: defaultValues.budget ? Number(defaultValues.budget) : undefined,
        }
      : {
          name: "",
          description: "",
          clientId: null, // Default to personal project
          startDate: todayISOString, // Always use today's date for new projects
          endDate: null,
          budget: undefined,
          status: ProjectStatus.IN_PROGRESS,
        },
  });
  


  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Project Name*</FormLabel>
              <FormControl>
                <Input placeholder="Project name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Project description" 
                  {...field} 
                  value={field.value || ""}
                />
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
                onValueChange={(value) => field.onChange(value === "personal" ? null : parseInt(value))}
                value={field.value ? field.value.toString() : "personal"}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select client or personal project" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  <SelectItem value="personal">Personal Project</SelectItem>
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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Start Date*</FormLabel>
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
                          format(
                            typeof field.value === 'string' 
                              ? new Date(field.value) 
                              : field.value, 
                            "MMM d, yyyy"
                          )
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
                      selected={
                        field.value 
                          ? (typeof field.value === 'string'
                              ? new Date(field.value)
                              : field.value)
                          : undefined
                      }
                      onSelect={(date) => field.onChange(date ? date.toISOString() : null)}
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
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>End Date</FormLabel>
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
                          format(
                            typeof field.value === 'string' 
                              ? new Date(field.value) 
                              : field.value, 
                            "MMM d, yyyy"
                          )
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
                      selected={
                        field.value 
                          ? (typeof field.value === 'string'
                              ? new Date(field.value)
                              : field.value)
                          : undefined
                      }
                      onSelect={(date) => field.onChange(date ? date.toISOString() : null)}
                      initialFocus
                      disabled={(date) => {
                        const startDate = form.getValues().startDate;
                        // Handle different date formats
                        const compareDate = startDate 
                          ? typeof startDate === 'string'
                              ? new Date(startDate)
                              : startDate
                          : null;
                          
                        return (compareDate && date < compareDate) || 
                          date < new Date("1900-01-01");
                      }}
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
            name="budget"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Budget</FormLabel>
                <FormControl>
                  <Input 
                    type="number"
                    placeholder="Budget amount" 
                    {...field}
                    value={field.value?.toString() || ""}
                  />
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
                <FormLabel>Status*</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value={ProjectStatus.NOT_STARTED}>Not Started</SelectItem>
                    <SelectItem value={ProjectStatus.IN_PROGRESS}>In Progress</SelectItem>
                    <SelectItem value={ProjectStatus.ON_HOLD}>On Hold</SelectItem>
                    <SelectItem value={ProjectStatus.COMPLETED}>Completed</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : defaultValues ? "Update Project" : "Create Project"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
