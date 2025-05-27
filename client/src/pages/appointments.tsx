import { useState, useEffect } from "react";
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
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
  Grid3X3
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { getAllBookings, updateBooking, deleteBooking, addBooking, BookingRequest } from "@/lib/bookingStorage";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";

export default function AppointmentsPage() {
  const [selectedTab, setSelectedTab] = useState<'pending' | 'accepted' | 'declined' | 'all'>('pending');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('grid');
  const { toast } = useToast();

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

  // Filter bookings based on selected tab
  const filteredBookings = bookings.filter(booking => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'pending') return booking.status === 'pending';
    if (selectedTab === 'accepted') return booking.status === 'confirmed' || booking.status === 'accepted';
    if (selectedTab === 'declined') return booking.status === 'canceled' || booking.status === 'declined';
    return booking.status === selectedTab;
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

  return (
    <div className="container mx-auto py-8">
      {/* Main dashboard header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Appointment Manager</h1>
          <p className="text-gray-600 mt-1">Manage your appointments and booking requests</p>
        </div>
        <div className="flex items-center space-x-2">
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
          <Button className="bg-blue-600 hover:bg-blue-700" size="sm">
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
            <Button variant="outline" size="sm" className="border-gray-300">
              <Filter className="h-4 w-4 mr-1" /> Filter
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-5">
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
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold">
            All {selectedTab !== 'all' ? selectedTab.charAt(0).toUpperCase() + selectedTab.slice(1) : ''} Bookings
          </h2>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              size="sm"
            >
              <Calendar className="h-4 w-4 mr-1" /> 
              Calendar View
            </Button>
          </div>
        </div>
        
        {filteredBookings.length === 0 ? (
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
                        <span className="text-sm">{booking.time}</span>
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
    </div>
  );
}