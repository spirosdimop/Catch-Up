import { Router } from "express";
import { z } from "zod";
import { storage } from "../storage";
import {
  processSchedulingRequest,
  generateScheduleSummary,
  generateAutoResponse,
  routeInputToApis,
  getOpenAIClient
} from "../openai";

const router = Router();

// AI Assistant Endpoints
router.post("/ai/chat", async (req, res) => {
  try {
    const { message, history } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: "Invalid request. 'message' must be a string." });
    }
    
    // Get OpenAI client specifically for general chat
    const generalChatClient = getOpenAIClient('general');
    
    // Prepare messages for OpenAI
    const messages = [
      { role: 'system', content: `You are a helpful freelancer business assistant. You provide detailed, practical advice for freelancers managing their business.

IMPORTANT PRIORITY ORDER:
1. If the user mentions ANY scheduling terms (meeting, appointment, calendar, schedule, etc.), ALWAYS respond with: "I notice you want to schedule something. Please use the Scheduling Assistant tab to directly add this to your calendar. Would you like me to help with anything else?"
2. If the user mentions changing settings, ALWAYS respond with: "To change your app settings, please use the App Settings tab where you can use natural language to update your preferences. Would you like me to help with anything else?"
3. Only if the message contains NO scheduling or settings requests, provide helpful business advice.

When providing business advice, be thorough and organized with clear sections.

Remember: The most helpful thing you can do is direct users to the specialized tools for scheduling and settings rather than just giving advice about these topics.` },
    ];
    
    // Add conversation history if provided
    if (Array.isArray(history)) {
      // Only include the last 10 messages to stay within token limits
      const recentHistory = history.slice(-10);
      messages.push(...recentHistory);
    }
    
    // Add the current user message
    messages.push({ role: 'user', content: message });
    
    // Make the API call to OpenAI using the general client
    const response = await generalChatClient.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: messages as any, // Type casting to fix TypeScript error
      temperature: 0.7,
      max_tokens: 500
    });
    
    const responseContent = response.choices[0]?.message?.content || "I'm sorry, I couldn't generate a response.";
    
    res.json({ message: responseContent });
  } catch (error) {
    console.error("Error in AI chat:", error);
    // Check for specific error types
    if (error instanceof z.ZodError) {
      return res.status(400).json({ 
        message: "Invalid request format",
        errors: error.errors
      });
    }
    // Handle network or API errors
    if (error instanceof Error && error.message.includes('OpenAI')) {
      return res.status(503).json({
        message: "AI service temporarily unavailable",
        retry_after: 30
      });
    }
    res.status(500).json({ 
      message: "Failed to process chat message",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

router.post("/ai/scheduling", async (req, res) => {
  try {
    const { schedule, request } = req.body;
    
    if (!request || typeof request !== 'string') {
      return res.status(400).json({ message: "Invalid request. 'request' must be a string." });
    }
    
    // Default userId for demo purposes, in a real app this would come from auth
    const userId = req.query.userId as string || "user-1";
    
    // If no schedule provided, fetch from storage
    const userSchedule = schedule || await storage.getEvents(userId);
    
    // Process the scheduling request with OpenAI
    const schedulingResponse = await processSchedulingRequest(userSchedule, request);
    
    // If action is create, actually create the event
    if (schedulingResponse.action === 'create' && 
        schedulingResponse.event_title && 
        schedulingResponse.start_time && 
        schedulingResponse.end_time) {
      
      try {
        // Create the event in the database
        const newEvent = await storage.createEvent({
          userId,
          title: schedulingResponse.event_title,
          description: schedulingResponse.notes,
          startTime: new Date(schedulingResponse.start_time),
          endTime: new Date(schedulingResponse.end_time),
          isConfirmed: schedulingResponse.status === 'confirmed',
          eventType: 'client_meeting', // Default event type
        });
        
        // Add the created event ID to the response
        schedulingResponse.event_id = newEvent.id;
      } catch (createError) {
        console.error("Error creating event:", createError);
        // Continue with response even if event creation fails
      }
    }
    
    res.json(schedulingResponse);
  } catch (error) {
    console.error("Error processing scheduling request:", error);
    res.status(500).json({ 
      message: "Failed to process scheduling request",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

router.post("/ai/schedule-summary", async (req, res) => {
  try {
    const { userId, timeframe } = req.body;
    
    // Default userId and timeframe if not provided
    const userIdToUse = userId || "user-1";
    const timeframeToUse = timeframe || "upcoming";
    
    // Fetch user's events
    const events = await storage.getEvents(userIdToUse);
    
    // Generate summary using OpenAI
    const summary = await generateScheduleSummary(events, timeframeToUse);
    
    res.json({ summary });
  } catch (error) {
    console.error("Error generating schedule summary:", error);
    res.status(500).json({ 
      message: "Failed to generate schedule summary",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// API endpoint for app settings control
router.post("/ai/app-settings", async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ message: "Invalid request. 'message' must be a string." });
    }
    
    // Get OpenAI client specifically for settings
    const settingsClient = getOpenAIClient('settings');
    
    // System prompt for app settings extraction
    const systemPrompt = `
      You are an assistant that controls app settings. Convert the user's message into a JSON object 
      containing only the settings they want to change. Do not include any values that are not 
      explicitly mentioned or implied. Format strictly in JSON.
      
      Supported settings include:
      - availability (available, busy, away)
      - auto_reply_enabled (true/false)
      - language (e.g., 'en', 'el')
      - preferred_route_type (fastest, greenest)
      - notification_preferences (all, important_only, none)
      - default_reply_message (custom string)
    `;
    
    // Make the API call to OpenAI
    const response = await settingsClient.chat.completions.create({
      model: 'gpt-4o', // the newest OpenAI model is "gpt-4o" which was released May 13, 2024
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ] as any,
      temperature: 0.1, // Low temperature for more consistent outputs
      max_tokens: 300,
      response_format: { type: "json_object" }
    });
    
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error('No content in response from OpenAI');
    }
    
    // Return the parsed JSON settings
    const settings = JSON.parse(content);
    res.json(settings);
    
  } catch (error) {
    console.error("Error processing app settings:", error);
    res.status(500).json({ 
      message: "Failed to process app settings request",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// API endpoint for auto-response generation
router.post("/ai/auto-response", async (req, res) => {
  try {
    const { context } = req.body;
    
    // Default context if not provided
    const contextToUse = typeof context === 'string' ? context : 'missed call';
    
    // Generate auto-response message using OpenAI with dedicated key
    const autoResponseMessage = await generateAutoResponse(contextToUse);
    
    res.json({ message: autoResponseMessage });
  } catch (error) {
    console.error("Error generating auto-response:", error);
    res.status(500).json({ 
      message: "Failed to generate auto-response message",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});

// Unified command API endpoint
router.post("/command", async (req, res) => {
  try {
    const { message, userId = "user-1", conversationContext, model = "gpt-4o" } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        message: "Invalid request. 'message' must be a string." 
      });
    }
    
    // Create a record of the command in the database
    let commandRecord;
    try {
      commandRecord = await storage.createAiCommand({
        userId,
        userPrompt: message,
        commandType: 'unified',
        status: 'success'
      });
      console.log('Created AI command record:', commandRecord.id);
    } catch (dbError) {
      console.error('Error creating AI command record:', dbError);
      // Continue even if we couldn't record the command
    }
    
    // First, route the message to determine which APIs to call
    let routingResult;
    try {
      // Pass the conversation context and model if provided
      routingResult = await routeInputToApis(message, conversationContext, model);
    } catch (routingError) {
      console.error('Error during API routing:', routingError);
      
      // Update command status if we have a command record
      if (commandRecord) {
        try {
          await storage.updateAiCommand(commandRecord.id, { status: 'error' });
        } catch (updateError) {
          console.error('Error updating AI command status:', updateError);
        }
      }
      
      // Return a friendly error message if the routing fails (likely due to API key issues)
      return res.json({
        status: "needs_clarification",
        ask_user: "I'm sorry, but I'm having trouble understanding your request right now. Could you try again later or contact support if the issue persists?"
      });
    }
    
    // If clarification is needed, return that to the client along with context
    if (routingResult.clarification_prompt) {
      return res.json({
        status: "needs_clarification",
        ask_user: routingResult.clarification_prompt,
        missing_fields: routingResult.missing_fields || [],
        conversation_context: routingResult.conversation_context || conversationContext
      });
    }
    
    // Results object to collect responses from each API
    const results: Record<string, any> = {
      status: "success",
      conversation_context: routingResult.conversation_context || conversationContext
    };
    
    // Process settings request if present
    if (routingResult.settings_prompt) {
      try {
        // If we have a direct settings response from the keyword router, use it
        if (routingResult.settings_response) {
          console.log('Using direct settings response from keyword router');
          results.settings = routingResult.settings_response;
          
          // Record this effect in the database if we have a command record
          if (commandRecord) {
            try {
              await storage.createAiCommandEffect({
                commandId: commandRecord.id,
                effectType: 'update_settings',
                targetType: 'settings',
                targetId: null,
                details: JSON.stringify(routingResult.settings_response)
              });
            } catch (effectError) {
              console.error('Error recording settings effect:', effectError);
              // Continue even if we couldn't record the effect
            }
          }
        } else {
          // Otherwise try to use OpenAI
          const settingsClient = getOpenAIClient('settings');
          
          const settingsResponse = await settingsClient.chat.completions.create({
            model: 'gpt-4o',
            messages: [
              { 
                role: 'system', 
                content: `You are an assistant that controls app settings. Convert the user's message into a JSON object 
                          containing only the settings they want to change.
                          
                          For language settings, always use the ISO language code format:
                          - 'en' for English
                          - 'es' for Spanish
                          - 'fr' for French
                          - 'de' for German  
                          - 'zh' for Chinese
                          - 'ja' for Japanese
                          
                          Example output for language change:
                          {
                            "language": "es"
                          }
                          
                          NEVER use full language names like "Spanish" - always use the code "es" instead.`
              },
              { role: 'user', content: routingResult.settings_prompt }
            ],
            temperature: 0.1,
            max_tokens: 300,
            response_format: { type: "json_object" }
          });
          
          const settingsContent = settingsResponse.choices[0]?.message?.content;
          if (settingsContent) {
            // Parse the settings
            const parsedSettings = JSON.parse(settingsContent);
            
            // Standardize language names to ISO codes
            if (parsedSettings.language) {
              // Convert full language names to ISO codes
              const languageMap: Record<string, string> = {
                'english': 'en',
                'spanish': 'es',
                'french': 'fr',
                'german': 'de',
                'chinese': 'zh',
                'japanese': 'ja'
              };
              
              // Check if the language value is a full name that needs conversion
              const lowerCaseLanguage = parsedSettings.language.toLowerCase();
              if (languageMap[lowerCaseLanguage]) {
                console.log(`Converting language name "${parsedSettings.language}" to code "${languageMap[lowerCaseLanguage]}"`);
                parsedSettings.language = languageMap[lowerCaseLanguage];
              }
            }
            
            results.settings = parsedSettings;
            
            // Record this effect in the database if we have a command record
            if (commandRecord) {
              try {
                await storage.createAiCommandEffect({
                  commandId: commandRecord.id,
                  effectType: 'update_settings',
                  targetType: 'settings',
                  targetId: null,
                  details: settingsContent
                });
              } catch (effectError) {
                console.error('Error recording OpenAI settings effect:', effectError);
                // Continue even if we couldn't record the effect
              }
            }
          }
        }
      } catch (settingsError) {
        console.error('Error processing settings:', settingsError);
        
        // Add error information to the results
        if (routingResult.settings_response) {
          // If we have a direct response, use it even if OpenAI failed
          results.settings = routingResult.settings_response;
        } else {
          results.settings_error = "Unable to process settings request";
        }
      }
    }
    
    // Process calendar request if present
    if (routingResult.calendar_prompt) {
      try {
        // Check if this is a count/summary request for bookings
        const isBookingCountRequest = (message.toLowerCase().includes('how many') || 
                                     message.toLowerCase().includes('count') ||
                                     message.toLowerCase().includes('total') ||
                                     message.toLowerCase().includes('number of')) &&
                                    (message.toLowerCase().includes('booking') || 
                                     message.toLowerCase().includes('appointment'));
        
        if (isBookingCountRequest) {
          // Provide booking analytics instead of creating calendar events
          const bookings = await storage.getBookings();
          const bookingsByStatus = bookings.reduce((acc, booking) => {
            acc[booking.status] = (acc[booking.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const thisMonthBookings = bookings.filter(b => {
            const bookingDate = new Date(b.date);
            return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
          }).length;
          
          const totalDuration = bookings.reduce((sum, b) => sum + (b.duration || 0), 0);
          
          results.calendar = {
            booking_analytics: {
              total: bookings.length,
              by_status: bookingsByStatus,
              this_month: thisMonthBookings,
              total_duration_minutes: totalDuration,
              summary: `You have ${bookings.length} total bookings with ${totalDuration} minutes scheduled. This month: ${thisMonthBookings} bookings. Status breakdown: ${Object.entries(bookingsByStatus).map(([status, count]) => `${count} ${status}`).join(', ')}.`
            }
          };
        } else {
          // Get user's existing schedule for calendar operations
          const userId = "user-1"; // Default user ID
          const schedule = await storage.getEvents(userId);
          
          // Process the scheduling request
          let calendarResponse;
          
          try {
            calendarResponse = await processSchedulingRequest(schedule, routingResult.calendar_prompt);
          } catch (e) {
          console.log("Using fallback calendar processing due to API error");
          // Fallback calendar processing logic that doesn't require OpenAI
          const userInput = routingResult.calendar_prompt.toLowerCase();
          
          // Extract event title - use everything after "schedule" or "meeting" keyword if found
          let eventTitle = "New Meeting";
          if (userInput.includes("meeting with")) {
            const match = userInput.match(/meeting with\s+([^\s].*?)(?:\s+on|\s+at|\s+tomorrow|$)/i);
            if (match && match[1]) {
              eventTitle = `Meeting with ${match[1].trim()}`;
            }
          } else if (userInput.includes("schedule")) {
            const match = userInput.match(/schedule\s+([^\s].*?)(?:\s+on|\s+at|\s+tomorrow|$)/i);
            if (match && match[1]) {
              eventTitle = match[1].trim();
            }
          }
          
          // Extract date - look for "tomorrow", "today", or specific date patterns
          const now = new Date();
          let startDate = new Date();
          startDate.setHours(10, 0, 0, 0); // Default to 10:00 AM
          
          // For testing and demonstration, log the user input for debugging
          console.log(`Parsing date/time from user input: "${userInput}"`);
          
          // Default to 10:00 AM
          startDate.setHours(10, 0, 0, 0);
          
          if (userInput.includes("tomorrow")) {
            console.log("Found 'tomorrow' in input - setting date to tomorrow");
            startDate.setDate(startDate.getDate() + 1);
          } else if (userInput.includes("today")) {
            console.log("Found 'today' in input - keeping date as today");
            // Already set to today
          } else {
            // Try to find month names or numbers
            const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
            let foundMonth = false;
            
            for (let i = 0; i < monthNames.length; i++) {
              if (userInput.includes(monthNames[i])) {
                // Extract day number that appears near month name
                const dayMatch = userInput.match(new RegExp(monthNames[i] + "\\s+(\\d+)", "i"));
                if (dayMatch && dayMatch[1]) {
                  const day = parseInt(dayMatch[1], 10);
                  if (day >= 1 && day <= 31) {
                    console.log(`Found month ${monthNames[i]} and day ${day}`);
                    startDate.setMonth(i);
                    startDate.setDate(day);
                    foundMonth = true;
                    break;
                  }
                }
              }
            }
            
            // If we didn't find a month name, look for date patterns like MM/DD
            if (!foundMonth) {
              const dateMatch = userInput.match(/(\d{1,2})[\/\-](\d{1,2})/);
              if (dateMatch) {
                const month = parseInt(dateMatch[1], 10) - 1; // JavaScript months are 0-based
                const day = parseInt(dateMatch[2], 10);
                if (month >= 0 && month < 12 && day >= 1 && day <= 31) {
                  console.log(`Found date format MM/DD: ${month+1}/${day}`);
                  startDate.setMonth(month);
                  startDate.setDate(day);
                }
              }
            }
            
            // If we still don't have a specific date, default to tomorrow
            if (!foundMonth && !userInput.includes("today")) {
              console.log("No specific date found in input - defaulting to tomorrow");
              startDate.setDate(startDate.getDate() + 1);
            }
          }
          
          // Extract time if present - handle formats like "3pm", "3:30pm", "15:00", etc.
          let foundTime = false;
          
          // Pattern for "X pm/am" or "X:YY pm/am"
          const timeMatch = userInput.match(/(\d{1,2})(?::(\d{2}))?\s*(am|pm)/i);
          if (timeMatch) {
            let hour = parseInt(timeMatch[1], 10);
            const minute = timeMatch[2] ? parseInt(timeMatch[2], 10) : 0;
            const meridian = timeMatch[3].toLowerCase();
            
            // Adjust hour based on AM/PM
            if (meridian === "pm" && hour < 12) {
              hour += 12;
            } else if (meridian === "am" && hour === 12) {
              hour = 0;
            }
            
            if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
              console.log(`Found time: ${hour}:${minute} ${meridian}`);
              startDate.setHours(hour, minute, 0, 0);
              foundTime = true;
            }
          }
          
          // Pattern for 24-hour time format "HH:MM"
          if (!foundTime) {
            const militaryTimeMatch = userInput.match(/(?<!\d)(\d{1,2}):(\d{2})(?!\s*(am|pm))/i);
            if (militaryTimeMatch) {
              const hour = parseInt(militaryTimeMatch[1], 10);
              const minute = parseInt(militaryTimeMatch[2], 10);
              
              if (hour >= 0 && hour < 24 && minute >= 0 && minute < 60) {
                console.log(`Found 24-hour time: ${hour}:${minute}`);
                startDate.setHours(hour, minute, 0, 0);
                foundTime = true;
              }
            }
          }
          
          // Look for common time indicators if no specific time format was found
          if (!foundTime) {
            if (userInput.includes("morning")) {
              console.log("Found 'morning' - setting time to 9:00 AM");
              startDate.setHours(9, 0, 0, 0);
            } else if (userInput.includes("afternoon")) {
              console.log("Found 'afternoon' - setting time to 2:00 PM");
              startDate.setHours(14, 0, 0, 0);
            } else if (userInput.includes("evening")) {
              console.log("Found 'evening' - setting time to 6:00 PM");
              startDate.setHours(18, 0, 0, 0);
            } else if (userInput.includes("night")) {
              console.log("Found 'night' - setting time to 8:00 PM");
              startDate.setHours(20, 0, 0, 0);
            }
          }
          
          // Create end time (1 hour after start time)
          const endDate = new Date(startDate);
          endDate.setHours(endDate.getHours() + 1);
          
          // Create calendar response object
          calendarResponse = {
            action: 'create',
            event_title: eventTitle,
            start_time: startDate.toISOString(),
            end_time: endDate.toISOString(),
            status: 'confirmed',
            notes: `Meeting scheduled for ${startDate.toLocaleString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
              hour: 'numeric',
              minute: 'numeric'
            })}. Created from user request: "${routingResult.calendar_prompt}". Today's date is ${new Date().toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric'
            })}.`,
            event_id: undefined // Add this to match the SchedulingResponse interface
          };
        }
        
        // Handle different calendar actions
        if (calendarResponse.action === 'create' && 
            calendarResponse.event_title && 
            calendarResponse.start_time && 
            calendarResponse.end_time) {
          try {
            // Create the event in the database
            const newEvent = await storage.createEvent({
              userId,
              title: calendarResponse.event_title,
              description: calendarResponse.notes,
              startTime: new Date(calendarResponse.start_time),
              endTime: new Date(calendarResponse.end_time),
              isConfirmed: calendarResponse.status === 'confirmed',
              eventType: 'client_meeting', // Default event type
            });
            
            // Add the created event ID to the response
            calendarResponse.event_id = newEvent.id;
            
            // Record this effect in the database if we have a command record
            if (commandRecord) {
              try {
                await storage.createAiCommandEffect({
                  commandId: commandRecord.id,
                  effectType: 'create_event',
                  targetType: 'event',
                  targetId: newEvent.id.toString(),
                  details: JSON.stringify({
                    title: newEvent.title,
                    start: newEvent.startTime,
                    end: newEvent.endTime
                  })
                });
              } catch (effectError) {
                console.error('Error recording AI command effect:', effectError);
                // Continue even if we couldn't record the effect
              }
            }
          } catch (createError) {
            console.error("Error creating event:", createError);
          }
        } 
        // Handle delete events
        else if (calendarResponse.action === 'delete' || calendarResponse.action === 'cancel') {
          try {
            let eventId = calendarResponse.event_id;
            let eventTitle = calendarResponse.event_title;
            let deletedEvent = null;
            
            // If we have an event ID, use it directly to delete
            if (eventId) {
              deletedEvent = await storage.deleteEvent(eventId);
            } 
            // If we have a title but no ID, try to find the event by title
            else if (eventTitle) {
              // Get all events
              const allEvents = await storage.getEvents(userId);
              
              // Find events with matching title (case insensitive)
              const matchingEvents = allEvents.filter(event => 
                event.title.toLowerCase().includes(eventTitle!.toLowerCase())
              );
              
              // If we found exactly one match, delete it
              if (matchingEvents.length === 1) {
                deletedEvent = await storage.deleteEvent(matchingEvents[0].id);
                eventId = matchingEvents[0].id;
              }
              // If we found multiple matches, update the response to indicate this
              else if (matchingEvents.length > 1) {
                calendarResponse.status = 'conflict';
                calendarResponse.notes = `Found multiple events matching "${eventTitle}". Please specify which one to delete by using a more specific title or mentioning the date.`;
              }
              // If no matches, indicate this in the response
              else {
                calendarResponse.status = 'conflict';
                calendarResponse.notes = `No events found matching "${eventTitle}". Please check the title and try again.`;
              }
            }
            
            // If we successfully deleted an event, update the response
            if (deletedEvent) {
              calendarResponse.status = 'deleted';
              
              // Record this effect in the database if we have a command record
              if (commandRecord && eventId) {
                try {
                  await storage.createAiCommandEffect({
                    commandId: commandRecord.id,
                    effectType: 'delete_event',
                    targetType: 'event',
                    targetId: eventId.toString(),
                    details: JSON.stringify({
                      title: eventTitle || 'Unknown event'
                    })
                  });
                } catch (effectError) {
                  console.error('Error recording delete event effect:', effectError);
                  // Continue even if we couldn't record the effect
                }
              }
            }
          } catch (error) {
            const deleteError = error as Error;
            console.error("Error deleting event:", deleteError);
            calendarResponse.status = 'conflict';
            calendarResponse.notes = `Error deleting event: ${deleteError.message || String(deleteError)}`;
          }
        }
        
        results.calendar = calendarResponse;
        }
      } catch (calendarError) {
        console.error('Error processing calendar request:', calendarError);
        // Add error information to the results
        results.calendar_error = "Unable to process calendar request";
      }
    }

    // Process task request if present
    if (routingResult.task_prompt) {
      try {
        // Check if this is a count/summary request
        const isCountRequest = message.toLowerCase().includes('how many') || 
                              message.toLowerCase().includes('count') ||
                              message.toLowerCase().includes('total') ||
                              message.toLowerCase().includes('number of');
        
        if (isCountRequest) {
          const tasks = await storage.getTasks();
          const tasksByStatus = tasks.reduce((acc, task) => {
            acc[task.status] = (acc[task.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const tasksByPriority = tasks.reduce((acc, task) => {
            acc[task.priority || 'none'] = (acc[task.priority || 'none'] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          results.task = {
            total: tasks.length,
            by_status: tasksByStatus,
            by_priority: tasksByPriority,
            summary: `You have ${tasks.length} total tasks. Status breakdown: ${Object.entries(tasksByStatus).map(([status, count]) => `${count} ${status}`).join(', ')}. Priority breakdown: ${Object.entries(tasksByPriority).map(([priority, count]) => `${count} ${priority}`).join(', ')}.`
          };
        } else {
          // Handle task creation/modification - TWO-PHASE APPROACH
          const taskClient = getOpenAIClient('general');
          const taskPrompt = `
            Extract task creation details from this request: "${routingResult.task_prompt}"
            
            MANDATORY FIELD: Only title is required for task creation.
            OPTIONAL FIELDS: description, priority, deadline, projectId, clientId
            
            Return JSON with:
            - title (required): Extract the main task title
            - has_optional_details (boolean): Whether optional details like description, priority, deadline were provided
            - description, priority, deadline, project_name, client_name: Only if explicitly mentioned
          `;
          
          const response = await taskClient.chat.completions.create({
            model: model,
            messages: [
              { role: 'system', content: taskPrompt },
              { role: 'user', content: routingResult.task_prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1
          });

          const taskData = JSON.parse(response.choices[0]?.message?.content || '{}');
          
          // PHASE 1: Create task with mandatory field only
          const newTask = await storage.createTask({
            title: taskData.title || 'New Task',
            description: taskData.has_optional_details ? taskData.description : null,
            projectId: null,
            clientId: null,
            status: 'to_do',
            priority: taskData.has_optional_details ? (taskData.priority || 'medium') : 'medium',
            deadline: taskData.deadline ? new Date(taskData.deadline) : null
          });

          // PHASE 2: Offer optional field enhancement
          let enhancementMessage = '';
          if (!taskData.has_optional_details) {
            enhancementMessage = ' Would you like to add a description, set a priority level, assign it to a project, or set a deadline?';
          }

          results.task = { 
            success: true, 
            task: newTask,
            message: `Created task: ${newTask.title}${enhancementMessage}`,
            needs_enhancement: !taskData.has_optional_details,
            enhancement_options: ['description', 'priority', 'deadline', 'project', 'client']
          };
        }
      } catch (taskError) {
        console.error('Error processing task:', taskError);
        results.task_error = "Unable to process task request";
      }
    }

    // Process project request if present
    if (routingResult.project_prompt) {
      try {
        // Check if this is a count/summary request
        const isCountRequest = message.toLowerCase().includes('how many') || 
                              message.toLowerCase().includes('count') ||
                              message.toLowerCase().includes('total') ||
                              message.toLowerCase().includes('number of');
        
        if (isCountRequest) {
          const projects = await storage.getProjects();
          const projectsByStatus = projects.reduce((acc, project) => {
            acc[project.status] = (acc[project.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const projectsWithBudget = projects.filter(p => p.budget).length;
          const totalBudget = projects.reduce((sum, p) => sum + (p.budget || 0), 0);
          
          results.project = {
            total: projects.length,
            by_status: projectsByStatus,
            with_budget: projectsWithBudget,
            total_budget: totalBudget,
            summary: `You have ${projects.length} total projects. Status breakdown: ${Object.entries(projectsByStatus).map(([status, count]) => `${count} ${status}`).join(', ')}. ${projectsWithBudget} projects have budgets totaling $${totalBudget.toLocaleString()}.`
          };
        } else {
          // Handle project creation - TWO-PHASE APPROACH
          const projectClient = getOpenAIClient('general');
          const projectPrompt = `
            Extract project creation details from this request: "${routingResult.project_prompt}"
            
            MANDATORY FIELD: Only name is required for project creation.
            OPTIONAL FIELDS: description, clientId, budget, startDate, endDate
            
            Return JSON with:
            - name (required): Extract the main project name/title
            - has_optional_details (boolean): Whether optional details like description, budget, client, dates were provided
            - description, budget, start_date, end_date, client_name: Only if explicitly mentioned
          `;
          
          const response = await projectClient.chat.completions.create({
            model: model,
            messages: [
              { role: 'system', content: projectPrompt },
              { role: 'user', content: routingResult.project_prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1
          });

          const projectData = JSON.parse(response.choices[0]?.message?.content || '{}');
          
          // Find client if specified
          let clientId: number | null = null;
          if (projectData.has_optional_details && projectData.client_name) {
            const clients = await storage.getClients();
            const client = clients.find(c => 
              `${c.firstName} ${c.lastName}`.toLowerCase().includes(projectData.client_name.toLowerCase())
            );
            clientId = client?.id || null;
          }

          // PHASE 1: Create project with mandatory field only
          const newProject = await storage.createProject({
            name: projectData.name || 'New Project',
            clientId: clientId,
            startDate: projectData.has_optional_details && projectData.start_date ? new Date(projectData.start_date) : null,
            endDate: projectData.has_optional_details && projectData.end_date ? new Date(projectData.end_date) : null,
            status: 'not_started',
            description: projectData.has_optional_details ? projectData.description : null,
            budget: projectData.has_optional_details && projectData.budget ? Number(projectData.budget) : null
          });

          // PHASE 2: Offer optional field enhancement
          let enhancementMessage = '';
          if (!projectData.has_optional_details) {
            enhancementMessage = ' Would you like to add a description, set a budget, assign a client, or set start/end dates?';
          }

          results.project = { 
            success: true, 
            project: newProject,
            message: `Created project: ${newProject.name}${enhancementMessage}`,
            needs_enhancement: !projectData.has_optional_details,
            enhancement_options: ['description', 'budget', 'client', 'start_date', 'end_date']
          };
        }
      } catch (projectError) {
        console.error('Error processing project:', projectError);
        results.project_error = "Unable to process project request";
      }
    }

    // Process client request if present
    if (routingResult.client_prompt) {
      try {
        // Check if this is a count/summary request
        const isCountRequest = message.toLowerCase().includes('how many') || 
                              message.toLowerCase().includes('count') ||
                              message.toLowerCase().includes('total') ||
                              message.toLowerCase().includes('number of');
        
        if (isCountRequest) {
          const clients = await storage.getClients();
          const clientsWithCompany = clients.filter(c => c.company).length;
          const clientsWithPhone = clients.filter(c => c.phone).length;
          const clientsWithEmail = clients.filter(c => c.email).length;
          
          results.client = {
            total: clients.length,
            with_company: clientsWithCompany,
            with_phone: clientsWithPhone,
            with_email: clientsWithEmail,
            summary: `You have ${clients.length} total clients. ${clientsWithEmail} have email addresses, ${clientsWithPhone} have phone numbers, and ${clientsWithCompany} are associated with companies.`
          };
        } else {
          // Handle client creation - TWO-PHASE APPROACH
          const clientClient = getOpenAIClient('general');
          const clientPrompt = `
            Extract client creation details from this request: "${routingResult.client_prompt}"
            
            MANDATORY FIELDS: firstName, lastName, and phone are required for client creation.
            OPTIONAL FIELDS: email, company, address
            
            Return JSON with:
            - firstName (required): Extract the first name
            - lastName (required): Extract the last name  
            - phone (required): Extract the phone number
            - has_mandatory_fields (boolean): Whether all mandatory fields (firstName, lastName, phone) are provided
            - has_optional_details (boolean): Whether optional details like email, company were provided
            - email, company, address: Only if explicitly mentioned
            
            IMPORTANT: Never extract or modify existing user profile data (username, personal email, etc.)
          `;
          
          const response = await clientClient.chat.completions.create({
            model: model,
            messages: [
              { role: 'system', content: clientPrompt },
              { role: 'user', content: routingResult.client_prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1
          });

          const clientData = JSON.parse(response.choices[0]?.message?.content || '{}');
          
          // Check if mandatory fields are present
          if (!clientData.has_mandatory_fields || !clientData.firstName || !clientData.lastName || !clientData.phone) {
            const missingFields = [];
            if (!clientData.firstName) missingFields.push('first name');
            if (!clientData.lastName) missingFields.push('last name');
            if (!clientData.phone) missingFields.push('phone number');
            
            results.client = {
              success: false,
              message: `To create a client, I need the following mandatory information: ${missingFields.join(', ')}. Please provide these details.`,
              missing_fields: missingFields
            };
          } else {
            // PHASE 1: Create client with mandatory fields
            const newClient = await storage.createClient({
              firstName: clientData.firstName,
              lastName: clientData.lastName,
              phone: clientData.phone,
              email: clientData.has_optional_details ? clientData.email : null,
              company: clientData.has_optional_details ? clientData.company : null,
              address: clientData.has_optional_details ? clientData.address : null
            });

            // PHASE 2: Offer optional field enhancement
            let enhancementMessage = '';
            if (!clientData.has_optional_details) {
              enhancementMessage = ' Would you like to add additional details like email address or company information?';
            }

            results.client = { 
              success: true, 
              client: newClient,
              message: `Created client: ${newClient.firstName} ${newClient.lastName}${enhancementMessage}`,
              needs_enhancement: !clientData.has_optional_details,
              enhancement_options: ['email', 'company', 'address']
            };
          }
        }
      } catch (clientError) {
        console.error('Error processing client:', clientError);
        results.client_error = "Unable to process client request";
      }
    }

    // Process booking request if present
    if (routingResult.booking_prompt) {
      try {
        // Check if this is a count/summary request
        const isCountRequest = message.toLowerCase().includes('how many') || 
                              message.toLowerCase().includes('count') ||
                              message.toLowerCase().includes('total') ||
                              message.toLowerCase().includes('number of');
        
        if (isCountRequest) {
          const bookings = await storage.getBookings();
          const bookingsByStatus = bookings.reduce((acc, booking) => {
            acc[booking.status] = (acc[booking.status] || 0) + 1;
            return acc;
          }, {} as Record<string, number>);
          
          const currentMonth = new Date().getMonth();
          const currentYear = new Date().getFullYear();
          const thisMonthBookings = bookings.filter(b => {
            const bookingDate = new Date(b.date);
            return bookingDate.getMonth() === currentMonth && bookingDate.getFullYear() === currentYear;
          }).length;
          
          const totalDuration = bookings.reduce((sum, b) => sum + (b.duration || 0), 0);
          
          results.booking = {
            total: bookings.length,
            by_status: bookingsByStatus,
            this_month: thisMonthBookings,
            total_duration_minutes: totalDuration,
            summary: `You have ${bookings.length} total bookings with ${totalDuration} minutes scheduled. This month: ${thisMonthBookings} bookings. Status breakdown: ${Object.entries(bookingsByStatus).map(([status, count]) => `${count} ${status}`).join(', ')}.`
          };
        } else {
          // Handle booking creation - TWO-PHASE APPROACH
          const bookingClient = getOpenAIClient('general');
          const bookingPrompt = `
            Extract booking details from this request: "${routingResult.booking_prompt}"
            
            MANDATORY FIELDS: date and time are required for booking creation.
            OPTIONAL FIELDS: duration, clientId, service, notes
            
            Return JSON with:
            - date (required): Extract the date in YYYY-MM-DD format
            - time (required): Extract the time in HH:MM format
            - has_mandatory_fields (boolean): Whether both date and time are provided
            - has_optional_details (boolean): Whether optional details like duration, client, service were provided
            - duration, client_name, service, notes: Only if explicitly mentioned
          `;
          
          const response = await bookingClient.chat.completions.create({
            model: model,
            messages: [
              { role: 'system', content: bookingPrompt },
              { role: 'user', content: routingResult.booking_prompt }
            ],
            response_format: { type: "json_object" },
            temperature: 0.1
          });

          const bookingData = JSON.parse(response.choices[0]?.message?.content || '{}');
          
          // Check if mandatory fields are present
          if (!bookingData.has_mandatory_fields || !bookingData.date || !bookingData.time) {
            const missingFields = [];
            if (!bookingData.date) missingFields.push('date');
            if (!bookingData.time) missingFields.push('time');
            
            results.booking = {
              success: false,
              message: `To create a booking, I need the following mandatory information: ${missingFields.join(', ')}. Please provide these details.`,
              missing_fields: missingFields
            };
          } else {
            // Find client if specified
            let clientId: number | null = null;
            if (bookingData.has_optional_details && bookingData.client_name) {
              const clients = await storage.getClients();
              const client = clients.find(c => 
                `${c.firstName} ${c.lastName}`.toLowerCase().includes(bookingData.client_name.toLowerCase())
              );
              clientId = client?.id || null;
            }
            
            // PHASE 1: Create booking with mandatory fields and defaults
            const newBooking = await storage.createBooking({
              date: bookingData.date,
              time: bookingData.time,
              duration: bookingData.has_optional_details ? bookingData.duration : 60,
              clientId: clientId,
              serviceName: bookingData.has_optional_details ? bookingData.service : 'Appointment',
              notes: bookingData.has_optional_details ? bookingData.notes : '',
              status: 'confirmed',
              externalId: `booking_${Date.now()}`,
              clientName: bookingData.client_name || 'Client',
              clientPhone: '',
              serviceId: 'default',
              professionalId: '1'
            });

            // PHASE 2: Offer optional field enhancement with your requested format
            let clientName = 'your appointment';
            if (bookingData.client_name) {
              clientName = bookingData.client_name;
            }
            
            let enhancementMessage = '';
            if (!bookingData.has_optional_details) {
              enhancementMessage = ` Would you like to add the duration or any other details?`;
            }

            results.booking = { 
              success: true, 
              booking: newBooking,
              message: `I've added your booking with ${clientName} ${bookingData.date} at ${bookingData.time}.${enhancementMessage}`,
              needs_enhancement: !bookingData.has_optional_details,
              enhancement_options: ['duration', 'client', 'service', 'notes']
            };
          }
        }
      } catch (bookingError) {
        console.error('Error processing booking:', bookingError);
        results.booking_error = "Unable to process booking request";
      }
    }
    
    // Process message request if present
    if (routingResult.message_prompt) {
      try {
        const messageResponse = await generateAutoResponse(routingResult.message_prompt);
        results.message = messageResponse;
      } catch (messageError) {
        console.error('Error generating auto-response:', messageError);
        // Add error information to the results
        results.message_error = "Unable to generate auto-response message";
      }
    }
    
    res.json(results);
  } catch (error) {
    console.error("Error processing command:", error);
    res.status(500).json({ 
      message: "Failed to process your command",
      error: error instanceof Error ? error.message : String(error)
    });
  }
});


export default router;

