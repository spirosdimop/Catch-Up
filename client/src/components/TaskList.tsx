import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDate } from "@/lib/utils";
import { Folder, Calendar, CheckCircle2, Circle, Plus } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/utils";
import { Task } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import TaskForm from "@/components/TaskForm";

interface TaskWithProject extends Task {
  project?: {
    id: number;
    name: string;
  };
}

interface TaskListProps {
  tasks: TaskWithProject[];
}

export default function TaskList({ tasks }: TaskListProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("all");
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Fetch projects for the task form
  const { data: projects } = useQuery({
    queryKey: ['/api/projects'],
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

  // Create task mutation
  const createTaskMutation = useMutation({
    mutationFn: async (task: any) => {
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

  const handleToggleTaskCompletion = (id: number) => {
    toggleTaskCompletionMutation.mutate(id);
  };

  const handleSubmit = (data: any) => {
    createTaskMutation.mutate(data);
  };

  // Filter tasks based on the active tab
  const filteredTasks = tasks.filter(task => {
    if (activeTab === "all") return true;
    if (activeTab === "todo") return task.status === "To Do" && !task.completed;
    if (activeTab === "inprogress") return task.status === "In Progress" && !task.completed;
    if (activeTab === "review") return task.status === "Review" && !task.completed;
    if (activeTab === "completed") return task.completed;
    return true;
  });

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case 'high':
        return 'bg-yellow-100 text-yellow-800';
      case 'urgent':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-blue-100 text-blue-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Tasks Overview</h3>
        </div>
      </div>
      <div className="p-5">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="mb-6">
          <TabsList className="w-full overflow-x-auto flex flex-nowrap">
            <TabsTrigger value="all" className="flex-shrink-0">All Tasks</TabsTrigger>
            <TabsTrigger value="todo" className="flex-shrink-0">To Do</TabsTrigger>
            <TabsTrigger value="inprogress" className="flex-shrink-0">In Progress</TabsTrigger>
            <TabsTrigger value="review" className="flex-shrink-0">Review</TabsTrigger>
            <TabsTrigger value="completed" className="flex-shrink-0">Completed</TabsTrigger>
          </TabsList>
        </Tabs>
        
        <div className="space-y-3">
          {filteredTasks.length === 0 ? (
            <div className="py-8 text-center text-gray-500">
              No tasks found.
            </div>
          ) : (
            filteredTasks.map(task => (
              <div 
                key={task.id} 
                className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-150"
              >
                <Button
                  variant="ghost"
                  size="sm"
                  className="p-0 h-auto text-gray-400 hover:text-gray-500"
                  onClick={() => handleToggleTaskCompletion(task.id)}
                >
                  {task.completed ? 
                    <CheckCircle2 className="h-5 w-5 text-green-500" /> : 
                    <Circle className="h-5 w-5 text-gray-400" />
                  }
                </Button>
                <div className="ml-3 flex-1">
                  <h4 className={`text-sm font-medium ${task.completed ? 'text-gray-500 line-through' : 'text-gray-900'}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500 flex items-center mr-3">
                      <Folder className="h-3 w-3 mr-1" /> {task.project?.name || 'Unknown Project'}
                    </span>
                    {task.dueDate && (
                      <span className="text-xs text-gray-500 flex items-center">
                        <Calendar className="h-3 w-3 mr-1" /> {formatDate(task.dueDate)}
                      </span>
                    )}
                  </div>
                </div>
                <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            ))
          )}
        </div>
        
        <div className="mt-4">
          <Button
            variant="outline"
            className="w-full"
            onClick={() => setIsAddDialogOpen(true)}
          >
            <Plus className="mr-2 h-4 w-4" /> Add Task
          </Button>
        </div>
      </div>

      {/* Add Task Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Task</DialogTitle>
            <DialogDescription>
              Create a new task and assign it to a project. Fill in the details below.
            </DialogDescription>
          </DialogHeader>
          <TaskForm
            projects={projects || []}
            onSubmit={handleSubmit}
            isSubmitting={createTaskMutation.isPending}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}

// For the TaskList component, we need to import Link
import { Link } from "wouter";
