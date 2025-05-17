import express from "express";
import { storage } from "../storage";
import { nanoid } from "nanoid";

const router = express.Router();

// Initialize bookings array if it doesn't exist
if (!storage.data.bookings) {
  storage.data.bookings = [];
}

// Get all booking requests
router.get('/api/bookings', (req, res) => {
  try {
    res.json(storage.data.bookings || []);
  } catch (error) {
    console.error('Error fetching booking requests:', error);
    res.status(500).json({ error: 'Failed to fetch booking requests' });
  }
});

// Get booking requests by professional ID
router.get('/api/bookings/professional/:id', (req, res) => {
  try {
    const professionalId = req.params.id;
    const bookings = storage.data.bookings.filter(booking => booking.professionalId === professionalId);
    res.json(bookings || []);
  } catch (error) {
    console.error('Error fetching professional\'s booking requests:', error);
    res.status(500).json({ error: 'Failed to fetch professional\'s booking requests' });
  }
});

// Create a new booking request
router.post('/api/bookings', (req, res) => {
  try {
    const bookingRequest = {
      id: nanoid(),
      ...req.body,
      createdAt: new Date().toISOString()
    };
    
    storage.data.bookings.push(bookingRequest);
    res.status(201).json(bookingRequest);
  } catch (error) {
    console.error('Error creating booking request:', error);
    res.status(500).json({ error: 'Failed to create booking request' });
  }
});

// Update booking status (accept, decline, reschedule)
router.patch('/api/bookings/:id', (req, res) => {
  try {
    const bookingId = req.params.id;
    const { status, notes, newDate, newTime } = req.body;
    
    const bookingIndex = storage.data.bookings.findIndex(booking => booking.id === bookingId);
    
    if (bookingIndex === -1) {
      return res.status(404).json({ error: 'Booking request not found' });
    }
    
    // Update the booking
    const updatedBooking = {
      ...storage.data.bookings[bookingIndex],
      status,
      notes: notes || storage.data.bookings[bookingIndex].notes,
      updatedAt: new Date().toISOString()
    };
    
    // If rescheduling, update date and time
    if (status === 'rescheduled' && newDate && newTime) {
      updatedBooking.date = newDate;
      updatedBooking.time = newTime;
    }
    
    storage.data.bookings[bookingIndex] = updatedBooking;
    res.json(updatedBooking);
  } catch (error) {
    console.error('Error updating booking request:', error);
    res.status(500).json({ error: 'Failed to update booking request' });
  }
});

// Delete a booking request
router.delete('/api/bookings/:id', (req, res) => {
  try {
    const bookingId = req.params.id;
    const bookingIndex = storage.data.bookings.findIndex(booking => booking.id === bookingId);
    
    if (bookingIndex === -1) {
      return res.status(404).json({ error: 'Booking request not found' });
    }
    
    storage.data.bookings.splice(bookingIndex, 1);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting booking request:', error);
    res.status(500).json({ error: 'Failed to delete booking request' });
  }
});

export default router;