import { Router } from "express";
import { generateTaskSuggestions, generateTaskSummary, suggestTaskPrioritization } from "../ai";

const router = Router();

// Get AI-generated task suggestions
router.post("/api/ai/suggest-tasks", async (req, res) => {
  try {
    const { tasks, context } = req.body;
    
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ error: "Tasks array is required" });
    }
    
    const suggestions = await generateTaskSuggestions(tasks, context);
    return res.json({ suggestions });
  } catch (error) {
    console.error("Error in task suggestions endpoint:", error);
    return res.status(500).json({ error: "Failed to generate task suggestions" });
  }
});

// Get AI-generated task summary and insights
router.post("/api/ai/task-summary", async (req, res) => {
  try {
    const { tasks } = req.body;
    
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ error: "Tasks array is required" });
    }
    
    const summary = await generateTaskSummary(tasks);
    return res.json({ summary });
  } catch (error) {
    console.error("Error in task summary endpoint:", error);
    return res.status(500).json({ error: "Failed to generate task summary" });
  }
});

// Get AI-suggested task prioritization
router.post("/api/ai/prioritize-tasks", async (req, res) => {
  try {
    const { tasks } = req.body;
    
    if (!tasks || !Array.isArray(tasks)) {
      return res.status(400).json({ error: "Tasks array is required" });
    }
    
    const prioritization = await suggestTaskPrioritization(tasks);
    return res.json(prioritization);
  } catch (error) {
    console.error("Error in task prioritization endpoint:", error);
    return res.status(500).json({ error: "Failed to generate task prioritization" });
  }
});

export default router;