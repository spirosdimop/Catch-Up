import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Project, Client, Task, TimeEntry, Event, Booking } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { calculateWeeklySummary } from "@/lib/utils";
import { useState, useEffect } from "react";
import { Link } from "wouter";
import { 
  PlusIcon, 
  CalendarIcon, 
  TrendingUpIcon, 
  BellIcon, 
  ClockIcon, 
  CheckSquareIcon, 
  PhoneIcon, 
  MessageSquareIcon, 
  CalendarPlusIcon,
  RefreshCwIcon,
  UserIcon,
  Bot,
  Settings,
  Eye,
  EyeOff,
  Edit3,
  Save,
  X,
  FileTextIcon,
  UsersIcon,
  FolderIcon,
  BarChart3Icon,
  Lightbulb,
  ExternalLinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/StatCard";
import ProjectTable from "@/components/ProjectTable";
import TaskList from "@/components/TaskList";
import TimeTrackingWidget from "@/components/TimeTrackingWidget";
import ReminderSummary from "@/components/InvoiceSummary";
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/lib/userContext";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";

// Animation variants for staggered fade-in of cards
const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 260,
      damping: 20
    }
  }
};

// Dashboard customization types
interface DashboardWidget {
  id: string;
  title: string;
  visible: boolean;
  order: number;
  icon: React.ReactNode;
}

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  href?: string;
  onClick?: () => void;
  visible: boolean;
}

const defaultWidgets: DashboardWidget[] = [
  { id: 'stats', title: 'Statistics', visible: true, order: 1, icon: <BarChart3Icon className="h-4 w-4" /> },
  { id: 'missed-calls', title: 'Missed Calls', visible: true, order: 2, icon: <PhoneIcon className="h-4 w-4" /> },
  { id: 'calendar', title: 'Calendar', visible: true, order: 3, icon: <CalendarIcon className="h-4 w-4" /> },
  { id: 'recent-projects', title: 'Recent Projects', visible: true, order: 4, icon: <FolderIcon className="h-4 w-4" /> },
  { id: 'tasks', title: 'Tasks', visible: true, order: 5, icon: <CheckSquareIcon className="h-4 w-4" /> },
];

const defaultQuickActions: QuickAction[] = [
  { id: 'new-client', label: 'New Client', icon: <UsersIcon className="h-4 w-4" />, href: '/clients', visible: true },
  { id: 'new-project', label: 'New Project', icon: <FolderIcon className="h-4 w-4" />, href: '/projects', visible: true },
  { id: 'new-booking', label: 'Schedule Meeting', icon: <CalendarPlusIcon className="h-4 w-4" />, href: '/calendar', visible: true },
];

export default function Dashboard() {
  const { user } = useUser();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isWideMobile, setIsWideMobile] = useState(false);
  const [isCustomizing, setIsCustomizing] = useState(false);
  const [widgets, setWidgets] = useState<DashboardWidget[]>(() => {
    const saved = localStorage.getItem('dashboard-widgets');
    return saved ? JSON.parse(saved) : defaultWidgets;
  });
  const [quickActions, setQuickActions] = useState<QuickAction[]>(() => {
    const saved = localStorage.getItem('dashboard-quick-actions');
    return saved ? JSON.parse(saved) : defaultQuickActions;
  });

  // Update UI based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsWideMobile(window.innerWidth < 1024 && window.innerWidth >= 640);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

  // Save customizations to localStorage
  const saveCustomizations = () => {
    localStorage.setItem('dashboard-widgets', JSON.stringify(widgets));
    localStorage.setItem('dashboard-quick-actions', JSON.stringify(quickActions));
    setIsCustomizing(false);
    toast({
      title: "Dashboard Updated",
      description: "Your dashboard preferences have been saved.",
    });
  };

  // Toggle widget visibility
  const toggleWidget = (widgetId: string) => {
    setWidgets(prev => prev.map(w => 
      w.id === widgetId ? { ...w, visible: !w.visible } : w
    ));
  };

  // Toggle quick action visibility
  const toggleQuickAction = (actionId: string) => {
    setQuickActions(prev => prev.map(a => 
      a.id === actionId ? { ...a, visible: !a.visible } : a
    ));
  };

  // Reset to defaults
  const resetToDefaults = () => {
    setWidgets(defaultWidgets);
    setQuickActions(defaultQuickActions);
    localStorage.removeItem('dashboard-widgets');
    localStorage.removeItem('dashboard-quick-actions');
    toast({
      title: "Dashboard Reset",
      description: "Dashboard has been reset to default layout.",
    });
  };

  // Get current date in nice format
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', { 
    weekday: 'long', 
    month: 'long', 
    day: 'numeric' 
  });

  // Fetch data for dashboard
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['/api/projects', { active: true }],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: tasks, isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  const { data: timeEntries, isLoading: isLoadingTimeEntries } = useQuery<TimeEntry[]>({
    queryKey: ['/api/time-entries'],
  });

  const { data: events } = useQuery<Event[]>({
    queryKey: ['/api/events'],
  });

  const { data: bookings } = useQuery<Booking[]>({
    queryKey: ['/api/bookings'],
  });

  // Calculate real statistics from booking data
  const todayBookings = bookings?.filter(booking => {
    const bookingDate = new Date(booking.date);
    const today = new Date();
    return bookingDate.toDateString() === today.toDateString();
  }) || [];

  const thisWeekBookings = bookings?.filter(booking => {
    const bookingDate = new Date(booking.date);
    const today = new Date();
    const weekFromNow = new Date();
    weekFromNow.setDate(today.getDate() + 7);
    return bookingDate >= today && bookingDate <= weekFromNow;
  }) || [];

  const appointmentsToday = todayBookings.length;
  const bookingsThisWeek = thisWeekBookings.length;
  const pendingFollowups = bookings?.filter(b => b.status === 'confirmed').length || 0;

  // Task completion mutation
  const updateTaskMutation = useMutation({
    mutationFn: async ({ taskId, completed }: { taskId: number; completed: boolean }) => {
      return apiRequest(`/api/tasks/${taskId}`, 'PATCH', { completed });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({
        title: "Task updated",
        description: "Task status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update task. Please try again.",
        variant: "destructive",
      });
    },
  });

  // Project status mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ projectId, status }: { projectId: number; status: string }) => {
      return apiRequest(`/api/projects/${projectId}`, 'PATCH', { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({
        title: "Project updated",
        description: "Project status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update project. Please try again.",
        variant: "destructive",
      });
    },
  });



  // Calculate statistics
  const activeProjectsCount = projects?.filter(p => p.status === 'in_progress').length || 0;
  const projectsDueThisWeek = projects?.filter(p => {
    if (!p.endDate) return false;
    const endDate = new Date(p.endDate);
    const now = new Date();
    const oneWeek = new Date();
    oneWeek.setDate(now.getDate() + 7);
    return endDate >= now && endDate <= oneWeek;
  }).length || 0;

  const totalHoursTracked = timeEntries?.reduce((acc, entry) => 
    acc + (entry.duration ? Number(entry.duration) : 0), 0) || 0;
  const hoursInHHMM = `${Math.floor(totalHoursTracked / 60)}h ${Math.floor(totalHoursTracked % 60)}m`;
  
  const completedTasksCount = tasks?.filter(t => t.completed).length || 0;
  const totalTasksCount = tasks?.length || 0;
  const taskCompletionRatio = `${completedTasksCount}/${totalTasksCount}`;
  const taskCompletionPercentage = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0;

  // Generate weekly summary for time tracking
  const weeklySummary = calculateWeeklySummary(new Date());

  // Map projects with client data
  const projectsWithClients = projects ? projects.map(project => {
    const client = clients?.find(c => c.id === project.clientId);
    return { ...project, client };
  }) : [];

  // Map tasks with project data
  const tasksWithProjects = tasks ? tasks.map(task => {
    const project = projects?.find(p => p.id === task.projectId);
    return { ...task, project };
  }) : [];
  
  // Recent time entries for today
  const todayEntries = timeEntries ? timeEntries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    const today = new Date();
    return entryDate.toDateString() === today.toDateString();
  }).map(entry => {
    const task = tasks?.find(t => t.id === entry.taskId);
    const project = task ? projects?.find(p => p.id === task.projectId) : undefined;
    return { ...entry, task, project };
  }) : [];

  return (
    <motion.div 
      className="max-w-6xl mx-auto"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Header with welcome message and customization */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center md:justify-between mb-6"
        variants={itemVariants}
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-catchup-primary">
            Welcome back, {user?.firstName || 'User'}
          </h2>
          <p className="mt-1 text-gray-500">{formattedDate}</p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCustomizing(!isCustomizing)}
            className="bg-white shadow-sm border-gray-200"
          >
            <Settings className="mr-2 h-4 w-4" />
            Customize Dashboard
          </Button>
        </div>
      </motion.div>

      {/* Customization Panel */}
      {isCustomizing && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          className="mb-6 bg-white rounded-lg border border-gray-200 p-6"
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">Customize Your Dashboard</h3>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={resetToDefaults}>
                Reset to Defaults
              </Button>
              <Button size="sm" onClick={saveCustomizations}>
                <Save className="mr-2 h-4 w-4" />
                Save Changes
              </Button>
              <Button variant="ghost" size="sm" onClick={() => setIsCustomizing(false)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Quick Actions Configuration */}
            <div>
              <h4 className="font-medium mb-3">Quick Actions</h4>
              <div className="space-y-2">
                {quickActions.map((action) => (
                  <div key={action.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {action.icon}
                      <span className="text-sm">{action.label}</span>
                    </div>
                    <Switch
                      checked={action.visible}
                      onCheckedChange={() => toggleQuickAction(action.id)}
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* Widget Configuration */}
            <div>
              <h4 className="font-medium mb-3">Dashboard Widgets</h4>
              <div className="space-y-2">
                {widgets.map((widget) => (
                  <div key={widget.id} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                    <div className="flex items-center gap-2">
                      {widget.icon}
                      <span className="text-sm">{widget.title}</span>
                    </div>
                    <Switch
                      checked={widget.visible}
                      onCheckedChange={() => toggleWidget(widget.id)}
                    />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Quick Actions Bar */}
      <motion.div 
        className="mb-6 bg-white rounded-lg border border-gray-200 p-4"
        variants={itemVariants}
      >
        <h3 className="text-sm font-medium text-gray-700 mb-3">Quick Actions</h3>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {quickActions
            .filter(action => action.visible)
            .map((action) => (
              <Link key={action.id} href={action.href || '#'}>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-start bg-gray-50 hover:bg-gray-100 border-gray-200"
                  onClick={action.onClick}
                >
                  {action.icon}
                  <span className="ml-2 text-xs">{action.label}</span>
                </Button>
              </Link>
            ))}
        </div>
      </motion.div>

      {/* Floating action button for mobile */}
      <div className="fixed right-4 bottom-20 md:hidden z-10">
        <Button size="lg" className="h-14 w-14 rounded-full shadow-lg bg-catchup-primary hover:bg-catchup-primary/90">
          <CalendarPlusIcon className="h-6 w-6" />
        </Button>
      </div>

      {/* Stats overview - conditionally rendered */}
      {widgets.find(w => w.id === 'stats')?.visible && (
        <motion.div 
          variants={itemVariants}
          className="mb-8"
        >
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="bg-[#1F2A40] text-white rounded-xl shadow-md p-5 flex flex-col">
              <div className="flex items-center mb-3">
                <div className="p-2 rounded-full bg-catchup-primary/20">
                  <CalendarIcon className="h-5 w-5 text-[#00C2D1]" />
                </div>
                <h3 className="ml-3 font-medium">Appointments Today</h3>
              </div>
              <div className="mt-auto">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">{appointmentsToday}</span>
                  <span className="text-2xl font-bold text-gray-500 ml-1">scheduled</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">WORKING HOURS TODAY</span>
                  <span className="text-xs text-gray-400">{hoursInHHMM}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-[#24344D] text-white rounded-xl shadow-md p-5 flex flex-col">
              <div className="flex items-center mb-3">
                <div className="p-2 rounded-full bg-catchup-primary/20">
                  <TrendingUpIcon className="h-5 w-5 text-[#10B981]" />
                </div>
                <h3 className="ml-3 font-medium">Active Projects</h3>
              </div>
              <div className="mt-auto">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">{activeProjectsCount}</span>
                  <span className="text-2xl font-bold text-gray-500 ml-1">active</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">DUE THIS WEEK</span>
                  <span className="text-xs text-gray-400">{projectsDueThisWeek}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-[#1F2A40] text-white rounded-xl shadow-md p-5 flex flex-col">
              <div className="flex items-center mb-3">
                <div className="p-2 rounded-full bg-catchup-primary/20">
                  <CheckSquareIcon className="h-5 w-5 text-[#FFC700]" />
                </div>
                <h3 className="ml-3 font-medium">Task Progress</h3>
              </div>
              <div className="mt-auto">
                <div className="flex items-baseline">
                  <span className="text-3xl font-bold">{taskCompletionPercentage}%</span>
                  <span className="text-2xl font-bold text-gray-500 ml-1">complete</span>
                </div>
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs text-gray-400">TASKS COMPLETED</span>
                  <span className="text-xs text-gray-400">{taskCompletionRatio}</span>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Customizable Widget Grid */}
      <div className="space-y-6">
        {/* Missed Calls Widget */}
        {widgets.find(w => w.id === 'missed-calls')?.visible && (
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
            style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-gray-800 flex items-center">
                <PhoneIcon className="mr-2 h-5 w-5 text-catchup-primary" />
                Recent Communications
              </h3>
              <Link href="/messages">
                <Button variant="ghost" size="sm" className="text-sm text-gray-500 hover:underline">
                  View All
                </Button>
              </Link>
            </div>
            <div className="p-6">
              <p className="text-gray-500 text-center py-8">
                No recent missed calls or messages. All communications are up to date.
              </p>
            </div>
          </motion.div>
        )}



        {/* Recent Projects Widget */}
        {widgets.find(w => w.id === 'recent-projects')?.visible && (
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
            style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-gray-800 flex items-center">
                <FolderIcon className="mr-2 h-5 w-5 text-catchup-primary" />
                Recent Projects
              </h3>
              <Link href="/projects">
                <Button variant="ghost" size="sm" className="text-sm text-gray-500 hover:underline">
                  View All
                </Button>
              </Link>
            </div>
            <div className="p-6">
              {projectsWithClients && projectsWithClients.length > 0 ? (
                <div className="space-y-3">
                  {projectsWithClients.slice(0, 3).map((project) => (
                    <div key={project.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div>
                        <h4 className="font-medium text-gray-900">{project.name}</h4>
                        <p className="text-sm text-gray-500">
                          {project.client ? `${project.client.firstName} ${project.client.lastName}` : 'Personal Project'}
                        </p>
                      </div>
                      <Badge 
                        variant={project.status === 'completed' ? 'default' : 'secondary'}
                        className={project.status === 'in_progress' ? 'bg-blue-100 text-blue-800' : ''}
                      >
                        {String(project.status || 'pending').replace('_', ' ')}
                      </Badge>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No projects yet. Create your first project to get started.
                </p>
              )}
            </div>
          </motion.div>
        )}

        {/* Tasks Widget */}
        {widgets.find(w => w.id === 'tasks')?.visible && (
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
            style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.06)' }}
          >
            <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
              <h3 className="font-semibold text-lg text-gray-800 flex items-center">
                <CheckSquareIcon className="mr-2 h-5 w-5 text-catchup-primary" />
                Upcoming Tasks
              </h3>
              <Link href="/tasks">
                <Button variant="ghost" size="sm" className="text-sm text-gray-500 hover:underline">
                  View All
                </Button>
              </Link>
            </div>
            <div className="p-6">
              {tasksWithProjects && tasksWithProjects.length > 0 ? (
                <div className="space-y-3">
                  {tasksWithProjects
                    .filter(task => !task.completed)
                    .slice(0, 5)
                    .map((task) => (
                    <div key={task.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="flex items-center space-x-3">
                        <div className="flex-shrink-0">
                          <button
                            onClick={() => updateTaskMutation.mutate({ taskId: task.id, completed: !task.completed })}
                            disabled={updateTaskMutation.isPending}
                            className={`w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors ${
                              task.completed 
                                ? 'bg-green-500 border-green-500 text-white' 
                                : 'border-gray-300 hover:border-green-400'
                            } ${updateTaskMutation.isPending ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {task.completed && (
                              <CheckSquareIcon className="w-3 h-3" />
                            )}
                          </button>
                        </div>
                        <div className={task.completed ? 'opacity-50' : ''}>
                          <h4 className={`font-medium text-gray-900 ${task.completed ? 'line-through' : ''}`}>
                            {task.title}
                          </h4>
                          {task.project && (
                            <p className="text-sm text-gray-500">{task.project.name}</p>
                          )}
                          {task.deadline && (
                            <p className="text-xs text-gray-400">
                              Due: {new Date(task.deadline).toLocaleDateString()}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge 
                          variant={task.priority === 'urgent' ? 'destructive' : 'secondary'}
                          className={
                            task.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                            task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : ''
                          }
                        >
                          {String(task.priority || 'low')}
                        </Badge>
                        {updateTaskMutation.isPending && (
                          <RefreshCwIcon className="w-4 h-4 animate-spin text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-center py-8">
                  No pending tasks. You're all caught up!
                </p>
              )}
            </div>
          </motion.div>
        )}
      </div>

      {/* Calendar and Suggestions Grid */}
      {(widgets.find(w => w.id === 'calendar')?.visible || widgets.find(w => w.id === 'suggestions')?.visible) && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Calendar Card */}
          {widgets.find(w => w.id === 'calendar')?.visible && (
            <motion.div 
              variants={itemVariants} 
              className="lg:col-span-2 bg-white rounded-xl overflow-hidden border border-gray-100 cursor-pointer hover:shadow-lg transition-shadow duration-200"
              style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.06)' }}
              onClick={() => window.location.href = '/calendar'}
            >
          <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="font-semibold text-lg text-gray-800 flex items-center">
                <CalendarIcon className="mr-2 h-5 w-5 text-catchup-primary" />
                Calendar
              </h3>
              <Badge variant="secondary" className="ml-3">
                {bookingsThisWeek} this week
              </Badge>
            </div>
            <Button variant="ghost" size="sm" onClick={(e) => {
              e.stopPropagation();
              window.location.href = '/calendar';
            }}>
              <ExternalLinkIcon className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Interactive Calendar Content */}
          <div className="p-6">
            {/* Current Month Display */}
            <div className="text-center mb-6">
              <h4 className="text-xl font-semibold text-gray-800">
                {today.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
              </h4>
              <p className="text-sm text-gray-500 mt-1">
                {today.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric' })}
              </p>
            </div>

            {/* Today's Appointments Section */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-700">Today's Appointments</h5>
                <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                  {appointmentsToday}
                </Badge>
              </div>
              
              {todayBookings.length > 0 ? (
                <div className="space-y-3">
                  {todayBookings.slice(0, 3).map((booking) => (
                    <div key={booking.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                      <div className="h-3 w-3 rounded-full bg-catchup-primary flex-shrink-0"></div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {booking.type ? String(booking.type).charAt(0).toUpperCase() + String(booking.type).slice(1).replace('_', ' ') : 'Appointment'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {String(booking.time || '')} • {String(booking.duration || '30')} min
                        </p>
                      </div>
                      <Badge 
                        variant={booking.status === 'confirmed' ? 'default' : 'secondary'}
                        className="text-xs"
                      >
                        {String(booking.status || 'pending')}
                      </Badge>
                    </div>
                  ))}
                  {todayBookings.length > 3 && (
                    <p className="text-xs text-gray-500 text-center py-2">
                      +{todayBookings.length - 3} more appointments today
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-6 bg-gray-50 rounded-lg">
                  <CalendarIcon className="mx-auto h-8 w-8 text-gray-400 mb-2" />
                  <p className="text-sm text-gray-500">No appointments today</p>
                  <p className="text-xs text-gray-400 mt-1">Your schedule is clear</p>
                </div>
              )}
            </div>

            {/* Weekly Overview */}
            <div className="mb-6 pt-4 border-t border-gray-100">
              <div className="flex items-center justify-between mb-3">
                <h5 className="font-medium text-gray-700">This Week</h5>
                <Badge variant="outline" className="text-xs">
                  {bookingsThisWeek} total
                </Badge>
              </div>
              
              {thisWeekBookings.length > 0 ? (
                <div className="space-y-2">
                  <div className="text-sm text-gray-600">
                    Next: <span className="font-medium">
                      {new Date(thisWeekBookings[0]?.date).toLocaleDateString('en-US', { 
                        weekday: 'short', 
                        month: 'short', 
                        day: 'numeric' 
                      })}
                    </span> at {thisWeekBookings[0]?.time}
                  </div>
                  
                  {/* Weekly booking distribution */}
                  <div className="grid grid-cols-7 gap-1 mt-3">
                    {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day, index) => {
                      const dayBookings = thisWeekBookings.filter(booking => {
                        const bookingDay = new Date(booking.date).getDay();
                        return bookingDay === index;
                      });
                      
                      return (
                        <div key={day} className="text-center">
                          <div className="text-xs text-gray-500 mb-1">{day}</div>
                          <div className={`w-6 h-6 mx-auto rounded-full flex items-center justify-center text-xs ${
                            dayBookings.length > 0 
                              ? 'bg-catchup-primary text-white' 
                              : 'bg-gray-100 text-gray-400'
                          }`}>
                            {dayBookings.length || ''}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500">No bookings this week</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-gray-100">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = '/calendar';
                  }}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  View Calendar
                </Button>
                <Button 
                  size="sm"
                  onClick={(e) => {
                    e.stopPropagation();
                    window.location.href = '/calendar';
                  }}
                >
                  <CalendarPlusIcon className="mr-2 h-4 w-4" />
                  New Booking
                </Button>
              </div>
            </div>
          </div>
            </motion.div>
          )}

          {/* Suggestions Card */}
          {widgets.find(w => w.id === 'suggestions')?.visible && (
            <motion.div 
              variants={itemVariants}
              className="bg-white rounded-xl overflow-hidden border border-gray-100"
              style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.06)' }}
            >
              <div className="border-b border-gray-100 px-6 py-4">
                <h3 className="font-semibold text-lg text-gray-800 flex items-center">
                  <Bot className="mr-2 h-5 w-5 text-catchup-primary" />
                  AI Suggestions
                </h3>
              </div>
              <div className="p-6">
                <div className="text-center py-8">
                  <Bot className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                  <p className="text-gray-500 mb-4">
                    AI suggestions will appear here to help optimize your workflow and client interactions.
                  </p>
                  <Link href="/ai-assistant">
                    <Button variant="outline" size="sm">
                      Get AI Suggestions
                    </Button>
                  </Link>
                </div>
              </div>
            </motion.div>
          )}
        </div>
      )}
    </motion.div>
  );
}
