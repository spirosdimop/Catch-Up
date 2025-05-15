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

// Schema for the new booking system
const newBookingSchema = z.object({
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  duration: z.number().min(1, "Duration is required").default(60),
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
      // For demo purposes, return some mock bookings until database has real data
      const mockBookings = [
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
      ];
      
      // Try to get bookings from database
      try {
        const dbBookings = await db.select().from(bookings);
        
        // If we have bookings in the database, use those instead of mock data
        if (dbBookings && dbBookings.length > 0) {
          // Format the bookings to include client info
          return res.json(dbBookings.map(booking => {
            return {
              ...booking,
              client: {
                id: booking.clientId,
                name: `Client ${booking.clientId}`, // This would come from clients table
                email: `client${booking.clientId}@example.com` // This would come from clients table
              }
            };
          }));
        }
      } catch (dbError) {
        console.log("Using mock bookings data due to DB error:", dbError);
      }
      
      // Return mock bookings if database has no data
      res.json(mockBookings);
    } catch (error) {
      console.error("Error fetching bookings:", error);
      res.status(500).json({ error: "Failed to fetch bookings" });
    }
  });

  // Create a new booking
  app.post("/api/bookings", async (req: Request, res: Response) => {
    try {
      console.log("Received booking request:", req.body);
      
      // Try to parse with the new schema
      let bookingData: NewBookingRequest;
      try {
        bookingData = newBookingSchema.parse(req.body);
      } catch (e) {
        // If it fails, try the legacy schema
        const legacyData = legacyBookingSchema.parse(req.body);
        
        // Convert legacy format to new format
        bookingData = {
          date: legacyData.date,
          time: legacyData.time,
          duration: legacyData.duration,
          type: "meeting", // Default
          status: "confirmed", // Default
          location: legacyData.location || "Office",
          notes: legacyData.notes,
          clientId: typeof legacyData.serviceId === 'number' ? legacyData.serviceId : 1, // Default client ID
          serviceId: typeof legacyData.serviceId === 'string' ? legacyData.serviceId : "1", // Default service ID
          priority: "normal" // Default
        };
      }
      
      console.log("Processed booking data:", bookingData);
      
      // Create new booking record
      const newBooking = await db.insert(bookings).values({
        date: bookingData.date,
        time: bookingData.time,
        duration: bookingData.duration || 60,
        type: bookingData.type as any || "meeting",
        status: bookingData.status as any || "confirmed",
        location: bookingData.location,
        notes: bookingData.notes,
        clientId: bookingData.clientId,
        serviceId: bookingData.serviceId,
        priority: bookingData.priority || "normal",
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      
      // Also create an event for the calendar (maintaining backward compatibility)
      try {
        // Parse the date and time
        const bookingDate = new Date(bookingData.date);
        
        // Handle time string in various formats (9:00 AM, 9:00, 14:00, etc.)
        let hours = 0;
        let minutes = 0;
        let isPM = false;
        
        if (bookingData.time.includes(':')) {
          const timeMatch = bookingData.time.match(/(\d+):(\d+)/);
          if (timeMatch) {
            hours = parseInt(timeMatch[1], 10);
            minutes = parseInt(timeMatch[2], 10);
            isPM = /pm/i.test(bookingData.time);
          }
        } else {
          // Time might be just "9 AM" or "2 PM"
          const timeMatch = bookingData.time.match(/(\d+)/);
          if (timeMatch) {
            hours = parseInt(timeMatch[1], 10);
            isPM = /pm/i.test(bookingData.time);
          }
        }
        
        // Adjust hours for PM if needed
        if (isPM && hours < 12) {
          hours += 12;
        }
        
        bookingDate.setHours(hours, minutes, 0, 0);
        
        // Calculate end time based on duration
        const endTime = new Date(bookingDate);
        endTime.setMinutes(endTime.getMinutes() + bookingData.duration);
        
        // Get the client (would be done via database in a real app)
        const clientName = "Client Name"; // We'd fetch this from DB using clientId
        
        // Create the event (booking)
        await db.insert(events).values({
          userId: "user123", // This would be the actual user ID
          title: `Meeting with ${clientName}`,
          description: bookingData.notes || `Appointment with client ID ${bookingData.clientId}`,
          startTime: bookingDate,
          endTime: endTime,
          location: bookingData.location || "Office",
          clientName: clientName,
          clientId: bookingData.clientId,
          eventType: EventType.CLIENT_MEETING,
          color: "#4CAF50", // Green for client meetings
          isConfirmed: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        });
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