import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { GraduationCap, TrendingUp, Award, BookOpen, BarChart3, Download } from 'lucide-react';

const Grades = () => {
  const [activeTab, setActiveTab] = useState('current');

  const currentSemester = {
    semester: 'Spring 2024',
    gpa: 3.75,
    credits: 15,
    courses: [
      {
        code: 'CS 301',
        name: 'Data Structures and Algorithms',
        instructor: 'Dr. Sarah Johnson',
        credits: 3,
        grade: 'A-',
        percentage: 92,
        assignments: [
          { name: 'Binary Tree Implementation', grade: 95, points: 100 },
          { name: 'Graph Algorithms', grade: 88, points: 100 },
          { name: 'Midterm Exam', grade: 94, points: 150 }
        ]
      },
      {
        code: 'CS 205',
        name: 'Database Management Systems',
        instructor: 'Prof. Michael Chen',
        credits: 4,
        grade: 'B+',
        percentage: 87,
        assignments: [
          { name: 'ER Diagram Design', grade: 90, points: 100 },
          { name: 'SQL Queries Project', grade: 85, points: 100 },
          { name: 'Database Implementation', grade: 86, points: 150 }
        ]
      },
      {
        code: 'CS 401',
        name: 'Software Engineering',
        instructor: 'Dr. Emily Rodriguez',
        credits: 3,
        grade: 'A',
        percentage: 95,
        assignments: [
          { name: 'Requirements Document', grade: 98, points: 100 },
          { name: 'System Design', grade: 92, points: 100 },
          { name: 'Testing Plan', grade: 96, points: 100 }
        ]
      },
      {
        code: 'CS 350',
        name: 'Computer Networks',
        instructor: 'Dr. James Wilson',
        credits: 3,
        grade: 'B',
        percentage: 83,
        assignments: [
          { name: 'Protocol Analysis', grade: 80, points: 100 },
          { name: 'Network Simulation', grade: 85, points: 100 },
          { name: 'Security Assessment', grade: 84, points: 100 }
        ]
      },
      {
        code: 'MATH 301',
        name: 'Discrete Mathematics',
        instructor: 'Prof. Lisa Anderson',
        credits: 2,
        grade: 'A-',
        percentage: 91,
        assignments: [
          { name: 'Logic Proofs', grade: 93, points: 100 },
          { name: 'Graph Theory', grade: 89, points: 100 },
          { name: 'Final Exam', grade: 91, points: 200 }
        ]
      }
    ]
  };

  const previousSemesters = [
    {
      semester: 'Fall 2023',
      gpa: 3.65,
      credits: 16,
      courses: [
        { code: 'CS 201', name: 'Object-Oriented Programming', grade: 'A', percentage: 95 },
        { code: 'CS 202', name: 'Computer Architecture', grade: 'B+', percentage: 87 },
        { code: 'MATH 201', name: 'Calculus II', grade: 'B', percentage: 83 },
        { code: 'ENG 101', name: 'Technical Writing', grade: 'A-', percentage: 91 }
      ]
    },
    {
      semester: 'Spring 2023',
      gpa: 3.45,
      credits: 15,
      courses: [
        { code: 'CS 101', name: 'Introduction to Programming', grade: 'A', percentage: 96 },
        { code: 'MATH 101', name: 'Calculus I', grade: 'B+', percentage: 88 },
        { code: 'PHY 101', name: 'Physics I', grade: 'B', percentage: 82 },
        { code: 'ENG 100', name: 'English Composition', grade: 'A-', percentage: 90 }
      ]
    }
  ];

  const getGradeColor = (grade: string) => {
    if (grade.startsWith('A')) return 'text-green-600';
    if (grade.startsWith('B')) return 'text-blue-600';
    if (grade.startsWith('C')) return 'text-yellow-600';
    if (grade.startsWith('D')) return 'text-orange-600';
    return 'text-red-600';
  };

  const getGradeBadgeVariant = (grade: string) => {
    if (grade.startsWith('A')) return 'default';
    if (grade.startsWith('B')) return 'secondary';
    if (grade.startsWith('C')) return 'outline';
    return 'destructive';
  };

  const overallGPA = 3.62;
  const totalCredits = 46;
  const completedCourses = 13;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Academic Grades</h1>
          <p className="text-gray-600 dark:text-gray-400">Track your academic performance and progress</p>
        </div>
        <Button className="bg-blue-600 hover:bg-blue-700">
          <Download className="h-4 w-4 mr-2" />
          Download Transcript
        </Button>
      </div>

      {/* Overall Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overall GPA</p>
                <p className="text-2xl font-bold text-green-600">{overallGPA}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Credits</p>
                <p className="text-2xl font-bold text-blue-600">{totalCredits}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Courses Completed</p>
                <p className="text-2xl font-bold text-purple-600">{completedCourses}</p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Current Semester GPA</p>
                <p className="text-2xl font-bold text-orange-600">{currentSemester.gpa}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grades Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Current Semester</TabsTrigger>
          <TabsTrigger value="history">Grade History</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{currentSemester.semester}</span>
                <div className="flex items-center space-x-4">
                  <Badge variant="outline">{currentSemester.credits} Credits</Badge>
                  <Badge className="bg-green-600">GPA: {currentSemester.gpa}</Badge>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {currentSemester.courses.map((course, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{course.code}</CardTitle>
                        <CardDescription className="font-medium">{course.name}</CardDescription>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Instructor: {course.instructor}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getGradeBadgeVariant(course.grade)} className={getGradeColor(course.grade)}>
                          {course.grade}
                        </Badge>
                        <Badge variant="outline">{course.credits} Credits</Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Course Average</span>
                      <span className="text-sm font-bold">{course.percentage}%</span>
                    </div>
                    <Progress value={course.percentage} className="h-2" />
                    
                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Recent Assignments</h4>
                      {course.assignments.map((assignment, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span>{assignment.name}</span>
                          <Badge variant="outline">
                            {assignment.grade}/{assignment.points}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="history" className="space-y-4">
          {previousSemesters.map((semester, index) => (
            <Card key={index}>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{semester.semester}</span>
                  <div className="flex items-center space-x-4">
                    <Badge variant="outline">{semester.credits} Credits</Badge>
                    <Badge className="bg-blue-600">GPA: {semester.gpa}</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {semester.courses.map((course, idx) => (
                    <div key={idx} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <p className="font-medium">{course.code}</p>
                        <p className="text-sm text-gray-600 dark:text-gray-400">{course.name}</p>
                      </div>
                      <div className="text-right">
                        <Badge variant={getGradeBadgeVariant(course.grade)} className={getGradeColor(course.grade)}>
                          {course.grade}
                        </Badge>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">{course.percentage}%</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Grades;
