import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Task, Project, TimeEntry, InsertTimeEntry } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest, formatDate, formatDuration, formatTimeBetween } from "@/lib/utils";
import { PlusIcon, SearchIcon, PlayIcon, PauseIcon, Pause, Clock, Calendar, Folder, PencilIcon, TrashIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TimeEntryForm from "@/components/TimeEntryForm";
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
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { format } from "date-fns";
import { cn } from "@/lib/utils";

export default function TimeTracking() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState<number | "all">("all");
  const [dateFilter, setDateFilter] = useState<Date | undefined>(undefined);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTimeEntry, setSelectedTimeEntry] = useState<TimeEntry | null>(null);
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState<number | null>(null);
  const [timerStartTime, setTimerStartTime] = useState<Date | null>(null);

  // Fetch time entries, tasks, and projects
  const { data: timeEntries, isLoading: isLoadingTimeEntries } = useQuery<TimeEntry[]>({
    queryKey: ['/api/time-entries'],
  });

  const { data: tasks } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Create time entry mutation
  const createTimeEntryMutation = useMutation({
    mutationFn: async (timeEntry: InsertTimeEntry) => {
      const res = await apiRequest("POST", "/api/time-entries", timeEntry);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-entries'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Time entry created",
        description: "The time entry has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating time entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update time entry mutation
  const updateTimeEntryMutation = useMutation({
    mutationFn: async ({ id, timeEntry }: { id: number; timeEntry: Partial<InsertTimeEntry> }) => {
      const res = await apiRequest("PATCH", `/api/time-entries/${id}`, timeEntry);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-entries'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Time entry updated",
        description: "The time entry has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating time entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete time entry mutation
  const deleteTimeEntryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/time-entries/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/time-entries'] });
      toast({
        title: "Time entry deleted",
        description: "The time entry has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting time entry",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle time entry form submission
  const handleSubmit = (data: InsertTimeEntry) => {
    if (selectedTimeEntry) {
      updateTimeEntryMutation.mutate({ id: selectedTimeEntry.id, timeEntry: data });
    } else {
      createTimeEntryMutation.mutate(data);
    }
  };

  // Handle time entry deletion
  const handleDeleteTimeEntry = (id: number) => {
    if (confirm("Are you sure you want to delete this time entry?")) {
      deleteTimeEntryMutation.mutate(id);
    }
  };

  // Start timer for a task
  const startTimer = (taskId: number) => {
    setIsTimerRunning(true);
    setActiveTaskId(taskId);
    setTimerStartTime(new Date());
    toast({
      title: "Timer started",
      description: "The timer has been started for this task.",
    });
  };

  // Stop timer and create time entry
  const stopTimer = () => {
    if (!activeTaskId || !timerStartTime) return;
    
    const endTime = new Date();
    const duration = Math.floor((endTime.getTime() - timerStartTime.getTime()) / 60000); // in minutes
    
    createTimeEntryMutation.mutate({
      taskId: activeTaskId,
      startTime: timerStartTime,
      endTime,
      duration,
      note: "Timer entry",
    });
    
    setIsTimerRunning(false);
    setActiveTaskId(null);
    setTimerStartTime(null);
  };

  // Filter time entries based on search term, project filter, and date filter
  const filteredTimeEntries = timeEntries?.filter(entry => {
    const task = tasks?.find(t => t.id === entry.taskId);
    const project = task ? projects?.find(p => p.id === task.projectId) : undefined;
    
    // Search filter (search in task title or note)
    const matchesSearch = searchTerm === "" || 
      (task?.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
       entry.note?.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Project filter
    const matchesProject = projectFilter === "all" || (project && project.id === projectFilter);
    
    // Date filter
    const matchesDate = !dateFilter || 
      (entry.startTime && new Date(entry.startTime).toDateString() === dateFilter.toDateString());
    
    return matchesSearch && matchesProject && matchesDate;
  });

  // Map time entries with task and project data
  const timeEntriesWithDetails = filteredTimeEntries?.map(entry => {
    const task = tasks?.find(t => t.id === entry.taskId);
    const project = task ? projects?.find(p => p.id === task.projectId) : undefined;
    return { ...entry, task, project };
  });

  // Group time entries by date
  const groupedTimeEntries = timeEntriesWithDetails?.reduce<Record<string, typeof timeEntriesWithDetails>>(
    (groups, entry) => {
      const date = entry.startTime 
        ? new Date(entry.startTime).toDateString() 
        : "Unknown Date";
      
      if (!groups[date]) {
        groups[date] = [];
      }
      
      groups[date].push(entry);
      return groups;
    }, 
    {}
  ) || {};

  // Calculate total duration for each day
  const calculateDailyTotal = (entries: typeof timeEntriesWithDetails) => {
    return entries.reduce((total, entry) => total + (entry.duration ? Number(entry.duration) : 0), 0);
  };

  // Sort dates in descending order (newest first)
  const sortedDates = Object.keys(groupedTimeEntries).sort(
    (a, b) => new Date(b).getTime() - new Date(a).getTime()
  );

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Time Tracking</h2>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage your time spent on various tasks
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-2">
          {isTimerRunning ? (
            <Button variant="destructive" onClick={stopTimer}>
              <Pause className="mr-2 h-4 w-4" /> Stop Timer
            </Button>
          ) : (
            <Button onClick={() => setIsAddDialogOpen(true)}>
              <PlusIcon className="mr-2 h-4 w-4" /> New Time Entry
            </Button>
          )}
        </div>
      </div>

      <div className="bg-white shadow rounded-lg mb-6">
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 mb-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search time entries..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select 
                value={projectFilter === "all" ? "all" : projectFilter.toString()} 
                onValueChange={(value) => setProjectFilter(value === "all" ? "all" : parseInt(value))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Filter by project" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects?.map(project => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full sm:w-48">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !dateFilter && "text-muted-foreground"
                    )}
                  >
                    <Calendar className="mr-2 h-4 w-4" />
                    {dateFilter ? format(dateFilter, "MMM d, yyyy") : "Filter by date"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <CalendarComponent
                    mode="single"
                    selected={dateFilter}
                    onSelect={setDateFilter}
                    initialFocus
                  />
                  {dateFilter && (
                    <div className="p-3 border-t border-gray-100">
                      <Button 
                        variant="ghost" 
                        className="w-full" 
                        onClick={() => setDateFilter(undefined)}
                      >
                        Clear date filter
                      </Button>
                    </div>
                  )}
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {activeTaskId && isTimerRunning && timerStartTime && (
            <div className="bg-primary-50 rounded-md p-4 flex justify-between items-center">
              <div>
                <h3 className="text-sm font-medium text-primary-700">
                  Timer running: {tasks?.find(t => t.id === activeTaskId)?.title}
                </h3>
                <p className="text-xs text-primary-600">Started at: {format(timerStartTime, "h:mm a")}</p>
              </div>
              <Button variant="destructive" size="sm" onClick={stopTimer}>
                <Pause className="mr-1 h-4 w-4" /> Stop
              </Button>
            </div>
          )}
        </div>
      </div>

      {isLoadingTimeEntries ? (
        <div className="space-y-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="bg-white shadow rounded-lg p-5 space-y-4">
              <Skeleton className="h-6 w-48" />
              <Skeleton className="h-4 w-24" />
              <div className="space-y-3">
                <Skeleton className="h-16 w-full" />
                <Skeleton className="h-16 w-full" />
              </div>
            </div>
          ))}
        </div>
      ) : sortedDates.length === 0 ? (
        <div className="bg-white shadow rounded-lg p-8 text-center text-gray-500">
          No time entries found. Start tracking your time!
        </div>
      ) : (
        <div className="space-y-6">
          {sortedDates.map(date => (
            <div key={date} className="bg-white shadow rounded-lg overflow-hidden">
              <div className="p-5 border-b border-gray-200 flex justify-between items-center">
                <div>
                  <h3 className="text-lg font-semibold text-gray-800">
                    {new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' })}
                  </h3>
                  <p className="text-sm text-gray-500">
                    Total: {formatDuration(calculateDailyTotal(groupedTimeEntries[date]))}
                  </p>
                </div>
              </div>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Task</TableHead>
                      <TableHead>Project</TableHead>
                      <TableHead>Start Time</TableHead>
                      <TableHead>End Time</TableHead>
                      <TableHead>Duration</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {groupedTimeEntries[date].map(entry => (
                      <TableRow key={entry.id}>
                        <TableCell>{entry.task?.title}</TableCell>
                        <TableCell>{entry.project?.name}</TableCell>
                        <TableCell>
                          {entry.startTime ? format(new Date(entry.startTime), "h:mm a") : "—"}
                        </TableCell>
                        <TableCell>
                          {entry.endTime ? format(new Date(entry.endTime), "h:mm a") : "—"}
                        </TableCell>
                        <TableCell>{formatDuration(entry.duration)}</TableCell>
                        <TableCell className="max-w-xs truncate">{entry.note || "—"}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedTimeEntry(entry);
                              setIsEditDialogOpen(true);
                            }}
                          >
                            <PencilIcon className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTimeEntry(entry.id)}
                          >
                            <TrashIcon className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Start Timer Dialog */}
      {!isTimerRunning && (
        <div className="fixed bottom-6 right-6">
          <Button 
            className="rounded-full h-14 w-14 shadow-lg"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Clock className="h-6 w-6" />
          </Button>
        </div>
      )}

      {/* Add Time Entry Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Time Entry</DialogTitle>
          </DialogHeader>
          <TimeEntryForm
            tasks={tasks || []}
            onSubmit={handleSubmit}
            isSubmitting={createTimeEntryMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Time Entry Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Time Entry</DialogTitle>
          </DialogHeader>
          {selectedTimeEntry && (
            <TimeEntryForm
              tasks={tasks || []}
              onSubmit={handleSubmit}
              isSubmitting={updateTimeEntryMutation.isPending}
              defaultValues={selectedTimeEntry}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
