import { useState, useMemo, useEffect } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parseISO, startOfWeek, getDay, parse, add, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar as CalendarIcon, Clock, Users, Briefcase, CheckSquare, Filter, Search, Plus, Edit, Eye } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Create localizer for react-big-calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Form schemas
const eventFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  startTime: z.string().min(1, 'Start time is required'),
  endTime: z.string().min(1, 'End time is required'),
  location: z.string().optional(),
});

const bookingFormSchema = z.object({
  clientName: z.string().min(1, 'Client name is required'),
  serviceName: z.string().min(1, 'Service name is required'),
  date: z.string().min(1, 'Date is required'),
  time: z.string().min(1, 'Time is required'),
  duration: z.number().min(1, 'Duration is required'),
});

const taskFormSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().optional(),
  deadline: z.string().min(1, 'Deadline is required'),
  priority: z.string().optional(),
  status: z.string().optional(),
});

const projectFormSchema = z.object({
  name: z.string().min(1, 'Project name is required'),
  description: z.string().optional(),
  startDate: z.string().min(1, 'Start date is required'),
  endDate: z.string().optional(),
  status: z.string().optional(),
  clientId: z.number().optional(),
});

// Color scheme for different item types
const eventColors = {
  booking: '#10B981', // Green
  task: '#F59E0B', // Amber
  project: '#3B82F6', // Blue
  event: '#8B5CF6', // Purple
};

export default function SimpleCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemType, setItemType] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [activeTab, setActiveTab] = useState('events');
  const [filters, setFilters] = useState({
    showBookings: true,
    showTasks: true,
    showProjects: true,
    showEvents: true,
  });

  const { toast } = useToast();

  // Fetch all data sources
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['/api/events'],
    staleTime: 60000,
  });

  const { data: bookings = [], isLoading: bookingsLoading } = useQuery({
    queryKey: ['/api/bookings'],
    staleTime: 60000,
  });

  const { data: tasks = [], isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks'],
    staleTime: 60000,
  });

  const { data: projects = [], isLoading: projectsLoading } = useQuery({
    queryKey: ['/api/projects'],
    staleTime: 60000,
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['/api/clients'],
    staleTime: 60000,
  });

  const isLoading = eventsLoading || bookingsLoading || tasksLoading || projectsLoading || clientsLoading;

  // Get current month boundaries
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);

  // Filter data by current month
  const currentMonthData = useMemo(() => {
    const monthEvents = Array.isArray(events) ? events.filter((event: any) => {
      if (!event.startTime) return false;
      const eventDate = new Date(event.startTime);
      return isWithinInterval(eventDate, { start: monthStart, end: monthEnd });
    }) : [];

    const monthBookings = Array.isArray(bookings) ? bookings.filter((booking: any) => {
      if (!booking.date) return false;
      const bookingDate = new Date(booking.date);
      return isWithinInterval(bookingDate, { start: monthStart, end: monthEnd });
    }) : [];

    const monthTasks = Array.isArray(tasks) ? tasks.filter((task: any) => {
      if (!task.deadline) return false;
      const taskDate = new Date(task.deadline);
      return isWithinInterval(taskDate, { start: monthStart, end: monthEnd });
    }) : [];

    const monthProjects = Array.isArray(projects) ? projects.filter((project: any) => {
      if (!project.startDate) return false;
      const projectDate = new Date(project.startDate);
      return isWithinInterval(projectDate, { start: monthStart, end: monthEnd });
    }) : [];

    return {
      events: monthEvents,
      bookings: monthBookings,
      tasks: monthTasks,
      projects: monthProjects
    };
  }, [events, bookings, tasks, projects, monthStart, monthEnd]);

  // Helper function to get client name by ID
  const getClientName = (clientId: number | null, clients: any[]) => {
    if (!clientId || !clients) return '';
    const client = clients.find((c: any) => c.id === clientId);
    return client ? client.name : '';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your calendar data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-3 md:p-6 space-y-4 md:space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Calendar</h1>
          <p className="text-sm md:text-base text-gray-600">View your monthly schedule and items</p>
        </div>
      </div>

      {/* Month Navigation */}
      <Card>
        <CardContent className="p-3 md:p-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <h2 className="text-lg md:text-xl font-semibold">
              {format(currentDate, 'MMMM yyyy')}
            </h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(add(currentDate, { months: -1 }))}
                className="text-xs md:text-sm"
              >
                <span className="hidden sm:inline">← Previous</span>
                <span className="sm:hidden">←</span>
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date())}
                className="text-xs md:text-sm"
              >
                Today
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(add(currentDate, { months: 1 }))}
                className="text-xs md:text-sm"
              >
                <span className="hidden sm:inline">Next →</span>
                <span className="sm:hidden">→</span>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Card>
        <CardContent className="p-3 md:p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-4 gap-1 mb-6">
              <TabsTrigger value="events" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Clock className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Events ({currentMonthData.events.length})</span>
                <span className="sm:hidden">E({currentMonthData.events.length})</span>
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Users className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Bookings ({currentMonthData.bookings.length})</span>
                <span className="sm:hidden">B({currentMonthData.bookings.length})</span>
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <CheckSquare className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Tasks ({currentMonthData.tasks.length})</span>
                <span className="sm:hidden">T({currentMonthData.tasks.length})</span>
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-1 md:gap-2 text-xs md:text-sm">
                <Briefcase className="h-3 w-3 md:h-4 md:w-4" />
                <span className="hidden sm:inline">Projects ({currentMonthData.projects.length})</span>
                <span className="sm:hidden">P({currentMonthData.projects.length})</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="events" className="mt-6">
              <div className="space-y-4">
                {currentMonthData.events.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No events scheduled for {format(currentDate, 'MMMM yyyy')}</p>
                ) : (
                  currentMonthData.events.map((event: any) => (
                    <Card key={event.id} className="border-l-4 border-l-purple-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{event.title}</h3>
                            {event.description && (
                              <p className="text-gray-600 mt-1">{event.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span>📅 {format(new Date(event.startTime), 'MMM d, yyyy')}</span>
                              <span>🕒 {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}</span>
                              {event.location && <span>📍 {event.location}</span>}
                            </div>
                          </div>
                          <Badge variant="secondary">Event</Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="bookings" className="mt-6">
              <div className="space-y-4">
                {currentMonthData.bookings.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No bookings scheduled for {format(currentDate, 'MMMM yyyy')}</p>
                ) : (
                  currentMonthData.bookings.map((booking: any) => (
                    <Card key={booking.id} className="border-l-4 border-l-green-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{booking.clientName}</h3>
                            <p className="text-gray-600 mt-1">{booking.serviceName || 'Booking'}</p>
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span>📅 {format(new Date(booking.date), 'MMM d, yyyy')}</span>
                              <span>🕒 {booking.time}</span>
                              {booking.duration && <span>⏱️ {booking.duration} min</span>}
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-green-500 text-white">
                            Booking
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="tasks" className="mt-6">
              <div className="space-y-4">
                {currentMonthData.tasks.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No task deadlines in {format(currentDate, 'MMMM yyyy')}</p>
                ) : (
                  currentMonthData.tasks.map((task: any) => (
                    <Card key={task.id} className="border-l-4 border-l-amber-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{task.title}</h3>
                            {task.description && (
                              <p className="text-gray-600 mt-1">{task.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span>📅 Due: {format(new Date(task.deadline), 'MMM d, yyyy')}</span>
                              {task.priority && <span>🎯 {task.priority}</span>}
                              {task.status && <span>📊 {task.status}</span>}
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-amber-500 text-white">
                            Task
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>

            <TabsContent value="projects" className="mt-6">
              <div className="space-y-4">
                {currentMonthData.projects.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No projects starting in {format(currentDate, 'MMMM yyyy')}</p>
                ) : (
                  currentMonthData.projects.map((project: any) => (
                    <Card key={project.id} className="border-l-4 border-l-blue-500">
                      <CardContent className="p-4">
                        <div className="flex items-start justify-between">
                          <div>
                            <h3 className="font-semibold text-lg">{project.name}</h3>
                            {project.description && (
                              <p className="text-gray-600 mt-1">{project.description}</p>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
                              <span>📅 Start: {format(new Date(project.startDate), 'MMM d, yyyy')}</span>
                              {project.endDate && <span>🏁 End: {format(new Date(project.endDate), 'MMM d, yyyy')}</span>}
                              {project.status && <span>📊 {project.status}</span>}
                              {project.clientId && <span>👤 {getClientName(project.clientId, Array.isArray(clients) ? clients : [])}</span>}
                            </div>
                          </div>
                          <Badge variant="secondary" className="bg-blue-500 text-white">
                            Project
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}