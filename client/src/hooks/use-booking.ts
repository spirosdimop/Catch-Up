import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useToast } from '@/hooks/use-toast';

export interface BookingData {
  serviceId?: number;
  serviceName: string;
  clientName: string;
  clientEmail: string;
  clientPhone: string;
  date: string;
  time: string;
  notes?: string;
  providerId: string;
  duration: number;
  location?: string;
  price?: number;
}

export interface TimeSlot {
  time: string;
  formatted: string;
}

export function useBooking() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<TimeSlot | null>(null);
  const [resetForm, setResetForm] = useState<() => void>(() => () => {});
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for available time slots
  const availableSlotsQuery = useQuery({
    queryKey: ['availableSlots', selectedDate?.toISOString(), selectedTimeSlot],
    queryFn: async ({ queryKey }) => {
      if (!selectedDate) return [];
      const dateString = selectedDate.toISOString().split('T')[0];
      // Use the default query function that's already configured
      return await fetch(`/api/bookings/available-slots?date=${dateString}&providerId=1`)
        .then(res => {
          if (!res.ok) throw new Error('Failed to fetch time slots');
          return res.json() as Promise<TimeSlot[]>;
        });
    },
    enabled: !!selectedDate // Only run query if a date is selected
  });

  // Mutation for creating a booking
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: BookingData) => {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData)
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorData.error || 'Failed to create booking');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking Successful",
        description: "Your appointment has been scheduled. You will receive a confirmation shortly."
      });
      
      // Reset form if a reset callback was provided
      resetForm();
      
      // Reset selected date and time slot
      setSelectedDate(null);
      setSelectedTimeSlot(null);
      
      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['availableSlots'] });
    },
    onError: (error: any) => {
      toast({
        title: "Booking Failed",
        description: error.message || "There was an error scheduling your appointment. Please try again.",
        variant: "destructive"
      });
    }
  });

  return {
    selectedDate,
    setSelectedDate,
    selectedTimeSlot,
    setSelectedTimeSlot,
    availableSlots: availableSlotsQuery.data || [],
    isLoadingSlots: availableSlotsQuery.isLoading,
    createBooking: createBookingMutation.mutate,
    isPendingBooking: createBookingMutation.isPending,
    setResetFormCallback: setResetForm
  };
}