import React, { useState } from 'react';
import { CatchUpLayout } from '../../components/catchup/Layout';
import { 
  Edit,
  Search,
  Inbox,
  Send,
  Archive,
  Star,
  Trash2,
  Plus,
  MoreVertical,
  Paperclip,
  ChevronRight,
  MessageSquare,
  Users,
  User,
  Bell,
  Calendar,
  UserPlus
} from 'lucide-react';
import '../../styles/catchup.css';

// Define message type
type Message = {
  id: number;
  sender: {
    id: number;
    name: string;
    avatar?: string;
  };
  recipients: {
    id: number;
    name: string;
    avatar?: string;
  }[];
  subject: string;
  content: string;
  timestamp: string;
  isRead: boolean;
  isStarred: boolean;
  isArchived: boolean;
  labels?: string[];
  attachments?: {
    name: string;
    size: number;
    type: string;
  }[];
  folder: 'inbox' | 'sent' | 'archive' | 'trash' | 'draft';
};

// Define contact type
type Contact = {
  id: number;
  name: string;
  email: string;
  avatar?: string;
  company?: string;
  role?: string;
  lastContactDate?: string;
};

export default function MessagesPage() {
  const [currentFolder, setCurrentFolder] = useState<'inbox' | 'sent' | 'archive' | 'trash' | 'draft'>('inbox');
  const [selectedMessageId, setSelectedMessageId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Sample data
  const messages: Message[] = [
    {
      id: 1,
      sender: { id: 2, name: 'Sarah Johnson', avatar: '' },
      recipients: [{ id: 1, name: 'Alex Wilson', avatar: '' }],
      subject: 'Project Update: Website Redesign',
      content: `Hi Alex,

I wanted to give you a quick update on the website redesign project. We've completed the wireframes for the homepage and about page. Could you review them when you have a chance?

The design team has also prepared some color palette options. I've attached them to this email. Let me know which one you prefer.

Thanks,
Sarah`,
      timestamp: '2025-05-14T09:30:00',
      isRead: false,
      isStarred: true,
      isArchived: false,
      labels: ['Work', 'Important'],
      attachments: [
        { name: 'wireframes_v1.pdf', size: 2540000, type: 'application/pdf' },
        { name: 'color_options.png', size: 1250000, type: 'image/png' },
      ],
      folder: 'inbox',
    },
    {
      id: 2,
      sender: { id: 3, name: 'Michael Brown', avatar: '' },
      recipients: [{ id: 1, name: 'Alex Wilson', avatar: '' }],
      subject: 'Client Meeting Next Week',
      content: `Hello Alex,

Just a reminder that we have a client meeting scheduled for next Tuesday at 2 PM. We'll be discussing the marketing strategy for Q3.

Could you prepare a short presentation about the results from our last campaign? Nothing fancy, just the key metrics and insights.

Best regards,
Michael`,
      timestamp: '2025-05-14T11:45:00',
      isRead: true,
      isStarred: false,
      isArchived: false,
      labels: ['Work', 'Meeting'],
      folder: 'inbox',
    },
    {
      id: 3,
      sender: { id: 4, name: 'Emma Davis', avatar: '' },
      recipients: [{ id: 1, name: 'Alex Wilson', avatar: '' }],
      subject: 'Team Lunch This Friday',
      content: `Hey team,

I'm organizing a team lunch this Friday at 1 PM. We'll be going to that new Italian restaurant downtown.

Please let me know if you can make it so I can make the appropriate reservations.

Cheers,
Emma`,
      timestamp: '2025-05-13T16:20:00',
      isRead: true,
      isStarred: false,
      isArchived: false,
      labels: ['Social'],
      folder: 'inbox',
    },
    {
      id: 4,
      sender: { id: 5, name: 'Daniel Smith', avatar: '' },
      recipients: [{ id: 1, name: 'Alex Wilson', avatar: '' }],
      subject: 'Invoice #1234 for April Services',
      content: `Dear Alex,

Please find attached the invoice for services rendered in April. The payment is due within 15 days.

If you have any questions about the invoice, please don't hesitate to reach out.

Thank you for your business!

Best regards,
Daniel Smith
Accounting Department`,
      timestamp: '2025-05-12T10:15:00',
      isRead: true,
      isStarred: true,
      isArchived: false,
      labels: ['Finance'],
      attachments: [
        { name: 'invoice_april_2025.pdf', size: 1850000, type: 'application/pdf' },
      ],
      folder: 'inbox',
    },
    {
      id: 5,
      sender: { id: 1, name: 'Alex Wilson', avatar: '' },
      recipients: [{ id: 2, name: 'Sarah Johnson', avatar: '' }],
      subject: 'Re: Project Update: Website Redesign',
      content: `Hi Sarah,

Thanks for the update. I'll review the wireframes today and get back to you with feedback.

For the color palette, I'm leaning towards option 2, but let me see all the options first before making a final decision.

Regards,
Alex`,
      timestamp: '2025-05-14T10:45:00',
      isRead: true,
      isStarred: false,
      isArchived: false,
      folder: 'sent',
    },
  ];
  
  // Sample contacts
  const contacts: Contact[] = [
    { id: 1, name: 'Alex Wilson', email: 'alex@example.com', avatar: '', company: 'CatchUp Inc.', role: 'Product Manager' },
    { id: 2, name: 'Sarah Johnson', email: 'sarah@example.com', avatar: '', company: 'Design Studio', role: 'UI/UX Designer' },
    { id: 3, name: 'Michael Brown', email: 'michael@example.com', avatar: '', company: 'Marketing Agency', role: 'Marketing Director' },
    { id: 4, name: 'Emma Davis', email: 'emma@example.com', avatar: '', company: 'CatchUp Inc.', role: 'Team Lead' },
    { id: 5, name: 'Daniel Smith', email: 'daniel@example.com', avatar: '', company: 'Finance Co.', role: 'Accounting Manager' },
    { id: 6, name: 'Olivia Wilson', email: 'olivia@example.com', avatar: '', company: 'Tech Solutions', role: 'Developer' },
    { id: 7, name: 'James Miller', email: 'james@example.com', avatar: '', company: 'Innovate Inc.', role: 'CEO' },
  ];
  
  // Filter messages by current folder
  const filteredMessages = messages
    .filter(message => message.folder === currentFolder)
    .filter(message => {
      if (!searchQuery) return true;
      
      const query = searchQuery.toLowerCase();
      return (
        message.subject.toLowerCase().includes(query) ||
        message.content.toLowerCase().includes(query) ||
        message.sender.name.toLowerCase().includes(query)
      );
    });
  
  // Get selected message
  const selectedMessage = selectedMessageId 
    ? messages.find(message => message.id === selectedMessageId) 
    : null;
  
  // Format date for display
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    
    // If today, show time
    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true });
    }
    
    // If this year, show month and day
    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
    
    // Otherwise show full date
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  // Format file size for display
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) {
      return bytes + ' B';
    } else if (bytes < 1024 * 1024) {
      return (bytes / 1024).toFixed(1) + ' KB';
    } else {
      return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }
  };
  
  // Count unread messages
  const unreadCount = messages.filter(message => message.folder === 'inbox' && !message.isRead).length;
  
  // Folder stats
  const folderStats = {
    inbox: messages.filter(message => message.folder === 'inbox').length,
    sent: messages.filter(message => message.folder === 'sent').length,
    archive: messages.filter(message => message.folder === 'archive').length,
    trash: messages.filter(message => message.folder === 'trash').length,
    draft: messages.filter(message => message.folder === 'draft').length,
  };

  return (
    <CatchUpLayout>
      <div className="catchup-flex catchup-flex-col h-full">
        {/* Header */}
        <div className="catchup-flex catchup-items-center catchup-justify-between catchup-mb-6">
          <div>
            <h1 className="catchup-heading-lg">Messages</h1>
            <p className="catchup-text-sm text-[var(--catchup-gray)]">
              Manage your communications
            </p>
          </div>
          <div className="catchup-flex catchup-items-center catchup-gap-2">
            <button className="catchup-button catchup-button-primary">
              <Edit size={18} className="mr-2" />
              Compose
            </button>
          </div>
        </div>
        
        <div className="catchup-grid catchup-grid-cols-1 md:grid-cols-12 gap-6 flex-1">
          {/* Sidebar */}
          <div className="md:col-span-3 lg:col-span-2">
            <div className="catchup-flex catchup-flex-col gap-1 mb-6">
              <button
                className={`catchup-nav-link ${currentFolder === 'inbox' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentFolder('inbox');
                  setSelectedMessageId(null);
                }}
              >
                <span className="catchup-nav-icon">
                  <Inbox size={18} />
                </span>
                <span>Inbox</span>
                {unreadCount > 0 && (
                  <span className="ml-auto bg-[var(--catchup-cobalt)] text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>
              
              <button
                className={`catchup-nav-link ${currentFolder === 'sent' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentFolder('sent');
                  setSelectedMessageId(null);
                }}
              >
                <span className="catchup-nav-icon">
                  <Send size={18} />
                </span>
                <span>Sent</span>
                {folderStats.sent > 0 && (
                  <span className="ml-auto text-[var(--catchup-gray)] text-xs">
                    {folderStats.sent}
                  </span>
                )}
              </button>
              
              <button
                className={`catchup-nav-link ${currentFolder === 'archive' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentFolder('archive');
                  setSelectedMessageId(null);
                }}
              >
                <span className="catchup-nav-icon">
                  <Archive size={18} />
                </span>
                <span>Archive</span>
                {folderStats.archive > 0 && (
                  <span className="ml-auto text-[var(--catchup-gray)] text-xs">
                    {folderStats.archive}
                  </span>
                )}
              </button>
              
              <button
                className={`catchup-nav-link ${currentFolder === 'trash' ? 'active' : ''}`}
                onClick={() => {
                  setCurrentFolder('trash');
                  setSelectedMessageId(null);
                }}
              >
                <span className="catchup-nav-icon">
                  <Trash2 size={18} />
                </span>
                <span>Trash</span>
                {folderStats.trash > 0 && (
                  <span className="ml-auto text-[var(--catchup-gray)] text-xs">
                    {folderStats.trash}
                  </span>
                )}
              </button>
            </div>
            
            <div className="mb-4">
              <h3 className="catchup-text-sm font-medium text-[var(--catchup-light-gray)] mb-2 px-3">
                Labels
              </h3>
              <div className="catchup-flex catchup-flex-col gap-1">
                <button className="catchup-nav-link">
                  <span className="w-3 h-3 rounded-full bg-blue-500 mr-3"></span>
                  <span>Work</span>
                </button>
                <button className="catchup-nav-link">
                  <span className="w-3 h-3 rounded-full bg-green-500 mr-3"></span>
                  <span>Personal</span>
                </button>
                <button className="catchup-nav-link">
                  <span className="w-3 h-3 rounded-full bg-yellow-500 mr-3"></span>
                  <span>Finance</span>
                </button>
                <button className="catchup-nav-link">
                  <span className="w-3 h-3 rounded-full bg-purple-500 mr-3"></span>
                  <span>Social</span>
                </button>
                <button className="catchup-nav-link">
                  <span className="catchup-nav-icon text-[var(--catchup-cobalt)]">
                    <Plus size={18} />
                  </span>
                  <span>Add Label</span>
                </button>
              </div>
            </div>
            
            <div>
              <h3 className="catchup-text-sm font-medium text-[var(--catchup-light-gray)] mb-2 px-3">
                Recent Contacts
              </h3>
              <div className="catchup-flex catchup-flex-col gap-1">
                {contacts.slice(0, 5).map(contact => (
                  <button key={contact.id} className="catchup-nav-link">
                    <span className="w-6 h-6 rounded-full bg-[var(--catchup-cobalt-light)] flex items-center justify-center mr-3">
                      {contact.avatar ? (
                        <img 
                          src={contact.avatar} 
                          alt={contact.name} 
                          className="w-6 h-6 rounded-full"
                        />
                      ) : (
                        <User size={14} />
                      )}
                    </span>
                    <span>{contact.name}</span>
                  </button>
                ))}
                <button className="catchup-nav-link">
                  <span className="catchup-nav-icon text-[var(--catchup-cobalt)]">
                    <UserPlus size={18} />
                  </span>
                  <span>Add Contact</span>
                </button>
              </div>
            </div>
          </div>
          
          {/* Message List and Details */}
          <div className="md:col-span-9 lg:col-span-10">
            <div className="catchup-card h-full">
              {/* Search and Filter */}
              <div className="catchup-flex catchup-items-center catchup-justify-between p-3 border-b border-[var(--catchup-navy-dark)]">
                <div className="relative w-full max-w-md">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[var(--catchup-gray)]" size={18} />
                  <input
                    type="text"
                    placeholder="Search messages..."
                    className="catchup-input pl-10 py-2"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>
              
              <div className="catchup-flex h-[calc(100%-56px)]">
                {/* Message List */}
                <div className={`border-r border-[var(--catchup-navy-dark)] ${selectedMessageId ? 'hidden md:block md:w-1/3' : 'w-full'}`}>
                  <div className="h-full overflow-auto">
                    {filteredMessages.length === 0 ? (
                      <div className="flex flex-col items-center justify-center h-full p-6 text-center">
                        <MessageSquare size={48} className="text-[var(--catchup-navy-light)] mb-4" />
                        <p className="catchup-text-sm text-[var(--catchup-gray)] mb-2">
                          No messages found
                        </p>
                        <p className="catchup-text-sm text-[var(--catchup-gray)]">
                          {searchQuery 
                            ? 'Try a different search term' 
                            : currentFolder === 'inbox' 
                              ? 'Your inbox is empty' 
                              : `No messages in ${currentFolder}`}
                        </p>
                      </div>
                    ) : (
                      <div>
                        {filteredMessages.map((message) => (
                          <div
                            key={message.id}
                            className={`catchup-flex catchup-flex-col p-4 border-b border-[var(--catchup-navy-dark)] cursor-pointer ${
                              selectedMessageId === message.id ? 'bg-[var(--catchup-navy-light)]' : ''
                            } ${!message.isRead ? 'border-l-4 border-l-[var(--catchup-cobalt)]' : ''}`}
                            onClick={() => setSelectedMessageId(message.id)}
                          >
                            <div className="catchup-flex catchup-items-center catchup-justify-between mb-2">
                              <div className="catchup-flex catchup-items-center">
                                <div className="w-8 h-8 rounded-full bg-[var(--catchup-cobalt-light)] flex items-center justify-center mr-3">
                                  {message.sender.avatar ? (
                                    <img 
                                      src={message.sender.avatar} 
                                      alt={message.sender.name} 
                                      className="w-8 h-8 rounded-full"
                                    />
                                  ) : (
                                    <User size={16} />
                                  )}
                                </div>
                                <div>
                                  <p className={`catchup-text-sm font-medium ${!message.isRead ? 'text-white' : ''}`}>
                                    {message.sender.name}
                                  </p>
                                  <p className="catchup-text-sm text-[var(--catchup-gray)]">
                                    {formatDate(message.timestamp)}
                                  </p>
                                </div>
                              </div>
                              
                              <div className="catchup-flex catchup-items-center">
                                {message.isStarred && (
                                  <Star size={16} className="text-yellow-400 mr-2" />
                                )}
                                {message.attachments && message.attachments.length > 0 && (
                                  <Paperclip size={16} className="text-[var(--catchup-gray)]" />
                                )}
                              </div>
                            </div>
                            
                            <div>
                              <p className={`catchup-text-sm font-medium mb-1 ${!message.isRead ? 'text-white' : ''}`}>
                                {message.subject}
                              </p>
                              <p className="catchup-text-sm text-[var(--catchup-gray)] line-clamp-2">
                                {message.content.split('\n')[0]}
                              </p>
                            </div>
                            
                            {message.labels && message.labels.length > 0 && (
                              <div className="catchup-flex catchup-items-center catchup-gap-2 mt-2">
                                {message.labels.map((label, index) => (
                                  <span 
                                    key={index} 
                                    className="catchup-badge catchup-badge-blue text-xs"
                                  >
                                    {label}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                
                {/* Message Details */}
                {selectedMessage && (
                  <div className={`${selectedMessageId ? 'w-full md:w-2/3' : 'hidden'} h-full overflow-auto`}>
                    <div className="p-6">
                      <div className="catchup-flex catchup-items-center catchup-justify-between mb-6">
                        <h2 className="catchup-heading-md">{selectedMessage.subject}</h2>
                        <div className="catchup-flex catchup-items-center catchup-gap-2">
                          <button className="catchup-button catchup-button-ghost p-2">
                            <Archive size={18} />
                          </button>
                          <button className="catchup-button catchup-button-ghost p-2">
                            <Trash2 size={18} />
                          </button>
                          <button className="catchup-button catchup-button-ghost p-2">
                            <MoreVertical size={18} />
                          </button>
                        </div>
                      </div>
                      
                      <div className="catchup-flex catchup-items-start catchup-gap-4 mb-6">
                        <div className="w-10 h-10 rounded-full bg-[var(--catchup-cobalt-light)] flex-shrink-0 flex items-center justify-center">
                          {selectedMessage.sender.avatar ? (
                            <img 
                              src={selectedMessage.sender.avatar} 
                              alt={selectedMessage.sender.name} 
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <User size={20} />
                          )}
                        </div>
                        
                        <div className="flex-grow">
                          <div className="catchup-flex catchup-items-center catchup-justify-between mb-1">
                            <div>
                              <span className="catchup-text font-medium">
                                {selectedMessage.sender.name}
                              </span>
                              <span className="catchup-text-sm text-[var(--catchup-gray)] ml-2">
                                {`<${selectedMessage.sender.id}@example.com>`}
                              </span>
                            </div>
                            <span className="catchup-text-sm text-[var(--catchup-gray)]">
                              {formatDate(selectedMessage.timestamp)}
                            </span>
                          </div>
                          
                          <div className="catchup-text-sm text-[var(--catchup-gray)] mb-2">
                            To: {selectedMessage.recipients.map(r => r.name).join(', ')}
                          </div>
                          
                          {selectedMessage.labels && selectedMessage.labels.length > 0 && (
                            <div className="catchup-flex catchup-items-center catchup-gap-2 mb-4">
                              {selectedMessage.labels.map((label, index) => (
                                <span 
                                  key={index} 
                                  className="catchup-badge catchup-badge-blue text-xs"
                                >
                                  {label}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                      
                      <div className="catchup-text mb-6 whitespace-pre-line">
                        {selectedMessage.content}
                      </div>
                      
                      {selectedMessage.attachments && selectedMessage.attachments.length > 0 && (
                        <div className="mb-6">
                          <h3 className="catchup-text-sm font-medium mb-3">
                            Attachments ({selectedMessage.attachments.length})
                          </h3>
                          <div className="catchup-grid catchup-grid-cols-1 md:grid-cols-2 gap-3">
                            {selectedMessage.attachments.map((attachment, index) => (
                              <div 
                                key={index}
                                className="catchup-flex catchup-items-center p-3 rounded-md bg-[var(--catchup-navy-dark)]"
                              >
                                <div className="w-10 h-10 rounded-md bg-[var(--catchup-cobalt)] bg-opacity-20 flex items-center justify-center mr-3">
                                  <Paperclip size={18} className="text-[var(--catchup-cobalt)]" />
                                </div>
                                <div className="flex-grow mr-3">
                                  <p className="catchup-text-sm font-medium truncate">
                                    {attachment.name}
                                  </p>
                                  <p className="catchup-text-sm text-[var(--catchup-gray)]">
                                    {formatFileSize(attachment.size)}
                                  </p>
                                </div>
                                <button className="catchup-button catchup-button-ghost p-2">
                                  <ChevronRight size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      <div className="catchup-flex catchup-gap-4 pt-6 border-t border-[var(--catchup-navy-dark)]">
                        <button className="catchup-button catchup-button-primary">
                          <Edit size={18} className="mr-2" />
                          Reply
                        </button>
                        <button className="catchup-button catchup-button-secondary">
                          <Send size={18} className="mr-2" />
                          Forward
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </CatchUpLayout>
  );
}