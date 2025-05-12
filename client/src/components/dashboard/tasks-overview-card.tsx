import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { CalendarDays } from "lucide-react";

type Task = {
  id: number;
  title: string;
  status: string;
  priority: string;
  dueDate: string;
  projectId: number;
  project?: {
    name: string;
  };
};

export default function TasksOverviewCard() {
  const { data: tasks, isLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  // Filter for incomplete tasks only, limited to 6
  const pendingTasks = tasks
    ? tasks
        .filter(task => task.status !== "Completed")
        .slice(0, 6)
    : [];

  const getPriorityColor = (priority: string) => {
    switch (priority.toLowerCase()) {
      case "high":
        return "bg-red-100 text-red-800";
      case "medium":
        return "bg-amber-100 text-amber-800";
      case "low":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Tasks Overview</CardTitle>
        <Link href="/tasks">
          <span className="text-sm text-blue-500 hover:underline cursor-pointer">
            View all
          </span>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="w-1/2 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-1/4 h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : pendingTasks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No pending tasks</p>
          </div>
        ) : (
          <div className="space-y-4">
            {pendingTasks.map((task) => (
              <div key={task.id} className="flex items-start gap-3">
                <Checkbox id={`task-${task.id}`} />
                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <label
                      htmlFor={`task-${task.id}`}
                      className="text-sm font-medium hover:text-primary cursor-pointer"
                    >
                      {task.title}
                    </label>
                    <Badge className={`text-xs ${getPriorityColor(task.priority)}`}>
                      {task.priority}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-1 mt-1 text-xs text-gray-500">
                    <CalendarDays className="h-3 w-3" />
                    <span>
                      {new Date(task.dueDate).toLocaleDateString()}
                    </span>
                    {task.project && (
                      <>
                        <span className="mx-1">•</span>
                        <Link href={`/projects/${task.projectId}`}>
                          <span className="hover:text-primary hover:underline cursor-pointer">
                            {task.project.name}
                          </span>
                        </Link>
                      </>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}