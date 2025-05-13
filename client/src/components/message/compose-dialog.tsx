import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger,
  SelectValue 
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';

interface ComposeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const ComposeDialog: React.FC<ComposeDialogProps> = ({ open, onOpenChange }) => {
  // Form state
  const [recipient, setRecipient] = useState('');
  const [subject, setSubject] = useState('');
  const [messageType, setMessageType] = useState('general');
  const [messageContent, setMessageContent] = useState('');
  
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Mutation for sending message
  const sendMessageMutation = useMutation({
    mutationFn: async (messageData: any) => {
      const response = await apiRequest('POST', '/api/messages', messageData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Message sent',
        description: 'Your message has been sent successfully.',
      });
      resetForm();
      onOpenChange(false);
      queryClient.invalidateQueries({ queryKey: ['/api/messages'] });
    },
    onError: (error) => {
      toast({
        title: 'Error sending message',
        description: error.message,
        variant: 'destructive',
      });
    },
  });
  
  // Reset form fields
  const resetForm = () => {
    setRecipient('');
    setSubject('');
    setMessageType('general');
    setMessageContent('');
  };
  
  // Handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipient || !messageContent) {
      toast({
        title: 'Missing information',
        description: 'Please fill out all required fields.',
        variant: 'destructive',
      });
      return;
    }
    
    sendMessageMutation.mutate({
      recipient,
      subject,
      type: messageType,
      content: messageContent,
      timestamp: new Date(),
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[525px] bg-[#173561] text-white border-[#2a4d7d]">
        <DialogHeader>
          <DialogTitle className="text-xl text-white">Compose Message</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4 py-4">
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="recipient" className="text-white">
              Recipient
            </Label>
            <Input 
              id="recipient"
              value={recipient}
              onChange={(e) => setRecipient(e.target.value)}
              placeholder="Enter recipient name or email"
              className="bg-[#0a2342] border-[#2a4d7d] text-white placeholder:text-gray-400"
              required
            />
          </div>
          
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="subject" className="text-white">
              Subject
            </Label>
            <Input 
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="Enter message subject"
              className="bg-[#0a2342] border-[#2a4d7d] text-white placeholder:text-gray-400"
            />
          </div>
          
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="type" className="text-white">
              Message Type
            </Label>
            <Select 
              value={messageType} 
              onValueChange={setMessageType}
            >
              <SelectTrigger id="type" className="bg-[#0a2342] border-[#2a4d7d] text-white">
                <SelectValue placeholder="Select message type" />
              </SelectTrigger>
              <SelectContent className="bg-[#173561] border-[#2a4d7d] text-white">
                <SelectItem value="general">General Message</SelectItem>
                <SelectItem value="missed_call">Missed Call</SelectItem>
                <SelectItem value="reschedule">Reschedule Request</SelectItem>
                <SelectItem value="cancellation">Cancellation</SelectItem>
                <SelectItem value="confirmation">Confirmation</SelectItem>
                <SelectItem value="emergency">Emergency Alert</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid w-full items-center gap-2">
            <Label htmlFor="message" className="text-white">
              Message
            </Label>
            <Textarea 
              id="message"
              value={messageContent}
              onChange={(e) => setMessageContent(e.target.value)}
              placeholder="Type your message here..."
              className="min-h-[150px] bg-[#0a2342] border-[#2a4d7d] text-white placeholder:text-gray-400"
              required
            />
          </div>
          
          <DialogFooter className="pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              className="border-[#2a4d7d] text-white hover:bg-[#0a2342] hover:text-white"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="bg-[#1d4ed8] hover:bg-blue-600 text-white"
              disabled={sendMessageMutation.isPending}
            >
              {sendMessageMutation.isPending ? 'Sending...' : 'Send Message'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ComposeDialog;