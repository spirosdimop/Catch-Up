import { Router } from "express";
import { chatWithLLM, processCommand } from "../ai";
import { handleCommand } from "../ai/CommandRouter";

const router = Router();

/**
 * Process a natural language command using OpenAI
 */
router.post("/process-command", async (req, res) => {
  try {
    const { command } = req.body;
    
    if (!command || typeof command !== "string") {
      return res.status(400).json({ 
        success: false,
        result: "Invalid command. Please provide a text command."
      });
    }
    
    const result = await processCommand(command);
    
    return res.json(result);
  } catch (error) {
    console.error("Error processing command:", error);
    return res.status(500).json({ 
      success: false,
      result: "An error occurred while processing your command."
    });
  }
});

/**
 * Generate AI-powered task suggestions based on existing tasks
 */
router.post("/task-suggestions", async (req, res) => {
  try {
    const { tasks, context } = req.body;
    
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ 
        success: false,
        result: "Invalid tasks data. Please provide an array of tasks."
      });
    }
    
    // Simple example response until full implementation
    const result = {
      success: true,
      suggestions: [
        {
          title: "Review project requirements",
          description: "Ensure all requirements are understood and documented",
          priority: "high",
          category: "Planning"
        },
        {
          title: "Set up development environment",
          description: "Install necessary tools and dependencies",
          priority: "normal",
          category: "Setup"
        },
        {
          title: "Create project timeline",
          description: "Define milestones and deadlines",
          priority: "high",
          category: "Planning"
        }
      ]
    };
    
    return res.json(result);
  } catch (error) {
    console.error("Error generating suggestions:", error);
    return res.status(500).json({ 
      success: false,
      result: "An error occurred while generating task suggestions."
    });
  }
});

/**
 * Generate a task summary based on existing tasks
 */
router.post("/task-summary", async (req, res) => {
  try {
    const { tasks } = req.body;
    
    if (!Array.isArray(tasks)) {
      return res.status(400).json({ 
        success: false,
        result: "Invalid tasks data. Please provide an array of tasks."
      });
    }
    
    // For now, return a static summary
    const result = {
      success: true,
      summary: "You have 5 high priority tasks due this week, with most focus needed on the project proposal due tomorrow. Consider rescheduling some lower priority tasks to free up time for the critical deliverables."
    };
    
    return res.json(result);
  } catch (error) {
    console.error("Error generating summary:", error);
    return res.status(500).json({ 
      success: false,
      result: "An error occurred while generating the task summary."
    });
  }
});

// Unified command endpoint using new command router
router.post("/command", async (req, res) => {
  const { message, userId = "user-1", model } = req.body;
  if (!message || typeof message !== "string") {
    return res.status(400).json({ message: "Invalid request" });
  }
  try {
    const result = await handleCommand(userId, message, model);
    res.json(result);
  } catch (err) {
    console.error("Error handling command:", err);
    res.status(500).json({ message: "Failed to process command" });
  }
});

export default router;