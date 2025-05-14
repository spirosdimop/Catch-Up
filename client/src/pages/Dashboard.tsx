import { useQuery } from "@tanstack/react-query";
import { Project, Client, Task, TimeEntry } from "@shared/schema";
import { calculateWeeklySummary } from "@/lib/utils";
import { useState } from "react";
import { Link } from "wouter";
import { PlusIcon, DownloadIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/StatCard";
import ProjectTable from "@/components/ProjectTable";
import TaskList from "@/components/TaskList";
import TimeTrackingWidget from "@/components/TimeTrackingWidget";
import ReminderSummary from "@/components/InvoiceSummary"; // Component was renamed but file name remains the same
import { Skeleton } from "@/components/ui/skeleton";

export default function Dashboard() {
  // Fetch data for dashboard
  const { data: projects, isLoading: isLoadingProjects } = useQuery<Project[]>({
    queryKey: ['/api/projects', { active: true }],
  });

  const { data: clients } = useQuery<Client[]>({
    queryKey: ['/api/clients'],
  });

  const { data: tasks, isLoading: isLoadingTasks } = useQuery<Task[]>({
    queryKey: ['/api/tasks'],
  });

  const { data: timeEntries, isLoading: isLoadingTimeEntries } = useQuery<TimeEntry[]>({
    queryKey: ['/api/time-entries'],
  });

  // Calculate statistics
  const activeProjectsCount = projects?.filter(p => p.status === 'in_progress').length || 0;
  const projectsDueThisWeek = projects?.filter(p => {
    if (!p.endDate) return false;
    const endDate = new Date(p.endDate);
    const now = new Date();
    const oneWeek = new Date();
    oneWeek.setDate(now.getDate() + 7);
    return endDate >= now && endDate <= oneWeek;
  }).length || 0;

  const totalHoursTracked = timeEntries?.reduce((acc, entry) => 
    acc + (entry.duration ? Number(entry.duration) : 0), 0) || 0;
  const hoursInHHMM = `${Math.floor(totalHoursTracked / 60)}h ${Math.floor(totalHoursTracked % 60)}m`;
  
  const completedTasksCount = tasks?.filter(t => t.completed).length || 0;
  const totalTasksCount = tasks?.length || 0;
  const taskCompletionRatio = `${completedTasksCount}/${totalTasksCount}`;
  const taskCompletionPercentage = totalTasksCount > 0 
    ? Math.round((completedTasksCount / totalTasksCount) * 100) 
    : 0;

  // Generate weekly summary for time tracking
  const weeklySummary = calculateWeeklySummary(new Date());

  // Map projects with client data
  const projectsWithClients = projects ? projects.map(project => {
    const client = clients?.find(c => c.id === project.clientId);
    return { ...project, client };
  }) : [];

  // Map tasks with project data
  const tasksWithProjects = tasks ? tasks.map(task => {
    const project = projects?.find(p => p.id === task.projectId);
    return { ...task, project };
  }) : [];
  
  // Recent time entries for today
  const todayEntries = timeEntries ? timeEntries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    const today = new Date();
    return entryDate.toDateString() === today.toDateString();
  }).map(entry => {
    const task = tasks?.find(t => t.id === entry.taskId);
    const project = task ? projects?.find(p => p.id === task.projectId) : undefined;
    return { ...entry, task, project };
  }) : [];

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Dashboard</h2>
          <p className="mt-1 text-sm text-gray-500">Welcome back! Here's an overview of your freelance business.</p>
        </div>
        <div className="mt-4 md:mt-0 flex space-x-3">
          <Button asChild>
            <Link to="/projects/new">
              <PlusIcon className="mr-2 h-4 w-4" />
              New Project
            </Link>
          </Button>
          <Button variant="outline">
            <DownloadIcon className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {/* Stats overview */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 mb-6">
        <StatCard 
          title="Active Projects"
          value={activeProjectsCount.toString()}
          color="secondary"
          icon="layout"
          suffix={projectsDueThisWeek > 0 ? `${projectsDueThisWeek} due this week` : undefined}
        />
        
        <StatCard 
          title="Hours Tracked"
          value={hoursInHHMM}
          color="accent"
          icon="clock"
          change="5% from last week"
          changeType="decrease"
        />
        
        <StatCard 
          title="Tasks Completed"
          value={taskCompletionRatio}
          color="success"
          icon="check-square"
          suffix={
            <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
              <div 
                className="bg-green-600 h-2 rounded-full" 
                style={{ width: `${taskCompletionPercentage}%` }}
              ></div>
            </div>
          }
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Active Projects Card */}
        {isLoadingProjects ? (
          <div className="bg-white shadow rounded-lg p-5 space-y-4">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-80 w-full" />
          </div>
        ) : (
          <ProjectTable 
            projects={projectsWithClients || []} 
            title="Active Projects"
            viewAllLink="/projects"
          />
        )}

        {/* Time Tracking Card */}
        {isLoadingTimeEntries ? (
          <div className="bg-white shadow rounded-lg p-5 space-y-4">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-80 w-full" />
          </div>
        ) : (
          <TimeTrackingWidget 
            timeEntries={todayEntries || []} 
            weeklySummary={weeklySummary}
            totalHours={totalHoursTracked / 60}
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Tasks Overview Card */}
        {isLoadingTasks ? (
          <div className="bg-white shadow rounded-lg p-5 space-y-4 lg:col-span-2">
            <Skeleton className="h-8 w-72" />
            <Skeleton className="h-80 w-full" />
          </div>
        ) : (
          <div className="lg:col-span-2">
            <TaskList tasks={tasksWithProjects || []} />
          </div>
        )}

        {/* Reminders Card */}
        <div>
          <ReminderSummary />
        </div>
      </div>
    </div>
  );
}
