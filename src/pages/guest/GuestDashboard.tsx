import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CalendarDays, Clock, FileText, BookOpen, GraduationCap, Lock } from 'lucide-react';
import AnnouncementBanner from "@/components/announcements/AnnouncementBanner";

const GuestDashboard = () => {
  // Mock student data
  const mockStudentData = {
    name: "Demo Student",
    admissionNumber: "MCS-234-178/2024",
    faculty: "Faculty of Computing and Information Technology",
    semester: "Semester 1.1",
    academicYear: "2024/2025",
    gpa: 3.75,
    enrolledCourses: 6,
    currentSemesterUnits: 6,
    unitsCompleted: 18,
    unitsPassed: 16,
    unitsFailed: 2,
    programmeTitle: "Bachelor of Science in Computer Science",
    yearOfStudy: 2,
    upcomingClasses: [
      { id: 1, subject: "Data Structures & Algorithms", time: "09:00 - 11:00", room: "Lab 1", type: "Lecture" },
      { id: 2, subject: "Database Systems", time: "11:30 - 13:30", room: "Room 205", type: "Tutorial" },
      { id: 3, subject: "Web Development", time: "14:00 - 16:00", room: "Lab 2", type: "Practical" }
    ],
    pendingAssignments: [
      { id: 1, title: "Database Design Project", course: "Database Systems", dueDate: "2024-02-20" },
      { id: 2, title: "Algorithm Analysis Report", course: "Data Structures", dueDate: "2024-02-25" },
      { id: 3, title: "Web App Development", course: "Web Development", dueDate: "2024-02-28" }
    ]
  };

  const displayValue = (value: any, type: 'text' | 'number' = 'text') => {
    if (value === null || value === undefined || value === '') return "N/A";
    if (type === 'number' && value === 0) return "N/A";
    return value;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Student Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {displayValue(mockStudentData.name)} • {displayValue(mockStudentData.admissionNumber)}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Student</span>
        </div>
      </div>

      {/* Announcement Banner */}
      <AnnouncementBanner maxAnnouncements={2} compact={false} />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Semester</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayValue(mockStudentData.semester)}</div>
            <p className="text-xs text-muted-foreground">
              Academic Year {displayValue(mockStudentData.academicYear)}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayValue(mockStudentData.gpa, 'number')}</div>
            <p className="text-xs text-muted-foreground">
              {mockStudentData.gpa >= 3.5 ? "Excellent" : mockStudentData.gpa >= 3.0 ? "Good" : "Average"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Units</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{displayValue(mockStudentData.enrolledCourses, 'number')}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>
      </div>

      {/* My Units Statistics Card */}
      <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle>My Units</CardTitle>
          <CardDescription>Semester-specific unit statistics and progress</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-8 md:grid-cols-4 md:divide-x md:divide-gray-100 dark:md:divide-gray-800">
            <div className="text-center space-y-2 md:pr-6">
              <div className="text-2xl font-bold text-blue-600">{displayValue(mockStudentData.currentSemesterUnits, 'number')}</div>
              <p className="text-xs text-muted-foreground">Units Registered</p>
              <p className="text-xs text-muted-foreground">Current Semester</p>
            </div>
            <div className="text-center space-y-2 md:px-6">
              <div className="text-2xl font-bold text-green-600">{displayValue(mockStudentData.unitsCompleted, 'number')}</div>
              <p className="text-xs text-muted-foreground">Units Completed</p>
              <p className="text-xs text-muted-foreground">Total So Far</p>
            </div>
            <div className="text-center space-y-2 md:px-6">
              <div className="text-2xl font-bold text-emerald-600">{displayValue(mockStudentData.unitsPassed, 'number')}</div>
              <p className="text-xs text-muted-foreground">Units Passed</p>
              <p className="text-xs text-muted-foreground">Grade 50% or above</p>
            </div>
            <div className="text-center space-y-2 md:pl-6">
              <div className="text-2xl font-bold text-red-600">{displayValue(mockStudentData.unitsFailed, 'number')}</div>
              <p className="text-xs text-muted-foreground">Units Failed</p>
              <p className="text-xs text-muted-foreground">Grade below 50%</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t">
            <div className="flex justify-between items-center">
              <span className="text-sm text-muted-foreground">Programme:</span>
              <span className="text-sm font-medium">{displayValue(mockStudentData.programmeTitle)}</span>
            </div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-muted-foreground">Year of Study:</span>
              <span className="text-sm font-medium">Year {mockStudentData.yearOfStudy}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-6 md:grid-cols-2">
        {/* Upcoming Classes */}
        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Today's Classes
            </CardTitle>
            <CardDescription>Your schedule for today</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockStudentData.upcomingClasses.map((classItem) => (
                <div key={classItem.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{classItem.subject}</h4>
                    <p className="text-xs text-muted-foreground">{classItem.room} • {classItem.type}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{classItem.time}</p>
                    <Badge variant="outline" className="text-xs">{classItem.type}</Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" className="w-full" disabled>
                <CalendarDays className="h-4 w-4 mr-2" />
                View Full Schedule
                <Lock className="h-3 w-3 ml-auto" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Pending Assignments */}
        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Pending Assignments
            </CardTitle>
            <CardDescription>Assignments due soon</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {mockStudentData.pendingAssignments.map((assignment) => (
                <div key={assignment.id} className="flex items-center justify-between p-3 border rounded-lg bg-gray-50 dark:bg-gray-800/50">
                  <div className="flex-1">
                    <h4 className="font-medium text-sm">{assignment.title}</h4>
                    <p className="text-xs text-muted-foreground">{assignment.course}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium">{assignment.dueDate}</p>
                    <Badge variant="secondary" className="text-xs">pending</Badge>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <Button variant="outline" size="sm" className="w-full" disabled>
                <FileText className="h-4 w-4 mr-2" />
                View All Assignments
                <Lock className="h-3 w-3 ml-auto" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default GuestDashboard;