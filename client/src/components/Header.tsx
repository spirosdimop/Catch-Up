import { useState } from "react";
import { Menu, Search, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import UserMenu from "./UserMenu";

interface HeaderProps {
  onMenuToggle: () => void;
}

export default function Header({ onMenuToggle }: HeaderProps) {
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  return (
    <header className="bg-white shadow-sm z-10">
      <div className="flex justify-between items-center px-4 py-3 md:px-6">
        <div className="flex items-center md:hidden">
          <button 
            className="text-gray-500 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary p-2 rounded-md"
            onClick={onMenuToggle}
          >
            <Menu className="h-6 w-6" />
          </button>
          <h1 className="text-lg font-semibold text-primary ml-2">FreelanceFlow</h1>
        </div>
        
        <div className="flex items-center flex-1 md:ml-6 justify-end">
          <div className="max-w-lg w-full lg:max-w-xs hidden md:block mr-4">
            <label htmlFor="search" className="sr-only">Search</label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <Input
                id="search"
                className="block w-full pl-10 pr-3 py-2"
                placeholder="Search"
                type="search"
              />
            </div>
          </div>

          <div className="flex items-center">
            <button className="p-2 text-gray-400 hover:text-gray-500 relative">
              <Bell className="h-6 w-6" />
              <span className="absolute top-1 right-1 block h-2 w-2 rounded-full bg-accent-500"></span>
            </button>
            
            <div className="ml-3 relative">
              <UserMenu />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
