import { useEffect, useState } from "react";
import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { 
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogClose
} from "@/components/ui/dialog";
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
  Globe, 
  MapPin, 
  Calendar, 
  Clock, 
  CheckCircle2, 
  Building, 
  BriefcaseBusiness,
  Phone
} from "lucide-react";
import { format, addDays } from "date-fns";
import { useUser } from "@/lib/userContext";
import { EventTemplate, EventType, ServiceLocationType } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Profile() {
  const { user, setUser, updateUser } = useUser();
  
  // If no user exists, create a test user for development purposes
  useEffect(() => {
    if (!user) {
      console.log('Creating test user for development');
      setUser({
        id: "test-user-123",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        phone: "555-123-4567",
        businessName: "Test Business",
        profession: "consultant",
        locationType: "has_shop",
        serviceArea: "Downtown & Surrounding Areas",
        profileImageUrl: "",
        services: [
          { 
            name: "Consultation", 
            duration: 60, 
            price: 100, 
            locationType: "office", 
            description: "In-depth analysis of your business needs and strategy planning." 
          },
          { 
            name: "Follow-up Session", 
            duration: 30, 
            price: 50, 
            locationType: "client_location", 
            description: "Review progress and adjust strategies as needed."
          },
          { 
            name: "Online Coaching", 
            duration: 45, 
            price: 75, 
            locationType: "online", 
            description: "Virtual coaching session via video conferencing."
          }
        ]
      });
    }
  }, [user, setUser]);
  
  // Combined profile data from user context and default values
  const profile = {
    name: user ? `${user.firstName} ${user.lastName}` : "Guest User",
    title: user?.profession || "Professional Service Provider",
    avatar: user?.profileImageUrl || "",
    email: user?.email || "guest@example.com",
    phone: user?.phone || "",
    businessName: user?.businessName || "",
    website: "www.mywebsite.com", // Default, can be added to user context later
    location: user?.locationType === "has_shop" ? "Has Office Location" : 
              user?.locationType === "goes_to_clients" ? "Mobile Service" : 
              user?.locationType === "both" ? "Office & Mobile Service" : "Location not specified",
    serviceArea: user?.serviceArea || "Not specified",
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
  
  // Profile editing state
  const [showEditProfileDialog, setShowEditProfileDialog] = useState(false);
  const [showServicesDialog, setShowServicesDialog] = useState(false);
  const [profileForm, setProfileForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    businessName: "",
    profession: "",
    locationType: "",
    serviceArea: "",
    profileImageUrl: ""
  });
  
  // Services editing state
  const [services, setServices] = useState<{ 
    name: string; 
    duration: number; 
    price: number; 
    locationType?: string;
    description?: string;
  }[]>([]);
  
  // Initialize services from user data
  useEffect(() => {
    if (user && user.services) {
      setServices(user.services);
    }
  }, [user]);
  
  // Edit profile handlers
  const handleEditProfileClick = () => {
    if (user) {
      setProfileForm({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        businessName: user.businessName,
        profession: user.profession,
        locationType: user.locationType,
        serviceArea: user.serviceArea || "",
        profileImageUrl: user.profileImageUrl || ""
      });
      setShowEditProfileDialog(true);
    }
  };
  
  const handleProfileInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (user) {
      const updatedUser = {
        ...user,
        ...profileForm
      };
      updateUser(updatedUser);
      setShowEditProfileDialog(false);
    }
  };
  
  // Availability handlers
  const handleDayToggle = (day: string, checked: boolean) => {
    const updatedProfile = {...profile};
    updatedProfile.availability[day as keyof typeof profile.availability] = {
      morning: checked,
      afternoon: checked,
      evening: checked
    };
    // For a real application, this would trigger an API call to update the user's availability
    console.log("Updated availability for", day, ":", checked);
  };
  
  const handleSlotToggle = (day: string, slot: string, checked: boolean) => {
    const updatedProfile = {...profile};
    const dayAvailability = {...updatedProfile.availability[day as keyof typeof profile.availability]};
    dayAvailability[slot as keyof typeof dayAvailability] = checked;
    updatedProfile.availability[day as keyof typeof profile.availability] = dayAvailability;
    // For a real application, this would trigger an API call to update the user's availability
    console.log("Updated slot", slot, "for", day, ":", checked);
  };

  return (
    <div className="space-y-10 pb-20">
      <PageTitle title="Profile" description="Manage your professional profile and business information" />
      
      {/* Profile editing dialog */}
      <Dialog 
        open={showEditProfileDialog} 
        onOpenChange={(open) => {
          if (!open) {
            setShowEditProfileDialog(false);
          }
        }}
      >
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
            <DialogDescription>
              Update your profile information to help clients know more about you and your services.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleProfileSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input 
                  id="firstName" 
                  name="firstName" 
                  value={profileForm.firstName}
                  disabled
                  className="bg-gray-100 text-gray-700"
                />
                <p className="text-xs text-muted-foreground">Name cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  name="lastName" 
                  value={profileForm.lastName}
                  disabled
                  className="bg-gray-100 text-gray-700"
                />
                <p className="text-xs text-muted-foreground">Surname cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={profileForm.email}
                  disabled
                  className="bg-gray-100 text-gray-700"
                />
                <p className="text-xs text-muted-foreground">Email cannot be changed</p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input 
                  id="phone" 
                  name="phone" 
                  type="tel" 
                  value={profileForm.phone} 
                  onChange={handleProfileInputChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input 
                  id="businessName" 
                  name="businessName" 
                  value={profileForm.businessName} 
                  onChange={handleProfileInputChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="profession">Profession</Label>
                <Select 
                  name="profession" 
                  value={profileForm.profession} 
                  onValueChange={(value) => setProfileForm(prev => ({ ...prev, profession: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select profession" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="electrician">Electrician</SelectItem>
                    <SelectItem value="plumber">Plumber</SelectItem>
                    <SelectItem value="tutor">Tutor</SelectItem>
                    <SelectItem value="trainer">Trainer</SelectItem>
                    <SelectItem value="carpenter">Carpenter</SelectItem>
                    <SelectItem value="painter">Painter</SelectItem>
                    <SelectItem value="gardener">Gardener</SelectItem>
                    <SelectItem value="cleaner">Cleaner</SelectItem>
                    <SelectItem value="consultant">Consultant</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="locationType">Business Type</Label>
                <Select 
                  name="locationType" 
                  value={profileForm.locationType}
                  onValueChange={(value) => setProfileForm(prev => ({ ...prev, locationType: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select location type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="has_shop">I have a physical shop</SelectItem>
                    <SelectItem value="goes_to_clients">I visit clients at their location</SelectItem>
                    <SelectItem value="both">Both options</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="serviceArea">Service Area</Label>
                <Input 
                  id="serviceArea" 
                  name="serviceArea" 
                  value={profileForm.serviceArea} 
                  onChange={handleProfileInputChange} 
                  placeholder="e.g., Downtown & Surrounding Areas" 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="profileImage">Profile Image</Label>
                <div className="grid gap-2">
                  <div className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-md p-6 bg-gray-50">
                    {/* File preview area */}
                    {profileForm.profileImageUrl ? (
                      <div className="relative w-32 h-32 mb-4">
                        <img
                          src={profileForm.profileImageUrl}
                          alt="Profile preview"
                          className="object-cover w-full h-full rounded-full"
                        />
                        <button
                          type="button" 
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full p-1"
                          onClick={() => setProfileForm(prev => ({ ...prev, profileImageUrl: "" }))}
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 6L6 18"></path>
                            <path d="M6 6l12 12"></path>
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center text-gray-500">
                        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        <p className="text-sm mb-2">Drag and drop your image here</p>
                        <p className="text-xs text-gray-400">PNG, JPG, PDF up to 5MB</p>
                      </div>
                    )}
                    
                    {/* File input button */}
                    <Input
                      id="profileImage"
                      name="profileImage"
                      type="file"
                      className="hidden"
                      accept=".png,.jpg,.jpeg,.pdf"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          // For demo purposes, create a URL for the file
                          // In a real app, you would upload this to a server
                          const imageUrl = URL.createObjectURL(file);
                          setProfileForm(prev => ({ ...prev, profileImageUrl: imageUrl }));
                        }
                      }}
                    />
                    <Button 
                      type="button" 
                      variant="outline" 
                      className="mt-4"
                      onClick={() => document.getElementById('profileImage')?.click()}
                    >
                      Select Image
                    </Button>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Upload your profile image in PNG, JPG, or PDF format.
                  </p>
                </div>
              </div>
            </div>
            

            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditProfileDialog(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Services Management Dialog */}
      <Dialog open={showServicesDialog} onOpenChange={setShowServicesDialog}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Manage Your Services</DialogTitle>
            <DialogDescription>
              Add, edit, or remove the services you offer to your clients.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <h3 className="text-lg font-medium">Your Services</h3>
              <Button 
                type="button"
                variant="outline"
                size="sm"
                onClick={() => {
                  setServices([
                    ...services,
                    { 
                      name: "", 
                      duration: 30, 
                      price: 0,
                      locationType: ServiceLocationType.OFFICE,
                      description: ""
                    }
                  ]);
                }}
              >
                Add New Service
              </Button>
            </div>
            
            {services.length === 0 ? (
              <div className="text-center p-8 bg-gray-50 rounded-md border-2 border-dashed border-gray-200">
                <h4 className="font-medium mb-2">No services added yet</h4>
                <p className="text-muted-foreground mb-4">
                  Add your first service to display on your profile and make it available for booking.
                </p>
                <Button
                  variant="default"
                  onClick={() => {
                    setServices([
                      { 
                        name: "", 
                        duration: 30, 
                        price: 0,
                        locationType: ServiceLocationType.OFFICE,
                        description: ""
                      }
                    ]);
                  }}
                >
                  Add Your First Service
                </Button>
              </div>
            ) : (
              <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
                {services.map((service, index) => (
                  <div key={index} className="border rounded-md p-4 relative bg-gray-50 hover:shadow-md transition-shadow">
                    <button
                      type="button"
                      className="absolute top-2 right-2 text-red-500 hover:text-red-700"
                      onClick={() => {
                        setServices(services.filter((_, i) => i !== index));
                      }}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14a2 2 0 01-2 2H7a2 2 0 01-2-2V6m3 0V4a2 2 0 012-2h4a2 2 0 012 2v2"></path>
                      </svg>
                    </button>
                    <div className="grid grid-cols-1 gap-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`service-name-${index}`}>Service Name</Label>
                          <Input
                            id={`service-name-${index}`}
                            value={service.name}
                            onChange={(e) => {
                              const updatedServices = [...services];
                              updatedServices[index].name = e.target.value;
                              setServices(updatedServices);
                            }}
                            placeholder="e.g., Consultation"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`service-duration-${index}`}>Duration (minutes)</Label>
                          <Input
                            id={`service-duration-${index}`}
                            type="number"
                            value={service.duration}
                            onChange={(e) => {
                              const updatedServices = [...services];
                              updatedServices[index].duration = parseInt(e.target.value) || 0;
                              setServices(updatedServices);
                            }}
                            min="5"
                            step="5"
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`service-price-${index}`}>Price ($)</Label>
                          <Input
                            id={`service-price-${index}`}
                            type="number"
                            value={service.price}
                            onChange={(e) => {
                              const updatedServices = [...services];
                              updatedServices[index].price = parseInt(e.target.value) || 0;
                              setServices(updatedServices);
                            }}
                            min="0"
                            step="5"
                            required
                          />
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor={`service-location-${index}`}>Service Location</Label>
                          <Select
                            value={service.locationType || "office"}
                            onValueChange={(value) => {
                              const updatedServices = [...services];
                              updatedServices[index].locationType = value;
                              setServices(updatedServices);
                            }}
                          >
                            <SelectTrigger id={`service-location-${index}`}>
                              <SelectValue placeholder="Select location type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value={ServiceLocationType.OFFICE}>At My Office/Shop</SelectItem>
                              <SelectItem value={ServiceLocationType.CLIENT_LOCATION}>At Client's Location</SelectItem>
                              <SelectItem value={ServiceLocationType.ONLINE}>Online/Virtual</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div className="space-y-2">
                          <Label htmlFor={`service-description-${index}`}>Description</Label>
                          <Textarea
                            id={`service-description-${index}`}
                            value={service.description || ""}
                            onChange={(e) => {
                              const updatedServices = [...services];
                              updatedServices[index].description = e.target.value;
                              setServices(updatedServices);
                            }}
                            placeholder="Brief description of the service"
                            className="h-[80px]"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => setShowServicesDialog(false)}>Cancel</Button>
            <Button 
              type="button"
              onClick={() => {
                if (user) {
                  const updatedUser = {
                    ...user,
                    services: services
                  };
                  updateUser(updatedUser);
                  setShowServicesDialog(false);
                }
              }}
            >
              Save Services
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Personal Information Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Personal Information</h2>
          <div className="space-x-3">
            <Button variant="outline" onClick={() => setShowServicesDialog(true)}>Manage Services</Button>
            <Button onClick={handleEditProfileClick}>Edit Profile</Button>
          </div>
        </div>
        
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <div className="flex flex-col items-center">
                <Avatar className="h-32 w-32 border-2 border-muted">
                  {profile.avatar ? (
                    <AvatarImage src={profile.avatar} alt={profile.name} />
                  ) : (
                    <AvatarFallback className="bg-muted text-muted-foreground text-2xl font-medium">
                      {profile.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  )}
                </Avatar>
                {!profile.avatar && (
                  <p className="text-xs text-muted-foreground mt-2 text-center">
                    Click 'Edit Profile' to<br />add your photo
                  </p>
                )}
              </div>
              <div>
                <CardTitle className="text-2xl">{profile.name}</CardTitle>
                <CardDescription className="text-lg">{profile.title}</CardDescription>
                
                <div className="flex flex-wrap gap-2 mt-3">
                  {profile.skills.map(skill => (
                    <Badge key={skill} variant="secondary">{skill}</Badge>
                  ))}
                </div>
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
                <div className="flex items-center gap-2">
                  <Phone className="h-5 w-5 text-muted-foreground" />
                  <span>{profile.phone}</span>
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
                {profile.serviceArea && (
                  <div className="flex items-center gap-2">
                    <BriefcaseBusiness className="h-5 w-5 text-muted-foreground" />
                    <span>Service Area: {profile.serviceArea}</span>
                  </div>
                )}
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
                          <div className="flex flex-wrap gap-x-4 mt-1 text-sm text-muted-foreground">
                            <div className="flex items-center">
                              <Clock className="h-4 w-4 mr-1" />
                              <span>{service.duration} minutes</span>
                            </div>
                            
                            <div className="flex items-center">
                              <MapPin className="h-4 w-4 mr-1" />
                              <span>{
                                service.locationType === ServiceLocationType.OFFICE ? 'At my office' :
                                service.locationType === ServiceLocationType.CLIENT_LOCATION ? 'At client location' :
                                service.locationType === ServiceLocationType.ONLINE ? 'Online/Virtual' : 
                                'Location varies'
                              }</span>
                            </div>
                          </div>
                          
                          {service.description && (
                            <div className="mt-2 text-sm text-muted-foreground">
                              {service.description}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">About</h3>
                  <p className="text-muted-foreground">{profile.bio}</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Availability Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Availability</h2>
        <Card>
          <CardHeader>
            <CardTitle>Manage Availability</CardTitle>
            <CardDescription>
              Set your regular availability for client bookings
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex flex-col space-y-4">
                {Object.entries(profile.availability).map(([day, slots]) => (
                  <div key={day} className="border rounded-md p-4">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-medium capitalize">{day}</h3>
                      <div className="flex items-center">
                        <Switch 
                          id={`${day}-available`} 
                          checked={slots.morning || slots.afternoon || slots.evening}
                          onCheckedChange={(checked) => handleDayToggle(day, checked)}
                        />
                        <Label htmlFor={`${day}-available`} className="ml-2">
                          {slots.morning || slots.afternoon || slots.evening ? 'Available' : 'Unavailable'}
                        </Label>
                      </div>
                    </div>
                    
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`${day}-morning`} 
                          checked={slots.morning}
                          onCheckedChange={(checked) => handleSlotToggle(day, 'morning', !!checked)}
                          disabled={!(slots.morning || slots.afternoon || slots.evening)}
                        />
                        <label
                          htmlFor={`${day}-morning`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Morning (9AM-12PM)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`${day}-afternoon`} 
                          checked={slots.afternoon}
                          onCheckedChange={(checked) => handleSlotToggle(day, 'afternoon', !!checked)}
                          disabled={!(slots.morning || slots.afternoon || slots.evening)}
                        />
                        <label
                          htmlFor={`${day}-afternoon`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Afternoon (1PM-5PM)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox 
                          id={`${day}-evening`} 
                          checked={slots.evening}
                          onCheckedChange={(checked) => handleSlotToggle(day, 'evening', !!checked)}
                          disabled={!(slots.morning || slots.afternoon || slots.evening)}
                        />
                        <label
                          htmlFor={`${day}-evening`}
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Evening (5PM-9PM)
                        </label>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {/* Loyalty Settings Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Loyalty Settings</h2>
        <Card>
          <CardHeader>
            <CardTitle>Client Loyalty Management</CardTitle>
            <CardDescription>
              Set up how you want to handle returning versus new clients
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <Checkbox id="loyalty-discount" />
                  </div>
                  <div>
                    <label
                      htmlFor="loyalty-discount"
                      className="font-medium text-sm"
                    >
                      Offer loyalty discounts to returning clients
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Automatically apply a discount to clients who have booked with you more than 3 times
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <Checkbox id="priority-booking" />
                  </div>
                  <div>
                    <label
                      htmlFor="priority-booking"
                      className="font-medium text-sm"
                    >
                      Priority booking for loyal clients
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Allow returning clients to book appointments before they're available to new clients
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5">
                    <Checkbox id="followup-messages" defaultChecked />
                  </div>
                  <div>
                    <label
                      htmlFor="followup-messages"
                      className="font-medium text-sm"
                    >
                      Send personalized follow-up messages
                    </label>
                    <p className="text-sm text-muted-foreground">
                      Send different follow-up messages to new clients vs. returning clients
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}