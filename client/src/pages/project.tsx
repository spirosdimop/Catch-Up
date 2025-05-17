import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useParams, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Project, Client, ProjectStatus, InsertProject } from "@shared/schema";
import { ArrowLeft, CalendarIcon, DollarSign, Edit, Trash2 } from "lucide-react";
import { format } from "date-fns";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import ProjectTasks from "@/components/ProjectTasks";
import ProjectForm from "@/components/ProjectForm";

// Helper to format status
const formatStatus = (status: string) => {
  switch (status) {
    case ProjectStatus.NOT_STARTED:
      return { label: "Not Started", class: "bg-gray-200 text-gray-800" };
    case ProjectStatus.IN_PROGRESS:
      return { label: "In Progress", class: "bg-blue-200 text-blue-800" };
    case ProjectStatus.ON_HOLD:
      return { label: "On Hold", class: "bg-amber-200 text-amber-800" };
    case ProjectStatus.COMPLETED:
      return { label: "Completed", class: "bg-green-200 text-green-800" };
    default:
      return { label: status, class: "bg-gray-200 text-gray-800" };
  }
};

export default function ProjectDetail() {
  const params = useParams<{ id: string }>();
  const projectId = parseInt(params.id);
  const [, navigate] = useLocation();
  const { toast } = useToast();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  // Fetch project data
  const { data: project, isLoading: projectLoading } = useQuery<Project>({
    queryKey: ["/api/projects", projectId],
    queryFn: async () => {
      const response = await fetch(`/api/projects/${projectId}`);
      if (!response.ok) {
        throw new Error("Failed to fetch project");
      }
      return response.json();
    },
    enabled: !isNaN(projectId)
  });

  // Fetch client data
  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async (project: InsertProject) => {
      console.log("Updating project:", project);
      const res = await apiRequest("PATCH", `/api/projects/${projectId}`, project);
      const updatedProject = await res.json();
      console.log("Project updated:", updatedProject);
      return updatedProject;
    },
    onSuccess: () => {
      console.log("Project updated successfully, invalidating queries");
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      queryClient.invalidateQueries({ queryKey: ["/api/projects", projectId] });
      
      setIsEditDialogOpen(false);
      toast({
        title: "Project updated",
        description: "The project has been updated successfully.",
      });
    },
    onError: (error) => {
      console.error("Error updating project:", error);
      toast({
        title: "Error updating project",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async () => {
      console.log("Deleting project:", projectId);
      await apiRequest("DELETE", `/api/projects/${projectId}`);
      console.log("Project deleted successfully");
      return projectId;
    },
    onSuccess: () => {
      console.log("Project deleted, navigating to projects list");
      
      // Invalidate queries
      queryClient.invalidateQueries({ queryKey: ["/api/projects"] });
      
      setIsDeleteDialogOpen(false);
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully.",
      });
      
      // Navigate back to projects list
      navigate("/projects");
    },
    onError: (error) => {
      console.error("Error deleting project:", error);
      toast({
        title: "Error deleting project",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    },
  });

  // Get client name
  const getClientName = (clientId: number) => {
    if (!clients) return "Loading...";
    const client = clients.find(c => c.id === clientId);
    return client ? client.name : "Unknown client";
  };

  // Handle project update
  const handleProjectUpdate = (data: InsertProject) => {
    updateProjectMutation.mutate(data);
  };

  // Loading state
  const isLoading = projectLoading || clientsLoading;

  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate("/projects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
        <div className="space-y-4">
          <Skeleton className="h-10 w-3/4" />
          <Skeleton className="h-5 w-1/2" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
            <Skeleton className="h-36" />
          </div>
          <Skeleton className="h-64 mt-6" />
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div className="flex items-center mb-6">
          <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate("/projects")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Button>
        </div>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Project not found</h2>
          <p className="text-gray-600 mb-6">The project you're looking for doesn't exist or has been deleted.</p>
          <Button onClick={() => navigate("/projects")}>
            Return to Projects
          </Button>
        </div>
      </div>
    );
  }

  const status = formatStatus(project.status);

  return (
    <div className="max-w-5xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center mb-6">
        <Button variant="ghost" size="sm" className="mb-4" onClick={() => navigate("/projects")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Projects
        </Button>
      </div>
      
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">{project.name}</h1>
          <p className="text-gray-600 mt-1">Client: {getClientName(project.clientId)}</p>
        </div>
        <div className="flex space-x-2 mt-4 md:mt-0">
          <Button 
            variant="outline" 
            onClick={() => setIsEditDialogOpen(true)}
          >
            <Edit className="h-4 w-4 mr-2" />
            Edit Project
          </Button>
          <Button 
            variant="destructive" 
            onClick={() => setIsDeleteDialogOpen(true)}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Status</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge className={status.class}>{status.label}</Badge>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Timeline</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <CalendarIcon className="h-4 w-4 mr-2 text-gray-500" />
              <div>
                <p className="text-sm">
                  Start: {project.startDate ? format(new Date(project.startDate), "MMM d, yyyy") : "Not set"}
                </p>
                <p className="text-sm">
                  End: {project.endDate ? format(new Date(project.endDate), "MMM d, yyyy") : "Not set"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Budget</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2 text-gray-500" />
              <p>{project.budget ? `$${project.budget.toLocaleString()}` : "Not set"}</p>
            </div>
          </CardContent>
        </Card>
      </div>
      
      {project.description && (
        <Card className="mb-8">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-medium">Description</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700">{project.description}</p>
          </CardContent>
        </Card>
      )}
      
      {/* Tasks section */}
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="text-xl font-medium">Project Tasks</CardTitle>
        </CardHeader>
        <CardContent>
          <ProjectTasks projectId={project.id} />
        </CardContent>
      </Card>
      
      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            onSubmit={handleProjectUpdate}
            defaultValues={project}
            isSubmitting={updateProjectMutation.isPending}
            clients={clients || []}
          />
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Delete Project</DialogTitle>
          </DialogHeader>
          <div className="py-4">
            <p className="text-gray-700 mb-4">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>
            <p className="text-amber-600 font-medium mb-6">
              All tasks associated with this project will also be deleted.
            </p>
            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
                Cancel
              </Button>
              <Button 
                variant="destructive"
                onClick={() => deleteProjectMutation.mutate()}
                disabled={deleteProjectMutation.isPending}
              >
                {deleteProjectMutation.isPending ? "Deleting..." : "Delete Project"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}