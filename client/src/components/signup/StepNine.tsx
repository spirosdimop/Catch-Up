import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { SignupFormData } from "@/pages/signup";
import { Check, DollarSign, Clock, Edit, Loader2 } from "lucide-react";
// Import the location type values
const LocationType = {
  HAS_SHOP: "has_shop",
  GOES_TO_CLIENTS: "goes_to_clients",
  BOTH: "both"
};

interface StepNineProps {
  formData: Partial<SignupFormData>;
  onSubmit: () => void;
  onPrev: () => void;
  isSubmitting: boolean;
}

// Helper function to format location type for display
const formatLocationType = (type: string): string => {
  switch (type) {
    case "has_shop":
      return "I have a shop";
    case "goes_to_clients":
      return "I go to clients";
    case "both":
      return "Both (shop and client visits)";
    default:
      return type;
  }
};

// Helper function to capitalize first letter
const capitalize = (str: string): string => {
  return str.charAt(0).toUpperCase() + str.slice(1);
};

const StepNine = ({ formData, onSubmit, onPrev, isSubmitting }: StepNineProps) => {
  return (
    <div className="space-y-6">
      <div className="text-center">
        <h3 className="text-xl font-bold">Review Your Information</h3>
        <p className="text-gray-500 mt-1">Please confirm all details are correct before submitting</p>
      </div>

      <div className="space-y-4">
        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <h4 className="font-medium text-primary mb-2 flex items-center">
                  <Check className="h-4 w-4 mr-1" /> Personal Information
                </h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-muted-foreground">Name</dt>
                    <dd className="font-medium">{formData.firstName} {formData.lastName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Email</dt>
                    <dd className="font-medium">{formData.email}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Phone</dt>
                    <dd className="font-medium">{formData.phone}</dd>
                  </div>
                </dl>
              </div>

              <div>
                <h4 className="font-medium text-primary mb-2 flex items-center">
                  <Check className="h-4 w-4 mr-1" /> Business Details
                </h4>
                <dl className="space-y-2">
                  <div>
                    <dt className="text-sm text-muted-foreground">Business Name</dt>
                    <dd className="font-medium">{formData.businessName}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Profession</dt>
                    <dd className="font-medium">{formData.profession && capitalize(formData.profession)}</dd>
                  </div>
                  <div>
                    <dt className="text-sm text-muted-foreground">Service Location</dt>
                    <dd className="font-medium">{formData.locationType && formatLocationType(formData.locationType)}</dd>
                  </div>
                </dl>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <h4 className="font-medium text-primary mb-4 flex items-center">
              <Check className="h-4 w-4 mr-1" /> Your Services
            </h4>

            <div className="space-y-4">
              {formData.services && formData.services.map((service, index) => (
                <div 
                  key={index}
                  className="p-4 border rounded-lg flex flex-col md:flex-row gap-4 justify-between"
                >
                  <div className="flex-1">
                    <h5 className="font-medium">{service.name}</h5>
                  </div>
                  <div className="flex gap-4">
                    <div className="flex items-center text-muted-foreground">
                      <Clock className="h-4 w-4 mr-1" />
                      <span>{service.duration} min</span>
                    </div>
                    <div className="flex items-center font-medium">
                      <DollarSign className="h-4 w-4 mr-1" />
                      <span>{service.price.toFixed(2)} EUR</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-3">
        <Button 
          type="button" 
          variant="outline"
          className="flex-1 p-6 h-14 text-lg font-medium"
          onClick={onPrev}
          disabled={isSubmitting}
        >
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button 
          type="button" 
          className="flex-1 p-6 h-14 text-lg font-medium"
          onClick={onSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Submitting...
            </>
          ) : (
            'Complete Signup'
          )}
        </Button>
      </div>
    </div>
  );
};

export default StepNine;