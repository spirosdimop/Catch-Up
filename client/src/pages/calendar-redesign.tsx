import React, { useState, useEffect } from 'react';
import { Calendar as BigCalendar, dateFnsLocalizer } from 'react-big-calendar';
import { format } from 'date-fns';
import { parse } from 'date-fns';
import { startOfWeek } from 'date-fns';
import { getDay } from 'date-fns';
import { addMonths, subMonths, addDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
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

import { enUS } from 'date-fns/locale';

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
  title: string;
  start: Date;
  end: Date;
  type?: string;
  description?: string;
  attendees?: number;
}

// Upcoming tasks component
const UpcomingTasks = ({ tasks }: { tasks: Task[] }) => {
  const formatDueDate = (date: Date): React.ReactNode => {
    const now = new Date();
    const dueDate = new Date(date);
    const diffDays = Math.ceil((dueDate - now) / (1000 * 60 * 60 * 24));
    
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
const EventDetails = ({ event }: { event: CalendarEvent | null }) => {
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
            <Button size="sm" variant="outline" className="flex-1">
              Edit
            </Button>
            <Button size="sm" variant="destructive" className="flex-1">
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

// Calendar toolbar component
const CustomToolbar = ({ date, onNavigate }) => {
  const goToBack = () => {
    onNavigate('PREV');
  };

  const goToNext = () => {
    onNavigate('NEXT');
  };

  const goToToday = () => {
    onNavigate('TODAY');
  };

  return (
    <div className="flex justify-between items-center mb-4">
      <div className="flex items-center space-x-2">
        <Button variant="outline" size="icon" onClick={goToBack}>
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-xl font-bold text-[#0a2342]">
          {format(date, 'MMMM yyyy')}
        </h2>
        <Button variant="outline" size="icon" onClick={goToNext}>
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button variant="outline" size="sm" onClick={goToToday} className="ml-2">
          Today
        </Button>
      </div>
      <Button className="bg-[#0a2342] hover:bg-[#1d4ed8]">
        <PlusCircle className="h-4 w-4 mr-2" />
        Add Event
      </Button>
    </div>
  );
};

// Main calendar component
const CalendarRedesign = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedEvent, setSelectedEvent] = useState(null);
  
  // Mock events data (would normally come from API)
  const { data: events = [] } = useQuery({
    queryKey: ['/api/events'],
    queryFn: async () => {
      // If API fails, return mock data
      try {
        return await apiRequest('/api/events');
      } catch (error) {
        console.error('Failed to fetch events', error);
        return [
          {
            id: 1,
            title: 'Client Meeting: ABC Corp',
            start: new Date(2025, 7, 15, 9, 30),
            end: new Date(2025, 7, 15, 11, 0),
            type: 'meeting',
            description: 'Discuss project timeline and deliverables',
            attendees: 3
          },
          {
            id: 2,
            title: 'Project Deadline: Website Launch',
            start: new Date(2025, 7, 18),
            end: new Date(2025, 7, 18),
            type: 'task',
            description: 'Final review and deployment of client website'
          },
          {
            id: 3,
            title: 'Team Weekly Sync',
            start: new Date(2025, 7, 12, 14, 0),
            end: new Date(2025, 7, 12, 15, 0),
            type: 'meeting',
            attendees: 5
          },
          {
            id: 4,
            title: 'Invoice Due: XYZ Project',
            start: new Date(2025, 7, 20),
            end: new Date(2025, 7, 20),
            type: 'reminder'
          }
        ];
      }
    }
  });
  
  // Mock tasks data (would normally come from API)
  const { data: tasks = [] } = useQuery({
    queryKey: ['/api/tasks'],
    queryFn: async () => {
      // If API fails, return mock data
      try {
        return await apiRequest('/api/tasks');
      } catch (error) {
        console.error('Failed to fetch tasks', error);
        return [
          {
            id: 1,
            title: 'Complete client proposal',
            dueDate: addDays(new Date(), 1),
            priority: 'high',
            project: 'New Business'
          },
          {
            id: 2,
            title: 'Review marketing strategy',
            dueDate: addDays(new Date(), 3),
            priority: 'medium',
            project: 'Marketing'
          },
          {
            id: 3,
            title: 'Update portfolio website',
            dueDate: addDays(new Date(), 5),
            priority: 'low'
          },
          {
            id: 4,
            title: 'Send invoice to client',
            dueDate: new Date(),
            priority: 'high',
            project: 'Finance'
          }
        ];
      }
    }
  });
  
  const handleSelectEvent = (event) => {
    setSelectedEvent(event);
  };
  
  const handleNavigate = (date) => {
    setCurrentDate(date);
  };
  
  return (
    <div className="p-6 bg-slate-50 min-h-screen">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-[#0a2342] mb-6">Calendar</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-3">
            <Card>
              <CardContent className="p-6">
                <CustomToolbar 
                  date={currentDate}
                  onNavigate={(action) => {
                    if (action === 'PREV') {
                      setCurrentDate(subMonths(currentDate, 1));
                    } else if (action === 'NEXT') {
                      setCurrentDate(addMonths(currentDate, 1));
                    } else if (action === 'TODAY') {
                      setCurrentDate(new Date());
                    }
                  }}
                />
                
                <div className="calendar-container" style={{ height: 700 }}>
                  <BigCalendar
                    localizer={localizer}
                    events={events}
                    startAccessor="start"
                    endAccessor="end"
                    date={currentDate}
                    onNavigate={handleNavigate}
                    onSelectEvent={handleSelectEvent}
                    components={{
                      event: EventComponent
                    }}
                    className="custom-calendar"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
          
          <div className="space-y-6">
            <UpcomingTasks tasks={tasks} />
            <EventDetails event={selectedEvent} />
          </div>
        </div>
      </div>
      
      {/* Custom CSS for the calendar */}
      <style>{`
        .custom-calendar {
          font-family: 'Inter', sans-serif;
        }
        
        .rbc-month-view {
          border-radius: 0.5rem;
          overflow: hidden;
          border: 1px solid #e2e8f0;
          background: white;
        }
        
        .rbc-header {
          padding: 12px 0;
          background-color: #f8fafc;
          font-weight: 600;
          border-bottom: 1px solid #e2e8f0;
        }
        
        .rbc-month-row {
          border-bottom: 1px solid #e2e8f0;
        }
        
        .rbc-day-bg {
          background-color: white;
        }
        
        .rbc-day-bg.rbc-today {
          background-color: #eff6ff;
        }
        
        .rbc-date-cell {
          padding: 6px 8px;
          text-align: right;
          font-size: 0.875rem;
          color: #64748b;
        }
        
        .rbc-date-cell.rbc-now {
          font-weight: bold;
          color: #0a2342;
        }
        
        .rbc-event {
          border-radius: 4px;
          background-color: white;
          color: #0f172a;
          border-left: 3px solid #1d4ed8;
          box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
          padding: 2px 0;
          margin: 1px 5px;
        }
        
        .rbc-event.rbc-selected {
          background-color: #f0f9ff;
        }
        
        .rbc-event-content {
          font-size: 0.75rem;
        }
        
        .rbc-button-link {
          cursor: pointer;
        }
        
        .rbc-toolbar button {
          color: #0f172a;
        }
        
        .rbc-toolbar button.rbc-active {
          background-color: #0a2342;
          color: white;
        }
        
        .rbc-agenda-view table.rbc-agenda-table {
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .rbc-agenda-view table.rbc-agenda-table tbody > tr > td {
          padding: 10px;
        }
        
        .rbc-agenda-view table.rbc-agenda-table .rbc-agenda-time-cell {
          font-size: 0.875rem;
        }
      `}</style>
    </div>
  );
};

export default CalendarRedesign;