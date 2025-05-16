import { Event, InsertEvent, EventType } from "@shared/schema";

// In-memory storage for events (temporary solution while database connection is fixed)
const events = new Map<number, Event>();
let eventIdCounter = 1;

// Get all events for a user
export async function getEvents(userId: string): Promise<Event[]> {
  return Array.from(events.values())
    .filter(event => event.userId === userId)
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
}

// Get a specific event by ID
export async function getEvent(id: number): Promise<Event | undefined> {
  return events.get(id);
}

// Create a new event
export async function createEvent(event: InsertEvent): Promise<Event> {
  const id = eventIdCounter++;
  const now = new Date();
  
  const newEvent: Event = {
    id,
    ...event,
    startTime: new Date(event.startTime),
    endTime: new Date(event.endTime),
    createdAt: now,
    updatedAt: now
  };
  
  events.set(id, newEvent);
  return newEvent;
}

// Update an existing event
export async function updateEvent(id: number, event: Partial<InsertEvent>): Promise<Event | undefined> {
  const existingEvent = events.get(id);
  if (!existingEvent) {
    return undefined;
  }
  
  const updatedEvent = { 
    ...existingEvent, 
    ...event,
    updatedAt: new Date(),
    // Handle date conversion if dates are provided
    ...(event.startTime ? { startTime: new Date(event.startTime) } : {}),
    ...(event.endTime ? { endTime: new Date(event.endTime) } : {})
  };
  
  events.set(id, updatedEvent);
  return updatedEvent;
}

// Delete an event
export async function deleteEvent(id: number): Promise<boolean> {
  return events.delete(id);
}