
import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar, Clock, MapPin, Video, Users, BookOpen, Bell, Plus } from "lucide-react";

const StudentClasses = () => {
  const [selectedView, setSelectedView] = useState("today");
  const [selectedWeek, setSelectedWeek] = useState("current");

  // Mock data
  const classes = [
    {
      id: 1,
      code: "CSC 301",
      title: "Database Systems",
      type: "Lecture",
      time: "08:00 AM - 10:00 AM",
      date: "2024-01-15",
      location: "Computer Lab 1",
      lecturer: "Dr. John Smith",
      isOnline: false,
      status: "upcoming",
      duration: 120,
      attendees: 45,
      maxAttendees: 50,
      materials: ["Lecture Slides", "Lab Manual"]
    },
    {
      id: 2,
      code: "MAT 201",
      title: "Calculus II",
      type: "Tutorial",
      time: "10:30 AM - 11:30 AM",
      date: "2024-01-15",
      location: "Online",
      lecturer: "Prof. Sarah Johnson",
      isOnline: true,
      status: "live",
      duration: 60,
      attendees: 32,
      maxAttendees: 35,
      meetingLink: "https://zoom.us/j/123456789",
      materials: ["Problem Set", "Solutions"]
    },
    {
      id: 3,
      code: "ENG 102",
      title: "Technical Writing",
      type: "Workshop",
      time: "02:00 PM - 04:00 PM",
      date: "2024-01-15",
      location: "Room 205",
      lecturer: "Dr. Mary Wilson",
      isOnline: false,
      status: "upcoming",
      duration: 120,
      attendees: 28,
      maxAttendees: 30,
      materials: ["Writing Guidelines", "Sample Reports"]
    },
    {
      id: 4,
      code: "CSC 401",
      title: "Software Engineering",
      type: "Lab",
      time: "09:00 AM - 12:00 PM",
      date: "2024-01-16",
      location: "Software Lab 2",
      lecturer: "Dr. James Brown",
      isOnline: false,
      status: "scheduled",
      duration: 180,
      attendees: 0,
      maxAttendees: 25,
      materials: ["Lab Instructions", "Starter Code"]
    }
  ];

  const todaysClasses = classes.filter(cls => cls.date === "2024-01-15");
  const tomorrowsClasses = classes.filter(cls => cls.date === "2024-01-16");
  const thisWeekClasses = classes;

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'live':
        return { color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300', label: 'Live Now' };
      case 'upcoming':
        return { color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300', label: 'Upcoming' };
      case 'scheduled':
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', label: 'Scheduled' };
      case 'completed':
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', label: 'Completed' };
      default:
        return { color: 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300', label: 'Unknown' };
    }
  };

  const getClassesToShow = () => {
    switch (selectedView) {
      case 'today': return todaysClasses;
      case 'tomorrow': return tomorrowsClasses;
      case 'week': return thisWeekClasses;
      default: return todaysClasses;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <div className="space-y-4 md:space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Classes</h1>
          <p className="text-sm md:text-base text-muted-foreground">
            View your class schedule and join online sessions
          </p>
        </div>
        <div className="flex flex-col sm:flex-row gap-2">
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Calendar className="h-4 w-4 mr-2" />
            Full Calendar
          </Button>
          <Button variant="outline" size="sm" className="w-full sm:w-auto">
            <Bell className="h-4 w-4 mr-2" />
            Notifications
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-blue-600">{todaysClasses.length}</p>
            <p className="text-sm text-muted-foreground">Today</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-green-600">{tomorrowsClasses.length}</p>
            <p className="text-sm text-muted-foreground">Tomorrow</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-purple-600">{thisWeekClasses.length}</p>
            <p className="text-sm text-muted-foreground">This Week</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <p className="text-2xl font-bold text-orange-600">
              {classes.filter(c => c.status === 'live').length}
            </p>
            <p className="text-sm text-muted-foreground">Live Now</p>
          </CardContent>
        </Card>
      </div>

      {/* View Selector */}
      <Tabs value={selectedView} onValueChange={setSelectedView} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="today">Today</TabsTrigger>
          <TabsTrigger value="tomorrow">Tomorrow</TabsTrigger>
          <TabsTrigger value="week">This Week</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedView} className="space-y-4">
          {/* Classes List */}
          <div className="space-y-4">
            {getClassesToShow().map((classItem) => {
              const statusInfo = getStatusInfo(classItem.status);

              return (
                <Card key={classItem.id} className="hover:shadow-lg transition-shadow duration-200">
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2">
                      <div className="space-y-1 flex-1">
                        <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                          <CardTitle className="text-lg">{classItem.code}</CardTitle>
                          <Badge className={statusInfo.color}>
                            {statusInfo.label}
                          </Badge>
                          <Badge variant="outline">{classItem.type}</Badge>
                        </div>
                        <CardDescription>{classItem.title}</CardDescription>
                      </div>
                      <div className="text-right">
                        <p className="text-sm text-muted-foreground">Duration</p>
                        <p className="font-semibold">{classItem.duration} min</p>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {/* Class Details */}
                    <div className="grid gap-3 sm:grid-cols-2">
                      <div className="flex items-center gap-2 text-sm">
                        <Clock className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{classItem.time}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{formatDate(classItem.date)}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        {classItem.isOnline ? (
                          <Video className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        ) : (
                          <MapPin className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        )}
                        <span className="truncate">{classItem.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Users className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                        <span>{classItem.lecturer}</span>
                      </div>
                    </div>

                    {/* Attendance Info */}
                    <div className="bg-gray-50 dark:bg-gray-900 p-3 rounded-lg">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>
                            {classItem.attendees}/{classItem.maxAttendees} attending
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <BookOpen className="h-4 w-4 text-muted-foreground" />
                          <span>{classItem.materials.length} materials</span>
                        </div>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-col sm:flex-row gap-2">
                      {classItem.status === 'live' && classItem.isOnline && (
                        <Button className="flex-1">
                          <Video className="h-4 w-4 mr-2" />
                          Join Live Session
                        </Button>
                      )}
                      {classItem.status === 'upcoming' && classItem.isOnline && (
                        <Button variant="outline" className="flex-1">
                          <Video className="h-4 w-4 mr-2" />
                          Join at {classItem.time.split(' - ')[0]}
                        </Button>
                      )}
                      {!classItem.isOnline && (
                        <Button variant="outline" className="flex-1">
                          <MapPin className="h-4 w-4 mr-2" />
                          Get Directions
                        </Button>
                      )}
                      <Button variant="outline" className="flex-1">
                        <BookOpen className="h-4 w-4 mr-2" />
                        View Materials
                      </Button>
                      <Button variant="outline" className="flex-1">
                        <Bell className="h-4 w-4 mr-2" />
                        Remind Me
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {getClassesToShow().length === 0 && (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <p className="text-lg font-medium mb-2">No classes scheduled</p>
                <p className="text-muted-foreground">
                  {selectedView === 'today' && "You have no classes today. Enjoy your free time!"}
                  {selectedView === 'tomorrow' && "No classes scheduled for tomorrow."}
                  {selectedView === 'week' && "No classes scheduled for this week."}
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default StudentClasses;
