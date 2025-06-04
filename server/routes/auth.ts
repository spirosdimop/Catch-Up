import { Router } from "express";
import { storage } from "../storage";
import { insertUserSchema } from "@shared/schema";
import { z } from "zod";

const router = Router();

router.post("/register", async (req, res) => {
  try {
    const signupSchema = insertUserSchema.extend({
      fullName: z.string().min(1, "Full name is required"),
    });
    const { fullName, ...userData } = signupSchema.parse({
      ...req.body,
      username: req.body.username || req.body.email,
    });
    const nameParts = fullName.trim().split(/\s+/);
    const name = nameParts.length > 0 ? nameParts.join(" ") : fullName;
    const user = await storage.createUser({
      ...userData,
      name,
    });
    const { password, ...userWithoutPassword } = user;
    res.status(201).json({ message: "User registered successfully", user: userWithoutPassword });
  } catch (error) {
    console.error("Error registering user:", error);
    if (error instanceof z.ZodError) {
      return res.status(400).json({ message: "Validation failed", errors: error.errors });
    }
    res.status(500).json({ message: "Failed to register user" });
  }
});

export default router;
