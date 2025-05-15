import { ReactNode } from "react";
import { format } from "date-fns";
import { PhoneCall, PhoneMissed, Clock, User } from "lucide-react";
import { AppCard, AppCardBody, AppCardFooter } from "./app-card";
import { AppButton } from "./app-button";
import { ClientTagBadge, ClientTagType } from "./client-tag-badge";

interface CallLogItemProps {
  clientName: string;
  clientTag?: ClientTagType;
  timestamp: Date;
  duration?: number; // in seconds
  status: "missed" | "received" | "outgoing";
  notes?: string;
  onCallBack?: () => void;
  onSendMessage?: () => void;
  onViewProfile?: () => void;
  className?: string;
}

/**
 * CallLogItem - Displays call history with actions
 */
export function CallLogItem({
  clientName,
  clientTag,
  timestamp,
  duration,
  status,
  notes,
  onCallBack,
  onSendMessage,
  onViewProfile,
  className,
}: CallLogItemProps) {
  // Format the timestamp
  const formatTime = (date: Date) => format(date, "h:mm a");
  const formatDate = (date: Date) => format(date, "MMM d, yyyy");
  
  // Format duration from seconds to readable format
  const formatDuration = (seconds?: number) => {
    if (!seconds) return "--";
    
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, "0")}`;
  };
  
  // Status configuration
  const statusConfig: Record<string, { color: string; icon: ReactNode; text: string }> = {
    missed: { 
      color: "text-red-500",
      icon: <PhoneMissed className="h-5 w-5" />,
      text: "Missed Call"
    },
    received: { 
      color: "text-green-500",
      icon: <PhoneCall className="h-5 w-5" />,
      text: "Received Call"
    },
    outgoing: { 
      color: "text-blue-500",
      icon: <PhoneCall className="h-5 w-5" />,
      text: "Outgoing Call"
    }
  };
  
  const { color, icon, text } = statusConfig[status];

  return (
    <AppCard className={className}>
      <AppCardBody>
        <div className="flex items-start justify-between">
          <div className="flex items-start">
            {/* Call status icon */}
            <div className={`mr-3 p-2 rounded-full bg-opacity-10 ${color.replace('text-', 'bg-')}`}>
              <div className={color}>{icon}</div>
            </div>
            
            {/* Call details */}
            <div>
              <div className="flex items-center">
                <h3 className="text-base font-medium text-catchup-primary">{clientName}</h3>
                {clientTag && (
                  <ClientTagBadge type={clientTag} className="ml-2" />
                )}
              </div>
              
              <div className="flex items-center mt-1 text-sm text-catchup-text-secondary">
                <span className={`mr-2 font-medium ${color}`}>{text}</span>
                <span className="mx-1">•</span>
                <span>{formatDate(timestamp)} at {formatTime(timestamp)}</span>
              </div>
              
              {(duration !== undefined || notes) && (
                <div className="mt-2">
                  {duration !== undefined && (
                    <div className="flex items-center text-xs text-catchup-text-secondary">
                      <Clock className="mr-1 h-3 w-3" />
                      <span>Duration: {formatDuration(duration)}</span>
                    </div>
                  )}
                  
                  {notes && (
                    <p className="mt-2 text-sm text-catchup-text-secondary border-l-2 border-catchup-border pl-2">
                      {notes}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </AppCardBody>
      <AppCardFooter>
        <div className="flex gap-2">
          <AppButton
            variant="filled"
            size="sm"
            onClick={onCallBack}
          >
            Call Back
          </AppButton>
          <AppButton
            variant="outlined"
            size="sm"
            onClick={onSendMessage}
          >
            Send Message
          </AppButton>
          <div className="flex-grow"></div>
          <AppButton
            variant="ghost"
            size="sm"
            icon={<User className="h-4 w-4" />}
            onClick={onViewProfile}
          >
            Profile
          </AppButton>
        </div>
      </AppCardFooter>
    </AppCard>
  );
}