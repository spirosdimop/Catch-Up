import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { apiRequest } from "./queryClient";

export { apiRequest };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

export function formatTime(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "numeric",
    minute: "numeric",
    hour12: true,
  }).format(date);
}

export function generateTimeSlots(date: Date, duration: number = 30): { time: string; available: boolean }[] {
  const slots = [];
  const startTime = new Date(date);
  startTime.setHours(9, 0, 0, 0); // Start at 9:00 AM
  
  const endTime = new Date(date);
  endTime.setHours(17, 0, 0, 0); // End at 5:00 PM
  
  while (startTime < endTime) {
    const time = formatTime(startTime);
    
    // Simulate availability (in a real app, this would be determined by database)
    const available = Math.random() > 0.3; // 70% chance of availability
    
    slots.push({ time, available });
    
    // Add duration in minutes
    startTime.setMinutes(startTime.getMinutes() + duration);
  }
  
  return slots;
}

export function getInitials(name: string): string {
  if (!name) return "";
  
  const parts = name.split(" ");
  if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
  
  return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
}

export function truncateText(text: string, maxLength: number): string {
  if (!text) return "";
  if (text.length <= maxLength) return text;
  
  return text.slice(0, maxLength) + "...";
}

export function formatDuration(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const remainingSeconds = seconds % 60;
  
  return [
    hours.toString().padStart(2, '0'),
    minutes.toString().padStart(2, '0'),
    remainingSeconds.toString().padStart(2, '0')
  ].join(':');
}

export function formatDurationHuman(seconds: number): string {
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours === 0) {
    return `${minutes}m`;
  } else if (minutes === 0) {
    return `${hours}h`;
  } else {
    return `${hours}h ${minutes}m`;
  }
}

export function formatTimeBetween(startTime: string | Date, endTime: string | Date): string {
  const start = typeof startTime === 'string' ? new Date(startTime) : startTime;
  const end = typeof endTime === 'string' ? new Date(endTime) : endTime;
  
  return `${formatTime(start)} - ${formatTime(end)}`;
}

export function formatCurrency(amount: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
}

interface InvoiceItem {
  id?: number;
  description: string;
  quantity: number;
  rate: number;
  amount?: number;
}

interface InvoiceSummary {
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  items: Array<InvoiceItem & { amount: number }>;
}

export function calculateInvoiceSummary(
  items: InvoiceItem[], 
  taxRate: number = 0
): InvoiceSummary {
  // Calculate amount for each item
  const processedItems = items.map(item => ({
    ...item,
    amount: (item.amount !== undefined) ? item.amount : item.quantity * item.rate
  }));
  
  // Calculate subtotal
  const subtotal = processedItems.reduce((sum, item) => sum + item.amount, 0);
  
  // Calculate tax amount
  const taxAmount = subtotal * (taxRate / 100);
  
  // Calculate total
  const totalAmount = subtotal + taxAmount;
  
  return {
    subtotal,
    taxAmount,
    totalAmount,
    items: processedItems
  };
}