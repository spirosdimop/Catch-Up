import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { format, formatDistance, parseISO } from "date-fns";
import { 
  Client, Project, Task, TimeEntry, Invoice, 
  ProjectWithClient, TaskWithProject, TimeEntryWithTask, InvoiceWithClient, 
  InvoiceSummary, PriorityLevel, WeekdaySummary 
} from "./types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Format currency with 2 decimal places
export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "$0.00";
  const numericAmount = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
  }).format(numericAmount);
}

// Format date to readable format
export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "";
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMM d, yyyy");
}

// Format time to readable format
export function formatTime(time: Date | string | null | undefined): string {
  if (!time) return "";
  const timeObj = typeof time === "string" ? new Date(time) : time;
  return format(timeObj, "h:mm a");
}

// Format datetime to readable format
export function formatDateTime(datetime: Date | string | null | undefined): string {
  if (!datetime) return "";
  const datetimeObj = typeof datetime === "string" ? new Date(datetime) : datetime;
  return format(datetimeObj, "MMM d, yyyy h:mm a");
}

// Format duration in minutes to hours and minutes
export function formatDuration(minutes: number | null | undefined): string {
  if (minutes === null || minutes === undefined) return "0h 0m";
  const hours = Math.floor(minutes / 60);
  const mins = Math.floor(minutes % 60);
  
  if (hours === 0) {
    return `${mins}m`;
  } else if (mins === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${mins}m`;
  }
}

// Calculate time between two dates and return formatted string
export function formatTimeBetween(start: Date | string, end: Date | string): string {
  const startDate = typeof start === "string" ? new Date(start) : start;
  const endDate = typeof end === "string" ? new Date(end) : end;
  
  return `${format(startDate, "h:mm a")} - ${format(endDate, "h:mm a")}`;
}

// Get status color based on task/project status
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
    case 'on track':
    case 'completed':
    case 'done':
    case 'paid':
      return 'green';
    case 'on hold':
    case 'at risk':
    case 'pending':
    case 'in progress':
    case 'review':
      return 'yellow';
    case 'cancelled':
    case 'overdue':
      return 'red';
    default:
      return 'blue';
  }
}

// Get priority color
export function getPriorityColor(priority: PriorityLevel): string {
  switch (priority) {
    case 'Low':
      return 'blue';
    case 'Medium':
      return 'blue';
    case 'High':
      return 'yellow';
    case 'Urgent':
      return 'red';
    default:
      return 'gray';
  }
}

// Format relative time (e.g., 3 days ago)
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistance(dateObj, new Date(), { addSuffix: true });
}

// Calculate invoice summary (paid, pending, overdue amounts)
export function calculateInvoiceSummary(invoices: Invoice[]): InvoiceSummary {
  const summary = {
    paid: 0,
    pending: 0,
    overdue: 0,
    total: 0
  };
  
  invoices.forEach(invoice => {
    const amount = Number(invoice.amount);
    summary.total += amount;
    
    switch (invoice.status.toLowerCase()) {
      case 'paid':
        summary.paid += amount;
        break;
      case 'sent':
      case 'pending':
        summary.pending += amount;
        break;
      case 'overdue':
        summary.overdue += amount;
        break;
    }
  });
  
  return summary;
}

// Calculate weekly hours summary
export function calculateWeeklySummary(timeEntries: TimeEntry[]): WeekdaySummary[] {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  // Initialize with zero hours
  const summary = days.map(day => ({
    day,
    hours: 0,
    label: '0h'
  }));
  
  // Group by day and sum durations
  timeEntries.forEach(entry => {
    if (!entry.startTime || !entry.duration) return;
    
    const date = new Date(entry.startTime);
    const dayIndex = date.getDay() === 0 ? 6 : date.getDay() - 1; // Adjust to Mon-Sun
    const hours = Number(entry.duration) / 60; // Convert minutes to hours
    
    summary[dayIndex].hours += hours;
    summary[dayIndex].label = `${summary[dayIndex].hours.toFixed(1)}h`;
  });
  
  return summary;
}
