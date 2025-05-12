import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { ArrowUp, ArrowDown } from "lucide-react";

type StatCardProps = {
  title: string;
  value: string;
  icon: React.ReactNode;
  iconColor: string;
  iconBgColor: string;
  changeValue?: string;
  changeType?: "increase" | "decrease" | "neutral";
  footerContent?: React.ReactNode;
};

export function StatCard({
  title,
  value,
  icon,
  iconColor,
  iconBgColor,
  changeValue,
  changeType,
  footerContent,
}: StatCardProps) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", iconBgColor)}>
            <div className={cn("text-xl", iconColor)}>{icon}</div>
          </div>
          <div className="ml-5 w-0 flex-1">
            <div className="text-sm font-medium text-gray-500 truncate">{title}</div>
            <div className="text-lg font-bold text-gray-900">{value}</div>
          </div>
        </div>
      </CardContent>
      {(changeValue || footerContent) && (
        <CardFooter className="bg-gray-50 px-5 py-3">
          {changeValue && changeType && (
            <div className={cn(
              "text-sm flex items-center",
              changeType === "increase" && "text-green-600",
              changeType === "decrease" && "text-red-600",
              changeType === "neutral" && "text-blue-600"
            )}>
              {changeType === "increase" && <ArrowUp className="h-4 w-4 mr-1" />}
              {changeType === "decrease" && <ArrowDown className="h-4 w-4 mr-1" />}
              <span>{changeValue}</span>
            </div>
          )}
          {footerContent && (
            <div className="text-sm text-gray-600">
              {footerContent}
            </div>
          )}
        </CardFooter>
      )}
    </Card>
  );
}

export default StatCard;
