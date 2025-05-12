import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SignupFormData } from "@/pages/signup";

// Schema for this step
const formSchema = z.object({
  profession: z.string().min(1, "Profession is required")
});

type FormValues = z.infer<typeof formSchema>;

// List of professions
const professions = [
  "electrician",
  "plumber",
  "tutor",
  "trainer",
  "carpenter",
  "painter",
  "gardener",
  "cleaner",
  "other"
];

interface StepSixProps {
  formData: Partial<SignupFormData>;
  onNext: (data: Partial<SignupFormData>) => void;
  onPrev: () => void;
}

const StepSix = ({ formData, onNext, onPrev }: StepSixProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      profession: formData.profession || ""
    }
  });

  const onSubmit = (data: FormValues) => {
    onNext(data);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold">What's your profession?</h3>
        <p className="text-gray-500 mt-1">Select the service type you provide</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="profession"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-base">Profession</FormLabel>
                <Select
                  defaultValue={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="text-lg h-14">
                      <SelectValue placeholder="Select your profession" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {professions.map((profession) => (
                      <SelectItem 
                        key={profession} 
                        value={profession}
                        className="text-base py-3 capitalize"
                      >
                        {profession.charAt(0).toUpperCase() + profession.slice(1)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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

export default StepSix;