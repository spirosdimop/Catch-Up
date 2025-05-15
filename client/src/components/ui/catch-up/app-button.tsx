import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface AppButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
  disabled?: boolean;
  variant?: "filled" | "outlined" | "ghost" | "text" | "accent";
  size?: "sm" | "md" | "lg";
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  fullWidth?: boolean;
  type?: "button" | "submit" | "reset";
}

/**
 * AppButton - Consistent button component for Catch Up
 * Provides different variants to match the design system
 */
export function AppButton({
  children,
  className,
  onClick,
  disabled = false,
  variant = "filled",
  size = "md",
  icon,
  iconPosition = "left",
  fullWidth = false,
  type = "button",
}: AppButtonProps) {
  // Generate class based on variant
  const variantClasses = {
    filled: "bg-catchup-primary text-white hover:bg-catchup-primary/90",
    outlined: "border-2 border-catchup-primary text-catchup-primary hover:bg-catchup-primary/10",
    ghost: "text-catchup-primary hover:bg-catchup-primary/10",
    text: "text-catchup-primary hover:underline",
    accent: "bg-catchup-accent text-catchup-primary hover:bg-catchup-accent/90",
  };

  // Generate class based on size
  const sizeClasses = {
    sm: "text-xs px-3 py-1.5 gap-1",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-6 py-3 gap-3",
  };

  return (
    <Button
      type={type}
      className={cn(
        "font-medium rounded-lg transition-colors",
        variantClasses[variant],
        sizeClasses[size],
        fullWidth && "w-full",
        disabled && "opacity-50 cursor-not-allowed",
        className
      )}
      onClick={onClick}
      disabled={disabled}
    >
      {icon && iconPosition === "left" && <span className="inline-block">{icon}</span>}
      {children}
      {icon && iconPosition === "right" && <span className="inline-block">{icon}</span>}
    </Button>
  );
}