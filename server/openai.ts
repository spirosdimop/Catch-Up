import { OpenAI } from 'openai';

// Ensure API key is set
if (!process.env.OPENAI_API_KEY) {
  console.warn('OPENAI_API_KEY environment variable is not set. AI features will not work properly.');
}

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// Type for AI scheduling responses
export interface SchedulingResponse {
  action: 'create' | 'reschedule' | 'cancel' | 'suggest_times';
  event_title?: string;
  start_time?: string;
  end_time?: string;
  status: 'confirmed' | 'pending' | 'conflict' | 'cancelled';
  notes: string;
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
    // Create system prompt for the scheduling assistant
    const systemPrompt = `
      You are an AI assistant managing a calendar for a busy professional. 
      Your job is to schedule, reschedule, cancel, or suggest new appointments based on availability, rules, and preferences.
      
      Rules you must follow:
      - Avoid double bookings
      - Respect blocked hours (e.g., lunch, travel time)
      - Prefer earliest possible open slots
      - Max 2 hours per client unless stated otherwise
      
      Return ONLY a JSON object with:
      - action (create, reschedule, cancel, suggest_times)
      - event_title (if applicable)
      - start_time (ISO format, if applicable)
      - end_time (ISO format, if applicable)
      - status (confirmed, pending, conflict, cancelled)
      - notes (explanation of decision or suggestions)
    `;

    // Convert user schedule to a string representation
    const scheduleText = JSON.stringify(userSchedule, null, 2);

    // Make the API call to OpenAI
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `
          Current schedule:
          ${scheduleText}
          
          Request:
          ${request}
        `}
      ],
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
    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: `
          Here is my ${timeframe} schedule:
          ${scheduleText}
          
          Please summarize it for me.
        `}
      ],
      temperature: 0.7,
      max_tokens: 1500
    });

    return response.choices[0]?.message?.content || 'Unable to generate schedule summary.';

  } catch (error) {
    console.error('Error generating schedule summary:', error);
    return 'Unable to generate schedule summary due to an error. Please try again later.';
  }
}