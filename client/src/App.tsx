import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { UserProvider } from "@/lib/userContext";
import { AppSettingsProvider } from "@/lib/appSettingsContext";
import AppShell from "@/components/layout/app-shell";
import NotFound from "@/pages/not-found";
// Use lowercase imports for consistency 
import Dashboard from "./pages/dashboard";
import Clients from "./pages/clients";
// Import placeholder pages for the new routes
import Settings from "@/pages/settings";
import Messages from "@/pages/messages";
import Bookings from "@/pages/bookings";
import Calendar from "@/pages/calendar";
import CalendarNew from "@/pages/calendar-new";
import Profile from "@/pages/profile";
import ProfileRedesign from "@/pages/profile-redesign";
import AIAssistant from "@/pages/ai-assistant";
import UnifiedAssistant from "@/pages/unified-assistant";
import Signup from "@/pages/signup";
import LandingPage from "@/pages/landing";

function Router() {
  const [location] = useLocation();
  
  // Pages that don't use the main application shell
  const noAppShellPages = ["/signup", "/", "/login"];
  
  // Check if current location should not use AppShell
  if (noAppShellPages.includes(location)) {
    return (
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/signup" component={Signup} />
        <Route path="/login" component={Signup} /> {/* Reusing Signup component for login, update if you have a separate Login component */}
      </Switch>
    );
  }
  
  // Main app pages with the AppShell
  return (
    <AppShell>
      <Switch>
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/clients" component={Clients} />
        <Route path="/bookings" component={Bookings} />
        <Route path="/messages" component={Messages} />
        <Route path="/calendar-original" component={Calendar} />
        <Route path="/calendar" component={CalendarNew} />
        <Route path="/profile-original" component={Profile} />
        <Route path="/profile" component={ProfileRedesign} />
        <Route path="/ai-assistant" component={AIAssistant} />
        <Route path="/unified-assistant" component={UnifiedAssistant} />
        <Route path="/settings" component={Settings} />
        <Route component={NotFound} />
      </Switch>
    </AppShell>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="freelance-flow-theme">
        <UserProvider>
          <AppSettingsProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AppSettingsProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
