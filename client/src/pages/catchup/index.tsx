import React from 'react';
import { CatchUpLayout } from '../../components/catchup/Layout';
import { 
  Calendar, 
  CheckSquare, 
  Clock, 
  TrendingUp, 
  User,
  BarChart3,
  ChevronRight,
  Star,
  ArrowUpRight
} from 'lucide-react';
import '../../styles/catchup.css';

export default function CatchUpDashboard() {
  const today = new Date();
  const formattedDate = today.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric'
  });

  const upcomingTasks = [
    { id: 1, title: "Prepare quarterly report", dueDate: "Today", priority: "high" },
    { id: 2, title: "Design meeting with team", dueDate: "Today", priority: "medium" },
    { id: 3, title: "Review client feedback", dueDate: "Tomorrow", priority: "medium" },
    { id: 4, title: "Update project documentation", dueDate: "May 16", priority: "low" },
  ];

  const events = [
    { id: 1, title: "Team Standup", time: "9:00 AM - 9:30 AM", location: "Meeting Room A" },
    { id: 2, title: "Product Review", time: "1:00 PM - 2:30 PM", location: "Zoom Call" },
  ];

  const stats = [
    { id: 1, title: "Tasks Completed", value: "12", change: "+4", icon: <CheckSquare size={20} className="text-[var(--catchup-cobalt)]" /> },
    { id: 2, title: "Hours Tracked", value: "32.5", change: "+2.5", icon: <Clock size={20} className="text-[var(--catchup-cobalt)]" /> },
    { id: 3, title: "Productivity", value: "87%", change: "+3%", icon: <TrendingUp size={20} className="text-[var(--catchup-cobalt)]" /> },
  ];

  const projects = [
    { id: 1, name: "Website Redesign", progress: 75, tasks: 24, completed: 18 },
    { id: 2, name: "Mobile App Development", progress: 45, tasks: 42, completed: 19 },
    { id: 3, name: "Marketing Campaign", progress: 90, tasks: 18, completed: 16 },
  ];

  return (
    <CatchUpLayout>
      <div>
        <div className="catchup-flex catchup-items-center catchup-justify-between catchup-mb-4">
          <div>
            <h1 className="catchup-heading-lg">Dashboard</h1>
            <p className="catchup-text-sm text-[var(--catchup-gray)]">{formattedDate}</p>
          </div>
          <button className="catchup-button catchup-button-primary">
            <span className="mr-2">Add Task</span>
            <span className="flex items-center justify-center w-5 h-5 rounded-full bg-white bg-opacity-20">+</span>
          </button>
        </div>

        {/* Stats Section */}
        <div className="catchup-grid catchup-grid-cols-1 md:grid-cols-3 gap-4 catchup-mb-4">
          {stats.map((stat) => (
            <div key={stat.id} className="catchup-card catchup-flex catchup-items-center catchup-gap-4">
              <div className="p-3 rounded-lg bg-[var(--catchup-navy-dark)]">
                {stat.icon}
              </div>
              <div>
                <p className="catchup-text-sm text-[var(--catchup-gray)]">{stat.title}</p>
                <div className="catchup-flex catchup-items-center">
                  <h3 className="catchup-heading-md mr-2">{stat.value}</h3>
                  <span className="catchup-text-sm text-green-400 catchup-flex catchup-items-center">
                    {stat.change}
                    <ArrowUpRight size={14} className="ml-1" />
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="catchup-grid catchup-grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Tasks Section */}
          <div className="lg:col-span-2">
            <div className="catchup-card">
              <div className="catchup-flex catchup-justify-between catchup-items-center catchup-mb-4">
                <h2 className="catchup-heading-sm">Upcoming Tasks</h2>
                <button className="catchup-button catchup-button-ghost text-[var(--catchup-cobalt)] text-sm">
                  View All
                </button>
              </div>
              <div className="space-y-3">
                {upcomingTasks.map((task) => (
                  <div 
                    key={task.id} 
                    className="catchup-flex catchup-items-center catchup-justify-between p-3 rounded-md bg-[var(--catchup-navy-dark)]"
                  >
                    <div className="catchup-flex catchup-items-center catchup-gap-3">
                      <input type="checkbox" className="rounded-sm border-gray-500 text-[var(--catchup-cobalt)]" />
                      <div>
                        <p className="catchup-text font-medium">{task.title}</p>
                        <p className="catchup-text-sm text-[var(--catchup-gray)]">Due: {task.dueDate}</p>
                      </div>
                    </div>
                    <div className="catchup-flex catchup-items-center catchup-gap-2">
                      <span 
                        className={`catchup-badge ${
                          task.priority === 'high' 
                            ? 'catchup-badge-red' 
                            : task.priority === 'medium' 
                            ? 'catchup-badge-yellow' 
                            : 'catchup-badge-green'
                        }`}
                      >
                        {task.priority}
                      </span>
                      <button className="catchup-button catchup-button-ghost text-[var(--catchup-gray)]">
                        <ChevronRight size={18} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Projects Section */}
            <div className="catchup-card catchup-mt-4">
              <div className="catchup-flex catchup-justify-between catchup-items-center catchup-mb-4">
                <h2 className="catchup-heading-sm">Active Projects</h2>
                <button className="catchup-button catchup-button-ghost text-[var(--catchup-cobalt)] text-sm">
                  View All
                </button>
              </div>
              <div className="space-y-4">
                {projects.map((project) => (
                  <div key={project.id} className="space-y-2">
                    <div className="catchup-flex catchup-justify-between catchup-items-center">
                      <h3 className="catchup-text font-medium">{project.name}</h3>
                      <span className="catchup-text-sm">{project.completed}/{project.tasks} tasks</span>
                    </div>
                    <div className="w-full h-2 bg-[var(--catchup-navy-dark)] rounded-full">
                      <div 
                        className="h-full bg-[var(--catchup-cobalt)] rounded-full" 
                        style={{ width: `${project.progress}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          
          {/* Right Sidebar */}
          <div className="space-y-4">
            {/* Calendar Section */}
            <div className="catchup-card">
              <div className="catchup-flex catchup-justify-between catchup-items-center catchup-mb-4">
                <h2 className="catchup-heading-sm">Today's Schedule</h2>
                <button className="catchup-button catchup-button-ghost text-[var(--catchup-cobalt)] text-sm">
                  <Calendar size={16} className="mr-1" />
                  View Calendar
                </button>
              </div>
              <div className="space-y-3">
                {events.map((event) => (
                  <div 
                    key={event.id} 
                    className="p-3 rounded-md border-l-4 border-[var(--catchup-cobalt)] bg-[var(--catchup-navy-dark)]"
                  >
                    <h3 className="catchup-text font-medium">{event.title}</h3>
                    <p className="catchup-text-sm text-[var(--catchup-gray)]">{event.time}</p>
                    <p className="catchup-text-sm text-[var(--catchup-gray)]">{event.location}</p>
                  </div>
                ))}
                {events.length === 0 && (
                  <p className="catchup-text-sm text-[var(--catchup-gray)] text-center py-4">
                    No events scheduled for today
                  </p>
                )}
              </div>
            </div>
            
            {/* Recent Activity */}
            <div className="catchup-card">
              <div className="catchup-flex catchup-justify-between catchup-items-center catchup-mb-4">
                <h2 className="catchup-heading-sm">Recent Activity</h2>
              </div>
              <div className="space-y-3">
                <div className="catchup-flex catchup-gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--catchup-cobalt-light)] flex items-center justify-center">
                    <User size={16} />
                  </div>
                  <div>
                    <p className="catchup-text-sm">You completed the task <strong>"Update client presentation"</strong></p>
                    <p className="catchup-text-sm text-[var(--catchup-gray)]">1 hour ago</p>
                  </div>
                </div>
                <div className="catchup-flex catchup-gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--catchup-cobalt-light)] flex items-center justify-center">
                    <Star size={16} />
                  </div>
                  <div>
                    <p className="catchup-text-sm">You achieved <strong>80% productivity</strong> this week!</p>
                    <p className="catchup-text-sm text-[var(--catchup-gray)]">3 hours ago</p>
                  </div>
                </div>
                <div className="catchup-flex catchup-gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--catchup-cobalt-light)] flex items-center justify-center">
                    <BarChart3 size={16} />
                  </div>
                  <div>
                    <p className="catchup-text-sm">Your weekly report is <strong>ready to view</strong></p>
                    <p className="catchup-text-sm text-[var(--catchup-gray)]">5 hours ago</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CatchUpLayout>
  );
}