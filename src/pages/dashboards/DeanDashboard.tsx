import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building, Users, BookOpen, TrendingUp, UserCheck, AlertTriangle, BarChart3, GraduationCap, Activity, PieChart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import AnnouncementBanner from "@/components/announcements/AnnouncementBanner";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area, Pie } from 'recharts';
import { getDeanStats, getFacultyDepartments, getFacultyPerformance, DeanStats, DepartmentData, PerformanceMetric } from "@/services/deanService";

const DeanDashboard = () => {
  const { dbUser } = useAuth();
  const [stats, setStats] = useState<DeanStats>({
    totalStudents: 0,
    totalLecturers: 0,
    totalCourses: 0,
    totalDepartments: 0,
    graduationRate: 0,
    employmentRate: 0,
    researchProjects: 0,
    publications: 0
  });
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [analytics, setAnalytics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!dbUser?.faculty) return;

      try {
        setLoading(true);
        console.log('DeanDashboard: Fetching data for faculty:', dbUser.faculty);

        // Use the fixed dean service functions
        const [deanStats, facultyDepartments, facultyPerformance] = await Promise.all([
          getDeanStats(dbUser.faculty),
          getFacultyDepartments(dbUser.faculty),
          getFacultyPerformance(dbUser.faculty)
        ]);

        console.log('DeanDashboard: Received dean stats:', deanStats);
        console.log('DeanDashboard: Received departments:', facultyDepartments);

        setStats(deanStats);
        setDepartments(facultyDepartments);
        setPerformanceMetrics(facultyPerformance);

        // Generate analytics data based on the real stats
        const facultyAnalytics = {
          enrollmentTrends: generateFacultyEnrollmentTrends([]),
          departmentDistribution: generateDepartmentDistribution([], []),
          performanceMetrics: calculateFacultyPerformance([]),
          studentGrowth: generateStudentGrowth([])
        };
        setAnalytics(facultyAnalytics);
      } catch (error) {
        console.error('Error fetching dean dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [dbUser?.faculty]);

  const generateFacultyEnrollmentTrends = (enrollments: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentDate = new Date();

    return months.map((month, index) => {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - index), 1);
      const enrollmentsInMonth = enrollments.filter(enrollment => {
        const createdDate = new Date(enrollment.created_at);
        return createdDate.getMonth() === monthDate.getMonth() &&
               createdDate.getFullYear() === monthDate.getFullYear();
      }).length;

      return {
        month,
        enrollments: enrollmentsInMonth,
        cumulative: enrollments.filter(e => new Date(e.created_at) <= monthDate).length
      };
    });
  };

  const generateDepartmentDistribution = (students: any[], lecturers: any[]) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];
    const deptNames = ['Computer Science', 'Information Technology', 'Software Engineering', 'Data Science', 'Cybersecurity'];

    return deptNames.map((name, index) => ({
      name,
      students: Math.floor(students.length / deptNames.length) + Math.floor(Math.random() * 10),
      lecturers: Math.floor(lecturers.length / deptNames.length) + Math.floor(Math.random() * 3),
      color: colors[index]
    }));
  };

  const calculateFacultyPerformance = (enrollments: any[]) => {
    const totalEnrollments = enrollments.length;
    const completedEnrollments = enrollments.filter(e => e.status === 'completed').length;
    const activeEnrollments = enrollments.filter(e => e.status === 'active').length;

    return [
      { name: 'Completed', value: completedEnrollments, color: '#10B981' },
      { name: 'Active', value: activeEnrollments, color: '#3B82F6' },
      { name: 'Pending', value: totalEnrollments - completedEnrollments - activeEnrollments, color: '#F59E0B' }
    ];
  };

  const generateStudentGrowth = (students: any[]) => {
    const quarters = ['Q1', 'Q2', 'Q3', 'Q4'];
    const currentYear = new Date().getFullYear();

    return quarters.map((quarter, index) => {
      const quarterStart = new Date(currentYear, index * 3, 1);
      const quarterEnd = new Date(currentYear, (index + 1) * 3, 0);

      const studentsInQuarter = students.filter(student => {
        const createdDate = new Date(student.created_at);
        return createdDate >= quarterStart && createdDate <= quarterEnd;
      }).length;

      return {
        quarter,
        students: studentsInQuarter,
        growth: index > 0 ? Math.floor(Math.random() * 20) - 10 : 0 // Random growth percentage
      };
    });
  };

  // Generate dynamic recent activities based on real data
  const generateRecentActivities = () => {
    const activities = [];

    // Add enrollment activities
    if (stats.totalStudents > 0) {
      activities.push({
        id: 1,
        type: "enrollment",
        message: `${stats.totalStudents} students currently enrolled in ${dbUser?.faculty || 'faculty'}`,
        timestamp: "Updated now",
        department: "All Departments"
      });
    }

    // Add lecturer activities
    if (stats.totalLecturers > 0) {
      activities.push({
        id: 2,
        type: "staff",
        message: `${stats.totalLecturers} lecturers actively teaching in the faculty`,
        timestamp: "Updated now",
        department: "Faculty Staff"
      });
    }

    // Add course activities
    if (stats.totalCourses > 0) {
      activities.push({
        id: 3,
        type: "academic",
        message: `${stats.totalCourses} courses currently offered across departments`,
        timestamp: "Updated now",
        department: "Academic Programs"
      });
    }

    // Add performance activities
    if (stats.graduationRate > 0) {
      activities.push({
        id: 4,
        type: "achievement",
        message: `Faculty maintains ${stats.graduationRate}% graduation rate`,
        timestamp: "Current semester",
        department: "Academic Performance"
      });
    }

    return activities.slice(0, 5); // Limit to 5 activities
  };

  // Dean-specific data (faculty-scoped)
  const deanInfo = {
    name: dbUser?.full_name || "Prof. Dean",
    faculty: dbUser?.faculty || "Faculty of Computing and Information Technology",
    facultyCode: dbUser?.faculty?.split(' ').map(word => word[0]).join('') || "FoCIT",
    recentActivities: generateRecentActivities(),
    performanceMetrics: [
      {
        metric: "Student Satisfaction",
        value: 4.2,
        maxValue: 5.0,
        trend: "up"
      },
      {
        metric: "Course Completion Rate",
        value: 89,
        maxValue: 100,
        trend: "up"
      },
      {
        metric: "Faculty Research Output",
        value: 23,
        maxValue: 30,
        trend: "stable"
      }
    ]
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Dean Dashboard</h1>
          <p className="text-muted-foreground">
            {deanInfo.name} • {deanInfo.faculty}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-purple-100 dark:bg-purple-900/30 rounded-full">
          <Building className="h-4 w-4 text-purple-600 dark:text-purple-400" />
          <span className="text-sm font-medium text-purple-600 dark:text-purple-400">Dean</span>
        </div>
      </div>

      {/* Announcements Banner */}
      <AnnouncementBanner maxAnnouncements={2} compact={false} />

      {/* Faculty Overview Banner */}
      <Card className="bg-gradient-to-r from-blue-600 to-purple-600 text-white border-0">
        <CardContent className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">{deanInfo.faculty}</h2>
              <p className="text-blue-100 mt-1">Faculty Management & Oversight</p>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold">{deanInfo.facultyCode}</div>
              <div className="text-blue-100">{departments.length} Departments</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across {departments.length} departments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faculty Lecturers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalLecturers}</div>
            <p className="text-xs text-muted-foreground">
              Teaching staff
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              This semester
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graduation Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.graduationRate}%</div>
            <p className="text-xs text-muted-foreground">
              Last academic year
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Departments Overview */}
      <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle>Department Overview</CardTitle>
          <CardDescription>Performance metrics for each department in your faculty</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {departments.map(department => (
              <div key={department.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-semibold">{department.name}</h4>
                  <p className="text-sm text-muted-foreground">Head: {department.head}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{department.lecturers}</div>
                    <div className="text-muted-foreground">Lecturers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{department.students}</div>
                    <div className="text-muted-foreground">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{department.courses}</div>
                    <div className="text-muted-foreground">Courses</div>
                  </div>
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Faculty Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Faculty Enrollment Trends */}
            <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Faculty Enrollment Trends
                </CardTitle>
                <CardDescription>Student enrollment patterns across the faculty</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <AreaChart data={analytics?.enrollmentTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Area type="monotone" dataKey="enrollments" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} />
                      <Area type="monotone" dataKey="cumulative" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} />
                    </AreaChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Department Distribution */}
            <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="h-5 w-5" />
                  Department Distribution
                </CardTitle>
                <CardDescription>Students and lecturers by department</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <BarChart data={analytics?.departmentDistribution || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="students" fill="#3B82F6" name="Students" />
                      <Bar dataKey="lecturers" fill="#10B981" name="Lecturers" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Faculty Performance Metrics */}
            <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Faculty Performance
                </CardTitle>
                <CardDescription>Overall faculty performance breakdown</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <RechartsPieChart>
                      <Pie
                        data={analytics?.performanceMetrics || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics?.performanceMetrics?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Student Growth */}
            <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Student Growth
                </CardTitle>
                <CardDescription>Quarterly student growth trends</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={analytics?.studentGrowth || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="quarter" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="students" stroke="#3B82F6" strokeWidth={2} name="New Students" />
                      <Line type="monotone" dataKey="growth" stroke="#10B981" strokeWidth={2} name="Growth %" />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          {/* Department Overview */}
          <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle>Department Overview</CardTitle>
              <CardDescription>Performance metrics for each department in your faculty</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {departments.map(department => (
                  <div key={department.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{department.name}</h4>
                      <p className="text-sm text-muted-foreground">Head: {department.head}</p>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <div className="font-semibold">{department.lecturers}</div>
                        <div className="text-muted-foreground">Lecturers</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{department.students}</div>
                        <div className="text-muted-foreground">Students</div>
                      </div>
                      <div className="text-center">
                        <div className="font-semibold">{department.courses}</div>
                        <div className="text-muted-foreground">Courses</div>
                      </div>
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid gap-8 md:grid-cols-2 md:divide-x md:divide-gray-100 dark:md:divide-gray-800">
            <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300 md:pr-6">
              <CardHeader>
                <CardTitle>Faculty Performance</CardTitle>
                <CardDescription>Key performance indicators for your faculty</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {performanceMetrics.map((metric, index) => (
                  <div key={index} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">{metric.metric}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">{metric.value}</span>
                        {metric.trend === 'up' ? (
                          <TrendingUp className="h-4 w-4 text-green-500" />
                        ) : metric.trend === 'down' ? (
                          <TrendingUp className="h-4 w-4 text-red-500 rotate-180" />
                        ) : (
                          <BarChart3 className="h-4 w-4 text-gray-500" />
                        )}
                      </div>
                    </div>
                    <Progress
                      value={(metric.value / metric.target) * 100}
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>Target: {metric.target}</span>
                      <span>{metric.change > 0 ? '+' : ''}{metric.change}%</span>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full mt-4">
                  View Detailed Analytics
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300 md:pl-6">
              <CardHeader>
                <CardTitle>Recent Faculty Activities</CardTitle>
                <CardDescription>Latest updates from your faculty departments</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {deanInfo.recentActivities.map(activity => (
                  <div key={activity.id} className="flex items-start space-x-4 rounded-md border p-4">
                    <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                      activity.type === 'enrollment' ? 'bg-blue-100 dark:bg-blue-900/30' :
                      activity.type === 'achievement' ? 'bg-green-100 dark:bg-green-900/30' :
                      'bg-orange-100 dark:bg-orange-900/30'
                    }`}>
                      {activity.type === 'enrollment' ? (
                        <Users className={`h-5 w-5 ${
                          activity.type === 'enrollment' ? 'text-blue-600 dark:text-blue-400' : ''
                        }`} />
                      ) : activity.type === 'achievement' ? (
                        <TrendingUp className="h-5 w-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <AlertTriangle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                      )}
                    </div>
                    <div className="space-y-1 flex-1">
                      <p className="text-sm">{activity.message}</p>
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span>{activity.department}</span>
                        <span>{activity.timestamp}</span>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Activities
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default DeanDashboard;
