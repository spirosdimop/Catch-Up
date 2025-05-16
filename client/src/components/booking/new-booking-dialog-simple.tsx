import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format } from 'date-fns';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { Calendar as CalendarIcon } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';

// Booking schema with zod validation
const bookingSchema = z.object({
  date: z.date({
    required_error: "Please select a date.",
  }),
  timeSlot: z.string({
    required_error: "Please select a time slot.",
  }),
  service: z.string({
    required_error: "Please select a service type.",
  }),
  clientId: z.number({
    required_error: "Please select a client.",
  }),
  location: z.string().min(2, {
    message: "Location must be at least 2 characters.",
  }),
  priority: z.enum(["normal", "emergency"], {
    required_error: "Please select a priority level.",
  }),
  notes: z.string().optional(),
  // These will be added during submission
  type: z.string().optional(),
  status: z.string().optional(),
  duration: z.number().optional(),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

// Time slot interface
interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

// Service interface
interface Service {
  id: string;
  name: string;
  duration: number;
}

// Client interface
interface Client {
  id: number;
  name: string;
  email: string;
}

interface NewBookingDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewBookingDialog({ open, onOpenChange }: NewBookingDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Create a form instance for the dialog
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues: {
      date: undefined,
      timeSlot: "",
      service: "",
      clientId: undefined,
      location: "",
      priority: "normal",
      notes: "",
    },
  });
  
  // Query available services
  const { data: services = [] } = useQuery<Service[], Error>({
    queryKey: ['/api/services'],
  });
  
  // Query available clients
  const { data: clients = [] } = useQuery<Client[], Error>({
    queryKey: ['/api/clients'],
  });
  
  // Get available time slots based on selected date and service
  const [timeSlots, setTimeSlots] = useState<TimeSlot[]>([]);
  const selectedDate = form.watch("date");
  const selectedService = form.watch("service");
  
  useEffect(() => {
    if (selectedDate && selectedService) {
      // Generate time slots (this would normally come from an API)
      const slots = [];
      const service = services.find(s => s.id === selectedService);
      const duration = service?.duration || 60;
      
      // Generate slots from 9am to 5pm
      const startTime = 9;
      const endTime = 17;
      
      for (let hour = startTime; hour < endTime; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          // Skip if the slot doesn't fit in the day
          if (hour === endTime - 1 && minute + duration > 60) continue;
          
          const time = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
          slots.push({
            id: time,
            time,
            available: Math.random() > 0.3, // Randomly mark some as unavailable
          });
        }
      }
      
      setTimeSlots(slots);
    }
  }, [selectedDate, selectedService, services]);
  
  // Create booking mutation
  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormValues) => {
      // Get selected service to determine duration
      const selectedService = services.find(s => s.id === data.service);
      
      // Format the data to match the API expectations
      const formattedData = {
        date: format(data.date, 'yyyy-MM-dd'),
        time: data.timeSlot,
        clientId: Number(data.clientId),
        serviceId: data.service,
        location: data.location,
        priority: data.priority,
        notes: data.notes || "",
        type: "meeting", // Default type
        status: "confirmed", // Default status
        duration: selectedService?.duration || 60 // Get duration from service or default to 60 minutes
      };
      
      console.log('Submitting booking data:', formattedData);
      
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Booking creation error:', errorData);
        throw new Error(errorData.message || 'Failed to create booking');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/bookings'] });
      onOpenChange(false);
      toast({
        title: "Booking Created",
        description: "Your booking has been successfully created.",
        variant: "default",
      });
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to create booking: ${error.message}`,
        variant: "destructive",
      });
    },
  });
  
  const handleSubmit = (data: BookingFormValues) => {
    createBookingMutation.mutate(data);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="bg-white border-gray-200 text-[#0A2540] sm:max-w-[700px] md:max-w-[800px] lg:max-w-[900px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Create New Booking</DialogTitle>
          <DialogDescription>
            Fill in the details to create a new booking
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Client selection */}
            <FormField
              control={form.control}
              name="clientId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client</FormLabel>
                  <Select 
                    onValueChange={(value) => field.onChange(parseInt(value))}
                    defaultValue={field.value?.toString()}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select a client" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      {clients.map((client) => (
                        <SelectItem key={client.id} value={client.id.toString()}>
                          {client.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Service selection */}
            <FormField
              control={form.control}
              name="service"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Service Type</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder="Select a service" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="bg-white">
                      {services.map((service) => (
                        <SelectItem key={service.id} value={service.id}>
                          {service.name} ({service.duration} min)
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Location */}
            <FormField
              control={form.control}
              name="location"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Location</FormLabel>
                  <FormControl>
                    <Input {...field} className="border-gray-300" placeholder="Enter meeting location" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Date selection */}
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Date</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          className={cn(
                            "pl-3 text-left font-normal border-gray-300",
                            !field.value && "text-muted-foreground"
                          )}
                        >
                          {field.value ? (
                            format(field.value, "PPP")
                          ) : (
                            <span>Select a date</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0 bg-white" align="start">
                      <Calendar
                        mode="single"
                        selected={field.value}
                        onSelect={field.onChange}
                        disabled={(date) => date < new Date()}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Time slot selection */}
            {selectedDate && selectedService && (
              <FormField
                control={form.control}
                name="timeSlot"
                render={({ field }) => (
                  <FormItem className="w-full">
                    <FormLabel>Time Slot</FormLabel>
                    <div className="flex flex-wrap gap-2 max-w-full">
                      {timeSlots.map((slot) => (
                        <Button
                          key={slot.id}
                          type="button"
                          onClick={() => field.onChange(slot.id)}
                          variant={field.value === slot.id ? "default" : "outline"}
                          disabled={!slot.available}
                          className={cn(
                            "h-10 w-[70px] text-sm flex-shrink-0",
                            field.value === slot.id ? "bg-[#0A2540] text-white" : "border-gray-300",
                            !slot.available && "opacity-50 cursor-not-allowed"
                          )}
                        >
                          {slot.time}
                        </Button>
                      ))}
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            
            {/* Priority selection */}
            <FormField
              control={form.control}
              name="priority"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Priority</FormLabel>
                  <div className="flex space-x-2">
                    <Button
                      type="button"
                      onClick={() => field.onChange("normal")}
                      variant={field.value === "normal" ? "default" : "outline"}
                      className={cn(
                        field.value === "normal" ? "bg-[#0A2540] text-white" : "border-gray-300"
                      )}
                    >
                      Normal
                    </Button>
                    <Button
                      type="button"
                      onClick={() => field.onChange("emergency")}
                      variant={field.value === "emergency" ? "default" : "outline"}
                      className={cn(
                        field.value === "emergency" ? "bg-red-600 text-white hover:bg-red-700" : "border-gray-300"
                      )}
                    >
                      Emergency
                    </Button>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            {/* Notes */}
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes</FormLabel>
                  <FormControl>
                    <Textarea 
                      {...field} 
                      className="border-gray-300 resize-none" 
                      placeholder="Add any additional details here..."
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>
        
        <DialogFooter className="space-x-2 mt-6">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button 
            onClick={form.handleSubmit(handleSubmit)}
            className="bg-[#0A2540] hover:bg-[#081c30]"
            disabled={createBookingMutation.isPending}
          >
            {createBookingMutation.isPending ? "Creating..." : "Create Booking"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export default NewBookingDialog;