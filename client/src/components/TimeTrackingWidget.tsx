import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { formatDate, formatDuration, formatTimeBetween } from "@/lib/utils";
import { Clock, Play, Folder, Calendar } from "lucide-react";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/utils";
import { Task, TimeEntry } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import TimeEntryForm from "@/components/TimeEntryForm";

interface TimeEntryWithDetails extends TimeEntry {
  task?: Task;
  project?: {
    id: number;
    name: string;
  };
}

interface WeekdaySummary {
  day: string;
  hours: number;
  label: string;
}

interface TimeTrackingWidgetProps {
  timeEntries: TimeEntryWithDetails[];
  weeklySummary: WeekdaySummary[];
  totalHours: number;
}

export default function TimeTrackingWidget({
  timeEntries,
  weeklySummary,
  totalHours
}: TimeTrackingWidgetProps) {
  const { toast } = useToast();
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);

  // Get tasks for the time entry form
  const { data: tasks } = useQuery({
    queryKey: ['/api/tasks'],
  });

  // Create time entry mutation
  const createTimeEntryMutation = useMutation({
    mutationFn: async (timeEntry: any) => {
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

  const handleSubmit = (data: any) => {
    createTimeEntryMutation.mutate(data);
  };

  // Get today's date in readable format
  const today = formatDate(new Date());

  // Calculate daily total duration
  const todaysTotalDuration = timeEntries.reduce((total, entry) => {
    return total + (entry.duration ? Number(entry.duration) : 0);
  }, 0);

  // Format the daily total
  const formattedDailyTotal = formatDuration(todaysTotalDuration);

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">Time Tracking</h3>
          <a href="/time-tracking" className="text-sm font-medium text-primary hover:text-primary-700">View all</a>
        </div>
      </div>
      <div className="p-5">
        <div className="flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-sm font-medium text-gray-900">Today</h4>
              <p className="text-xs text-gray-500">{today}</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-lg font-semibold text-gray-800">{formattedDailyTotal}</span>
              <Button 
                size="sm" 
                className="p-2 rounded-full bg-primary-50 text-primary hover:bg-primary-100"
                onClick={() => setIsAddDialogOpen(true)}
              >
                <Play className="h-4 w-4" />
              </Button>
            </div>
          </div>
          
          <div className="space-y-3">
            {timeEntries.length === 0 ? (
              <div className="py-4 text-center text-gray-500">
                No time entries for today. Start tracking your time!
              </div>
            ) : (
              timeEntries.map(entry => (
                <div key={entry.id} className="bg-gray-50 rounded-md p-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <h5 className="text-sm font-medium text-gray-900">
                        {entry.project?.name || 'Unknown Project'}
                      </h5>
                      <p className="text-xs text-gray-500">{entry.task?.title || 'Unknown Task'}</p>
                    </div>
                    <div className="text-sm font-medium">{formatDuration(entry.duration)}</div>
                  </div>
                  <div className="flex items-center mt-2 text-xs text-gray-500">
                    <Clock className="h-3 w-3 mr-1" />
                    <span>
                      {entry.startTime && entry.endTime 
                        ? formatTimeBetween(entry.startTime, entry.endTime)
                        : 'Ongoing'}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="mt-6">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Weekly Summary</h4>
          <div className="bg-gray-50 rounded-lg p-3">
            <div className="grid grid-cols-7 gap-1 mb-2">
              {weeklySummary.map((day) => (
                <div key={day.day} className="text-xs text-center text-gray-500">{day.day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-1">
              {weeklySummary.map((day, index) => {
                // Calculate the intensity of the color based on hours
                const maxHours = Math.max(...weeklySummary.map(d => d.hours), 1);
                const intensity = Math.min(400, Math.max(100, Math.round((day.hours / maxHours) * 400)));
                
                return (
                  <div 
                    key={day.day} 
                    className={`h-16 bg-primary-${intensity} rounded flex flex-col items-center justify-center`}
                  >
                    <div className={`text-xs font-medium ${intensity > 300 ? 'text-white' : 'text-primary-700'}`}>
                      {day.label}
                    </div>
                  </div>
                );
              })}
            </div>
            <div className="mt-2 flex justify-between items-center">
              <span className="text-xs text-gray-500">Total: {totalHours.toFixed(1)} hours</span>
              <span className="text-xs font-medium text-green-600">+3.5h from last week</span>
            </div>
          </div>
        </div>
      </div>

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
    </div>
  );
}
