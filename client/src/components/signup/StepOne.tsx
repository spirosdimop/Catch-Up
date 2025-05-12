import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SignupFormData } from "@/pages/signup";

// Schema for this step
const formSchema = z.object({
  firstName: z.string().min(1, "First name is required")
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
      firstName: formData.firstName || ""
    }
  });

  const onSubmit = (data: FormValues) => {
    onNext(data);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold">What's your name?</h3>
        <p className="text-gray-500 mt-1">Let's start with your first name</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">First Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your first name"
                    className="text-lg p-6 h-14"
                    {...field}
                    autoFocus
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button 
            type="submit" 
            className="w-full p-6 h-14 text-lg font-medium"
            disabled={!form.formState.isValid}
          >
            Next
          </Button>
        </form>
      </Form>
    </div>
  );
};

export default StepOne;