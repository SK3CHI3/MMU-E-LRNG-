import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GraduationCap, TrendingUp, BarChart3, Lock } from 'lucide-react';

const GuestGrades = () => {
  const mockGrades = [
    { course: "CS201 - Data Structures", grade: "A-", points: 87, credits: 3, gpa: 3.7 },
    { course: "CS202 - Database Systems", grade: "B+", points: 83, credits: 3, gpa: 3.3 },
    { course: "CS203 - Web Development", grade: "A", points: 92, credits: 4, gpa: 4.0 },
    { course: "CS204 - Software Engineering", grade: "B", points: 78, credits: 3, gpa: 3.0 },
    { course: "CS205 - Computer Networks", grade: "B-", points: 75, credits: 3, gpa: 2.7 },
    { course: "CS206 - Operating Systems", grade: "B+", points: 85, credits: 4, gpa: 3.3 }
  ];

  const currentGPA = 3.33;
  const totalCredits = mockGrades.reduce((sum, grade) => sum + grade.credits, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Grades</h1>
          <p className="text-muted-foreground">View your academic performance and grades</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">GPA: {currentGPA}</span>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{currentGPA}</div>
            <p className="text-xs text-muted-foreground">Out of 4.0</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Credits</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCredits}</div>
            <p className="text-xs text-muted-foreground">Credit hours</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Score</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {Math.round(mockGrades.reduce((sum, grade) => sum + grade.points, 0) / mockGrades.length)}%
            </div>
            <p className="text-xs text-muted-foreground">Overall average</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Grade Report</CardTitle>
          <CardDescription>Your grades for the current semester</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockGrades.map((grade, index) => (
              <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{grade.course}</h4>
                  <p className="text-sm text-muted-foreground">{grade.credits} credits</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="font-medium">{grade.points}%</div>
                    <div className="text-sm text-muted-foreground">Score</div>
                  </div>
                  <Badge variant="outline" className="min-w-[60px] justify-center">
                    {grade.grade}
                  </Badge>
                  <div className="text-right">
                    <div className="font-medium">{grade.gpa}</div>
                    <div className="text-sm text-muted-foreground">GPA</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button disabled className="flex items-center gap-2">
          <BarChart3 className="h-4 w-4" />
          View Analytics
          <Lock className="h-3 w-3" />
        </Button>
        <Button variant="outline" disabled className="flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          Download Transcript
          <Lock className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default GuestGrades;
