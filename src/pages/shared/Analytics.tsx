import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { getLecturerAnalytics, LecturerAnalytics } from '@/services/analyticsService';
import { getLecturerCourses } from '@/services/courseService';
import { getSystemMetrics } from '@/services/adminService';
import {
  TrendingUp,
  TrendingDown,
  Users,
  BookOpen,
  Clock,
  Award,
  CheckCircle,
  Download,
  Target,
  Activity,
  BarChart3,
  PieChart,
  Loader2,
  Database,
  Shield
} from 'lucide-react';

const Analytics = () => {
  const { dbUser } = useAuth();
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('semester');
  const [analytics, setAnalytics] = useState<LecturerAnalytics | null>(null);
  const [systemMetrics, setSystemMetrics] = useState<any>(null);
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch analytics data based on user role
  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!dbUser?.auth_id) return;

      try {
        setLoading(true);
        setError(null);

        if (dbUser.role === 'admin') {
          // For admin users, show system-wide analytics
          const metrics = await getSystemMetrics();
          setSystemMetrics(metrics);
          
          // Create admin-specific analytics structure
          const adminAnalytics: LecturerAnalytics = {
            overview: {
              totalStudents: metrics.totalStudents,
              activeStudents: metrics.activeUsers,
              averageGrade: 85, // This would come from system-wide grade calculation
              attendanceRate: 78,
              assignmentCompletion: 82,
              courseCompletion: 76,
              improvementRate: 5.2
            },
            coursePerformance: [
              {
                course_id: 'system-wide',
                course: 'System-wide Performance',
                students: metrics.totalStudents,
                averageGrade: 85,
                attendance: 78,
                completion: 82,
                trend: 'up' as const,
                trendValue: 5.2
              }
            ],
            studentDistribution: {
              highPerformers: Math.floor(metrics.totalStudents * 0.25),
              averagePerformers: Math.floor(metrics.totalStudents * 0.45),
              needsAttention: Math.floor(metrics.totalStudents * 0.20),
              atRisk: Math.floor(metrics.totalStudents * 0.10)
            },
            weeklyTrends: [
              { week: 'Week 1', logins: 450, submissions: 89, materials: 234, discussions: 67 },
              { week: 'Week 2', logins: 523, submissions: 102, materials: 267, discussions: 78 },
              { week: 'Week 3', logins: 489, submissions: 95, materials: 245, discussions: 71 },
              { week: 'Week 4', logins: 567, submissions: 118, materials: 289, discussions: 85 },
              { week: 'Week 5', logins: 612, submissions: 134, materials: 312, discussions: 92 }
            ],
            engagementMetrics: {
              materialViews: metrics.totalCourses * 45,
              forumPosts: 234,
              aiTutorQueries: 567,
              messagesSent: 892,
              averageSessionDuration: 1800,
              peakActivityHour: 14
            }
          };
          
          setAnalytics(adminAnalytics);
          setCourses([{ id: 'all', name: 'All System Courses' }]);

        } else if (dbUser.role === 'dean') {
          // For dean users, show faculty-wide analytics
          const metrics = await getSystemMetrics();
          
          // Filter data for dean's faculty
          const facultyStudents = Math.floor(metrics.totalStudents * 0.3); // Assume 30% are in this faculty
          
          const deanAnalytics: LecturerAnalytics = {
            overview: {
              totalStudents: facultyStudents,
              activeStudents: Math.floor(facultyStudents * 0.8),
              averageGrade: 83,
              attendanceRate: 81,
              assignmentCompletion: 79,
              courseCompletion: 74,
              improvementRate: 3.8
            },
            coursePerformance: [
              {
                course_id: 'faculty-wide',
                course: `${dbUser.faculty || 'Faculty'} Performance`,
                students: facultyStudents,
                averageGrade: 83,
                attendance: 81,
                completion: 79,
                trend: 'up' as const,
                trendValue: 3.8
              }
            ],
            studentDistribution: {
              highPerformers: Math.floor(facultyStudents * 0.28),
              averagePerformers: Math.floor(facultyStudents * 0.42),
              needsAttention: Math.floor(facultyStudents * 0.22),
              atRisk: Math.floor(facultyStudents * 0.08)
            },
            weeklyTrends: [
              { week: 'Week 1', logins: 135, submissions: 27, materials: 78, discussions: 23 },
              { week: 'Week 2', logins: 157, submissions: 31, materials: 89, discussions: 28 },
              { week: 'Week 3', logins: 147, submissions: 29, materials: 82, discussions: 25 },
              { week: 'Week 4', logins: 170, submissions: 35, materials: 95, discussions: 32 },
              { week: 'Week 5', logins: 184, submissions: 40, materials: 103, discussions: 36 }
            ],
            engagementMetrics: {
              materialViews: 1234,
              forumPosts: 89,
              aiTutorQueries: 167,
              messagesSent: 245,
              averageSessionDuration: 1650,
              peakActivityHour: 13
            }
          };
          
          setAnalytics(deanAnalytics);
          setCourses([{ id: 'all', name: `All ${dbUser.faculty || 'Faculty'} Courses` }]);

        } else {
          // For lecturer users, use the existing lecturer analytics
          const [analyticsData, coursesData] = await Promise.all([
            getLecturerAnalytics(dbUser.auth_id),
            getLecturerCourses(dbUser.auth_id)
          ]);

          setAnalytics(analyticsData);

          // Format courses for dropdown
          const formattedCourses = [
            { id: 'all', name: 'All Courses' },
            ...coursesData.map(course => ({
              id: course.id,
              name: `${course.code} - ${course.title}`
            }))
          ];
          setCourses(formattedCourses);
        }

      } catch (err) {
        console.error('Error fetching analytics:', err);
        setError('Failed to load analytics data');
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [dbUser?.auth_id, dbUser?.role, dbUser?.faculty]);

  const getTrendIcon = (trend: string) => {
    return trend === 'up' ?
      <TrendingUp className="h-4 w-4 text-green-600" /> :
      <TrendingDown className="h-4 w-4 text-red-600" />;
  };

  const getTrendColor = (trend: string) => {
    return trend === 'up' ? 'text-green-600' : 'text-red-600';
  };

  const getRoleSpecificTitle = () => {
    switch (dbUser?.role) {
      case 'admin':
        return 'System Analytics Dashboard';
      case 'dean':
        return `${dbUser.faculty || 'Faculty'} Analytics Dashboard`;
      case 'lecturer':
        return 'Teaching Analytics Dashboard';
      default:
        return 'Analytics Dashboard';
    }
  };

  const getRoleSpecificDescription = () => {
    switch (dbUser?.role) {
      case 'admin':
        return 'System-wide insights into performance and engagement across all faculties';
      case 'dean':
        return `Comprehensive insights into ${dbUser.faculty || 'faculty'} performance and engagement`;
      case 'lecturer':
        return 'Comprehensive insights into student performance and engagement';
      default:
        return 'Performance and engagement insights';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  // Use dynamic data from analytics
  const { overview, coursePerformance, studentDistribution, weeklyTrends, engagementMetrics } = analytics;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{getRoleSpecificTitle()}</h1>
          <p className="text-gray-600 dark:text-gray-400">{getRoleSpecificDescription()}</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedCourse} onValueChange={setSelectedCourse}>
            <SelectTrigger className="w-64">
              <SelectValue placeholder="Select scope" />
            </SelectTrigger>
            <SelectContent>
              {courses.map(course => (
                <SelectItem key={course.id} value={course.id}>
                  {course.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Time period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="week">This Week</SelectItem>
              <SelectItem value="month">This Month</SelectItem>
              <SelectItem value="semester">This Semester</SelectItem>
              <SelectItem value="year">This Year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>
      </div>

      {/* Admin-specific system metrics */}
      {dbUser?.role === 'admin' && systemMetrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">System Health</p>
                  <p className="text-2xl font-bold text-green-600">{systemMetrics.systemUptime}%</p>
                </div>
                <Shield className="h-8 w-8 text-green-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Courses</p>
                  <p className="text-2xl font-bold text-blue-600">{systemMetrics.totalCourses}</p>
                </div>
                <BookOpen className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Enrollments</p>
                  <p className="text-2xl font-bold text-purple-600">{systemMetrics.totalEnrollments}</p>
                </div>
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Storage Used</p>
                  <p className="text-2xl font-bold text-orange-600">{systemMetrics.storageUsed}%</p>
                </div>
                <Database className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Overview Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {dbUser?.role === 'admin' ? 'Total Students' : 'Students'}
                </p>
                <p className="text-2xl font-bold text-blue-600">{overview.totalStudents}</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{overview.improvementRate}% this semester
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Grade</p>
                <p className="text-2xl font-bold text-green-600">{overview.averageGrade}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  +{Math.abs(overview.improvementRate)}% from last month
                </p>
              </div>
              <Award className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Attendance Rate</p>
                <p className="text-2xl font-bold text-purple-600">{overview.attendanceRate}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Active: {overview.activeStudents}
                </p>
              </div>
              <Clock className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Assignment Completion</p>
                <p className="text-2xl font-bold text-orange-600">{overview.assignmentCompletion}%</p>
                <p className="text-xs text-green-600 flex items-center mt-1">
                  <TrendingUp className="h-3 w-3 mr-1" />
                  Course completion: {overview.courseCompletion}%
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Performance Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <BarChart3 className="h-5 w-5" />
            <span>Performance Overview</span>
          </CardTitle>
          <CardDescription>
            {dbUser?.role === 'admin' ? 'System-wide performance metrics' : 
             dbUser?.role === 'dean' ? 'Faculty performance metrics' : 
             'Performance metrics across your courses'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {coursePerformance.map((course, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{course.course}</h4>
                    <p className="text-sm text-gray-600">{course.students} students</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    {getTrendIcon(course.trend)}
                    <span className={`text-sm font-medium ${getTrendColor(course.trend)}`}>
                      {course.trend === 'up' ? '+' : ''}{course.trendValue}%
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Average Grade</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={course.averageGrade} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{course.averageGrade}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Attendance</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={course.attendance} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{course.attendance}%</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Completion</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={course.completion} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{course.completion}%</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Student Distribution and Engagement */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Student Performance Distribution</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                  <span className="text-sm">High Performers (90%+)</span>
                </div>
                <span className="font-medium">{studentDistribution.highPerformers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                  <span className="text-sm">Average Performers (70-89%)</span>
                </div>
                <span className="font-medium">{studentDistribution.averagePerformers}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <span className="text-sm">Needs Attention (60-69%)</span>
                </div>
                <span className="font-medium">{studentDistribution.needsAttention}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <span className="text-sm">At Risk (Below 60%)</span>
                </div>
                <span className="font-medium">{studentDistribution.atRisk}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Activity className="h-5 w-5" />
              <span>Engagement Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center">
                <BookOpen className="h-8 w-8 mx-auto mb-2 text-blue-600" />
                <p className="text-2xl font-bold text-blue-600">{engagementMetrics.materialViews}</p>
                <p className="text-sm text-gray-600">Material Views</p>
              </div>
              <div className="text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-green-600" />
                <p className="text-2xl font-bold text-green-600">{engagementMetrics.forumPosts}</p>
                <p className="text-sm text-gray-600">Forum Posts</p>
              </div>
              <div className="text-center">
                <Target className="h-8 w-8 mx-auto mb-2 text-purple-600" />
                <p className="text-2xl font-bold text-purple-600">{engagementMetrics.aiTutorQueries}</p>
                <p className="text-sm text-gray-600">AI Tutor Queries</p>
              </div>
              <div className="text-center">
                <Users className="h-8 w-8 mx-auto mb-2 text-orange-600" />
                <p className="text-2xl font-bold text-orange-600">{engagementMetrics.messagesSent}</p>
                <p className="text-sm text-gray-600">Messages Sent</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Weekly Trends */}
      <Card>
        <CardHeader>
          <CardTitle>Weekly Activity Trends</CardTitle>
          <CardDescription>Activity patterns over the past 5 weeks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklyTrends.map((week, index) => (
              <div key={index} className="border rounded-lg p-4">
                <h4 className="font-semibold mb-3">{week.week}</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Logins</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={Math.min((week.logins / 600) * 100, 100)} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{week.logins}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Submissions</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={Math.min((week.submissions / 150) * 100, 100)} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{week.submissions}</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Material Views</p>
                    <div className="flex items-center space-x-2">
                      <Progress value={Math.min((week.materials / 350) * 100, 100)} className="flex-1 h-2" />
                      <span className="text-sm font-medium">{week.materials}</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Analytics;
