import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Link } from "wouter";
import { Project, Client } from "@shared/schema";
import { Laptop, Smartphone, PenTool } from "lucide-react";
import { format } from "date-fns";

export function ActiveProjectsCard() {
  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const isLoading = projectsLoading || clientsLoading;

  // Get client name by ID
  const getClientName = (clientId: number) => {
    const client = clients?.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  // Get icon based on project name
  const getProjectIcon = (projectName: string) => {
    const name = projectName.toLowerCase();
    if (name.includes("website") || name.includes("web")) {
      return <Laptop className="h-4 w-4" />;
    } else if (name.includes("mobile") || name.includes("app")) {
      return <Smartphone className="h-4 w-4" />;
    } else {
      return <PenTool className="h-4 w-4" />;
    }
  };

  // Get status style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case "in_progress":
        return "bg-green-100 text-green-800";
      case "on_hold":
        return "bg-yellow-100 text-yellow-800";
      case "not_started":
        return "bg-blue-100 text-blue-800";
      case "completed":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Format status text
  const formatStatus = (status: string) => {
    switch (status) {
      case "in_progress":
        return "On Track";
      case "on_hold":
        return "At Risk";
      case "not_started":
        return "Not Started";
      case "completed":
        return "Completed";
      default:
        return status;
    }
  };

  return (
    <Card className="overflow-hidden">
      <CardHeader className="p-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-semibold text-gray-800">Active Projects</CardTitle>
          <Link href="/projects">
            <a className="text-sm font-medium text-primary hover:text-primary/80">View all</a>
          </Link>
        </div>
      </CardHeader>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Project</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Client</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deadline</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  Loading projects...
                </td>
              </tr>
            ) : projects && projects.length > 0 ? (
              projects.slice(0, 3).map((project) => (
                <tr key={project.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-primary-100 text-primary-600 rounded-md flex items-center justify-center">
                        {getProjectIcon(project.name)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{getClientName(project.clientId)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-500">
                      {project.endDate 
                        ? format(new Date(project.endDate), "MMM d, yyyy") 
                        : "No deadline"}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusStyle(project.status)}`}>
                      {formatStatus(project.status)}
                    </span>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={4} className="px-6 py-4 text-center text-sm text-gray-500">
                  No active projects
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}

export default ActiveProjectsCard;
