import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/stats-card";
import ActiveProjectsCard from "@/components/dashboard/active-projects-card";
import TimeTrackingCard from "@/components/dashboard/time-tracking-card";
import TasksOverviewCard from "@/components/dashboard/tasks-overview-card";
import InvoicesSummaryCard from "@/components/dashboard/invoices-summary-card";
import { FileText, LayoutPanelLeft, Clock, CheckSquare, Download, Plus } from "lucide-react";

type DashboardStats = {
  activeProjects: number;
  monthlyEarnings: number;
  hoursTracked: string;
  tasksCompleted: string;
  tasksCompletionRate: number;
};

export default function Dashboard() {
  const { data: dashboardStats, isLoading } = useQuery<DashboardStats>({
    queryKey: ["/api/dashboard"],
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">Welcome back, Alex! Here's an overview of your freelance business.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Link href="/projects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </Link>
          <Button variant="outline">
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-6">
        <StatCard
          title="Monthly Earnings"
          value={isLoading ? "Loading..." : `$${dashboardStats?.monthlyEarnings.toLocaleString() || '0'}`}
          icon={<FileText />}
          iconColor="text-primary-600"
          iconBgColor="bg-primary-50"
          changeValue="12% from last month"
          changeType="increase"
        />
        
        <StatCard
          title="Active Projects"
          value={isLoading ? "Loading..." : `${dashboardStats?.activeProjects || '0'}`}
          icon={<LayoutPanelLeft />}
          iconColor="text-secondary-600"
          iconBgColor="bg-secondary-50"
          changeType="neutral"
          changeValue="2 due this week"
        />
        
        <StatCard
          title="Hours Tracked"
          value={isLoading ? "Loading..." : dashboardStats?.hoursTracked || '0h 0m'}
          icon={<Clock />}
          iconColor="text-amber-500"
          iconBgColor="bg-amber-50"
          changeValue="5% from last week"
          changeType="decrease"
        />
        
        <StatCard
          title="Tasks Completed"
          value={isLoading ? "Loading..." : dashboardStats?.tasksCompleted || '0/0'}
          icon={<CheckSquare />}
          iconColor="text-green-600"
          iconBgColor="bg-green-50"
          footerContent={
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ 
                  width: isLoading ? '0%' : `${dashboardStats?.tasksCompletionRate || 0}%` 
                }}
              ></div>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <ActiveProjectsCard />
        <TimeTrackingCard />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <TasksOverviewCard />
        </div>
        <div>
          <InvoicesSummaryCard />
        </div>
      </div>
    </div>
  );
}
