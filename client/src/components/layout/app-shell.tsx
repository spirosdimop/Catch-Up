import { useState } from "react";
import { Sidebar } from "@/components/ui/sidebar";
import { MobileSidebar } from "@/components/ui/mobile-sidebar";
import { Header } from "@/components/layout/header";
import { AIAssistantFloating } from "@/components/ai-assistant/floating-button";

type AppShellProps = {
  children: React.ReactNode;
};

export function AppShell({ children }: AppShellProps) {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  const toggleMobileSidebar = () => {
    setIsMobileSidebarOpen(!isMobileSidebarOpen);
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <MobileSidebar isOpen={isMobileSidebarOpen} onClose={() => setIsMobileSidebarOpen(false)} />
      
      <div className="flex flex-col flex-1 w-full overflow-hidden">
        <Header onMenuToggle={toggleMobileSidebar} />
        
        <main className="flex-1 overflow-y-auto bg-gray-50 px-4 py-6 md:px-6">
          {children}
        </main>
      </div>
      
      {/* AI Assistant Floating Button - accessible from all app pages */}
      <AIAssistantFloating />
    </div>
  );
}

export default AppShell;
