import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Library, FileText, Video, Download, Lock } from 'lucide-react';

const GuestResources = () => {
  const mockResources = [
    { title: "Data Structures Textbook", type: "PDF", course: "CS201", size: "15.2 MB" },
    { title: "Database Design Slides", type: "PPT", course: "CS202", size: "8.5 MB" },
    { title: "Web Development Tutorial", type: "Video", course: "CS203", size: "125 MB" },
    { title: "Software Engineering Guide", type: "PDF", course: "CS204", size: "22.1 MB" }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Resources</h1>
          <p className="text-muted-foreground">Access course materials and study resources</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <Library className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{mockResources.length} Resources</span>
        </div>
      </div>

      <div className="grid gap-4">
        {mockResources.map((resource, index) => (
          <Card key={index}>
            <CardContent className="flex items-center justify-between p-6">
              <div className="flex items-center gap-4">
                {resource.type === 'Video' ? <Video className="h-8 w-8 text-blue-500" /> : <FileText className="h-8 w-8 text-green-500" />}
                <div>
                  <h4 className="font-medium">{resource.title}</h4>
                  <p className="text-sm text-muted-foreground">{resource.course} • {resource.size}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline">{resource.type}</Badge>
                <Button size="sm" disabled>
                  <Download className="h-4 w-4 mr-2" />
                  Download
                  <Lock className="h-3 w-3 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default GuestResources;
