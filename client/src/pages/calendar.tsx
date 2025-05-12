import { useState, useCallback, useEffect, useMemo } from 'react';
import { Calendar, dateFnsLocalizer, Views } from 'react-big-calendar';
import { format, parseISO, startOfWeek, getDay, parse, add, endOfMonth, startOfDay, endOfDay } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useQuery, useMutation } from '@tanstack/react-query';
import { queryClient } from '@/lib/queryClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
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

interface CalendarEvent {
  id: number;
  title: string;
  start: Date;
  end: Date;
  description?: string | null;
  location?: string | null;
  clientName?: string | null;
  isConfirmed: boolean;
  eventType: 'private' | 'busy' | 'available' | 'travel';
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
  const { toast } = useToast();

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

  // Query to fetch events
  const { data: events = [], isLoading: eventsLoading, isError: eventsError } = useQuery({
    queryKey: ['/api/events'],
    staleTime: 60000, // 1 minute
  });
  
  // Query to fetch clients for linking
  const { data: clients = [] } = useQuery({
    queryKey: ['/api/clients'],
    staleTime: 300000, // 5 minutes
  });
  
  // Query to fetch projects for linking
  const { data: projects = [] } = useQuery({
    queryKey: ['/api/projects'],
    staleTime: 300000, // 5 minutes
  });
  
  // Query to fetch invoices for linking
  const { data: invoices = [] } = useQuery({
    queryKey: ['/api/invoices'],
    staleTime: 300000, // 5 minutes
  });

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

  // Transform events data for calendar display
  const calendarEvents = useMemo(() => {
    if (!events || !Array.isArray(events) || events.length === 0) return [];
    
    return events.map((event: any) => ({
      id: event.id,
      title: event.title,
      start: new Date(event.startTime),
      end: new Date(event.endTime),
      description: event.description,
      location: event.location,
      clientName: event.clientName,
      isConfirmed: event.isConfirmed,
      eventType: event.eventType,
      color: event.color,
      userId: event.userId,
    }));
  }, [events]);

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
    []
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
            <Tabs 
              defaultValue="month" 
              value={selectedView} 
              onValueChange={setSelectedView}
              className="w-[300px]"
            >
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="month">Month</TabsTrigger>
                <TabsTrigger value="week">Week</TabsTrigger>
                <TabsTrigger value="day">Day</TabsTrigger>
              </TabsList>
            </Tabs>
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

        <Card className="border rounded-lg shadow">
          <CardContent className="p-4 overflow-hidden h-[calc(100vh-200px)]">
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
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Event Type</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      value={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select event type" />
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
                )}
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
    </div>
  );
}