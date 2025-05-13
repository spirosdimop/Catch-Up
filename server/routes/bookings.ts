import { Request, Response } from "express";
import { z } from "zod";
import { db } from "../db";
import { events, EventType } from "@shared/schema";
import { nanoid } from "nanoid";
import { eq, and, gte, lt } from "drizzle-orm";

// Schema for booking request validation
const bookingSchema = z.object({
  serviceId: z.number().optional(),
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

type BookingRequest = z.infer<typeof bookingSchema>;

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

  // Create a new booking
  app.post("/api/bookings", async (req: Request, res: Response) => {
    try {
      const bookingData = bookingSchema.parse(req.body);
      
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
      
      // Create the event (booking)
      const newEvent = await db.insert(events).values({
        userId: bookingData.providerId,
        title: `${bookingData.serviceName} - ${bookingData.clientName}`,
        description: bookingData.notes || `Appointment booked by ${bookingData.clientName}`,
        startTime: bookingDate,
        endTime: endTime,
        location: bookingData.location || "Office",
        clientName: bookingData.clientName,
        eventType: EventType.CLIENT_MEETING,
        color: "#4CAF50", // Green for client meetings
        isConfirmed: false, // Requires confirmation by the service provider
        createdAt: new Date(),
        updatedAt: new Date(),
      }).returning();
      
      // For a real application, you would also want to:
      // 1. Send email confirmation to the client
      // 2. Send notification to the service provider
      // 3. Store client information for future bookings
      
      res.status(201).json({
        success: true,
        booking: newEvent[0],
        message: "Your appointment has been scheduled successfully! You will receive a confirmation shortly."
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