import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";

type TimeEntry = {
  id: number;
  taskId: number;
  description: string;
  date: string;
  duration: number;
  task?: {
    title: string;
    projectId: number;
  };
  project?: {
    name: string;
  };
};

type WeekdaySummary = {
  name: string;
  hours: number;
};

export default function TimeTrackingCard() {
  const { data: timeEntries, isLoading } = useQuery<TimeEntry[]>({
    queryKey: ["/api/time-entries"],
  });

  // Generate weekly data for chart
  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  
  const weeklyData: WeekdaySummary[] = weekDays.map((day, index) => {
    // Mock data for chart - in a real app this would be calculated from time entries
    const hours = timeEntries 
      ? Math.floor(Math.random() * 8) // Random placeholder for demo
      : 0;
      
    return {
      name: day,
      hours
    };
  });
  
  // Get recent time entries, limited to 3
  const recentEntries = timeEntries 
    ? timeEntries.slice(0, 3) 
    : [];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Time Tracking</CardTitle>
        <Link href="/time-tracking">
          <span className="text-sm text-blue-500 hover:underline cursor-pointer">
            View all
          </span>
        </Link>
      </CardHeader>
      <CardContent>
        <div className="h-36 mb-6">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={weeklyData}>
              <XAxis dataKey="name" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip 
                labelStyle={{ color: "black" }}
                contentStyle={{ background: "white", border: "1px solid #ccc" }}
                formatter={(value) => [`${value} hours`, "Time logged"]}
              />
              <Bar dataKey="hours" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        
        <h3 className="text-sm font-medium mb-3">Recent Time Entries</h3>
        
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="w-1/3 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-1/4 h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : recentEntries.length === 0 ? (
          <div className="text-center py-4 text-gray-500">
            <p>No time entries recorded</p>
          </div>
        ) : (
          <div className="space-y-3">
            {recentEntries.map((entry) => (
              <div key={entry.id} className="flex justify-between items-start border-b pb-2">
                <div>
                  <h4 className="font-medium text-sm">{entry.description}</h4>
                  <p className="text-xs text-gray-500">
                    {entry.task?.title || "Untitled Task"} - {entry.project?.name || "No Project"}
                  </p>
                </div>
                <div className="text-sm font-medium">
                  {Math.floor(entry.duration / 60)}h {entry.duration % 60}m
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}