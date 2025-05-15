import { ReactNode } from "react";
import { Clock, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import { AppCard, AppCardBody, AppCardFooter } from "./app-card";
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
  // Format price
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(price);
  };
  
  // Format duration 
  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    
    if (remainingMinutes === 0) {
      return `${hours} hr`;
    }
    
    return `${hours} hr ${remainingMinutes} min`;
  };
  
  return (
    <AppCard className={cn(className)}>
      <AppCardBody>
        <div className="flex items-start gap-3">
          {icon && (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-catchup-primary/10">
              <div className="text-catchup-primary">{icon}</div>
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-catchup-primary">{name}</h3>
                <div className="flex items-center gap-1 text-xs text-catchup-text-secondary mt-1">
                  <Clock className="h-3 w-3" />
                  <span>{formatDuration(duration)}</span>
                </div>
                
                {location && (
                  <div className="flex items-center gap-1 text-xs text-catchup-text-secondary mt-1">
                    <MapPin className="h-3 w-3" />
                    <span>{location}</span>
                  </div>
                )}
              </div>
              
              <div className="text-lg font-semibold text-catchup-primary">
                {formatPrice(price)}
              </div>
            </div>
            
            {description && (
              <p className="mt-3 text-sm text-catchup-text-secondary">{description}</p>
            )}
          </div>
        </div>
      </AppCardBody>
      
      <AppCardFooter className="flex items-center justify-between">
        {onDetails && (
          <AppButton 
            variant="text" 
            size="sm"
            onClick={onDetails}
          >
            View Details
          </AppButton>
        )}
        
        {onBook && (
          <AppButton
            variant="filled"
            size="sm"
            onClick={onBook}
          >
            Book Now
          </AppButton>
        )}
      </AppCardFooter>
    </AppCard>
  );
}