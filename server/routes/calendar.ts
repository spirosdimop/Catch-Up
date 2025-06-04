import { Router } from "express";
import { db } from "../db";
import { tasks, bookings, events } from "@shared/schema";

const router = Router();

router.get("/", async (_req, res) => {
  try {
    const [taskList, bookingList, eventList] = await Promise.all([
      db.select().from(tasks),
      db.select().from(bookings),
      db.select().from(events),
    ]);

    const items: { type: string; id: number; title: string; time: Date | null; linkedEntities: Record<string, number | null> }[] = [];

    for (const t of taskList) {
      items.push({
        type: "task",
        id: t.id,
        title: t.title,
        time: t.deadline ?? null,
        linkedEntities: { projectId: t.projectId ?? null, clientId: t.clientId ?? null }
      });
    }
    for (const e of eventList) {
      items.push({
        type: "event",
        id: e.id,
        title: e.title,
        time: e.startTime,
        linkedEntities: { projectId: e.projectId ?? null, clientId: e.clientId ?? null }
      });
    }
    for (const b of bookingList) {
      const dateTime = b.date && b.time ? new Date(`${b.date} ${b.time}`) : null;
      items.push({
        type: "booking",
        id: b.id,
        title: b.serviceName || "Booking",
        time: dateTime,
        linkedEntities: { projectId: b.projectId ?? null, clientId: b.clientId ?? null, taskId: b.taskId ?? null }
      });
    }

    items.sort((a, b) => {
      const aTime = a.time ? new Date(a.time).getTime() : 0;
      const bTime = b.time ? new Date(b.time).getTime() : 0;
      return aTime - bTime;
    });

    res.json(items);
  } catch (err) {
    console.error("Failed to fetch calendar items", err);
    res.status(500).json({ message: "Failed to fetch calendar data" });
  }
});

export default router;
