import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Plus, Search, MoreVertical, Edit, Trash2 } from "lucide-react";
import { Project, Client, ProjectStatus } from "@shared/schema";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Projects() {
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [searchQuery, setSearchQuery] = useState("");
  const [deleteProjectId, setDeleteProjectId] = useState<number | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest("DELETE", `/api/projects/${id}`, undefined);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully",
      });
      setDeleteDialogOpen(false);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to delete project",
        variant: "destructive",
      });
    },
  });

  const isLoading = projectsLoading || clientsLoading;

  // Get client name by ID
  const getClientName = (clientId: number) => {
    const client = clients?.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  // Format status for display
  const formatStatus = (status: string) => {
    switch (status) {
      case ProjectStatus.NOT_STARTED:
        return "Not Started";
      case ProjectStatus.IN_PROGRESS:
        return "In Progress";
      case ProjectStatus.ON_HOLD:
        return "On Hold";
      case ProjectStatus.COMPLETED:
        return "Completed";
      default:
        return status;
    }
  };

  // Get status style
  const getStatusStyle = (status: string) => {
    switch (status) {
      case ProjectStatus.NOT_STARTED:
        return "bg-blue-100 text-blue-800";
      case ProjectStatus.IN_PROGRESS:
        return "bg-green-100 text-green-800";
      case ProjectStatus.ON_HOLD:
        return "bg-yellow-100 text-yellow-800";
      case ProjectStatus.COMPLETED:
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  // Filter projects based on search query
  const filteredProjects = projects?.filter(project => {
    if (!searchQuery) return true;
    
    const projectName = project.name.toLowerCase();
    const clientName = getClientName(project.clientId).toLowerCase();
    const query = searchQuery.toLowerCase();
    
    return projectName.includes(query) || clientName.includes(query);
  });

  const handleDeleteClick = (id: number) => {
    setDeleteProjectId(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (deleteProjectId) {
      deleteProjectMutation.mutate(deleteProjectId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
          <p className="mt-1 text-sm text-gray-500">Manage your client projects and track their progress</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Link href="/projects/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" /> New Project
            </Button>
          </Link>
        </div>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-gray-500" />
                <Input
                  type="search"
                  placeholder="Search projects..."
                  className="pl-8"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Additional filters could be added here */}
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-10 text-center text-gray-500">Loading projects...</div>
          ) : filteredProjects && filteredProjects.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project Name</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>Deadline</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead className="w-[80px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => (
                  <TableRow key={project.id}>
                    <TableCell className="font-medium">{project.name}</TableCell>
                    <TableCell>{getClientName(project.clientId)}</TableCell>
                    <TableCell>
                      <span className={`px-2 py-1 inline-flex text-xs leading-4 font-semibold rounded-full ${getStatusStyle(project.status)}`}>
                        {formatStatus(project.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      {project.startDate ? format(new Date(project.startDate), "MMM d, yyyy") : "-"}
                    </TableCell>
                    <TableCell>
                      {project.endDate ? format(new Date(project.endDate), "MMM d, yyyy") : "-"}
                    </TableCell>
                    <TableCell>
                      {project.budget ? `$${project.budget.toLocaleString()}` : "-"}
                    </TableCell>
                    <TableCell>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="icon">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => navigate(`/projects/${project.id}`)}>
                            <Edit className="h-4 w-4 mr-2" /> Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            className="text-red-600"
                            onClick={() => handleDeleteClick(project.id)}
                          >
                            <Trash2 className="h-4 w-4 mr-2" /> Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-10 text-center text-gray-500">
              {searchQuery ? "No projects found matching your search" : "No projects yet. Create your first project!"}
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Are you sure you want to delete this project?</DialogTitle>
            <DialogDescription>
              This action cannot be undone. This will permanently delete the project and all related data.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={confirmDelete} disabled={deleteProjectMutation.isPending}>
              {deleteProjectMutation.isPending ? "Deleting..." : "Delete Project"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
