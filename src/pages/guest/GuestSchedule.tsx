import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, MapPin, Lock } from 'lucide-react';

const GuestSchedule = () => {
  const mockSchedule = [
    { day: "Monday", classes: [
      { time: "09:00 - 11:00", course: "CS201 - Data Structures", room: "Lab 1", type: "Lecture" },
      { time: "15:00 - 17:00", course: "CS206 - Operating Systems", room: "Room 301", type: "Tutorial" }
    ]},
    { day: "Tuesday", classes: [
      { time: "11:30 - 13:30", course: "CS202 - Database Systems", room: "Room 205", type: "Lecture" }
    ]},
    { day: "Wednesday", classes: [
      { time: "14:00 - 16:00", course: "CS203 - Web Development", room: "Lab 2", type: "Practical" }
    ]},
    { day: "Thursday", classes: [
      { time: "10:00 - 12:00", course: "CS204 - Software Engineering", room: "Room 102", type: "Lecture" }
    ]},
    { day: "Friday", classes: [
      { time: "13:00 - 15:00", course: "CS205 - Computer Networks", room: "Lab 3", type: "Practical" }
    ]}
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Classes</h1>
          <p className="text-muted-foreground">Your weekly class schedule</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <Calendar className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Week View</span>
        </div>
      </div>

      <div className="grid gap-6">
        {mockSchedule.map((day) => (
          <Card key={day.day}>
            <CardHeader>
              <CardTitle>{day.day}</CardTitle>
              <CardDescription>{day.classes.length} classes scheduled</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {day.classes.map((classItem, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{classItem.time}</span>
                      </div>
                      <div>
                        <h4 className="font-medium">{classItem.course}</h4>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span>{classItem.room}</span>
                        </div>
                      </div>
                    </div>
                    <Badge variant="outline">{classItem.type}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex gap-4">
        <Button disabled className="flex items-center gap-2">
          <Calendar className="h-4 w-4" />
          Add to Calendar
          <Lock className="h-3 w-3" />
        </Button>
        <Button variant="outline" disabled className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Set Reminders
          <Lock className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default GuestSchedule;
