import { Router } from "express";
import { storage } from "../storage";
import * as memEvents from "../memEvents";
import { insertEventSchema, insertEventTemplateSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

// Get events
router.get("/", async (req, res) => {
  try {
    const userId = req.query.userId as string || "user-1";
    try {
      const events = await storage.getEvents(userId);
      res.json(events);
    } catch (dbError) {
      console.log("Database error, falling back to in-memory events:", dbError);
      const events = await memEvents.getEvents(userId);
      res.json(events);
    }
  } catch (error) {
    console.error("Error fetching events:", error);
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

// Get event by id
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    const event = await storage.getEvent(id);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error("Error fetching event:", error);
    res.status(500).json({ message: "Failed to fetch event" });
  }
});

// Create event
router.post("/", async (req, res) => {
  try {
    const { userId, title, description, startTime, endTime, location, clientName, isConfirmed, eventType, color } = req.body;
    if (!title) {
      return res.status(400).json({ message: "Title is required" });
    }
    let parsedStartTime: Date;
    let parsedEndTime: Date;
    try {
      parsedStartTime = new Date(startTime);
      parsedEndTime = new Date(endTime);
      if (isNaN(parsedStartTime.getTime()) || isNaN(parsedEndTime.getTime())) {
        throw new Error("Invalid date format");
      }
    } catch (err) {
      return res.status(400).json({
        message: "Invalid date format",
        details: "Start time and end time must be valid date strings"
      });
    }
    const eventData = {
      userId: userId || "user-1",
      title,
      description: description || null,
      startTime: parsedStartTime,
      endTime: parsedEndTime,
      location: location || null,
      clientName: clientName || null,
      isConfirmed: Boolean(isConfirmed),
      eventType: eventType || "busy",
      color: color || null
    };
    console.log("Creating event with data:", eventData);
    const event = await storage.createEvent(eventData);
    res.status(201).json(event);
  } catch (error) {
    console.error("Error creating event:", error);
    res.status(500).json({ message: "Failed to create event" });
  }
});

// Update event
router.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    const { userId, title, description, startTime, endTime, location, clientName, isConfirmed, eventType, color } = req.body;
    const updateData: any = {};
    if (title !== undefined) updateData.title = title;
    if (description !== undefined) updateData.description = description || null;
    if (location !== undefined) updateData.location = location || null;
    if (clientName !== undefined) updateData.clientName = clientName || null;
    if (isConfirmed !== undefined) updateData.isConfirmed = Boolean(isConfirmed);
    if (eventType !== undefined) updateData.eventType = eventType || "busy";
    if (color !== undefined) updateData.color = color || null;
    if (userId !== undefined) updateData.userId = userId;
    if (startTime !== undefined) {
      try {
        const parsedStartTime = new Date(startTime);
        if (isNaN(parsedStartTime.getTime())) {
          throw new Error("Invalid start time format");
        }
        updateData.startTime = parsedStartTime;
      } catch (err) {
        return res.status(400).json({
          message: "Invalid date format",
          details: "Start time must be a valid date string"
        });
      }
    }
    if (endTime !== undefined) {
      try {
        const parsedEndTime = new Date(endTime);
        if (isNaN(parsedEndTime.getTime())) {
          throw new Error("Invalid end time format");
        }
        updateData.endTime = parsedEndTime;
      } catch (err) {
        return res.status(400).json({
          message: "Invalid date format",
          details: "End time must be a valid date string"
        });
      }
    }
    console.log("Updating event with data:", updateData);
    const event = await storage.updateEvent(id, updateData);
    if (!event) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.json(event);
  } catch (error) {
    console.error("Error updating event:", error);
    res.status(500).json({ message: "Failed to update event" });
  }
});

// Delete event
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid event ID" });
    }
    const success = await storage.deleteEvent(id);
    if (!success) {
      return res.status(404).json({ message: "Event not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting event:", error);
    res.status(500).json({ message: "Failed to delete event" });
  }
});

// Event template endpoints
router.get("/event-templates/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const templates = await storage.getEventTemplates(userId);
    res.json(templates);
  } catch (error) {
    console.error("Error fetching templates:", error);
    res.status(500).json({ message: "Failed to fetch templates" });
  }
});

router.get("/event-templates/public/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const templates = await storage.getPublicEventTemplates(userId);
    res.json(templates);
  } catch (error) {
    console.error("Error fetching public templates:", error);
    res.status(500).json({ message: "Failed to fetch public templates" });
  }
});

router.get("/event-templates/:userId/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }
    const template = await storage.getEventTemplate(id);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json(template);
  } catch (error) {
    console.error("Error fetching template:", error);
    res.status(500).json({ message: "Failed to fetch template" });
  }
});

router.post("/event-templates", async (req, res) => {
  try {
    console.log("Received template creation request with data:", req.body);
    const templateData = insertEventTemplateSchema.parse(req.body);
    console.log("Template data after parsing:", templateData);
    const template = await storage.createEventTemplate(templateData);
    console.log("Template created successfully:", template);
    res.status(201).json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      console.error("Invalid template data:", error.errors);
      return res.status(400).json({
        message: "Invalid template data",
        errors: error.errors,
        details: error.format()
      });
    }
    console.error("Error creating template:", error);
    res.status(500).json({
      message: "Failed to create template",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

router.put("/event-templates/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }
    const templateData = insertEventTemplateSchema.partial().parse(req.body);
    const template = await storage.updateEventTemplate(id, templateData);
    if (!template) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.json(template);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Invalid template data", errors: error.errors });
    }
    console.error("Error updating template:", error);
    res.status(500).json({ message: "Failed to update template" });
  }
});

router.delete("/event-templates/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid template ID" });
    }
    const success = await storage.deleteEventTemplate(id);
    if (!success) {
      return res.status(404).json({ message: "Template not found" });
    }
    res.status(204).send();
  } catch (error) {
    console.error("Error deleting template:", error);
    res.status(500).json({ message: "Failed to delete template" });
  }
});

export default router;
