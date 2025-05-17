import express from 'express';
import { z } from 'zod';
import { eq } from 'drizzle-orm';
import { db } from '../db';
import { bookings, insertBookingSchema } from '@shared/schema';
import { storage } from '../storage';

const router = express.Router();

// Get all bookings
router.get('/', async (req, res) => {
  try {
    const allBookings = await db.select().from(bookings);
    res.json(allBookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get bookings by professional ID
router.get('/professional/:professionalId', async (req, res) => {
  try {
    const { professionalId } = req.params;
    
    const professionalBookings = await db
      .select()
      .from(bookings)
      .where(eq(bookings.professionalId, professionalId));
      
    res.json(professionalBookings);
  } catch (error) {
    console.error('Error fetching bookings for professional:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Get a single booking
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const booking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);
      
    if (booking.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    res.json(booking[0]);
  } catch (error) {
    console.error('Error fetching booking:', error);
    res.status(500).json({ error: 'Failed to fetch booking' });
  }
});

// Create a booking
router.post('/', async (req, res) => {
  try {
    // Validate the request body
    const bookingData = insertBookingSchema.parse(req.body);
    
    // Insert booking into database
    const [newBooking] = await db
      .insert(bookings)
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
    
    console.error('Error creating booking:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update a booking
router.patch('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate booking ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }
    
    // Check if booking exists
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);
      
    if (existingBooking.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Update booking with validated data
    const [updatedBooking] = await db
      .update(bookings)
      .set(req.body)
      .where(eq(bookings.id, parseInt(id)))
      .returning();
    
    res.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Delete a booking
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Validate booking ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'Invalid booking ID' });
    }
    
    // Check if booking exists
    const existingBooking = await db
      .select()
      .from(bookings)
      .where(eq(bookings.id, parseInt(id)))
      .limit(1);
      
    if (existingBooking.length === 0) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    // Delete booking
    await db
      .delete(bookings)
      .where(eq(bookings.id, parseInt(id)));
    
    res.json({ success: true, message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Error deleting booking:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

export default router;