import { useState } from "react";
import { X, Calendar, Clock, User, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface BookingRequestFormProps {
  isOpen: boolean;
  onClose: () => void;
  services: Array<{
    name: string;
    duration: number | string;
    price: number | string;
  }>;
  professionalName: string;
  professionalId: string;
}

export default function BookingRequestForm({ 
  isOpen, 
  onClose, 
  services, 
  professionalName,
  professionalId
}: BookingRequestFormProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    clientName: "",
    clientPhone: "",
    serviceId: "",
    date: "",
    time: ""
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.clientName || !formData.clientPhone || !formData.serviceId || !formData.date || !formData.time) {
      toast({
        title: "Incomplete Form",
        description: "Please fill in all required fields.",
        variant: "destructive",
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const selectedService = services.find((s, index) => index.toString() === formData.serviceId);
      
      const bookingRequest = {
        clientName: formData.clientName,
        clientPhone: formData.clientPhone,
        serviceName: selectedService?.name,
        servicePrice: selectedService?.price,
        date: formData.date,
        time: formData.time,
        status: "pending",
        professionalId,
        createdAt: new Date().toISOString()
      };
      
      await fetch('/api/bookings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingRequest)
      });
      
      toast({
        title: "Booking Request Sent",
        description: `Your booking request with ${professionalName} has been sent. You will be contacted soon.`,
        variant: "default",
      });
      
      onClose();
    } catch (error) {
      console.error('Error submitting booking request:', error);
      toast({
        title: "Booking Request Failed",
        description: "There was a problem submitting your booking request. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-lg w-full max-w-md relative overflow-hidden">
        <div className="bg-blue-600 text-white p-6">
          <h2 className="text-2xl font-semibold">Book a Session</h2>
          <p className="opacity-90">with {professionalName}</p>
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white hover:bg-blue-700 rounded-full p-1"
          >
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <Label htmlFor="clientName" className="flex items-center">
              <User size={16} className="mr-2" />
              Your Name
            </Label>
            <Input
              id="clientName"
              name="clientName"
              value={formData.clientName}
              onChange={handleChange}
              placeholder="Enter your full name"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="clientPhone" className="flex items-center">
              <Phone size={16} className="mr-2" />
              Phone Number
            </Label>
            <Input
              id="clientPhone"
              name="clientPhone"
              value={formData.clientPhone}
              onChange={handleChange}
              placeholder="Enter your phone number"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="service" className="block">Service</Label>
            <Select 
              value={formData.serviceId}
              onValueChange={(value) => handleSelectChange("serviceId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a service" />
              </SelectTrigger>
              <SelectContent>
                {services.map((service, index) => (
                  <SelectItem key={index} value={index.toString()}>
                    {service.name} (${service.price})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date" className="flex items-center">
                <Calendar size={16} className="mr-2" />
                Date
              </Label>
              <Input
                id="date"
                name="date"
                type="date"
                value={formData.date}
                onChange={handleChange}
                min={new Date().toISOString().split('T')[0]}
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="time" className="flex items-center">
                <Clock size={16} className="mr-2" />
                Time
              </Label>
              <Input
                id="time"
                name="time"
                type="time"
                value={formData.time}
                onChange={handleChange}
              />
            </div>
          </div>
          
          <div className="pt-4">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Request Booking"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}