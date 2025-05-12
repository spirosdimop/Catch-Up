import { PageTitle } from "@/components/ui/page-title";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { MessageSquare, User } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function Messages() {
  const sampleClients = [
    { id: 1, name: "Sarah Johnson", avatar: "", lastMessage: "Could we reschedule tomorrow's meeting?" },
    { id: 2, name: "Alex Thompson", avatar: "", lastMessage: "Thanks for the project update!" },
  ];

  return (
    <div className="space-y-6 p-6">
      <PageTitle 
        title="Messages" 
        description="Chat with your clients and team members" 
        icon={<MessageSquare className="h-6 w-6 text-primary" />}
      />
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <CardDescription>Recent messages from your clients</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {sampleClients.map(client => (
                <div key={client.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted cursor-pointer">
                  <Avatar>
                    <AvatarImage src={client.avatar} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {client.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium">{client.name}</p>
                    <p className="text-sm text-muted-foreground truncate">{client.lastMessage}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="md:col-span-2">
          <CardHeader className="border-b">
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarFallback className="bg-primary text-primary-foreground">
                  S
                </AvatarFallback>
              </Avatar>
              <div>
                <CardTitle>Sarah Johnson</CardTitle>
                <CardDescription>Online</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-6 h-[400px] flex flex-col">
            <div className="flex-1 space-y-4 overflow-auto">
              <div className="flex items-start gap-3 max-w-[80%]">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs bg-primary text-primary-foreground">
                    S
                  </AvatarFallback>
                </Avatar>
                <div className="bg-muted p-3 rounded-lg">
                  <p>Could we reschedule tomorrow's meeting? Something came up with another client.</p>
                  <p className="text-xs text-muted-foreground mt-1">10:32 AM</p>
                </div>
              </div>
              
              <div className="flex items-start gap-3 max-w-[80%] ml-auto flex-row-reverse">
                <Avatar className="h-8 w-8">
                  <AvatarFallback className="text-xs">
                    <User className="h-4 w-4" />
                  </AvatarFallback>
                </Avatar>
                <div className="bg-primary p-3 rounded-lg text-primary-foreground">
                  <p>Sure, no problem. How about Thursday at the same time?</p>
                  <p className="text-xs text-primary-foreground/70 mt-1">10:45 AM</p>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2 mt-4">
              <Input placeholder="Type a message..." className="flex-1" />
              <Button>Send</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}