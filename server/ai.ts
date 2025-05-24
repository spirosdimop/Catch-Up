import OpenAI from "openai";

// Initialize OpenAI with API key from environment
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

/**
 * Basic LLM chat function that sends a prompt to the OpenAI API
 * @param prompt The prompt to send to the LLM
 * @param model The model to use (default is gpt-4o)
 * @param temperature Controls randomness (default is 0.7)
 * @param max_tokens Maximum tokens to generate (default is 500)
 * @returns The generated response text
 */
export async function chatWithLLM(
  prompt: string,
  model: string = "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
  temperature: number = 0.7,
  max_tokens: number = 500
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature,
      max_tokens,
    });

    return response.choices[0].message.content || "No response generated";
  } catch (error: any) {
    console.error("Error calling OpenAI API:", error);
    throw new Error(`Failed to communicate with AI service: ${error.message}`);
  }
}

/**
 * Generate task suggestions based on the user's existing tasks and priorities
 * @param userTasks Array of existing user tasks
 * @param context Additional context about the user's priorities
 * @returns Array of suggested task objects
 */
export async function generateTaskSuggestions(
  userTasks: any[],
  context?: string
): Promise<any[]> {
  const tasksJson = JSON.stringify(userTasks);

  const prompt = `Based on the user's current tasks and priorities, suggest 3-5 additional tasks that would help them make progress.

Current Tasks:
${tasksJson}

${context ? `Additional Context: ${context}` : ""}

Respond with a JSON array of task objects with these fields:
- title: string (brief task name)
- description: string (detailed explanation)
- priority: string ("high", "normal", or "low")
- category: string (appropriate category)

Format your response as a valid JSON array only.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4", // Using stable GPT-4 model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    const parsedContent = JSON.parse(content || "{}");

    // Extract tasks array from the response if it's wrapped in an object
    const suggestions = Array.isArray(parsedContent) 
      ? parsedContent 
      : (parsedContent.tasks || parsedContent.suggestions || []);

    return suggestions;
  } catch (error: any) {
    console.error("Error generating task suggestions:", error);
    return [];
  }
}

/**
 * Generate a summary of the user's tasks and priorities
 * @param userTasks Array of user tasks
 * @returns A summary string with insights and recommendations
 */
export async function generateTaskSummary(userTasks: any[]): Promise<string> {
  const tasksJson = JSON.stringify(userTasks);

  const prompt = `Analyze the user's tasks below and provide a concise summary of their workload, priorities, and potential issues.

User Tasks:
${tasksJson}

Please include:
1. Overall workload assessment
2. Priority distribution
3. Upcoming deadlines
4. Potential bottlenecks or scheduling conflicts
5. Brief recommendations

Keep your response under 250 words and focus on actionable insights.`;

  try {
    const summaryText = await chatWithLLM(prompt, "gpt-4o", 0.5, 350);
    return summaryText;
  } catch (error: any) {
    console.error("Error generating task summary:", error);
    return "Unable to generate task summary at this time.";
  }
}

/**
 * Analyze the optimal order for tasks based on priority, deadlines, and dependencies
 * @param tasks Array of user tasks
 * @returns Reordered array of tasks with explanations
 */
export async function suggestTaskPrioritization(tasks: any[]): Promise<any> {
  const tasksJson = JSON.stringify(tasks);

  const prompt = `Given the following list of tasks, suggest an optimal order to complete them based on priorities, deadlines, and potential dependencies.

Tasks:
${tasksJson}

Provide:
1. A reordered list with task IDs
2. Brief explanation for the suggested order
3. Any tasks that could be delegated or postponed

Respond with JSON in this format:
{
  "orderedTasks": [task_id1, task_id2, ...],
  "explanation": "explanation text",
  "recommendations": ["recommendation1", "recommendation2", ...]
}`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-4", // Using stable GPT-4 model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.7,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    return JSON.parse(content || "{}");
  } catch (error: any) {
    console.error("Error suggesting task prioritization:", error);
    return { error: "Unable to suggest prioritization at this time" };
  }
}

export async function updateSettings(settingName: string, value: any): Promise<string> {
  // Mock implementation - would connect to a real settings service
  return `Updated ${settingName} to ${value}`;
}

export async function createMessage(toAddress: string, subject: string, body: string): Promise<string> {
  // Mock implementation - would connect to a real messaging service
  return `Message to ${toAddress} created successfully`;
}

export async function processCommand(command: string): Promise<any> {
  try {
    // Prompt for OpenAI to classify and extract data from the command
    const prompt = `Parse the following user command and identify the intended action. 

User command: "${command}"

Classify the command into one of these categories:
1. create_task - Creating a new task
2. update_settings - Changing a setting
3. create_message - Sending a message
4. unknown - If the command doesn't fit any of the above

Respond with a JSON object in the following format:
{
  "action": "create_task|update_settings|create_message|unknown",
  "success": true,
  "task": {
    "title": "task title",
    "description": "task description",
    "priority": "high|normal|low",
    "category": "category name"
  },
  "setting": {
    "name": "setting name",
    "value": "setting value"
  },
  "message": {
    "to": "recipient",
    "subject": "subject line",
    "body": "message body"
  },
  "result": "Human-readable result of the operation"
}

Only include the relevant fields based on the identified action. If action is "unknown", include a helpful result message suggesting valid commands.`;

    const response = await openai.chat.completions.create({
      model: "gpt-4", // Using stable GPT-4 model
      messages: [{ role: "user", content: prompt }],
      temperature: 0.3,
      max_tokens: 1000,
      response_format: { type: "json_object" }
    });

    const content = response.choices[0].message.content;
    const parsedResponse = JSON.parse(content || "{}");

    // Handle different command types
    switch (parsedResponse.action) {
      case "create_task":
        // In a real app, we would save the task to a database
        return {
          success: true,
          action: "create_task",
          task: parsedResponse.task,
          result: `Created new ${parsedResponse.task.priority} priority task: ${parsedResponse.task.title}`
        };

      case "update_settings":
        if (parsedResponse.setting) {
          const result = await updateSettings(parsedResponse.setting.name, parsedResponse.setting.value);
          return {
            success: true,
            action: "update_settings",
            result
          };
        }
        break;

      case "create_message":
        if (parsedResponse.message) {
          const result = await createMessage(
            parsedResponse.message.to,
            parsedResponse.message.subject,
            parsedResponse.message.body
          );
          return {
            success: true,
            action: "create_message",
            result
          };
        }
        break;

      case "unknown":
      default:
        return {
          success: false,
          action: "unknown",
          result: parsedResponse.result || "I'm not sure how to process that command. Try asking me to create a task, update a setting, or send a message."
        };
    }

    return parsedResponse;
  } catch (error: any) {
    console.error("Error processing command:", error);
    return { 
      success: false, 
      action: "error",
      result: "Sorry, I couldn't process that command due to a technical issue."
    };
  }
}