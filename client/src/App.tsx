import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import AppShell from "@/components/layout/app-shell";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/dashboard";
import Clients from "@/pages/clients";
// Import placeholder pages for the new routes
import Settings from "@/pages/settings";
import Messages from "@/pages/messages";
import Bookings from "@/pages/bookings";
import Calendar from "@/pages/calendar";
import Profile from "@/pages/profile";
import AIAssistant from "@/pages/ai-assistant";
import Signup from "@/pages/signup";

function Router() {
  const [location] = useLocation();
  
  // Don't render the AppShell for the signup page
  const isSignupPage = location === "/signup";
  
  if (isSignupPage) {
    return (
      <Switch>
        <Route path="/signup" component={Signup} />
      </Switch>
    );
  }
  
  return (
    <AppShell>
      <Switch>
        <Route path="/" component={Dashboard} />
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
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
