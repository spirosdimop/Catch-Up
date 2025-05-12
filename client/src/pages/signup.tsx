import { useState, useEffect } from "react";
import { useNavigate } from "wouter";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { apiRequest } from "@/lib/queryClient";
import { Toast } from "@/components/ui/toast";
import { useToast } from "@/hooks/use-toast";

// Import Step Components
import StepOne from "@/components/signup/StepOne";
import StepTwo from "@/components/signup/StepTwo";
import StepThree from "@/components/signup/StepThree";
import StepFour from "@/components/signup/StepFour";
import StepFive from "@/components/signup/StepFive";
import StepSix from "@/components/signup/StepSix";
import StepSeven from "@/components/signup/StepSeven";
import StepEight from "@/components/signup/StepEight";
import StepNine from "@/components/signup/StepNine";

// Create a schema for the entire form
export const signupSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Please enter a valid email address"),
  phone: z.string().min(6, "Please enter a valid phone number"),
  businessName: z.string().min(1, "Business name is required"),
  profession: z.string().min(1, "Profession is required"),
  locationType: z.enum(["has_shop", "goes_to_clients", "both"]),
  services: z.array(
    z.object({
      name: z.string().min(1, "Service name is required"),
      duration: z.number().min(1, "Duration must be at least 1 minute"),
      price: z.number().min(0, "Price must be at least 0")
    })
  ).min(1, "At least one service is required")
});

export type SignupFormData = z.infer<typeof signupSchema>;

const MultiStepSignupForm = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SignupFormData>>({
    services: [{ name: "", duration: 30, price: 0 }]
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Calculate total number of steps
  const totalSteps = 9;

  // Progress percentage
  const progress = Math.round((currentStep / totalSteps) * 100);

  const nextStep = (data: Partial<SignupFormData> = {}) => {
    // Merge the new data with existing form data
    setFormData(prevData => ({ ...prevData, ...data }));
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      setIsSubmitting(true);

      // Format the data for the API
      const apiData = {
        serviceProvider: {
          firstName: formData.firstName,
          lastName: formData.lastName,
          email: formData.email,
          phone: formData.phone,
          businessName: formData.businessName,
          profession: formData.profession,
          locationType: formData.locationType
        },
        services: formData.services?.map(service => ({
          name: service.name,
          duration: service.duration,
          price: service.price
        }))
      };

      // Send the data to the API
      const response = await apiRequest('/api/signup', {
        method: 'POST',
        body: JSON.stringify(apiData),
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'An error occurred during signup');
      }

      // Show success message
      toast({
        title: "Success!",
        description: "Your account has been created successfully.",
        duration: 5000,
      });

      // Navigate to dashboard or login page
      setTimeout(() => {
        navigate("/");
      }, 2000);
    } catch (error) {
      console.error('Signup error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred. Please try again.",
        variant: "destructive",
        duration: 5000,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render the current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return <StepOne formData={formData} onNext={nextStep} />;
      case 2:
        return <StepTwo formData={formData} onNext={nextStep} onPrev={prevStep} />;
      case 3:
        return <StepThree formData={formData} onNext={nextStep} onPrev={prevStep} />;
      case 4:
        return <StepFour formData={formData} onNext={nextStep} onPrev={prevStep} />;
      case 5:
        return <StepFive formData={formData} onNext={nextStep} onPrev={prevStep} />;
      case 6:
        return <StepSix formData={formData} onNext={nextStep} onPrev={prevStep} />;
      case 7:
        return <StepSeven formData={formData} onNext={nextStep} onPrev={prevStep} />;
      case 8:
        return <StepEight formData={formData} onNext={nextStep} onPrev={prevStep} />;
      case 9:
        return (
          <StepNine 
            formData={formData} 
            onSubmit={handleSubmit} 
            onPrev={prevStep} 
            isSubmitting={isSubmitting} 
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-6 flex flex-col justify-center sm:py-12">
      <div className="relative py-3 sm:max-w-xl md:max-w-2xl lg:max-w-4xl mx-auto">
        <div className="absolute inset-0 bg-gradient-to-r from-primary to-primary/80 shadow-lg transform skew-y-0 -rotate-2 rounded-3xl"></div>
        <div className="relative px-4 py-10 bg-white shadow-lg rounded-3xl sm:p-10 md:p-12">
          <div className="max-w-lg mx-auto">
            {/* Progress bar */}
            <div className="mb-8">
              <h2 className="text-2xl font-bold text-center mb-4">Sign Up</h2>
              <div className="relative pt-1">
                <div className="flex items-center justify-between">
                  <div>
                    <span className="text-sm font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary">
                      Step {currentStep} of {totalSteps}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold inline-block py-1 px-2 uppercase rounded-full text-primary">
                      {progress}%
                    </span>
                  </div>
                </div>
                <div className="overflow-hidden h-2 mb-4 text-xs flex rounded bg-gray-200">
                  <div
                    style={{ width: `${progress}%` }}
                    className="shadow-none flex flex-col text-center whitespace-nowrap text-white justify-center bg-primary transition-all duration-500"
                  ></div>
                </div>
              </div>
            </div>

            {/* Step content */}
            <div className="mt-8">
              {renderStep()}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MultiStepSignupForm;