import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Star, Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { AppButton } from "@/components/ui/catch-up/app-button";
import { AppCard, AppCardBody, AppCardFooter } from "@/components/ui/catch-up/app-card";

// Define the login form schema
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
  rememberMe: z.boolean().optional(),
});

type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Catch Up Login Page
 */
export function CatchUpLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [, navigate] = useLocation();
  
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
      rememberMe: false,
    },
  });
  
  const onSubmit = async (data: LoginFormValues) => {
    // In a real app, we would authenticate against an API
    console.log("Login data:", data);
    
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
            <h1 className="text-2xl font-bold text-catchup-primary mb-2">Welcome Back</h1>
            <p className="text-catchup-text-secondary">
              Sign in to your Catch Up account
            </p>
          </div>
          
          <AppCard>
            <form onSubmit={handleSubmit(onSubmit)}>
              <AppCardBody>
                <div className="space-y-4">
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
                  
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Checkbox id="rememberMe" {...register("rememberMe")} />
                      <Label htmlFor="rememberMe" className="text-sm cursor-pointer">
                        Remember me
                      </Label>
                    </div>
                    
                    <Link href="/catch-up/forgot-password">
                      <span className="text-sm text-catchup-primary hover:underline">
                        Forgot password?
                      </span>
                    </Link>
                  </div>
                </div>
              </AppCardBody>
              
              <AppCardFooter>
                <AppButton
                  type="submit"
                  variant="filled"
                  fullWidth
                  icon={<ArrowRight className="h-4 w-4" />}
                  iconPosition="right"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Signing in..." : "Sign In"}
                </AppButton>
              </AppCardFooter>
            </form>
          </AppCard>
          
          <div className="text-center mt-6">
            <p className="text-catchup-text-secondary">
              Don't have an account?{" "}
              <Link href="/catch-up/signup">
                <span className="text-catchup-primary font-medium hover:underline">
                  Sign up
                </span>
              </Link>
            </p>
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