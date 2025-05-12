import { ReactNode } from "react";

interface PageTitleProps {
  title: string;
  description?: string;
  icon?: ReactNode;
}

export function PageTitle({ title, description, icon }: PageTitleProps) {
  return (
    <div className="flex items-center gap-3">
      {icon && (
        <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10">
          {icon}
        </div>
      )}
      <div>
        <h1 className="text-2xl font-bold tracking-tight">{title}</h1>
        {description && (
          <p className="text-muted-foreground">{description}</p>
        )}
      </div>
    </div>
  );
}