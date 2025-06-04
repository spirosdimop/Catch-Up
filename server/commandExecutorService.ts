import { db } from './db';
import { eq, desc } from 'drizzle-orm';
import * as schema from "@shared/schema";
import { storage } from './storage';
import { CommandRoutingResult, getOpenAIClient } from './openai';

interface CommandExecutionResult {
  success: boolean;
  message: string;
  executedAction: string;
  affectedResource?: string;
  resourceId?: number | string;
  resourceType?: string;
  changes?: Record<string, any>;
}

/**
 * Executes user commands based on the routing result from OpenAI
 * @param userId The user ID
 * @param originalMessage The original user message
 * @param routingResult The command routing result from OpenAI
 * @returns Execution result
 */
export async function executeUserCommand(
  userId: string,
  originalMessage: string,
  routingResult: CommandRoutingResult
): Promise<CommandExecutionResult> {
  // Create a command record to track this execution
  const commandRecord = await storage.createAiCommand({
    userId,
    userPrompt: originalMessage,
    commandType: 'unified',
    status: 'success'
  });

  try {
    // Determine which action to take based on routing result
    if (routingResult.settings_prompt) {
      return await executeSettingsCommand(userId, commandRecord.id, routingResult);
    } else if (routingResult.calendar_prompt) {
      return await executeCalendarCommand(userId, commandRecord.id, routingResult);
    } else if (routingResult.message_prompt) {
      return await executeMessageCommand(userId, commandRecord.id, routingResult);
    } else {
      // Handle direct responses without API calls (fallback or simple responses)
      if (routingResult.settings_response) {
        return {
          success: true,
          message: "Settings updated directly",
          executedAction: "settings_update_direct",
          changes: routingResult.settings_response
        };
      }
      
      // Log unknown command type for monitoring
      await recordCommandEffect(commandRecord.id, 'unknown', 'message', 'No action taken', userId);
      
      return {
        success: false,
        message: "No specific action identified in the command",
        executedAction: "none"
      };
    }
  } catch (error) {
    console.error('Error executing command:', error);
    
    // Update command status to error
    await storage.updateAiCommand(commandRecord.id, { status: 'error' });
    
    // Record the error
    await recordCommandEffect(
      commandRecord.id, 
      'error', 
      'command', 
      `Error: ${error instanceof Error ? error.message : String(error)}`,
      userId
    );
    
    return {
      success: false,
      message: `Error executing command: ${error instanceof Error ? error.message : String(error)}`,
      executedAction: "error"
    };
  }
}

/**
 * Execute settings-related commands
 */
async function executeSettingsCommand(
  userId: string,
  commandId: number,
  routingResult: CommandRoutingResult
): Promise<CommandExecutionResult> {
  try {
    // Extract settings from the prompt using OpenAI
    const settingsClient = getOpenAIClient('settings');
    
    const settingsPrompt = routingResult.settings_prompt || "";
    
    // System prompt for app settings extraction
    const systemPrompt = `
      You are an assistant that controls app settings. Convert the user's message into a JSON object 
      containing only the settings they want to change. Do not include any values that are not explicitly or implicitly mentioned.
      
      Valid settings:
      - language: Accepts ISO language codes (en, es, fr, de, zh, ja) for changing the app language
      - theme: Accepts "light", "dark", or "system" for changing the app theme
      - notificationsEnabled: Boolean (true/false) for enabling/disabling notifications
      - emailNotifications: Boolean (true/false) for enabling/disabling email notifications
      - calendarIntegration: Boolean (true/false) for enabling/disabling calendar integration
      - defaultView: Accepts "week", "day", "month" for the calendar default view
      - weekStartsOn: Number from 0-6 (0 for Sunday, 6 for Saturday) for setting the first day of the week
      - hourFormat: Either 12 or 24 for time format
      - timezone: String timezone identifier (e.g., "America/New_York", "Europe/London")
      - automaticTimeTracking: Boolean (true/false) for enabling/disabling automatic time tracking
      
      Response must be a valid JSON object with only the settings keys that should be changed.
    `;
    
    const response = await settingsClient.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: settingsPrompt }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response from OpenAI');
    }
    
    // Parse the settings
    const settings = JSON.parse(content);
    
    // Record the action in the database
    await recordCommandEffect(
      commandId, 
      'settings_update', 
      'settings', 
      JSON.stringify(settings),
      userId
    );
    
    return {
      success: true,
      message: "Settings updated",
      executedAction: "settings_update",
      affectedResource: "user_settings",
      resourceId: userId,
      resourceType: "settings",
      changes: settings
    };
  } catch (error) {
    console.error('Error processing settings command:', error);
    throw new Error(`Failed to process settings command: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Execute calendar-related commands
 */
async function executeCalendarCommand(
  userId: string,
  commandId: number,
  routingResult: CommandRoutingResult
): Promise<CommandExecutionResult> {
  try {
    const calendarPrompt = routingResult.calendar_prompt || "";
    
    // Get user's events for context
    const events = await storage.getEvents(userId);
    
    // Process the calendar command using the specialized handling in OpenAI service
    const schedulingClient = getOpenAIClient('scheduling');
    
    // System prompt for calendar operations
    const systemPrompt = `
      You are an AI assistant that manages calendar events and tasks. Analyze the user's request carefully to determine if they want to create TASKS or EVENTS.

      TASKS are work items with deadlines and priorities (keywords: "task", "todo", "work on", "complete", "finish", "priority", "due")
      EVENTS are calendar appointments with specific times (keywords: "meeting", "appointment", "schedule", "at [time]", "from-to")

      Response must be a JSON object with these properties:
      - action: "create_task", "create_event", "reschedule", "cancel", "delete", or "suggest_times"
      - item_type: "task" or "event"
      - title: The title of the event/task
      - start_time: ISO formatted date and time (for events only)
      - end_time: ISO formatted date and time (for events only)
      - deadline: ISO formatted date (for tasks only)
      - priority: "low", "medium", "high", or "urgent" (for tasks only)
      - description: Detailed description or notes
      - client_name: Name of the client if mentioned
      - status: "confirmed", "pending", "cancelled", "deleted", or "completed"

      CRITICAL RULES:
      - If user says "add task", "create task", "task for", "work on" → use action "create_task"
      - If user says "schedule meeting", "book appointment", "meet at" → use action "create_event"
      - Tasks have deadlines and priorities, events have start/end times
      - For multiple tasks, return an array in the "tasks" field
      - For single task, still use the standard fields

      EXAMPLES:
      "Add task about litholds for Spiros, urgent priority, due today"
      → action: "create_task", title: "About litholds", client_name: "Spiros", priority: "urgent", deadline: today

      "Schedule meeting with George tomorrow at 3 PM"
      → action: "create_event", title: "Meeting with George", start_time: tomorrow 3 PM, end_time: tomorrow 4 PM
    `;
    
    // Include relevant existing events in the prompt for context
    const eventsContext = events.length > 0 
      ? `\n\nExisting events in calendar:\n${JSON.stringify(events.map(e => ({
          id: e.id,
          title: e.title,
          start: e.startTime,
          end: e.endTime,
          status: e.isConfirmed ? 'confirmed' : 'pending',
          description: e.description
        })))}`
      : "\n\nNo existing events in calendar.";
    
    const response = await schedulingClient.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `${calendarPrompt}${eventsContext}` }
      ],
      response_format: { type: "json_object" },
      temperature: 0.1
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response from OpenAI');
    }
    
    // Parse the calendar action
    const calendarAction = JSON.parse(content);
    
    // Execute the calendar action
    if (calendarAction.action === 'create_task' && calendarAction.title) {
      // Find the client by name if provided
      let projectId = null;
      if (calendarAction.client_name) {
        const clients = await storage.getClients();
        const client = clients.find(c => 
          c.firstName?.toLowerCase().includes(calendarAction.client_name.toLowerCase()) ||
          c.lastName?.toLowerCase().includes(calendarAction.client_name.toLowerCase()) ||
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(calendarAction.client_name.toLowerCase())
        );
        
        if (client) {
          // Try to find an existing project for this client
          const projects = await storage.getProjectsByClient(client.id);
          if (projects.length > 0) {
            projectId = projects[0].id; // Use the first project found
          } else {
            // Create a new project for this client
            const newProject = await storage.createProject({
              name: `${client.firstName} ${client.lastName} Project`,
              clientId: client.id,
              startDate: new Date(),
              endDate: null,
              status: 'in_progress' as const,
              description: `Project for ${client.firstName} ${client.lastName}`
            });
            projectId = newProject.id;
          }
        }
      }

      // Create the task
      const newTask = await storage.createTask({
        title: calendarAction.title,
        description: calendarAction.description,
        clientId: calendarAction.client_name ? (await storage.getClients()).find(c => 
          c.firstName?.toLowerCase().includes(calendarAction.client_name.toLowerCase()) ||
          c.lastName?.toLowerCase().includes(calendarAction.client_name.toLowerCase()) ||
          `${c.firstName} ${c.lastName}`.toLowerCase().includes(calendarAction.client_name.toLowerCase())
        )?.id || null : null,
        projectId: projectId,
        priority: calendarAction.priority as 'low' | 'medium' | 'high' | 'urgent' || 'medium',
        status: 'to_do' as const,
        deadline: calendarAction.deadline ? new Date(calendarAction.deadline) : null,
        completed: false
      });

      // Record the action
      await recordCommandEffect(
        commandId, 
        'task_create', 
        'task', 
        `Created task: ${calendarAction.title}`,
        userId,
        String(newTask.id)
      );

      return {
        success: true,
        message: `Created task: ${calendarAction.title}${calendarAction.client_name ? ` for ${calendarAction.client_name}` : ''}`,
        executedAction: "task_create",
        affectedResource: "task",
        resourceId: newTask.id,
        resourceType: "task",
        changes: {
          title: calendarAction.title,
          description: calendarAction.description,
          priority: calendarAction.priority,
          deadline: calendarAction.deadline,
          client: calendarAction.client_name
        }
      };

    } else if (calendarAction.action === 'create_event' && calendarAction.title && calendarAction.start_time && calendarAction.end_time) {
      // Create a new event
      const newEvent = await storage.createEvent({
        userId,
        title: calendarAction.title,
        description: calendarAction.notes,
        startTime: new Date(calendarAction.start_time),
        endTime: new Date(calendarAction.end_time),
        isConfirmed: calendarAction.status === 'confirmed',
        eventType: 'client_meeting', // Default event type
      });
      
      // Record the action
      await recordCommandEffect(
        commandId, 
        'event_create', 
        'event', 
        `Created event: ${calendarAction.event_title}`,
        userId,
        String(newEvent.id)
      );
      
      return {
        success: true,
        message: `Created event: ${calendarAction.event_title}`,
        executedAction: "event_create",
        affectedResource: "event",
        resourceId: newEvent.id,
        resourceType: "event",
        changes: {
          title: calendarAction.event_title,
          startTime: calendarAction.start_time,
          endTime: calendarAction.end_time,
          notes: calendarAction.notes
        }
      };
      
    } else if (['cancel', 'delete'].includes(calendarAction.action) && (calendarAction.event_id || calendarAction.event_title)) {
      // Find the event if only title is provided
      let eventId = calendarAction.event_id;
      
      if (!eventId && calendarAction.event_title) {
        // Find by title (using the most recent match)
        const matchingEvents = events.filter(e => 
          e.title.toLowerCase().includes(calendarAction.event_title.toLowerCase())
        );
        
        if (matchingEvents.length > 0) {
          // Sort by start time to get the most recent/upcoming one
          matchingEvents.sort((a, b) => b.startTime.getTime() - a.startTime.getTime());
          eventId = matchingEvents[0].id;
        }
      }
      
      if (eventId) {
        // Delete the event
        const deleted = await storage.deleteEvent(Number(eventId));
        
        if (deleted) {
          // Record the action
          await recordCommandEffect(
            commandId, 
            'event_delete', 
            'event', 
            `Deleted event: ${calendarAction.event_title || `ID: ${eventId}`}`,
            userId,
            String(eventId)
          );
          
          return {
            success: true,
            message: `Deleted event: ${calendarAction.event_title || `ID: ${eventId}`}`,
            executedAction: "event_delete",
            affectedResource: "event",
            resourceId: eventId,
            resourceType: "event"
          };
        } else {
          return {
            success: false,
            message: `Could not find event to delete: ${calendarAction.event_title || `ID: ${eventId}`}`,
            executedAction: "event_delete_failed",
            affectedResource: "event",
            resourceId: eventId,
            resourceType: "event"
          };
        }
      } else {
        return {
          success: false,
          message: `Could not find event matching: ${calendarAction.event_title}`,
          executedAction: "event_delete_failed"
        };
      }
    } else if (calendarAction.action === 'reschedule' && calendarAction.event_id && calendarAction.start_time) {
      // Update the event
      const eventId = calendarAction.event_id;
      
      const updateData: any = {
        startTime: new Date(calendarAction.start_time)
      };
      
      if (calendarAction.end_time) {
        updateData.endTime = new Date(calendarAction.end_time);
      }
      
      if (calendarAction.notes) {
        updateData.description = calendarAction.notes;
      }
      
      const updated = await storage.updateEvent(Number(eventId), updateData);
      
      if (updated) {
        // Record the action
        await recordCommandEffect(
          commandId, 
          'event_update', 
          'event', 
          `Updated event: ${calendarAction.event_title || `ID: ${eventId}`}`,
          userId,
          String(eventId)
        );
        
        return {
          success: true,
          message: `Rescheduled event: ${calendarAction.event_title || `ID: ${eventId}`}`,
          executedAction: "event_reschedule",
          affectedResource: "event",
          resourceId: eventId,
          resourceType: "event",
          changes: updateData
        };
      } else {
        return {
          success: false,
          message: `Could not find event to reschedule: ${calendarAction.event_title || `ID: ${eventId}`}`,
          executedAction: "event_reschedule_failed",
          affectedResource: "event",
          resourceId: eventId,
          resourceType: "event"
        };
      }
    }
    
    // For suggest_times or other non-database operations
    return {
      success: true,
      message: `Processed calendar request: ${calendarAction.action}`,
      executedAction: `calendar_${calendarAction.action}`,
      changes: calendarAction
    };
    
  } catch (error) {
    console.error('Error processing calendar command:', error);
    throw new Error(`Failed to process calendar command: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Execute message-related commands
 */
async function executeMessageCommand(
  userId: string,
  commandId: number,
  routingResult: CommandRoutingResult
): Promise<CommandExecutionResult> {
  try {
    const messagePrompt = routingResult.message_prompt || "";
    
    // Generate auto-response message using OpenAI
    const autoResponseClient = getOpenAIClient('autoresponse');
    
    // System prompt for auto-response generation
    const systemPrompt = `
      You are an assistant that creates professional auto-response messages. Generate a short, 
      human-sounding message based on the context. Keep it brief and authentic - approximately 1-3 sentences.
      
      Consider the following in your response:
      - Maintain professional but warm tone
      - Include an estimate of when the person will respond if possible
      - Don't use clichés or overly formal language
      - Personalize based on the specific situation
    `;
    
    const response = await autoResponseClient.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please generate an auto-response message for this situation: ${messagePrompt}` }
      ],
      temperature: 0.7,
      max_tokens: 150 // Keep responses concise
    });
    
    const generatedMessage = response.choices[0]?.message?.content || "Sorry I missed you. I'll get back to you as soon as possible.";
    
    // Record the action
    await recordCommandEffect(
      commandId, 
      'message_generate', 
      'message', 
      generatedMessage,
      userId
    );
    
    return {
      success: true,
      message: generatedMessage,
      executedAction: "message_generate",
      affectedResource: "auto_response",
      resourceType: "message",
      changes: { message: generatedMessage }
    };
    
  } catch (error) {
    console.error('Error processing message command:', error);
    throw new Error(`Failed to process message command: ${error instanceof Error ? error.message : String(error)}`);
  }
}

/**
 * Record a command effect for tracking and learning
 */
async function recordCommandEffect(
  commandId: number,
  effectType: string,
  targetType: string,
  details: string,
  userId: string,
  targetId: string | null = null
): Promise<void> {
  await storage.createAiCommandEffect({
    commandId,
    effectType,
    targetType,
    details,
    targetId
  });
}