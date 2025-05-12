import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SignupFormData } from "@/pages/signup";

// Schema for this step
const formSchema = z.object({
  countryCode: z.string().min(1, "Country code is required"),
  phoneNumber: z.string().min(5, "Phone number is required")
});

type FormValues = z.infer<typeof formSchema>;

interface StepFourProps {
  formData: Partial<SignupFormData>;
  onNext: (data: Partial<SignupFormData>) => void;
  onPrev: () => void;
}

// Country codes
const countryCodes = [
  { code: "+1", country: "US/Canada" },
  { code: "+44", country: "UK" },
  { code: "+33", country: "France" },
  { code: "+49", country: "Germany" },
  { code: "+61", country: "Australia" },
  { code: "+39", country: "Italy" },
  { code: "+34", country: "Spain" },
  { code: "+81", country: "Japan" },
  { code: "+86", country: "China" },
  { code: "+91", country: "India" },
  { code: "+52", country: "Mexico" },
  { code: "+55", country: "Brazil" },
  { code: "+31", country: "Netherlands" },
  { code: "+32", country: "Belgium" },
  { code: "+41", country: "Switzerland" },
  { code: "+46", country: "Sweden" },
  { code: "+47", country: "Norway" },
  { code: "+45", country: "Denmark" },
  { code: "+358", country: "Finland" },
  { code: "+7", country: "Russia" },
];

const StepFour = ({ formData, onNext, onPrev }: StepFourProps) => {
  // Extract country code and number from formData phone if it exists
  let defaultCountryCode = "+1";
  let defaultPhoneNumber = "";
  
  if (formData.phone) {
    // Try to match the pattern +XX XXXXXXXXXX
    const match = formData.phone.match(/^(\+\d+)\s+(.+)$/);
    if (match) {
      defaultCountryCode = match[1];
      defaultPhoneNumber = match[2];
    } else {
      defaultPhoneNumber = formData.phone;
    }
  }
  
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      countryCode: defaultCountryCode,
      phoneNumber: defaultPhoneNumber
    }
  });

  const onSubmit = (data: FormValues) => {
    // Combine country code and phone number
    const phone = `${data.countryCode} ${data.phoneNumber}`;
    onNext({ phone });
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold">What's your phone number?</h3>
        <p className="text-gray-500 mt-1">We'll use this to contact you if needed</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-3 gap-2">
            <FormField
              control={form.control}
              name="countryCode"
              render={({ field }) => (
                <FormItem className="col-span-1">
                  <FormLabel className="text-base">Country</FormLabel>
                  <Select
                    defaultValue={field.value}
                    onValueChange={field.onChange}
                  >
                    <FormControl>
                      <SelectTrigger className="text-lg h-14">
                        <SelectValue placeholder="Select country code" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent className="max-h-80">
                      {countryCodes.map((country) => (
                        <SelectItem key={country.code} value={country.code}>
                          {country.code} {country.country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem className="col-span-2">
                  <FormLabel className="text-base">Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="tel"
                      placeholder="Enter your phone number"
                      className="text-lg p-6 h-14"
                      {...field}
                      autoFocus
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

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

export default StepFour;