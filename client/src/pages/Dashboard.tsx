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
  UserIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import StatCard from "@/components/StatCard";
import ProjectTable from "@/components/ProjectTable";
import TaskList from "@/components/TaskList";
import TimeTrackingWidget from "@/components/TimeTrackingWidget";
import ReminderSummary from "@/components/InvoiceSummary"; // Component was renamed but file name remains the same
import { Skeleton } from "@/components/ui/skeleton";
import { useUser } from "@/lib/userContext";
import { motion } from "framer-motion";

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

export default function Dashboard() {
  const { user } = useUser();
  const [isWideMobile, setIsWideMobile] = useState(false);

  // Update UI based on screen size
  useEffect(() => {
    const checkScreenSize = () => {
      setIsWideMobile(window.innerWidth < 1024 && window.innerWidth >= 640);
    };
    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);
    return () => window.removeEventListener('resize', checkScreenSize);
  }, []);

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
      {/* Header with welcome message and date */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center md:justify-between mb-8"
        variants={itemVariants}
      >
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-catchup-primary">
            Welcome back, {user?.firstName || 'User'}
          </h2>
          <p className="mt-1 text-gray-500">{formattedDate}</p>
        </div>

        <div className="mt-4 md:mt-0 flex flex-wrap gap-3">
          {/* Quick action shortcuts */}
          <div className="flex md:hidden space-x-2 w-full">
            <Button variant="outline" size="sm" className="flex-1 bg-white shadow-sm border-gray-200">
              <PlusIcon className="mr-1 h-4 w-4" /> Booking
            </Button>
            <Button variant="outline" size="sm" className="flex-1 bg-white shadow-sm border-gray-200">
              <MessageSquareIcon className="mr-1 h-4 w-4" /> Message
            </Button>
            <Button variant="outline" size="sm" className="flex-1 bg-white shadow-sm border-gray-200">
              <RefreshCwIcon className="mr-1 h-4 w-4" /> Reschedule
            </Button>
          </div>

          {/* Desktop action buttons */}
          <div className="hidden md:flex space-x-3">
            <Button className="bg-catchup-primary hover:bg-catchup-primary/90 shadow-md">
              <CalendarPlusIcon className="mr-2 h-4 w-4" />
              Schedule New Event
            </Button>
          </div>
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
            <span className="text-3xl font-bold">{appointmentsToday}</span>
            <Badge className="ml-2 bg-[#00C2D1]">Next: 2:00 PM</Badge>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-[#24344D] text-white rounded-xl shadow-md p-5 flex flex-col">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-full bg-catchup-primary/20">
              <TrendingUpIcon className="h-5 w-5 text-[#10B981]" />
            </div>
            <h3 className="ml-3 font-medium">Bookings This Week</h3>
          </div>
          <div className="mt-auto">
            <span className="text-3xl font-bold">{bookingsThisWeek}</span>
            <Badge className="ml-2 bg-[#10B981]">↑ 2 from last week</Badge>
          </div>
        </motion.div>
        
        <motion.div variants={itemVariants} className="bg-[#1F2A40] text-white rounded-xl shadow-md p-5 flex flex-col">
          <div className="flex items-center mb-3">
            <div className="p-2 rounded-full bg-catchup-primary/20">
              <BellIcon className="h-5 w-5 text-[#FFC700]" />
            </div>
            <h3 className="ml-3 font-medium">Follow-ups Pending</h3>
          </div>
          <div className="mt-auto">
            <span className="text-3xl font-bold">{pendingFollowups}</span>
            <Badge className="ml-2 bg-[#FFC700] text-gray-800">Urgent: 1</Badge>
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Next Appointment Card */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl shadow-md overflow-hidden border border-gray-100"
          style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.06)' }}
        >
          <div className="border-b border-gray-100 px-6 py-4 flex justify-between items-center">
            <h3 className="font-semibold text-lg text-gray-800 flex items-center">
              <CalendarIcon className="mr-2 h-5 w-5 text-catchup-primary" />
              Next Appointment
            </h3>
            <Link href="/calendar" className="text-sm text-catchup-primary hover:underline">
              View Calendar
            </Link>
          </div>
          <div className="p-6">
            <div className="flex items-start border-l-4 border-catchup-primary pl-4 py-2">
              <div className="mr-4 p-3 bg-catchup-primary/10 text-catchup-primary rounded-md text-center">
                <div className="text-sm font-medium">TODAY</div>
                <div className="text-xl font-bold">2:00</div>
                <div className="text-sm">PM</div>
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Client Meeting with John Smith</h4>
                <p className="text-gray-500 mt-1">Discussing project requirements and timeline</p>
                <div className="flex mt-3 space-x-2">
                  <Button variant="outline" size="sm" className="text-xs">
                    Join Call
                  </Button>
                  <Button variant="ghost" size="sm" className="text-xs">
                    Reschedule
                  </Button>
                </div>
              </div>
            </div>

            <div className="mt-4 border-l-4 border-gray-200 pl-4 py-2">
              <div className="flex items-start">
                <div className="mr-4 p-3 bg-gray-100 text-gray-500 rounded-md text-center">
                  <div className="text-sm font-medium">TMR</div>
                  <div className="text-xl font-bold">10:30</div>
                  <div className="text-sm">AM</div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-700">Follow-up with Sarah Jones</h4>
                  <p className="text-gray-500 mt-1">Reviewing website design progress</p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Time Tracking Card - Redesigned with softer shadow */}
        {isLoadingTimeEntries ? (
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl p-6 space-y-4"
            style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.06)' }}
          >
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-80 w-full" />
          </motion.div>
        ) : (
          <motion.div 
            variants={itemVariants}
            className="bg-white rounded-xl overflow-hidden border border-gray-100"
            style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.06)' }}
          >
            <TimeTrackingWidget 
              timeEntries={todayEntries || []} 
              weeklySummary={weeklySummary}
              totalHours={totalHoursTracked / 60}
            />
          </motion.div>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Overview Card - with better shadows */}
        {isLoadingTasks ? (
          <motion.div 
            variants={itemVariants} 
            className="bg-white rounded-xl p-6 space-y-4 lg:col-span-2 border border-gray-100"
            style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.06)' }}
          >
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-80 w-full" />
          </motion.div>
        ) : (
          <motion.div 
            variants={itemVariants} 
            className="lg:col-span-2 bg-white rounded-xl overflow-hidden border border-gray-100"
            style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.06)' }}
          >
            <TaskList tasks={tasksWithProjects || []} />
          </motion.div>
        )}

        {/* Reminders Card - updated with same styling */}
        <motion.div 
          variants={itemVariants}
          className="bg-white rounded-xl overflow-hidden border border-gray-100"
          style={{ boxShadow: '0px 4px 12px rgba(0,0,0,0.06)' }}
        >
          <ReminderSummary />
        </motion.div>
      </div>
    </motion.div>
  );
}
