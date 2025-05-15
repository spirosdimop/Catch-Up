import { cn } from "@/lib/utils";
import { ReactNode } from "react";

export type ClientTagType = "loyal" | "one-time" | "new" | "returning" | "vip";

interface ClientTagBadgeProps {
  type: ClientTagType;
  className?: string;
  showIcon?: boolean;
}

/**
 * ClientTagBadge - Displays client loyalty/status with icons
 */
export function ClientTagBadge({ type, className, showIcon = true }: ClientTagBadgeProps) {
  // Configure badge based on type
  const config: Record<
    ClientTagType,
    { icon: string; label: string; className: string }
  > = {
    loyal: {
      icon: "💎",
      label: "Loyal",
      className: "bg-blue-100 text-blue-800",
    },
    "one-time": {
      icon: "🕐",
      label: "One-Time",
      className: "bg-gray-100 text-gray-800",
    },
    new: {
      icon: "✨",
      label: "New",
      className: "bg-green-100 text-green-800",
    },
    returning: {
      icon: "🔄",
      label: "Returning",
      className: "bg-purple-100 text-purple-800",
    },
    vip: {
      icon: "⭐",
      label: "VIP",
      className: "bg-yellow-100 text-yellow-800",
    },
  };

  const { icon, label, className: badgeClassName } = config[type];

  return (
    <span
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium",
        badgeClassName,
        className
      )}
    >
      {showIcon && <span className="mr-1">{icon}</span>}
      {label}
    </span>
  );
}