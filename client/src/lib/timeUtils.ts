import { UserData } from './userContext';

/**
 * Formats time according to user preference (12-hour or 24-hour format)
 */
export function formatTime(time: string, user?: UserData | null): string {
  if (!time) return '';
  
  const timeFormat = user?.timeFormat || '12';
  
  // If already in 24-hour format and user wants 24-hour, return as is
  if (timeFormat === '24' && time.match(/^\d{2}:\d{2}$/)) {
    return time;
  }
  
  // If already in 12-hour format and user wants 12-hour, return as is
  if (timeFormat === '12' && time.match(/^\d{1,2}:\d{2}\s?(AM|PM|am|pm)$/i)) {
    return time;
  }
  
  try {
    // Parse the time string
    let hours: number;
    let minutes: number;
    let isPM = false;
    
    if (time.match(/^\d{2}:\d{2}$/)) {
      // 24-hour format input
      const [h, m] = time.split(':').map(Number);
      hours = h;
      minutes = m;
    } else if (time.match(/^\d{1,2}:\d{2}\s?(AM|PM|am|pm)$/i)) {
      // 12-hour format input
      const timeMatch = time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM|am|pm)$/i);
      if (!timeMatch) return time;
      
      hours = parseInt(timeMatch[1]);
      minutes = parseInt(timeMatch[2]);
      isPM = timeMatch[3].toLowerCase() === 'pm';
      
      // Convert to 24-hour for processing
      if (isPM && hours !== 12) hours += 12;
      if (!isPM && hours === 12) hours = 0;
    } else {
      return time; // Return original if format not recognized
    }
    
    // Format according to user preference
    if (timeFormat === '24') {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
    } else {
      // Convert to 12-hour format
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const period = hours >= 12 ? 'PM' : 'AM';
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    }
  } catch (error) {
    console.error('Error formatting time:', error);
    return time; // Return original on error
  }
}

/**
 * Converts time from any format to 24-hour format for storage
 */
export function convertTo24Hour(time: string): string {
  if (!time) return '';
  
  // Already in 24-hour format
  if (time.match(/^\d{2}:\d{2}$/)) {
    return time;
  }
  
  // Convert from 12-hour format
  const timeMatch = time.match(/^(\d{1,2}):(\d{2})\s?(AM|PM|am|pm)$/i);
  if (!timeMatch) return time;
  
  let hours = parseInt(timeMatch[1]);
  const minutes = parseInt(timeMatch[2]);
  const isPM = timeMatch[3].toLowerCase() === 'pm';
  
  if (isPM && hours !== 12) hours += 12;
  if (!isPM && hours === 12) hours = 0;
  
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
}

/**
 * Converts time from 24-hour format to 12-hour format
 */
export function convertTo12Hour(time: string): string {
  if (!time) return '';
  
  // Already in 12-hour format
  if (time.match(/^\d{1,2}:\d{2}\s?(AM|PM|am|pm)$/i)) {
    return time;
  }
  
  // Convert from 24-hour format
  const [hoursStr, minutesStr] = time.split(':');
  const hours = parseInt(hoursStr);
  const minutes = parseInt(minutesStr);
  
  const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
  const period = hours >= 12 ? 'PM' : 'AM';
  
  return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
}

/**
 * Generates time options for select dropdowns based on user preference
 */
export function generateTimeOptions(user?: UserData | null, startHour = 0, endHour = 23, interval = 30): string[] {
  const options: string[] = [];
  const timeFormat = user?.timeFormat || '12';
  
  for (let hour = startHour; hour <= endHour; hour++) {
    for (let minute = 0; minute < 60; minute += interval) {
      const time24 = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
      const formattedTime = formatTime(time24, user);
      options.push(formattedTime);
    }
  }
  
  return options;
}

/**
 * Gets the appropriate input type for time based on user preference
 */
export function getTimeInputType(user?: UserData | null): 'time' | 'text' {
  // HTML time input always uses 24-hour format, so we'll use text input for 12-hour format
  return user?.timeFormat === '24' ? 'time' : 'text';
}

/**
 * Validates time format based on user preference
 */
export function isValidTimeFormat(time: string, user?: UserData | null): boolean {
  if (!time) return false;
  
  const timeFormat = user?.timeFormat || '12';
  
  if (timeFormat === '24') {
    return /^\d{2}:\d{2}$/.test(time);
  } else {
    return /^\d{1,2}:\d{2}\s?(AM|PM|am|pm)$/i.test(time);
  }
}