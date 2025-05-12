import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { UserProvider } from "@/lib/userContext";
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
import Profile from "@/pages/profile";
import AIAssistant from "@/pages/ai-assistant";
import Signup from "@/pages/signup";
import LandingPage from "@/pages/landing";

function Router() {
  const [location] = useLocation();
  
  // Pages that don't use the main application shell
  const noAppShellPages = ["/signup", "/"];
  
  // Check if current location should not use AppShell
  if (noAppShellPages.includes(location)) {
    return (
      <Switch>
        <Route path="/" component={LandingPage} />
        <Route path="/signup" component={Signup} />
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
        <Route path="/calendar" component={Calendar} />
        <Route path="/profile" component={Profile} />
        <Route path="/ai-assistant" component={AIAssistant} />
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
          <TooltipProvider>
            <Toaster />
            <Router />
          </TooltipProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
