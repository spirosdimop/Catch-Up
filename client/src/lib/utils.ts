
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { apiRequest } from "./queryClient";

export { apiRequest };

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return "—";
  
  try {
    // Convert string dates to Date objects
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    // Check if the date is valid before formatting
    if (!(dateObj instanceof Date) || isNaN(dateObj.getTime())) {
      console.error("Invalid date:", date);
      return "Invalid date";
    }
    
    return new Intl.DateTimeFormat("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    }).format(dateObj);
  } catch (error) {
    console.error("Error formatting date:", error);
    return "Invalid date";
  }
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

export function calculateWeeklySummary(date: Date): { day: string; hours: number; label: string }[] {
  const startOfWeek = new Date(date);
  const dayOfWeek = startOfWeek.getDay();
  startOfWeek.setDate(startOfWeek.getDate() - dayOfWeek);
  
  const summary = [];
  
  for (let i = 0; i < 7; i++) {
    const currentDate = new Date(startOfWeek);
    currentDate.setDate(startOfWeek.getDate() + i);
    
    const day = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][i];
    
    // Generate a random number of hours for demo purposes
    // In a real app, this would come from actual time entry data
    const hours = Math.random() * 8;
    
    summary.push({
      day,
      hours,
      label: day
    });
  }
  
  return summary;
}

export function getPriorityColor(priority: string): string {
  switch (priority.toLowerCase()) {
    case 'high':
      return 'bg-red-100 text-red-800';
    case 'medium':
      return 'bg-yellow-100 text-yellow-800';
    case 'low':
      return 'bg-green-100 text-green-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
}

export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'not_started':
      return 'gray';
    case 'in_progress':
      return 'blue';
    case 'on_hold':
      return 'yellow';
    case 'completed':
      return 'green';
    default:
      return 'gray';
  }
}
