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
  Star
} from "lucide-react";
import { cn } from "@/lib/utils";

interface CatchUpLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showFooter?: boolean;
  title?: string;
  rightHeaderContent?: ReactNode;
}

/**
 * CatchUpLayout - Consistent layout wrapper for Catch Up app pages
 * Includes header, content area, and bottom navigation
 */
export function CatchUpLayout({
  children,
  showHeader = true,
  showFooter = true,
  title,
  rightHeaderContent
}: CatchUpLayoutProps) {
  const [location] = useLocation();
  
  // Navigation items for the bottom nav
  const navItems = [
    {
      icon: <Home className="h-6 w-6" />,
      label: "Home",
      href: "/catch-up/dashboard"
    },
    {
      icon: <Calendar className="h-6 w-6" />,
      label: "Calendar",
      href: "/catch-up/calendar"
    },
    {
      icon: <Phone className="h-6 w-6" />,
      label: "Calls",
      href: "/catch-up/calls"
    },
    {
      icon: <MessageSquare className="h-6 w-6" />,
      label: "Messages",
      href: "/catch-up/messages"
    },
    {
      icon: <Users className="h-6 w-6" />,
      label: "Clients",
      href: "/catch-up/clients"
    }
  ];
  
  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      {showHeader && (
        <header className="bg-catchup-primary px-4 py-4 shadow-md sticky top-0 z-10">
          <div className="container mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Link href="/catch-up/dashboard">
                <div className="flex items-center gap-3 cursor-pointer">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                    <Star className="h-5 w-5 text-catchup-accent" />
                  </div>
                  {title ? (
                    <h1 className="text-lg font-semibold text-white">{title}</h1>
                  ) : (
                    <span className="text-lg font-semibold text-white">Catch Up</span>
                  )}
                </div>
              </Link>
            </div>
            
            {rightHeaderContent ? (
              rightHeaderContent
            ) : (
              <Link href="/catch-up/profile">
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
      )}
      
      {/* Main Content */}
      <main className="flex-1 container mx-auto px-4 py-6">
        {children}
      </main>
      
      {/* Footer Navigation */}
      {showFooter && (
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
              
              <Link href="/catch-up/settings">
                <div 
                  className={cn(
                    "flex flex-col items-center py-3 px-2",
                    "cursor-pointer transition-colors",
                    location === "/catch-up/settings" 
                      ? "text-catchup-primary" 
                      : "text-gray-500 hover:text-catchup-primary"
                  )}
                >
                  <Settings className="h-6 w-6" />
                  <span className="text-xs mt-1">Settings</span>
                  
                  {/* Active indicator */}
                  {location === "/catch-up/settings" && (
                    <div className="absolute bottom-0 w-6 h-1 bg-catchup-primary rounded-t-full" />
                  )}
                </div>
              </Link>
            </nav>
          </div>
        </footer>
      )}
    </div>
  );
}