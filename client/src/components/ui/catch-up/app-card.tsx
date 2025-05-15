import { ReactNode } from "react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface AppCardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  hoverable?: boolean;
}

/**
 * AppCard - A white, rounded, shadowed content wrapper
 * Consistent card component for all Catch Up UI elements
 */
export function AppCard({ children, className, onClick, hoverable = false }: AppCardProps) {
  return (
    <Card
      className={cn(
        "rounded-xl border border-catchup-border bg-white p-4 shadow-sm",
        hoverable && "transition-transform hover:-translate-y-1 hover:shadow-md",
        onClick && "cursor-pointer",
        className
      )}
      onClick={onClick}
    >
      {children}
    </Card>
  );
}

interface AppCardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

/**
 * AppCardHeader - Consistent header for AppCard components
 */
export function AppCardHeader({ title, subtitle, icon, action, className }: AppCardHeaderProps) {
  return (
    <div className={cn("mb-4 flex items-center justify-between", className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-catchup-primary/10 text-catchup-primary">
            {icon}
          </div>
        )}
        <div>
          <h3 className="text-base font-semibold text-catchup-primary">{title}</h3>
          {subtitle && <p className="text-sm text-catchup-text-secondary">{subtitle}</p>}
        </div>
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

interface AppCardBodyProps {
  children: ReactNode;
  className?: string;
}

/**
 * AppCardBody - Consistent body for AppCard components
 */
export function AppCardBody({ children, className }: AppCardBodyProps) {
  return <div className={cn("", className)}>{children}</div>;
}

interface AppCardFooterProps {
  children: ReactNode;
  className?: string;
}

/**
 * AppCardFooter - Consistent footer for AppCard components
 */
export function AppCardFooter({ children, className }: AppCardFooterProps) {
  return (
    <div className={cn("mt-4 flex items-center justify-between", className)}>
      {children}
    </div>
  );
}