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
        const allClients = await db.select().from(clients);
        let matchingClient = null;
        
        // Parse incoming name for individual field matching
        const nameParts = clientName.trim().split(' ');
        const searchFirstName = nameParts[0] || clientName;
        const searchLastName = nameParts.slice(1).join(' ') || '';
        
        // Priority 1: Exact phone number match (highest confidence)
        if (clientPhone) {
          const normalizedPhone = clientPhone.replace(/\D/g, ''); // Remove non-digits
          if (normalizedPhone.length >= 10) {
            matchingClient = allClients.find(client => {
              if (!client.phone) return false;
              const clientNormalizedPhone = client.phone.replace(/\D/g, '');
              return clientNormalizedPhone === normalizedPhone;
            });
            
            if (matchingClient) {
              console.log(`Found client by phone match: "${clientPhone}" -> "${matchingClient.firstName} ${matchingClient.lastName}" (ID ${matchingClient.id})`);
            }
          }
        }
        
        // Priority 2: Exact email match (high confidence)
        if (!matchingClient && clientEmail) {
          matchingClient = allClients.find(client => {
            return client.email && client.email.toLowerCase() === clientEmail.toLowerCase();
          });
          
          if (matchingClient) {
            console.log(`Found client by email match: "${clientEmail}" -> "${matchingClient.firstName} ${matchingClient.lastName}" (ID ${matchingClient.id})`);
          }
        }
        
        // Priority 3: First name + Last name exact match (medium confidence)
        if (!matchingClient && searchFirstName && searchLastName) {
          matchingClient = allClients.find(client => {
            return client.firstName.toLowerCase() === searchFirstName.toLowerCase() &&
                   client.lastName.toLowerCase() === searchLastName.toLowerCase();
          });
          
          if (matchingClient) {
            console.log(`Found client by first+last name match: "${searchFirstName} ${searchLastName}" -> "${matchingClient.firstName} ${matchingClient.lastName}" (ID ${matchingClient.id})`);
          }
        }
        
        // Priority 4: Full name exact match (medium confidence)
        if (!matchingClient) {
          matchingClient = allClients.find(client => {
            const fullName = `${client.firstName} ${client.lastName}`.trim();
            return fullName.toLowerCase() === clientName.trim().toLowerCase();
          });
          
          if (matchingClient) {
            console.log(`Found client by full name exact match: "${clientName}" -> "${matchingClient.firstName} ${matchingClient.lastName}" (ID ${matchingClient.id})`);
          }
        }
        
        // Priority 5: First name exact match only (lower confidence)
        if (!matchingClient && searchFirstName) {
          matchingClient = allClients.find(client => {
            return client.firstName.toLowerCase() === searchFirstName.toLowerCase();
          });
          
          if (matchingClient) {
            console.log(`Found client by first name match: "${searchFirstName}" -> "${matchingClient.firstName} ${matchingClient.lastName}" (ID ${matchingClient.id})`);
          }
        }
        
        // Priority 6: Last name exact match only (lower confidence)  
        if (!matchingClient && searchLastName) {
          matchingClient = allClients.find(client => {
            return client.lastName.toLowerCase() === searchLastName.toLowerCase();
          });
          
          if (matchingClient) {
            console.log(`Found client by last name match: "${searchLastName}" -> "${matchingClient.firstName} ${matchingClient.lastName}" (ID ${matchingClient.id})`);
          }
        }
        
        // Priority 7: Fuzzy name matching (lowest confidence)
        if (!matchingClient) {
          const normalizedSearchName = clientName.trim().toLowerCase().replace(/\s+/g, ' ');
          
          matchingClient = allClients.find(client => {
            const fullName = `${client.firstName} ${client.lastName}`.trim();
            const normalizedClientName = fullName.toLowerCase().replace(/\s+/g, ' ');
            return normalizedClientName.includes(normalizedSearchName) ||
                   normalizedSearchName.includes(normalizedClientName);
          });
          
          if (matchingClient) {
            console.log(`Found client by fuzzy name match: "${clientName}" -> "${matchingClient.firstName} ${matchingClient.lastName}" (ID ${matchingClient.id})`);
          }
        }
        
        if (matchingClient) {
          clientId = matchingClient.id;
        } else {
          // Create new client only if no match found at all
          if (isFromProfile) {
            // Before creating, do one final check for potential duplicates
            let potentialDuplicate = false;
            let duplicateReason = '';
            
            // Check for similar phone numbers
            if (clientPhone) {
              const normalizedPhone = clientPhone.replace(/\D/g, '');
              if (normalizedPhone.length >= 10) {
                const similarPhone = allClients.find(client => {
                  if (!client.phone) return false;
                  const clientNormalizedPhone = client.phone.replace(/\D/g, '');
                  // Check if phone numbers are very similar (within 1-2 digits)
                  return clientNormalizedPhone.length >= 10 && 
                         Math.abs(clientNormalizedPhone.length - normalizedPhone.length) <= 2;
                });
                if (similarPhone) {
                  potentialDuplicate = true;
                  duplicateReason = `similar phone number to "${similarPhone.firstName} ${similarPhone.lastName}" (${similarPhone.phone})`;
                }
              }
            }
            
            // Check for similar names with same first or last name
            if (!potentialDuplicate) {
              const similarName = allClients.find(client => {
                const firstMatch = client.firstName.toLowerCase() === searchFirstName.toLowerCase();
                const lastMatch = searchLastName && client.lastName.toLowerCase() === searchLastName.toLowerCase();
                return firstMatch || lastMatch;
              });
              if (similarName) {
                potentialDuplicate = true;
                duplicateReason = `similar name to "${similarName.firstName} ${similarName.lastName}"`;
              }
            }
            
            if (potentialDuplicate) {
              console.log(`Potential duplicate detected for "${clientName}" - ${duplicateReason}. Creating anyway with note.`);
            }
            
            const [newClient] = await db
              .insert(clients)
              .values({
                firstName: searchFirstName,
                lastName: searchLastName,
                email: clientEmail,
                phone: clientPhone || null,
                company: null,
                address: null,
                createdAt: new Date()
              })
              .returning();
            
            clientId = newClient.id;
            console.log(`Created new client "${searchFirstName} ${searchLastName}" (ID ${clientId}) for profile booking${potentialDuplicate ? ' - flagged as potential duplicate' : ''}`);
          } else {
            console.log(`No client found matching "${clientName}" across all fields`);
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