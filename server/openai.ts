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
    
    // Get current date information
    const currentDate = new Date();
    const currentDay = currentDate.getDate();
    const currentMonth = currentDate.getMonth() + 1; // JavaScript months are 0-indexed
    const currentYear = currentDate.getFullYear();
    const currentDateString = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${currentDay.toString().padStart(2, '0')}`;
    
    // Create system prompt for the scheduling assistant
    const systemPrompt = `
      You are an AI assistant managing a calendar for a busy professional. 
      Your job is to schedule, reschedule, cancel, or suggest new appointments based on user requests.
      
      IMPORTANT: Today's date is ${currentDateString} (yyyy-mm-dd format). Keep this in mind when scheduling.
      
      IMPORTANT: Always assume the user wants to CREATE a calendar event unless they specifically mention rescheduling or canceling.
      
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
export async function routeInputToApis(message: string, conversationContext?: string): Promise<CommandRoutingResult> {
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
        "missing_fields": ["field1", "field2"], // List any missing information needed for the request (empty if none)
        "conversation_context": "..." // A summary of the current conversation context for future requests
      }
      
      If the user's intent is unclear or lacks specific information, return a clarification_prompt and missing_fields.
      Don't make up information - only route to APIs where the user has provided the necessary context.
      
      Example 1: "Change my status to away and write an auto-reply that I'm on vacation until Friday"
      Should return both settings_prompt and message_prompt.
      
      Example 2: "Schedule a meeting" (lacks details like when, with whom, etc.)
      Should return clarification_prompt and missing_fields.
      
      ALWAYS include a brief "conversation_context" that summarizes the current request and relevant details.
      This will be used to maintain context in follow-up requests.
    `;
    
    // If we have previous conversation context, include it
    if (conversationContext) {
      systemPrompt += `\n\nIMPORTANT: This is a follow-up to a previous conversation. Here's the context:\n${conversationContext}\n\nPlease consider this context when determining how to route the user's current message.`;
    }

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
    // Return a fallback response using the keyword router
    console.log('Using fallback keyword router due to OpenAI API error');
    return fallbackKeywordRouter(message);
  }
}