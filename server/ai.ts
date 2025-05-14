import OpenAI from "openai";

// Initialize the OpenAI client
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
  model: string = "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
  temperature: number = 0.7,
  max_tokens: number = 500
): Promise<string> {
  try {
    const response = await openai.chat.completions.create({
      model,
      messages: [{ role: "user", content: prompt }],
      temperature,
      max_tokens
    });

    return response.choices[0].message.content || "No response generated";
  } catch (error) {
    console.error("Error in LLM chat:", error);
    return `An error occurred: ${error}`;
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
  try {
    const prompt = `
      Based on the following existing tasks and context, suggest 3 new tasks that would help the user be more productive.
      Each task should include a title, description, priority level, and category.
      
      Current tasks:
      ${JSON.stringify(userTasks)}
      
      Additional context:
      ${context ? context : "The user is a freelancer managing multiple projects and clients."}
      
      Respond with JSON in this format:
      [
        {
          "title": "Task title",
          "description": "Detailed description of the task",
          "priority": "normal|high|urgent",
          "category": "Work|Personal|Business Development" 
        }
      ]
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: "system", content: "You are an AI assistant that helps users manage their tasks and productivity." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    if (response.choices[0].message.content) {
      const result = JSON.parse(response.choices[0].message.content);
      return Array.isArray(result) ? result : [];
    }
    return [];
  } catch (error) {
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
  try {
    const tasksByStatus = {
      completed: userTasks.filter(task => task.status === "completed").length,
      inProgress: userTasks.filter(task => task.status === "in_progress").length,
      todo: userTasks.filter(task => task.status === "todo").length
    };

    const tasksByPriority = {
      urgent: userTasks.filter(task => task.priority === "urgent").length,
      high: userTasks.filter(task => task.priority === "high").length,
      normal: userTasks.filter(task => task.priority === "normal").length
    };

    const prompt = `
      Provide a concise summary of the user's task status and offer 2-3 specific productivity recommendations.
      
      Task statistics:
      - Completed tasks: ${tasksByStatus.completed}
      - In-progress tasks: ${tasksByStatus.inProgress}
      - To-do tasks: ${tasksByStatus.todo}
      - Urgent priority tasks: ${tasksByPriority.urgent}
      - High priority tasks: ${tasksByPriority.high}
      - Normal priority tasks: ${tasksByPriority.normal}
      
      Task details:
      ${JSON.stringify(userTasks)}
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { 
          role: "system", 
          content: "You are a productive assistant that analyzes task data and provides concise, actionable insights. Keep your response under 250 words." 
        },
        { role: "user", content: prompt }
      ]
    });

    return response.choices[0].message.content || "No insights generated.";
  } catch (error) {
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
  try {
    const prompt = `
      Based on the following tasks, suggest the optimal order in which they should be completed.
      Consider deadlines, priorities, dependencies, and estimated effort.
      
      Tasks:
      ${JSON.stringify(tasks)}
      
      Respond with JSON in this format:
      {
        "prioritizedTasks": [
          {
            "id": 1,
            "title": "Task title",
            "reason": "Why this task should be done first/next"
          }
        ],
        "explanation": "Brief explanation of your overall prioritization strategy"
      }
    `;

    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { 
          role: "system", 
          content: "You are an AI assistant that helps users optimize their task workflow and productivity." 
        },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });

    if (response.choices[0].message.content) {
      return JSON.parse(response.choices[0].message.content);
    }
    return {
      prioritizedTasks: [],
      explanation: "No prioritization data generated."
    };
  } catch (error) {
    console.error("Error generating task prioritization:", error);
    return {
      prioritizedTasks: [],
      explanation: "Unable to generate task prioritization at this time."
    };
  }
}

// Settings management functionality
export async function updateSettings(settingName: string, value: any): Promise<string> {
  try {
    // In a real application, this would update a database or configuration file
    console.log(`Updating setting '${settingName}' to '${value}'`);
    return `Setting '${settingName}' updated to '${value}'.`;
  } catch (error) {
    console.error("Error updating settings:", error);
    return `Failed to update setting: ${error}`;
  }
}

// Message creation functionality
export async function createMessage(toAddress: string, subject: string, body: string): Promise<string> {
  try {
    // In a real application, this would connect to an email service or messaging API
    console.log(`Creating message to '${toAddress}' with subject '${subject}'`);
    return `Message created and ready to send to ${toAddress}.`;
  } catch (error) {
    console.error("Error creating message:", error);
    return `Failed to create message: ${error}`;
  }
}

// Command interpretation
export async function processCommand(command: string): Promise<any> {
  try {
    // Send the command to OpenAI for interpretation
    const prompt = `
      Parse the following command and determine the action and parameters.
      Return a JSON object with 'action' and 'parameters' fields.
      Possible actions: update_settings, create_message, create_task, suggest_tasks
      
      Command: "${command}"
    `;
    
    const response = await openai.chat.completions.create({
      model: "gpt-4o", // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: "system", content: "You are an assistant that helps parse user commands into structured actions." },
        { role: "user", content: prompt }
      ],
      response_format: { type: "json_object" }
    });
    
    if (response.choices[0].message.content) {
      const result = JSON.parse(response.choices[0].message.content);
      
      // Execute the appropriate action based on the parsed command
      const action = result.action;
      const params = result.parameters || {};
      
      if (action === "update_settings") {
        return {
          success: true,
          result: await updateSettings(params.setting_name, params.value)
        };
      } else if (action === "create_message") {
        return {
          success: true,
          result: await createMessage(params.to_address, params.subject, params.body)
        };
      } else if (action === "create_task") {
        return {
          success: true,
          action: "create_task",
          task: {
            title: params.title,
            description: params.description || "",
            priority: params.priority || "normal",
            category: params.category || "Work"
          }
        };
      } else {
        return {
          success: false,
          result: "Unknown action or not implemented yet."
        };
      }
    }
    
    return {
      success: false,
      result: "Failed to parse command."
    };
  } catch (error) {
    console.error("Error processing command:", error);
    return {
      success: false,
      result: `Error processing command: ${error}`
    };
  }
}