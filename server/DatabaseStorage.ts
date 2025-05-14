import { db } from './db';
import { eq, desc, and, sql } from 'drizzle-orm';
import * as schema from '@shared/schema';
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
  NavigationEvent,
  InsertNavigationEvent,
  UserPreferences,
  InsertUserPreferences
} from '@shared/schema';
import { IStorage } from './storage';

export class DatabaseStorage implements IStorage {
  // Navigation tracking operations
  async createNavigationEvent(event: InsertNavigationEvent): Promise<NavigationEvent> {
    const [result] = await db
      .insert(schema.navigationEvents)
      .values(event)
      .returning();
    return result;
  }

  async getNavigationEventsByUser(userId: string): Promise<NavigationEvent[]> {
    return await db
      .select()
      .from(schema.navigationEvents)
      .where(eq(schema.navigationEvents.userId, userId))
      .orderBy(desc(schema.navigationEvents.timestamp));
  }

  async getNavigationEventsByPathAndUser(userId: string, path: string): Promise<NavigationEvent[]> {
    return await db
      .select()
      .from(schema.navigationEvents)
      .where(
        and(
          eq(schema.navigationEvents.userId, userId),
          eq(schema.navigationEvents.path, path)
        )
      )
      .orderBy(desc(schema.navigationEvents.timestamp));
  }

  // User preferences operations
  async getUserPreferences(userId: string): Promise<UserPreferences | undefined> {
    const [result] = await db
      .select()
      .from(schema.userPreferences)
      .where(eq(schema.userPreferences.userId, userId));
    return result;
  }

  async createUserPreferences(preferences: InsertUserPreferences): Promise<UserPreferences> {
    const [result] = await db
      .insert(schema.userPreferences)
      .values({
        ...preferences,
        lastUpdated: new Date()
      })
      .returning();
    return result;
  }

  async updateUserPreferences(userId: string, preferences: Partial<InsertUserPreferences>): Promise<UserPreferences | undefined> {
    const [result] = await db
      .update(schema.userPreferences)
      .set({
        ...preferences,
        lastUpdated: new Date()
      })
      .where(eq(schema.userPreferences.userId, userId))
      .returning();
    return result;
  }

  // AI Command operations
  async getAiCommands(userId: string, limit?: number): Promise<AiCommand[]> {
    const query = db
      .select()
      .from(schema.aiCommands)
      .where(eq(schema.aiCommands.userId, userId))
      .orderBy(desc(schema.aiCommands.createdAt));
      
    if (limit) {
      return await query.limit(limit);
    }
    
    return await query;
  }

  async getAiCommand(id: number): Promise<AiCommand | undefined> {
    const [result] = await db
      .select()
      .from(schema.aiCommands)
      .where(eq(schema.aiCommands.id, id));
    return result;
  }

  async createAiCommand(command: InsertAiCommand): Promise<AiCommand> {
    const [result] = await db
      .insert(schema.aiCommands)
      .values(command)
      .returning();
    return result;
  }

  async updateAiCommand(id: number, command: Partial<InsertAiCommand>): Promise<AiCommand | undefined> {
    const [result] = await db
      .update(schema.aiCommands)
      .set(command)
      .where(eq(schema.aiCommands.id, id))
      .returning();
    return result;
  }

  async getAiCommandEffects(commandId: number): Promise<AiCommandEffect[]> {
    return await db
      .select()
      .from(schema.aiCommandEffects)
      .where(eq(schema.aiCommandEffects.commandId, commandId))
      .orderBy(schema.aiCommandEffects.id);
  }

  async createAiCommandEffect(effect: InsertAiCommandEffect): Promise<AiCommandEffect> {
    const [result] = await db
      .insert(schema.aiCommandEffects)
      .values({
        ...effect,
        createdAt: new Date()
      })
      .returning();
    return result;
  }

  // Calendar Event operations
  async getEvents(userId: string): Promise<Event[]> {
    return await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.userId, userId))
      .orderBy(schema.events.startTime);
  }

  async getEvent(id: number): Promise<Event | undefined> {
    const [result] = await db
      .select()
      .from(schema.events)
      .where(eq(schema.events.id, id));
    return result;
  }

  async createEvent(event: InsertEvent): Promise<Event> {
    const [result] = await db
      .insert(schema.events)
      .values({
        ...event,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return result;
  }

  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined> {
    const [result] = await db
      .update(schema.events)
      .set({
        ...event,
        updatedAt: new Date()
      })
      .where(eq(schema.events.id, id))
      .returning();
    return result;
  }

  async deleteEvent(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.events)
      .where(eq(schema.events.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // Event Template operations
  async getEventTemplates(userId: string): Promise<EventTemplate[]> {
    return await db
      .select()
      .from(schema.eventTemplates)
      .where(eq(schema.eventTemplates.userId, userId))
      .orderBy(schema.eventTemplates.name);
  }

  async getPublicEventTemplates(userId: string): Promise<EventTemplate[]> {
    return await db
      .select()
      .from(schema.eventTemplates)
      .where(
        and(
          eq(schema.eventTemplates.userId, userId),
          eq(schema.eventTemplates.isPublic, true)
        )
      )
      .orderBy(schema.eventTemplates.name);
  }

  async getEventTemplate(id: number): Promise<EventTemplate | undefined> {
    const [result] = await db
      .select()
      .from(schema.eventTemplates)
      .where(eq(schema.eventTemplates.id, id));
    return result;
  }

  async createEventTemplate(template: InsertEventTemplate): Promise<EventTemplate> {
    const [result] = await db
      .insert(schema.eventTemplates)
      .values({
        ...template,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    return result;
  }

  async updateEventTemplate(id: number, template: Partial<InsertEventTemplate>): Promise<EventTemplate | undefined> {
    const [result] = await db
      .update(schema.eventTemplates)
      .set({
        ...template,
        updatedAt: new Date()
      })
      .where(eq(schema.eventTemplates.id, id))
      .returning();
    return result;
  }

  async deleteEventTemplate(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.eventTemplates)
      .where(eq(schema.eventTemplates.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }

  // The remaining methods for User, Client, Project, Task, TimeEntry, Invoice, etc.
  // would be implemented here. We're focusing on the AI, event, and navigation functionality
  // for this implementation.

  // User related operations
  async getUser(id: number): Promise<User | undefined> {
    const [result] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.id, id));
    return result;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [result] = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.username, username));
    return result;
  }

  async createUser(user: InsertUser): Promise<User> {
    const [result] = await db
      .insert(schema.users)
      .values(user)
      .returning();
    return result;
  }

  // Implementing methods as needed for the remaining operations
  // We'll implement stubs for the required interface methods
  async getClients(): Promise<Client[]> { 
    return await db.select().from(schema.clients);
  }
  async getClient(id: number): Promise<Client | undefined> { 
    const result = await db
      .select()
      .from(schema.clients)
      .where(eq(schema.clients.id, id));
    return result[0];
  }
  async createClient(client: InsertClient): Promise<Client> { 
    const [result] = await db
      .insert(schema.clients)
      .values({
        ...client,
        createdAt: new Date()
      })
      .returning();
    return result;
  }
  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> { return undefined; }
  async deleteClient(id: number): Promise<boolean> { return false; }
  
  async getProjects(): Promise<Project[]> { 
    return await db.select().from(schema.projects);
  }
  async getProjectsByClient(clientId: number): Promise<Project[]> { 
    return await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.clientId, clientId));
  }
  
  async getProject(id: number): Promise<Project | undefined> { 
    const result = await db
      .select()
      .from(schema.projects)
      .where(eq(schema.projects.id, id));
    return result[0];
  }
  async createProject(project: InsertProject): Promise<Project> { 
    const [result] = await db
      .insert(schema.projects)
      .values({
        ...project,
        createdAt: new Date()
      })
      .returning();
    return result;
  }
  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> { return undefined; }
  async deleteProject(id: number): Promise<boolean> { return false; }
  
  async getTasks(): Promise<Task[]> { 
    return await db.select().from(schema.tasks);
  }
  async getTasksByProject(projectId: number): Promise<Task[]> { 
    return await db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.projectId, projectId));
  }
  
  async getTask(id: number): Promise<Task | undefined> { 
    const result = await db
      .select()
      .from(schema.tasks)
      .where(eq(schema.tasks.id, id));
    return result[0];
  }
  async createTask(task: InsertTask): Promise<Task> { 
    const [result] = await db
      .insert(schema.tasks)
      .values({
        ...task,
        createdAt: new Date()
      })
      .returning();
    return result;
  }
  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> { return undefined; }
  async deleteTask(id: number): Promise<boolean> { return false; }
  
  async getTimeEntries(): Promise<TimeEntry[]> { return []; }
  async getTimeEntriesByProject(projectId: number): Promise<TimeEntry[]> { return []; }
  async getTimeEntriesByTask(taskId: number): Promise<TimeEntry[]> { return []; }
  async getTimeEntry(id: number): Promise<TimeEntry | undefined> { return undefined; }
  async createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry> { 
    return {} as TimeEntry; 
  }
  async updateTimeEntry(id: number, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined> { return undefined; }
  async deleteTimeEntry(id: number): Promise<boolean> { return false; }
  
  async getInvoices(): Promise<Invoice[]> { return []; }
  async getInvoicesByClient(clientId: number): Promise<Invoice[]> { return []; }
  async getInvoice(id: number): Promise<Invoice | undefined> { return undefined; }
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> { 
    return {} as Invoice; 
  }
  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined> { return undefined; }
  async deleteInvoice(id: number): Promise<boolean> { return false; }
  
  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> { return []; }
  async getInvoiceItem(id: number): Promise<InvoiceItem | undefined> { return undefined; }
  async createInvoiceItem(invoiceItem: InsertInvoiceItem): Promise<InvoiceItem> { 
    return {} as InvoiceItem; 
  }
  async updateInvoiceItem(id: number, invoiceItem: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined> { return undefined; }
  async deleteInvoiceItem(id: number): Promise<boolean> { return false; }
  
  async getServiceProviders(): Promise<ServiceProvider[]> { return []; }
  async getServiceProvider(id: number): Promise<ServiceProvider | undefined> { return undefined; }
  async getServiceProviderByEmail(email: string): Promise<ServiceProvider | undefined> { return undefined; }
  async createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider> { 
    return {} as ServiceProvider; 
  }
  async updateServiceProvider(id: number, provider: Partial<InsertServiceProvider>): Promise<ServiceProvider | undefined> { return undefined; }
  async deleteServiceProvider(id: number): Promise<boolean> { return false; }
  
  async getServices(): Promise<Service[]> { return []; }
  async getServicesByProvider(providerId: number): Promise<Service[]> { return []; }
  async getService(id: number): Promise<Service | undefined> { return undefined; }
  async createService(service: InsertService): Promise<Service> { 
    return {} as Service; 
  }
  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> { return undefined; }
  async deleteService(id: number): Promise<boolean> { return false; }
}