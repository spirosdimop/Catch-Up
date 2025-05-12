import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SignupFormData } from "@/pages/signup";
import { Store, Car, Building2 } from "lucide-react";

// Schema for this step
const formSchema = z.object({
  locationType: z.enum(["has_shop", "goes_to_clients", "both"], {
    required_error: "Please select a location type",
  })
});

type FormValues = z.infer<typeof formSchema>;

interface StepSevenProps {
  formData: Partial<SignupFormData>;
  onNext: (data: Partial<SignupFormData>) => void;
  onPrev: () => void;
}

const locationOptions = [
  {
    value: "has_shop",
    label: "I have a shop",
    description: "Clients come to my location",
    icon: <Store className="h-6 w-6" />,
  },
  {
    value: "goes_to_clients",
    label: "I go to clients",
    description: "I provide services at client locations",
    icon: <Car className="h-6 w-6" />,
  },
  {
    value: "both",
    label: "Both",
    description: "I work at my shop and visit clients",
    icon: <Building2 className="h-6 w-6" />,
  },
];

const StepSeven = ({ formData, onNext, onPrev }: StepSevenProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      locationType: formData.locationType || undefined,
    }
  });

  const onSubmit = (data: FormValues) => {
    onNext(data);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold">Where do you provide your services?</h3>
        <p className="text-gray-500 mt-1">Select your service location option</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="locationType"
            render={({ field }) => (
              <FormItem className="space-y-4">
                <FormControl>
                  <RadioGroup
                    onValueChange={field.onChange}
                    value={field.value}
                    className="flex flex-col space-y-3"
                  >
                    {locationOptions.map((option) => (
                      <label
                        key={option.value}
                        className={`flex items-center space-x-4 p-4 border rounded-lg cursor-pointer transition-all hover:border-primary ${
                          field.value === option.value ? "border-primary bg-primary/5" : "border-border"
                        }`}
                      >
                        <RadioGroupItem value={option.value} id={option.value} className="sr-only" />
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 text-primary">
                          {option.icon}
                        </div>
                        <div className="flex-1">
                          <p className="text-base font-medium">{option.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {option.description}
                          </p>
                        </div>
                      </label>
                    ))}
                  </RadioGroup>
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
              disabled={!form.formState.isDirty}
            >
              Next
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
};

export default StepSeven;