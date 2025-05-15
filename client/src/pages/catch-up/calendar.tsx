import { useState, Fragment } from "react";
import { 
  Calendar as CalendarIcon, 
  ChevronLeft, 
  ChevronRight, 
  Plus,
  Clock,
  Users,
  MapPin,
  MoreHorizontal
} from "lucide-react";
import { format, addDays, startOfWeek, endOfWeek, eachDayOfInterval, isToday, isSameMonth } from "date-fns";
import { CatchUpLayout } from "@/components/layout/catch-up-layout";
import { AppCard, AppCardBody, AppCardHeader } from "@/components/ui/catch-up/app-card";
import { AppButton } from "@/components/ui/catch-up/app-button";

// Mock appointments data
const appointments = [
  {
    id: 1,
    title: "Haircut - John Smith",
    start: new Date(2025, 4, 16, 10, 0), // May 16, 2025 10:00 AM
    end: new Date(2025, 4, 16, 11, 0),   // May 16, 2025 11:00 AM
    color: "#0A2540",
    client: "John Smith",
    location: "Main Studio"
  },
  {
    id: 2,
    title: "Room Painting - Emily Johnson",
    start: new Date(2025, 4, 16, 14, 0), // May 16, 2025 2:00 PM
    end: new Date(2025, 4, 16, 17, 0),   // May 16, 2025 5:00 PM
    color: "#00C2D1", 
    client: "Emily Johnson",
    location: "Client's Home"
  },
  {
    id: 3,
    title: "Plumbing Repair - David Wilson",
    start: new Date(2025, 4, 17, 9, 0),  // May 17, 2025 9:00 AM
    end: new Date(2025, 4, 17, 11, 0),   // May 17, 2025 11:00 AM
    color: "#FFC700",
    client: "David Wilson",
    location: "Client's Home"
  },
  {
    id: 4,
    title: "Consultation - Sarah Brown",
    start: new Date(2025, 4, 18, 15, 30), // May 18, 2025 3:30 PM
    end: new Date(2025, 4, 18, 16, 0),    // May 18, 2025 4:00 PM
    color: "#0A2540",
    client: "Sarah Brown",
    location: "Video Call"
  }
];

/**
 * Catch Up Calendar Page
 */
export default function CatchUpCalendarPage() {
  const [selectedDate, setSelectedDate] = useState(new Date(2025, 4, 16)); // May 16, 2025
  const [view, setView] = useState<'day' | 'week'>('week');
  
  // Get current week dates
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 }); // Start from Monday
  const weekEnd = endOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = eachDayOfInterval({ start: weekStart, end: weekEnd });
  
  // Format date headers
  const formatDateHeader = (date: Date) => {
    return format(date, 'EEE, MMM d');
  };

  // Format time slot
  const formatTimeSlot = (hour: number) => {
    return format(new Date().setHours(hour, 0, 0, 0), 'h a');
  };
  
  // Get appointments for the selected day
  const getDayAppointments = (date: Date) => {
    const dayStart = new Date(date);
    dayStart.setHours(0, 0, 0, 0);
    
    const dayEnd = new Date(date);
    dayEnd.setHours(23, 59, 59, 999);
    
    return appointments.filter(
      appointment => appointment.start >= dayStart && appointment.start <= dayEnd
    );
  };
  
  // Format appointment time
  const formatAppointmentTime = (start: Date, end: Date) => {
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  };
  
  // Go to previous period
  const goToPrev = () => {
    if (view === 'day') {
      setSelectedDate(prev => addDays(prev, -1));
    } else {
      setSelectedDate(prev => addDays(prev, -7));
    }
  };
  
  // Go to next period
  const goToNext = () => {
    if (view === 'day') {
      setSelectedDate(prev => addDays(prev, 1));
    } else {
      setSelectedDate(prev => addDays(prev, 7));
    }
  };
  
  // Go to today
  const goToToday = () => {
    setSelectedDate(new Date(2025, 4, 16)); // Today (for demo purposes, keeping as May 16, 2025)
  };
  
  // Render day view
  const renderDayView = () => {
    const dayAppointments = getDayAppointments(selectedDate);
    
    return (
      <div>
        <div className="bg-white rounded-xl p-4 mb-4">
          <h2 className="text-lg font-semibold text-catchup-primary mb-4">
            {format(selectedDate, 'EEEE, MMMM d, yyyy')}
          </h2>
          
          {dayAppointments.length > 0 ? (
            <div className="space-y-4">
              {dayAppointments.map(appointment => (
                <AppointmentCard key={appointment.id} appointment={appointment} />
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-catchup-text-secondary">
              <CalendarIcon className="mx-auto h-12 w-12 text-gray-300 mb-2" />
              <p>No appointments scheduled for this day</p>
              <AppButton variant="filled" size="sm" className="mt-4" icon={<Plus className="h-4 w-4" />}>
                Add Appointment
              </AppButton>
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Render week view
  const renderWeekView = () => {
    const timeSlots = Array.from({ length: 12 }, (_, i) => i + 8); // 8 AM to 7 PM
    
    return (
      <div className="overflow-auto">
        <div className="min-w-max">
          <div className="grid grid-cols-8 bg-white rounded-t-xl">
            {/* Header with days */}
            <div className="col-span-1 border-b border-gray-200 p-3"></div>
            {weekDays.map((day, index) => (
              <div 
                key={index} 
                className={`col-span-1 p-3 text-center border-b border-gray-200 ${
                  isToday(day) ? 'bg-catchup-primary/5' : ''
                }`}
              >
                <p className={`text-sm font-medium ${
                  isToday(day) ? 'text-catchup-primary' : 'text-catchup-text-secondary'
                }`}>
                  {format(day, 'EEE')}
                </p>
                <p className={`text-lg font-semibold ${
                  isToday(day) ? 'text-catchup-primary' : 'text-catchup-text-primary'
                }`}>
                  {format(day, 'd')}
                </p>
              </div>
            ))}
            
            {/* Time slots and appointments */}
            {timeSlots.map(hour => (
              <React.Fragment key={hour}>
                {/* Time label */}
                <div className="col-span-1 border-b border-gray-200 p-2 text-right pr-3">
                  <span className="text-xs text-catchup-text-secondary">
                    {formatTimeSlot(hour)}
                  </span>
                </div>
                
                {/* Day cells */}
                {weekDays.map((day, dayIndex) => (
                  <div 
                    key={`${hour}-${dayIndex}`} 
                    className={`col-span-1 border-b border-l border-gray-200 p-1 h-12 relative ${
                      isToday(day) ? 'bg-catchup-primary/5' : ''
                    }`}
                  >
                    {/* Render appointments that start at this hour */}
                    {appointments.filter(appt => {
                      const apptDate = new Date(appt.start);
                      return (
                        apptDate.getDate() === day.getDate() &&
                        apptDate.getMonth() === day.getMonth() &&
                        apptDate.getHours() === hour
                      );
                    }).map(appt => {
                      // Calculate duration in hours
                      const durationHours = (appt.end.getTime() - appt.start.getTime()) / (1000 * 60 * 60);
                      const heightClass = `h-[${Math.max(1, durationHours) * 3}rem]`;
                      
                      return (
                        <div 
                          key={appt.id}
                          className={`absolute left-0 right-0 m-1 p-1 rounded text-white text-xs overflow-hidden z-10`}
                          style={{ 
                            backgroundColor: appt.color,
                            height: `${Math.max(1, durationHours) * 3}rem`,
                          }}
                        >
                          <div className="truncate font-medium">{appt.title}</div>
                          <div className="truncate text-white/80 text-xs">
                            {format(appt.start, 'h:mm a')} - {format(appt.end, 'h:mm a')}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ))}
              </React.Fragment>
            ))}
          </div>
        </div>
      </div>
    );
  };
  
  return (
    <CatchUpLayout title="Calendar">
      <div className="space-y-6">
        {/* Calendar Controls */}
        <div className="flex items-center justify-between bg-white rounded-xl p-4">
          <div className="flex items-center space-x-2">
            <AppButton
              variant="outlined"
              size="sm"
              onClick={goToToday}
            >
              Today
            </AppButton>
            
            <div className="flex items-center rounded-md border border-gray-200">
              <button
                onClick={goToPrev}
                className="p-2 hover:bg-gray-100 rounded-l-md"
              >
                <ChevronLeft className="h-5 w-5 text-catchup-text-secondary" />
              </button>
              <button
                onClick={goToNext}
                className="p-2 hover:bg-gray-100 rounded-r-md"
              >
                <ChevronRight className="h-5 w-5 text-catchup-text-secondary" />
              </button>
            </div>
            
            <h2 className="text-lg font-semibold text-catchup-primary ml-2">
              {view === 'day' 
                ? format(selectedDate, 'MMMM d, yyyy') 
                : `${format(weekStart, 'MMM d')} - ${format(weekEnd, 'MMM d, yyyy')}`}
            </h2>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex rounded-md overflow-hidden border border-gray-200">
              <button
                onClick={() => setView('day')}
                className={`px-3 py-1.5 text-sm ${
                  view === 'day' 
                    ? 'bg-catchup-primary text-white' 
                    : 'bg-white text-catchup-text-secondary hover:bg-gray-100'
                }`}
              >
                Day
              </button>
              <button
                onClick={() => setView('week')}
                className={`px-3 py-1.5 text-sm ${
                  view === 'week' 
                    ? 'bg-catchup-primary text-white' 
                    : 'bg-white text-catchup-text-secondary hover:bg-gray-100'
                }`}
              >
                Week
              </button>
            </div>
            
            <AppButton
              variant="filled"
              size="sm"
              icon={<Plus className="h-4 w-4" />}
            >
              New Appointment
            </AppButton>
          </div>
        </div>
        
        {/* Calendar View */}
        {view === 'day' ? renderDayView() : renderWeekView()}
        
        {/* Upcoming Appointments */}
        <AppCard>
          <AppCardHeader
            title="Upcoming Appointments"
            icon={<CalendarIcon className="h-5 w-5" />}
          />
          <AppCardBody>
            <div className="space-y-4">
              {appointments.slice(0, 3).map(appointment => (
                <div key={appointment.id} className="flex items-start justify-between border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-start gap-3">
                    <div 
                      className="h-10 w-10 shrink-0 rounded-full flex items-center justify-center mt-1"
                      style={{ backgroundColor: `${appointment.color}20` }}
                    >
                      <Clock className="h-5 w-5" style={{ color: appointment.color }} />
                    </div>
                    <div>
                      <p className="font-medium text-catchup-primary">{appointment.title}</p>
                      <p className="text-sm text-catchup-text-secondary">
                        {format(appointment.start, 'E, MMM d • h:mm a')}
                      </p>
                    </div>
                  </div>
                  <AppButton variant="text" size="sm">
                    Details
                  </AppButton>
                </div>
              ))}
            </div>
          </AppCardBody>
        </AppCard>
      </div>
    </CatchUpLayout>
  );
}

// Appointment card component
const AppointmentCard = ({ appointment }: { appointment: any }) => {
  // Format appointment time
  const formatAppointmentTime = (start: Date, end: Date) => {
    return `${format(start, 'h:mm a')} - ${format(end, 'h:mm a')}`;
  };
  
  return (
    <div 
      className="p-4 rounded-lg border border-gray-100 hover:shadow-md transition-shadow"
      style={{ borderLeftWidth: '4px', borderLeftColor: appointment.color }}
    >
      <div className="flex justify-between items-start">
        <h3 className="font-medium text-catchup-primary">{appointment.title}</h3>
        <button className="text-gray-400 hover:text-gray-600">
          <MoreHorizontal className="h-5 w-5" />
        </button>
      </div>
      
      <div className="mt-3 space-y-2">
        <div className="flex items-center text-sm text-catchup-text-secondary">
          <Clock className="h-4 w-4 mr-2 text-catchup-text-secondary" />
          <span>{formatAppointmentTime(appointment.start, appointment.end)}</span>
        </div>
        
        {appointment.client && (
          <div className="flex items-center text-sm text-catchup-text-secondary">
            <Users className="h-4 w-4 mr-2 text-catchup-text-secondary" />
            <span>{appointment.client}</span>
          </div>
        )}
        
        {appointment.location && (
          <div className="flex items-center text-sm text-catchup-text-secondary">
            <MapPin className="h-4 w-4 mr-2 text-catchup-text-secondary" />
            <span>{appointment.location}</span>
          </div>
        )}
      </div>
      
      <div className="flex justify-end mt-3 pt-3 border-t border-gray-100">
        <AppButton variant="text" size="sm" className="mr-2">
          Reschedule
        </AppButton>
        <AppButton variant="filled" size="sm">
          Details
        </AppButton>
      </div>
    </div>
  );
};