import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { MessageSquare, Users, Send, Lock } from 'lucide-react';

const GuestMessages = () => {
  const mockConversations = [
    { name: "Dr. Jane Smith", role: "Lecturer", course: "Data Structures", lastMessage: "Assignment feedback available", time: "2 hours ago", unread: 2 },
    { name: "John Doe", role: "Student", course: "CS Department", lastMessage: "Study group meeting tomorrow", time: "1 day ago", unread: 0 },
    { name: "Prof. Michael Johnson", role: "Lecturer", course: "Database Systems", lastMessage: "Class rescheduled to Friday", time: "2 days ago", unread: 1 },
    { name: "Sarah Wilson", role: "Student", course: "CS Department", lastMessage: "Project collaboration?", time: "3 days ago", unread: 0 }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Messages</h1>
          <p className="text-muted-foreground">Communicate with lecturers and fellow students</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <MessageSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">
            {mockConversations.filter(c => c.unread > 0).length} Unread
          </span>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-1">
          <CardHeader>
            <CardTitle>Conversations</CardTitle>
            <CardDescription>Your message threads</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockConversations.map((conversation, index) => (
                <div key={index} className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                      {conversation.role === 'Lecturer' ? '👨‍🏫' : '👨‍🎓'}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-sm">{conversation.name}</h4>
                      <p className="text-xs text-muted-foreground">{conversation.lastMessage}</p>
                      <p className="text-xs text-muted-foreground">{conversation.time}</p>
                    </div>
                  </div>
                  {conversation.unread > 0 && (
                    <Badge variant="destructive" className="text-xs">
                      {conversation.unread}
                    </Badge>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>Message Preview</CardTitle>
            <CardDescription>Select a conversation to view messages</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-center h-64 text-center">
              <div className="space-y-4">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="font-medium">No conversation selected</h3>
                  <p className="text-sm text-muted-foreground">Choose a conversation from the list to start messaging</p>
                </div>
                <Button disabled className="flex items-center gap-2">
                  <Send className="h-4 w-4" />
                  Send Message
                  <Lock className="h-3 w-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex gap-4">
        <Button disabled className="flex items-center gap-2">
          <Users className="h-4 w-4" />
          New Conversation
          <Lock className="h-3 w-3" />
        </Button>
        <Button variant="outline" disabled className="flex items-center gap-2">
          <MessageSquare className="h-4 w-4" />
          Message Settings
          <Lock className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default GuestMessages;
