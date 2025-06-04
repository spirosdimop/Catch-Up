import { Request, Response } from 'express';
import { chatWithLLM, generateTaskSuggestions, generateTaskSummary } from '../ai';
import { storage } from '../storage';

export async function handleAiChat(req: Request, res: Response) {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required and must be a string' });
    }

    // Get user context for better AI responses
    const tasks = await storage.getTasks();
    const projects = await storage.getProjects();
    const clients = await storage.getClients();
    
    // Create context for AI
    const context = `
Current user data:
- Tasks: ${tasks.length} total (${tasks.filter(t => !t.completed).length} pending)
- Projects: ${projects.length} total (${projects.filter(p => p.status === 'in_progress').length} active)
- Clients: ${clients.length} total

User message: ${message}

Please provide helpful advice about productivity, task management, scheduling, or client management based on this context.
`;

    const aiResponse = await chatWithLLM(context, "gpt-4o", 0.7, 800);
    
    res.json({ response: aiResponse });
  } catch (error: any) {
    console.error('AI chat error:', error);
    res.status(500).json({ error: 'Failed to get AI response' });
  }
}

export async function handleTaskSuggestions(req: Request, res: Response) {
  try {
    const tasks = await storage.getTasks();
    const suggestions = await generateTaskSuggestions(tasks);
    
    res.json({ suggestions });
  } catch (error: any) {
    console.error('Task suggestions error:', error);
    res.status(500).json({ error: 'Failed to generate task suggestions' });
  }
}

export async function handleTaskSummary(req: Request, res: Response) {
  try {
    const tasks = await storage.getTasks();
    const summary = await generateTaskSummary(tasks);
    
    res.json({ summary });
  } catch (error: any) {
    console.error('Task summary error:', error);
    res.status(500).json({ error: 'Failed to generate task summary' });
  }
}