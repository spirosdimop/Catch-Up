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
import { EventTemplate, EventType } from "@shared/schema";
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
          { name: "Consultation", duration: 60, price: 100 },
          { name: "Follow-up", duration: 30, price: 50 }
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
                  onChange={handleProfileInputChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input 
                  id="lastName" 
                  name="lastName" 
                  value={profileForm.lastName} 
                  onChange={handleProfileInputChange} 
                  required 
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input 
                  id="email" 
                  name="email" 
                  type="email" 
                  value={profileForm.email} 
                  onChange={handleProfileInputChange} 
                  required 
                />
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
                <Label htmlFor="profileImage">Profile Image URL</Label>
                <Input 
                  id="profileImage" 
                  name="profileImageUrl" 
                  value={profileForm.profileImageUrl} 
                  onChange={handleProfileInputChange} 
                  placeholder="URL to your profile image" 
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditProfileDialog(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Personal Information Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Personal Information</h2>
          <Button onClick={handleEditProfileClick}>Edit Profile</Button>
        </div>
        
        <Card>
          <CardHeader className="pb-4">
            <div className="flex flex-col md:flex-row md:items-center gap-6">
              <Avatar className="h-24 w-24">
                {profile.avatar ? (
                  <AvatarImage src={profile.avatar} alt={profile.name} />
                ) : (
                  <AvatarFallback className="bg-primary text-primary-foreground text-lg font-medium">
                    {profile.name.split(' ').map(n => n[0]).join('')}
                  </AvatarFallback>
                )}
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