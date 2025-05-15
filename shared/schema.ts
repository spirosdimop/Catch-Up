import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

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
    return {
      ...data,
      startDate: data.startDate ? new Date(data.startDate) : null,
      endDate: data.endDate ? new Date(data.endDate) : null,
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
  userId: text("user_id").notNull(), // Using string for userId to support Replit Auth
  path: text("path").notNull(), // Current path user navigated to
  fromPath: text("from_path"), // Previous path user was on
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  sessionId: text("session_id").notNull(), // Unique identifier for the user's session
  timeOnPage: integer("time_on_page").default(0), // Time spent on page in seconds
  clickedElements: text("clicked_elements"), // JSON stringified array of element IDs clicked
});

// User Preferences
export const userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(), // Using string for userId to support Replit Auth
  language: text("language").default("en").notNull(), // ISO language code
  theme: text("theme").default("light").notNull(), // light, dark, system
  notificationsEnabled: boolean("notifications_enabled").default(true).notNull(),
  emailNotifications: boolean("email_notifications").default(true).notNull(),
  calendarIntegration: boolean("calendar_integration").default(false).notNull(),
  defaultView: text("default_view").default("week").notNull(), // week, day, month
  weekStartsOn: integer("week_starts_on").default(0).notNull(), // 0 = Sunday, 6 = Saturday
  hourFormat: integer("hour_format").default(12).notNull(), // 12 or 24
  timezone: text("timezone").default("UTC").notNull(),
  automaticTimeTracking: boolean("automatic_time_tracking").default(false).notNull(),
  assistantName: text("assistant_name").default("Assistant").notNull(), // Customizable name for the AI assistant
  lastUpdated: timestamp("last_updated").defaultNow().notNull(),
});

// Export schemas for navigation and preferences
export const insertNavigationEventSchema = createInsertSchema(navigationEvents).pick({
  userId: true,
  path: true,
  fromPath: true,
  timestamp: true,
  sessionId: true,
  timeOnPage: true,
  clickedElements: true,
});

export const insertUserPreferencesSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  language: true,
  theme: true,
  notificationsEnabled: true,
  emailNotifications: true,
  calendarIntegration: true,
  defaultView: true,
  weekStartsOn: true,
  hourFormat: true,
  timezone: true,
  automaticTimeTracking: true,
  assistantName: true,
});

export type NavigationEvent = typeof navigationEvents.$inferSelect;
export type InsertNavigationEvent = z.infer<typeof insertNavigationEventSchema>;

export type UserPreferences = typeof userPreferences.$inferSelect;
export type InsertUserPreferences = z.infer<typeof insertUserPreferencesSchema>;

// Auto Response Templates schema
export const autoResponses = pgTable("auto_responses", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(), // Using string for userId to support Replit Auth
  name: text("name").notNull(), // Name of the template
  type: messageTypeEnum("type").default("general").notNull(), // Type of message
  content: text("content").notNull(), // Template content
  isDefault: boolean("is_default").default(false).notNull(), // Whether this is the default template for this type
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
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
