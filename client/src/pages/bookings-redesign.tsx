import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, addDays, subDays, isSameDay, parseISO } from 'date-fns';
import { 
  Calendar as CalendarIcon,
  Filter,
  Plus,
  ChevronLeft,
  ChevronRight,
  Clock,
  Users,
  MoreHorizontal,
  Calendar,
  Grid,
  List,
  Check,
  X,
  CalendarDays,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Calendar as CalendarComponent } from '@/components/ui/calendar';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { apiRequest } from '@/lib/queryClient';

// Time slot interface
interface TimeSlot {
  id: string;
  time: string;
  available: boolean;
}

// Service interface
interface Service {
  id: number;
  name: string;
  duration: number;
  description: string;
  price?: number;
}

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
  priority: z.enum(["normal", "emergency"], {
    required_error: "Please select a priority level.",
  }),
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  notes: z.string().optional(),
  isRescheduling: z.boolean().default(false),
});

type BookingFormValues = z.infer<typeof bookingSchema>;

// Booking management interfaces
interface Booking {
  id: number;
  date: string;
  time: string;
  duration: number;
  type: 'call' | 'meeting' | 'followup' | 'consultation';
  status: 'confirmed' | 'rescheduled' | 'canceled' | 'emergency';
  client: {
    name: string;
    email: string;
    avatar?: string;
  };
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

// View enum
enum ViewMode {
  List = 'list',
  Grid = 'grid',
  Calendar = 'calendar'
}

const BookingsRedesign = () => {
  // Shared state
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Booking form state
  const [step, setStep] = useState(1);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<string | undefined>(undefined);
  
  // Booking management state
  const [viewMode, setViewMode] = useState<ViewMode>(ViewMode.Grid);
  const [managementSelectedDate, setManagementSelectedDate] = useState<Date | undefined>(new Date());
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedType, setSelectedType] = useState<string>('all');
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date }>({
    from: subDays(new Date(), 7),
    to: addDays(new Date(), 30)
  });
  const [detailsBooking, setDetailsBooking] = useState<Booking | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [isRescheduleOpen, setIsRescheduleOpen] = useState(false);

  // Determine if we're in booking form or management view  
  const [activeTab, setActiveTab] = useState<string>("create");
  

  // Default values for the form
  const defaultValues: Partial<BookingFormValues> = {
    date: undefined,
    timeSlot: "",
    service: "",
    priority: "normal",
    name: "",
    email: "",
    notes: "",
    isRescheduling: false,
  };

  // Form definition using react-hook-form
  const form = useForm<BookingFormValues>({
    resolver: zodResolver(bookingSchema),
    defaultValues,
  });

  // Watch form values for conditional rendering
  const watchDate = form.watch("date");
  const watchService = form.watch("service");
  const watchPriority = form.watch("priority");
  const watchIsRescheduling = form.watch("isRescheduling");

  // Query for available time slots based on selected date and service
  const { data: timeSlots = [], isLoading: timeSlotsLoading } = useQuery<TimeSlot[], Error>({
    queryKey: ['timeSlots', watchDate, watchService],
    queryFn: async () => {
      if (!watchDate || !watchService) return [];
      
      try {
        const dateString = format(watchDate, 'yyyy-MM-dd');
        const response = await apiRequest("GET", `/api/timeslots?date=${dateString}&service=${watchService}`);
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch time slots', error);
        return [];
      }
    },
    enabled: !!watchDate && !!watchService,
  });

  // Query for available services
  const { data: services = [], isLoading: servicesLoading } = useQuery<Service[], Error>({
    queryKey: ['services'],
    queryFn: async () => {
      try {
        const response = await apiRequest("GET", '/api/services');
        return await response.json();
      } catch (error) {
        console.error('Failed to fetch services', error);
        return [];
      }
    },
  });

  // Mutation for submitting the booking
  const bookingMutation = useMutation({
    mutationFn: async (values: BookingFormValues) => {
      const response = await apiRequest("POST", '/api/bookings', values);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Booking confirmed",
        description: "Your appointment has been successfully scheduled.",
      });
      form.reset(defaultValues);
      setStep(1);
      queryClient.invalidateQueries({ queryKey: ['bookings'] });
    },
    onError: (error) => {
      toast({
        title: "Error creating booking",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle form submission
  const onSubmit = (values: BookingFormValues) => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      bookingMutation.mutate(values);
    }
  };

  // Handle going back to previous step
  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  // Generate time slots grid
  const renderTimeSlots = () => {
    if (timeSlotsLoading) {
      return (
        <div className="flex justify-center py-8">
          <div className="animate-pulse h-6 w-24 bg-[#1a3a68] rounded"></div>
        </div>
      );
    }

    if (timeSlots.length === 0) {
      return (
        <div className="text-center py-8 text-gray-400">
          <p>No available time slots for the selected date and service.</p>
          <p className="text-sm mt-2">Please try selecting a different date or service.</p>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-4 gap-3 mt-4">
        {timeSlots.map((slot) => (
          <Button
            key={slot.id}
            type="button"
            variant={form.getValues("timeSlot") === slot.id ? "default" : "outline"}
            className={cn(
              "py-6",
              !slot.available && "opacity-50 cursor-not-allowed",
              form.getValues("timeSlot") === slot.id && "bg-[#1d4ed8] hover:bg-[#1e40af]"
            )}
            onClick={() => {
              if (slot.available) {
                form.setValue("timeSlot", slot.id);
              }
            }}
            disabled={!slot.available}
          >
            {slot.time}
          </Button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a2342] text-white p-4 md:p-6">
      <h1 className="text-2xl font-bold mb-6">Book Your Appointment</h1>

      <div className="max-w-3xl mx-auto">
        {/* Progress steps */}
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div className="flex flex-col items-center">
              <div className={`rounded-full h-10 w-10 flex items-center justify-center border-2 ${step >= 1 ? 'bg-[#1d4ed8] border-blue-600' : 'bg-[#173561] border-[#2a4d7d]'}`}>
                <span>1</span>
              </div>
              <span className="text-sm mt-2">Select Service</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 2 ? 'bg-[#1d4ed8]' : 'bg-[#173561]'}`}></div>
            <div className="flex flex-col items-center">
              <div className={`rounded-full h-10 w-10 flex items-center justify-center border-2 ${step >= 2 ? 'bg-[#1d4ed8] border-blue-600' : 'bg-[#173561] border-[#2a4d7d]'}`}>
                <span>2</span>
              </div>
              <span className="text-sm mt-2">Date & Time</span>
            </div>
            <div className={`flex-1 h-1 mx-2 ${step >= 3 ? 'bg-[#1d4ed8]' : 'bg-[#173561]'}`}></div>
            <div className="flex flex-col items-center">
              <div className={`rounded-full h-10 w-10 flex items-center justify-center border-2 ${step >= 3 ? 'bg-[#1d4ed8] border-blue-600' : 'bg-[#173561] border-[#2a4d7d]'}`}>
                <span>3</span>
              </div>
              <span className="text-sm mt-2">Your Details</span>
            </div>
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <Card className="bg-[#173561] border-[#2a4d7d] shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl">
                  {step === 1 && "Choose Your Service"}
                  {step === 2 && "Select Date & Time"}
                  {step === 3 && "Complete Your Information"}
                </CardTitle>
                <CardDescription className="text-gray-400">
                  {step === 1 && "Select the type of session you need."}
                  {step === 2 && "Choose a convenient date and time."}
                  {step === 3 && "Provide your contact details to confirm the booking."}
                </CardDescription>
              </CardHeader>

              <CardContent>
                {/* Step 1: Service Selection */}
                {step === 1 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="service"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Session Type</FormLabel>
                          <Select
                            onValueChange={field.onChange}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-[#0a2342] border-[#2a4d7d] text-white">
                                <SelectValue placeholder="Select a session type" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="bg-[#173561] border-[#2a4d7d] text-white">
                              <SelectItem value="call">Call</SelectItem>
                              <SelectItem value="meeting">Meeting</SelectItem>
                              <SelectItem value="followup">Follow-up</SelectItem>
                              <SelectItem value="consultation">Consultation</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription className="text-gray-400">
                            Select the type of session you'd like to book.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="priority"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel className="text-white">Priority Level</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-col space-y-1"
                            >
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="normal" className="text-[#1d4ed8]" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  Normal
                                </FormLabel>
                              </FormItem>
                              <FormItem className="flex items-center space-x-3 space-y-0">
                                <FormControl>
                                  <RadioGroupItem value="emergency" className="text-[#1d4ed8]" />
                                </FormControl>
                                <FormLabel className="font-normal cursor-pointer">
                                  Emergency
                                </FormLabel>
                              </FormItem>
                            </RadioGroup>
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            Emergency bookings will be prioritized in the schedule.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="isRescheduling"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg border border-[#2a4d7d] p-4">
                          <div className="space-y-0.5">
                            <FormLabel className="text-white">Reschedule Existing Appointment</FormLabel>
                            <FormDescription className="text-gray-400">
                              Toggle if you're rescheduling a previous booking.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                              className="data-[state=checked]:bg-[#1d4ed8]"
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {/* Step 2: Date and Time Selection */}
                {step === 2 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel className="text-white">Date</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant="outline"
                                  className={cn(
                                    "w-full pl-3 text-left font-normal bg-[#0a2342] border-[#2a4d7d] text-white",
                                    !field.value && "text-gray-400"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0 bg-[#173561] border-[#2a4d7d]" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) => date < new Date() || date > addDays(new Date(), 30)}
                                initialFocus
                                className="bg-[#173561] text-white"
                              />
                            </PopoverContent>
                          </Popover>
                          <FormDescription className="text-gray-400">
                            Select a date for your appointment.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {watchDate && (
                      <FormField
                        control={form.control}
                        name="timeSlot"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-white">Time Slot</FormLabel>
                            <FormControl>
                              <div className="rounded-md border border-[#2a4d7d] p-4">
                                {renderTimeSlots()}
                              </div>
                            </FormControl>
                            <FormDescription className="text-gray-400">
                              Select an available time slot.
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    )}
                  </div>
                )}

                {/* Step 3: Personal Information */}
                {step === 3 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Name</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your full name" 
                              className="bg-[#0a2342] border-[#2a4d7d] text-white placeholder:text-gray-400" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Email</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="Enter your email address" 
                              className="bg-[#0a2342] border-[#2a4d7d] text-white placeholder:text-gray-400" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-white">Additional Notes</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Any additional information or special requests" 
                              className="resize-none bg-[#0a2342] border-[#2a4d7d] text-white placeholder:text-gray-400" 
                              {...field} 
                            />
                          </FormControl>
                          <FormDescription className="text-gray-400">
                            Optional: Add any details that might be helpful.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* Booking summary */}
                    <div className="mt-6 p-4 rounded-md bg-[#0a2342] border border-[#2a4d7d]">
                      <h3 className="font-medium mb-3">Booking Summary</h3>
                      <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                          <span className="text-gray-400">Service:</span>
                          <span className="font-medium capitalize">{watchService || "Not selected"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Date:</span>
                          <span className="font-medium">{watchDate ? format(watchDate, 'PPP') : "Not selected"}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Time:</span>
                          <span className="font-medium">
                            {selectedTimeSlot ? 
                              timeSlots.find(slot => slot.id === form.getValues("timeSlot"))?.time || "Not selected" 
                              : "Not selected"}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-400">Priority:</span>
                          <Badge className={watchPriority === "emergency" ? "bg-red-500" : "bg-blue-500"}>
                            {watchPriority === "emergency" ? "Emergency" : "Normal"}
                          </Badge>
                        </div>
                        {watchIsRescheduling && (
                          <div className="flex justify-between">
                            <span className="text-gray-400">Type:</span>
                            <Badge variant="outline" className="bg-[#173561]">Reschedule</Badge>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </CardContent>

              <CardFooter className="flex justify-between pt-6">
                <Button 
                  type="button" 
                  onClick={handleBack} 
                  variant="outline" 
                  disabled={step === 1}
                  className="border-[#2a4d7d] text-white hover:bg-[#0a2342] hover:text-white"
                >
                  {step === 1 ? "Cancel" : "Back"}
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#1d4ed8] hover:bg-blue-600 text-white min-w-[120px]"
                  disabled={
                    (step === 1 && !watchService) ||
                    (step === 2 && (!watchDate || !form.getValues("timeSlot"))) ||
                    bookingMutation.isPending
                  }
                >
                  {step === 3 
                    ? (bookingMutation.isPending ? "Processing..." : "Confirm Booking") 
                    : "Continue"}
                </Button>
              </CardFooter>
            </Card>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default BookingsRedesign;