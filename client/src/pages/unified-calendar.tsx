import { useState, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parseISO, startOfWeek, getDay, parse, add } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useQuery } from '@tanstack/react-query';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarIcon, Clock, Users, Briefcase, DollarSign, CheckSquare, Filter } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
  const [filters, setFilters] = useState({
    showBookings: true,
    showTasks: true,
    showProjects: true,
    showInvoices: true,
    showEvents: true,
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

  // Transform all data into calendar events
  const calendarEvents = useMemo(() => {
    const allEvents: any[] = [];

    // Add bookings
    if (filters.showBookings && Array.isArray(bookings)) {
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
    if (filters.showTasks && Array.isArray(tasks)) {
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
    if (filters.showProjects && Array.isArray(projects)) {
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

    // Add invoice due dates
    if (filters.showInvoices && Array.isArray(invoices)) {
      invoices.forEach((invoice: any) => {
        try {
          const dueDate = new Date(invoice.dueDate);
          const clientName = getClientName(invoice.clientId, clients);
          
          allEvents.push({
            id: `invoice-${invoice.id}`,
            title: `💰 Invoice ${invoice.invoiceNumber} - ${clientName} (${invoice.status})`,
            start: dueDate,
            end: dueDate,
            allDay: true,
            resource: {
              type: 'invoice',
              data: invoice,
              color: eventColors.invoice,
            },
          });
        } catch (error) {
          console.warn('Error parsing invoice due date:', invoice, error);
        }
      });
    }

    // Add calendar events
    if (filters.showEvents && Array.isArray(events)) {
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
  }, [bookings, tasks, projects, invoices, events, clients, filters]);

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
                <p className="text-lg font-semibold">{bookings?.length || 0}</p>
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
                <p className="text-lg font-semibold">{tasks?.length || 0}</p>
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
                <p className="text-lg font-semibold">{projects?.length || 0}</p>
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
                <p className="text-lg font-semibold">{invoices?.length || 0}</p>
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
                <p className="text-lg font-semibold">{events?.length || 0}</p>
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
                    return `Project: ${data.name}\nStatus: ${data.status}\nClient: ${getClientName(data.clientId, clients)}`;
                  case 'invoice':
                    return `Invoice: ${data.invoiceNumber}\nAmount: €${data.amount}\nStatus: ${data.status}`;
                  default:
                    return event.title;
                }
              }}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}