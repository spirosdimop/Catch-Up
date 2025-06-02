import { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer } from 'react-big-calendar';
import { format, parseISO, startOfWeek, getDay, parse, add } from 'date-fns';
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

// Edit Form Component
interface EditFormProps {
  itemType: string;
  initialData?: any;
  clients: any[];
  onSave: (data: any) => void;
  onCancel: () => void;
}

function EditFormComponent({ itemType, initialData, clients, onSave, onCancel }: EditFormProps) {
  const getFormSchema = () => {
    switch (itemType) {
      case 'event':
        return eventFormSchema;
      case 'booking':
        return bookingFormSchema;
      case 'task':
        return taskFormSchema;
      case 'project':
        return projectFormSchema;
      default:
        return eventFormSchema;
    }
  };

  const getDefaultValues = () => {
    if (initialData) {
      switch (itemType) {
        case 'event':
          return {
            title: initialData.title || '',
            description: initialData.description || '',
            startTime: initialData.startTime ? format(new Date(initialData.startTime), "yyyy-MM-dd'T'HH:mm") : '',
            endTime: initialData.endTime ? format(new Date(initialData.endTime), "yyyy-MM-dd'T'HH:mm") : '',
            location: initialData.location || '',
          };
        case 'booking':
          return {
            clientName: initialData.clientName || '',
            serviceName: initialData.serviceName || '',
            date: initialData.date ? format(new Date(initialData.date), 'yyyy-MM-dd') : '',
            time: initialData.time || '',
            duration: initialData.duration || 60,
          };
        case 'task':
          return {
            title: initialData.title || '',
            description: initialData.description || '',
            deadline: initialData.deadline ? format(new Date(initialData.deadline), 'yyyy-MM-dd') : '',
            priority: initialData.priority || '',
            status: initialData.status || '',
          };
        case 'project':
          return {
            name: initialData.name || '',
            description: initialData.description || '',
            startDate: initialData.startDate ? format(new Date(initialData.startDate), 'yyyy-MM-dd') : '',
            endDate: initialData.endDate ? format(new Date(initialData.endDate), 'yyyy-MM-dd') : '',
            status: initialData.status || '',
            clientId: initialData.clientId || undefined,
          };
        default:
          return {};
      }
    }

    // Default values for new items
    switch (itemType) {
      case 'event':
        return { title: '', description: '', startTime: '', endTime: '', location: '' };
      case 'booking':
        return { clientName: '', serviceName: '', date: '', time: '', duration: 60 };
      case 'task':
        return { title: '', description: '', deadline: '', priority: '', status: '' };
      case 'project':
        return { name: '', description: '', startDate: '', endDate: '', status: '', clientId: undefined };
      default:
        return {};
    }
  };

  const form = useForm({
    resolver: zodResolver(getFormSchema()),
    defaultValues: getDefaultValues() as any,
  });

  const handleSubmit = (data: any) => {
    const formattedData = { ...data };
    
    // Add ID if editing existing item
    if (initialData?.id) {
      formattedData.id = initialData.id;
    }

    // Format data based on item type
    switch (itemType) {
      case 'event':
        formattedData.startTime = new Date(data.startTime).toISOString();
        formattedData.endTime = new Date(data.endTime).toISOString();
        break;
      case 'booking':
        formattedData.date = new Date(data.date).toISOString().split('T')[0];
        formattedData.duration = parseInt(data.duration);
        break;
      case 'task':
        formattedData.deadline = new Date(data.deadline).toISOString();
        break;
      case 'project':
        formattedData.startDate = new Date(data.startDate).toISOString();
        if (data.endDate) {
          formattedData.endDate = new Date(data.endDate).toISOString();
        }
        if (data.clientId && data.clientId !== '') {
          formattedData.clientId = parseInt(data.clientId);
        }
        break;
    }

    onSave(formattedData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        {itemType === 'event' && (
          <>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Event Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter event title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter event description" {...field} />
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
                      <Input type="datetime-local" {...field} />
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
                      <Input type="datetime-local" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter location" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {itemType === 'booking' && (
          <>
            <FormField
              control={form.control}
              name="clientName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter client name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="serviceName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter service name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="date"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="time"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time</FormLabel>
                    <FormControl>
                      <Input type="time" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <FormField
              control={form.control}
              name="duration"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Duration (minutes)</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="60" 
                      {...field}
                      onChange={(e) => field.onChange(parseInt(e.target.value) || 0)}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </>
        )}

        {itemType === 'task' && (
          <>
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Task Title</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter task title" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter task description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="deadline"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Deadline</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="low">Low</SelectItem>
                        <SelectItem value="medium">Medium</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="urgent">Urgent</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="todo">To Do</SelectItem>
                        <SelectItem value="in-progress">In Progress</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          </>
        )}

        {itemType === 'project' && (
          <>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter project name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter project description" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Start Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>End Date</FormLabel>
                    <FormControl>
                      <Input type="date" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="planning">Planning</SelectItem>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="on-hold">On Hold</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                        <SelectItem value="cancelled">Cancelled</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="clientId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Client</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value ? field.value.toString() : ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select client" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="">No Client</SelectItem>
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
            </div>
          </>
        )}

        <div className="flex gap-2 justify-end pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit">
            {initialData?.id ? 'Update' : 'Create'} {itemType}
          </Button>
        </div>
      </form>
    </Form>
  );
}

export default function InteractiveCalendar() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedView, setSelectedView] = useState('month');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showDetailDialog, setShowDetailDialog] = useState(false);
  const [selectedItem, setSelectedItem] = useState<any>(null);
  const [itemType, setItemType] = useState('');
  const [editMode, setEditMode] = useState(false);
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

  // Helper function to get client name by ID
  const getClientName = (clientId: number | null, clients: any[]) => {
    if (!clientId || !clients) return '';
    const client = clients.find((c: any) => c.id === clientId);
    return client ? client.name : '';
  };

  // Transform all data into calendar events
  const calendarEvents = useMemo(() => {
    const allEvents: any[] = [];

    // Add bookings
    if (filters.showBookings && bookings && Array.isArray(bookings)) {
      bookings.forEach((booking: any) => {
        try {
          const bookingDate = new Date(booking.date);
          const [hours, minutes] = booking.time.split(':').map(Number);
          const startTime = new Date(bookingDate);
          startTime.setHours(hours, minutes, 0, 0);
          
          const endTime = new Date(startTime);
          endTime.setMinutes(endTime.getMinutes() + (booking.duration || 60));

          allEvents.push({
            id: `booking-${booking.id}`,
            title: `📅 ${booking.clientName} - ${booking.serviceName || 'Booking'}`,
            start: startTime,
            end: endTime,
            resource: {
              type: 'booking',
              data: booking,
              color: eventColors.booking,
            },
          });
        } catch (error) {
          console.warn('Error parsing booking:', booking, error);
        }
      });
    }

    // Add tasks with deadlines
    if (filters.showTasks && tasks && Array.isArray(tasks)) {
      tasks.forEach((task: any) => {
        if (task.deadline) {
          try {
            const deadline = new Date(task.deadline);
            allEvents.push({
              id: `task-${task.id}`,
              title: `✅ ${task.title}`,
              start: deadline,
              end: deadline,
              allDay: true,
              resource: {
                type: 'task',
                data: task,
                color: eventColors.task,
              },
            });
          } catch (error) {
            console.warn('Error parsing task deadline:', task, error);
          }
        }
      });
    }

    // Add project dates
    if (filters.showProjects && projects && Array.isArray(projects)) {
      projects.forEach((project: any) => {
        if (project.startDate) {
          try {
            const startDate = new Date(project.startDate);
            const endDate = project.endDate ? new Date(project.endDate) : startDate;
            
            allEvents.push({
              id: `project-${project.id}`,
              title: `💼 ${project.name} (${project.status})`,
              start: startDate,
              end: endDate,
              allDay: true,
              resource: {
                type: 'project',
                data: project,
                color: eventColors.project,
              },
            });
          } catch (error) {
            console.warn('Error parsing project dates:', project, error);
          }
        }
      });
    }

    // Add calendar events
    if (filters.showEvents && events && Array.isArray(events)) {
      events.forEach((event: any) => {
        try {
          allEvents.push({
            id: `event-${event.id}`,
            title: `🗓️ ${event.title}`,
            start: new Date(event.startTime),
            end: new Date(event.endTime),
            resource: {
              type: 'event',
              data: event,
              color: eventColors.event,
            },
          });
        } catch (error) {
          console.warn('Error parsing event:', event, error);
        }
      });
    }

    // Filter by search query
    if (searchQuery) {
      return allEvents.filter(event => 
        event.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    return allEvents;
  }, [bookings, tasks, projects, events, filters, searchQuery]);

  // Event style getter
  const eventPropGetter = (event: any) => {
    const color = event.resource?.color || '#3B82F6';
    return {
      style: {
        backgroundColor: color,
        borderColor: color,
        color: 'white',
        fontSize: '12px',
      },
    };
  };

  // Handle event selection
  const handleSelectEvent = (event: any) => {
    setSelectedItem(event.resource.data);
    setItemType(event.resource.type);
    setEditMode(false);
    setShowDetailDialog(true);
  };

  // Toggle filters
  const toggleFilter = (filterKey: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  // Mutations for CRUD operations
  const createEventMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/events', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({ title: 'Event created successfully!' });
      setShowAddDialog(false);
    },
    onError: () => {
      toast({ title: 'Failed to create event', variant: 'destructive' });
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/bookings', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      toast({ title: 'Booking created successfully!' });
      setShowAddDialog(false);
    },
    onError: () => {
      toast({ title: 'Failed to create booking', variant: 'destructive' });
    },
  });

  const createTaskMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/tasks', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: 'Task created successfully!' });
      setShowAddDialog(false);
    },
    onError: () => {
      toast({ title: 'Failed to create task', variant: 'destructive' });
    },
  });

  const createProjectMutation = useMutation({
    mutationFn: (data: any) => apiRequest('/api/projects', 'POST', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({ title: 'Project created successfully!' });
      setShowAddDialog(false);
    },
    onError: () => {
      toast({ title: 'Failed to create project', variant: 'destructive' });
    },
  });

  const updateMutations = {
    event: useMutation({
      mutationFn: (data: any) => apiRequest(`/api/events/${data.id}`, 'PATCH', data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/events'] });
        toast({ title: 'Event updated successfully!' });
        setEditMode(false);
        setShowDetailDialog(false);
      },
      onError: () => {
        toast({ title: 'Failed to update event', variant: 'destructive' });
      },
    }),
    booking: useMutation({
      mutationFn: (data: any) => apiRequest(`/api/bookings/${data.id}`, 'PATCH', data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
        toast({ title: 'Booking updated successfully!' });
        setEditMode(false);
        setShowDetailDialog(false);
      },
      onError: () => {
        toast({ title: 'Failed to update booking', variant: 'destructive' });
      },
    }),
    task: useMutation({
      mutationFn: (data: any) => apiRequest(`/api/tasks/${data.id}`, 'PATCH', data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
        toast({ title: 'Task updated successfully!' });
        setEditMode(false);
        setShowDetailDialog(false);
      },
      onError: () => {
        toast({ title: 'Failed to update task', variant: 'destructive' });
      },
    }),
    project: useMutation({
      mutationFn: (data: any) => apiRequest(`/api/projects/${data.id}`, 'PATCH', data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
        toast({ title: 'Project updated successfully!' });
        setEditMode(false);
        setShowDetailDialog(false);
      },
      onError: () => {
        toast({ title: 'Failed to update project', variant: 'destructive' });
      },
    }),
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
      {/* Header with controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Interactive Calendar</h1>
          <p className="text-sm md:text-base text-gray-600">View and manage all your events, bookings, tasks, and projects</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          {/* Search bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search events..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-48"
            />
          </div>
          
          {/* Filter button */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter size={16} />
            Filters
          </Button>
          
          {/* Add new button */}
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus size={16} />
                Add New
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add New Item</DialogTitle>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4 p-4">
                <Button
                  variant="outline"
                  onClick={() => {
                    setItemType('event');
                    setEditMode(true);
                    setSelectedItem(null);
                  }}
                  className="flex flex-col items-center gap-2 h-20"
                >
                  <Clock className="h-6 w-6" />
                  Event
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setItemType('booking');
                    setEditMode(true);
                    setSelectedItem(null);
                  }}
                  className="flex flex-col items-center gap-2 h-20"
                >
                  <Users className="h-6 w-6" />
                  Booking
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setItemType('task');
                    setEditMode(true);
                    setSelectedItem(null);
                  }}
                  className="flex flex-col items-center gap-2 h-20"
                >
                  <CheckSquare className="h-6 w-6" />
                  Task
                </Button>
                <Button
                  variant="outline"
                  onClick={() => {
                    setItemType('project');
                    setEditMode(true);
                    setSelectedItem(null);
                  }}
                  className="flex flex-col items-center gap-2 h-20"
                >
                  <Briefcase className="h-6 w-6" />
                  Project
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filter Calendar Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="bookings"
                  checked={filters.showBookings}
                  onCheckedChange={() => toggleFilter('showBookings')}
                />
                <label htmlFor="bookings" className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: eventColors.booking }}></div>
                  Bookings
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="tasks"
                  checked={filters.showTasks}
                  onCheckedChange={() => toggleFilter('showTasks')}
                />
                <label htmlFor="tasks" className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: eventColors.task }}></div>
                  Tasks
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="projects"
                  checked={filters.showProjects}
                  onCheckedChange={() => toggleFilter('showProjects')}
                />
                <label htmlFor="projects" className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: eventColors.project }}></div>
                  Projects
                </label>
              </div>
              
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="events"
                  checked={filters.showEvents}
                  onCheckedChange={() => toggleFilter('showEvents')}
                />
                <label htmlFor="events" className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: eventColors.event }}></div>
                  Events
                </label>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Calendar */}
      <Card>
        <CardContent className="p-3 md:p-6">
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              view={selectedView as any}
              onView={setSelectedView}
              date={currentDate}
              onNavigate={setCurrentDate}
              eventPropGetter={eventPropGetter}
              onSelectEvent={handleSelectEvent}
              popup
              step={30}
              timeslots={2}
              views={['month', 'week', 'day', 'agenda']}
              style={{ height: '100%' }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Detail/Edit Dialog */}
      <Dialog open={showDetailDialog} onOpenChange={setShowDetailDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editMode ? `Edit ${itemType}` : `${itemType} Details`}
            </DialogTitle>
          </DialogHeader>
          <div className="p-4">
            {selectedItem && !editMode && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-lg">
                    {selectedItem.title || selectedItem.name || selectedItem.clientName}
                  </h3>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditMode(true)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                
                {selectedItem.description && (
                  <p className="text-gray-600">{selectedItem.description}</p>
                )}
                
                <div className="space-y-2 text-sm">
                  {itemType === 'booking' && (
                    <>
                      <p><strong>Service:</strong> {selectedItem.serviceName}</p>
                      <p><strong>Date:</strong> {format(new Date(selectedItem.date), 'MMM d, yyyy')}</p>
                      <p><strong>Time:</strong> {selectedItem.time}</p>
                      <p><strong>Duration:</strong> {selectedItem.duration} minutes</p>
                    </>
                  )}
                  
                  {itemType === 'task' && (
                    <>
                      <p><strong>Deadline:</strong> {format(new Date(selectedItem.deadline), 'MMM d, yyyy')}</p>
                      {selectedItem.priority && <p><strong>Priority:</strong> {selectedItem.priority}</p>}
                      {selectedItem.status && <p><strong>Status:</strong> {selectedItem.status}</p>}
                    </>
                  )}
                  
                  {itemType === 'project' && (
                    <>
                      <p><strong>Start Date:</strong> {format(new Date(selectedItem.startDate), 'MMM d, yyyy')}</p>
                      {selectedItem.endDate && <p><strong>End Date:</strong> {format(new Date(selectedItem.endDate), 'MMM d, yyyy')}</p>}
                      {selectedItem.status && <p><strong>Status:</strong> {selectedItem.status}</p>}
                      {selectedItem.clientId && <p><strong>Client:</strong> {getClientName(selectedItem.clientId, Array.isArray(clients) ? clients : [])}</p>}
                    </>
                  )}
                  
                  {itemType === 'event' && (
                    <>
                      <p><strong>Start:</strong> {format(new Date(selectedItem.startTime), 'MMM d, yyyy h:mm a')}</p>
                      <p><strong>End:</strong> {format(new Date(selectedItem.endTime), 'MMM d, yyyy h:mm a')}</p>
                      {selectedItem.location && <p><strong>Location:</strong> {selectedItem.location}</p>}
                    </>
                  )}
                </div>
              </div>
            )}
            
            {editMode && (
              <EditFormComponent
                itemType={itemType}
                initialData={selectedItem}
                clients={Array.isArray(clients) ? clients : []}
                onSave={(data) => {
                  if (selectedItem?.id) {
                    // Update existing item
                    updateMutations[itemType as keyof typeof updateMutations].mutate(data);
                  } else {
                    // Create new item
                    switch (itemType) {
                      case 'event':
                        createEventMutation.mutate(data);
                        break;
                      case 'booking':
                        createBookingMutation.mutate(data);
                        break;
                      case 'task':
                        createTaskMutation.mutate(data);
                        break;
                      case 'project':
                        createProjectMutation.mutate(data);
                        break;
                    }
                  }
                }}
                onCancel={() => {
                  setEditMode(false);
                  if (!selectedItem?.id) {
                    setShowDetailDialog(false);
                    setShowAddDialog(false);
                  }
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}