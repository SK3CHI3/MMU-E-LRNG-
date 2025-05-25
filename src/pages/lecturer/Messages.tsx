import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Send, 
  MessageSquare, 
  Users, 
  Clock, 
  Search,
  Plus,
  Reply,
  Forward,
  Archive,
  Star,
  Paperclip,
  MoreHorizontal
} from 'lucide-react';

const Messages = () => {
  const [isComposeDialogOpen, setIsComposeDialogOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const conversations = [
    {
      id: 1,
      studentName: 'John Doe',
      studentId: 'CS2021001',
      course: 'CS 301',
      subject: 'Question about Binary Tree Assignment',
      lastMessage: 'Thank you for the clarification, Professor!',
      timestamp: '2024-01-20 2:30 PM',
      unread: false,
      priority: 'normal',
      avatar: '/avatars/john.jpg'
    },
    {
      id: 2,
      studentName: 'Jane Smith',
      studentId: 'CS2021002',
      course: 'CS 205',
      subject: 'Database Project Extension Request',
      lastMessage: 'I would like to request a 2-day extension for the database project due to...',
      timestamp: '2024-01-20 1:15 PM',
      unread: true,
      priority: 'high',
      avatar: '/avatars/jane.jpg'
    },
    {
      id: 3,
      studentName: 'Mike Johnson',
      studentId: 'CS2021003',
      course: 'CS 401',
      subject: 'Software Engineering Methodology Question',
      lastMessage: 'Could you explain the difference between Agile and Waterfall methodologies?',
      timestamp: '2024-01-20 11:45 AM',
      unread: true,
      priority: 'normal',
      avatar: '/avatars/mike.jpg'
    },
    {
      id: 4,
      studentName: 'Sarah Wilson',
      studentId: 'CS2021004',
      course: 'CS 205',
      subject: 'Grade Inquiry',
      lastMessage: 'I received my grade for the last assignment and wanted to understand...',
      timestamp: '2024-01-19 4:20 PM',
      unread: false,
      priority: 'normal',
      avatar: '/avatars/sarah.jpg'
    }
  ];

  const messageDetails = {
    1: [
      {
        id: 1,
        sender: 'John Doe',
        senderType: 'student',
        content: 'Hi Professor, I have a question about the Binary Tree assignment. Could you clarify what you mean by "balanced insertion"?',
        timestamp: '2024-01-20 1:00 PM',
        attachments: []
      },
      {
        id: 2,
        sender: 'You',
        senderType: 'lecturer',
        content: 'Hi John, balanced insertion means that when you insert nodes, you should try to keep the tree as balanced as possible to maintain optimal search performance. You can use techniques like AVL tree rotations or simply ensure that the tree doesn\'t become too skewed.',
        timestamp: '2024-01-20 1:30 PM',
        attachments: ['balanced_tree_examples.pdf']
      },
      {
        id: 3,
        sender: 'John Doe',
        senderType: 'student',
        content: 'Thank you for the clarification, Professor! The PDF example really helped me understand the concept.',
        timestamp: '2024-01-20 2:30 PM',
        attachments: []
      }
    ]
  };

  const courses = [
    { id: 'cs301', name: 'CS 301 - Data Structures and Algorithms', students: 45 },
    { id: 'cs205', name: 'CS 205 - Database Management Systems', students: 38 },
    { id: 'cs401', name: 'CS 401 - Software Engineering', students: 42 }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600';
      case 'medium': return 'text-yellow-600';
      case 'normal': return 'text-gray-600';
      default: return 'text-gray-600';
    }
  };

  const ComposeMessageDialog = () => (
    <Dialog open={isComposeDialogOpen} onOpenChange={setIsComposeDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Compose Message
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Compose New Message</DialogTitle>
          <DialogDescription>
            Send a message to your students
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="recipient">Recipient</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select recipient" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Students</SelectItem>
                  <SelectItem value="individual">Individual Student</SelectItem>
                  <SelectItem value="group">Study Group</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="subject">Subject</Label>
            <Input id="subject" placeholder="Enter message subject" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="message">Message</Label>
            <Textarea 
              id="message" 
              placeholder="Type your message here..."
              rows={6}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="priority">Priority</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Attachments</Label>
            <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-4 text-center">
              <Paperclip className="h-6 w-6 mx-auto mb-2 text-gray-400" />
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Drag and drop files here, or click to browse
              </p>
              <Button variant="outline" className="mt-2" size="sm">
                Choose Files
              </Button>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsComposeDialogOpen(false)}>
            Save Draft
          </Button>
          <Button onClick={() => setIsComposeDialogOpen(false)}>
            <Send className="h-4 w-4 mr-2" />
            Send Message
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const MessageDetailView = ({ conversation }: { conversation: any }) => {
    const messages = messageDetails[conversation.id as keyof typeof messageDetails] || [];
    
    return (
      <div className="flex flex-col h-full">
        <div className="border-b p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <Avatar>
                <AvatarImage src={conversation.avatar} />
                <AvatarFallback>{conversation.studentName.split(' ').map((n: string) => n[0]).join('')}</AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-semibold">{conversation.studentName}</h3>
                <p className="text-sm text-gray-600">{conversation.studentId} • {conversation.course}</p>
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <Button size="sm" variant="outline">
                <Star className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Archive className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </div>
          </div>
          <h4 className="font-medium mt-2">{conversation.subject}</h4>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.map((message) => (
            <div key={message.id} className={`flex ${message.senderType === 'lecturer' ? 'justify-end' : 'justify-start'}`}>
              <div className={`max-w-[70%] rounded-lg p-3 ${
                message.senderType === 'lecturer' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 dark:bg-gray-800'
              }`}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{message.sender}</span>
                  <span className="text-xs opacity-70">{message.timestamp}</span>
                </div>
                <p className="text-sm">{message.content}</p>
                {message.attachments.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {message.attachments.map((attachment, index) => (
                      <div key={index} className="flex items-center space-x-2 text-xs">
                        <Paperclip className="h-3 w-3" />
                        <span>{attachment}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="border-t p-4">
          <div className="flex space-x-2">
            <Textarea 
              placeholder="Type your reply..." 
              className="flex-1"
              rows={2}
            />
            <div className="flex flex-col space-y-2">
              <Button size="sm">
                <Send className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="outline">
                <Paperclip className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const filteredConversations = conversations.filter(conv =>
    conv.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.course.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <p className="text-gray-600 dark:text-gray-400">Communicate with your students</p>
        </div>
        <ComposeMessageDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Unread Messages</p>
                <p className="text-2xl font-bold text-red-600">
                  {conversations.filter(c => c.unread).length}
                </p>
              </div>
              <MessageSquare className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Conversations</p>
                <p className="text-2xl font-bold text-blue-600">{conversations.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">High Priority</p>
                <p className="text-2xl font-bold text-orange-600">
                  {conversations.filter(c => c.priority === 'high').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Response Rate</p>
                <p className="text-2xl font-bold text-green-600">98%</p>
              </div>
              <Send className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Messages Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
        {/* Conversations List */}
        <Card className="lg:col-span-1">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle>Conversations</CardTitle>
              <Badge variant="outline">{conversations.length}</Badge>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Search conversations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-[500px] overflow-y-auto">
              {filteredConversations.map((conversation) => (
                <div
                  key={conversation.id}
                  className={`p-3 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 border-l-4 ${
                    conversation.unread ? 'border-l-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-l-transparent'
                  } ${selectedMessage?.id === conversation.id ? 'bg-gray-100 dark:bg-gray-800' : ''}`}
                  onClick={() => setSelectedMessage(conversation)}
                >
                  <div className="flex items-start space-x-3">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={conversation.avatar} />
                      <AvatarFallback className="text-xs">
                        {conversation.studentName.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <p className={`text-sm font-medium truncate ${conversation.unread ? 'font-bold' : ''}`}>
                          {conversation.studentName}
                        </p>
                        <span className="text-xs text-gray-500">{conversation.timestamp.split(' ')[1]}</span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">{conversation.course}</p>
                      <p className={`text-sm truncate ${conversation.unread ? 'font-semibold' : 'text-gray-600 dark:text-gray-400'}`}>
                        {conversation.subject}
                      </p>
                      <p className="text-xs text-gray-500 truncate mt-1">
                        {conversation.lastMessage}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-2">
                    <Badge variant={conversation.priority === 'high' ? 'destructive' : 'outline'} className="text-xs">
                      {conversation.priority}
                    </Badge>
                    {conversation.unread && (
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Message Detail View */}
        <Card className="lg:col-span-2">
          {selectedMessage ? (
            <MessageDetailView conversation={selectedMessage} />
          ) : (
            <CardContent className="flex items-center justify-center h-full">
              <div className="text-center">
                <MessageSquare className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No conversation selected</h3>
                <p className="text-gray-600 dark:text-gray-400">Choose a conversation from the list to start messaging</p>
              </div>
            </CardContent>
          )}
        </Card>
      </div>
    </div>
  );
};

export default Messages;
