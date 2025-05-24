import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { format } from "date-fns";
import { Calendar as CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { Calendar } from "@/components/ui/calendar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import { Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface Service {
  id: string;
  name: string;
  description: string;
  duration: number;
  price: number;
}

interface TimeSlot {
  time: string;
  formatted: string;
}

interface ProfileData {
  username: string;
  name: string;
  businessName: string;
  profession: string;
  email: string;
  phone: string;
  bio: string;
  profileImage: string;
  services: Service[];
}

const PublicProfile = () => {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [date, setDate] = useState<Date | undefined>(new Date());
  const [selectedService, setSelectedService] = useState<string | null>(null);
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newClient, setNewClient] = useState<number | null>(null);

  const usernameFromUrl = window.location.pathname.split("/").pop();

  useEffect(() => {
    // Fetch profile data based on the username from URL
    const fetchProfileData = async () => {
      try {
        setLoading(true);
        // In production, you would fetch this from your API
        // For now, we'll use mock data
        const response = await fetch(`/api/public-profile/${usernameFromUrl}`);
        
        if (!response.ok) {
          throw new Error("Failed to fetch profile data");
        }
        
        const data = await response.json();
        setProfile(data);
        
        // Also fetch services
        const servicesResponse = await fetch("/api/services");
        if (servicesResponse.ok) {
          const servicesData = await servicesResponse.json();
          setProfile(prevProfile => ({ 
            ...prevProfile!, 
            services: servicesData 
          }));
        }
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast({
          title: "Error",
          description: "Could not load profile information",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    if (usernameFromUrl) {
      fetchProfileData();
    }
  }, [usernameFromUrl, toast]);

  useEffect(() => {
    // Fetch available time slots when date or service changes
    const fetchTimeSlots = async () => {
      if (!date || !selectedService) return;

      try {
        const formattedDate = format(date, 'yyyy-MM-dd');
        const response = await fetch(
          `/api/bookings/available-slots?date=${formattedDate}&serviceId=${selectedService}&providerId=user-1`
        );
        
        if (!response.ok) {
          throw new Error("Failed to fetch time slots");
        }
        
        const data = await response.json();
        setTimeSlots(data);
        setSelectedTimeSlot(null); // Reset selected time slot
      } catch (error) {
        console.error("Error fetching time slots:", error);
        toast({
          title: "Error",
          description: "Could not load available time slots",
          variant: "destructive",
        });
      }
    };

    fetchTimeSlots();
  }, [date, selectedService, toast]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const createClient = async () => {
    try {
      const response = await fetch("/api/clients", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to create client");
      }

      const data = await response.json();
      return data.id;
    } catch (error) {
      console.error("Error creating client:", error);
      throw error;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedService || !selectedTimeSlot || !date) {
      toast({
        title: "Incomplete Form",
        description: "Please select a service, date, and time slot",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsSubmitting(true);

      // Create a new client or get existing one
      let clientId = newClient;
      if (!clientId) {
        clientId = await createClient();
        setNewClient(clientId);
      }

      // Create the booking
      const formattedDate = format(date, 'yyyy-MM-dd');
      const timeValue = JSON.parse(selectedTimeSlot).formatted;
      
      const bookingResponse = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          date: formattedDate,
          time: timeValue,
          duration: profile?.services.find(s => s.id === selectedService)?.duration || 60,
          type: "meeting",
          status: "confirmed",
          clientId,
          serviceId: selectedService?.toString() || "1",
          professionalId: "1",
          externalId: Date.now().toString(),
          clientName: formData.name,
          clientPhone: formData.phone || "",
          serviceName: profile?.services.find(s => s.id === selectedService)?.name || "Service",
          servicePrice: `$${profile?.services.find(s => s.id === selectedService)?.price || 0}`,
          notes: formData.notes || "",
        }),
      });

      if (!bookingResponse.ok) {
        throw new Error("Failed to create booking");
      }

      const bookingData = await bookingResponse.json();
      
      toast({
        title: "Booking Confirmed",
        description: "Your appointment has been scheduled successfully!",
        variant: "default",
      });

      // Reset form
      setFormData({
        name: "",
        email: "",
        phone: "",
        notes: "",
      });
      setSelectedService(null);
      setSelectedTimeSlot(null);
      
    } catch (error) {
      console.error("Error scheduling appointment:", error);
      toast({
        title: "Booking Failed",
        description: "There was an error scheduling your appointment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
        <span className="ml-2 text-lg">Loading profile...</span>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen p-4">
        <h1 className="text-2xl font-bold mb-2">Profile Not Found</h1>
        <p className="text-gray-500 mb-6">The profile you're looking for doesn't exist or has been removed.</p>
        <Button onClick={() => setLocation("/")}>Return Home</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-gradient-to-r from-blue-600 to-indigo-700 text-white py-8">
        <div className="container mx-auto px-4 md:px-6">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <Avatar className="h-24 w-24 border-4 border-white">
              <AvatarImage src={profile.profileImage} alt={profile.name} />
              <AvatarFallback className="text-2xl bg-blue-500">
                {profile.name.split(' ').map(n => n[0]).join('')}
              </AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h1 className="text-3xl font-bold">{profile.name}</h1>
              <p className="text-xl opacity-90">{profile.businessName}</p>
              <p className="opacity-75 mt-1">{profile.profession}</p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 md:px-6 py-8">
        <Tabs defaultValue="book" className="w-full">
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="book">Book Appointment</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="about">About</TabsTrigger>
          </TabsList>

          {/* Book Appointment Tab */}
          <TabsContent value="book">
            <div className="grid md:grid-cols-2 gap-8">
              <Card>
                <CardHeader>
                  <CardTitle>Select a Service</CardTitle>
                  <CardDescription>Choose the service you'd like to book</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 gap-4">
                    {profile.services.map((service) => (
                      <div
                        key={service.id}
                        className={cn(
                          "flex flex-col p-4 rounded-lg border cursor-pointer transition-all",
                          selectedService === service.id
                            ? "border-blue-600 bg-blue-50"
                            : "border-gray-200 hover:border-blue-400"
                        )}
                        onClick={() => setSelectedService(service.id)}
                      >
                        <div className="flex justify-between items-start">
                          <div>
                            <h3 className="font-medium">{service.name}</h3>
                            <p className="text-sm text-gray-500 mt-1">{service.description}</p>
                          </div>
                          <div className="text-right">
                            <span className="font-medium">${service.price}</span>
                            <p className="text-sm text-gray-500">{service.duration} min</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Select Date & Time</CardTitle>
                  <CardDescription>Choose when you'd like your appointment</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="date">Date</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            id="date"
                            variant={"outline"}
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !date && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {date ? format(date, "PPP") : <span>Pick a date</span>}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={date}
                            onSelect={setDate}
                            initialFocus
                            disabled={(date) => {
                              // Disable dates in the past and more than 60 days in the future
                              const now = new Date();
                              now.setHours(0, 0, 0, 0);
                              const maxDate = new Date();
                              maxDate.setDate(maxDate.getDate() + 60);
                              return date < now || date > maxDate;
                            }}
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div>
                      <Label htmlFor="time">Available Time Slots</Label>
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-2">
                        {timeSlots.length > 0 ? (
                          timeSlots.map((slot) => (
                            <Button
                              key={slot.time}
                              variant="outline"
                              className={cn(
                                "justify-center",
                                selectedTimeSlot === JSON.stringify(slot) && "bg-blue-50 border-blue-600"
                              )}
                              onClick={() => setSelectedTimeSlot(JSON.stringify(slot))}
                            >
                              {slot.formatted}
                            </Button>
                          ))
                        ) : (
                          <div className="col-span-full text-center py-4 text-gray-500">
                            {selectedService ? "No available time slots for this date" : "Select a service to view available times"}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {selectedService && selectedTimeSlot && (
                <Card className="md:col-span-2">
                  <CardHeader>
                    <CardTitle>Your Information</CardTitle>
                    <CardDescription>Please enter your details to complete the booking</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <form onSubmit={handleSubmit} className="space-y-6">
                      <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <Label htmlFor="name">Full Name</Label>
                          <Input
                            id="name"
                            name="name"
                            value={formData.name}
                            onChange={handleInputChange}
                            placeholder="Your full name"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input
                            id="email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleInputChange}
                            placeholder="Your email address"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input
                            id="phone"
                            name="phone"
                            value={formData.phone}
                            onChange={handleInputChange}
                            placeholder="Your phone number"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="service">Selected Service</Label>
                          <Input
                            id="service"
                            value={profile.services.find(s => s.id === selectedService)?.name || ""}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date-display">Date</Label>
                          <Input
                            id="date-display"
                            value={date ? format(date, "PPP") : ""}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="time-display">Time</Label>
                          <Input
                            id="time-display"
                            value={selectedTimeSlot ? JSON.parse(selectedTimeSlot).formatted : ""}
                            disabled
                            className="bg-gray-50"
                          />
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                        <Textarea 
                          id="notes"
                          name="notes"
                          value={formData.notes}
                          onChange={handleInputChange}
                          placeholder="Any special requests or information about the appointment"
                          rows={3}
                        />
                      </div>
                      
                      <Button 
                        type="submit" 
                        className="w-full" 
                        size="lg"
                        disabled={isSubmitting}
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Processing...
                          </>
                        ) : (
                          "Book Appointment"
                        )}
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          {/* Services Tab */}
          <TabsContent value="services">
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {profile.services.map((service) => (
                <Card key={service.id} className="flex flex-col">
                  <CardHeader>
                    <CardTitle>{service.name}</CardTitle>
                    <div className="flex justify-between">
                      <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                        {service.duration} minutes
                      </Badge>
                      <span className="font-medium text-lg">${service.price}</span>
                    </div>
                  </CardHeader>
                  <CardContent className="flex-grow">
                    <p className="text-gray-500">{service.description}</p>
                  </CardContent>
                  <CardFooter>
                    <Button
                      onClick={() => {
                        setSelectedService(service.id);
                        document.querySelector('[value="book"]')?.dispatchEvent(
                          new MouseEvent('click', {
                            bubbles: true,
                            cancelable: true,
                            view: window
                          })
                        );
                      }}
                      className="w-full"
                    >
                      Book Now
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* About Tab */}
          <TabsContent value="about">
            <Card>
              <CardHeader>
                <CardTitle>About {profile.name}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-medium mb-2">Bio</h3>
                    <p className="text-gray-500">{profile.bio || "No bio information available."}</p>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-medium mb-4">Contact Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Email</p>
                        <p>{profile.email}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p>{profile.phone}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Business</p>
                        <p>{profile.businessName}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Profession</p>
                        <p className="capitalize">{profile.profession}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default PublicProfile;