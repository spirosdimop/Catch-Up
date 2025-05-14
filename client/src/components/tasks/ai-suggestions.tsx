import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"; 
import { Lightbulb, Sparkles, List, Plus, Brain, BarChart2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

interface Task {
  id: number;
  title: string;
  description?: string;
  dueDate: Date | null;
  priority: "normal" | "high" | "urgent";
  status: "todo" | "in_progress" | "completed";
  category: string;
  assignedTo?: string;
  assignedImage?: string;
  isFlagged: boolean;
  createdAt: Date;
}

interface TaskSuggestion {
  title: string;
  description: string;
  priority: "normal" | "high" | "urgent";
  category: string;
}

interface TaskWithReason {
  id: number;
  title: string;
  reason: string;
}

interface TaskPrioritization {
  prioritizedTasks: TaskWithReason[];
  explanation: string;
}

export function AiSuggestions({ 
  tasks,
  onAddTask
}: { 
  tasks: Task[],
  onAddTask: (task: Omit<Task, "id" | "createdAt" | "status" | "isFlagged">) => void
}) {
  const [loading, setLoading] = useState({
    suggestions: false,
    summary: false,
    prioritization: false
  });
  const [suggestions, setSuggestions] = useState<TaskSuggestion[]>([]);
  const [summary, setSummary] = useState("");
  const [prioritization, setPrioritization] = useState<TaskPrioritization | null>(null);
  const [context, setContext] = useState("");
  const { toast } = useToast();

  const generateSuggestions = async () => {
    setLoading(prev => ({ ...prev, suggestions: true }));
    try {
      const { data } = await axios.post("/api/ai/suggest-tasks", {
        tasks,
        context
      });
      
      setSuggestions(data.suggestions || []);
    } catch (error) {
      console.error("Error generating suggestions:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate task suggestions. Please try again."
      });
    } finally {
      setLoading(prev => ({ ...prev, suggestions: false }));
    }
  };

  const generateSummary = async () => {
    setLoading(prev => ({ ...prev, summary: true }));
    try {
      const { data } = await axios.post("/api/ai/task-summary", {
        tasks
      });
      
      setSummary(data.summary || "");
    } catch (error) {
      console.error("Error generating summary:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate task summary. Please try again."
      });
    } finally {
      setLoading(prev => ({ ...prev, summary: false }));
    }
  };

  const generatePrioritization = async () => {
    setLoading(prev => ({ ...prev, prioritization: true }));
    try {
      const { data } = await axios.post("/api/ai/prioritize-tasks", {
        tasks: tasks.filter(t => t.status !== "completed")
      });
      
      setPrioritization(data);
    } catch (error) {
      console.error("Error generating prioritization:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to prioritize tasks. Please try again."
      });
    } finally {
      setLoading(prev => ({ ...prev, prioritization: false }));
    }
  };

  const addSuggestion = (suggestion: TaskSuggestion) => {
    onAddTask({
      title: suggestion.title,
      description: suggestion.description,
      dueDate: null,
      priority: suggestion.priority,
      category: suggestion.category,
    });
    
    toast({
      title: "Task Added",
      description: `"${suggestion.title}" has been added to your tasks.`
    });
  };

  return (
    <Card className="bg-opacity-30 backdrop-blur-sm border-none shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center text-xl">
          <Brain className="mr-2 h-5 w-5 text-blue-300" />
          AI Task Assistant
        </CardTitle>
        <CardDescription className="text-white text-opacity-70">
          Let AI help optimize your productivity
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <Tabs defaultValue="suggestions" className="w-full">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="suggestions" className="text-sm">
              <Lightbulb className="h-4 w-4 mr-2" />
              Task Ideas
            </TabsTrigger>
            <TabsTrigger value="summary" className="text-sm">
              <BarChart2 className="h-4 w-4 mr-2" />
              Analysis
            </TabsTrigger>
            <TabsTrigger value="prioritization" className="text-sm">
              <List className="h-4 w-4 mr-2" />
              Priority Order
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="suggestions">
            <div className="space-y-4">
              <Textarea 
                placeholder="Add context about your priorities or current focus (optional)"
                value={context}
                onChange={(e) => setContext(e.target.value)}
                className="h-20 resize-none bg-black bg-opacity-20 border-gray-700"
              />
              
              <Button 
                onClick={generateSuggestions}
                disabled={loading.suggestions}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading.suggestions ? (
                  <span className="flex items-center">Generating...</span>
                ) : (
                  <span className="flex items-center">
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate Task Suggestions
                  </span>
                )}
              </Button>
              
              {suggestions.length > 0 && (
                <div className="space-y-3 mt-3">
                  <h3 className="text-sm font-medium text-white">Suggested Tasks:</h3>
                  {suggestions.map((suggestion, index) => (
                    <div 
                      key={index} 
                      className="p-3 bg-gray-800 bg-opacity-50 rounded-md relative pr-10"
                    >
                      <h4 className="font-medium text-white">{suggestion.title}</h4>
                      <p className="text-sm text-white text-opacity-70 mt-1">
                        {suggestion.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge className={`text-xs ${
                          suggestion.priority === "urgent" ? "bg-red-500" : 
                          suggestion.priority === "high" ? "bg-amber-500" : 
                          "bg-blue-500"
                        }`}>
                          {suggestion.priority}
                        </Badge>
                        <Badge variant="outline" className="text-xs text-white border-gray-600">
                          {suggestion.category}
                        </Badge>
                      </div>
                      <Button 
                        size="icon" 
                        variant="ghost" 
                        className="absolute top-2 right-2 h-7 w-7 text-white hover:bg-blue-700"
                        onClick={() => addSuggestion(suggestion)}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="summary">
            <div className="space-y-4">
              <Button 
                onClick={generateSummary}
                disabled={loading.summary}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading.summary ? (
                  <span className="flex items-center">Analyzing...</span>
                ) : (
                  <span className="flex items-center">
                    <BarChart2 className="h-4 w-4 mr-2" />
                    Analyze Task Status
                  </span>
                )}
              </Button>
              
              {summary && (
                <div className="p-4 bg-gray-800 bg-opacity-50 rounded-md">
                  <div className="text-sm text-white whitespace-pre-line">
                    {summary}
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="prioritization">
            <div className="space-y-4">
              <Button 
                onClick={generatePrioritization}
                disabled={loading.prioritization}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                {loading.prioritization ? (
                  <span className="flex items-center">Analyzing...</span>
                ) : (
                  <span className="flex items-center">
                    <List className="h-4 w-4 mr-2" />
                    Optimize Task Order
                  </span>
                )}
              </Button>
              
              {prioritization && (
                <div className="space-y-3">
                  <div className="p-3 bg-gray-800 bg-opacity-50 rounded-md">
                    <h4 className="font-medium text-white">Strategy:</h4>
                    <p className="text-sm text-white text-opacity-70">
                      {prioritization.explanation}
                    </p>
                  </div>
                  
                  <h3 className="text-sm font-medium text-white">Suggested Order:</h3>
                  {prioritization.prioritizedTasks.map((task, index) => (
                    <div 
                      key={index} 
                      className="p-3 bg-gray-800 bg-opacity-50 rounded-md"
                    >
                      <div className="flex items-start gap-3">
                        <div className="bg-blue-600 text-white text-xs font-medium rounded-full h-5 w-5 flex items-center justify-center mt-0.5">
                          {index + 1}
                        </div>
                        <div>
                          <h4 className="font-medium text-white">{task.title}</h4>
                          <p className="text-sm text-white text-opacity-70 mt-1">
                            {task.reason}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="pt-1 text-xs text-white text-opacity-50 italic">
        Powered by GPT-4o for intelligent task management
      </CardFooter>
    </Card>
  );
}