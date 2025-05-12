import { Router, type Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { 
  insertClientSchema, 
  insertProjectSchema, 
  insertTaskSchema, 
  insertTimeEntrySchema, 
  insertInvoiceSchema, 
  insertInvoiceItemSchema 
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

  app.use("/api", apiRouter);
  
  const httpServer = createServer(app);
  return httpServer;
}
