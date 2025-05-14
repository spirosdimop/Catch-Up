import React, { useState } from 'react';
import { CatchUpLayout } from '../../components/catchup/Layout';
import { 
  Plus, 
  Calendar,
  Filter,
  ChevronDown,
  Check,
  Clock,
  MoreVertical,
  Tag,
  Search
} from 'lucide-react';
import '../../styles/catchup.css';

// Define task type for typescript
type Task = {
  id: number;
  title: string;
  description?: string;
  dueDate: string;
  priority: 'low' | 'medium' | 'high';
  status: 'to-do' | 'in-progress' | 'completed';
  category: string;
  tags?: string[];
  createdAt: string;
  completedAt?: string;
};

type Category = {
  id: number;
  name: string;
  count: number;
  color: string;
};

export default function TasksPage() {
  const [activeFilter, setActiveFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Sample task data
  const categories: Category[] = [
    { id: 1, name: 'All Tasks', count: 12, color: 'var(--catchup-cobalt)' },
    { id: 2, name: 'Work', count: 8, color: '#3B82F6' },
    { id: 3, name: 'Personal', count: 4, color: '#EC4899' },
    { id: 4, name: 'Errands', count: 2, color: '#10B981' },
    { id: 5, name: 'Ideas', count: 3, color: '#F59E0B' },
  ];
  
  const tasks: Task[] = [
    {
      id: 1,
      title: 'Finalize Q2 Marketing Strategy',
      description: 'Complete the marketing strategy document with budget allocations and campaign timelines',
      dueDate: '2025-05-15',
      priority: 'high',
      status: 'in-progress',
      category: 'Work',
      tags: ['Marketing', 'Planning', 'Q2'],
      createdAt: '2025-05-10',
    },
    {
      id: 2,
      title: 'Weekly team meeting',
      description: 'Discuss project progress and assign new tasks',
      dueDate: '2025-05-14',
      priority: 'medium',
      status: 'to-do',
      category: 'Work',
      tags: ['Meeting', 'Team'],
      createdAt: '2025-05-12',
    },
    {
      id: 3,
      title: 'Review website analytics',
      description: 'Analyze user behavior and conversion rates',
      dueDate: '2025-05-16',
      priority: 'medium',
      status: 'to-do',
      category: 'Work',
      tags: ['Analytics', 'Website'],
      createdAt: '2025-05-11',
    },
    {
      id: 4,
      title: 'Book flight tickets',
      description: 'Purchase tickets for the business trip next month',
      dueDate: '2025-05-20',
      priority: 'high',
      status: 'to-do',
      category: 'Errands',
      tags: ['Travel', 'Booking'],
      createdAt: '2025-05-12',
    },
    {
      id: 5,
      title: 'Gym session',
      description: 'Complete 1-hour workout',
      dueDate: '2025-05-14',
      priority: 'low',
      status: 'to-do',
      category: 'Personal',
      tags: ['Health', 'Exercise'],
      createdAt: '2025-05-13',
    },
    {
      id: 6,
      title: 'Read new business book',
      description: 'Read at least 30 pages',
      dueDate: '2025-05-18',
      priority: 'low',
      status: 'to-do',
      category: 'Personal',
      tags: ['Reading', 'Development'],
      createdAt: '2025-05-10',
    },
    {
      id: 7,
      title: 'Update portfolio website',
      description: 'Add recent projects and refresh design',
      dueDate: '2025-05-25',
      priority: 'medium',
      status: 'to-do',
      category: 'Work',
      tags: ['Website', 'Portfolio'],
      createdAt: '2025-05-08',
    }
  ];
  
  // Filter tasks based on active filter
  const filteredTasks = tasks.filter(task => {
    // Filter by category
    if (activeFilter !== 'all' && task.category !== activeFilter) {
      return false;
    }
    
    // Filter by search query
    if (searchQuery && !task.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    return true;
  });
  
  // Group tasks by status
  const todoTasks = filteredTasks.filter(task => task.status === 'to-do');
  const inProgressTasks = filteredTasks.filter(task => task.status === 'in-progress');
  const completedTasks = filteredTasks.filter(task => task.status === 'completed');
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };
  
  // Get background color based on priority
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'catchup-badge-red';
      case 'medium':
        return 'catchup-badge-yellow';
      case 'low':
        return 'catchup-badge-green';
      default:
        return 'catchup-badge-blue';
    }
  };

  return (
    <CatchUpLayout>
      <div className="catchup-flex catchup-flex-col h-full">
        {/* Header */}
        <div className="catchup-flex catchup-items-center catchup-justify-between catchup-mb-6">
          <div>
            <h1 className="catchup-heading-lg">Tasks</h1>
            <p className="catchup-text-sm text-[var(--catchup-gray)]">
              Manage your tasks and stay organized
            </p>
          </div>
          <button className="catchup-button catchup-button-primary">
            <Plus size={18} className="mr-2" />
            Add Task
          </button>
        </div>
        
        {/* Search and Filter */}
        <div className="catchup-flex catchup-items-center catchup-gap-4 catchup-mb-6">
          <div className="catchup-flex-1 relative">
            <input
              type="text"
              placeholder="Search tasks..."
              className="catchup-input pl-10"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute left-3 top-3 text-[var(--catchup-gray)]" size={18} />
          </div>
          <div className="catchup-flex catchup-items-center catchup-gap-2">
            <button className="catchup-button catchup-button-secondary">
              <Filter size={16} className="mr-2" />
              Filter
              <ChevronDown size={16} className="ml-1" />
            </button>
            
            <button className="catchup-button catchup-button-ghost">
              <Calendar size={16} className="mr-2" />
              Today
            </button>
          </div>
        </div>
        
        {/* Categories */}
        <div className="catchup-flex catchup-gap-2 catchup-mb-6 overflow-x-auto py-2">
          {categories.map((category) => (
            <button
              key={category.id}
              className={`py-2 px-4 rounded-full text-sm font-medium whitespace-nowrap ${
                activeFilter === (category.name === 'All Tasks' ? 'all' : category.name)
                  ? 'bg-[var(--catchup-cobalt)] text-white'
                  : 'bg-[var(--catchup-navy-light)] text-[var(--catchup-light-gray)]'
              }`}
              onClick={() => setActiveFilter(category.name === 'All Tasks' ? 'all' : category.name)}
            >
              <span>{category.name}</span>
              <span className="ml-2 px-2 py-0.5 rounded-full bg-black bg-opacity-20 text-xs">
                {category.count}
              </span>
            </button>
          ))}
        </div>
        
        {/* Task Lists */}
        <div className="catchup-grid catchup-grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
          {/* Todo Column */}
          <div className="catchup-flex catchup-flex-col">
            <div className="catchup-flex catchup-items-center catchup-justify-between catchup-mb-3">
              <h2 className="catchup-heading-sm catchup-flex catchup-items-center">
                To Do
                <span className="ml-2 text-sm px-2 py-0.5 rounded-full bg-[var(--catchup-navy-light)] text-[var(--catchup-light-gray)]">
                  {todoTasks.length}
                </span>
              </h2>
              <button className="catchup-button catchup-button-ghost p-1">
                <Plus size={18} />
              </button>
            </div>
            
            <div className="space-y-3">
              {todoTasks.map((task) => (
                <div
                  key={task.id}
                  className="catchup-card p-4 border border-[var(--catchup-navy-dark)] hover:border-[var(--catchup-cobalt)] transition-colors"
                >
                  <div className="catchup-flex catchup-justify-between">
                    <h3 className="catchup-text font-medium mb-2">{task.title}</h3>
                    <button className="catchup-button catchup-button-ghost p-1">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  
                  {task.description && (
                    <p className="catchup-text-sm text-[var(--catchup-gray)] mb-3">
                      {task.description.length > 80 
                        ? task.description.substring(0, 80) + '...' 
                        : task.description}
                    </p>
                  )}
                  
                  <div className="catchup-flex catchup-items-center catchup-gap-2 mb-3">
                    {task.tags?.map((tag, index) => (
                      <span 
                        key={index} 
                        className="catchup-badge catchup-badge-blue catchup-flex catchup-items-center"
                      >
                        <Tag size={12} className="mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="catchup-flex catchup-items-center catchup-justify-between text-sm">
                    <div className="catchup-flex catchup-items-center catchup-gap-2">
                      <span className="catchup-flex catchup-items-center text-[var(--catchup-gray)]">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                    <span 
                      className={`catchup-badge ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
              
              {todoTasks.length === 0 && (
                <div className="catchup-card catchup-flex catchup-flex-col catchup-items-center catchup-justify-center p-6 text-center">
                  <p className="catchup-text-sm text-[var(--catchup-gray)]">
                    No tasks found
                  </p>
                  <button className="catchup-button catchup-button-ghost text-[var(--catchup-cobalt)] text-sm mt-2">
                    <Plus size={16} className="mr-1" /> Add Task
                  </button>
                </div>
              )}
            </div>
          </div>
          
          {/* In Progress Column */}
          <div className="catchup-flex catchup-flex-col">
            <div className="catchup-flex catchup-items-center catchup-justify-between catchup-mb-3">
              <h2 className="catchup-heading-sm catchup-flex catchup-items-center">
                In Progress
                <span className="ml-2 text-sm px-2 py-0.5 rounded-full bg-[var(--catchup-navy-light)] text-[var(--catchup-light-gray)]">
                  {inProgressTasks.length}
                </span>
              </h2>
              <button className="catchup-button catchup-button-ghost p-1">
                <Plus size={18} />
              </button>
            </div>
            
            <div className="space-y-3">
              {inProgressTasks.map((task) => (
                <div
                  key={task.id}
                  className="catchup-card p-4 border border-[var(--catchup-navy-dark)] hover:border-[var(--catchup-cobalt)] transition-colors"
                >
                  <div className="catchup-flex catchup-justify-between">
                    <h3 className="catchup-text font-medium mb-2">{task.title}</h3>
                    <button className="catchup-button catchup-button-ghost p-1">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  
                  {task.description && (
                    <p className="catchup-text-sm text-[var(--catchup-gray)] mb-3">
                      {task.description.length > 80 
                        ? task.description.substring(0, 80) + '...' 
                        : task.description}
                    </p>
                  )}
                  
                  <div className="catchup-flex catchup-items-center catchup-gap-2 mb-3">
                    {task.tags?.map((tag, index) => (
                      <span 
                        key={index} 
                        className="catchup-badge catchup-badge-blue catchup-flex catchup-items-center"
                      >
                        <Tag size={12} className="mr-1" />
                        {tag}
                      </span>
                    ))}
                  </div>
                  
                  <div className="catchup-flex catchup-items-center catchup-justify-between text-sm">
                    <div className="catchup-flex catchup-items-center catchup-gap-2">
                      <span className="catchup-flex catchup-items-center text-[var(--catchup-gray)]">
                        <Calendar size={14} className="mr-1" />
                        {formatDate(task.dueDate)}
                      </span>
                    </div>
                    <span 
                      className={`catchup-badge ${getPriorityColor(task.priority)}`}
                    >
                      {task.priority}
                    </span>
                  </div>
                </div>
              ))}
              
              {inProgressTasks.length === 0 && (
                <div className="catchup-card catchup-flex catchup-flex-col catchup-items-center catchup-justify-center p-6 text-center">
                  <p className="catchup-text-sm text-[var(--catchup-gray)]">
                    No tasks in progress
                  </p>
                </div>
              )}
            </div>
          </div>
          
          {/* Completed Column */}
          <div className="catchup-flex catchup-flex-col">
            <div className="catchup-flex catchup-items-center catchup-justify-between catchup-mb-3">
              <h2 className="catchup-heading-sm catchup-flex catchup-items-center">
                Completed
                <span className="ml-2 text-sm px-2 py-0.5 rounded-full bg-[var(--catchup-navy-light)] text-[var(--catchup-light-gray)]">
                  {completedTasks.length}
                </span>
              </h2>
              <button className="catchup-button catchup-button-ghost p-1">
                <Check size={18} />
              </button>
            </div>
            
            <div className="space-y-3">
              {completedTasks.map((task) => (
                <div
                  key={task.id}
                  className="catchup-card p-4 border border-[var(--catchup-navy-dark)] hover:border-[var(--catchup-cobalt)] transition-colors opacity-70"
                >
                  <div className="catchup-flex catchup-justify-between">
                    <h3 className="catchup-text font-medium mb-2 line-through">{task.title}</h3>
                    <button className="catchup-button catchup-button-ghost p-1">
                      <MoreVertical size={16} />
                    </button>
                  </div>
                  
                  <div className="catchup-flex catchup-items-center catchup-justify-between text-sm">
                    <span className="catchup-flex catchup-items-center text-[var(--catchup-gray)]">
                      <Clock size={14} className="mr-1" />
                      Completed {task.completedAt ? formatDate(task.completedAt) : 'recently'}
                    </span>
                  </div>
                </div>
              ))}
              
              {completedTasks.length === 0 && (
                <div className="catchup-card catchup-flex catchup-flex-col catchup-items-center catchup-justify-center p-6 text-center">
                  <p className="catchup-text-sm text-[var(--catchup-gray)]">
                    No completed tasks
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </CatchUpLayout>
  );
}