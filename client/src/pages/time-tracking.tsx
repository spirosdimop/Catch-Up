import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
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
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage 
} from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Plus, Search, MoreVertical, Play, Pause, OctagonMinus, Clock, Edit, Trash2 } from "lucide-react";
import { TimeEntry, Project, Task } from "@shared/schema";
import { format, differenceInMinutes } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const timeEntryFormSchema = z.object({
  projectId: z.coerce.number({
    required_error: "Project is required",
    invalid_type_error: "Project is required",
  }),
  taskId: z.coerce.number().optional(),
  description: z.string().optional(),
  startTime: z.string().min(1, "Start time is required"),
  endTime: z.string().optional(),
  duration: z.coerce.number().optional(),
});

type TimeEntryFormValues = z.infer<typeof timeEntryFormSchema>;

export default function TimeTracking() {
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [projectFilter, setProjectFilter] = useState<string | undefined>(undefined);
  const [deleteTimeEntryId, setDeleteTimeEntryId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [editingTimeEntry, setEditingTimeEntry] = useState<TimeEntry | null>(null);
  
  // For active timer
  const [activeTimer, setActiveTimer] = useState<{
    projectId: number;
    taskId?: number;
    description?: string;
    startTime: Date;
  } | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0); // in seconds
  
  const { data: timeEntries, isLoading: timeEntriesLoading } = useQuery<TimeEntry[]>({
    queryKey: ["/api/time-entries"],
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const form = useForm<TimeEntryFormValues>({
    resolver: zodResolver(timeEntryFormSchema),
    defaultValues: {
      projectId: undefined,
      taskId: undefined,
      description: "",
      startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endTime: "",
      duration: undefined,
    },
  });

  const createTimeEntryMutation = useMutation({
    mutationFn: async (timeEntryData: TimeEntryFormValues) => {
      // Format the times
      const formattedData = {
        ...timeEntryData,
        startTime: new Date(timeEntryData.startTime).toISOString(),
        endTime: timeEntryData.endTime ? new Date(timeEntryData.endTime).toISOString() : undefined,
      };
      return apiRequest("POST", "/api/time-entries", formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      toast({
        title: "Time entry created",
        description: "The time entry has been created successfully",
      });
      setFormDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to create time entry",
        variant: "destructive",
      });
    },
  });

  const updateTimeEntryMutation = useMutation({
    mutationFn: async ({ id, timeEntryData }: { id: number; timeEntryData: TimeEntryFormValues }) => {
      // Format the times
      const formattedData = {
        ...timeEntryData,
        startTime: new Date(timeEntryData.startTime).toISOString(),
        endTime: timeEntryData.endTime ? new Date(timeEntryData.endTime).toISOString() : undefined,
      };
      return apiRequest("PUT", `/api/time-entries/${id}`, formattedData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      toast({
        title: "Time entry updated",
        description: "The time entry has been updated successfully",
      });
      setFormDialogOpen(false);
      setEditingTimeEntry(null);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to update time entry",
        variant: "destructive",
      });
    },
  });

  const deleteTimeEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/time-entries/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/time-entries"] });
      toast({
        title: "Time entry deleted",
        description: "The time entry has been deleted successfully",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete time entry",
        variant: "destructive",
      });
    },
  });

  const isLoading = timeEntriesLoading || projectsLoading || tasksLoading;

  // Get project name by ID
  const getProjectName = (projectId: number) => {
    const project = projects?.find((p) => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  // Get task name by ID
  const getTaskName = (taskId?: number) => {
    if (!taskId) return "";
    const task = tasks?.find((t) => t.id === taskId);
    return task?.title || "Unknown Task";
  };

  // Format duration in minutes to hours and minutes
  const formatDuration = (minutes?: number) => {
    if (!minutes) return "00:00";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
  };

  // Format timer display
  const formatTimerDisplay = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Format timespan
  const formatTimespan = (startTime: Date, endTime?: Date) => {
    const start = format(new Date(startTime), "h:mm a");
    if (!endTime) return `${start} - Present`;
    const end = format(new Date(endTime), "h:mm a");
    return `${start} - ${end}`;
  };

  // Filter time entries based on search query and project filter
  const filteredTimeEntries = timeEntries?.filter(entry => {
    // Project filter
    const matchesProject = !projectFilter || entry.projectId.toString() === projectFilter;
    
    // Text search
    const matchesSearch = !searchQuery || 
      getProjectName(entry.projectId).toLowerCase().includes(searchQuery.toLowerCase()) ||
      (entry.description && entry.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (entry.taskId && getTaskName(entry.taskId).toLowerCase().includes(searchQuery.toLowerCase()));
    
    return matchesProject && matchesSearch;
  });

  // Group time entries by date
  const groupedTimeEntries = filteredTimeEntries?.reduce((groups, entry) => {
    const date = format(new Date(entry.startTime), "yyyy-MM-dd");
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, TimeEntry[]>);

  const handleDeleteClick = (id: number) => {
    setDeleteTimeEntryId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteTimeEntryId) {
      deleteTimeEntryMutation.mutate(deleteTimeEntryId);
    }
  };

  const openEditDialog = (timeEntry: TimeEntry) => {
    setEditingTimeEntry(timeEntry);
    form.reset({
      projectId: timeEntry.projectId,
      taskId: timeEntry.taskId,
      description: timeEntry.description || "",
      startTime: format(new Date(timeEntry.startTime), "yyyy-MM-dd'T'HH:mm"),
      endTime: timeEntry.endTime ? format(new Date(timeEntry.endTime), "yyyy-MM-dd'T'HH:mm") : "",
      duration: timeEntry.duration,
    });
    setFormDialogOpen(true);
  };

  const openNewTimeEntryDialog = () => {
    setEditingTimeEntry(null);
    form.reset({
      projectId: undefined,
      taskId: undefined,
      description: "",
      startTime: format(new Date(), "yyyy-MM-dd'T'HH:mm"),
      endTime: "",
      duration: undefined,
    });
    setFormDialogOpen(true);
  };

  const onSubmit = (values: TimeEntryFormValues) => {
    // Calculate duration if both start and end times are provided
    if (values.startTime && values.endTime) {
      const start = new Date(values.startTime);
      const end = new Date(values.endTime);
      values.duration = differenceInMinutes(end, start);
    }
    
    if (editingTimeEntry) {
      updateTimeEntryMutation.mutate({ id: editingTimeEntry.id, timeEntryData: values });
    } else {
      createTimeEntryMutation.mutate(values);
    }
  };

  // Timer controls
  const startTimer = (projectId: number, taskId?: number, description?: string) => {
    if (activeTimer) {
      // OctagonMinus the current timer before starting a new one
      stopTimer();
    }
    
    const startTime = new Date();
    setActiveTimer({
      projectId,
      taskId,
      description,
      startTime,
    });
    
    // Start the timer
    setElapsedTime(0);
    const timerInterval = setInterval(() => {
      setElapsedTime(prev => prev + 1);
    }, 1000);
    
    // Store the interval ID
    window.timerInterval = timerInterval;
  };

  const pauseTimer = () => {
    if (window.timerInterval) {
      clearInterval(window.timerInterval);
      window.timerInterval = undefined;
    }
  };

  const resumeTimer = () => {
    if (activeTimer && !window.timerInterval) {
      const timerInterval = setInterval(() => {
        setElapsedTime(prev => prev + 1);
      }, 1000);
      window.timerInterval = timerInterval;
    }
  };

  const stopTimer = () => {
    if (activeTimer) {
      pauseTimer();
      
      // Create a new time entry with the timer data
      const endTime = new Date();
      const duration = Math.floor(elapsedTime / 60); // Convert seconds to minutes
      
      createTimeEntryMutation.mutate({
        projectId: activeTimer.projectId,
        taskId: activeTimer.taskId,
        description: activeTimer.description,
        startTime: activeTimer.startTime.toISOString(),
        endTime: endTime.toISOString(),
        duration,
      });
      
      setActiveTimer(null);
      setElapsedTime(0);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Time Tracking</h2>
          <p className="mt-1 text-sm text-gray-500">Track your time on projects and tasks</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button onClick={openNewTimeEntryDialog}>
            <Plus className="mr-2 h-4 w-4" /> New Time Entry
          </Button>
        </div>
      </div>

      {/* Active Timer Card */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <h3 className="text-lg font-semibold">Timer</h3>
        </CardHeader>
        <CardContent>
          {activeTimer ? (
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h4 className="text-lg font-medium">{getProjectName(activeTimer.projectId)}</h4>
                {activeTimer.taskId && (
                  <p className="text-sm text-gray-600">{getTaskName(activeTimer.taskId)}</p>
                )}
                {activeTimer.description && (
                  <p className="text-sm text-gray-500 mt-1">{activeTimer.description}</p>
                )}
              </div>
              <div className="flex items-center gap-4">
                <div className="text-2xl font-bold">{formatTimerDisplay(elapsedTime)}</div>
                <div className="flex space-x-2">
                  {window.timerInterval ? (
                    <Button size="icon" variant="outline" onClick={pauseTimer}>
                      <Pause className="h-4 w-4" />
                    </Button>
                  ) : (
                    <Button size="icon" variant="outline" onClick={resumeTimer}>
                      <Play className="h-4 w-4" />
                    </Button>
                  )}
                  <Button size="icon" variant="destructive" onClick={stopTimer}>
                    <OctagonMinus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row items-center gap-4">
              <div className="w-full md:flex-1">
                <Select onValueChange={(value) => {
                  const projectId = parseInt(value);
                  if (!isNaN(projectId)) {
                    startTimer(projectId);
                  }
                }}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a project to start tracking" />
                  </SelectTrigger>
                  <SelectContent>
                    {projects?.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <Button 
                className="w-full md:w-auto"
                onClick={() => {
                  if (projects && projects.length > 0) {
                    startTimer(projects[0].id);
                  } else {
                    toast({
                      title: "No projects available",
                      description: "Please create a project first",
                      variant: "destructive",
                    });
                  }
                }}
              >
                <Play className="mr-2 h-4 w-4" /> Start Timer
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Time Entries List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search time entries..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Projects</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-gray-500">Loading time entries...</div>
          ) : groupedTimeEntries && Object.keys(groupedTimeEntries).length > 0 ? (
            <div className="space-y-6">
              {Object.entries(groupedTimeEntries)
                .sort((a, b) => new Date(b[0]).getTime() - new Date(a[0]).getTime()) // Sort by date (newest first)
                .map(([date, entries]) => (
                  <div key={date} className="space-y-3">
                    <h3 className="text-sm font-medium text-gray-900">
                      {format(new Date(date), "EEEE, MMMM d, yyyy")}
                    </h3>
                    
                    <div className="space-y-2">
                      {entries
                        .sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()) // Sort by start time (newest first)
                        .map((entry) => (
                          <div key={entry.id} className="bg-gray-50 rounded-md p-4 hover:bg-gray-100 transition-colors duration-150">
                            <div className="flex flex-col md:flex-row md:items-start justify-between">
                              <div>
                                <h4 className="text-sm font-medium text-gray-900">{getProjectName(entry.projectId)}</h4>
                                {entry.taskId && (
                                  <p className="text-xs text-gray-600">{getTaskName(entry.taskId)}</p>
                                )}
                                {entry.description && (
                                  <p className="text-xs text-gray-500 mt-1">{entry.description}</p>
                                )}
                              </div>
                              <div className="flex md:flex-col items-start md:items-end mt-2 md:mt-0">
                                <div className="text-sm font-medium mr-4 md:mr-0 md:mb-1">{formatDuration(entry.duration)}</div>
                                <div className="flex items-center text-xs text-gray-500">
                                  <Clock className="h-3 w-3 mr-1" />
                                  <span>{formatTimespan(entry.startTime, entry.endTime)}</span>
                                </div>
                              </div>
                            </div>
                            <div className="flex justify-end mt-2">
                              <Button variant="ghost" size="sm" onClick={() => openEditDialog(entry)}>
                                <Edit className="h-3 w-3 mr-1" /> Edit
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="sm" 
                                className="text-red-600" 
                                onClick={() => handleDeleteClick(entry.id)}
                              >
                                <Trash2 className="h-3 w-3 mr-1" /> Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                    </div>
                    
                    <div className="border-t border-gray-200 mt-2 pt-2 flex justify-between">
                      <span className="text-xs text-gray-500">
                        {entries.length} {entries.length === 1 ? 'entry' : 'entries'}
                      </span>
                      <span className="text-xs font-medium">
                        Total: {formatDuration(entries.reduce((sum, entry) => sum + (entry.duration || 0), 0))}
                      </span>
                    </div>
                  </div>
                ))}
            </div>
          ) : (
            <div className="py-10 text-center text-gray-500">
              {searchQuery || projectFilter
                ? "No time entries found matching your filters" 
                : "No time entries yet. Start tracking your time!"}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this time entry?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the time entry.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteTimeEntryMutation.isPending}>
              {deleteTimeEntryMutation.isPending ? "Deleting..." : "Delete Time Entry"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Time Entry Dialog */}
      <Dialog open={formDialogOpen} onOpenChange={setFormDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{editingTimeEntry ? "Edit Time Entry" : "Create New Time Entry"}</DialogTitle>
            <DialogDescription>
              {editingTimeEntry 
                ? "Update the time entry details below." 
                : "Enter the details for the new time entry."}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="projectId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project</FormLabel>
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a project" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {projects?.map((project) => (
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
              
              <FormField
                control={form.control}
                name="taskId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task (Optional)</FormLabel>
                    <Select
                      value={field.value?.toString() || ""}
                      onValueChange={field.onChange}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a task" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No task</SelectItem>
                        {tasks?.filter(task => form.getValues("projectId") === undefined || 
                                              task.projectId === form.getValues("projectId"))
                               .map((task) => (
                          <SelectItem key={task.id} value={task.id.toString()}>
                            {task.title}
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
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description (Optional)</FormLabel>
                    <FormControl>
                      <Textarea placeholder="What were you working on?" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
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
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input type="datetime-local" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
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
                  disabled={createTimeEntryMutation.isPending || updateTimeEntryMutation.isPending}
                >
                  {(createTimeEntryMutation.isPending || updateTimeEntryMutation.isPending)
                    ? "Saving..."
                    : editingTimeEntry ? "Update Time Entry" : "Create Time Entry"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
