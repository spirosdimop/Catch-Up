import { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "@/lib/utils";

interface AppButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: "filled" | "outlined" | "text" | "accent";
  size?: "sm" | "md" | "lg";
  fullWidth?: boolean;
  icon?: ReactNode;
  iconPosition?: "left" | "right";
  loading?: boolean;
}

/**
 * AppButton - Custom button component for Catch Up app
 */
export function AppButton({
  children,
  variant = "filled",
  size = "md",
  fullWidth = false,
  icon,
  iconPosition = "left",
  loading = false,
  className,
  disabled,
  type = "button",
  ...props
}: AppButtonProps) {
  
  // Base styles
  const baseStyles = "inline-flex items-center justify-center rounded-full font-medium transition-colors";
  
  // Get variant styles
  const variantStyles = {
    filled: "bg-catchup-primary text-white hover:bg-catchup-primary/90 focus:ring-2 focus:ring-offset-2 focus:ring-catchup-primary/40",
    outlined: "bg-transparent border-2 border-catchup-primary text-catchup-primary hover:bg-catchup-primary/10",
    text: "bg-transparent text-catchup-primary hover:bg-catchup-primary/10",
    accent: "bg-catchup-accent text-catchup-primary hover:bg-catchup-accent/90 focus:ring-2 focus:ring-offset-2 focus:ring-catchup-accent/40"
  };
  
  // Get size styles
  const sizeStyles = {
    sm: "text-xs px-3 py-1.5 gap-1.5",
    md: "text-sm px-4 py-2 gap-2",
    lg: "text-base px-5 py-2.5 gap-2"
  };
  
  // Disabled state
  const disabledStyles = (disabled || loading) 
    ? "opacity-60 cursor-not-allowed pointer-events-none" 
    : "";
  
  // Full width
  const widthStyles = fullWidth ? "w-full" : "";
  
  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        widthStyles,
        disabledStyles,
        className
      )}
      {...props}
    >
      {loading ? (
        <>
          <span className="animate-spin mr-2 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
          <span>Loading...</span>
        </>
      ) : (
        <>
          {icon && iconPosition === "left" && (
            <span className="inline-flex">{icon}</span>
          )}
          <span>{children}</span>
          {icon && iconPosition === "right" && (
            <span className="inline-flex">{icon}</span>
          )}
        </>
      )}
    </button>
  );
}