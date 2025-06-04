import { storage } from "../storage";
import { InsertProject } from "@shared/schema";

export const getProjects = () => storage.getProjects();
export const getProjectsByClient = (clientId: number) => storage.getProjectsByClient(clientId);
export const getProject = (id: number) => storage.getProject(id);
export const createProject = (data: InsertProject) => storage.createProject(data);
export const updateProject = (id: number, data: Partial<InsertProject>) => storage.updateProject(id, data);
export const deleteProject = (id: number) => storage.deleteProject(id);
