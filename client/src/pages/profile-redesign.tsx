import { useEffect, useState, useRef } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { 
  UserCircle, 
  Mail, 
  MessageCircle,
  CalendarDays,
  CheckCircle,
  ListTodo,
  Trophy,
  BarChart3,
  Clock,
  Phone,
  MapPin,
  Copy,
  Share2,
  Check,
  Link
} from "lucide-react";
import { useUser } from "@/lib/userContext";
import { useLocation } from "wouter";

export default function ProfileRedesign() {
  const { user, setUser, updateUser } = useUser();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [profileLink, setProfileLink] = useState<string>("");
  const [copied, setCopied] = useState(false);
  const [isEditingInsights, setIsEditingInsights] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState(false);
  const [isEditingServices, setIsEditingServices] = useState(false);
  const [locationValue, setLocationValue] = useState("");
  const [services, setServices] = useState<Array<{
    name: string;
    description?: string;
    duration: number;
    price: number;
    locationType?: string;
  }>>([]);
  const [customInsights, setCustomInsights] = useState<{
    label: string;
    value: string | number;
    isVisible: boolean;
  }[]>([]);
  const linkInputRef = useRef<HTMLInputElement>(null);
  
  // Generate profile link based on username
  useEffect(() => {
    if (user) {
      // Generate a profile link using the window location and username
      const baseUrl = window.location.origin;
      const username = user.username || (user.firstName && user.lastName 
        ? `${user.firstName.toLowerCase()}-${user.lastName.toLowerCase()}`
        : `user-${user.id}`);
        
      setProfileLink(`${baseUrl}/p/${username}`);
      
      // Initialize location value from user data
      setLocationValue(user.serviceArea || "");
      
      // Initialize services from user data
      if (user.services && user.services.length > 0) {
        setServices(user.services);
      }
      
      // Initialize custom insights from user data if available
      if (user.customInsights) {
        setCustomInsights(user.customInsights);
      } else {
        // Set default insights based on stats
        const defaultInsights = [
          { label: 'Clients Helped', value: user.stats?.clientsHelped || 124, isVisible: true },
          { label: 'Tasks Completed', value: user.stats?.tasksCompleted || 1458, isVisible: true },
          { label: 'Goals Reached', value: user.stats?.goalsReached || 87, isVisible: true },
          { label: 'Satisfaction Rate', value: `${user.stats?.satisfactionRate || 98}%`, isVisible: true },
          { label: 'Jobs Done', value: 25, isVisible: false },
          { label: 'Projects Delivered', value: 32, isVisible: false },
          { label: 'Years Experience', value: 5, isVisible: false },
          { label: 'Return Clients', value: '84%', isVisible: false }
        ];
        setCustomInsights(defaultInsights);
      }
    }
  }, [user]);

  // If no user exists, create a test user for development purposes
  useEffect(() => {
    if (!user) {
      console.log('Creating test user for development');
      setUser({
        id: "prod-coach-123",
        username: "johnsmith",
        firstName: "John",
        lastName: "Smith",
        email: "john@productivity.coach",
        phone: "555-987-6543",
        businessName: "Productivity Mastery",
        profession: "Productivity Coach",
        locationType: "remote",
        serviceArea: "Global - Remote Sessions",
        profileImageUrl: "",
        // Stats for the demo
        stats: {
          clientsHelped: 124,
          tasksCompleted: 1458,
          goalsReached: 87,
          satisfactionRate: 98
        },
        services: [
          { 
            name: "Productivity Assessment", 
            duration: 60, 
            price: 150, 
            description: "Comprehensive review of your current productivity systems and habits." 
          },
          { 
            name: "Weekly Coaching", 
            duration: 45, 
            price: 125, 
            description: "Ongoing accountability and guidance to optimize your productivity."
          },
          { 
            name: "Task Management Workshop", 
            duration: 90, 
            price: 200, 
            description: "Learn effective strategies for managing tasks, priorities, and deadlines."
          },
          { 
            name: "Quick Strategy Session", 
            duration: 30, 
            price: 75, 
            description: "Targeted advice for a specific productivity challenge you're facing."
          }
        ]
      });
    }
  }, [user, setUser]);
  
  const copyProfileLink = () => {
    if (profileLink) {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(profileLink)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
            toast({
              title: "Link Copied",
              description: "Profile link copied to clipboard",
              variant: "default",
            });
          })
          .catch(err => {
            console.error('Failed to copy link: ', err);
            // Fallback for clipboard API failure
            copyLinkFallback();
          });
      } else {
        // Fallback for browsers without clipboard API
        copyLinkFallback();
      }
    }
  };
  
  const copyLinkFallback = () => {
    if (linkInputRef.current) {
      linkInputRef.current.select();
      document.execCommand('copy');
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast({
        title: "Link Copied",
        description: "Profile link copied to clipboard",
        variant: "default",
      });
    }
  };
  
  const shareProfileLink = async () => {
    if (navigator.share && profileLink) {
      try {
        await navigator.share({
          title: `${user?.firstName} ${user?.lastName}'s Profile`,
          text: `Book an appointment with ${user?.firstName} ${user?.lastName}`,
          url: profileLink,
        });
        toast({
          title: "Link Shared",
          description: "Profile link shared successfully",
          variant: "default",
        });
      } catch (err) {
        console.error('Error sharing: ', err);
        // If sharing fails, fall back to copying
        copyProfileLink();
      }
    } else {
      // If Web Share API is not available, fall back to copying
      copyProfileLink();
    }
  };
  
  // Functions for managing custom insights
  const toggleInsightVisibility = (index: number) => {
    setCustomInsights(prev => 
      prev.map((insight, i) => 
        i === index ? { ...insight, isVisible: !insight.isVisible } : insight
      )
    );
  };
  
  const updateInsightValue = (index: number, value: string | number) => {
    setCustomInsights(prev => 
      prev.map((insight, i) => 
        i === index ? { ...insight, value } : insight
      )
    );
  };
  
  const updateInsightLabel = (index: number, label: string) => {
    setCustomInsights(prev => 
      prev.map((insight, i) => 
        i === index ? { ...insight, label } : insight
      )
    );
  };
  
  const addNewInsight = () => {
    setCustomInsights(prev => [
      ...prev, 
      { label: 'New Insight', value: 0, isVisible: true }
    ]);
  };
  
  const removeInsight = (index: number) => {
    setCustomInsights(prev => prev.filter((_, i) => i !== index));
  };
  
  const saveInsights = () => {
    if (user) {
      // Update the user data with the custom insights
      updateUser({ 
        ...user,
        customInsights
      });
      
      setIsEditingInsights(false);
      
      toast({
        title: "Insights Saved",
        description: "Your profile insights have been updated",
        variant: "default",
      });
    }
  };
  
  // Service management functions
  const addNewService = () => {
    setServices(prev => [
      ...prev,
      {
        name: "New Service",
        description: "Enter a description for this service",
        duration: 60,
        price: 0,
        locationType: "In-person"
      }
    ]);
  };
  
  const updateServiceField = (index: number, field: string, value: any) => {
    setServices(prev => 
      prev.map((service, i) => 
        i === index ? { ...service, [field]: value } : service
      )
    );
  };
  
  const removeService = (index: number) => {
    setServices(prev => prev.filter((_, i) => i !== index));
  };
  
  const saveServices = () => {
    if (user) {
      // Update the user data with the modified services
      updateUser({
        ...user,
        services
      });
      
      setIsEditingServices(false);
      
      toast({
        title: "Services Updated",
        description: "Your services have been updated successfully",
        variant: "default",
      });
    }
  };
  
  if (!user) {
    return <div className="flex justify-center items-center h-[80vh]">Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Hero section with deep navy background */}
      <div className="bg-[#0a2342] text-white py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <div className="flex flex-col items-center text-center">
            <Avatar className="w-32 h-32 border-4 border-white mb-6">
              {user?.profileImageUrl ? (
                <AvatarImage src={user.profileImageUrl} alt={`${user.firstName} ${user.lastName}`} />
              ) : (
                <AvatarFallback className="text-3xl bg-[#1d4ed8]">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </AvatarFallback>
              )}
            </Avatar>
            
            <h1 className="text-3xl md:text-4xl font-bold mb-2">{user.firstName} {user.lastName}</h1>
            <p className="text-xl text-blue-200 mb-8">{user.profession}</p>
            
            {/* Action buttons removed as requested */}
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-sm">
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-300" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-blue-300" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center relative">
                <MapPin className="h-5 w-5 mr-2 text-blue-300" />
                {isEditingLocation ? (
                  <div className="flex items-center">
                    <Input
                      value={locationValue}
                      onChange={(e) => setLocationValue(e.target.value)}
                      className="w-56 h-8 text-sm py-1 text-white bg-transparent border-blue-300"
                    />
                    <div className="flex ml-2">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 px-2 text-blue-200 hover:text-white hover:bg-blue-700"
                        onClick={() => {
                          if (user) {
                            updateUser({ ...user, serviceArea: locationValue });
                            setIsEditingLocation(false);
                            toast({
                              title: "Location Updated",
                              description: "Your location has been updated successfully",
                              variant: "default",
                            });
                          }
                        }}
                      >
                        Save
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 px-2 text-blue-200 hover:text-white hover:bg-blue-700"
                        onClick={() => {
                          setLocationValue(user.serviceArea || "");
                          setIsEditingLocation(false);
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span>{user.serviceArea}</span>
                    <Button 
                      size="sm" 
                      variant="ghost" 
                      className="h-7 w-7 ml-2 p-0 text-blue-200 hover:text-white hover:bg-blue-700"
                      onClick={() => setIsEditingLocation(true)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M12 20h9"></path>
                        <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                      </svg>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="container max-w-6xl mx-auto px-4 -mt-10">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-[#0a2342]">Profile Insights</h2>
          <div className="flex gap-2">
            {isEditingInsights ? (
              <>
                <Button variant="outline" onClick={() => setIsEditingInsights(false)}>
                  Cancel
                </Button>
                <Button onClick={saveInsights}>
                  Save Changes
                </Button>
              </>
            ) : (
              <Button 
                variant="outline" 
                onClick={() => setIsEditingInsights(true)}
                className="flex items-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9"></path>
                  <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
                </svg>
                Customize Insights
              </Button>
            )}
          </div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {customInsights.filter(insight => insight.isVisible || isEditingInsights).map((insight, index) => (
            <Card 
              key={index} 
              className={`bg-white shadow-md transition-all ${isEditingInsights && !insight.isVisible ? 'opacity-50' : ''}`}
            >
              <CardContent className="p-6 flex flex-col items-center relative">
                {isEditingInsights && (
                  <div className="absolute top-2 right-2 flex gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6"
                      onClick={() => toggleInsightVisibility(index)}
                    >
                      {insight.isVisible ? (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                          <circle cx="12" cy="12" r="3"></circle>
                          <path d="m3 21 18-18"></path>
                        </svg>
                      )}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-6 w-6 text-red-500"
                      onClick={() => removeInsight(index)}
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 6h18"></path>
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                      </svg>
                    </Button>
                  </div>
                )}
                
                <div className="rounded-full bg-blue-100 p-3 mb-4">
                  {index === 0 && <UserCircle className="h-8 w-8 text-[#1d4ed8]" />}
                  {index === 1 && <CheckCircle className="h-8 w-8 text-[#1d4ed8]" />}
                  {index === 2 && <Trophy className="h-8 w-8 text-[#1d4ed8]" />}
                  {index === 3 && <BarChart3 className="h-8 w-8 text-[#1d4ed8]" />}
                  {index > 3 && <UserCircle className="h-8 w-8 text-[#1d4ed8]" />}
                </div>
                
                {isEditingInsights ? (
                  <>
                    <Input
                      value={insight.value.toString()}
                      onChange={(e) => updateInsightValue(index, e.target.value)}
                      className="text-center text-2xl font-bold text-[#0a2342] mb-2 w-full"
                    />
                    <Input
                      value={insight.label}
                      onChange={(e) => updateInsightLabel(index, e.target.value)}
                      className="text-center text-gray-500 w-full"
                    />
                  </>
                ) : (
                  <>
                    <span className="text-3xl font-bold text-[#0a2342]">{insight.value}</span>
                    <span className="text-gray-500">{insight.label}</span>
                  </>
                )}
              </CardContent>
            </Card>
          ))}
          
          {isEditingInsights && (
            <Card 
              className="bg-white shadow-md border-dashed border-2 border-gray-300 hover:border-blue-500 cursor-pointer"
              onClick={addNewInsight}
            >
              <CardContent className="p-6 flex flex-col items-center justify-center h-full">
                <div className="rounded-full bg-gray-100 p-3 mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-500">
                    <path d="M5 12h14"></path>
                    <path d="M12 5v14"></path>
                  </svg>
                </div>
                <span className="text-gray-500 text-center">Add New Insight</span>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      
      {/* Shareable Profile Link section */}
      <div className="container max-w-6xl mx-auto px-4 py-10">
        <div className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
          <h2 className="text-xl font-bold text-[#0a2342] mb-4 flex items-center">
            <Link className="h-5 w-5 mr-2 text-[#1d4ed8]" />
            Your Shareable Booking Link
          </h2>
          <p className="text-gray-600 mb-4">
            Share this link with your clients so they can book appointments directly through your public profile page.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-grow">
              <Input 
                ref={linkInputRef}
                value={profileLink}
                readOnly
                className="bg-gray-50 h-full"
              />
            </div>
            <div className="flex gap-2">
              <Button
                onClick={copyProfileLink}
                className="flex-shrink-0 bg-[#1d4ed8] hover:bg-blue-600"
              >
                {copied ? (
                  <>
                    <Check className="h-4 w-4 mr-2" />
                    Copied
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 mr-2" />
                    Copy Link
                  </>
                )}
              </Button>
              
              <Button
                onClick={shareProfileLink}
                variant="outline"
                className="flex-shrink-0 border-[#1d4ed8] text-[#1d4ed8]"
              >
                <Share2 className="h-4 w-4 mr-2" />
                Share
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Services section - Enhanced with detailed editable view */}
      <div className="container max-w-6xl mx-auto px-4 py-10">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-2xl font-bold text-[#0a2342]">Services Offered</h2>
          {!isEditingServices ? (
            <Button 
              onClick={() => setIsEditingServices(true)}
              className="bg-[#1d4ed8] text-white hover:bg-blue-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                <path d="M12 20h9"></path>
                <path d="M16.5 3.5a2.121 2.121 0 0 1 3 3L7 19l-4 1 1-4L16.5 3.5z"></path>
              </svg>
              Edit Services
            </Button>
          ) : (
            <div className="flex gap-2">
              <Button 
                onClick={addNewService}
                className="bg-green-600 text-white hover:bg-green-700"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2">
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
                Add New Service
              </Button>
              <Button 
                onClick={saveServices}
                className="bg-[#1d4ed8] text-white hover:bg-blue-700"
              >
                Save Changes
              </Button>
              <Button 
                variant="outline"
                onClick={() => {
                  setServices(user.services || []);
                  setIsEditingServices(false);
                }}
              >
                Cancel
              </Button>
            </div>
          )}
        </div>
        
        {isEditingServices ? (
          <div className="space-y-6">
            {services.length > 0 ? services.map((service, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md border border-gray-100">
                <div className="flex justify-between mb-4">
                  <div className="w-full">
                    <div className="flex justify-between mb-4">
                      <Input
                        value={service.name}
                        onChange={(e) => updateServiceField(index, 'name', e.target.value)}
                        className="text-lg font-bold text-[#0a2342] border-blue-300 mb-2 max-w-md"
                        placeholder="Service Name"
                      />
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeService(index)}
                        className="h-8 w-8 text-red-500 hover:text-red-700 hover:bg-red-50"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18"></path>
                          <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
                          <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
                          <line x1="10" y1="11" x2="10" y2="17"></line>
                          <line x1="14" y1="11" x2="14" y2="17"></line>
                        </svg>
                      </Button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Duration (minutes)</label>
                        <Input
                          type="number"
                          value={service.duration}
                          onChange={(e) => updateServiceField(index, 'duration', Number(e.target.value))}
                          className="border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Price ($)</label>
                        <Input
                          type="number"
                          value={service.price}
                          onChange={(e) => updateServiceField(index, 'price', Number(e.target.value))}
                          className="border-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600 mb-1">Location Type</label>
                        <select
                          value={service.locationType || "In-person"}
                          onChange={(e) => updateServiceField(index, 'locationType', e.target.value)}
                          className="w-full h-10 px-3 border border-gray-300 rounded-md"
                        >
                          <option value="In-person">In-person</option>
                          <option value="Remote">Remote</option>
                          <option value="Hybrid">Hybrid</option>
                        </select>
                      </div>
                    </div>
                    
                    <label className="block text-sm text-gray-600 mb-1">Description</label>
                    <textarea
                      value={service.description || ''}
                      onChange={(e) => updateServiceField(index, 'description', e.target.value)}
                      className="w-full p-3 border border-gray-300 rounded-md min-h-[100px]"
                      placeholder="Describe your service in detail..."
                    />
                  </div>
                </div>
              </div>
            )) : (
              <div className="bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-500 mb-4">No services added yet.</p>
                <Button 
                  onClick={addNewService}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  Add Your First Service
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {services && services.length > 0 ? (
              services.map((service, index) => (
                <Card key={index} className="bg-white shadow-md transition-all hover:shadow-lg">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <h3 className="text-lg font-semibold text-[#0a2342]">{service.name}</h3>
                        <p className="text-gray-600 mt-2 min-h-[80px]">{service.description}</p>
                      </div>
                      <Badge className="bg-[#1d4ed8] text-white text-lg font-semibold">${service.price}</Badge>
                    </div>
                    
                    <div className="flex flex-wrap justify-between gap-x-6 mt-4 pt-3 border-t border-gray-100 text-sm">
                      <div className="flex items-center">
                        <Clock className="h-4 w-4 mr-1 text-gray-500" />
                        <span>{service.duration} minutes</span>
                      </div>
                      
                      {service.locationType && (
                        <div className="flex items-center">
                          <MapPin className="h-4 w-4 mr-1 text-gray-500" />
                          <span>{service.locationType}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : (
              <div className="col-span-2 bg-white p-6 rounded-lg shadow-md text-center">
                <p className="text-gray-500">No services added yet. Click 'Edit Services' to add your first service.</p>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-10 flex justify-center">
          <Button 
            className="bg-[#0a2342] hover:bg-[#1d4ed8]"
            size="lg"
            onClick={() => setLocation("/calendar")}
          >
            <CalendarDays className="h-5 w-5 mr-2" />
            Book a Session
          </Button>
        </div>
      </div>
      
      {/* About section */}
      <div className="bg-gray-100 py-16">
        <div className="container max-w-6xl mx-auto px-4">
          <h2 className="text-2xl font-bold text-[#0a2342] mb-8 text-center">About {user.firstName}</h2>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-700 mb-6">
              As a certified productivity coach with over 10 years of experience, I help professionals and teams optimize their workflow, 
              focus on high-impact activities, and reduce stress while achieving more. My approach combines proven productivity methods 
              with personalized systems that work with your unique style and challenges.
            </p>
            
            <p className="text-gray-700 mb-6">
              Whether you're struggling with email overload, time management, prioritization, or maintaining work-life balance, 
              I provide practical strategies that deliver immediate results while building sustainable habits for long-term success.
            </p>
            
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-[#0a2342] mb-2">Specialties</h3>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-[#1d4ed8] mt-0.5" />
                    <span>Time Management Systems</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-[#1d4ed8] mt-0.5" />
                    <span>Digital Organization</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-[#1d4ed8] mt-0.5" />
                    <span>Focus Techniques</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-[#1d4ed8] mt-0.5" />
                    <span>Habit Building</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-[#0a2342] mb-2">Certifications</h3>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-[#1d4ed8] mt-0.5" />
                    <span>Certified Productivity Coach (CPC)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-[#1d4ed8] mt-0.5" />
                    <span>GTD® Certified Trainer</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-[#1d4ed8] mt-0.5" />
                    <span>Time Management Expert (TME)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-[#1d4ed8] mt-0.5" />
                    <span>Digital Organization Specialist</span>
                  </li>
                </ul>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                <h3 className="font-semibold text-[#0a2342] mb-2">Experience</h3>
                <ul className="text-sm space-y-1 text-gray-700">
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-[#1d4ed8] mt-0.5" />
                    <span>Corporate Teams (500+ employees)</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-[#1d4ed8] mt-0.5" />
                    <span>Small Business Owners</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-[#1d4ed8] mt-0.5" />
                    <span>Executives & Professionals</span>
                  </li>
                  <li className="flex items-start">
                    <CheckCircle className="h-4 w-4 mr-2 text-[#1d4ed8] mt-0.5" />
                    <span>Remote & Hybrid Teams</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}