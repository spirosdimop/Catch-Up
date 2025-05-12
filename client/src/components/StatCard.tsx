import { LucideIcon } from "lucide-react";
import { ArrowUp, ArrowDown, DollarSign, LayoutDashboard, Clock, CheckSquare } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string;
  color: 'primary' | 'secondary' | 'accent' | 'success';
  icon: string;
  change?: string;
  changeType?: 'increase' | 'decrease' | 'neutral';
  suffix?: React.ReactNode;
}

export default function StatCard({ 
  title, 
  value, 
  color, 
  icon, 
  change, 
  changeType = 'neutral',
  suffix
}: StatCardProps) {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'dollar-sign':
        return <DollarSign className="text-xl" />;
      case 'layout':
        return <LayoutDashboard className="text-xl" />;
      case 'clock':
        return <Clock className="text-xl" />;
      case 'check-square':
        return <CheckSquare className="text-xl" />;
      default:
        return <DollarSign className="text-xl" />;
    }
  };

  const getChangeIcon = () => {
    if (!change) return null;
    
    if (changeType === 'increase') {
      return <ArrowUp className="mr-1 h-3 w-3" />;
    } else if (changeType === 'decrease') {
      return <ArrowDown className="mr-1 h-3 w-3" />;
    }
    
    return null;
  };

  const getChangeColor = () => {
    if (!change) return 'text-gray-600';
    
    if (changeType === 'increase') {
      return 'text-green-600';
    } else if (changeType === 'decrease') {
      return 'text-red-600';
    }
    
    return 'text-blue-600';
  };

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <div className={cn("flex-shrink-0 rounded-md p-3", `bg-${color}-50`)}>
            {getIcon(icon)}
          </div>
          <div className="ml-5 w-0 flex-1">
            <dl>
              <dt className="text-sm font-medium text-gray-500 truncate">{title}</dt>
              <dd>
                <div className="text-lg font-bold text-gray-900">{value}</div>
              </dd>
            </dl>
          </div>
        </div>
      </div>
      <div className="bg-gray-50 px-5 py-3">
        {change ? (
          <div className={cn("text-sm flex items-center", getChangeColor())}>
            {getChangeIcon()}
            <span>{change}</span>
          </div>
        ) : suffix ? (
          <div className="text-sm text-gray-600 flex items-center">
            {suffix}
          </div>
        ) : null}
      </div>
    </div>
  );
}
