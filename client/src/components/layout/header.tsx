import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Bell,
  Menu,
  Search,
  Bot,
  Globe
} from "lucide-react";
import { useAppSettings, languageCodeToName } from "@/lib/appSettingsContext";

type HeaderProps = {
  onMenuToggle: () => void;
};

export function Header({ onMenuToggle }: HeaderProps) {
  // In a real app, you would fetch user data from an API
  const user = {
    name: "Alex Johnson",
    email: "alex@example.com",
    avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
  };

  // Get current language from app settings
  const { settings } = useAppSettings();
  const [currentLanguageDisplay, setCurrentLanguageDisplay] = useState('');

  // Effect to update language display when settings change
  useEffect(() => {
    const lang = settings.language || 'en';
    const displayName = languageCodeToName[lang] || lang;
    setCurrentLanguageDisplay(displayName);
    
    // Log current language for debugging
    console.log('Current language (header):', lang);
    console.log('Language display (header):', displayName);
    console.log('Full settings (header):', settings);
  }, [settings.language]);

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex justify-between items-center px-4 py-3 md:px-6">
        <div className="flex items-center md:hidden">
          <Button variant="ghost" size="icon" onClick={onMenuToggle}>
            <Menu className="h-5 w-5" />
          </Button>
          <h1 className="text-lg font-semibold text-primary ml-2 flex items-center">
            <Bot className="mr-2 h-5 w-5" />
            FreelanceFlow
          </h1>
        </div>
        
        <div className="flex items-center flex-1 md:ml-6 justify-end">
          <div className="max-w-lg w-full lg:max-w-xs hidden md:block mr-4">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input 
                placeholder="Search" 
                type="search" 
                className="pl-10 pr-3 py-2"
              />
            </div>
          </div>

          <div className="flex items-center">
            {/* Language indicator */}
            <Badge variant="outline" className="mr-2 bg-blue-50 text-blue-700 hidden md:flex">
              <Globe className="h-3 w-3 mr-1" />
              {currentLanguageDisplay}
            </Badge>
            
            <Button variant="ghost" size="icon" className="relative">
              <Bell className="h-5 w-5 text-gray-400" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-amber-500"></span>
            </Button>
            
            <div className="ml-3 relative">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatarUrl} alt="User profile photo" />
                      <AvatarFallback>{user.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>Sign out</DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
