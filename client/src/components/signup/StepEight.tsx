import { useState } from "react";
import { z } from "zod";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { SignupFormData } from "@/pages/signup";
import { Plus, Trash2, DollarSign, Clock } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

// Schema for this step
const serviceSchema = z.object({
  name: z.string().min(1, "Service name is required"),
  duration: z.coerce.number().min(1, "Duration must be at least 1 minute"),
  price: z.coerce.number().min(0, "Price must be at least 0")
});

const formSchema = z.object({
  services: z.array(serviceSchema).min(1, "At least one service is required"),
});

type FormValues = z.infer<typeof formSchema>;

interface StepEightProps {
  formData: Partial<SignupFormData>;
  onNext: (data: Partial<SignupFormData>) => void;
  onPrev: () => void;
}

const StepEight = ({ formData, onNext, onPrev }: StepEightProps) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      services: formData.services || [{ name: "", duration: 30, price: 0 }],
    },
  });

  const { fields, append, remove } = useFieldArray({
    name: "services",
    control: form.control,
  });

  const onSubmit = (data: FormValues) => {
    onNext(data);
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold">What services do you offer?</h3>
        <p className="text-gray-500 mt-1">Add the services you provide with pricing</p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-4">
            {fields.map((field, index) => (
              <Card key={field.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="font-semibold text-base">Service #{index + 1}</h4>
                    {fields.length > 1 && (
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => remove(index)}
                        className="h-8 px-2 text-destructive"
                      >
                        <Trash2 className="h-4 w-4 mr-1" />
                        Remove
                      </Button>
                    )}
                  </div>

                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name={`services.${index}.name`}
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="text-base">Service Name</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Haircut, Plumbing Repair"
                              className="text-base p-4 h-12"
                              {...field}
                              autoFocus={index === 0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name={`services.${index}.duration`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">
                              <div className="flex items-center">
                                <Clock className="h-4 w-4 mr-1" />
                                Duration (minutes)
                              </div>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="1"
                                placeholder="e.g., 30, 60, 120"
                                className="text-base p-4 h-12"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name={`services.${index}.price`}
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel className="text-base">
                              <div className="flex items-center">
                                <DollarSign className="h-4 w-4 mr-1" />
                                Price (EUR)
                              </div>
                            </FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="e.g., 50, 99.99"
                                className="text-base p-4 h-12"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Button
              type="button"
              variant="outline"
              onClick={() => append({ name: "", duration: 30, price: 0 })}
              className="w-full h-12 border-dashed"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Another Service
            </Button>
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

export default StepEight;