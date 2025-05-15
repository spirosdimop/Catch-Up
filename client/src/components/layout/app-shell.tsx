import { ReactNode, useState } from "react";
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
  Bot,
  Menu,
  X,
  ChevronRight,
  Bell
} from "lucide-react";
import { cn } from "@/lib/utils";
import { AIAssistantFloating } from "@/components/ai-assistant/floating-button";
import { useUser } from "@/lib/userContext";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  // Navigation items for the sidebar
  const navItems = [
    {
      icon: <Home className="h-5 w-5" />,
      label: "Dashboard",
      href: "/dashboard"
    },
    {
      icon: <Calendar className="h-5 w-5" />,
      label: "Calendar",
      href: "/calendar"
    },
    {
      icon: <Phone className="h-5 w-5" />,
      label: "Calls",
      href: "/bookings",
      badge: 3 // New calls notification
    },
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Messages",
      href: "/messages",
      badge: 5 // New messages notification
    },
    {
      icon: <Users className="h-5 w-5" />,
      label: "Clients",
      href: "/clients"
    },
    {
      icon: <Bot className="h-5 w-5" />,
      label: "AI Assistant",
      href: "/ai-assistant"
    },
    {
      icon: <Settings className="h-5 w-5" />,
      label: "Settings",
      href: "/settings"
    }
  ];
  
  // Toggle sidebar
  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar for desktop */}
      <aside className="hidden md:flex flex-col w-64 bg-[#0A2540] shadow-md">
        {/* Logo */}
        <div className="p-4 border-b border-[#1A2E4A]">
          <Link href="/dashboard">
            <div className="flex items-center gap-3 cursor-pointer">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                <Star className="h-5 w-5 text-[#0A2540]" />
              </div>
              <span className="text-xl font-semibold text-white">Catch Up</span>
            </div>
          </Link>
        </div>
        
        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => {
              const isActive = location === item.href;
              
              return (
                <li key={item.href}>
                  <Link href={item.href}>
                    <div 
                      className={cn(
                        "flex items-center gap-3 px-4 py-3 rounded-lg",
                        "cursor-pointer transition-all duration-200",
                        isActive 
                          ? "bg-white text-[#0A2540]" 
                          : "text-white hover:bg-[#1F2A40]"
                      )}
                    >
                      {item.icon}
                      <span className="font-medium">{item.label}</span>
                      
                      {item.badge && (
                        <Badge className="ml-auto bg-red-500 hover:bg-red-600">
                          {item.badge}
                        </Badge>
                      )}
                      
                      {!item.badge && isActive && (
                        <ChevronRight className="ml-auto h-4 w-4" />
                      )}
                    </div>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
        
        {/* User profile section */}
        <div className="p-4 border-t border-[#1A2E4A]">
          <Link href="/profile">
            <div className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-[#1F2A40] transition-colors">
              <div className="h-10 w-10 rounded-full bg-white text-[#0A2540] flex items-center justify-center">
                <span className="text-xs font-semibold">AL</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-white truncate">
                  Alex Johnson
                </p>
                <p className="text-xs text-gray-400 truncate">
                  alex@example.com
                </p>
              </div>
            </div>
          </Link>
        </div>
      </aside>
      
      {/* Mobile sidebar */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              exit={{ opacity: 0 }}
              className="md:hidden fixed inset-0 bg-black z-20"
              onClick={toggleSidebar}
            />
            
            {/* Sidebar */}
            <motion.aside
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", bounce: 0, duration: 0.4 }}
              className="fixed md:hidden flex flex-col w-64 h-full bg-[#0A2540] shadow-lg z-30"
            >
              <div className="p-4 border-b border-[#1A2E4A] flex items-center justify-between">
                <Link href="/dashboard">
                  <div className="flex items-center gap-3 cursor-pointer">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                      <Star className="h-5 w-5 text-[#0A2540]" />
                    </div>
                    <span className="text-xl font-semibold text-white">Catch Up</span>
                  </div>
                </Link>
                <button 
                  onClick={toggleSidebar}
                  className="h-8 w-8 flex items-center justify-center rounded-full hover:bg-[#1F2A40] text-white"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
              
              <nav className="flex-1 overflow-y-auto py-4">
                <ul className="space-y-1 px-3">
                  {navItems.map((item) => {
                    const isActive = location === item.href;
                    
                    return (
                      <li key={item.href}>
                        <Link href={item.href}>
                          <div 
                            className={cn(
                              "flex items-center gap-3 px-4 py-3 rounded-lg",
                              "cursor-pointer transition-all duration-200",
                              isActive 
                                ? "bg-white text-[#0A2540]" 
                                : "text-white hover:bg-[#1F2A40]"
                            )}
                            onClick={toggleSidebar}
                          >
                            {item.icon}
                            <span className="font-medium">{item.label}</span>
                            
                            {item.badge && (
                              <Badge className="ml-auto bg-red-500 hover:bg-red-600">
                                {item.badge}
                              </Badge>
                            )}
                            
                            {!item.badge && isActive && (
                              <ChevronRight className="ml-auto h-4 w-4" />
                            )}
                          </div>
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </nav>
              
              <div className="p-4 border-t border-[#1A2E4A]">
                <Link href="/profile">
                  <div className="flex items-center gap-3 cursor-pointer p-2 rounded-lg hover:bg-[#1F2A40] transition-colors">
                    <div className="h-10 w-10 rounded-full bg-white text-[#0A2540] flex items-center justify-center">
                      <span className="text-xs font-semibold">AL</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-white truncate">
                        Alex Johnson
                      </p>
                      <p className="text-xs text-gray-400 truncate">
                        alex@example.com
                      </p>
                    </div>
                  </div>
                </Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
      
      {/* Main content area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white px-4 py-3 border-b border-gray-200 shadow-sm z-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Mobile menu button */}
              <button 
                onClick={toggleSidebar}
                className="md:hidden h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100"
              >
                <Menu className="h-5 w-5 text-[#0A2540]" />
              </button>
              
              {/* Page title */}
              <h1 className="text-xl font-semibold text-[#0A2540]">
                {title || "Dashboard"}
              </h1>
            </div>
            
            {/* Right header content */}
            <div className="flex items-center gap-4">
              {/* Notifications */}
              <button className="h-10 w-10 flex items-center justify-center rounded-full hover:bg-gray-100 relative">
                <Bell className="h-5 w-5 text-gray-600" />
                <span className="absolute top-1 right-1 h-4 w-4 bg-red-500 rounded-full text-white text-xs flex items-center justify-center">
                  8
                </span>
              </button>
              
              {/* AI assistant button */}
              <Link href="/ai-assistant">
                <div className="hidden sm:flex h-10 w-10 rounded-full bg-indigo-100 hover:bg-indigo-200 items-center justify-center transition-colors">
                  <Bot className="h-5 w-5 text-indigo-600" />
                </div>
              </Link>
              
              {/* User profile mini widget */}
              <div className="hidden md:flex items-center gap-3 px-3 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors cursor-pointer">
                <div className="text-right text-xs">
                  <p className="font-semibold text-gray-800">Alex</p>
                  <p className="text-gray-500">Online</p>
                </div>
                <div className="h-8 w-8 bg-[#0A2540] text-white rounded-full flex items-center justify-center">
                  <span className="text-xs font-semibold">AL</span>
                </div>
              </div>
              
              {/* User profile for mobile */}
              <Link href="/profile">
                <div className="md:hidden h-10 w-10 rounded-full bg-[#0A2540] text-white flex items-center justify-center">
                  <span className="text-xs font-semibold">AL</span>
                </div>
              </Link>
              
              {/* Custom header content if provided */}
              {rightHeaderContent}
            </div>
          </div>
        </header>
        
        {/* Main content */}
        <main className="flex-1 overflow-y-auto p-6">
          <div className="max-w-6xl mx-auto">
            {children}
          </div>
        </main>
      </div>
      
      {/* AI Assistant Floating Button - accessible from all app pages */}
      <AIAssistantFloating />
    </div>
  );
}

export default AppShell;
