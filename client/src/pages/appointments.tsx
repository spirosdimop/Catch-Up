import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, X, Calendar, Clock, User, Phone, CalendarClock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { getAllBookings, updateBooking, deleteBooking, BookingRequest } from "@/lib/bookingStorage";

export default function AppointmentsPage() {
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [selectedTab, setSelectedTab] = useState<'pending' | 'accepted' | 'declined' | 'all'>('pending');
  const { toast } = useToast();

  // Load bookings on component mount
  useEffect(() => {
    loadBookings();
  }, []);

  // Function to load bookings from storage
  const loadBookings = () => {
    try {
      const bookingsData = getAllBookings();
      console.log("Loaded bookings:", bookingsData);
      setBookings(bookingsData);
    } catch (error) {
      console.error("Error loading bookings:", error);
      toast({
        title: "Error",
        description: "Failed to load booking requests",
        variant: "destructive",
      });
    }
  };

  // Handle accepting a booking
  const handleAccept = (bookingId: string) => {
    try {
      const updatedBooking = updateBooking(bookingId, { status: "accepted" });
      if (updatedBooking) {
        toast({
          title: "Booking Accepted",
          description: "The client will be notified about your response.",
        });
        loadBookings();
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
  const handleDecline = (bookingId: string) => {
    try {
      const updatedBooking = updateBooking(bookingId, { status: "declined" });
      if (updatedBooking) {
        toast({
          title: "Booking Declined",
          description: "The client will be notified about your response.",
        });
        loadBookings();
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
      <h1 className="text-3xl font-bold mb-6">Appointment Requests</h1>
      
      {/* Status tabs */}
      <div className="flex space-x-2 mb-6">
        <Button 
          variant={selectedTab === 'pending' ? "default" : "outline"}
          onClick={() => setSelectedTab('pending')}
        >
          Pending
        </Button>
        <Button 
          variant={selectedTab === 'accepted' ? "default" : "outline"}
          onClick={() => setSelectedTab('accepted')}
        >
          Accepted
        </Button>
        <Button 
          variant={selectedTab === 'declined' ? "default" : "outline"}
          onClick={() => setSelectedTab('declined')}
        >
          Declined
        </Button>
        <Button 
          variant={selectedTab === 'all' ? "default" : "outline"}
          onClick={() => setSelectedTab('all')}
        >
          All
        </Button>
      </div>

      {/* For testing - Clear all bookings */}
      <div className="mb-6">
        <Button
          variant="outline"
          onClick={() => {
            localStorage.removeItem('app_booking_requests');
            loadBookings();
            toast({
              title: "Bookings Cleared",
              description: "All booking requests have been cleared for testing.",
            });
          }}
        >
          Clear All Bookings (Testing)
        </Button>
        
        <Button
          variant="outline"
          className="ml-2"
          onClick={() => {
            // Add a sample booking for testing
            const testBooking: BookingRequest = {
              id: Date.now().toString(),
              clientName: "Test Client",
              clientPhone: "555-123-4567",
              serviceName: "Test Service",
              servicePrice: "$100",
              date: "2025-05-30",
              time: "10:00 AM",
              status: "pending",
              professionalId: "1",
              createdAt: new Date().toISOString(),
              notes: "This is a test booking"
            };
            
            const bookingsData = getAllBookings();
            const updatedBookings = [...bookingsData, testBooking];
            localStorage.setItem('app_booking_requests', JSON.stringify(updatedBookings));
            
            loadBookings();
            toast({
              title: "Test Booking Added",
              description: "A test booking has been added for demonstration.",
            });
          }}
        >
          Add Test Booking
        </Button>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBookings.map((booking) => (
            <Card key={booking.id} className="p-5 shadow-sm">
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="text-lg font-bold flex items-center">
                    <User className="w-4 h-4 mr-2" />
                    {booking.clientName}
                  </h3>
                  <p className="text-sm text-gray-500 flex items-center mt-1">
                    <Phone className="w-4 h-4 mr-2" />
                    {booking.clientPhone}
                  </p>
                </div>
                <div className={`text-xs font-semibold px-2 py-1 rounded ${
                  booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                  booking.status === 'accepted' ? 'bg-green-100 text-green-800' :
                  'bg-red-100 text-red-800'
                }`}>
                  {booking.status.charAt(0).toUpperCase() + booking.status.slice(1)}
                </div>
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
              
              {booking.notes && (
                <div className="mb-4 p-2 bg-gray-50 rounded text-sm">
                  <p className="font-medium mb-1">Notes:</p>
                  <p>{booking.notes}</p>
                </div>
              )}
              
              <div className="text-xs text-gray-500 mb-4">
                Requested on {formatDate(booking.createdAt)}
              </div>
              
              {booking.status === 'pending' && (
                <div className="flex space-x-2">
                  <Button 
                    variant="default" 
                    className="w-full"
                    onClick={() => handleAccept(booking.id)}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Accept
                  </Button>
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => handleDecline(booking.id)}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Decline
                  </Button>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}