import { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parseISO, startOfWeek, getDay, parse, add, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, Users, Briefcase, CheckSquare, Filter, Plus, DollarSign } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
  invoice: '#EF4444', // Red
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
  const [currentDate, setCurrentDate] = useState(new Date());
  const [activeTab, setActiveTab] = useState('calendar');
  const [filters, setFilters] = useState({
    showBookings: true,
    showTasks: true,
    showProjects: true,
    showEvents: true,
    showInvoices: true,
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

  const { data: invoices = [], isLoading: invoicesLoading } = useQuery({
    queryKey: ['/api/invoices'],
    staleTime: 60000,
  });

  const { data: clients = [], isLoading: clientsLoading } = useQuery({
    queryKey: ['/api/clients'],
    staleTime: 60000,
  });

  const isLoading = eventsLoading || bookingsLoading || tasksLoading || projectsLoading || invoicesLoading || clientsLoading;

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
  }, [bookings, tasks, projects, events, invoices, clients, filters]);

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
    console.log('Selected event:', event);
  };

  // Toggle filters
  const toggleFilter = (filterKey: keyof typeof filters) => {
    setFilters(prev => ({
      ...prev,
      [filterKey]: !prev[filterKey],
    }));
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
          <p className="text-gray-600">All your bookings, tasks, projects, and deadlines in one view</p>
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

      {/* Filters */}
      {showFilters && (
        <Card>
          <CardHeader>
            <CardTitle>Filter Calendar Items</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
                  id="invoices"
                  checked={filters.showInvoices}
                  onCheckedChange={() => toggleFilter('showInvoices')}
                />
                <label htmlFor="invoices" className="flex items-center gap-2 text-sm">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: eventColors.invoice }}></div>
                  Invoices
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
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
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
              <DollarSign size={20} className="text-red-600" />
              <div>
                <p className="text-sm text-gray-600">Invoices</p>
                <p className="text-lg font-semibold">{Array.isArray(invoices) ? invoices.length : 0}</p>
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

      {/* Month Navigation */}
      <Card className="mb-6">
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">
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
        </CardContent>
      </Card>

      {/* Calendar with Tabs */}
      <Card>
        <CardContent className="p-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-5">
              <TabsTrigger value="calendar" className="flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Calendar
              </TabsTrigger>
              <TabsTrigger value="events" className="flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Events ({currentMonthData.events.length})
              </TabsTrigger>
              <TabsTrigger value="bookings" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Bookings ({currentMonthData.bookings.length})
              </TabsTrigger>
              <TabsTrigger value="tasks" className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4" />
                Tasks ({currentMonthData.tasks.length})
              </TabsTrigger>
              <TabsTrigger value="projects" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Projects ({currentMonthData.projects.length})
              </TabsTrigger>
            </TabsList>

            <TabsContent value="calendar" className="mt-6">
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
                      case 'invoice':
                        return `Invoice: ${data.invoiceNumber}\nAmount: €${data.amount}\nStatus: ${data.status}`;
                      default:
                        return event.title;
                    }
                  }}
                />
              </div>
            </TabsContent>

            <TabsContent value="events" className="mt-6">
              <div className="space-y-4">
                {currentMonthData.events.length === 0 ? (
                  <p className="text-center text-gray-500 py-8">No events scheduled for {format(currentDate, 'MMMM yyyy')}</p>
                ) : (
                  currentMonthData.events.map((event: any) => (
                    <Card key={event.id} className="border-l-4" style={{ borderLeftColor: eventColors.event }}>
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
                    <Card key={booking.id} className="border-l-4" style={{ borderLeftColor: eventColors.booking }}>
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
                          <Badge variant="secondary" style={{ backgroundColor: eventColors.booking, color: 'white' }}>
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
                    <Card key={task.id} className="border-l-4" style={{ borderLeftColor: eventColors.task }}>
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
                          <Badge variant="secondary" style={{ backgroundColor: eventColors.task, color: 'white' }}>
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
                    <Card key={project.id} className="border-l-4" style={{ borderLeftColor: eventColors.project }}>
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
                          <Badge variant="secondary" style={{ backgroundColor: eventColors.project, color: 'white' }}>
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