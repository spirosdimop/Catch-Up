import { useEffect, useState } from "react";
import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
  BriefcaseBusiness 
} from "lucide-react";
import { format, addDays } from "date-fns";
import { useUser } from "@/lib/userContext";
import { EventTemplate, EventType } from "@shared/schema";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Profile() {
  const [tab, setTab] = useState("profile");
  const { user, setUser } = useUser();
  
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
        method: 'PUT', // Changed from PATCH to PUT to match server endpoint
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
  
  // Debugging user data
  useEffect(() => {
    console.log('Current user:', user);
  }, [user]);
  
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
    e.preventDefault(); // Prevent the default form submission
    console.log('Form submission event:', e);
    console.log('Form submission, user context:', user);
    
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
    
    console.log('Prepared template data for submission:', templateData);
    
    try {
      if (editingTemplate) {
        console.log('Updating existing template with ID:', editingTemplate.id);
        updateTemplateMutation.mutate({
          ...templateData,
          id: editingTemplate.id,
        });
      } else {
        console.log('Creating new template');
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
    <div className="space-y-6">
      
      {/* Template create/edit dialog */}
      <Dialog 
        open={showNewTemplateDialog} 
        onOpenChange={(open) => {
          console.log('Dialog open state changing to:', open);
          if (!open) {
            // Only allow closing if we're not in the middle of a mutation
            if (!createTemplateMutation.isPending && !updateTemplateMutation.isPending) {
              setShowNewTemplateDialog(false);
              resetTemplateForm();
              setEditingTemplate(null);
            } else {
              console.log('Cannot close dialog during mutation');
              // Prevent dialog from closing during mutation
              return;
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
              {editingTemplate 
                ? 'Update this template for quick scheduling with clients'
                : 'Create a reusable template for quick scheduling'}
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
                  placeholder="Office or Virtual"
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
                  onValueChange={(value) => {
                    const eventTypeValue = value as "private" | "busy" | "available" | "travel" | "client_meeting" | "consultation" | "project_work" | "follow_up" | "training";
                    setTemplateForm(prev => ({ ...prev, eventType: eventTypeValue }));
                  }}
                >
                  <SelectTrigger className="col-span-3">
                    <SelectValue placeholder="Select event type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="client_meeting">Client Meeting</SelectItem>
                    <SelectItem value="consultation">Consultation</SelectItem>
                    <SelectItem value="project_work">Project Work</SelectItem>
                    <SelectItem value="follow_up">Follow-up</SelectItem>
                    <SelectItem value="training">Training</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="color" className="text-right">
                  Color
                </Label>
                <Input
                  id="color"
                  name="color"
                  type="color"
                  className="col-span-3 w-16 h-8 p-1"
                  value={templateForm.color}
                  onChange={handleTemplateInputChange}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="description" className="text-right">
                  Description
                </Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Template description..."
                  className="col-span-3"
                  value={templateForm.description}
                  onChange={handleTemplateInputChange}
                />
              </div>
              
              <div className="grid grid-cols-4 items-center gap-4">
                <div className="text-right">Visibility</div>
                <div className="flex items-center space-x-2 col-span-3">
                  <Checkbox 
                    id="isPublic" 
                    checked={templateForm.isPublic}
                    onCheckedChange={(checked) => handleTemplateCheckboxChange('isPublic', !!checked)}
                  />
                  <Label htmlFor="isPublic">
                    Make public (visible on your booking page)
                  </Label>
                </div>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => {
                  setEditingTemplate(null);
                  resetTemplateForm();
                  setShowNewTemplateDialog(false);
                }}
              >
                Cancel
              </Button>
              <Button 
                type="button" // Changed from submit to button
                disabled={createTemplateMutation.isPending || updateTemplateMutation.isPending}
                onClick={(e) => {
                  e.preventDefault();
                  console.log("Submit button clicked");
                  
                  // Call the submit handler directly
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
                  
                  console.log('Submitting template directly from button:', templateData);
                  
                  try {
                    if (editingTemplate) {
                      // Direct API call for updating
                      console.log('Direct update API call for template:', templateData);
                      fetch(`/api/event-templates/${editingTemplate.id}`, {
                        method: 'PUT',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(templateData),
                      })
                      .then(response => {
                        if (!response.ok) {
                          return response.json().then(err => {
                            throw new Error(JSON.stringify(err));
                          });
                        }
                        return response.json();
                      })
                      .then(data => {
                        console.log('Template updated successfully:', data);
                        queryClient.invalidateQueries({ queryKey: ['/api/event-templates', user?.id] });
                        setShowNewTemplateDialog(false);
                        resetTemplateForm();
                        setEditingTemplate(null);
                      })
                      .catch(error => {
                        console.error('Error updating template:', error);
                      });
                    } else {
                      // Direct API call for creation
                      console.log('Direct create API call for template:', templateData);
                      fetch('/api/event-templates', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(templateData),
                      })
                      .then(response => {
                        if (!response.ok) {
                          return response.json().then(err => {
                            throw new Error(JSON.stringify(err));
                          });
                        }
                        return response.json();
                      })
                      .then(data => {
                        console.log('Template created successfully:', data);
                        queryClient.invalidateQueries({ queryKey: ['/api/event-templates', user?.id] });
                        setShowNewTemplateDialog(false);
                        resetTemplateForm();
                      })
                      .catch(error => {
                        console.error('Error creating template:', error);
                      });
                    }
                  } catch (error) {
                    console.error('Error in button click handler:', error);
                  }
                }}
              >
                {/* Use a state variable to track API call status */}
                {editingTemplate ? 'Update Template' : 'Create Template'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      
      <PageTitle 
        title="Professional Profile" 
        description="Manage your public profile and booking availability"
        icon={<UserCircle className="h-6 w-6 text-primary" />}
      />
      
      <Tabs defaultValue="profile" className="w-full" value={tab} onValueChange={setTab}>
        <TabsList className="grid grid-cols-4 w-[600px]">
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="booking">Booking</TabsTrigger>
          <TabsTrigger value="templates">Event Templates</TabsTrigger>
          <TabsTrigger value="availability">Availability</TabsTrigger>
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
        
        {/* Event Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
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
                  <path d="M12 5v14M5 12h14"/>
                </svg>
                Add Template
              </Button>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-2">
                {templates.length === 0 ? (
                  /* Empty state */
                  <div className="col-span-full py-12 text-center">
                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-muted mb-4">
                      <Calendar className="h-6 w-6 text-muted-foreground" />
                    </div>
                    <h3 className="text-lg font-medium">No templates yet</h3>
                    <p className="text-muted-foreground mt-2 mb-4">
                      Create your first event template to enable quick scheduling
                    </p>
                    <Button onClick={() => setShowNewTemplateDialog(true)}>
                      Create Template
                    </Button>
                  </div>
                ) : (
                  /* Template cards */
                  templates.map(template => (
                    <Card key={template.id} className="overflow-hidden">
                      <CardHeader className="p-4 pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-md">{template.name}</CardTitle>
                          <div className="flex gap-2 ml-auto">
                            <Button 
                              variant="ghost" 
                              size="icon"
                              onClick={() => handleEditTemplate(template)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/>
                                <path d="m15 5 4 4"/>
                              </svg>
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-destructive"
                              onClick={() => handleDeleteTemplate(template.id)}
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h18"/>
                                <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/>
                                <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/>
                                <line x1="10" x2="10" y1="11" y2="17"/>
                                <line x1="14" x2="14" y1="11" y2="17"/>
                              </svg>
                            </Button>
                          </div>
                        </div>
                      </CardHeader>
                      <CardContent className="p-4 pt-2">
                        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                          <Clock className="h-4 w-4" />
                          <span>{template.duration} minutes</span>
                        </div>
                        {template.description && (
                          <p className="text-sm mt-2">{template.description}</p>
                        )}
                        <Badge 
                          variant="outline" 
                          className="mt-3" 
                          style={{ 
                            backgroundColor: template.color || '#f0f0f0',
                            color: template.color ? '#fff' : 'inherit'
                          }}
                        >
                          {template.eventType}
                        </Badge>
                      </CardContent>
                    </Card>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        {/* Availability Tab */}
        <TabsContent value="availability" className="space-y-6">
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
                    <div key={day} className="flex flex-col space-y-2">
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium capitalize">{day}</h3>
                        <div className="flex items-center space-x-2">
                          <Switch 
                            id={`${day}-toggle`} 
                            checked={slots.morning || slots.afternoon || slots.evening}
                            onCheckedChange={(checked) => handleDayToggle(day, checked)}
                          />
                          <Label htmlFor={`${day}-toggle`}>Available</Label>
                        </div>
                      </div>
                      
                      {(slots.morning || slots.afternoon || slots.evening) && (
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pl-4 pt-2">
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`${day}-morning`} 
                              checked={slots.morning}
                              onCheckedChange={(checked) => handleSlotToggle(day, 'morning', !!checked)}
                            />
                            <Label htmlFor={`${day}-morning`}>Morning (9am - 12pm)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`${day}-afternoon`} 
                              checked={slots.afternoon}
                              onCheckedChange={(checked) => handleSlotToggle(day, 'afternoon', !!checked)}
                            />
                            <Label htmlFor={`${day}-afternoon`}>Afternoon (1pm - 5pm)</Label>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Checkbox 
                              id={`${day}-evening`} 
                              checked={slots.evening}
                              onCheckedChange={(checked) => handleSlotToggle(day, 'evening', !!checked)}
                            />
                            <Label htmlFor={`${day}-evening`}>Evening (5pm - 8pm)</Label>
                          </div>
                        </div>
                      )}
                      
                      <Separator className="mt-2" />
                    </div>
                  ))}
                </div>
                
                <div className="flex flex-col space-y-4">
                  <h3 className="font-medium">Booking Settings</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="min-notice">Minimum notice time</Label>
                      <Select defaultValue="1h">
                        <SelectTrigger id="min-notice">
                          <SelectValue placeholder="Select minimum notice" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="30m">30 minutes</SelectItem>
                          <SelectItem value="1h">1 hour</SelectItem>
                          <SelectItem value="2h">2 hours</SelectItem>
                          <SelectItem value="4h">4 hours</SelectItem>
                          <SelectItem value="1d">1 day</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        How far in advance clients need to book
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <Label htmlFor="buffer-time">Buffer time between appointments</Label>
                      <Select defaultValue="15m">
                        <SelectTrigger id="buffer-time">
                          <SelectValue placeholder="Select buffer time" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">No buffer</SelectItem>
                          <SelectItem value="5m">5 minutes</SelectItem>
                          <SelectItem value="10m">10 minutes</SelectItem>
                          <SelectItem value="15m">15 minutes</SelectItem>
                          <SelectItem value="30m">30 minutes</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Time between consecutive appointments
                      </p>
                    </div>
                  </div>
                </div>
                
                <div className="pt-4">
                  <Button>Save Availability</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}