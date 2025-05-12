import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Task, Project, InsertTask } from "@shared/schema";
import { queryClient } from "@/lib/queryClient";
import { apiRequest, formatDate, getPriorityColor } from "@/lib/utils";
import { PlusIcon, SearchIcon, CheckCircleIcon, Circle, PencilIcon, TrashIcon, FilterIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TaskForm from "@/components/TaskForm";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";

export default function Tasks() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [projectFilter, setProjectFilter] = useState<number | "all">("all");
  const [currentTab, setCurrentTab] = useState<string>("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);

  // Fetch tasks and projects
  const { data: tasks, isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  const { data: projects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (task: InsertTask) => {
      const res = await apiRequest("POST", "/api/tasks", task);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setIsAddDialogOpen(false);
      toast({
        title: "Task created",
        description: "The task has been created successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error creating task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, task }: { id: number; task: Partial<InsertTask> }) => {
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, task);
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      setIsEditDialogOpen(false);
      toast({
        title: "Task updated",
        description: "The task has been updated successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error updating task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Toggle task completion mutation
  const toggleTaskCompletionMutation = useMutation({
    mutationFn: async (id: number) => {
      const res = await apiRequest("POST", `/api/tasks/${id}/toggle`, {});
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
    },
    onError: (error) => {
      toast({
        title: "Error toggling task completion",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/tasks/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
    },
    onError: (error) => {
      toast({
        title: "Error deleting task",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle task form submission
  const handleSubmit = (data: InsertTask) => {
    if (selectedTask) {
      updateTaskMutation.mutate({ id: selectedTask.id, task: data });
    } else {
      createTaskMutation.mutate(data);
    }
  };

  // Handle task deletion
  const handleDeleteTask = (id: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(id);
    }
  };

  // Handle task completion toggle
  const handleToggleTaskCompletion = (id: number) => {
    toggleTaskCompletionMutation.mutate(id);
  };

  // Filter tasks based on search term, project filter, and current tab
  const filteredTasks = tasks?.filter(task => {
    // Search filter
    const matchesSearch = searchTerm === "" || 
      task.title.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Project filter
    const matchesProject = projectFilter === "all" || task.projectId === projectFilter;
    
    // Tab filter (status)
    let matchesTab = true;
    if (currentTab !== "all") {
      if (currentTab === "completed") {
        matchesTab = task.completed;
      } else {
        matchesTab = task.status.toLowerCase() === currentTab.toLowerCase() && !task.completed;
      }
    }
    
    return matchesSearch && matchesProject && matchesTab;
  });

  // Map tasks with project data
  const tasksWithProjects = filteredTasks?.map(task => {
    const project = projects?.find(p => p.id === task.projectId);
    return { ...task, project };
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Tasks</h2>
          <p className="mt-1 text-sm text-gray-500">
            Track and manage all your tasks in one place
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => {
            setSelectedTask(null);
            setIsAddDialogOpen(true);
          }}>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Task
          </Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4 mb-5">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search tasks..."
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
          </div>

          <Tabs value={currentTab} onValueChange={setCurrentTab}>
            <TabsList className="w-full overflow-x-auto flex flex-nowrap">
              <TabsTrigger value="all" className="flex-shrink-0">All Tasks</TabsTrigger>
              <TabsTrigger value="to do" className="flex-shrink-0">To Do</TabsTrigger>
              <TabsTrigger value="in progress" className="flex-shrink-0">In Progress</TabsTrigger>
              <TabsTrigger value="review" className="flex-shrink-0">Review</TabsTrigger>
              <TabsTrigger value="completed" className="flex-shrink-0">Completed</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        <div className="p-5">
          {isLoadingTasks ? (
            <div className="space-y-4">
              {[1, 2, 3, 4].map(i => (
                <Skeleton key={i} className="h-16 w-full" />
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              {tasksWithProjects?.length === 0 ? (
                <div className="py-8 text-center text-gray-500">
                  No tasks found. Create your first task to get started.
                </div>
              ) : (
                tasksWithProjects?.map(task => (
                  <div 
                    key={task.id} 
                    className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-150"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      className="p-0 h-auto"
                      onClick={() => handleToggleTaskCompletion(task.id)}
                    >
                      {task.completed ? 
                        <CheckCircleIcon className="h-5 w-5 text-green-500" /> : 
                        <Circle className="h-5 w-5 text-gray-400" />
                      }
                    </Button>
                    <div className="ml-3 flex-1">
                      <h4 className={`text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                        {task.title}
                      </h4>
                      <div className="flex items-center mt-1">
                        <span className="text-xs text-gray-500 flex items-center mr-3">
                          <FilterIcon className="h-3 w-3 mr-1" /> 
                          {task.project?.name || 'Unknown Project'}
                        </span>
                        {task.dueDate && (
                          <span className="text-xs text-gray-500 flex items-center">
                            <FilterIcon className="h-3 w-3 mr-1" /> 
                            {formatDate(task.dueDate)}
                          </span>
                        )}
                      </div>
                    </div>
                    <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getPriorityColor(task.priority)}-100 text-${getPriorityColor(task.priority)}-800 mr-2`}>
                      {task.priority}
                    </span>
                    <div className="flex">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => {
                          setSelectedTask(task);
                          setIsEditDialogOpen(true);
                        }}
                      >
                        <PencilIcon className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteTask(task.id)}
                      >
                        <TrashIcon className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          <div className="mt-4">
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setSelectedTask(null);
                setIsAddDialogOpen(true);
              }}
            >
              <PlusIcon className="mr-2 h-4 w-4" /> Add Task
            </Button>
          </div>
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            projects={projects || []}
            onSubmit={handleSubmit}
            isSubmitting={createTaskMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Task Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Task</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <TaskForm
              projects={projects || []}
              onSubmit={handleSubmit}
              isSubmitting={updateTaskMutation.isPending}
              defaultValues={selectedTask}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
