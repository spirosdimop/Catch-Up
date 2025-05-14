import React from 'react';
import { Link, useLocation } from 'wouter';
import {
  Calendar,
  CheckSquare,
  Clock,
  Home,
  Settings,
  MessageSquare,
  Bell,
  User,
  Search,
  LogOut
} from 'lucide-react';
import '../../styles/catchup.css';

interface LayoutProps {
  children: React.ReactNode;
}

export function CatchUpLayout({ children }: LayoutProps) {
  const [location] = useLocation();

  const navItems = [
    { icon: <Home size={20} />, label: 'Dashboard', path: '/catchup' },
    { icon: <CheckSquare size={20} />, label: 'Tasks', path: '/catchup/tasks' },
    { icon: <Calendar size={20} />, label: 'Calendar', path: '/catchup/calendar' },
    { icon: <Clock size={20} />, label: 'Time Tracking', path: '/catchup/time' },
    { icon: <MessageSquare size={20} />, label: 'Messages', path: '/catchup/messages' },
    { icon: <Settings size={20} />, label: 'Settings', path: '/catchup/settings' },
  ];

  return (
    <div className="catchup-layout">
      {/* Sidebar */}
      <div className="catchup-sidebar">
        <div className="catchup-flex catchup-items-center catchup-mb-4">
          <div 
            className="text-xl font-bold text-white flex items-center"
            style={{ letterSpacing: '0.05em' }}
          >
            <span className="text-[var(--catchup-cobalt)]">Catch</span>
            <span className="text-white">Up</span>
          </div>
        </div>
        
        <nav className="catchup-my-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              href={item.path}
              className={`catchup-nav-link ${location === item.path ? 'active' : ''}`}
            >
              <span className="catchup-nav-icon">
                {item.icon}
              </span>
              {item.label}
            </Link>
          ))}
        </nav>
        
        <div className="mt-auto pt-4 border-t border-[var(--catchup-dark-gray)]">
          <Link
            href="/logout"
            className="catchup-nav-link"
          >
            <span className="catchup-nav-icon">
              <LogOut size={20} />
            </span>
            Log Out
          </Link>
        </div>
      </div>

      {/* Main Content */}
      <div className="ml-[250px] w-[calc(100%-250px)] min-h-screen flex flex-col">
        {/* Header */}
        <header className="catchup-navbar">
          <div className="catchup-flex catchup-items-center catchup-gap-4">
            <div className="relative">
              <input 
                type="text" 
                placeholder="Search..." 
                className="catchup-input pl-10 py-2 w-64"
              />
              <Search className="absolute left-3 top-2.5 text-[var(--catchup-gray)]" size={18} />
            </div>
          </div>
          
          <div className="catchup-flex catchup-items-center catchup-gap-4">
            <button className="catchup-button catchup-button-ghost rounded-full w-9 h-9 p-0 flex items-center justify-center relative">
              <Bell size={20} />
              <span className="absolute -top-1 -right-1 bg-[var(--catchup-cobalt)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                3
              </span>
            </button>
            
            <div className="catchup-flex catchup-items-center catchup-gap-2">
              <div className="w-9 h-9 rounded-full bg-[var(--catchup-cobalt-light)] flex items-center justify-center">
                <User size={20} />
              </div>
              <div className="hidden md:block">
                <div className="text-sm font-medium">Alex Johnson</div>
                <div className="text-xs text-[var(--catchup-gray)]">Premium Plan</div>
              </div>
            </div>
          </div>
        </header>
        
        {/* Page Content */}
        <main className="flex-1 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}