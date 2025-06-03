import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Check, 
  X, 
  Calendar, 
  Clock, 
  User, 
  Phone, 
  CalendarClock, 
  Plus, 
  Filter, 
  ChevronRight,
  BellRing,
  List,
  Grid3X3,
  ChevronLeft,
  Search
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getAllBookings, updateBooking, deleteBooking, addBooking, BookingRequest } from "@/lib/bookingStorage";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from "date-fns";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { useUser } from "@/lib/userContext";
import { formatTime, getTimeInputType, generateTimeOptions } from "@/lib/timeUtils";

export default function AppointmentsPage() {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'accepted' | 'declined' | 'all'>('pending');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'calendar'>('grid');
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const { user } = useUser();

  // Use React Query to fetch bookings directly from API
  const { 
    data: bookings = [], 
    isLoading, 
    isError, 
    refetch: refetchBookings 
  } = useQuery({
    queryKey: ['/api/bookings'],
    queryFn: async () => {
      try {
        const response = await fetch('/api/bookings');
        if (!response.ok) {
          throw new Error('Failed to fetch bookings');
        }
        const data = await response.json();
        console.log("Loaded bookings:", data);
        
        // Ensure IDs are strings for consistency
        return data.map((booking: any) => ({
          ...booking,
          id: booking.id.toString()
        }));
      } catch (error) {
        console.error("Error loading bookings:", error);
        throw error;
      }
    }
  });

  // Handle accepting a booking
  const handleAccept = async (bookingId: string | number) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: "confirmed" })
      });
      
      if (response.ok) {
        toast({
          title: "Booking Accepted",
          description: "The client will be notified about your response.",
        });
        refetchBookings();
      } else {
        throw new Error('Failed to update booking');
      }
    } catch (error) {
      console.error("Error accepting booking:", error);
      toast({
        title: "Error",
        description: "Failed to accept booking",
        variant: "destructive",
      });
    }
  };

  // Handle declining a booking
  const handleDecline = async (bookingId: string | number) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: "canceled" })
      });
      
      if (response.ok) {
        toast({
          title: "Booking Declined",
          description: "The client will be notified about your response.",
        });
        refetchBookings();
      } else {
        throw new Error('Failed to update booking');
      }
    } catch (error) {
      console.error("Error declining booking:", error);
      toast({
        title: "Error",
        description: "Failed to decline booking",
        variant: "destructive",
      });
    }
  };

  // Filter bookings based on selected tab and search query
  const filteredBookings = bookings.filter(booking => {
    // Filter by status
    let statusMatch = true;
    if (selectedTab !== 'all') {
      if (selectedTab === 'pending') statusMatch = booking.status === 'pending';
      else if (selectedTab === 'accepted') statusMatch = booking.status === 'confirmed' || booking.status === 'accepted';
      else if (selectedTab === 'declined') statusMatch = booking.status === 'canceled' || booking.status === 'declined';
      else statusMatch = booking.status === selectedTab;
    }

    // Filter by search query
    let searchMatch = true;
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      searchMatch = 
        (booking.clientName && booking.clientName.toLowerCase().includes(query)) ||
        (booking.clientPhone && booking.clientPhone.toLowerCase().includes(query)) ||
        (booking.serviceName && booking.serviceName.toLowerCase().includes(query)) ||
        (booking.location && booking.location.toLowerCase().includes(query)) ||
        (booking.notes && booking.notes.toLowerCase().includes(query)) ||
        booking.date.includes(query) ||
        booking.time.includes(query);
    }

    return statusMatch && searchMatch;
  });

  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    }).format(date);
  };

  // Calendar helper functions
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getBookingsForDate = (date: Date) => {
    return filteredBookings.filter(booking => {
      const bookingDate = new Date(booking.date);
      return isSameDay(bookingDate, date);
    });
  };

  const renderCalendarView = () => {
    const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} />
              Calendar View
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
              >
                <ChevronLeft size={16} />
              </Button>
              <span className="text-lg font-medium min-w-[140px] text-center">
                {format(currentDate, 'MMMM yyyy')}
              </span>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
              >
                <ChevronRight size={16} />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-1 mb-4">
            {weekDays.map(day => (
              <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
                {day}
              </div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {Array.from({ length: monthStart.getDay() }).map((_, index) => (
              <div key={`empty-${index}`} className="p-2 h-24"></div>
            ))}
            
            {calendarDays.map(day => {
              const dayBookings = getBookingsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isDayToday = isToday(day);
              
              return (
                <div
                  key={day.toISOString()}
                  className={`p-2 h-24 border border-gray-200 ${
                    !isCurrentMonth ? 'bg-gray-50 text-gray-400' : 'bg-white'
                  } ${isDayToday ? 'bg-blue-50 border-blue-300' : ''}`}
                >
                  <div className={`text-sm font-medium mb-1 ${isDayToday ? 'text-blue-600' : ''}`}>
                    {format(day, 'd')}
                  </div>
                  
                  <div className="space-y-1">
                    {dayBookings.slice(0, 2).map(booking => (
                      <div
                        key={booking.id}
                        className={`text-xs p-1 rounded truncate ${
                          booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          booking.status === 'confirmed' || booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                          'bg-red-100 text-red-800'
                        }`}
                        title={`${booking.clientName} - ${booking.time}`}
                      >
                        {booking.time} - {booking.clientName}
                      </div>
                    ))}
                    
                    {dayBookings.length > 2 && (
                      <div className="text-xs text-gray-500">
                        +{dayBookings.length - 2} more
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="container mx-auto py-8">
      {/* Main dashboard header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment Manager</h1>
          <p className="text-gray-600 mt-1">Manage your appointments and booking requests</p>
        </div>
        <div className="flex items-center space-x-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search appointments..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 w-64"
            />
          </div>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 border-gray-300"
            onClick={() => setViewMode('list')}
          >
            <List className={`h-4 w-4 ${viewMode === 'list' ? 'text-blue-600' : 'text-gray-500'}`} />
            List
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 border-gray-300"
            onClick={() => setViewMode('grid')}
          >
            <Grid3X3 className={`h-4 w-4 ${viewMode === 'grid' ? 'text-blue-600' : 'text-gray-500'}`} />
            Grid
          </Button>
          <Button 
            variant="outline" 
            size="sm"
            className="flex items-center gap-1 border-gray-300"
            onClick={() => setViewMode('calendar')}
          >
            <Calendar className={`h-4 w-4 ${viewMode === 'calendar' ? 'text-blue-600' : 'text-gray-500'}`} />
            Calendar
          </Button>
          <Button 
            className="bg-blue-600 hover:bg-blue-700" 
            size="sm"
            onClick={() => setShowCreateDialog(true)}
          >
            <Plus className="h-4 w-4 mr-1" /> 
            Create Booking
          </Button>
        </div>
      </div>
      
      {/* Booking Management Section */}
      <div className="mb-10 bg-white rounded-lg shadow-sm border border-gray-100">
        <CardHeader className="border-b border-gray-100 bg-gray-50 rounded-t-lg">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-semibold flex items-center">
                <BellRing className="h-5 w-5 mr-2 text-blue-600" />
                Booking Request Management
              </CardTitle>
              <CardDescription className="text-sm mt-1">
                New booking requests that need your attention
              </CardDescription>
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="border-gray-300"
              onClick={() => setShowFilter(!showFilter)}
            >
              <Filter className="h-4 w-4 mr-1" /> Filter
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-5">
          {/* Filter section */}
          {showFilter && (
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h3 className="text-sm font-medium mb-3">Filter Options</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Date Range</label>
                  <select className="w-full p-2 border rounded text-sm">
                    <option>All Dates</option>
                    <option>Today</option>
                    <option>This Week</option>
                    <option>This Month</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Service Type</label>
                  <select className="w-full p-2 border rounded text-sm">
                    <option>All Services</option>
                    {user?.services?.map((service, index) => (
                      <option key={index} value={service.name}>
                        {service.name}
                      </option>
                    ))}
                    {(!user?.services || user.services.length === 0) && (
                      <>
                        <option>Consultation</option>
                        <option>Meeting</option>
                        <option>Follow-up</option>
                      </>
                    )}
                  </select>
                </div>
                <div>
                  <label className="text-xs text-gray-600 mb-1 block">Priority</label>
                  <select className="w-full p-2 border rounded text-sm">
                    <option>All Priorities</option>
                    <option>High</option>
                    <option>Normal</option>
                    <option>Low</option>
                  </select>
                </div>
              </div>
            </div>
          )}
          
          {/* Status tabs */}
          <div className="flex flex-wrap space-x-2 mb-6 border-b border-gray-100 pb-4">
            <Button 
              variant={selectedTab === 'pending' ? "default" : "outline"}
              onClick={() => setSelectedTab('pending')}
              className="mb-2"
              size="sm"
            >
              <Badge className="bg-yellow-100 text-yellow-800 mr-2 border-none">
                {bookings.filter(b => b.status === 'pending').length}
              </Badge>
              Pending Requests
            </Button>
            <Button 
              variant={selectedTab === 'accepted' ? "default" : "outline"}
              onClick={() => setSelectedTab('accepted')}
              className="mb-2"
              size="sm"
            >
              <Badge className="bg-green-100 text-green-800 mr-2 border-none">
                {bookings.filter(b => b.status === 'accepted' || b.status === 'confirmed').length}
              </Badge>
              Accepted
            </Button>
            <Button 
              variant={selectedTab === 'declined' ? "default" : "outline"}
              onClick={() => setSelectedTab('declined')}
              className="mb-2"
              size="sm"
            >
              <Badge className="bg-red-100 text-red-800 mr-2 border-none">
                {bookings.filter(b => b.status === 'declined' || b.status === 'canceled').length}
              </Badge>
              Declined
            </Button>
            <Button 
              variant={selectedTab === 'all' ? "default" : "outline"}
              onClick={() => setSelectedTab('all')}
              className="mb-2"
              size="sm"
            >
              All Bookings
            </Button>
          </div>

          {/* Recent requests quick access */}
          <div className="mb-4">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Recent Requests</h3>
            <div className="space-y-3">
              {filteredBookings.slice(0, 3).map((booking) => (
                <div key={booking.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md hover:bg-gray-100">
                  <div className="flex items-center">
                    <div className="mr-3 h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                      <User className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">{booking.clientName || "Client"}</p>
                      <div className="flex items-center text-xs text-gray-500">
                        <Calendar className="h-3 w-3 mr-1" />
                        {booking.date} at {booking.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Badge className={`mr-3 ${
                      booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                      booking.status === 'accepted' || booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                    </Badge>
                    <ChevronRight className="h-4 w-4 text-gray-400" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-between items-center pt-3 border-t border-gray-100">
            <div className="text-sm text-gray-500">
              Showing {filteredBookings.length} of {bookings.length} bookings
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  localStorage.removeItem('app_booking_requests');
                  refetchBookings();
                  toast({
                    title: "Local Bookings Cleared",
                    description: "All locally stored booking requests have been cleared.",
                  });
                }}
              >
                Clear Local Bookings
              </Button>
              
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  // Add a sample booking for testing
                  try {
                    const testBooking = {
                      externalId: Date.now().toString(),
                      clientName: "Test Client",
                      clientPhone: "555-123-4567",
                      serviceName: "Test Service",
                      servicePrice: "$100",
                      date: "2025-05-30",
                      time: "10:00 AM",
                      status: "confirmed" as const,
                      professionalId: "1",
                      createdAt: new Date().toISOString(),
                      notes: "This is a test booking"
                    };
                    
                    await addBooking(testBooking);
                    refetchBookings();
                    
                    toast({
                      title: "Test Booking Added",
                      description: "A test booking has been added for demonstration.",
                    });
                  } catch (error) {
                    console.error("Error adding test booking:", error);
                    toast({
                      title: "Error",
                      description: "Failed to add test booking",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Add Test Booking
              </Button>
            </div>
          </div>
        </CardContent>
      </div>

      {/* All Bookings Section */}
      <div>
        {viewMode !== 'calendar' && (
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold">
              All {selectedTab !== 'all' ? selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1) : ''} Bookings
            </h2>
          </div>
        )}
        
        {viewMode === 'calendar' ? (
          renderCalendarView()
        ) : filteredBookings.length === 0 ? (
          <div className="bg-gray-50 p-8 text-center rounded-lg border border-gray-200">
            <CalendarClock className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-medium mb-2">No {selectedTab} appointments</h3>
            <p className="text-gray-500">
              {selectedTab === 'pending' 
                ? "You don't have any pending appointment requests." 
                : selectedTab === 'accepted' 
                  ? "You haven't accepted any appointments yet." 
                  : selectedTab === 'declined' 
                    ? "You haven't declined any appointments." 
                    : "You don't have any appointments."}
            </p>
          </div>
        ) : (
          <div className={viewMode === 'grid' ? "grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5" : "space-y-4"}>
            {filteredBookings.map((booking) => (
              <Card key={booking.id} className={`${viewMode === 'list' ? 'flex' : ''} shadow-sm hover:shadow transition-shadow duration-200`}>
                <div className={`${viewMode === 'list' ? 'flex-1 flex' : ''} p-5`}>
                  <div className={`${viewMode === 'list' ? 'flex-1' : ''}`}>
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-bold flex items-center">
                          <User className="w-4 h-4 mr-2 text-blue-600" />
                          {booking.clientName || "Client Name"}
                        </h3>
                        <p className="text-sm text-gray-500 flex items-center mt-1">
                          <Phone className="w-4 h-4 mr-2 text-gray-400" />
                          {booking.clientPhone || "Phone Number"}
                        </p>
                      </div>
                      <Badge className={`${
                        booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        booking.status === 'accepted' || booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                      </Badge>
                    </div>
                    
                    {booking.serviceName && (
                      <div className="mb-3 bg-gray-50 p-2 rounded">
                        <p className="font-medium">{booking.serviceName}</p>
                        {booking.servicePrice && (
                          <p className="text-sm text-gray-700">{booking.servicePrice}</p>
                        )}
                      </div>
                    )}
                    
                    <div className="mb-4">
                      <div className="flex items-center mb-1">
                        <Calendar className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">
                          {booking.date}
                        </span>
                      </div>
                      <div className="flex items-center">
                        <Clock className="w-4 h-4 mr-2 text-gray-500" />
                        <span className="text-sm">{formatTime(booking.time, user)}</span>
                      </div>
                    </div>
                    
                    {booking.notes && viewMode === 'grid' && (
                      <div className="mb-4 p-2 bg-gray-50 rounded text-sm">
                        <p className="font-medium mb-1">Notes:</p>
                        <p>{booking.notes}</p>
                      </div>
                    )}
                    
                    <div className="text-xs text-gray-500 mb-4">
                      Requested on {formatDate(booking.createdAt || new Date().toISOString())}
                    </div>
                  </div>
                  
                  {viewMode === 'list' && (
                    <div className="ml-4 flex items-center">
                      {(booking.status === 'pending') && (
                        <div className="flex space-x-2">
                          <Button 
                            variant="default" 
                            size="sm"
                            onClick={() => handleAccept(booking.id)}
                          >
                            <Check className="w-4 h-4 mr-2" />
                            Accept
                          </Button>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDecline(booking.id)}
                          >
                            <X className="w-4 h-4 mr-2" />
                            Decline
                          </Button>
                        </div>
                      )}
                      {(booking.status !== 'pending') && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="outline" size="sm">Actions</Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent>
                            <DropdownMenuItem>View Details</DropdownMenuItem>
                            <DropdownMenuItem>Reschedule</DropdownMenuItem>
                            <DropdownMenuItem>Send Reminder</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </div>
                  )}
                </div>
                
                {viewMode === 'grid' && (booking.status === 'pending') && (
                  <div className="p-4 pt-0">
                    <div className="flex space-x-2">
                      <Button 
                        variant="default" 
                        className="w-full"
                        size="sm"
                        onClick={() => handleAccept(booking.id)}
                      >
                        <Check className="w-4 h-4 mr-1" />
                        Accept
                      </Button>
                      <Button 
                        variant="outline" 
                        className="w-full"
                        size="sm"
                        onClick={() => handleDecline(booking.id)}
                      >
                        <X className="w-4 h-4 mr-1" />
                        Decline
                      </Button>
                    </div>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
      
      {/* Simple Create Booking Dialog */}
      {showCreateDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h2 className="text-xl font-semibold mb-4">Create New Booking</h2>
            <form className="booking-form space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Client Name</label>
                <input 
                  name="clientName"
                  type="text" 
                  className="w-full p-2 border rounded" 
                  placeholder="Enter client name"
                  required 
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Service</label>
                <select name="serviceName" className="w-full p-2 border rounded" required>
                  <option value="">Select a service</option>
                  {user?.services?.map((service, index) => (
                    <option key={index} value={service.name}>
                      {service.name} - {typeof service.duration === 'number' ? service.duration : service.duration} min - ${typeof service.price === 'number' ? service.price : service.price}
                    </option>
                  ))}
                  {(!user?.services || user.services.length === 0) && (
                    <option value="Consultation">Consultation (Default)</option>
                  )}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium mb-1">Date</label>
                  <input 
                    name="date"
                    type="date" 
                    className="w-full p-2 border rounded"
                    required 
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Time</label>
                  <input 
                    name="time"
                    type="time" 
                    className="w-full p-2 border rounded"
                    required 
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Notes</label>
                <textarea 
                  name="notes"
                  className="w-full p-2 border rounded" 
                  rows={3} 
                  placeholder="Optional notes"
                ></textarea>
              </div>
            </form>
            <div className="flex gap-3 mt-6">
              <Button 
                variant="outline" 
                className="flex-1"
                onClick={() => setShowCreateDialog(false)}
              >
                Cancel
              </Button>
              <Button 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
                onClick={async () => {
                  const form = document.querySelector('.booking-form') as HTMLFormElement;
                  const formData = new FormData(form);
                  
                  const bookingData = {
                    clientName: formData.get('clientName') as string,
                    serviceName: formData.get('serviceName') as string,
                    date: formData.get('date') as string,
                    time: formData.get('time') as string,
                    notes: formData.get('notes') as string,
                    clientPhone: "",
                    professionalId: "1",
                    externalId: Date.now().toString(),
                    clientId: 1,
                    serviceId: "1",
                    source: "appointments" // Mark as internal booking - backend will keep "confirmed" status
                  };
                  
                  try {
                    const response = await fetch('/api/bookings', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(bookingData)
                    });
                    
                    if (response.ok) {
                      toast({
                        title: "Booking Created",
                        description: "New booking has been created successfully.",
                      });
                      setShowCreateDialog(false);
                      refetchBookings();
                    } else {
                      throw new Error('Failed to create booking');
                    }
                  } catch (error) {
                    toast({
                      title: "Error",
                      description: "Failed to create booking. Please try again.",
                      variant: "destructive",
                    });
                  }
                }}
              >
                Create Booking
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}