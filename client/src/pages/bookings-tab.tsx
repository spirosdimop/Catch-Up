import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays, subDays, isSameDay, parseISO } from 'date-fns';
import { NewBookingDialog as NewBookingDialogComponent } from '@/components/booking/new-booking-dialog';
import { 
  Calendar as CalendarIcon,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  MoreHorizontal,
  Calendar,
  Grid,
  List,
  Check,
  X,
  CalendarDays,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { apiRequest } from '@/lib/queryClient';

// Time slot interface
interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

// Service interface
interface Service {
  id: number;
  name: string;
  duration: number;
  description: string;
  price?: number;
}

// Booking schema with zod validation
const bookingSchema = z.object({
  date: z.date({
    required_error: "Please select a date.",
  }),
  timeSlot: z.string({
    required_error: "Please select a time slot.",
  }),
  service: z.string({
    required_error: "Please select a service type.",
  }),
  clientId: z.number({
    required_error: "Please select a client.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  priority: z.enum(["normal", "emergency"], {
    required_error: "Please select a priority level.",
  }),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  notes: z.string().optional(),
  isRescheduling: z.boolean().default(false),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

// Booking management interfaces
interface Booking {
  id: number;
  date: string;
  time: string;
  duration: number;
  type: 'call' | 'meeting' | 'followup' | 'consultation';
  status: 'confirmed' | 'rescheduled' | 'canceled' | 'emergency';
  client: {
    name: string;
    email: string;
    avatar?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// View enum for booking management
enum ViewMode {
  List = 'list',
  Grid = 'grid',
  Calendar = 'calendar'
}

const BookingsTab = () => {
  // Shared state
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Modal state for new booking dialog
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  
  // Booking form state
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>(undefined);
  
  // Default values for the form
  const defaultValues: Partial<BookingFormValues> = {
    date: undefined,
    timeSlot: "",
    service: "",
    priority: "normal",
    name: "",
    email: "",
    notes: "",
    isRescheduling: false,
  };
  
  // Form setup
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues,
  });
  
  // Watch form fields for conditional rendering
  const watchService = form.watch("service");
  const watchDate = form.watch("date");
  
  // Query available services
  const { data: services = [] } = useQuery<Service[], Error>({
    queryKey: ['/api/services'],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", "/api/services");
        return await response.json();
      } catch (error) {
        console.error("Failed to fetch services", error);
        return [];
      }
    },
  });
  
  // Selected service details
  const selectedService = services.find(service => service.id.toString() === watchService);
  
  // Query available time slots for selected date
  const { data: timeSlots = [], isLoading: isSlotsLoading } = useQuery<TimeSlot[], Error>({
    queryKey: ['/api/time-slots', watchDate?.toISOString()],
    queryFn: async () => {
      if (!watchDate) return [];
      
      try {
        const response = await apiRequest("GET", `/api/time-slots?date=${format(watchDate, 'yyyy-MM-dd')}`);
        return await response.json();
      } catch (error) {
        console.error("Failed to fetch time slots", error);
        // Fallback time slots for demo
        return [
          { id: "1", time: "09:00 AM", available: true },
          { id: "2", time: "10:00 AM", available: true },
          { id: "3", time: "11:00 AM", available: false },
          { id: "4", time: "12:00 PM", available: true },
          { id: "5", time: "01:00 PM", available: true },
          { id: "6", time: "02:00 PM", available: false },
          { id: "7", time: "03:00 PM", available: true },
          { id: "8", time: "04:00 PM", available: true },
        ];
      }
    },
    enabled: !!watchDate,
  });
  
  // Booking creation mutation
  const bookingMutation = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      const response = await apiRequest("POST", "/api/bookings", data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking confirmed",
        description: "Your appointment has been successfully scheduled.",
      });
      form.reset(defaultValues);
      setStep(1);
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
    },
    onError: (error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Form submission handler
  const handleBookingSubmit = (data: BookingFormValues) => {
    if (step < 3) {
      setStep(step + 1);
      return;
    }
    
    bookingMutation.mutate(data);
  };
  
  // Handle back button
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };
  
  // Booking Management State
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Grid);
  const [managementSelectedDate, setManagementSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: addDays(new Date(), 30)
  });
  const [detailsBooking, setDetailsBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  
  // Query for bookings
  const { data: bookings = [], isLoading } = useQuery<Booking[], Error>({
    queryKey: ['bookings', dateRange, selectedStatus, selectedType],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", `/api/bookings`);
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch bookings', error);
        return [];
      }
    },
  });
  
  // Cancel booking mutation
  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await apiRequest("PATCH", `/api/bookings/${bookingId}`, {
        status: 'canceled'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking canceled",
        description: "The booking has been successfully canceled.",
      });
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error) => {
      toast({
        title: "Error canceling booking",
        description: error.message,
        variant: "destructive",
      });
    },
  });
  
  // Reschedule booking mutation
  const rescheduleBookingMutation = useMutation({
    mutationFn: async ({ bookingId, date, time }: { bookingId: number; date: string; time: string }) => {
      const response = await apiRequest("PATCH", `/api/bookings/${bookingId}`, {
        date,
        time,
        status: 'rescheduled'
      });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking rescheduled",
        description: "The booking has been successfully rescheduled.",
      });
      setIsRescheduleOpen(false);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error) => {
      toast({
        title: "Error rescheduling booking",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Filter bookings based on selected filters
  const filteredBookings = bookings.filter(booking => {
    const bookingDate = parseISO(booking.date);
    const isInDateRange = bookingDate >= dateRange.from && bookingDate <= dateRange.to;
    const matchesStatus = selectedStatus === 'all' || booking.status === selectedStatus;
    const matchesType = selectedType === 'all' || booking.type === selectedType;
    
    return isInDateRange && matchesStatus && matchesType;
  });
  
  // Group bookings by date for calendar view
  const bookingsByDate = filteredBookings.reduce((acc, booking) => {
    const dateStr = booking.date;
    if (!acc[dateStr]) {
      acc[dateStr] = [];
    }
    acc[dateStr].push(booking);
    return acc;
  }, {} as Record<string, Booking[]>);
  
  // Get status color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed':
        return 'bg-green-500 hover:bg-green-600';
      case 'rescheduled':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'canceled':
        return 'bg-red-500 hover:bg-red-600';
      case 'emergency':
        return 'bg-purple-500 hover:bg-purple-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };
  
  // Get type label
  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'call':
        return 'Call';
      case 'meeting':
        return 'Meeting';
      case 'followup':
        return 'Follow-up';
      case 'consultation':
        return 'Consultation';
      default:
        return type;
    }
  };
  
  // Calculate booking status distribution
  const statusCounts = filteredBookings.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const totalBookings = filteredBookings.length;
  
  // Handle viewing booking details
  const handleViewDetails = (booking: Booking) => {
    setDetailsBooking(booking);
    setIsDetailsOpen(true);
  };
  
  // Handle opening reschedule dialog
  const handleOpenReschedule = (booking: Booking) => {
    setDetailsBooking(booking);
    setIsRescheduleOpen(true);
  };
  
  // Handle canceling a booking
  const handleCancelBooking = (bookingId: number) => {
    if (confirm('Are you sure you want to cancel this booking?')) {
      cancelBookingMutation.mutate(bookingId);
    }
  };
  
  // Render booking list view
  const renderListView = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-pulse h-6 w-24 bg-[#1a3a68] rounded"></div>
        </div>
      );
    }
    
    if (filteredBookings.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No bookings found</h3>
          <p>Try adjusting your filters or create a new booking.</p>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="flex flex-col">
                    <span className="text-lg font-medium">{booking.client.name}</span>
                    <div className="flex items-center mt-1 space-x-3">
                      <Badge className={getStatusColor(booking.status)} variant="secondary">
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                      <Badge variant="outline" className="bg-white text-[#0A2540]">
                        {getTypeLabel(booking.type)}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center justify-end space-x-1 text-gray-500">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{format(parseISO(booking.date), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center justify-end space-x-1 text-gray-500 mt-1">
                      <Clock className="h-4 w-4" />
                      <span>{booking.time} ({booking.duration} min)</span>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-500 hover:text-[#0A2540] hover:bg-white">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white border-gray-200 text-[#0A2540]">
                      <DropdownMenuLabel>Booking Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-200" />
                      <DropdownMenuItem 
                        className="hover:bg-white cursor-pointer"
                        onClick={() => handleViewDetails(booking)}
                      >
                        View Details
                      </DropdownMenuItem>
                      {booking.status !== 'canceled' && (
                        <>
                          <DropdownMenuItem 
                            className="hover:bg-white cursor-pointer"
                            onClick={() => handleOpenReschedule(booking)}
                          >
                            Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-400 hover:text-red-300 hover:bg-white cursor-pointer"
                            onClick={() => handleCancelBooking(booking.id)}
                          >
                            Cancel Booking
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
              
              {booking.notes && (
                <div className="mt-4 pl-4 border-l-2 border-gray-200 text-gray-500 text-sm">
                  {booking.notes}
                </div>
              )}
              
              <div className="flex justify-end mt-4 space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-200 text-[#0A2540] hover:bg-white"
                  onClick={() => handleViewDetails(booking)}
                >
                  View Details
                </Button>
                {booking.status !== 'canceled' && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-gray-200 text-[#0A2540] hover:bg-white"
                      onClick={() => handleOpenReschedule(booking)}
                    >
                      Reschedule
                    </Button>
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Cancel
                    </Button>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };
  
  // Render booking grid view
  const renderGridView = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-pulse h-6 w-24 bg-[#1a3a68] rounded"></div>
        </div>
      );
    }
    
    if (filteredBookings.length === 0) {
      return (
        <div className="text-center py-12 text-gray-500">
          <Calendar className="h-12 w-12 mx-auto mb-4 opacity-50" />
          <h3 className="text-lg font-medium mb-2">No bookings found</h3>
          <p>Try adjusting your filters or create a new booking.</p>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="bg-white border-gray-200 shadow-sm">
            <CardHeader className="pb-2 flex flex-row items-start justify-between">
              <div>
                <CardTitle className="text-base">{booking.client.name}</CardTitle>
                <CardDescription className="text-gray-500">{booking.client.email}</CardDescription>
              </div>
              <Badge className={getStatusColor(booking.status)} variant="secondary">
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex flex-col space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Date:</span>
                  <span className="font-medium">{format(parseISO(booking.date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Time:</span>
                  <span className="font-medium">{booking.time} ({booking.duration} min)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Type:</span>
                  <Badge variant="outline" className="bg-white text-[#0A2540]">
                    {getTypeLabel(booking.type)}
                  </Badge>
                </div>
                {booking.notes && (
                  <div className="mt-2 text-gray-500 text-xs border-t border-gray-200 pt-2">
                    <span className="text-gray-500 block mb-1">Notes:</span>
                    <p className="line-clamp-2">{booking.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-[#0A2540] hover:bg-white"
                onClick={() => handleViewDetails(booking)}
              >
                View Details
              </Button>
              {booking.status !== 'canceled' && (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="text-[#0A2540] hover:bg-white"
                    >
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40 bg-white border-gray-200 text-[#0A2540]">
                    <DropdownMenuItem 
                      className="hover:bg-white cursor-pointer"
                      onClick={() => handleOpenReschedule(booking)}
                    >
                      Reschedule
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-400 hover:text-red-300 hover:bg-white cursor-pointer"
                      onClick={() => handleCancelBooking(booking.id)}
                    >
                      Cancel
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  // Render booking calendar view
  const renderCalendarView = () => {
    const today = new Date();
    const daysWithBookings = Object.keys(bookingsByDate);
    
    return (
      <div className="bg-[#173561] border border-gray-200 rounded-lg p-4">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium">
            {format(managementSelectedDate || today, 'MMMM yyyy')}
          </h3>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              className="border-gray-200 text-[#0A2540] hover:bg-white"
              onClick={() => setManagementSelectedDate(subDays(managementSelectedDate || today, 30))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="border-gray-200 text-[#0A2540] hover:bg-white"
              onClick={() => setManagementSelectedDate(addDays(managementSelectedDate || today, 30))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <CalendarComponent
          mode="single"
          selected={managementSelectedDate}
          onSelect={setManagementSelectedDate}
          className="bg-white text-[#0A2540] border-gray-200 rounded-lg"
          modifiers={{
            booked: (date) => daysWithBookings.some(d => 
              isSameDay(parseISO(d), date)
            ),
          }}
          modifiersStyles={{
            booked: {
              backgroundColor: "#1d4ed8",
              borderRadius: "0.3rem",
            },
          }}
          components={{
            DayContent: (props) => {
              const date = props.date;
              const formattedDate = format(date, 'yyyy-MM-dd');
              const dayBookings = bookingsByDate[formattedDate] || [];
              
              return (
                <div className="relative w-full h-full flex items-center justify-center">
                  <span>{props.date.getDate()}</span>
                  {dayBookings.length > 0 && (
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <span className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-1 text-xs text-blue-400">
                            {dayBookings.length}
                          </span>
                        </TooltipTrigger>
                        <TooltipContent className="bg-white border-gray-200 text-[#0A2540]">
                          {dayBookings.length} booking{dayBookings.length !== 1 ? 's' : ''}
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  )}
                </div>
              );
            }
          }}
        />
        
        {managementSelectedDate && (
          <div className="mt-6">
            <h3 className="font-medium mb-3">
              Bookings on {format(managementSelectedDate, 'MMMM d, yyyy')}
            </h3>
            
            {bookingsByDate[format(managementSelectedDate, 'yyyy-MM-dd')] ? (
              <div className="space-y-3">
                {bookingsByDate[format(managementSelectedDate, 'yyyy-MM-dd')].map((booking) => (
                  <Card key={booking.id} className="bg-white border-gray-200">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{booking.client.name}</span>
                          <div className="flex items-center text-sm text-gray-500 mt-1">
                            <Clock className="h-3 w-3 mr-1" />
                            <span>{booking.time}</span>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge className={getStatusColor(booking.status)} variant="secondary">
                            {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                          </Badge>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="text-[#0A2540] hover:bg-gray-100"
                            onClick={() => handleViewDetails(booking)}
                          >
                            Details
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6 text-gray-500">
                <p>No bookings on this date</p>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };
  
  // Booking details dialog
  const BookingDetailsDialog = () => {
    if (!detailsBooking) return null;
    
    return (
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-white border-gray-200 text-[#0A2540]">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-lg">{detailsBooking.client.name}</h3>
                <p className="text-gray-500">{detailsBooking.client.email}</p>
              </div>
              <Badge className={getStatusColor(detailsBooking.status)}>
                {detailsBooking.status.charAt(0).toUpperCase() + detailsBooking.status.slice(1)}
              </Badge>
            </div>
            
            <Separator className="bg-gray-200" />
            
            <div className="grid grid-cols-2 gap-y-3">
              <div className="text-gray-500">Date</div>
              <div>{format(parseISO(detailsBooking.date), 'MMMM d, yyyy')}</div>
              
              <div className="text-gray-500">Time</div>
              <div>{detailsBooking.time}</div>
              
              <div className="text-gray-500">Duration</div>
              <div>{detailsBooking.duration} minutes</div>
              
              <div className="text-gray-500">Type</div>
              <div>{getTypeLabel(detailsBooking.type)}</div>
              
              <div className="text-gray-500">Created</div>
              <div>{format(parseISO(detailsBooking.createdAt), 'MMM d, yyyy h:mm a')}</div>
              
              {detailsBooking.status === 'rescheduled' && (
                <>
                  <div className="text-gray-500">Updated</div>
                  <div>{format(parseISO(detailsBooking.updatedAt), 'MMM d, yyyy h:mm a')}</div>
                </>
              )}
            </div>
            
            {detailsBooking.notes && (
              <>
                <Separator className="bg-gray-200" />
                <div>
                  <h4 className="text-sm font-medium mb-2 text-gray-500">Notes</h4>
                  <p className="text-sm">{detailsBooking.notes}</p>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDetailsOpen(false)}
              className="border-gray-200 text-[#0A2540] hover:bg-white"
            >
              Close
            </Button>
            {detailsBooking.status !== 'canceled' && (
              <>
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsDetailsOpen(false);
                    handleOpenReschedule(detailsBooking);
                  }}
                  className="border-gray-200 text-[#0A2540] hover:bg-white"
                >
                  Reschedule
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    handleCancelBooking(detailsBooking.id);
                    setIsDetailsOpen(false);
                  }}
                >
                  Cancel Booking
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Reschedule dialog
  const RescheduleDialog = () => {
    if (!detailsBooking) return null;
    
    const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(parseISO(detailsBooking.date));
    const [rescheduleTime, setRescheduleTime] = useState(detailsBooking.time);
    
    const handleReschedule = () => {
      if (!rescheduleDate || !rescheduleTime) {
        toast({
          title: "Missing information",
          description: "Please select a date and time for rescheduling.",
          variant: "destructive",
        });
        return;
      }
      
      rescheduleBookingMutation.mutate({
        bookingId: detailsBooking.id,
        date: format(rescheduleDate, 'yyyy-MM-dd'),
        time: rescheduleTime
      });
    };
    
    return (
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className="bg-white border-gray-200 text-[#0A2540]">
          <DialogHeader>
            <DialogTitle>Reschedule Booking</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="mb-4">
              <p className="text-sm text-gray-500 mb-1">Current booking</p>
              <p className="font-medium">
                {detailsBooking.client.name} - {getTypeLabel(detailsBooking.type)}
              </p>
              <p className="text-sm mt-1">
                {format(parseISO(detailsBooking.date), 'MMMM d, yyyy')} at {detailsBooking.time}
              </p>
            </div>
            
            <Separator className="bg-gray-200" />
            
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="reschedule-date">New Date</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      id="reschedule-date"
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal bg-white border-gray-200 text-[#0A2540]",
                        !rescheduleDate && "text-gray-500"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {rescheduleDate ? format(rescheduleDate, 'PPP') : <span>Pick a date</span>}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0 bg-white border-gray-200">
                    <CalendarComponent
                      mode="single"
                      selected={rescheduleDate}
                      onSelect={setRescheduleDate}
                      initialFocus
                      disabled={(date) => date < subDays(new Date(), 1)}
                      className="bg-white text-[#0A2540]"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="reschedule-time">New Time</Label>
                <Select
                  value={rescheduleTime}
                  onValueChange={setRescheduleTime}
                >
                  <SelectTrigger id="reschedule-time" className="bg-white border-gray-200 text-[#0A2540]">
                    <SelectValue placeholder="Select a time slot" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border-gray-200 text-[#0A2540]">
                    <SelectItem value="09:00 AM">09:00 AM</SelectItem>
                    <SelectItem value="10:00 AM">10:00 AM</SelectItem>
                    <SelectItem value="11:00 AM">11:00 AM</SelectItem>
                    <SelectItem value="12:00 PM">12:00 PM</SelectItem>
                    <SelectItem value="01:00 PM">01:00 PM</SelectItem>
                    <SelectItem value="02:00 PM">02:00 PM</SelectItem>
                    <SelectItem value="03:00 PM">03:00 PM</SelectItem>
                    <SelectItem value="04:00 PM">04:00 PM</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsRescheduleOpen(false)}
              className="border-gray-200 text-[#0A2540] hover:bg-white"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReschedule}
              className="bg-[#0A2540] hover:bg-[#081c30] text-[#0A2540]"
              disabled={!rescheduleDate || !rescheduleTime || rescheduleBookingMutation.isPending}
            >
              {rescheduleBookingMutation.isPending ? "Processing..." : "Confirm Reschedule"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  return (
    <div className="min-h-screen bg-white text-[#0A2540] p-4 md:p-6">
      <div className="max-w-[1200px] mx-auto">
        <div className="flex flex-col md:flex-row gap-4 md:items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Bookings</h1>
            <p className="text-gray-500 mt-1">Manage and schedule appointments</p>
          </div>
          
          <div className="flex justify-end">
            <Button
              variant="default"
              onClick={() => setIsNewBookingOpen(true)}
              className="bg-[#0A2540] hover:bg-[#081c30]"
            >
              <CalendarDays className="mr-2 h-4 w-4" />
              Add New Booking
            </Button>
          </div>
        </div>
        
        {/* Management view is the default */}
        <div className="grid gap-6">
            {/* Bookings list/grid view */}
                  <CardHeader className="pb-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-lg font-medium">
                          {step === 1 ? "Service Details" : 
                           step === 2 ? "Schedule" : 
                           "Your Information"}
                        </CardTitle>
                        <CardDescription className="text-gray-500 mt-1">
                          {step === 1 ? "Select the type of service you need" : 
                           step === 2 ? "Choose a date and time that works for you" : 
                           "Provide your contact information"}
                        </CardDescription>
                      </div>
                      
                      <div className="flex space-x-1">
                        <div className={cn(
                          "h-2 w-8 rounded",
                          step >= 1 ? "bg-[#0A2540]" : "bg-gray-200"
                        )}></div>
                        <div className={cn(
                          "h-2 w-8 rounded",
                          step >= 2 ? "bg-[#0A2540]" : "bg-gray-200"
                        )}></div>
                        <div className={cn(
                          "h-2 w-8 rounded",
                          step === 3 ? "bg-[#0A2540]" : "bg-gray-200"
                        )}></div>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="pb-6">
                    {step === 1 && (
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="service"
                          render={({ field }) => (
                            <FormItem className="space-y-4">
                              <FormLabel>Service Type</FormLabel>
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {services.map((service) => (
                                  <div key={service.id}>
                                    <RadioGroup 
                                      onValueChange={field.onChange} 
                                      defaultValue={field.value}
                                      className="flex"
                                    >
                                      <div className={cn(
                                        "relative flex w-full cursor-pointer rounded-lg border p-4 focus:outline-none",
                                        field.value === service.id.toString() 
                                          ? "border-[#1d4ed8] bg-[#0f3b85]" 
                                          : "border-gray-200 bg-white"
                                      )}>
                                        <FormItem className="flex-1">
                                          <FormControl>
                                            <RadioGroupItem 
                                              value={service.id.toString()} 
                                              className="sr-only"
                                            />
                                          </FormControl>
                                          <div className="flex flex-col gap-1">
                                            <FormLabel className="text-base font-medium cursor-pointer flex justify-between">
                                              {service.name}
                                              {service.price && (
                                                <span className="text-gray-500">${service.price}</span>
                                              )}
                                            </FormLabel>
                                            <div className="flex items-center text-sm text-gray-500">
                                              <Clock className="mr-1 h-3.5 w-3.5" />
                                              <p>{service.duration} minutes</p>
                                            </div>
                                            <FormDescription className="mt-1 text-xs">
                                              {service.description}
                                            </FormDescription>
                                          </div>
                                        </FormItem>
                                      </div>
                                    </RadioGroup>
                                  </div>
                                ))}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="priority"
                          render={({ field }) => (
                            <FormItem>
                              <div className="flex flex-row items-center justify-between space-y-0 py-2">
                                <div className="space-y-0.5">
                                  <FormLabel>Emergency Priority</FormLabel>
                                  <FormDescription>
                                    Mark as emergency to request faster scheduling
                                  </FormDescription>
                                </div>
                                <FormControl>
                                  <Switch
                                    checked={field.value === "emergency"}
                                    onCheckedChange={(checked) => {
                                      field.onChange(checked ? "emergency" : "normal");
                                    }}
                                    className="data-[state=checked]:bg-red-500"
                                  />
                                </FormControl>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                    
                    {step === 2 && (
                      <div className="space-y-6">
                        <FormField
                          control={form.control}
                          name="date"
                          render={({ field }) => (
                            <FormItem className="flex flex-col space-y-4">
                              <FormLabel>Date</FormLabel>
                              <div className="flex-1">
                                <Popover>
                                  <PopoverTrigger asChild>
                                    <FormControl>
                                      <Button
                                        variant="outline"
                                        className={cn(
                                          "w-full pl-3 text-left font-normal border-gray-200 bg-white text-[#0A2540]",
                                          !field.value && "text-gray-500"
                                        )}
                                      >
                                        {field.value ? (
                                          format(field.value, "PPP")
                                        ) : (
                                          <span>Pick a date</span>
                                        )}
                                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                      </Button>
                                    </FormControl>
                                  </PopoverTrigger>
                                  <PopoverContent className="w-auto p-0 bg-white border-gray-200" align="start">
                                    <CalendarComponent
                                      mode="single"
                                      selected={field.value}
                                      onSelect={(date) => {
                                        field.onChange(date);
                                        setSelectedDate(date);
                                      }}
                                      disabled={(date) => 
                                        date < new Date() || 
                                        date > addDays(new Date(), 60)
                                      }
                                      initialFocus
                                      className="bg-white text-[#0A2540] border-gray-200"
                                    />
                                  </PopoverContent>
                                </Popover>
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        <FormField
                          control={form.control}
                          name="timeSlot"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Time Slot</FormLabel>
                              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-2">
                                {isSlotsLoading ? (
                                  <div className="col-span-full flex justify-center py-4">
                                    <div className="animate-pulse h-6 w-24 bg-[#1a3a68] rounded"></div>
                                  </div>
                                ) : timeSlots.length === 0 ? (
                                  <div className="col-span-full text-center py-4 text-gray-500">
                                    <p>Please select a date first</p>
                                  </div>
                                ) : (
                                  timeSlots.map((slot) => (
                                    <div key={slot.id} className="relative">
                                      <button
                                        type="button"
                                        className={cn(
                                          "w-full py-2 px-3 rounded-md text-center transition-colors",
                                          slot.available
                                            ? field.value === slot.id
                                              ? "bg-[#0A2540] text-[#0A2540]"
                                              : "bg-white text-[#0A2540] hover:bg-gray-100 border border-gray-200"
                                            : "bg-gray-800 text-gray-500 cursor-not-allowed opacity-50",
                                        )}
                                        onClick={() => {
                                          if (slot.available) {
                                            field.onChange(slot.id);
                                            setSelectedTimeSlot(slot.time);
                                          }
                                        }}
                                        disabled={!slot.available}
                                      >
                                        {slot.time}
                                      </button>
                                    </div>
                                  ))
                                )}
                              </div>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {selectedService && selectedDate && selectedTimeSlot && (
                          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                            <h3 className="font-medium mb-2">Booking Summary</h3>
                            <div className="space-y-1 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-500">Service:</span>
                                <span>{selectedService.name}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Date:</span>
                                <span>{format(selectedDate, 'PPP')}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Time:</span>
                                <span>{selectedTimeSlot}</span>
                              </div>
                              <div className="flex justify-between">
                                <span className="text-gray-500">Duration:</span>
                                <span>{selectedService.duration} minutes</span>
                              </div>
                              {selectedService.price && (
                                <div className="flex justify-between">
                                  <span className="text-gray-500">Price:</span>
                                  <span>${selectedService.price}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                    
                    {step === 3 && (
                      <div className="space-y-6">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="name"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Name</FormLabel>
                                <FormControl>
                                  <Input 
                                    placeholder="Your name" 
                                    {...field} 
                                    className="bg-white border-gray-200 text-[#0A2540]"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                              <FormItem>
                                <FormLabel>Email</FormLabel>
                                <FormControl>
                                  <Input 
                                    type="email" 
                                    placeholder="Your email" 
                                    {...field} 
                                    className="bg-white border-gray-200 text-[#0A2540]"
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                        
                        <FormField
                          control={form.control}
                          name="notes"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Notes (Optional)</FormLabel>
                              <FormControl>
                                <Textarea 
                                  placeholder="Any specific details or questions you'd like to share" 
                                  {...field} 
                                  className="bg-white border-gray-200 text-[#0A2540] resize-none min-h-[120px]"
                                />
                              </FormControl>
                              <FormDescription>
                                Include any information that might be helpful for your appointment.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {selectedService && selectedDate && selectedTimeSlot && (
                          <div className="mt-6 p-4 bg-white rounded-lg border border-gray-200">
                            <h3 className="font-medium mb-2">Booking Summary</h3>
                            <div className="grid grid-cols-2 gap-y-2 text-sm">
                              <div className="text-gray-500">Service:</div>
                              <div>{selectedService.name}</div>
                              
                              <div className="text-gray-500">Date:</div>
                              <div>{format(selectedDate, 'PPP')}</div>
                              
                              <div className="text-gray-500">Time:</div>
                              <div>{selectedTimeSlot}</div>
                              
                              <div className="text-gray-500">Duration:</div>
                              <div>{selectedService.duration} minutes</div>
                              
                              {form.getValues("priority") === "emergency" && (
                                <>
                                  <div className="text-gray-500">Priority:</div>
                                  <div>
                                    <Badge variant="destructive">Emergency</Badge>
                                  </div>
                                </>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex justify-between pt-6">
                    <Button 
                      type="button" 
                      onClick={handleBack} 
                      variant="outline" 
                      disabled={step === 1}
                      className="border-gray-200 text-[#0A2540] hover:bg-white hover:text-[#0A2540]"
                    >
                      {step === 1 ? "Cancel" : "Back"}
                    </Button>
                    <Button 
                      type="submit" 
                      className="bg-[#0A2540] hover:bg-[#081c30] text-[#0A2540] min-w-[120px]"
                      disabled={
                        (step === 1 && !watchService) ||
                        (step === 2 && (!watchDate || !form.getValues("timeSlot"))) ||
                        bookingMutation.isPending
                      }
                    >
                      {step === 3 
                        ? (bookingMutation.isPending ? "Processing..." : "Confirm Booking") 
                        : "Continue"}
                    </Button>
                  </CardFooter>
                </Card>
              </form>
            </Form>
          </div>
        )}
        
        {activeTab === "manage" && (
          <>
            {/* Overview Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">Total Bookings</p>
                    <p className="text-2xl font-bold mt-1">{totalBookings}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-[#1d4ed8] opacity-75" />
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">Confirmed</p>
                    <p className="text-2xl font-bold mt-1">{statusCounts.confirmed || 0}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-green-500 opacity-75 flex items-center justify-center">
                    <Check className="h-5 w-5 text-[#0A2540]" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">Rescheduled</p>
                    <p className="text-2xl font-bold mt-1">{statusCounts.rescheduled || 0}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-amber-500 opacity-75 flex items-center justify-center">
                    <Clock className="h-5 w-5 text-[#0A2540]" />
                  </div>
                </CardContent>
              </Card>
              
              <Card className="bg-white border-gray-200 shadow-sm">
                <CardContent className="p-4 flex justify-between items-center">
                  <div>
                    <p className="text-gray-500 text-sm">Canceled</p>
                    <p className="text-2xl font-bold mt-1">{statusCounts.canceled || 0}</p>
                  </div>
                  <div className="h-8 w-8 rounded-full bg-red-500 opacity-75 flex items-center justify-center">
                    <X className="h-5 w-5 text-[#0A2540]" />
                  </div>
                </CardContent>
              </Card>
            </div>
            
            {/* Filter and View Controls */}
            <div className="bg-[#173561] border border-gray-200 rounded-lg p-4 mb-6">
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
                  <div>
                    <Label htmlFor="filter-status" className="mb-1 block text-sm">Status</Label>
                    <Select
                      value={selectedStatus}
                      onValueChange={setSelectedStatus}
                    >
                      <SelectTrigger id="filter-status" className="w-40 bg-white border-gray-200 text-[#0A2540]">
                        <SelectValue placeholder="Filter status" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 text-[#0A2540]">
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="confirmed">Confirmed</SelectItem>
                        <SelectItem value="rescheduled">Rescheduled</SelectItem>
                        <SelectItem value="canceled">Canceled</SelectItem>
                        <SelectItem value="emergency">Emergency</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="filter-type" className="mb-1 block text-sm">Type</Label>
                    <Select
                      value={selectedType}
                      onValueChange={setSelectedType}
                    >
                      <SelectTrigger id="filter-type" className="w-40 bg-white border-gray-200 text-[#0A2540]">
                        <SelectValue placeholder="Filter type" />
                      </SelectTrigger>
                      <SelectContent className="bg-white border-gray-200 text-[#0A2540]">
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="call">Call</SelectItem>
                        <SelectItem value="meeting">Meeting</SelectItem>
                        <SelectItem value="followup">Follow-up</SelectItem>
                        <SelectItem value="consultation">Consultation</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="date-range" className="mb-1 block text-sm">Date Range</Label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          id="date-range"
                          variant="outline"
                          className="w-[240px] justify-start text-left font-normal bg-white border-gray-200 text-[#0A2540]"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {dateRange.from ? (
                            dateRange.to ? (
                              <>
                                {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                              </>
                            ) : (
                              format(dateRange.from, "LLL dd, y")
                            )
                          ) : (
                            <span>Pick a date range</span>
                          )}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-white border-gray-200">
                        <div className="p-3">
                          <CalendarComponent
                            initialFocus
                            mode="range"
                            defaultMonth={dateRange.from}
                            selected={{
                              from: dateRange.from,
                              to: dateRange.to,
                            }}
                            onSelect={(range) => {
                              if (range?.from && range?.to) {
                                setDateRange({ from: range.from, to: range.to });
                              }
                            }}
                            numberOfMonths={2}
                            className="bg-white text-[#0A2540]"
                          />
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
                
                <div>
                  <Label className="mb-1 block text-sm">View Mode</Label>
                  <div className="flex space-x-1">
                    <Button
                      variant={viewMode === ViewMode.Grid ? "default" : "outline"}
                      size="icon"
                      className={cn(
                        viewMode !== ViewMode.Grid && "border-gray-200 text-[#0A2540] hover:bg-white",
                        viewMode === ViewMode.Grid && "bg-[#0A2540] hover:bg-[#081c30]"
                      )}
                      onClick={() => setViewMode(ViewMode.Grid)}
                    >
                      <Grid className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === ViewMode.List ? "default" : "outline"}
                      size="icon"
                      className={cn(
                        viewMode !== ViewMode.List && "border-gray-200 text-[#0A2540] hover:bg-white",
                        viewMode === ViewMode.List && "bg-[#0A2540] hover:bg-[#081c30]"
                      )}
                      onClick={() => setViewMode(ViewMode.List)}
                    >
                      <List className="h-4 w-4" />
                    </Button>
                    <Button
                      variant={viewMode === ViewMode.Calendar ? "default" : "outline"}
                      size="icon"
                      className={cn(
                        viewMode !== ViewMode.Calendar && "border-gray-200 text-[#0A2540] hover:bg-white",
                        viewMode === ViewMode.Calendar && "bg-[#0A2540] hover:bg-[#081c30]"
                      )}
                      onClick={() => setViewMode(ViewMode.Calendar)}
                    >
                      <Calendar className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Bookings View */}
            <div>
              {viewMode === ViewMode.List && renderListView()}
              {viewMode === ViewMode.Grid && renderGridView()}
              {viewMode === ViewMode.Calendar && renderCalendarView()}
            </div>
            
            {/* Dialogs */}
            <BookingDetailsDialog />
            <RescheduleDialog />
            
            {/* Import and use our separate NewBookingDialog component */}
            <NewBookingDialogComponent 
              open={isNewBookingOpen}
              onOpenChange={setIsNewBookingOpen}
            />
          </>
        )}
      </div>
    </div>
  );
};

// New Booking Dialog Component
const NewBookingDialog = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { isNewBookingOpen, setIsNewBookingOpen } = React.useContext(BookingContext);
  
  // Create a new form instance for the dialog
  const newBookingForm = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: undefined,
      timeSlot: "",
      service: "",
      clientId: undefined,
      location: "",
      priority: "normal",
      name: "",
      email: "",
      notes: "",
      isRescheduling: false,
    },
  });
  
  // Query available services and clients
  const { data: services = [] } = useQuery<Service[], Error>({
    queryKey: ['/api/services'],
  });
  
  const { data: clients = [] } = useQuery<any[], Error>({
    queryKey: ['/api/clients'],
  });
  
  // Get available time slots based on selected date and service
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const selectedDate = newBookingForm.watch("date");
  const selectedService = newBookingForm.watch("service");
  
  useEffect(() => {
    if (selectedDate && selectedService) {
      // Generate time slots (this would normally come from an API)
      const slots = [];
      const service = services.find(s => s.id === selectedService);
      const duration = service?.duration || 60;
      
      // Generate slots from 9am to 5pm
      const startTime = 9;
      const endTime = 17;
      
      for (let hour = startTime; hour < endTime; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          // Skip if the slot doesn't fit in the day
          if (hour === endTime - 1 && minute + duration > 60) continue;
          
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push({
            id: time,
            time,
            available: Math.random() > 0.3, // Randomly mark some as unavailable
          });
        }
      }
      
      setTimeSlots(slots);
    }
  }, [selectedDate, selectedService, services]);
  
  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create booking');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      setIsNewBookingOpen(false);
      toast({
        title: "Booking Created",
        description: "Your booking has been successfully created.",
        variant: "default",
      });
      newBookingForm.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create booking: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (data: BookingFormValues) => {
    createBookingMutation.mutate(data);
  };
  
  return (
    <Dialog open={isNewBookingOpen} onOpenChange={setIsNewBookingOpen}>
      <DialogContent className="bg-white border-gray-200 text-[#0A2540] sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Booking</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new booking
          </DialogDescription>
        </DialogHeader>
        
        <Form {...newBookingForm}>
          <form onSubmit={newBookingForm.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Client selection */}
            <FormField
              control={newBookingForm.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Service selection */}
            <FormField
              control={newBookingForm.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} ({service.duration} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Location */}
            <FormField
              control={newBookingForm.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} className="border-gray-300" placeholder="Enter meeting location" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Date selection */}
            <FormField
              control={newBookingForm.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal border-gray-300",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Select a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white" align="start">
                      <CalendarComponent
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Time slot selection */}
            {selectedDate && selectedService && (
              <FormField
                control={newBookingForm.control}
                name="timeSlot"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Time Slot</FormLabel>
                    <div className="grid grid-cols-3 gap-2">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot.id}
                          type="button"
                          onClick={() => field.onChange(slot.id)}
                          variant={field.value === slot.id ? "default" : "outline"}
                          disabled={!slot.available}
                          className={cn(
                            "h-10",
                            field.value === slot.id ? "bg-[#0A2540] text-white" : "border-gray-300",
                            !slot.available && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Priority selection */}
            <FormField
              control={newBookingForm.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      onClick={() => field.onChange("normal")}
                      variant={field.value === "normal" ? "default" : "outline"}
                      className={cn(
                        field.value === "normal" ? "bg-[#0A2540] text-white" : "border-gray-300"
                      )}
                    >
                      Normal
                    </Button>
                    <Button
                      type="button"
                      onClick={() => field.onChange("emergency")}
                      variant={field.value === "emergency" ? "default" : "outline"}
                      className={cn(
                        field.value === "emergency" ? "bg-red-600 text-white hover:bg-red-700" : "border-gray-300"
                      )}
                    >
                      Emergency
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Notes */}
            <FormField
              control={newBookingForm.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="border-gray-300 resize-none" 
                      placeholder="Add any additional details here..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        
        <DialogFooter className="space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() => setIsNewBookingOpen(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={newBookingForm.handleSubmit(handleSubmit)}
            className="bg-[#0A2540] hover:bg-[#081c30]"
            disabled={createBookingMutation.isPending}
          >
            {createBookingMutation.isPending ? "Creating..." : "Create Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

export default BookingsTab;