// Simplified Calendar Page with Basic Event Creation

import React, { useState, useEffect } from "react";
import { Calendar } from "react-big-calendar";
import { momentLocalizer } from "react-big-calendar";
import moment from "moment";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "../lib/queryClient";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// Calendar event localizer
const localizer = momentLocalizer(moment);

// Event interface
interface CalendarEvent {
  id: number | string;
  title: string;
  start: Date;
  end: Date;
  description?: string;
  eventType?: string;
}

// Calendar component
export default function CalendarPage() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // State for the new event form
  const [isAddEventModalOpen, setIsAddEventModalOpen] = useState(false);
  const [newEventFormData, setNewEventFormData] = useState({
    title: "",
    description: "",
    date: new Date().toISOString().split('T')[0],
    startTime: "09:00",
    endTime: "10:00",
    type: "busy"
  });
  
  // Combined events state (API events + local events)
  const [allEvents, setAllEvents] = useState<CalendarEvent[]>([]);
  
  // Create event mutation
  const createEventMutation = useMutation({
    mutationFn: async (eventData: any) => {
      const response = await apiRequest("POST", '/api/events', eventData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/events'] });
      setIsAddEventModalOpen(false);
      setNewEventFormData({
        title: "",
        description: "",
        date: new Date().toISOString().split('T')[0],
        startTime: "09:00",
        endTime: "10:00",
        type: "busy"
      });
      toast({
        title: "Event created",
        description: "Your event has been successfully added to the calendar.",
      });
    },
    onError: (error) => {
      console.error("Failed to create event:", error);
      // Create a local event anyway for better UX
      const startDate = new Date(newEventFormData.date);
      const endDate = new Date(newEventFormData.date);
      
      if (newEventFormData.startTime) {
        const [hours, minutes] = newEventFormData.startTime.split(':').map(Number);
        startDate.setHours(hours, minutes);
      }
      if (newEventFormData.endTime) {
        const [hours, minutes] = newEventFormData.endTime.split(':').map(Number);
        endDate.setHours(hours, minutes);
      }
      
      const localEvent: CalendarEvent = {
        id: `local-${Date.now()}`,
        title: newEventFormData.title,
        start: startDate,
        end: endDate,
        description: newEventFormData.description,
        eventType: newEventFormData.type
      };
      
      setAllEvents(prev => [...prev, localEvent]);
      setIsAddEventModalOpen(false);
      
      toast({
        title: "Event created locally",
        description: "The event was added to your calendar but couldn't be saved to the server. It will be available until you refresh the page.",
      });
    }
  });
  
  // Fetch events from API
  const { data: apiEvents = [] } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", '/api/events');
        const data = await response.json();
        
        // Map API events to calendar format
        return Array.isArray(data) ? data.map((event: any) => ({
          id: event.id,
          title: event.title,
          start: new Date(event.startTime),
          end: new Date(event.endTime),
          description: event.description,
          eventType: event.eventType
        })) : [];
      } catch (error) {
        console.error("Error fetching events:", error);
        return [];
      }
    }
  });
  
  // Update the combined events whenever API events change
  useEffect(() => {
    console.log("API Events:", apiEvents);
    
    // Filter out API events from local events to avoid duplicates
    const localOnlyEvents = allEvents.filter(
      localEvent => typeof localEvent.id === 'string' && localEvent.id.startsWith('local-')
    );
    
    console.log("Local Events:", localOnlyEvents);
    
    // Combine API and local events
    const combinedEvents = [...apiEvents, ...localOnlyEvents];
    console.log("Combined Events:", combinedEvents);
    
    setAllEvents(combinedEvents);
  }, [apiEvents]);
  
  // Add a dummy event to demonstrate functionality on initial load
  useEffect(() => {
    // Create a sample event for tomorrow at 10 AM
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(10, 0, 0, 0);
    
    const endTime = new Date(tomorrow);
    endTime.setHours(11, 0, 0, 0);
    
    const demoEvent: CalendarEvent = {
      id: 'demo-1',
      title: 'Sample Event',
      start: tomorrow,
      end: endTime,
      description: 'This is a sample event to show how events appear on your calendar',
      eventType: 'client_meeting'
    };
    
    // Add the demo event if no other events exist
    if (allEvents.length === 0) {
      setAllEvents([demoEvent]);
    }
  }, []);
  
  // Handle form changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewEventFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setNewEventFormData(prev => ({ ...prev, [name]: value }));
  };
  
  // Handle event creation form submission
  const handleCreateEvent = () => {
    // Validate required fields
    if (!newEventFormData.title) {
      toast({
        title: "Missing information",
        description: "Please provide a title for the event.",
        variant: "destructive"
      });
      return;
    }
    
    // Create date objects for start and end times
    const startDate = new Date(newEventFormData.date);
    const endDate = new Date(newEventFormData.date);
    
    if (newEventFormData.startTime) {
      const [hours, minutes] = newEventFormData.startTime.split(':').map(Number);
      startDate.setHours(hours, minutes);
    }
    if (newEventFormData.endTime) {
      const [hours, minutes] = newEventFormData.endTime.split(':').map(Number);
      endDate.setHours(hours, minutes);
    }
    
    // Format event data for API
    const eventData = {
      title: newEventFormData.title,
      description: newEventFormData.description || null,
      startTime: startDate.toISOString(),
      endTime: endDate.toISOString(),
      eventType: newEventFormData.type || "busy",
      userId: "user-1",
      isConfirmed: true,
      location: null,
      clientName: null,
      clientId: null,
      projectId: null,
      invoiceId: null,
      templateId: null,
      color: null
    };
    
    // Submit the event
    createEventMutation.mutate(eventData);
  };
  
  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Calendar</h1>
        <Button
          onClick={() => setIsAddEventModalOpen(true)}
          className="bg-[#0a2540] hover:bg-blue-800"
        >
          Add Event
        </Button>
      </div>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <Calendar
          localizer={localizer}
          events={allEvents}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          views={['month', 'week', 'day']}
          defaultView="week"
          eventPropGetter={(event) => {
            let backgroundColor = '#0a2540';
            
            // Set color based on event type
            switch (event.eventType) {
              case 'client_meeting':
                backgroundColor = '#2563eb';
                break;
              case 'consultation':
                backgroundColor = '#7c3aed';
                break;
              case 'private':
                backgroundColor = '#6b7280';
                break;
              case 'busy':
                backgroundColor = '#dc2626';
                break;
              case 'available':
                backgroundColor = '#10b981';
                break;
              case 'travel':
                backgroundColor = '#f59e0b';
                break;
              case 'project_work':
                backgroundColor = '#0891b2';
                break;
              case 'follow_up':
                backgroundColor = '#8b5cf6';
                break;
              case 'training':
                backgroundColor = '#065f46';
                break;
              default:
                backgroundColor = '#0a2540';
            }
            
            return {
              style: {
                backgroundColor,
                borderRadius: '4px',
                color: 'white',
                border: 'none'
              }
            };
          }}
        />
      </div>
      
      {/* Add Event Modal */}
      <Dialog 
        open={isAddEventModalOpen} 
        onOpenChange={setIsAddEventModalOpen}
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
                name="title"
                value={newEventFormData.title}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Event title"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="description" className="text-right">
                Description
              </Label>
              <Textarea
                id="description"
                name="description"
                value={newEventFormData.description}
                onChange={handleInputChange}
                className="col-span-3"
                placeholder="Event description (optional)"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="type" className="text-right">
                Event Type
              </Label>
              <Select
                value={newEventFormData.type}
                onValueChange={(value) => handleSelectChange("type", value)}
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
              <Label htmlFor="date" className="text-right">
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={newEventFormData.date}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="startTime" className="text-right">
                Start Time
              </Label>
              <Input
                id="startTime"
                name="startTime"
                type="time"
                value={newEventFormData.startTime}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="endTime" className="text-right">
                End Time
              </Label>
              <Input
                id="endTime"
                name="endTime"
                type="time"
                value={newEventFormData.endTime}
                onChange={handleInputChange}
                className="col-span-3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsAddEventModalOpen(false)}
              className="mr-2"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleCreateEvent} 
              className="bg-[#0a2540] hover:bg-blue-800"
            >
              Add Event
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}