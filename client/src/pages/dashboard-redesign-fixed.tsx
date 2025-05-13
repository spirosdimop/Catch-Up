import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, parseISO, isSameDay } from 'date-fns';
import { Link } from 'wouter';
import { 
  Bell,
  Calendar as CalendarIcon,
  CheckCircle,
  ChevronRight,
  Clock,
  LayoutDashboard,
  MessageSquare,
  Phone,
  PhoneMissed,
  User,
  Users,
  Plus,
  ArrowUp,
  ArrowDown,
  BarChart,
  CheckCircle2,
  MoreHorizontal,
  X,
  Calendar
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { apiRequest } from '@/lib/queryClient';

// Dashboard data interface
interface DashboardData {
  username: string;
  todaysEvents: Event[];
  upcomingEvents: Event[];
  pendingConfirmations: Confirmation[];
  missedCalls: Call[];
  alerts: Alert[];
  nextClientSession: Session | null;
  weeklyPerformance: {
    tasksCompleted: number;
    totalTasks: number;
    progress: number;
    trend: 'up' | 'down' | 'stable';
    trendPercentage: number;
  };
}

// Event interface
interface Event {
  id: number;
  title: string;
  startTime: string;
  endTime: string;
  client?: {
    id: number;
    name: string;
    avatar?: string;
  };
  location?: string;
  status: 'scheduled' | 'completed' | 'cancelled';
  type: 'meeting' | 'call' | 'personal';
}

// Confirmation interface
interface Confirmation {
  id: number;
  type: 'booking' | 'reschedule' | 'cancellation';
  client: {
    id: number;
    name: string;
    avatar?: string;
  };
  dateTime: string;
  details: string;
}

// Call interface
interface Call {
  id: number;
  caller: {
    id: number;
    name: string;
    avatar?: string;
  };
  time: string;
  duration?: string;
  attempted: number;
}

// Alert interface
interface Alert {
  id: number;
  type: 'payment' | 'deadline' | 'system' | 'message';
  title: string;
  description: string;
  time: string;
  priority: 'high' | 'medium' | 'low';
}

// Session interface
interface Session {
  id: number;
  client: {
    id: number;
    name: string;
    avatar?: string;
  };
  date: string;
  startTime: string;
  endTime: string;
  type: string;
  notes?: string;
}

const DashboardRedesign = () => {
  // Date information
  const today = new Date();
  const currentDate = format(today, 'EEEE, MMMM d, yyyy');
  
  // Query dashboard data
  const { data: dashboardData, isLoading } = useQuery<DashboardData, Error>({
    queryKey: ['/api/dashboard'],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/dashboard");
        return await response.json();
      } catch (error) {
        console.error("Failed to fetch dashboard data", error);
        // For demonstration purposes, providing sample data
        return {
          username: "Alex",
          todaysEvents: [
            {
              id: 1,
              title: "Client Strategy Meeting",
              startTime: "2025-05-13T09:00:00",
              endTime: "2025-05-13T10:30:00",
              client: {
                id: 101,
                name: "Sarah Johnson",
                avatar: ""
              },
              location: "Conference Room A",
              status: "scheduled",
              type: "meeting"
            },
            {
              id: 2,
              title: "Website Review Call",
              startTime: "2025-05-13T13:00:00",
              endTime: "2025-05-13T14:00:00",
              client: {
                id: 102,
                name: "Tech Innovations Inc",
                avatar: ""
              },
              status: "scheduled",
              type: "call"
            },
            {
              id: 3,
              title: "Lunch Break",
              startTime: "2025-05-13T12:00:00",
              endTime: "2025-05-13T13:00:00",
              status: "scheduled",
              type: "personal"
            },
            {
              id: 4,
              title: "Project Deadline: Marketing Campaign",
              startTime: "2025-05-13T17:00:00",
              endTime: "2025-05-13T17:30:00",
              status: "scheduled",
              type: "personal"
            }
          ],
          upcomingEvents: [
            {
              id: 5,
              title: "Quarterly Review",
              startTime: "2025-05-14T10:00:00",
              endTime: "2025-05-14T11:30:00",
              client: {
                id: 103,
                name: "Global Enterprises",
                avatar: ""
              },
              location: "Main Office",
              status: "scheduled",
              type: "meeting"
            },
            {
              id: 6,
              title: "Design Consultation",
              startTime: "2025-05-15T14:00:00",
              endTime: "2025-05-15T15:30:00",
              client: {
                id: 104,
                name: "Emma Taylor",
                avatar: ""
              },
              status: "scheduled",
              type: "meeting"
            }
          ],
          pendingConfirmations: [
            {
              id: 201,
              type: "booking",
              client: {
                id: 105,
                name: "Daniel Brown",
                avatar: ""
              },
              dateTime: "2025-05-16T11:00:00",
              details: "Initial consultation for financial planning"
            },
            {
              id: 202,
              type: "reschedule",
              client: {
                id: 106,
                name: "Maria Garcia",
                avatar: ""
              },
              dateTime: "2025-05-17T15:30:00",
              details: "Website review meeting (rescheduled from May 10)"
            }
          ],
          missedCalls: [
            {
              id: 301,
              caller: {
                id: 107,
                name: "James Williams",
                avatar: ""
              },
              time: "2025-05-13T08:45:00",
              attempted: 2
            },
            {
              id: 302,
              caller: {
                id: 108,
                name: "Noah Wilson",
                avatar: ""
              },
              time: "2025-05-12T16:30:00",
              attempted: 1
            }
          ],
          alerts: [
            {
              id: 401,
              type: "payment",
              title: "Payment Received",
              description: "Invoice #1043 paid by Tech Innovations Inc",
              time: "2025-05-13T07:15:00",
              priority: "medium"
            },
            {
              id: 402,
              type: "deadline",
              title: "Project Deadline Approaching",
              description: "Marketing Campaign due in 2 days",
              time: "2025-05-13T09:00:00",
              priority: "high"
            },
            {
              id: 403,
              type: "message",
              title: "New Message",
              description: "Emma Taylor sent you a message regarding the design project",
              time: "2025-05-13T10:30:00",
              priority: "medium"
            }
          ],
          nextClientSession: {
            id: 501,
            client: {
              id: 101,
              name: "Sarah Johnson",
              avatar: ""
            },
            date: "2025-05-13",
            startTime: "2025-05-13T09:00:00",
            endTime: "2025-05-13T10:30:00",
            type: "Strategy Meeting",
            notes: "Discuss Q2 marketing strategy and review campaign performance"
          },
          weeklyPerformance: {
            tasksCompleted: 18,
            totalTasks: 23,
            progress: 78,
            trend: "up",
            trendPercentage: 12
          }
        };
      }
    }
  });
  
  // Helper function to get initials from name
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };
  
  // Helper function to format time
  const formatTime = (dateTime: string) => {
    return format(parseISO(dateTime), 'h:mm a');
  };
  
  // Helper function to check if an event is happening now
  const isEventNow = (startTime: string, endTime: string) => {
    const now = new Date();
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    return now >= start && now <= end;
  };
  
  // Helper function to calculate event duration in hours and minutes
  const getEventDuration = (startTime: string, endTime: string) => {
    const start = parseISO(startTime);
    const end = parseISO(endTime);
    const diffMs = end.getTime() - start.getTime();
    const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
    const diffMins = Math.round((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    if (diffHrs === 0) {
      return `${diffMins}m`;
    } else if (diffMins === 0) {
      return `${diffHrs}h`;
    } else {
      return `${diffHrs}h ${diffMins}m`;
    }
  };
  
  // Get alert icon based on type
  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'payment':
        return <Badge className="bg-green-500 text-white">Payment</Badge>;
      case 'deadline':
        return <Badge className="bg-red-500 text-white">Deadline</Badge>;
      case 'system':
        return <Badge className="bg-yellow-500 text-white">System</Badge>;
      case 'message':
        return <Badge className="bg-blue-500 text-white">Message</Badge>;
      default:
        return <Badge className="bg-gray-500 text-white">Alert</Badge>;
    }
  };
  
  // Get priority color
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-400';
      case 'medium':
        return 'text-yellow-400';
      case 'low':
        return 'text-green-400';
      default:
        return 'text-gray-400';
    }
  };
  
  // Get trend icon
  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="h-4 w-4 text-green-500" />;
      case 'down':
        return <ArrowDown className="h-4 w-4 text-red-500" />;
      default:
        return null;
    }
  };
  
  // Render loading skeleton
  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#0a2342] text-white p-4 md:p-6">
        <div className="max-w-[1400px] mx-auto space-y-6">
          <div className="h-20 bg-[#173561] animate-pulse rounded-lg"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="h-80 bg-[#173561] animate-pulse rounded-lg"></div>
            <div className="h-80 bg-[#173561] animate-pulse rounded-lg"></div>
            <div className="h-80 bg-[#173561] animate-pulse rounded-lg"></div>
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
    <div className="min-h-screen bg-[#0a2342] text-white p-4 md:p-6">
      <div className="max-w-[1400px] mx-auto">
        {/* Top Navigation (optional - may already be in the AppShell) */}
        <div className="flex justify-end items-center mb-8 gap-2">
          <Link href="/messages">
            <Button variant="ghost" className="text-white hover:bg-[#173561]">
              <MessageSquare className="h-5 w-5 mr-2" />
              Messages
            </Button>
          </Link>
          <Link href="/bookings">
            <Button variant="ghost" className="text-white hover:bg-[#173561]">
              <Calendar className="h-5 w-5 mr-2" />
              Bookings
            </Button>
          </Link>
          <Link href="/clients">
            <Button variant="ghost" className="text-white hover:bg-[#173561]">
              <Users className="h-5 w-5 mr-2" />
              Clients
            </Button>
          </Link>
          <Link href="/calendar">
            <Button variant="ghost" className="text-white hover:bg-[#173561]">
              <CalendarIcon className="h-5 w-5 mr-2" />
              Calendar
            </Button>
          </Link>
        </div>
        
        {/* Welcome Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold">Welcome back, {dashboardData.username}</h1>
          <p className="text-gray-400 mt-1">{currentDate}</p>
        </div>
        
        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Today's Schedule */}
          <Card className="md:col-span-7 lg:col-span-8 bg-[#173561] border-[#2a4d7d] shadow-md">
            <CardHeader className="pb-3">
              <div className="flex justify-between items-center">
                <CardTitle className="text-xl flex items-center">
                  <Clock className="mr-3 h-5 w-5 text-[#1d4ed8]" />
                  Today's Schedule
                </CardTitle>
                <Link href="/calendar">
                  <Button variant="ghost" className="text-gray-400 hover:text-white p-0 h-8">
                    View Calendar
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </Link>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-1">
                {dashboardData.todaysEvents.length === 0 ? (
                  <div className="text-center py-6 text-gray-400">
                    <CalendarIcon className="h-12 w-12 mx-auto mb-3 opacity-50" />
                    <p className="text-lg font-medium">No events scheduled for today</p>
                    <p className="mt-1 mb-4">Your calendar is clear. Enjoy your day!</p>
                    <Link href="/bookings">
                      <Button className="bg-[#1d4ed8] hover:bg-blue-600 text-white">
                        <Plus className="mr-2 h-4 w-4" />
                        Schedule New Event
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="divide-y divide-[#2a4d7d]">
                    {dashboardData.todaysEvents.map((event) => (
                      <div 
                        key={event.id} 
                        className={cn(
                          "py-3 px-1 transition-colors hover:bg-[#0a2342] rounded-md relative",
                          isEventNow(event.startTime, event.endTime) && "bg-[#0a2342] border-l-4 border-[#1d4ed8] pl-3 -ml-2"
                        )}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{event.title}</h3>
                            <div className="flex items-center mt-1 text-sm text-gray-400">
                              <Clock className="h-3.5 w-3.5 mr-1.5" />
                              <span>
                                {formatTime(event.startTime)} - {formatTime(event.endTime)}
                                <span className="ml-1.5 text-gray-500">
                                  ({getEventDuration(event.startTime, event.endTime)})
                                </span>
                              </span>
                            </div>
                            
                            {event.client && (
                              <div className="flex items-center mt-2">
                                <Avatar className="h-6 w-6 mr-2">
                                  <AvatarImage src={event.client.avatar} />
                                  <AvatarFallback className="bg-[#1d4ed8] text-white text-xs">
                                    {getInitials(event.client.name)}
                                  </AvatarFallback>
                                </Avatar>
                                <span className="text-sm">{event.client.name}</span>
                              </div>
                            )}
                            
                            {event.location && (
                              <div className="mt-1 text-sm text-gray-400">
                                Location: {event.location}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex items-center space-x-2">
                            <Badge 
                              variant="outline" 
                              className={cn(
                                "border-[#2a4d7d] bg-[#0a2342]",
                                event.type === 'meeting' && "text-blue-400 border-blue-400/30",
                                event.type === 'call' && "text-green-400 border-green-400/30",
                                event.type === 'personal' && "text-purple-400 border-purple-400/30"
                              )}
                            >
                              {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
                            </Badge>
                            
                            {isEventNow(event.startTime, event.endTime) && (
                              <Badge className="bg-[#1d4ed8] text-white">Now</Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0">
              {dashboardData.upcomingEvents.length > 0 && (
                <div className="w-full">
                  <Separator className="mb-3 bg-[#2a4d7d]" />
                  <div className="flex justify-between items-center">
                    <h3 className="text-sm font-medium text-gray-400">Upcoming</h3>
                    <span className="text-sm text-gray-400">
                      {dashboardData.upcomingEvents.length} upcoming {dashboardData.upcomingEvents.length === 1 ? 'event' : 'events'}
                    </span>
                  </div>
                  <div className="mt-2 space-y-1">
                    {dashboardData.upcomingEvents.slice(0, 2).map((event) => (
                      <div key={event.id} className="text-sm flex justify-between">
                        <div className="flex items-center">
                          <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                          <span>{event.title}</span>
                          {event.client && (
                            <span className="text-gray-400 ml-1.5">
                              with {event.client.name}
                            </span>
                          )}
                        </div>
                        <div className="text-gray-400">
                          {format(parseISO(event.startTime), 'EEE, MMM d')} at {formatTime(event.startTime)}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardFooter>
          </Card>
          
          {/* Performance Card */}
          <Card className="md:col-span-5 lg:col-span-4 bg-[#173561] border-[#2a4d7d] shadow-md">
            <CardHeader>
              <CardTitle className="text-xl flex items-center">
                <BarChart className="mr-3 h-5 w-5 text-[#1d4ed8]" />
                Weekly Performance
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-5">
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <div>
                      <span className="text-3xl font-bold">{dashboardData.weeklyPerformance.tasksCompleted}</span>
                      <span className="text-gray-400 ml-1.5">/ {dashboardData.weeklyPerformance.totalTasks}</span>
                    </div>
                    <div className="flex items-center">
                      {getTrendIcon(dashboardData.weeklyPerformance.trend)}
                      <span className={cn(
                        "ml-1 text-sm",
                        dashboardData.weeklyPerformance.trend === 'up' ? 'text-green-500' : 'text-red-500'
                      )}>
                        {dashboardData.weeklyPerformance.trendPercentage}%
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-400">Tasks completed this week</div>
                  <div className="pt-2">
                    <Progress 
                      value={dashboardData.weeklyPerformance.progress} 
                      className="h-2.5 bg-[#0a2342]" 
                    />
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-400">Completion Stats</h3>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#0a2342] rounded-md border border-[#2a4d7d] p-3">
                      <div className="text-gray-400 text-sm">On-time</div>
                      <div className="text-lg font-medium mt-1 flex items-center">
                        85%
                        <Badge className="bg-green-500/20 text-green-400 ml-2 text-xs">
                          +5%
                        </Badge>
                      </div>
                    </div>
                    <div className="bg-[#0a2342] rounded-md border border-[#2a4d7d] p-3">
                      <div className="text-gray-400 text-sm">Success Rate</div>
                      <div className="text-lg font-medium mt-1 flex items-center">
                        93%
                        <Badge className="bg-green-500/20 text-green-400 ml-2 text-xs">
                          +2%
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-3">
                  <h3 className="text-sm font-medium text-gray-400">Priority Tasks</h3>
                  <div className="bg-[#0a2342] rounded-md border border-[#2a4d7d] p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Project Proposal</div>
                        <div className="text-sm text-gray-400 mt-0.5">
                          Due today
                        </div>
                      </div>
                      <CheckCircle className="h-5 w-5 text-[#1d4ed8]" />
                    </div>
                  </div>
                  <div className="bg-[#0a2342] rounded-md border border-[#2a4d7d] p-3">
                    <div className="flex justify-between items-center">
                      <div>
                        <div className="font-medium">Client Follow-ups</div>
                        <div className="text-sm text-gray-400 mt-0.5">
                          3 pending contacts
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="h-7 text-xs bg-[#1d4ed8] hover:bg-blue-600 text-white"
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          {/* Next Client Session */}
          {dashboardData.nextClientSession && (
            <Card className="md:col-span-7 lg:col-span-8 bg-[#173561] border-[#2a4d7d] shadow-md">
              <CardHeader className="pb-3">
                <CardTitle className="text-xl flex items-center">
                  <User className="mr-3 h-5 w-5 text-[#1d4ed8]" />
                  Next Client Session
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="bg-[#0a2342] rounded-md border border-[#2a4d7d] p-4">
                  <div className="flex flex-col md:flex-row justify-between">
                    <div className="flex items-start">
                      <div>
                        <Avatar className="h-12 w-12 mr-4">
                          <AvatarImage src={dashboardData.nextClientSession.client.avatar} />
                          <AvatarFallback className="bg-[#1d4ed8] text-white">
                            {getInitials(dashboardData.nextClientSession.client.name)}
                          </AvatarFallback>
                        </Avatar>
                      </div>
                      <div>
                        <h3 className="text-lg font-medium">
                          {dashboardData.nextClientSession.client.name}
                        </h3>
                        <div className="text-sm text-gray-400 mt-1">
                          {dashboardData.nextClientSession.type}
                        </div>
                        <div className="flex items-center mt-2 text-sm">
                          <CalendarIcon className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                          <span>
                            {format(parseISO(dashboardData.nextClientSession.date), 'EEEE, MMMM d')}
                          </span>
                          <span className="mx-1.5">•</span>
                          <Clock className="h-3.5 w-3.5 mr-1.5 text-gray-500" />
                          <span>
                            {formatTime(dashboardData.nextClientSession.startTime)} - {formatTime(dashboardData.nextClientSession.endTime)}
                          </span>
                        </div>
                        {dashboardData.nextClientSession.notes && (
                          <div className="mt-3 text-sm text-gray-300 border-t border-[#2a4d7d] pt-3 max-w-3xl">
                            {dashboardData.nextClientSession.notes}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="flex mt-4 md:mt-0 space-x-2">
                      <Button 
                        variant="outline" 
                        className="border-[#2a4d7d] text-white hover:bg-[#132c54]"
                        onClick={() => window.location.href = `/clients?id=${dashboardData.nextClientSession?.client.id}`}
                      >
                        View Client
                      </Button>
                      <Button 
                        className="bg-[#1d4ed8] hover:bg-blue-600 text-white"
                        onClick={() => window.location.href = `/calendar?event=${dashboardData.nextClientSession?.id}`}
                      >
                        Prepare Session
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
          
          {/* Pending Confirmations */}
          <Card className={`${dashboardData.nextClientSession ? 'md:col-span-5 lg:col-span-4' : 'md:col-span-6'} bg-[#173561] border-[#2a4d7d] shadow-md`}>
            <CardHeader className="pb-3">
              <CardTitle className="text-xl flex items-center">
                <CheckCircle2 className="mr-3 h-5 w-5 text-[#1d4ed8]" />
                Pending Confirmations
                {dashboardData.pendingConfirmations.length > 0 && (
                  <Badge className="ml-2 bg-[#1d4ed8]">
                    {dashboardData.pendingConfirmations.length}
                  </Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {dashboardData.pendingConfirmations.length === 0 ? (
                <div className="text-center py-4 text-gray-400">
                  <CheckCircle className="h-10 w-10 mx-auto mb-2 opacity-50" />
                  <p>No pending confirmations</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {dashboardData.pendingConfirmations.map((confirmation) => (
                    <div key={confirmation.id} className="bg-[#0a2342] rounded-md border border-[#2a4d7d] p-3">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center">
                            <Badge 
                              className={cn(
                                confirmation.type === 'booking' && "bg-green-500",
                                confirmation.type === 'reschedule' && "bg-yellow-500",
                                confirmation.type === 'cancellation' && "bg-red-500"
                              )}
                            >
                              {confirmation.type.charAt(0).toUpperCase() + confirmation.type.slice(1)}
                            </Badge>
                            <span className="ml-2 font-medium">
                              {confirmation.client.name}
                            </span>
                          </div>
                          <div className="mt-1.5 text-sm text-gray-400">
                            {format(parseISO(confirmation.dateTime), 'EEE, MMM d')} at {formatTime(confirmation.dateTime)}
                          </div>
                          <div className="mt-1 text-sm text-gray-300">
                            {confirmation.details}
                          </div>
                        </div>
                      </div>
                      <div className="flex justify-end space-x-2 mt-3">
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="border-[#2a4d7d] text-white hover:bg-[#132c54]"
                        >
                          Decline
                        </Button>
                        <Button 
                          size="sm"
                          className="bg-[#1d4ed8] hover:bg-blue-600 text-white"
                        >
                          Confirm
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
          
          {/* Missed Calls & Alerts */}
          <Card className={`${dashboardData.nextClientSession ? 'md:col-span-7 lg:col-span-8' : 'md:col-span-6'} bg-[#173561] border-[#2a4d7d] shadow-md`}>
            <CardHeader className="pb-3">
              <div className="flex justify-between">
                <CardTitle className="text-xl flex items-center">
                  <Bell className="mr-3 h-5 w-5 text-[#1d4ed8]" />
                  Missed Calls & Alerts
                  {(dashboardData.missedCalls.length + dashboardData.alerts.length) > 0 && (
                    <Badge className="ml-2 bg-[#1d4ed8]">
                      {dashboardData.missedCalls.length + dashboardData.alerts.length}
                    </Badge>
                  )}
                </CardTitle>
                <div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0 text-gray-400 hover:text-white">
                        <span className="sr-only">Open menu</span>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="bg-[#0a2342] border-[#2a4d7d] text-white">
                      <DropdownMenuLabel>Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-[#2a4d7d]" />
                      <DropdownMenuItem className="hover:bg-[#173561] cursor-pointer">
                        Mark all as read
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-[#173561] cursor-pointer">
                        Clear all notifications
                      </DropdownMenuItem>
                      <DropdownMenuItem className="hover:bg-[#173561] cursor-pointer">
                        Notification settings
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="missed_calls" className="w-full">
                <TabsList className="bg-[#0a2342] border-[#2a4d7d]">
                  <TabsTrigger 
                    value="missed_calls" 
                    className="data-[state=active]:bg-[#1d4ed8] data-[state=active]:text-white"
                  >
                    Missed Calls
                    {dashboardData.missedCalls.length > 0 && (
                      <Badge className="ml-2 bg-red-500">
                        {dashboardData.missedCalls.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                  <TabsTrigger 
                    value="alerts" 
                    className="data-[state=active]:bg-[#1d4ed8] data-[state=active]:text-white"
                  >
                    Alerts
                    {dashboardData.alerts.length > 0 && (
                      <Badge className="ml-2 bg-yellow-500">
                        {dashboardData.alerts.length}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>
                
                <TabsContent value="missed_calls" className="p-1 pt-3">
                  {dashboardData.missedCalls.length === 0 ? (
                    <div className="text-center py-4 text-gray-400">
                      <Phone className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>No missed calls</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dashboardData.missedCalls.map((call) => (
                        <div key={call.id} className="bg-[#0a2342] rounded-md border border-[#2a4d7d] p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex items-center">
                              <Avatar className="h-10 w-10 mr-3">
                                <AvatarImage src={call.caller.avatar} />
                                <AvatarFallback className="bg-[#1d4ed8] text-white">
                                  {getInitials(call.caller.name)}
                                </AvatarFallback>
                              </Avatar>
                              <div>
                                <div className="font-medium">{call.caller.name}</div>
                                <div className="flex items-center text-sm text-gray-400 mt-0.5">
                                  <PhoneMissed className="h-3.5 w-3.5 mr-1.5 text-red-400" />
                                  <span>
                                    Missed call
                                    {call.attempted > 1 && (
                                      <span className="text-red-400 ml-1.5">
                                        ({call.attempted} attempts)
                                      </span>
                                    )}
                                  </span>
                                </div>
                                <div className="text-sm text-gray-400 mt-0.5">
                                  {format(parseISO(call.time), 'h:mm a')} - {format(parseISO(call.time), 'MMMM d')}
                                </div>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <Button 
                                size="sm"
                                className="bg-[#1d4ed8] hover:bg-blue-600 text-white"
                              >
                                <Phone className="h-4 w-4 mr-1.5" />
                                Call Back
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="alerts" className="p-1 pt-3">
                  {dashboardData.alerts.length === 0 ? (
                    <div className="text-center py-4 text-gray-400">
                      <Bell className="h-10 w-10 mx-auto mb-2 opacity-50" />
                      <p>No alerts</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {dashboardData.alerts.map((alert) => (
                        <div key={alert.id} className="bg-[#0a2342] rounded-md border border-[#2a4d7d] p-3">
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="flex items-center">
                                {getAlertIcon(alert.type)}
                                <span className="ml-2 font-medium">
                                  {alert.title}
                                </span>
                                <span className={cn(
                                  "ml-2 text-xs",
                                  getPriorityColor(alert.priority)
                                )}>
                                  {alert.priority} priority
                                </span>
                              </div>
                              <div className="mt-1.5 text-sm text-gray-300">
                                {alert.description}
                              </div>
                              <div className="mt-1 text-xs text-gray-400">
                                {format(parseISO(alert.time), 'h:mm a')}
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="h-7 w-7 text-gray-400 hover:text-white"
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default DashboardRedesign;