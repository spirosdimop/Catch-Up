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
import { useQuery } from "@tanstack/react-query";
import { Project, Task, TimeEntry } from "@shared/schema";

// Create a schema for time entry form
const timeEntryFormSchema = z.object({
  taskId: z.coerce.number({
    required_error: "Task is required",
    invalid_type_error: "Task is required",
  }),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().min(1, "End time is required"),
  note: z.string().optional(),
});

type TimeEntryFormValues = z.infer<typeof timeEntryFormSchema>;

interface TimeEntryFormProps {
  tasks: Task[];
  defaultValues?: TimeEntry;
  onSubmit: (data: any) => void;
  isSubmitting: boolean;
}

export default function TimeEntryForm({ 
  tasks, 
  defaultValues, 
  onSubmit, 
  isSubmitting 
}: TimeEntryFormProps) {
  // Fetch projects to map with tasks
  const { data: projects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Create a mapping of tasks with their project names
  const tasksWithProjectNames = tasks.map(task => {
    const project = projects?.find(p => p.id === task.projectId);
    return {
      ...task,
      projectName: project?.name || 'Unknown Project'
    };
  });

  // Format date for input
  const formatDateTimeForInput = (dateTime: Date | string | null | undefined) => {
    if (!dateTime) return '';
    const date = new Date(dateTime);
    return date.toISOString().slice(0, 16); // Format as YYYY-MM-DDTHH:MM
  };

  // Calculate duration in minutes between start and end times
  const calculateDuration = (start: string, end: string) => {
    const startDate = new Date(start);
    const endDate = new Date(end);
    const diffMs = endDate.getTime() - startDate.getTime();
    return Math.floor(diffMs / 60000); // Convert to minutes
  };

  // Create form with validation
  const form = useForm<TimeEntryFormValues>({
    resolver: zodResolver(timeEntryFormSchema),
    defaultValues: defaultValues 
      ? {
          taskId: defaultValues.taskId,
          startTime: formatDateTimeForInput(defaultValues.startTime),
          endTime: formatDateTimeForInput(defaultValues.endTime),
          note: defaultValues.note || '',
        }
      : {
          taskId: undefined,
          startTime: formatDateTimeForInput(new Date()),
          endTime: '',
          note: '',
        },
  });

  // Handle form submission
  const handleFormSubmit = (data: TimeEntryFormValues) => {
    // Calculate duration
    const duration = calculateDuration(data.startTime, data.endTime);
    
    // Add duration to the data
    const submissionData = {
      ...data,
      duration,
      startTime: new Date(data.startTime),
      endTime: new Date(data.endTime),
    };
    
    onSubmit(submissionData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="taskId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task*</FormLabel>
              <Select 
                onValueChange={(value) => field.onChange(parseInt(value))}
                value={field.value?.toString()}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a task" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {tasksWithProjectNames.map((task) => (
                    <SelectItem key={task.id} value={task.id.toString()}>
                      {task.title} ({task.projectName})
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
            name="startTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time*</FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local" 
                    {...field} 
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endTime"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time*</FormLabel>
                <FormControl>
                  <Input 
                    type="datetime-local" 
                    {...field} 
                    min={form.getValues().startTime}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="note"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Notes about this time entry" 
                  {...field} 
                  value={field.value || ""}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end pt-4">
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Saving..." : defaultValues ? "Update Time Entry" : "Create Time Entry"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
