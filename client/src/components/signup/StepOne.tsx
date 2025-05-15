import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SignupFormData } from "@/pages/signup";
import { Mail, Lock, User } from "lucide-react";

// Schema for this step with combined fields
const formSchema = z.object({
  firstName: z.string().min(2, "First name must be at least 2 characters"),
  lastName: z.string().min(2, "Last name must be at least 2 characters"),
  email: z.string().min(1, "Email is required").email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
});

type FormValues = z.infer<typeof formSchema>;

interface StepOneProps {
  formData: Partial<SignupFormData>;
  onNext: (data: Partial<SignupFormData>) => void;
}

const StepOne = ({ formData, onNext }: StepOneProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: formData.firstName || "",
      lastName: formData.lastName || "",
      email: formData.email || "",
      password: formData.password || ""
    },
    mode: "onChange"
  });

  const onSubmit = (data: FormValues) => {
    onNext(data);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold text-catchup-primary">Create your account</h3>
        <p className="text-gray-600 mt-1">Enter your details to get started</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="firstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base flex items-center text-gray-700">
                    <User className="h-4 w-4 mr-1 text-catchup-primary" />
                    First Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your first name"
                      className="text-base p-4 h-12 rounded-lg border-gray-300 focus:border-catchup-primary focus:ring-catchup-primary/20"
                      {...field}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="lastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base flex items-center text-gray-700">
                    <User className="h-4 w-4 mr-1 text-catchup-primary opacity-0" />
                    Last Name
                  </FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your last name"
                      className="text-base p-4 h-12 rounded-lg border-gray-300 focus:border-catchup-primary focus:ring-catchup-primary/20"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base flex items-center text-gray-700">
                  <Mail className="h-4 w-4 mr-1 text-catchup-primary" />
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="yourname@example.com"
                    className="text-base p-4 h-12 rounded-lg border-gray-300 focus:border-catchup-primary focus:ring-catchup-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base flex items-center text-gray-700">
                  <Lock className="h-4 w-4 mr-1 text-catchup-primary" />
                  Password
                </FormLabel>
                <FormControl>
                  <Input
                    type="password"
                    placeholder="Create a secure password"
                    className="text-base p-4 h-12 rounded-lg border-gray-300 focus:border-catchup-primary focus:ring-catchup-primary/20"
                    {...field}
                  />
                </FormControl>
                <FormMessage className="text-red-500" />
                <p className="text-xs text-gray-500 mt-1">
                  Password must contain at least 8 characters, including uppercase, lowercase, and a number
                </p>
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full p-5 h-12 text-base font-medium mt-6 bg-catchup-primary hover:bg-catchup-primary/90 text-white rounded-lg transition-all"
            disabled={!form.formState.isValid}
          >
            Continue
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default StepOne;