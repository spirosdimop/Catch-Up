import React, { useState } from 'react';
import { CatchUpLayout } from '../../components/catchup/Layout';
import { 
  ChevronLeft,
  ChevronRight,
  Plus,
  Clock,
  Calendar as CalendarIcon,
  MapPin,
  User,
  Filter
} from 'lucide-react';
import '../../styles/catchup.css';

// Define event type
type Event = {
  id: number;
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  location?: string;
  attendees?: string[];
  color: string;
  allDay?: boolean;
};

// Define day cell type
type DayCell = {
  date: Date;
  isCurrentMonth: boolean;
  events: Event[];
};

export default function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewMode, setViewMode] = useState<'month' | 'week' | 'day'>('month');
  
  // Sample event data
  const events: Event[] = [
    {
      id: 1,
      title: 'Team Meeting',
      description: 'Weekly team sync and progress review',
      startTime: '2025-05-15T10:00:00',
      endTime: '2025-05-15T11:00:00',
      location: 'Conference Room A',
      attendees: ['John Doe', 'Jane Smith', 'Alex Johnson'],
      color: 'var(--catchup-cobalt)'
    },
    {
      id: 2,
      title: 'Project Review',
      description: 'Review project milestones and deliverables',
      startTime: '2025-05-15T14:00:00',
      endTime: '2025-05-15T15:30:00',
      location: 'Virtual (Zoom)',
      attendees: ['Sarah Williams', 'Mike Brown'],
      color: '#10B981'
    },
    {
      id: 3,
      title: 'Client Call',
      description: 'Discuss project requirements and expectations',
      startTime: '2025-05-18T09:30:00',
      endTime: '2025-05-18T10:30:00',
      location: 'Phone',
      attendees: ['David Miller'],
      color: '#F59E0B'
    },
    {
      id: 4,
      title: 'Design Workshop',
      description: 'Collaborative design workshop for new features',
      startTime: '2025-05-20T13:00:00',
      endTime: '2025-05-20T16:00:00',
      location: 'Design Lab',
      attendees: ['Emily Clark', 'Tom Wilson', 'Alex Johnson'],
      color: '#EC4899'
    },
    {
      id: 5,
      title: 'Product Launch',
      description: 'Official product launch event',
      startTime: '2025-05-25T09:00:00',
      endTime: '2025-05-25T18:00:00',
      location: 'Main Office',
      attendees: ['All Team Members'],
      color: '#8B5CF6',
      allDay: true
    }
  ];
  
  // Navigate to previous month/week/day
  const goToPrevious = () => {
    const newDate = new Date(currentDate);
    
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() - 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }
    
    setCurrentDate(newDate);
  };
  
  // Navigate to next month/week/day
  const goToNext = () => {
    const newDate = new Date(currentDate);
    
    if (viewMode === 'month') {
      newDate.setMonth(newDate.getMonth() + 1);
    } else if (viewMode === 'week') {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }
    
    setCurrentDate(newDate);
  };
  
  // Go to today
  const goToToday = () => {
    setCurrentDate(new Date());
  };
  
  // Format date for display in header
  const formatHeaderDate = () => {
    if (viewMode === 'month') {
      return currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });
    } else if (viewMode === 'week') {
      const startOfWeek = new Date(currentDate);
      const day = currentDate.getDay();
      startOfWeek.setDate(currentDate.getDate() - day);
      
      const endOfWeek = new Date(startOfWeek);
      endOfWeek.setDate(startOfWeek.getDate() + 6);
      
      const startMonth = startOfWeek.toLocaleDateString('en-US', { month: 'short' });
      const endMonth = endOfWeek.toLocaleDateString('en-US', { month: 'short' });
      const startDay = startOfWeek.getDate();
      const endDay = endOfWeek.getDate();
      const year = endOfWeek.getFullYear();
      
      return `${startMonth} ${startDay} - ${endMonth} ${endDay}, ${year}`;
    } else {
      return currentDate.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };
  
  // Generate calendar grid for month view
  const generateMonthCalendar = (): DayCell[] => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    
    // Get first day of month
    const firstDayOfMonth = new Date(year, month, 1);
    const dayOfWeek = firstDayOfMonth.getDay(); // 0 = Sunday, 6 = Saturday
    
    // Get last day of month
    const lastDayOfMonth = new Date(year, month + 1, 0);
    const daysInMonth = lastDayOfMonth.getDate();
    
    // Previous month days to display
    const prevMonthDays = dayOfWeek;
    
    // Calculate days from previous month
    const prevMonth = month === 0 ? 11 : month - 1;
    const prevMonthYear = month === 0 ? year - 1 : year;
    const prevMonthLastDay = new Date(prevMonthYear, prevMonth + 1, 0).getDate();
    
    // Generate calendar days
    const calendarDays: DayCell[] = [];
    
    // Add days from previous month
    for (let i = prevMonthDays - 1; i >= 0; i--) {
      const date = new Date(prevMonthYear, prevMonth, prevMonthLastDay - i);
      calendarDays.push({
        date,
        isCurrentMonth: false,
        events: events.filter(event => {
          const eventDate = new Date(event.startTime);
          return (
            eventDate.getDate() === date.getDate() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getFullYear() === date.getFullYear()
          );
        })
      });
    }
    
    // Add days from current month
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      calendarDays.push({
        date,
        isCurrentMonth: true,
        events: events.filter(event => {
          const eventDate = new Date(event.startTime);
          return (
            eventDate.getDate() === date.getDate() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getFullYear() === date.getFullYear()
          );
        })
      });
    }
    
    // Calculate how many days to add from next month
    const remainingDays = 42 - calendarDays.length; // 6 rows * 7 days = 42
    
    // Add days from next month
    const nextMonth = month === 11 ? 0 : month + 1;
    const nextMonthYear = month === 11 ? year + 1 : year;
    
    for (let i = 1; i <= remainingDays; i++) {
      const date = new Date(nextMonthYear, nextMonth, i);
      calendarDays.push({
        date,
        isCurrentMonth: false,
        events: events.filter(event => {
          const eventDate = new Date(event.startTime);
          return (
            eventDate.getDate() === date.getDate() &&
            eventDate.getMonth() === date.getMonth() &&
            eventDate.getFullYear() === date.getFullYear()
          );
        })
      });
    }
    
    return calendarDays;
  };
  
  // Format event time for display
  const formatEventTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };
  
  // Check if a date is today
  const isToday = (date: Date) => {
    const today = new Date();
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    );
  };
  
  // Get upcoming events (next 3 events)
  const upcomingEvents = events
    .filter(event => new Date(event.startTime) >= new Date())
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
    .slice(0, 3);
  
  // Calendar days for month view
  const calendarDays = generateMonthCalendar();
  
  // Days of week for labels
  const daysOfWeek = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <CatchUpLayout>
      <div className="catchup-flex catchup-flex-col h-full">
        {/* Header */}
        <div className="catchup-flex catchup-items-center catchup-justify-between catchup-mb-6">
          <div>
            <h1 className="catchup-heading-lg">Calendar</h1>
            <p className="catchup-text-sm text-[var(--catchup-gray)]">
              Manage your schedule and events
            </p>
          </div>
          <button className="catchup-button catchup-button-primary">
            <Plus size={18} className="mr-2" />
            Add Event
          </button>
        </div>
        
        {/* Calendar Controls */}
        <div className="catchup-flex catchup-items-center catchup-justify-between catchup-mb-6">
          <div className="catchup-flex catchup-items-center catchup-gap-4">
            <h2 className="catchup-heading-md">{formatHeaderDate()}</h2>
            <div className="catchup-flex catchup-items-center">
              <button 
                className="catchup-button catchup-button-ghost p-2"
                onClick={goToPrevious}
              >
                <ChevronLeft size={20} />
              </button>
              <button
                className="catchup-button catchup-button-ghost p-2"
                onClick={goToNext}
              >
                <ChevronRight size={20} />
              </button>
            </div>
          </div>
          
          <div className="catchup-flex catchup-items-center catchup-gap-3">
            <button 
              className="catchup-button catchup-button-secondary text-sm"
              onClick={goToToday}
            >
              Today
            </button>
            
            <div className="catchup-flex bg-[var(--catchup-navy-dark)] rounded-md">
              <button 
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  viewMode === 'month' 
                    ? 'bg-[var(--catchup-cobalt)] text-white' 
                    : 'text-[var(--catchup-light-gray)]'
                }`}
                onClick={() => setViewMode('month')}
              >
                Month
              </button>
              <button 
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  viewMode === 'week' 
                    ? 'bg-[var(--catchup-cobalt)] text-white' 
                    : 'text-[var(--catchup-light-gray)]'
                }`}
                onClick={() => setViewMode('week')}
              >
                Week
              </button>
              <button 
                className={`px-3 py-1.5 text-sm font-medium rounded-md ${
                  viewMode === 'day' 
                    ? 'bg-[var(--catchup-cobalt)] text-white' 
                    : 'text-[var(--catchup-light-gray)]'
                }`}
                onClick={() => setViewMode('day')}
              >
                Day
              </button>
            </div>
            
            <button className="catchup-button catchup-button-ghost">
              <Filter size={16} />
            </button>
          </div>
        </div>
        
        {/* Calendar Grid - Month View */}
        {viewMode === 'month' && (
          <div className="catchup-flex catchup-flex-col flex-1">
            {/* Day headers */}
            <div className="catchup-grid catchup-grid-cols-7 mb-2">
              {daysOfWeek.map((day, index) => (
                <div 
                  key={index} 
                  className="text-center py-2 text-sm font-medium text-[var(--catchup-light-gray)]"
                >
                  {day}
                </div>
              ))}
            </div>
            
            {/* Calendar grid */}
            <div className="catchup-grid catchup-grid-cols-7 flex-1 gap-2">
              {calendarDays.map((day, index) => (
                <div
                  key={index}
                  className={`min-h-[100px] p-2 rounded-md border ${
                    day.isCurrentMonth 
                      ? isToday(day.date)
                        ? 'border-[var(--catchup-cobalt)] bg-[var(--catchup-navy-light)]'
                        : 'border-[var(--catchup-navy-dark)] bg-[var(--catchup-navy-light)]'
                      : 'border-[var(--catchup-navy-dark)] bg-[var(--catchup-navy-dark)] opacity-50'
                  }`}
                >
                  <div className="catchup-flex catchup-justify-between mb-2">
                    <span 
                      className={`text-sm font-medium ${
                        isToday(day.date) 
                          ? 'text-[var(--catchup-cobalt)]' 
                          : day.isCurrentMonth 
                            ? 'text-[var(--catchup-white)]' 
                            : 'text-[var(--catchup-gray)]'
                      }`}
                    >
                      {day.date.getDate()}
                    </span>
                    {day.events.length > 0 && (
                      <span className="text-xs text-[var(--catchup-gray)]">
                        {day.events.length} {day.events.length === 1 ? 'event' : 'events'}
                      </span>
                    )}
                  </div>
                  
                  <div className="space-y-1 overflow-hidden">
                    {day.events.slice(0, 2).map((event) => (
                      <div
                        key={event.id}
                        className="text-xs p-1 rounded-sm truncate"
                        style={{ backgroundColor: `${event.color}30`, borderLeft: `3px solid ${event.color}` }}
                      >
                        <div className="font-medium truncate">{event.title}</div>
                        {!event.allDay && (
                          <div className="text-[var(--catchup-gray)]">
                            {formatEventTime(event.startTime)}
                          </div>
                        )}
                      </div>
                    ))}
                    
                    {day.events.length > 2 && (
                      <div className="text-xs text-[var(--catchup-gray)] pl-1">
                        +{day.events.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Week and Day views - placeholders */}
        {(viewMode === 'week' || viewMode === 'day') && (
          <div className="catchup-grid catchup-grid-cols-1 md:grid-cols-4 gap-4">
            <div className="catchup-card col-span-3">
              <div className="text-center p-6">
                <h3 className="catchup-heading-sm mb-2">Coming Soon</h3>
                <p className="catchup-text-sm text-[var(--catchup-gray)]">
                  {viewMode === 'week' 
                    ? 'Week view is under development' 
                    : 'Day view is under development'}
                </p>
              </div>
            </div>
            
            {/* Upcoming Events Sidebar */}
            <div className="space-y-4">
              <div className="catchup-card">
                <h3 className="catchup-heading-sm mb-4">Upcoming Events</h3>
                
                {upcomingEvents.length > 0 ? (
                  <div className="space-y-3">
                    {upcomingEvents.map((event) => (
                      <div 
                        key={event.id}
                        className="p-3 rounded-md bg-[var(--catchup-navy-dark)]"
                        style={{ borderLeft: `4px solid ${event.color}` }}
                      >
                        <h4 className="catchup-text font-medium mb-1">{event.title}</h4>
                        
                        <div className="catchup-text-sm text-[var(--catchup-gray)] space-y-1">
                          <div className="catchup-flex catchup-items-center">
                            <CalendarIcon size={14} className="mr-2" />
                            {new Date(event.startTime).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric'
                            })}
                          </div>
                          
                          <div className="catchup-flex catchup-items-center">
                            <Clock size={14} className="mr-2" />
                            {formatEventTime(event.startTime)} - {formatEventTime(event.endTime)}
                          </div>
                          
                          {event.location && (
                            <div className="catchup-flex catchup-items-center">
                              <MapPin size={14} className="mr-2" />
                              {event.location}
                            </div>
                          )}
                          
                          {event.attendees && event.attendees.length > 0 && (
                            <div className="catchup-flex catchup-items-center">
                              <User size={14} className="mr-2" />
                              {event.attendees.length} {event.attendees.length === 1 ? 'attendee' : 'attendees'}
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="catchup-text-sm text-[var(--catchup-gray)] text-center py-4">
                    No upcoming events
                  </p>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </CatchUpLayout>
  );
}