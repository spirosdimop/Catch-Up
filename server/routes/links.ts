import { Router } from "express";
import { db } from "../db";
import { entityLinks, insertEntityLinkSchema } from "@shared/schema";
import { ZodError } from "zod";
import { eq } from "drizzle-orm";

const router = Router();

router.post("/", async (req, res) => {
  try {
    const data = insertEntityLinkSchema.parse(req.body);
    const [link] = await db.insert(entityLinks).values(data).returning();
    res.json(link);
  } catch (err) {
    if (err instanceof ZodError) {
      return res.status(400).json({ message: err.errors });
    }
    console.error("Failed to create link", err);
    res.status(500).json({ message: "Failed to create link" });
  }
});

router.get("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  const [link] = await db.select().from(entityLinks).where(eq(entityLinks.id, id));
  if (!link) return res.status(404).json({ message: "Link not found" });
  res.json(link);
});

router.delete("/:id", async (req, res) => {
  const id = parseInt(req.params.id);
  try {
    await db.delete(entityLinks).where(eq(entityLinks.id, id));
    res.json({ success: true });
  } catch (err) {
    console.error("Failed to delete link", err);
    res.status(500).json({ message: "Failed to delete link" });
  }
});

export default router;
