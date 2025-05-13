import { OpenAI } from 'openai';

// Supported assistant types
export type AssistantType = 'general' | 'scheduling' | 'settings';

// Define environment variable keys for different assistants
const API_KEY_MAP: Record<AssistantType, string> = {
  'general': 'OPENAI_API_KEY',           // General assistant uses the main OpenAI API key
  'scheduling': 'OPENAI_SCHEDULING_KEY', // Scheduling assistant can use a separate key
  'settings': 'OPENAI_SETTINGS_KEY'      // Settings assistant can use a separate key
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