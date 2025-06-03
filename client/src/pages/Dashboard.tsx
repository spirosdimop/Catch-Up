import { useQuery } from "@tanstack/react-query";
import { Project, Client, Task, TimeEntry } from "@shared/schema";
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
  BarChart3Icon
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
  { id: 'ai-assistant', title: 'AI Assistant', visible: true, order: 3, icon: <Bot className="h-4 w-4" /> },
  { id: 'calendar', title: 'Calendar', visible: true, order: 4, icon: <CalendarIcon className="h-4 w-4" /> },
  { id: 'recent-projects', title: 'Recent Projects', visible: true, order: 5, icon: <FolderIcon className="h-4 w-4" /> },
  { id: 'tasks', title: 'Tasks', visible: true, order: 6, icon: <CheckSquareIcon className="h-4 w-4" /> },
];

const defaultQuickActions: QuickAction[] = [
  { id: 'new-client', label: 'New Client', icon: <UsersIcon className="h-4 w-4" />, href: '/clients', visible: true },
  { id: 'new-project', label: 'New Project', icon: <FolderIcon className="h-4 w-4" />, href: '/projects', visible: true },
  { id: 'new-booking', label: 'Schedule Meeting', icon: <CalendarPlusIcon className="h-4 w-4" />, href: '/calendar', visible: true },
  { id: 'new-invoice', label: 'Create Invoice', icon: <FileTextIcon className="h-4 w-4" />, href: '/invoices', visible: true },
  { id: 'view-reports', label: 'View Reports', icon: <BarChart3Icon className="h-4 w-4" />, href: '/reports', visible: true },
  { id: 'send-message', label: 'Send Message', icon: <MessageSquareIcon className="h-4 w-4" />, href: '/messages', visible: true },
];

export default function Dashboard() {
  const { user } = useUser();
  const { toast } = useToast();
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

  // Dummy data for appointments and bookings
  const appointmentsToday = 2;
  const bookingsThisWeek = 5;
  const pendingFollowups = 3;

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

      {/* Stats overview - redesigned metrics */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-3 mb-8">
        <motion.div variants={itemVariants} className="bg-[#1F2A40] text-white rounded-xl shadow-md p-5 flex flex-col">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-full bg-catchup-primary/20">
              <CalendarIcon className="h-5 w-5 text-[#00C2D1]" />
            </div>
            <h3 className="ml-3 font-medium">Appointments Today</h3>
          </div>
          <div className="mt-auto">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">0</span>
              <span className="text-2xl font-bold text-gray-500 ml-1">hrs</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">WORKING HOURS TODAY</span>
              <span className="text-xs text-gray-400">0 MEETINGS</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-[#24344D] text-white rounded-xl shadow-md p-5 flex flex-col">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-full bg-catchup-primary/20">
              <TrendingUpIcon className="h-5 w-5 text-[#10B981]" />
            </div>
            <h3 className="ml-3 font-medium">Upcoming Schedule</h3>
          </div>
          <div className="mt-auto">
            <div className="flex items-baseline">
              <span className="text-3xl font-bold">0</span>
              <span className="text-2xl font-bold text-gray-500 ml-1">hrs</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-xs text-gray-400">PLANNED AVAILABILITY</span>
              <span className="text-xs text-gray-400">0 MEETINGS</span>
            </div>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-[#1F2A40] text-white rounded-xl shadow-md p-5 flex flex-col">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-full bg-catchup-primary/20">
              <BellIcon className="h-5 w-5 text-[#FFC700]" />
            </div>
            <h3 className="ml-3 font-medium">Availability Today</h3>
          </div>
          <div className="flex-1 flex flex-col justify-center items-center py-3">
            <div className="rounded-full bg-[#1A2235] h-16 w-16 flex items-center justify-center mb-2">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 8V12L15 15" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                <circle cx="12" cy="12" r="9" stroke="#6B7280" strokeWidth="2"/>
              </svg>
            </div>
            <p className="text-xs text-gray-400 text-center mt-2">YOU'LL BE FREE FOR 24 HRS</p>
            <p className="text-xs text-gray-500 text-center">EXCEPTIONALLY BLOCKED UNTIL TODAY</p>
          </div>
          <button className="mt-3 bg-[#3A4D6C] text-white text-sm py-2 rounded-lg hover:bg-[#4A5D7C] transition-colors">
            UNAVAILABLE TODAY
          </button>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Missed Calls Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h3 className="font-semibold text-lg text-gray-800 flex items-center">
              <PhoneIcon className="mr-2 h-5 w-5 text-catchup-primary" />
              Missed Calls
            </h3>
            <span className="text-sm text-gray-500 hover:underline cursor-pointer">
              Show missing only
            </span>
          </div>
          <div className="divide-y divide-gray-100">
            {/* Missed Call Item 1 */}
            <div className="p-5">
              <div className="flex justify-between mb-1">
                <h4 className="font-medium text-gray-900">Wilhelm Sequim</h4>
                <span className="text-sm text-red-500">Extend missing reply</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-sm text-gray-500">DATE REQUESTED</span>
                <span className="text-sm text-gray-500">TIME REQUESTED</span>
                <span className="text-sm text-gray-500">ACTION</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">03-08-2025</span>
                <span className="text-sm font-medium">6:00 AM - 6:00 AM</span>
                <button className="text-sm text-catchup-primary font-medium">Message →</button>
              </div>
            </div>
            
            {/* Missed Call Item 2 */}
            <div className="p-5">
              <div className="flex justify-between mb-1">
                <h4 className="font-medium text-gray-900">Johan Green</h4>
                <span className="text-sm text-red-500">5 voicemails</span>
              </div>
              <div className="flex justify-between mb-3">
                <span className="text-sm text-gray-500">DATE</span>
                <span className="text-sm text-gray-500">TIME REQUESTED</span>
                <span className="text-sm text-gray-500">ACTION</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium">May 11, 2025</span>
                <span className="text-sm font-medium">8:00 AM - 1:00 PM</span>
                <button className="text-sm text-catchup-primary font-medium">Message →</button>
              </div>
            </div>
          </div>
        </motion.div>

        {/* AI Assistant Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h3 className="font-semibold text-lg text-gray-800 flex items-center">
              <Bot className="mr-2 h-5 w-5 text-catchup-primary" />
              AI Assistant
            </h3>
          </div>
          <div className="p-4">
            {/* Reschedule Appointment */}
            <div className="bg-gray-50 rounded-lg p-4 mb-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900">Reschedule Appointment</h4>
                <button className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full">Approve</button>
              </div>
              <p className="text-sm text-gray-600 mb-1">Appointment rescheduled at client's request:</p>
              <p className="text-sm text-gray-500">Rescheduled from 10/23/2025 to 11/05/2025</p>
            </div>
            
            {/* Follow-up Message */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <h4 className="font-medium text-gray-900">Send Follow Up Message</h4>
                <div className="flex space-x-1">
                  <button className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-full">Out</button>
                  <button className="text-xs bg-blue-500 text-white px-3 py-1 rounded-full">Edit</button>
                </div>
              </div>
              <p className="text-sm text-gray-600">Send automated status on client call</p>
              <p className="text-xs italic text-gray-500 mt-1">Appointment has been created for October 11</p>
            </div>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar Card */}
        <motion.div 
          variants={itemVariants} 
          className="lg:col-span-2 bg-white rounded-xl overflow-hidden border border-gray-100"
          style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <div className="flex items-center">
              <h3 className="font-semibold text-lg text-gray-800">May 20%</h3>
              <button className="ml-2 p-1 rounded hover:bg-gray-100">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M8 4.5V11.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
                  <path d="M4.5 8H11.5" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round"/>
                </svg>
              </button>
              <button className="ml-1 p-1 rounded hover:bg-gray-100">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M10 4L6 8L10 12" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
              <button className="p-1 rounded hover:bg-gray-100">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M6 4L10 8L6 12" stroke="#6B7280" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </button>
            </div>
            <div className="text-xs text-gray-500">May '24</div>
          </div>
          
          {/* Calendar grid */}
          <div className="p-4">
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium mb-2">
              <div>Sun</div>
              <div>Mon</div>
              <div>Tue</div>
              <div>Wed</div>
              <div>Thu</div>
              <div>Fri</div>
              <div>Sat</div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 text-center">
              {/* Week 1 */}
              <div className="text-gray-400 p-2">28</div>
              <div className="text-gray-400 p-2">29</div>
              <div className="text-gray-400 p-2">30</div>
              <div className="p-2 rounded">1</div>
              <div className="p-2 rounded">2</div>
              <div className="p-2 rounded">3</div>
              <div className="p-2 rounded">4</div>
              
              {/* Week 2 */}
              <div className="p-2 rounded">5</div>
              <div className="p-2 rounded">6</div>
              <div className="p-2 rounded">7</div>
              <div className="p-2 rounded">8</div>
              <div className="p-2 rounded">9</div>
              <div className="p-2 rounded">10</div>
              <div className="p-2 rounded">11</div>
              
              {/* Week 3 */}
              <div className="p-2 rounded">12</div>
              <div className="p-2 rounded">13</div>
              <div className="p-2 font-bold">14</div>
              <div className="p-2 bg-catchup-primary text-white rounded-full">15</div>
              <div className="p-2 rounded">16</div>
              <div className="p-2 rounded">17</div>
              <div className="p-2 rounded">18</div>
              
              {/* Week 4 */}
              <div className="p-2 rounded">19</div>
              <div className="p-2 rounded">20</div>
              <div className="p-2 rounded">21</div>
              <div className="p-2 rounded">22</div>
              <div className="p-2 rounded">23</div>
              <div className="p-2 rounded">24</div>
              <div className="p-2 rounded">25</div>
              
              {/* Week 5 */}
              <div className="p-2 rounded">26</div>
              <div className="p-2 rounded">27</div>
              <div className="p-2 rounded">28</div>
              <div className="p-2 rounded">29</div>
              <div className="p-2 rounded">30</div>
              <div className="text-gray-400 p-2">1</div>
              <div className="text-gray-400 p-2">2</div>
            </div>
            
            <div className="mt-6 flex justify-between border-t border-gray-100 pt-4">
              <div className="text-sm text-gray-500">May 2025</div>
              <div className="text-sm text-gray-500">May 2022</div>
            </div>
            
            {/* Appointment on calendar */}
            <div className="mt-8 border-t border-gray-100 pt-4">
              <div className="text-xs text-gray-500 mb-2">WED 15</div>
              <div className="flex gap-4 items-start">
                <div className="mt-1 h-2 w-2 rounded-full bg-catchup-primary"></div>
                <div>
                  <h4 className="font-medium">Sean Dillion</h4>
                  <p className="text-xs text-gray-500 mt-1">POTENTIAL CLIENT • ONLINE</p>
                  <div className="mt-2 text-sm font-medium flex items-center gap-1">
                    <span>Team Pitch | 5:00pm</span>
                  </div>
                  <div className="mt-4 flex gap-2">
                    <button className="px-4 py-2 bg-catchup-primary text-white text-sm rounded-lg">Team Reschedule Time</button>
                    <button className="px-4 py-2 border border-gray-200 text-gray-600 text-sm rounded-lg">Cancel</button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Suggestions Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl overflow-hidden border border-gray-100"
          style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="border-b border-gray-100 px-6 py-4">
            <h3 className="font-semibold text-lg text-gray-800">Suggestions</h3>
          </div>
          <div className="p-4 space-y-6">
            {/* Suggestion 1 */}
            <div>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">Reschedule Appointment</h4>
                <button className="text-xs text-blue-500 font-medium">Approve</button>
              </div>
              <p className="text-sm text-gray-500 mb-4">Approve 5:00 pm time that fits both your schedule</p>
              <div className="text-xs text-gray-400 flex items-center justify-between">
                <span>TUESDAY, AUGUST 14, 2025 - 5:00 PM</span>
                <button className="text-xs text-blue-500">Edit</button>
              </div>
            </div>

            {/* Suggestion 2 */}
            <div>
              <div className="flex justify-between items-start mb-2">
                <h4 className="font-medium text-gray-900">Send Follow Up Message</h4>
                <button className="text-xs text-blue-500 font-medium">Edit</button>
              </div>
              <p className="text-sm text-gray-500 mb-4">Improve profits on all technical. Hanan</p>
              <div className="text-xs text-gray-400 flex items-center justify-between">
                <span>CUSTOMER HASN'T REPLIED</span>
                <button className="text-xs text-blue-500">Dismiss</button>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </motion.div>
  );
}
