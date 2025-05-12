import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { format } from "date-fns";
import { Play } from "lucide-react";
import { TimeEntry, Project, Task } from "@shared/schema";
import { Button } from "@/components/ui/button";

export function TimeTrackingCard() {
  const today = new Date();
  const formattedToday = format(today, "MMM d, yyyy");
  
  const { data: timeEntries, isLoading: entriesLoading } = useQuery<TimeEntry[]>({
    queryKey: ["/api/time-entries"],
  });
  
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });
  
  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });
  
  const isLoading = entriesLoading || projectsLoading || tasksLoading;

  // Get project name by ID
  const getProjectName = (projectId: number) => {
    const project = projects?.find((p) => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  // Get task name by ID
  const getTaskName = (taskId?: number) => {
    if (!taskId) return "General";
    const task = tasks?.find((t) => t.id === taskId);
    return task?.title || "Unknown Task";
  };

  // Format duration in minutes to hours and minutes
  const formatDuration = (minutes?: number) => {
    if (!minutes) return "00:00";
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`;
  };

  // Format timespan
  const formatTimespan = (startTime: Date, endTime?: Date) => {
    const start = format(new Date(startTime), "h:mm a");
    if (!endTime) return `${start} - Present`;
    const end = format(new Date(endTime), "h:mm a");
    return `${start} - ${end}`;
  };

  // Calculate total time today
  const getTodayTotal = () => {
    if (!timeEntries) return "00:00";
    
    const todayEntries = timeEntries.filter(entry => {
      const entryDate = new Date(entry.startTime);
      return entryDate.toDateString() === today.toDateString();
    });
    
    const totalMinutes = todayEntries.reduce((total, entry) => {
      return total + (entry.duration || 0);
    }, 0);
    
    return formatDuration(totalMinutes);
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">Time Tracking</CardTitle>
          <Link href="/time-tracking">
            <a className="text-sm font-medium text-primary hover:text-primary/80">View all</a>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="p-5">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Today</h4>
              <p className="text-xs text-gray-500">{formattedToday}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold text-gray-800">{getTodayTotal()}</span>
              <Button size="sm" className="bg-primary-50 text-primary border border-primary-200 hover:bg-primary-100">
                <Play className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {isLoading ? (
              <div className="text-sm text-gray-500">Loading time entries...</div>
            ) : timeEntries && timeEntries.length > 0 ? (
              timeEntries.slice(0, 2).map((entry) => (
                <div key={entry.id} className="bg-gray-50 rounded-md p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900">{getProjectName(entry.projectId)}</h5>
                      <p className="text-xs text-gray-500">{getTaskName(entry.taskId)}</p>
                    </div>
                    <div className="text-sm font-medium">{formatDuration(entry.duration)}</div>
                  </div>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <svg className="h-3 w-3 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span>{formatTimespan(entry.startTime, entry.endTime)}</span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-sm text-gray-500">No time entries recorded today</div>
            )}
          </div>
                
          <div className="mt-6">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Weekly Summary</h4>
            <div className="bg-gray-50 rounded-lg p-3">
              <div className="grid grid-cols-7 gap-1 mb-2">
                <div className="text-xs text-center text-gray-500">Mon</div>
                <div className="text-xs text-center text-gray-500">Tue</div>
                <div className="text-xs text-center text-gray-500">Wed</div>
                <div className="text-xs text-center text-gray-500">Thu</div>
                <div className="text-xs text-center text-gray-500">Fri</div>
                <div className="text-xs text-center text-gray-500">Sat</div>
                <div className="text-xs text-center text-gray-500">Sun</div>
              </div>
              <div className="grid grid-cols-7 gap-1">
                <div className="h-16 bg-primary-100 rounded flex flex-col items-center justify-center">
                  <div className="text-xs font-medium text-primary-700">6.5h</div>
                </div>
                <div className="h-16 bg-primary-200 rounded flex flex-col items-center justify-center">
                  <div className="text-xs font-medium text-primary-700">7.2h</div>
                </div>
                <div className="h-16 bg-primary-300 rounded flex flex-col items-center justify-center">
                  <div className="text-xs font-medium text-primary-700">8.1h</div>
                </div>
                <div className="h-16 bg-primary-400 rounded flex flex-col items-center justify-center">
                  <div className="text-xs font-medium text-white">8.5h</div>
                </div>
                <div className="h-16 bg-primary-200 rounded flex flex-col items-center justify-center">
                  <div className="text-xs font-medium text-primary-700">7.5h</div>
                </div>
                <div className="h-16 bg-primary-100 rounded flex flex-col items-center justify-center">
                  <div className="text-xs font-medium text-primary-700">3.2h</div>
                </div>
                <div className="h-16 bg-gray-100 rounded flex flex-col items-center justify-center">
                  <div className="text-xs font-medium text-gray-500">0h</div>
                </div>
              </div>
              <div className="mt-2 flex justify-between items-center">
                <span className="text-xs text-gray-500">Total: 41.0 hours</span>
                <span className="text-xs font-medium text-green-600">+3.5h from last week</span>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TimeTrackingCard;
