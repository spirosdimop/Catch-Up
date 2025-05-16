import React, { useState } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import { format, parse, startOfWeek, getDay, addMonths, subMonths, addDays } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ChevronLeft,
  ChevronRight,
  PlusCircle,
  Clock,
  CalendarDays,
  CheckCircle2,
  AlertCircle,
  Users,
  Calendar as CalendarIcon
} from 'lucide-react';

const locales = {
  'en-US': enUS
};

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek,
  getDay,
  locales,
});

// Task interface
interface Task {
  id: number;
  title: string;
  dueDate: Date;
  priority: 'high' | 'medium' | 'low';
  project?: string;
}

// Event interface
interface CalendarEvent {
  id: number;
  userId: string;
  title: string;
  start: Date;  // For display in BigCalendar
  end: Date;    // For display in BigCalendar
  startTime?: Date | string; // For API
  endTime?: Date | string;   // For API
  eventType?: string;
  type?: string;
  description?: string;
  attendees?: number;
  isConfirmed?: boolean;
}

// Upcoming tasks component
const UpcomingTasks = ({ tasks }: { tasks: Task[] }) => {
  const formatDueDate = (date: Date): React.ReactNode => {
    const now = new Date();
    const dueDate = new Date(date);
    const diffTime = dueDate.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays < 0) return <span className="text-red-500">Overdue</span>;
    if (diffDays === 0) return <span className="text-amber-500">Today</span>;
    if (diffDays === 1) return <span className="text-amber-400">Tomorrow</span>;
    if (diffDays < 7) return <span className="text-blue-500">{diffDays} days</span>;
    return format(dueDate, 'MMM d');
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 bg-[#0a2342] text-white rounded-t-lg">
        <h2 className="text-lg font-semibold flex items-center">
          <CheckCircle2 className="mr-2 h-5 w-5" />
          Upcoming Tasks
        </h2>
      </div>
      <div className="p-4">
        {tasks.length === 0 ? (
          <div className="text-center py-6 text-gray-500">
            <p>No upcoming tasks</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tasks.map((task: Task, index: number) => (
              <div key={index} className="flex items-start space-x-3 p-3 rounded-md hover:bg-gray-50 border-b last:border-0">
                <div className="flex-shrink-0">
                  {task.priority === 'high' ? (
                    <AlertCircle className="h-5 w-5 text-red-500" />
                  ) : task.priority === 'medium' ? (
                    <AlertCircle className="h-5 w-5 text-amber-500" />
                  ) : (
                    <CheckCircle2 className="h-5 w-5 text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{task.title}</p>
                  <div className="flex items-center mt-1">
                    <Clock className="h-4 w-4 text-gray-400 mr-1" />
                    <p className="text-xs text-gray-500">{formatDueDate(task.dueDate)}</p>
                  </div>
                  {task.project && (
                    <Badge variant="outline" className="mt-2 text-xs">
                      {task.project}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
        <div className="mt-4 pt-4 border-t">
          <Button className="w-full bg-[#0a2342] hover:bg-[#1d4ed8]" size="sm">
            <PlusCircle className="h-4 w-4 mr-2" />
            Add New Task
          </Button>
        </div>
      </div>
    </div>
  );
};

// Event details component
const EventDetails = ({ 
  event, 
  onEdit, 
  onDelete 
}: { 
  event: CalendarEvent | null;
  onEdit: () => void;
  onDelete: () => void;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md">
      <div className="p-4 bg-[#0a2342] text-white rounded-t-lg">
        <h2 className="text-lg font-semibold flex items-center">
          <CalendarIcon className="mr-2 h-5 w-5" />
          Event Details
        </h2>
      </div>
      {event ? (
        <div className="p-4">
          <h3 className="font-medium text-lg">{event.title}</h3>
          <div className="mt-4 space-y-3">
            <div className="flex items-center">
              <CalendarDays className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm">
                {format(new Date(event.start), 'MMMM d, yyyy')}
              </span>
            </div>
            <div className="flex items-center">
              <Clock className="h-4 w-4 text-gray-500 mr-2" />
              <span className="text-sm">
                {format(new Date(event.start), 'h:mm a')} - {format(new Date(event.end), 'h:mm a')}
              </span>
            </div>
            {event.attendees && (
              <div className="flex items-center">
                <Users className="h-4 w-4 text-gray-500 mr-2" />
                <span className="text-sm">
                  {event.attendees} attendees
                </span>
              </div>
            )}
          </div>
          {event.description && (
            <>
              <Separator className="my-4" />
              <div>
                <h4 className="text-sm font-medium mb-2">Description</h4>
                <p className="text-sm text-gray-600">{event.description}</p>
              </div>
            </>
          )}
          <div className="mt-6 flex space-x-2">
            <Button 
              size="sm" 
              variant="outline" 
              className="flex-1"
              onClick={onEdit}
            >
              Edit
            </Button>
            <Button 
              size="sm" 
              variant="destructive" 
              className="flex-1"
              onClick={onDelete}
            >
              Delete
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-4 text-center text-gray-500">
          <p>Select an event to view details</p>
        </div>
      )}
    </div>
  );
};

// Custom event component for the calendar
const EventComponent = ({ event }: { event: CalendarEvent }) => {
  return (
    <div className="flex items-center h-full pl-1 overflow-hidden">
      <div 
        className={`w-2 h-2 rounded-full mr-1 ${
          event.type === 'meeting' ? 'bg-blue-500' : 
          event.type === 'task' ? 'bg-green-500' : 
          event.type === 'reminder' ? 'bg-amber-500' : 
          'bg-purple-500'
        }`} 
      />
      <span className="text-sm truncate">{event.title}</span>
    </div>
  );
};

// Main calendar component
const CalendarNew = () => {
  // State Management
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState<boolean>(false);
  const [isEditEventModalOpen, setIsEditEventModalOpen] = useState<boolean>(false);
  const [editEventData, setEditEventData] = useState<CalendarEvent | null>(null);
  const [newEventFormData, setNewEventFormData] = useState({
    title: '',
    description: '',
    startDate: format(new Date(), 'yyyy-MM-dd'),
    startTime: '09:00',
    endDate: format(new Date(), 'yyyy-MM-dd'),
    endTime: '10:00',
    type: 'event'
  });
  const { toast } = useToast();
  
  // React Query setup
  const queryClient = useQueryClient();
  
  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => { // Using any to bypass type restrictions temporarily
      console.log("Submitting event data:", eventData);
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      if (!response.ok) {
        const errorData = await response.json();
        console.error("Event creation error:", errorData);
        throw new Error(errorData.message || 'Failed to create event');
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Event created',
        description: 'Your event has been successfully created.',
      });
      setIsAddEventModalOpen(false);
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
    onError: (error) => {
      toast({
        title: 'Error creating event',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Update event mutation
  const updateEventMutation = useMutation({
    mutationFn: async (eventData: CalendarEvent) => {
      const response = await fetch(`/api/events/${eventData.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(eventData),
      });
      if (!response.ok) throw new Error('Failed to update event');
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Event updated',
        description: 'Your event has been successfully updated.',
      });
      setIsEditEventModalOpen(false);
      setEditEventData(null);
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
    onError: (error) => {
      toast({
        title: 'Error updating event',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Delete event mutation
  const deleteEventMutation = useMutation({
    mutationFn: async (eventId: number) => {
      const response = await fetch(`/api/events/${eventId}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete event');
      return eventId;
    },
    onSuccess: () => {
      toast({
        title: 'Event deleted',
        description: 'Your event has been successfully deleted.',
      });
      setSelectedEvent(null);
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
    },
    onError: (error) => {
      toast({
        title: 'Error deleting event',
        description: error.message,
        variant: 'destructive',
      });
    }
  });
  
  // Events data from API with fallback
  const { data: events = [] } = useQuery<CalendarEvent[], Error>({
    queryKey: ['/api/events'],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", '/api/events');
        const data = await response.json();
        // Convert date strings to Date objects if needed
        return Array.isArray(data) ? data.map((event: any) => ({
          ...event,
          start: new Date(event.start),
          end: new Date(event.end)
        })) : [];
      } catch (error) {
        console.error('Failed to fetch events', error);
        return [];
      }
    }
  });
  
  // Tasks data from API with fallback
  const { data: tasks = [] } = useQuery<Task[], Error>({
    queryKey: ['/api/tasks'],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", '/api/tasks');
        const data = await response.json();
        // Convert date strings to Date objects if needed
        return Array.isArray(data) ? data.map((task: any) => ({
          ...task,
          dueDate: new Date(task.dueDate)
        })) : [];
      } catch (error) {
        console.error('Failed to fetch tasks', error);
        return [];
      }
    }
  });
  
  // Event handlers
  const handleSelectEvent = (event: CalendarEvent) => {
    setSelectedEvent(event);
  };
  
  const handleSelectSlot = ({ start, end }: { start: Date; end: Date }) => {
    setNewEventFormData({
      title: '',
      description: '',
      startDate: format(start, 'yyyy-MM-dd'),
      startTime: format(start, 'HH:mm'),
      endDate: format(end, 'yyyy-MM-dd'),
      endTime: format(end, 'HH:mm'),
      type: 'event'
    });
    setIsAddEventModalOpen(true);
  };
  
  const handleNavigate = (date: Date) => {
    setCurrentDate(date);
  };
  
  // Helper function to prepare edit form data
  const prepareEditFormData = (event: CalendarEvent) => {
    setEditEventData({
      ...event,
      start: new Date(event.start),
      end: new Date(event.end)
    });
    setIsEditEventModalOpen(true);
  };
  
  return (
    <div className="p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6 text-[#0a2342]">Calendar</h1>
      
      <div className="mb-6">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center space-x-2">
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setCurrentDate(subMonths(currentDate, 1))}
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h2 className="text-xl font-bold text-[#0a2342]">
                      {format(currentDate, 'MMMM yyyy')}
                    </h2>
                    <Button 
                      variant="outline" 
                      size="icon" 
                      onClick={() => setCurrentDate(addMonths(currentDate, 1))}
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm" 
                      onClick={() => setCurrentDate(new Date())} 
                      className="ml-2"
                    >
                      Today
                    </Button>
                  </div>
                  <Button 
                    className="bg-[#0a2342] hover:bg-[#1d4ed8]"
                    onClick={() => {
                      setNewEventFormData({
                        title: '',
                        description: '',
                        startDate: format(new Date(), 'yyyy-MM-dd'),
                        startTime: '09:00',
                        endDate: format(new Date(), 'yyyy-MM-dd'),
                        endTime: '10:00',
                        type: 'event'
                      });
                      setIsAddEventModalOpen(true);
                    }}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Event
                  </Button>
                </div>
                
                <div className="calendar-container" style={{ height: 700 }}>
                  <BigCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    views={['month', 'week', 'day']}
                    defaultView="month"
                    date={currentDate}
                    components={{
                      event: EventComponent,
                    }}
                    onNavigate={handleNavigate}
                    onSelectEvent={handleSelectEvent}
                    onSelectSlot={handleSelectSlot}
                    selectable
                    className="rounded-md"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <UpcomingTasks tasks={tasks} />
            <EventDetails 
              event={selectedEvent} 
              onEdit={() => selectedEvent && prepareEditFormData(selectedEvent)} 
              onDelete={() => {
                if (selectedEvent) {
                  deleteEventMutation.mutate(selectedEvent.id);
                }
              }} 
            />
          </div>
        </div>
      </div>
      
      {/* Add Event Modal */}
      <Dialog 
        open={isAddEventModalOpen} 
        onOpenChange={(open) => {
          setIsAddEventModalOpen(open);
          if (!open) {
            setNewEventFormData({
              title: '',
              description: '',
              startDate: format(new Date(), 'yyyy-MM-dd'),
              startTime: '09:00',
              endDate: format(new Date(), 'yyyy-MM-dd'),
              endTime: '10:00',
              type: 'event'
            });
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Add New Event</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right">
                Title
              </Label>
              <Input 
                id="title"
                value={newEventFormData.title}
                onChange={(e) => setNewEventFormData({...newEventFormData, title: e.target.value})}
                className="col-span-3" 
                required 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea 
                id="description"
                value={newEventFormData.description}
                onChange={(e) => setNewEventFormData({...newEventFormData, description: e.target.value})}
                className="col-span-3" 
              />
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Event Type
              </Label>
              <Select 
                value={newEventFormData.type} 
                onValueChange={(value) => setNewEventFormData({...newEventFormData, type: value})}
              >
                <SelectTrigger className="col-span-3">
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="client_meeting">Client Meeting</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                  <SelectItem value="busy">Busy</SelectItem>
                  <SelectItem value="private">Private</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="travel">Travel</SelectItem>
                  <SelectItem value="project_work">Project Work</SelectItem>
                  <SelectItem value="follow_up">Follow-up</SelectItem>
                  <SelectItem value="training">Training</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startDate" className="text-right">
                Start Date
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input 
                  id="startDate"
                  type="date"
                  value={newEventFormData.startDate}
                  onChange={(e) => setNewEventFormData({...newEventFormData, startDate: e.target.value})}
                  required 
                />
                <Input 
                  id="startTime"
                  type="time"
                  value={newEventFormData.startTime}
                  onChange={(e) => setNewEventFormData({...newEventFormData, startTime: e.target.value})}
                />
              </div>
            </div>
            
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endDate" className="text-right">
                End Date
              </Label>
              <div className="col-span-3 flex gap-2">
                <Input 
                  id="endDate"
                  type="date"
                  value={newEventFormData.endDate}
                  onChange={(e) => setNewEventFormData({...newEventFormData, endDate: e.target.value})}
                  required 
                />
                <Input 
                  id="endTime"
                  type="time"
                  value={newEventFormData.endTime}
                  onChange={(e) => setNewEventFormData({...newEventFormData, endTime: e.target.value})}
                />
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => setIsAddEventModalOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              type="button" 
              className="bg-[#0a2342] hover:bg-[#1d4ed8]"
              onClick={() => {
                // Create start and end dates with correct time
                const startDate = new Date(newEventFormData.startDate);
                const endDate = new Date(newEventFormData.endDate);
                
                if (newEventFormData.startTime) {
                  const [hours, minutes] = newEventFormData.startTime.split(':').map(Number);
                  startDate.setHours(hours, minutes);
                }
                
                if (newEventFormData.endTime) {
                  const [hours, minutes] = newEventFormData.endTime.split(':').map(Number);
                  endDate.setHours(hours, minutes);
                }
                
                // Format event data for API submission, matching exactly what the backend expects
                const eventData = {
                  title: newEventFormData.title,
                  description: newEventFormData.description || "",
                  // Format startTime and endTime as ISO strings
                  startTime: startDate.toISOString(),
                  endTime: endDate.toISOString(),
                  // Map type to eventType
                  eventType: newEventFormData.type || "busy",
                  // Include userId and isConfirmed
                  userId: "user-1", // Would be dynamic in a real app
                  isConfirmed: true,
                  // Include any other required fields
                  location: null,
                  clientName: null,
                  color: null
                };
                
                console.log("Submitting event:", eventData);
                createEventMutation.mutate(eventData);
              }}
            >
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Event Modal */}
      {editEventData && (
        <Dialog 
          open={isEditEventModalOpen} 
          onOpenChange={(open) => {
            setIsEditEventModalOpen(open);
            if (!open) {
              setEditEventData(null);
            }
          }}
        >
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Edit Event</DialogTitle>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-title" className="text-right">
                  Title
                </Label>
                <Input 
                  id="edit-title"
                  value={editEventData.title}
                  onChange={(e) => setEditEventData({...editEventData, title: e.target.value})}
                  className="col-span-3" 
                  required 
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-description" className="text-right">
                  Description
                </Label>
                <Textarea 
                  id="edit-description"
                  value={editEventData.description || ''}
                  onChange={(e) => setEditEventData({...editEventData, description: e.target.value})}
                  className="col-span-3" 
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-type" className="text-right">
                  Event Type
                </Label>
                <Select 
                  value={editEventData.type || 'event'} 
                  onValueChange={(value) => setEditEventData({...editEventData, type: value})}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="task">Task</SelectItem>
                    <SelectItem value="reminder">Reminder</SelectItem>
                    <SelectItem value="event">Other Event</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-startDate" className="text-right">
                  Start Date
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input 
                    id="edit-startDate"
                    type="date"
                    value={format(new Date(editEventData.start), 'yyyy-MM-dd')}
                    onChange={(e) => {
                      const newDate = new Date(editEventData.start);
                      const [year, month, day] = e.target.value.split('-').map(Number);
                      newDate.setFullYear(year, month - 1, day);
                      setEditEventData({...editEventData, start: newDate});
                    }}
                    required 
                  />
                  <Input 
                    id="edit-startTime"
                    type="time"
                    value={format(new Date(editEventData.start), 'HH:mm')}
                    onChange={(e) => {
                      const newDate = new Date(editEventData.start);
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      newDate.setHours(hours, minutes);
                      setEditEventData({...editEventData, start: newDate});
                    }}
                  />
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="edit-endDate" className="text-right">
                  End Date
                </Label>
                <div className="col-span-3 flex gap-2">
                  <Input 
                    id="edit-endDate"
                    type="date"
                    value={format(new Date(editEventData.end), 'yyyy-MM-dd')}
                    onChange={(e) => {
                      const newDate = new Date(editEventData.end);
                      const [year, month, day] = e.target.value.split('-').map(Number);
                      newDate.setFullYear(year, month - 1, day);
                      setEditEventData({...editEventData, end: newDate});
                    }}
                    required 
                  />
                  <Input 
                    id="edit-endTime"
                    type="time"
                    value={format(new Date(editEventData.end), 'HH:mm')}
                    onChange={(e) => {
                      const newDate = new Date(editEventData.end);
                      const [hours, minutes] = e.target.value.split(':').map(Number);
                      newDate.setHours(hours, minutes);
                      setEditEventData({...editEventData, end: newDate});
                    }}
                  />
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setIsEditEventModalOpen(false)}
              >
                Cancel
              </Button>
              <Button 
                type="button" 
                className="bg-[#0a2342] hover:bg-[#1d4ed8]"
                onClick={() => {
                  if (editEventData) {
                    updateEventMutation.mutate(editEventData);
                  }
                }}
              >
                Update Event
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default CalendarNew;