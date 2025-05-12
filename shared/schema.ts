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

export const insertProjectSchema = createInsertSchema(projects).pick({
  name: true,
  description: true,
  clientId: true,
  status: true,
  startDate: true,
  endDate: true,
  budget: true,
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

export const insertTaskSchema = createInsertSchema(tasks).pick({
  title: true,
  description: true,
  projectId: true,
  status: true,
  priority: true,
  deadline: true,
  completed: true,
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
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  providerId: integer("provider_id").notNull().references(() => serviceProviders.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  duration: integer("duration").notNull(), // in minutes
  price: doublePrecision("price").notNull(), // in EUR
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
});

export const insertServiceSchema = createInsertSchema(services).pick({
  providerId: true,
  name: true,
  duration: true,
  price: true,
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
  "travel"
]);

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
  isConfirmed: boolean("is_confirmed").default(false).notNull(),
  eventType: eventTypeEnum("event_type").default("busy").notNull(),
  color: text("color"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const insertEventSchema = createInsertSchema(events).pick({
  userId: true,
  title: true,
  description: true,
  startTime: true,
  endTime: true,
  location: true,
  clientName: true,
  isConfirmed: true,
  eventType: true,
  color: true,
});

export type Event = typeof events.$inferSelect;
export type InsertEvent = z.infer<typeof insertEventSchema>;

// Helper enum for frontend
export const EventType = {
  PRIVATE: 'private',
  BUSY: 'busy',
  AVAILABLE: 'available',
  TRAVEL: 'travel'
} as const;
