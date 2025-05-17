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
// Import pages with correct casing
import Dashboard from "@/pages/Dashboard";
import DashboardRedesign from "@/pages/dashboard-simple";
import Clients from "@/pages/Clients";
import ClientsRedesign from "@/pages/clients-redesign";
// Import placeholder pages for the new routes
import Settings from "@/pages/settings";
import Messages from "@/pages/messages";
import MessagesRedesign from "@/pages/messages-redesign";
import Bookings from "@/pages/bookings";
import BookingsRedesign from "@/pages/bookings-redesign";
import BookingManagement from "@/pages/booking-management";
import BookingsTab from "@/pages/bookings-tab";
import BookingsTabUpdated from "@/pages/bookings-tab-updated";
import { BookingsFixed } from "@/pages/bookings-fixed";
import Calendar from "@/pages/calendar";
import CalendarNew from "@/pages/calendar-new";
import CalendarSimple from "@/pages/calendar-simple";
import Profile from "@/pages/profile";
import ProfileRedesign from "@/pages/profile-redesign";
import AIAssistant from "@/pages/ai-assistant";

import Projects from "@/pages/Projects";
import Signup from "@/pages/signup";
import LandingPage from "@/pages/landing";
// Import new landing page
import NewLandingPage from "@/pages/new-landing";

// Catch Up App Pages
import CatchUpDashboard from "@/pages/catchup";
import CatchUpTasks from "@/pages/catchup/tasks";
import CatchUpCalendar from "@/pages/catchup/calendar";
import CatchUpTime from "@/pages/catchup/time";
import CatchUpMessages from "@/pages/catchup/messages";
import CatchUpSettings from "@/pages/catchup/settings";

// New Catch Up App pages
import CatchUpLandingPage from "@/pages/catch-up/landing";
import { CatchUpSignupPage } from "@/pages/catch-up/signup";
import { CatchUpLoginPage } from "@/pages/catch-up/login";
import CatchUpDashboardPage from "@/pages/catch-up/dashboard";
import CatchUpCalendarPage from "@/pages/catch-up/calendar";

function Router() {
  const [location] = useLocation();
  
  // Pages that don't use the main application shell
  const noAppShellPages = ["/signup", "/", "/login"];
  
  // Catch Up app pages that use their own layout (legacy)
  const catchUpPages = [
    "/catchup", 
    "/catchup/tasks", 
    "/catchup/calendar", 
    "/catchup/time", 
    "/catchup/messages", 
    "/catchup/settings"
  ];
  
  // Check if current location is an old Catch Up page
  const isCatchUpPage = catchUpPages.some(page => location === page || location.startsWith(`${page}/`));
  
  // Landing, Signup, and Login pages - we keep their unique non-app-shell design
  if (noAppShellPages.includes(location)) {
    return (
      <Switch>
        <Route path="/" component={NewLandingPage} />
        <Route path="/signup" component={Signup} />
        <Route path="/login" component={Signup} /> {/* Reusing Signup component for login */}
      </Switch>
    );
  }
  
  // New Catch Up pages with specific URL paths (we'll keep these routes for compatibility)
  if (location === "/catch-up") {
    return <CatchUpLandingPage />;
  }
  if (location === "/catch-up/login") {
    return <CatchUpLoginPage />;
  }
  if (location === "/catch-up/signup") {
    return <CatchUpSignupPage />;
  }
  if (location === "/catch-up/dashboard") {
    return <CatchUpDashboardPage />;
  }
  if (location === "/catch-up/calendar") {
    return <CatchUpCalendarPage />;
  }
  
  // Original Catch Up app pages (legacy)
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
  
  // All other pages use the AppShell with the Catch Up design
  return (
    <AppShell>
      <Switch>
        <Route path="/dashboard" component={DashboardRedesign} />
        <Route path="/dashboard-original" component={Dashboard} />
        <Route path="/clients" component={ClientsRedesign} />
        <Route path="/clients-original" component={Clients} />
        <Route path="/bookings" component={BookingsFixed} />
        <Route path="/bookings-new" component={BookingsTabUpdated} />
        <Route path="/bookings-original" component={Bookings} />
        <Route path="/bookings-old" component={BookingsRedesign} />
        <Route path="/booking-management" component={BookingManagement} />
        <Route path="/messages" component={MessagesRedesign} />
        <Route path="/messages-original" component={Messages} />
        <Route path="/calendar" component={CalendarNew} />
        <Route path="/calendar-original" component={Calendar} />
        <Route path="/calendar-simple" component={CalendarSimple} />
        <Route path="/profile" component={ProfileRedesign} />
        <Route path="/profile-original" component={Profile} />
        <Route path="/projects" component={Projects} />
        <Route path="/projects/:id" component={() => {
          const ProjectDetail = require("@/pages/project").default;
          return <ProjectDetail />;
        }} />
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
