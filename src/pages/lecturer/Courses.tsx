import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Users, FileText, Calendar, BarChart3, Settings, Plus } from 'lucide-react';

const LecturerCourses = () => {
  const courses = [
    {
      id: 1,
      code: 'CS 301',
      name: 'Data Structures and Algorithms',
      semester: 'Spring 2024',
      credits: 3,
      enrolledStudents: 45,
      maxCapacity: 50,
      schedule: 'Mon/Wed 9:00-10:30 AM',
      room: 'Room 201, CS Building',
      assignments: 8,
      pendingGrades: 12,
      averageGrade: 87,
      status: 'active',
      progress: 65
    },
    {
      id: 2,
      code: 'CS 205',
      name: 'Database Management Systems',
      semester: 'Spring 2024',
      credits: 4,
      enrolledStudents: 38,
      maxCapacity: 40,
      schedule: 'Tue/Thu 2:00-3:30 PM',
      room: 'Room 305, Engineering Building',
      assignments: 6,
      pendingGrades: 8,
      averageGrade: 82,
      status: 'active',
      progress: 55
    },
    {
      id: 3,
      code: 'CS 401',
      name: 'Software Engineering',
      semester: 'Spring 2024',
      credits: 3,
      enrolledStudents: 42,
      maxCapacity: 45,
      schedule: 'Mon/Wed/Fri 10:00-11:00 AM',
      room: 'Online via Zoom',
      assignments: 10,
      pendingGrades: 15,
      averageGrade: 89,
      status: 'active',
      progress: 70
    },
    {
      id: 4,
      code: 'CS 101',
      name: 'Introduction to Programming',
      semester: 'Fall 2023',
      credits: 4,
      enrolledStudents: 60,
      maxCapacity: 60,
      schedule: 'Completed',
      room: 'Room 150, CS Building',
      assignments: 12,
      pendingGrades: 0,
      averageGrade: 85,
      status: 'completed',
      progress: 100
    }
  ];

  const activeCourses = courses.filter(course => course.status === 'active');
  const totalStudents = activeCourses.reduce((sum, course) => sum + course.enrolledStudents, 0);
  const totalPendingGrades = activeCourses.reduce((sum, course) => sum + course.pendingGrades, 0);
  const averageClassSize = Math.round(totalStudents / activeCourses.length);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Courses</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your teaching courses and track student progress</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Create New Course
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Courses</p>
                <p className="text-2xl font-bold text-green-600">{activeCourses.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Grades</p>
                <p className="text-2xl font-bold text-orange-600">{totalPendingGrades}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Class Size</p>
                <p className="text-2xl font-bold text-purple-600">{averageClassSize}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {courses.map((course) => (
          <Card key={course.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    course.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                  }`} />
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
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Semester:</span>
                  <p className="font-medium">{course.semester}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Credits:</span>
                  <p className="font-medium">{course.credits}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Schedule:</span>
                  <p className="font-medium">{course.schedule}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Location:</span>
                  <p className="font-medium">{course.room}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Enrollment</span>
                  <span>{course.enrolledStudents}/{course.maxCapacity}</span>
                </div>
                <Progress 
                  value={(course.enrolledStudents / course.maxCapacity) * 100} 
                  className="h-2" 
                />
              </div>

              {course.status === 'active' && (
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Course Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <Progress value={course.progress} className="h-2" />
                </div>
              )}

              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                  <p className="font-bold text-blue-600">{course.assignments}</p>
                  <p className="text-blue-600">Assignments</p>
                </div>
                <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                  <p className="font-bold text-orange-600">{course.pendingGrades}</p>
                  <p className="text-orange-600">Pending</p>
                </div>
                <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                  <p className="font-bold text-green-600">{course.averageGrade}%</p>
                  <p className="text-green-600">Avg Grade</p>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button size="sm" className="flex-1">
                  <BookOpen className="h-4 w-4 mr-2" />
                  Manage Course
                </Button>
                <Button size="sm" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
                <Button size="sm" variant="outline">
                  <Settings className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default LecturerCourses;
