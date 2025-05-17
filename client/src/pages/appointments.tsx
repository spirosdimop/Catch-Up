import { useState, useEffect } from "react";
import { useUser } from "@/lib/userContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Calendar, Clock, Phone, MoreHorizontal, Calendar as CalendarIcon, CheckCircle, XCircle, RefreshCw } from "lucide-react";

interface BookingRequest {
  id: string;
  clientName: string;
  clientPhone: string;
  serviceName?: string;
  servicePrice?: string | number;
  date: string;
  time: string;
  status: "pending" | "accepted" | "declined" | "rescheduled";
  professionalId: string;
  createdAt: string;
  notes?: string;
}

export default function AppointmentsPage() {
  const { user } = useUser();
  const { toast } = useToast();
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([]);
  const [isRescheduleDialogOpen, setIsRescheduleDialogOpen] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<BookingRequest | null>(null);
  const [rescheduleData, setRescheduleData] = useState({
    date: "",
    time: "",
    notes: ""
  });
  
  // Load booking requests from localStorage
  useEffect(() => {
    if (user) {
      try {
        const allBookings = JSON.parse(localStorage.getItem('bookingRequests') || '[]');
        // Filter bookings for this professional
        const professionalBookings = allBookings.filter(
          (booking: BookingRequest) => booking.professionalId === user.id
        );
        setBookingRequests(professionalBookings);
      } catch (error) {
        console.error('Error loading booking requests:', error);
      }
    }
  }, [user]);
  
  // Filter bookings by status
  const pendingBookings = bookingRequests.filter(booking => booking.status === 'pending');
  const acceptedBookings = bookingRequests.filter(booking => booking.status === 'accepted');
  const otherBookings = bookingRequests.filter(booking => 
    booking.status === 'declined' || booking.status === 'rescheduled'
  );
  
  // Handle booking actions
  const handleAcceptBooking = (booking: BookingRequest) => {
    updateBookingStatus(booking.id, 'accepted');
    toast({
      title: "Booking Accepted",
      description: `You've accepted the booking from ${booking.clientName}`,
    });
  };
  
  const handleDeclineBooking = (booking: BookingRequest) => {
    updateBookingStatus(booking.id, 'declined');
    toast({
      title: "Booking Declined",
      description: `You've declined the booking from ${booking.clientName}`,
    });
  };
  
  const openRescheduleDialog = (booking: BookingRequest) => {
    setSelectedBooking(booking);
    setRescheduleData({
      date: booking.date,
      time: booking.time,
      notes: booking.notes || ""
    });
    setIsRescheduleDialogOpen(true);
  };
  
  const handleRescheduleSubmit = () => {
    if (!selectedBooking) return;
    
    const { date, time, notes } = rescheduleData;
    if (!date || !time) {
      toast({
        title: "Missing Information",
        description: "Please select a new date and time for rescheduling.",
        variant: "destructive",
      });
      return;
    }
    
    updateBookingStatus(selectedBooking.id, 'rescheduled', notes, date, time);
    setIsRescheduleDialogOpen(false);
    
    toast({
      title: "Booking Rescheduled",
      description: `You've rescheduled the booking with ${selectedBooking.clientName}`,
    });
  };
  
  // Helper function to update booking status
  const updateBookingStatus = (
    bookingId: string, 
    status: 'accepted' | 'declined' | 'rescheduled',
    notes?: string,
    newDate?: string,
    newTime?: string
  ) => {
    try {
      // Get all bookings
      const allBookings = JSON.parse(localStorage.getItem('bookingRequests') || '[]');
      
      // Find and update the specific booking
      const updatedBookings = allBookings.map((booking: BookingRequest) => {
        if (booking.id === bookingId) {
          const updatedBooking = { 
            ...booking, 
            status,
            ...(notes !== undefined && { notes }),
            ...(newDate && { date: newDate }),
            ...(newTime && { time: newTime }),
          };
          return updatedBooking;
        }
        return booking;
      });
      
      // Save updated bookings back to localStorage
      localStorage.setItem('bookingRequests', JSON.stringify(updatedBookings));
      
      // Update state
      setBookingRequests(updatedBookings.filter(
        (booking: BookingRequest) => booking.professionalId === user?.id
      ));
    } catch (error) {
      console.error('Error updating booking status:', error);
      toast({
        title: "Error",
        description: "Failed to update booking status. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleCallClient = (phone: string) => {
    // In a real app, this would integrate with a calling system
    toast({
      title: "Calling Client",
      description: `Initiating call to ${phone}`,
    });
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        weekday: 'short', 
        month: 'short', 
        day: 'numeric', 
        year: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };
  
  const formatTime = (timeStr: string) => {
    try {
      const [hours, minutes] = timeStr.split(':');
      const time = new Date();
      time.setHours(parseInt(hours, 10));
      time.setMinutes(parseInt(minutes, 10));
      return time.toLocaleTimeString('en-US', { 
        hour: 'numeric', 
        minute: '2-digit', 
        hour12: true 
      });
    } catch {
      return timeStr;
    }
  };

  if (!user) {
    return <div className="container max-w-6xl mx-auto p-6 text-center">Loading...</div>;
  }

  return (
    <div className="container max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Appointment Requests</h1>
      
      {/* Pending Bookings */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Badge className="bg-yellow-500 mr-2">New</Badge>
          Pending Requests
        </h2>
        
        {pendingBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {pendingBookings.map(booking => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="bg-yellow-50 p-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{booking.clientName}</CardTitle>
                    <Badge className="bg-yellow-500">Pending</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{formatDate(booking.date)}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{formatTime(booking.time)}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{booking.clientPhone}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-4">
                    <span className="font-medium">Service:</span> {booking.serviceName || 'Not specified'}
                    {booking.servicePrice && (
                      <span className="ml-2">(${booking.servicePrice})</span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleAcceptBooking(booking)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => openRescheduleDialog(booking)}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reschedule
                    </Button>
                    <Button 
                      size="sm" 
                      variant="outline"
                      className="border-red-300 text-red-600 hover:bg-red-50"
                      onClick={() => handleDeclineBooking(booking)}
                    >
                      <XCircle className="h-4 w-4 mr-1" />
                      Decline
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="ml-auto"
                      onClick={() => handleCallClient(booking.clientPhone)}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50">
            <CardContent className="p-6 text-center text-gray-500">
              No pending booking requests.
            </CardContent>
          </Card>
        )}
      </section>
      
      {/* Accepted Bookings */}
      <section className="mb-10">
        <h2 className="text-xl font-semibold mb-4 flex items-center">
          <Badge className="bg-green-500 mr-2">Confirmed</Badge>
          Upcoming Appointments
        </h2>
        
        {acceptedBookings.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {acceptedBookings.map(booking => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className="bg-green-50 p-4">
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{booking.clientName}</CardTitle>
                    <Badge className="bg-green-500">Confirmed</Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{formatDate(booking.date)}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{formatTime(booking.time)}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{booking.clientPhone}</span>
                    </div>
                  </div>
                  
                  <div className="text-sm text-gray-500 mb-4">
                    <span className="font-medium">Service:</span> {booking.serviceName || 'Not specified'}
                    {booking.servicePrice && (
                      <span className="ml-2">(${booking.servicePrice})</span>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mt-4">
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700"
                      onClick={() => openRescheduleDialog(booking)}
                    >
                      <RefreshCw className="h-4 w-4 mr-1" />
                      Reschedule
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      className="ml-auto"
                      onClick={() => handleCallClient(booking.clientPhone)}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="bg-gray-50">
            <CardContent className="p-6 text-center text-gray-500">
              No confirmed appointments.
            </CardContent>
          </Card>
        )}
      </section>
      
      {/* Other Bookings */}
      {otherBookings.length > 0 && (
        <section className="mb-10">
          <h2 className="text-xl font-semibold mb-4">Other Requests</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {otherBookings.map(booking => (
              <Card key={booking.id} className="overflow-hidden">
                <CardHeader className={`p-4 ${
                  booking.status === 'declined' ? 'bg-red-50' : 'bg-blue-50'
                }`}>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{booking.clientName}</CardTitle>
                    <Badge className={
                      booking.status === 'declined' ? 'bg-red-500' : 'bg-blue-500'
                    }>
                      {booking.status === 'declined' ? 'Declined' : 'Rescheduled'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className="p-6">
                  <div className="mb-4">
                    <div className="flex items-center mb-2">
                      <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{formatDate(booking.date)}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Clock className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{formatTime(booking.time)}</span>
                    </div>
                    <div className="flex items-center mb-2">
                      <Phone className="h-4 w-4 mr-2 text-gray-500" />
                      <span>{booking.clientPhone}</span>
                    </div>
                  </div>
                  
                  {booking.notes && (
                    <div className="text-sm bg-gray-50 p-3 rounded-md mb-4">
                      <p className="font-medium mb-1">Notes:</p>
                      <p>{booking.notes}</p>
                    </div>
                  )}
                  
                  <div className="text-sm text-gray-500 mb-4">
                    <span className="font-medium">Service:</span> {booking.serviceName || 'Not specified'}
                    {booking.servicePrice && (
                      <span className="ml-2">(${booking.servicePrice})</span>
                    )}
                  </div>
                  
                  {booking.status === 'declined' ? (
                    <Button 
                      size="sm" 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => handleAcceptBooking(booking)}
                    >
                      <CheckCircle className="h-4 w-4 mr-1" />
                      Accept
                    </Button>
                  ) : (
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={() => handleCallClient(booking.clientPhone)}
                    >
                      <Phone className="h-4 w-4 mr-1" />
                      Call
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}
      
      {/* Reschedule Dialog */}
      <Dialog open={isRescheduleDialogOpen} onOpenChange={setIsRescheduleDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Reschedule Appointment</DialogTitle>
            <DialogDescription>
              Propose a new date and time for this appointment
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="reschedule-date">New Date</Label>
                <Input
                  id="reschedule-date"
                  type="date"
                  value={rescheduleData.date}
                  min={new Date().toISOString().split('T')[0]}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="reschedule-time">New Time</Label>
                <Input
                  id="reschedule-time"
                  type="time"
                  value={rescheduleData.time}
                  onChange={(e) => setRescheduleData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="reschedule-notes">Notes (optional)</Label>
              <Input
                id="reschedule-notes"
                value={rescheduleData.notes}
                onChange={(e) => setRescheduleData(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Add a note about this change"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRescheduleDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRescheduleSubmit}>
              Confirm Reschedule
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}