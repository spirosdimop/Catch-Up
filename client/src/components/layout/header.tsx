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
  const [showNotifications, setShowNotifications] = useState(false);

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
    type: 'urgent' | 'reminder' | 'info' | 'task';
    category: string;
    title: string;
    description: string;
    time: string;
    icon: any;
    priority: 'high' | 'medium' | 'low';
  }> = [];
  const now = new Date();

  // Add overdue tasks (HIGH PRIORITY)
  if (Array.isArray(tasks)) {
    tasks.forEach((task: any) => {
      if (task.deadline && task.status !== 'completed') {
        const deadline = parseISO(task.deadline);
        if (isPast(deadline)) {
          notifications.push({
            id: `task-overdue-${task.id}`,
            type: 'urgent',
            category: 'Tasks',
            title: `Overdue: ${task.title}`,
            description: `Past due since ${format(deadline, 'MMM dd')}`,
            time: '',
            icon: AlertTriangle,
            priority: 'high'
          });
        }
      }
    });
  }

  // Add today's events and meetings (MEDIUM PRIORITY)
  if (Array.isArray(events)) {
    events.forEach((event: any) => {
      if (event.startDate) {
        const eventDate = parseISO(event.startDate);
        if (isToday(eventDate)) {
          notifications.push({
            id: `event-today-${event.id}`,
            type: 'reminder',
            category: 'Calendar',
            title: `Today: ${event.title}`,
            description: `Scheduled for ${format(eventDate, 'h:mm a')}`,
            time: format(eventDate, 'h:mm a'),
            icon: Calendar,
            priority: 'medium'
          });
        }
      }
    });
  }

  // Add today's client appointments (HIGH PRIORITY)
  if (Array.isArray(bookings)) {
    bookings.forEach((booking: any) => {
      if (booking.date) {
        const bookingDate = parseISO(booking.date);
        if (isToday(bookingDate)) {
          notifications.push({
            id: `booking-today-${booking.id}`,
            type: 'reminder',
            category: 'Clients',
            title: 'Client appointment today',
            description: `Meeting scheduled at ${booking.time}`,
            time: booking.time,
            icon: Clock,
            priority: 'high'
          });
        }
      }
    });
  }

  // Add upcoming deadlines (within next 3 days) (MEDIUM PRIORITY)
  if (Array.isArray(tasks)) {
    tasks.forEach((task: any) => {
      if (task.deadline && task.status !== 'completed') {
        const deadline = parseISO(task.deadline);
        const daysUntil = Math.ceil((deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        if (daysUntil > 0 && daysUntil <= 3) {
          notifications.push({
            id: `task-deadline-${task.id}`,
            type: 'reminder',
            category: 'Tasks',
            title: `Due ${daysUntil === 1 ? 'tomorrow' : `in ${daysUntil} days`}: ${task.title}`,
            description: `Deadline: ${format(deadline, 'MMM dd')}`,
            time: '',
            icon: Clock,
            priority: 'medium'
          });
        }
      }
    });
  }

  // Add system notifications (placeholder for future features)
  const systemNotifications = [
    {
      id: 'system-welcome',
      type: 'info' as const,
      category: 'System',
      title: 'Welcome to FreelanceFlow',
      description: 'Complete your profile setup for better recommendations',
      time: '',
      icon: Bot,
      priority: 'low' as const
    }
  ];

  // Add system notifications to the list
  notifications.push(...systemNotifications);

  // Sort notifications by priority (high, medium, low)
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  notifications.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

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
            
            <div className="relative">
              <button 
                className="relative p-2 text-gray-400 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 rounded-md"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log('Notification button clicked, current state:', showNotifications);
                  setShowNotifications(!showNotifications);
                }}
                type="button"
              >
                <Bell className="h-5 w-5" />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-600 rounded-full">
                    {notificationCount}
                  </span>
                )}
              </button>
              
              {showNotifications && (
                <div className="absolute right-0 top-full mt-2 w-80 bg-white rounded-md shadow-lg border border-gray-200 z-50">
                  <div className="flex items-center justify-between p-3 border-b border-gray-100">
                    <span className="font-semibold text-gray-900">Notifications</span>
                    {notificationCount > 0 && (
                      <Badge variant="secondary" className="ml-2">
                        {notificationCount}
                      </Badge>
                    )}
                  </div>
                  
                  <div className="max-h-96 overflow-y-auto">
                    {notifications.length === 0 ? (
                      <div className="flex flex-col items-center py-8 text-center">
                        <Bell className="h-8 w-8 text-gray-300 mb-2" />
                        <span className="text-sm text-gray-500">All caught up!</span>
                        <span className="text-xs text-gray-400">No notifications right now</span>
                      </div>
                    ) : (
                      notifications.map((notification) => {
                        const IconComponent = notification.icon;
                        const getPriorityColor = (priority: string, type: string) => {
                          if (type === 'urgent') return 'text-red-500';
                          if (priority === 'high') return 'text-orange-500';
                          if (priority === 'medium') return 'text-blue-500';
                          return 'text-gray-500';
                        };
                        
                        const getBorderColor = (priority: string, type: string) => {
                          if (type === 'urgent') return 'border-l-red-500';
                          if (priority === 'high') return 'border-l-orange-500';
                          if (priority === 'medium') return 'border-l-blue-500';
                          return 'border-l-gray-300';
                        };

                        return (
                          <div 
                            key={notification.id} 
                            className={`p-3 border-b border-gray-50 hover:bg-gray-50 border-l-2 ${getBorderColor(notification.priority, notification.type)}`}
                          >
                            <div className="flex items-start gap-3 w-full">
                              <IconComponent className={`h-4 w-4 mt-0.5 ${getPriorityColor(notification.priority, notification.type)}`} />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="font-medium text-sm block truncate text-gray-900">
                                    {notification.title}
                                  </span>
                                  <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                    notification.type === 'urgent' ? 'bg-red-100 text-red-700' :
                                    notification.priority === 'high' ? 'bg-orange-100 text-orange-700' :
                                    notification.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
                                    'bg-gray-100 text-gray-600'
                                  }`}>
                                    {notification.category}
                                  </span>
                                </div>
                                <span className="text-xs text-gray-500 block">
                                  {notification.description}
                                  {notification.time && ` • ${notification.time}`}
                                </span>
                              </div>
                            </div>
                          </div>
                        );
                      })
                    )}
                  </div>
                  
                  {notifications.length > 0 && (
                    <div className="p-3 border-t border-gray-100">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="w-full justify-center"
                        onClick={() => setShowNotifications(false)}
                      >
                        <Calendar className="h-4 w-4 mr-2" />
                        View calendar
                      </Button>
                    </div>
                  )}
                </div>
              )}
              
              {showNotifications && (
                <div 
                  className="fixed inset-0 z-40" 
                  onClick={() => setShowNotifications(false)}
                />
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
