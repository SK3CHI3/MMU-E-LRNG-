import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Clock, Users, Calendar, Play, FileText } from 'lucide-react';

const Courses = () => {
  const enrolledCourses = [
    {
      id: 1,
      code: 'CS 301',
      name: 'Data Structures and Algorithms',
      instructor: 'Dr. Sarah Johnson',
      credits: 3,
      progress: 75,
      status: 'active',
      nextClass: '2024-01-15 10:00 AM',
      students: 45,
      assignments: 3,
      color: 'bg-blue-500'
    },
    {
      id: 2,
      code: 'CS 205',
      name: 'Database Management Systems',
      instructor: 'Prof. Michael Chen',
      credits: 4,
      progress: 60,
      status: 'active',
      nextClass: '2024-01-15 2:00 PM',
      students: 38,
      assignments: 2,
      color: 'bg-green-500'
    },
    {
      id: 3,
      code: 'CS 401',
      name: 'Software Engineering',
      instructor: 'Dr. Emily Rodriguez',
      credits: 3,
      progress: 45,
      status: 'active',
      nextClass: '2024-01-16 9:00 AM',
      students: 42,
      assignments: 4,
      color: 'bg-purple-500'
    },
    {
      id: 4,
      code: 'CS 350',
      name: 'Computer Networks',
      instructor: 'Dr. James Wilson',
      credits: 3,
      progress: 30,
      status: 'active',
      nextClass: '2024-01-16 11:00 AM',
      students: 35,
      assignments: 1,
      color: 'bg-orange-500'
    },
    {
      id: 5,
      code: 'CS 201',
      name: 'Object-Oriented Programming',
      instructor: 'Prof. Lisa Anderson',
      credits: 4,
      progress: 100,
      status: 'completed',
      nextClass: 'Course Completed',
      students: 40,
      assignments: 0,
      color: 'bg-gray-500'
    }
  ];

  const activeCoursesCount = enrolledCourses.filter(course => course.status === 'active').length;
  const totalCredits = enrolledCourses.reduce((sum, course) => sum + course.credits, 0);
  const averageProgress = Math.round(enrolledCourses.reduce((sum, course) => sum + course.progress, 0) / enrolledCourses.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Courses</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your enrolled courses and track progress</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <BookOpen className="h-4 w-4 mr-2" />
          Browse Courses
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Courses</p>
                <p className="text-2xl font-bold text-blue-600">{activeCoursesCount}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Credits</p>
                <p className="text-2xl font-bold text-green-600">{totalCredits}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Progress</p>
                <p className="text-2xl font-bold text-purple-600">{averageProgress}%</p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Assignments</p>
                <p className="text-2xl font-bold text-orange-600">
                  {enrolledCourses.reduce((sum, course) => sum + course.assignments, 0)}
                </p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {enrolledCourses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${course.color}`} />
                  <div>
                    <CardTitle className="text-lg">{course.code}</CardTitle>
                    <CardDescription className="font-medium">{course.name}</CardDescription>
                  </div>
                </div>
                <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                  {course.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <span>Instructor: {course.instructor}</span>
                <span>{course.credits} Credits</span>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Progress</span>
                  <span>{course.progress}%</span>
                </div>
                <Progress value={course.progress} className="h-2" />
              </div>

              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center space-x-4">
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{course.students}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <FileText className="h-4 w-4" />
                    <span>{course.assignments} pending</span>
                  </div>
                </div>
                <div className="flex items-center space-x-1 text-gray-600 dark:text-gray-400">
                  <Calendar className="h-4 w-4" />
                  <span>{course.nextClass}</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button size="sm" className="flex-1">
                  <Play className="h-4 w-4 mr-2" />
                  Enter Course
                </Button>
                <Button size="sm" variant="outline">
                  <FileText className="h-4 w-4 mr-2" />
                  Materials
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default Courses;
