import React, { useState } from 'react';
import { CatchUpLayout } from '../../components/catchup/Layout';
import { 
  Play,
  Pause,
  Plus,
  Clock,
  BarChart,
  CalendarClock,
  Calendar as CalendarIcon,
  ChevronDown,
  ChevronRight,
  Trash2,
  Edit,
  Filter,
  ArrowUpRight
} from 'lucide-react';
import '../../styles/catchup.css';

// Define time entry type
type TimeEntry = {
  id: number;
  projectId: number;
  taskId?: number;
  description: string;
  startTime: string;
  endTime?: string;
  duration: number; // in seconds
  isRunning: boolean;
};

// Define project type
type Project = {
  id: number;
  name: string;
  color: string;
  client?: string;
};

// Define task type
type Task = {
  id: number;
  projectId: number;
  title: string;
};

export default function TimeTrackingPage() {
  const [activeTab, setActiveTab] = useState<'timer' | 'entries' | 'reports'>('timer');
  const [filterPeriod, setFilterPeriod] = useState<'today' | 'yesterday' | 'thisWeek' | 'lastWeek' | 'thisMonth' | 'custom'>('today');
  const [isTracking, setIsTracking] = useState(false);
  const [currentEntry, setCurrentEntry] = useState<{
    description: string;
    projectId: number | null;
    taskId: number | null;
    startTime: string | null;
    elapsedTime: number; // in seconds
  }>({
    description: '',
    projectId: null,
    taskId: null,
    startTime: null,
    elapsedTime: 0
  });
  
  // Sample data
  const projects: Project[] = [
    { id: 1, name: 'Website Redesign', color: '#3B82F6', client: 'Acme Corp' },
    { id: 2, name: 'Mobile App', color: '#EC4899', client: 'TechStart' },
    { id: 3, name: 'Marketing Campaign', color: '#10B981', client: 'GreenFields' },
    { id: 4, name: 'Internal Tools', color: '#F59E0B', client: 'Internal' },
  ];
  
  const tasks: Task[] = [
    { id: 1, projectId: 1, title: 'Homepage design' },
    { id: 2, projectId: 1, title: 'About page content' },
    { id: 3, projectId: 2, title: 'UI/UX wireframes' },
    { id: 4, projectId: 2, title: 'Authentication flow' },
    { id: 5, projectId: 3, title: 'Social media posts' },
    { id: 6, projectId: 4, title: 'Reporting dashboard' },
  ];
  
  const timeEntries: TimeEntry[] = [
    {
      id: 1,
      projectId: 1,
      taskId: 1,
      description: 'Working on homepage design',
      startTime: '2025-05-14T09:30:00',
      endTime: '2025-05-14T11:45:00',
      duration: 8100, // 2h 15m
      isRunning: false
    },
    {
      id: 2,
      projectId: 2,
      taskId: 3,
      description: 'Creating wireframes for mobile app',
      startTime: '2025-05-14T13:15:00',
      endTime: '2025-05-14T15:30:00',
      duration: 8100, // 2h 15m
      isRunning: false
    },
    {
      id: 3,
      projectId: 3,
      taskId: 5,
      description: 'Planning social media content',
      startTime: '2025-05-14T16:00:00',
      endTime: '2025-05-14T17:30:00',
      duration: 5400, // 1h 30m
      isRunning: false
    }
  ];
  
  // Format duration for display (HH:MM:SS)
  const formatDuration = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    
    return [
      hours.toString().padStart(2, '0'),
      minutes.toString().padStart(2, '0'),
      remainingSeconds.toString().padStart(2, '0')
    ].join(':');
  };
  
  // Format duration in human-readable format (Xh Ym)
  const formatDurationHuman = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    
    if (hours === 0) {
      return `${minutes}m`;
    } else if (minutes === 0) {
      return `${hours}h`;
    } else {
      return `${hours}h ${minutes}m`;
    }
  };
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Format time for display
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
  };
  
  // Get project by ID
  const getProject = (projectId: number) => {
    return projects.find(project => project.id === projectId);
  };
  
  // Get task by ID
  const getTask = (taskId?: number) => {
    if (!taskId) return null;
    return tasks.find(task => task.id === taskId);
  };
  
  // Group time entries by date
  const groupedEntries = timeEntries.reduce((groups, entry) => {
    const date = new Date(entry.startTime).toLocaleDateString();
    if (!groups[date]) {
      groups[date] = [];
    }
    groups[date].push(entry);
    return groups;
  }, {} as Record<string, TimeEntry[]>);
  
  // Calculate total time for each project
  const projectTotals = projects.map(project => {
    const projectEntries = timeEntries.filter(entry => entry.projectId === project.id);
    const totalSeconds = projectEntries.reduce((total, entry) => total + entry.duration, 0);
    return {
      ...project,
      totalTime: totalSeconds,
      percentage: Math.round((totalSeconds / timeEntries.reduce((total, entry) => total + entry.duration, 0)) * 100)
    };
  });
  
  // Toggle time tracking
  const toggleTracking = () => {
    if (isTracking) {
      // Stop tracking
      setIsTracking(false);
      // Reset current entry
      setCurrentEntry({
        description: '',
        projectId: null,
        taskId: null,
        startTime: null,
        elapsedTime: 0
      });
    } else {
      // Start tracking
      setIsTracking(true);
      setCurrentEntry({
        ...currentEntry,
        startTime: new Date().toISOString(),
        elapsedTime: 0
      });
    }
  };
  
  // Handle input change for current entry
  const handleEntryChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setCurrentEntry({
      ...currentEntry,
      [name]: value
    });
  };

  return (
    <CatchUpLayout>
      <div className="catchup-flex catchup-flex-col h-full">
        {/* Header */}
        <div className="catchup-flex catchup-items-center catchup-justify-between catchup-mb-6">
          <div>
            <h1 className="catchup-heading-lg">Time Tracking</h1>
            <p className="catchup-text-sm text-[var(--catchup-gray)]">
              Track your time and boost productivity
            </p>
          </div>
          <div className="catchup-flex catchup-items-center catchup-gap-2">
            <button className="catchup-button catchup-button-secondary">
              <Plus size={18} className="mr-2" />
              Manual Entry
            </button>
            <button className="catchup-button catchup-button-primary">
              <CalendarClock size={18} className="mr-2" />
              Reports
            </button>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="catchup-flex catchup-items-center border-b border-[var(--catchup-navy-dark)] catchup-mb-6">
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'timer'
                ? 'border-[var(--catchup-cobalt)] text-[var(--catchup-cobalt)]'
                : 'border-transparent text-[var(--catchup-gray)] hover:text-[var(--catchup-light-gray)]'
            }`}
            onClick={() => setActiveTab('timer')}
          >
            <Clock size={16} className="inline mr-2" />
            Timer
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'entries'
                ? 'border-[var(--catchup-cobalt)] text-[var(--catchup-cobalt)]'
                : 'border-transparent text-[var(--catchup-gray)] hover:text-[var(--catchup-light-gray)]'
            }`}
            onClick={() => setActiveTab('entries')}
          >
            <CalendarIcon size={16} className="inline mr-2" />
            Time Entries
          </button>
          <button
            className={`px-4 py-3 text-sm font-medium border-b-2 ${
              activeTab === 'reports'
                ? 'border-[var(--catchup-cobalt)] text-[var(--catchup-cobalt)]'
                : 'border-transparent text-[var(--catchup-gray)] hover:text-[var(--catchup-light-gray)]'
            }`}
            onClick={() => setActiveTab('reports')}
          >
            <BarChart size={16} className="inline mr-2" />
            Reports
          </button>
        </div>
        
        {/* Timer View */}
        {activeTab === 'timer' && (
          <div className="catchup-grid catchup-grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Timer Card */}
            <div className="lg:col-span-2">
              <div className="catchup-card">
                <div className="catchup-flex catchup-items-center catchup-justify-between catchup-mb-4">
                  <h2 className="catchup-heading-sm">Current Timer</h2>
                </div>
                
                <div className="space-y-4">
                  <div className="catchup-flex catchup-flex-col md:flex-row catchup-gap-4">
                    <div className="flex-grow">
                      <label className="catchup-label">What are you working on?</label>
                      <input
                        type="text"
                        name="description"
                        className="catchup-input"
                        placeholder="Enter task description"
                        value={currentEntry.description}
                        onChange={handleEntryChange}
                        disabled={isTracking}
                      />
                    </div>
                    <div className="flex-shrink-0">
                      <label className="catchup-label">Project</label>
                      <select
                        name="projectId"
                        className="catchup-input"
                        value={currentEntry.projectId || ""}
                        onChange={handleEntryChange}
                        disabled={isTracking}
                      >
                        <option value="">Select Project</option>
                        {projects.map((project) => (
                          <option key={project.id} value={project.id}>
                            {project.name}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                  
                  {currentEntry.projectId && (
                    <div>
                      <label className="catchup-label">Task</label>
                      <select
                        name="taskId"
                        className="catchup-input"
                        value={currentEntry.taskId || ""}
                        onChange={handleEntryChange}
                        disabled={isTracking}
                      >
                        <option value="">Select Task</option>
                        {tasks
                          .filter((task) => task.projectId === Number(currentEntry.projectId))
                          .map((task) => (
                            <option key={task.id} value={task.id}>
                              {task.title}
                            </option>
                          ))}
                      </select>
                    </div>
                  )}
                  
                  <div className="catchup-flex catchup-flex-col md:flex-row catchup-items-center catchup-justify-between catchup-gap-4 p-4 mt-6 bg-[var(--catchup-navy-dark)] rounded-lg">
                    <div className="text-center md:text-left">
                      <div className="catchup-text-lg font-mono font-bold">
                        {formatDuration(currentEntry.elapsedTime)}
                      </div>
                      {isTracking && currentEntry.startTime && (
                        <div className="catchup-text-sm text-[var(--catchup-gray)]">
                          Started at {formatTime(currentEntry.startTime)}
                        </div>
                      )}
                    </div>
                    
                    <div className="catchup-flex catchup-items-center catchup-gap-3">
                      <button
                        className={`catchup-button ${
                          isTracking
                            ? 'catchup-button-secondary'
                            : 'catchup-button-primary'
                        } min-w-[120px]`}
                        onClick={toggleTracking}
                        disabled={!isTracking && !currentEntry.description}
                      >
                        {isTracking ? (
                          <>
                            <Pause size={18} className="mr-2" />
                            Stop
                          </>
                        ) : (
                          <>
                            <Play size={18} className="mr-2" />
                            Start
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Recent Entries */}
              <div className="catchup-card catchup-mt-4">
                <div className="catchup-flex catchup-items-center catchup-justify-between catchup-mb-4">
                  <h2 className="catchup-heading-sm">Recent Entries</h2>
                  <button 
                    className="catchup-button catchup-button-ghost text-[var(--catchup-cobalt)] text-sm"
                    onClick={() => setActiveTab('entries')}
                  >
                    View All
                  </button>
                </div>
                
                <div className="space-y-2">
                  {timeEntries.slice(0, 3).map((entry) => {
                    const project = getProject(entry.projectId);
                    const task = getTask(entry.taskId);
                    
                    return (
                      <div 
                        key={entry.id} 
                        className="catchup-flex catchup-items-center catchup-justify-between p-3 rounded-md bg-[var(--catchup-navy-dark)]"
                      >
                        <div className="catchup-flex catchup-items-center catchup-gap-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: project?.color || 'gray' }}
                          ></div>
                          <div>
                            <p className="catchup-text font-medium">{entry.description}</p>
                            <p className="catchup-text-sm text-[var(--catchup-gray)]">
                              {project?.name} {task ? `• ${task.title}` : ''}
                            </p>
                          </div>
                        </div>
                        <div className="catchup-flex catchup-items-center catchup-gap-4">
                          <div className="text-right">
                            <p className="catchup-text font-medium">
                              {formatDurationHuman(entry.duration)}
                            </p>
                            <p className="catchup-text-sm text-[var(--catchup-gray)]">
                              {formatTime(entry.startTime)} - {entry.endTime ? formatTime(entry.endTime) : 'Running'}
                            </p>
                          </div>
                          
                          <div className="catchup-flex catchup-items-center catchup-gap-1">
                            <button className="catchup-button catchup-button-ghost p-1 text-[var(--catchup-gray)]">
                              <Edit size={16} />
                            </button>
                            <button className="catchup-button catchup-button-ghost p-1 text-[var(--catchup-gray)]">
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
            
            {/* Summary Card */}
            <div>
              <div className="catchup-card">
                <div className="catchup-flex catchup-items-center catchup-justify-between catchup-mb-4">
                  <h2 className="catchup-heading-sm">Today's Summary</h2>
                  <button className="catchup-button catchup-button-ghost text-[var(--catchup-cobalt)] text-sm">
                    <Filter size={16} className="mr-1" />
                    Filter
                  </button>
                </div>
                
                <div className="space-y-6">
                  <div className="text-center">
                    <h3 className="catchup-text-sm text-[var(--catchup-gray)] mb-1">Total Hours</h3>
                    <div className="catchup-heading-lg">
                      {formatDurationHuman(timeEntries.reduce((total, entry) => total + entry.duration, 0))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="catchup-text-sm text-[var(--catchup-gray)] mb-3">By Project</h3>
                    <div className="space-y-4">
                      {projectTotals
                        .filter(project => project.totalTime > 0)
                        .sort((a, b) => b.totalTime - a.totalTime)
                        .map((project) => (
                        <div key={project.id}>
                          <div className="catchup-flex catchup-justify-between catchup-items-center mb-1">
                            <div className="catchup-flex catchup-items-center">
                              <div 
                                className="w-3 h-3 rounded-full mr-2" 
                                style={{ backgroundColor: project.color }}
                              ></div>
                              <p className="catchup-text-sm">{project.name}</p>
                            </div>
                            <p className="catchup-text-sm font-medium">
                              {formatDurationHuman(project.totalTime)}
                            </p>
                          </div>
                          <div className="w-full h-2 bg-[var(--catchup-navy-dark)] rounded-full">
                            <div 
                              className="h-full rounded-full" 
                              style={{ 
                                width: `${project.percentage}%`,
                                backgroundColor: project.color
                              }}
                            ></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div>
                    <h3 className="catchup-text-sm text-[var(--catchup-gray)] mb-2">Week Overview</h3>
                    <div className="catchup-grid catchup-grid-cols-7 gap-1">
                      {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                        <div key={i} className="text-center">
                          <div className="catchup-text-sm mb-1">{day}</div>
                          <div className="h-16 bg-[var(--catchup-navy-dark)] rounded-md relative">
                            <div 
                              className="absolute bottom-0 w-full bg-[var(--catchup-cobalt-light)] rounded-b-md"
                              style={{ 
                                height: `${Math.random() * 100}%`,
                                opacity: i === 2 ? 1 : 0.5 // Highlight current day
                              }}
                            ></div>
                          </div>
                          <div className="catchup-text-sm mt-1 text-[var(--catchup-gray)]">
                            {Math.floor(Math.random() * 8)}h
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="catchup-flex catchup-items-center catchup-justify-between text-sm">
                    <span className="text-[var(--catchup-gray)]">Efficiency Score</span>
                    <span className="catchup-text-sm text-green-400 catchup-flex catchup-items-center">
                      92%
                      <ArrowUpRight size={14} className="ml-1" />
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {/* Time Entries View */}
        {activeTab === 'entries' && (
          <div>
            <div className="catchup-flex catchup-items-center catchup-justify-between catchup-mb-4">
              <div className="catchup-flex catchup-items-center catchup-gap-4">
                <select 
                  className="catchup-input w-auto" 
                  value={filterPeriod}
                  onChange={(e) => setFilterPeriod(e.target.value as any)}
                >
                  <option value="today">Today</option>
                  <option value="yesterday">Yesterday</option>
                  <option value="thisWeek">This Week</option>
                  <option value="lastWeek">Last Week</option>
                  <option value="thisMonth">This Month</option>
                  <option value="custom">Custom Range</option>
                </select>
                
                <div className="catchup-flex catchup-items-center text-sm text-[var(--catchup-gray)]">
                  <span className="mr-2">Total:</span>
                  <span className="font-bold text-white">
                    {formatDurationHuman(timeEntries.reduce((total, entry) => total + entry.duration, 0))}
                  </span>
                </div>
              </div>
              
              <div className="catchup-flex catchup-items-center catchup-gap-2">
                <button className="catchup-button catchup-button-ghost">
                  <Filter size={16} className="mr-1" />
                  Filter
                </button>
                <button className="catchup-button catchup-button-secondary">
                  Export
                </button>
              </div>
            </div>
            
            {/* Entries by date */}
            <div className="space-y-6">
              {Object.entries(groupedEntries).map(([date, entries]) => (
                <div key={date}>
                  <div className="catchup-flex catchup-items-center catchup-gap-2 catchup-mb-2">
                    <h3 className="catchup-heading-sm">{new Date(date).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</h3>
                    <span className="catchup-text-sm text-[var(--catchup-gray)]">
                      {formatDurationHuman(entries.reduce((total, entry) => total + entry.duration, 0))}
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {entries.map((entry) => {
                      const project = getProject(entry.projectId);
                      const task = getTask(entry.taskId);
                      
                      return (
                        <div 
                          key={entry.id} 
                          className="catchup-flex catchup-items-center catchup-justify-between p-4 rounded-md bg-[var(--catchup-navy-light)]"
                        >
                          <div className="catchup-flex catchup-items-center catchup-gap-3">
                            <div 
                              className="w-4 h-4 rounded-full" 
                              style={{ backgroundColor: project?.color || 'gray' }}
                            ></div>
                            <div>
                              <p className="catchup-text font-medium">{entry.description}</p>
                              <p className="catchup-text-sm text-[var(--catchup-gray)]">
                                {project?.name} {task ? `• ${task.title}` : ''}
                              </p>
                            </div>
                          </div>
                          <div className="catchup-flex catchup-items-center catchup-gap-4">
                            <div className="text-right">
                              <p className="catchup-text font-medium">
                                {formatDurationHuman(entry.duration)}
                              </p>
                              <p className="catchup-text-sm text-[var(--catchup-gray)]">
                                {formatTime(entry.startTime)} - {entry.endTime ? formatTime(entry.endTime) : 'Running'}
                              </p>
                            </div>
                            
                            <div className="catchup-flex catchup-items-center catchup-gap-2">
                              <button className="catchup-button catchup-button-ghost p-1 text-[var(--catchup-gray)]">
                                <Edit size={16} />
                              </button>
                              <button className="catchup-button catchup-button-ghost p-1 text-[var(--catchup-gray)]">
                                <Trash2 size={16} />
                              </button>
                              <button className="catchup-button catchup-button-ghost p-1 text-[var(--catchup-gray)]">
                                <ChevronRight size={16} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        
        {/* Reports View */}
        {activeTab === 'reports' && (
          <div className="catchup-card text-center p-8">
            <h2 className="catchup-heading-md mb-4">Reports Coming Soon</h2>
            <p className="catchup-text-sm text-[var(--catchup-gray)] max-w-md mx-auto">
              Detailed reporting features are under development. Soon you'll be able to generate
              custom reports and visualize your productivity data.
            </p>
          </div>
        )}
      </div>
    </CatchUpLayout>
  );
}