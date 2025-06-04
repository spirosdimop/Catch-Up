import { Router } from "express";
import { storage } from "../storage";
import { z } from "zod";

const router = Router();

// Get all projects or by client
router.get("/", async (req, res) => {
  try {
    const clientId = req.query.clientId ? parseInt(req.query.clientId as string) : undefined;
    if (clientId) {
      if (isNaN(clientId)) {
        return res.status(400).json({ message: "Invalid client ID" });
      }
      const projects = await storage.getProjectsByClient(clientId);
      return res.json(projects);
    }
    const projects = await storage.getProjects();
    res.json(projects);
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.json([]);
  }
});

// Get a project by ID
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid project ID" });
  }
  const project = await storage.getProject(id);
  if (!project) {
    return res.status(404).json({ message: "Project not found" });
  }
  res.json(project);
});

// Create a project
router.post("/", async (req, res) => {
  try {
    console.log("Received project data:", req.body);
    const { name, description, clientId, status, startDate, endDate, budget } = req.body;
    if (!name || typeof name !== 'string' || name.trim().length < 2) {
      return res.status(400).json({
        message: "Invalid project data",
        errors: [{ path: ['name'], message: 'Name must be at least 2 characters' }]
      });
    }
    const projectData = {
      name: name.trim(),
      description: description || null,
      clientId: clientId || null,
      status: status || "not_started",
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      budget: budget ? Number(budget) : null
    };
    console.log("Parsed project data:", projectData);
    const project = await storage.createProject(projectData);
    console.log("Created project:", project);
    res.status(201).json(project);
  } catch (error) {
    console.error("Project creation error:", error);
    res.status(500).json({ message: "Failed to create project" });
  }
});

// Update a project
router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid project ID" });
  }
  try {
    console.log("Received project update data:", req.body);
    const { name, description, clientId, status, startDate, endDate, budget } = req.body;
    const projectData: any = {};
    if (name !== undefined) projectData.name = name;
    if (description !== undefined) projectData.description = description || null;
    if (clientId !== undefined) projectData.clientId = clientId || null;
    if (status !== undefined) projectData.status = status;
    if (startDate !== undefined) projectData.startDate = startDate ? new Date(startDate) : null;
    if (endDate !== undefined) projectData.endDate = endDate ? new Date(endDate) : null;
    if (budget !== undefined) projectData.budget = budget ? Number(budget) : null;
    console.log("Updating project with data:", projectData);
    const project = await storage.updateProject(id, projectData);
    if (!project) {
      return res.status(404).json({ message: "Project not found" });
    }
    res.json(project);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid project data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to update project" });
  }
});

// Delete a project
router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid project ID" });
  }
  const deleted = await storage.deleteProject(id);
  if (!deleted) {
    return res.status(404).json({ message: "Project not found" });
  }
  res.status(204).end();
});

export default router;
