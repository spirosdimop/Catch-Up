import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
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
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Query for available time slots
  const availableSlotsQuery = useQuery({
    queryKey: ['availableSlots', selectedDate?.toISOString(), selectedTimeSlot],
    queryFn: async () => {
      if (!selectedDate) return [];
      const dateString = selectedDate.toISOString().split('T')[0];
      const response = await apiRequest(`/api/bookings/available-slots?date=${dateString}&providerId=1`);
      return response as TimeSlot[];
    },
    enabled: !!selectedDate // Only run query if a date is selected
  });

  // Mutation for creating a booking
  const createBookingMutation = useMutation({
    mutationFn: async (bookingData: BookingData) => {
      const response = await apiRequest('/api/bookings', {
        method: 'POST',
        body: JSON.stringify(bookingData),
        headers: {
          'Content-Type': 'application/json'
        }
      });
      return response;
    },
    onSuccess: () => {
      toast({
        title: "Booking Successful",
        description: "Your appointment has been scheduled. You will receive a confirmation shortly.",
        variant: "success"
      });
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
    isPendingBooking: createBookingMutation.isPending
  };
}