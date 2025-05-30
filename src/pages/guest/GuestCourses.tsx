import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Users, FileText, Lock, GraduationCap } from 'lucide-react';

const GuestCourses = () => {
  const mockCourses = [
    {
      id: 1,
      code: "CS201",
      title: "Data Structures & Algorithms",
      lecturer: "Dr. Jane Smith",
      credits: 3,
      progress: 75,
      grade: "A-",
      status: "In Progress",
      nextClass: "Monday 9:00 AM",
      assignments: 3,
      materials: 12
    },
    {
      id: 2,
      code: "CS202",
      title: "Database Systems",
      lecturer: "Prof. Michael Johnson",
      credits: 3,
      progress: 60,
      grade: "B+",
      status: "In Progress",
      nextClass: "Tuesday 11:30 AM",
      assignments: 2,
      materials: 8
    },
    {
      id: 3,
      code: "CS203",
      title: "Web Development",
      lecturer: "Dr. Sarah Wilson",
      credits: 4,
      progress: 85,
      grade: "A",
      status: "In Progress",
      nextClass: "Wednesday 2:00 PM",
      assignments: 1,
      materials: 15
    },
    {
      id: 4,
      code: "CS204",
      title: "Software Engineering",
      lecturer: "Dr. Robert Brown",
      credits: 3,
      progress: 45,
      grade: "B",
      status: "In Progress",
      nextClass: "Thursday 10:00 AM",
      assignments: 4,
      materials: 10
    },
    {
      id: 5,
      code: "CS205",
      title: "Computer Networks",
      lecturer: "Prof. Lisa Davis",
      credits: 3,
      progress: 30,
      grade: "B-",
      status: "In Progress",
      nextClass: "Friday 1:00 PM",
      assignments: 5,
      materials: 7
    },
    {
      id: 6,
      code: "CS206",
      title: "Operating Systems",
      lecturer: "Dr. Mark Taylor",
      credits: 4,
      progress: 55,
      grade: "B+",
      status: "In Progress",
      nextClass: "Monday 3:00 PM",
      assignments: 2,
      materials: 11
    }
  ];

  const getProgressColor = (progress: number) => {
    if (progress >= 80) return "text-green-600";
    if (progress >= 60) return "text-blue-600";
    if (progress >= 40) return "text-yellow-600";
    return "text-red-600";
  };

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (grade.startsWith('B')) return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    if (grade.startsWith('C')) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">My Units</h1>
          <p className="text-muted-foreground">
            Manage your enrolled units and track your progress
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{mockCourses.length} Units</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Units</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCourses.length}</div>
            <p className="text-xs text-muted-foreground">This semester</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mockCourses.reduce((sum, course) => sum + course.credits, 0)}</div>
            <p className="text-xs text-muted-foreground">Credit hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Progress</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(mockCourses.reduce((sum, course) => sum + course.progress, 0) / mockCourses.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Completion rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {mockCourses.reduce((sum, course) => sum + course.assignments, 0)}
            </div>
            <p className="text-xs text-muted-foreground">Due soon</p>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {mockCourses.map((course) => (
          <Card key={course.id} className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{course.code}</CardTitle>
                  <CardDescription className="font-medium">{course.title}</CardDescription>
                </div>
                <Badge className={getGradeColor(course.grade)}>
                  {course.grade}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Progress</span>
                  <span className={`font-medium ${getProgressColor(course.progress)}`}>
                    {course.progress}%
                  </span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Lecturer:</span>
                  <span className="font-medium">{course.lecturer}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Credits:</span>
                  <span className="font-medium">{course.credits}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Next Class:</span>
                  <span className="font-medium">{course.nextClass}</span>
                </div>
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>{course.assignments} assignments</span>
                </div>
                <div className="flex items-center gap-1">
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                  <span>{course.materials} materials</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" className="flex-1" disabled>
                  View Details
                  <Lock className="h-3 w-3 ml-2" />
                </Button>
                <Button variant="outline" size="sm" className="flex-1" disabled>
                  Materials
                  <Lock className="h-3 w-3 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button disabled className="flex items-center gap-2">
          <BookOpen className="h-4 w-4" />
          Enroll in New Unit
          <Lock className="h-3 w-3" />
        </Button>
        <Button variant="outline" disabled className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Download Transcript
          <Lock className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default GuestCourses;
