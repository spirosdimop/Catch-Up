import React, { ReactNode } from "react";
import { Link, useLocation } from "wouter";
import { Calendar, Phone, User, Home, Settings, Star, Users, Bot, Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

interface CatchUpLayoutProps {
  children: ReactNode;
  title: string;
  showFab?: boolean;
  fabIcon?: ReactNode;
  onFabClick?: () => void;
}

export function CatchUpLayout({
  children,
  title,
  showFab = false,
  fabIcon,
  onFabClick,
}: CatchUpLayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = React.useState(false);

  // Define navigation items
  const navItems = [
    { href: "/dashboard", label: "Dashboard", icon: <Home className="h-5 w-5" /> },
    { href: "/calls", label: "Calls", icon: <Phone className="h-5 w-5" /> },
    { href: "/calendar", label: "Calendar", icon: <Calendar className="h-5 w-5" /> },
    { href: "/ai-assistant", label: "AI Assistant", icon: <Bot className="h-5 w-5" /> },
    { href: "/clients", label: "Clients", icon: <Users className="h-5 w-5" /> },
    { href: "/profile", label: "Profile", icon: <User className="h-5 w-5" /> },
    { href: "/settings", label: "Settings", icon: <Settings className="h-5 w-5" /> },
  ];

  return (
    <div className="flex min-h-screen flex-col bg-white">
      {/* App Header */}
      <header className="sticky top-0 z-10 bg-catchup-primary px-4 py-3 shadow-md">
        <div className="container mx-auto flex items-center justify-between">
          {/* Logo and Title */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white">
              <Star className="h-6 w-6 text-catchup-accent" />
            </div>
            <span className="text-xl font-semibold text-white">Catch Up</span>
          </div>
          
          {/* Page Title */}
          <h1 className="hidden text-xl font-semibold text-white md:block">{title}</h1>
          
          {/* Mobile Menu Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            className="md:hidden text-white hover:bg-catchup-primary/80"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </Button>
          
          {/* Desktop Navigation */}
          <nav className="hidden space-x-1 md:flex">
            {navItems.map((item) => (
              <Button
                key={item.href}
                variant="ghost"
                size="sm"
                asChild
                className={cn(
                  "text-white hover:bg-white/10",
                  location === item.href && "bg-white/20"
                )}
              >
                <Link href={item.href}>
                  <span className="flex items-center gap-1">
                    {item.icon}
                    <span>{item.label}</span>
                  </span>
                </Link>
              </Button>
            ))}
          </nav>
        </div>
      </header>
      
      {/* Mobile Menu (collapsed by default) */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-20 bg-black/50 md:hidden" onClick={() => setIsMobileMenuOpen(false)}>
          <div 
            className="absolute left-0 top-16 h-screen w-64 bg-white p-4 shadow-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex flex-col space-y-1">
              {navItems.map((item) => (
                <Button
                  key={item.href}
                  variant="ghost"
                  size="sm"
                  asChild
                  className={cn(
                    "justify-start text-catchup-primary hover:bg-catchup-primary/10",
                    location === item.href && "bg-catchup-primary/5 font-medium"
                  )}
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  <Link href={item.href}>
                    <span className="flex items-center gap-3">
                      {item.icon}
                      <span>{item.label}</span>
                    </span>
                  </Link>
                </Button>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6">
        {/* Mobile Title */}
        <h1 className="mb-4 text-2xl font-bold text-catchup-primary md:hidden">{title}</h1>
        
        {/* Content */}
        <div className="container mx-auto">
          {children}
        </div>
      </main>
      
      {/* Floating Action Button (FAB) */}
      {showFab && (
        <div className="fixed bottom-6 right-6">
          <Button
            className="h-14 w-14 rounded-full bg-catchup-primary shadow-lg hover:bg-catchup-primary/90"
            onClick={onFabClick}
          >
            {fabIcon || <Plus className="h-6 w-6" />}
          </Button>
        </div>
      )}
      
      {/* Bottom Navigation for Mobile */}
      <div className="sticky bottom-0 z-10 border-t border-catchup-border bg-white px-2 py-2 shadow-md md:hidden">
        <div className="grid grid-cols-5 gap-1">
          {navItems.slice(0, 5).map((item) => (
            <Button
              key={item.href}
              variant="ghost"
              size="sm"
              asChild
              className={cn(
                "flex flex-col items-center justify-center rounded-lg px-1 py-2 text-xs",
                location === item.href 
                  ? "bg-catchup-primary/5 text-catchup-primary" 
                  : "text-gray-500"
              )}
            >
              <Link href={item.href}>
                <div className="flex flex-col items-center justify-center">
                  {item.icon}
                  <span className="mt-1 text-xs">{item.label}</span>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}

// Helper for the FAB
export function Plus(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14" />
      <path d="M12 5v14" />
    </svg>
  );
}