import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useUser } from "@/lib/userContext";
import { motion, AnimatePresence } from "framer-motion";
import { Star, ArrowLeft } from "lucide-react";

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

// Animation variants
const slideVariants = {
  enter: (direction: number) => ({
    x: direction > 0 ? 500 : -500,
    opacity: 0,
  }),
  center: {
    x: 0,
    opacity: 1,
  },
  exit: (direction: number) => ({
    x: direction < 0 ? 500 : -500,
    opacity: 0,
  }),
};

// Animation transition
const transition = {
  type: "spring",
  stiffness: 300,
  damping: 30,
};

export default function Signup() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const { setUser } = useUser();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<Partial<SignupFormData>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [direction, setDirection] = useState(0);

  const totalSteps = 7;
  const progress = (currentStep / totalSteps) * 100;

  // Function to move to next step
  const handleNext = (data: Partial<SignupFormData>) => {
    setDirection(1);
    setFormData((prev) => ({ ...prev, ...data }));
    setCurrentStep((prev) => Math.min(prev + 1, totalSteps));
    window.scrollTo(0, 0);
  };

  // Function to move to previous step
  const handlePrev = () => {
    setDirection(-1);
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
        )}&background=0A2540&color=fff`
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
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="w-full py-4 px-4 md:px-6 border-b bg-white">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Link href="/">
              <a className="flex items-center space-x-2 group">
                <Star className="h-6 w-6 text-catchup-primary" />
                <span className="text-xl font-semibold text-catchup-primary">Catch Up</span>
              </a>
            </Link>
          </div>
          <Link href="/">
            <a className="text-sm font-medium text-gray-600 hover:text-gray-900 flex items-center">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to home
            </a>
          </Link>
        </div>
      </header>

      <div className="flex-1 flex flex-col items-center justify-center p-4 bg-gradient-to-b from-white to-blue-50">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <h1 className="text-3xl font-bold text-catchup-primary mb-2">
              Create Your Catch Up Account
            </h1>
            <p className="text-gray-600">
              Step {currentStep} of {totalSteps}
            </p>
            <Progress value={progress} className="h-2 mt-4 mb-8 bg-gray-100" />
          </div>

          <Card className="shadow-xl border-0 rounded-xl overflow-hidden">
            <CardContent className="p-0">
              <AnimatePresence custom={direction} initial={false} mode="wait">
                <motion.div
                  key={currentStep}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={transition}
                  className="p-6"
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>
            </CardContent>
          </Card>

          <div className="text-center text-sm text-gray-500 mt-6">
            Already have an account? <Link href="/login"><a className="text-catchup-primary font-semibold hover:underline">Sign in</a></Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="w-full py-4 px-4 md:px-6 border-t bg-white">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between text-sm text-gray-500">
          <div className="mb-4 md:mb-0">
            © {new Date().getFullYear()} Catch Up. All rights reserved.
          </div>
          <div className="flex space-x-6">
            <a href="#" className="hover:text-gray-700">Privacy Policy</a>
            <a href="#" className="hover:text-gray-700">Terms of Service</a>
            <a href="#" className="hover:text-gray-700">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  );
}