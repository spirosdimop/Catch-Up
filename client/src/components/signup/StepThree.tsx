import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SignupFormData } from "@/pages/signup";
import { Mail } from "lucide-react";

// Schema for this step with email validation
const formSchema = z.object({
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address")
});

type FormValues = z.infer<typeof formSchema>;

interface StepThreeProps {
  formData: Partial<SignupFormData>;
  onNext: (data: Partial<SignupFormData>) => void;
  onPrev: () => void;
}

const StepThree = ({ formData, onNext, onPrev }: StepThreeProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: formData.email || ""
    }
  });

  const onSubmit = (data: FormValues) => {
    onNext(data);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold">What's your email address?</h3>
        <p className="text-gray-500 mt-1">We'll use this for account access and communication</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base flex items-center">
                  <Mail className="h-4 w-4 mr-1" />
                  Email Address
                </FormLabel>
                <FormControl>
                  <Input
                    type="email"
                    placeholder="yourname@example.com"
                    className="text-lg p-6 h-14"
                    {...field}
                    autoFocus
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex gap-3">
            <Button 
              type="button" 
              variant="outline"
              className="flex-1 p-6 h-14 text-lg font-medium"
              onClick={onPrev}
            >
              Back
            </Button>
            <Button 
              type="submit" 
              className="flex-1 p-6 h-14 text-lg font-medium"
              disabled={!form.formState.isValid}
            >
              Next
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default StepThree;