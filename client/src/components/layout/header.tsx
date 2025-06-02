import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Menu,
  Search,
  Bot,
  Globe,
  Calendar,
  Clock,
  AlertTriangle
} from "lucide-react";
import { useAppSettings, languageCodeToName } from "@/lib/appSettingsContext";
import { useQuery } from "@tanstack/react-query";
import { format, isToday, isTomorrow, isPast, parseISO } from "date-fns";

type HeaderProps = {
  onMenuToggle: () => void;
};

export function Header({ onMenuToggle }: HeaderProps) {

  // Get current language from app settings
  const { settings } = useAppSettings();
  const [currentLanguageDisplay, setCurrentLanguageDisplay] = useState('');

  // Effect to update language display when settings change
  useEffect(() => {
    const lang = settings.language || 'en';
    const displayName = languageCodeToName[lang] || lang;
    setCurrentLanguageDisplay(displayName);
    
    // Log current language for debugging
    console.log('Current language (header):', lang);
    console.log('Language display (header):', displayName);
    console.log('Full settings (header):', settings);
  }, [settings.language]);

  // Fetch data for notifications
  const { data: events } = useQuery({ queryKey: ['/api/events'] });
  const { data: bookings } = useQuery({ queryKey: ['/api/bookings'] });
  const { data: tasks } = useQuery({ queryKey: ['/api/tasks'] });

  // Calculate notifications
  const notifications: Array<{
    id: string;
    type: string;
    title: string;
    description: string;
    time: string;
    icon: any;
  }> = [];
  const now = new Date();

  // Add upcoming events (today and tomorrow)
  if (Array.isArray(events)) {
    events.forEach((event: any) => {
      if (event.startDate) {
        const eventDate = parseISO(event.startDate);
        if (isToday(eventDate) || isTomorrow(eventDate)) {
          notifications.push({
            id: `event-${event.id}`,
            type: 'event',
            title: event.title,
            description: isToday(eventDate) ? 'Today' : 'Tomorrow',
            time: format(eventDate, 'h:mm a'),
            icon: Calendar
          });
        }
      }
    });
  }

  // Add upcoming bookings (today and tomorrow)
  if (Array.isArray(bookings)) {
    bookings.forEach((booking: any) => {
      if (booking.date) {
        const bookingDate = parseISO(booking.date);
        if (isToday(bookingDate) || isTomorrow(bookingDate)) {
          notifications.push({
            id: `booking-${booking.id}`,
            type: 'booking',
            title: `Client appointment`,
            description: `${isToday(bookingDate) ? 'Today' : 'Tomorrow'} at ${booking.time}`,
            time: booking.time,
            icon: Calendar
          });
        }
      }
    });
  }

  // Add overdue tasks
  if (Array.isArray(tasks)) {
    tasks.forEach((task: any) => {
      if (task.deadline && task.status !== 'completed') {
        const deadline = parseISO(task.deadline);
        if (isPast(deadline)) {
          notifications.push({
            id: `task-${task.id}`,
            type: 'overdue',
            title: task.title,
            description: `Overdue since ${format(deadline, 'MMM dd')}`,
            time: '',
            icon: AlertTriangle
          });
        }
      }
    });
  }

  const notificationCount = notifications.length;

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex justify-between items-center px-4 py-3 md:px-6">
        <div className="flex items-center md:hidden">
          <Button variant="ghost" size="icon" onClick={onMenuToggle}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-primary ml-2 flex items-center">
            <Bot className="mr-2 h-5 w-5" />
            FreelanceFlow
          </h1>
        </div>
        
        <div className="flex items-center flex-1 md:ml-6 justify-end">
          <div className="max-w-lg w-full lg:max-w-xs hidden md:block mr-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                placeholder="Search" 
                type="search" 
                className="pl-10 pr-3 py-2"
              />
            </div>
          </div>

          <div className="flex items-center">
            {/* Language indicator */}
            <Badge variant="outline" className="mr-2 bg-blue-50 text-blue-700 hidden md:flex">
              <Globe className="h-3 w-3 mr-1" />
              {currentLanguageDisplay}
            </Badge>
            
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <Bell className="h-5 w-5 text-gray-400" />
                  {notificationCount > 0 && (
                    <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-amber-500"></span>
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-80">
                <DropdownMenuLabel className="flex items-center justify-between">
                  Notifications
                  {notificationCount > 0 && (
                    <Badge variant="secondary" className="ml-2">
                      {notificationCount}
                    </Badge>
                  )}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                {notifications.length === 0 ? (
                  <DropdownMenuItem disabled>
                    <div className="flex flex-col items-center py-4 text-center">
                      <Bell className="h-8 w-8 text-gray-300 mb-2" />
                      <span className="text-sm text-muted-foreground">No notifications</span>
                    </div>
                  </DropdownMenuItem>
                ) : (
                  notifications.map((notification) => {
                    const IconComponent = notification.icon;
                    return (
                      <DropdownMenuItem key={notification.id} className="p-3">
                        <div className="flex items-start gap-3 w-full">
                          <IconComponent className={`h-4 w-4 mt-0.5 ${
                            notification.type === 'overdue' ? 'text-red-500' : 'text-blue-500'
                          }`} />
                          <div className="flex-1 min-w-0">
                            <span className="font-medium text-sm block truncate">
                              {notification.title}
                            </span>
                            <span className="text-xs text-muted-foreground block">
                              {notification.description}
                              {notification.time && ` • ${notification.time}`}
                            </span>
                          </div>
                        </div>
                      </DropdownMenuItem>
                    );
                  })
                )}
                
                {notifications.length > 0 && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-center justify-center">
                      <Calendar className="h-4 w-4 mr-2" />
                      View calendar
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
