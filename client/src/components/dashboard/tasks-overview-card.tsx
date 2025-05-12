import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Plus, Folder, Calendar } from "lucide-react";
import { Task, Project, TaskPriority } from "@shared/schema";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";

type TaskFilterType = "all" | "to_do" | "in_progress" | "review" | "completed";

export function TasksOverviewCard() {
  const [filter, setFilter] = useState<TaskFilterType>("all");
  
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
  
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  const isLoading = tasksLoading || projectsLoading;

  const updateTaskMutation = useMutation({
    mutationFn: async ({ id, completed }: { id: number; completed: boolean }) => {
      return apiRequest("PUT", `/api/tasks/${id}`, { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tasks"] });
    },
  });

  // Get project name by ID
  const getProjectName = (projectId: number) => {
    const project = projects?.find((p) => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  // Format date
  const formatDate = (date?: string | Date) => {
    if (!date) return "No deadline";
    return format(new Date(date), "MMM d");
  };

  // Get priority badge style
  const getPriorityStyle = (priority: string) => {
    switch (priority) {
      case TaskPriority.LOW:
        return "bg-blue-100 text-blue-800";
      case TaskPriority.MEDIUM:
        return "bg-blue-100 text-blue-800";
      case TaskPriority.HIGH:
        return "bg-yellow-100 text-yellow-800";
      case TaskPriority.URGENT:
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter tasks
  const filteredTasks = tasks?.filter(task => {
    if (filter === "all") return true;
    if (filter === "completed") return task.completed;
    return task.status === filter && !task.completed;
  }) || [];

  const handleToggleTask = (task: Task) => {
    updateTaskMutation.mutate({
      id: task.id,
      completed: !task.completed,
    });
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">Tasks Overview</CardTitle>
          <Link href="/tasks">
            <a className="text-sm font-medium text-primary hover:text-primary/80">View all</a>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex space-x-4 mb-6 overflow-x-auto pb-2">
          <Button 
            variant={filter === "all" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setFilter("all")}
            className={filter === "all" ? "bg-primary-50 text-primary border border-primary-200 hover:bg-primary-100" : ""}
          >
            All Tasks
          </Button>
          <Button 
            variant={filter === "to_do" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setFilter("to_do")}
            className={filter === "to_do" ? "bg-primary-50 text-primary border border-primary-200 hover:bg-primary-100" : ""}
          >
            To Do
          </Button>
          <Button 
            variant={filter === "in_progress" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setFilter("in_progress")}
            className={filter === "in_progress" ? "bg-primary-50 text-primary border border-primary-200 hover:bg-primary-100" : ""}
          >
            In Progress
          </Button>
          <Button 
            variant={filter === "review" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setFilter("review")}
            className={filter === "review" ? "bg-primary-50 text-primary border border-primary-200 hover:bg-primary-100" : ""}
          >
            Review
          </Button>
          <Button 
            variant={filter === "completed" ? "default" : "ghost"} 
            size="sm"
            onClick={() => setFilter("completed")}
            className={filter === "completed" ? "bg-primary-50 text-primary border border-primary-200 hover:bg-primary-100" : ""}
          >
            Completed
          </Button>
        </div>
        
        <div className="space-y-3">
          {isLoading ? (
            <div className="text-sm text-gray-500">Loading tasks...</div>
          ) : filteredTasks.length > 0 ? (
            filteredTasks.slice(0, 4).map((task) => (
              <div key={task.id} className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100 transition-colors duration-150">
                <Checkbox 
                  id={`task-${task.id}`} 
                  checked={task.completed}
                  onCheckedChange={() => handleToggleTask(task)}
                />
                <div className="ml-3 flex-1">
                  <h4 className={`text-sm font-medium ${task.completed ? "text-gray-500 line-through" : "text-gray-900"}`}>
                    {task.title}
                  </h4>
                  <div className="flex items-center mt-1">
                    <span className="text-xs text-gray-500 flex items-center mr-3">
                      <Folder className="h-3 w-3 mr-1" /> {getProjectName(task.projectId)}
                    </span>
                    <span className="text-xs text-gray-500 flex items-center">
                      <Calendar className="h-3 w-3 mr-1" /> {formatDate(task.deadline)}
                    </span>
                  </div>
                </div>
                <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityStyle(task.priority)}`}>
                  {task.priority}
                </span>
              </div>
            ))
          ) : (
            <div className="text-sm text-gray-500">No tasks found</div>
          )}
        </div>
        
        <div className="mt-4">
          <Link href="/tasks/new">
            <Button variant="outline" className="w-full">
              <Plus className="h-4 w-4 mr-2" /> Add Task
            </Button>
          </Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default TasksOverviewCard;
