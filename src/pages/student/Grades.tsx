import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { GraduationCap, TrendingUp, Award, BookOpen, BarChart3, Download, Calendar, Target } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area } from 'recharts';
import { useAuth } from '@/contexts/AuthContext';
import {
  getStudentGradeOverview,
  getGradeDistribution,
  StudentGradeOverview,
  getLetterGrade,
  type CourseGrade
} from '@/services/gradeService';
import { showErrorToast } from '@/utils/ui/toast';

const Grades = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('current');
  const [loading, setLoading] = useState(true);
  const [gradeOverview, setGradeOverview] = useState<StudentGradeOverview | null>(null);
  const [gradeDistribution, setGradeDistribution] = useState<{ grade: string; count: number }[]>([]);

  // Chart colors
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

  useEffect(() => {
    if (user?.id) {
      fetchGradeData();
    }
  }, [user?.id]);

  const fetchGradeData = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      const [overview, distribution] = await Promise.all([
        getStudentGradeOverview(user.id),
        getGradeDistribution(user.id)
      ]);

      setGradeOverview(overview);
      setGradeDistribution(distribution);
    } catch (error) {
      console.error('Error fetching grade data:', error);
      showErrorToast('Failed to load grade data');
    } finally {
      setLoading(false);
    }
  };

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

  const renderLoadingSkeleton = () => (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <Skeleton className="h-16 w-full" />
            </CardContent>
          </Card>
        ))}
      </div>
      <Skeleton className="h-96 w-full" />
    </div>
  );

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Academic Grades</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your academic performance and progress</p>
          </div>
        </div>
        {renderLoadingSkeleton()}
      </div>
    );
  }

  if (!gradeOverview) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Academic Grades</h1>
            <p className="text-gray-600 dark:text-gray-400">Track your academic performance and progress</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <p className="text-muted-foreground">No grade data available yet.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

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
                <p className="text-2xl font-bold text-green-600">{gradeOverview.overall_gpa.toFixed(2)}</p>
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
                <p className="text-2xl font-bold text-blue-600">{gradeOverview.total_credits}</p>
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
                <p className="text-2xl font-bold text-purple-600">{gradeOverview.completed_courses}</p>
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
                <p className="text-2xl font-bold text-orange-600">
                  {gradeOverview.current_semester?.semester_gpa?.toFixed(2) || '0.00'}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Data Visualization Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Grade Distribution Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Grade Distribution
            </CardTitle>
            <CardDescription>Your grade distribution across all assignments</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={gradeDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="grade" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* GPA Trend Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              GPA Trend
            </CardTitle>
            <CardDescription>Your GPA progression over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={gradeOverview.grade_trends || []}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="semester" />
                <YAxis domain={[0, 4]} />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="gpa" stroke="#10B981" strokeWidth={2} name="GPA" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Grades Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="current">Current Semester</TabsTrigger>
          <TabsTrigger value="analytics">Performance Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="current" className="space-y-4">
          {gradeOverview.current_semester ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>{gradeOverview.current_semester.semester} {gradeOverview.current_semester.academic_year}</span>
                  <div className="flex items-center space-x-4">
                    <Badge className="bg-green-600">GPA: {gradeOverview.current_semester.semester_gpa.toFixed(2)}</Badge>
                    <Badge variant="outline">{gradeOverview.current_semester.total_credits} Credits</Badge>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {gradeOverview.current_semester.courses.map((course, index) => (
                <Card key={index} className="border-l-4 border-l-blue-500">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{course.course_code}</CardTitle>
                        <CardDescription className="font-medium">{course.course_title}</CardDescription>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Instructor: {course.instructor_name}</p>
                        <p className="text-sm text-gray-500">Credits: {course.credits}</p>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Badge variant={getGradeBadgeVariant(course.letter_grade)} className={getGradeColor(course.letter_grade)}>
                          {course.letter_grade}
                        </Badge>
                        <Badge variant="outline">
                          {course.gpa_points.toFixed(1)} GPA
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Course Average</span>
                      <span className="text-sm font-bold">{course.average_percentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={course.average_percentage} className="h-2" />

                    <div className="space-y-2">
                      <h4 className="text-sm font-medium">Recent Assignments ({course.assignments.length})</h4>
                      {course.assignments.slice(0, 3).map((assignment, idx) => (
                        <div key={idx} className="flex items-center justify-between text-sm">
                          <span className="truncate flex-1 mr-2">{assignment.assignment_title}</span>
                          <div className="flex items-center space-x-2">
                            <Badge variant="outline">
                              {assignment.grade}/{assignment.total_points}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {assignment.percentage.toFixed(0)}%
                            </span>
                          </div>
                        </div>
                      ))}
                      {course.assignments.length > 3 && (
                        <p className="text-xs text-gray-500">
                          +{course.assignments.length - 3} more assignments
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6 text-center">
                <p className="text-muted-foreground">No current semester data available.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          {/* Performance Analytics */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Course Performance Comparison */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Course Performance
                </CardTitle>
                <CardDescription>Compare your performance across courses</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={gradeOverview.current_semester?.courses || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="course_code" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="average_percentage" fill="#10B981" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* GPA vs Credits */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  GPA vs Credits
                </CardTitle>
                <CardDescription>Relationship between course load and performance</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={gradeOverview.current_semester?.courses || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="course_code" />
                    <YAxis />
                    <Tooltip />
                    <Area type="monotone" dataKey="gpa_points" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Performance Metrics */}
          <Card>
            <CardHeader>
              <CardTitle>Detailed Performance Metrics</CardTitle>
              <CardDescription>Comprehensive analysis of your academic performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-green-600">
                    {gradeOverview.current_semester?.courses?.filter(c => c.letter_grade.startsWith('A')).length || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">A Grades</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">
                    {gradeOverview.current_semester?.courses?.reduce((sum, c) => sum + c.assignments.length, 0) || 0}
                  </div>
                  <div className="text-sm text-muted-foreground">Total Assignments</div>
                </div>
                <div className="text-center p-4 bg-gradient-to-r from-purple-50 to-violet-50 dark:from-purple-950/20 dark:to-violet-950/20 rounded-lg">
                  <div className="text-2xl font-bold text-purple-600">
                    {gradeOverview.current_semester?.courses?.length ?
                      (gradeOverview.current_semester.courses.reduce((sum, c) => sum + c.average_percentage, 0) / gradeOverview.current_semester.courses.length).toFixed(1) : '0.0'}%
                  </div>
                  <div className="text-sm text-muted-foreground">Average Score</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Grades;
