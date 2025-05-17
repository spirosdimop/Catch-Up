import { apiRequest } from "@/lib/queryClient";

export interface BookingRequest {
  id: string;
  externalId: string;
  clientName: string;
  clientPhone: string;
  serviceName?: string;
  servicePrice?: string | number;
  date: string;
  time: string;
  status: "pending" | "accepted" | "declined" | "rescheduled";
  professionalId: string;
  createdAt: string;
  notes?: string;
}

// Local storage key for offline capability
const BOOKINGS_STORAGE_KEY = 'app_booking_requests';

// Get all bookings - first tries from API, falls back to localStorage
export async function getAllBookings(): Promise<BookingRequest[]> {
  try {
    // Try to get bookings from API first
    const response = await fetch('/api/bookings');
    
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        // Convert any numeric IDs to strings for consistency
        return data.map(booking => ({
          ...booking,
          id: booking.id.toString(),
        }));
      }
    }
    
    // If API fails or returns unexpected format, try localStorage
    return getLocalBookings();
  } catch (error) {
    console.error('Failed to get bookings from API, using local storage:', error);
    return getLocalBookings();
  }
}

// Get bookings by professional ID
export async function getBookingsByProfessional(professionalId: string): Promise<BookingRequest[]> {
  try {
    // Try to get all bookings from API first
    const response = await fetch('/api/bookings');
    
    if (response.ok) {
      const data = await response.json();
      if (Array.isArray(data)) {
        // Filter by professionalId and convert any numeric IDs to strings for consistency
        return data
          .filter(booking => booking.professionalId === professionalId)
          .map(booking => ({
            ...booking,
            id: booking.id.toString(),
          }));
      }
    }
    
    // If API fails, filter local bookings by professionalId
    const localBookings = getLocalBookings();
    return localBookings.filter(b => b.professionalId === professionalId);
  } catch (error) {
    console.error('Failed to get bookings by professional from API, using local storage:', error);
    // Filter local bookings by professionalId
    const localBookings = getLocalBookings();
    return localBookings.filter(b => b.professionalId === professionalId);
  }
}

// Helper to get bookings from localStorage
function getLocalBookings(): BookingRequest[] {
  try {
    const storedData = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!storedData) return [];
    return JSON.parse(storedData);
  } catch (error) {
    console.error('Failed to get bookings from storage:', error);
    return [];
  }
}

// Add a new booking
export async function addBooking(booking: Omit<BookingRequest, 'id'>): Promise<BookingRequest> {
  try {
    // Generate a unique ID for the booking if one is not provided
    const externalId = booking.externalId || Date.now().toString();
    const newBooking = { ...booking, externalId };

    // Try to save to API first
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newBooking)
      });
      
      if (response.ok) {
        const data = await response.json();
        // Successfully saved to API, return the response
        return {
          ...data,
          id: data.id.toString() // Ensure ID is string
        };
      }
    } catch (apiError) {
      console.error('Failed to save booking to API:', apiError);
      // Continue to save locally if API fails
    }
    
    // Save to localStorage as backup or if API fails
    const localId = Date.now().toString();
    const localBooking: BookingRequest = {
      ...newBooking,
      id: localId,
    };
    
    // Get existing bookings and add the new one
    const bookings = getLocalBookings();
    const updatedBookings = [...bookings, localBooking];
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updatedBookings));
    
    console.log('Booking saved to local storage:', localBooking);
    return localBooking;
  } catch (error) {
    console.error('Failed to save booking:', error);
    throw new Error('Failed to save booking request');
  }
}

// Update a booking
export async function updateBooking(
  bookingId: string,
  updates: Partial<BookingRequest>
): Promise<BookingRequest | null> {
  try {
    // Try to update in API first
    try {
      const response = await fetch(`/api/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates)
      });
      
      if (response.ok) {
        const data = await response.json();
        // Successfully updated in API
        return {
          ...data,
          id: data.id.toString() // Ensure ID is string
        };
      }
    } catch (apiError) {
      console.error('Failed to update booking in API:', apiError);
      // Continue to update locally if API fails
    }
    
    // Update in localStorage as backup or if API fails
    const bookings = getLocalBookings();
    const index = bookings.findIndex(b => b.id === bookingId);
    
    if (index === -1) return null;
    
    const updatedBooking = { ...bookings[index], ...updates };
    bookings[index] = updatedBooking;
    
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(bookings));
    return updatedBooking;
  } catch (error) {
    console.error('Failed to update booking:', error);
    throw new Error('Failed to update booking request');
  }
}

// Delete a booking
export async function deleteBooking(bookingId: string): Promise<boolean> {
  try {
    // Try to delete from API first
    try {
      const response = await apiRequest(`/api/bookings/${bookingId}`, {
        method: 'DELETE'
      });
      
      if (response && response.success) {
        // Successfully deleted from API
        return true;
      }
    } catch (apiError) {
      console.error('Failed to delete booking from API:', apiError);
      // Continue to delete locally if API fails
    }
    
    // Delete from localStorage as backup or if API fails
    const bookings = getLocalBookings();
    const updatedBookings = bookings.filter(b => b.id !== bookingId);
    
    if (updatedBookings.length === bookings.length) {
      return false; // No booking was deleted
    }
    
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updatedBookings));
    return true;
  } catch (error) {
    console.error('Failed to delete booking:', error);
    throw new Error('Failed to delete booking request');
  }
}

// Clear all bookings (for testing)
export function clearAllBookings(): void {
  localStorage.removeItem(BOOKINGS_STORAGE_KEY);
}