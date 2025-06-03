import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Task, InsertTask, Project } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { PlusIcon, CheckIcon, ClockIcon, MoveIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import TaskForm from "@/components/TaskForm";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

// Helper to get status color
const getStatusColor = (status: string) => {
  switch (status) {
    case "to_do":
      return "bg-gray-200 text-gray-800";
    case "in_progress":
      return "bg-blue-200 text-blue-800";
    case "review":
      return "bg-amber-200 text-amber-800";
    case "completed":
      return "bg-green-200 text-green-800";
    default:
      return "bg-gray-200 text-gray-800";
  }
};

// Helper to get priority color
const getPriorityColor = (priority: string) => {
  switch (priority) {
    case "low":
      return "bg-green-100 text-green-800";
    case "medium":
      return "bg-blue-100 text-blue-800";
    case "high":
      return "bg-amber-100 text-amber-800";
    case "urgent":
      return "bg-red-100 text-red-800";
    default:
      return "bg-gray-100 text-gray-800";
  }
};

interface ProjectTasksProps {
  projectId: number;
}

export default function ProjectTasks({ projectId }: ProjectTasksProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTransferDialogOpen, setIsTransferDialogOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  
  // Fetch all projects for the transfer functionality
  const { data: allProjects = [] } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    queryFn: async () => {
      const response = await fetch('/api/projects');
      if (!response.ok) {
        throw new Error("Failed to fetch projects");
      }
      return response.json();
    }
  });

  // Fetch tasks for this project
  const { data: tasks = [], isLoading, refetch } = useQuery<Task[]>({
    queryKey: ['/api/tasks', projectId],
    queryFn: async () => {
      const response = await fetch(`/api/tasks?projectId=${projectId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch tasks");
      }
      return response.json();
    }
  });

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (task: InsertTask) => {
      console.log("Creating task:", task);
      const res = await apiRequest("POST", "/api/tasks", task);
      const newTask = await res.json();
      console.log("Task created:", newTask);
      return newTask;
    },
    onSuccess: () => {
      console.log("Task created successfully, invalidating queries");
      
      // Properly invalidate the cache
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', projectId] });
      
      // Refresh the data
      refetch();
      
      setIsAddDialogOpen(false);
      toast({
        title: "Task created",
        description: "The task has been created successfully.",
      });
    },
    onError: (error) => {
      console.error("Error creating task:", error);
      toast({
        title: "Error creating task",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Update task mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, task }: { id: number; task: Partial<InsertTask> }) => {
      console.log("Updating task:", id, task);
      const res = await apiRequest("PATCH", `/api/tasks/${id}`, task);
      const updatedTask = await res.json();
      console.log("Task updated:", updatedTask);
      return updatedTask;
    },
    onSuccess: () => {
      console.log("Task updated successfully, invalidating queries");
      
      // Properly invalidate the cache
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', projectId] });
      
      // Refresh the data
      refetch();
      
      setIsEditDialogOpen(false);
      toast({
        title: "Task updated",
        description: "The task has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating task:", error);
      toast({
        title: "Error updating task",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Delete task mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log("Deleting task:", id);
      await apiRequest("DELETE", `/api/tasks/${id}`);
      console.log("Task deleted successfully");
      return id;
    },
    onSuccess: () => {
      console.log("Task deleted, invalidating queries");
      
      // Properly invalidate the cache
      queryClient.invalidateQueries({ queryKey: ['/api/tasks', projectId] });
      
      // Refresh the data
      refetch();
      
      toast({
        title: "Task deleted",
        description: "The task has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("Error deleting task:", error);
      toast({
        title: "Error deleting task",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Toggle task completion
  const toggleTaskCompletion = (task: Task) => {
    updateTaskMutation.mutate({
      id: task.id,
      task: {
        completed: !task.completed,
        status: !task.completed ? "completed" : "in_progress"
      }
    });
  };

  // Handle task form submission
  const handleSubmit = (data: any) => {
    try {
      console.log("Form submitted with data:", data);
      
      // Make sure all fields exist and have proper types
      const sanitizedData = {
        title: data.title,
        description: data.description || null,
        status: data.status || "to_do", // Default to "to_do" if empty
        priority: data.priority || "medium", // Default to "medium" if empty
        projectId: parseInt(data.projectId),
        deadline: data.deadline || null, // Send as string, backend will convert to Date
        completed: data.completed || false
      };
      
      console.log("Sanitized data:", sanitizedData);
      
      if (selectedTask) {
        updateTaskMutation.mutate({ 
          id: selectedTask.id, 
          task: sanitizedData 
        });
      } else {
        createTaskMutation.mutate(sanitizedData);
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

  // Handle task deletion
  const handleDeleteTask = (id: number) => {
    if (confirm("Are you sure you want to delete this task?")) {
      deleteTaskMutation.mutate(id);
    }
  };

  return (
    <div className="mt-6">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Tasks</h2>
        <Button 
          size="sm" 
          onClick={() => {
            setSelectedTask(null);
            setIsAddDialogOpen(true);
          }}
        >
          <PlusIcon className="mr-2 h-4 w-4" />
          Add Task
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map(i => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <Skeleton className="h-5 w-3/4 mb-2" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent className="pb-2">
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-3/4" />
              </CardContent>
              <CardFooter>
                <Skeleton className="h-4 w-1/3" />
              </CardFooter>
            </Card>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 border rounded-md">
          <h3 className="font-medium text-gray-600">No tasks yet</h3>
          <p className="text-sm text-gray-500 mt-1 mb-4">Create your first task to get started</p>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => {
              setSelectedTask(null);
              setIsAddDialogOpen(true);
            }}
          >
            <PlusIcon className="mr-2 h-4 w-4" />
            Add Task
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {tasks.map((task) => (
            <Card 
              key={task.id} 
              className={task.completed ? "border-green-200 bg-green-50" : ""}
            >
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start">
                  <CardTitle className="text-lg font-medium">{task.title}</CardTitle>
                  <div className="flex space-x-1">
                    <Badge className={getStatusColor(task.status)}>
                      {task.status.replace("_", " ")}
                    </Badge>
                    <Badge className={getPriorityColor(task.priority)}>
                      {task.priority}
                    </Badge>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="pb-2">
                {task.description && (
                  <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                )}
                {task.deadline && (
                  <div className="flex items-center text-xs text-gray-500">
                    <ClockIcon className="h-3 w-3 mr-1" />
                    Due: {format(new Date(task.deadline), "MMM d, yyyy")}
                  </div>
                )}
              </CardContent>
              <CardFooter className="pt-1 flex justify-between">
                <div className="flex space-x-2">
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={() => toggleTaskCompletion(task)}
                    className={task.completed ? "text-green-600" : ""}
                  >
                    <CheckIcon className="h-4 w-4 mr-1" />
                    {task.completed ? "Completed" : "Mark Complete"}
                  </Button>
                </div>
                <div className="flex space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedTask(task);
                      setIsEditDialogOpen(true);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => {
                      setSelectedTask(task);
                      setIsTransferDialogOpen(true);
                    }}
                  >
                    <MoveIcon className="h-4 w-4 mr-1" />
                    Transfer
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600"
                    onClick={() => handleDeleteTask(task.id)}
                  >
                    Delete
                  </Button>
                </div>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
          </DialogHeader>
          <TaskForm
            projectId={projectId}
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
              projectId={projectId}
              onSubmit={handleSubmit}
              isSubmitting={updateTaskMutation.isPending}
              defaultValues={selectedTask}
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Transfer Task Dialog */}
      <Dialog open={isTransferDialogOpen} onOpenChange={setIsTransferDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Transfer Task to Another Project</DialogTitle>
          </DialogHeader>
          {selectedTask && (
            <TaskForm
              projectId={projectId}
              onSubmit={handleSubmit}
              isSubmitting={updateTaskMutation.isPending}
              defaultValues={selectedTask}
              allProjects={allProjects.filter(p => p.id !== projectId)} // Exclude current project
              showProjectSelect={true}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}