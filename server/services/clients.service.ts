import { storage } from "../storage";
import { InsertClient } from "@shared/schema";

export const getClients = () => storage.getClients();
export const getClient = (id: number) => storage.getClient(id);
export const createClient = (data: InsertClient) => storage.createClient(data);
export const updateClient = (id: number, data: Partial<InsertClient>) => storage.updateClient(id, data);
export const deleteClient = (id: number) => storage.deleteClient(id);
export const getUnconnectedClients = () => storage.getUnconnectedClients();
export const getDuplicateClients = () => storage.getDuplicateClients();
export const getProjectsByClient = (id: number) => storage.getProjectsByClient(id);
export const getEvents = (userId: string) => storage.getEvents(userId);
export const getTasksByProject = (projectId: number) => storage.getTasksByProject(projectId);
