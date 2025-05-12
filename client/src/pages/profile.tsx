import { useState } from "react";
import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { UserCircle, Mail, Globe, MapPin, Calendar, Clock, CheckCircle2, Building, BriefcaseBusiness } from "lucide-react";
import { format, addDays } from "date-fns";
import { useUser } from "@/lib/userContext";

export default function Profile() {
  const [tab, setTab] = useState("profile");
  const { user } = useUser();
  
  // Combined profile data from user context and default values
  const profile = {
    name: user ? `${user.firstName} ${user.lastName}` : "Guest User",
    title: user?.profession || "Professional Service Provider",
    avatar: user?.profileImageUrl || "",
    email: user?.email || "guest@example.com",
    businessName: user?.businessName || "",
    website: "www.mywebsite.com", // Default, can be added to user context later
    location: user?.locationType === "has_shop" ? "Has Office Location" : 
              user?.locationType === "goes_to_clients" ? "Mobile Service" : 
              user?.locationType === "both" ? "Office & Mobile Service" : "Location not specified",
    bio: user ? `${user.profession || 'Professional'} providing services${user.services?.length ? ` including ${user.services.map(s => s.name).join(', ')}` : ''}.` 
          : "Professional service provider helping clients achieve their goals.",
    skills: user?.services?.map(s => s.name) || ["Service 1", "Service 2"],
    availability: {
      monday: { morning: true, afternoon: true, evening: false },
      tuesday: { morning: true, afternoon: true, evening: false },
      wednesday: { morning: false, afternoon: true, evening: true },
      thursday: { morning: true, afternoon: true, evening: false },
      friday: { morning: true, afternoon: false, evening: false },
      saturday: { morning: false, afternoon: false, evening: false },
      sunday: { morning: false, afternoon: false, evening: false },
    }
  };

  // Generate time slots for the booking system
  const generateTimeSlots = () => {
    const today = new Date();
    const days = [];
    
    // Generate next 7 days
    for (let i = 1; i <= 7; i++) {
      const date = addDays(today, i);
      const dayName = format(date, 'EEEE').toLowerCase() as keyof typeof profile.availability;
      const formattedDate = format(date, 'MMM d, yyyy');
      
      // Generate time slots based on availability
      const timeSlots = [];
      if (profile.availability[dayName]?.morning) {
        timeSlots.push({ time: "9:00 AM", available: true });
        timeSlots.push({ time: "10:30 AM", available: true });
      }
      
      if (profile.availability[dayName]?.afternoon) {
        timeSlots.push({ time: "1:00 PM", available: true });
        timeSlots.push({ time: "2:30 PM", available: true });
        timeSlots.push({ time: "4:00 PM", available: true });
      }
      
      if (profile.availability[dayName]?.evening) {
        timeSlots.push({ time: "5:30 PM", available: true });
        timeSlots.push({ time: "7:00 PM", available: true });
      }
      
      days.push({
        date: formattedDate,
        day: format(date, 'EEEE'),
        slots: timeSlots
      });
    }
    
    return days;
  };
  
  const availableDays = generateTimeSlots();
  
  const [selectedDate, setSelectedDate] = useState("");
  const [selectedTime, setSelectedTime] = useState("");
  const [bookingStep, setBookingStep] = useState(1);
  
  const handleDateSelect = (date: string) => {
    setSelectedDate(date);
    setSelectedTime("");
    setBookingStep(2);
  };
  
  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    setBookingStep(3);
  };
  
  const handleBookingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // In a real app, this would submit the booking data to the server
    setBookingStep(4);
  };

  return (
    <div className="space-y-6 p-6">
      <PageTitle 
        title="Professional Profile" 
        description="Manage your public profile and booking availability" 
        icon={<UserCircle className="h-6 w-6 text-primary" />}
      />
      
      <Tabs defaultValue="profile" className="w-full" value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-2 w-[400px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
        </TabsList>
        
        {/* Profile Tab */}
        <TabsContent value="profile" className="space-y-6">
          <Card>
            <CardHeader className="pb-4">
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                  <AvatarFallback>{profile.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <CardTitle className="text-2xl">{profile.name}</CardTitle>
                  <CardDescription className="text-lg">{profile.title}</CardDescription>
                  
                  <div className="flex flex-wrap gap-2 mt-3">
                    {profile.skills.map(skill => (
                      <Badge key={skill} variant="secondary">{skill}</Badge>
                    ))}
                  </div>
                </div>
                
                <div className="md:ml-auto">
                  <Button className="w-full md:w-auto">Edit Profile</Button>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <Mail className="h-5 w-5 text-muted-foreground" />
                    <span>{profile.email}</span>
                  </div>
                  {profile.businessName && (
                    <div className="flex items-center gap-2">
                      <Building className="h-5 w-5 text-muted-foreground" />
                      <span>{profile.businessName}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-muted-foreground" />
                    <span>{profile.website}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-muted-foreground" />
                    <span>{profile.location}</span>
                  </div>
                  {user?.services && user.services.length > 0 && (
                    <div className="mt-4">
                      <h4 className="font-medium mb-2">Services</h4>
                      <div className="space-y-2">
                        {user.services.map((service, index) => (
                          <div key={index} className="border p-3 rounded-md">
                            <div className="flex justify-between items-center">
                              <span className="font-medium">{service.name}</span>
                              <Badge variant="outline">${service.price}</Badge>
                            </div>
                            <div className="flex items-center mt-1 text-sm text-muted-foreground">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{service.duration} minutes</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                
                <div>
                  <h3 className="text-lg font-medium mb-2">About</h3>
                  <p className="text-muted-foreground">{profile.bio}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-3">Availability</h3>
                <div className="grid grid-cols-2 md:grid-cols-7 gap-2">
                  {Object.entries(profile.availability).map(([day, slots]) => (
                    <div key={day} className="border rounded-lg p-3">
                      <h4 className="font-medium capitalize">{day}</h4>
                      <div className="mt-2 space-y-1 text-sm">
                        <div className="flex items-center gap-1">
                          <span className={`h-2 w-2 rounded-full ${slots.morning ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          <span className={slots.morning ? 'font-medium' : 'text-muted-foreground'}>Morning</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`h-2 w-2 rounded-full ${slots.afternoon ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          <span className={slots.afternoon ? 'font-medium' : 'text-muted-foreground'}>Afternoon</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <span className={`h-2 w-2 rounded-full ${slots.evening ? 'bg-green-500' : 'bg-gray-300'}`}></span>
                          <span className={slots.evening ? 'font-medium' : 'text-muted-foreground'}>Evening</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Booking Tab */}
        <TabsContent value="booking" className="space-y-6">
          <Card className="booking-system">
            <CardHeader>
              <CardTitle>Book an Appointment</CardTitle>
              <CardDescription>
                Select a date and time to schedule a meeting
              </CardDescription>
            </CardHeader>
            <CardContent>
              {bookingStep === 4 ? (
                <div className="text-center py-8 space-y-4">
                  <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-100 text-green-500 mx-auto">
                    <CheckCircle2 className="h-8 w-8" />
                  </div>
                  <h3 className="text-xl font-semibold">Booking Confirmed!</h3>
                  <p className="text-muted-foreground">
                    Your appointment has been scheduled for {selectedDate} at {selectedTime}.
                  </p>
                  <Button 
                    onClick={() => {
                      setSelectedDate("");
                      setSelectedTime("");
                      setBookingStep(1);
                    }}
                    className="mt-4"
                  >
                    Book Another Appointment
                  </Button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Step indicator */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="w-full flex items-center">
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bookingStep >= 1 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        1
                      </div>
                      <div className={`flex-1 h-1 mx-2 ${bookingStep >= 2 ? 'bg-primary' : 'bg-muted'}`}></div>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bookingStep >= 2 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        2
                      </div>
                      <div className={`flex-1 h-1 mx-2 ${bookingStep >= 3 ? 'bg-primary' : 'bg-muted'}`}></div>
                      <div className={`flex items-center justify-center w-8 h-8 rounded-full ${bookingStep >= 3 ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'}`}>
                        3
                      </div>
                    </div>
                  </div>
                  
                  {/* Step 1: Select Date */}
                  {bookingStep === 1 && (
                    <div className="space-y-4">
                      <h3 className="text-lg font-medium">Select a Date</h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {availableDays.map((day) => (
                          <button
                            key={day.date}
                            className={`flex flex-col items-center p-4 border rounded-lg hover:border-primary transition-colors ${selectedDate === day.date ? 'border-primary bg-primary/5' : ''}`}
                            onClick={() => handleDateSelect(day.date)}
                            disabled={day.slots.length === 0}
                          >
                            <span className="text-sm text-muted-foreground">{day.day}</span>
                            <span className="text-lg font-medium">{day.date}</span>
                            <span className="mt-2 text-xs">
                              {day.slots.length === 0 ? 'No availability' : `${day.slots.length} slots available`}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Step 2: Select Time */}
                  {bookingStep === 2 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Select a Time</h3>
                        <Button variant="outline" size="sm" onClick={() => setBookingStep(1)}>
                          Back
                        </Button>
                      </div>
                      
                      <p className="text-muted-foreground">Date: {selectedDate}</p>
                      
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                        {availableDays.find(day => day.date === selectedDate)?.slots.map((slot) => (
                          <button
                            key={slot.time}
                            className={`p-3 border rounded-lg text-center hover:border-primary transition-colors ${selectedTime === slot.time ? 'border-primary bg-primary/5' : ''}`}
                            onClick={() => handleTimeSelect(slot.time)}
                            disabled={!slot.available}
                          >
                            <div className="flex items-center justify-center gap-2">
                              <Clock className="h-4 w-4 text-muted-foreground" />
                              <span>{slot.time}</span>
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Step 3: Booking Details */}
                  {bookingStep === 3 && (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <h3 className="text-lg font-medium">Booking Details</h3>
                        <Button variant="outline" size="sm" onClick={() => setBookingStep(2)}>
                          Back
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-3 p-4 bg-muted rounded-lg mb-4">
                        <Calendar className="h-5 w-5 text-primary" />
                        <div>
                          <p className="font-medium">{selectedDate}</p>
                          <p className="text-sm text-muted-foreground">{selectedTime}</p>
                        </div>
                      </div>
                      
                      <form onSubmit={handleBookingSubmit} className="space-y-4">
                        <div className="space-y-2">
                          <Label htmlFor="name">Your Name</Label>
                          <Input id="name" required defaultValue={user ? `${user.firstName} ${user.lastName}` : ""} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="email">Email Address</Label>
                          <Input id="email" type="email" required defaultValue={user?.email || ""} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="phone">Phone Number</Label>
                          <Input id="phone" type="tel" required defaultValue={user?.phone || ""} />
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor="purpose">Purpose of Meeting</Label>
                          <Textarea id="purpose" placeholder="Briefly describe what you'd like to discuss..." required />
                        </div>
                        
                        <Button type="submit" className="w-full">
                          Confirm Booking
                        </Button>
                      </form>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}