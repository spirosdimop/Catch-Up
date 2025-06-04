import { Router } from "express";
import { z } from "zod";
import * as clients from "../services/clients.service";
import { insertClientSchema } from "@shared/schema";

const router = Router();

router.get("/", async (_req, res) => {
  const list = await clients.getClients();
  res.json(list);
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid client ID" });
  const client = await clients.getClient(id);
  if (!client) return res.status(404).json({ message: "Client not found" });
  res.json(client);
});

router.post("/", async (req, res) => {
  try {
    const data = insertClientSchema.parse(req.body);
    const client = await clients.createClient(data);
    res.status(201).json(client);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid client data", errors: err.errors });
    }
    res.status(500).json({ message: "Failed to create client" });
  }
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid client ID" });
  try {
    const data = insertClientSchema.partial().parse(req.body);
    const client = await clients.updateClient(id, data);
    if (!client) return res.status(404).json({ message: "Client not found" });
    res.json(client);
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid client data", errors: err.errors });
    }
    res.status(500).json({ message: "Failed to update client" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid client ID" });
  const deleted = await clients.deleteClient(id);
  if (!deleted) return res.status(404).json({ message: "Client not found" });
  res.status(204).end();
});

router.post("/cleanup", async (_req, res) => {
  try {
    const unconnected = await clients.getUnconnectedClients();
    const duplicates = await clients.getDuplicateClients();
    res.json({ unconnected, duplicates });
  } catch (err) {
    res.status(500).json({ message: "Failed to clean up clients" });
  }
});

router.get("/:id/check-dependencies", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid client ID" });
  const restrictions: any[] = [];
  try {
    const events = await clients.getEvents("user-1");
    const clientEvents = events.filter(e => e.clientId === id);
    if (clientEvents.length) restrictions.push({ type: "events", count: clientEvents.length });
  } catch {}
  try {
    const projects = await clients.getProjectsByClient(id);
    if (projects.length) restrictions.push({ type: "projects", count: projects.length });
    for (const p of projects) {
      const tasks = await clients.getTasksByProject(p.id);
      if (tasks.length) {
        restrictions.push({ type: "tasks", count: tasks.length, projectId: p.id });
        break;
      }
    }
  } catch {}
  res.json({ canDelete: restrictions.length === 0, restrictions });
});

export default router;
