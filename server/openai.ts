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
  action: 'create' | 'reschedule' | 'cancel' | 'suggest_times';
  event_title?: string;
  start_time?: string;
  end_time?: string;
  status: 'confirmed' | 'pending' | 'conflict' | 'cancelled';
  notes: string;
  event_id?: number; // Added for when events are created
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
    
    // Create system prompt for the scheduling assistant
    const systemPrompt = `
      You are an AI assistant managing a calendar for a busy professional. 
      Your job is to schedule, reschedule, cancel, or suggest new appointments based on user requests.
      
      IMPORTANT: Always assume the user wants to CREATE a calendar event unless they specifically mention rescheduling or canceling.
      
      Rules you must follow:
      - Always extract specific meeting details from user requests (time, date, client name, purpose)
      - If specific time is not mentioned, schedule for 10:00 AM on the next business day
      - If duration is not mentioned, default to 1 hour meetings
      - Set meeting titles to be descriptive (e.g., "Meeting with Client Name: Purpose")
      - Always set status to "confirmed" unless there's a specific conflict
      - Include meeting details in the notes field
      - ALWAYS use the current year (${new Date().getFullYear()}) for dates unless explicitly specified otherwise
      - For any dates without a year specified, use the current year or a future date
      - If a meeting is scheduled for a date that has already passed in the current year, schedule it for next year
      
      Return ONLY a JSON object with:
      - action (create, reschedule, cancel, suggest_times)
      - event_title (if applicable)
      - start_time (ISO format, if applicable)
      - end_time (ISO format, if applicable)
      - status (confirmed, pending, conflict, cancelled)
      - notes (explanation of decision or the meeting details including agenda items and preparation notes)
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
  clarification_prompt?: string;
  missing_fields?: string[];
}

/**
 * Routes a user input message to the appropriate specialized API
 * @param message The user's natural language input message
 * @returns An object containing prompts for each API or clarification requests
 */
export async function routeInputToApis(message: string): Promise<CommandRoutingResult> {
  try {
    // Get OpenAI client specifically for routing (using the general client)
    const routingClient = getOpenAIClient('general');
    
    // Create system prompt for the command router
    const systemPrompt = `
      You are an AI assistant that routes user requests to the appropriate specialized API. 
      Based on the user's message, determine which of the following APIs should handle the request:
      
      1. settings_api - For changing app settings, preferences, availability status, etc.
      2. calendar_api - For scheduling, rescheduling, or canceling events and meetings.
      3. message_api - For generating professional auto-response messages when the user is unavailable.
      
      Analyze the user's message and output a JSON object with the following structure:
      {
        "settings_prompt": "...", // Include only if the message contains a settings-related request (null otherwise)
        "calendar_prompt": "...", // Include only if the message contains a calendar-related request (null otherwise)
        "message_prompt": "...", // Include only if the message contains a message generation request (null otherwise)
        "clarification_prompt": "...", // Include only if more information is needed to process the request (null otherwise)
        "missing_fields": ["field1", "field2"] // List any missing information needed for the request (empty if none)
      }
      
      If the user's intent is unclear or lacks specific information, return a clarification_prompt and missing_fields.
      Don't make up information - only route to APIs where the user has provided the necessary context.
      
      Example 1: "Change my status to away and write an auto-reply that I'm on vacation until Friday"
      Should return both settings_prompt and message_prompt.
      
      Example 2: "Schedule a meeting" (lacks details like when, with whom, etc.)
      Should return clarification_prompt and missing_fields.
    `;

    // Make the API call to OpenAI
    const response = await routingClient.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
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
    // Return a fallback response asking for clarification
    return {
      clarification_prompt: "I'm having trouble understanding your request. Could you please be more specific about what you'd like to do?"
    };
  }
}