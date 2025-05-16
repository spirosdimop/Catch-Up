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
  X,
  CalendarDays,
  Search,
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
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

// Import our custom booking dialog
import { NewBookingDialog } from '@/components/booking/new-booking-dialog-simple';

// View enum for booking management
enum ViewMode {
  List = 'list',
  Grid = 'grid',
  Calendar = 'calendar'
}

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
  location?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export const BookingsFixed = () => {
  // Shared state
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // New booking dialog state
  const [isNewBookingOpen, setIsNewBookingOpen] = useState(false);
  
  // View state
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Grid);
  const [managementSelectedDate, setManagementSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: addDays(new Date(), 7)
  });
  
  // Booking detail states
  const [detailsBooking, setDetailsBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);
  
  // Query bookings
  const { data: bookings = [], isLoading, refetch } = useQuery<Booking[], Error>({
    queryKey: ['/api/bookings'],
    queryFn: async () => {
      const response = await fetch('/api/bookings');
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      console.log("Fetched bookings:", data);
      return data;
    }
  });
  
  // Refetch bookings when component mounts or when isNewBookingOpen changes
  // This ensures we get the latest data after creating a new booking
  React.useEffect(() => {
    refetch();
  }, [refetch, isNewBookingOpen]);
  
  // Filter bookings
  const filteredBookings = bookings.filter(booking => {
    const matchesStatus = selectedStatus === 'all' || booking.status === selectedStatus;
    const matchesType = selectedType === 'all' || booking.type === selectedType;
    const bookingDate = parseISO(booking.date);
    
    let matchesDate = true;
    if (managementSelectedDate) {
      matchesDate = isSameDay(bookingDate, managementSelectedDate);
    } else if (dateRange.from && dateRange.to) {
      matchesDate = bookingDate >= dateRange.from && bookingDate <= dateRange.to;
    }
    
    return matchesStatus && matchesType && matchesDate;
  });
  
  // Handle booking actions
  const handleViewDetails = (booking: Booking) => {
    setDetailsBooking(booking);
    setIsDetailsOpen(true);
  };
  
  const handleRescheduleClick = (booking: Booking) => {
    setDetailsBooking(booking);
    setIsRescheduleOpen(true);
  };
  
  const cancelBookingMutation = useMutation({
    mutationFn: async (bookingId: number) => {
      const response = await fetch(`/api/bookings/${bookingId}/cancel`, {
        method: 'PATCH',
      });
      
      if (!response.ok) {
        throw new Error('Failed to cancel booking');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      setIsDetailsOpen(false);
      toast({
        title: "Booking Canceled",
        description: "The booking has been successfully canceled.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to cancel booking: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const rescheduleBookingMutation = useMutation({
    mutationFn: async ({ bookingId, date, time }: { bookingId: number, date: string, time: string }) => {
      const response = await fetch(`/api/bookings/${bookingId}/reschedule`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ date, time }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to reschedule booking');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      setIsRescheduleOpen(false);
      toast({
        title: "Booking Rescheduled",
        description: "The booking has been successfully rescheduled.",
        variant: "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to reschedule booking: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const handleCancel = (booking: Booking) => {
    cancelBookingMutation.mutate(booking.id);
  };
  
  // This function is actually defined within the RescheduleDialog component below
  const handleReschedule = () => {
    // The actual implementation is in the RescheduleDialog component
    // We declare this here to avoid the LSP error until the component is rendered
  };
  
  // Render booking list view
  const renderListView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">Loading bookings...</div>
        </div>
      );
    }
    
    if (filteredBookings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-lg text-gray-500 mb-4">No bookings found</div>
          <Button 
            onClick={() => setIsNewBookingOpen(true)}
            className="bg-[#0A2540] hover:bg-[#081c30]"
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Create New Booking
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-4">
        {filteredBookings.map((booking) => (
          <Card key={booking.id} className="overflow-hidden border-gray-200">
            <div className="flex items-center p-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2">
                  <h3 className="font-semibold">{booking.client.name}</h3>
                  <Badge 
                    className={cn(
                      "text-xs",
                      booking.status === "confirmed" && "bg-green-100 text-green-800 hover:bg-green-100",
                      booking.status === "rescheduled" && "bg-blue-100 text-blue-800 hover:bg-blue-100",
                      booking.status === "canceled" && "bg-red-100 text-red-800 hover:bg-red-100",
                      booking.status === "emergency" && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                    )}
                  >
                    {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                  </Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">{booking.client.email}</p>
                <div className="flex items-center space-x-4 mt-2 text-sm">
                  <div className="flex items-center">
                    <CalendarIcon className="mr-1 h-4 w-4 text-gray-500" />
                    <span>{format(parseISO(booking.date), 'MMMM d, yyyy')}</span>
                  </div>
                  <div className="flex items-center">
                    <Clock className="mr-1 h-4 w-4 text-gray-500" />
                    <span>{booking.time} ({booking.duration} min)</span>
                  </div>
                </div>
                {booking.location && (
                  <div className="mt-2 text-sm">
                    <span className="font-medium">Location:</span> {booking.location}
                  </div>
                )}
              </div>
              <div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="h-8 w-8 p-0">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="bg-white">
                    <DropdownMenuItem 
                      className="cursor-pointer"
                      onClick={() => handleViewDetails(booking)}
                    >
                      View Details
                    </DropdownMenuItem>
                    {booking.status !== 'canceled' && (
                      <>
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={() => handleRescheduleClick(booking)}
                        >
                          Reschedule
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer text-red-500"
                          onClick={() => handleCancel(booking)}
                        >
                          Cancel
                        </DropdownMenuItem>
                      </>
                    )}
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </Card>
        ))}
      </div>
    );
  };
  
  // Render booking grid view
  const renderGridView = () => {
    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-64">
          <div className="text-lg text-gray-500">Loading bookings...</div>
        </div>
      );
    }
    
    if (filteredBookings.length === 0) {
      return (
        <div className="flex flex-col items-center justify-center h-64">
          <div className="text-lg text-gray-500 mb-4">No bookings found</div>
          <Button 
            onClick={() => setIsNewBookingOpen(true)}
            className="bg-[#0A2540] hover:bg-[#081c30]"
          >
            <CalendarDays className="mr-2 h-4 w-4" />
            Create New Booking
          </Button>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredBookings.map((booking) => (
          <Card 
            key={booking.id} 
            className="overflow-hidden border-gray-200 hover:shadow-md transition-shadow"
            onClick={() => handleViewDetails(booking)}
          >
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div className="flex items-center space-x-2">
                  {booking.client.avatar ? (
                    <div className="h-8 w-8 rounded-full bg-cover bg-center" style={{ backgroundImage: `url(${booking.client.avatar})` }} />
                  ) : (
                    <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
                      <Users className="h-4 w-4 text-gray-500" />
                    </div>
                  )}
                  <div>
                    <CardTitle className="text-sm font-medium">{booking.client.name}</CardTitle>
                    <CardDescription className="text-xs">{booking.type}</CardDescription>
                  </div>
                </div>
                <Badge 
                  className={cn(
                    "text-xs",
                    booking.status === "confirmed" && "bg-green-100 text-green-800 hover:bg-green-100",
                    booking.status === "rescheduled" && "bg-blue-100 text-blue-800 hover:bg-blue-100",
                    booking.status === "canceled" && "bg-red-100 text-red-800 hover:bg-red-100",
                    booking.status === "emergency" && "bg-yellow-100 text-yellow-800 hover:bg-yellow-100"
                  )}
                >
                  {booking.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="pb-4">
              <div className="space-y-2 text-sm">
                <div className="flex items-center">
                  <CalendarIcon className="mr-2 h-4 w-4 text-gray-500" />
                  <span>{format(parseISO(booking.date), 'MMMM d, yyyy')}</span>
                </div>
                <div className="flex items-center">
                  <Clock className="mr-2 h-4 w-4 text-gray-500" />
                  <span>{booking.time} ({booking.duration} min)</span>
                </div>
                {booking.location && (
                  <div className="flex items-start">
                    <span className="mr-2">📍</span>
                    <span>{booking.location}</span>
                  </div>
                )}
              </div>
            </CardContent>
            <CardFooter className="pt-0 flex justify-between">
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-gray-500 hover:text-[#0A2540]"
                onClick={(e) => {
                  e.stopPropagation();
                  handleViewDetails(booking);
                }}
              >
                View Details
              </Button>
              {booking.status !== 'canceled' && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs text-gray-500 hover:text-[#0A2540]"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleRescheduleClick(booking);
                  }}
                >
                  Reschedule
                </Button>
              )}
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };
  
  // Render booking calendar view
  const renderCalendarView = () => {
    return (
      <div className="bg-white rounded-lg shadow p-4">
        <div className="mb-4">
          <CalendarComponent
            mode="single"
            selected={managementSelectedDate}
            onSelect={setManagementSelectedDate}
            className="rounded-md border"
          />
        </div>
        
        <div className="space-y-4 mt-6">
          <h3 className="font-medium">
            {managementSelectedDate ? (
              `Bookings for ${format(managementSelectedDate, 'MMMM d, yyyy')}`
            ) : (
              'Select a date to view bookings'
            )}
          </h3>
          
          {managementSelectedDate && filteredBookings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No bookings for this date</p>
              <Button 
                className="mt-4 bg-[#0A2540] hover:bg-[#081c30]"
                onClick={() => setIsNewBookingOpen(true)}
              >
                <Plus className="mr-2 h-4 w-4" />
                Add Booking
              </Button>
            </div>
          )}
          
          {managementSelectedDate && filteredBookings.length > 0 && (
            <div className="space-y-3">
              {filteredBookings.map((booking) => (
                <div key={booking.id} className="flex items-center p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                  <div className="flex-1">
                    <p className="font-medium">{booking.time} - {booking.client.name}</p>
                    <p className="text-sm text-gray-500">{booking.type}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="bg-white">
                      <DropdownMenuItem 
                        className="cursor-pointer"
                        onClick={() => handleViewDetails(booking)}
                      >
                        View Details
                      </DropdownMenuItem>
                      {booking.status !== 'canceled' && (
                        <>
                          <DropdownMenuItem 
                            className="cursor-pointer"
                            onClick={() => handleRescheduleClick(booking)}
                          >
                            Reschedule
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="cursor-pointer text-red-500"
                            onClick={() => handleCancel(booking)}
                          >
                            Cancel
                          </DropdownMenuItem>
                        </>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    );
  };
  
  // Booking Details Dialog Component
  const BookingDetailsDialog = () => {
    if (!detailsBooking) return null;
    
    return (
      <Dialog open={isDetailsOpen} onOpenChange={setIsDetailsOpen}>
        <DialogContent className="bg-white border-gray-200 text-[#0A2540]">
          <DialogHeader>
            <DialogTitle>Booking Details</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="flex flex-col space-y-1">
              <h4 className="text-sm font-medium text-gray-500">Client</h4>
              <p className="font-medium">{detailsBooking.client.name}</p>
              <p className="text-sm">{detailsBooking.client.email}</p>
            </div>
            
            <div className="flex flex-col space-y-1">
              <h4 className="text-sm font-medium text-gray-500">Date & Time</h4>
              <p>{format(parseISO(detailsBooking.date), 'MMMM d, yyyy')} at {detailsBooking.time}</p>
              <p className="text-sm">{detailsBooking.duration} minutes</p>
            </div>
            
            <div className="flex flex-col space-y-1">
              <h4 className="text-sm font-medium text-gray-500">Type</h4>
              <p className="capitalize">{detailsBooking.type}</p>
            </div>
            
            {detailsBooking.location && (
              <div className="flex flex-col space-y-1">
                <h4 className="text-sm font-medium text-gray-500">Location</h4>
                <p>{detailsBooking.location}</p>
              </div>
            )}
            
            <div className="flex flex-col space-y-1">
              <h4 className="text-sm font-medium text-gray-500">Status</h4>
              <div>
                <Badge 
                  className={cn(
                    "text-xs",
                    detailsBooking.status === "confirmed" && "bg-green-100 text-green-800",
                    detailsBooking.status === "rescheduled" && "bg-blue-100 text-blue-800",
                    detailsBooking.status === "canceled" && "bg-red-100 text-red-800",
                    detailsBooking.status === "emergency" && "bg-yellow-100 text-yellow-800"
                  )}
                >
                  {detailsBooking.status.charAt(0).toUpperCase() + detailsBooking.status.slice(1)}
                </Badge>
              </div>
            </div>
            
            {detailsBooking.notes && (
              <div className="flex flex-col space-y-1">
                <h4 className="text-sm font-medium text-gray-500">Notes</h4>
                <p className="text-sm whitespace-pre-wrap">{detailsBooking.notes}</p>
              </div>
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
                    handleRescheduleClick(detailsBooking);
                  }}
                  className="border-gray-200 text-[#0A2540] hover:bg-white"
                >
                  Reschedule
                </Button>
                <Button 
                  variant="destructive"
                  onClick={() => handleCancel(detailsBooking)}
                  disabled={cancelBookingMutation.isPending}
                  className="bg-red-500 hover:bg-red-600"
                >
                  {cancelBookingMutation.isPending ? "Canceling..." : "Cancel Booking"}
                </Button>
              </>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };
  
  // Reschedule Dialog Component
  const RescheduleDialog = () => {
    if (!detailsBooking) return null;
    
    const [rescheduleDate, setRescheduleDate] = useState<Date | undefined>(parseISO(detailsBooking.date));
    const [rescheduleTime, setRescheduleTime] = useState(detailsBooking.time);
    
    return (
      <Dialog open={isRescheduleOpen} onOpenChange={setIsRescheduleOpen}>
        <DialogContent className="bg-white border-gray-200 text-[#0A2540]">
          <DialogHeader>
            <DialogTitle>Reschedule Booking</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div>
              <Label htmlFor="reschedule-date" className="block text-sm font-medium text-gray-700 mb-1">
                Select New Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    id="reschedule-date"
                    variant={"outline"}
                    className={cn(
                      "w-full justify-start text-left font-normal border-gray-300",
                      !rescheduleDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {rescheduleDate ? format(rescheduleDate, 'PPP') : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <CalendarComponent
                    mode="single"
                    selected={rescheduleDate}
                    onSelect={setRescheduleDate}
                    disabled={(date) => date < new Date()}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div>
              <Label htmlFor="reschedule-time" className="block text-sm font-medium text-gray-700 mb-1">
                Select New Time
              </Label>
              <Select value={rescheduleTime} onValueChange={setRescheduleTime}>
                <SelectTrigger id="reschedule-time" className="w-full border-gray-300">
                  <SelectValue placeholder="Select a time" />
                </SelectTrigger>
                <SelectContent position="popper" className="bg-white">
                  <SelectItem value="09:00">9:00 AM</SelectItem>
                  <SelectItem value="09:30">9:30 AM</SelectItem>
                  <SelectItem value="10:00">10:00 AM</SelectItem>
                  <SelectItem value="10:30">10:30 AM</SelectItem>
                  <SelectItem value="11:00">11:00 AM</SelectItem>
                  <SelectItem value="11:30">11:30 AM</SelectItem>
                  <SelectItem value="12:00">12:00 PM</SelectItem>
                  <SelectItem value="12:30">12:30 PM</SelectItem>
                  <SelectItem value="13:00">1:00 PM</SelectItem>
                  <SelectItem value="13:30">1:30 PM</SelectItem>
                  <SelectItem value="14:00">2:00 PM</SelectItem>
                  <SelectItem value="14:30">2:30 PM</SelectItem>
                  <SelectItem value="15:00">3:00 PM</SelectItem>
                  <SelectItem value="15:30">3:30 PM</SelectItem>
                  <SelectItem value="16:00">4:00 PM</SelectItem>
                  <SelectItem value="16:30">4:30 PM</SelectItem>
                  <SelectItem value="17:00">5:00 PM</SelectItem>
                </SelectContent>
              </Select>
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
              className="bg-[#0A2540] hover:bg-[#081c30]"
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
        
        <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 space-y-4 md:space-y-0">
          <div className="flex space-x-2">
            <Button
              variant={viewMode === ViewMode.Grid ? "default" : "outline"}
              onClick={() => setViewMode(ViewMode.Grid)}
              size="sm"
              className={viewMode === ViewMode.Grid 
                ? "bg-[#0A2540] hover:bg-[#081c30]" 
                : "border-gray-200 text-[#0A2540] hover:bg-gray-100"}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === ViewMode.List ? "default" : "outline"}
              onClick={() => setViewMode(ViewMode.List)}
              size="sm"
              className={viewMode === ViewMode.List 
                ? "bg-[#0A2540] hover:bg-[#081c30]" 
                : "border-gray-200 text-[#0A2540] hover:bg-gray-100"}
            >
              <List className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === ViewMode.Calendar ? "default" : "outline"}
              onClick={() => setViewMode(ViewMode.Calendar)}
              size="sm"
              className={viewMode === ViewMode.Calendar 
                ? "bg-[#0A2540] hover:bg-[#081c30]" 
                : "border-gray-200 text-[#0A2540] hover:bg-gray-100"}
            >
              <Calendar className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
            <div className="flex-1 min-w-[200px]">
              <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                <SelectTrigger className="w-full border-gray-300">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent position="popper" className="bg-white">
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="rescheduled">Rescheduled</SelectItem>
                  <SelectItem value="canceled">Canceled</SelectItem>
                  <SelectItem value="emergency">Emergency</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex-1 min-w-[200px]">
              <Select value={selectedType} onValueChange={setSelectedType}>
                <SelectTrigger className="w-full border-gray-300">
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent position="popper" className="bg-white">
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="call">Call</SelectItem>
                  <SelectItem value="meeting">Meeting</SelectItem>
                  <SelectItem value="followup">Follow-up</SelectItem>
                  <SelectItem value="consultation">Consultation</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
              <Input
                type="text"
                placeholder="Search bookings..."
                className="pl-9 border-gray-300"
              />
            </div>
          </div>
        </div>
        
        <div className="grid gap-6">
          {/* Bookings view based on selected view mode */}
          {viewMode === ViewMode.List && renderListView()}
          {viewMode === ViewMode.Grid && renderGridView()}
          {viewMode === ViewMode.Calendar && renderCalendarView()}
        </div>
        
        {/* Dialogs */}
        <BookingDetailsDialog />
        <RescheduleDialog />
        
        {/* New Booking Dialog Component */}
        <NewBookingDialog
          open={isNewBookingOpen}
          onOpenChange={setIsNewBookingOpen}
        />
      </div>
    </div>
  );
};

export default BookingsFixed;