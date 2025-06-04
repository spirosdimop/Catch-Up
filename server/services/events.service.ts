import { storage } from "../storage";
import { InsertEvent, InsertEventTemplate } from "@shared/schema";

export const getEvents = (userId: string) => storage.getEvents(userId);
export const getEvent = (id: number) => storage.getEvent(id);
export const createEvent = (data: InsertEvent) => storage.createEvent(data);
export const updateEvent = (id: number, data: Partial<InsertEvent>) => storage.updateEvent(id, data);
export const deleteEvent = (id: number) => storage.deleteEvent(id);

export const getEventTemplates = (userId: string) => storage.getEventTemplates(userId);
export const getPublicEventTemplates = (userId: string) => storage.getPublicEventTemplates(userId);
export const getEventTemplate = (id: number) => storage.getEventTemplate(id);
export const createEventTemplate = (data: InsertEventTemplate) => storage.createEventTemplate(data);
export const updateEventTemplate = (id: number, data: Partial<InsertEventTemplate>) => storage.updateEventTemplate(id, data);
export const deleteEventTemplate = (id: number) => storage.deleteEventTemplate(id);
