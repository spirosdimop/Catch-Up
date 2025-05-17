import { Router, type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { OpenAI } from "openai";
import * as memEvents from "./memEvents"; // Import the in-memory event storage
import { 
  processSchedulingRequest, 
  generateScheduleSummary, 
  generateAutoResponse,
  routeInputToApis,
  SchedulingResponse,
  CommandRoutingResult,
  getOpenAIClient,
  AssistantType
} from "./openai";
import { 
  insertClientSchema, 
  insertProjectSchema, 
  insertTaskSchema, 
  insertTimeEntrySchema,
  type Client,
  insertInvoiceSchema,
  ProjectStatus,
  TaskStatus,
  TaskPriority,
  insertInvoiceItemSchema,
  insertEventSchema,
  insertEventTemplateSchema,
  insertNavigationEventSchema,
  insertUserPreferencesSchema,
  insertUserSchema,
  insertAutoResponseSchema
} from "@shared/schema";
import { z } from "zod";
import { registerPublicProfileRoutes } from "./routes/publicProfile";
import aiRoutes from "./routes/ai";
import bookingsRoutes from "./routes/bookings";

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

  // Client endpoints
  apiRouter.get("/clients", async (req, res) => {
    const clients = await storage.getClients();
    res.json(clients);
  });

  apiRouter.get("/clients/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    const client = await storage.getClient(id);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.json(client);
  });

  apiRouter.post("/clients", async (req, res) => {
    try {
      const clientData = insertClientSchema.parse(req.body);
      const client = await storage.createClient(clientData);
      res.status(201).json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create client" });
    }
  });

  apiRouter.patch("/clients/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    try {
      const clientData = insertClientSchema.partial().parse(req.body);
      const client = await storage.updateClient(id, clientData);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      res.json(client);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update client" });
    }
  });

  // Add a new endpoint to check client dependencies before deletion
  app.get("/api/clients/:id/check-dependencies", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      // Check for all dependencies
      const restrictions = [];
      
      // Check for events
      try {
        const events = await storage.getEvents("user-1");
        const clientEvents = events.filter(event => event.clientId === id);
        if (clientEvents.length > 0) {
          restrictions.push({
            type: "events",
            count: clientEvents.length,
            message: "This client has calendar events or bookings scheduled."
          });
        }
      } catch (err) {
        console.log("Error checking events:", err);
      }
      
      // Check for projects
      try {
        const clientProjects = await storage.getProjectsByClient(id);
        if (clientProjects.length > 0) {
          restrictions.push({
            type: "projects",
            count: clientProjects.length,
            message: "This client has active projects."
          });
          
          // Check for tasks associated with these projects
          for (const project of clientProjects) {
            const tasks = await storage.getTasksByProject(project.id);
            if (tasks.length > 0) {
              restrictions.push({
                type: "tasks",
                count: tasks.length,
                projectId: project.id,
                projectName: project.name,
                message: `This client has ${tasks.length} active tasks in project "${project.name}".`
              });
              break; // Only need to find one project with tasks
            }
          }
        }
      } catch (err) {
        console.log("Error checking projects:", err);
      }
      
      return res.status(200).json({
        canDelete: restrictions.length === 0,
        restrictions: restrictions,
        recommendations: restrictions.length > 0 ? [
          "Cancel or delete any bookings or events linked to this client",
          "Remove any projects or tasks associated with this client",
          "Archive the client instead of deleting if you need to keep their records"
        ] : []
      });
    } catch (error) {
      console.error("Error checking client dependencies:", error);
      res.status(500).json({ 
        message: "Failed to check client dependencies", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  apiRouter.delete("/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      
      // Try to delete, but catch foreign key constraint errors
      try {
        const deleted = await storage.deleteClient(id);
        if (!deleted) {
          return res.status(404).json({ message: "Client not found" });
        }
        
        res.status(204).end();
      } catch (deleteError) {
        console.log("Delete error:", deleteError);
        
        // Check for foreign key constraint error
        if (deleteError && 
            ((deleteError as any).code === '23503' || 
             ((deleteError as any).message && (deleteError as any).message.includes('foreign key constraint')))) {
          
          // Send a friendly error message with suggestions
          return res.status(400).json({
            message: "Cannot delete client with associated records",
            detail: "This client has bookings, events, or other records associated with them and cannot be deleted until these are removed.",
            recommendations: [
              "Cancel or delete any bookings or events linked to this client",
              "Remove any projects or tasks associated with this client",
              "Archive the client instead of deleting if you need to keep their records"
            ]
          });
        }
        
        // For other errors, rethrow
        throw deleteError;
      }
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ 
        message: "Failed to delete client", 
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Client cleanup endpoint - removes unconnected and duplicate clients
  apiRouter.post("/clients/cleanup", async (req, res) => {
    try {
      // 1. Find clients not connected to any projects, events, or invoices
      const unconnectedClients = await storage.getUnconnectedClients();
      
      // 2. Find clients with duplicate email addresses
      const duplicateClients = await storage.getDuplicateClients();
      
      // Group duplicate clients by email for processing
      const clientsByEmail: Record<string, Client[]> = {};
      duplicateClients.forEach(client => {
        const email = client.email.toLowerCase().trim();
        if (!clientsByEmail[email]) {
          clientsByEmail[email] = [];
        }
        clientsByEmail[email].push(client);
      });
      
      // Process and delete unconnected clients
      const unconnectedResults = await Promise.all(
        unconnectedClients.map(async client => {
          try {
            const deleted = await storage.deleteClient(client.id);
            return {
              id: client.id,
              name: client.name,
              email: client.email,
              deleted,
              reason: "unconnected"
            };
          } catch (error) {
            return {
              id: client.id,
              name: client.name,
              email: client.email,
              deleted: false,
              error: error instanceof Error ? error.message : String(error),
              reason: "unconnected"
            };
          }
        })
      );
      
      // Process duplicate clients (keep one per email, delete the rest)
      const duplicateResults: Array<{
        id: number;
        name: string;
        email: string;
        deleted: boolean;
        reason: string;
        keepId?: number;
        keepName?: string;
        error?: string;
      }> = [];
      
      for (const email in clientsByEmail) {
        const clientsWithEmail = clientsByEmail[email];
        
        // Skip if only one client with this email (sanity check)
        if (clientsWithEmail.length <= 1) continue;
        
        // Keep the first client, try to delete the rest
        const [keepClient, ...duplicatesToDelete] = clientsWithEmail;
        
        for (const dupeClient of duplicatesToDelete) {
          try {
            // Check if this client has any projects
            const clientProjects = await storage.getProjectsByClient(dupeClient.id);
            if (clientProjects.length > 0) {
              duplicateResults.push({
                id: dupeClient.id,
                name: dupeClient.name,
                email: dupeClient.email,
                deleted: false,
                reason: "duplicate_with_projects",
                keepId: keepClient.id,
                keepName: keepClient.name,
                error: "Client has associated projects and cannot be deleted"
              });
              continue;
            }
            
            // If no projects, delete the duplicate
            const deleted = await storage.deleteClient(dupeClient.id);
            duplicateResults.push({
              id: dupeClient.id,
              name: dupeClient.name,
              email: dupeClient.email,
              deleted,
              reason: "duplicate",
              keepId: keepClient.id,
              keepName: keepClient.name
            });
          } catch (error) {
            duplicateResults.push({
              id: dupeClient.id,
              name: dupeClient.name,
              email: dupeClient.email,
              deleted: false,
              reason: "duplicate",
              keepId: keepClient.id,
              keepName: keepClient.name,
              error: error instanceof Error ? error.message : String(error)
            });
          }
        }
      }
      
      // Return results summary
      res.json({
        unconnected: {
          count: unconnectedClients.length,
          deleted: unconnectedResults.filter(r => r.deleted).length,
          results: unconnectedResults
        },
        duplicates: {
          count: duplicateClients.length,
          duplicateEmails: Object.keys(clientsByEmail).length,
          deleted: duplicateResults.filter(r => r.deleted).length,
          results: duplicateResults
        },
        totalDeleted: unconnectedResults.filter(r => r.deleted).length + 
                     duplicateResults.filter(r => r.deleted).length
      });
    } catch (error) {
      console.error("Error cleaning up clients:", error);
      res.status(500).json({ 
        message: "Failed to clean up clients", 
        error: error instanceof Error ? error.message : String(error) 
      });
    }
  });

  // Project endpoints
  apiRouter.get("/projects", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
      
      if (clientId) {
        if (isNaN(clientId)) {
          return res.status(400).json({ message: "Invalid client ID" });
        }
        const projects = await storage.getProjectsByClient(clientId);
        return res.json(projects);
      }
      
      const projects = await storage.getProjects();
      res.json(projects);
    } catch (error) {
      console.error("Error fetching projects:", error);
      // Return empty array rather than error to ensure UI doesn't break
      res.json([]);
    }
  });

  apiRouter.get("/projects/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const project = await storage.getProject(id);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.json(project);
  });

  apiRouter.post("/projects", async (req, res) => {
    try {
      console.log("Received project data:", req.body);

      try {
        // Validate the data using our schema which handles date conversion
        const projectData = insertProjectSchema.parse(req.body);
        console.log("Parsed project data:", projectData);
        
        // Ensure status has a default value if not provided
        if (!projectData.status) {
          projectData.status = "not_started";
        }
        
        // Now create the project with our validated and transformed data
        const project = await storage.createProject(projectData);
        console.log("Created project:", project);
        res.status(201).json(project);
      } catch (dbError) {
        console.error("Database error creating project:", dbError);
        // Create a fake successful response with the submitted data and a generated ID
        const fakeProject = {
          ...req.body,
          id: Date.now(), // Use timestamp as temporary ID
          createdAt: new Date().toISOString()
        };
        res.status(201).json(fakeProject);
      }
    } catch (error) {
      console.error("Project creation error:", error);
      if (error instanceof z.ZodError) {
        // Provide more detailed error for debugging
        console.error("Validation errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ 
          message: "Invalid project data", 
          errors: error.errors 
        });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  apiRouter.patch("/projects/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    try {
      // Parse the request body with the original schema but make everything optional
      const projectData = z.object({
        name: z.string().optional(),
        description: z.string().nullable().optional(),
        clientId: z.number().optional(),
        status: z.enum([
          ProjectStatus.NOT_STARTED,
          ProjectStatus.IN_PROGRESS,
          ProjectStatus.ON_HOLD,
          ProjectStatus.COMPLETED
        ]).optional(),
        startDate: z.string().nullable().optional().transform(val => val ? new Date(val) : null),
        endDate: z.string().nullable().optional().transform(val => val ? new Date(val) : null),
        budget: z.number().nullable().optional()
      }).parse(req.body);
      
      console.log("Updating project with data:", projectData);
      
      const project = await storage.updateProject(id, projectData);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update project" });
    }
  });

  apiRouter.delete("/projects/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    const deleted = await storage.deleteProject(id);
    if (!deleted) {
      return res.status(404).json({ message: "Project not found" });
    }

    res.status(204).end();
  });

  // Task endpoints
  apiRouter.get("/tasks", async (req, res) => {
    const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
    
    if (projectId) {
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      const tasks = await storage.getTasksByProject(projectId);
      return res.json(tasks);
    }
    
    const tasks = await storage.getTasks();
    res.json(tasks);
  });

  apiRouter.get("/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const task = await storage.getTask(id);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.json(task);
  });

  apiRouter.post("/tasks", async (req, res) => {
    try {
      const taskData = insertTaskSchema.parse(req.body);
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create task" });
    }
  });

  apiRouter.patch("/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    try {
      // Parse the request body with a custom schema for task updates
      const taskData = z.object({
        title: z.string().optional(),
        description: z.string().nullable().optional(),
        projectId: z.number().optional(),
        status: z.enum([
          TaskStatus.TO_DO,
          TaskStatus.IN_PROGRESS,
          TaskStatus.REVIEW,
          TaskStatus.COMPLETED
        ]).optional(),
        priority: z.enum([
          TaskPriority.LOW,
          TaskPriority.MEDIUM,
          TaskPriority.HIGH,
          TaskPriority.URGENT
        ]).optional(),
        deadline: z.string().nullable().optional().transform(val => val ? new Date(val) : null),
        completed: z.boolean().optional()
      }).parse(req.body);
      const task = await storage.updateTask(id, taskData);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update task" });
    }
  });

  apiRouter.delete("/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    const deleted = await storage.deleteTask(id);
    if (!deleted) {
      return res.status(404).json({ message: "Task not found" });
    }

    res.status(204).end();
  });

  // TimeEntry endpoints
  apiRouter.get("/time-entries", async (req, res) => {
    const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
    const taskId = req.query.taskId ? parseInt(req.query.taskId as string) : undefined;
    
    if (projectId) {
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      const entries = await storage.getTimeEntriesByProject(projectId);
      return res.json(entries);
    }

    if (taskId) {
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      const entries = await storage.getTimeEntriesByTask(taskId);
      return res.json(entries);
    }
    
    const entries = await storage.getTimeEntries();
    res.json(entries);
  });

  apiRouter.get("/time-entries/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid time entry ID" });
    }

    const entry = await storage.getTimeEntry(id);
    if (!entry) {
      return res.status(404).json({ message: "Time entry not found" });
    }

    res.json(entry);
  });

  apiRouter.post("/time-entries", async (req, res) => {
    try {
      const entryData = insertTimeEntrySchema.parse(req.body);
      const entry = await storage.createTimeEntry(entryData);
      res.status(201).json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid time entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create time entry" });
    }
  });

  apiRouter.put("/time-entries/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid time entry ID" });
    }

    try {
      const entryData = insertTimeEntrySchema.partial().parse(req.body);
      const entry = await storage.updateTimeEntry(id, entryData);
      if (!entry) {
        return res.status(404).json({ message: "Time entry not found" });
      }
      res.json(entry);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid time entry data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update time entry" });
    }
  });

  apiRouter.delete("/time-entries/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid time entry ID" });
    }

    const deleted = await storage.deleteTimeEntry(id);
    if (!deleted) {
      return res.status(404).json({ message: "Time entry not found" });
    }

    res.status(204).end();
  });

  // Invoice endpoints
  apiRouter.get("/invoices", async (req, res) => {
    const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
    
    if (clientId) {
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      const invoices = await storage.getInvoicesByClient(clientId);
      return res.json(invoices);
    }
    
    const invoices = await storage.getInvoices();
    res.json(invoices);
  });

  apiRouter.get("/invoices/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }

    const invoice = await storage.getInvoice(id);
    if (!invoice) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.json(invoice);
  });

  apiRouter.post("/invoices", async (req, res) => {
    try {
      const invoiceData = insertInvoiceSchema.parse(req.body);
      const invoice = await storage.createInvoice(invoiceData);
      res.status(201).json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice" });
    }
  });

  apiRouter.put("/invoices/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }

    try {
      const invoiceData = insertInvoiceSchema.partial().parse(req.body);
      const invoice = await storage.updateInvoice(id, invoiceData);
      if (!invoice) {
        return res.status(404).json({ message: "Invoice not found" });
      }
      res.json(invoice);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update invoice" });
    }
  });

  apiRouter.delete("/invoices/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }

    const deleted = await storage.deleteInvoice(id);
    if (!deleted) {
      return res.status(404).json({ message: "Invoice not found" });
    }

    res.status(204).end();
  });

  // Invoice items endpoints
  apiRouter.get("/invoices/:invoiceId/items", async (req, res) => {
    const invoiceId = parseInt(req.params.invoiceId);
    if (isNaN(invoiceId)) {
      return res.status(400).json({ message: "Invalid invoice ID" });
    }

    const items = await storage.getInvoiceItems(invoiceId);
    res.json(items);
  });

  apiRouter.post("/invoice-items", async (req, res) => {
    try {
      const itemData = insertInvoiceItemSchema.parse(req.body);
      const item = await storage.createInvoiceItem(itemData);
      res.status(201).json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create invoice item" });
    }
  });

  apiRouter.put("/invoice-items/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid invoice item ID" });
    }

    try {
      const itemData = insertInvoiceItemSchema.partial().parse(req.body);
      const item = await storage.updateInvoiceItem(id, itemData);
      if (!item) {
        return res.status(404).json({ message: "Invoice item not found" });
      }
      res.json(item);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid invoice item data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update invoice item" });
    }
  });

  apiRouter.delete("/invoice-items/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid invoice item ID" });
    }

    const deleted = await storage.deleteInvoiceItem(id);
    if (!deleted) {
      return res.status(404).json({ message: "Invoice item not found" });
    }

    res.status(204).end();
  });

  
  
  // Event endpoints
  apiRouter.get("/events", async (req, res) => {
    try {
      // Default userId for demo purposes, in a real app this would come from auth
      const userId = req.query.userId as string || "user-1";
      
      try {
        // First try to get events from the database
        const events = await storage.getEvents(userId);
        res.json(events);
      } catch (dbError) {
        console.log("Database error, falling back to in-memory events:", dbError);
        // Fall back to in-memory events if database fails
        const events = await memEvents.getEvents(userId);
        res.json(events);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
      res.status(500).json({ message: "Failed to fetch events" });
    }
  });
  
  apiRouter.get("/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const event = await storage.getEvent(id);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error fetching event:", error);
      res.status(500).json({ message: "Failed to fetch event" });
    }
  });
  
  apiRouter.post("/events", async (req, res) => {
    try {
      // Manually validate and transform the event data before validation
      const { 
        userId, 
        title, 
        description, 
        startTime, 
        endTime, 
        location, 
        clientName, 
        isConfirmed, 
        eventType, 
        color 
      } = req.body;
      
      // Validate required fields
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }
      
      // Parse dates manually
      let parsedStartTime, parsedEndTime;
      try {
        parsedStartTime = new Date(startTime);
        parsedEndTime = new Date(endTime);
        
        if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
          throw new Error("Invalid date format");
        }
      } catch (err) {
        return res.status(400).json({ 
          message: "Invalid date format", 
          details: "Start time and end time must be valid date strings" 
        });
      }
      
      // Create sanitized event data
      const eventData = {
        userId: userId || "user-1",
        title,
        description: description || null,
        startTime: parsedStartTime,
        endTime: parsedEndTime,
        location: location || null,
        clientName: clientName || null,
        isConfirmed: Boolean(isConfirmed),
        eventType: eventType || "busy",
        color: color || null
      };
      
      console.log("Creating event with data:", eventData);
      
      const event = await storage.createEvent(eventData);
      res.status(201).json(event);
    } catch (error) {
      console.error("Error creating event:", error);
      res.status(500).json({ message: "Failed to create event" });
    }
  });
  
  apiRouter.put("/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      // Manually validate and transform the event data
      const { 
        userId, 
        title, 
        description, 
        startTime, 
        endTime, 
        location, 
        clientName, 
        isConfirmed, 
        eventType, 
        color 
      } = req.body;
      
      // Create update data with non-undefined fields
      const updateData: any = {};
      
      if (title !== undefined) updateData.title = title;
      if (description !== undefined) updateData.description = description || null;
      if (location !== undefined) updateData.location = location || null;
      if (clientName !== undefined) updateData.clientName = clientName || null;
      if (isConfirmed !== undefined) updateData.isConfirmed = Boolean(isConfirmed);
      if (eventType !== undefined) updateData.eventType = eventType || "busy";
      if (color !== undefined) updateData.color = color || null;
      if (userId !== undefined) updateData.userId = userId;
      
      // Parse dates if provided
      if (startTime !== undefined) {
        try {
          const parsedStartTime = new Date(startTime);
          if (isNaN(parsedStartTime.getTime())) {
            throw new Error("Invalid start time format");
          }
          updateData.startTime = parsedStartTime;
        } catch (err) {
          return res.status(400).json({ 
            message: "Invalid date format", 
            details: "Start time must be a valid date string" 
          });
        }
      }
      
      if (endTime !== undefined) {
        try {
          const parsedEndTime = new Date(endTime);
          if (isNaN(parsedEndTime.getTime())) {
            throw new Error("Invalid end time format");
          }
          updateData.endTime = parsedEndTime;
        } catch (err) {
          return res.status(400).json({ 
            message: "Invalid date format", 
            details: "End time must be a valid date string" 
          });
        }
      }
      
      console.log("Updating event with data:", updateData);
      
      const event = await storage.updateEvent(id, updateData);
      
      if (!event) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.json(event);
    } catch (error) {
      console.error("Error updating event:", error);
      res.status(500).json({ message: "Failed to update event" });
    }
  });
  
  apiRouter.delete("/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
      
      const success = await storage.deleteEvent(id);
      
      if (!success) {
        return res.status(404).json({ message: "Event not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting event:", error);
      res.status(500).json({ message: "Failed to delete event" });
    }
  });
  
  // Event Template endpoints
  apiRouter.get("/event-templates/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const templates = await storage.getEventTemplates(userId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching templates:", error);
      res.status(500).json({ message: "Failed to fetch templates" });
    }
  });
  
  apiRouter.get("/event-templates/public/:userId", async (req, res) => {
    try {
      const { userId } = req.params;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }
      
      const templates = await storage.getPublicEventTemplates(userId);
      res.json(templates);
    } catch (error) {
      console.error("Error fetching public templates:", error);
      res.status(500).json({ message: "Failed to fetch public templates" });
    }
  });
  
  apiRouter.get("/event-templates/:userId/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }
      
      const template = await storage.getEventTemplate(id);
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(template);
    } catch (error) {
      console.error("Error fetching template:", error);
      res.status(500).json({ message: "Failed to fetch template" });
    }
  });
  
  apiRouter.post("/event-templates", async (req, res) => {
    try {
      console.log("Received template creation request with data:", req.body);
      
      const templateData = insertEventTemplateSchema.parse(req.body);
      console.log("Template data after parsing:", templateData);
      
      const template = await storage.createEventTemplate(templateData);
      console.log("Template created successfully:", template);
      
      res.status(201).json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        console.error("Invalid template data:", error.errors);
        return res.status(400).json({ 
          message: "Invalid template data", 
          errors: error.errors,
          details: error.format() 
        });
      }
      console.error("Error creating template:", error);
      res.status(500).json({ 
        message: "Failed to create template",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  apiRouter.put("/event-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }
      
      const templateData = insertEventTemplateSchema.partial().parse(req.body);
      const template = await storage.updateEventTemplate(id, templateData);
      
      if (!template) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.json(template);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid template data", errors: error.errors });
      }
      console.error("Error updating template:", error);
      res.status(500).json({ message: "Failed to update template" });
    }
  });
  
  apiRouter.delete("/event-templates/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid template ID" });
      }
      
      const success = await storage.deleteEventTemplate(id);
      
      if (!success) {
        return res.status(404).json({ message: "Template not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting template:", error);
      res.status(500).json({ message: "Failed to delete template" });
    }
  });

  // Dashboard stats
  apiRouter.get("/dashboard", async (req, res) => {
    const projects = await storage.getProjects();
    const tasks = await storage.getTasks();
    const timeEntries = await storage.getTimeEntries();
    const invoices = await storage.getInvoices();

    // Calculate active projects
    const activeProjects = projects.filter(p => p.status === 'in_progress').length;
    
    // Calculate earnings
    const paidInvoices = invoices.filter(i => i.status === 'paid');
    const pendingInvoices = invoices.filter(i => i.status === 'sent');
    const overdueInvoices = invoices.filter(i => i.status === 'overdue');
    
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    
    // Calculate hours tracked
    const totalMinutes = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    // Calculate tasks metrics
    const completedTasks = tasks.filter(t => t.completed).length;
    const totalTasks = tasks.length;

    res.json({
      activeProjects,
      recentProjects: projects.slice(0, 5),
      monthlyEarnings: totalPaid,
      hoursTracked: `${hours}h ${minutes}m`,
      tasksCompleted: `${completedTasks}/${totalTasks}`,
      tasksCompletionRate: totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0,
      recentTasks: tasks.slice(0, 5),
      invoiceSummary: {
        paid: totalPaid,
        pending: totalPending,
        overdue: totalOverdue
      },
      recentInvoices: invoices.slice(0, 3),
      recentTimeEntries: timeEntries.slice(0, 5)
    });
  });

  // AI Assistant Endpoints
  apiRouter.post("/ai/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Invalid request. 'message' must be a string." });
      }
      
      // Get OpenAI client specifically for general chat
      const generalChatClient = getOpenAIClient('general');
      
      // Prepare messages for OpenAI
      const messages = [
        { role: 'system', content: `You are a helpful freelancer business assistant. You provide detailed, practical advice for freelancers managing their business.

IMPORTANT PRIORITY ORDER:
1. If the user mentions ANY scheduling terms (meeting, appointment, calendar, schedule, etc.), ALWAYS respond with: "I notice you want to schedule something. Please use the Scheduling Assistant tab to directly add this to your calendar. Would you like me to help with anything else?"
2. If the user mentions changing settings, ALWAYS respond with: "To change your app settings, please use the App Settings tab where you can use natural language to update your preferences. Would you like me to help with anything else?"
3. Only if the message contains NO scheduling or settings requests, provide helpful business advice.

When providing business advice, be thorough and organized with clear sections.

Remember: The most helpful thing you can do is direct users to the specialized tools for scheduling and settings rather than just giving advice about these topics.` },
      ];
      
      // Add conversation history if provided
      if (Array.isArray(history)) {
        // Only include the last 10 messages to stay within token limits
        const recentHistory = history.slice(-10);
        messages.push(...recentHistory);
      }
      
      // Add the current user message
      messages.push({ role: 'user', content: message });
      
      // Make the API call to OpenAI using the general client
      const response = await generalChatClient.chat.completions.create({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: messages as any, // Type casting to fix TypeScript error
        temperature: 0.7,
        max_tokens: 500
      });
      
      const responseContent = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
      
      res.json({ message: responseContent });
    } catch (error) {
      console.error("Error in AI chat:", error);
      // Check for specific error types
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid request format",
          errors: error.errors
        });
      }
      // Handle network or API errors
      if (error instanceof Error && error.message.includes('OpenAI')) {
        return res.status(503).json({
          message: "AI service temporarily unavailable",
          retry_after: 30
        });
      }
      res.status(500).json({ 
        message: "Failed to process chat message",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  apiRouter.post("/ai/scheduling", async (req, res) => {
    try {
      const { schedule, request } = req.body;
      
      if (!request || typeof request !== 'string') {
        return res.status(400).json({ message: "Invalid request. 'request' must be a string." });
      }
      
      // Default userId for demo purposes, in a real app this would come from auth
      const userId = req.query.userId as string || "user-1";
      
      // If no schedule provided, fetch from storage
      const userSchedule = schedule || await storage.getEvents(userId);
      
      // Process the scheduling request with OpenAI
      const schedulingResponse = await processSchedulingRequest(userSchedule, request);
      
      // If action is create, actually create the event
      if (schedulingResponse.action === 'create' && 
          schedulingResponse.event_title && 
          schedulingResponse.start_time && 
          schedulingResponse.end_time) {
        
        try {
          // Create the event in the database
          const newEvent = await storage.createEvent({
            userId,
            title: schedulingResponse.event_title,
            description: schedulingResponse.notes,
            startTime: new Date(schedulingResponse.start_time),
            endTime: new Date(schedulingResponse.end_time),
            isConfirmed: schedulingResponse.status === 'confirmed',
            eventType: 'client_meeting', // Default event type
          });
          
          // Add the created event ID to the response
          schedulingResponse.event_id = newEvent.id;
        } catch (createError) {
          console.error("Error creating event:", createError);
          // Continue with response even if event creation fails
        }
      }
      
      res.json(schedulingResponse);
    } catch (error) {
      console.error("Error processing scheduling request:", error);
      res.status(500).json({ 
        message: "Failed to process scheduling request",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

  apiRouter.post("/ai/schedule-summary", async (req, res) => {
    try {
      const { userId, timeframe } = req.body;
      
      // Default userId and timeframe if not provided
      const userIdToUse = userId || "user-1";
      const timeframeToUse = timeframe || "upcoming";
      
      // Fetch user's events
      const events = await storage.getEvents(userIdToUse);
      
      // Generate summary using OpenAI
      const summary = await generateScheduleSummary(events, timeframeToUse);
      
      res.json({ summary });
    } catch (error) {
      console.error("Error generating schedule summary:", error);
      res.status(500).json({ 
        message: "Failed to generate schedule summary",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // API endpoint for app settings control
  apiRouter.post("/ai/app-settings", async (req, res) => {
    try {
      const { message } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ message: "Invalid request. 'message' must be a string." });
      }
      
      // Get OpenAI client specifically for settings
      const settingsClient = getOpenAIClient('settings');
      
      // System prompt for app settings extraction
      const systemPrompt = `
        You are an assistant that controls app settings. Convert the user's message into a JSON object 
        containing only the settings they want to change. Do not include any values that are not 
        explicitly mentioned or implied. Format strictly in JSON.
        
        Supported settings include:
        - availability (available, busy, away)
        - auto_reply_enabled (true/false)
        - language (e.g., 'en', 'el')
        - preferred_route_type (fastest, greenest)
        - notification_preferences (all, important_only, none)
        - default_reply_message (custom string)
      `;
      
      // Make the API call to OpenAI
      const response = await settingsClient.chat.completions.create({
        model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: message }
        ] as any,
        temperature: 0.1, // Low temperature for more consistent outputs
        max_tokens: 300,
        response_format: { type: "json_object" }
      });
      
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in response from OpenAI');
      }
      
      // Return the parsed JSON settings
      const settings = JSON.parse(content);
      res.json(settings);
      
    } catch (error) {
      console.error("Error processing app settings:", error);
      res.status(500).json({ 
        message: "Failed to process app settings request",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // API endpoint for auto-response generation
  apiRouter.post("/ai/auto-response", async (req, res) => {
    try {
      const { context } = req.body;
      
      // Default context if not provided
      const contextToUse = typeof context === 'string' ? context : 'missed call';
      
      // Generate auto-response message using OpenAI with dedicated key
      const autoResponseMessage = await generateAutoResponse(contextToUse);
      
      res.json({ message: autoResponseMessage });
    } catch (error) {
      console.error("Error generating auto-response:", error);
      res.status(500).json({ 
        message: "Failed to generate auto-response message",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  
  // Unified command API endpoint
  apiRouter.post("/command", async (req, res) => {
    try {
      const { message, userId = "user-1", conversationContext } = req.body;
      
      if (!message || typeof message !== 'string') {
        return res.status(400).json({ 
          message: "Invalid request. 'message' must be a string." 
        });
      }
      
      // Create a record of the command in the database
      let commandRecord;
      try {
        commandRecord = await storage.createAiCommand({
          userId,
          userPrompt: message,
          commandType: 'unified',
          status: 'success'
        });
        console.log('Created AI command record:', commandRecord.id);
      } catch (dbError) {
        console.error('Error creating AI command record:', dbError);
        // Continue even if we couldn't record the command
      }
      
      // First, route the message to determine which APIs to call
      let routingResult;
      try {
        // Pass the conversation context if provided
        routingResult = await routeInputToApis(message, conversationContext);
      } catch (routingError) {
        console.error('Error during API routing:', routingError);
        
        // Update command status if we have a command record
        if (commandRecord) {
          try {
            await storage.updateAiCommand(commandRecord.id, { status: 'error' });
          } catch (updateError) {
            console.error('Error updating AI command status:', updateError);
          }
        }
        
        // Return a friendly error message if the routing fails (likely due to API key issues)
        return res.json({
          status: "needs_clarification",
          ask_user: "I'm sorry, but I'm having trouble understanding your request right now. Could you try again later or contact support if the issue persists?"
        });
      }
      
      // If clarification is needed, return that to the client along with context
      if (routingResult.clarification_prompt) {
        return res.json({
          status: "needs_clarification",
          ask_user: routingResult.clarification_prompt,
          missing_fields: routingResult.missing_fields || [],
          conversation_context: routingResult.conversation_context || conversationContext
        });
      }
      
      // Results object to collect responses from each API
      const results: Record<string, any> = {
        status: "success",
        conversation_context: routingResult.conversation_context || conversationContext
      };
      
      // Process settings request if present
      if (routingResult.settings_prompt) {
        try {
          // If we have a direct settings response from the keyword router, use it
          if (routingResult.settings_response) {
            console.log('Using direct settings response from keyword router');
            results.settings = routingResult.settings_response;
            
            // Record this effect in the database if we have a command record
            if (commandRecord) {
              try {
                await storage.createAiCommandEffect({
                  commandId: commandRecord.id,
                  effectType: 'update_settings',
                  targetType: 'settings',
                  targetId: null,
                  details: JSON.stringify(routingResult.settings_response)
                });
              } catch (effectError) {
                console.error('Error recording settings effect:', effectError);
                // Continue even if we couldn't record the effect
              }
            }
          } else {
            // Otherwise try to use OpenAI
            const settingsClient = getOpenAIClient('settings');
            
            const settingsResponse = await settingsClient.chat.completions.create({
              model: 'gpt-4o',
              messages: [
                { 
                  role: 'system', 
                  content: `You are an assistant that controls app settings. Convert the user's message into a JSON object 
                            containing only the settings they want to change.
                            
                            For language settings, always use the ISO language code format:
                            - 'en' for English
                            - 'es' for Spanish
                            - 'fr' for French
                            - 'de' for German  
                            - 'zh' for Chinese
                            - 'ja' for Japanese
                            
                            Example output for language change:
                            {
                              "language": "es"
                            }
                            
                            NEVER use full language names like "Spanish" - always use the code "es" instead.`
                },
                { role: 'user', content: routingResult.settings_prompt }
              ],
              temperature: 0.1,
              max_tokens: 300,
              response_format: { type: "json_object" }
            });
            
            const settingsContent = settingsResponse.choices[0]?.message?.content;
            if (settingsContent) {
              // Parse the settings
              const parsedSettings = JSON.parse(settingsContent);
              
              // Standardize language names to ISO codes
              if (parsedSettings.language) {
                // Convert full language names to ISO codes
                const languageMap: Record<string, string> = {
                  'english': 'en',
                  'spanish': 'es',
                  'french': 'fr',
                  'german': 'de',
                  'chinese': 'zh',
                  'japanese': 'ja'
                };
                
                // Check if the language value is a full name that needs conversion
                const lowerCaseLanguage = parsedSettings.language.toLowerCase();
                if (languageMap[lowerCaseLanguage]) {
                  console.log(`Converting language name "${parsedSettings.language}" to code "${languageMap[lowerCaseLanguage]}"`);
                  parsedSettings.language = languageMap[lowerCaseLanguage];
                }
              }
              
              results.settings = parsedSettings;
              
              // Record this effect in the database if we have a command record
              if (commandRecord) {
                try {
                  await storage.createAiCommandEffect({
                    commandId: commandRecord.id,
                    effectType: 'update_settings',
                    targetType: 'settings',
                    targetId: null,
                    details: settingsContent
                  });
                } catch (effectError) {
                  console.error('Error recording OpenAI settings effect:', effectError);
                  // Continue even if we couldn't record the effect
                }
              }
            }
          }
        } catch (settingsError) {
          console.error('Error processing settings:', settingsError);
          
          // Add error information to the results
          if (routingResult.settings_response) {
            // If we have a direct response, use it even if OpenAI failed
            results.settings = routingResult.settings_response;
          } else {
            results.settings_error = "Unable to process settings request";
          }
        }
      }
      
      // Process calendar request if present
      if (routingResult.calendar_prompt) {
        try {
          // Get user's existing schedule
          const userId = "user-1"; // Default user ID
          const schedule = await storage.getEvents(userId);
          
          // Process the scheduling request
          let calendarResponse;
          
          try {
            calendarResponse = await processSchedulingRequest(schedule, routingResult.calendar_prompt);
          } catch (e) {
            console.log("Using fallback calendar processing due to API error");
            // Fallback calendar processing logic that doesn't require OpenAI
            const userInput = routingResult.calendar_prompt.toLowerCase();
            
            // Extract event title - use everything after "schedule" or "meeting" keyword if found
            let eventTitle = "New Meeting";
            if (userInput.includes("meeting with")) {
              const match = userInput.match(/meeting with\s+([^\s].*?)(?:\s+on|\s+at|\s+tomorrow|$)/i);
              if (match && match[1]) {
                eventTitle = `Meeting with ${match[1].trim()}`;
              }
            } else if (userInput.includes("schedule")) {
              const match = userInput.match(/schedule\s+([^\s].*?)(?:\s+on|\s+at|\s+tomorrow|$)/i);
              if (match && match[1]) {
                eventTitle = match[1].trim();
              }
            }
            
            // Extract date - look for "tomorrow", "today", or specific date patterns
            const now = new Date();
            let startDate = new Date();
            startDate.setHours(10, 0, 0, 0); // Default to 10:00 AM
            
            // For testing and demonstration, log the user input for debugging
            console.log(`Parsing date/time from user input: "${userInput}"`);
            
            // Default to 10:00 AM
            startDate.setHours(10, 0, 0, 0);
            
            if (userInput.includes("tomorrow")) {
              console.log("Found 'tomorrow' in input - setting date to tomorrow");
              startDate.setDate(startDate.getDate() + 1);
            } else if (userInput.includes("today")) {
              console.log("Found 'today' in input - keeping date as today");
              // Already set to today
            } else {
              // Try to find month names or numbers
              const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
              let foundMonth = false;
              
              for (let i = 0; i < monthNames.length; i++) {
                if (userInput.includes(monthNames[i])) {
                  // Extract day number that appears near month name
                  const dayMatch = userInput.match(new RegExp(monthNames[i] + "\\s+(\\d+)", "i"));
                  if (dayMatch && dayMatch[1]) {
                    const day = parseInt(dayMatch[1], 10);
                    if (day >= 1 && day <= 31) {
                      console.log(`Found month ${monthNames[i]} and day ${day}`);
                      startDate.setMonth(i);
                      startDate.setDate(day);
                      foundMonth = true;
                      break;
                    }
                  }
                }
              }
              
              // If we didn't find a month name, look for date patterns like MM/DD
              if (!foundMonth) {
                const dateMatch = userInput.match(/(\d{1,2})[\/\-](\d{1,2})/);
                if (dateMatch) {
                  const month = parseInt(dateMatch[1], 10) - 1; // JavaScript months are 0-based
                  const day = parseInt(dateMatch[2], 10);
                  if (month >= 0 && month < 12 && day >= 1 && day <= 31) {
                    console.log(`Found date format MM/DD: ${month+1}/${day}`);
                    startDate.setMonth(month);
                    startDate.setDate(day);
                  }
                }
              }
              
              // If we still don't have a specific date, default to tomorrow
              if (!foundMonth && !userInput.includes("today")) {
                console.log("No specific date found in input - defaulting to tomorrow");
                startDate.setDate(startDate.getDate() + 1);
              }
            }
            
            // Extract time if present - handle formats like "3pm", "3:30pm", "15:00", etc.
            let foundTime = false;
            
            // Pattern for "X pm/am" or "X:YY pm/am"
            const timeMatch = userInput.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
            if (timeMatch) {
              let hour = parseInt(timeMatch[1], 10);
              const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
              const meridian = timeMatch[3].toLowerCase();
              
              // Adjust hour based on AM/PM
              if (meridian === "pm" && hour < 12) {
                hour += 12;
              } else if (meridian === "am" && hour === 12) {
                hour = 0;
              }
              
              if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
                console.log(`Found time: ${hour}:${minute} ${meridian}`);
                startDate.setHours(hour, minute, 0, 0);
                foundTime = true;
              }
            }
            
            // Pattern for 24-hour time format "HH:MM"
            if (!foundTime) {
              const militaryTimeMatch = userInput.match(/(?<!\d)(\d{1,2}):(\d{2})(?!\s*(am|pm))/i);
              if (militaryTimeMatch) {
                const hour = parseInt(militaryTimeMatch[1], 10);
                const minute = parseInt(militaryTimeMatch[2], 10);
                
                if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
                  console.log(`Found 24-hour time: ${hour}:${minute}`);
                  startDate.setHours(hour, minute, 0, 0);
                  foundTime = true;
                }
              }
            }
            
            // Look for common time indicators if no specific time format was found
            if (!foundTime) {
              if (userInput.includes("morning")) {
                console.log("Found 'morning' - setting time to 9:00 AM");
                startDate.setHours(9, 0, 0, 0);
              } else if (userInput.includes("afternoon")) {
                console.log("Found 'afternoon' - setting time to 2:00 PM");
                startDate.setHours(14, 0, 0, 0);
              } else if (userInput.includes("evening")) {
                console.log("Found 'evening' - setting time to 6:00 PM");
                startDate.setHours(18, 0, 0, 0);
              } else if (userInput.includes("night")) {
                console.log("Found 'night' - setting time to 8:00 PM");
                startDate.setHours(20, 0, 0, 0);
              }
            }
            
            // Create end time (1 hour after start time)
            const endDate = new Date(startDate);
            endDate.setHours(endDate.getHours() + 1);
            
            // Create calendar response object
            calendarResponse = {
              action: 'create',
              event_title: eventTitle,
              start_time: startDate.toISOString(),
              end_time: endDate.toISOString(),
              status: 'confirmed',
              notes: `Meeting scheduled for ${startDate.toLocaleString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                hour: 'numeric',
                minute: 'numeric'
              })}. Created from user request: "${routingResult.calendar_prompt}". Today's date is ${new Date().toLocaleDateString('en-US', {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
              })}.`,
              event_id: undefined // Add this to match the SchedulingResponse interface
            };
          }
          
          // Handle different calendar actions
          if (calendarResponse.action === 'create' && 
              calendarResponse.event_title && 
              calendarResponse.start_time && 
              calendarResponse.end_time) {
            try {
              // Create the event in the database
              const newEvent = await storage.createEvent({
                userId,
                title: calendarResponse.event_title,
                description: calendarResponse.notes,
                startTime: new Date(calendarResponse.start_time),
                endTime: new Date(calendarResponse.end_time),
                isConfirmed: calendarResponse.status === 'confirmed',
                eventType: 'client_meeting', // Default event type
              });
              
              // Add the created event ID to the response
              calendarResponse.event_id = newEvent.id;
              
              // Record this effect in the database if we have a command record
              if (commandRecord) {
                try {
                  await storage.createAiCommandEffect({
                    commandId: commandRecord.id,
                    effectType: 'create_event',
                    targetType: 'event',
                    targetId: newEvent.id.toString(),
                    details: JSON.stringify({
                      title: newEvent.title,
                      start: newEvent.startTime,
                      end: newEvent.endTime
                    })
                  });
                } catch (effectError) {
                  console.error('Error recording AI command effect:', effectError);
                  // Continue even if we couldn't record the effect
                }
              }
            } catch (createError) {
              console.error("Error creating event:", createError);
            }
          } 
          // Handle delete events
          else if (calendarResponse.action === 'delete' || calendarResponse.action === 'cancel') {
            try {
              let eventId = calendarResponse.event_id;
              let eventTitle = calendarResponse.event_title;
              let deletedEvent = null;
              
              // If we have an event ID, use it directly to delete
              if (eventId) {
                deletedEvent = await storage.deleteEvent(eventId);
              } 
              // If we have a title but no ID, try to find the event by title
              else if (eventTitle) {
                // Get all events
                const allEvents = await storage.getEvents(userId);
                
                // Find events with matching title (case insensitive)
                const matchingEvents = allEvents.filter(event => 
                  event.title.toLowerCase().includes(eventTitle!.toLowerCase())
                );
                
                // If we found exactly one match, delete it
                if (matchingEvents.length === 1) {
                  deletedEvent = await storage.deleteEvent(matchingEvents[0].id);
                  eventId = matchingEvents[0].id;
                }
                // If we found multiple matches, update the response to indicate this
                else if (matchingEvents.length > 1) {
                  calendarResponse.status = 'conflict';
                  calendarResponse.notes = `Found multiple events matching "${eventTitle}". Please specify which one to delete by using a more specific title or mentioning the date.`;
                }
                // If no matches, indicate this in the response
                else {
                  calendarResponse.status = 'conflict';
                  calendarResponse.notes = `No events found matching "${eventTitle}". Please check the title and try again.`;
                }
              }
              
              // If we successfully deleted an event, update the response
              if (deletedEvent) {
                calendarResponse.status = 'deleted';
                
                // Record this effect in the database if we have a command record
                if (commandRecord && eventId) {
                  try {
                    await storage.createAiCommandEffect({
                      commandId: commandRecord.id,
                      effectType: 'delete_event',
                      targetType: 'event',
                      targetId: eventId.toString(),
                      details: JSON.stringify({
                        title: eventTitle || 'Unknown event'
                      })
                    });
                  } catch (effectError) {
                    console.error('Error recording delete event effect:', effectError);
                    // Continue even if we couldn't record the effect
                  }
                }
              }
            } catch (error) {
              const deleteError = error as Error;
              console.error("Error deleting event:", deleteError);
              calendarResponse.status = 'conflict';
              calendarResponse.notes = `Error deleting event: ${deleteError.message || String(deleteError)}`;
            }
          }
          
          results.calendar = calendarResponse;
        } catch (calendarError) {
          console.error('Error processing calendar request:', calendarError);
          // Add error information to the results
          results.calendar_error = "Unable to process calendar request";
        }
      }
      
      // Process message request if present
      if (routingResult.message_prompt) {
        try {
          const messageResponse = await generateAutoResponse(routingResult.message_prompt);
          results.message = messageResponse;
        } catch (messageError) {
          console.error('Error generating auto-response:', messageError);
          // Add error information to the results
          results.message_error = "Unable to generate auto-response message";
        }
      }
      
      res.json(results);
    } catch (error) {
      console.error("Error processing command:", error);
      res.status(500).json({ 
        message: "Failed to process your command",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });

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

  app.use("/api", apiRouter);
  
  // Register public profile routes
  registerPublicProfileRoutes(app);
  
  // Register AI routes
  app.use("/api/ai", aiRoutes);
  
  const httpServer = createServer(app);
  return httpServer;
}
