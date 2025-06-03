import { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parseISO, startOfWeek, getDay, parse, add } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, Users, Briefcase, CheckSquare, Filter, Plus, ChevronDown, Edit, X } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Create localizer
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

// Color scheme for different item types
const eventColors = {
  booking: '#10B981', // Green
  task: '#F59E0B', // Amber
  project: '#3B82F6', // Blue
  event: '#8B5CF6', // Purple
};

// Helper function to get client name by ID
const getClientName = (clientId: number | null, clients: any[]) => {
  if (!clientId || !clients) return '';
  const client = clients.find((c: any) => c.id === clientId);
  return client ? client.name : '';
};

export default function UnifiedCalendar() {
  const [selectedView, setSelectedView] = useState('month');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    showBookings: true,
    showTasks: true,
    showProjects: true,
    showEvents: true,
  });

  // Edit modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [editingType, setEditingType] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Update mutations for different item types
  const updateProjectMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PATCH', `/api/projects/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      toast({ title: 'Project updated successfully!' });
      setShowEditModal(false);
    },
    onError: () => {
      toast({ title: 'Failed to update project', variant: 'destructive' });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PATCH', `/api/tasks/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/tasks'] });
      toast({ title: 'Task updated successfully!' });
      setShowEditModal(false);
    },
    onError: () => {
      toast({ title: 'Failed to update task', variant: 'destructive' });
    },
  });

  const updateEventMutation = useMutation({
    mutationFn: (data: any) => apiRequest('PATCH', `/api/events/${data.id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      toast({ title: 'Event updated successfully!' });
      setShowEditModal(false);
    },
    onError: () => {
      toast({ title: 'Failed to update event', variant: 'destructive' });
    },
  });

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

    return allEvents;
  }, [bookings, tasks, projects, events, clients, filters]);

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

  // Handle event selection - open inline edit modal
  const handleSelectEvent = (event: any) => {
    const eventType = event.resource?.type;
    const eventData = event.resource?.data;
    
    if (!eventType || !eventData) {
      console.warn('No event type or data found');
      return;
    }
    
    setEditingItem(eventData);
    setEditingType(eventType);
    setShowEditModal(true);
  };

  // Toggle filters
  const toggleFilter = (filterKey: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
  };

  // Create new item handlers
  const handleCreateBooking = () => {
    // Navigate to booking creation
    window.location.href = '/appointments';
  };

  const handleCreateTask = () => {
    // You can add task creation logic here
    console.log('Create new task');
  };

  const handleCreateProject = () => {
    // Navigate to project creation
    window.location.href = '/projects';
  };

  const handleCreateEvent = () => {
    // You can add event creation logic here
    console.log('Create new event');
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
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Unified Calendar</h1>
          <p className="text-gray-600">All your bookings, tasks, projects, and events in one view</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter size={16} />
            Filters
          </Button>
        </div>
      </div>

      {/* Create New Item Button */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
                <Plus size={16} />
                Add New
                <ChevronDown size={16} />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-48">
              <DropdownMenuItem onClick={handleCreateBooking} className="flex items-center gap-2">
                <CalendarIcon size={16} className="text-green-600" />
                New Booking
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCreateTask} className="flex items-center gap-2">
                <CheckSquare size={16} className="text-amber-600" />
                New Task
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCreateProject} className="flex items-center gap-2">
                <Briefcase size={16} className="text-blue-600" />
                New Project
              </DropdownMenuItem>
              <DropdownMenuItem onClick={handleCreateEvent} className="flex items-center gap-2">
                <Clock size={16} className="text-purple-600" />
                New Event
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </CardContent>
      </Card>

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

      {/* Calendar Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CalendarIcon size={20} className="text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Bookings</p>
                <p className="text-lg font-semibold">{Array.isArray(bookings) ? bookings.length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <CheckSquare size={20} className="text-amber-600" />
              <div>
                <p className="text-sm text-gray-600">Tasks</p>
                <p className="text-lg font-semibold">{Array.isArray(tasks) ? tasks.length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Briefcase size={20} className="text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Projects</p>
                <p className="text-lg font-semibold">{Array.isArray(projects) ? projects.length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock size={20} className="text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Events</p>
                <p className="text-lg font-semibold">{Array.isArray(events) ? events.length : 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Component */}
      <Card>
        <CardContent className="p-6">
          <div style={{ height: '600px' }}>
            <Calendar
              localizer={localizer}
              events={calendarEvents}
              startAccessor="start"
              endAccessor="end"
              view={selectedView as any}
              onView={setSelectedView}
              eventPropGetter={eventPropGetter}
              onSelectEvent={handleSelectEvent}
              popup
              showMultiDayTimes
              step={30}
              timeslots={2}
              views={['month', 'week', 'day', 'agenda']}
              tooltipAccessor={(event: any) => {
                const type = event.resource?.type || 'event';
                const data = event.resource?.data || {};
                
                switch (type) {
                  case 'booking':
                    return `Booking: ${data.clientName}\nService: ${data.serviceName}\nTime: ${data.time}`;
                  case 'task':
                    return `Task: ${data.title}\nPriority: ${data.priority}\nStatus: ${data.status}`;
                  case 'project':
                    return `Project: ${data.name}\nStatus: ${data.status}\nClient: ${getClientName(data.clientId, Array.isArray(clients) ? clients : [])}`;
                  default:
                    return event.title;
                }
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Inline Edit Modal */}
      <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Edit {editingType}</DialogTitle>
            <DialogDescription>
              Update the {editingType} information below.
            </DialogDescription>
          </DialogHeader>
          
          {editingItem && (
            <div className="space-y-4">
              {editingType === 'project' && (
                <ProjectEditForm 
                  project={editingItem} 
                  clients={clients}
                  onSubmit={(data) => updateProjectMutation.mutate(data)}
                  isSubmitting={updateProjectMutation.isPending}
                />
              )}
              
              {editingType === 'task' && (
                <TaskEditForm 
                  task={editingItem}
                  onSubmit={(data) => updateTaskMutation.mutate(data)}
                  isSubmitting={updateTaskMutation.isPending}
                />
              )}
              
              {editingType === 'event' && (
                <EventEditForm 
                  event={editingItem}
                  onSubmit={(data) => updateEventMutation.mutate(data)}
                  isSubmitting={updateEventMutation.isPending}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Simple edit forms for inline editing
function ProjectEditForm({ project, clients, onSubmit, isSubmitting }: any) {
  const [formData, setFormData] = useState({
    id: project.id,
    name: project.name || '',
    description: project.description || '',
    clientId: project.clientId || null,
    status: project.status || 'in_progress',
    startDate: project.startDate ? project.startDate.split('T')[0] : '',
    endDate: project.endDate ? project.endDate.split('T')[0] : '',
    budget: project.budget || ''
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      clientId: formData.clientId || null,
      budget: formData.budget ? Number(formData.budget) : null,
      startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
      endDate: formData.endDate ? new Date(formData.endDate).toISOString() : null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Project Name</Label>
        <Input
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>
      
      <div>
        <Label>Client</Label>
        <div className="p-2 bg-gray-50 rounded border text-sm text-gray-600">
          {formData.clientId ? 
            (Array.isArray(clients) ? 
              clients.find((c: any) => c.id === formData.clientId)?.name || 'Unknown Client' : 
              'Loading client...'
            ) : 
            'Personal Project'
          }
          <span className="text-xs block text-gray-400 mt-1">Client cannot be changed from calendar</span>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start Date</Label>
          <Input
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({...formData, startDate: e.target.value})}
          />
        </div>
        <div>
          <Label>End Date</Label>
          <Input
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({...formData, endDate: e.target.value})}
          />
        </div>
      </div>
      
      <div>
        <Label>Budget</Label>
        <Input
          type="number"
          value={formData.budget}
          onChange={(e) => setFormData({...formData, budget: e.target.value})}
        />
      </div>
      
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Project'}
        </Button>
        <Button type="button" variant="outline" onClick={() => setFormData(project)}>
          Reset
        </Button>
      </div>
    </form>
  );
}

function TaskEditForm({ task, onSubmit, isSubmitting }: any) {
  const [formData, setFormData] = useState({
    id: task.id,
    title: task.title || '',
    description: task.description || '',
    priority: task.priority || 'medium',
    status: task.status || 'todo',
    deadline: task.deadline ? task.deadline.split('T')[0] : ''
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      deadline: formData.deadline ? new Date(formData.deadline).toISOString() : null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Task Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Priority</Label>
          <Select value={formData.priority} onValueChange={(value) => setFormData({...formData, priority: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="low">Low</SelectItem>
              <SelectItem value="medium">Medium</SelectItem>
              <SelectItem value="high">High</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({...formData, status: value})}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todo">To Do</SelectItem>
              <SelectItem value="in_progress">In Progress</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div>
        <Label>Deadline</Label>
        <Input
          type="date"
          value={formData.deadline}
          onChange={(e) => setFormData({...formData, deadline: e.target.value})}
        />
      </div>
      
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Task'}
        </Button>
        <Button type="button" variant="outline" onClick={() => setFormData(task)}>
          Reset
        </Button>
      </div>
    </form>
  );
}

function EventEditForm({ event, onSubmit, isSubmitting }: any) {
  const [formData, setFormData] = useState({
    id: event.id,
    title: event.title || '',
    description: event.description || '',
    startTime: event.startTime ? new Date(event.startTime).toISOString().slice(0, 16) : '',
    endTime: event.endTime ? new Date(event.endTime).toISOString().slice(0, 16) : '',
    location: event.location || ''
  });

  const handleSubmit = (e: any) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      startTime: formData.startTime ? new Date(formData.startTime).toISOString() : null,
      endTime: formData.endTime ? new Date(formData.endTime).toISOString() : null
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label>Event Title</Label>
        <Input
          value={formData.title}
          onChange={(e) => setFormData({...formData, title: e.target.value})}
          required
        />
      </div>
      
      <div>
        <Label>Description</Label>
        <Textarea
          value={formData.description}
          onChange={(e) => setFormData({...formData, description: e.target.value})}
        />
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label>Start Time</Label>
          <Input
            type="datetime-local"
            value={formData.startTime}
            onChange={(e) => setFormData({...formData, startTime: e.target.value})}
          />
        </div>
        <div>
          <Label>End Time</Label>
          <Input
            type="datetime-local"
            value={formData.endTime}
            onChange={(e) => setFormData({...formData, endTime: e.target.value})}
          />
        </div>
      </div>
      
      <div>
        <Label>Location</Label>
        <Input
          value={formData.location}
          onChange={(e) => setFormData({...formData, location: e.target.value})}
        />
      </div>
      
      <div className="flex gap-2">
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Updating...' : 'Update Event'}
        </Button>
        <Button type="button" variant="outline" onClick={() => setFormData(event)}>
          Reset
        </Button>
      </div>
    </form>
  );
}