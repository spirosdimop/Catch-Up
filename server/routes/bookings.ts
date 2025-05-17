import express from "express";
import { z } from "zod";
import { db } from "../db";
import { bookings, insertBookingSchema } from "../../shared/schema";
import { eq } from "drizzle-orm";

const router = express.Router();

// Get all bookings
router.get("/", async (req, res) => {
  try {
    const result = await db.select().from(bookings);
    res.json(result);
  } catch (error) {
    console.error("Error fetching bookings:", error);
    res.status(500).json({ error: "Failed to fetch bookings" });
  }
});

// Get a specific booking by ID
router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const result = await db.select().from(bookings).where(eq(bookings.id, parseInt(id)));
    
    if (result.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    res.json(result[0]);
  } catch (error) {
    console.error("Error fetching booking:", error);
    res.status(500).json({ error: "Failed to fetch booking" });
  }
});

// Create a new booking
router.post("/", async (req, res) => {
  try {
    const bookingData = insertBookingSchema.parse(req.body);
    
    const [newBooking] = await db.insert(bookings)
      .values({
        ...bookingData,
        createdAt: new Date()
      })
      .returning();
    
    res.status(201).json(newBooking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error("Error creating booking:", error);
    res.status(500).json({ error: "Failed to create booking" });
  }
});

// Update a booking
router.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id);
    
    // Validate the update data
    const updateData = insertBookingSchema.partial().parse(req.body);
    
    // Check if the booking exists
    const existingBooking = await db.select().from(bookings).where(eq(bookings.id, parsedId));
    if (existingBooking.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    // Update the booking
    const [updatedBooking] = await db.update(bookings)
      .set(updateData)
      .where(eq(bookings.id, parsedId))
      .returning();
    
    res.json(updatedBooking);
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({ error: error.errors });
    }
    
    console.error("Error updating booking:", error);
    res.status(500).json({ error: "Failed to update booking" });
  }
});

// Delete a booking
router.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const parsedId = parseInt(id);
    
    // Check if the booking exists
    const existingBooking = await db.select().from(bookings).where(eq(bookings.id, parsedId));
    if (existingBooking.length === 0) {
      return res.status(404).json({ error: "Booking not found" });
    }
    
    // Delete the booking
    await db.delete(bookings).where(eq(bookings.id, parsedId));
    
    res.json({ success: true });
  } catch (error) {
    console.error("Error deleting booking:", error);
    res.status(500).json({ error: "Failed to delete booking" });
  }
});

// Get bookings by professional ID
router.get("/professional/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await db.select()
      .from(bookings)
      .where(eq(bookings.professionalId, id));
    
    res.json(result);
  } catch (error) {
    console.error("Error fetching bookings by professional:", error);
    res.status(500).json({ error: "Failed to fetch bookings by professional" });
  }
});

export default router;