import { Router } from "express";
import { storage } from "../storage";
import { insertTaskSchema, TaskStatus, TaskPriority } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get tasks, optionally by project
router.get("/", async (req, res) => {
  const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
  if (projectId) {
    if (isNaN(projectId)) {
      return res.status(400).json({ message: "Invalid project ID" });
    }
    const tasks = await storage.getTasksByProject(projectId);
    return res.json(tasks);
  }
  const tasks = await storage.getTasks();
  res.json(tasks);
});

// Get single task
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }
  const task = await storage.getTask(id);
  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }
  res.json(task);
});

// Create task
router.post("/", async (req, res) => {
  try {
    console.log("Received task data:", JSON.stringify(req.body, null, 2));
    const taskData = insertTaskSchema.parse(req.body);
    console.log("Parsed task data:", JSON.stringify(taskData, null, 2));
    const task = await storage.createTask(taskData);
    res.status(201).json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.log("Validation errors:", JSON.stringify(error.errors, null, 2));
      return res.status(400).json({ message: "Invalid task data", errors: error.errors });
    }
    console.error("Task creation error:", error);
    res.status(500).json({ message: "Failed to create task" });
  }
});

// Update task
router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }
  try {
    const taskData = z.object({
      title: z.string().optional(),
      description: z.string().nullable().optional(),
      projectId: z.number().optional(),
      status: z.enum([
        TaskStatus.TO_DO,
        TaskStatus.IN_PROGRESS,
        TaskStatus.REVIEW,
        TaskStatus.COMPLETED
      ]).optional(),
      priority: z.enum([
        TaskPriority.LOW,
        TaskPriority.MEDIUM,
        TaskPriority.HIGH,
        TaskPriority.URGENT
      ]).optional(),
      deadline: z.string().nullable().optional().transform(val => val ? new Date(val) : null),
      completed: z.boolean().optional()
    }).parse(req.body);
    const task = await storage.updateTask(id, taskData);
    if (!task) {
      return res.status(404).json({ message: "Task not found" });
    }
    res.json(task);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid task data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to update task" });
  }
});

// Delete task
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid task ID" });
  }
  const deleted = await storage.deleteTask(id);
  if (!deleted) {
    return res.status(404).json({ message: "Task not found" });
  }
  res.status(204).end();
});

export default router;
