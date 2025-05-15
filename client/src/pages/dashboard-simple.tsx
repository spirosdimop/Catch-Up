import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'wouter';
import { 
  BarChart,
  Bell,
  Calendar as CalendarIcon,
  CheckCircle2,
  ChevronRight,
  Clock,
  FileText,
  LayoutDashboard,
  MessageSquare,
  Timer,
  Users
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { apiRequest } from '@/lib/queryClient';

// Dashboard data interface from the actual API
interface DashboardData {
  activeProjects: number;
  recentProjects: any[];
  monthlyEarnings: number;
  hoursTracked: string;
  tasksCompleted: string;
  tasksCompletionRate: number;
  recentTasks: any[];
  invoiceSummary: {
    paid: number;
    pending: number;
    overdue: number;
  };
  recentInvoices: any[];
  recentTimeEntries: any[];
}

const DashboardSimple = () => {
  // Query dashboard data
  const { data: dashboardData, isLoading } = useQuery<DashboardData, Error>({
    queryKey: ['/api/dashboard'],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/dashboard");
        return await response.json();
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        throw error;
      }
    }
  });
  
  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a2342] text-white p-4 md:p-6">
        <div className="max-w-[1400px] mx-auto space-y-6">
          <div className="h-20 bg-[#173561] animate-pulse rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-60 bg-[#173561] animate-pulse rounded-lg"></div>
            <div className="h-60 bg-[#173561] animate-pulse rounded-lg"></div>
            <div className="h-60 bg-[#173561] animate-pulse rounded-lg"></div>
          </div>
        </div>
      </div>
    );
  }
  
  // Early return if no data
  if (!dashboardData) {
    return (
      <div className="min-h-screen bg-[#0a2342] text-white p-4 md:p-6 flex items-center justify-center">
        <Card className="bg-[#173561] border-[#2a4d7d] shadow-lg w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-xl">Dashboard Unavailable</CardTitle>
            <CardDescription className="text-gray-400">
              We're unable to load your dashboard data at the moment. Please try again later.
            </CardDescription>
          </CardHeader>
          <CardFooter>
            <Button 
              onClick={() => window.location.reload()}
              className="bg-[#1d4ed8] hover:bg-blue-600 text-white"
            >
              Refresh Dashboard
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#0A2540] p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Top Navigation Links - Removed from here since they're now in header */}
        
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-[#0A2540]">Welcome back, Alex</h1>
          <p className="text-gray-600 mt-1">
            {new Date().toLocaleDateString('en-US', { 
              weekday: 'long', 
              year: 'numeric', 
              month: 'long', 
              day: 'numeric' 
            })}
          </p>
        </div>
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Activity Overview */}
          <Card className="md:col-span-8 bg-[#173561] border-[#2a4d7d] shadow-md">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center">
                  <LayoutDashboard className="mr-3 h-5 w-5 text-[#1d4ed8]" />
                  Activity Overview
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-md border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Active Projects</div>
                    <div className="bg-blue-50 rounded-full p-2">
                      <Users className="h-4 w-4 text-blue-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-semibold mt-2 text-[#0A2540]">{dashboardData.activeProjects}</div>
                  <div className="mt-3 text-xs text-gray-500">
                    {dashboardData.recentProjects.length} recent {dashboardData.recentProjects.length === 1 ? 'project' : 'projects'}
                  </div>
                </div>
                
                <div className="bg-white rounded-md border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Hours Tracked</div>
                    <div className="bg-green-50 rounded-full p-2">
                      <Timer className="h-4 w-4 text-green-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-semibold mt-2 text-[#0A2540]">{dashboardData.hoursTracked}</div>
                  <div className="mt-3 text-xs text-gray-500">
                    {dashboardData.recentTimeEntries.length} recent {dashboardData.recentTimeEntries.length === 1 ? 'entry' : 'entries'}
                  </div>
                </div>
                
                <div className="bg-white rounded-md border border-gray-200 shadow-sm p-4">
                  <div className="flex items-center justify-between">
                    <div className="text-sm text-gray-600">Task Completion</div>
                    <div className="bg-purple-50 rounded-full p-2">
                      <CheckCircle2 className="h-4 w-4 text-purple-600" />
                    </div>
                  </div>
                  <div className="text-2xl font-semibold mt-2 text-[#0A2540]">{dashboardData.tasksCompleted}</div>
                  <div className="mt-3 text-xs text-gray-500">
                    {dashboardData.tasksCompletionRate}% completion rate
                  </div>
                </div>
              </div>
              
              <div className="mt-6">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium text-[#0A2540]">Today's Schedule</h3>
                  <Link href="/calendar">
                    <Button variant="ghost" className="text-[#0A2540] hover:text-[#0A2540]/80 p-0 h-8">
                      View Calendar
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </Link>
                </div>
                
                <div className="mt-3 bg-white rounded-md border border-gray-200 shadow-sm p-4 text-center">
                  <Clock className="h-10 w-10 mx-auto mb-2 opacity-50 text-gray-400" />
                  <p className="text-lg font-medium text-[#0A2540]">Your schedule is clear</p>
                  <p className="mt-1 mb-4 text-gray-500">No events scheduled for today</p>
                  <Link href="/bookings">
                    <Button className="bg-[#0A2540] hover:bg-[#0A2540]/90 text-white">
                      Schedule New Event
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Task Progress */}
          <Card className="md:col-span-4 bg-white border-gray-200 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl flex items-center text-[#0A2540]">
                <CheckCircle2 className="mr-3 h-5 w-5 text-[#0A2540]" />
                Task Progress
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-3xl font-bold text-[#0A2540]">{dashboardData.tasksCompleted}</span>
                    </div>
                    <div className="flex items-center">
                      <Badge variant="outline" className="border-green-500 text-green-500">
                        {dashboardData.tasksCompletionRate}% complete
                      </Badge>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">Tasks completed this week</div>
                  <div className="pt-2">
                    <Progress 
                      value={dashboardData.tasksCompletionRate} 
                      className="h-2.5 bg-gray-100" 
                    />
                  </div>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-[#0A2540] mb-2">Recent Tasks</h3>
                  
                  {dashboardData.recentTasks.length === 0 ? (
                    <div className="bg-white rounded-md border border-gray-200 shadow-sm p-4 text-center">
                      <p className="text-gray-600">No recent tasks</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dashboardData.recentTasks.map((task, index) => (
                        <div key={index} className="bg-white rounded-md border border-gray-200 shadow-sm p-3">
                          <div className="font-medium text-[#0A2540]">{task.title || "Untitled Task"}</div>
                          <div className="text-sm text-gray-600 mt-1">{task.project || "No project"}</div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-gray-400 mb-2">Upcoming Activity</h3>
                  <div className="bg-[#0a2342] rounded-md border border-[#2a4d7d] p-4 text-center">
                    <CalendarIcon className="h-10 w-10 mx-auto mb-2 opacity-50 text-gray-400" />
                    <p className="text-sm font-medium">Your schedule for the week</p>
                    <p className="mt-1 mb-2 text-gray-400 text-xs">Plan ahead for your appointments</p>
                    <Link href="/calendar">
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2 border-[#2a4d7d] hover:bg-[#0a2342] text-white"
                      >
                        View Calendar
                        <ChevronRight className="ml-1 h-3 w-3" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Quick Access */}
          <Card className="md:col-span-12 bg-[#173561] border-[#2a4d7d] shadow-md">
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center">
                <Bell className="mr-3 h-5 w-5 text-[#1d4ed8]" />
                Quick Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col border-[#2a4d7d] hover:bg-[#0a2342] text-white"
                  onClick={() => window.location.href = '/clients'}
                >
                  <Users className="h-10 w-10 mb-2 text-[#1d4ed8]" />
                  <span className="text-base font-medium">Manage Clients</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col border-[#2a4d7d] hover:bg-[#0a2342] text-white"
                  onClick={() => window.location.href = '/bookings'}
                >
                  <CalendarIcon className="h-10 w-10 mb-2 text-[#1d4ed8]" />
                  <span className="text-base font-medium">Create Booking</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col border-[#2a4d7d] hover:bg-[#0a2342] text-white"
                  onClick={() => window.location.href = '/calendar'}
                >
                  <Clock className="h-10 w-10 mb-2 text-[#1d4ed8]" />
                  <span className="text-base font-medium">View Schedule</span>
                </Button>
                
                <Button 
                  variant="outline" 
                  className="h-auto py-4 flex-col border-[#2a4d7d] hover:bg-[#0a2342] text-white"
                  onClick={() => window.location.href = '/messages'}
                >
                  <MessageSquare className="h-10 w-10 mb-2 text-[#1d4ed8]" />
                  <span className="text-base font-medium">Messages</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardSimple;