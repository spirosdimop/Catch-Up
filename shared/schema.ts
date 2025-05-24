import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// User schema
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  avatarUrl: text("avatar_url"),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  avatarUrl: true,
});

// Client schema
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  company: text("company"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertClientSchema = createInsertSchema(clients).pick({
  name: true,
  email: true,
  phone: true,
  company: true,
  address: true,
});

// Project status enum
export const projectStatusEnum = pgEnum("project_status", [
  "not_started",
  "in_progress",
  "on_hold",
  "completed",
]);

// Project schema
export const projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  clientId: integer("client_id").notNull(),
  status: projectStatusEnum("status").notNull().default("not_started"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  budget: doublePrecision("budget"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertProjectSchema = createInsertSchema(projects)
  .pick({
    name: true,
    description: true,
    clientId: true,
    status: true,
    startDate: true,
    endDate: true,
    budget: true,
  })
  .transform((data) => {
    // Convert string dates to Date objects for the database
    // Using explicit TypeScript typings for clarity
    const parseDate = (date: Date | string | null | undefined): Date | null => {
      if (!date) return null;
      
      // If it's already a Date object, return it directly
      if (date instanceof Date) {
        return isNaN(date.getTime()) ? null : date;
      }
      
      // If it's a string, attempt to parse it
      if (typeof date === 'string') {
        try {
          const parsedDate = new Date(date);
          return isNaN(parsedDate.getTime()) ? null : parsedDate;
        } catch (e) {
          console.error("Failed to parse date:", e);
          return null;
        }
      }
      
      // If we get here, it's an invalid format
      return null;
    };

    // Transform the data with our parsed dates
    return {
      ...data,
      name: data.name,
      clientId: data.clientId,
      description: data.description ?? null,
      status: data.status,
      startDate: parseDate(data.startDate),
      endDate: parseDate(data.endDate),
      budget: data.budget ?? null,
    };
  });

// Task status enum
export const taskStatusEnum = pgEnum("task_status", [
  "to_do",
  "in_progress",
  "review",
  "completed",
]);

// Task priority enum
export const taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent",
]);

// Task schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  projectId: integer("project_id").notNull(),
  status: taskStatusEnum("status").notNull().default("to_do"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  deadline: timestamp("deadline"),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTaskSchema = createInsertSchema(tasks)
  .pick({
    title: true,
    description: true,
    projectId: true,
    status: true,
    priority: true,
    deadline: true,
    completed: true,
  })
  .transform((data) => {
    // Convert string dates to Date objects for the database
    return {
      ...data,
      deadline: data.deadline ? new Date(data.deadline) : null,
    };
  });

// Time entry schema
export const timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  taskId: integer("task_id"),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"), // duration in minutes
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertTimeEntrySchema = createInsertSchema(timeEntries).pick({
  projectId: true,
  taskId: true,
  description: true,
  startTime: true,
  endTime: true,
  duration: true,
});

// Invoice status enum
export const invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "overdue",
  "canceled",
]);

// Invoice schema
export const invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull(),
  clientId: integer("client_id").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  amount: doublePrecision("amount").notNull(),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertInvoiceSchema = createInsertSchema(invoices).pick({
  invoiceNumber: true,
  clientId: true,
  issueDate: true,
  dueDate: true,
  amount: true,
  status: true,
  notes: true,
});

// Invoice items schema
export const invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  description: text("description").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  rate: doublePrecision("rate").notNull(),
  amount: doublePrecision("amount").notNull(),
});

export const insertInvoiceItemSchema = createInsertSchema(invoiceItems).pick({
  invoiceId: true,
  description: true,
  quantity: true,
  rate: true,
  amount: true,
});

// Booking status enum
export const bookingStatusEnum = pgEnum("booking_status", [
  "confirmed",
  "rescheduled",
  "canceled",
  "emergency",
]);

// Booking type enum
export const bookingTypeEnum = pgEnum("booking_type", [
  "meeting",
  "consultation",
  "appointment",
  "follow_up",
  "check_in"
]);

// Bookings schema
export const bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  duration: integer("duration"),
  type: bookingTypeEnum("type").notNull().default("meeting"),
  status: bookingStatusEnum("status").notNull().default("confirmed"),
  location: text("location"),
  notes: text("notes"),
  clientId: integer("client_id").notNull().references(() => clients.id), // Required reference to clients table
  serviceId: text("service_id").notNull(),
  priority: text("priority").default("normal"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  externalId: text("external_id").notNull(), // Client-side ID
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone").notNull(),
  serviceName: text("service_name"),
  servicePrice: text("service_price"),
  professionalId: text("professional_id").notNull(), // Points to a user
});

export const insertBookingSchema = createInsertSchema(bookings).pick({
  externalId: true,
  clientName: true,
  clientPhone: true,
  serviceName: true,
  servicePrice: true,
  date: true,
  time: true,
  duration: true,
  type: true,
  location: true,
  notes: true,
  status: true,
  clientId: true,
  serviceId: true,
  priority: true,
  professionalId: true,
}).extend({
  // Make some fields optional for flexibility
  duration: z.number().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  serviceName: z.string().optional(),
  servicePrice: z.string().optional(),
  priority: z.string().optional(),
});

// Type exports
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Client = typeof clients.$inferSelect;
export type InsertClient = z.infer<typeof insertClientSchema>;

export type Project = typeof projects.$inferSelect;
export type InsertProject = z.infer<typeof insertProjectSchema>;

export type Task = typeof tasks.$inferSelect;
export type InsertTask = z.infer<typeof insertTaskSchema>;

export type TimeEntry = typeof timeEntries.$inferSelect;
export type InsertTimeEntry = z.infer<typeof insertTimeEntrySchema>;

export type Invoice = typeof invoices.$inferSelect;
export type InsertInvoice = z.infer<typeof insertInvoiceSchema>;

export type InvoiceItem = typeof invoiceItems.$inferSelect;
export type InsertInvoiceItem = z.infer<typeof insertInvoiceItemSchema>;

export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

// Sign-up related schemas
export const locationTypeEnum = pgEnum("location_type", [
  "has_shop",
  "goes_to_clients",
  "both"
]);

// Service location type enum
export const serviceLocationTypeEnum = pgEnum("service_location_type", [
  "office",
  "client_location",
  "online"
]);

export const professionEnum = pgEnum("profession", [
  "electrician",
  "plumber",
  "tutor",
  "trainer",
  "carpenter",
  "painter",
  "gardener",
  "cleaner",
  "other"
]);

export const serviceProviders = pgTable("service_providers", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone").notNull(),
  businessName: text("business_name").notNull(),
  profession: professionEnum("profession").notNull(),
  locationType: locationTypeEnum("location_type").notNull(),
  serviceArea: text("service_area"),
  profileImage: text("profile_image"),
  voicemailMessage: text("voicemail_message"),
  smsFollowUpMessage: text("sms_followup_message"),
  availabilityHours: text("availability_hours"), // JSON string with availability hours
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => serviceProviders.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // in minutes
  price: doublePrecision("price").notNull(), // in EUR
  locationType: serviceLocationTypeEnum("service_location_type").default("office").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertServiceProviderSchema = createInsertSchema(serviceProviders).pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  businessName: true,
  profession: true,
  locationType: true,
  serviceArea: true,
  profileImage: true,
  voicemailMessage: true,
  smsFollowUpMessage: true,
  availabilityHours: true,
});

export const insertServiceSchema = createInsertSchema(services).pick({
  providerId: true,
  name: true,
  description: true,
  duration: true,
  price: true,
  locationType: true,
});

export type ServiceProvider = typeof serviceProviders.$inferSelect;
export type InsertServiceProvider = z.infer<typeof insertServiceProviderSchema>;

export type Service = typeof services.$inferSelect;
export type InsertService = z.infer<typeof insertServiceSchema>;

// Location type constants
export const LocationType = {
  HAS_SHOP: 'has_shop',
  GOES_TO_CLIENTS: 'goes_to_clients',
  BOTH: 'both'
} as const;

// Service location type constants
export const ServiceLocationType = {
  OFFICE: 'office',
  CLIENT_LOCATION: 'client_location',
  ONLINE: 'online'
} as const;

// Helper enums for frontend
export const ProjectStatus = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  ON_HOLD: 'on_hold',
  COMPLETED: 'completed'
} as const;

export const TaskStatus = {
  TO_DO: 'to_do',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  COMPLETED: 'completed'
} as const;

export const TaskPriority = {
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  URGENT: 'urgent'
} as const;

export const InvoiceStatus = {
  DRAFT: 'draft',
  SENT: 'sent',
  PAID: 'paid',
  OVERDUE: 'overdue',
  CANCELED: 'canceled'
} as const;

export const BookingStatus = {
  PENDING: 'pending',
  ACCEPTED: 'accepted',
  DECLINED: 'declined',
  RESCHEDULED: 'rescheduled'
} as const;

// Calendar event type enum
export const eventTypeEnum = pgEnum("event_type", [
  "private",
  "busy",
  "available",
  "travel",
  "client_meeting",
  "consultation",
  "project_work",
  "follow_up",
  "training"
]);

// Event templates schema
export const eventTemplates = pgTable("event_templates", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Using string for userId to support Replit Auth
  name: text("name").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(), // Duration in minutes
  location: text("location"),
  eventType: eventTypeEnum("event_type").default("busy").notNull(),
  color: text("color"),
  isPublic: boolean("is_public").default(true).notNull(), // Whether this template is available for public booking
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Calendar events schema
export const events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Using string for userId to support Replit Auth
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: text("location"),
  clientName: text("client_name"),
  clientId: integer("client_id").references(() => clients.id), // Reference to client
  projectId: integer("project_id").references(() => projects.id), // Reference to project
  invoiceId: integer("invoice_id").references(() => invoices.id), // Reference to invoice
  isConfirmed: boolean("is_confirmed").default(false).notNull(),
  eventType: eventTypeEnum("event_type").default("busy").notNull(),
  templateId: integer("template_id").references(() => eventTemplates.id), // Reference to template
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEventTemplateSchema = createInsertSchema(eventTemplates).pick({
  userId: true,
  name: true,
  title: true,
  description: true,
  duration: true,
  location: true,
  eventType: true,
  color: true,
  isPublic: true,
});

export const insertEventSchema = createInsertSchema(events).pick({
  userId: true,
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  location: true,
  clientName: true,
  clientId: true,
  projectId: true,
  invoiceId: true,
  isConfirmed: true,
  eventType: true,
  templateId: true,
  color: true,
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

export type EventTemplate = typeof eventTemplates.$inferSelect;
export type InsertEventTemplate = z.infer<typeof insertEventTemplateSchema>;

// Helper enum for frontend
export const EventType = {
  PRIVATE: 'private',
  BUSY: 'busy',
  AVAILABLE: 'available',
  TRAVEL: 'travel',
  CLIENT_MEETING: 'client_meeting',
  CONSULTATION: 'consultation',
  PROJECT_WORK: 'project_work',
  FOLLOW_UP: 'follow_up',
  TRAINING: 'training'
} as const;

// Message type enum
export const messageTypeEnum = pgEnum("message_type", [
  "general",
  "missed_call",
  "reschedule", 
  "cancellation", 
  "confirmation", 
  "emergency"
]);

// AI command type enum
export const aiCommandTypeEnum = pgEnum("ai_command_type", [
  "general",
  "scheduling",
  "settings",
  "autoresponse",
  "unified"
]);

// AI command status enum
export const aiCommandStatusEnum = pgEnum("ai_command_status", [
  "success",
  "needs_clarification",
  "error"
]);

// AI Command History
export const aiCommands = pgTable("ai_commands", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Using string for userId to support Replit Auth
  commandType: aiCommandTypeEnum("command_type").default("unified").notNull(),
  userPrompt: text("user_prompt").notNull(),
  status: aiCommandStatusEnum("status").default("success").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// AI command effects to track changes made by the AI
export const aiCommandEffects = pgTable("ai_command_effects", {
  id: serial("id").primaryKey(),
  commandId: integer("command_id").notNull().references(() => aiCommands.id, { onDelete: "cascade" }),
  effectType: text("effect_type").notNull(), // "create_event", "update_settings", "generate_message", etc.
  targetType: text("target_type").notNull(), // "event", "settings", "auto_response", etc.
  targetId: text("target_id"), // ID of the affected entity if applicable
  details: text("details").notNull(), // JSON stringified details of what was changed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Export schemas and types
export const insertAiCommandSchema = createInsertSchema(aiCommands).pick({
  userId: true,
  commandType: true,
  userPrompt: true,
  status: true,
});

export const insertAiCommandEffectSchema = createInsertSchema(aiCommandEffects).pick({
  commandId: true,
  effectType: true,
  targetType: true,
  targetId: true,
  details: true,
});

export type AiCommand = typeof aiCommands.$inferSelect;
export type InsertAiCommand = z.infer<typeof insertAiCommandSchema>;

export type AiCommandEffect = typeof aiCommandEffects.$inferSelect;
export type InsertAiCommandEffect = z.infer<typeof insertAiCommandEffectSchema>;

// User Navigation Tracking
export const navigationEvents = pgTable("navigation_events", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  path: text("path").notNull(),
  fromPath: text("from_path"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  sessionId: text("session_id").notNull(),
  timeOnPage: integer("time_on_page"),
  clickedElements: text("clicked_elements"), // JSON string with array of clicked elements
});

export const insertNavigationEventSchema = createInsertSchema(navigationEvents).pick({
  userId: true,
  path: true,
  fromPath: true,
  sessionId: true,
  timeOnPage: true,
  clickedElements: true,
});

export type NavigationEvent = typeof navigationEvents.$inferSelect;
export type InsertNavigationEvent = z.infer<typeof insertNavigationEventSchema>;

// User Preferences
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  theme: text("theme").default("system"),
  dateFormat: text("date_format").default("MM/dd/yyyy"),
  timeFormat: text("time_format").default("hh:mm a"),
  defaultView: text("default_view").default("month"), // week, day, month
  startOfWeek: integer("start_of_week").default(0), // 0=Sunday, 1=Monday
  notifications: boolean("notifications").default(true),
  language: text("language").default("en"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  theme: true,
  dateFormat: true,
  timeFormat: true,
  defaultView: true,
  startOfWeek: true,
  notifications: true,
  language: true,
});

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

// Auto responses for messaging
export const autoResponses = pgTable("auto_responses", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  type: messageTypeEnum("type").notNull(),
  content: text("content").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});

export const insertAutoResponseSchema = createInsertSchema(autoResponses).pick({
  userId: true,
  name: true,
  type: true,
  content: true,
  isDefault: true,
});

export type AutoResponse = typeof autoResponses.$inferSelect;
export type InsertAutoResponse = z.infer<typeof insertAutoResponseSchema>;

// Set up relations between schemas
export const usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  eventTemplates: many(eventTemplates),
  bookings: many(bookings),
  autoResponses: many(autoResponses),
  userPreferences: many(userPreferences),
}));

export const clientsRelations = relations(clients, ({ many }) => ({
  projects: many(projects),
  invoices: many(invoices),
  events: many(events),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id],
  }),
  tasks: many(tasks),
  timeEntries: many(timeEntries),
  events: many(events),
}));

export const tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id],
  }),
  timeEntries: many(timeEntries),
}));

export const timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  project: one(projects, {
    fields: [timeEntries.projectId],
    references: [projects.id],
  }),
  task: one(tasks, {
    fields: [timeEntries.taskId],
    references: [tasks.id],
  }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id],
  }),
  events: many(events),
  invoiceItems: many(invoiceItems),
}));

export const invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id],
  }),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  professional: one(users, {
    fields: [bookings.professionalId],
    references: [users.id],
  }),
}));

export const eventsRelations = relations(events, ({ one }) => ({
  client: one(clients, {
    fields: [events.clientId],
    references: [clients.id],
  }),
  project: one(projects, {
    fields: [events.projectId],
    references: [projects.id],
  }),
  invoice: one(invoices, {
    fields: [events.invoiceId],
    references: [invoices.id],
  }),
  template: one(eventTemplates, {
    fields: [events.templateId],
    references: [eventTemplates.id],
  }),
}));

export const eventTemplatesRelations = relations(eventTemplates, ({ many }) => ({
  events: many(events),
}));

export const aiCommandsRelations = relations(aiCommands, ({ many }) => ({
  effects: many(aiCommandEffects),
}));

export const aiCommandEffectsRelations = relations(aiCommandEffects, ({ one }) => ({
  command: one(aiCommands, {
    fields: [aiCommandEffects.commandId],
    references: [aiCommands.id],
  }),
}));

export const userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id],
  }),
}));

export const autoResponsesRelations = relations(autoResponses, ({ one }) => ({
  user: one(users, {
    fields: [autoResponses.userId],
    references: [users.id],
  }),
}));