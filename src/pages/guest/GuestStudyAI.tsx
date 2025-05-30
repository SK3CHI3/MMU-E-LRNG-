import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Brain, MessageSquare, BookOpen, Lock } from 'lucide-react';

const GuestStudyAI = () => {
  const mockConversations = [
    { topic: "Data Structures Explanation", messages: 15, lastActive: "2 hours ago" },
    { topic: "Database Normalization Help", messages: 8, lastActive: "1 day ago" },
    { topic: "Web Development Questions", messages: 22, lastActive: "3 days ago" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Study AI Assistant</h1>
          <p className="text-muted-foreground">Get personalized help with your studies</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <Brain className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">AI Assistant</span>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Start a New Conversation</CardTitle>
          <CardDescription>Ask questions about your courses or get study help</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
              <p className="text-sm text-muted-foreground mb-2">Example questions you can ask:</p>
              <ul className="text-sm space-y-1">
                <li>• "Explain binary search trees"</li>
                <li>• "Help me understand database normalization"</li>
                <li>• "What are the principles of software engineering?"</li>
              </ul>
            </div>
            <Button disabled className="w-full flex items-center gap-2">
              <MessageSquare className="h-4 w-4" />
              Start New Chat
              <Lock className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Recent Conversations</CardTitle>
          <CardDescription>Your previous AI assistant sessions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {mockConversations.map((conversation, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <Brain className="h-5 w-5 text-blue-500" />
                  <div>
                    <h4 className="font-medium">{conversation.topic}</h4>
                    <p className="text-sm text-muted-foreground">{conversation.messages} messages • {conversation.lastActive}</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" disabled>
                  Continue
                  <Lock className="h-3 w-3 ml-2" />
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button disabled className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Study Resources
          <Lock className="h-3 w-3" />
        </Button>
        <Button variant="outline" disabled className="flex items-center gap-2">
          <Brain className="h-4 w-4" />
          AI Settings
          <Lock className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default GuestStudyAI;
