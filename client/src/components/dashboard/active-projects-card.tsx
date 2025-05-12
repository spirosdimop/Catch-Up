import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";

type Project = {
  id: number;
  name: string;
  client: string;
  deadline: string;
  status: string;
  progress: number;
};

export default function ActiveProjectsCard() {
  const { data: projects, isLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  // Only display active projects, limited to 5
  const activeProjects = projects
    ? projects
        .filter(project => project.status === "In Progress")
        .slice(0, 5)
    : [];

  return (
    <Card className="h-full">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Active Projects</CardTitle>
        <Link href="/projects">
          <span className="text-sm text-blue-500 hover:underline cursor-pointer">
            View all
          </span>
        </Link>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex justify-between items-center">
                <div className="w-1/3 h-5 bg-gray-200 rounded animate-pulse"></div>
                <div className="w-1/4 h-5 bg-gray-200 rounded animate-pulse"></div>
              </div>
            ))}
          </div>
        ) : activeProjects.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>No active projects</p>
          </div>
        ) : (
          <div className="space-y-5">
            {activeProjects.map((project) => (
              <div key={project.id} className="flex flex-col">
                <div className="flex justify-between items-center">
                  <div>
                    <Link href={`/projects/${project.id}`}>
                      <h3 className="font-medium hover:text-primary hover:underline cursor-pointer">
                        {project.name}
                      </h3>
                    </Link>
                    <p className="text-sm text-gray-500">{project.client}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {new Date(project.deadline).toLocaleDateString()}
                  </Badge>
                </div>
                <div className="mt-2 w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full"
                    style={{ width: `${project.progress}%` }}
                  ></div>
                </div>
                <p className="text-xs text-right mt-1 text-gray-500">{project.progress}% complete</p>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}