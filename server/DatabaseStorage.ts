import { db } from './db';
import { eq, desc, and, sql, notInArray, inArray, count, isNull, ne } from 'drizzle-orm';
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
  InsertUserPreferences,
  AutoResponse,
  InsertAutoResponse
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

  // Client operations
  async deleteClient(id: number): Promise<boolean> {
    console.log("Attempting to delete client with ID:", id);
    
    try {
      const result = await db
        .delete(schema.clients)
        .where(eq(schema.clients.id, id));
      
      console.log("Delete client result:", result);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error("Error in deleteClient:", error);
      throw error;
    }
  }

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
  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> { 
    const [result] = await db
      .update(schema.clients)
      .set(client)
      .where(eq(schema.clients.id, id))
      .returning();
    return result;
  }
  
  async deleteClient(id: number): Promise<boolean> { 
    const result = await db
      .delete(schema.clients)
      .where(eq(schema.clients.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Get clients that aren't connected to any projects, events, or invoices
  async getUnconnectedClients(): Promise<Client[]> {
    // Get all clients
    const allClients = await this.getClients();
    
    // Get client IDs that have projects
    const projectClientIds = await db
      .select({ id: schema.projects.clientId })
      .from(schema.projects);
    
    // Get client IDs that have events
    const eventClientIds = await db
      .select({ id: schema.events.clientId })
      .from(schema.events)
      .where(ne(schema.events.clientId, null));
    
    // Get client IDs that have invoices
    const invoiceClientIds = await db
      .select({ id: schema.invoices.clientId })
      .from(schema.invoices);
    
    // Create a set of connected client IDs
    const connectedClientIds = new Set([
      ...projectClientIds.map(p => p.id),
      ...eventClientIds.map(e => e.id as number),
      ...invoiceClientIds.map(i => i.id)
    ]);
    
    // Filter out clients that have connections
    const unconnectedClients = allClients.filter(client => 
      !connectedClientIds.has(client.id)
    );
    
    return unconnectedClients;
  }
  
  // Get clients with duplicate email addresses
  async getDuplicateClients(): Promise<Client[]> {
    // First approach: Use a SQL query with GROUP BY to identify duplicate emails
    try {
      // Find email addresses that appear more than once (case-insensitive)
      const duplicateEmailsResult = await db.execute(
        sql`SELECT LOWER(TRIM(email)) as normalized_email 
            FROM ${schema.clients} 
            GROUP BY normalized_email 
            HAVING COUNT(*) > 1`
      );
      
      // Extract the duplicate emails
      const duplicateEmails = duplicateEmailsResult.rows.map(row => row.normalized_email as string);
      
      if (duplicateEmails.length === 0) {
        return []; // No duplicates found
      }
      
      // Get all clients with duplicate emails
      return await db
        .select()
        .from(schema.clients)
        .where(
          sql`LOWER(TRIM(${schema.clients.email})) IN (${sql.join(
            duplicateEmails.map(email => sql`${email}`),
            sql`, `
          )})`
        );
    } catch (error) {
      console.error("Error finding duplicate clients:", error);
      
      // Fallback approach: Use client-side filtering (less efficient but more reliable)
      const allClients = await this.getClients();
      
      // Create a map to track emails
      const emailMap = new Map<string, number>();
      const duplicateEmails = new Set<string>();
      
      // Find duplicate emails
      allClients.forEach(client => {
        const email = client.email.toLowerCase().trim();
        if (emailMap.has(email)) {
          duplicateEmails.add(email);
        } else {
          emailMap.set(email, client.id);
        }
      });
      
      // Return clients with duplicate emails
      return allClients.filter(client => 
        duplicateEmails.has(client.email.toLowerCase().trim())
      );
    }
  }
  
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
    try {
      console.log("DatabaseStorage - Creating project with data:", project);
      
      // Ensure all required fields have proper values
      const projectData = {
        name: project.name,
        clientId: project.clientId,
        description: project.description ?? null,
        status: project.status || "not_started",
        startDate: project.startDate || new Date(),
        endDate: project.endDate || null,
        budget: project.budget ?? null,
        createdAt: new Date()
      };
      
      console.log("DatabaseStorage - Processed project data:", projectData);
      
      const [result] = await db
        .insert(schema.projects)
        .values(projectData)
        .returning();
      
      console.log("DatabaseStorage - Project created successfully:", result);
      return result;
    } catch (error) {
      console.error("DatabaseStorage - Error creating project:", error);
      throw error;
    }
  }
  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> { 
    const [result] = await db
      .update(schema.projects)
      .set(project)
      .where(eq(schema.projects.id, id))
      .returning();
    return result;
  }
  
  async deleteProject(id: number): Promise<boolean> { 
    const result = await db
      .delete(schema.projects)
      .where(eq(schema.projects.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
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
  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> { 
    const [result] = await db
      .update(schema.tasks)
      .set(task)
      .where(eq(schema.tasks.id, id))
      .returning();
    return result;
  }
  
  async deleteTask(id: number): Promise<boolean> { 
    const result = await db
      .delete(schema.tasks)
      .where(eq(schema.tasks.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async getTimeEntries(): Promise<TimeEntry[]> { 
    return await db.select().from(schema.timeEntries);
  }
  
  async getTimeEntriesByProject(projectId: number): Promise<TimeEntry[]> { 
    return await db
      .select()
      .from(schema.timeEntries)
      .where(eq(schema.timeEntries.projectId, projectId));
  }
  
  async getTimeEntriesByTask(taskId: number): Promise<TimeEntry[]> { 
    return await db
      .select()
      .from(schema.timeEntries)
      .where(eq(schema.timeEntries.taskId, taskId));
  }
  
  async getTimeEntry(id: number): Promise<TimeEntry | undefined> { 
    const result = await db
      .select()
      .from(schema.timeEntries)
      .where(eq(schema.timeEntries.id, id));
    return result[0];
  }
  
  async createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry> { 
    const [result] = await db
      .insert(schema.timeEntries)
      .values({
        ...timeEntry,
        createdAt: new Date()
      })
      .returning();
    return result;
  }
  
  async updateTimeEntry(id: number, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined> { 
    const [result] = await db
      .update(schema.timeEntries)
      .set(timeEntry)
      .where(eq(schema.timeEntries.id, id))
      .returning();
    return result;
  }
  
  async deleteTimeEntry(id: number): Promise<boolean> { 
    const result = await db
      .delete(schema.timeEntries)
      .where(eq(schema.timeEntries.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async getInvoices(): Promise<Invoice[]> { 
    return await db.select().from(schema.invoices);
  }
  
  async getInvoicesByClient(clientId: number): Promise<Invoice[]> { 
    return await db
      .select()
      .from(schema.invoices)
      .where(eq(schema.invoices.clientId, clientId));
  }
  
  async getInvoice(id: number): Promise<Invoice | undefined> {
    const result = await db
      .select()
      .from(schema.invoices)
      .where(eq(schema.invoices.id, id));
    return result[0];
  }
  
  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const [result] = await db
      .insert(schema.invoices)
      .values({
        ...invoice,
        createdAt: new Date(),
        status: invoice.status || "draft" // Set default status if not provided
      })
      .returning();
    return result;
  }
  
  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const [result] = await db
      .update(schema.invoices)
      .set(invoice)
      .where(eq(schema.invoices.id, id))
      .returning();
    return result;
  }
  
  async deleteInvoice(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.invoices)
      .where(eq(schema.invoices.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return await db
      .select()
      .from(schema.invoiceItems)
      .where(eq(schema.invoiceItems.invoiceId, invoiceId));
  }
  
  async getInvoiceItem(id: number): Promise<InvoiceItem | undefined> {
    const result = await db
      .select()
      .from(schema.invoiceItems)
      .where(eq(schema.invoiceItems.id, id));
    return result[0];
  }
  
  async createInvoiceItem(invoiceItem: InsertInvoiceItem): Promise<InvoiceItem> {
    const [result] = await db
      .insert(schema.invoiceItems)
      .values(invoiceItem)
      .returning();
    return result;
  }
  
  async updateInvoiceItem(id: number, invoiceItem: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined> {
    const [result] = await db
      .update(schema.invoiceItems)
      .set(invoiceItem)
      .where(eq(schema.invoiceItems.id, id))
      .returning();
    return result;
  }
  
  async deleteInvoiceItem(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.invoiceItems)
      .where(eq(schema.invoiceItems.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async getServiceProviders(): Promise<ServiceProvider[]> { 
    return await db.select().from(schema.serviceProviders);
  }
  
  async getServiceProvider(id: number): Promise<ServiceProvider | undefined> { 
    const result = await db
      .select()
      .from(schema.serviceProviders)
      .where(eq(schema.serviceProviders.id, id));
    return result[0];
  }
  
  async getServiceProviderByEmail(email: string): Promise<ServiceProvider | undefined> { 
    const result = await db
      .select()
      .from(schema.serviceProviders)
      .where(eq(schema.serviceProviders.email, email));
    return result[0];
  }
  
  async createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider> { 
    // Ensure all required fields have values or defaults
    const providerData = {
      ...provider,
      serviceArea: provider.serviceArea || null,
      profileImage: provider.profileImage || null,
      voicemailMessage: provider.voicemailMessage || null,
      smsFollowUpMessage: provider.smsFollowUpMessage || null,
      availabilityHours: provider.availabilityHours || null,
      createdAt: new Date()
    };
    
    const [result] = await db
      .insert(schema.serviceProviders)
      .values(providerData)
      .returning();
    return result;
  }
  
  async updateServiceProvider(id: number, provider: Partial<InsertServiceProvider>): Promise<ServiceProvider | undefined> { 
    const [result] = await db
      .update(schema.serviceProviders)
      .set(provider)
      .where(eq(schema.serviceProviders.id, id))
      .returning();
    return result;
  }
  
  async deleteServiceProvider(id: number): Promise<boolean> { 
    const result = await db
      .delete(schema.serviceProviders)
      .where(eq(schema.serviceProviders.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  async getServices(): Promise<Service[]> { 
    return await db.select().from(schema.services);
  }
  
  async getServicesByProvider(providerId: number): Promise<Service[]> { 
    return await db
      .select()
      .from(schema.services)
      .where(eq(schema.services.providerId, providerId));
  }
  
  async getService(id: number): Promise<Service | undefined> { 
    const result = await db
      .select()
      .from(schema.services)
      .where(eq(schema.services.id, id));
    return result[0];
  }
  
  async createService(service: InsertService): Promise<Service> { 
    // Ensure all required fields have values or defaults
    const serviceData = {
      ...service,
      description: service.description || null,
      locationType: service.locationType || "office", // Default to office
      createdAt: new Date()
    };
    
    const [result] = await db
      .insert(schema.services)
      .values(serviceData)
      .returning();
    return result;
  }
  
  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> { 
    const [result] = await db
      .update(schema.services)
      .set(service)
      .where(eq(schema.services.id, id))
      .returning();
    return result;
  }
  
  async deleteService(id: number): Promise<boolean> { 
    const result = await db
      .delete(schema.services)
      .where(eq(schema.services.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  
  // Auto responses methods
  async getAutoResponses(userId: string): Promise<AutoResponse[]> {
    return await db
      .select()
      .from(schema.autoResponses)
      .where(eq(schema.autoResponses.userId, userId))
      .orderBy(schema.autoResponses.name);
  }

  async getAutoResponsesByType(userId: string, type: string): Promise<AutoResponse[]> {
    return await db
      .select()
      .from(schema.autoResponses)
      .where(
        and(
          eq(schema.autoResponses.userId, userId),
          eq(schema.autoResponses.type, type as any)
        )
      )
      .orderBy(schema.autoResponses.name);
  }

  async getAutoResponse(id: number): Promise<AutoResponse | undefined> {
    const [result] = await db
      .select()
      .from(schema.autoResponses)
      .where(eq(schema.autoResponses.id, id));
    return result;
  }

  async getDefaultAutoResponse(userId: string, type: string): Promise<AutoResponse | undefined> {
    const [result] = await db
      .select()
      .from(schema.autoResponses)
      .where(
        and(
          eq(schema.autoResponses.userId, userId),
          eq(schema.autoResponses.type, type as any),
          eq(schema.autoResponses.isDefault, true)
        )
      );
    return result;
  }

  async createAutoResponse(response: InsertAutoResponse): Promise<AutoResponse> {
    // If this is set as default, unset any existing defaults for this type
    if (response.isDefault) {
      await db
        .update(schema.autoResponses)
        .set({ 
          isDefault: false,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(schema.autoResponses.userId, response.userId),
            eq(schema.autoResponses.type, response.type as any),
            eq(schema.autoResponses.isDefault, true)
          )
        );
    }

    const [result] = await db
      .insert(schema.autoResponses)
      .values({
        ...response,
        createdAt: new Date(),
        updatedAt: new Date()
      })
      .returning();
    
    return result;
  }

  async updateAutoResponse(id: number, response: Partial<InsertAutoResponse>): Promise<AutoResponse | undefined> {
    // If setting this as default, get the current response first
    const [existingResponse] = await db
      .select()
      .from(schema.autoResponses)
      .where(eq(schema.autoResponses.id, id));
    
    if (!existingResponse) return undefined;
    
    // If setting this as default, unset any other defaults of the same type
    if (response.isDefault && !existingResponse.isDefault) {
      await db
        .update(schema.autoResponses)
        .set({ 
          isDefault: false,
          updatedAt: new Date()
        })
        .where(
          and(
            eq(schema.autoResponses.userId, existingResponse.userId),
            eq(schema.autoResponses.type, existingResponse.type),
            eq(schema.autoResponses.isDefault, true),
            sql`id != ${id}`
          )
        );
    }

    const [result] = await db
      .update(schema.autoResponses)
      .set({
        ...response,
        updatedAt: new Date()
      })
      .where(eq(schema.autoResponses.id, id))
      .returning();
    
    return result;
  }

  async deleteAutoResponse(id: number): Promise<boolean> {
    const result = await db
      .delete(schema.autoResponses)
      .where(eq(schema.autoResponses.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
}