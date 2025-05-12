import { Link } from "wouter";
import { formatDate } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Laptop, Smartphone, Paintbrush } from "lucide-react";

interface Project {
  id: number;
  name: string;
  client?: {
    name: string;
  };
  startDate: Date | string;
  endDate?: Date | string;
  status: string;
}

interface ProjectTableProps {
  projects: Project[];
  title?: string;
  viewAllLink?: string;
}

export default function ProjectTable({ projects, title = "Projects", viewAllLink }: ProjectTableProps) {
  const getProjectIcon = (name: string) => {
    if (name.toLowerCase().includes("website")) {
      return <Laptop className="text-primary h-4 w-4" />;
    } else if (name.toLowerCase().includes("app") || name.toLowerCase().includes("mobile")) {
      return <Smartphone className="text-purple-600 h-4 w-4" />;
    } else if (name.toLowerCase().includes("brand") || name.toLowerCase().includes("logo")) {
      return <Paintbrush className="text-blue-600 h-4 w-4" />;
    }
    
    return <Laptop className="text-primary h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
      case 'on track':
        return 'bg-green-100 text-green-800';
      case 'at risk':
        return 'bg-yellow-100 text-yellow-800';
      case 'on hold':
        return 'bg-orange-100 text-orange-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white shadow rounded-lg overflow-hidden">
      <div className="p-5 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
          {viewAllLink && (
            <Link href={viewAllLink}>
              <a className="text-sm font-medium text-primary hover:text-primary-700">View all</a>
            </Link>
          )}
        </div>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Project</TableHead>
              <TableHead>Client</TableHead>
              <TableHead>Deadline</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {projects.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-8 text-gray-500">
                  No projects found.
                </TableCell>
              </TableRow>
            ) : (
              projects.map(project => (
                <TableRow key={project.id}>
                  <TableCell>
                    <div className="flex items-center">
                      <div className="flex-shrink-0 h-8 w-8 bg-primary-100 rounded-md flex items-center justify-center">
                        {getProjectIcon(project.name)}
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{project.name}</div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-900">{project.client?.name || 'N/A'}</div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">{formatDate(project.endDate)}</div>
                  </TableCell>
                  <TableCell>
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(project.status)}`}>
                      {project.status}
                    </span>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
