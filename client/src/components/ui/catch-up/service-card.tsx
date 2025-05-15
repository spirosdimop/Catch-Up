import { ReactNode } from "react";
import { Clock, MapPin, DollarSign, Calendar } from "lucide-react";
import { AppCard, AppCardBody, AppCardFooter, AppCardHeader } from "./app-card";
import { AppButton } from "./app-button";

interface ServiceCardProps {
  name: string;
  duration: number; // in minutes
  price: number;
  location?: string;
  description?: string;
  icon?: ReactNode;
  onBook?: () => void;
  onDetails?: () => void;
  className?: string;
}

/**
 * ServiceCard - Displays service offerings with booking options
 */
export function ServiceCard({
  name,
  duration,
  price,
  location,
  description,
  icon,
  onBook,
  onDetails,
  className,
}: ServiceCardProps) {
  // Format duration from minutes to readable format
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    } else {
      const hours = Math.floor(minutes / 60);
      const mins = minutes % 60;
      return mins > 0 ? `${hours} hr ${mins} min` : `${hours} hr`;
    }
  };
  
  // Format price to readable format
  const formatPrice = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <AppCard className={className}>
      <AppCardHeader
        title={name}
        icon={icon || <Calendar className="h-5 w-5" />}
      />
      <AppCardBody>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center text-catchup-text-secondary">
              <Clock className="mr-2 h-4 w-4" />
              <span>{formatDuration(duration)}</span>
            </div>
            
            <div className="flex items-center text-catchup-primary font-semibold">
              <DollarSign className="h-4 w-4" />
              <span>{formatPrice(price)}</span>
            </div>
          </div>
          
          {location && (
            <div className="flex items-center text-catchup-text-secondary">
              <MapPin className="mr-2 h-4 w-4" />
              <span>{location}</span>
            </div>
          )}
          
          {description && (
            <p className="text-sm text-catchup-text-secondary mt-2">
              {description}
            </p>
          )}
        </div>
      </AppCardBody>
      <AppCardFooter>
        <div className="flex gap-2">
          <AppButton
            variant="filled"
            onClick={onBook}
            fullWidth
          >
            Book Now
          </AppButton>
          <AppButton
            variant="ghost"
            onClick={onDetails}
          >
            Details
          </AppButton>
        </div>
      </AppCardFooter>
    </AppCard>
  );
}