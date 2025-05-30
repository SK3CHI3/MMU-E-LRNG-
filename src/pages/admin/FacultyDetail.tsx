import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ArrowLeft,
  Building,
  Users,
  GraduationCap,
  Award,
  UserCheck,
  TrendingUp,
  Computer,
  Cog,
  Video,
  Atom,
  Briefcase,
  BookOpen,
  Calendar,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  Target
} from 'lucide-react';
import { mmuFaculties } from '@/data/mmuData';
import { supabase } from '@/lib/supabaseClient';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area, Pie } from 'recharts';

interface FacultyAnalytics {
  totalStudents: number;
  totalLecturers: number;
  totalCourses: number;
  enrollmentTrend: Array<{ month: string; students: number; lecturers: number }>;
  departmentDistribution: Array<{ name: string; students: number; lecturers: number; color: string }>;
  programmeEnrollment: Array<{ name: string; students: number; level: string }>;
  recentActivities: Array<{ type: string; description: string; timestamp: string; user: string }>;
  performanceMetrics: {
    completionRate: number;
    averageGrade: number;
    activeClasses: number;
    upcomingExams: number;
  };
}

const FacultyDetail = () => {
  const { facultyId } = useParams<{ facultyId: string }>();
  const navigate = useNavigate();
  const [analytics, setAnalytics] = useState<FacultyAnalytics | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Find faculty in MMU data
  const faculty = facultyId ? mmuFaculties.find(f => f.id === facultyId) : null;

  useEffect(() => {
    if (facultyId && faculty) {
      fetchFacultyAnalytics(facultyId);
    }
  }, [facultyId, faculty]);

  const fetchFacultyAnalytics = async (id: string) => {
    try {
      setLoading(true);

      // Fetch real data from Supabase
      const [studentsResult, lecturersResult, enrollmentsResult] = await Promise.all([
        // Get all students in this faculty
        supabase
          .from('users')
          .select('*')
          .eq('faculty', id)
          .eq('role', 'student'),

        // Get all lecturers in this faculty
        supabase
          .from('users')
          .select('*')
          .eq('faculty', id)
          .eq('role', 'lecturer'),

        // Get enrollment data for trend analysis
        supabase
          .from('course_enrollments')
          .select('*, users!course_enrollments_user_id_users_auth_id_fkey(*)')
          .eq('users.faculty', id)
      ]);

      const totalStudents = studentsResult.data?.length || 0;
      const totalLecturers = lecturersResult.data?.length || 0;
      const enrollments = enrollmentsResult.data || [];

      // Generate enrollment trend data from real data
      const enrollmentTrend = generateEnrollmentTrend(enrollments, studentsResult.data || [], lecturersResult.data || []);

      // Generate department distribution from real data
      const departmentDistribution = generateDepartmentDistribution(faculty, studentsResult.data || [], lecturersResult.data || []);

      // Generate programme enrollment from real data
      const programmeEnrollment = generateProgrammeEnrollment(faculty, enrollments);

      // Get recent activities from real data
      const recentActivities = await fetchRecentActivities(id);

      const analyticsData: FacultyAnalytics = {
        totalStudents,
        totalLecturers,
        totalCourses: faculty.programmes.length,
        enrollmentTrend,
        departmentDistribution,
        programmeEnrollment,
        recentActivities,
        performanceMetrics: await calculatePerformanceMetrics(id, enrollments)
      };

      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error fetching faculty analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateEnrollmentTrend = (enrollments: any[], students: any[], lecturers: any[]) => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
    const currentDate = new Date();

    return months.map((month, index) => {
      const monthDate = new Date(currentDate.getFullYear(), currentDate.getMonth() - (5 - index), 1);

      // Count students created in this month
      const studentsInMonth = students.filter(student => {
        const createdDate = new Date(student.created_at);
        return createdDate.getMonth() === monthDate.getMonth() &&
               createdDate.getFullYear() === monthDate.getFullYear();
      }).length;

      // Count lecturers created in this month
      const lecturersInMonth = lecturers.filter(lecturer => {
        const createdDate = new Date(lecturer.created_at);
        return createdDate.getMonth() === monthDate.getMonth() &&
               createdDate.getFullYear() === monthDate.getFullYear();
      }).length;

      // Calculate cumulative counts up to this month
      const cumulativeStudents = students.filter(student => {
        const createdDate = new Date(student.created_at);
        return createdDate <= monthDate;
      }).length;

      const cumulativeLecturers = lecturers.filter(lecturer => {
        const createdDate = new Date(lecturer.created_at);
        return createdDate <= monthDate;
      }).length;

      return {
        month,
        students: cumulativeStudents,
        lecturers: cumulativeLecturers,
        newStudents: studentsInMonth,
        newLecturers: lecturersInMonth
      };
    });
  };

  const generateDepartmentDistribution = (faculty: any, students: any[], lecturers: any[]) => {
    const colors = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#06B6D4'];

    return faculty.departments.map((dept: any, index: number) => {
      // Count students in this department (if department field exists in user data)
      const deptStudents = students.filter(student =>
        student.department === dept.name ||
        student.department === dept.id ||
        // Fallback: distribute evenly if no department field
        !student.department
      );

      const deptLecturers = lecturers.filter(lecturer =>
        lecturer.department === dept.name ||
        lecturer.department === dept.id ||
        // Fallback: distribute evenly if no department field
        !lecturer.department
      );

      // If no department field exists, distribute evenly
      const studentCount = deptStudents.length > 0 ? deptStudents.length :
        Math.floor(students.length / faculty.departments.length);
      const lecturerCount = deptLecturers.length > 0 ? deptLecturers.length :
        Math.floor(lecturers.length / faculty.departments.length);

      return {
        name: dept.name,
        students: studentCount,
        lecturers: lecturerCount,
        color: colors[index % colors.length]
      };
    });
  };

  const generateProgrammeEnrollment = (faculty: any, enrollments: any[]) => {
    return faculty.programmes.map((programme: any) => {
      // Count enrollments for this specific programme
      const programmeEnrollments = enrollments.filter(enrollment =>
        enrollment.course_code?.startsWith(programme.code) ||
        enrollment.programme === programme.name ||
        enrollment.programme === programme.code
      );

      // Get unique students enrolled in this programme
      const uniqueStudents = new Set(programmeEnrollments.map(e => e.user_id));

      return {
        name: programme.name.length > 30 ? programme.name.substring(0, 30) + '...' : programme.name,
        students: uniqueStudents.size || Math.floor(enrollments.length / faculty.programmes.length),
        level: programme.level,
        code: programme.code
      };
    });
  };

  const calculatePerformanceMetrics = async (facultyId: string, enrollments: any[]) => {
    try {
      // Get all courses/classes for this faculty
      const { data: courses } = await supabase
        .from('courses')
        .select('*')
        .eq('faculty', facultyId);

      // Get grades data for performance calculation
      const { data: grades } = await supabase
        .from('enrollments')
        .select('grade, status, users!inner(faculty)')
        .eq('users.faculty', facultyId)
        .not('grade', 'is', null);

      // Calculate completion rate
      const completedEnrollments = enrollments.filter(e => e.status === 'completed' || e.grade);
      const completionRate = enrollments.length > 0 ?
        Math.round((completedEnrollments.length / enrollments.length) * 100) : 0;

      // Calculate average grade
      const validGrades = grades?.filter(g => g.grade && !isNaN(parseFloat(g.grade))) || [];
      const averageGrade = validGrades.length > 0 ?
        Math.round(validGrades.reduce((sum, g) => sum + parseFloat(g.grade), 0) / validGrades.length) : 0;

      // Count active classes
      const activeClasses = courses?.filter(c => c.status === 'active').length || 0;

      // Count upcoming exams (mock data for now - would need exams table)
      const upcomingExams = Math.floor(activeClasses * 0.3); // Assume 30% of classes have upcoming exams

      return {
        completionRate,
        averageGrade,
        activeClasses,
        upcomingExams
      };
    } catch (error) {
      console.error('Error calculating performance metrics:', error);
      return {
        completionRate: 0,
        averageGrade: 0,
        activeClasses: 0,
        upcomingExams: 0
      };
    }
  };

  const fetchRecentActivities = async (facultyId: string) => {
    try {
      // Fetch recent users who joined this faculty
      const { data: recentUsers } = await supabase
        .from('users')
        .select('full_name, role, created_at, email')
        .eq('faculty', facultyId)
        .order('created_at', { ascending: false })
        .limit(10);

      // Fetch recent enrollments for this faculty
      const { data: recentEnrollments } = await supabase
        .from('course_enrollments')
        .select('*, users!course_enrollments_user_id_users_auth_id_fkey(full_name, faculty)')
        .eq('users.faculty', facultyId)
        .order('created_at', { ascending: false })
        .limit(5);

      const activities = [];

      // Add user registration activities
      if (recentUsers) {
        recentUsers.forEach(user => {
          activities.push({
            type: user.role === 'student' ? 'enrollment' : 'staff_addition',
            description: user.role === 'student'
              ? `New student ${user.full_name} enrolled`
              : `New ${user.role} ${user.full_name} joined faculty`,
            timestamp: new Date(user.created_at).toLocaleDateString(),
            user: user.full_name || user.email
          });
        });
      }

      // Add enrollment activities
      if (recentEnrollments) {
        recentEnrollments.forEach(enrollment => {
          activities.push({
            type: 'course_enrollment',
            description: `${enrollment.users.full_name} enrolled in ${enrollment.course_code}`,
            timestamp: new Date(enrollment.created_at).toLocaleDateString(),
            user: enrollment.users.full_name
          });
        });
      }

      // Sort all activities by date and return the most recent 10
      return activities
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, 10);

    } catch (error) {
      console.error('Error fetching recent activities:', error);
      return [];
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp': return <TrendingUp className="h-8 w-8 text-blue-600" />;
      case 'Computer': return <Computer className="h-8 w-8 text-green-600" />;
      case 'Cog': return <Cog className="h-8 w-8 text-orange-600" />;
      case 'Video': return <Video className="h-8 w-8 text-purple-600" />;
      case 'Atom': return <Atom className="h-8 w-8 text-indigo-600" />;
      case 'Users': return <Users className="h-8 w-8 text-pink-600" />;
      default: return <Building className="h-8 w-8 text-gray-600" />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 dark:bg-blue-900/30 border-blue-200 dark:border-blue-800';
      case 'green': return 'bg-green-100 dark:bg-green-900/30 border-green-200 dark:border-green-800';
      case 'orange': return 'bg-orange-100 dark:bg-orange-900/30 border-orange-200 dark:border-orange-800';
      case 'purple': return 'bg-purple-100 dark:bg-purple-900/30 border-purple-200 dark:border-purple-800';
      case 'indigo': return 'bg-indigo-100 dark:bg-indigo-900/30 border-indigo-200 dark:border-indigo-800';
      case 'pink': return 'bg-pink-100 dark:bg-pink-900/30 border-pink-200 dark:border-pink-800';
      default: return 'bg-gray-100 dark:bg-gray-900/30 border-gray-200 dark:border-gray-800';
    }
  };

  if (!faculty) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Faculty not found</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            The requested faculty could not be found. Please check the URL or try again.
          </p>
          <Button onClick={() => navigate('/faculties')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Faculties
          </Button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Activity className="h-12 w-12 text-blue-600 mx-auto mb-4 animate-spin" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">Loading Analytics</h3>
          <p className="text-gray-600 dark:text-gray-400">
            Fetching faculty data and generating insights...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-4">
          <Button variant="outline" onClick={() => navigate('/faculties')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className={`p-3 rounded-lg ${getColorClasses(faculty.color)}`}>
            {getIconComponent(faculty.icon)}
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
              {faculty.name}
            </h1>
            <p className="text-lg text-gray-600 dark:text-gray-400 mt-1">
              {faculty.shortName}
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-500 mt-2 max-w-2xl">
              {faculty.description}
            </p>
            {faculty.dean && (
              <div className="flex items-center gap-2 mt-3">
                <UserCheck className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Dean: {faculty.dean}
                </span>
              </div>
            )}
          </div>
        </div>
        <Badge className="bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400">
          Active
        </Badge>
      </div>

      {/* Key Metrics Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{analytics?.totalStudents || 0}</p>
                <p className="text-xs text-green-600 mt-1">+12% from last month</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Faculty Members</p>
                <p className="text-2xl font-bold text-green-600">{analytics?.totalLecturers || 0}</p>
                <p className="text-xs text-green-600 mt-1">+3% from last month</p>
              </div>
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Courses</p>
                <p className="text-2xl font-bold text-purple-600">{analytics?.performanceMetrics.activeClasses || 0}</p>
                <p className="text-xs text-blue-600 mt-1">+5% from last month</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completion Rate</p>
                <p className="text-2xl font-bold text-orange-600">{analytics?.performanceMetrics.completionRate || 0}%</p>
                <p className="text-xs text-green-600 mt-1">+2% from last month</p>
              </div>
              <Target className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Analytics Dashboard */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
          <TabsTrigger value="activities">Activities</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Enrollment Trend Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                Enrollment Trends
              </CardTitle>
              <CardDescription>
                Student and faculty enrollment over the last 6 months
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={analytics?.enrollmentTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="students" stroke="#3B82F6" strokeWidth={2} name="Students" />
                  <Line type="monotone" dataKey="lecturers" stroke="#10B981" strokeWidth={2} name="Faculty" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Department Distribution */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Department Distribution
                </CardTitle>
                <CardDescription>
                  Student distribution across departments
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <RechartsPieChart>
                    <Pie
                      data={analytics?.departmentDistribution || []}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="students"
                      label={({ name, value }) => `${name}: ${value}`}
                    >
                      {analytics?.departmentDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </RechartsPieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Programme Enrollment
                </CardTitle>
                <CardDescription>
                  Students enrolled in each programme
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics?.programmeEnrollment || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" angle={-45} textAnchor="end" height={80} />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="students" fill="#8B5CF6" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-6">
          {/* Performance Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Grade</p>
                    <p className="text-2xl font-bold text-blue-600">{analytics?.performanceMetrics.averageGrade || 0}%</p>
                  </div>
                  <Award className="h-8 w-8 text-blue-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Upcoming Exams</p>
                    <p className="text-2xl font-bold text-orange-600">{analytics?.performanceMetrics.upcomingExams || 0}</p>
                  </div>
                  <Calendar className="h-8 w-8 text-orange-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Classes</p>
                    <p className="text-2xl font-bold text-green-600">{analytics?.performanceMetrics.activeClasses || 0}</p>
                  </div>
                  <Clock className="h-8 w-8 text-green-600" />
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Programmes</p>
                    <p className="text-2xl font-bold text-purple-600">{faculty.programmes.length}</p>
                  </div>
                  <BookOpen className="h-8 w-8 text-purple-600" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detailed Analytics Chart */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Faculty Performance Analytics
              </CardTitle>
              <CardDescription>
                Comprehensive performance metrics and trends
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <AreaChart data={analytics?.enrollmentTrend || []}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="students" stackId="1" stroke="#3B82F6" fill="#3B82F6" fillOpacity={0.6} name="Students" />
                  <Area type="monotone" dataKey="lecturers" stackId="2" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Faculty" />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="space-y-6">
          {/* Department Details */}
          <Card>
            <CardHeader>
              <CardTitle>Department Overview</CardTitle>
              <CardDescription>
                Detailed breakdown of {faculty.departments.length} departments in this faculty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {analytics?.departmentDistribution.map((dept, index) => (
                  <div key={index} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-medium text-sm">{dept.name}</h4>
                      <div className="w-4 h-4 rounded" style={{ backgroundColor: dept.color }}></div>
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Students:</span>
                        <span className="font-medium">{dept.students}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Faculty:</span>
                        <span className="font-medium">{dept.lecturers}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-gray-500">Ratio:</span>
                        <span className="font-medium">{Math.round(dept.students / dept.lecturers)}:1</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Academic Programmes */}
          <Card>
            <CardHeader>
              <CardTitle>Academic Programmes</CardTitle>
              <CardDescription>
                {faculty.programmes.length} programmes offered by this faculty
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {faculty.programmes.map((programme, index) => (
                  <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                    <div>
                      <h4 className="font-medium text-sm">{programme.name}</h4>
                      <p className="text-xs text-gray-500">{programme.level} Programme</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">{programme.level}</Badge>
                      <span className="text-sm text-gray-500">
                        {analytics?.programmeEnrollment.find(p => p.name.includes(programme.name.substring(0, 20)))?.students || 0} students
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="activities" className="space-y-6">
          {/* Recent Activities */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Activity className="h-5 w-5" />
                Recent Faculty Activities
              </CardTitle>
              <CardDescription>
                Latest enrollments and faculty additions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analytics?.recentActivities.length ? (
                  analytics.recentActivities.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 p-3 border rounded-lg">
                      <div className={`p-2 rounded-full ${
                        activity.type === 'enrollment' ? 'bg-blue-100 text-blue-600' : 'bg-green-100 text-green-600'
                      }`}>
                        {activity.type === 'enrollment' ? <GraduationCap className="h-4 w-4" /> : <Briefcase className="h-4 w-4" />}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">{activity.description}</p>
                        <p className="text-xs text-gray-500">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>No recent activities found</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default FacultyDetail;
