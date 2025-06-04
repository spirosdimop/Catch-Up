import { storage } from "../storage";
import { InsertTask } from "@shared/schema";

export const getTasks = () => storage.getTasks();
export const getTasksByProject = (projectId: number) => storage.getTasksByProject(projectId);
export const getTask = (id: number) => storage.getTask(id);
export const createTask = (data: InsertTask) => storage.createTask(data);
export const updateTask = (id: number, data: Partial<InsertTask>) => storage.updateTask(id, data);
export const deleteTask = (id: number) => storage.deleteTask(id);
