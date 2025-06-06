import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { UserProvider } from "@/lib/userContext";
import { AppSettingsProvider } from "@/lib/appSettingsContext";
import AppShell from "@/components/layout/app-shell";
import FloatingNotesWidget from "@/components/FloatingNotesWidget";
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

import Calendar from "@/pages/calendar";
import CalendarNew from "@/pages/calendar-new";
import CalendarSimple from "@/pages/calendar-simple";
import UnifiedCalendar from "@/pages/unified-calendar-clean";
import SimpleCalendar from "@/pages/simple-calendar";
import InteractiveCalendar from "@/pages/interactive-calendar";
import CatchUpAISettings from "@/pages/catchup-settings";
import Profile from "@/pages/profile";
import ProfileRedesign from "@/pages/profile-redesign";
import PublicProfile from "@/pages/public-profile";

import AppointmentsPage from "@/pages/appointments";
import AIAssistant from "@/pages/ai-assistant";

import Projects from "@/pages/Projects";
import ProjectDetail from "@/pages/project";
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
  
  // Check if this is a public profile page (format: /p/{username})
  const isPublicProfilePage = location.startsWith('/p/');

  // Landing, Signup, Login, and Public Profile pages don't use the app shell
  if (noAppShellPages.includes(location) || isPublicProfilePage) {
    return (
      <Switch>
        <Route path="/" component={NewLandingPage} />
        <Route path="/signup" component={Signup} />
        <Route path="/login" component={Signup} /> {/* Reusing Signup component for login */}
        <Route path="/p/:username" component={PublicProfile} />
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
        <Route path="/dashboard" component={Dashboard} />
        <Route path="/dashboard-simple" component={DashboardRedesign} />
        <Route path="/clients" component={Clients} />
        <Route path="/clients-redesign" component={ClientsRedesign} />
        <Route path="/appointments" component={AppointmentsPage} />
        <Route path="/messages" component={MessagesRedesign} />
        <Route path="/messages-original" component={Messages} />
        <Route path="/calendar" component={InteractiveCalendar} />
        <Route path="/unified-calendar" component={UnifiedCalendar} />
        <Route path="/calendar-new" component={CalendarNew} />
        <Route path="/calendar-original" component={Calendar} />
        <Route path="/calendar-simple" component={CalendarSimple} />
        <Route path="/profile" component={ProfileRedesign} />
        <Route path="/profile-original" component={Profile} />
        <Route path="/projects" component={Projects} />
        <Route path="/projects/:id" component={ProjectDetail} />
        <Route path="/ai-assistant" component={AIAssistant} />
        <Route path="/settings" component={Settings} />
        <Route path="/catchup-settings" component={CatchUpAISettings} />
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
            <FloatingNotesWidget />
          </TooltipProvider>
        </UserProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
