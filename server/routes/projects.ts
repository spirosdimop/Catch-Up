import { Router } from "express";
import { z } from "zod";
import * as projects from "../services/projects.service";

const router = Router();

router.get("/", async (req, res) => {
  const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
  if (clientId) {
    if (isNaN(clientId)) return res.status(400).json({ message: "Invalid client ID" });
    return res.json(await projects.getProjectsByClient(clientId));
  }
  res.json(await projects.getProjects());
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid project ID" });
  const project = await projects.getProject(id);
  if (!project) return res.status(404).json({ message: "Project not found" });
  res.json(project);
});

router.post("/", async (req, res) => {
  try {
    const { name, description, clientId, status, startDate, endDate, budget } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({ message: "Invalid project data", errors: [{ path: ['name'], message: 'Name must be at least 2 characters' }] });
    }
    const data = {
      name: name.trim(),
      description: description || null,
      clientId: clientId || null,
      status: status || "not_started",
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      budget: budget ? Number(budget) : null
    };
    const project = await projects.createProject(data as any);
    res.status(201).json(project);
  } catch (err) {
    res.status(500).json({ message: "Failed to create project" });
  }
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid project ID" });
  try {
    const { name, description, clientId, status, startDate, endDate, budget } = req.body;
    const data: any = {};
    if (name !== undefined) data.name = name;
    if (description !== undefined) data.description = description || null;
    if (clientId !== undefined) data.clientId = clientId || null;
    if (status !== undefined) data.status = status;
    if (startDate !== undefined) data.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) data.endDate = endDate ? new Date(endDate) : null;
    if (budget !== undefined) data.budget = budget ? Number(budget) : null;
    const project = await projects.updateProject(id, data);
    if (!project) return res.status(404).json({ message: "Project not found" });
    res.json(project);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid project data", errors: err.errors });
    }
    res.status(500).json({ message: "Failed to update project" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid project ID" });
  const deleted = await projects.deleteProject(id);
  if (!deleted) return res.status(404).json({ message: "Project not found" });
  res.status(204).end();
});

export default router;
