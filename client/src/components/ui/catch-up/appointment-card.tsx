import { ReactNode } from "react";
import { Clock, MapPin, Calendar as CalendarIcon, User } from "lucide-react";
import { format } from "date-fns";
import { AppCard, AppCardBody, AppCardFooter, AppCardHeader } from "./app-card";
import { AppButton } from "./app-button";
import { ClientTagBadge, ClientTagType } from "./client-tag-badge";

interface AppointmentCardProps {
  title: string;
  clientName: string;
  clientTag?: ClientTagType;
  startTime: Date;
  endTime: Date;
  location?: string;
  description?: string;
  onReschedule?: () => void;
  onCancel?: () => void;
  onDetails?: () => void;
  status?: "upcoming" | "completed" | "cancelled" | "missed";
  className?: string;
}

/**
 * AppointmentCard - Displays appointment details with actions
 */
export function AppointmentCard({
  title,
  clientName,
  clientTag,
  startTime,
  endTime,
  location,
  description,
  onReschedule,
  onCancel,
  onDetails,
  status = "upcoming",
  className,
}: AppointmentCardProps) {
  // Format the time strings
  const formatTime = (date: Date) => format(date, "h:mm a");
  const formatDate = (date: Date) => format(date, "EEE, MMM d");
  
  // Status configuration
  const statusConfig: Record<string, { color: string; text: string }> = {
    upcoming: { color: "bg-blue-100 text-blue-800", text: "Upcoming" },
    completed: { color: "bg-green-100 text-green-800", text: "Completed" },
    cancelled: { color: "bg-red-100 text-red-800", text: "Cancelled" },
    missed: { color: "bg-orange-100 text-orange-800", text: "Missed" },
  };
  
  const { color, text } = statusConfig[status];

  return (
    <AppCard className={className}>
      <AppCardHeader
        title={title}
        subtitle={clientName}
        icon={<CalendarIcon className="h-5 w-5" />}
        action={
          <>
            {clientTag && <ClientTagBadge type={clientTag} className="mr-2" />}
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}
            >
              {text}
            </span>
          </>
        }
      />
      <AppCardBody>
        <div className="space-y-3">
          <div className="flex items-center text-catchup-text-secondary">
            <Clock className="mr-2 h-4 w-4" />
            <span>
              {formatDate(startTime)} · {formatTime(startTime)} - {formatTime(endTime)}
            </span>
          </div>
          
          {location && (
            <div className="flex items-center text-catchup-text-secondary">
              <MapPin className="mr-2 h-4 w-4" />
              <span>{location}</span>
            </div>
          )}
          
          {description && (
            <p className="pt-2 text-sm text-catchup-text-secondary">
              {description}
            </p>
          )}
        </div>
      </AppCardBody>
      {status === "upcoming" && (
        <AppCardFooter>
          <div className="flex gap-2">
            <AppButton
              variant="outlined"
              size="sm"
              onClick={onReschedule}
            >
              Reschedule
            </AppButton>
            <AppButton
              variant="ghost"
              size="sm"
              onClick={onCancel}
            >
              Cancel
            </AppButton>
            <div className="flex-grow"></div>
            <AppButton
              variant="filled"
              size="sm"
              onClick={onDetails}
            >
              Details
            </AppButton>
          </div>
        </AppCardFooter>
      )}
      {status !== "upcoming" && (
        <AppCardFooter>
          <AppButton
            variant="ghost"
            size="sm"
            onClick={onDetails}
          >
            View Details
          </AppButton>
        </AppCardFooter>
      )}
    </AppCard>
  );
}