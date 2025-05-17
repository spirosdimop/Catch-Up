// Simple client-side booking storage management

export interface BookingRequest {
  id: string;
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

// Key for localStorage
const BOOKINGS_STORAGE_KEY = 'app_booking_requests';

// Get all booking requests
export function getAllBookings(): BookingRequest[] {
  try {
    const storedData = localStorage.getItem(BOOKINGS_STORAGE_KEY);
    if (!storedData) return [];
    return JSON.parse(storedData);
  } catch (error) {
    console.error('Failed to get bookings from storage:', error);
    return [];
  }
}

// Add a new booking request
export function addBooking(booking: BookingRequest): BookingRequest {
  try {
    const bookings = getAllBookings();
    const updatedBookings = [...bookings, booking];
    localStorage.setItem(BOOKINGS_STORAGE_KEY, JSON.stringify(updatedBookings));
    console.log('Booking saved successfully:', booking);
    return booking;
  } catch (error) {
    console.error('Failed to save booking:', error);
    throw new Error('Failed to save booking request');
  }
}

// Update a booking request
export function updateBooking(
  bookingId: string,
  updates: Partial<BookingRequest>
): BookingRequest | null {
  try {
    const bookings = getAllBookings();
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

// Delete a booking request
export function deleteBooking(bookingId: string): boolean {
  try {
    const bookings = getAllBookings();
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