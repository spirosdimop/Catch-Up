import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";
import { ArrowDownIcon, ArrowUpIcon, MinusIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string;
  icon: ReactNode;
  iconColor?: string;
  iconBgColor?: string;
  changeValue?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  footerContent?: ReactNode;
}

export default function StatCard({
  title,
  value,
  icon,
  iconColor = "text-primary",
  iconBgColor = "bg-primary/10",
  changeValue,
  changeType = 'neutral',
  footerContent
}: StatCardProps) {
  const getChangeIcon = () => {
    switch (changeType) {
      case 'increase':
        return <ArrowUpIcon className="h-3 w-3 text-green-500" />;
      case 'decrease':
        return <ArrowDownIcon className="h-3 w-3 text-red-500" />;
      default:
        return <MinusIcon className="h-3 w-3 text-gray-500" />;
    }
  };

  const getChangeColor = () => {
    switch (changeType) {
      case 'increase':
        return 'text-green-500';
      case 'decrease':
        return 'text-red-500';
      default:
        return 'text-gray-500';
    }
  };

  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-500">{title}</h3>
          <div className={`p-2 rounded-lg ${iconBgColor}`}>
            <div className={`h-5 w-5 ${iconColor}`}>
              {icon}
            </div>
          </div>
        </div>
        <div className="text-2xl font-bold mb-2">{value}</div>
        {changeValue && (
          <div className="flex items-center text-xs">
            {getChangeIcon()}
            <span className={`ml-1 ${getChangeColor()}`}>{changeValue}</span>
          </div>
        )}
        {footerContent && <div className="mt-2">{footerContent}</div>}
      </CardContent>
    </Card>
  );
}