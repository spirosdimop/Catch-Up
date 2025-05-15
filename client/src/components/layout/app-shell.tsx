import { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import {
  Home,
  Calendar,
  Phone,
  MessageSquare,
  Users,
  Settings,
  User,
  Star,
  Bot
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AIAssistantFloating } from "@/components/ai-assistant/floating-button";
import { useUser } from "@/lib/userContext";

type AppShellProps = {
  children: React.ReactNode;
  title?: string;
  rightHeaderContent?: ReactNode;
};

export function AppShell({ 
  children, 
  title,
  rightHeaderContent 
}: AppShellProps) {
  const [location] = useLocation();
  const { user } = useUser();
  
  // Navigation items for the bottom nav
  const navItems = [
    {
      icon: <Home className="h-6 w-6" />,
      label: "Home",
      href: "/dashboard"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      label: "Calendar",
      href: "/calendar"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      label: "Calls",
      href: "/bookings"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      label: "Messages",
      href: "/messages"
    },
    {
      icon: <Users className="h-6 w-6" />,
      label: "Clients",
      href: "/clients"
    }
  ];
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-catchup-primary px-4 py-4 shadow-md sticky top-0 z-10">
        <div className="container mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/dashboard">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                  <Star className="h-5 w-5 text-catchup-accent" />
                </div>
                {title ? (
                  <h1 className="text-lg font-semibold text-white">{title}</h1>
                ) : (
                  <span className="text-lg font-semibold text-white">FreelanceFlow</span>
                )}
              </div>
            </Link>
          </div>
          
          {rightHeaderContent ? (
            rightHeaderContent
          ) : (
            <Link href="/profile">
              <div className="flex items-center gap-2 cursor-pointer">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                  <User className="h-5 w-5 text-catchup-primary" />
                </div>
                <span className="text-sm font-medium text-white md:inline hidden">Profile</span>
              </div>
            </Link>
          )}
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      
      {/* Footer Navigation */}
      <footer className="bg-white border-t border-gray-200 sticky bottom-0">
        <div className="container mx-auto px-4">
          <nav className="flex justify-between items-center">
            {navItems.map((item) => {
              const isActive = location === item.href;
              
              return (
                <Link key={item.href} href={item.href}>
                  <div 
                    className={cn(
                      "flex flex-col items-center py-3 px-2",
                      "cursor-pointer transition-colors",
                      isActive 
                        ? "text-catchup-primary" 
                        : "text-gray-500 hover:text-catchup-primary"
                    )}
                  >
                    {item.icon}
                    <span className="text-xs mt-1">{item.label}</span>
                    
                    {/* Active indicator */}
                    {isActive && (
                      <div className="absolute bottom-0 w-6 h-1 bg-catchup-primary rounded-t-full" />
                    )}
                  </div>
                </Link>
              );
            })}
            
            <Link href="/settings">
              <div 
                className={cn(
                  "flex flex-col items-center py-3 px-2",
                  "cursor-pointer transition-colors",
                  location === "/settings" 
                    ? "text-catchup-primary" 
                    : "text-gray-500 hover:text-catchup-primary"
                )}
              >
                <Settings className="h-6 w-6" />
                <span className="text-xs mt-1">Settings</span>
                
                {/* Active indicator */}
                {location === "/settings" && (
                  <div className="absolute bottom-0 w-6 h-1 bg-catchup-primary rounded-t-full" />
                )}
              </div>
            </Link>
          </nav>
        </div>
      </footer>
      
      {/* AI Assistant Floating Button - accessible from all app pages */}
      <AIAssistantFloating />
    </div>
  );
}

export default AppShell;
