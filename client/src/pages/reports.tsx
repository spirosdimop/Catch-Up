import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Project, Client, TimeEntry, Invoice, Task } from "@shared/schema";
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, isSameMonth, isSameWeek, parseISO, addMonths, addWeeks, subMonths, subWeeks } from "date-fns";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  Legend,
} from 'recharts';
import { Download, ChevronLeft, ChevronRight } from "lucide-react";

type TimeRange = 'week' | 'month';
type ReportType = 'time' | 'projects' | 'clients' | 'income';

export default function Reports() {
  const [timeRange, setTimeRange] = useState<TimeRange>('week');
  const [reportType, setReportType] = useState<ReportType>('time');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [projectFilter, setProjectFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');

  const { data: timeEntries, isLoading: timeEntriesLoading } = useQuery<TimeEntry[]>({
    queryKey: ["/api/time-entries"],
  });

  const { data: projects, isLoading: projectsLoading } = useQuery<Project[]>({
    queryKey: ["/api/projects"],
  });

  const { data: clients, isLoading: clientsLoading } = useQuery<Client[]>({
    queryKey: ["/api/clients"],
  });

  const { data: tasks, isLoading: tasksLoading } = useQuery<Task[]>({
    queryKey: ["/api/tasks"],
  });

  const { data: invoices, isLoading: invoicesLoading } = useQuery<Invoice[]>({
    queryKey: ["/api/invoices"],
  });

  const isLoading = timeEntriesLoading || projectsLoading || clientsLoading || tasksLoading || invoicesLoading;

  // Date range helpers
  const getDateRange = () => {
    if (timeRange === 'week') {
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 1 }),
        end: endOfWeek(currentDate, { weekStartsOn: 1 }),
        format: "MMM d",
        step: (date: Date) => new Date(date.setDate(date.getDate() + 1)), // Step by day
      };
    } else {
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate),
        format: "MMM d",
        step: (date: Date) => new Date(date.setDate(date.getDate() + 1)), // Step by day for months too
      };
    }
  };

  const dateRange = getDateRange();

  // Navigation helpers
  const goToPrevious = () => {
    if (timeRange === 'week') {
      setCurrentDate(subWeeks(currentDate, 1));
    } else {
      setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const goToNext = () => {
    if (timeRange === 'week') {
      setCurrentDate(addWeeks(currentDate, 1));
    } else {
      setCurrentDate(addMonths(currentDate, 1));
    }
  };

  const goToCurrent = () => {
    setCurrentDate(new Date());
  };

  // Get client name by ID
  const getClientName = (clientId: number) => {
    const client = clients?.find((c) => c.id === clientId);
    return client?.name || "Unknown Client";
  };

  // Get project name by ID
  const getProjectName = (projectId: number) => {
    const project = projects?.find((p) => p.id === projectId);
    return project?.name || "Unknown Project";
  };

  // Format currency
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  // Format duration in minutes to hours and minutes
  const formatDuration = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  // Filter data based on date range and other filters
  const filterData = () => {
    // First filter by date range
    let filteredTimeEntries = timeEntries?.filter(entry => {
      const entryDate = new Date(entry.startTime);
      if (timeRange === 'week') {
        return isSameWeek(entryDate, currentDate, { weekStartsOn: 1 });
      } else {
        return isSameMonth(entryDate, currentDate);
      }
    }) || [];

    // Then apply project filter if set
    if (projectFilter !== 'all') {
      const projectId = parseInt(projectFilter);
      filteredTimeEntries = filteredTimeEntries.filter(entry => entry.projectId === projectId);
    }

    // Apply client filter through projects
    if (clientFilter !== 'all' && projects) {
      const clientId = parseInt(clientFilter);
      const projectIds = projects.filter(p => p.clientId === clientId).map(p => p.id);
      filteredTimeEntries = filteredTimeEntries.filter(entry => projectIds.includes(entry.projectId));
    }

    return filteredTimeEntries;
  };

  // Prepare data for time tracking chart
  const prepareTimeTrackingData = () => {
    const filteredEntries = filterData();
    const range = getDateRange();
    
    // Create an array of dates in the range
    const dates = [];
    let currentDate = new Date(range.start);
    while (currentDate <= range.end) {
      dates.push(new Date(currentDate));
      currentDate = range.step(currentDate);
    }
    
    // Map dates to durations
    return dates.map(date => {
      const dateStr = format(date, range.format);
      const duration = filteredEntries
        .filter(entry => format(new Date(entry.startTime), range.format) === dateStr)
        .reduce((sum, entry) => sum + (entry.duration || 0), 0);
      
      // Convert minutes to hours for the chart
      const hours = duration / 60;
      
      return {
        date: dateStr,
        hours: parseFloat(hours.toFixed(1))
      };
    });
  };

  // Prepare data for project distribution chart
  const prepareProjectDistributionData = () => {
    const filteredEntries = filterData();
    
    // Group by project and sum durations
    const projectDurations = filteredEntries.reduce((acc, entry) => {
      const projectName = getProjectName(entry.projectId);
      if (!acc[projectName]) {
        acc[projectName] = 0;
      }
      acc[projectName] += entry.duration || 0;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array for the chart
    return Object.entries(projectDurations).map(([name, duration]) => ({
      name,
      value: duration, // in minutes
      hours: parseFloat((duration / 60).toFixed(1)) // convert to hours for display
    }));
  };

  // Prepare data for client distribution chart
  const prepareClientDistributionData = () => {
    const filteredEntries = filterData();
    
    // Group by client (via project) and sum durations
    const clientDurations = filteredEntries.reduce((acc, entry) => {
      if (!projects) return acc;
      
      const project = projects.find(p => p.id === entry.projectId);
      if (!project) return acc;
      
      const clientName = getClientName(project.clientId);
      if (!acc[clientName]) {
        acc[clientName] = 0;
      }
      acc[clientName] += entry.duration || 0;
      return acc;
    }, {} as Record<string, number>);
    
    // Convert to array for the chart
    return Object.entries(clientDurations).map(([name, duration]) => ({
      name,
      value: duration, // in minutes
      hours: parseFloat((duration / 60).toFixed(1)) // convert to hours for display
    }));
  };

  // Prepare data for income chart
  const prepareIncomeData = () => {
    // Filter invoices by date range
    const filteredInvoices = invoices?.filter(invoice => {
      const invoiceDate = new Date(invoice.issueDate);
      if (timeRange === 'week') {
        return isSameWeek(invoiceDate, currentDate, { weekStartsOn: 1 });
      } else {
        return isSameMonth(invoiceDate, currentDate);
      }
    }) || [];
    
    // Apply client filter if set
    let clientFilteredInvoices = filteredInvoices;
    if (clientFilter !== 'all') {
      const clientId = parseInt(clientFilter);
      clientFilteredInvoices = filteredInvoices.filter(invoice => invoice.clientId === clientId);
    }
    
    // Group by date
    const range = getDateRange();
    
    // Create an array of dates in the range
    const dates = [];
    let current = new Date(range.start);
    while (current <= range.end) {
      dates.push(new Date(current));
      current = range.step(current);
    }
    
    // Map dates to amounts
    return dates.map(date => {
      const dateStr = format(date, range.format);
      const amount = clientFilteredInvoices
        .filter(invoice => format(new Date(invoice.issueDate), range.format) === dateStr)
        .reduce((sum, invoice) => sum + invoice.amount, 0);
      
      return {
        date: dateStr,
        amount: amount
      };
    });
  };

  // Summary calculations
  const calculateSummary = () => {
    const filteredEntries = filterData();
    
    // Total time
    const totalMinutes = filteredEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0);
    const totalHours = totalMinutes / 60;
    
    // Daily average (excluding zero days)
    const daysWithTime = new Set();
    filteredEntries.forEach(entry => {
      daysWithTime.add(format(new Date(entry.startTime), 'yyyy-MM-dd'));
    });
    const avgHoursPerDay = daysWithTime.size > 0 ? totalHours / daysWithTime.size : 0;
    
    // Billable amount calculation (simple approach)
    let billableAmount = 0;
    
    // Count projects
    const projectsWorkedOn = new Set();
    filteredEntries.forEach(entry => {
      projectsWorkedOn.add(entry.projectId);
    });
    
    // Count clients
    const clientsWorkedFor = new Set();
    filteredEntries.forEach(entry => {
      if (projects) {
        const project = projects.find(p => p.id === entry.projectId);
        if (project) {
          clientsWorkedFor.add(project.clientId);
        }
      }
    });
    
    return {
      totalTime: formatDuration(totalMinutes),
      totalHours: totalHours.toFixed(1),
      avgHoursPerDay: avgHoursPerDay.toFixed(1),
      billableAmount: formatCurrency(billableAmount),
      projectCount: projectsWorkedOn.size,
      clientCount: clientsWorkedFor.size
    };
  };

  const summary = calculateSummary();

  // Chart colors
  const CHART_COLORS = [
    '#3b82f6', // primary blue
    '#14b8a6', // teal
    '#f97316', // orange
    '#8b5cf6', // purple
    '#ef4444', // red
    '#22c55e', // green
    '#64748b', // slate
    '#ec4899', // pink
  ];

  // Prepare labels for charts
  const timeRangeLabel = timeRange === 'week' 
    ? `Week of ${format(dateRange.start, 'MMM d, yyyy')}`
    : format(currentDate, 'MMMM yyyy');

  // Export data as CSV
  const exportToCsv = () => {
    const filteredEntries = filterData();
    
    // Create CSV header
    let csvContent = "Project,Task,Description,Date,Start Time,End Time,Duration\n";
    
    // Add rows
    filteredEntries.forEach(entry => {
      const project = getProjectName(entry.projectId);
      const task = entry.taskId ? tasks?.find(t => t.id === entry.taskId)?.title || "" : "";
      const description = entry.description || "";
      const date = format(new Date(entry.startTime), 'yyyy-MM-dd');
      const startTime = format(new Date(entry.startTime), 'HH:mm');
      const endTime = entry.endTime ? format(new Date(entry.endTime), 'HH:mm') : "";
      const duration = formatDuration(entry.duration || 0);
      
      csvContent += `"${project}","${task}","${description}","${date}","${startTime}","${endTime}","${duration}"\n`;
    });
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `time-report-${format(currentDate, 'yyyy-MM-dd')}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="max-w-7xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-gray-800">Reports</h2>
          <p className="mt-1 text-sm text-gray-500">View and analyze your freelance business data</p>
        </div>
        <div className="mt-4 md:mt-0">
          <Button variant="outline" onClick={exportToCsv}>
            <Download className="mr-2 h-4 w-4" /> Export Data
          </Button>
        </div>
      </div>

      {/* Report Controls */}
      <Card className="mb-6">
        <CardHeader className="pb-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center space-x-4">
              <Select value={timeRange} onValueChange={(value) => setTimeRange(value as TimeRange)}>
                <SelectTrigger className="w-[120px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="week">Week</SelectItem>
                  <SelectItem value="month">Month</SelectItem>
                </SelectContent>
              </Select>
              
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={goToPrevious}>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button variant="outline" onClick={goToCurrent}>
                  Today
                </Button>
                <Button variant="outline" size="icon" onClick={goToNext}>
                  <ChevronRight className="h-4 w-4" />
                </Button>
                <span className="text-sm font-medium">{timeRangeLabel}</span>
              </div>
            </div>
            
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2">
              <Select value={clientFilter} onValueChange={setClientFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Clients" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Clients</SelectItem>
                  {clients?.map((client) => (
                    <SelectItem key={client.id} value={client.id.toString()}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              <Select value={projectFilter} onValueChange={setProjectFilter}>
                <SelectTrigger className="w-[150px]">
                  <SelectValue placeholder="All Projects" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Projects</SelectItem>
                  {projects?.map((project) => (
                    <SelectItem key={project.id} value={project.id.toString()}>
                      {project.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Total Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.totalTime}</div>
            <p className="text-sm text-gray-500">Avg. {summary.avgHoursPerDay} hours/day</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary.projectCount}</div>
            <p className="text-sm text-gray-500">Across {summary.clientCount} clients</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-500">Earnings Potential</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(parseInt(summary.totalHours) * 50)}</div>
            <p className="text-sm text-gray-500">Based on {summary.totalHours} hours at $50/hr</p>
          </CardContent>
        </Card>
      </div>

      {/* Report Tabs */}
      <Tabs defaultValue="time" onValueChange={(value) => setReportType(value as ReportType)}>
        <TabsList className="mb-6">
          <TabsTrigger value="time">Time Tracking</TabsTrigger>
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="clients">Clients</TabsTrigger>
          <TabsTrigger value="income">Income</TabsTrigger>
        </TabsList>
        
        <Card>
          <CardHeader>
            <CardTitle>
              {reportType === 'time' && 'Time Tracking Report'}
              {reportType === 'projects' && 'Project Distribution'}
              {reportType === 'clients' && 'Client Distribution'}
              {reportType === 'income' && 'Income Report'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="py-20 text-center text-gray-500">Loading report data...</div>
            ) : (
              <>
                <TabsContent value="time" className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={prepareTimeTrackingData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis name="Hours" unit="h" />
                      <Tooltip formatter={(value) => [`${value} hours`, 'Time Tracked']} />
                      <Legend />
                      <Bar dataKey="hours" name="Hours Tracked" fill="#3b82f6" />
                    </BarChart>
                  </ResponsiveContainer>
                </TabsContent>
                
                <TabsContent value="projects" className="h-[400px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareProjectDistributionData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {prepareProjectDistributionData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${formatDuration(value as number)}`, 'Time Spent']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="overflow-auto max-h-[400px]">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th className="text-left text-sm font-medium text-gray-500">Project</th>
                            <th className="text-right text-sm font-medium text-gray-500">Hours</th>
                            <th className="text-right text-sm font-medium text-gray-500">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prepareProjectDistributionData()
                            .sort((a, b) => b.value - a.value)
                            .map((project, index) => {
                              const totalTime = prepareProjectDistributionData().reduce((sum, p) => sum + p.value, 0);
                              const percentage = totalTime > 0 ? (project.value / totalTime * 100).toFixed(1) : '0';
                              
                              return (
                                <tr key={index} className="border-t border-gray-200">
                                  <td className="py-2 text-sm">{project.name}</td>
                                  <td className="py-2 text-sm text-right">{project.hours}</td>
                                  <td className="py-2 text-sm text-right">{percentage}%</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="clients" className="h-[400px]">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="h-[400px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={prepareClientDistributionData()}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                            outerRadius={100}
                            fill="#8884d8"
                            dataKey="value"
                          >
                            {prepareClientDistributionData().map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={CHART_COLORS[index % CHART_COLORS.length]} />
                            ))}
                          </Pie>
                          <Tooltip formatter={(value) => [`${formatDuration(value as number)}`, 'Time Spent']} />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                    
                    <div className="overflow-auto max-h-[400px]">
                      <table className="min-w-full">
                        <thead>
                          <tr>
                            <th className="text-left text-sm font-medium text-gray-500">Client</th>
                            <th className="text-right text-sm font-medium text-gray-500">Hours</th>
                            <th className="text-right text-sm font-medium text-gray-500">%</th>
                          </tr>
                        </thead>
                        <tbody>
                          {prepareClientDistributionData()
                            .sort((a, b) => b.value - a.value)
                            .map((client, index) => {
                              const totalTime = prepareClientDistributionData().reduce((sum, c) => sum + c.value, 0);
                              const percentage = totalTime > 0 ? (client.value / totalTime * 100).toFixed(1) : '0';
                              
                              return (
                                <tr key={index} className="border-t border-gray-200">
                                  <td className="py-2 text-sm">{client.name}</td>
                                  <td className="py-2 text-sm text-right">{client.hours}</td>
                                  <td className="py-2 text-sm text-right">{percentage}%</td>
                                </tr>
                              );
                            })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </TabsContent>
                
                <TabsContent value="income" className="h-[400px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={prepareIncomeData()} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip formatter={(value) => [formatCurrency(value as number), 'Invoice Amount']} />
                      <Legend />
                      <Line type="monotone" dataKey="amount" name="Income" stroke="#3b82f6" activeDot={{ r: 8 }} />
                    </LineChart>
                  </ResponsiveContainer>
                </TabsContent>
              </>
            )}
          </CardContent>
        </Card>
      </Tabs>
    </div>
  );
}
