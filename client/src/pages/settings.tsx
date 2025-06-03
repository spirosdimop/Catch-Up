import { useState } from "react";
import { PageTitle } from "@/components/ui/page-title";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Shield, 
  Palette, 
  Globe, 
  Briefcase, 
  Phone,
  MessageSquare,
  Calendar,
  Clock,
  Bot,
  Upload,
  Mail,
  Smartphone,
  Video,
  Plus,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/lib/userContext";
import { useAppSettings } from "@/lib/appSettingsContext";
import { useToast } from "@/hooks/use-toast";

export default function Settings() {
  const { user, updateUser } = useUser();
  const { settings, updateSettings } = useAppSettings();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    firstName: user?.firstName || "",
    lastName: user?.lastName || "",
    email: user?.email || "",
    businessName: user?.businessName || "",
    phone: user?.phone || "",
    profession: user?.profession || ""
  });

  // AI Assistant settings
  const [aiGreeting, setAiGreeting] = useState('');
  const [missedCallTemplate, setMissedCallTemplate] = useState('Hi {client_name}, I missed your call. Please book a convenient time: {booking_link}');
  const [followUpChannels, setFollowUpChannels] = useState<string[]>(['SMS']);
  const [followUpDelay, setFollowUpDelay] = useState('5');
  const [reminderFrequency, setReminderFrequency] = useState('once');
  const [assistantTone, setAssistantTone] = useState('friendly');
  const [responseLength, setResponseLength] = useState('medium');
  const [minimumNotice, setMinimumNotice] = useState('2');
  const [cancellationWindow, setCancellationWindow] = useState('24');

  // Time slots for each day
  const [timeSlots, setTimeSlots] = useState([
    { day: 'Monday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Tuesday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Wednesday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Thursday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Friday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Saturday', enabled: false, start: '09:00', end: '17:00' },
    { day: 'Sunday', enabled: false, start: '09:00', end: '17:00' },
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value
    }));
  };

  const handleChannelToggle = (channel: string) => {
    setFollowUpChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const updateTimeSlot = (index: number, field: string, value: any) => {
    setTimeSlots(prev => prev.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    ));
  };

  const handleSaveChanges = () => {
    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      // Update user context with form data
      if (user) {
        updateUser({
          ...formData
        });
      }
      
      toast({
        title: "Settings updated",
        description: "Your account information has been updated successfully.",
        variant: "default",
      });
      
      setIsSubmitting(false);
    }, 800);
  };
  
  return (
    <div className="space-y-6 p-6">
      <PageTitle 
        title="Settings" 
        description="Manage your account and application preferences" 
        icon={<SettingsIcon className="h-6 w-6 text-primary" />}
      />
      
      <Tabs defaultValue="account" className="w-full">
        <TabsList className="grid grid-cols-4 lg:grid-cols-8 md:w-fit">
          <TabsTrigger value="account" className="flex items-center gap-2">
            <User className="h-4 w-4" />
            <span className="hidden md:inline">Account</span>
          </TabsTrigger>
          <TabsTrigger value="messaging" className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            <span className="hidden md:inline">Messaging</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden md:inline">Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="ai" className="flex items-center gap-2">
            <Bot className="h-4 w-4" />
            <span className="hidden md:inline">AI</span>
          </TabsTrigger>
          <TabsTrigger value="notifications" className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <span className="hidden md:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <Shield className="h-4 w-4" />
            <span className="hidden md:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span className="hidden md:inline">Appearance</span>
          </TabsTrigger>
          <TabsTrigger value="language" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span className="hidden md:inline">Language</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="account" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Account Settings</CardTitle>
              <CardDescription>
                Manage your account information and preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input 
                      id="firstName" 
                      value={formData.firstName}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input 
                      id="lastName" 
                      value={formData.lastName}
                      onChange={handleInputChange}
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input 
                    id="email" 
                    type="email" 
                    value={formData.email}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input 
                    id="phone" 
                    type="tel" 
                    value={formData.phone}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="businessName">Business Name</Label>
                  <Input 
                    id="businessName"
                    value={formData.businessName}
                    onChange={handleInputChange}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="profession">Profession</Label>
                  <Input 
                    id="profession"
                    value={formData.profession}
                    onChange={handleInputChange}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="timeFormat">Time Format</Label>
                  <Select 
                    value={user?.timeFormat || '12'} 
                    onValueChange={(value: '12' | '24') => updateUser({ timeFormat: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12">12-hour (9:30 AM)</SelectItem>
                      <SelectItem value="24">24-hour (09:30)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="aiGreeting">AI Greeting Message</Label>
                  <Textarea
                    id="aiGreeting"
                    value={aiGreeting}
                    onChange={(e) => setAiGreeting(e.target.value)}
                    placeholder="Hello! I'm your AI assistant. How can I help you today?"
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="logoUpload">Business Logo</Label>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                    <Upload className="mx-auto h-12 w-12 text-gray-400" />
                    <div className="mt-2">
                      <Button variant="outline" className="flex items-center gap-2">
                        <Upload size={16} />
                        Upload Logo
                      </Button>
                    </div>
                    <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 2MB</p>
                  </div>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex justify-end">
                <Button 
                  onClick={handleSaveChanges}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="messaging" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare size={20} />
                Messaging Preferences
              </CardTitle>
              <CardDescription>
                Configure how your AI assistant handles messages and follow-ups
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="missedCallTemplate">Missed Call Message Template</Label>
                <Textarea
                  id="missedCallTemplate"
                  value={missedCallTemplate}
                  onChange={(e) => setMissedCallTemplate(e.target.value)}
                  rows={3}
                />
                <div className="flex flex-wrap gap-2 mt-2">
                  <Badge variant="outline">{'{client_name}'}</Badge>
                  <Badge variant="outline">{'{booking_link}'}</Badge>
                  <Badge variant="outline">{'{business_name}'}</Badge>
                  <Badge variant="outline">{'{date}'}</Badge>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Follow-up Channels</Label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="sms"
                      checked={followUpChannels.includes('SMS')}
                      onCheckedChange={() => handleChannelToggle('SMS')}
                    />
                    <label htmlFor="sms" className="flex items-center gap-2">
                      <Smartphone size={16} />
                      SMS
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="email"
                      checked={followUpChannels.includes('Email')}
                      onCheckedChange={() => handleChannelToggle('Email')}
                    />
                    <label htmlFor="email" className="flex items-center gap-2">
                      <Mail size={16} />
                      Email
                    </label>
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="whatsapp"
                      checked={followUpChannels.includes('WhatsApp')}
                      onCheckedChange={() => handleChannelToggle('WhatsApp')}
                    />
                    <label htmlFor="whatsapp" className="flex items-center gap-2">
                      <Phone size={16} />
                      WhatsApp
                    </label>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="followUpDelay">Delay Before Follow-up</Label>
                  <Select value={followUpDelay} onValueChange={setFollowUpDelay}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Immediate</SelectItem>
                      <SelectItem value="5">5 minutes</SelectItem>
                      <SelectItem value="10">10 minutes</SelectItem>
                      <SelectItem value="30">30 minutes</SelectItem>
                      <SelectItem value="custom">Custom</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="reminderFrequency">Reminder Frequency</Label>
                  <Select value={reminderFrequency} onValueChange={setReminderFrequency}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="once">Once only</SelectItem>
                      <SelectItem value="daily-3">Daily for 3 days</SelectItem>
                      <SelectItem value="daily-7">Daily for 7 days</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar size={20} />
                Appointment Settings
              </CardTitle>
              <CardDescription>
                Configure your calendar and booking preferences
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <Label>Connect Calendar</Label>
                <div className="flex flex-wrap gap-3">
                  <Button variant="outline" className="flex items-center gap-2">
                    <Calendar size={16} />
                    Connect Google Calendar
                  </Button>
                  <Button variant="outline" className="flex items-center gap-2">
                    <Calendar size={16} />
                    Connect Outlook
                  </Button>
                </div>
              </div>

              <div className="space-y-3">
                <Label>Available Time Slots</Label>
                <div className="space-y-3">
                  {timeSlots.map((slot, index) => (
                    <div key={slot.day} className="flex items-center gap-4 p-3 border rounded-lg">
                      <div className="flex items-center space-x-2 min-w-[100px]">
                        <Checkbox
                          checked={slot.enabled}
                          onCheckedChange={(checked) => updateTimeSlot(index, 'enabled', checked)}
                        />
                        <span className="font-medium">{slot.day}</span>
                      </div>
                      
                      {slot.enabled && (
                        <div className="flex items-center gap-2 flex-1">
                          <Input
                            type="time"
                            value={slot.start}
                            onChange={(e) => updateTimeSlot(index, 'start', e.target.value)}
                            className="w-32"
                          />
                          <span>to</span>
                          <Input
                            type="time"
                            value={slot.end}
                            onChange={(e) => updateTimeSlot(index, 'end', e.target.value)}
                            className="w-32"
                          />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="minimumNotice">Minimum Notice Time</Label>
                  <Select value={minimumNotice} onValueChange={setMinimumNotice}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 hour</SelectItem>
                      <SelectItem value="2">2 hours</SelectItem>
                      <SelectItem value="4">4 hours</SelectItem>
                      <SelectItem value="24">24 hours</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="cancellationWindow">Cancellation Window</Label>
                  <Select value={cancellationWindow} onValueChange={setCancellationWindow}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 hours before</SelectItem>
                      <SelectItem value="12">12 hours before</SelectItem>
                      <SelectItem value="24">24 hours before</SelectItem>
                      <SelectItem value="48">48 hours before</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ai" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bot size={20} />
                AI Behavior Customization
              </CardTitle>
              <CardDescription>
                Configure how your AI assistant behaves and responds
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="assistantTone">Assistant Tone</Label>
                  <Select value={assistantTone} onValueChange={setAssistantTone}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="friendly">Friendly</SelectItem>
                      <SelectItem value="professional">Professional</SelectItem>
                      <SelectItem value="casual">Casual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="responseLength">Response Length</Label>
                  <Select value={responseLength} onValueChange={setResponseLength}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="short">Short</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="detailed">Detailed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell size={20} />
                Notification Settings
              </CardTitle>
              <CardDescription>
                Configure how you receive notifications and alerts
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Booking Alerts</p>
                    <p className="text-sm text-muted-foreground">Get notified when clients book appointments</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Missed Call Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive alerts when calls are missed</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily Summary</p>
                    <p className="text-sm text-muted-foreground">Get a daily report of your activities and bookings</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Email Notifications</p>
                    <p className="text-sm text-muted-foreground">Receive emails about your account activity</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Project Reminders</p>
                    <p className="text-sm text-muted-foreground">Get notified about upcoming deadlines</p>
                  </div>
                  <Switch defaultChecked />
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">New Messages</p>
                    <p className="text-sm text-muted-foreground">Receive notifications for new messages</p>
                  </div>
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Security Settings</CardTitle>
              <CardDescription>
                Manage your account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-lg font-medium">Change Password</h3>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="currentPassword">Current Password</Label>
                    <Input id="currentPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="newPassword">New Password</Label>
                    <Input id="newPassword" type="password" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm New Password</Label>
                    <Input id="confirmPassword" type="password" />
                  </div>
                  <Button>Update Password</Button>
                </div>
              </div>
              
              <Separator />
              
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Two-Factor Authentication</p>
                  <p className="text-sm text-muted-foreground">Add an extra layer of security to your account</p>
                </div>
                <Button variant="outline">Enable</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Appearance Settings</CardTitle>
              <CardDescription>
                Customize the look and feel of the application
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-2">Theme</h3>
                  <div className="grid grid-cols-3 gap-2">
                    <Button variant="outline" className="flex flex-col items-center justify-center h-20 border-2 border-primary">
                      <span className="block w-8 h-8 rounded-full bg-white mb-2 ring-2 ring-inset ring-black/10"></span>
                      <span>Light</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col items-center justify-center h-20">
                      <span className="block w-8 h-8 rounded-full bg-slate-950 mb-2 ring-2 ring-inset ring-white/10"></span>
                      <span>Dark</span>
                    </Button>
                    <Button variant="outline" className="flex flex-col items-center justify-center h-20">
                      <span className="block w-8 h-8 rounded-full bg-gradient-to-r from-white to-slate-950 mb-2 ring-2 ring-inset ring-black/10"></span>
                      <span>System</span>
                    </Button>
                  </div>
                </div>
                
                <Separator />
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Compact Mode</p>
                    <p className="text-sm text-muted-foreground">Reduce spacing and size of elements</p>
                  </div>
                  <Switch />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="language" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Language Settings</CardTitle>
              <CardDescription>
                Choose your preferred language for the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Application Language</Label>
                  <Select 
                    defaultValue={settings.language}
                    onValueChange={(value) => {
                      updateSettings({ language: value });
                      toast({
                        title: "Language updated",
                        description: "Your language preference has been updated.",
                      });
                    }}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="Select a language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish (Español)</SelectItem>
                      <SelectItem value="fr">French (Français)</SelectItem>
                      <SelectItem value="de">German (Deutsch)</SelectItem>
                      <SelectItem value="zh">Chinese (中文)</SelectItem>
                      <SelectItem value="ja">Japanese (日本語)</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-sm text-muted-foreground">
                    This will change the language throughout the application
                  </p>
                </div>
                
                <div className="pt-4">
                  <p className="text-sm text-muted-foreground mb-2">
                    You can also change the language using the AI Assistant with commands like:
                  </p>
                  <div className="bg-muted p-3 rounded-md text-sm font-mono">
                    "Change language to Spanish"
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}