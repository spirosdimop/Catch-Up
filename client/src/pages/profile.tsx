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
        profileImageUrl: "https://randomuser.me/api/portraits/men/1.jpg",
        voicemailMessage: "Hello, you've reached Test Business. I'm currently unavailable but please leave a message and I'll get back to you as soon as possible.",
        smsFollowUpMessage: "Hi, this is Test from Test Business. Sorry I missed your call. You can book an appointment at: https://mybooking.com/test",
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
    voicemailMessage: user?.voicemailMessage || "",
    smsFollowUpMessage: user?.smsFollowUpMessage || "",
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
  
  // State for event templates and dialog
  const [showNewTemplateDialog, setShowNewTemplateDialog] = useState(false);
  const [templates, setTemplates] = useState<EventTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] = useState<EventTemplate | null>(null);
  
  // Form state for template creation/editing
  const [templateForm, setTemplateForm] = useState({
    name: '',
    title: '',
    duration: 30,
    description: '',
    location: '',
    eventType: 'client_meeting' as "private" | "busy" | "available" | "travel" | "client_meeting" | "consultation" | "project_work" | "follow_up" | "training",
    isPublic: true,
    color: '#4f46e5', // Default indigo color
  });
  
  const queryClient = useQueryClient();
  
  // Template loading from API
  const { data: templateData, isLoading: templatesLoading, error: templatesError } = useQuery({
    queryKey: ['/api/event-templates', user?.id],
    queryFn: async () => {
      console.log('Fetching templates for user ID:', user?.id);
      if (!user?.id) {
        console.log('No user ID available for fetching templates');
        return [];
      }
      const response = await fetch(`/api/event-templates/${user.id}`);
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Failed to fetch templates:', response.status, errorData);
        throw new Error(`Failed to fetch templates: ${response.status}`);
      }
      const data = await response.json();
      console.log('Fetched templates:', data);
      return data;
    },
    enabled: !!user?.id,
  });
  
  // Create template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async (newTemplate: Partial<EventTemplate>) => {
      console.log('Submitting template data:', newTemplate);
      
      const response = await fetch('/api/event-templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newTemplate),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Template creation failed:', response.status, errorData);
        throw new Error(`Failed to create template: ${response.status} ${errorData ? JSON.stringify(errorData) : ''}`);
      }
      
      const result = await response.json();
      console.log('Template created successfully:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Template creation successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['/api/event-templates', user?.id] });
      setShowNewTemplateDialog(false);
      resetTemplateForm();
    },
    onError: (error) => {
      console.error('Template creation error:', error);
    }
  });
  
  // Update template mutation
  const updateTemplateMutation = useMutation({
    mutationFn: async (updatedTemplate: Partial<EventTemplate>) => {
      console.log('Updating template data:', updatedTemplate);
      
      const response = await fetch(`/api/event-templates/${updatedTemplate.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updatedTemplate),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Template update failed:', response.status, errorData);
        throw new Error(`Failed to update template: ${response.status} ${errorData ? JSON.stringify(errorData) : ''}`);
      }
      
      const result = await response.json();
      console.log('Template updated successfully:', result);
      return result;
    },
    onSuccess: () => {
      console.log('Template update successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['/api/event-templates', user?.id] });
      setShowNewTemplateDialog(false);
      setEditingTemplate(null);
      resetTemplateForm();
    },
    onError: (error) => {
      console.error('Template update error:', error);
    }
  });
  
  // Delete template mutation
  const deleteTemplateMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log('Deleting template with ID:', id);
      
      const response = await fetch(`/api/event-templates/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        console.error('Template deletion failed:', response.status, errorData);
        throw new Error(`Failed to delete template: ${response.status} ${errorData ? JSON.stringify(errorData) : ''}`);
      }
      
      console.log('Template deleted successfully');
      return true;
    },
    onSuccess: () => {
      console.log('Template deletion successful, invalidating queries');
      queryClient.invalidateQueries({ queryKey: ['/api/event-templates', user?.id] });
    },
    onError: (error) => {
      console.error('Template deletion error:', error);
    }
  });
  
  // Load templates when data is available
  useEffect(() => {
    if (templateData && Array.isArray(templateData)) {
      setTemplates(templateData);
      console.log('Loaded templates:', templateData);
    }
  }, [templateData]);
  
  // Reset template form
  const resetTemplateForm = () => {
    setTemplateForm({
      name: '',
      title: '',
      duration: 30,
      description: '',
      location: '',
      eventType: 'client_meeting',
      isPublic: true,
      color: '#4f46e5',
    });
  };
  
  // Handle template form input change
  const handleTemplateInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'eventType') {
      // Ensure eventType is properly typed
      const eventTypeValue = value as "private" | "busy" | "available" | "travel" | "client_meeting" | "consultation" | "project_work" | "follow_up" | "training";
      setTemplateForm(prev => ({
        ...prev,
        [name]: eventTypeValue
      }));
    } else {
      setTemplateForm(prev => ({
        ...prev,
        [name]: value,
      }));
    }
  };
  
  // Handle checkbox change
  const handleTemplateCheckboxChange = (name: string, checked: boolean) => {
    setTemplateForm(prev => ({
      ...prev,
      [name]: checked,
    }));
  };
  
  // Handle template submit
  const handleTemplateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!user || !user.id) {
      console.error('Cannot create template: No user ID available');
      alert('Please log in to create templates');
      return;
    }
    
    const templateData = {
      ...templateForm,
      userId: user.id,
      duration: Number(templateForm.duration),
    };
    
    try {
      if (editingTemplate) {
        updateTemplateMutation.mutate({
          ...templateData,
          id: editingTemplate.id,
        });
      } else {
        createTemplateMutation.mutate(templateData);
      }
    } catch (error) {
      console.error('Error submitting template form:', error);
    }
  };
  
  // Event template handlers
  const handleEditTemplate = (template: EventTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      title: template.title,
      duration: template.duration,
      description: template.description || '',
      location: template.location || '',
      eventType: template.eventType,
      isPublic: template.isPublic,
      color: template.color || '#4f46e5',
    });
    setShowNewTemplateDialog(true);
  };
  
  const handleDeleteTemplate = (id: number) => {
    if (confirm('Are you sure you want to delete this template?')) {
      deleteTemplateMutation.mutate(id);
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
    profileImageUrl: "",
    voicemailMessage: "",
    smsFollowUpMessage: ""
  });
  
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
        profileImageUrl: user.profileImageUrl || "",
        voicemailMessage: user.voicemailMessage || "",
        smsFollowUpMessage: user.smsFollowUpMessage || ""
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

  return (
    <div className="space-y-10">
      <PageTitle title="Profile" description="Manage your professional profile information" />
      
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
            
            <div className="space-y-2">
              <Label htmlFor="voicemailMessage">Custom Voicemail Message</Label>
              <Textarea 
                id="voicemailMessage" 
                name="voicemailMessage" 
                value={profileForm.voicemailMessage} 
                onChange={handleProfileInputChange} 
                placeholder="Enter your personalized voicemail greeting for missed calls" 
                className="min-h-[100px]"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="smsFollowUpMessage">SMS Follow-Up Message</Label>
              <Textarea 
                id="smsFollowUpMessage" 
                name="smsFollowUpMessage" 
                value={profileForm.smsFollowUpMessage} 
                onChange={handleProfileInputChange} 
                placeholder="Create a short, polite SMS to send after a missed call, including the link to your booking page" 
                className="min-h-[100px]"
              />
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowEditProfileDialog(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Template create/edit dialog */}
      <Dialog 
        open={showNewTemplateDialog} 
        onOpenChange={(open) => {
          if (!open) {
            if (!createTemplateMutation.isPending && !updateTemplateMutation.isPending) {
              setShowNewTemplateDialog(false);
              resetTemplateForm();
              setEditingTemplate(null);
            }
          } else {
            setShowNewTemplateDialog(true);
          }
        }}
      >
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? 'Edit Event Template' : 'Create Event Template'}
            </DialogTitle>
            <DialogDescription>
              Create templates for events that you schedule regularly.
            </DialogDescription>
          </DialogHeader>
          
          <form onSubmit={handleTemplateSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="name" className="text-right">
                  Template Name
                </Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Client Consultation"
                  className="col-span-3"
                  value={templateForm.name}
                  onChange={handleTemplateInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="title" className="text-right">
                  Event Title
                </Label>
                <Input
                  id="title"
                  name="title"
                  placeholder="Initial Consultation"
                  className="col-span-3"
                  value={templateForm.title}
                  onChange={handleTemplateInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="duration" className="text-right">
                  Duration (min)
                </Label>
                <Input
                  id="duration"
                  name="duration"
                  type="number"
                  min="15"
                  step="15"
                  className="col-span-3"
                  value={templateForm.duration}
                  onChange={handleTemplateInputChange}
                  required
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="location" className="text-right">
                  Location
                </Label>
                <Input
                  id="location"
                  name="location"
                  placeholder="Office or Client Location"
                  className="col-span-3"
                  value={templateForm.location}
                  onChange={handleTemplateInputChange}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="eventType" className="text-right">
                  Event Type
                </Label>
                <Select 
                  name="eventType" 
                  value={templateForm.eventType}
                  onValueChange={(value) => setTemplateForm(prev => ({ ...prev, eventType: value as any }))}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client_meeting">Client Meeting</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="project_work">Project Work</SelectItem>
                    <SelectItem value="travel">Travel Time</SelectItem>
                    <SelectItem value="private">Private</SelectItem>
                    <SelectItem value="busy">Busy</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">
                  Color
                </Label>
                <div className="col-span-3 flex gap-2 items-center">
                  <Input
                    id="color"
                    name="color"
                    type="color"
                    className="w-12 h-8 p-1"
                    value={templateForm.color}
                    onChange={handleTemplateInputChange}
                  />
                  <span className="text-sm text-muted-foreground">
                    Event color in calendar
                  </span>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label className="text-right">
                  Public Booking
                </Label>
                <div className="flex items-center col-span-3 space-x-2">
                  <Checkbox 
                    id="isPublic" 
                    checked={templateForm.isPublic}
                    onCheckedChange={(checked) => 
                      handleTemplateCheckboxChange('isPublic', checked as boolean)
                    }
                  />
                  <label
                    htmlFor="isPublic"
                    className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                  >
                    Available for clients to book online
                  </label>
                </div>
              </div>
              
              <div className="grid grid-cols-4 items-start gap-4">
                <Label htmlFor="description" className="text-right pt-2">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Details about this event template"
                  className="col-span-3"
                  rows={3}
                  value={templateForm.description}
                  onChange={handleTemplateInputChange}
                />
              </div>
            </div>
            
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowNewTemplateDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}>
                {createTemplateMutation.isPending || updateTemplateMutation.isPending
                  ? 'Saving...'
                  : editingTemplate
                    ? 'Update Template'
                    : 'Create Template'
                }
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      {/* Personal Information Section */}
      <div className="space-y-6">
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
                <Button className="w-full md:w-auto" onClick={handleEditProfileClick}>Edit Profile</Button>
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
                
                {profile.voicemailMessage && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">Voicemail Message</h3>
                    <Card className="p-3 bg-gray-50">
                      <p className="text-sm text-muted-foreground italic">"{profile.voicemailMessage}"</p>
                    </Card>
                  </div>
                )}
                
                {profile.smsFollowUpMessage && (
                  <div>
                    <h3 className="text-lg font-medium mb-2">SMS Follow-Up</h3>
                    <Card className="p-3 bg-gray-50">
                      <p className="text-sm text-muted-foreground italic">"{profile.smsFollowUpMessage}"</p>
                    </Card>
                  </div>
                )}
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
      
      {/* Booking System Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Book an Appointment</h2>
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
                <CheckCircle2 className="w-16 h-16 mx-auto text-green-500" />
                <h3 className="text-xl font-medium">Booking Confirmed!</h3>
                <p className="text-muted-foreground">
                  Your appointment has been scheduled for:
                  <br />
                  <span className="font-medium">{selectedDate} at {selectedTime}</span>
                </p>
                <Button 
                  onClick={() => setBookingStep(1)} 
                  className="mt-4"
                >
                  Book Another Appointment
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className={`${bookingStep !== 1 ? 'hidden' : ''}`}>
                  <h3 className="font-medium mb-4">Select a date:</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-7 gap-3">
                    {availableDays.map((day, index) => (
                      <div 
                        key={index}
                        className={`p-3 border rounded-lg text-center cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedDate === day.date ? 'border-primary bg-primary/10' : ''
                        } ${day.slots.length === 0 ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => day.slots.length > 0 && handleDateSelect(day.date)}
                      >
                        <div className="font-medium">{day.day}</div>
                        <div className="text-sm text-muted-foreground">{day.date}</div>
                        <div className="mt-2 text-xs">
                          {day.slots.length > 0 ? (
                            <Badge variant="outline" className="w-full">
                              {day.slots.length} slots
                            </Badge>
                          ) : (
                            <Badge variant="outline" className="w-full bg-gray-100">
                              No availability
                            </Badge>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={`${bookingStep !== 2 ? 'hidden' : ''}`}>
                  <div className="flex items-center mb-4">
                    <Button 
                      variant="ghost" 
                      className="p-0 h-auto mr-2" 
                      onClick={() => setBookingStep(1)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </Button>
                    <h3 className="font-medium">Select a time for {selectedDate}:</h3>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {availableDays.find(day => day.date === selectedDate)?.slots.map((slot, index) => (
                      <div 
                        key={index}
                        className={`p-3 border rounded-lg text-center cursor-pointer hover:bg-gray-50 transition-colors ${
                          selectedTime === slot.time ? 'border-primary bg-primary/10' : ''
                        }`}
                        onClick={() => handleTimeSelect(slot.time)}
                      >
                        {slot.time}
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className={`${bookingStep !== 3 ? 'hidden' : ''}`}>
                  <div className="flex items-center mb-4">
                    <Button 
                      variant="ghost" 
                      className="p-0 h-auto mr-2" 
                      onClick={() => setBookingStep(2)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15 18l-6-6 6-6" />
                      </svg>
                    </Button>
                    <h3 className="font-medium">Confirm your booking:</h3>
                  </div>
                  
                  <div className="border rounded-lg p-4 mb-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-muted-foreground">Date</p>
                        <p className="font-medium">{selectedDate}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Time</p>
                        <p className="font-medium">{selectedTime}</p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Service</p>
                        <p className="font-medium">
                          {user?.services?.[0]?.name || "Consultation"}
                        </p>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-medium">
                          {user?.services?.[0]?.duration || "60"} minutes
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  <form onSubmit={handleBookingSubmit}>
                    <div className="space-y-4">
                      <Button type="submit" className="w-full">
                        Confirm Booking
                      </Button>
                    </div>
                  </form>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
      
      {/* Event Templates Section */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">Event Templates</h2>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle>Event Templates</CardTitle>
              <CardDescription>
                Create reusable event templates for quick scheduling
              </CardDescription>
            </div>
            <Button variant="outline" className="gap-1" onClick={() => setShowNewTemplateDialog(true)}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              New Template
            </Button>
          </CardHeader>
          <CardContent>
            {templatesLoading ? (
              <div className="text-center py-8">
                <p>Loading templates...</p>
              </div>
            ) : templates.length === 0 ? (
              <div className="text-center py-8 space-y-3">
                <div className="mx-auto w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-gray-500" />
                </div>
                <h3 className="font-medium">No templates yet</h3>
                <p className="text-sm text-muted-foreground">
                  Create event templates to quickly schedule recurring events
                </p>
                <Button onClick={() => setShowNewTemplateDialog(true)}>
                  Create Template
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                {templates.map((template) => (
                  <div key={template.id} className="border rounded-md p-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-medium text-lg">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.title}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleEditTemplate(template)}
                        >
                          Edit
                        </Button>
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleDeleteTemplate(template.id)}
                        >
                          Delete
                        </Button>
                      </div>
                    </div>
                    
                    <div className="mt-3 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-2 text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-muted-foreground" />
                        <span>{template.duration} minutes</span>
                      </div>
                      {template.location && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-muted-foreground" />
                          <span>{template.location}</span>
                        </div>
                      )}
                      <div className="flex items-center">
                        <span 
                          className="h-3 w-3 rounded-full mr-1"
                          style={{ backgroundColor: template.color || '#4f46e5' }}
                        ></span>
                        <span className="capitalize">{template.eventType.replace('_', ' ')}</span>
                      </div>
                      <div className="flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1 text-muted-foreground">
                          <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span>{template.isPublic ? 'Public booking' : 'Private'}</span>
                      </div>
                    </div>
                    
                    {template.description && (
                      <div className="mt-3 text-sm text-muted-foreground">
                        {template.description}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}