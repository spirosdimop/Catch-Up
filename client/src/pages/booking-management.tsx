import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays, subDays, isSameDay, parseISO } from 'date-fns';
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
  X
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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

// Booking interface
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

// View enum
enum ViewMode {
  List = 'list',
  Grid = 'grid',
  Calendar = 'calendar'
}

const BookingManagement = () => {
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Grid);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: addDays(new Date(), 30)
  });
  const [showCalendar, setShowCalendar] = useState(false);
  const [detailsBooking, setDetailsBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
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
  
  // Calculate booking status distribution
  const statusCounts = filteredBookings.reduce((acc, booking) => {
    acc[booking.status] = (acc[booking.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);
  
  const totalBookings = filteredBookings.length;
  
  // Render booking list view
  const renderListView = () => {
    if (isLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-pulse h-6 w-24 bg-gray-200 rounded"></div>
        </div>
      );
    }
    
    if (filteredBookings.length === 0) {
      return (
        <div className="text-center py-12 text-gray-400">
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
                      <Badge variant="outline" className="bg-gray-100 text-[#0A2540]">
                        {getTypeLabel(booking.type)}
                      </Badge>
                    </div>
                  </div>
                </div>
                
                <div className="flex items-center space-x-4">
                  <div className="text-right">
                    <div className="flex items-center justify-end space-x-1 text-gray-600">
                      <CalendarIcon className="h-4 w-4" />
                      <span>{format(parseISO(booking.date), 'MMM d, yyyy')}</span>
                    </div>
                    <div className="flex items-center justify-end space-x-1 text-gray-600 mt-1">
                      <Clock className="h-4 w-4" />
                      <span>{booking.time} ({booking.duration} min)</span>
                    </div>
                  </div>
                  
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="text-gray-500 hover:text-[#0A2540] hover:bg-gray-100">
                        <MoreHorizontal className="h-5 w-5" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56 bg-white border-gray-200 text-[#0A2540]">
                      <DropdownMenuLabel>Booking Actions</DropdownMenuLabel>
                      <DropdownMenuSeparator className="bg-gray-200" />
                      <DropdownMenuItem 
                        className="hover:bg-gray-100 cursor-pointer"
                        onClick={() => handleViewDetails(booking)}
                      >
                        View Details
                      </DropdownMenuItem>
                      {booking.status !== 'canceled' && (
                        <>
                          <DropdownMenuItem 
                            className="hover:bg-gray-100 cursor-pointer"
                            onClick={() => handleOpenReschedule(booking)}
                          >
                            Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-500 hover:text-red-600 hover:bg-gray-100 cursor-pointer"
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
                <div className="mt-4 pl-4 border-l-2 border-gray-200 text-gray-600 text-sm">
                  {booking.notes}
                </div>
              )}
              
              <div className="flex justify-end mt-4 space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  className="border-gray-200 text-[#0A2540] hover:bg-gray-100"
                  onClick={() => handleViewDetails(booking)}
                >
                  View Details
                </Button>
                {booking.status !== 'canceled' && (
                  <>
                    <Button 
                      variant="outline" 
                      size="sm"
                      className="border-gray-200 text-[#0A2540] hover:bg-gray-100"
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
          <div className="animate-pulse h-6 w-24 bg-gray-200 rounded"></div>
        </div>
      );
    }
    
    if (filteredBookings.length === 0) {
      return (
        <div className="text-center py-12 text-gray-400">
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
                <CardDescription className="text-gray-400">{booking.client.email}</CardDescription>
              </div>
              <Badge className={getStatusColor(booking.status)} variant="secondary">
                {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
              </Badge>
            </CardHeader>
            <CardContent className="pt-2">
              <div className="flex flex-col space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Date:</span>
                  <span className="font-medium">{format(parseISO(booking.date), 'MMM d, yyyy')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span className="font-medium">{booking.time} ({booking.duration} min)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Type:</span>
                  <Badge variant="outline" className="bg-gray-100 text-[#0A2540]">
                    {getTypeLabel(booking.type)}
                  </Badge>
                </div>
                {booking.notes && (
                  <div className="mt-2 text-gray-600 text-xs border-t border-gray-200 pt-2">
                    <span className="text-gray-400 block mb-1">Notes:</span>
                    <p className="line-clamp-2">{booking.notes}</p>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="flex justify-between pt-0">
              <Button 
                variant="ghost" 
                size="sm"
                className="text-[#0A2540] hover:bg-gray-100"
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
                      className="text-[#0A2540] hover:bg-gray-100"
                    >
                      Actions
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-40 bg-white border-gray-200 text-[#0A2540]">
                    <DropdownMenuItem 
                      className="hover:bg-gray-100 cursor-pointer"
                      onClick={() => handleOpenReschedule(booking)}
                    >
                      Reschedule
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      className="text-red-400 hover:text-red-300 hover:bg-gray-100 cursor-pointer"
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
            {format(selectedDate || today, 'MMMM yyyy')}
          </h3>
          <div className="flex space-x-2">
            <Button 
              variant="outline" 
              size="icon"
              className="border-gray-200 text-[#0A2540] hover:bg-gray-100"
              onClick={() => setSelectedDate(subDays(selectedDate || today, 30))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button 
              variant="outline" 
              size="icon"
              className="border-gray-200 text-[#0A2540] hover:bg-gray-100"
              onClick={() => setSelectedDate(addDays(selectedDate || today, 30))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        <CalendarComponent
          mode="single"
          selected={selectedDate}
          onSelect={setSelectedDate}
          className="bg-[#173561] text-[#0A2540] border-gray-200 rounded-lg"
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
                  )}
                </div>
              );
            }
          }}
        />
        
        {selectedDate && (
          <div className="mt-6">
            <h3 className="font-medium mb-3">
              Bookings on {format(selectedDate, 'MMMM d, yyyy')}
            </h3>
            
            {bookingsByDate[format(selectedDate, 'yyyy-MM-dd')] ? (
              <div className="space-y-3">
                {bookingsByDate[format(selectedDate, 'yyyy-MM-dd')].map((booking) => (
                  <Card key={booking.id} className="bg-white border-gray-200">
                    <CardContent className="p-3">
                      <div className="flex justify-between items-center">
                        <div>
                          <span className="font-medium">{booking.client.name}</span>
                          <div className="flex items-center text-sm text-gray-400 mt-1">
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
                            className="text-[#0A2540] hover:bg-[#173561]"
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
              <div className="text-center py-6 text-gray-400">
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
                <p className="text-gray-400">{detailsBooking.client.email}</p>
              </div>
              <Badge className={getStatusColor(detailsBooking.status)}>
                {detailsBooking.status.charAt(0).toUpperCase() + detailsBooking.status.slice(1)}
              </Badge>
            </div>
            
            <Separator className="bg-[#2a4d7d]" />
            
            <div className="grid grid-cols-2 gap-y-3">
              <div className="text-gray-400">Date</div>
              <div>{format(parseISO(detailsBooking.date), 'MMMM d, yyyy')}</div>
              
              <div className="text-gray-400">Time</div>
              <div>{detailsBooking.time}</div>
              
              <div className="text-gray-400">Duration</div>
              <div>{detailsBooking.duration} minutes</div>
              
              <div className="text-gray-400">Type</div>
              <div>{getTypeLabel(detailsBooking.type)}</div>
              
              <div className="text-gray-400">Created</div>
              <div>{format(parseISO(detailsBooking.createdAt), 'MMM d, yyyy h:mm a')}</div>
              
              {detailsBooking.status === 'rescheduled' && (
                <>
                  <div className="text-gray-400">Updated</div>
                  <div>{format(parseISO(detailsBooking.updatedAt), 'MMM d, yyyy h:mm a')}</div>
                </>
              )}
            </div>
            
            {detailsBooking.notes && (
              <>
                <Separator className="bg-[#2a4d7d]" />
                <div>
                  <h4 className="text-sm font-medium mb-2 text-gray-400">Notes</h4>
                  <p className="text-sm">{detailsBooking.notes}</p>
                </div>
              </>
            )}
          </div>
          <DialogFooter className="space-x-2">
            <Button 
              variant="outline" 
              onClick={() => setIsDetailsOpen(false)}
              className="border-gray-200 text-[#0A2540] hover:bg-gray-100"
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
                  className="border-gray-200 text-[#0A2540] hover:bg-gray-100"
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
              <p className="text-sm text-gray-400 mb-1">Current booking</p>
              <p className="font-medium">
                {detailsBooking.client.name} - {getTypeLabel(detailsBooking.type)}
              </p>
              <p className="text-sm mt-1">
                {format(parseISO(detailsBooking.date), 'MMMM d, yyyy')} at {detailsBooking.time}
              </p>
            </div>
            
            <Separator className="bg-[#2a4d7d]" />
            
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
                        !rescheduleDate && "text-gray-400"
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
                      className="bg-[#173561] text-[#0A2540]"
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
              className="border-gray-200 text-[#0A2540] hover:bg-gray-100"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleReschedule}
              className="bg-[#1d4ed8] hover:bg-blue-600 text-[#0A2540]"
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
      <div className="max-w-[1400px] mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
          <div>
            <h1 className="text-2xl font-bold">Booking Management</h1>
            <p className="text-gray-400 mt-1">Manage and track your appointments</p>
          </div>
          
          <Button
            className="bg-[#1d4ed8] hover:bg-blue-600 text-[#0A2540]"
            onClick={() => window.location.href = '/bookings'}
          >
            <Plus className="mr-2 h-4 w-4" />
            New Booking
          </Button>
        </div>
        
        {/* Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Total Bookings</p>
                <p className="text-2xl font-bold mt-1 text-[#0A2540]">{totalBookings}</p>
              </div>
              <Calendar className="h-8 w-8 text-[#0A2540] opacity-75" />
            </CardContent>
          </Card>
          
          <Card className="bg-white border-gray-200 shadow-sm">
            <CardContent className="p-4 flex justify-between items-center">
              <div>
                <p className="text-gray-500 text-sm">Confirmed</p>
                <p className="text-2xl font-bold mt-1 text-[#0A2540]">{statusCounts.confirmed || 0}</p>
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
                <p className="text-2xl font-bold mt-1 text-[#0A2540]">{statusCounts.rescheduled || 0}</p>
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
                <p className="text-2xl font-bold mt-1 text-[#0A2540]">{statusCounts.canceled || 0}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-red-500 opacity-75 flex items-center justify-center">
                <X className="h-5 w-5 text-[#0A2540]" />
              </div>
            </CardContent>
          </Card>
        </div>
        
        {/* Filter and View Controls */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6 shadow-sm">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
            <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
              <div>
                <Label htmlFor="filter-status" className="mb-1 block text-sm text-gray-600">Status</Label>
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
                <Label htmlFor="filter-type" className="mb-1 block text-sm text-gray-600">Type</Label>
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
                <Label htmlFor="date-range" className="mb-1 block text-sm text-gray-600">Date Range</Label>
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
              <Label className="mb-1 block text-sm text-gray-600">View Mode</Label>
              <div className="flex space-x-1">
                <Button
                  variant={viewMode === ViewMode.Grid ? "default" : "outline"}
                  size="icon"
                  className={cn(
                    viewMode !== ViewMode.Grid && "border-gray-200 text-[#0A2540] hover:bg-gray-50",
                    viewMode === ViewMode.Grid && "bg-[#0A2540] hover:bg-[#0A2540]/90"
                  )}
                  onClick={() => setViewMode(ViewMode.Grid)}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === ViewMode.List ? "default" : "outline"}
                  size="icon"
                  className={cn(
                    viewMode !== ViewMode.List && "border-gray-200 text-[#0A2540] hover:bg-gray-50",
                    viewMode === ViewMode.List && "bg-[#0A2540] hover:bg-[#0A2540]/90"
                  )}
                  onClick={() => setViewMode(ViewMode.List)}
                >
                  <List className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === ViewMode.Calendar ? "default" : "outline"}
                  size="icon"
                  className={cn(
                    viewMode !== ViewMode.Calendar && "border-gray-200 text-[#0A2540] hover:bg-gray-50",
                    viewMode === ViewMode.Calendar && "bg-[#0A2540] hover:bg-[#0A2540]/90"
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
      </div>
      
      {/* Dialogs */}
      <BookingDetailsDialog />
      <RescheduleDialog />
    </div>
  );
};

export default BookingManagement;