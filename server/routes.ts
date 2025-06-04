import { Router, type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import {
  insertTimeEntrySchema,
  insertInvoiceSchema,
  insertInvoiceItemSchema,
  insertNavigationEventSchema,
  insertUserPreferencesSchema,
  insertUserSchema,
  insertAutoResponseSchema
} from "@shared/schema";
import { z } from "zod";
import { registerPublicProfileRoutes } from "./routes/publicProfile";
import aiRoutes from "./routes/ai";
import bookingsRoutes from "./routes/bookings";
import clientsRoutes from "./routes/clients";
import projectsRoutes from "./routes/projects";
import tasksRoutes from "./routes/tasks";
import eventsRoutes from "./routes/events";
import aiExtendedRoutes from "./routes/aiExtended";

// Helper functions for navigation tracking
function getDisplayNameForPath(path: string): string {
  // Convert path to a user-friendly display name
  const pathMap: Record<string, string> = {
    '/': 'Home',
    '/dashboard': 'Dashboard',
    '/clients': 'Clients',
    '/projects': 'Projects',
    '/tasks': 'Tasks',
    '/invoices': 'Invoices',
    '/calendar': 'Calendar',
    '/settings': 'Settings',
    '/profile': 'Profile',
  };
  
  // Check if we have a direct mapping
  if (pathMap[path]) {
    return pathMap[path];
  }
  
  // Handle dynamic paths
  if (path.startsWith('/clients/')) {
    return 'Client Details';
  } else if (path.startsWith('/projects/')) {
    return 'Project Details';
  } else if (path.startsWith('/tasks/')) {
    return 'Task Details';
  } else if (path.startsWith('/invoices/')) {
    return 'Invoice Details';
  }
  
  // Default: capitalize and remove slashes
  return path
    .split('/')
    .filter(Boolean)
    .map(segment => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
}

function getDisplayNameForElement(elementId: string): string {
  // Convert element ID to a user-friendly display name
  const elementMap: Record<string, string> = {
    'nav-dashboard': 'Dashboard menu item',
    'nav-clients': 'Clients menu item',
    'nav-projects': 'Projects menu item',
    'nav-tasks': 'Tasks menu item',
    'nav-invoices': 'Invoices menu item',
    'nav-calendar': 'Calendar menu item',
    'nav-settings': 'Settings menu item',
    'create-client-btn': 'Create Client button',
    'create-project-btn': 'Create Project button',
    'create-task-btn': 'Create Task button',
    'create-invoice-btn': 'Create Invoice button',
    'unified-assistant-btn': 'Assistant button',
  };
  
  // Check if we have a direct mapping
  if (elementMap[elementId]) {
    return elementMap[elementId];
  }
  
  // Handle dynamic IDs with common prefixes
  if (elementId.startsWith('client-')) {
    return 'Client item';
  } else if (elementId.startsWith('project-')) {
    return 'Project item';
  } else if (elementId.startsWith('task-')) {
    return 'Task item';
  } else if (elementId.startsWith('invoice-')) {
    return 'Invoice item';
  } else if (elementId.endsWith('-edit-btn')) {
    return 'Edit button';
  } else if (elementId.endsWith('-delete-btn')) {
    return 'Delete button';
  } else if (elementId.endsWith('-save-btn')) {
    return 'Save button';
  } else if (elementId.endsWith('-cancel-btn')) {
    return 'Cancel button';
  }
  
  // Default: replace hyphens with spaces and capitalize
  return elementId
    .split('-')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
}

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = Router();
  
  // Health check endpoint
  apiRouter.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });

  // User registration endpoint
  apiRouter.post("/register", async (req, res) => {
    try {
      // Create a signup schema that extends the insertUserSchema
      const signupSchema = insertUserSchema.extend({
        fullName: z.string().min(1, "Full name is required"),
      });

      const { fullName, ...userData } = signupSchema.parse({
        ...req.body,
        // Default username if not provided
        username: req.body.username || req.body.email,
      });

      // Split fullName into name parts for the user record
      const nameParts = fullName.trim().split(/\s+/);
      const name = nameParts.length > 0 ? nameParts.join(' ') : fullName;

      // Create the user
      const user = await storage.createUser({
        ...userData,
        name,
      });

      // Remove password from response
      const { password, ...userWithoutPassword } = user;

      res.status(201).json({
        message: "User registered successfully",
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Error registering user:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Validation failed", 
          errors: error.errors 
        });
      }
      
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  // Mount modular routers
  apiRouter.use("/clients", clientsRoutes);
  apiRouter.use("/projects", projectsRoutes);
  apiRouter.use("/tasks", tasksRoutes);
  apiRouter.use("/events", eventsRoutes);
  apiRouter.use(aiExtendedRoutes);

  // Navigation tracking endpoints
  apiRouter.post("/navigation/track", async (req, res) => {
    try {
      const { userId, path, fromPath, sessionId, timeOnPage, clickedElements = [] } = req.body;
      const validatedTimeOnPage = timeOnPage && !isNaN(Number(timeOnPage)) ? Number(timeOnPage) : null;
      
      if (!userId || !path || !sessionId) {
        return res.status(400).json({ 
          message: "Invalid request. 'userId', 'path', and 'sessionId' are required." 
        });
      }
      
      const navigationData = {
        userId,
        path,
        fromPath,
        sessionId,
        timestamp: new Date(),
        timeOnPage,
        clickedElements: clickedElements.length > 0 ? JSON.stringify(clickedElements) : null
      };
      
      const navigationEvent = await storage.createNavigationEvent(navigationData);
      
      res.status(201).json({ 
        message: "Navigation event recorded successfully",
        id: navigationEvent.id
      });
    } catch (error) {
      console.error("Error recording navigation:", error);
      res.status(500).json({ 
        message: "Failed to record navigation",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  apiRouter.get("/navigation/patterns/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const navigations = await storage.getNavigationEventsByUser(userId);
      
      // Process navigation data to find patterns
      const patterns: Array<{
        fromPath: string;
        toPath: string;
        frequency: number;
        avgTimeOnPage: number;
      }> = [];
      
      const pathFrequency: Record<string, number> = {};
      const fromToMap: Record<string, number> = {};
      
      // Count frequency of paths and transitions
      for (const nav of navigations) {
        // Count path frequency
        pathFrequency[nav.path] = (pathFrequency[nav.path] || 0) + 1;
        
        // Count path transitions (from -> to)
        if (nav.fromPath) {
          const transition = `${nav.fromPath}|${nav.path}`;
          fromToMap[transition] = (fromToMap[transition] || 0) + 1;
        }
      }
      
      // Convert to pattern objects
      for (const transition in fromToMap) {
        const [fromPath, toPath] = transition.split('|');
        const frequency = fromToMap[transition];
        
        // Calculate average time on page if available
        const relevantNavs = navigations.filter(nav => 
          nav.fromPath === fromPath && nav.path === toPath && nav.timeOnPage !== null
        );
        
        let avgTimeOnPage = 0;
        if (relevantNavs.length > 0) {
          const sum = relevantNavs.reduce((acc, nav) => acc + (nav.timeOnPage || 0), 0);
          avgTimeOnPage = sum / relevantNavs.length;
        }
        
        patterns.push({
          fromPath,
          toPath,
          frequency,
          avgTimeOnPage
        });
      }
      
      // Sort patterns by frequency (descending)
      patterns.sort((a, b) => b.frequency - a.frequency);
      
      res.json({
        patterns,
        pathFrequency
      });
    } catch (error) {
      console.error("Error fetching navigation patterns:", error);
      res.status(500).json({ 
        message: "Failed to fetch navigation patterns",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  apiRouter.get("/navigation/recommendations/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      const { currentPath } = req.query;
      
      if (!userId || !currentPath) {
        return res.status(400).json({ 
          message: "User ID and current path are required" 
        });
      }
      
      // Get all navigation events from this path
      const navigations = await storage.getNavigationEventsByPathAndUser(
        currentPath as string, 
        userId
      );
      
      // Calculate next path recommendations
      const nextPathCount: Record<string, number> = {};
      const elementsClickedCount: Record<string, number> = {};
      
      for (const nav of navigations) {
        // Only consider entries where this was the "from" path
        if (nav.fromPath === currentPath) {
          nextPathCount[nav.path] = (nextPathCount[nav.path] || 0) + 1;
        }
        
        // Count clicked elements
        if (nav.clickedElements) {
          try {
            const elements = JSON.parse(nav.clickedElements) as string[];
            elements.forEach((element: string) => {
              elementsClickedCount[element] = (elementsClickedCount[element] || 0) + 1;
            });
          } catch (e) {
            console.error("Error parsing clicked elements:", e);
          }
        }
      }
      
      // Convert to sorted arrays
      const recommendedPaths = Object.entries(nextPathCount)
        .map(([path, count]) => ({
          path,
          displayName: getDisplayNameForPath(path),
          confidence: count / navigations.length
        }))
        .sort((a, b) => b.confidence - a.confidence);
      
      const frequentElements = Object.entries(elementsClickedCount)
        .map(([element, count]) => ({
          element,
          displayName: getDisplayNameForElement(element),
          frequency: count
        }))
        .sort((a, b) => b.frequency - a.frequency);
      
      res.json({
        currentPath,
        recommendedPaths: recommendedPaths.slice(0, 5),
        frequentElements: frequentElements.slice(0, 5)
      });
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ 
        message: "Failed to generate recommendations",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // User preferences endpoints
  apiRouter.get("/user/preferences/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const preferences = await storage.getUserPreferences(userId);
      
      if (!preferences) {
        return res.status(404).json({ message: "User preferences not found" });
      }
      
      res.json(preferences);
    } catch (error) {
      console.error("Error fetching user preferences:", error);
      res.status(500).json({ 
        message: "Failed to fetch user preferences",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  apiRouter.post("/user/preferences", async (req, res) => {
    try {
      const preferencesData = insertUserPreferencesSchema.parse(req.body);
      const preferences = await storage.createUserPreferences(preferencesData);
      
      res.status(201).json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid preferences data", errors: error.errors });
      }
      console.error("Error creating user preferences:", error);
      res.status(500).json({ 
        message: "Failed to create user preferences",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  apiRouter.put("/user/preferences/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const preferencesData = insertUserPreferencesSchema.partial().parse(req.body);
      const preferences = await storage.updateUserPreferences(userId, preferencesData);
      
      if (!preferences) {
        return res.status(404).json({ message: "User preferences not found" });
      }
      
      res.json(preferences);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid preferences data", errors: error.errors });
      }
      console.error("Error updating user preferences:", error);
      res.status(500).json({ 
        message: "Failed to update user preferences",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Auto response endpoints
  apiRouter.get("/auto-responses", async (req, res) => {
    // Default to demo user if no userId is provided
    const userId = req.query.userId as string || "demo";
    const type = req.query.type as string;
    
    try {
      let responses;
      if (type) {
        responses = await storage.getAutoResponsesByType(userId, type);
      } else {
        responses = await storage.getAutoResponses(userId);
      }
      res.json(responses);
    } catch (error) {
      console.error("Error getting auto responses:", error);
      res.status(500).json({ message: "Failed to get auto responses" });
    }
  });

  apiRouter.get("/auto-responses/default/:type", async (req, res) => {
    const userId = req.query.userId as string || "demo";
    const type = req.params.type;
    
    try {
      const response = await storage.getDefaultAutoResponse(userId, type);
      if (!response) {
        return res.status(404).json({ message: "Default auto response not found" });
      }
      res.json(response);
    } catch (error) {
      console.error("Error getting default auto response:", error);
      res.status(500).json({ message: "Failed to get default auto response" });
    }
  });

  apiRouter.get("/auto-responses/:id([0-9]+)", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid auto response ID" });
    }
    
    try {
      const response = await storage.getAutoResponse(id);
      if (!response) {
        return res.status(404).json({ message: "Auto response not found" });
      }
      res.json(response);
    } catch (error) {
      console.error("Error getting auto response:", error);
      res.status(500).json({ message: "Failed to get auto response" });
    }
  });

  apiRouter.post("/auto-responses", async (req, res) => {
    try {
      const responseData = insertAutoResponseSchema.parse(req.body);
      const response = await storage.createAutoResponse(responseData);
      res.status(201).json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid auto response data", errors: error.errors });
      }
      console.error("Error creating auto response:", error);
      res.status(500).json({ message: "Failed to create auto response" });
    }
  });

  apiRouter.patch("/auto-responses/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid auto response ID" });
    }
    
    try {
      const responseData = insertAutoResponseSchema.partial().parse(req.body);
      const response = await storage.updateAutoResponse(id, responseData);
      if (!response) {
        return res.status(404).json({ message: "Auto response not found" });
      }
      res.json(response);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid auto response data", errors: error.errors });
      }
      console.error("Error updating auto response:", error);
      res.status(500).json({ message: "Failed to update auto response" });
    }
  });

  apiRouter.delete("/auto-responses/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid auto response ID" });
    }
    
    try {
      const deleted = await storage.deleteAutoResponse(id);
      if (!deleted) {
        return res.status(404).json({ message: "Auto response not found" });
      }
      res.status(204).end();
    } catch (error) {
      console.error("Error deleting auto response:", error);
      res.status(500).json({ message: "Failed to delete auto response" });
    }
  });

  // Email and Phone Verification endpoints
  apiRouter.post("/verify/send-email", async (req, res) => {
    try {
      const { userId, email } = req.body;
      
      if (!userId || !email) {
        return res.status(400).json({ message: "User ID and email are required" });
      }
      
      // Generate verification token
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
      
      // Update user with verification token
      const user = await storage.getUserByUsername(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // TODO: Send actual email here using SendGrid or similar service
      // For now, we'll just log the token for testing
      console.log(`Email verification token for ${email}: ${token}`);
      
      // Store verification token in database
      await storage.updateUser(user.id, {
        emailVerificationToken: token,
        emailVerificationExpiry: expiry
      });
      
      res.json({ 
        message: "Verification email sent successfully",
        // In development, return the token for testing
        ...(process.env.NODE_ENV === 'development' && { token })
      });
    } catch (error) {
      console.error("Error sending verification email:", error);
      res.status(500).json({ message: "Failed to send verification email" });
    }
  });
  
  apiRouter.post("/verify/email", async (req, res) => {
    try {
      const { userId, token } = req.body;
      
      if (!userId || !token) {
        return res.status(400).json({ message: "User ID and token are required" });
      }
      
      const user = await storage.getUserByUsername(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if token matches and hasn't expired
      if (user.emailVerificationToken !== token) {
        return res.status(400).json({ message: "Invalid verification token" });
      }
      
      if (!user.emailVerificationExpiry || new Date() > user.emailVerificationExpiry) {
        return res.status(400).json({ message: "Verification token has expired" });
      }
      
      // Update user as verified
      await storage.updateUser(user.id, {
        emailVerified: true,
        emailVerificationToken: null,
        emailVerificationExpiry: null
      });
      
      res.json({ message: "Email verified successfully" });
    } catch (error) {
      console.error("Error verifying email:", error);
      res.status(500).json({ message: "Failed to verify email" });
    }
  });
  
  apiRouter.post("/verify/send-sms", async (req, res) => {
    try {
      const { userId, phone } = req.body;
      
      if (!userId || !phone) {
        return res.status(400).json({ message: "User ID and phone number are required" });
      }
      
      // Generate 6-digit verification code
      const token = Math.floor(100000 + Math.random() * 900000).toString();
      const expiry = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
      
      // Update user with verification token
      const user = await storage.getUserByUsername(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // TODO: Send actual SMS here using Twilio or similar service
      // For now, we'll just log the token for testing
      console.log(`SMS verification code for ${phone}: ${token}`);
      
      // Store verification token in database
      await storage.updateUser(user.id, {
        phoneVerificationToken: token,
        phoneVerificationExpiry: expiry
      });
      
      res.json({ 
        message: "Verification SMS sent successfully",
        // In development, return the token for testing
        ...(process.env.NODE_ENV === 'development' && { token })
      });
    } catch (error) {
      console.error("Error sending verification SMS:", error);
      res.status(500).json({ message: "Failed to send verification SMS" });
    }
  });
  
  apiRouter.post("/verify/phone", async (req, res) => {
    try {
      const { userId, token } = req.body;
      
      if (!userId || !token) {
        return res.status(400).json({ message: "User ID and token are required" });
      }
      
      const user = await storage.getUserByUsername(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      
      // Check if token matches and hasn't expired
      if (user.phoneVerificationToken !== token) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      
      if (!user.phoneVerificationExpiry || new Date() > user.phoneVerificationExpiry) {
        return res.status(400).json({ message: "Verification code has expired" });
      }
      
      // Update user as verified
      await storage.updateUser(user.id, {
        phoneVerified: true,
        phoneVerificationToken: null,
        phoneVerificationExpiry: null
      });
      
      res.json({ message: "Phone number verified successfully" });
    } catch (error) {
      console.error("Error verifying phone:", error);
      res.status(500).json({ message: "Failed to verify phone number" });
    }
  });

  // Booking endpoints
  // Booking endpoints removed - handled by dedicated bookings router at /api/bookings

  app.use("/api", apiRouter);
  
  // Register public profile routes
  registerPublicProfileRoutes(app);
  
  // Register API routes
  app.use("/api/ai", aiRoutes);
  app.use("/api/bookings", bookingsRoutes);
  
  const httpServer = createServer(app);
  return httpServer;
}
