import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  LayoutPanelLeft,
  Users,
  CheckSquare,
  FileText,
  Clock,
  BarChart3,
  X,
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

type MobileSidebarProps = {
  isOpen: boolean;
  onClose: () => void;
};

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
    title: "Projects",
    href: "/projects",
    icon: <LayoutPanelLeft className="w-5 h-5 mr-2" />,
  },
  {
    title: "Clients",
    href: "/clients",
    icon: <Users className="w-5 h-5 mr-2" />,
  },
  {
    title: "Tasks",
    href: "/tasks",
    icon: <CheckSquare className="w-5 h-5 mr-2" />,
  },
  {
    title: "Invoices",
    href: "/invoices",
    icon: <FileText className="w-5 h-5 mr-2" />,
  },
  {
    title: "Time Tracking",
    href: "/time-tracking",
    icon: <Clock className="w-5 h-5 mr-2" />,
  },
  {
    title: "Reports",
    href: "/reports",
    icon: <BarChart3 className="w-5 h-5 mr-2" />,
  },
];

export function MobileSidebar({ isOpen, onClose }: MobileSidebarProps) {
  const [location] = useLocation();

  // In a real app, you would fetch user data from an API
  const user = {
    name: "Alex Johnson",
    email: "alex@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex z-40 md:hidden" role="dialog" aria-modal="true">
      <div 
        className="fixed inset-0 bg-gray-600 bg-opacity-75" 
        aria-hidden="true"
        onClick={onClose}
      ></div>
      <div className="relative flex-1 flex flex-col max-w-xs w-full bg-white">
        <div className="absolute top-0 right-0 -mr-12 pt-2">
          <button 
            className="ml-1 flex items-center justify-center h-10 w-10 rounded-full focus:outline-none focus:ring-2 focus:ring-inset focus:ring-white"
            onClick={onClose}
          >
            <span className="sr-only">Close sidebar</span>
            <X className="h-6 w-6 text-white" />
          </button>
        </div>
        
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-semibold text-primary flex items-center">
            <CheckSquare className="mr-2" />
            FreelanceFlow
          </h1>
        </div>
        
        <nav className="flex-1 overflow-y-auto py-4">
          <ul className="space-y-1 px-3">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <a
                    className={cn(
                      "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                      location === item.href
                        ? "bg-primary-50 text-primary"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    onClick={onClose}
                  >
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
              <AvatarImage src={user.avatarUrl} alt="User profile photo" />
              <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-700">{user.name}</p>
              <p className="text-xs font-medium text-gray-500">{user.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MobileSidebar;
