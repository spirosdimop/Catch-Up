import { Router } from "express";
import { z } from "zod";
import * as events from "../services/events.service";

const router = Router();

router.get("/", async (req, res) => {
  const userId = (req.query.userId as string) || "user-1";
  try {
    const list = await events.getEvents(userId);
    res.json(list);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch events" });
  }
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid event ID" });
  try {
    const ev = await events.getEvent(id);
    if (!ev) return res.status(404).json({ message: "Event not found" });
    res.json(ev);
  } catch {
    res.status(500).json({ message: "Failed to fetch event" });
  }
});

router.post("/", async (req, res) => {
  try {
    const { userId, title, description, startTime, endTime, location, clientName, isConfirmed, eventType, color } = req.body;
    if (!title) return res.status(400).json({ message: "Title is required" });
    const data = {
      userId: userId || "user-1",
      title,
      description: description || null,
      startTime: new Date(startTime),
      endTime: new Date(endTime),
      location: location || null,
      clientName: clientName || null,
      isConfirmed: Boolean(isConfirmed),
      eventType: eventType || "busy",
      color: color || null
    };
    const ev = await events.createEvent(data as any);
    res.status(201).json(ev);
  } catch (err) {
    res.status(500).json({ message: "Failed to create event" });
  }
});

router.patch("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid event ID" });
  try {
    const data: any = {};
    const { userId, title, description, startTime, endTime, location, clientName, isConfirmed, eventType, color } = req.body;
    if (title !== undefined) data.title = title;
    if (description !== undefined) data.description = description || null;
    if (location !== undefined) data.location = location || null;
    if (clientName !== undefined) data.clientName = clientName || null;
    if (isConfirmed !== undefined) data.isConfirmed = Boolean(isConfirmed);
    if (eventType !== undefined) data.eventType = eventType || "busy";
    if (color !== undefined) data.color = color || null;
    if (userId !== undefined) data.userId = userId;
    if (startTime !== undefined) data.startTime = new Date(startTime);
    if (endTime !== undefined) data.endTime = new Date(endTime);
    const ev = await events.updateEvent(id, data);
    if (!ev) return res.status(404).json({ message: "Event not found" });
    res.json(ev);
  } catch (err) {
    res.status(500).json({ message: "Failed to update event" });
  }
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ message: "Invalid event ID" });
  const success = await events.deleteEvent(id);
  if (!success) return res.status(404).json({ message: "Event not found" });
  res.status(204).send();
});

export default router;
