import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  Loader2,
  Star,
  Info,
  AlertCircle
} from "lucide-react";
import { format, addDays, parseISO } from "date-fns";
import { useUser } from "@/lib/userContext";
import { EventTemplate, EventType, ServiceLocationType } from "@shared/schema";
import { useBooking, TimeSlot } from "@/hooks/use-booking";
import { useToast } from "@/hooks/use-toast";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Profile() {
  console.log("Loading UPDATED profile component with reviews and hours!");
  const { user, setUser, updateUser } = useUser();
  const { toast } = useToast();
  const [selectedService, setSelectedService] = useState<number | null>(null);
  const [activeSection, setActiveSection] = useState("book"); // book, reviews, hours, edit
  const [isEditMode, setIsEditMode] = useState(false);
  const [reviewForm, setReviewForm] = useState({ name: "", rating: 5, comment: "" });
  const [bookingForm, setBookingForm] = useState({
    name: "",
    email: "",
    phone: "",
    date: format(new Date(), 'yyyy-MM-dd'),
    time: "",
    notes: "",
  });
  const [profileFormData, setProfileFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    businessName: "",
    profession: "",
    serviceArea: ""
  });
  const [isSubmittingProfile, setIsSubmittingProfile] = useState(false);
  
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
        // @ts-ignore - Adding additional properties for the UI demo
        businessHours: [
          { day: "Monday", opens: "09:00", closes: "18:00" },
          { day: "Tuesday", opens: "09:00", closes: "18:00" },
          { day: "Wednesday", opens: "09:00", closes: "18:00" },
          { day: "Thursday", opens: "09:00", closes: "20:00" },
          { day: "Friday", opens: "09:00", closes: "20:00" },
          { day: "Saturday", opens: "10:00", closes: "16:00" },
          { day: "Sunday", opens: "closed", closes: "closed" }
        ],
        // @ts-ignore - Adding additional properties for the UI demo
        reviews: [
          { 
            id: 1,
            name: "Emma Wilson", 
            rating: 5, 
            date: "2025-04-15", 
            comment: "Sarah did an amazing job with my hair! The color is perfect and the cut is exactly what I wanted. Highly recommend her services."
          },
          { 
            id: 2,
            name: "Michael Brown", 
            rating: 4, 
            date: "2025-04-03", 
            comment: "Great experience overall. Very professional and the salon atmosphere was relaxing."
          },
          { 
            id: 3,
            name: "Jennifer Taylor", 
            rating: 5, 
            date: "2025-03-22", 
            comment: "Sarah was amazing! She listened to exactly what I wanted and delivered. My hair has never looked better."
          }
        ],
        // @ts-ignore - Adding additional properties for the UI demo
        cancellationPolicy: "Cancellations must be made at least 24 hours in advance to avoid a cancellation fee. Late cancellations or no-shows may result in a fee equal to 50% of the service price.",
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
  
  // Initialize profile form data when user data changes
  useEffect(() => {
    if (user) {
      setProfileFormData({
        firstName: user.firstName || "",
        lastName: user.lastName || "",
        email: user.email || "",
        phone: user.phone || "",
        businessName: user.businessName || "",
        profession: user.profession || "",
        serviceArea: user.serviceArea || ""
      });
    }
  }, [user]);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setBookingForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSaveProfile = () => {
    setIsSubmittingProfile(true);
    
    // Simulate API call delay
    setTimeout(() => {
      // Update user context with new profile data
      if (user) {
        updateUser({
          ...profileFormData
        });
      }
      
      toast({
        title: "Profile updated",
        description: "Your profile information has been updated successfully.",
        variant: "default",
      });
      
      setIsSubmittingProfile(false);
      setIsEditMode(false); // Exit edit mode after saving
    }, 800);
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
  
  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // This would normally send to the server
    alert(`Thank you for your review, ${reviewForm.name}!`);
    setReviewForm({ name: "", rating: 5, comment: "" });
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
      
      {/* Navigation Menu */}
      <div className="mb-8 bg-secondary p-4 rounded-lg">
        <h2 className="text-xl font-bold mb-3">View Profile Information</h2>
        <div className="flex flex-wrap gap-2">
          <Button
            variant={activeSection === "book" ? "default" : "outline"}
            onClick={() => setActiveSection("book")}
            className="flex items-center gap-2" 
            size="lg"
          >
            <CalendarDays className="h-4 w-4" />
            Book Appointment
          </Button>
          <Button
            variant={activeSection === "reviews" ? "default" : "outline"}
            onClick={() => setActiveSection("reviews")}
            className="flex items-center gap-2"
            size="lg"
          >
            <Star className="h-4 w-4" />
            Reviews
          </Button>
          <Button
            variant={activeSection === "hours" ? "default" : "outline"}
            onClick={() => setActiveSection("hours")}
            className="flex items-center gap-2"
            size="lg"
          >
            <Clock className="h-4 w-4" />
            Business Hours
          </Button>
        </div>
      </div>

      {/* Booking Section */}
      {activeSection === "book" && (
        <div className="mb-10">
          <div className="mb-8">
            <h2 className="text-2xl font-bold mb-4">Select a Service</h2>
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
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
          
          {/* Booking form appears when a service is selected */}
          {selectedService !== null && (
            <div className="mt-10 pt-8 border-t">
              <h2 className="text-2xl font-bold mb-6">Book Your Appointment</h2>
              
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
                          onClick={() => setSelectedService(null)}
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
                      
                      {/* Cancellation Policy */}
                      <div className="mt-4 pt-4 border-t">
                        <h4 className="font-medium flex items-center mb-2">
                          <AlertCircle className="h-4 w-4 mr-1 text-amber-500" />
                          Cancellation Policy
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {user.cancellationPolicy}
                        </p>
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
                            max={format(addDays(new Date(), 60), 'yyyy-MM-dd')}
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
                            <SelectTrigger id="time" disabled={isLoadingSlots}>
                              {isLoadingSlots ? (
                                <div className="flex items-center">
                                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                  <span>Loading times...</span>
                                </div>
                              ) : (
                                <SelectValue placeholder="Select a time slot" />
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
                        <Label htmlFor="notes">Additional Notes (Optional)</Label>
                        <Textarea 
                          id="notes" 
                          name="notes" 
                          value={bookingForm.notes} 
                          onChange={handleInputChange} 
                          placeholder="Any special requests or information for your appointment" 
                          rows={3}
                        />
                      </div>
                      
                      <div className="pt-4">
                        <Button type="submit" className="w-full" size="lg" disabled={isPendingBooking}>
                          {isPendingBooking ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Booking Appointment...
                            </>
                          ) : (
                            <>Book Appointment</>
                          )}
                        </Button>
                      </div>
                    </form>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </div>
      )}
      
      {/* Reviews Section */}
      {activeSection === "reviews" && (
        <div className="mb-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <h2 className="text-2xl font-bold mb-6">Client Reviews</h2>
              
              <div className="space-y-6">
                {user.reviews?.map((review) => (
                  <Card key={review.id}>
                    <CardContent className="p-6">
                      <div className="flex justify-between mb-2">
                        <h3 className="font-semibold">{review.name}</h3>
                        <span className="text-sm text-muted-foreground">{review.date}</span>
                      </div>
                      
                      <div className="flex items-center mb-3">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-4 w-4 ${i < review.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                          />
                        ))}
                      </div>
                      
                      <p className="text-muted-foreground">{review.comment}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
            
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Leave a Review</CardTitle>
                  <CardDescription>
                    Share your experience with {user.firstName}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleReviewSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="review-name">Your Name</Label>
                      <Input 
                        id="review-name"
                        value={reviewForm.name}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, name: e.target.value }))}
                        placeholder="Enter your name"
                        required
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="review-rating">Rating</Label>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Button
                            key={i}
                            type="button"
                            variant="ghost"
                            className="p-1 h-auto"
                            onClick={() => setReviewForm(prev => ({ ...prev, rating: i + 1 }))}
                          >
                            <Star 
                              className={`h-6 w-6 ${i < reviewForm.rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`}
                            />
                          </Button>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="review-comment">Your Review</Label>
                      <Textarea 
                        id="review-comment"
                        value={reviewForm.comment}
                        onChange={(e) => setReviewForm(prev => ({ ...prev, comment: e.target.value }))}
                        placeholder="Share your experience"
                        rows={4}
                        required
                      />
                    </div>
                    
                    <Button type="submit" className="w-full">
                      Submit Review
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      )}
      
      {/* Business Hours Section */}
      {activeSection === "hours" && (
        <div className="mb-10">
          <h2 className="text-2xl font-bold mb-6">Business Hours & Policies</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Clock className="h-5 w-5 mr-2" />
                  Hours of Operation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {user.businessHours?.map((hours, index) => (
                    <div key={index} className="flex justify-between py-2 border-b last:border-0">
                      <span className="font-medium">{hours.day}</span>
                      <span className="text-muted-foreground">
                        {hours.opens === "closed" ? "Closed" : `${hours.opens} - ${hours.closes}`}
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Info className="h-5 w-5 mr-2" />
                  Policies
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium mb-2">Cancellation Policy</h3>
                    <p className="text-sm text-muted-foreground">{user.cancellationPolicy}</p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Late Arrival</h3>
                    <p className="text-sm text-muted-foreground">
                      If you arrive late for your appointment, your service may be shortened to accommodate other clients.
                      Please arrive 5-10 minutes before your scheduled appointment time.
                    </p>
                  </div>
                  
                  <div>
                    <h3 className="font-medium mb-2">Payment Methods</h3>
                    <p className="text-sm text-muted-foreground">
                      We accept cash, credit cards, and mobile payments including Apple Pay and Google Pay.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}