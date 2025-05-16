import { Request, Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { 
  events, 
  EventType, 
  bookings, 
  insertBookingSchema,
  Booking,
  BookingType,
  BookingStatus
} from "@shared/schema";
import { nanoid } from "nanoid";
import { eq, and, gte, lt } from "drizzle-orm";

// Schema for our booking form data
const bookingFormSchema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().optional(),
  timeSlot: z.string().optional(),
  duration: z.number().optional().default(60),
  type: z.string().optional().default("meeting"),
  status: z.string().optional().default("confirmed"),
  location: z.string().optional().default("Office"),
  notes: z.string().optional().default(""),
  clientId: z.number(),
  serviceId: z.string().optional(),
  service: z.string().optional(),
  priority: z.string().optional().default("normal"),
});

// Simplified booking schema for validation
const newBookingSchema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  duration: z.number().default(60),
  type: z.string().default("meeting"),
  status: z.string().default("confirmed"),
  location: z.string().optional(),
  notes: z.string().optional(),
  clientId: z.number().min(1, "Client ID is required"),
  serviceId: z.string().min(1, "Service ID is required"),
  priority: z.string().default("normal"),
});

// Legacy booking schema (keeping for compatibility)
const legacyBookingSchema = z.object({
  serviceId: z.number().or(z.string()).optional(),
  serviceName: z.string().min(1, "Service name is required"),
  clientName: z.string().min(1, "Name is required"),
  clientEmail: z.string().email("Valid email is required"),
  clientPhone: z.string().min(1, "Phone number is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  notes: z.string().optional(),
  providerId: z.string().min(1, "Provider ID is required"),
  duration: z.number().min(1, "Duration is required"),
  location: z.string().optional(),
  price: z.number().optional(),
});

type NewBookingRequest = z.infer<typeof newBookingSchema>;
type LegacyBookingRequest = z.infer<typeof legacyBookingSchema>;

export const registerBookingRoutes = (app: any) => {
  // Get available time slots for a specific day and service
  app.get("/api/bookings/available-slots", async (req: Request, res: Response) => {
    try {
      const { date, serviceId, providerId } = req.query;
      
      if (!date || !providerId) {
        return res.status(400).json({ error: "Date and provider ID are required" });
      }
      
      // Convert date string to Date object (start of day)
      const selectedDate = new Date(date as string);
      selectedDate.setHours(0, 0, 0, 0);
      
      // End of the selected day
      const nextDay = new Date(selectedDate);
      nextDay.setDate(nextDay.getDate() + 1);
      
      // Get all events for the selected provider on the selected day
      const existingBookings = await db.select().from(events)
        .where(
          and(
            eq(events.userId, providerId as string),
            gte(events.startTime, selectedDate),
            lt(events.endTime, nextDay)
          )
        );
      
      // Generate available time slots (9am to 5pm, 1-hour slots for simplicity)
      const availableSlots = [];
      const startHour = 9; // 9am
      const endHour = 17; // 5pm
      
      for (let hour = startHour; hour < endHour; hour++) {
        const slotStart = new Date(selectedDate);
        slotStart.setHours(hour, 0, 0, 0);
        
        const slotEnd = new Date(slotStart);
        slotEnd.setHours(slotStart.getHours() + 1);
        
        // Check if the slot overlaps with any existing booking
        const isOverlapping = existingBookings.some(booking => {
          const bookingStart = new Date(booking.startTime);
          const bookingEnd = new Date(booking.endTime);
          
          return (
            // The booking starts during the slot
            (bookingStart >= slotStart && bookingStart < slotEnd) ||
            // The booking ends during the slot
            (bookingEnd > slotStart && bookingEnd <= slotEnd) ||
            // The booking completely overlaps the slot
            (bookingStart <= slotStart && bookingEnd >= slotEnd)
          );
        });
        
        if (!isOverlapping) {
          availableSlots.push({
            time: slotStart.toISOString(),
            formatted: `${hour > 12 ? hour - 12 : hour}:00 ${hour >= 12 ? 'PM' : 'AM'}`
          });
        }
      }
      
      res.json(availableSlots);
    } catch (error) {
      console.error("Error getting available slots:", error);
      res.status(500).json({ error: "Failed to get available time slots" });
    }
  });

  // Get all bookings
  app.get("/api/bookings", async (req: Request, res: Response) => {
    try {
      // Fetch bookings from database
      const dbBookings = await db.select().from(bookings);
      
      // Get all clients for joining
      const clientList = await db.select().from(clients);
      
      // Map clients by ID for easy lookup
      const clientMap = new Map();
      clientList.forEach(client => {
        clientMap.set(client.id, client);
      });
      
      // Format bookings with client info
      const formattedBookings = dbBookings.map(booking => {
        // Find the client by ID
        const client = clientMap.get(booking.clientId) || { 
          name: `Client ${booking.clientId}`, 
          email: `client${booking.clientId}@example.com` 
        };
        
        return {
          id: booking.id,
          date: booking.date,
          time: booking.time,
          duration: booking.duration,
          type: booking.type,
          status: booking.status,
          location: booking.location || "Office",
          notes: booking.notes,
          clientId: booking.clientId,
          serviceId: booking.serviceId,
          priority: booking.priority,
          createdAt: booking.createdAt,
          updatedAt: booking.updatedAt,
          client: {
            id: booking.clientId,
            name: client.name,
            email: client.email,
            avatar: null // You can add avatar if you have it
          }
        };
      });
      
      // If no database bookings, provide sample bookings
      if (formattedBookings.length === 0) {
        return res.json([
          {
            id: 1,
            date: "2025-05-20",
            time: "10:00",
            duration: 60,
            type: "meeting",
            status: "confirmed",
            location: "Office",
            notes: "Initial consultation",
            client: {
              name: "Sarah Johnson",
              email: "sarah.j@example.com",
              avatar: null
            },
            createdAt: "2025-05-15T10:00:00Z",
            updatedAt: "2025-05-15T10:00:00Z"
          },
          {
            id: 2,
            date: "2025-05-21",
            time: "14:30",
            duration: 45,
            type: "call",
            status: "confirmed",
            location: "Phone",
            notes: "Follow-up call",
            client: {
              name: "Michael Chen",
              email: "m.chen@example.com",
              avatar: null
            },
            createdAt: "2025-05-15T11:00:00Z",
            updatedAt: "2025-05-15T11:00:00Z"
          }
        ]);
      }
      
      // Return the formatted bookings
      res.json(formattedBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Create a new booking
  app.post("/api/bookings", async (req: Request, res: Response) => {
    try {
      console.log("Received booking request:", req.body);
      
      // First, parse the form data to get all possible fields
      const formData = bookingFormSchema.parse(req.body);
      console.log("Parsed form data:", formData);
      
      // Process the form data to create a valid booking object
      const bookingData = {
        date: formData.date,
        // Use timeSlot as time if available, otherwise use time or default
        time: formData.timeSlot || formData.time || "09:00", 
        duration: formData.duration || 60,
        type: formData.type || "meeting",
        status: formData.status || "confirmed",
        location: formData.location || "Office",
        notes: formData.notes || "",
        clientId: formData.clientId,
        // Use service as serviceId if available
        serviceId: formData.service || formData.serviceId || "1",
        priority: formData.priority || "normal",
      };
      
      // Validate the processed data against our schema
      const validatedData = newBookingSchema.parse(bookingData);
      console.log("Validated booking data:", validatedData);
      
      // Create new booking record
      const newBooking = await db.insert(bookings).values({
        date: validatedData.date,
        time: validatedData.time,
        duration: validatedData.duration,
        type: validatedData.type as any,
        status: validatedData.status as any,
        location: validatedData.location || "Office",
        notes: validatedData.notes || "",
        clientId: validatedData.clientId,
        serviceId: validatedData.serviceId,
        priority: validatedData.priority,
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      
      console.log("Created booking:", newBooking[0]);
      
      // Also create an event for the calendar
      try {
        // Parse the date and time
        const dateStr = validatedData.date;
        const timeStr = validatedData.time;
        
        // Create start date (combining date and time)
        const [year, month, day] = dateStr.split('-').map(Number);
        let [hours, minutes] = [0, 0];
        
        if (timeStr.includes(':')) {
          [hours, minutes] = timeStr.split(':').map(Number);
        } else if (timeStr.match(/^\d+$/)) {
          hours = parseInt(timeStr, 10);
        }
        
        // Handle AM/PM format
        if (timeStr.toLowerCase().includes('pm') && hours < 12) {
          hours += 12;
        }
        
        // Create JavaScript Date objects
        const startTime = new Date(year, month - 1, day, hours, minutes);
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + validatedData.duration);
        
        // Get a client name (in a real app we would fetch this from the database)
        const clientName = `Client ${validatedData.clientId}`;
        
        await db.insert(events).values({
          userId: "user123", // Default user ID
          title: `Meeting with ${clientName}`,
          description: validatedData.notes || `Appointment with client ID ${validatedData.clientId}`,
          startTime: startTime,
          endTime: endTime,
          location: validatedData.location || "Office",
          clientName: clientName,
          clientId: validatedData.clientId,
          eventType: EventType.CLIENT_MEETING,
          color: "#4CAF50", // Green for client meetings
          isConfirmed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
        
        console.log("Created calendar event");
      } catch (eventError) {
        console.error("Error creating event:", eventError);
        // We don't fail the entire booking if the event creation fails
      }
      
      res.status(201).json({
        success: true,
        booking: newBooking[0],
        message: "Your appointment has been scheduled successfully!"
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: "Validation error",
          details: error.errors
        });
      }
      
      res.status(500).json({ error: "Failed to create booking" });
    }
  });
};