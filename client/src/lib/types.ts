import { Client, Project, Task, TimeEntry, Invoice, InvoiceItem } from "@shared/schema";

// Dashboard types
export interface StatisticCard {
  title: string;
  value: string;
  icon: string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  color: 'primary' | 'secondary' | 'accent' | 'success';
  suffix?: React.ReactNode;
}

export interface ProjectWithClient extends Project {
  client?: Client;
}

export interface TaskWithProject extends Task {
  project?: Project;
}

export interface TimeEntryWithTask extends TimeEntry {
  task?: Task;
  project?: Project;
}

export interface InvoiceWithClient extends Invoice {
  client?: Client;
  project?: Project;
}

// Task status types
export type TaskStatus = 'To Do' | 'In Progress' | 'Review' | 'Completed';

// Project status types
export type ProjectStatus = 'Active' | 'Completed' | 'On Hold' | 'Cancelled';

// Invoice status types
export type InvoiceStatus = 'Draft' | 'Sent' | 'Paid' | 'Overdue';

// Priority types
export type PriorityLevel = 'Low' | 'Medium' | 'High' | 'Urgent';

// User profile info
export interface UserProfile {
  name: string;
  email: string;
  avatar?: string;
}

export interface WeekdaySummary {
  day: string;
  hours: number;
  label: string;
}

export interface InvoiceSummary {
  paid: number;
  pending: number;
  overdue: number;
  total: number;
}
