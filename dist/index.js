var __defProp = Object.defineProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};

// server/index.ts
import express2 from "express";

// server/routes.ts
import { Router as Router3 } from "express";
import { createServer } from "http";

// shared/schema.ts
var schema_exports = {};
__export(schema_exports, {
  BookingStatus: () => BookingStatus,
  EventType: () => EventType,
  InvoiceStatus: () => InvoiceStatus,
  LocationType: () => LocationType,
  ProjectStatus: () => ProjectStatus,
  ServiceLocationType: () => ServiceLocationType,
  TaskPriority: () => TaskPriority,
  TaskStatus: () => TaskStatus,
  aiCommandEffects: () => aiCommandEffects,
  aiCommandEffectsRelations: () => aiCommandEffectsRelations,
  aiCommandStatusEnum: () => aiCommandStatusEnum,
  aiCommandTypeEnum: () => aiCommandTypeEnum,
  aiCommands: () => aiCommands,
  aiCommandsRelations: () => aiCommandsRelations,
  autoResponses: () => autoResponses,
  autoResponsesRelations: () => autoResponsesRelations,
  bookingStatusEnum: () => bookingStatusEnum,
  bookingTypeEnum: () => bookingTypeEnum,
  bookings: () => bookings,
  bookingsRelations: () => bookingsRelations,
  clients: () => clients,
  clientsRelations: () => clientsRelations,
  eventTemplates: () => eventTemplates,
  eventTemplatesRelations: () => eventTemplatesRelations,
  eventTypeEnum: () => eventTypeEnum,
  events: () => events,
  eventsRelations: () => eventsRelations,
  insertAiCommandEffectSchema: () => insertAiCommandEffectSchema,
  insertAiCommandSchema: () => insertAiCommandSchema,
  insertAutoResponseSchema: () => insertAutoResponseSchema,
  insertBookingSchema: () => insertBookingSchema,
  insertClientSchema: () => insertClientSchema,
  insertEventSchema: () => insertEventSchema,
  insertEventTemplateSchema: () => insertEventTemplateSchema,
  insertInvoiceItemSchema: () => insertInvoiceItemSchema,
  insertInvoiceSchema: () => insertInvoiceSchema,
  insertNavigationEventSchema: () => insertNavigationEventSchema,
  insertProjectSchema: () => insertProjectSchema,
  insertServiceProviderSchema: () => insertServiceProviderSchema,
  insertServiceSchema: () => insertServiceSchema,
  insertTaskSchema: () => insertTaskSchema,
  insertTimeEntrySchema: () => insertTimeEntrySchema,
  insertUserPreferencesSchema: () => insertUserPreferencesSchema,
  insertUserSchema: () => insertUserSchema,
  invoiceItems: () => invoiceItems,
  invoiceItemsRelations: () => invoiceItemsRelations,
  invoiceStatusEnum: () => invoiceStatusEnum,
  invoices: () => invoices,
  invoicesRelations: () => invoicesRelations,
  locationTypeEnum: () => locationTypeEnum,
  messageTypeEnum: () => messageTypeEnum,
  navigationEvents: () => navigationEvents,
  professionEnum: () => professionEnum,
  projectStatusEnum: () => projectStatusEnum,
  projects: () => projects,
  projectsRelations: () => projectsRelations,
  serviceLocationTypeEnum: () => serviceLocationTypeEnum,
  serviceProviders: () => serviceProviders,
  services: () => services,
  taskPriorityEnum: () => taskPriorityEnum,
  taskStatusEnum: () => taskStatusEnum,
  tasks: () => tasks,
  tasksRelations: () => tasksRelations,
  timeEntries: () => timeEntries,
  timeEntriesRelations: () => timeEntriesRelations,
  userPreferences: () => userPreferences,
  userPreferencesRelations: () => userPreferencesRelations,
  users: () => users,
  usersRelations: () => usersRelations
});
import { pgTable, text, serial, integer, boolean, timestamp, doublePrecision, pgEnum } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";
var users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  email: text("email").notNull(),
  phone: text("phone"),
  emailVerified: boolean("email_verified").default(false).notNull(),
  phoneVerified: boolean("phone_verified").default(false).notNull(),
  emailVerificationToken: text("email_verification_token"),
  phoneVerificationToken: text("phone_verification_token"),
  emailVerificationExpiry: timestamp("email_verification_expiry"),
  phoneVerificationExpiry: timestamp("phone_verification_expiry"),
  avatarUrl: text("avatar_url")
});
var insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  name: true,
  email: true,
  phone: true,
  emailVerified: true,
  phoneVerified: true,
  emailVerificationToken: true,
  phoneVerificationToken: true,
  emailVerificationExpiry: true,
  phoneVerificationExpiry: true,
  avatarUrl: true
});
var clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  firstName: text("first_name").notNull(),
  lastName: text("last_name").notNull(),
  email: text("email"),
  phone: text("phone"),
  company: text("company"),
  address: text("address"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertClientSchema = createInsertSchema(clients).pick({
  firstName: true,
  lastName: true,
  email: true,
  phone: true,
  company: true,
  address: true
});
var projectStatusEnum = pgEnum("project_status", [
  "not_started",
  "in_progress",
  "on_hold",
  "completed"
]);
var projects = pgTable("projects", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  clientId: integer("client_id"),
  // Made optional for personal projects
  status: projectStatusEnum("status").notNull().default("not_started"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  budget: doublePrecision("budget"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  clientId: true,
  status: true,
  startDate: true,
  endDate: true,
  budget: true
}).extend({
  startDate: z.union([z.string(), z.date()]).nullable().optional().transform((val) => {
    if (!val) return null;
    if (typeof val === "string") {
      try {
        const date = new Date(val);
        return isNaN(date.getTime()) ? null : date;
      } catch {
        return null;
      }
    }
    return val instanceof Date && !isNaN(val.getTime()) ? val : null;
  }),
  endDate: z.union([z.string(), z.date()]).nullable().optional().transform((val) => {
    if (!val) return null;
    if (typeof val === "string") {
      try {
        const date = new Date(val);
        return isNaN(date.getTime()) ? null : date;
      } catch {
        return null;
      }
    }
    return val instanceof Date && !isNaN(val.getTime()) ? val : null;
  }),
  clientId: z.number().nullable().optional().transform((val) => val ?? null)
  // Allow null for personal projects
});
var taskStatusEnum = pgEnum("task_status", [
  "to_do",
  "in_progress",
  "review",
  "completed"
]);
var taskPriorityEnum = pgEnum("task_priority", [
  "low",
  "medium",
  "high",
  "urgent"
]);
var tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  projectId: integer("project_id"),
  // Made optional to allow standalone tasks
  clientId: integer("client_id"),
  // Added optional direct client connection
  status: taskStatusEnum("status").notNull().default("to_do"),
  priority: taskPriorityEnum("priority").notNull().default("medium"),
  deadline: timestamp("deadline"),
  completed: boolean("completed").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  projectId: true,
  clientId: true,
  status: true,
  priority: true,
  deadline: true,
  completed: true
}).extend({
  deadline: z.string().optional().nullable().transform((val) => val ? new Date(val) : null),
  projectId: z.number().nullable().optional().transform((val) => val ?? null),
  clientId: z.number().nullable().optional().transform((val) => val ?? null)
});
var timeEntries = pgTable("time_entries", {
  id: serial("id").primaryKey(),
  projectId: integer("project_id").notNull(),
  taskId: integer("task_id"),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time"),
  duration: integer("duration"),
  // duration in minutes
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertTimeEntrySchema = createInsertSchema(timeEntries).pick({
  projectId: true,
  taskId: true,
  description: true,
  startTime: true,
  endTime: true,
  duration: true
});
var invoiceStatusEnum = pgEnum("invoice_status", [
  "draft",
  "sent",
  "paid",
  "overdue",
  "canceled"
]);
var invoices = pgTable("invoices", {
  id: serial("id").primaryKey(),
  invoiceNumber: text("invoice_number").notNull(),
  clientId: integer("client_id").notNull(),
  issueDate: timestamp("issue_date").notNull(),
  dueDate: timestamp("due_date").notNull(),
  amount: doublePrecision("amount").notNull(),
  status: invoiceStatusEnum("status").notNull().default("draft"),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertInvoiceSchema = createInsertSchema(invoices).pick({
  invoiceNumber: true,
  clientId: true,
  issueDate: true,
  dueDate: true,
  amount: true,
  status: true,
  notes: true
});
var invoiceItems = pgTable("invoice_items", {
  id: serial("id").primaryKey(),
  invoiceId: integer("invoice_id").notNull(),
  description: text("description").notNull(),
  quantity: doublePrecision("quantity").notNull(),
  rate: doublePrecision("rate").notNull(),
  amount: doublePrecision("amount").notNull()
});
var insertInvoiceItemSchema = createInsertSchema(invoiceItems).pick({
  invoiceId: true,
  description: true,
  quantity: true,
  rate: true,
  amount: true
});
var bookingStatusEnum = pgEnum("booking_status", [
  "pending",
  "accepted",
  "declined",
  "confirmed",
  "rescheduled",
  "canceled",
  "emergency"
]);
var bookingTypeEnum = pgEnum("booking_type", [
  "meeting",
  "consultation",
  "appointment",
  "follow_up",
  "check_in"
]);
var bookings = pgTable("bookings", {
  id: serial("id").primaryKey(),
  date: text("date").notNull(),
  time: text("time").notNull(),
  duration: integer("duration"),
  type: bookingTypeEnum("type").notNull().default("meeting"),
  status: bookingStatusEnum("status").notNull().default("pending"),
  location: text("location"),
  notes: text("notes"),
  clientId: integer("client_id").notNull().references(() => clients.id),
  // Required reference to clients table
  projectId: integer("project_id").references(() => projects.id),
  // Optional reference to projects table
  taskId: integer("task_id").references(() => tasks.id),
  // Optional reference to tasks table
  serviceId: text("service_id").notNull(),
  priority: text("priority").default("normal"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  externalId: text("external_id").notNull(),
  // Client-side ID
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone").notNull(),
  serviceName: text("service_name"),
  servicePrice: text("service_price"),
  professionalId: text("professional_id").notNull()
  // Points to a user
});
var insertBookingSchema = createInsertSchema(bookings).pick({
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
  projectId: true,
  taskId: true,
  serviceId: true,
  priority: true,
  professionalId: true
}).extend({
  // Make some fields optional for flexibility
  duration: z.number().optional(),
  location: z.string().optional(),
  notes: z.string().optional(),
  serviceName: z.string().optional(),
  servicePrice: z.string().optional(),
  priority: z.string().optional(),
  projectId: z.number().optional(),
  taskId: z.number().optional()
});
var locationTypeEnum = pgEnum("location_type", [
  "has_shop",
  "goes_to_clients",
  "both"
]);
var serviceLocationTypeEnum = pgEnum("service_location_type", [
  "office",
  "client_location",
  "online"
]);
var professionEnum = pgEnum("profession", [
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
var serviceProviders = pgTable("service_providers", {
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
  availabilityHours: text("availability_hours"),
  // JSON string with availability hours
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var services = pgTable("services", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => serviceProviders.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(),
  // in minutes
  price: doublePrecision("price").notNull(),
  // in EUR
  locationType: serviceLocationTypeEnum("service_location_type").default("office").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertServiceProviderSchema = createInsertSchema(serviceProviders).pick({
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
  availabilityHours: true
});
var insertServiceSchema = createInsertSchema(services).pick({
  providerId: true,
  name: true,
  description: true,
  duration: true,
  price: true,
  locationType: true
});
var LocationType = {
  HAS_SHOP: "has_shop",
  GOES_TO_CLIENTS: "goes_to_clients",
  BOTH: "both"
};
var ServiceLocationType = {
  OFFICE: "office",
  CLIENT_LOCATION: "client_location",
  ONLINE: "online"
};
var ProjectStatus = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  ON_HOLD: "on_hold",
  COMPLETED: "completed"
};
var TaskStatus = {
  TO_DO: "to_do",
  IN_PROGRESS: "in_progress",
  REVIEW: "review",
  COMPLETED: "completed"
};
var TaskPriority = {
  LOW: "low",
  MEDIUM: "medium",
  HIGH: "high",
  URGENT: "urgent"
};
var InvoiceStatus = {
  DRAFT: "draft",
  SENT: "sent",
  PAID: "paid",
  OVERDUE: "overdue",
  CANCELED: "canceled"
};
var BookingStatus = {
  PENDING: "pending",
  ACCEPTED: "accepted",
  DECLINED: "declined",
  RESCHEDULED: "rescheduled"
};
var eventTypeEnum = pgEnum("event_type", [
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
var eventTemplates = pgTable("event_templates", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  // Using string for userId to support Replit Auth
  name: text("name").notNull(),
  title: text("title").notNull(),
  description: text("description"),
  duration: integer("duration").notNull(),
  // Duration in minutes
  location: text("location"),
  eventType: eventTypeEnum("event_type").default("busy").notNull(),
  color: text("color"),
  isPublic: boolean("is_public").default(true).notNull(),
  // Whether this template is available for public booking
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var events = pgTable("events", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  // Using string for userId to support Replit Auth
  title: text("title").notNull(),
  description: text("description"),
  startTime: timestamp("start_time").notNull(),
  endTime: timestamp("end_time").notNull(),
  location: text("location"),
  clientName: text("client_name"),
  clientId: integer("client_id").references(() => clients.id),
  // Reference to client
  projectId: integer("project_id").references(() => projects.id),
  // Reference to project
  invoiceId: integer("invoice_id").references(() => invoices.id),
  // Reference to invoice
  isConfirmed: boolean("is_confirmed").default(false).notNull(),
  eventType: eventTypeEnum("event_type").default("busy").notNull(),
  templateId: integer("template_id").references(() => eventTemplates.id),
  // Reference to template
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var insertEventTemplateSchema = createInsertSchema(eventTemplates).pick({
  userId: true,
  name: true,
  title: true,
  description: true,
  duration: true,
  location: true,
  eventType: true,
  color: true,
  isPublic: true
});
var insertEventSchema = createInsertSchema(events).pick({
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
  color: true
});
var EventType = {
  PRIVATE: "private",
  BUSY: "busy",
  AVAILABLE: "available",
  TRAVEL: "travel",
  CLIENT_MEETING: "client_meeting",
  CONSULTATION: "consultation",
  PROJECT_WORK: "project_work",
  FOLLOW_UP: "follow_up",
  TRAINING: "training"
};
var messageTypeEnum = pgEnum("message_type", [
  "general",
  "missed_call",
  "reschedule",
  "cancellation",
  "confirmation",
  "emergency"
]);
var aiCommandTypeEnum = pgEnum("ai_command_type", [
  "general",
  "scheduling",
  "settings",
  "autoresponse",
  "unified"
]);
var aiCommandStatusEnum = pgEnum("ai_command_status", [
  "success",
  "needs_clarification",
  "error"
]);
var aiCommands = pgTable("ai_commands", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  // Using string for userId to support Replit Auth
  commandType: aiCommandTypeEnum("command_type").default("unified").notNull(),
  userPrompt: text("user_prompt").notNull(),
  status: aiCommandStatusEnum("status").default("success").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var aiCommandEffects = pgTable("ai_command_effects", {
  id: serial("id").primaryKey(),
  commandId: integer("command_id").notNull().references(() => aiCommands.id, { onDelete: "cascade" }),
  effectType: text("effect_type").notNull(),
  // "create_event", "update_settings", "generate_message", etc.
  targetType: text("target_type").notNull(),
  // "event", "settings", "auto_response", etc.
  targetId: text("target_id"),
  // ID of the affected entity if applicable
  details: text("details").notNull(),
  // JSON stringified details of what was changed
  createdAt: timestamp("created_at").defaultNow().notNull()
});
var insertAiCommandSchema = createInsertSchema(aiCommands).pick({
  userId: true,
  commandType: true,
  userPrompt: true,
  status: true
});
var insertAiCommandEffectSchema = createInsertSchema(aiCommandEffects).pick({
  commandId: true,
  effectType: true,
  targetType: true,
  targetId: true,
  details: true
});
var navigationEvents = pgTable("navigation_events", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  path: text("path").notNull(),
  fromPath: text("from_path"),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
  sessionId: text("session_id").notNull(),
  timeOnPage: integer("time_on_page"),
  clickedElements: text("clicked_elements")
  // JSON string with array of clicked elements
});
var insertNavigationEventSchema = createInsertSchema(navigationEvents).pick({
  userId: true,
  path: true,
  fromPath: true,
  sessionId: true,
  timeOnPage: true,
  clickedElements: true
});
var userPreferences = pgTable("user_preferences", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull().unique(),
  theme: text("theme").default("system"),
  dateFormat: text("date_format").default("MM/dd/yyyy"),
  timeFormat: text("time_format").default("hh:mm a"),
  defaultView: text("default_view").default("month"),
  // week, day, month
  startOfWeek: integer("start_of_week").default(0),
  // 0=Sunday, 1=Monday
  notifications: boolean("notifications").default(true),
  language: text("language").default("en"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var insertUserPreferencesSchema = createInsertSchema(userPreferences).pick({
  userId: true,
  theme: true,
  dateFormat: true,
  timeFormat: true,
  defaultView: true,
  startOfWeek: true,
  notifications: true,
  language: true
});
var autoResponses = pgTable("auto_responses", {
  id: serial("id").primaryKey(),
  userId: text("user_id").notNull(),
  name: text("name").notNull(),
  type: messageTypeEnum("type").notNull(),
  content: text("content").notNull(),
  isDefault: boolean("is_default").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull()
});
var insertAutoResponseSchema = createInsertSchema(autoResponses).pick({
  userId: true,
  name: true,
  type: true,
  content: true,
  isDefault: true
});
var usersRelations = relations(users, ({ many }) => ({
  events: many(events),
  eventTemplates: many(eventTemplates),
  bookings: many(bookings),
  autoResponses: many(autoResponses),
  userPreferences: many(userPreferences)
}));
var clientsRelations = relations(clients, ({ many }) => ({
  projects: many(projects),
  invoices: many(invoices),
  events: many(events),
  tasks: many(tasks),
  bookings: many(bookings)
}));
var projectsRelations = relations(projects, ({ one, many }) => ({
  client: one(clients, {
    fields: [projects.clientId],
    references: [clients.id]
  }),
  tasks: many(tasks),
  timeEntries: many(timeEntries),
  events: many(events)
}));
var tasksRelations = relations(tasks, ({ one, many }) => ({
  project: one(projects, {
    fields: [tasks.projectId],
    references: [projects.id]
  }),
  client: one(clients, {
    fields: [tasks.clientId],
    references: [clients.id]
  }),
  timeEntries: many(timeEntries)
}));
var timeEntriesRelations = relations(timeEntries, ({ one }) => ({
  project: one(projects, {
    fields: [timeEntries.projectId],
    references: [projects.id]
  }),
  task: one(tasks, {
    fields: [timeEntries.taskId],
    references: [tasks.id]
  })
}));
var invoicesRelations = relations(invoices, ({ one, many }) => ({
  client: one(clients, {
    fields: [invoices.clientId],
    references: [clients.id]
  }),
  events: many(events),
  invoiceItems: many(invoiceItems)
}));
var invoiceItemsRelations = relations(invoiceItems, ({ one }) => ({
  invoice: one(invoices, {
    fields: [invoiceItems.invoiceId],
    references: [invoices.id]
  })
}));
var bookingsRelations = relations(bookings, ({ one }) => ({
  professional: one(users, {
    fields: [bookings.professionalId],
    references: [users.id]
  }),
  client: one(clients, {
    fields: [bookings.clientId],
    references: [clients.id]
  })
}));
var eventsRelations = relations(events, ({ one }) => ({
  client: one(clients, {
    fields: [events.clientId],
    references: [clients.id]
  }),
  project: one(projects, {
    fields: [events.projectId],
    references: [projects.id]
  }),
  invoice: one(invoices, {
    fields: [events.invoiceId],
    references: [invoices.id]
  }),
  template: one(eventTemplates, {
    fields: [events.templateId],
    references: [eventTemplates.id]
  })
}));
var eventTemplatesRelations = relations(eventTemplates, ({ many }) => ({
  events: many(events)
}));
var aiCommandsRelations = relations(aiCommands, ({ many }) => ({
  effects: many(aiCommandEffects)
}));
var aiCommandEffectsRelations = relations(aiCommandEffects, ({ one }) => ({
  command: one(aiCommands, {
    fields: [aiCommandEffects.commandId],
    references: [aiCommands.id]
  })
}));
var userPreferencesRelations = relations(userPreferences, ({ one }) => ({
  user: one(users, {
    fields: [userPreferences.userId],
    references: [users.id]
  })
}));
var autoResponsesRelations = relations(autoResponses, ({ one }) => ({
  user: one(users, {
    fields: [autoResponses.userId],
    references: [users.id]
  })
}));

// server/db.ts
import { Pool, neonConfig } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import ws from "ws";
neonConfig.webSocketConstructor = ws;
if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?"
  );
}
var pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  max: 10,
  // Maximum number of clients in the pool
  idleTimeoutMillis: 3e4,
  // Clients timeout after 30 seconds of inactivity
  connectionTimeoutMillis: 2e3,
  // Return an error after 2 seconds if a connection cannot be established
  maxUses: 7500
  // Close and replace a connection after it has been used 7500 times
});
var db = drizzle({ client: pool, schema: schema_exports });
pool.connect((err, client, release) => {
  if (err) {
    console.error("Error connecting to the database:", err);
    return;
  }
  console.log("Database connection established successfully");
  release();
});

// server/DatabaseStorage.ts
import { eq, desc, and, sql } from "drizzle-orm";
var DatabaseStorage = class {
  // Navigation tracking operations
  async createNavigationEvent(event) {
    const [result] = await db.insert(navigationEvents).values(event).returning();
    return result;
  }
  async getNavigationEventsByUser(userId) {
    return await db.select().from(navigationEvents).where(eq(navigationEvents.userId, userId)).orderBy(desc(navigationEvents.timestamp));
  }
  async getNavigationEventsByPathAndUser(userId, path3) {
    return await db.select().from(navigationEvents).where(
      and(
        eq(navigationEvents.userId, userId),
        eq(navigationEvents.path, path3)
      )
    ).orderBy(desc(navigationEvents.timestamp));
  }
  // User preferences operations
  async getUserPreferences(userId) {
    const [result] = await db.select().from(userPreferences).where(eq(userPreferences.userId, userId));
    return result;
  }
  async createUserPreferences(preferences) {
    const [result] = await db.insert(userPreferences).values(preferences).returning();
    return result;
  }
  async updateUserPreferences(userId, preferences) {
    const [result] = await db.update(userPreferences).set(preferences).where(eq(userPreferences.userId, userId)).returning();
    return result;
  }
  // AI Command operations
  async getAiCommands(userId, limit) {
    const query = db.select().from(aiCommands).where(eq(aiCommands.userId, userId)).orderBy(desc(aiCommands.createdAt));
    if (limit) {
      return await query.limit(limit);
    }
    return await query;
  }
  async getAiCommand(id) {
    const [result] = await db.select().from(aiCommands).where(eq(aiCommands.id, id));
    return result;
  }
  async createAiCommand(command) {
    const [result] = await db.insert(aiCommands).values(command).returning();
    return result;
  }
  async updateAiCommand(id, command) {
    const [result] = await db.update(aiCommands).set(command).where(eq(aiCommands.id, id)).returning();
    return result;
  }
  async getAiCommandEffects(commandId) {
    return await db.select().from(aiCommandEffects).where(eq(aiCommandEffects.commandId, commandId)).orderBy(aiCommandEffects.id);
  }
  async createAiCommandEffect(effect) {
    const [result] = await db.insert(aiCommandEffects).values({
      ...effect,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return result;
  }
  // Calendar Event operations
  async getEvents(userId) {
    return await db.select().from(events).where(eq(events.userId, userId)).orderBy(events.startTime);
  }
  async getEvent(id) {
    const [result] = await db.select().from(events).where(eq(events.id, id));
    return result;
  }
  async createEvent(event) {
    const [result] = await db.insert(events).values({
      ...event,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    return result;
  }
  async updateEvent(id, event) {
    const [result] = await db.update(events).set({
      ...event,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(events.id, id)).returning();
    return result;
  }
  async deleteEvent(id) {
    const result = await db.delete(events).where(eq(events.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  // Event Template operations
  async getEventTemplates(userId) {
    return await db.select().from(eventTemplates).where(eq(eventTemplates.userId, userId)).orderBy(eventTemplates.name);
  }
  async getPublicEventTemplates(userId) {
    return await db.select().from(eventTemplates).where(
      and(
        eq(eventTemplates.userId, userId),
        eq(eventTemplates.isPublic, true)
      )
    ).orderBy(eventTemplates.name);
  }
  async getEventTemplate(id) {
    const [result] = await db.select().from(eventTemplates).where(eq(eventTemplates.id, id));
    return result;
  }
  async createEventTemplate(template) {
    const [result] = await db.insert(eventTemplates).values({
      ...template,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    return result;
  }
  async updateEventTemplate(id, template) {
    const [result] = await db.update(eventTemplates).set({
      ...template,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(eventTemplates.id, id)).returning();
    return result;
  }
  async deleteEventTemplate(id) {
    const result = await db.delete(eventTemplates).where(eq(eventTemplates.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  // The remaining methods for User, Client, Project, Task, TimeEntry, Invoice, etc.
  // would be implemented here. We're focusing on the AI, event, and navigation functionality
  // for this implementation.
  // Client operations
  async deleteClient(id) {
    console.log("Attempting to delete client with ID:", id);
    try {
      const result = await db.delete(clients).where(eq(clients.id, id));
      console.log("Delete client result:", result);
      return result.rowCount ? result.rowCount > 0 : false;
    } catch (error) {
      console.error("Error in deleteClient:", error);
      throw error;
    }
  }
  // User related operations
  async getUser(id) {
    const [result] = await db.select().from(users).where(eq(users.id, id));
    return result;
  }
  async getUserByUsername(username) {
    const [result] = await db.select().from(users).where(eq(users.username, username));
    return result;
  }
  async createUser(user) {
    const [result] = await db.insert(users).values(user).returning();
    return result;
  }
  async updateUser(id, user) {
    const [result] = await db.update(users).set(user).where(eq(users.id, id)).returning();
    return result;
  }
  // Implementing methods as needed for the remaining operations
  // We'll implement stubs for the required interface methods
  async getClients() {
    return await db.select().from(clients);
  }
  async getClient(id) {
    const result = await db.select().from(clients).where(eq(clients.id, id));
    return result[0];
  }
  async createClient(client) {
    const [result] = await db.insert(clients).values({
      ...client,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return result;
  }
  async updateClient(id, client) {
    const [result] = await db.update(clients).set(client).where(eq(clients.id, id)).returning();
    return result;
  }
  // Get clients that aren't connected to any projects, events, or invoices
  async getUnconnectedClients() {
    const allClients = await this.getClients();
    const projectClientIds = await db.select({ id: projects.clientId }).from(projects);
    const eventClientIds = await db.select({ id: events.clientId }).from(events);
    const filteredEventClientIds = eventClientIds.filter((e) => e.id !== null);
    const invoiceClientIds = await db.select({ id: invoices.clientId }).from(invoices);
    const connectedClientIds = /* @__PURE__ */ new Set([
      ...projectClientIds.map((p) => p.id),
      ...filteredEventClientIds.map((e) => e.id),
      ...invoiceClientIds.map((i) => i.id)
    ]);
    const unconnectedClients = allClients.filter(
      (client) => !connectedClientIds.has(client.id)
    );
    return unconnectedClients;
  }
  // Get clients with duplicate email addresses
  async getDuplicateClients() {
    try {
      const duplicateEmailsResult = await db.execute(
        sql`SELECT LOWER(TRIM(email)) as normalized_email 
            FROM ${clients} 
            GROUP BY normalized_email 
            HAVING COUNT(*) > 1`
      );
      const duplicateEmails = duplicateEmailsResult.rows.map((row) => row.normalized_email);
      if (duplicateEmails.length === 0) {
        return [];
      }
      return await db.select().from(clients).where(
        sql`LOWER(TRIM(${clients.email})) IN (${sql.join(
          duplicateEmails.map((email) => sql`${email}`),
          sql`, `
        )})`
      );
    } catch (error) {
      console.error("Error finding duplicate clients:", error);
      if (error instanceof Error) {
        throw new Error(`Database error: ${error.message}`);
      }
      const allClients = await this.getClients();
      const emailMap = /* @__PURE__ */ new Map();
      const duplicateEmails = /* @__PURE__ */ new Set();
      allClients.forEach((client) => {
        if (!client.email) return;
        const email = client.email.toLowerCase().trim();
        if (emailMap.has(email)) {
          duplicateEmails.add(email);
        } else {
          emailMap.set(email, client.id);
        }
      });
      return allClients.filter(
        (c) => c.email && duplicateEmails.has(c.email.toLowerCase().trim())
      );
    }
  }
  async getProjects() {
    return await db.select().from(projects);
  }
  async getProjectsByClient(clientId) {
    return await db.select().from(projects).where(eq(projects.clientId, clientId));
  }
  async getProject(id) {
    const result = await db.select().from(projects).where(eq(projects.id, id));
    return result[0];
  }
  async createProject(project) {
    try {
      console.log("DatabaseStorage - Creating project with data:", project);
      const projectData = {
        name: project.name,
        clientId: project.clientId,
        description: project.description ?? null,
        status: project.status || "not_started",
        startDate: project.startDate || /* @__PURE__ */ new Date(),
        endDate: project.endDate || null,
        budget: project.budget ?? null,
        createdAt: /* @__PURE__ */ new Date()
      };
      console.log("DatabaseStorage - Processed project data:", projectData);
      const [result] = await db.insert(projects).values(projectData).returning();
      console.log("DatabaseStorage - Project created successfully:", result);
      return result;
    } catch (error) {
      console.error("DatabaseStorage - Error creating project:", error);
      throw error;
    }
  }
  async updateProject(id, project) {
    const [result] = await db.update(projects).set(project).where(eq(projects.id, id)).returning();
    return result;
  }
  async deleteProject(id) {
    const result = await db.delete(projects).where(eq(projects.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  async getTasks() {
    return await db.select().from(tasks);
  }
  async getTasksByProject(projectId) {
    return await db.select().from(tasks).where(eq(tasks.projectId, projectId));
  }
  async getTask(id) {
    const result = await db.select().from(tasks).where(eq(tasks.id, id));
    return result[0];
  }
  async createTask(task) {
    const [result] = await db.insert(tasks).values({
      ...task,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return result;
  }
  async updateTask(id, task) {
    const [result] = await db.update(tasks).set(task).where(eq(tasks.id, id)).returning();
    return result;
  }
  async deleteTask(id) {
    const result = await db.delete(tasks).where(eq(tasks.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  async getTimeEntries() {
    return await db.select().from(timeEntries);
  }
  async getTimeEntriesByProject(projectId) {
    return await db.select().from(timeEntries).where(eq(timeEntries.projectId, projectId));
  }
  async getTimeEntriesByTask(taskId) {
    return await db.select().from(timeEntries).where(eq(timeEntries.taskId, taskId));
  }
  async getTimeEntry(id) {
    const result = await db.select().from(timeEntries).where(eq(timeEntries.id, id));
    return result[0];
  }
  async createTimeEntry(timeEntry) {
    const [result] = await db.insert(timeEntries).values({
      ...timeEntry,
      createdAt: /* @__PURE__ */ new Date()
    }).returning();
    return result;
  }
  async updateTimeEntry(id, timeEntry) {
    const [result] = await db.update(timeEntries).set(timeEntry).where(eq(timeEntries.id, id)).returning();
    return result;
  }
  async deleteTimeEntry(id) {
    const result = await db.delete(timeEntries).where(eq(timeEntries.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  async getInvoices() {
    return await db.select().from(invoices);
  }
  async getInvoicesByClient(clientId) {
    return await db.select().from(invoices).where(eq(invoices.clientId, clientId));
  }
  async getInvoice(id) {
    const result = await db.select().from(invoices).where(eq(invoices.id, id));
    return result[0];
  }
  async createInvoice(invoice) {
    const [result] = await db.insert(invoices).values({
      ...invoice,
      createdAt: /* @__PURE__ */ new Date(),
      status: invoice.status || "draft"
      // Set default status if not provided
    }).returning();
    return result;
  }
  async updateInvoice(id, invoice) {
    const [result] = await db.update(invoices).set(invoice).where(eq(invoices.id, id)).returning();
    return result;
  }
  async deleteInvoice(id) {
    const result = await db.delete(invoices).where(eq(invoices.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  async getInvoiceItems(invoiceId) {
    return await db.select().from(invoiceItems).where(eq(invoiceItems.invoiceId, invoiceId));
  }
  async getInvoiceItem(id) {
    const result = await db.select().from(invoiceItems).where(eq(invoiceItems.id, id));
    return result[0];
  }
  async createInvoiceItem(invoiceItem) {
    const [result] = await db.insert(invoiceItems).values(invoiceItem).returning();
    return result;
  }
  async updateInvoiceItem(id, invoiceItem) {
    const [result] = await db.update(invoiceItems).set(invoiceItem).where(eq(invoiceItems.id, id)).returning();
    return result;
  }
  async deleteInvoiceItem(id) {
    const result = await db.delete(invoiceItems).where(eq(invoiceItems.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  async getServiceProviders() {
    return await db.select().from(serviceProviders);
  }
  async getServiceProvider(id) {
    const result = await db.select().from(serviceProviders).where(eq(serviceProviders.id, id));
    return result[0];
  }
  async getServiceProviderByEmail(email) {
    const result = await db.select().from(serviceProviders).where(eq(serviceProviders.email, email));
    return result[0];
  }
  async createServiceProvider(provider) {
    const providerData = {
      ...provider,
      serviceArea: provider.serviceArea || null,
      profileImage: provider.profileImage || null,
      voicemailMessage: provider.voicemailMessage || null,
      smsFollowUpMessage: provider.smsFollowUpMessage || null,
      availabilityHours: provider.availabilityHours || null,
      createdAt: /* @__PURE__ */ new Date()
    };
    const [result] = await db.insert(serviceProviders).values(providerData).returning();
    return result;
  }
  async updateServiceProvider(id, provider) {
    const [result] = await db.update(serviceProviders).set(provider).where(eq(serviceProviders.id, id)).returning();
    return result;
  }
  async deleteServiceProvider(id) {
    const result = await db.delete(serviceProviders).where(eq(serviceProviders.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  async getServices() {
    return await db.select().from(services);
  }
  async getServicesByProvider(providerId) {
    return await db.select().from(services).where(eq(services.providerId, providerId));
  }
  async getService(id) {
    const result = await db.select().from(services).where(eq(services.id, id));
    return result[0];
  }
  async createService(service) {
    const serviceData = {
      ...service,
      description: service.description || null,
      locationType: service.locationType || "office",
      // Default to office
      createdAt: /* @__PURE__ */ new Date()
    };
    const [result] = await db.insert(services).values(serviceData).returning();
    return result;
  }
  async updateService(id, service) {
    const [result] = await db.update(services).set(service).where(eq(services.id, id)).returning();
    return result;
  }
  async deleteService(id) {
    const result = await db.delete(services).where(eq(services.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  // Auto responses methods
  async getAutoResponses(userId) {
    return await db.select().from(autoResponses).where(eq(autoResponses.userId, userId)).orderBy(autoResponses.name);
  }
  async getAutoResponsesByType(userId, type) {
    return await db.select().from(autoResponses).where(
      and(
        eq(autoResponses.userId, userId),
        eq(autoResponses.type, type)
      )
    ).orderBy(autoResponses.name);
  }
  async getAutoResponse(id) {
    const [result] = await db.select().from(autoResponses).where(eq(autoResponses.id, id));
    return result;
  }
  async getDefaultAutoResponse(userId, type) {
    const [result] = await db.select().from(autoResponses).where(
      and(
        eq(autoResponses.userId, userId),
        eq(autoResponses.type, type),
        eq(autoResponses.isDefault, true)
      )
    );
    return result;
  }
  async createAutoResponse(response) {
    if (response.isDefault) {
      await db.update(autoResponses).set({
        isDefault: false,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(
        and(
          eq(autoResponses.userId, response.userId),
          eq(autoResponses.type, response.type),
          eq(autoResponses.isDefault, true)
        )
      );
    }
    const [result] = await db.insert(autoResponses).values({
      ...response,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    return result;
  }
  async updateAutoResponse(id, response) {
    const [existingResponse] = await db.select().from(autoResponses).where(eq(autoResponses.id, id));
    if (!existingResponse) return void 0;
    if (response.isDefault && !existingResponse.isDefault) {
      await db.update(autoResponses).set({
        isDefault: false,
        updatedAt: /* @__PURE__ */ new Date()
      }).where(
        and(
          eq(autoResponses.userId, existingResponse.userId),
          eq(autoResponses.type, existingResponse.type),
          eq(autoResponses.isDefault, true),
          sql`id != ${id}`
        )
      );
    }
    const [result] = await db.update(autoResponses).set({
      ...response,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(autoResponses.id, id)).returning();
    return result;
  }
  async deleteAutoResponse(id) {
    const result = await db.delete(autoResponses).where(eq(autoResponses.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
  // Booking related operations
  async getBookings() {
    return await db.select().from(bookings).orderBy(desc(bookings.createdAt));
  }
  async getBookingsByClient(clientId) {
    return await db.select().from(bookings).where(eq(bookings.clientId, clientId)).orderBy(desc(bookings.createdAt));
  }
  async getBooking(id) {
    const [result] = await db.select().from(bookings).where(eq(bookings.id, id));
    return result;
  }
  async createBooking(booking) {
    const [result] = await db.insert(bookings).values({
      ...booking,
      createdAt: /* @__PURE__ */ new Date(),
      updatedAt: /* @__PURE__ */ new Date()
    }).returning();
    return result;
  }
  async updateBooking(id, booking) {
    const [result] = await db.update(bookings).set({
      ...booking,
      updatedAt: /* @__PURE__ */ new Date()
    }).where(eq(bookings.id, id)).returning();
    return result;
  }
  async deleteBooking(id) {
    const result = await db.delete(bookings).where(eq(bookings.id, id));
    return result.rowCount ? result.rowCount > 0 : false;
  }
};

// server/storage.ts
var storage = new DatabaseStorage();

// server/memEvents.ts
var events2 = /* @__PURE__ */ new Map();
async function getEvents(userId) {
  return Array.from(events2.values()).filter((event) => event.userId === userId).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

// server/openai.ts
import { OpenAI } from "openai";
var API_KEY_MAP = {
  "general": "OPENAI_API_KEY",
  // General assistant uses the main OpenAI API key
  "scheduling": "OPENAI_SCHEDULING_KEY",
  // Scheduling assistant can use a separate key
  "settings": "OPENAI_SETTINGS_KEY",
  // Settings assistant can use a separate key
  "autoresponse": "OPENAI_AUTORESPONSE_KEY"
  // Auto-response assistant uses a dedicated key
};
function getApiKey(assistantType) {
  const envKey = API_KEY_MAP[assistantType];
  const apiKey = process.env[envKey];
  if (!apiKey && process.env.NODE_ENV !== "production") {
    console.warn(`${envKey} environment variable is not set. Using default OPENAI_API_KEY as fallback.`);
  }
  return apiKey || process.env.OPENAI_API_KEY;
}
function getOpenAIClient(assistantType = "general") {
  const apiKey = getApiKey(assistantType);
  if (!apiKey) {
    console.warn("No OpenAI API key available. AI features will not work properly.");
  }
  return new OpenAI({
    apiKey
  });
}
async function processSchedulingRequest(userSchedule, request) {
  try {
    const schedulingClient = getOpenAIClient("scheduling");
    const currentDate = /* @__PURE__ */ new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1;
    const currentYear = currentDate.getFullYear();
    const currentDateString = `${currentYear}-${currentMonth.toString().padStart(2, "0")}-${currentDay.toString().padStart(2, "0")}`;
    const systemPrompt = `
      You are an AI assistant managing a calendar for a busy professional. 
      Your job is to schedule, reschedule, cancel, delete, or suggest new appointments based on user requests.
      
      IMPORTANT: Today's date is ${currentDateString} (yyyy-mm-dd format). Keep this in mind when scheduling.
      
      IMPORTANT: Always assume the user wants to CREATE a calendar event unless they specifically mention rescheduling, canceling, or deleting.
      
      Rules you must follow:
      - Always extract specific meeting details from user requests (time, date, client name, purpose)
      - When user says "tomorrow", that means ${new Date(currentDate.getTime() + 864e5).toISOString().split("T")[0]}
      - If specific time is not mentioned, schedule for 10:00 AM on the next business day
      - If duration is not mentioned, default to 1 hour meetings
      - Set meeting titles to be descriptive (e.g., "Meeting with Client Name: Purpose")
      - Always set status to "confirmed" unless there's a specific conflict
      - Include meeting details in the notes field
      - ALWAYS use the current year (${currentYear}) for dates unless explicitly specified otherwise
      - For any dates without a year specified, use the current year or a future date
      - If a meeting is scheduled for a date that has already passed in the current year, schedule it for next year
      - DO NOT schedule meetings in the past - check against today's date (${currentDateString})
      - When the user wants to delete an event, use action "delete" and set status to "deleted" (set event_id if mentioned)
      - For delete requests, try to extract the event information from the request (title or ID)
      
      Return ONLY a JSON object with:
      - action (create, reschedule, cancel, delete, suggest_times)
      - event_title (if applicable)
      - start_time (ISO format, if applicable)
      - end_time (ISO format, if applicable)
      - status (confirmed, pending, conflict, cancelled, deleted)
      - notes (explanation of decision or the meeting details including agenda items and preparation notes)
      - event_id (if referenced in the request or created by the system)
    `;
    const scheduleText = JSON.stringify(userSchedule, null, 2);
    const response = await schedulingClient.chat.completions.create({
      model: "gpt-4o",
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `
          Current schedule:
          ${scheduleText}
          
          Request:
          ${request}
        ` }
      ],
      // Type casting to fix TypeScript error
      temperature: 0.2,
      // Use a low temperature for more consistent responses
      max_tokens: 1e3,
      response_format: { type: "json_object" }
    });
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in response from OpenAI");
    }
    return JSON.parse(content);
  } catch (error) {
    console.error("Error processing scheduling request:", error);
    return {
      action: "suggest_times",
      status: "conflict",
      notes: "Unable to process scheduling request. Please try again later or contact support."
    };
  }
}
async function generateScheduleSummary(userSchedule, timeframe = "upcoming") {
  try {
    const schedulingClient = getOpenAIClient("scheduling");
    const systemPrompt = `
      You are an AI assistant helping a busy professional understand their schedule.
      Provide a concise, helpful summary of their ${timeframe} schedule.
      Focus on highlighting important meetings, potential conflicts, and free time blocks.
      Be specific about dates and times, and group similar activities if appropriate.
    `;
    const scheduleText = JSON.stringify(userSchedule, null, 2);
    const response = await schedulingClient.chat.completions.create({
      model: "gpt-4o",
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `
          Here is my ${timeframe} schedule:
          ${scheduleText}
          
          Please summarize it for me.
        ` }
      ],
      // Type casting to fix TypeScript error
      temperature: 0.7,
      max_tokens: 1500
    });
    return response.choices[0]?.message?.content || "Unable to generate schedule summary.";
  } catch (error) {
    console.error("Error generating schedule summary:", error);
    return "Unable to generate schedule summary due to an error. Please try again later.";
  }
}
async function generateAutoResponse(context = "missed call") {
  try {
    const autoResponseClient = getOpenAIClient("autoresponse");
    const systemPrompt = `
      You are a polite virtual assistant. The user wants a message that will be automatically sent 
      when they miss a call or cannot respond. Based on their request, generate a short, human, 
      professional, and kind message. Keep the output under 300 characters. 
      Only return the message as plain text with no formatting or tags.
      
      Example output:
      "Hi! Sorry I missed your call. I'll get back to you as soon as I can. Thanks for reaching out!"
    `;
    const response = await autoResponseClient.chat.completions.create({
      model: "gpt-4o",
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: `Please generate an auto-response message for this situation: ${context}` }
      ],
      temperature: 0.7,
      max_tokens: 150
      // Keep responses concise
    });
    return response.choices[0]?.message?.content || "Sorry I missed you. I'll get back to you as soon as possible.";
  } catch (error) {
    console.error("Error generating auto-response:", error);
    return "Sorry I missed you. I'll get back to you as soon as possible.";
  }
}
function fallbackKeywordRouter(message) {
  const lowerMessage = message.toLowerCase();
  const result = {
    conversation_context: `User asked: "${message}"`
  };
  if (lowerMessage.includes("settings") || lowerMessage.includes("preference") || lowerMessage.includes("mode") || lowerMessage.includes("theme") || lowerMessage.includes("notification") || lowerMessage.includes("status") || lowerMessage.includes("availability") || lowerMessage.includes("profile") || lowerMessage.includes("language")) {
    result.settings_prompt = message;
    if (lowerMessage.includes("language")) {
      const englishMatch = /\b(english|en)\b/i.test(lowerMessage);
      const spanishMatch = /\b(spanish|español|espanol|es)\b/i.test(lowerMessage);
      const frenchMatch = /\b(french|français|francais|fr)\b/i.test(lowerMessage);
      const germanMatch = /\b(german|deutsch|de)\b/i.test(lowerMessage);
      const chineseMatch = /\b(chinese|中文|zh)\b/i.test(lowerMessage);
      const japaneseMatch = /\b(japanese|日本語|ja)\b/i.test(lowerMessage);
      if (englishMatch || spanishMatch || frenchMatch || germanMatch || chineseMatch || japaneseMatch) {
        let languageCode = "en";
        if (spanishMatch) languageCode = "es";
        else if (frenchMatch) languageCode = "fr";
        else if (germanMatch) languageCode = "de";
        else if (chineseMatch) languageCode = "zh";
        else if (japaneseMatch) languageCode = "ja";
        console.log(`Detected language change request to: ${languageCode}`);
        result.settings_response = {
          language: languageCode,
          language_name: languageCode === "en" ? "English" : languageCode === "es" ? "Spanish" : languageCode === "fr" ? "French" : languageCode === "de" ? "German" : languageCode === "zh" ? "Chinese" : languageCode === "ja" ? "Japanese" : "English"
        };
      }
    }
  }
  if (lowerMessage.includes("schedule") || lowerMessage.includes("meeting") || lowerMessage.includes("appointment") || lowerMessage.includes("event") || lowerMessage.includes("calendar") || lowerMessage.includes("book") || lowerMessage.includes("reschedule") || lowerMessage.includes("cancel")) {
    result.calendar_prompt = message;
  }
  if (lowerMessage.includes("message") || lowerMessage.includes("reply") || lowerMessage.includes("respond") || lowerMessage.includes("auto") || lowerMessage.includes("away") || lowerMessage.includes("busy") || lowerMessage.includes("unavailable") || lowerMessage.includes("out of office")) {
    result.message_prompt = message;
  }
  if (!result.settings_prompt && !result.calendar_prompt && !result.message_prompt) {
    result.clarification_prompt = "I'm not sure what you'd like to do. Could you please specify if you want to change settings, schedule an event, or create an auto-response message?";
    result.missing_fields = ["request_type"];
  }
  return result;
}
async function routeInputToApis(message, conversationContext) {
  try {
    const routingClient = getOpenAIClient("general");
    if (!process.env.OPENAI_API_KEY) {
      console.warn("No OpenAI API key available, using fallback keyword router");
      return fallbackKeywordRouter(message);
    }
    let systemPrompt = `
      You are an AI assistant that routes user requests to the appropriate specialized API. 
      Based on the user's message, determine which of the following APIs should handle the request:
      
      1. settings_api - For changing app settings, preferences, availability status, etc.
      2. calendar_api - For scheduling, rescheduling, or canceling events and meetings.
      3. message_api - For generating professional auto-response messages when the user is unavailable.
      
      Analyze the user's message and output a JSON object with the following structure:
      {
        "settings_prompt": "...", // Include only if the message contains a settings-related request (null otherwise)
        "calendar_prompt": "...", // Include only if the message contains a calendar-related request (null otherwise)
        "message_prompt": "...", // Include only if the message contains a message generation request (null otherwise)
        "clarification_prompt": "...", // Include only if more information is needed to process the request (null otherwise)
        "missing_fields": ["field1", "field2"], // List any missing information needed for the request (empty if none)
        "conversation_context": "..." // A summary of the current conversation context for future requests
      }
      
      If the user's intent is unclear or lacks specific information, return a clarification_prompt and missing_fields.
      Don't make up information - only route to APIs where the user has provided the necessary context.
      
      Example 1: "Change my status to away and write an auto-reply that I'm on vacation until Friday"
      Should return both settings_prompt and message_prompt.
      
      Example 2: "Schedule a meeting" (lacks details like when, with whom, etc.)
      Should return clarification_prompt and missing_fields.
      
      ALWAYS include a brief "conversation_context" that summarizes the current request and relevant details.
      This will be used to maintain context in follow-up requests.
    `;
    if (conversationContext) {
      systemPrompt += `

IMPORTANT: This is a follow-up to a previous conversation. Here's the context:
${conversationContext}

Please consider this context when determining how to route the user's current message.`;
    }
    const response = await routingClient.chat.completions.create({
      model: "gpt-4o",
      // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: message }
      ],
      temperature: 0.2,
      // Low temperature for more consistent routing decisions
      max_tokens: 1e3,
      response_format: { type: "json_object" }
    });
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("No content in response from OpenAI");
    }
    return JSON.parse(content);
  } catch (error) {
    console.error("Error routing input to APIs:", error);
    console.log("Using fallback keyword router due to OpenAI API error");
    return fallbackKeywordRouter(message);
  }
}

// server/routes.ts
import { z as z2 } from "zod";

// server/routes/publicProfile.ts
import { eq as eq2 } from "drizzle-orm";
var registerPublicProfileRoutes = (app2) => {
  app2.get("/api/public-profile/:username", async (req, res) => {
    try {
      const { username } = req.params;
      if (!username) {
        return res.status(400).json({ error: "Username is required" });
      }
      const user = await db.select().from(users).where(eq2(users.username, username));
      if (user && user.length > 0) {
        const userData = user[0];
        const services2 = [
          {
            id: "1",
            name: "Consultation",
            description: "Initial client consultation",
            duration: 60,
            price: 150
          },
          {
            id: "2",
            name: "Strategy Session",
            description: "Business strategy planning",
            duration: 90,
            price: 250
          },
          {
            id: "3",
            name: "Follow-up Meeting",
            description: "Project follow-up and review",
            duration: 30,
            price: 100
          }
        ];
        const profileResponse = {
          username: userData.username,
          name: userData.name,
          businessName: userData.name + "'s Business",
          // Default business name
          profession: "Professional",
          // Default profession
          email: userData.email,
          phone: "Not provided",
          // Default phone
          bio: "No bio available",
          // Default bio
          profileImage: userData.avatarUrl || "",
          // Profile image
          services: services2
        };
        return res.json(profileResponse);
      }
      try {
        const providers = await db.select().from(serviceProviders).where(eq2(serviceProviders.email, username));
        if (providers && providers.length > 0) {
          const provider = providers[0];
          const services2 = await storage.getServicesByProvider(provider.id);
          const profileResponse = {
            username,
            name: `${provider.firstName} ${provider.lastName}`,
            businessName: provider.businessName,
            profession: provider.profession,
            email: provider.email,
            phone: provider.phone,
            bio: provider.voicemailMessage || "No bio available",
            // Using voicemail message as bio for now
            profileImage: provider.profileImage || "",
            services: services2.map((s) => ({
              id: s.id.toString(),
              name: s.name,
              description: s.description || "",
              duration: s.duration,
              price: s.price
            }))
          };
          return res.json(profileResponse);
        }
      } catch (providerError) {
        console.error("Error fetching provider:", providerError);
      }
      return res.status(404).json({
        error: "Profile not found",
        message: "No user or service provider found with the given username"
      });
    } catch (error) {
      console.error("Error fetching public profile:", error);
      res.status(500).json({ error: "Failed to fetch profile data" });
    }
  });
  app2.post("/api/generate-profile-link", async (req, res) => {
    try {
      const { userId } = req.body;
      if (!userId) {
        return res.status(400).json({ error: "User ID is required" });
      }
      const user = await storage.getUser(parseInt(userId));
      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }
      const profileLink = `${req.protocol}://${req.get("host")}/p/${user.username}`;
      res.json({
        profileLink,
        username: user.username
      });
    } catch (error) {
      console.error("Error generating profile link:", error);
      res.status(500).json({ error: "Failed to generate profile link" });
    }
  });
};

// server/routes/ai.ts
import { Router } from "express";

// server/ai.ts
import OpenAI2 from "openai";
var openai = new OpenAI2({ apiKey: process.env.OPENAI_API_KEY });
async function updateSettings(settingName, value) {
  return `Updated ${settingName} to ${value}`;
}
async function createMessage(toAddress, subject, body) {
  return `Message to ${toAddress} created successfully`;
}
async function processCommand(command) {
  try {
    const prompt = `Parse the following user command and identify the intended action. 

User command: "${command}"

Classify the command into one of these categories:
1. create_task - Creating a new task
2. update_settings - Changing a setting
3. create_message - Sending a message
4. unknown - If the command doesn't fit any of the above

Respond with a JSON object in the following format:
{
  "action": "create_task|update_settings|create_message|unknown",
  "success": true,
  "task": {
    "title": "task title",
    "description": "task description",
    "priority": "high|normal|low",
    "category": "category name"
  },
  "setting": {
    "name": "setting name",
    "value": "setting value"
  },
  "message": {
    "to": "recipient",
    "subject": "subject line",
    "body": "message body"
  },
  "result": "Human-readable result of the operation"
}

Only include the relevant fields based on the identified action. If action is "unknown", include a helpful result message suggesting valid commands.`;
    const response = await openai.chat.completions.create({
      model: "gpt-4",
      // Using stable GPT-4 model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1e3,
      response_format: { type: "json_object" }
    });
    const content = response.choices[0].message.content;
    const parsedResponse = JSON.parse(content || "{}");
    switch (parsedResponse.action) {
      case "create_task":
        return {
          success: true,
          action: "create_task",
          task: parsedResponse.task,
          result: `Created new ${parsedResponse.task.priority} priority task: ${parsedResponse.task.title}`
        };
      case "update_settings":
        if (parsedResponse.setting) {
          const result = await updateSettings(parsedResponse.setting.name, parsedResponse.setting.value);
          return {
            success: true,
            action: "update_settings",
            result
          };
        }
        break;
      case "create_message":
        if (parsedResponse.message) {
          const result = await createMessage(
            parsedResponse.message.to,
            parsedResponse.message.subject,
            parsedResponse.message.body
          );
          return {
            success: true,
            action: "create_message",
            result
          };
        }
        break;
      case "unknown":
      default:
        return {
          success: false,
          action: "unknown",
          result: parsedResponse.result || "I'm not sure how to process that command. Try asking me to create a task, update a setting, or send a message."
        };
    }
    return parsedResponse;
  } catch (error) {
    console.error("Error processing command:", error);
    return {
      success: false,
      action: "error",
      result: "Sorry, I couldn't process that command due to a technical issue."
    };
  }
}

// server/routes/ai.ts
var router = Router();
router.post("/process-command", async (req, res) => {
  try {
    const { command } = req.body;
    if (!command || typeof command !== "string") {
      return res.status(400).json({
        success: false,
        result: "Invalid command. Please provide a text command."
      });
    }
    const result = await processCommand(command);
    return res.json(result);
  } catch (error) {
    console.error("Error processing command:", error);
    return res.status(500).json({
      success: false,
      result: "An error occurred while processing your command."
    });
  }
});
router.post("/task-suggestions", async (req, res) => {
  try {
    const { tasks: tasks2, context } = req.body;
    if (!Array.isArray(tasks2)) {
      return res.status(400).json({
        success: false,
        result: "Invalid tasks data. Please provide an array of tasks."
      });
    }
    const result = {
      success: true,
      suggestions: [
        {
          title: "Review project requirements",
          description: "Ensure all requirements are understood and documented",
          priority: "high",
          category: "Planning"
        },
        {
          title: "Set up development environment",
          description: "Install necessary tools and dependencies",
          priority: "normal",
          category: "Setup"
        },
        {
          title: "Create project timeline",
          description: "Define milestones and deadlines",
          priority: "high",
          category: "Planning"
        }
      ]
    };
    return res.json(result);
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return res.status(500).json({
      success: false,
      result: "An error occurred while generating task suggestions."
    });
  }
});
router.post("/task-summary", async (req, res) => {
  try {
    const { tasks: tasks2 } = req.body;
    if (!Array.isArray(tasks2)) {
      return res.status(400).json({
        success: false,
        result: "Invalid tasks data. Please provide an array of tasks."
      });
    }
    const result = {
      success: true,
      summary: "You have 5 high priority tasks due this week, with most focus needed on the project proposal due tomorrow. Consider rescheduling some lower priority tasks to free up time for the critical deliverables."
    };
    return res.json(result);
  } catch (error) {
    console.error("Error generating summary:", error);
    return res.status(500).json({
      success: false,
      result: "An error occurred while generating the task summary."
    });
  }
});
var ai_default = router;

// server/routes/bookings.ts
import { Router as Router2 } from "express";
import { eq as eq3 } from "drizzle-orm";
var router2 = Router2();
router2.get("/", async (req, res) => {
  try {
    const allBookings = await db.select().from(bookings);
    res.json(allBookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});
router2.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [booking] = await db.select().from(bookings).where(eq3(bookings.id, id));
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Failed to fetch booking" });
  }
});
router2.post("/", async (req, res) => {
  try {
    const isFromProfile = req.body.source === "profile" || Boolean(req.body.clientEmail);
    const defaultStatus = isFromProfile ? "pending" : "confirmed";
    console.log(`Booking request - source: ${req.body.source}, clientEmail: ${req.body.clientEmail}, isFromProfile: ${isFromProfile}`);
    let clientId = parseInt(req.body.clientId) || null;
    const clientName = req.body.clientName || "Client";
    const clientEmail = req.body.clientEmail;
    const clientPhone = req.body.clientPhone;
    if (!clientId || clientId === 1) {
      try {
        const allClients = await db.select().from(clients);
        let matchingClient = null;
        const nameParts = clientName.trim().split(" ");
        const searchFirstName = nameParts[0] || clientName;
        const searchLastName = nameParts.slice(1).join(" ") || "";
        if (clientPhone) {
          const normalizedPhone = clientPhone.replace(/\D/g, "");
          if (normalizedPhone.length >= 10) {
            matchingClient = allClients.find((client) => {
              if (!client.phone) return false;
              const clientNormalizedPhone = client.phone.replace(/\D/g, "");
              return clientNormalizedPhone === normalizedPhone;
            });
            if (matchingClient) {
              console.log(`Found client by phone match: "${clientPhone}" -> "${matchingClient.firstName} ${matchingClient.lastName}" (ID ${matchingClient.id})`);
            }
          }
        }
        if (!matchingClient && clientEmail) {
          matchingClient = allClients.find((client) => {
            return client.email && client.email.toLowerCase() === clientEmail.toLowerCase();
          });
          if (matchingClient) {
            console.log(`Found client by email match: "${clientEmail}" -> "${matchingClient.firstName} ${matchingClient.lastName}" (ID ${matchingClient.id})`);
          }
        }
        if (!matchingClient && searchFirstName && searchLastName) {
          matchingClient = allClients.find((client) => {
            return client.firstName.toLowerCase() === searchFirstName.toLowerCase() && client.lastName.toLowerCase() === searchLastName.toLowerCase();
          });
          if (matchingClient) {
            console.log(`Found client by first+last name match: "${searchFirstName} ${searchLastName}" -> "${matchingClient.firstName} ${matchingClient.lastName}" (ID ${matchingClient.id})`);
          }
        }
        if (!matchingClient) {
          matchingClient = allClients.find((client) => {
            const fullName = `${client.firstName} ${client.lastName}`.trim();
            return fullName.toLowerCase() === clientName.trim().toLowerCase();
          });
          if (matchingClient) {
            console.log(`Found client by full name exact match: "${clientName}" -> "${matchingClient.firstName} ${matchingClient.lastName}" (ID ${matchingClient.id})`);
          }
        }
        if (!matchingClient && searchFirstName) {
          matchingClient = allClients.find((client) => {
            return client.firstName.toLowerCase() === searchFirstName.toLowerCase();
          });
          if (matchingClient) {
            console.log(`Found client by first name match: "${searchFirstName}" -> "${matchingClient.firstName} ${matchingClient.lastName}" (ID ${matchingClient.id})`);
          }
        }
        if (!matchingClient && searchLastName) {
          matchingClient = allClients.find((client) => {
            return client.lastName.toLowerCase() === searchLastName.toLowerCase();
          });
          if (matchingClient) {
            console.log(`Found client by last name match: "${searchLastName}" -> "${matchingClient.firstName} ${matchingClient.lastName}" (ID ${matchingClient.id})`);
          }
        }
        if (!matchingClient) {
          const normalizedSearchName = clientName.trim().toLowerCase().replace(/\s+/g, " ");
          matchingClient = allClients.find((client) => {
            const fullName = `${client.firstName} ${client.lastName}`.trim();
            const normalizedClientName = fullName.toLowerCase().replace(/\s+/g, " ");
            return normalizedClientName.includes(normalizedSearchName) || normalizedSearchName.includes(normalizedClientName);
          });
          if (matchingClient) {
            console.log(`Found client by fuzzy name match: "${clientName}" -> "${matchingClient.firstName} ${matchingClient.lastName}" (ID ${matchingClient.id})`);
          }
        }
        if (matchingClient) {
          clientId = matchingClient.id;
        } else {
          if (isFromProfile) {
            let potentialDuplicate = false;
            let duplicateReason = "";
            if (clientPhone) {
              const normalizedPhone = clientPhone.replace(/\D/g, "");
              if (normalizedPhone.length >= 10) {
                const similarPhone = allClients.find((client) => {
                  if (!client.phone) return false;
                  const clientNormalizedPhone = client.phone.replace(/\D/g, "");
                  return clientNormalizedPhone.length >= 10 && Math.abs(clientNormalizedPhone.length - normalizedPhone.length) <= 2;
                });
                if (similarPhone) {
                  potentialDuplicate = true;
                  duplicateReason = `similar phone number to "${similarPhone.firstName} ${similarPhone.lastName}" (${similarPhone.phone})`;
                }
              }
            }
            if (!potentialDuplicate) {
              const similarName = allClients.find((client) => {
                const firstMatch = client.firstName.toLowerCase() === searchFirstName.toLowerCase();
                const lastMatch = searchLastName && client.lastName.toLowerCase() === searchLastName.toLowerCase();
                return firstMatch || lastMatch;
              });
              if (similarName) {
                potentialDuplicate = true;
                duplicateReason = `similar name to "${similarName.firstName} ${similarName.lastName}"`;
              }
            }
            if (potentialDuplicate) {
              console.log(`Potential duplicate detected for "${clientName}" - ${duplicateReason}. Creating anyway with note.`);
            }
            const [newClient] = await db.insert(clients).values({
              firstName: searchFirstName,
              lastName: searchLastName,
              email: clientEmail,
              phone: clientPhone || null,
              company: null,
              address: null,
              createdAt: /* @__PURE__ */ new Date()
            }).returning();
            clientId = newClient.id;
            console.log(`Created new client "${searchFirstName} ${searchLastName}" (ID ${clientId}) for profile booking${potentialDuplicate ? " - flagged as potential duplicate" : ""}`);
          } else {
            console.log(`No client found matching "${clientName}" across all fields`);
            clientId = 1;
          }
        }
      } catch (error) {
        console.error("Error handling client:", error);
        clientId = 1;
      }
    }
    const bookingData = {
      date: req.body.date || (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      time: req.body.time || "10:00 AM",
      duration: parseInt(req.body.duration) || 60,
      type: req.body.type === "consultation" || req.body.type === "appointment" || req.body.type === "follow_up" || req.body.type === "check_in" ? req.body.type : "meeting",
      status: req.body.status || defaultStatus,
      location: req.body.location || "",
      notes: req.body.notes || "",
      clientId,
      serviceId: req.body.serviceId || "1",
      priority: req.body.priority || "normal",
      externalId: req.body.externalId || Date.now().toString(),
      clientName,
      clientPhone: req.body.clientPhone || "",
      serviceName: req.body.serviceName || "",
      servicePrice: req.body.servicePrice || "",
      professionalId: req.body.professionalId || "1"
    };
    const [newBooking] = await db.insert(bookings).values([bookingData]).returning();
    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(400).json({
      message: "Failed to create booking",
      error: error instanceof Error ? error.message : "Unknown error"
    });
  }
});
router2.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const bookingData = req.body;
    if (bookingData.status === "confirmed") {
      const [existingBooking] = await db.select().from(bookings).where(eq3(bookings.id, id));
      if (existingBooking && existingBooking.clientName) {
        const [existingClient] = await db.select().from(clients).where(eq3(clients.id, existingBooking.clientId));
        if (existingClient) {
          console.log(`Booking ${id} accepted - client "${existingClient.name}" (ID ${existingClient.id}) is now confirmed`);
        }
      }
    }
    const [updatedBooking] = await db.update(bookings).set(bookingData).where(eq3(bookings.id, id)).returning();
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Failed to update booking" });
  }
});
router2.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(bookings).where(eq3(bookings.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Failed to delete booking" });
  }
});
var bookings_default = router2;

// server/routes.ts
function getDisplayNameForPath(path3) {
  const pathMap = {
    "/": "Home",
    "/dashboard": "Dashboard",
    "/clients": "Clients",
    "/projects": "Projects",
    "/tasks": "Tasks",
    "/invoices": "Invoices",
    "/calendar": "Calendar",
    "/settings": "Settings",
    "/profile": "Profile"
  };
  if (pathMap[path3]) {
    return pathMap[path3];
  }
  if (path3.startsWith("/clients/")) {
    return "Client Details";
  } else if (path3.startsWith("/projects/")) {
    return "Project Details";
  } else if (path3.startsWith("/tasks/")) {
    return "Task Details";
  } else if (path3.startsWith("/invoices/")) {
    return "Invoice Details";
  }
  return path3.split("/").filter(Boolean).map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1)).join(" ");
}
function getDisplayNameForElement(elementId) {
  const elementMap = {
    "nav-dashboard": "Dashboard menu item",
    "nav-clients": "Clients menu item",
    "nav-projects": "Projects menu item",
    "nav-tasks": "Tasks menu item",
    "nav-invoices": "Invoices menu item",
    "nav-calendar": "Calendar menu item",
    "nav-settings": "Settings menu item",
    "create-client-btn": "Create Client button",
    "create-project-btn": "Create Project button",
    "create-task-btn": "Create Task button",
    "create-invoice-btn": "Create Invoice button",
    "unified-assistant-btn": "Assistant button"
  };
  if (elementMap[elementId]) {
    return elementMap[elementId];
  }
  if (elementId.startsWith("client-")) {
    return "Client item";
  } else if (elementId.startsWith("project-")) {
    return "Project item";
  } else if (elementId.startsWith("task-")) {
    return "Task item";
  } else if (elementId.startsWith("invoice-")) {
    return "Invoice item";
  } else if (elementId.endsWith("-edit-btn")) {
    return "Edit button";
  } else if (elementId.endsWith("-delete-btn")) {
    return "Delete button";
  } else if (elementId.endsWith("-save-btn")) {
    return "Save button";
  } else if (elementId.endsWith("-cancel-btn")) {
    return "Cancel button";
  }
  return elementId.split("-").map((word) => word.charAt(0).toUpperCase() + word.slice(1)).join(" ");
}
async function registerRoutes(app2) {
  const apiRouter = Router3();
  apiRouter.get("/health", (req, res) => {
    res.json({ status: "ok" });
  });
  apiRouter.post("/register", async (req, res) => {
    try {
      const signupSchema = insertUserSchema.extend({
        fullName: z2.string().min(1, "Full name is required")
      });
      const { fullName, ...userData } = signupSchema.parse({
        ...req.body,
        // Default username if not provided
        username: req.body.username || req.body.email
      });
      const nameParts = fullName.trim().split(/\s+/);
      const name = nameParts.length > 0 ? nameParts.join(" ") : fullName;
      const user = await storage.createUser({
        ...userData,
        name
      });
      const { password, ...userWithoutPassword } = user;
      res.status(201).json({
        message: "User registered successfully",
        user: userWithoutPassword
      });
    } catch (error) {
      console.error("Error registering user:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Validation failed",
          errors: error.errors
        });
      }
      res.status(500).json({ message: "Failed to register user" });
    }
  });
  apiRouter.get("/clients", async (req, res) => {
    const clients2 = await storage.getClients();
    res.json(clients2);
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
      if (error instanceof z2.ZodError) {
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
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update client" });
    }
  });
  app2.get("/api/clients/:id/check-dependencies", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      const restrictions = [];
      try {
        const events3 = await storage.getEvents("user-1");
        const clientEvents = events3.filter((event) => event.clientId === id);
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
      try {
        const clientProjects = await storage.getProjectsByClient(id);
        if (clientProjects.length > 0) {
          restrictions.push({
            type: "projects",
            count: clientProjects.length,
            message: "This client has active projects."
          });
          for (const project of clientProjects) {
            const tasks2 = await storage.getTasksByProject(project.id);
            if (tasks2.length > 0) {
              restrictions.push({
                type: "tasks",
                count: tasks2.length,
                projectId: project.id,
                projectName: project.name,
                message: `This client has ${tasks2.length} active tasks in project "${project.name}".`
              });
              break;
            }
          }
        }
      } catch (err) {
        console.log("Error checking projects:", err);
      }
      return res.status(200).json({
        canDelete: restrictions.length === 0,
        restrictions,
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
      try {
        const deleted = await storage.deleteClient(id);
        if (!deleted) {
          return res.status(404).json({ message: "Client not found" });
        }
        res.status(204).end();
      } catch (deleteError) {
        console.log("Delete error:", deleteError);
        if (deleteError && (deleteError.code === "23503" || deleteError.message && deleteError.message.includes("foreign key constraint"))) {
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
  apiRouter.post("/clients/cleanup", async (req, res) => {
    try {
      const unconnectedClients = await storage.getUnconnectedClients();
      const duplicateClients = await storage.getDuplicateClients();
      const clientsByEmail = {};
      duplicateClients.forEach((client) => {
        if (client.email) {
          const email = client.email.toLowerCase().trim();
          if (!clientsByEmail[email]) {
            clientsByEmail[email] = [];
          }
          clientsByEmail[email].push(client);
        }
      });
      const unconnectedResults = await Promise.all(
        unconnectedClients.map(async (client) => {
          try {
            const deleted = await storage.deleteClient(client.id);
            return {
              id: client.id,
              name: `${client.firstName} ${client.lastName}`,
              email: client.email || "",
              deleted,
              reason: "unconnected"
            };
          } catch (error) {
            return {
              id: client.id,
              name: `${client.firstName} ${client.lastName}`,
              email: client.email || "",
              deleted: false,
              error: error instanceof Error ? error.message : String(error),
              reason: "unconnected"
            };
          }
        })
      );
      const duplicateResults = [];
      for (const email in clientsByEmail) {
        const clientsWithEmail = clientsByEmail[email];
        if (clientsWithEmail.length <= 1) continue;
        const [keepClient, ...duplicatesToDelete] = clientsWithEmail;
        for (const dupeClient of duplicatesToDelete) {
          try {
            const clientProjects = await storage.getProjectsByClient(dupeClient.id);
            if (clientProjects.length > 0) {
              duplicateResults.push({
                id: dupeClient.id,
                name: `${dupeClient.firstName} ${dupeClient.lastName}`,
                email: dupeClient.email || "",
                deleted: false,
                reason: "duplicate_with_projects",
                keepId: keepClient.id,
                keepName: `${keepClient.firstName} ${keepClient.lastName}`,
                error: "Client has associated projects and cannot be deleted"
              });
              continue;
            }
            const deleted = await storage.deleteClient(dupeClient.id);
            duplicateResults.push({
              id: dupeClient.id,
              name: `${dupeClient.firstName} ${dupeClient.lastName}`,
              email: dupeClient.email || "",
              deleted,
              reason: "duplicate",
              keepId: keepClient.id,
              keepName: `${keepClient.firstName} ${keepClient.lastName}`
            });
          } catch (error) {
            duplicateResults.push({
              id: dupeClient.id,
              name: `${dupeClient.firstName} ${dupeClient.lastName}`,
              email: dupeClient.email || "",
              deleted: false,
              reason: "duplicate",
              keepId: keepClient.id,
              keepName: `${keepClient.firstName} ${keepClient.lastName}`,
              error: error instanceof Error ? error.message : String(error)
            });
          }
        }
      }
      res.json({
        unconnected: {
          count: unconnectedClients.length,
          deleted: unconnectedResults.filter((r) => r.deleted).length,
          results: unconnectedResults
        },
        duplicates: {
          count: duplicateClients.length,
          duplicateEmails: Object.keys(clientsByEmail).length,
          deleted: duplicateResults.filter((r) => r.deleted).length,
          results: duplicateResults
        },
        totalDeleted: unconnectedResults.filter((r) => r.deleted).length + duplicateResults.filter((r) => r.deleted).length
      });
    } catch (error) {
      console.error("Error cleaning up clients:", error);
      res.status(500).json({
        message: "Failed to clean up clients",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  apiRouter.get("/projects", async (req, res) => {
    try {
      const clientId = req.query.clientId ? parseInt(req.query.clientId) : void 0;
      if (clientId) {
        if (isNaN(clientId)) {
          return res.status(400).json({ message: "Invalid client ID" });
        }
        const projects3 = await storage.getProjectsByClient(clientId);
        return res.json(projects3);
      }
      const projects2 = await storage.getProjects();
      res.json(projects2);
    } catch (error) {
      console.error("Error fetching projects:", error);
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
      const { name, description, clientId, status, startDate, endDate, budget } = req.body;
      if (!name || typeof name !== "string" || name.trim().length < 2) {
        return res.status(400).json({
          message: "Invalid project data",
          errors: [{ path: ["name"], message: "Name must be at least 2 characters" }]
        });
      }
      const projectData = {
        name: name.trim(),
        description: description || null,
        clientId: clientId || null,
        // Allow null for personal projects
        status: status || "not_started",
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        budget: budget ? Number(budget) : null
      };
      console.log("Parsed project data:", projectData);
      const project = await storage.createProject(projectData);
      console.log("Created project:", project);
      res.status(201).json(project);
    } catch (error) {
      console.error("Project creation error:", error);
      res.status(500).json({ message: "Failed to create project" });
    }
  });
  apiRouter.patch("/projects/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    try {
      console.log("Received project update data:", req.body);
      const { name, description, clientId, status, startDate, endDate, budget } = req.body;
      const projectData = {};
      if (name !== void 0) projectData.name = name;
      if (description !== void 0) projectData.description = description || null;
      if (clientId !== void 0) projectData.clientId = clientId || null;
      if (status !== void 0) projectData.status = status;
      if (startDate !== void 0) projectData.startDate = startDate ? new Date(startDate) : null;
      if (endDate !== void 0) projectData.endDate = endDate ? new Date(endDate) : null;
      if (budget !== void 0) projectData.budget = budget ? Number(budget) : null;
      console.log("Updating project with data:", projectData);
      const project = await storage.updateProject(id, projectData);
      if (!project) {
        return res.status(404).json({ message: "Project not found" });
      }
      res.json(project);
    } catch (error) {
      if (error instanceof z2.ZodError) {
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
  apiRouter.get("/tasks", async (req, res) => {
    const projectId = req.query.projectId ? parseInt(req.query.projectId) : void 0;
    if (projectId) {
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      const tasks3 = await storage.getTasksByProject(projectId);
      return res.json(tasks3);
    }
    const tasks2 = await storage.getTasks();
    res.json(tasks2);
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
      console.log("Received task data:", JSON.stringify(req.body, null, 2));
      const taskData = insertTaskSchema.parse(req.body);
      console.log("Parsed task data:", JSON.stringify(taskData, null, 2));
      const task = await storage.createTask(taskData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z2.ZodError) {
        console.log("Validation errors:", JSON.stringify(error.errors, null, 2));
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      console.error("Task creation error:", error);
      res.status(500).json({ message: "Failed to create task" });
    }
  });
  apiRouter.patch("/tasks/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid task ID" });
    }
    try {
      const taskData = z2.object({
        title: z2.string().optional(),
        description: z2.string().nullable().optional(),
        projectId: z2.number().optional(),
        status: z2.enum([
          TaskStatus.TO_DO,
          TaskStatus.IN_PROGRESS,
          TaskStatus.REVIEW,
          TaskStatus.COMPLETED
        ]).optional(),
        priority: z2.enum([
          TaskPriority.LOW,
          TaskPriority.MEDIUM,
          TaskPriority.HIGH,
          TaskPriority.URGENT
        ]).optional(),
        deadline: z2.string().nullable().optional().transform((val) => val ? new Date(val) : null),
        completed: z2.boolean().optional()
      }).parse(req.body);
      const task = await storage.updateTask(id, taskData);
      if (!task) {
        return res.status(404).json({ message: "Task not found" });
      }
      res.json(task);
    } catch (error) {
      if (error instanceof z2.ZodError) {
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
  apiRouter.get("/time-entries", async (req, res) => {
    const projectId = req.query.projectId ? parseInt(req.query.projectId) : void 0;
    const taskId = req.query.taskId ? parseInt(req.query.taskId) : void 0;
    if (projectId) {
      if (isNaN(projectId)) {
        return res.status(400).json({ message: "Invalid project ID" });
      }
      const entries2 = await storage.getTimeEntriesByProject(projectId);
      return res.json(entries2);
    }
    if (taskId) {
      if (isNaN(taskId)) {
        return res.status(400).json({ message: "Invalid task ID" });
      }
      const entries2 = await storage.getTimeEntriesByTask(taskId);
      return res.json(entries2);
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
      if (error instanceof z2.ZodError) {
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
      if (error instanceof z2.ZodError) {
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
  apiRouter.get("/invoices", async (req, res) => {
    const clientId = req.query.clientId ? parseInt(req.query.clientId) : void 0;
    if (clientId) {
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      const invoices3 = await storage.getInvoicesByClient(clientId);
      return res.json(invoices3);
    }
    const invoices2 = await storage.getInvoices();
    res.json(invoices2);
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
      if (error instanceof z2.ZodError) {
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
      if (error instanceof z2.ZodError) {
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
      if (error instanceof z2.ZodError) {
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
      if (error instanceof z2.ZodError) {
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
  apiRouter.get("/events", async (req, res) => {
    try {
      const userId = req.query.userId || "user-1";
      try {
        const events3 = await storage.getEvents(userId);
        res.json(events3);
      } catch (dbError) {
        console.log("Database error, falling back to in-memory events:", dbError);
        const events3 = await getEvents(userId);
        res.json(events3);
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
      if (!title) {
        return res.status(400).json({ message: "Title is required" });
      }
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
  apiRouter.patch("/events/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid event ID" });
      }
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
      const updateData = {};
      if (title !== void 0) updateData.title = title;
      if (description !== void 0) updateData.description = description || null;
      if (location !== void 0) updateData.location = location || null;
      if (clientName !== void 0) updateData.clientName = clientName || null;
      if (isConfirmed !== void 0) updateData.isConfirmed = Boolean(isConfirmed);
      if (eventType !== void 0) updateData.eventType = eventType || "busy";
      if (color !== void 0) updateData.color = color || null;
      if (userId !== void 0) updateData.userId = userId;
      if (startTime !== void 0) {
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
      if (endTime !== void 0) {
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
      if (error instanceof z2.ZodError) {
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
      if (error instanceof z2.ZodError) {
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
  apiRouter.get("/dashboard", async (req, res) => {
    const projects2 = await storage.getProjects();
    const tasks2 = await storage.getTasks();
    const timeEntries2 = await storage.getTimeEntries();
    const invoices2 = await storage.getInvoices();
    const activeProjects = projects2.filter((p) => p.status === "in_progress").length;
    const paidInvoices = invoices2.filter((i) => i.status === "paid");
    const pendingInvoices = invoices2.filter((i) => i.status === "sent");
    const overdueInvoices = invoices2.filter((i) => i.status === "overdue");
    const totalPaid = paidInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalPending = pendingInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalOverdue = overdueInvoices.reduce((sum, inv) => sum + inv.amount, 0);
    const totalMinutes = timeEntries2.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    const completedTasks = tasks2.filter((t) => t.completed).length;
    const totalTasks = tasks2.length;
    res.json({
      activeProjects,
      recentProjects: projects2.slice(0, 5),
      monthlyEarnings: totalPaid,
      hoursTracked: `${hours}h ${minutes}m`,
      tasksCompleted: `${completedTasks}/${totalTasks}`,
      tasksCompletionRate: totalTasks > 0 ? completedTasks / totalTasks * 100 : 0,
      recentTasks: tasks2.slice(0, 5),
      invoiceSummary: {
        paid: totalPaid,
        pending: totalPending,
        overdue: totalOverdue
      },
      recentInvoices: invoices2.slice(0, 3),
      recentTimeEntries: timeEntries2.slice(0, 5)
    });
  });
  apiRouter.post("/ai/chat", async (req, res) => {
    try {
      const { message, history } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ message: "Invalid request. 'message' must be a string." });
      }
      const generalChatClient = getOpenAIClient("general");
      const messages = [
        { role: "system", content: `You are a helpful freelancer business assistant. You provide detailed, practical advice for freelancers managing their business.

IMPORTANT PRIORITY ORDER:
1. If the user mentions ANY scheduling terms (meeting, appointment, calendar, schedule, etc.), ALWAYS respond with: "I notice you want to schedule something. Please use the Scheduling Assistant tab to directly add this to your calendar. Would you like me to help with anything else?"
2. If the user mentions changing settings, ALWAYS respond with: "To change your app settings, please use the App Settings tab where you can use natural language to update your preferences. Would you like me to help with anything else?"
3. Only if the message contains NO scheduling or settings requests, provide helpful business advice.

When providing business advice, be thorough and organized with clear sections.

Remember: The most helpful thing you can do is direct users to the specialized tools for scheduling and settings rather than just giving advice about these topics.` }
      ];
      if (Array.isArray(history)) {
        const recentHistory = history.slice(-10);
        messages.push(...recentHistory);
      }
      messages.push({ role: "user", content: message });
      const response = await generalChatClient.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages,
        // Type casting to fix TypeScript error
        temperature: 0.7,
        max_tokens: 500
      });
      const responseContent = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
      res.json({ message: responseContent });
    } catch (error) {
      console.error("Error in AI chat:", error);
      if (error instanceof z2.ZodError) {
        return res.status(400).json({
          message: "Invalid request format",
          errors: error.errors
        });
      }
      if (error instanceof Error && error.message.includes("OpenAI")) {
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
      if (!request || typeof request !== "string") {
        return res.status(400).json({ message: "Invalid request. 'request' must be a string." });
      }
      const userId = req.query.userId || "user-1";
      const userSchedule = schedule || await storage.getEvents(userId);
      const schedulingResponse = await processSchedulingRequest(userSchedule, request);
      if (schedulingResponse.action === "create" && schedulingResponse.event_title && schedulingResponse.start_time && schedulingResponse.end_time) {
        try {
          const newEvent = await storage.createEvent({
            userId,
            title: schedulingResponse.event_title,
            description: schedulingResponse.notes,
            startTime: new Date(schedulingResponse.start_time),
            endTime: new Date(schedulingResponse.end_time),
            isConfirmed: schedulingResponse.status === "confirmed",
            eventType: "client_meeting"
            // Default event type
          });
          schedulingResponse.event_id = newEvent.id;
        } catch (createError) {
          console.error("Error creating event:", createError);
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
      const userIdToUse = userId || "user-1";
      const timeframeToUse = timeframe || "upcoming";
      const events3 = await storage.getEvents(userIdToUse);
      const summary = await generateScheduleSummary(events3, timeframeToUse);
      res.json({ summary });
    } catch (error) {
      console.error("Error generating schedule summary:", error);
      res.status(500).json({
        message: "Failed to generate schedule summary",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  apiRouter.post("/ai/app-settings", async (req, res) => {
    try {
      const { message } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({ message: "Invalid request. 'message' must be a string." });
      }
      const settingsClient = getOpenAIClient("settings");
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
      const response = await settingsClient.chat.completions.create({
        model: "gpt-4o",
        // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
        temperature: 0.1,
        // Low temperature for more consistent outputs
        max_tokens: 300,
        response_format: { type: "json_object" }
      });
      const content = response.choices[0]?.message?.content;
      if (!content) {
        throw new Error("No content in response from OpenAI");
      }
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
  apiRouter.post("/ai/auto-response", async (req, res) => {
    try {
      const { context } = req.body;
      const contextToUse = typeof context === "string" ? context : "missed call";
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
  apiRouter.post("/command", async (req, res) => {
    try {
      const { message, userId = "user-1", conversationContext } = req.body;
      if (!message || typeof message !== "string") {
        return res.status(400).json({
          message: "Invalid request. 'message' must be a string."
        });
      }
      let commandRecord;
      try {
        commandRecord = await storage.createAiCommand({
          userId,
          userPrompt: message,
          commandType: "unified",
          status: "success"
        });
        console.log("Created AI command record:", commandRecord.id);
      } catch (dbError) {
        console.error("Error creating AI command record:", dbError);
      }
      let routingResult;
      try {
        routingResult = await routeInputToApis(message, conversationContext);
      } catch (routingError) {
        console.error("Error during API routing:", routingError);
        if (commandRecord) {
          try {
            await storage.updateAiCommand(commandRecord.id, { status: "error" });
          } catch (updateError) {
            console.error("Error updating AI command status:", updateError);
          }
        }
        return res.json({
          status: "needs_clarification",
          ask_user: "I'm sorry, but I'm having trouble understanding your request right now. Could you try again later or contact support if the issue persists?"
        });
      }
      if (routingResult.clarification_prompt) {
        return res.json({
          status: "needs_clarification",
          ask_user: routingResult.clarification_prompt,
          missing_fields: routingResult.missing_fields || [],
          conversation_context: routingResult.conversation_context || conversationContext
        });
      }
      const results = {
        status: "success",
        conversation_context: routingResult.conversation_context || conversationContext
      };
      if (routingResult.settings_prompt) {
        try {
          if (routingResult.settings_response) {
            console.log("Using direct settings response from keyword router");
            results.settings = routingResult.settings_response;
            if (commandRecord) {
              try {
                await storage.createAiCommandEffect({
                  commandId: commandRecord.id,
                  effectType: "update_settings",
                  targetType: "settings",
                  targetId: null,
                  details: JSON.stringify(routingResult.settings_response)
                });
              } catch (effectError) {
                console.error("Error recording settings effect:", effectError);
              }
            }
          } else {
            const settingsClient = getOpenAIClient("settings");
            const settingsResponse = await settingsClient.chat.completions.create({
              model: "gpt-4o",
              messages: [
                {
                  role: "system",
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
                { role: "user", content: routingResult.settings_prompt }
              ],
              temperature: 0.1,
              max_tokens: 300,
              response_format: { type: "json_object" }
            });
            const settingsContent = settingsResponse.choices[0]?.message?.content;
            if (settingsContent) {
              const parsedSettings = JSON.parse(settingsContent);
              if (parsedSettings.language) {
                const languageMap = {
                  "english": "en",
                  "spanish": "es",
                  "french": "fr",
                  "german": "de",
                  "chinese": "zh",
                  "japanese": "ja"
                };
                const lowerCaseLanguage = parsedSettings.language.toLowerCase();
                if (languageMap[lowerCaseLanguage]) {
                  console.log(`Converting language name "${parsedSettings.language}" to code "${languageMap[lowerCaseLanguage]}"`);
                  parsedSettings.language = languageMap[lowerCaseLanguage];
                }
              }
              results.settings = parsedSettings;
              if (commandRecord) {
                try {
                  await storage.createAiCommandEffect({
                    commandId: commandRecord.id,
                    effectType: "update_settings",
                    targetType: "settings",
                    targetId: null,
                    details: settingsContent
                  });
                } catch (effectError) {
                  console.error("Error recording OpenAI settings effect:", effectError);
                }
              }
            }
          }
        } catch (settingsError) {
          console.error("Error processing settings:", settingsError);
          if (routingResult.settings_response) {
            results.settings = routingResult.settings_response;
          } else {
            results.settings_error = "Unable to process settings request";
          }
        }
      }
      if (routingResult.calendar_prompt) {
        try {
          const userId2 = "user-1";
          const schedule = await storage.getEvents(userId2);
          let calendarResponse;
          try {
            calendarResponse = await processSchedulingRequest(schedule, routingResult.calendar_prompt);
          } catch (e) {
            console.log("Using fallback calendar processing due to API error");
            const userInput = routingResult.calendar_prompt.toLowerCase();
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
            const now = /* @__PURE__ */ new Date();
            let startDate = /* @__PURE__ */ new Date();
            startDate.setHours(10, 0, 0, 0);
            console.log(`Parsing date/time from user input: "${userInput}"`);
            startDate.setHours(10, 0, 0, 0);
            if (userInput.includes("tomorrow")) {
              console.log("Found 'tomorrow' in input - setting date to tomorrow");
              startDate.setDate(startDate.getDate() + 1);
            } else if (userInput.includes("today")) {
              console.log("Found 'today' in input - keeping date as today");
            } else {
              const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
              let foundMonth = false;
              for (let i = 0; i < monthNames.length; i++) {
                if (userInput.includes(monthNames[i])) {
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
              if (!foundMonth) {
                const dateMatch = userInput.match(/(\d{1,2})[\/\-](\d{1,2})/);
                if (dateMatch) {
                  const month = parseInt(dateMatch[1], 10) - 1;
                  const day = parseInt(dateMatch[2], 10);
                  if (month >= 0 && month < 12 && day >= 1 && day <= 31) {
                    console.log(`Found date format MM/DD: ${month + 1}/${day}`);
                    startDate.setMonth(month);
                    startDate.setDate(day);
                  }
                }
              }
              if (!foundMonth && !userInput.includes("today")) {
                console.log("No specific date found in input - defaulting to tomorrow");
                startDate.setDate(startDate.getDate() + 1);
              }
            }
            let foundTime = false;
            const timeMatch = userInput.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
            if (timeMatch) {
              let hour = parseInt(timeMatch[1], 10);
              const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
              const meridian = timeMatch[3].toLowerCase();
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
            const endDate = new Date(startDate);
            endDate.setHours(endDate.getHours() + 1);
            calendarResponse = {
              action: "create",
              event_title: eventTitle,
              start_time: startDate.toISOString(),
              end_time: endDate.toISOString(),
              status: "confirmed",
              notes: `Meeting scheduled for ${startDate.toLocaleString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "numeric",
                minute: "numeric"
              })}. Created from user request: "${routingResult.calendar_prompt}". Today's date is ${(/* @__PURE__ */ new Date()).toLocaleDateString("en-US", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric"
              })}.`,
              event_id: void 0
              // Add this to match the SchedulingResponse interface
            };
          }
          if (calendarResponse.action === "create" && calendarResponse.event_title && calendarResponse.start_time && calendarResponse.end_time) {
            try {
              const newEvent = await storage.createEvent({
                userId: userId2,
                title: calendarResponse.event_title,
                description: calendarResponse.notes,
                startTime: new Date(calendarResponse.start_time),
                endTime: new Date(calendarResponse.end_time),
                isConfirmed: calendarResponse.status === "confirmed",
                eventType: "client_meeting"
                // Default event type
              });
              calendarResponse.event_id = newEvent.id;
              if (commandRecord) {
                try {
                  await storage.createAiCommandEffect({
                    commandId: commandRecord.id,
                    effectType: "create_event",
                    targetType: "event",
                    targetId: newEvent.id.toString(),
                    details: JSON.stringify({
                      title: newEvent.title,
                      start: newEvent.startTime,
                      end: newEvent.endTime
                    })
                  });
                } catch (effectError) {
                  console.error("Error recording AI command effect:", effectError);
                }
              }
            } catch (createError) {
              console.error("Error creating event:", createError);
            }
          } else if (calendarResponse.action === "delete" || calendarResponse.action === "cancel") {
            try {
              let eventId = calendarResponse.event_id;
              let eventTitle = calendarResponse.event_title;
              let deletedEvent = null;
              if (eventId) {
                deletedEvent = await storage.deleteEvent(eventId);
              } else if (eventTitle) {
                const allEvents = await storage.getEvents(userId2);
                const matchingEvents = allEvents.filter(
                  (event) => event.title.toLowerCase().includes(eventTitle.toLowerCase())
                );
                if (matchingEvents.length === 1) {
                  deletedEvent = await storage.deleteEvent(matchingEvents[0].id);
                  eventId = matchingEvents[0].id;
                } else if (matchingEvents.length > 1) {
                  calendarResponse.status = "conflict";
                  calendarResponse.notes = `Found multiple events matching "${eventTitle}". Please specify which one to delete by using a more specific title or mentioning the date.`;
                } else {
                  calendarResponse.status = "conflict";
                  calendarResponse.notes = `No events found matching "${eventTitle}". Please check the title and try again.`;
                }
              }
              if (deletedEvent) {
                calendarResponse.status = "deleted";
                if (commandRecord && eventId) {
                  try {
                    await storage.createAiCommandEffect({
                      commandId: commandRecord.id,
                      effectType: "delete_event",
                      targetType: "event",
                      targetId: eventId.toString(),
                      details: JSON.stringify({
                        title: eventTitle || "Unknown event"
                      })
                    });
                  } catch (effectError) {
                    console.error("Error recording delete event effect:", effectError);
                  }
                }
              }
            } catch (error) {
              const deleteError = error;
              console.error("Error deleting event:", deleteError);
              calendarResponse.status = "conflict";
              calendarResponse.notes = `Error deleting event: ${deleteError.message || String(deleteError)}`;
            }
          }
          results.calendar = calendarResponse;
        } catch (calendarError) {
          console.error("Error processing calendar request:", calendarError);
          results.calendar_error = "Unable to process calendar request";
        }
      }
      if (routingResult.message_prompt) {
        try {
          const messageResponse = await generateAutoResponse(routingResult.message_prompt);
          results.message = messageResponse;
        } catch (messageError) {
          console.error("Error generating auto-response:", messageError);
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
  apiRouter.post("/navigation/track", async (req, res) => {
    try {
      const { userId, path: path3, fromPath, sessionId, timeOnPage, clickedElements = [] } = req.body;
      const validatedTimeOnPage = timeOnPage && !isNaN(Number(timeOnPage)) ? Number(timeOnPage) : null;
      if (!userId || !path3 || !sessionId) {
        return res.status(400).json({
          message: "Invalid request. 'userId', 'path', and 'sessionId' are required."
        });
      }
      const navigationData = {
        userId,
        path: path3,
        fromPath,
        sessionId,
        timestamp: /* @__PURE__ */ new Date(),
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
      const patterns = [];
      const pathFrequency = {};
      const fromToMap = {};
      for (const nav of navigations) {
        pathFrequency[nav.path] = (pathFrequency[nav.path] || 0) + 1;
        if (nav.fromPath) {
          const transition = `${nav.fromPath}|${nav.path}`;
          fromToMap[transition] = (fromToMap[transition] || 0) + 1;
        }
      }
      for (const transition in fromToMap) {
        const [fromPath, toPath] = transition.split("|");
        const frequency = fromToMap[transition];
        const relevantNavs = navigations.filter(
          (nav) => nav.fromPath === fromPath && nav.path === toPath && nav.timeOnPage !== null
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
      const navigations = await storage.getNavigationEventsByPathAndUser(
        currentPath,
        userId
      );
      const nextPathCount = {};
      const elementsClickedCount = {};
      for (const nav of navigations) {
        if (nav.fromPath === currentPath) {
          nextPathCount[nav.path] = (nextPathCount[nav.path] || 0) + 1;
        }
        if (nav.clickedElements) {
          try {
            const elements = JSON.parse(nav.clickedElements);
            elements.forEach((element) => {
              elementsClickedCount[element] = (elementsClickedCount[element] || 0) + 1;
            });
          } catch (e) {
            console.error("Error parsing clicked elements:", e);
          }
        }
      }
      const recommendedPaths = Object.entries(nextPathCount).map(([path3, count2]) => ({
        path: path3,
        displayName: getDisplayNameForPath(path3),
        confidence: count2 / navigations.length
      })).sort((a, b) => b.confidence - a.confidence);
      const frequentElements = Object.entries(elementsClickedCount).map(([element, count2]) => ({
        element,
        displayName: getDisplayNameForElement(element),
        frequency: count2
      })).sort((a, b) => b.frequency - a.frequency);
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
      if (error instanceof z2.ZodError) {
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
      if (error instanceof z2.ZodError) {
        return res.status(400).json({ message: "Invalid preferences data", errors: error.errors });
      }
      console.error("Error updating user preferences:", error);
      res.status(500).json({
        message: "Failed to update user preferences",
        error: error instanceof Error ? error.message : String(error)
      });
    }
  });
  apiRouter.get("/auto-responses", async (req, res) => {
    const userId = req.query.userId || "demo";
    const type = req.query.type;
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
    const userId = req.query.userId || "demo";
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
      if (error instanceof z2.ZodError) {
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
      if (error instanceof z2.ZodError) {
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
  apiRouter.post("/verify/send-email", async (req, res) => {
    try {
      const { userId, email } = req.body;
      if (!userId || !email) {
        return res.status(400).json({ message: "User ID and email are required" });
      }
      const token = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const expiry = new Date(Date.now() + 24 * 60 * 60 * 1e3);
      const user = await storage.getUserByUsername(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log(`Email verification token for ${email}: ${token}`);
      await storage.updateUser(user.id, {
        emailVerificationToken: token,
        emailVerificationExpiry: expiry
      });
      res.json({
        message: "Verification email sent successfully",
        // In development, return the token for testing
        ...process.env.NODE_ENV === "development" && { token }
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
      if (user.emailVerificationToken !== token) {
        return res.status(400).json({ message: "Invalid verification token" });
      }
      if (!user.emailVerificationExpiry || /* @__PURE__ */ new Date() > user.emailVerificationExpiry) {
        return res.status(400).json({ message: "Verification token has expired" });
      }
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
      const token = Math.floor(1e5 + Math.random() * 9e5).toString();
      const expiry = new Date(Date.now() + 10 * 60 * 1e3);
      const user = await storage.getUserByUsername(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      console.log(`SMS verification code for ${phone}: ${token}`);
      await storage.updateUser(user.id, {
        phoneVerificationToken: token,
        phoneVerificationExpiry: expiry
      });
      res.json({
        message: "Verification SMS sent successfully",
        // In development, return the token for testing
        ...process.env.NODE_ENV === "development" && { token }
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
      if (user.phoneVerificationToken !== token) {
        return res.status(400).json({ message: "Invalid verification code" });
      }
      if (!user.phoneVerificationExpiry || /* @__PURE__ */ new Date() > user.phoneVerificationExpiry) {
        return res.status(400).json({ message: "Verification code has expired" });
      }
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
  app2.use("/api", apiRouter);
  registerPublicProfileRoutes(app2);
  app2.use("/api/ai", ai_default);
  app2.use("/api/bookings", bookings_default);
  const httpServer = createServer(app2);
  return httpServer;
}

// server/vite.ts
import express from "express";
import fs from "fs";
import path2 from "path";
import { createServer as createViteServer, createLogger } from "vite";

// vite.config.ts
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
var vite_config_default = defineConfig({
  plugins: [
    react(),
    runtimeErrorOverlay(),
    ...process.env.NODE_ENV !== "production" && process.env.REPL_ID !== void 0 ? [
      await import("@replit/vite-plugin-cartographer").then(
        (m) => m.cartographer()
      )
    ] : []
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true
  }
});

// server/vite.ts
import { nanoid } from "nanoid";
var viteLogger = createLogger();
function log(message, source = "express") {
  const formattedTime = (/* @__PURE__ */ new Date()).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
    second: "2-digit",
    hour12: true
  });
  console.log(`${formattedTime} [${source}] ${message}`);
}
async function setupVite(app2, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    customLogger: {
      ...viteLogger,
      error: (msg, options) => {
        viteLogger.error(msg, options);
        process.exit(1);
      }
    },
    server: serverOptions,
    appType: "custom"
  });
  app2.use(vite.middlewares);
  app2.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app2) {
  const distPath = path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    throw new Error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app2.use(express.static(distPath));
  app2.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/index.ts
var app = express2();
app.use(express2.json());
app.use(express2.urlencoded({ extended: false }));
app.use((req, res, next) => {
  const start = Date.now();
  const path3 = req.path;
  let capturedJsonResponse = void 0;
  const originalResJson = res.json;
  res.json = function(bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };
  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path3.startsWith("/api")) {
      let logLine = `${req.method} ${path3} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }
      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "\u2026";
      }
      log(logLine);
    }
  });
  next();
});
(async () => {
  const server = await registerRoutes(app);
  app.use((err, _req, res, _next) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    console.error("Error:", err);
    res.status(status).json({ message });
  });
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  const port = process.env.PORT || 5e3;
  server.listen(port, "0.0.0.0", () => {
    log(`serving on port ${port}`);
  });
})();
