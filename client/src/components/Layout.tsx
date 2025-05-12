import { ReactNode, useState } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";
import MobileSidebar from "./MobileSidebar";

interface LayoutProps {
  children: ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  const closeMobileSidebar = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <Sidebar className="hidden md:flex" />

      {/* Mobile sidebar (hidden by default) */}
      <MobileSidebar 
        isOpen={isMobileSidebarOpen} 
        onClose={closeMobileSidebar} 
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header onMenuToggle={toggleMobileSidebar} />
        
        {/* Main content area */}
        <main className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6 md:px-6">
          {children}
        </main>
      </div>
    </div>
  );
}
