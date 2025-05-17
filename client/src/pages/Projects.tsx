import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Project, Client, InsertProject, ProjectStatus } from "@shared/schema";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { formatDate, getStatusColor } from "@/lib/utils";
import { PlusIcon, SearchIcon, TrashIcon, PencilIcon } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ProjectForm from "@/components/ProjectForm";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function Projects() {
  const { toast } = useToast();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string | undefined>(undefined);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Fetch projects and clients
  const { data: projects, isLoading: isLoadingProjects, refetch: refetchProjects } = useQuery<Project[]>({
    queryKey: ['/api/projects'],
    onSuccess: (data) => {
      console.log("Projects loaded successfully:", data);
    },
    onError: (error) => {
      console.error("Error loading projects:", error);
    },
    staleTime: 0, // Always fetch fresh data
    refetchOnMount: true, // Refetch when component mounts
    refetchOnWindowFocus: true // Refetch when window regains focus
  });

  const { data: clients, isLoading: isLoadingClients, isError: isClientsError } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
    onSuccess: (data) => {
      console.log("Clients loaded successfully:", data);
    },
    onError: (error) => {
      console.error("Error loading clients:", error);
      // Don't show toast, just log the error to console
    },
    retry: 2,
    staleTime: 0, // Always fetch fresh data
    // Return empty array if there's an error to prevent null reference errors
    placeholderData: []
  });

  // Create project mutation
  const createProjectMutation = useMutation({
    mutationFn: async (project: InsertProject) => {
      console.log("Creating project:", project);
      const res = await apiRequest("POST", "/api/projects", project);
      const newProject = await res.json();
      console.log("Project created:", newProject);
      return newProject;
    },
    onSuccess: () => {
      console.log("Project created successfully, invalidating queries");
      
      // Properly invalidate the cache
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      // Explicitly refetch to ensure fresh data
      refetchProjects();
      
      setIsAddDialogOpen(false);
      toast({
        title: "Project created",
        description: "The project has been created successfully.",
      });
    },
    onError: (error) => {
      console.error("Error creating project:", error);
      toast({
        title: "Error creating project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update project mutation
  const updateProjectMutation = useMutation({
    mutationFn: async ({ id, project }: { id: number; project: Partial<InsertProject> }) => {
      console.log("Updating project:", id, project);
      const res = await apiRequest("PATCH", `/api/projects/${id}`, project);
      const updatedProject = await res.json();
      console.log("Project updated:", updatedProject);
      return updatedProject;
    },
    onSuccess: () => {
      console.log("Project updated successfully, invalidating queries");
      
      // Properly invalidate the cache
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      // Explicitly refetch to ensure fresh data
      refetchProjects();
      
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
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete project mutation
  const deleteProjectMutation = useMutation({
    mutationFn: async (id: number) => {
      console.log("Deleting project:", id);
      await apiRequest("DELETE", `/api/projects/${id}`);
      console.log("Project deleted successfully");
      return id;
    },
    onSuccess: () => {
      console.log("Project deleted, invalidating queries");
      
      // Properly invalidate the cache
      queryClient.invalidateQueries({ queryKey: ['/api/projects'] });
      
      // Explicitly refetch to ensure fresh data
      refetchProjects();
      
      toast({
        title: "Project deleted",
        description: "The project has been deleted successfully.",
      });
    },
    onError: (error) => {
      console.error("Error deleting project:", error);
      toast({
        title: "Error deleting project",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Handle project form submission
  const handleSubmit = (data: any) => {
    console.log("Form data received:", data);
    
    // Convert form data to InsertProject format with properly formatted dates
    const projectData: InsertProject = {
      name: data.name,
      clientId: data.clientId,
      description: data.description || null,
      status: data.status,
      
      // Convert date strings to ISO strings or null
      startDate: data.startDate ? 
        (typeof data.startDate === 'string' ? data.startDate : data.startDate.toISOString())
        : null,
        
      endDate: data.endDate ? 
        (typeof data.endDate === 'string' ? data.endDate : data.endDate.toISOString())
        : null,
        
      budget: data.budget || null
    };
    
    console.log("Submitting project data:", projectData);
    
    if (selectedProject) {
      updateProjectMutation.mutate({ id: selectedProject.id, project: projectData });
    } else {
      createProjectMutation.mutate(projectData);
    }
  };

  // Handle project deletion
  const handleDeleteProject = (id: number) => {
    if (confirm("Are you sure you want to delete this project?")) {
      deleteProjectMutation.mutate(id);
    }
  };

  // Filter projects based on search term and status filter
  const filteredProjects = projects?.filter(project => {
    const matchesSearch = searchTerm === "" || 
      project.name.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = !statusFilter || project.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Map projects with client data
  const projectsWithClients = filteredProjects?.map(project => {
    const client = clients?.find(c => c.id === project.clientId);
    return { ...project, client };
  });

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Projects</h2>
          <p className="mt-1 text-sm text-gray-500">
            Manage all your client projects in one place
          </p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => {
            setSelectedProject(null);
            setIsAddDialogOpen(true);
          }}>
            <PlusIcon className="mr-2 h-4 w-4" />
            New Project
          </Button>
        </div>
      </div>

      <div className="bg-white shadow rounded-lg overflow-hidden">
        <div className="p-5 border-b border-gray-200">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search projects..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="w-full sm:w-48">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All Statuses</SelectItem>
                  <SelectItem value={ProjectStatus.NOT_STARTED}>Not Started</SelectItem>
                  <SelectItem value={ProjectStatus.IN_PROGRESS}>In Progress</SelectItem>
                  <SelectItem value={ProjectStatus.ON_HOLD}>On Hold</SelectItem>
                  <SelectItem value={ProjectStatus.COMPLETED}>Completed</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {isLoadingProjects ? (
          <div className="p-8 space-y-4">
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : (
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Project</TableHead>
                  <TableHead>Client</TableHead>
                  <TableHead>Start Date</TableHead>
                  <TableHead>End Date</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projectsWithClients?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No projects found. Create your first project to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  projectsWithClients?.map((project) => (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.client?.name}</TableCell>
                      <TableCell>{formatDate(project.startDate)}</TableCell>
                      <TableCell>{formatDate(project.endDate)}</TableCell>
                      <TableCell>${Number(project.budget).toLocaleString()}</TableCell>
                      <TableCell>
                        <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-${getStatusColor(project.status)}-100 text-${getStatusColor(project.status)}-800`}>
                          {project.status === ProjectStatus.NOT_STARTED ? "Not Started" :
                           project.status === ProjectStatus.IN_PROGRESS ? "In Progress" :
                           project.status === ProjectStatus.ON_HOLD ? "On Hold" :
                           project.status === ProjectStatus.COMPLETED ? "Completed" : 
                           project.status}
                        </span>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedProject(project);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <PencilIcon className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteProject(project.id)}
                        >
                          <TrashIcon className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </div>

      {/* Add Project Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Create New Project</DialogTitle>
          </DialogHeader>
          <ProjectForm
            clients={clients || []}
            onSubmit={handleSubmit}
            isSubmitting={createProjectMutation.isPending}
          />
        </DialogContent>
      </Dialog>

      {/* Edit Project Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-xl">
          <DialogHeader>
            <DialogTitle>Edit Project</DialogTitle>
          </DialogHeader>
          {selectedProject && (
            <ProjectForm
              clients={clients || []}
              onSubmit={handleSubmit}
              isSubmitting={updateProjectMutation.isPending}
              defaultValues={selectedProject}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
