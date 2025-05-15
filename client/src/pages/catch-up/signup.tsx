import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Star, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AppButton } from "@/components/ui/catch-up/app-button";
import { AppCard, AppCardBody, AppCardFooter } from "@/components/ui/catch-up/app-card";

// Define the signup form schema
const signupSchema = z.object({
  name: z.string().min(2, { message: "Name must be at least 2 characters" }),
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/[A-Z]/, { message: "Password must contain at least one uppercase letter" })
    .regex(/[0-9]/, { message: "Password must contain at least one number" }),
  confirmPassword: z.string(),
  acceptTerms: z.literal(true, {
    errorMap: () => ({ message: "You must accept the terms and conditions" }),
  }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type SignupFormValues = z.infer<typeof signupSchema>;

/**
 * Catch Up Signup Page
 */
export function CatchUpSignupPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [, navigate] = useLocation();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: false,
    },
  });
  
  const onSubmit = async (data: SignupFormValues) => {
    // In a real app, we would register the user with an API
    console.log("Signup data:", data);
    
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Navigate to dashboard on success
    navigate("/catch-up/dashboard");
  };
  
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Header */}
      <header className="bg-catchup-primary py-4">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-3">
            <Link href="/catch-up">
              <div className="flex items-center gap-3 cursor-pointer">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white">
                  <Star className="h-5 w-5 text-catchup-accent" />
                </div>
                <span className="text-lg font-semibold text-white">Catch Up</span>
              </div>
            </Link>
          </div>
        </div>
      </header>
      
      {/* Main Content */}
      <main className="flex-1 flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <h1 className="text-2xl font-bold text-catchup-primary mb-2">Create Your Account</h1>
            <p className="text-catchup-text-secondary">
              Sign up to start managing your business with Catch Up
            </p>
          </div>
          
          <AppCard>
            <form onSubmit={handleSubmit(onSubmit)}>
              <AppCardBody>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="name"
                        type="text"
                        placeholder="John Smith"
                        className="pl-10"
                        {...register("name")}
                      />
                    </div>
                    {errors.name && (
                      <p className="text-sm text-red-500">{errors.name.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="email"
                        type="email"
                        placeholder="you@example.com"
                        className="pl-10"
                        {...register("email")}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-sm text-red-500">{errors.email.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="password">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="password"
                        type={showPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10"
                        {...register("password")}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-sm text-red-500">{errors.password.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="confirmPassword">Confirm Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="confirmPassword"
                        type={showConfirmPassword ? "text" : "password"}
                        placeholder="••••••••"
                        className="pl-10"
                        {...register("confirmPassword")}
                      />
                      <button
                        type="button"
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      >
                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {errors.confirmPassword && (
                      <p className="text-sm text-red-500">{errors.confirmPassword.message}</p>
                    )}
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="acceptTerms" {...register("acceptTerms")} />
                      <Label htmlFor="acceptTerms" className="text-sm cursor-pointer">
                        I agree to the{" "}
                        <Link href="/catch-up/terms">
                          <span className="text-catchup-primary hover:underline">
                            Terms of Service
                          </span>
                        </Link>{" "}
                        and{" "}
                        <Link href="/catch-up/privacy">
                          <span className="text-catchup-primary hover:underline">
                            Privacy Policy
                          </span>
                        </Link>
                      </Label>
                    </div>
                    {errors.acceptTerms && (
                      <p className="text-sm text-red-500">{errors.acceptTerms.message}</p>
                    )}
                  </div>
                </div>
              </AppCardBody>
              
              <AppCardFooter>
                <AppButton
                  type="submit"
                  variant="filled"
                  fullWidth
                  icon={isSubmitting ? undefined : <ArrowRight className="h-4 w-4" />}
                  iconPosition="right"
                  loading={isSubmitting}
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating account..." : "Create Account"}
                </AppButton>
              </AppCardFooter>
            </form>
          </AppCard>
          
          <div className="text-center mt-6">
            <p className="text-catchup-text-secondary">
              Already have an account?{" "}
              <Link href="/catch-up/login">
                <span className="text-catchup-primary font-medium hover:underline">
                  Log in
                </span>
              </Link>
            </p>
          </div>
          
          <div className="mt-8 bg-catchup-primary/5 rounded-lg p-4">
            <h3 className="font-medium text-catchup-primary flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-catchup-primary" />
              Why Choose Catch Up?
            </h3>
            <ul className="mt-2 space-y-2 text-sm text-catchup-text-secondary">
              <li className="flex items-start gap-2">
                <div className="min-w-4 mt-1">•</div>
                <span>Manage appointments, calls, and messages in one place</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="min-w-4 mt-1">•</div>
                <span>No credit card required for free 14-day trial</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="min-w-4 mt-1">•</div>
                <span>Cancel anytime – no contracts or hidden fees</span>
              </li>
            </ul>
          </div>
        </div>
      </main>
      
      {/* Footer */}
      <footer className="py-6 text-center text-catchup-text-secondary text-sm">
        <p>&copy; {new Date().getFullYear()} Catch Up. All rights reserved.</p>
      </footer>
    </div>
  );
}