import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SignupFormData } from "@/pages/signup";

// Schema for this step
const formSchema = z.object({
  lastName: z.string().min(1, "Last name is required")
});

type FormValues = z.infer<typeof formSchema>;

interface StepTwoProps {
  formData: Partial<SignupFormData>;
  onNext: (data: Partial<SignupFormData>) => void;
  onPrev: () => void;
}

const StepTwo = ({ formData, onNext, onPrev }: StepTwoProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      lastName: formData.lastName || ""
    }
  });

  const onSubmit = (data: FormValues) => {
    onNext(data);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold">What's your surname?</h3>
        <p className="text-gray-500 mt-1">Please enter your last name</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Last Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter your last name"
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

export default StepTwo;