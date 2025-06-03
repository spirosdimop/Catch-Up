import { Router } from "express";
import { bookings, insertBookingSchema } from "@shared/schema";
import { db } from "../db";
import { eq } from "drizzle-orm";
import { ZodError } from "zod";

const router = Router();

// Get all bookings
router.get("/", async (req, res) => {
  try {
    const allBookings = await db.select().from(bookings);
    res.json(allBookings);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ message: "Failed to fetch bookings" });
  }
});

// Get booking by ID
router.get("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const [booking] = await db.select().from(bookings).where(eq(bookings.id, id));
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ message: "Failed to fetch booking" });
  }
});

// Create a new booking
router.post("/", async (req, res) => {
  try {
    // Determine booking status based on source
    // Profile page bookings (from public clients) need confirmation - set to "pending"
    // Calendar/Appointments page bookings (internal) are auto-accepted - set to "confirmed"
    const isFromProfile = req.body.source === "profile" || req.body.clientEmail; // Profile bookings include clientEmail
    const defaultStatus = isFromProfile ? "pending" : "confirmed";
    
    // Create booking data with proper type casting
    const bookingData = {
      date: req.body.date || new Date().toISOString().split('T')[0],
      time: req.body.time || "10:00 AM",
      duration: parseInt(req.body.duration) || 60,
      type: (req.body.type === "consultation" || req.body.type === "appointment" || req.body.type === "follow_up" || req.body.type === "check_in") ? req.body.type : "meeting",
      status: (req.body.status || defaultStatus) as "pending" | "accepted" | "declined" | "confirmed" | "rescheduled" | "canceled" | "emergency",
      location: req.body.location || "",
      notes: req.body.notes || "",
      clientId: parseInt(req.body.clientId) || 1,
      serviceId: req.body.serviceId || "1",
      priority: req.body.priority || "normal",
      externalId: req.body.externalId || Date.now().toString(),
      clientName: req.body.clientName || "Client",
      clientPhone: req.body.clientPhone || "",
      serviceName: req.body.serviceName || "",
      servicePrice: req.body.servicePrice || "",
      professionalId: req.body.professionalId || "1",
    };
    
    const [newBooking] = await db.insert(bookings).values([bookingData]).returning();
    res.status(201).json(newBooking);
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(400).json({ 
      message: "Failed to create booking", 
      error: error instanceof Error ? error.message : "Unknown error" 
    });
  }
});

// Update a booking
router.patch("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    const bookingData = req.body;
    
    const [updatedBooking] = await db
      .update(bookings)
      .set(bookingData)
      .where(eq(bookings.id, id))
      .returning();
    
    if (!updatedBooking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    res.json(updatedBooking);
  } catch (error) {
    console.error("Error updating booking:", error);
    res.status(500).json({ message: "Failed to update booking" });
  }
});

// Delete a booking
router.delete("/:id", async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    await db.delete(bookings).where(eq(bookings.id, id));
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ message: "Failed to delete booking" });
  }
});

export default router;