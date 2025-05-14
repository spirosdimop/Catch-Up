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
import DashboardRedesign from "@/pages/dashboard-simple";
import Clients from "./pages/clients";
import ClientsRedesign from "@/pages/clients-redesign";
// Import placeholder pages for the new routes
import Settings from "@/pages/settings";
import Messages from "@/pages/messages";
import MessagesRedesign from "@/pages/messages-redesign";
import Bookings from "@/pages/bookings";
import BookingsRedesign from "@/pages/bookings-redesign";
import BookingManagement from "@/pages/booking-management";
import BookingsTab from "@/pages/bookings-tab";
import Calendar from "@/pages/calendar";
import CalendarNew from "@/pages/calendar-new";
import Profile from "@/pages/profile";
import ProfileRedesign from "@/pages/profile-redesign";
import AIAssistant from "@/pages/ai-assistant";
import Signup from "@/pages/signup";
import LandingPage from "@/pages/landing";

// Catch Up App Pages
import CatchUpDashboard from "@/pages/catchup";
import CatchUpTasks from "@/pages/catchup/tasks";
import CatchUpCalendar from "@/pages/catchup/calendar";
import CatchUpTime from "@/pages/catchup/time";
import CatchUpMessages from "@/pages/catchup/messages";
import CatchUpSettings from "@/pages/catchup/settings";

function Router() {
  const [location] = useLocation();
  
  // Pages that don't use the main application shell
  const noAppShellPages = ["/signup", "/", "/login"];
  
  // Catch Up app pages (these use their own layout)
  const catchUpPages = [
    "/catchup", 
    "/catchup/tasks", 
    "/catchup/calendar", 
    "/catchup/time", 
    "/catchup/messages", 
    "/catchup/settings"
  ];
  
  // Check if current location is a Catch Up page
  const isCatchUpPage = catchUpPages.some(page => location === page || location.startsWith(`${page}/`));
  
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
  
  // Catch Up app pages
  if (isCatchUpPage) {
    return (
      <Switch>
        <Route path="/catchup" component={CatchUpDashboard} />
        <Route path="/catchup/tasks" component={CatchUpTasks} />
        <Route path="/catchup/calendar" component={CatchUpCalendar} />
        <Route path="/catchup/time" component={CatchUpTime} />
        <Route path="/catchup/messages" component={CatchUpMessages} />
        <Route path="/catchup/settings" component={CatchUpSettings} />
        <Route component={NotFound} />
      </Switch>
    );
  }
  
  // Main app pages with the AppShell
  return (
    <AppShell>
      <Switch>
        <Route path="/dashboard-original" component={Dashboard} />
        <Route path="/dashboard" component={DashboardRedesign} />
        <Route path="/clients-original" component={Clients} />
        <Route path="/clients" component={ClientsRedesign} />
        <Route path="/bookings-original" component={Bookings} />
        <Route path="/bookings-old" component={BookingsRedesign} />
        <Route path="/bookings" component={BookingsTab} />
        <Route path="/booking-management" component={BookingManagement} />
        <Route path="/messages-original" component={Messages} />
        <Route path="/messages" component={MessagesRedesign} />
        <Route path="/calendar-original" component={Calendar} />
        <Route path="/calendar" component={CalendarNew} />
        <Route path="/profile-original" component={Profile} />
        <Route path="/profile" component={ProfileRedesign} />
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
