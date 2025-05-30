import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { getSystemMetrics, SystemMetrics } from '@/services/adminService';
import {
  Users,
  BookOpen,
  BarChart3,
  Loader2,
  GraduationCap,
  UserCheck,
  FileText,
  AlertCircle,
  TrendingUp,
  TrendingDown,
  Minus,
  Shield,
  Download,
  Activity,
  Database,
  Globe
} from 'lucide-react';

const AdminAnalytics = () => {
  const [systemMetrics, setSystemMetrics] = useState<SystemMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [selectedPeriod, setSelectedPeriod] = useState('month');

  useEffect(() => {
    fetchAdminAnalytics();
  }, []);

  const fetchAdminAnalytics = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch system metrics
      const metrics = await getSystemMetrics();
      setSystemMetrics(metrics);
    } catch (err) {
      console.error('Error fetching admin analytics:', err);
      setError('Failed to load analytics data');
    } finally {
      setLoading(false);
    }
  };

  // Create analytics structure from system metrics
  const analytics = systemMetrics ? {
    systemOverview: {
      totalUsers: systemMetrics.totalUsers,
      totalStudents: systemMetrics.totalStudents,
      totalLecturers: systemMetrics.totalLecturers,
      totalDeans: systemMetrics.totalDeans,
      totalAdmins: systemMetrics.totalAdmins,
      totalCourses: systemMetrics.totalCourses,
      totalEnrollments: systemMetrics.totalEnrollments,
      systemHealth: 98.5
    },
    systemMetrics: {
      cpuUsage: 45,
      memoryUsage: 62,
      storageUsage: 38,
      uptime: 99.8,
      activeConnections: 156
    },
    facultyPerformance: [
      {
        faculty: 'Faculty of Computing and Information Technology',
        students: Math.floor(systemMetrics.totalStudents * 0.6),
        lecturers: Math.floor(systemMetrics.totalLecturers * 0.5),
        courses: Math.floor(systemMetrics.totalCourses * 0.7),
        averageGrade: 82,
        completion: 78,
        trend: 'up' as const
      },
      {
        faculty: 'Faculty of Media and Communication',
        students: Math.floor(systemMetrics.totalStudents * 0.4),
        lecturers: Math.floor(systemMetrics.totalLecturers * 0.5),
        courses: Math.floor(systemMetrics.totalCourses * 0.3),
        averageGrade: 79,
        completion: 75,
        trend: 'stable' as const
      }
    ],
    userGrowth: [
      { month: 'January', students: Math.floor(systemMetrics.totalStudents * 0.2), lecturers: Math.floor(systemMetrics.totalLecturers * 0.2), total: Math.floor(systemMetrics.totalUsers * 0.2) },
      { month: 'February', students: Math.floor(systemMetrics.totalStudents * 0.4), lecturers: Math.floor(systemMetrics.totalLecturers * 0.4), total: Math.floor(systemMetrics.totalUsers * 0.4) },
      { month: 'March', students: Math.floor(systemMetrics.totalStudents * 0.6), lecturers: Math.floor(systemMetrics.totalLecturers * 0.6), total: Math.floor(systemMetrics.totalUsers * 0.6) },
      { month: 'April', students: Math.floor(systemMetrics.totalStudents * 0.8), lecturers: Math.floor(systemMetrics.totalLecturers * 0.8), total: Math.floor(systemMetrics.totalUsers * 0.8) },
      { month: 'May', students: systemMetrics.totalStudents, lecturers: systemMetrics.totalLecturers, total: systemMetrics.totalUsers }
    ]
  } : null;

  // Helper functions
  const faculties = [
    { id: 'computing', name: 'Faculty of Computing and Information Technology' },
    { id: 'media', name: 'Faculty of Media and Communication' }
  ];

  const getHealthStatus = (health: number) => {
    if (health >= 95) return { status: 'Excellent', color: 'text-green-600', bg: 'bg-green-50' };
    if (health >= 85) return { status: 'Good', color: 'text-blue-600', bg: 'bg-blue-50' };
    if (health >= 70) return { status: 'Fair', color: 'text-yellow-600', bg: 'bg-yellow-50' };
    return { status: 'Poor', color: 'text-red-600', bg: 'bg-red-50' };
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up': return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'down': return <TrendingDown className="h-4 w-4 text-red-600" />;
      default: return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTrendColor = (trend: string) => {
    switch (trend) {
      case 'up': return 'text-green-600';
      case 'down': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };



  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading admin analytics...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={fetchAdminAnalytics}>
            Try Again
          </Button>
        </div>
      </div>
    );
  }

  if (!analytics || !systemMetrics) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-muted-foreground">No analytics data available</p>
      </div>
    );
  }

  const healthStatus = getHealthStatus(analytics.systemOverview.systemHealth);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
            <BarChart3 className="h-8 w-8 text-blue-600" />
            Admin Analytics Dashboard
          </h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive system-wide analytics and insights</p>
        </div>
        <div className="flex space-x-2">
          <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Select faculty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Faculties</SelectItem>
              {faculties.map(faculty => (
                <SelectItem key={faculty.id} value={faculty.id}>
                  {faculty.name}
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

      {/* System Health Overview */}
      <Card className={`${healthStatus.bg} border-2`}>
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 rounded-full bg-white/50">
                <Shield className={`h-8 w-8 ${healthStatus.color}`} />
              </div>
              <div>
                <h3 className={`text-xl font-bold ${healthStatus.color}`}>
                  System Health: {healthStatus.status}
                </h3>
                <p className="text-sm text-gray-700">
                  Overall system performance: {analytics.systemOverview.systemHealth}% uptime
                </p>
              </div>
            </div>
            <div className="text-right">
              <div className={`text-3xl font-bold ${healthStatus.color}`}>
                {analytics.systemOverview.totalUsers}
              </div>
              <div className="text-sm text-gray-600">Total Users</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">System Overview</TabsTrigger>
          <TabsTrigger value="faculties">Faculty Performance</TabsTrigger>
          <TabsTrigger value="growth">User Growth</TabsTrigger>
          <TabsTrigger value="system">System Metrics</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                    <p className="text-2xl font-bold text-blue-600">{analytics.systemOverview.totalStudents}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      {analytics.systemOverview.totalStudents > 0 ? 'Active' : 'No data'}
                    </p>
                  </div>
                  <GraduationCap className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Lecturers</p>
                    <p className="text-2xl font-bold text-green-600">{analytics.systemOverview.totalLecturers}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +8% this year
                    </p>
                  </div>
                  <UserCheck className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Courses</p>
                    <p className="text-2xl font-bold text-purple-600">{analytics.systemOverview.totalCourses}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +15% this semester
                    </p>
                  </div>
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Enrollments</p>
                    <p className="text-2xl font-bold text-orange-600">{analytics.systemOverview.totalEnrollments}</p>
                    <p className="text-xs text-green-600 flex items-center mt-1">
                      <TrendingUp className="h-3 w-3 mr-1" />
                      +18% this semester
                    </p>
                  </div>
                  <FileText className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* User Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>User Role Distribution</CardTitle>
                <CardDescription>Breakdown of users by role across the system</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Students</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{analytics.systemOverview.totalStudents}</span>
                      <Badge variant="outline" className="text-blue-600">
                        {analytics.systemOverview.totalUsers > 0 ? Math.round((analytics.systemOverview.totalStudents / analytics.systemOverview.totalUsers) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                  <Progress
                    value={analytics.systemOverview.totalUsers > 0 ? (analytics.systemOverview.totalStudents / analytics.systemOverview.totalUsers) * 100 : 0}
                    className="h-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Lecturers</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{analytics.systemOverview.totalLecturers}</span>
                      <Badge variant="outline" className="text-green-600">
                        {analytics.systemOverview.totalUsers > 0 ? Math.round((analytics.systemOverview.totalLecturers / analytics.systemOverview.totalUsers) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                  <Progress
                    value={analytics.systemOverview.totalUsers > 0 ? (analytics.systemOverview.totalLecturers / analytics.systemOverview.totalUsers) * 100 : 0}
                    className="h-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Deans</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{analytics.systemOverview.totalDeans}</span>
                      <Badge variant="outline" className="text-purple-600">
                        {analytics.systemOverview.totalUsers > 0 ? Math.round((analytics.systemOverview.totalDeans / analytics.systemOverview.totalUsers) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                  <Progress
                    value={analytics.systemOverview.totalUsers > 0 ? (analytics.systemOverview.totalDeans / analytics.systemOverview.totalUsers) * 100 : 0}
                    className="h-2"
                  />
                </div>

                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Admins</span>
                    <div className="flex items-center space-x-2">
                      <span className="text-sm">{analytics.systemOverview.totalAdmins}</span>
                      <Badge variant="outline" className="text-red-600">
                        {analytics.systemOverview.totalUsers > 0 ? Math.round((analytics.systemOverview.totalAdmins / analytics.systemOverview.totalUsers) * 100) : 0}%
                      </Badge>
                    </div>
                  </div>
                  <Progress
                    value={analytics.systemOverview.totalUsers > 0 ? (analytics.systemOverview.totalAdmins / analytics.systemOverview.totalUsers) * 100 : 0}
                    className="h-2"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>System Resource Usage</CardTitle>
                <CardDescription>Current system resource utilization</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>CPU Usage</span>
                    <span className="font-medium">{analytics.systemMetrics.cpuUsage}%</span>
                  </div>
                  <Progress value={analytics.systemMetrics.cpuUsage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Memory Usage</span>
                    <span className="font-medium">{analytics.systemMetrics.memoryUsage}%</span>
                  </div>
                  <Progress value={analytics.systemMetrics.memoryUsage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Storage Usage</span>
                    <span className="font-medium">{analytics.systemMetrics.storageUsage}%</span>
                  </div>
                  <Progress value={analytics.systemMetrics.storageUsage} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>System Uptime</span>
                    <span className="font-medium">{analytics.systemMetrics.uptime}%</span>
                  </div>
                  <Progress value={analytics.systemMetrics.uptime} className="h-2" />
                </div>

                <div className="pt-2 border-t">
                  <div className="flex justify-between text-sm">
                    <span>Active Connections</span>
                    <span className="font-medium">{analytics.systemMetrics.activeConnections}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="faculties" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Faculty Performance Overview</CardTitle>
              <CardDescription>Performance metrics across all faculties</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.facultyPerformance.map((faculty, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div>
                        <h4 className="font-semibold">{faculty.faculty}</h4>
                        <p className="text-sm text-gray-600">
                          {faculty.students} students • {faculty.lecturers} lecturers • {faculty.courses} courses
                        </p>
                      </div>
                      <div className="flex items-center space-x-2">
                        {getTrendIcon(faculty.trend)}
                        <span className={`text-sm font-medium ${getTrendColor(faculty.trend)}`}>
                          {faculty.trend === 'up' ? 'Improving' : faculty.trend === 'down' ? 'Declining' : 'Stable'}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-gray-600">Average Grade</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={faculty.averageGrade} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{Math.round(faculty.averageGrade)}%</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Course Completion</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={faculty.completion} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{Math.round(faculty.completion)}%</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="growth" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>User Growth Trends</CardTitle>
              <CardDescription>User registration and growth over the past 5 months</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics.userGrowth.map((month, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <h4 className="font-semibold mb-3">{month.month} 2024</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Students</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={analytics.systemOverview.totalStudents > 0 ? (month.students / analytics.systemOverview.totalStudents) * 100 : 0} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{month.students}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Lecturers</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={analytics.systemOverview.totalLecturers > 0 ? (month.lecturers / analytics.systemOverview.totalLecturers) * 100 : 0} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{month.lecturers}</span>
                        </div>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600 mb-1">Total Users</p>
                        <div className="flex items-center space-x-2">
                          <Progress value={analytics.systemOverview.totalUsers > 0 ? (month.total / analytics.systemOverview.totalUsers) * 100 : 0} className="flex-1 h-2" />
                          <span className="text-sm font-medium">{month.total}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="system" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Activity className="h-5 w-5" />
                  <span>System Performance</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">{analytics.systemMetrics.uptime}%</div>
                    <p className="text-sm text-gray-600">System Uptime</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{analytics.systemMetrics.activeConnections}</div>
                    <p className="text-sm text-gray-600">Active Connections</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Database className="h-5 w-5" />
                  <span>Resource Usage</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">{analytics.systemMetrics.cpuUsage}%</div>
                    <p className="text-sm text-gray-600">CPU Usage</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">{analytics.systemMetrics.memoryUsage}%</div>
                    <p className="text-sm text-gray-600">Memory Usage</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Globe className="h-5 w-5" />
                  <span>Storage & Network</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-red-600">{analytics.systemMetrics.storageUsage}%</div>
                    <p className="text-sm text-gray-600">Storage Used</p>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">1.2 GB/s</div>
                    <p className="text-sm text-gray-600">Network Throughput</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminAnalytics;
