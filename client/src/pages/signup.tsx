import { useState } from "react";
import { useLocation } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/lib/userContext";

// Import step components
import StepOne from "@/components/signup/StepOne";
import StepFour from "@/components/signup/StepFour";
import StepFive from "@/components/signup/StepFive";
import StepSix from "@/components/signup/StepSix";
import StepSeven from "@/components/signup/StepSeven";
import StepEight from "@/components/signup/StepEight";
import StepNine from "@/components/signup/StepNine";

// Service interface for the form
interface Service {
  name: string;
  duration: number;
  price: number;
}

// Signup form data interface
export interface SignupFormData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  businessName: string;
  profession: string;
  locationType: string;
  services: Service[];
}

export default function Signup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { setUser } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SignupFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  // Function to move to next step
  const handleNext = (data: Partial<SignupFormData>) => {
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    window.scrollTo(0, 0);
  };

  // Function to move to previous step
  const handlePrev = () => {
    setCurrentStep((prev) => Math.max(prev - 1, 1));
    window.scrollTo(0, 0);
  };

  // Function to submit form
  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // This is where you would send data to the backend
      console.log("Submitting form data:", formData);
      
      // Create the user data object for global context
      const userData = {
        id: `user-${Date.now()}`, // Generate a temporary ID
        firstName: formData.firstName || "",
        lastName: formData.lastName || "",
        email: formData.email || "",
        phone: formData.phone || "",
        businessName: formData.businessName || "",
        profession: formData.profession || "",
        locationType: formData.locationType || "",
        services: formData.services || [],
        profileImageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          `${formData.firstName || ""} ${formData.lastName || ""}`
        )}&background=6366F1&color=fff`
      };
      
      // Update the user context
      setUser(userData);
      
      /*
      // This is commented out for now until we implement the backend
      await apiRequest("/api/service-providers", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: {
          "Content-Type": "application/json"
        }
      });
      */
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Show success toast
      toast({
        title: "Registration successful!",
        description: "Your account has been created and your data is now available across the app.",
        variant: "default",
      });

      // Navigate to dashboard after successful signup
      navigate("/dashboard");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast({
        title: "Registration failed",
        description: "There was an error creating your account. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepOne formData={formData} onNext={handleNext} />;
      case 2:
        return <StepFour formData={formData} onNext={handleNext} onPrev={handlePrev} />;
      case 3:
        return <StepFive formData={formData} onNext={handleNext} onPrev={handlePrev} />;
      case 4:
        return <StepSix formData={formData} onNext={handleNext} onPrev={handlePrev} />;
      case 5:
        return <StepSeven formData={formData} onNext={handleNext} onPrev={handlePrev} />;
      case 6:
        return <StepEight formData={formData} onNext={handleNext} onPrev={handlePrev} />;
      case 7:
        return <StepNine 
                 formData={formData} 
                 onSubmit={handleSubmit} 
                 onPrev={handlePrev}
                 isSubmitting={isSubmitting}
               />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-primary mb-2">
            Service Provider Registration
          </h1>
          <p className="text-slate-500">
            Step {currentStep} of {totalSteps}
          </p>
          <Progress value={progress} className="h-2 mt-4 mb-8" />
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="pt-6">
            {renderStep()}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}