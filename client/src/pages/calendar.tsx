import { useState, useCallback, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parseISO, startOfWeek, getDay, parse, add, endOfMonth, startOfDay, endOfDay, startOfMonth, isSameMonth } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon, Clock, Users, Briefcase, DollarSign, CheckSquare, Filter, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Create a date-fns localizer for React Big Calendar
const locales = {
  'en-US': enUS,
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: () => startOfWeek(new Date(), { locale: enUS }),
  getDay,
  locales,
});

// Event form schema
const eventFormSchema = z.object({
  title: z.string().min(3, { message: "Title must be at least 3 characters" }),
  startTime: z.date(),
  endTime: z.date(),
  description: z.string().optional().nullable(),
  location: z.string().optional().nullable(),
  clientName: z.string().optional().nullable(),
  clientId: z.number().optional().nullable(),
  projectId: z.number().optional().nullable(),
  invoiceId: z.number().optional().nullable(),
  isConfirmed: z.boolean().default(false),
  eventType: z.enum(['private', 'busy', 'available', 'travel', 'client_meeting', 'consultation', 'project_work', 'follow_up', 'training']).default('busy'),
  color: z.string().optional().nullable(),
});

type EventFormValues = z.infer<typeof eventFormSchema>;

// Define interfaces for our data types
interface Client {
  id: number;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  address?: string;
}

interface Project {
  id: number;
  name: string;
  clientId?: number;
  description?: string;
  startDate: Date | string;
  endDate?: Date | string;
  status: string;
}

interface Invoice {
  id: number;
  invoiceNumber: string;
  clientId: number;
  issueDate: Date | string;
  dueDate: Date | string;
  amount: number;
  status: string;
}

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  description?: string | null;
  location?: string | null;
  clientName?: string | null;
  clientId?: number | null;
  projectId?: number | null;
  invoiceId?: number | null;
  isConfirmed: boolean;
  eventType: 'private' | 'busy' | 'available' | 'travel' | 'client_meeting' | 'consultation' | 'project_work' | 'follow_up' | 'training';
  color?: string | null;
  allDay?: boolean;
  userId: string;
}

export default function CalendarPage() {
  const [selectedView, setSelectedView] = useState('month');
  const [openEventDialog, setOpenEventDialog] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('calendar');
  const { toast } = useToast();
  
  // State for filters
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    eventTypes: [] as string[],
    clients: [] as number[],
    projects: [] as number[],
    onlyConfirmed: false,
    dateRange: {
      start: startOfDay(new Date()).toISOString(),
      end: endOfMonth(new Date()).toISOString()
    }
  });

  // Form setup
  const form = useForm<EventFormValues>({
    resolver: zodResolver(eventFormSchema),
    defaultValues: {
      title: "",
      startTime: new Date(),
      endTime: add(new Date(), { hours: 1 }),
      description: "",
      location: "",
      clientName: "",
      clientId: null,
      projectId: null,
      invoiceId: null,
      isConfirmed: false,
      eventType: "busy",
      color: "#3b82f6", // Default blue color
    },
  });

  // Query to fetch all data sources
  const { data: events = [], isLoading: eventsLoading, isError: eventsError } = useQuery({
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

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['/api/invoices'],
    staleTime: 60000,
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['/api/clients'],
    staleTime: 60000,
  });

  // Check if any data is still loading
  const isLoading = eventsLoading || bookingsLoading || tasksLoading || projectsLoading || invoicesLoading || clientsLoading;

  // Mutation to create event
  const createEventMutation = useMutation({
    mutationFn: async (values: EventFormValues) => {
      // Parse date strings to Date objects if needed and handle date conversion
      let startDate, endDate;
      
      try {
        // Handle various input formats
        startDate = values.startTime instanceof Date 
          ? values.startTime 
          : new Date(values.startTime);
          
        endDate = values.endTime instanceof Date
          ? values.endTime
          : new Date(values.endTime);
          
        // Validate that we have valid dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error("Invalid date values");
        }
      } catch (err) {
        console.error("Date parsing error:", err);
        throw new Error("Invalid date format for start or end time");
      }
      
      // Ensure values contain all the required fields with proper types
      const eventData = {
        userId: "user-1", // Default user ID for demo
        title: values.title,
        description: values.description || null,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        location: values.location || null,
        clientName: values.clientName || null,
        clientId: values.clientId || null,
        projectId: values.projectId || null,
        invoiceId: values.invoiceId || null,
        isConfirmed: Boolean(values.isConfirmed),
        eventType: values.eventType || "busy",
        color: values.color || "#3b82f6",
      };
      
      console.log("Sending event data:", eventData);
      
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(eventData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Event creation error:", errorData);
        throw new Error(`Failed to create event: ${JSON.stringify(errorData)}`);
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Event created",
        description: "Your event has been successfully created.",
      });
      setOpenEventDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create event: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation to update event
  const updateEventMutation = useMutation({
    mutationFn: async (values: EventFormValues & { id: number }) => {
      const { id, ...eventData } = values;
      
      // Parse date strings to Date objects if needed
      let startDate, endDate;
      
      try {
        // Handle various input formats
        startDate = eventData.startTime instanceof Date 
          ? eventData.startTime 
          : new Date(eventData.startTime);
          
        endDate = eventData.endTime instanceof Date
          ? eventData.endTime
          : new Date(eventData.endTime);
          
        // Validate that we have valid dates
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
          throw new Error("Invalid date values");
        }
      } catch (err) {
        console.error("Date parsing error:", err);
        throw new Error("Invalid date format for start or end time");
      }
      
      // Convert to server format
      const serverData = {
        ...eventData,
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        eventType: eventData.eventType || "busy"
      };
      
      const response = await fetch(`/api/events/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(serverData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update event');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Event updated",
        description: "Your event has been successfully updated.",
      });
      setOpenEventDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update event: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Mutation to delete event
  const deleteEventMutation = useMutation({
    mutationFn: async (id: number) => {
      const response = await fetch(`/api/events/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete event');
      }
      
      return true;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({
        title: "Event deleted",
        description: "Your event has been successfully deleted.",
      });
      setOpenEventDialog(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to delete event: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  // Transform events data for calendar display with filtering
  const calendarEvents = useMemo(() => {
    if (!events || !Array.isArray(events) || events.length === 0) return [];
    
    // First map the events to our CalendarEvent type
    const mappedEvents = events.map((event: any) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.startTime),
      end: new Date(event.endTime),
      description: event.description,
      location: event.location,
      clientName: event.clientName,
      clientId: event.clientId,
      projectId: event.projectId,
      invoiceId: event.invoiceId,
      isConfirmed: event.isConfirmed,
      eventType: event.eventType,
      color: event.color,
      userId: event.userId,
    }));
    
    // Then apply filters if any are active
    return mappedEvents.filter(event => {
      // Filter by event type
      if (filters.eventTypes.length > 0 && !filters.eventTypes.includes(event.eventType)) {
        return false;
      }
      
      // Filter by client
      if (filters.clients.length > 0 && (!event.clientId || !filters.clients.includes(event.clientId))) {
        return false;
      }
      
      // Filter by project
      if (filters.projects.length > 0 && (!event.projectId || !filters.projects.includes(event.projectId))) {
        return false;
      }
      
      // Filter by confirmation status
      if (filters.onlyConfirmed && !event.isConfirmed) {
        return false;
      }
      
      // Filter by date range (always apply date range filter)
      const eventStart = event.start.getTime();
      const filterStart = new Date(filters.dateRange.start).getTime();
      const filterEnd = new Date(filters.dateRange.end).getTime();
      
      if (eventStart < filterStart || eventStart > filterEnd) {
        return false;
      }
      
      return true;
    });
  }, [events, filters]);

  // Filter data by current displayed month
  const currentMonthData = useMemo(() => {
    try {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      // Filter events for current month
      const monthEvents = events && Array.isArray(events) ? events.filter((event: any) => {
        if (!event.startTime) return false;
        const eventDate = new Date(event.startTime);
        return eventDate >= monthStart && eventDate <= monthEnd;
      }) : [];
      
      // Filter bookings for current month
      const monthBookings = bookings && Array.isArray(bookings) ? bookings.filter((booking: any) => {
        if (!booking.date) return false;
        const bookingDate = new Date(booking.date);
        return bookingDate >= monthStart && bookingDate <= monthEnd;
      }) : [];
      
      // Filter tasks for current month (by deadline)
      const monthTasks = tasks && Array.isArray(tasks) ? tasks.filter((task: any) => {
        if (!task.deadline) return false;
        const taskDate = new Date(task.deadline);
        return taskDate >= monthStart && taskDate <= monthEnd;
      }) : [];
      
      // Filter projects for current month (by start or end date)
      const monthProjects = projects && Array.isArray(projects) ? projects.filter((project: any) => {
        if (!project.startDate) return false;
        const startDate = new Date(project.startDate);
        const endDate = project.endDate ? new Date(project.endDate) : null;
        return (startDate >= monthStart && startDate <= monthEnd) ||
               (endDate && endDate >= monthStart && endDate <= monthEnd) ||
               (startDate <= monthStart && (!endDate || endDate >= monthEnd));
      }) : [];
      
      return {
        events: monthEvents,
        bookings: monthBookings,
        tasks: monthTasks,
        projects: monthProjects
      };
    } catch (error) {
      console.error('Error filtering calendar data:', error);
      return {
        events: [],
        bookings: [],
        tasks: [],
        projects: []
      };
    }
  }, [currentDate, events, bookings, tasks, projects]);

  // Handle event selection
  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedEvent(event);
    form.reset({
      title: event.title,
      startTime: event.start,
      endTime: event.end,
      description: event.description || "",
      location: event.location || "",
      clientName: event.clientName || "",
      isConfirmed: event.isConfirmed,
      eventType: event.eventType,
      color: event.color || "#3b82f6",
    });
    setOpenEventDialog(true);
  }, [form]);

  // Handle slot selection (time slot in calendar)
  const handleSelectSlot = useCallback(
    ({ start, end }: { start: Date; end: Date }) => {
      setSelectedEvent(null);
      setSelectedSlot({ start, end });
      form.reset({
        title: "",
        startTime: start,
        endTime: end,
        description: "",
        location: "",
        clientName: "",
        isConfirmed: false,
        eventType: "busy",
        color: "#3b82f6",
      });
      setOpenEventDialog(true);
    },
    [form]
  );

  // State for notifications/reminders
  const [showNotifications, setShowNotifications] = useState(false);
  const [notifications, setNotifications] = useState<CalendarEvent[]>([]);
  
  // Default colors for different event types
  const eventTypeColors = {
    busy: '#3b82f6', // blue
    available: '#10b981', // green
    private: '#6366f1', // indigo
    travel: '#f59e0b', // amber
    client_meeting: '#ef4444', // red
    consultation: '#8b5cf6', // purple
    project_work: '#0ea5e9', // sky
    follow_up: '#ec4899', // pink
    training: '#14b8a6', // teal
  };
  
  // Check for upcoming events and create notifications
  useEffect(() => {
    if (!events || !Array.isArray(events)) return;
    
    // Get events happening today or tomorrow
    const now = new Date();
    const tomorrow = add(now, { days: 1 });
    
    const upcomingEvents = events
      .filter((event: any) => {
        const eventStart = new Date(event.startTime);
        return eventStart >= now && eventStart <= tomorrow;
      })
      .map((event: any) => ({
        id: event.id,
        title: event.title,
        start: new Date(event.startTime),
        end: new Date(event.endTime),
        description: event.description,
        location: event.location,
        clientName: event.clientName,
        clientId: event.clientId,
        projectId: event.projectId,
        invoiceId: event.invoiceId,
        isConfirmed: event.isConfirmed,
        eventType: event.eventType,
        color: event.color,
        userId: event.userId,
      }))
      .sort((a, b) => a.start.getTime() - b.start.getTime());
      
    if (upcomingEvents.length > 0) {
      setNotifications(upcomingEvents);
      setShowNotifications(true);
    }
  }, [events]);

  // Event styling with improved colors by event type
  const eventPropGetter = useCallback(
    (event: CalendarEvent) => {
      // Use custom color if set, otherwise use the color for the event type
      const defaultColor = event.eventType ? eventTypeColors[event.eventType as keyof typeof eventTypeColors] : '#3b82f6';
      const backgroundColor = event.color || defaultColor;
      
      const style = {
        backgroundColor,
        borderRadius: '4px',
        opacity: event.isConfirmed ? 1 : 0.7,
        color: '#fff',
        border: 'none',
        display: 'block',
        fontWeight: event.isConfirmed ? 'bold' : 'normal',
        boxShadow: event.isConfirmed ? '0 1px 3px rgba(0,0,0,0.2)' : 'none',
      };
      
      return {
        style,
        className: `event-type-${event.eventType} ${event.isConfirmed ? 'confirmed' : 'unconfirmed'}`
      };
    },
    [eventTypeColors] // Add missing dependency
  );

  // Form submission
  const onSubmit = (data: EventFormValues) => {
    if (selectedEvent) {
      // Update existing event
      updateEventMutation.mutate({
        ...data,
        id: selectedEvent.id,
      });
    } else {
      // Create new event
      createEventMutation.mutate(data);
    }
  };

  // Handle delete event
  const handleDeleteEvent = () => {
    if (selectedEvent) {
      if (confirm('Are you sure you want to delete this event?')) {
        deleteEventMutation.mutate(selectedEvent.id);
      }
    }
  };

  return (
    <div className="container mx-auto px-4 py-6">
      <div className="flex flex-col space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Calendar</h1>
            <p className="text-muted-foreground">
              Manage your appointments, meetings, and schedule
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex gap-2">
              <Button 
                variant="outline"
                onClick={() => setShowFilters(true)}
                className="flex items-center gap-1"
              >
                <Filter className="h-4 w-4" />
                Filter
                {(filters.eventTypes.length > 0 || filters.clients.length > 0 || 
                 filters.projects.length > 0 || filters.onlyConfirmed) && (
                  <span className="ml-1 flex h-2 w-2 rounded-full bg-primary"></span>
                )}
              </Button>
              
              <Button 
                onClick={() => {
                  setSelectedEvent(null);
                  form.reset({
                    title: "",
                    startTime: new Date(),
                    endTime: add(new Date(), { hours: 1 }),
                    description: "",
                    location: "",
                    clientName: "",
                    clientId: null,
                    projectId: null,
                    invoiceId: null,
                    isConfirmed: false,
                    eventType: "busy",
                    color: "#3b82f6",
                  });
                  setOpenEventDialog(true);
                }}
              >
                Add Event
              </Button>
            </div>
          </div>
        </div>

        <div className="w-full">
          <div className="flex border-b border-border bg-muted p-1 rounded-lg">
            <button
              onClick={() => {
                console.log('Calendar tab clicked');
                setActiveTab('calendar');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'calendar' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <CalendarIcon className="h-4 w-4" />
              Calendar
            </button>
            <button
              onClick={() => {
                console.log('Events tab clicked');
                setActiveTab('events');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'events' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <Clock className="h-4 w-4" />
              Events ({currentMonthData.events.length})
            </button>
            <button
              onClick={() => {
                console.log('Bookings tab clicked');
                setActiveTab('bookings');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'bookings' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <Users className="h-4 w-4" />
              Bookings ({currentMonthData.bookings.length})
            </button>
            <button
              onClick={() => {
                console.log('Tasks tab clicked');
                setActiveTab('tasks');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'tasks' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <CheckSquare className="h-4 w-4" />
              Tasks ({currentMonthData.tasks.length})
            </button>
            <button
              onClick={() => {
                console.log('Projects tab clicked');
                setActiveTab('projects');
              }}
              className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors ${
                activeTab === 'projects' 
                  ? 'bg-background text-foreground shadow-sm' 
                  : 'text-muted-foreground hover:text-foreground hover:bg-background/50'
              }`}
            >
              <Briefcase className="h-4 w-4" />
              Projects ({currentMonthData.projects.length})
            </button>
          </div>

          <div className="mt-6">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-semibold">
                {format(currentDate, 'MMMM yyyy')}
              </h2>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(add(currentDate, { months: -1 }))}
                >
                  ← Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(new Date())}
                >
                  Today
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentDate(add(currentDate, { months: 1 }))}
                >
                  Next →
                </Button>
              </div>
            </div>

            {activeTab === 'calendar' && (
              <Card className="border rounded-lg shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle>Calendar View</CardTitle>
                    <div className="flex gap-1">
                      <Button
                        variant={selectedView === 'month' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedView('month')}
                      >
                        Month
                      </Button>
                      <Button
                        variant={selectedView === 'week' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedView('week')}
                      >
                        Week
                      </Button>
                      <Button
                        variant={selectedView === 'day' ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setSelectedView('day')}
                      >
                        Day
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4 overflow-hidden h-[calc(100vh-350px)]">
                  {eventsLoading ? (
                    <div className="flex justify-center items-center h-full">
                      <p>Loading calendar...</p>
                    </div>
                  ) : eventsError ? (
                    <div className="flex justify-center items-center h-full">
                      <p>Error loading events. Please try again later.</p>
                    </div>
                  ) : (
                    <Calendar
                      localizer={localizer as any}
                      events={calendarEvents}
                      defaultView={Views.MONTH}
                      views={['month', 'week', 'day']}
                      view={selectedView as any}
                      onView={(view) => setSelectedView(view)}
                      date={currentDate}
                      onNavigate={(date) => setCurrentDate(date)}
                      selectable
                      onSelectEvent={handleSelectEvent}
                      onSelectSlot={handleSelectSlot}
                      eventPropGetter={eventPropGetter}
                      step={30}
                      showMultiDayTimes
                      popup
                      style={{ height: '100%' }}
                    />
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'events' && (
              <Card>
                <CardHeader>
                  <CardTitle>Events for {format(currentDate, 'MMMM yyyy')}</CardTitle>
                  <CardDescription>
                    {currentMonthData.events.length} events scheduled this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentMonthData.events.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No events scheduled for this month
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {currentMonthData.events.map((event: any) => (
                        <Popover key={event.id}>
                          <PopoverTrigger asChild>
                            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                              <div className="flex-1">
                                <h3 className="font-medium">{event.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(event.startTime), 'MMM dd, yyyy • h:mm a')}
                                  {event.location && ` • ${event.location}`}
                                </p>
                                {event.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={event.isConfirmed ? "default" : "secondary"}>
                                  {event.isConfirmed ? "Confirmed" : "Pending"}
                                </Badge>
                                <Badge variant="outline">{event.eventType}</Badge>
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">{event.title}</h4>
                                <Button
                                  size="sm"
                                  onClick={() => handleSelectEvent({
                                    ...event,
                                    start: new Date(event.startTime),
                                    end: new Date(event.endTime)
                                  })}
                                >
                                  Edit
                                </Button>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium">Date:</span> {format(new Date(event.startTime), 'MMM dd, yyyy')}
                                </div>
                                <div>
                                  <span className="font-medium">Time:</span> {format(new Date(event.startTime), 'h:mm a')} - {format(new Date(event.endTime), 'h:mm a')}
                                </div>
                                {event.location && (
                                  <div>
                                    <span className="font-medium">Location:</span> {event.location}
                                  </div>
                                )}
                                {event.clientName && (
                                  <div>
                                    <span className="font-medium">Client:</span> {event.clientName}
                                  </div>
                                )}
                                {event.description && (
                                  <div>
                                    <span className="font-medium">Description:</span> {event.description}
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">Type:</span> {event.eventType}
                                </div>
                                <div>
                                  <span className="font-medium">Status:</span> {event.isConfirmed ? "Confirmed" : "Pending"}
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'bookings' && (
              <Card>
                <CardHeader>
                  <CardTitle>Bookings for {format(currentDate, 'MMMM yyyy')}</CardTitle>
                  <CardDescription>
                    {currentMonthData.bookings.length} bookings scheduled this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentMonthData.bookings.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No bookings scheduled for this month
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {currentMonthData.bookings.map((booking: any) => (
                        <Popover key={booking.id}>
                          <PopoverTrigger asChild>
                            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                              <div className="flex-1">
                                <h3 className="font-medium">{booking.clientName}</h3>
                                <p className="text-sm text-muted-foreground">
                                  {format(new Date(booking.date), 'MMM dd, yyyy')} • {booking.time}
                                  {booking.service && ` • ${booking.service}`}
                                </p>
                                {booking.location && (
                                  <p className="text-sm text-muted-foreground mt-1">{booking.location}</p>
                                )}
                                {booking.notes && (
                                  <p className="text-sm text-muted-foreground mt-1">{booking.notes}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={booking.status === 'confirmed' ? "default" : booking.status === 'pending' ? "secondary" : "destructive"}>
                                  {booking.status}
                                </Badge>
                                {booking.phone && (
                                  <Badge variant="outline">{booking.phone}</Badge>
                                )}
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">Booking Details</h4>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium">Client:</span> {booking.clientName}
                                </div>
                                <div>
                                  <span className="font-medium">Date:</span> {format(new Date(booking.date), 'MMM dd, yyyy')}
                                </div>
                                <div>
                                  <span className="font-medium">Time:</span> {booking.time}
                                </div>
                                {booking.service && (
                                  <div>
                                    <span className="font-medium">Service:</span> {booking.service}
                                  </div>
                                )}
                                {booking.location && (
                                  <div>
                                    <span className="font-medium">Location:</span> {booking.location}
                                  </div>
                                )}
                                {booking.phone && (
                                  <div>
                                    <span className="font-medium">Phone:</span> {booking.phone}
                                  </div>
                                )}
                                {booking.email && (
                                  <div>
                                    <span className="font-medium">Email:</span> {booking.email}
                                  </div>
                                )}
                                {booking.notes && (
                                  <div>
                                    <span className="font-medium">Notes:</span> {booking.notes}
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">Status:</span> {booking.status}
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'tasks' && (
              <Card>
                <CardHeader>
                  <CardTitle>Tasks Due in {format(currentDate, 'MMMM yyyy')}</CardTitle>
                  <CardDescription>
                    {currentMonthData.tasks.length} tasks due this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentMonthData.tasks.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No tasks due this month
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {currentMonthData.tasks.map((task: any) => (
                        <Popover key={task.id}>
                          <PopoverTrigger asChild>
                            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                              <div className="flex-1">
                                <h3 className="font-medium">{task.title}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Due: {format(new Date(task.deadline), 'MMM dd, yyyy')}
                                  {task.projectId && ` • Project ID: ${task.projectId}`}
                                </p>
                                {task.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={task.completed ? "default" : "secondary"}>
                                  {task.completed ? "Completed" : "Pending"}
                                </Badge>
                                <Badge variant="outline">{task.status}</Badge>
                                <Badge variant="outline">{task.priority}</Badge>
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">Task Details</h4>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium">Title:</span> {task.title}
                                </div>
                                {task.description && (
                                  <div>
                                    <span className="font-medium">Description:</span> {task.description}
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">Due Date:</span> {format(new Date(task.deadline), 'MMM dd, yyyy')}
                                </div>
                                <div>
                                  <span className="font-medium">Status:</span> {task.status}
                                </div>
                                <div>
                                  <span className="font-medium">Priority:</span> {task.priority}
                                </div>
                                <div>
                                  <span className="font-medium">Completed:</span> {task.completed ? "Yes" : "No"}
                                </div>
                                {task.projectId && (
                                  <div>
                                    <span className="font-medium">Project ID:</span> {task.projectId}
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">Created:</span> {format(new Date(task.createdAt), 'MMM dd, yyyy')}
                                </div>
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {activeTab === 'projects' && (
              <Card>
                <CardHeader>
                  <CardTitle>Projects Active in {format(currentDate, 'MMMM yyyy')}</CardTitle>
                  <CardDescription>
                    {currentMonthData.projects.length} projects active this month
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {currentMonthData.projects.length === 0 ? (
                    <p className="text-muted-foreground text-center py-8">
                      No projects active this month
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {currentMonthData.projects.map((project: any) => (
                        <Popover key={project.id}>
                          <PopoverTrigger asChild>
                            <div className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 cursor-pointer">
                              <div className="flex-1">
                                <h3 className="font-medium">{project.name}</h3>
                                <p className="text-sm text-muted-foreground">
                                  Start: {format(new Date(project.startDate), 'MMM dd, yyyy')}
                                  {project.endDate && ` • End: ${format(new Date(project.endDate), 'MMM dd, yyyy')}`}
                                  {project.clientId && ` • Client ID: ${project.clientId}`}
                                </p>
                                {project.description && (
                                  <p className="text-sm text-muted-foreground mt-1">{project.description}</p>
                                )}
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge variant={project.status === 'completed' ? "default" : project.status === 'in_progress' ? "secondary" : "outline"}>
                                  {project.status}
                                </Badge>
                                {project.budget && (
                                  <Badge variant="outline">${project.budget}</Badge>
                                )}
                              </div>
                            </div>
                          </PopoverTrigger>
                          <PopoverContent className="w-80">
                            <div className="space-y-3">
                              <div className="flex items-center justify-between">
                                <h4 className="font-semibold">Project Details</h4>
                              </div>
                              <div className="space-y-2 text-sm">
                                <div>
                                  <span className="font-medium">Name:</span> {project.name}
                                </div>
                                {project.description && (
                                  <div>
                                    <span className="font-medium">Description:</span> {project.description}
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">Start Date:</span> {format(new Date(project.startDate), 'MMM dd, yyyy')}
                                </div>
                                {project.endDate && (
                                  <div>
                                    <span className="font-medium">End Date:</span> {format(new Date(project.endDate), 'MMM dd, yyyy')}
                                  </div>
                                )}
                                <div>
                                  <span className="font-medium">Status:</span> {project.status}
                                </div>
                                {project.budget && (
                                  <div>
                                    <span className="font-medium">Budget:</span> ${project.budget}
                                  </div>
                                )}
                                {project.clientId && (
                                  <div>
                                    <span className="font-medium">Client ID:</span> {project.clientId}
                                  </div>
                                )}
                              </div>
                            </div>
                          </PopoverContent>
                        </Popover>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>

      {/* Event Dialog */}
      <Dialog open={openEventDialog} onOpenChange={setOpenEventDialog}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {selectedEvent ? "Edit Event" : "Create New Event"}
            </DialogTitle>
          </DialogHeader>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Event title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="startTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Start Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                          value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ''} 
                          onChange={(e) => {
                            const dateTime = e.target.value ? new Date(e.target.value) : new Date();
                            field.onChange(dateTime);
                          }} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="endTime"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>End Time</FormLabel>
                      <FormControl>
                        <Input 
                          type="datetime-local" 
                          {...field} 
                          value={field.value ? format(field.value, "yyyy-MM-dd'T'HH:mm") : ''} 
                          onChange={(e) => {
                            const dateTime = e.target.value ? new Date(e.target.value) : new Date();
                            field.onChange(dateTime);
                          }} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="eventType"
                render={({ field }) => {
                  // Ensure field.value is never null, undefined, or empty
                  const safeValue = field.value || "busy";
                  
                  return (
                    <FormItem>
                      <FormLabel>Event Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={safeValue}
                        value={safeValue}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select event type">
                              {safeValue.replace('_', ' ').charAt(0).toUpperCase() + safeValue.replace('_', ' ').slice(1)}
                            </SelectValue>
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="busy">Busy</SelectItem>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="private">Private</SelectItem>
                          <SelectItem value="travel">Travel</SelectItem>
                          <SelectItem value="client_meeting">Client Meeting</SelectItem>
                          <SelectItem value="consultation">Consultation</SelectItem>
                          <SelectItem value="project_work">Project Work</SelectItem>
                          <SelectItem value="follow_up">Follow-up Call</SelectItem>
                          <SelectItem value="training">Training/Workshop</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add event details..."
                        className="resize-none"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="location"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Location</FormLabel>
                      <FormControl>
                        <Input placeholder="Location" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="clientName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Client Name</FormLabel>
                      <FormControl>
                        <Input placeholder="Client name" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4 pt-2 pb-2 border-t border-b">
                <h3 className="text-sm font-medium text-slate-500">Link to business data</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <FormField
                    control={form.control}
                    name="clientId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Client</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value) || null)}
                          value={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Link to client">
                                {field.value ? clients.find((c: any) => c.id === field.value)?.name || field.value : "None"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {clients.map((client: any) => (
                              <SelectItem key={client.id} value={client.id.toString()}>
                                {client.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="projectId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value) || null)}
                          value={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Link to project">
                                {field.value ? projects.find((p: any) => p.id === field.value)?.name || field.value : "None"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {projects.map((project: any) => (
                              <SelectItem key={project.id} value={project.id.toString()}>
                                {project.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={form.control}
                    name="invoiceId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Invoice</FormLabel>
                        <Select
                          onValueChange={(value) => field.onChange(parseInt(value) || null)}
                          value={field.value?.toString() || ""}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Link to invoice">
                                {field.value ? invoices.find((i: any) => i.id === field.value)?.invoiceNumber || field.value : "None"}
                              </SelectValue>
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="">None</SelectItem>
                            {invoices.map((invoice: any) => (
                              <SelectItem key={invoice.id} value={invoice.id.toString()}>
                                {invoice.invoiceNumber}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              <FormField
                control={form.control}
                name="isConfirmed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                    <FormControl>
                      <input
                        type="checkbox"
                        checked={field.value}
                        onChange={field.onChange}
                        className="h-4 w-4 mt-1"
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Confirmed</FormLabel>
                      <FormDescription>
                        Is this event confirmed by the client?
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="color"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Color</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <Input
                          type="color"
                          className="w-12 h-10 p-1"
                          {...field}
                          value={field.value || '#3b82f6'}
                        />
                        <span className="text-sm text-muted-foreground">
                          Choose a color for this event
                        </span>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <DialogFooter className="flex justify-between items-center pt-4">
                {selectedEvent && (
                  <Button
                    type="button"
                    variant="destructive"
                    onClick={handleDeleteEvent}
                  >
                    Delete
                  </Button>
                )}
                <div className="flex gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setOpenEventDialog(false)}
                  >
                    Cancel
                  </Button>
                  <Button type="submit">
                    {selectedEvent ? "Update" : "Create"}
                  </Button>
                </div>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Filter Dialog */}
      <Dialog open={showFilters} onOpenChange={setShowFilters}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Filter Events</DialogTitle>
            <DialogDescription>
              Customize which events are displayed on your calendar.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-6 py-4">
            {/* Event Type Filter */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Event Types</h3>
              <div className="flex flex-wrap gap-2">
                {Object.entries(eventTypeColors).map(([type, color]) => (
                  <div 
                    key={type}
                    onClick={() => {
                      setFilters(prev => {
                        if (prev.eventTypes.includes(type)) {
                          return {
                            ...prev,
                            eventTypes: prev.eventTypes.filter(t => t !== type)
                          };
                        } else {
                          return {
                            ...prev,
                            eventTypes: [...prev.eventTypes, type]
                          };
                        }
                      });
                    }}
                    className={`
                      px-3 py-1 rounded-full text-xs cursor-pointer flex items-center gap-1
                      ${filters.eventTypes.includes(type) 
                        ? 'bg-opacity-100 text-white' 
                        : 'bg-opacity-30 text-gray-700 hover:bg-opacity-50'}
                    `}
                    style={{ backgroundColor: filters.eventTypes.includes(type) ? color : `${color}30` }}
                  >
                    {filters.eventTypes.includes(type) && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    {type.replace('_', ' ').charAt(0).toUpperCase() + type.replace('_', ' ').slice(1)}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Client Filter */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Clients</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {clients.map((client) => (
                  <div 
                    key={client.id}
                    onClick={() => {
                      setFilters(prev => {
                        if (prev.clients.includes(client.id)) {
                          return {
                            ...prev,
                            clients: prev.clients.filter(id => id !== client.id)
                          };
                        } else {
                          return {
                            ...prev,
                            clients: [...prev.clients, client.id]
                          };
                        }
                      });
                    }}
                    className={`
                      px-3 py-2 rounded-md text-sm cursor-pointer flex items-center gap-1
                      ${filters.clients.includes(client.id) 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                  >
                    {filters.clients.includes(client.id) && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    {client.name}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Project Filter */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium">Projects</h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {projects.map((project) => (
                  <div 
                    key={project.id}
                    onClick={() => {
                      setFilters(prev => {
                        if (prev.projects.includes(project.id)) {
                          return {
                            ...prev,
                            projects: prev.projects.filter(id => id !== project.id)
                          };
                        } else {
                          return {
                            ...prev,
                            projects: [...prev.projects, project.id]
                          };
                        }
                      });
                    }}
                    className={`
                      px-3 py-2 rounded-md text-sm cursor-pointer flex items-center gap-1
                      ${filters.projects.includes(project.id) 
                        ? 'bg-primary text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}
                    `}
                  >
                    {filters.projects.includes(project.id) && (
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-check">
                        <polyline points="20 6 9 17 4 12"/>
                      </svg>
                    )}
                    {project.name}
                  </div>
                ))}
              </div>
            </div>
            
            {/* Confirmation Status Filter */}
            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="confirmed-only"
                checked={filters.onlyConfirmed}
                onChange={(e) => {
                  setFilters(prev => ({
                    ...prev,
                    onlyConfirmed: e.target.checked
                  }));
                }}
                className="h-4 w-4 rounded border-gray-300"
              />
              <label htmlFor="confirmed-only" className="text-sm font-medium">
                Show only confirmed events
              </label>
            </div>
          </div>
          
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setFilters({
                  eventTypes: [],
                  clients: [],
                  projects: [],
                  onlyConfirmed: false,
                  dateRange: {
                    start: startOfDay(new Date()).toISOString(),
                    end: endOfMonth(new Date()).toISOString()
                  }
                });
              }}
            >
              Reset Filters
            </Button>
            <Button onClick={() => setShowFilters(false)}>
              Apply Filters
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Notifications Dialog */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Upcoming Events</DialogTitle>
            <DialogDescription>
              You have upcoming events in the next 24 hours.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4 max-h-[60vh] overflow-auto">
            {notifications.map(event => {
              const eventColor = event.color || eventTypeColors[event.eventType as keyof typeof eventTypeColors] || '#3b82f6';
              return (
                <div 
                  key={event.id}
                  className="p-4 rounded-md border border-gray-200 shadow-sm"
                >
                  <div className="flex items-start gap-3">
                    <div 
                      className="w-3 h-3 rounded-full mt-1.5" 
                      style={{ backgroundColor: eventColor }}
                    />
                    <div className="flex-1">
                      <h4 className="font-medium text-base">{event.title}</h4>
                      <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1 text-sm text-gray-600">
                        <div>
                          {format(event.start, 'MMM dd, yyyy')} • {format(event.start, 'h:mm a')} - {format(event.end, 'h:mm a')}
                        </div>
                        {event.location && (
                          <div className="flex items-center gap-1">
                            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/>
                              <circle cx="12" cy="10" r="3"/>
                            </svg>
                            {event.location}
                          </div>
                        )}
                      </div>
                      
                      {event.clientName && (
                        <div className="mt-2 text-sm bg-gray-50 px-2 py-1 rounded inline-flex items-center gap-1">
                          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                            <circle cx="12" cy="7" r="4"/>
                          </svg>
                          {event.clientName}
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-auto">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleSelectEvent(event)}
                      >
                        View
                      </Button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          <DialogFooter>
            <Button onClick={() => setShowNotifications(false)}>
              Dismiss All
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}