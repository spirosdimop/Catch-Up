import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  UserCircle, 
  Mail, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2,
  Phone,
  CalendarDays,
  Loader2
} from "lucide-react";
import { format, addDays, parseISO } from "date-fns";
import { useUser } from "@/lib/userContext";
import { EventTemplate, EventType, ServiceLocationType } from "@shared/schema";
import { useBooking, TimeSlot } from "@/hooks/use-booking";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Profile() {
  const { user, setUser } = useUser();
  const [activeTab, setActiveTab] = useState("services");
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: format(new Date(), 'yyyy-MM-dd'),
    time: "",
    notes: "",
  });
  
  const { 
    selectedDate, 
    setSelectedDate, 
    availableSlots,
    isLoadingSlots,
    createBooking,
    isPendingBooking,
    setResetFormCallback
  } = useBooking();
  
  // Register the reset form callback
  useEffect(() => {
    setResetFormCallback(() => () => {
      setBookingForm({
        name: "",
        email: "",
        phone: "",
        date: format(new Date(), 'yyyy-MM-dd'),
        time: "",
        notes: "",
      });
      setSelectedService(null);
    });
  }, [setResetFormCallback]);
  
  // If no user exists, create a test user for development purposes
  useEffect(() => {
    if (!user) {
      console.log('Creating test user for development');
      setUser({
        id: "test-user-123",
        firstName: "Sarah",
        lastName: "Johnson",
        email: "sarah@beautysalon.com",
        phone: "555-123-4567",
        businessName: "Elegant Beauty Salon",
        profession: "beautician",
        locationType: "has_shop",
        serviceArea: "Downtown & Surrounding Areas",
        profileImageUrl: "",
        services: [
          { 
            name: "Haircut & Styling", 
            duration: 60, 
            price: 75, 
            locationType: ServiceLocationType.OFFICE, 
            description: "Professional haircut and styling tailored to your preferences." 
          },
          { 
            name: "Color Treatment", 
            duration: 90, 
            price: 120, 
            locationType: ServiceLocationType.OFFICE, 
            description: "Complete hair coloring with premium products for vibrant, long-lasting results."
          },
          { 
            name: "In-Home Styling", 
            duration: 75, 
            price: 95, 
            locationType: ServiceLocationType.CLIENT_LOCATION, 
            description: "Professional styling service provided at your location for special events."
          },
          { 
            name: "Virtual Consultation", 
            duration: 30, 
            price: 40, 
            locationType: ServiceLocationType.ONLINE, 
            description: "Online consultation to discuss hair care routines and styling options."
          }
        ]
      });
    }
  }, [user, setUser]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Add effect to update selectedDate when booking form date changes
  useEffect(() => {
    if (bookingForm.date) {
      setSelectedDate(parseISO(bookingForm.date));
    }
  }, [bookingForm.date, setSelectedDate]);

  const handleServiceSelect = (index: number) => {
    setSelectedService(index);
    // When a service is selected, refresh available times based on date
    if (bookingForm.date) {
      setSelectedDate(parseISO(bookingForm.date));
    }
  };
  
  const goToAppointmentTab = () => {
    setActiveTab("appointment");
  };
  
  const goToServicesTab = () => {
    setActiveTab("services");
  };
  
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedService === null) {
      alert("Please select a service to book");
      return;
    }
    
    if (!user?.services[selectedService]) {
      alert("Invalid service selected");
      return;
    }
    
    const selectedServiceData = user.services[selectedService];
    
    // Create booking through our API
    createBooking({
      serviceName: selectedServiceData.name,
      serviceId: selectedService + 1, // Use index+1 as ID (for demo)
      clientName: bookingForm.name,
      clientEmail: bookingForm.email,
      clientPhone: bookingForm.phone,
      date: bookingForm.date,
      time: bookingForm.time,
      notes: bookingForm.notes,
      providerId: user?.id?.toString() || '1', // Use default if undefined
      duration: selectedServiceData.duration,
      location: selectedServiceData.locationType || 'office',
      price: selectedServiceData.price
    });
    
    // The form will be reset in the useBooking hook's onSuccess handler
  };
  
  if (!user) {
    return <div className="flex justify-center items-center h-[80vh]">Loading...</div>;
  }
  
  return (
    <div className="container max-w-6xl py-8">
      {/* Professional Profile Header */}
      <div className="mb-10">
        <Card>
          <CardContent className="p-6">
            <div className="flex flex-col md:flex-row gap-8 items-center md:items-start">
              <Avatar className="w-32 h-32 border-4 border-primary/20">
                {user?.profileImageUrl ? (
                  <AvatarImage src={user.profileImageUrl} alt={`${user.firstName} ${user.lastName}`} />
                ) : (
                  <AvatarFallback className="text-2xl bg-primary/10">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </AvatarFallback>
                )}
              </Avatar>
              
              <div className="flex-1 text-center md:text-left">
                <h1 className="text-3xl font-bold">{user.firstName} {user.lastName}</h1>
                <p className="text-xl text-muted-foreground mb-4">{user.businessName}</p>
                
                <div className="flex flex-wrap gap-3 justify-center md:justify-start mb-4">
                  <Badge variant="secondary" className="px-3 py-1">
                    <UserCircle className="h-4 w-4 mr-1" />
                    <span className="capitalize">{user.profession}</span>
                  </Badge>
                  
                  <Badge variant="outline" className="px-3 py-1">
                    <MapPin className="h-4 w-4 mr-1" />
                    <span>{user.serviceArea}</span>
                  </Badge>
                </div>
                
                <div className="flex flex-col md:flex-row gap-4 text-sm">
                  <div className="flex items-center">
                    <Mail className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{user.email}</span>
                  </div>
                  <div className="flex items-center">
                    <Phone className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>{user.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Booking Section */}
      <div className="mb-10">
        <Tabs 
          value={activeTab} 
          onValueChange={setActiveTab} 
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="services">Select Service</TabsTrigger>
            <TabsTrigger value="appointment" disabled={selectedService === null}>Book Appointment</TabsTrigger>
          </TabsList>
          
          <TabsContent value="services" className="pt-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {user.services.map((service, index) => (
                <Card 
                  key={index} 
                  className={`cursor-pointer transition-all ${selectedService === index ? 'ring-2 ring-primary' : 'hover:border-primary'}`}
                  onClick={() => handleServiceSelect(index)}
                >
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold">{service.name}</h3>
                        <p className="text-sm text-muted-foreground">{service.description}</p>
                      </div>
                      <Badge className="text-lg font-semibold">${service.price}</Badge>
                    </div>
                    
                    <div className="flex flex-wrap gap-x-6 mt-3 text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{service.duration} minutes</span>
                      </div>
                      
                      <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{
                          service.locationType === ServiceLocationType.OFFICE ? 'At salon' :
                          service.locationType === ServiceLocationType.CLIENT_LOCATION ? 'At your location' :
                          service.locationType === ServiceLocationType.ONLINE ? 'Online session' : 
                          'Location varies'
                        }</span>
                      </div>
                    </div>
                    
                    {selectedService === index && (
                      <div className="mt-4 pt-4 border-t">
                        <Button 
                          className="w-full" 
                          onClick={goToAppointmentTab}
                        >
                          Continue to Booking
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
            
            {selectedService !== null && (
              <div className="mt-8 flex justify-center">
                <Button 
                  size="lg" 
                  onClick={goToAppointmentTab}
                >
                  Continue to Appointment
                </Button>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="appointment" className="pt-6">
            {selectedService !== null && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="md:col-span-1">
                  <CardHeader>
                    <CardTitle>Selected Service</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      <div className="bg-primary/5 p-4 rounded-lg border">
                        <h3 className="font-semibold">{user.services[selectedService].name}</h3>
                        <div className="flex justify-between items-center mt-2">
                          <div className="flex items-center">
                            <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                            <span className="text-sm">{user.services[selectedService].duration} min</span>
                          </div>
                          <Badge>${user.services[selectedService].price}</Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-2">{user.services[selectedService].description}</p>
                        
                        <Button 
                          variant="ghost" 
                          className="mt-3 text-sm h-8 px-2" 
                          onClick={() => {
                            setSelectedService(null);
                            goToServicesTab();
                          }}
                        >
                          Change Selection
                        </Button>
                      </div>
                      
                      <div>
                        <h4 className="font-medium mb-2">About {user.firstName}</h4>
                        <div className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>Licensed Professional</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm mt-1">
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                          <span>5+ Years Experience</span>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Book Your Appointment</CardTitle>
                    <CardDescription>
                      Fill in your details to schedule your appointment with {user.firstName}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleBookingSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input 
                            id="name" 
                            name="name" 
                            value={bookingForm.name} 
                            onChange={handleInputChange} 
                            placeholder="Enter your full name" 
                            required 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input 
                            id="phone" 
                            name="phone" 
                            type="tel" 
                            value={bookingForm.phone} 
                            onChange={handleInputChange} 
                            placeholder="Enter your phone number" 
                            required 
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input 
                          id="email" 
                          name="email" 
                          type="email" 
                          value={bookingForm.email} 
                          onChange={handleInputChange} 
                          placeholder="Enter your email address" 
                          required 
                        />
                      </div>
                      
                      <Separator />
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="date" className="flex items-center gap-2">
                            <CalendarDays className="h-4 w-4" />
                            Select Date
                          </Label>
                          <Input 
                            id="date" 
                            name="date" 
                            type="date" 
                            value={bookingForm.date} 
                            onChange={handleInputChange} 
                            min={format(new Date(), 'yyyy-MM-dd')}
                            max={format(addDays(new Date(), 30), 'yyyy-MM-dd')}
                            required 
                          />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="time" className="flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Select Time
                          </Label>
                          <Select 
                            name="time" 
                            value={bookingForm.time} 
                            onValueChange={(value) => setBookingForm(prev => ({ ...prev, time: value }))}
                            required
                          >
                            <SelectTrigger id="time" disabled={isLoadingSlots || selectedService === null}>
                              {isLoadingSlots ? (
                                <div className="flex items-center">
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  <span>Loading times...</span>
                                </div>
                              ) : (
                                <SelectValue placeholder={selectedService === null ? "Select a service first" : "Select a time slot"} />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {isLoadingSlots ? (
                                <SelectItem value="loading">
                                  <div className="flex items-center">
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    <span>Loading available times...</span>
                                  </div>
                                </SelectItem>
                              ) : availableSlots.length === 0 ? (
                                <SelectItem value="none">No available times for this date</SelectItem>
                              ) : (
                                availableSlots.map((slot) => (
                                  <SelectItem key={slot.time} value={slot.formatted}>
                                    {slot.formatted}
                                  </SelectItem>
                                ))
                              )}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="notes">Special Requests or Notes (Optional)</Label>
                        <Textarea 
                          id="notes" 
                          name="notes" 
                          value={bookingForm.notes} 
                          onChange={handleInputChange} 
                          placeholder="Any specific requirements or information you'd like to share" 
                          className="min-h-[100px]"
                        />
                      </div>
                      
                      <div className="pt-2">
                        <Button 
                          type="submit" 
                          size="lg" 
                          className="w-full"
                          disabled={isPendingBooking || selectedService === null || !bookingForm.time}
                        >
                          {isPendingBooking ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> 
                              Processing...
                            </>
                          ) : (
                            "Book Appointment"
                          )}
                        </Button>
                        <p className="text-xs text-center text-muted-foreground mt-2">
                          By booking, you agree to our cancellation and rescheduling policies.
                        </p>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            )}
            
            {selectedService === null && (
              <div className="text-center p-10">
                <h3 className="text-lg font-medium">Please select a service first</h3>
                <p className="text-muted-foreground mb-4">
                  Go back to the Services tab to choose a service
                </p>
                <Button 
                  onClick={goToServicesTab}
                >
                  Select a Service
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
      
      {/* Additional Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="font-medium">Elegant Beauty Salon</p>
            <p className="text-muted-foreground">123 Main Street</p>
            <p className="text-muted-foreground">Downtown, City 10001</p>
            <Button variant="link" className="px-0 mt-2">Get Directions</Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Business Hours
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span>Monday - Friday</span>
              <span>9:00 AM - 7:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Saturday</span>
              <span>10:00 AM - 5:00 PM</span>
            </div>
            <div className="flex justify-between">
              <span>Sunday</span>
              <span>Closed</span>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Cancellation Policy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Free cancellation up to 24 hours before your appointment. 
              Late cancellations or no-shows may incur a fee of 50% of the service price.
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}