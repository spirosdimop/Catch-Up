import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  Users,
  Calendar,
  MessageSquare,
  BookOpen,
  Bot,
  Settings,
  UserCircle,
  Cog,
  LogOut
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useUser } from "@/lib/userContext";

type SidebarNavItem = {
  title: string;
  href: string;
  icon: React.ReactNode;
};

const navItems: SidebarNavItem[] = [
  {
    title: "Dashboard",
    href: "/",
    icon: <LayoutDashboard className="w-5 h-5 mr-2" />,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: <Users className="w-5 h-5 mr-2" />,
  },
  {
    title: "Bookings",
    href: "/bookings",
    icon: <BookOpen className="w-5 h-5 mr-2" />,
  },
  {
    title: "Messages",
    href: "/messages",
    icon: <MessageSquare className="w-5 h-5 mr-2" />,
  },
  {
    title: "Calendar",
    href: "/calendar",
    icon: <Calendar className="w-5 h-5 mr-2" />,
  },
  {
    title: "Profile",
    href: "/profile",
    icon: <UserCircle className="w-5 h-5 mr-2" />,
  },
  {
    title: "AI Assistant",
    href: "/ai-assistant",
    icon: <Bot className="w-5 h-5 mr-2" />,
  },
  {
    title: "Settings",
    href: "/settings",
    icon: <Settings className="w-5 h-5 mr-2" />,
  },
];

export function Sidebar() {
  const [location] = useLocation();
  const { user, clearUser } = useUser();

  // Default user data if none is available in context
  const userData = user || {
    firstName: "Guest",
    lastName: "User",
    email: "guest@example.com",
    profileImageUrl: "",
  };

  return (
    <aside className="hidden md:flex flex-col bg-white border-r border-gray-200 w-64 transition-all duration-300 ease-in-out">
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-primary flex items-center">
          <Bot className="mr-2" />
          FreelanceFlow
        </h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <a className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  location === item.href
                    ? "bg-primary-50 text-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}>
                  {item.icon}
                  {item.title}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <Avatar>
            <AvatarImage src={userData.profileImageUrl} alt="User profile photo" />
            <AvatarFallback>{userData.firstName?.charAt(0)}{userData.lastName?.charAt(0)}</AvatarFallback>
          </Avatar>
          <div className="ml-3 overflow-hidden">
            <p className="text-sm font-medium text-gray-700 truncate">
              {userData.firstName} {userData.lastName}
            </p>
            <p className="text-xs font-medium text-gray-500 truncate">
              {userData.email}
            </p>
            {userData.businessName && (
              <p className="text-xs text-purple-600 truncate">
                {userData.businessName}
              </p>
            )}
          </div>
          <div className="flex ml-auto">
            <Link href="/settings">
              <a className="mr-1">
                <Button variant="ghost" size="icon">
                  <Cog className="h-4 w-4" />
                </Button>
              </a>
            </Link>
            {user && (
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => {
                  clearUser();
                  window.location.href = "/signup"; // Force full reload to clear state
                }}
              >
                <LogOut className="h-4 w-4 text-red-600" />
              </Button>
            )}
          </div>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
