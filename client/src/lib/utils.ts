import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

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