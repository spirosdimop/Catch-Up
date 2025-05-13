import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
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
  MapPin
} from "lucide-react";
import { useUser } from "@/lib/userContext";
import { useLocation } from "wouter";

export default function ProfileRedesign() {
  const { user, setUser } = useUser();
  const [, setLocation] = useLocation();
  
  // If no user exists, create a test user for development purposes
  useEffect(() => {
    if (!user) {
      console.log('Creating test user for development');
      setUser({
        id: "prod-coach-123",
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
            
            <div className="flex flex-wrap gap-3 justify-center mb-8">
              <Button 
                className="bg-white text-[#0a2342] hover:bg-blue-100"
                size="lg"
                onClick={() => setLocation("/messages")}
              >
                <MessageCircle className="h-5 w-5 mr-2" />
                Message
              </Button>
              
              <Button 
                className="bg-white text-[#0a2342] hover:bg-blue-100"
                size="lg"
                onClick={() => setLocation("/calendar")}
              >
                <CalendarDays className="h-5 w-5 mr-2" />
                Schedule
              </Button>
              
              <Button 
                className="bg-white text-[#0a2342] hover:bg-blue-100"
                size="lg"
                onClick={() => setLocation("/tasks")}
              >
                <ListTodo className="h-5 w-5 mr-2" />
                View Tasks
              </Button>
            </div>
            
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 text-sm">
              <div className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-blue-300" />
                <span>{user.email}</span>
              </div>
              <div className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-blue-300" />
                <span>{user.phone}</span>
              </div>
              <div className="flex items-center">
                <MapPin className="h-5 w-5 mr-2 text-blue-300" />
                <span>{user.serviceArea}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Stats cards */}
      <div className="container max-w-6xl mx-auto px-4 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-white shadow-md">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="rounded-full bg-blue-100 p-3 mb-4">
                <UserCircle className="h-8 w-8 text-[#1d4ed8]" />
              </div>
              <span className="text-3xl font-bold text-[#0a2342]">124</span>
              <span className="text-gray-500">Clients Helped</span>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-md">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="rounded-full bg-blue-100 p-3 mb-4">
                <CheckCircle className="h-8 w-8 text-[#1d4ed8]" />
              </div>
              <span className="text-3xl font-bold text-[#0a2342]">1,458</span>
              <span className="text-gray-500">Tasks Completed</span>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-md">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="rounded-full bg-blue-100 p-3 mb-4">
                <Trophy className="h-8 w-8 text-[#1d4ed8]" />
              </div>
              <span className="text-3xl font-bold text-[#0a2342]">87</span>
              <span className="text-gray-500">Goals Reached</span>
            </CardContent>
          </Card>
          
          <Card className="bg-white shadow-md">
            <CardContent className="p-6 flex flex-col items-center">
              <div className="rounded-full bg-blue-100 p-3 mb-4">
                <BarChart3 className="h-8 w-8 text-[#1d4ed8]" />
              </div>
              <span className="text-3xl font-bold text-[#0a2342]">98%</span>
              <span className="text-gray-500">Satisfaction Rate</span>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Services section */}
      <div className="container max-w-6xl mx-auto px-4 py-16">
        <h2 className="text-2xl font-bold text-[#0a2342] mb-8 text-center">Services Offered</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {user.services.map((service, index) => (
            <Card key={index} className="bg-white shadow-md transition-all hover:shadow-lg">
              <CardContent className="p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="text-lg font-semibold text-[#0a2342]">{service.name}</h3>
                    <p className="text-sm text-gray-600">{service.description}</p>
                  </div>
                  <Badge className="bg-[#1d4ed8] text-white text-lg font-semibold">${service.price}</Badge>
                </div>
                
                <div className="flex flex-wrap gap-x-6 mt-3 text-sm">
                  <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-1 text-gray-500" />
                    <span>{service.duration} minutes</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        
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