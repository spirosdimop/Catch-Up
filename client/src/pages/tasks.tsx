import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { AiSuggestions } from "@/components/tasks/ai-suggestions";
import { 
  CheckCircle2, 
  Clock, 
  Calendar, 
  Flag, 
  AlertCircle, 
  Plus, 
  MoreHorizontal, 
  User,
  CalendarClock,
  ArrowRight,
  Search,
  Tag,
  Filter,
  Sparkles
} from "lucide-react";
// Import our custom styles
import "../styles/tasks.css";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { format } from "date-fns";

// Task priority types
type PriorityType = "normal" | "high" | "urgent";

// Task status types
type StatusType = "todo" | "in_progress" | "completed";

// Task type definition
interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate: Date | null;
  priority: PriorityType;
  status: StatusType;
  category: string;
  assignedTo?: string;
  assignedImage?: string;
  isFlagged: boolean;
  createdAt: Date;
}

interface NewTask {
  title: string;
  description?: string;
  dueDate?: Date | null;
  priority?: PriorityType;
  status?: StatusType;
  category?: string;
  assignedTo?: string;
  assignedImage?: string;
  isFlagged?: boolean;
}

export default function TasksPage() {
  // State for tasks
  const [tasks, setTasks] = useState<Task[]>([]);
  const [isNewTaskDialogOpen, setIsNewTaskDialogOpen] = useState(false);
  const [newTask, setNewTask] = useState<NewTask>({
    title: "",
    description: "",
    dueDate: null,
    priority: "normal",
    status: "todo",
    category: "Work",
    isFlagged: false
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [filterPriority, setFilterPriority] = useState<PriorityType | "all">("all");
  const [filterCategory, setFilterCategory] = useState<string>("all");

  // Initialize with some demo tasks
  useEffect(() => {
    const demoTasks: Task[] = [
      {
        id: 1,
        title: "Complete project proposal",
        description: "Finalize the project proposal document and send to client for review",
        dueDate: new Date(new Date().setHours(18, 0, 0, 0)), // Today at 6 PM
        priority: "high",
        status: "in_progress",
        category: "Work",
        assignedTo: "Alex Johnson",
        assignedImage: "",
        isFlagged: true,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 2))
      },
      {
        id: 2,
        title: "Schedule team meeting",
        description: "Coordinate with team members for sprint planning",
        dueDate: new Date(new Date().setHours(14, 30, 0, 0)), // Today at 2:30 PM
        priority: "normal",
        status: "todo",
        category: "Work",
        assignedTo: "Sarah Miller",
        assignedImage: "",
        isFlagged: false,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1))
      },
      {
        id: 3,
        title: "Review client feedback",
        description: "Go through the feedback received from client on the last deliverable",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 1)), // Tomorrow
        priority: "normal",
        status: "todo",
        category: "Work",
        assignedTo: "",
        isFlagged: false,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 3))
      },
      {
        id: 4,
        title: "Prepare presentation deck",
        description: "Create slides for the monthly progress update",
        dueDate: new Date(new Date().setDate(new Date().getDate() + 2)), // Day after tomorrow
        priority: "urgent",
        status: "todo",
        category: "Work",
        assignedTo: "Alex Johnson",
        assignedImage: "",
        isFlagged: true,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1))
      },
      {
        id: 5,
        title: "Update timesheet",
        description: "Log hours for the week",
        dueDate: new Date(new Date().setDate(new Date().getDate() - 1)), // Yesterday
        priority: "normal",
        status: "completed",
        category: "Administrative",
        assignedTo: "",
        isFlagged: false,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 4))
      },
      {
        id: 6,
        title: "Review code pull request",
        description: "Check the latest PR for the feature implementation",
        dueDate: new Date(new Date().setHours(12, 0, 0, 0)), // Today at noon
        priority: "high",
        status: "todo",
        category: "Development",
        assignedTo: "",
        isFlagged: false,
        createdAt: new Date(new Date().setDate(new Date().getDate() - 1))
      }
    ];
    
    setTasks(demoTasks);
  }, []);

  // Filter tasks by search term, priority, and category
  const filteredTasks = tasks.filter(task => {
    const matchesSearch = task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (task.description || "").toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === "all" || task.priority === filterPriority;
    const matchesCategory = filterCategory === "all" || task.category === filterCategory;
    
    return matchesSearch && matchesPriority && matchesCategory;
  });

  // Get today's tasks
  const todayTasks = filteredTasks.filter(task => {
    if (!task.dueDate) return false;
    const today = new Date();
    const taskDate = new Date(task.dueDate);
    return taskDate.getDate() === today.getDate() && 
           taskDate.getMonth() === today.getMonth() && 
           taskDate.getFullYear() === today.getFullYear() &&
           task.status !== "completed";
  });

  // Get upcoming tasks (future tasks, not today)
  const upcomingTasks = filteredTasks.filter(task => {
    if (!task.dueDate) return false;
    const today = new Date();
    today.setHours(23, 59, 59, 999); // End of today
    const taskDate = new Date(task.dueDate);
    return taskDate > today && task.status !== "completed";
  });

  // Get completed tasks
  const completedTasks = filteredTasks.filter(task => task.status === "completed");

  // Get flagged tasks
  const flaggedTasks = filteredTasks.filter(task => task.isFlagged);

  // Handle task status change
  const handleStatusChange = (taskId: number, newStatus: StatusType) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, status: newStatus } : task
    ));
  };

  // Toggle flagged status
  const toggleFlagged = (taskId: number) => {
    setTasks(tasks.map(task => 
      task.id === taskId ? { ...task, isFlagged: !task.isFlagged } : task
    ));
  };

  // Handle new task creation
  const handleCreateTask = () => {
    if (!newTask.title) return;
    
    const createdTask: Task = {
      id: tasks.length > 0 ? Math.max(...tasks.map(t => t.id)) + 1 : 1,
      title: newTask.title || "",
      description: newTask.description || "",
      dueDate: newTask.dueDate || null,
      priority: newTask.priority as PriorityType || "normal",
      status: newTask.status as StatusType || "todo",
      category: newTask.category || "Work",
      assignedTo: newTask.assignedTo || "",
      assignedImage: newTask.assignedImage || "",
      isFlagged: newTask.isFlagged || false,
      createdAt: new Date()
    };
    
    setTasks([...tasks, createdTask]);
    setNewTask({
      title: "",
      description: "",
      dueDate: null,
      priority: "normal",
      status: "todo",
      category: "Work",
      isFlagged: false
    });
    setIsNewTaskDialogOpen(false);
  };

  // Get unique categories for filter
  const categories = ["all", ...Array.from(new Set(tasks.map(task => task.category)))];

  // Task card component
  const TaskCard = ({ task }: { task: Task }) => (
    <div className={`task-card ${
      task.priority === 'urgent' ? 'task-card-urgent' : 
      task.priority === 'high' ? 'task-card-high' : 
      'task-card-normal'
    }`}>
      <div className="flex items-start justify-between">
        <div className="flex items-start flex-1">
          <div className="mr-3 mt-1">
            <Button
              variant="ghost"
              size="icon"
              className={`h-6 w-6 rounded-full ${task.status === 'completed' ? 'bg-green-500 text-white' : 'border border-white border-opacity-20'}`}
              onClick={() => handleStatusChange(task.id, task.status === 'completed' ? 'todo' : 'completed')}
            >
              {task.status === 'completed' && <CheckCircle2 className="h-4 w-4" />}
            </Button>
          </div>
          <div className="flex-1">
            <h3 className={`task-card-title ${task.status === 'completed' ? 'text-white text-opacity-40 line-through' : 'text-white'}`}>
              {task.title}
            </h3>
            {task.description && (
              <p className="task-card-description">{task.description}</p>
            )}
            <div className="task-card-meta">
              {task.dueDate && (
                <div className="flex items-center text-white text-opacity-70">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{format(task.dueDate, "MMM d, yyyy 'at' h:mm a")}</span>
                </div>
              )}
              {task.category && (
                <div className="flex items-center px-2 py-1 rounded-full bg-white bg-opacity-10 text-white text-opacity-90">
                  <Tag className="h-3 w-3 mr-1" />
                  {task.category}
                </div>
              )}
              {task.assignedTo && (
                <div className="flex items-center text-white text-opacity-90">
                  <Avatar className="h-5 w-5 mr-1">
                    <AvatarFallback className="bg-[#1d4ed8] text-white">{task.assignedTo.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <span>{task.assignedTo}</span>
                </div>
              )}
              <div className={`task-priority-badge ${
                task.priority === 'urgent' ? 'task-priority-urgent' : 
                task.priority === 'high' ? 'task-priority-high' : 
                'task-priority-normal'
              }`}>
                {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
              </div>
            </div>
          </div>
        </div>
        <div className="flex ml-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white hover:bg-opacity-10"
            onClick={() => toggleFlagged(task.id)}
          >
            <Flag className={`h-4 w-4 ${task.isFlagged ? 'text-red-500 fill-red-500' : 'text-white text-opacity-70'}`} />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-white hover:bg-white hover:bg-opacity-10"
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );

  // Task section component (collapsible)
  const TaskSection = ({ 
    title, 
    icon, 
    tasks, 
    defaultOpen = true 
  }: { 
    title: string; 
    icon: React.ReactNode; 
    tasks: Task[]; 
    defaultOpen?: boolean;
  }) => (
    <Collapsible defaultOpen={defaultOpen} className="tasks-section mb-6">
      <CollapsibleTrigger className="tasks-section-header flex items-center justify-between w-full rounded-lg mb-3">
        <div className="flex items-center">
          {icon}
          <h2 className="text-lg font-semibold ml-2">{title}</h2>
          <span className="ml-2 text-sm bg-[#1d4ed8] text-white px-2 py-0.5 rounded-full">
            {tasks.length}
          </span>
        </div>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-white hover:bg-white hover:bg-opacity-10">
          <ArrowRight className="h-4 w-4" />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="tasks-section-content">
        {tasks.length > 0 ? (
          tasks.map(task => <TaskCard key={task.id} task={task} />)
        ) : (
          <div className="text-center text-white text-opacity-60 py-6">
            <p>No tasks in this category</p>
          </div>
        )}
      </CollapsibleContent>
    </Collapsible>
  );

  return (
    <div className="tasks-page">
      <div className="tasks-container">
        <div className="tasks-header flex justify-between items-center">
          <h1 className="tasks-title">Tasks</h1>
          
          <div className="tasks-controls flex items-center gap-2 rounded-lg">
            <div className="relative">
              <Search className="h-4 w-4 absolute left-2.5 top-2.5 text-white opacity-60" />
              <Input 
                type="text" 
                placeholder="Search tasks..." 
                className="tasks-search pl-9 w-60 bg-opacity-10" 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <Select value={filterPriority} onValueChange={(value) => setFilterPriority(value as PriorityType | "all")}>
              <SelectTrigger className="w-[130px] bg-opacity-10 border-0 text-white">
                <Filter className="h-4 w-4 mr-2" />
                <span>Priority</span>
              </SelectTrigger>
              <SelectContent className="bg-[#0f2a4a] border-[#1d4ed8] text-white">
                <SelectItem value="all" className="hover:bg-[#1d4ed8] hover:bg-opacity-20">All Priorities</SelectItem>
                <SelectItem value="normal" className="hover:bg-[#1d4ed8] hover:bg-opacity-20">Normal</SelectItem>
                <SelectItem value="high" className="hover:bg-[#1d4ed8] hover:bg-opacity-20">High</SelectItem>
                <SelectItem value="urgent" className="hover:bg-[#1d4ed8] hover:bg-opacity-20">Urgent</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={filterCategory} onValueChange={(value) => setFilterCategory(value)}>
              <SelectTrigger className="w-[130px] bg-opacity-10 border-0 text-white">
                <Tag className="h-4 w-4 mr-2" />
                <span>Category</span>
              </SelectTrigger>
              <SelectContent className="bg-[#0f2a4a] border-[#1d4ed8] text-white">
                {categories.map(category => (
                  <SelectItem key={category} value={category} className="hover:bg-[#1d4ed8] hover:bg-opacity-20">
                    {category === "all" ? "All Categories" : category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="space-y-6">
          <Tabs defaultValue="list" className="w-full">
            <TabsList className="mb-6 tasks-tabs bg-opacity-10 border-0 p-0">
              <TabsTrigger value="list" className="tasks-tab flex items-center data-[state=active]:bg-opacity-10 data-[state=active]:border-[#1d4ed8] data-[state=active]:text-white">
                <CheckCircle2 className="h-4 w-4 mr-2" />
                List View
              </TabsTrigger>
              <TabsTrigger value="calendar" className="tasks-tab flex items-center data-[state=active]:bg-opacity-10 data-[state=active]:border-[#1d4ed8] data-[state=active]:text-white">
                <Calendar className="h-4 w-4 mr-2" />
                Calendar View
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="list">
              <div className="space-y-4">
                <TaskSection 
                  title="Today" 
                  icon={<Clock className="h-5 w-5 text-blue-600" />} 
                  tasks={todayTasks} 
                />
                
                <TaskSection 
                  title="Upcoming" 
                  icon={<CalendarClock className="h-5 w-5 text-purple-600" />} 
                  tasks={upcomingTasks} 
                />
                
                <TaskSection 
                  title="Flagged" 
                  icon={<Flag className="h-5 w-5 text-red-600" />} 
                  tasks={flaggedTasks} 
                  defaultOpen={false}
                />
                
                <TaskSection 
                  title="Completed" 
                  icon={<CheckCircle2 className="h-5 w-5 text-green-600" />} 
                  tasks={completedTasks} 
                  defaultOpen={false}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="calendar">
              <div className="p-8 text-center text-white text-opacity-70">
                <Calendar className="h-12 w-12 mx-auto mb-4 text-[#1d4ed8]" />
                <h3 className="text-lg font-medium text-white">Calendar View Coming Soon</h3>
                <p>We're working on a beautiful calendar view for your tasks.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
        
        {/* Floating "New Task" button */}
        <Dialog open={isNewTaskDialogOpen} onOpenChange={setIsNewTaskDialogOpen}>
          <DialogTrigger asChild>
            <button className="task-add-button">
              <Plus className="h-6 w-6" />
            </button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[550px]">
            <DialogHeader>
              <DialogTitle>Create New Task</DialogTitle>
              <DialogDescription>
                Add a new task to your list. Fill in the details below.
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Task Title</Label>
                <Input 
                  id="title" 
                  placeholder="Enter task title" 
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description (Optional)</Label>
                <Textarea 
                  id="description" 
                  placeholder="Enter task description" 
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date</Label>
                  <Input 
                    id="dueDate" 
                    type="datetime-local" 
                    onChange={(e) => setNewTask({...newTask, dueDate: e.target.value ? new Date(e.target.value) : null})}
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newTask.priority as string} 
                    onValueChange={(value) => setNewTask({...newTask, priority: value as PriorityType})}
                  >
                    <SelectTrigger id="priority">
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newTask.category} 
                    onValueChange={(value) => setNewTask({...newTask, category: value})}
                  >
                    <SelectTrigger id="category">
                      <SelectValue placeholder="Select category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Work">Work</SelectItem>
                      <SelectItem value="Personal">Personal</SelectItem>
                      <SelectItem value="Development">Development</SelectItem>
                      <SelectItem value="Administrative">Administrative</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="assignedTo">Assign To (Optional)</Label>
                  <Input 
                    id="assignedTo" 
                    placeholder="Enter name" 
                    value={newTask.assignedTo || ""}
                    onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="flagged"
                  checked={newTask.isFlagged}
                  onChange={(e) => setNewTask({...newTask, isFlagged: e.target.checked})}
                  className="rounded border-gray-300"
                />
                <Label htmlFor="flagged" className="text-sm font-normal">Flag this task</Label>
              </div>
            </div>
            
            <DialogFooter>
              <Button 
                variant="outline" 
                onClick={() => setIsNewTaskDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleCreateTask}>Create Task</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}