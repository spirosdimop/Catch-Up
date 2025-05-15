import { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppCardProps {
  children: ReactNode;
  className?: string;
}

interface AppCardHeaderProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  action?: ReactNode;
  className?: string;
}

interface AppCardBodyProps {
  children: ReactNode;
  className?: string;
}

interface AppCardFooterProps {
  children: ReactNode;
  className?: string;
}

/**
 * AppCard - Main card component for Catch Up app
 * Can be used with AppCardHeader, AppCardBody, and AppCardFooter
 */
export function AppCard({ children, className }: AppCardProps) {
  return (
    <div 
      className={cn(
        "bg-white rounded-[20px] shadow-sm border border-gray-100 overflow-hidden",
        className
      )}
    >
      {children}
    </div>
  );
}

/**
 * AppCardHeader - Header section for AppCard
 */
export function AppCardHeader({ 
  title, 
  subtitle, 
  icon, 
  action,
  className 
}: AppCardHeaderProps) {
  return (
    <div className={cn("px-6 pt-6 pb-4 flex items-center justify-between", className)}>
      <div className="flex items-center gap-3">
        {icon && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-catchup-primary/10">
            <div className="text-catchup-primary">{icon}</div>
          </div>
        )}
        
        <div>
          <h3 className="text-lg font-semibold text-catchup-primary">{title}</h3>
          {subtitle && <p className="text-sm text-catchup-text-secondary">{subtitle}</p>}
        </div>
      </div>
      
      {action && <div>{action}</div>}
    </div>
  );
}

/**
 * AppCardBody - Main content area for AppCard
 */
export function AppCardBody({ children, className }: AppCardBodyProps) {
  return (
    <div className={cn("px-6 py-4", className)}>
      {children}
    </div>
  );
}

/**
 * AppCardFooter - Footer section for AppCard
 */
export function AppCardFooter({ children, className }: AppCardFooterProps) {
  return (
    <div className={cn("px-6 py-4 border-t border-gray-100", className)}>
      {children}
    </div>
  );
}