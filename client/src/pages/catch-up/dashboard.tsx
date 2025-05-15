import { useState } from "react";
import { 
  Calendar, 
  Clock, 
  Phone, 
  MessageSquare, 
  Users, 
  Star,
  CheckCircle,
  ChevronRight,
  Scissors,
  Paintbrush,
  Wrench
} from "lucide-react";
import { CatchUpLayout } from "@/components/layout/catch-up-layout";
import { AppCard, AppCardBody, AppCardHeader } from "@/components/ui/catch-up/app-card";
import { AppButton } from "@/components/ui/catch-up/app-button";
import { ServiceCard } from "@/components/ui/catch-up/service-card";

/**
 * Catch Up Dashboard Page
 */
export default function CatchUpDashboardPage() {
  const [userName] = useState("Sarah");
  
  // Mock upcoming appointments
  const upcomingAppointments = [
    {
      id: 1,
      clientName: "John Smith",
      service: "Haircut & Styling",
      date: new Date(2025, 4, 16, 10, 30), // May 16, 2025 10:30 AM
      duration: 45,
    },
    {
      id: 2,
      clientName: "Emily Johnson",
      service: "Full Room Painting",
      date: new Date(2025, 4, 17, 14, 0), // May 17, 2025 2:00 PM
      duration: 180,
    }
  ];

  // Mock recent activities
  const recentActivities = [
    {
      id: 1,
      type: "call",
      client: "Michael Brown",
      time: "2 hours ago",
      status: "Missed",
      description: "Attempted to reach you regarding appointment"
    },
    {
      id: 2,
      type: "message",
      client: "Lisa Williams",
      time: "Yesterday",
      status: "Replied",
      description: "Asked about availability next week"
    },
    {
      id: 3,
      type: "booking",
      client: "David Martinez",
      time: "Yesterday",
      status: "Confirmed",
      description: "Booked a consultation for next Tuesday"
    }
  ];

  // Mock services
  const services = [
    {
      id: 1,
      name: "Haircut & Style",
      duration: 45,
      price: 65,
      icon: <Scissors className="h-5 w-5" />,
      description: "Professional haircut and styling to refresh your look."
    },
    {
      id: 2,
      name: "Room Painting",
      duration: 180,
      price: 250,
      icon: <Paintbrush className="h-5 w-5" />,
      description: "Complete room painting service with premium paints."
    },
    {
      id: 3,
      name: "Plumbing Repair",
      duration: 120,
      price: 150,
      icon: <Wrench className="h-5 w-5" />,
      description: "Professional plumbing repair for leaks and fixtures."
    }
  ];

  // Format appointment date
  const formatAppointmentDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(date);
  };

  return (
    <CatchUpLayout>
      <div className="space-y-6">
        {/* Welcome Banner */}
        <div className="bg-catchup-primary rounded-[20px] px-6 py-6 text-white">
          <h1 className="text-2xl font-bold mb-2">Welcome back, {userName}!</h1>
          <p className="opacity-80">Here's what's happening with your business today.</p>
        </div>
        
        {/* Stats Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <AppCard>
            <AppCardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-catchup-text-secondary text-sm">Today's Appointments</p>
                  <h3 className="text-2xl font-bold text-catchup-primary mt-1">2</h3>
                </div>
                <div className="h-12 w-12 bg-catchup-primary/10 rounded-full flex items-center justify-center">
                  <Calendar className="h-6 w-6 text-catchup-primary" />
                </div>
              </div>
            </AppCardBody>
          </AppCard>
          
          <AppCard>
            <AppCardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-catchup-text-secondary text-sm">Pending Messages</p>
                  <h3 className="text-2xl font-bold text-catchup-primary mt-1">5</h3>
                </div>
                <div className="h-12 w-12 bg-catchup-primary/10 rounded-full flex items-center justify-center">
                  <MessageSquare className="h-6 w-6 text-catchup-primary" />
                </div>
              </div>
            </AppCardBody>
          </AppCard>
          
          <AppCard>
            <AppCardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-catchup-text-secondary text-sm">Missed Calls</p>
                  <h3 className="text-2xl font-bold text-catchup-primary mt-1">3</h3>
                </div>
                <div className="h-12 w-12 bg-catchup-primary/10 rounded-full flex items-center justify-center">
                  <Phone className="h-6 w-6 text-catchup-primary" />
                </div>
              </div>
            </AppCardBody>
          </AppCard>
          
          <AppCard>
            <AppCardBody>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-catchup-text-secondary text-sm">Active Clients</p>
                  <h3 className="text-2xl font-bold text-catchup-primary mt-1">24</h3>
                </div>
                <div className="h-12 w-12 bg-catchup-primary/10 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-catchup-primary" />
                </div>
              </div>
            </AppCardBody>
          </AppCard>
        </div>
        
        {/* Upcoming Appointments */}
        <AppCard>
          <AppCardHeader
            title="Upcoming Appointments"
            icon={<Calendar className="h-5 w-5" />}
            action={
              <AppButton variant="text" size="sm" icon={<ChevronRight className="h-4 w-4" />} iconPosition="right">
                View All
              </AppButton>
            }
          />
          <AppCardBody>
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <div key={appointment.id} className="flex items-center justify-between border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 bg-catchup-primary/10 rounded-full flex items-center justify-center">
                      <Clock className="h-5 w-5 text-catchup-primary" />
                    </div>
                    <div>
                      <p className="font-medium text-catchup-primary">{appointment.clientName}</p>
                      <p className="text-sm text-catchup-text-secondary">{appointment.service}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-catchup-primary">{formatAppointmentDate(appointment.date)}</p>
                    <p className="text-sm text-catchup-text-secondary">{appointment.duration} min</p>
                  </div>
                </div>
              ))}
              
              {upcomingAppointments.length === 0 && (
                <div className="text-center py-6">
                  <p className="text-catchup-text-secondary">No upcoming appointments</p>
                </div>
              )}
            </div>
          </AppCardBody>
        </AppCard>
        
        {/* Recent Activity */}
        <AppCard>
          <AppCardHeader
            title="Recent Activity"
            icon={<Star className="h-5 w-5" />}
            action={
              <AppButton variant="text" size="sm" icon={<ChevronRight className="h-4 w-4" />} iconPosition="right">
                View All
              </AppButton>
            }
          />
          <AppCardBody>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-start justify-between border-b border-gray-100 pb-4 last:border-0">
                  <div className="flex items-start gap-3">
                    <div className="h-10 w-10 shrink-0 bg-catchup-primary/10 rounded-full flex items-center justify-center mt-1">
                      {activity.type === 'call' && <Phone className="h-5 w-5 text-catchup-primary" />}
                      {activity.type === 'message' && <MessageSquare className="h-5 w-5 text-catchup-primary" />}
                      {activity.type === 'booking' && <CheckCircle className="h-5 w-5 text-catchup-primary" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium text-catchup-primary">{activity.client}</p>
                        <span className="text-xs text-catchup-text-secondary">{activity.time}</span>
                      </div>
                      <p className="text-sm text-catchup-text-secondary">{activity.description}</p>
                    </div>
                  </div>
                  <div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      activity.status === 'Missed' ? 'bg-red-100 text-red-600' :
                      activity.status === 'Confirmed' ? 'bg-green-100 text-green-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {activity.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </AppCardBody>
        </AppCard>
        
        {/* My Services */}
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-catchup-primary">My Services</h2>
            <AppButton variant="text" size="sm" icon={<ChevronRight className="h-4 w-4" />} iconPosition="right">
              Manage Services
            </AppButton>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {services.map((service) => (
              <ServiceCard
                key={service.id}
                name={service.name}
                duration={service.duration}
                price={service.price}
                description={service.description}
                icon={service.icon}
                onBook={() => console.log(`Book ${service.name}`)}
                onDetails={() => console.log(`View details for ${service.name}`)}
              />
            ))}
          </div>
        </div>
      </div>
    </CatchUpLayout>
  );
}