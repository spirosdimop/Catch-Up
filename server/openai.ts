import { OpenAI } from 'openai';

// Supported assistant types
export type AssistantType = 'general' | 'scheduling' | 'settings' | 'autoresponse';

// Define environment variable keys for different assistants
const API_KEY_MAP: Record<AssistantType, string> = {
  'general': 'OPENAI_API_KEY',           // General assistant uses the main OpenAI API key
  'scheduling': 'OPENAI_SCHEDULING_KEY', // Scheduling assistant can use a separate key
  'settings': 'OPENAI_SETTINGS_KEY',     // Settings assistant can use a separate key
  'autoresponse': 'OPENAI_AUTORESPONSE_KEY' // Auto-response assistant uses a dedicated key
};

// Function to get the appropriate API key for an assistant type
export function getApiKey(assistantType: AssistantType): string | undefined {
  const envKey = API_KEY_MAP[assistantType];
  const apiKey = process.env[envKey];
  
  // Log missing keys (only in development)
  if (!apiKey && process.env.NODE_ENV !== 'production') {
    console.warn(`${envKey} environment variable is not set. Using default OPENAI_API_KEY as fallback.`);
  }
  
  // Fallback to the main API key if a specific one isn't available
  return apiKey || process.env.OPENAI_API_KEY;
}

// Initialize OpenAI client factory function
export function getOpenAIClient(assistantType: AssistantType = 'general'): OpenAI {
  const apiKey = getApiKey(assistantType);
  
  // Warn if no API key is available
  if (!apiKey) {
    console.warn('No OpenAI API key available. AI features will not work properly.');
  }
  
  return new OpenAI({
    apiKey: apiKey,
  });
}

// Type for AI scheduling responses
export interface SchedulingResponse {
  action: 'create' | 'reschedule' | 'cancel' | 'delete' | 'suggest_times';
  event_title?: string;
  start_time?: string;
  end_time?: string;
  status: 'confirmed' | 'pending' | 'conflict' | 'cancelled' | 'deleted';
  notes: string;
  event_id?: number; // Used for referencing existing events
}

/**
 * Processes a scheduling request using OpenAI's API
 * @param userSchedule The user's current schedule
 * @param request The scheduling request text
 * @returns A scheduling response object
 */
export async function processSchedulingRequest(
  userSchedule: any[], 
  request: string
): Promise<SchedulingResponse> {
  try {
    // Get OpenAI client specifically for scheduling
    const schedulingClient = getOpenAIClient('scheduling');
    
    // Get current date information
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = currentDate.getFullYear();
    const currentDateString = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
    
    // Create system prompt for the scheduling assistant
    const systemPrompt = `
      You are an AI assistant managing a calendar for a busy professional. 
      Your job is to schedule, reschedule, cancel, delete, or suggest new appointments based on user requests.
      
      IMPORTANT: Today's date is ${currentDateString} (yyyy-mm-dd format). Keep this in mind when scheduling.
      
      IMPORTANT: Always assume the user wants to CREATE a calendar event unless they specifically mention rescheduling, canceling, or deleting.
      
      Rules you must follow:
      - Always extract specific meeting details from user requests (time, date, client name, purpose)
      - When user says "tomorrow", that means ${new Date(currentDate.getTime() + 86400000).toISOString().split('T')[0]}
      - If specific time is not mentioned, schedule for 10:00 AM on the next business day
      - If duration is not mentioned, default to 1 hour meetings
      - Set meeting titles to be descriptive (e.g., "Meeting with Client Name: Purpose")
      - Always set status to "confirmed" unless there's a specific conflict
      - Include meeting details in the notes field
      - ALWAYS use the current year (${currentYear}) for dates unless explicitly specified otherwise
      - For any dates without a year specified, use the current year or a future date
      - If a meeting is scheduled for a date that has already passed in the current year, schedule it for next year
      - DO NOT schedule meetings in the past - check against today's date (${currentDateString})
      - When the user wants to delete an event, use action "delete" and set status to "deleted" (set event_id if mentioned)
      - For delete requests, try to extract the event information from the request (title or ID)
      
      Return ONLY a JSON object with:
      - action (create, reschedule, cancel, delete, suggest_times)
      - event_title (if applicable)
      - start_time (ISO format, if applicable)
      - end_time (ISO format, if applicable)
      - status (confirmed, pending, conflict, cancelled, deleted)
      - notes (explanation of decision or the meeting details including agenda items and preparation notes)
      - event_id (if referenced in the request or created by the system)
    `;

    // Convert user schedule to a string representation
    const scheduleText = JSON.stringify(userSchedule, null, 2);

    // Make the API call to OpenAI
    const response = await schedulingClient.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `
          Current schedule:
          ${scheduleText}
          
          Request:
          ${request}
        `}
      ] as any, // Type casting to fix TypeScript error
      temperature: 0.2, // Use a low temperature for more consistent responses
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    // Parse the response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response from OpenAI');
    }

    return JSON.parse(content) as SchedulingResponse;

  } catch (error) {
    console.error('Error processing scheduling request:', error);
    // Return a fallback response
    return {
      action: 'suggest_times',
      status: 'conflict',
      notes: 'Unable to process scheduling request. Please try again later or contact support.'
    };
  }
}

/**
 * Generates a summary of the user's schedule for the given timeframe
 * @param userSchedule The user's current schedule
 * @param timeframe Optional timeframe to focus on (e.g., "this week", "today")
 * @returns A string summary of the schedule
 */
export async function generateScheduleSummary(
  userSchedule: any[],
  timeframe: string = 'upcoming'
): Promise<string> {
  try {
    // Get OpenAI client specifically for scheduling
    const schedulingClient = getOpenAIClient('scheduling');
    
    // Create system prompt for summarization
    const systemPrompt = `
      You are an AI assistant helping a busy professional understand their schedule.
      Provide a concise, helpful summary of their ${timeframe} schedule.
      Focus on highlighting important meetings, potential conflicts, and free time blocks.
      Be specific about dates and times, and group similar activities if appropriate.
    `;

    // Convert user schedule to a string representation
    const scheduleText = JSON.stringify(userSchedule, null, 2);

    // Make the API call to OpenAI
    const response = await schedulingClient.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `
          Here is my ${timeframe} schedule:
          ${scheduleText}
          
          Please summarize it for me.
        `}
      ] as any, // Type casting to fix TypeScript error
      temperature: 0.7,
      max_tokens: 1500
    });

    return response.choices[0]?.message?.content || 'Unable to generate schedule summary.';

  } catch (error) {
    console.error('Error generating schedule summary:', error);
    return 'Unable to generate schedule summary due to an error. Please try again later.';
  }
}

/**
 * Generates a professional auto-response message
 * @param context Optional context about the situation requiring an auto-response
 * @returns A short, human, professional auto-response message
 */
export async function generateAutoResponse(
  context: string = 'missed call'
): Promise<string> {
  try {
    // Get OpenAI client specifically for auto-responses
    const autoResponseClient = getOpenAIClient('autoresponse');
    
    // Create system prompt for the auto-response generator
    const systemPrompt = `
      You are a polite virtual assistant. The user wants a message that will be automatically sent 
      when they miss a call or cannot respond. Based on their request, generate a short, human, 
      professional, and kind message. Keep the output under 300 characters. 
      Only return the message as plain text with no formatting or tags.
      
      Example output:
      "Hi! Sorry I missed your call. I'll get back to you as soon as I can. Thanks for reaching out!"
    `;

    // Make the API call to OpenAI
    const response = await autoResponseClient.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `Please generate an auto-response message for this situation: ${context}` }
      ],
      temperature: 0.7,
      max_tokens: 150 // Keep responses concise
    });

    return response.choices[0]?.message?.content || "Sorry I missed you. I'll get back to you as soon as possible.";

  } catch (error) {
    console.error('Error generating auto-response:', error);
    // Return a fallback response
    return "Sorry I missed you. I'll get back to you as soon as possible.";
  }
}

/**
 * Interface for the routing determination result
 */
export interface CommandRoutingResult {
  settings_prompt?: string;
  calendar_prompt?: string;
  message_prompt?: string;
  task_prompt?: string;
  project_prompt?: string;
  client_prompt?: string;
  booking_prompt?: string;
  clarification_prompt?: string;
  missing_fields?: string[];
  // For direct responses without calling OpenAI (fallback)
  settings_response?: Record<string, any>;
  // For maintaining conversation context between user sessions
  conversation_context?: string;
}

/**
 * Simple keyword-based routing when OpenAI API is unavailable
 * @param message User message
 * @returns Basic routing result based on keywords
 */
function fallbackKeywordRouter(message: string): CommandRoutingResult {
  const lowerMessage = message.toLowerCase();
  
  // Initialize the result with conversation context
  const result: CommandRoutingResult = {
    conversation_context: `User asked: "${message}"`
  };

  // Check for count/summary requests first (highest priority to prevent unwanted actions)
  const isCountRequest = lowerMessage.includes('how many') || 
                        lowerMessage.includes('count') ||
                        lowerMessage.includes('total') ||
                        lowerMessage.includes('number of');

  if (isCountRequest) {
    if (lowerMessage.includes('booking') || lowerMessage.includes('appointment')) {
      result.booking_prompt = `Provide comprehensive booking analytics and count summary`;
      result.conversation_context = `User requesting booking count summary - provide immediate analytics without creating events`;
      return result;
    }
    if (lowerMessage.includes('task')) {
      result.task_prompt = `Provide comprehensive task analytics and count summary`;
      result.conversation_context = `User requesting task count summary - provide immediate analytics`;
      return result;
    }
    if (lowerMessage.includes('client')) {
      result.client_prompt = `Provide comprehensive client analytics and count summary`;
      result.conversation_context = `User requesting client count summary - provide immediate analytics`;
      return result;
    }
    if (lowerMessage.includes('project')) {
      result.project_prompt = `Provide comprehensive project analytics and count summary`;
      result.conversation_context = `User requesting project count summary - provide immediate analytics`;
      return result;
    }
    if (lowerMessage.includes('event') || lowerMessage.includes('meeting') || lowerMessage.includes('calendar')) {
      result.calendar_prompt = `Provide comprehensive calendar analytics and count summary without creating events`;
      result.conversation_context = `User requesting calendar count summary - provide immediate analytics without creating events`;
      return result;
    }
  }
  
  // Check for settings-related keywords
  if (
    lowerMessage.includes('settings') ||
    lowerMessage.includes('preference') ||
    lowerMessage.includes('mode') ||
    lowerMessage.includes('theme') ||
    lowerMessage.includes('notification') ||
    lowerMessage.includes('status') ||
    lowerMessage.includes('availability') ||
    lowerMessage.includes('profile') ||
    lowerMessage.includes('language')
  ) {
    result.settings_prompt = message;
    
    // Special handling for language settings
    if (lowerMessage.includes('language')) {
      // Check if the message is asking to change language
      const englishMatch = /\b(english|en)\b/i.test(lowerMessage);
      const spanishMatch = /\b(spanish|español|espanol|es)\b/i.test(lowerMessage);
      const frenchMatch = /\b(french|français|francais|fr)\b/i.test(lowerMessage);
      const germanMatch = /\b(german|deutsch|de)\b/i.test(lowerMessage);
      const chineseMatch = /\b(chinese|中文|zh)\b/i.test(lowerMessage);
      const japaneseMatch = /\b(japanese|日本語|ja)\b/i.test(lowerMessage);
      
      // Return direct settings JSON if we can detect language
      if (englishMatch || spanishMatch || frenchMatch || germanMatch || chineseMatch || japaneseMatch) {
        let languageCode = 'en';
        
        if (spanishMatch) languageCode = 'es';
        else if (frenchMatch) languageCode = 'fr';
        else if (germanMatch) languageCode = 'de';
        else if (chineseMatch) languageCode = 'zh';
        else if (japaneseMatch) languageCode = 'ja';
        
        console.log(`Detected language change request to: ${languageCode}`);
        
        // Add the settings response directly - make sure to use the language code
        result.settings_response = {
          language: languageCode,
          language_name: languageCode === 'en' ? 'English' :
                         languageCode === 'es' ? 'Spanish' :
                         languageCode === 'fr' ? 'French' :
                         languageCode === 'de' ? 'German' :
                         languageCode === 'zh' ? 'Chinese' :
                         languageCode === 'ja' ? 'Japanese' : 'English'
        };
      }
    }
  }
  
  // Check for calendar-related keywords
  if (
    lowerMessage.includes('schedule') ||
    lowerMessage.includes('meeting') ||
    lowerMessage.includes('appointment') ||
    lowerMessage.includes('event') ||
    lowerMessage.includes('calendar') ||
    lowerMessage.includes('book') ||
    lowerMessage.includes('reschedule') ||
    lowerMessage.includes('cancel')
  ) {
    result.calendar_prompt = message;
  }
  
  // Check for auto-response related keywords
  if (
    lowerMessage.includes('message') ||
    lowerMessage.includes('reply') ||
    lowerMessage.includes('respond') ||
    lowerMessage.includes('auto') ||
    lowerMessage.includes('away') ||
    lowerMessage.includes('busy') ||
    lowerMessage.includes('unavailable') ||
    lowerMessage.includes('out of office')
  ) {
    result.message_prompt = message;
  }
  
  // If no keywords matched, ask for clarification
  if (!result.settings_prompt && !result.calendar_prompt && !result.message_prompt) {
    result.clarification_prompt = "I'm not sure what you'd like to do. Could you please specify if you want to change settings, schedule an event, or create an auto-response message?";
    result.missing_fields = ["request_type"];
  }
  
  return result;
}

/**
 * Routes a user input message to the appropriate specialized API
 * @param message The user's natural language input message
 * @param conversationContext Optional previous conversation context to maintain continuity
 * @returns An object containing prompts for each API or clarification requests
 */
export async function routeInputToApis(message: string, conversationContext?: string, model: string = 'gpt-4o'): Promise<CommandRoutingResult> {
  try {
    // Get OpenAI client specifically for routing (using the general client)
    const routingClient = getOpenAIClient('general');
    
    // If no API key is available, use the fallback router
    if (!process.env.OPENAI_API_KEY) {
      console.warn('No OpenAI API key available, using fallback keyword router');
      return fallbackKeywordRouter(message);
    }
    
    // Create system prompt for the command router
    let systemPrompt = `
      You are a proactive AI assistant that routes user requests to specialized APIs. Your priority is to provide immediate comprehensive responses for data requests and gather complete information for action commands.

      Available APIs:
      1. settings_api - For changing app settings, theme, language, notifications, view preferences
      2. calendar_api - For managing calendar events, meetings, and schedule operations (NOT for bookings)
      3. task_api - For creating, updating, completing, and managing tasks
      4. project_api - For creating, updating, and managing projects
      5. client_api - For creating, updating, and managing client information
      6. booking_api - For scheduling, rescheduling, and managing ALL appointments and bookings
      7. message_api - For generating professional auto-response messages
      
      CRITICAL ROUTING RULES FOR COUNT/SUMMARY REQUESTS:
      When users ask for counts, totals, or "how many" of something:
      - NEVER ask clarifying questions
      - NEVER create calendar events or bookings
      - NEVER return generic "processed your request" responses
      - ALWAYS route to the correct API and provide actual data:
        * "how many bookings" or "how many appointments" -> booking_prompt (NEVER calendar_prompt)
        * "how many tasks" -> task_prompt  
        * "how many clients" -> client_prompt
        * "how many projects" -> project_prompt
        * "how many events" or "how many meetings" -> calendar_prompt (only for calendar events, not bookings)
      - MUST return actual numerical data, not generic acknowledgments
      - Include comprehensive analytics with specific numbers and breakdowns
      - Show total counts, status distributions, time period analysis
      
      CRITICAL: For action commands, only ask for clarification when information is genuinely missing. If the user provides sufficient details, proceed with the action.

      PROJECT CREATION RULES:
      When users provide project details like "add a project for [description] that starts [date] and [completion info]":
      - Extract project name from the description
      - Use provided start date or default to today
      - Use provided deadline or estimate reasonable completion time
      - Proceed with project creation using project_prompt
      - Only ask for clarification if absolutely essential information is missing

      TASK CREATION RULES:
      When users provide task details with context and deadlines:
      - Extract task title and description from the request
      - Use provided deadline or priority information
      - Proceed with task creation using task_prompt
      - Only ask for clarification if the request is genuinely unclear

      For DESTRUCTIVE or MAJOR ACTIONS (like clearing calendar, deleting events, canceling multiple appointments):
      - Always ask for explicit confirmation
      - Clarify the scope of the action (all events, just bookings, specific types, etc.)
      - Confirm the time range (today only, this week, etc.)
      - Ask if they want notifications sent to attendees

      For CALENDAR requests, always ask for:
      - Exact date and time
      - Duration of the meeting
      - Location (in-person address, video call link, or phone number)
      - Attendee names and contact information
      - Meeting purpose/agenda
      - Any special requirements or notes

      For SETTINGS requests, always ask for:
      - Specific setting to change
      - New value or state
      - Duration (if temporary)
      - Any conditions or exceptions

      For MESSAGE requests, always ask for:
      - Context/situation for the message
      - Tone preference (formal, casual, friendly)
      - Specific information to include
      - Target audience

      Output JSON structure:
      {
        "settings_prompt": "...", // Include only if complete settings info provided
        "calendar_prompt": "...", // Include only if complete calendar/event info provided  
        "task_prompt": "...", // Include only if complete task info provided
        "project_prompt": "...", // Include only if complete project info provided
        "client_prompt": "...", // Include only if complete client info provided
        "booking_prompt": "...", // Include only if complete booking info provided
        "message_prompt": "...", // Include only if complete message info provided
        "clarification_prompt": "...", // Detailed questions to gather missing info
        "missing_fields": ["field1", "field2"], // Specific missing information
        "conversation_context": "..." // Summary for follow-up requests
      }

      EXAMPLES:
      User: "Schedule a meeting with George tomorrow"
      Response: {
        "clarification_prompt": "I'd like to help you schedule that meeting with George. I need some additional details: What time would you like to meet? How long should the meeting be? Where will it take place (in-person location, video call, or phone)? What's George's contact information? What's the purpose or agenda for this meeting?",
        "missing_fields": ["time", "duration", "location", "george_contact", "purpose"],
        "conversation_context": "User wants to schedule a meeting with George tomorrow but needs to provide time, duration, location, contact info, and purpose"
      }

      User: "Cancel my appointment with George tomorrow"  
      Response: {
        "clarification_prompt": "I can help you cancel that appointment. To make sure I cancel the right meeting, what time was your appointment with George scheduled for tomorrow? Do you want me to send a cancellation message to George, and if so, would you like to provide a reason for the cancellation?",
        "missing_fields": ["appointment_time", "cancellation_message", "reason"],
        "conversation_context": "User wants to cancel appointment with George tomorrow but needs to specify time and cancellation details"
      }

      User: "Clear my calendar for today"
      Response: {
        "clarification_prompt": "Are you sure you want to clear your calendar for today? I want to make sure I understand exactly what you'd like me to do: Do you want me to delete ALL events for today, or just the bookings/appointments? Should I also cancel recurring meetings that fall on today? Do you want me to send cancellation notifications to attendees? This action cannot be undone.",
        "missing_fields": ["confirmation", "scope_of_deletion", "notify_attendees"],
        "conversation_context": "User wants to clear calendar for today but needs confirmation and scope clarification for this destructive action"
      }

      User: "Delete all my meetings this week"
      Response: {
        "clarification_prompt": "This is a significant action that will remove multiple appointments. Are you absolutely sure you want to delete ALL meetings for this entire week? Should I also include personal events or only business meetings? Do you want me to notify all attendees about these cancellations? Please confirm that you want to proceed with deleting everything.",
        "missing_fields": ["final_confirmation", "meeting_types", "attendee_notifications"],
        "conversation_context": "User wants to delete all meetings this week - major destructive action requiring explicit confirmation"
      }

      User: "Add three tasks for Spiros: Task 1 is about litholds due today priority urgent, Task 2 is changing litholds due tomorrow priority medium, Task 3 is updating website due next week priority low"
      Response: {
        "task_prompt": "Create three tasks for Spiros: 1) Task about litholds, due today, urgent priority 2) Changing litholds, due tomorrow, medium priority 3) Updating website, due next week, low priority",
        "conversation_context": "User provided complete task details for Spiros - ready to execute task creation"
      }

      User: "Create a new client named John Smith, email john@example.com, phone 555-0123, company ABC Corp"
      Response: {
        "client_prompt": "Create client: John Smith, email john@example.com, phone 555-0123, company ABC Corp",
        "conversation_context": "User provided complete client information - ready to create client"
      }

      User: "Create a new project for client Spiros called Website Redesign, budget $5000, starts next Monday"
      Response: {
        "project_prompt": "Create project: Website Redesign for Spiros, budget $5000, starts next Monday",
        "conversation_context": "User provided complete project details - ready to create project"
      }

      User: "add a project for my new job at the Johnsons house that starts today and he wants me to be done by the end of the month"
      Response: {
        "project_prompt": "Create project: Johnsons House Job, starts today, deadline end of month",
        "conversation_context": "User provided complete project details with timeline - ready to create project"
      }

      User: "create a website project for ABC company, due next Friday"
      Response: {
        "project_prompt": "Create project: Website for ABC Company, due next Friday",
        "conversation_context": "User provided complete project details with deadline - ready to create project"
      }

      User: "Change theme to dark mode and language to Spanish"
      Response: {
        "settings_prompt": "Change theme to dark mode and language to Spanish",
        "conversation_context": "User wants to update app settings - ready to execute"
      }

      User: "Schedule meeting with George tomorrow at 3 PM for 1 hour via video call to discuss project updates"
      Response: {
        "calendar_prompt": "Schedule meeting with George tomorrow at 3 PM, duration 1 hour, via video call, purpose: discuss project updates",
        "conversation_context": "User provided complete meeting details - ready to schedule"
      }

      User: "How many bookings do I have this month?"
      Response: {
        "booking_prompt": "Provide comprehensive booking analytics and count for this month",
        "conversation_context": "User requesting booking count summary - provide immediate analytics"
      }

      User: "How many appointments do I have?"
      Response: {
        "booking_prompt": "Provide comprehensive appointment/booking analytics and count",
        "conversation_context": "User requesting appointment count summary - provide immediate analytics"
      }

      User: "How many bookings scheduled?"
      Response: {
        "booking_prompt": "Provide comprehensive booking count and scheduling analytics",
        "conversation_context": "User requesting booking scheduling summary - provide immediate analytics"
      }

      User: "Total number of bookings"
      Response: {
        "booking_prompt": "Provide total booking count and comprehensive analytics",
        "conversation_context": "User requesting total booking count - provide immediate analytics"
      }

      User: "How many tasks are completed?"
      Response: {
        "task_prompt": "Provide task analytics focusing on completed tasks and overall status breakdown",
        "conversation_context": "User requesting task completion analytics - provide immediate summary"
      }

      User: "How many clients do I have?"
      Response: {
        "client_prompt": "Provide comprehensive client count and analytics",
        "conversation_context": "User requesting client analytics - provide immediate summary"
      }

      CRITICAL RULE: If user provides complete information (all required details), populate the appropriate prompt field. Only use clarification_prompt when information is genuinely missing.

      Never proceed with incomplete information or destructive actions without explicit confirmation. Always ask detailed follow-up questions when information is missing.
    `;
    
    // If we have previous conversation context, include it
    if (conversationContext) {
      systemPrompt += `\n\nIMPORTANT: This is a follow-up to a previous conversation. Here's the context:\n${conversationContext}\n\nPlease consider this context when determining how to route the user's current message.`;
    }

    // Make the API call to OpenAI
    const response = await routingClient.chat.completions.create({
      model: model, // Use the selected model from the user interface
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature: 0.2, // Low temperature for more consistent routing decisions
      max_tokens: 1000,
      response_format: { type: 'json_object' }
    });

    // Parse the response
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response from OpenAI');
    }

    return JSON.parse(content) as CommandRoutingResult;

  } catch (error) {
    console.error('Error routing input to APIs:', error);
    // Return a fallback response using the keyword router
    console.log('Using fallback keyword router due to OpenAI API error');
    return fallbackKeywordRouter(message);
  }
}