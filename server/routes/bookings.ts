import { Router } from "express";
import { bookings, clients, insertBookingSchema } from "@shared/schema";
import { db } from "../db";
import { eq, ilike } from "drizzle-orm";
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
    const isFromProfile = req.body.source === "profile" || Boolean(req.body.clientEmail); // Profile bookings include clientEmail
    const defaultStatus = isFromProfile ? "pending" : "confirmed";
    
    console.log(`Booking request - source: ${req.body.source}, clientEmail: ${req.body.clientEmail}, isFromProfile: ${isFromProfile}`);
    
    // Automatic client handling
    let clientId = parseInt(req.body.clientId) || null;
    const clientName = req.body.clientName || "Client";
    const clientEmail = req.body.clientEmail;
    const clientPhone = req.body.clientPhone;
    
    // If no clientId provided or it's the default 1, try to find existing client
    if (!clientId || clientId === 1) {
      try {
        // First try exact case-insensitive match on combined name
        const allClients = await db.select().from(clients);
        let matchingClient = allClients.find(client => {
          const fullName = `${client.firstName} ${client.lastName}`.trim();
          return fullName.toLowerCase() === clientName.trim().toLowerCase();
        });
        
        // If no exact match, try fuzzy matching by normalizing names
        if (!matchingClient) {
          const normalizedSearchName = clientName.trim().toLowerCase().replace(/\s+/g, ' ');
          
          matchingClient = allClients.find(client => {
            const fullName = `${client.firstName} ${client.lastName}`.trim();
            const normalizedClientName = fullName.toLowerCase().replace(/\s+/g, ' ');
            return normalizedClientName === normalizedSearchName ||
                   normalizedClientName.includes(normalizedSearchName) ||
                   normalizedSearchName.includes(normalizedClientName);
          });
        }
        
        if (matchingClient) {
          clientId = matchingClient.id;
          console.log(`Auto-matched client "${clientName}" to "${matchingClient.name}" (ID ${clientId})`);
        } else {
          // If this is a profile page booking (has clientEmail), create a temporary client entry
          if (isFromProfile && clientEmail) {
            const [newClient] = await db
              .insert(clients)
              .values({
                name: clientName.trim(),
                email: clientEmail,
                phone: clientPhone || null,
                company: null,
                address: null,
                createdAt: new Date()
              })
              .returning();
            
            clientId = newClient.id;
            console.log(`Created new client "${clientName}" (ID ${clientId}) for profile booking`);
          } else {
            console.log(`No client found matching name "${clientName}"`);
            clientId = 1; // fallback to default for internal bookings
          }
        }
      } catch (error) {
        console.error("Error handling client:", error);
        clientId = 1; // fallback to default
      }
    }
    
    // Create booking data with proper type casting
    const bookingData = {
      date: req.body.date || new Date().toISOString().split('T')[0],
      time: req.body.time || "10:00 AM",
      duration: parseInt(req.body.duration) || 60,
      type: (req.body.type === "consultation" || req.body.type === "appointment" || req.body.type === "follow_up" || req.body.type === "check_in") ? req.body.type : "meeting",
      status: (req.body.status || defaultStatus) as "pending" | "accepted" | "declined" | "confirmed" | "rescheduled" | "canceled" | "emergency",
      location: req.body.location || "",
      notes: req.body.notes || "",
      clientId: clientId,
      serviceId: req.body.serviceId || "1",
      priority: req.body.priority || "normal",
      externalId: req.body.externalId || Date.now().toString(),
      clientName: clientName,
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
    
    // If accepting a booking (status changed to "confirmed"), ensure client is properly linked
    if (bookingData.status === "confirmed") {
      const [existingBooking] = await db.select().from(bookings).where(eq(bookings.id, id));
      
      if (existingBooking && existingBooking.clientName) {
        // Verify client exists with the booking's client information
        const [existingClient] = await db
          .select()
          .from(clients)
          .where(eq(clients.id, existingBooking.clientId));
        
        if (existingClient) {
          console.log(`Booking ${id} accepted - client "${existingClient.name}" (ID ${existingClient.id}) is now confirmed`);
        }
      }
    }
    
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