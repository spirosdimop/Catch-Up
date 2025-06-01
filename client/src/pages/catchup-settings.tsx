import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  Phone, 
  MessageSquare, 
  Calendar, 
  Clock, 
  Bell, 
  User, 
  Bot,
  Mail,
  Smartphone,
  Video,
  Save,
  Plus,
  Trash2
} from 'lucide-react';

interface TimeSlot {
  day: string;
  enabled: boolean;
  start: string;
  end: string;
}

export default function CatchUpSettings() {
  const [businessName, setBusinessName] = useState('');
  const [businessPhone, setBusinessPhone] = useState('');
  const [aiGreeting, setAiGreeting] = useState('');
  const [missedCallTemplate, setMissedCallTemplate] = useState('Hi {client_name}, I missed your call. Please book a convenient time: {booking_link}');
  const [followUpChannels, setFollowUpChannels] = useState<string[]>(['SMS']);
  const [followUpDelay, setFollowUpDelay] = useState('5');
  const [reminderFrequency, setReminderFrequency] = useState('once');
  const [assistantTone, setAssistantTone] = useState('friendly');
  const [responseLength, setResponseLength] = useState('medium');
  const [minimumNotice, setMinimumNotice] = useState('2');
  const [cancellationWindow, setCancellationWindow] = useState('24');
  
  // Notification toggles
  const [notifyOnBooking, setNotifyOnBooking] = useState(true);
  const [dailySummary, setDailySummary] = useState(false);
  
  // Time slots for each day
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([
    { day: 'Monday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Tuesday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Wednesday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Thursday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Friday', enabled: true, start: '09:00', end: '17:00' },
    { day: 'Saturday', enabled: false, start: '09:00', end: '17:00' },
    { day: 'Sunday', enabled: false, start: '09:00', end: '17:00' },
  ]);

  const handleChannelToggle = (channel: string) => {
    setFollowUpChannels(prev => 
      prev.includes(channel) 
        ? prev.filter(c => c !== channel)
        : [...prev, channel]
    );
  };

  const updateTimeSlot = (index: number, field: keyof TimeSlot, value: any) => {
    setTimeSlots(prev => prev.map((slot, i) => 
      i === index ? { ...slot, [field]: value } : slot
    ));
  };

  const handleSave = () => {
    console.log('Saving settings...');
    // Add save logic here
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Settings</h1>
            <p className="text-gray-600">Customize your CatchUp AI assistant</p>
          </div>
          <Button onClick={handleSave} className="flex items-center gap-2">
            <Save size={16} />
            Save Changes
          </Button>
        </div>

        {/* Profile & Business Branding */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              Profile & Business Branding
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="businessName">Business Name</Label>
                <Input
                  id="businessName"
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  placeholder="Enter your business name"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="businessPhone">Business Phone Number</Label>
                <Input
                  id="businessPhone"
                  type="tel"
                  value={businessPhone}
                  onChange={(e) => setBusinessPhone(e.target.value)}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
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
          </CardContent>
        </Card>

        {/* Messaging Preferences */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare size={20} />
              Messaging Preferences
            </CardTitle>
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

        {/* Appointment Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar size={20} />
              Appointment Settings
            </CardTitle>
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

        {/* AI Behavior Customization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bot size={20} />
              AI Behavior Customization
            </CardTitle>
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

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell size={20} />
              Notification Settings
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notify me on new bookings</Label>
                  <p className="text-sm text-gray-500">Get notified when someone books an appointment</p>
                </div>
                <Switch
                  checked={notifyOnBooking}
                  onCheckedChange={setNotifyOnBooking}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Daily summary email</Label>
                  <p className="text-sm text-gray-500">Receive a daily summary of activities</p>
                </div>
                <Switch
                  checked={dailySummary}
                  onCheckedChange={setDailySummary}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button (Mobile) */}
        <div className="md:hidden">
          <Button onClick={handleSave} className="w-full flex items-center gap-2">
            <Save size={16} />
            Save Changes
          </Button>
        </div>
      </div>
    </div>
  );
}