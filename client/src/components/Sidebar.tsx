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
  Settings
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard className="w-5 h-5 mr-2" /> },
    { name: 'Projects', path: '/projects', icon: <LayoutPanelLeft className="w-5 h-5 mr-2" /> },
    { name: 'Clients', path: '/clients', icon: <Users className="w-5 h-5 mr-2" /> },
    { name: 'Tasks', path: '/tasks', icon: <CheckSquare className="w-5 h-5 mr-2" /> },
    { name: 'Invoices', path: '/invoices', icon: <FileText className="w-5 h-5 mr-2" /> },
    { name: 'Time Tracking', path: '/time-tracking', icon: <Clock className="w-5 h-5 mr-2" /> },
    { name: 'Reports', path: '/reports', icon: <BarChart3 className="w-5 h-5 mr-2" /> },
  ];

  return (
    <aside className={cn("flex flex-col bg-white border-r border-gray-200 w-64 transition-all duration-300 ease-in-out", className)}>
      <div className="p-6 border-b border-gray-200">
        <h1 className="text-2xl font-semibold text-primary flex items-center">
          <CheckSquare className="mr-2" />
          FreelanceFlow
        </h1>
      </div>
      
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <Link href={item.path}>
                <a className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-md",
                  location === item.path
                    ? "bg-primary-50 text-primary"
                    : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                )}>
                  {item.icon}
                  {item.name}
                </a>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="p-4 border-t border-gray-200">
        <div className="flex items-center">
          <Avatar className="h-8 w-8">
            <AvatarImage src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80" alt="User profile" />
            <AvatarFallback>AJ</AvatarFallback>
          </Avatar>
          <div className="ml-3">
            <p className="text-sm font-medium text-gray-700">Alex Johnson</p>
            <p className="text-xs font-medium text-gray-500">alex@example.com</p>
          </div>
          <button className="ml-auto text-gray-400 hover:text-gray-500">
            <Settings className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  );
}
