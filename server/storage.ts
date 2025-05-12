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
  ProjectStatus,
  TaskStatus,
  TaskPriority,
  InvoiceStatus,
  ServiceProvider,
  InsertServiceProvider,
  Service,
  InsertService,
  Event,
  InsertEvent,
  EventTemplate,
  InsertEventTemplate,
  EventType
} from "@shared/schema";

export interface IStorage {
  // User related operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Client related operations
  getClients(): Promise<Client[]>;
  getClient(id: number): Promise<Client | undefined>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;

  // Project related operations
  getProjects(): Promise<Project[]>;
  getProjectsByClient(clientId: number): Promise<Project[]>;
  getProject(id: number): Promise<Project | undefined>;
  createProject(project: InsertProject): Promise<Project>;
  updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined>;
  deleteProject(id: number): Promise<boolean>;

  // Task related operations
  getTasks(): Promise<Task[]>;
  getTasksByProject(projectId: number): Promise<Task[]>;
  getTask(id: number): Promise<Task | undefined>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // TimeEntry related operations
  getTimeEntries(): Promise<TimeEntry[]>;
  getTimeEntriesByProject(projectId: number): Promise<TimeEntry[]>;
  getTimeEntriesByTask(taskId: number): Promise<TimeEntry[]>;
  getTimeEntry(id: number): Promise<TimeEntry | undefined>;
  createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry>;
  updateTimeEntry(id: number, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined>;
  deleteTimeEntry(id: number): Promise<boolean>;

  // Invoice related operations
  getInvoices(): Promise<Invoice[]>;
  getInvoicesByClient(clientId: number): Promise<Invoice[]>;
  getInvoice(id: number): Promise<Invoice | undefined>;
  createInvoice(invoice: InsertInvoice): Promise<Invoice>;
  updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined>;
  deleteInvoice(id: number): Promise<boolean>;

  // InvoiceItem related operations
  getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]>;
  getInvoiceItem(id: number): Promise<InvoiceItem | undefined>;
  createInvoiceItem(invoiceItem: InsertInvoiceItem): Promise<InvoiceItem>;
  updateInvoiceItem(id: number, invoiceItem: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined>;
  deleteInvoiceItem(id: number): Promise<boolean>;
  
  // ServiceProvider related operations
  getServiceProviders(): Promise<ServiceProvider[]>;
  getServiceProvider(id: number): Promise<ServiceProvider | undefined>;
  getServiceProviderByEmail(email: string): Promise<ServiceProvider | undefined>;
  createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider>;
  updateServiceProvider(id: number, provider: Partial<InsertServiceProvider>): Promise<ServiceProvider | undefined>;
  deleteServiceProvider(id: number): Promise<boolean>;
  
  // Service related operations
  getServices(): Promise<Service[]>;
  getServicesByProvider(providerId: number): Promise<Service[]>;
  getService(id: number): Promise<Service | undefined>;
  createService(service: InsertService): Promise<Service>;
  updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined>;
  deleteService(id: number): Promise<boolean>;
  
  // Calendar Event operations
  getEvents(userId: string): Promise<Event[]>;
  getEvent(id: number): Promise<Event | undefined>;
  createEvent(event: InsertEvent): Promise<Event>;
  updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined>;
  deleteEvent(id: number): Promise<boolean>;
  
  // Event Template operations
  getEventTemplates(userId: string): Promise<EventTemplate[]>;
  getPublicEventTemplates(userId: string): Promise<EventTemplate[]>;
  getEventTemplate(id: number): Promise<EventTemplate | undefined>;
  createEventTemplate(template: InsertEventTemplate): Promise<EventTemplate>;
  updateEventTemplate(id: number, template: Partial<InsertEventTemplate>): Promise<EventTemplate | undefined>;
  deleteEventTemplate(id: number): Promise<boolean>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private clients: Map<number, Client>;
  private projects: Map<number, Project>;
  private tasks: Map<number, Task>;
  private timeEntries: Map<number, TimeEntry>;
  private invoices: Map<number, Invoice>;
  private invoiceItems: Map<number, InvoiceItem>;
  private events: Map<number, Event>;
  private eventTemplates: Map<number, EventTemplate>;
  private serviceProviders: Map<number, ServiceProvider>;
  private services: Map<number, Service>;

  private userIdCounter: number;
  private clientIdCounter: number;
  private projectIdCounter: number;
  private taskIdCounter: number;
  private timeEntryIdCounter: number;
  private invoiceIdCounter: number;
  private invoiceItemIdCounter: number;
  private eventIdCounter: number;
  private eventTemplateIdCounter: number;
  private serviceProviderIdCounter: number;
  private serviceIdCounter: number;

  constructor() {
    this.users = new Map();
    this.clients = new Map();
    this.projects = new Map();
    this.tasks = new Map();
    this.timeEntries = new Map();
    this.invoices = new Map();
    this.invoiceItems = new Map();
    this.events = new Map();
    this.eventTemplates = new Map();
    this.serviceProviders = new Map();
    this.services = new Map();

    this.userIdCounter = 1;
    this.clientIdCounter = 1;
    this.projectIdCounter = 1;
    this.taskIdCounter = 1;
    this.timeEntryIdCounter = 1;
    this.invoiceIdCounter = 1;
    this.invoiceItemIdCounter = 1;
    this.eventIdCounter = 1;
    this.eventTemplateIdCounter = 1;
    this.serviceProviderIdCounter = 1;
    this.serviceIdCounter = 1;

    // Add a demo user
    this.createUser({
      username: "demo",
      password: "password",
      name: "Alex Johnson",
      email: "alex@example.com",
      avatarUrl: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
    });

    // Add some demo clients
    const acmeClient = this.createClient({
      name: "Acme Corp",
      email: "contact@acmecorp.com",
      phone: "555-123-4567",
      company: "Acme Corporation",
      address: "123 Main St, Suite 400, San Francisco, CA 94105"
    });

    const techStartClient = this.createClient({
      name: "TechStart Inc",
      email: "info@techstart.io",
      phone: "555-987-6543",
      company: "TechStart Inc",
      address: "456 Innovation Way, Palo Alto, CA 94301"
    });

    const greenLifeClient = this.createClient({
      name: "GreenLife",
      email: "support@greenlife.org",
      phone: "555-333-2222",
      company: "GreenLife Organic Foods",
      address: "789 Eco Blvd, Portland, OR 97205"
    });

    // Add some demo projects
    const websiteRedesign = this.createProject({
      name: "Website Redesign",
      description: "Complete overhaul of corporate website with new branding",
      clientId: acmeClient.id,
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date("2023-05-01T00:00:00Z"),
      endDate: new Date("2023-05-25T00:00:00Z"),
      budget: 12000
    });

    const mobileApp = this.createProject({
      name: "Mobile App Development",
      description: "iOS and Android app for customer loyalty program",
      clientId: techStartClient.id,
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date("2023-04-15T00:00:00Z"),
      endDate: new Date("2023-06-10T00:00:00Z"),
      budget: 25000
    });

    const brandIdentity = this.createProject({
      name: "Brand Identity",
      description: "New logo design and brand guidelines",
      clientId: greenLifeClient.id,
      status: ProjectStatus.IN_PROGRESS,
      startDate: new Date("2023-05-05T00:00:00Z"),
      endDate: new Date("2023-05-18T00:00:00Z"),
      budget: 5000
    });

    // Add some demo tasks
    this.createTask({
      title: "Create wireframes for homepage",
      description: "Design wireframes for the new homepage layout",
      projectId: websiteRedesign.id,
      status: TaskStatus.TO_DO,
      priority: TaskPriority.HIGH,
      deadline: new Date("2023-05-18T00:00:00Z"),
      completed: false
    });

    this.createTask({
      title: "Review client feedback on logo designs",
      description: "Go through client comments and make necessary revisions",
      projectId: brandIdentity.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.URGENT,
      deadline: new Date("2023-05-16T00:00:00Z"),
      completed: false
    });

    this.createTask({
      title: "Implement user authentication flow",
      description: "Create login, registration, and password reset functionality",
      projectId: mobileApp.id,
      status: TaskStatus.IN_PROGRESS,
      priority: TaskPriority.MEDIUM,
      deadline: new Date("2023-05-20T00:00:00Z"),
      completed: false
    });

    this.createTask({
      title: "Prepare project proposal",
      description: "Create project proposal document for client approval",
      projectId: websiteRedesign.id,
      status: TaskStatus.COMPLETED,
      priority: TaskPriority.HIGH,
      deadline: new Date("2023-05-10T00:00:00Z"),
      completed: true
    });

    // Add some time entries
    const now = new Date();
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    
    this.createTimeEntry({
      projectId: websiteRedesign.id,
      taskId: 1,
      description: "Homepage Layout",
      startTime: new Date(now.setHours(9, 30, 0, 0)),
      endTime: new Date(now.setHours(11, 0, 0, 0)),
      duration: 90 // 90 minutes
    });

    this.createTimeEntry({
      projectId: mobileApp.id,
      taskId: 3,
      description: "User Authentication",
      startTime: new Date(now.setHours(12, 30, 0, 0)),
      endTime: new Date(now.setHours(14, 45, 0, 0)),
      duration: 135 // 135 minutes
    });

    // Add some invoices
    const acmeInvoice = this.createInvoice({
      invoiceNumber: "INV-2023-001",
      clientId: acmeClient.id,
      issueDate: new Date("2023-05-10T00:00:00Z"),
      dueDate: new Date("2023-05-24T00:00:00Z"),
      amount: 4500,
      status: InvoiceStatus.PAID,
      notes: "Website development first milestone"
    });

    const techStartInvoice = this.createInvoice({
      invoiceNumber: "INV-2023-002",
      clientId: techStartClient.id,
      issueDate: new Date("2023-05-05T00:00:00Z"),
      dueDate: new Date("2023-05-19T00:00:00Z"),
      amount: 2800,
      status: InvoiceStatus.SENT,
      notes: "Mobile app development first milestone"
    });

    const greenLifeInvoice = this.createInvoice({
      invoiceNumber: "INV-2023-003",
      clientId: greenLifeClient.id,
      issueDate: new Date("2023-04-25T00:00:00Z"),
      dueDate: new Date("2023-05-09T00:00:00Z"),
      amount: 1200,
      status: InvoiceStatus.OVERDUE,
      notes: "Logo design initial concepts"
    });

    // Add invoice items
    this.createInvoiceItem({
      invoiceId: acmeInvoice.id,
      description: "Website Design",
      quantity: 1,
      rate: 3000,
      amount: 3000
    });

    this.createInvoiceItem({
      invoiceId: acmeInvoice.id,
      description: "Content Strategy",
      quantity: 10,
      rate: 150,
      amount: 1500
    });

    this.createInvoiceItem({
      invoiceId: techStartInvoice.id,
      description: "Mobile App Development",
      quantity: 20,
      rate: 140,
      amount: 2800
    });

    this.createInvoiceItem({
      invoiceId: greenLifeInvoice.id,
      description: "Logo Design Concepts",
      quantity: 1,
      rate: 1200,
      amount: 1200
    });
  }

  // User related methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const createdAt = new Date();
    const user: User = { id, ...insertUser };
    this.users.set(id, user);
    return user;
  }

  // Client related methods
  async getClients(): Promise<Client[]> {
    return Array.from(this.clients.values());
  }

  async getClient(id: number): Promise<Client | undefined> {
    return this.clients.get(id);
  }

  async createClient(client: InsertClient): Promise<Client> {
    const id = this.clientIdCounter++;
    const createdAt = new Date();
    const newClient: Client = { id, ...client, createdAt };
    this.clients.set(id, newClient);
    return newClient;
  }

  async updateClient(id: number, client: Partial<InsertClient>): Promise<Client | undefined> {
    const existingClient = this.clients.get(id);
    if (!existingClient) return undefined;

    const updatedClient = { ...existingClient, ...client };
    this.clients.set(id, updatedClient);
    return updatedClient;
  }

  async deleteClient(id: number): Promise<boolean> {
    return this.clients.delete(id);
  }

  // Project related methods
  async getProjects(): Promise<Project[]> {
    return Array.from(this.projects.values());
  }

  async getProjectsByClient(clientId: number): Promise<Project[]> {
    return Array.from(this.projects.values()).filter(
      (project) => project.clientId === clientId
    );
  }

  async getProject(id: number): Promise<Project | undefined> {
    return this.projects.get(id);
  }

  async createProject(project: InsertProject): Promise<Project> {
    const id = this.projectIdCounter++;
    const createdAt = new Date();
    const newProject: Project = { id, ...project, createdAt };
    this.projects.set(id, newProject);
    return newProject;
  }

  async updateProject(id: number, project: Partial<InsertProject>): Promise<Project | undefined> {
    const existingProject = this.projects.get(id);
    if (!existingProject) return undefined;

    const updatedProject = { ...existingProject, ...project };
    this.projects.set(id, updatedProject);
    return updatedProject;
  }

  async deleteProject(id: number): Promise<boolean> {
    return this.projects.delete(id);
  }

  // Task related methods
  async getTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getTasksByProject(projectId: number): Promise<Task[]> {
    return Array.from(this.tasks.values()).filter(
      (task) => task.projectId === projectId
    );
  }

  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const createdAt = new Date();
    const newTask: Task = { id, ...task, createdAt };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, task: Partial<InsertTask>): Promise<Task | undefined> {
    const existingTask = this.tasks.get(id);
    if (!existingTask) return undefined;

    const updatedTask = { ...existingTask, ...task };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // TimeEntry related methods
  async getTimeEntries(): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values());
  }

  async getTimeEntriesByProject(projectId: number): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values()).filter(
      (entry) => entry.projectId === projectId
    );
  }

  async getTimeEntriesByTask(taskId: number): Promise<TimeEntry[]> {
    return Array.from(this.timeEntries.values()).filter(
      (entry) => entry.taskId === taskId
    );
  }

  async getTimeEntry(id: number): Promise<TimeEntry | undefined> {
    return this.timeEntries.get(id);
  }

  async createTimeEntry(timeEntry: InsertTimeEntry): Promise<TimeEntry> {
    const id = this.timeEntryIdCounter++;
    const createdAt = new Date();
    const newTimeEntry: TimeEntry = { id, ...timeEntry, createdAt };
    this.timeEntries.set(id, newTimeEntry);
    return newTimeEntry;
  }

  async updateTimeEntry(id: number, timeEntry: Partial<InsertTimeEntry>): Promise<TimeEntry | undefined> {
    const existingTimeEntry = this.timeEntries.get(id);
    if (!existingTimeEntry) return undefined;

    const updatedTimeEntry = { ...existingTimeEntry, ...timeEntry };
    this.timeEntries.set(id, updatedTimeEntry);
    return updatedTimeEntry;
  }

  async deleteTimeEntry(id: number): Promise<boolean> {
    return this.timeEntries.delete(id);
  }

  // Invoice related methods
  async getInvoices(): Promise<Invoice[]> {
    return Array.from(this.invoices.values());
  }

  async getInvoicesByClient(clientId: number): Promise<Invoice[]> {
    return Array.from(this.invoices.values()).filter(
      (invoice) => invoice.clientId === clientId
    );
  }

  async getInvoice(id: number): Promise<Invoice | undefined> {
    return this.invoices.get(id);
  }

  async createInvoice(invoice: InsertInvoice): Promise<Invoice> {
    const id = this.invoiceIdCounter++;
    const createdAt = new Date();
    const newInvoice: Invoice = { id, ...invoice, createdAt };
    this.invoices.set(id, newInvoice);
    return newInvoice;
  }

  async updateInvoice(id: number, invoice: Partial<InsertInvoice>): Promise<Invoice | undefined> {
    const existingInvoice = this.invoices.get(id);
    if (!existingInvoice) return undefined;

    const updatedInvoice = { ...existingInvoice, ...invoice };
    this.invoices.set(id, updatedInvoice);
    return updatedInvoice;
  }

  async deleteInvoice(id: number): Promise<boolean> {
    return this.invoices.delete(id);
  }

  // InvoiceItem related methods
  async getInvoiceItems(invoiceId: number): Promise<InvoiceItem[]> {
    return Array.from(this.invoiceItems.values()).filter(
      (item) => item.invoiceId === invoiceId
    );
  }

  async getInvoiceItem(id: number): Promise<InvoiceItem | undefined> {
    return this.invoiceItems.get(id);
  }

  async createInvoiceItem(invoiceItem: InsertInvoiceItem): Promise<InvoiceItem> {
    const id = this.invoiceItemIdCounter++;
    const newInvoiceItem: InvoiceItem = { id, ...invoiceItem };
    this.invoiceItems.set(id, newInvoiceItem);
    return newInvoiceItem;
  }

  async updateInvoiceItem(id: number, invoiceItem: Partial<InsertInvoiceItem>): Promise<InvoiceItem | undefined> {
    const existingInvoiceItem = this.invoiceItems.get(id);
    if (!existingInvoiceItem) return undefined;

    const updatedInvoiceItem = { ...existingInvoiceItem, ...invoiceItem };
    this.invoiceItems.set(id, updatedInvoiceItem);
    return updatedInvoiceItem;
  }

  async deleteInvoiceItem(id: number): Promise<boolean> {
    return this.invoiceItems.delete(id);
  }
  
  // Implementation of calendar event operations
  async getEvents(userId: string): Promise<Event[]> {
    return Array.from(this.events.values()).filter(event => event.userId === userId);
  }
  
  async getEvent(id: number): Promise<Event | undefined> {
    return this.events.get(id);
  }
  
  async createEvent(event: InsertEvent): Promise<Event> {
    const id = this.eventIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    const newEvent: Event = { 
      id, 
      ...event, 
      createdAt, 
      updatedAt 
    };
    this.events.set(id, newEvent);
    return newEvent;
  }
  
  async updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined> {
    const existingEvent = this.events.get(id);
    if (!existingEvent) {
      return undefined;
    }
    
    const updatedAt = new Date();
    const updatedEvent = { 
      ...existingEvent, 
      ...event, 
      updatedAt 
    };
    this.events.set(id, updatedEvent);
    return updatedEvent;
  }
  
  async deleteEvent(id: number): Promise<boolean> {
    return this.events.delete(id);
  }
  
  // Event Template operations
  async getEventTemplates(userId: string): Promise<EventTemplate[]> {
    return Array.from(this.eventTemplates.values()).filter(
      template => template.userId === userId
    );
  }
  
  async getPublicEventTemplates(userId: string): Promise<EventTemplate[]> {
    return Array.from(this.eventTemplates.values()).filter(
      template => template.userId === userId && template.isPublic
    );
  }
  
  async getEventTemplate(id: number): Promise<EventTemplate | undefined> {
    return this.eventTemplates.get(id);
  }
  
  async createEventTemplate(template: InsertEventTemplate): Promise<EventTemplate> {
    const id = this.eventTemplateIdCounter++;
    const createdAt = new Date();
    const updatedAt = new Date();
    
    const newTemplate: EventTemplate = {
      id,
      createdAt,
      updatedAt,
      ...template
    };
    
    this.eventTemplates.set(id, newTemplate);
    return newTemplate;
  }
  
  async updateEventTemplate(id: number, template: Partial<InsertEventTemplate>): Promise<EventTemplate | undefined> {
    const existingTemplate = this.eventTemplates.get(id);
    
    if (!existingTemplate) {
      return undefined;
    }
    
    const updatedTemplate: EventTemplate = {
      ...existingTemplate,
      ...template,
      updatedAt: new Date()
    };
    
    this.eventTemplates.set(id, updatedTemplate);
    return updatedTemplate;
  }
  
  async deleteEventTemplate(id: number): Promise<boolean> {
    if (!this.eventTemplates.has(id)) {
      return false;
    }
    
    this.eventTemplates.delete(id);
    return true;
  }
  
  // ServiceProvider operations
  async getServiceProviders(): Promise<ServiceProvider[]> {
    return Array.from(this.serviceProviders.values());
  }
  
  async getServiceProvider(id: number): Promise<ServiceProvider | undefined> {
    return this.serviceProviders.get(id);
  }
  
  async getServiceProviderByEmail(email: string): Promise<ServiceProvider | undefined> {
    return Array.from(this.serviceProviders.values()).find(
      provider => provider.email === email
    );
  }
  
  async createServiceProvider(provider: InsertServiceProvider): Promise<ServiceProvider> {
    const id = this.serviceProviderIdCounter++;
    const createdAt = new Date();
    const newProvider: ServiceProvider = { id, ...provider, createdAt };
    this.serviceProviders.set(id, newProvider);
    return newProvider;
  }
  
  async updateServiceProvider(id: number, provider: Partial<InsertServiceProvider>): Promise<ServiceProvider | undefined> {
    const existingProvider = this.serviceProviders.get(id);
    if (!existingProvider) {
      return undefined;
    }
    
    const updatedProvider = { ...existingProvider, ...provider };
    this.serviceProviders.set(id, updatedProvider);
    return updatedProvider;
  }
  
  async deleteServiceProvider(id: number): Promise<boolean> {
    return this.serviceProviders.delete(id);
  }
  
  // Service operations
  async getServices(): Promise<Service[]> {
    return Array.from(this.services.values());
  }
  
  async getServicesByProvider(providerId: number): Promise<Service[]> {
    return Array.from(this.services.values()).filter(
      service => service.providerId === providerId
    );
  }
  
  async getService(id: number): Promise<Service | undefined> {
    return this.services.get(id);
  }
  
  async createService(service: InsertService): Promise<Service> {
    const id = this.serviceIdCounter++;
    const createdAt = new Date();
    const newService: Service = { id, ...service, createdAt };
    this.services.set(id, newService);
    return newService;
  }
  
  async updateService(id: number, service: Partial<InsertService>): Promise<Service | undefined> {
    const existingService = this.services.get(id);
    if (!existingService) {
      return undefined;
    }
    
    const updatedService = { ...existingService, ...service };
    this.services.set(id, updatedService);
    return updatedService;
  }
  
  async deleteService(id: number): Promise<boolean> {
    return this.services.delete(id);
  }
}

export const storage = new MemStorage();
