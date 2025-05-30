import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Bell, Calendar, User, Lock } from 'lucide-react';

const GuestAnnouncements = () => {
  const mockAnnouncements = [
    {
      id: 1,
      title: "Semester Exam Schedule Released",
      content: "The examination schedule for the current semester has been published. Please check your exam dates and venues.",
      author: "Academic Office",
      date: "2024-02-10",
      type: "Academic",
      priority: "high"
    },
    {
      id: 2,
      title: "Library Extended Hours",
      content: "The library will be open 24/7 during the examination period to support student studies.",
      author: "Library Services",
      date: "2024-02-08",
      type: "General",
      priority: "medium"
    },
    {
      id: 3,
      title: "CS Department Workshop",
      content: "Join us for a workshop on emerging technologies in computer science. Registration is now open.",
      author: "CS Department",
      date: "2024-02-05",
      type: "Event",
      priority: "low"
    }
  ];

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default: return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Announcements</h1>
          <p className="text-muted-foreground">Stay updated with important notices and updates</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <Bell className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{mockAnnouncements.length} New</span>
        </div>
      </div>

      <div className="space-y-4">
        {mockAnnouncements.map((announcement) => (
          <Card key={announcement.id}>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{announcement.title}</CardTitle>
                  <CardDescription className="flex items-center gap-2 mt-1">
                    <User className="h-3 w-3" />
                    {announcement.author}
                    <Calendar className="h-3 w-3 ml-2" />
                    {announcement.date}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getPriorityColor(announcement.priority)}>
                    {announcement.priority}
                  </Badge>
                  <Badge variant="outline">{announcement.type}</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground mb-4">{announcement.content}</p>
              <Button variant="outline" size="sm" disabled>
                Read More
                <Lock className="h-3 w-3 ml-2" />
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <Button disabled className="flex items-center gap-2">
          <Bell className="h-4 w-4" />
          Mark All as Read
          <Lock className="h-3 w-3" />
        </Button>
        <Button variant="outline" disabled className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Notification Settings
          <Lock className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default GuestAnnouncements;
