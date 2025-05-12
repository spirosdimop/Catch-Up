import { useState } from "react";
import { PageTitle } from "@/components/ui/page-title";
import { MessageSquare, Search, Plus, UserCircle, Send, Phone, Video, MoreHorizontal } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { format } from "date-fns";

type Message = {
  id: number;
  sender: string;
  content: string;
  timestamp: Date;
  isOutgoing: boolean;
  read: boolean;
};

type Contact = {
  id: number;
  name: string;
  avatar?: string;
  lastMessage?: string;
  lastMessageTime?: Date;
  unreadCount: number;
  online: boolean;
};

export default function Messages() {
  const [activeContact, setActiveContact] = useState<number | null>(1); // Default to first contact
  
  // Simulated contacts data
  const contacts: Contact[] = [
    {
      id: 1,
      name: "Sarah Miller",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      lastMessage: "Let me know when you finish the mockups!",
      lastMessageTime: new Date(2023, 4, 11, 14, 32),
      unreadCount: 2,
      online: true
    },
    {
      id: 2,
      name: "David Chen",
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      lastMessage: "The project deadline has been extended.",
      lastMessageTime: new Date(2023, 4, 10, 9, 15),
      unreadCount: 0,
      online: true
    },
    {
      id: 3,
      name: "Emily Jackson",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      lastMessage: "Can we schedule a call to discuss the project?",
      lastMessageTime: new Date(2023, 4, 9, 16, 45),
      unreadCount: 0,
      online: false
    },
    {
      id: 4,
      name: "Michael Roberts",
      lastMessage: "Invoice #1082 has been paid.",
      lastMessageTime: new Date(2023, 4, 8, 11, 20),
      unreadCount: 0,
      online: false
    },
    {
      id: 5,
      name: "Jessica Lee",
      avatar: "https://images.unsplash.com/photo-1517841905240-472988babdf9?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80",
      lastMessage: "Thanks for your help with the website!",
      lastMessageTime: new Date(2023, 4, 7, 13, 10),
      unreadCount: 0,
      online: true
    }
  ];
  
  // Simulated messages for the active conversation
  const conversations: Record<number, Message[]> = {
    1: [
      { id: 1, sender: "Sarah Miller", content: "Hi! How's the progress on the website redesign?", timestamp: new Date(2023, 4, 11, 10, 15), isOutgoing: false, read: true },
      { id: 2, sender: "You", content: "I'm making good progress! Should be done with the homepage by tomorrow.", timestamp: new Date(2023, 4, 11, 10, 20), isOutgoing: true, read: true },
      { id: 3, sender: "Sarah Miller", content: "That's great to hear! Can you share a preview when you get a chance?", timestamp: new Date(2023, 4, 11, 10, 25), isOutgoing: false, read: true },
      { id: 4, sender: "You", content: "Absolutely, I'll send you a link to the draft by end of day.", timestamp: new Date(2023, 4, 11, 10, 30), isOutgoing: true, read: true },
      { id: 5, sender: "Sarah Miller", content: "Perfect! Also, do you think we could add an animation to the hero section?", timestamp: new Date(2023, 4, 11, 13, 45), isOutgoing: false, read: true },
      { id: 6, sender: "You", content: "I think that could work well. I'll mock up a version with and without so you can compare.", timestamp: new Date(2023, 4, 11, 14, 0), isOutgoing: true, read: true },
      { id: 7, sender: "Sarah Miller", content: "Let me know when you finish the mockups!", timestamp: new Date(2023, 4, 11, 14, 32), isOutgoing: false, read: false }
    ],
    2: [
      { id: 1, sender: "David Chen", content: "Good news about the project deadline.", timestamp: new Date(2023, 4, 10, 9, 10), isOutgoing: false, read: true },
      { id: 2, sender: "David Chen", content: "The project deadline has been extended.", timestamp: new Date(2023, 4, 10, 9, 15), isOutgoing: false, read: true },
      { id: 3, sender: "You", content: "That's great news! How much more time do we have?", timestamp: new Date(2023, 4, 10, 9, 30), isOutgoing: true, read: true }
    ]
  };
  
  const [newMessage, setNewMessage] = useState("");
  
  const handleSendMessage = () => {
    if (!newMessage.trim() || !activeContact) return;
    // In a real app, this would send the message to the API
    console.log(`Sending message to contact ${activeContact}: ${newMessage}`);
    setNewMessage("");
  };
  
  const activeConversation = activeContact ? conversations[activeContact] || [] : [];
  const selectedContact = activeContact ? contacts.find(c => c.id === activeContact) : null;
  
  return (
    <div className="h-full flex flex-col">
      <div className="p-6">
        <PageTitle 
          title="Messages" 
          description="Communicate with your clients and team members" 
          icon={<MessageSquare className="h-6 w-6 text-primary" />}
        />
      </div>
      
      <div className="flex-1 flex h-[calc(100vh-12rem)] overflow-hidden">
        {/* Contacts sidebar */}
        <div className="w-full md:w-80 border-r bg-card">
          <div className="p-4 border-b">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search messages..." 
                className="pl-9"
              />
            </div>
          </div>
          
          <Tabs defaultValue="all" className="w-full">
            <div className="px-4 pt-4">
              <TabsList className="grid grid-cols-2 w-full">
                <TabsTrigger value="all">All Messages</TabsTrigger>
                <TabsTrigger value="unread">Unread</TabsTrigger>
              </TabsList>
            </div>
            
            <TabsContent value="all" className="m-0">
              <ScrollArea className="h-[calc(100vh-15rem)]">
                <div className="space-y-1 p-2">
                  {contacts.map((contact) => (
                    <button
                      key={contact.id}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${activeContact === contact.id ? 'bg-accent' : 'hover:bg-accent/50'}`}
                      onClick={() => setActiveContact(contact.id)}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={contact.avatar} />
                          <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {contact.online && (
                          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-background"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium truncate">{contact.name}</p>
                          {contact.lastMessageTime && (
                            <p className="text-xs text-muted-foreground">
                              {format(contact.lastMessageTime, 'MMM d')}
                            </p>
                          )}
                        </div>
                        {contact.lastMessage && (
                          <p className="text-xs truncate text-muted-foreground">{contact.lastMessage}</p>
                        )}
                      </div>
                      {contact.unreadCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          {contact.unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
            
            <TabsContent value="unread" className="m-0">
              <ScrollArea className="h-[calc(100vh-15rem)]">
                <div className="space-y-1 p-2">
                  {contacts.filter(c => c.unreadCount > 0).map((contact) => (
                    <button
                      key={contact.id}
                      className={`w-full flex items-center space-x-3 p-3 rounded-lg text-left transition-colors ${activeContact === contact.id ? 'bg-accent' : 'hover:bg-accent/50'}`}
                      onClick={() => setActiveContact(contact.id)}
                    >
                      <div className="relative">
                        <Avatar>
                          <AvatarImage src={contact.avatar} />
                          <AvatarFallback>{contact.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                        {contact.online && (
                          <span className="absolute bottom-0 right-0 block h-3 w-3 rounded-full bg-green-500 ring-2 ring-background"></span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between">
                          <p className="text-sm font-medium truncate">{contact.name}</p>
                          {contact.lastMessageTime && (
                            <p className="text-xs text-muted-foreground">
                              {format(contact.lastMessageTime, 'MMM d')}
                            </p>
                          )}
                        </div>
                        {contact.lastMessage && (
                          <p className="text-xs truncate text-muted-foreground">{contact.lastMessage}</p>
                        )}
                      </div>
                      {contact.unreadCount > 0 && (
                        <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                          {contact.unreadCount}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
          
          <div className="p-4 mt-auto border-t">
            <Button className="w-full" size="sm">
              <Plus className="h-4 w-4 mr-2" /> New Message
            </Button>
          </div>
        </div>
        
        {/* Chat area */}
        <div className="flex-1 flex flex-col bg-background">
          {activeContact ? (
            <>
              {/* Chat header */}
              <div className="flex items-center justify-between p-4 border-b">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={selectedContact?.avatar} />
                    <AvatarFallback>{selectedContact?.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium">{selectedContact?.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {selectedContact?.online ? 'Online' : 'Offline'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Button variant="ghost" size="icon">
                    <Phone className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <Video className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <MoreHorizontal className="h-5 w-5" />
                  </Button>
                </div>
              </div>
              
              {/* Chat messages */}
              <ScrollArea className="flex-1 p-4">
                <div className="space-y-4">
                  {activeConversation.map((message) => (
                    <div 
                      key={message.id} 
                      className={`flex ${message.isOutgoing ? 'justify-end' : 'justify-start'}`}
                    >
                      {!message.isOutgoing && (
                        <Avatar className="h-8 w-8 mr-2">
                          <AvatarImage src={selectedContact?.avatar} />
                          <AvatarFallback>{selectedContact?.name.charAt(0)}</AvatarFallback>
                        </Avatar>
                      )}
                      <div>
                        <div 
                          className={`rounded-lg p-3 max-w-md ${
                            message.isOutgoing 
                              ? 'bg-primary text-primary-foreground ml-auto' 
                              : 'bg-accent'
                          }`}
                        >
                          <p>{message.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(message.timestamp, 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
              
              {/* Message input */}
              <div className="p-4 border-t flex items-center space-x-2">
                <Input 
                  placeholder="Type your message..." 
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="flex-1"
                />
                <Button onClick={handleSendMessage} disabled={!newMessage.trim()}>
                  <Send className="h-4 w-4 mr-2" /> Send
                </Button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-muted-foreground">
              <MessageSquare className="h-12 w-12 mb-4" />
              <h3 className="text-lg font-medium">No Conversation Selected</h3>
              <p>Choose a conversation from the list or start a new one.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}