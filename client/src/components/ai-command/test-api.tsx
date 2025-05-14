import { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

export function TestApi() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const { toast } = useToast();

  const testApi = async () => {
    setLoading(true);
    try {
      // Test a simple command
      const { data } = await axios.post("/api/ai/process-command", {
        command: "Create a task to update the website content"
      });
      
      setResult(JSON.stringify(data, null, 2));
      
      toast({
        title: "API Test",
        description: "API call successful! Check results below."
      });
    } catch (err: any) {
      console.error("API test failed:", err);
      setResult(`Error: ${err.message}`);
      
      toast({
        variant: "destructive",
        title: "API Test Failed",
        description: err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="mt-4">
      <CardHeader>
        <CardTitle>API Test</CardTitle>
      </CardHeader>
      <CardContent>
        <Button 
          onClick={testApi}
          disabled={loading}
        >
          {loading ? "Testing..." : "Test API"}
        </Button>
        
        {result && (
          <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto max-h-60">
            {result}
          </pre>
        )}
      </CardContent>
    </Card>
  );
}