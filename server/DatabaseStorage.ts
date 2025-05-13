import { 
  User, 
  InsertUser, 
  Client, 
  InsertClient, 
  Project, 
  InsertProject, 
  Task, 
  InsertTask, 
  TimeEntry, 
  InsertTimeEntry, 
  Invoice, 
  InsertInvoice, 
  InvoiceItem, 
  InsertInvoiceItem, 
  ServiceProvider, 
  InsertServiceProvider, 
  Service, 
  InsertService, 
  Event, 
  InsertEvent, 
  EventTemplate, 
  InsertEventTemplate,
  AiCommand,
  InsertAiCommand,
  AiCommandEffect,
  InsertAiCommandEffect,
  users,
  clients,
  projects,
  tasks,
  timeEntries,
  invoices,
  invoiceItems,
  serviceProviders,
  services,
  events,
  eventTemplates,
  aiCommands,
  aiCommandEffects
} from "@shared/schema";
import { db } from "./db";
import { asc, desc, eq, and } from "drizzle-orm";
import { IStorage } from "./storage";

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }
  
  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }
  
  async createUser(user: InsertUser): Promise<User> {
    const [result] = await db.insert(users).values(user).returning();
    return result;
  }
  
  // Client operations
  async getClients(): Promise<Client[]> {
    return await db.select().from(clients).orderBy(clients.name);
  }
  
  async getClient(id: number): Promise<Client | undefined> {
    const [client] = await db.select().from(clients).where(eq(clients.id, id));
    return client;
  }
  
  async createClient(client: InsertClient): Promise<Client> {
    const [result] = await db.insert(clients).values(client).returning();
    return result;
  }
  
  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const [result] = await db.update(clients)
      .set(client)
      .where(eq(clients.id, id))
      .returning();
    return result;
  }
  
  async deleteClient(id: number): Promise<boolean> {
    const result = await db.delete(clients).where(eq(clients.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Project operations
  async getProjects(): Promise<Project[]> {
    return await db.select().from(projects).orderBy(projects.name);
  }
  
  async getProjectsByClient(clientId: number): Promise<Project[]> {
    return await db.select()
      .from(projects)
      .where(eq(projects.clientId, clientId))
      .orderBy(projects.name);
  }
  
  async getProject(id: number): Promise<Project | undefined> {
    const [project] = await db.select().from(projects).where(eq(projects.id, id));
    return project;
  }
  
  async createProject(project: InsertProject): Promise<Project> {
    const [result] = await db.insert(projects).values(project).returning();
    return result;
  }
  
  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const [result] = await db.update(projects)
      .set(project)
      .where(eq(projects.id, id))
      .returning();
    return result;
  }
  
  async deleteProject(id: number): Promise<boolean> {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount > 0;
  }
  
  // Task operations
  async getTasks(): Promise<Task[]> {
    return await db.select().from(tasks).orderBy(tasks.title);
  }
  
  async getTasksByProject(projectId: number): Promise<Task[]> {
    return await db.select()
      .from(tasks)
      .where(eq(tasks.projectId, projectId))
      .orderBy(tasks.title);
  }
  
  async getTask(id: number): Promise<Task | undefined> {
    const [task] = await db.select().from(tasks).where(eq(tasks.id, id));
    return task;
  }
  
  async createTask(task: InsertTask): Promise<Task> {
    const [result] = await db.insert(tasks).values(task).returning();
    return result;
  }
  
  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const [result] = await db.update(tasks)
      .set(task)
      .where(eq(tasks.id, id))
      .returning();
    return result;
  }
  
  async deleteTask(id: number): Promise<boolean> {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount > 0;
  }
  
  // TimeEntry operations
  async getTimeEntries(): Promise<TimeEntry[]> {
    return await db.select().from(timeEntries).orderBy(desc(timeEntries.startTime));
  }
  
  async getTimeEntriesByProject(projectId: number): Promise<TimeEntry[]> {
    return await db.select()
      .from(timeEntries)
      .where(eq(timeEntries.projectId, projectId))
      .orderBy(desc(timeEntries.startTime));
  }
  
  async getTimeEntriesByTask(taskId: number): Promise<TimeEntry[]> {
    return await db.select()
      .from(timeEntries)
      .where(eq(timeEntries.taskId, taskId))
      .orderBy(desc(timeEntries.startTime));
  }
  
  async getTimeEntry(id: number): Promise<TimeEntry | undefined> {
    const [timeEntry] = await db.select().from(timeEntries).where(eq(timeEntries.id, id));
    return timeEntry;
  }
  
  async createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry> {
    const [result] = await db.insert(timeEntries).values(timeEntry).returning();
    return result;
  }
  
  async updateTimeEntry(id: number, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined> {
    const [result] = await db.update(timeEntries)
      .set(timeEntry)
      .where(eq(timeEntries.id, id))
      .returning();
    return result;
  }
  
  async deleteTimeEntry(id: number): Promise<boolean> {
    const result = await db.delete(timeEntries).where(eq(timeEntries.id, id));
    return result.rowCount > 0;
  }
  
  // Invoice operations
  async getInvoices(): Promise<Invoice[]> {
    return await db.select().from(invoices).orderBy(desc(invoices.issueDate));
  }
  
  async getInvoicesByClient(clientId: number): Promise<Invoice[]> {
    return await db.select()
      .from(invoices)
      .where(eq(invoices.clientId, clientId))
      .orderBy(desc(invoices.issueDate));
  }
  
  async getInvoice(id: number): Promise<Invoice | undefined> {
    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, id));
    return invoice;
  }
  
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [result] = await db.insert(invoices).values(invoice).returning();
    return result;
  }
  
  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [result] = await db.update(invoices)
      .set(invoice)
      .where(eq(invoices.id, id))
      .returning();
    return result;
  }
  
  async deleteInvoice(id: number): Promise<boolean> {
    const result = await db.delete(invoices).where(eq(invoices.id, id));
    return result.rowCount > 0;
  }
  
  // InvoiceItem operations
  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return await db.select()
      .from(invoiceItems)
      .where(eq(invoiceItems.invoiceId, invoiceId));
  }
  
  async getInvoiceItem(id: number): Promise<InvoiceItem | undefined> {
    const [invoiceItem] = await db.select().from(invoiceItems).where(eq(invoiceItems.id, id));
    return invoiceItem;
  }
  
  async createInvoiceItem(invoiceItem: InsertInvoiceItem): Promise<InvoiceItem> {
    const [result] = await db.insert(invoiceItems).values(invoiceItem).returning();
    return result;
  }
  
  async updateInvoiceItem(id: number, invoiceItem: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined> {
    const [result] = await db.update(invoiceItems)
      .set(invoiceItem)
      .where(eq(invoiceItems.id, id))
      .returning();
    return result;
  }
  
  async deleteInvoiceItem(id: number): Promise<boolean> {
    const result = await db.delete(invoiceItems).where(eq(invoiceItems.id, id));
    return result.rowCount > 0;
  }
  
  // Event operations
  async getEvents(userId: string): Promise<Event[]> {
    return await db.select()
      .from(events)
      .where(eq(events.userId, userId))
      .orderBy(events.startTime);
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    const [event] = await db.select().from(events).where(eq(events.id, id));
    return event;
  }
  
  async createEvent(event: InsertEvent): Promise<Event> {
    const [result] = await db.insert(events).values(event).returning();
    return result;
  }
  
  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined> {
    const [result] = await db.update(events)
      .set(event)
      .where(eq(events.id, id))
      .returning();
    return result;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    const result = await db.delete(events).where(eq(events.id, id));
    return result.rowCount > 0;
  }
  
  // EventTemplate operations
  async getEventTemplates(userId: string): Promise<EventTemplate[]> {
    return await db.select()
      .from(eventTemplates)
      .where(eq(eventTemplates.userId, userId))
      .orderBy(eventTemplates.name);
  }
  
  async getPublicEventTemplates(userId: string): Promise<EventTemplate[]> {
    return await db.select()
      .from(eventTemplates)
      .where(and(
        eq(eventTemplates.userId, userId),
        eq(eventTemplates.isPublic, true)
      ))
      .orderBy(eventTemplates.name);
  }
  
  async getEventTemplate(id: number): Promise<EventTemplate | undefined> {
    const [template] = await db.select().from(eventTemplates).where(eq(eventTemplates.id, id));
    return template;
  }
  
  async createEventTemplate(template: InsertEventTemplate): Promise<EventTemplate> {
    const [result] = await db.insert(eventTemplates).values(template).returning();
    return result;
  }
  
  async updateEventTemplate(id: number, template: Partial<InsertEventTemplate>): Promise<EventTemplate | undefined> {
    const [result] = await db.update(eventTemplates)
      .set({
        ...template,
        updatedAt: new Date()
      })
      .where(eq(eventTemplates.id, id))
      .returning();
    return result;
  }
  
  async deleteEventTemplate(id: number): Promise<boolean> {
    const result = await db.delete(eventTemplates).where(eq(eventTemplates.id, id));
    return result.rowCount > 0;
  }
  
  // ServiceProvider operations
  async getServiceProviders(): Promise<ServiceProvider[]> {
    return await db.select().from(serviceProviders).orderBy(serviceProviders.firstName);
  }
  
  async getServiceProvider(id: number): Promise<ServiceProvider | undefined> {
    const [provider] = await db.select().from(serviceProviders).where(eq(serviceProviders.id, id));
    return provider;
  }
  
  async getServiceProviderByEmail(email: string): Promise<ServiceProvider | undefined> {
    const [provider] = await db.select()
      .from(serviceProviders)
      .where(eq(serviceProviders.email, email));
    return provider;
  }
  
  async createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider> {
    const [result] = await db.insert(serviceProviders).values(provider).returning();
    return result;
  }
  
  async updateServiceProvider(id: number, provider: Partial<InsertServiceProvider>): Promise<ServiceProvider | undefined> {
    const [result] = await db.update(serviceProviders)
      .set(provider)
      .where(eq(serviceProviders.id, id))
      .returning();
    return result;
  }
  
  async deleteServiceProvider(id: number): Promise<boolean> {
    const result = await db.delete(serviceProviders).where(eq(serviceProviders.id, id));
    return result.rowCount > 0;
  }
  
  // Service operations
  async getServices(): Promise<Service[]> {
    return await db.select().from(services).orderBy(services.name);
  }
  
  async getServicesByProvider(providerId: number): Promise<Service[]> {
    return await db.select()
      .from(services)
      .where(eq(services.providerId, providerId))
      .orderBy(services.name);
  }
  
  async getService(id: number): Promise<Service | undefined> {
    const [service] = await db.select().from(services).where(eq(services.id, id));
    return service;
  }
  
  async createService(service: InsertService): Promise<Service> {
    const [result] = await db.insert(services).values(service).returning();
    return result;
  }
  
  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> {
    const [result] = await db.update(services)
      .set(service)
      .where(eq(services.id, id))
      .returning();
    return result;
  }
  
  async deleteService(id: number): Promise<boolean> {
    const result = await db.delete(services).where(eq(services.id, id));
    return result.rowCount > 0;
  }
  
  // AI Command operations
  async getAiCommands(userId: string, limit?: number): Promise<AiCommand[]> {
    let query = db.select()
      .from(aiCommands)
      .where(eq(aiCommands.userId, userId))
      .orderBy(desc(aiCommands.createdAt));
    
    // Apply limit if specified
    if (limit && limit > 0) {
      return await query.limit(limit);
    }
    
    return await query;
  }
  
  async getAiCommand(id: number): Promise<AiCommand | undefined> {
    const [command] = await db.select().from(aiCommands).where(eq(aiCommands.id, id));
    return command;
  }
  
  async createAiCommand(command: InsertAiCommand): Promise<AiCommand> {
    const [result] = await db.insert(aiCommands).values(command).returning();
    return result;
  }
  
  async getAiCommandEffects(commandId: number): Promise<AiCommandEffect[]> {
    return await db.select()
      .from(aiCommandEffects)
      .where(eq(aiCommandEffects.commandId, commandId))
      .orderBy(asc(aiCommandEffects.createdAt));
  }
  
  async createAiCommandEffect(effect: InsertAiCommandEffect): Promise<AiCommandEffect> {
    const [result] = await db.insert(aiCommandEffects).values(effect).returning();
    return result;
  }
}