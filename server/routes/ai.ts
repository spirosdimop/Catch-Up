import { Router } from "express";
import { 
  generateTaskSuggestions, 
  generateTaskSummary, 
  suggestTaskPrioritization,
  chatWithLLM,
  processCommand,
  updateSettings,
  createMessage
} from "../ai";

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

// General purpose LLM chat endpoint
router.post("/api/ai/chat", async (req, res) => {
  try {
    const { prompt, model, temperature, max_tokens } = req.body;
    
    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Prompt is required" });
    }
    
    const response = await chatWithLLM(
      prompt, 
      model || "gpt-4o", 
      temperature || 0.7, 
      max_tokens || 500
    );
    
    return res.json({ response });
  } catch (error) {
    console.error("Error in chat endpoint:", error);
    return res.status(500).json({ error: "Failed to generate response" });
  }
});

// Process natural language commands
router.post("/api/ai/process-command", async (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command || typeof command !== "string") {
      return res.status(400).json({ error: "Command is required" });
    }
    
    const result = await processCommand(command);
    return res.json(result);
  } catch (error) {
    console.error("Error in process command endpoint:", error);
    return res.status(500).json({ error: "Failed to process command" });
  }
});

// Update settings endpoint
router.post("/api/ai/update-settings", async (req, res) => {
  try {
    const { settingName, value } = req.body;
    
    if (!settingName) {
      return res.status(400).json({ error: "Setting name is required" });
    }
    
    const result = await updateSettings(settingName, value);
    return res.json({ success: true, message: result });
  } catch (error) {
    console.error("Error in update settings endpoint:", error);
    return res.status(500).json({ error: "Failed to update settings" });
  }
});

// Create message endpoint
router.post("/api/ai/create-message", async (req, res) => {
  try {
    const { toAddress, subject, body } = req.body;
    
    if (!toAddress || !subject) {
      return res.status(400).json({ 
        error: "Missing required fields", 
        required: ["toAddress", "subject"]
      });
    }
    
    const result = await createMessage(toAddress, subject, body || "");
    return res.json({ success: true, message: result });
  } catch (error) {
    console.error("Error in create message endpoint:", error);
    return res.status(500).json({ error: "Failed to create message" });
  }
});

export default router;