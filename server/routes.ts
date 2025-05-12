import { Router, type Express, type Request, type Response } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { processSchedulingRequest, generateScheduleSummary, SchedulingResponse } from "./openai";
import { 
  insertClientSchema, 
  insertProjectSchema, 
  insertTaskSchema, 
  insertTimeEntrySchema, 
  insertInvoiceSchema, 
  insertInvoiceItemSchema,
  insertEventSchema,
  insertEventTemplateSchema
} from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  const apiRouter = Router();
  
  // Health check endpoint
  apiRouter.get("/health", (req, res) => {
    res.json({ status: "ok" });
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

  apiRouter.put("/clients/:id", async (req, res) => {
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

  apiRouter.delete("/clients/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    const deleted = await storage.deleteClient(id);
    if (!deleted) {
      return res.status(404).json({ message: "Client not found" });
    }

    res.status(204).end();
  });

  // Project endpoints
  apiRouter.get("/projects", async (req, res) => {
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
      const projectData = insertProjectSchema.parse(req.body);
      const project = await storage.createProject(projectData);
      res.status(201).json(project);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid project data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create project" });
    }
  });

  apiRouter.put("/projects/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }

    try {
      const projectData = insertProjectSchema.partial().parse(req.body);
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

  apiRouter.put("/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }

    try {
      const taskData = insertTaskSchema.partial().parse(req.body);
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
      const events = await storage.getEvents(userId);
      res.json(events);
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

  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
