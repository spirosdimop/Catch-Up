import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Terminal, Send, Settings, MessageSquare, Sparkles, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface CommandResult {
  success: boolean;
  result?: string;
  action?: string;
  task?: {
    title: string;
    description: string;
    priority: string;
    category: string;
  };
}

interface CommandProcessorProps {
  onTaskCreated?: (task: any) => void;
}

export function CommandProcessor({ onTaskCreated }: CommandProcessorProps) {
  const [command, setCommand] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<CommandResult | null>(null);
  const { toast } = useToast();

  const processCommand = async () => {
    if (!command.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const { data } = await axios.post("/api/ai/process-command", { command });
      
      setResult(data);
      
      // If the command created a task, notify the parent component
      if (data.success && data.action === "create_task" && data.task && onTaskCreated) {
        onTaskCreated(data.task);
        toast({
          title: "Task Created",
          description: `New task "${data.task.title}" has been created`
        });
      }
    } catch (error) {
      console.error("Error processing command:", error);
      toast({
        variant: "destructive",
        title: "Command Failed",
        description: "An error occurred while processing your command."
      });
    } finally {
      setLoading(false);
    }
  };

  const getResultIcon = () => {
    if (!result) return null;
    
    if (!result.success) return null;
    
    switch (result.action) {
      case "update_settings":
        return <Settings className="h-5 w-5 text-blue-500" />;
      case "create_message":
        return <MessageSquare className="h-5 w-5 text-green-500" />;
      case "create_task":
        return <Sparkles className="h-5 w-5 text-purple-500" />;
      default:
        return null;
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Process command on Ctrl+Enter or Cmd+Enter
    if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
      e.preventDefault();
      processCommand();
    }
  };

  return (
    <Card className="bg-opacity-30 backdrop-blur-sm border-none shadow-lg">
      <CardHeader className="pb-2">
        <CardTitle className="text-white flex items-center text-xl">
          <Terminal className="mr-2 h-5 w-5 text-blue-300" />
          AI Command Center
        </CardTitle>
        <CardDescription className="text-white text-opacity-70">
          Send natural language commands to control app functions
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Textarea
            value={command}
            onChange={(e) => setCommand(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Enter a command like 'Schedule a meeting with John at 3pm tomorrow' or 'Create a high priority task to finish the project proposal'"
            className="min-h-[100px] bg-black bg-opacity-20 border-gray-700 text-white"
          />
          <div className="text-xs text-white text-opacity-50 italic">
            Press Ctrl+Enter to send command
          </div>
        </div>
        
        <Button 
          onClick={processCommand} 
          disabled={loading || !command.trim()} 
          className="w-full bg-blue-600 hover:bg-blue-700"
        >
          {loading ? (
            <span className="flex items-center">
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Processing...
            </span>
          ) : (
            <span className="flex items-center">
              <Send className="h-4 w-4 mr-2" />
              Send Command
            </span>
          )}
        </Button>
        
        {result && (
          <div className={`p-4 mt-4 rounded-md ${
            result.success 
              ? 'bg-green-900 bg-opacity-30 border border-green-700' 
              : 'bg-red-900 bg-opacity-30 border border-red-700'
          }`}>
            <div className="flex items-start">
              {getResultIcon()}
              <div className={`${getResultIcon() ? 'ml-2' : ''} text-white`}>
                {result.result || (result.task ? `Created task: ${result.task.title}` : '')}
              </div>
            </div>
          </div>
        )}
      </CardContent>
      <CardFooter className="pt-1 pb-3 text-xs text-white text-opacity-50 italic">
        <div>
          Try commands like:
          <ul className="mt-1 space-y-1 list-disc list-inside">
            <li>Create a task to review project proposal due tomorrow</li>
            <li>Set my theme preference to dark mode</li>
            <li>Send a message to team@example.com about the project status</li>
          </ul>
        </div>
      </CardFooter>
    </Card>
  );
}