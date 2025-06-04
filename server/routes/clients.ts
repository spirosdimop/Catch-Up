import { Router } from "express";
import { storage } from "../storage";
import { insertClientSchema, type Client } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get all clients
router.get("/", async (_req, res) => {
  const clients = await storage.getClients();
  res.json(clients);
});

// Get a single client by ID
router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid client ID" });
  }

  const client = await storage.getClient(id);
  if (!client) {
    return res.status(404).json({ message: "Client not found" });
  }

  res.json(client);
});

// Create a client
router.post("/", async (req, res) => {
  try {
    const clientData = insertClientSchema.parse(req.body);
    const client = await storage.createClient(clientData);
    res.status(201).json(client);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid client data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to create client" });
  }
});

// Update a client
router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid client ID" });
  }

  try {
    const clientData = insertClientSchema.partial().parse(req.body);
    const client = await storage.updateClient(id, clientData);
    if (!client) {
      return res.status(404).json({ message: "Client not found" });
    }
    res.json(client);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid client data", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to update client" });
  }
});

// Check for dependencies before deletion
router.get("/:id/check-dependencies", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    const restrictions = [] as Array<Record<string, any>>;

    try {
      const events = await storage.getEvents("user-1");
      const clientEvents = events.filter(event => event.clientId === id);
      if (clientEvents.length > 0) {
        restrictions.push({
          type: "events",
          count: clientEvents.length,
          message: "This client has calendar events or bookings scheduled."
        });
      }
    } catch (err) {
      console.log("Error checking events:", err);
    }

    try {
      const clientProjects = await storage.getProjectsByClient(id);
      if (clientProjects.length > 0) {
        restrictions.push({
          type: "projects",
          count: clientProjects.length,
          message: "This client has active projects."
        });

        for (const project of clientProjects) {
          const tasks = await storage.getTasksByProject(project.id);
          if (tasks.length > 0) {
            restrictions.push({
              type: "tasks",
              count: tasks.length,
              projectId: project.id,
              projectName: project.name,
              message: `This client has ${tasks.length} active tasks in project \"${project.name}\".`
            });
            break;
          }
        }
      }
    } catch (err) {
      console.log("Error checking projects:", err);
    }

    return res.status(200).json({
      canDelete: restrictions.length === 0,
      restrictions,
      recommendations: restrictions.length > 0 ? [
        "Cancel or delete any bookings or events linked to this client",
        "Remove any projects or tasks associated with this client",
        "Archive the client instead of deleting if you need to keep their records"
      ] : []
    });
  } catch (error) {
    console.error("Error checking client dependencies:", error);
    res.status(500).json({
      message: "Failed to check client dependencies",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Delete a client
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid client ID" });
    }

    try {
      const deleted = await storage.deleteClient(id);
      if (!deleted) {
        return res.status(404).json({ message: "Client not found" });
      }

      res.status(204).end();
    } catch (deleteError) {
      console.log("Delete error:", deleteError);
      if (deleteError &&
          ((deleteError as any).code === '23503' ||
           ((deleteError as any).message && (deleteError as any).message.includes('foreign key constraint')))) {
        return res.status(400).json({
          message: "Cannot delete client with associated records",
          detail: "This client has bookings, events, or other records associated with them and cannot be deleted until these are removed.",
          recommendations: [
            "Cancel or delete any bookings or events linked to this client",
            "Remove any projects or tasks associated with this client",
            "Archive the client instead of deleting if you need to keep their records"
          ]
        });
      }
      throw deleteError;
    }
  } catch (error) {
    console.error("Error deleting client:", error);
    res.status(500).json({
      message: "Failed to delete client",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Cleanup unconnected and duplicate clients
router.post("/cleanup", async (_req, res) => {
  try {
    const unconnectedClients = await storage.getUnconnectedClients();
    const duplicateClients = await storage.getDuplicateClients();

    const clientsByEmail: Record<string, Client[]> = {};
    duplicateClients.forEach(client => {
      if (client.email) {
        const email = client.email.toLowerCase().trim();
        if (!clientsByEmail[email]) {
          clientsByEmail[email] = [];
        }
        clientsByEmail[email].push(client);
      }
    });

    const unconnectedResults = await Promise.all(
      unconnectedClients.map(async client => {
        try {
          const deleted = await storage.deleteClient(client.id);
          return {
            id: client.id,
            name: `${client.firstName} ${client.lastName}`,
            email: client.email || '',
            deleted,
            reason: "unconnected"
          };
        } catch (error) {
          return {
            id: client.id,
            name: `${client.firstName} ${client.lastName}`,
            email: client.email || '',
            deleted: false,
            error: error instanceof Error ? error.message : String(error),
            reason: "unconnected"
          };
        }
      })
    );

    const duplicateResults: Array<{
      id: number;
      name: string;
      email: string;
      deleted: boolean;
      reason: string;
      keepId?: number;
      keepName?: string;
      error?: string;
    }> = [];

    for (const email in clientsByEmail) {
      const clientsWithEmail = clientsByEmail[email];
      if (clientsWithEmail.length <= 1) continue;

      const [keepClient, ...duplicatesToDelete] = clientsWithEmail;
      for (const dupeClient of duplicatesToDelete) {
        try {
          const clientProjects = await storage.getProjectsByClient(dupeClient.id);
          if (clientProjects.length > 0) {
            duplicateResults.push({
              id: dupeClient.id,
              name: `${dupeClient.firstName} ${dupeClient.lastName}`,
              email: dupeClient.email || '',
              deleted: false,
              reason: "duplicate_with_projects",
              keepId: keepClient.id,
              keepName: `${keepClient.firstName} ${keepClient.lastName}`,
              error: "Client has associated projects and cannot be deleted"
            });
            continue;
          }

          const deleted = await storage.deleteClient(dupeClient.id);
          duplicateResults.push({
            id: dupeClient.id,
            name: `${dupeClient.firstName} ${dupeClient.lastName}`,
            email: dupeClient.email || '',
            deleted,
            reason: "duplicate",
            keepId: keepClient.id,
            keepName: `${keepClient.firstName} ${keepClient.lastName}`
          });
        } catch (error) {
          duplicateResults.push({
            id: dupeClient.id,
            name: `${dupeClient.firstName} ${dupeClient.lastName}`,
            email: dupeClient.email || '',
            deleted: false,
            reason: "duplicate",
            keepId: keepClient.id,
            keepName: `${keepClient.firstName} ${keepClient.lastName}`,
            error: error instanceof Error ? error.message : String(error)
          });
        }
      }
    }

    res.json({
      unconnected: {
        count: unconnectedClients.length,
        deleted: unconnectedResults.filter(r => r.deleted).length,
        results: unconnectedResults
      },
      duplicates: {
        count: duplicateClients.length,
        duplicateEmails: Object.keys(clientsByEmail).length,
        deleted: duplicateResults.filter(r => r.deleted).length,
        results: duplicateResults
      },
      totalDeleted: unconnectedResults.filter(r => r.deleted).length +
                   duplicateResults.filter(r => r.deleted).length
    });
  } catch (error) {
    console.error("Error cleaning up clients:", error);
    res.status(500).json({
      message: "Failed to clean up clients",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

export default router;
