import { ReactNode } from "react";
import { Check, X, Edit } from "lucide-react";
import { AppCard, AppCardBody, AppCardFooter, AppCardHeader } from "./app-card";
import { AppButton } from "./app-button";

interface AiSuggestionCardProps {
  title: string;
  message: string;
  onApprove?: () => void;
  onEdit?: () => void;
  onReject?: () => void;
  status?: "pending" | "approved" | "rejected" | "edited";
  icon?: ReactNode;
  className?: string;
}

/**
 * AiSuggestionCard - Displays AI suggestions with approval actions
 */
export function AiSuggestionCard({
  title,
  message,
  onApprove,
  onEdit,
  onReject,
  status = "pending",
  icon,
  className,
}: AiSuggestionCardProps) {
  // Status indicator and text
  const statusConfig = {
    pending: { color: "bg-yellow-100 text-yellow-800", text: "Awaiting action" },
    approved: { color: "bg-green-100 text-green-800", text: "Approved" },
    rejected: { color: "bg-red-100 text-red-800", text: "Rejected" },
    edited: { color: "bg-blue-100 text-blue-800", text: "Edited & Approved" },
  };

  const { color, text } = statusConfig[status];

  return (
    <AppCard className={className}>
      <AppCardHeader
        title={title}
        icon={icon}
        action={
          status !== "pending" && (
            <span
              className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${color}`}
            >
              {text}
            </span>
          )
        }
      />
      <AppCardBody>
        <p className="text-catchup-text-secondary">{message}</p>
      </AppCardBody>
      {status === "pending" && (
        <AppCardFooter>
          <div className="flex gap-2">
            <AppButton
              variant="filled"
              size="sm"
              icon={<Check className="h-4 w-4" />}
              onClick={onApprove}
            >
              Approve
            </AppButton>
            <AppButton
              variant="outlined"
              size="sm"
              icon={<Edit className="h-4 w-4" />}
              onClick={onEdit}
            >
              Edit
            </AppButton>
            <AppButton
              variant="ghost"
              size="sm"
              icon={<X className="h-4 w-4" />}
              onClick={onReject}
            >
              Reject
            </AppButton>
          </div>
        </AppCardFooter>
      )}
    </AppCard>
  );
}