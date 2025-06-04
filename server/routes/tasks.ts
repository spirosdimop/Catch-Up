import { Router } from "express";
import { z } from "zod";
import * as tasks from "../services/tasks.service";
import { insertTaskSchema, TaskPriority, TaskStatus } from "@shared/schema";

const router = Router();

router.get("/", async (req, res) => {
  const projectId = req.query.projectId ? parseInt(req.query.projectId as string) : undefined;
  if (projectId) {
    if (isNaN(projectId)) return res.status(400).json({ message: "Invalid project ID" });
    return res.json(await tasks.getTasksByProject(projectId));
  }
  res.json(await tasks.getTasks());
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid task ID" });
  const task = await tasks.getTask(id);
  if (!task) return res.status(404).json({ message: "Task not found" });
  res.json(task);
});

router.post("/", async (req, res) => {
  try {
    const data = insertTaskSchema.parse(req.body);
    const task = await tasks.createTask(data);
    res.status(201).json(task);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid task data", errors: err.errors });
    }
    res.status(500).json({ message: "Failed to create task" });
  }
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid task ID" });
  try {
    const updateSchema = z.object({
      title: z.string().optional(),
      description: z.string().nullable().optional(),
      projectId: z.number().optional(),
      status: z.enum([
        TaskStatus.TO_DO,
        TaskStatus.IN_PROGRESS,
        TaskStatus.REVIEW,
        TaskStatus.COMPLETED,
      ]).optional(),
      priority: z.enum([
        TaskPriority.LOW,
        TaskPriority.MEDIUM,
        TaskPriority.HIGH,
        TaskPriority.URGENT,
      ]).optional(),
      deadline: z.string().nullable().optional().transform(val => val ? new Date(val) : null),
      completed: z.boolean().optional()
    });
    const data = updateSchema.parse(req.body);
    const task = await tasks.updateTask(id, data);
    if (!task) return res.status(404).json({ message: "Task not found" });
    res.json(task);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid task data", errors: err.errors });
    }
    res.status(500).json({ message: "Failed to update task" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid task ID" });
  const deleted = await tasks.deleteTask(id);
  if (!deleted) return res.status(404).json({ message: "Task not found" });
  res.status(204).end();
});

export default router;
