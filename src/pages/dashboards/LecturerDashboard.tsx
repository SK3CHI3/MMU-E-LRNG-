import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BookOpen, Users, FileText, BarChart3, Clock, AlertCircle, GraduationCap, TrendingUp, Activity, PieChart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import AnnouncementBanner from "@/components/announcements/AnnouncementBanner";
import { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, BarChart, Bar, PieChart as RechartsPieChart, Cell, AreaChart, Area, Pie } from 'recharts';

const LecturerDashboard = () => {
  const { dbUser } = useAuth();
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch lecturer analytics data
  useEffect(() => {
    const fetchLecturerAnalytics = async () => {
      if (!dbUser?.id) return;

      try {
        setLoading(true);

        // Get lecturer's courses
        console.log('LecturerDashboard: Fetching courses for lecturer:', dbUser.auth_id);
        const { data: courses } = await supabase
          .from('courses')
          .select('*')
          .eq('created_by', dbUser.auth_id);

        // Get enrollments for lecturer's courses
        const courseIds = courses?.map(c => c.id) || [];
        console.log('LecturerDashboard: Found courses:', courses?.length || 0, 'Course IDs:', courseIds);

        const { data: enrollments } = await supabase
          .from('course_enrollments')
          .select(`
            *,
            users!course_enrollments_user_id_users_auth_id_fkey(*),
            courses!inner(*)
          `)
          .in('course_id', courseIds);

        console.log('LecturerDashboard: Found enrollments:', enrollments?.length || 0);

        // Get grades for performance analysis
        const { data: grades } = await supabase
          .from('course_enrollments')
          .select('grade, status, course_id, created_at')
          .in('course_id', courseIds)
          .not('grade', 'is', null);

        // Calculate analytics
        const totalStudents = enrollments?.length || 0;
        const totalCourses = courses?.length || 0;

        console.log('LecturerDashboard: Calculated analytics:', {
          totalStudents,
          totalCourses,
          gradesCount: grades?.length || 0
        });
        const averageGrade = grades?.length ?
          grades.reduce((sum, g) => sum + parseFloat(g.grade || '0'), 0) / grades.length : 0;

        // Generate course performance data
        const coursePerformance = courses?.map(course => {
          const courseEnrollments = enrollments?.filter(e => e.course_id === course.id) || [];
          const courseGrades = grades?.filter(g => g.course_id === course.id) || [];
          const avgGrade = courseGrades.length ?
            courseGrades.reduce((sum, g) => sum + parseFloat(g.grade || '0'), 0) / courseGrades.length : 0;

          return {
            name: course.code,
            students: courseEnrollments.length,
            averageGrade: Math.round(avgGrade),
            completionRate: courseGrades.length > 0 ?
              Math.round((courseGrades.filter(g => g.status === 'completed').length / courseEnrollments.length) * 100) : 0
          };
        }) || [];

        // Generate student performance distribution
        const gradeRanges = {
          excellent: grades?.filter(g => parseFloat(g.grade || '0') >= 90).length || 0,
          good: grades?.filter(g => parseFloat(g.grade || '0') >= 80 && parseFloat(g.grade || '0') < 90).length || 0,
          average: grades?.filter(g => parseFloat(g.grade || '0') >= 70 && parseFloat(g.grade || '0') < 80).length || 0,
          poor: grades?.filter(g => parseFloat(g.grade || '0') < 70).length || 0
        };

        // Generate enrollment trends (last 6 months)
        const enrollmentTrends = generateEnrollmentTrends(enrollments || []);

        setAnalytics({
          totalStudents,
          totalCourses,
          averageGrade: Math.round(averageGrade),
          coursePerformance,
          gradeDistribution: [
            { name: 'Excellent (90%+)', value: gradeRanges.excellent, color: '#10B981' },
            { name: 'Good (80-89%)', value: gradeRanges.good, color: '#3B82F6' },
            { name: 'Average (70-79%)', value: gradeRanges.average, color: '#F59E0B' },
            { name: 'Poor (<70%)', value: gradeRanges.poor, color: '#EF4444' }
          ],
          enrollmentTrends
        });

      } catch (error) {
        console.error('Error fetching lecturer analytics:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchLecturerAnalytics();
  }, [dbUser?.id]);

  const generateEnrollmentTrends = (enrollments: any[]) => {
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
        enrollments: enrollmentsInMonth
      };
    });
  };

  // Fetch lecturer-specific data
  const [lecturerData, setLecturerData] = useState({
    assignedCourses: [],
    pendingGrading: [],
    upcomingClasses: []
  });

  useEffect(() => {
    const fetchLecturerData = async () => {
      if (!dbUser?.auth_id) return;

      try {
        // Import services dynamically to avoid circular dependencies
        const { getLecturerCourses } = await import('@/services/courseService');
        const { getLecturerAssignments } = await import('@/services/assignmentService');

        // Fetch courses and assignments
        const [coursesData, assignmentsData] = await Promise.all([
          getLecturerCourses(dbUser.auth_id),
          getLecturerAssignments(dbUser.auth_id)
        ]);

        // Transform courses data
        const assignedCourses = coursesData.map(course => ({
          id: course.id,
          code: course.code,
          name: course.title,
          students: course.total_students || 0,
          semester: course.semester,
          nextClass: "View Schedule" // This would come from class sessions
        }));

        // Transform assignments data for pending grading
        const pendingGrading = assignmentsData
          .filter(assignment => assignment.total_submissions > assignment.graded_submissions)
          .map(assignment => ({
            id: assignment.id,
            course: assignment.course?.code || 'Unknown',
            assignment: assignment.title,
            submissions: assignment.total_submissions,
            totalStudents: assignment.total_enrolled || 0,
            dueDate: new Date(assignment.due_date).toLocaleDateString()
          }));

        // Mock upcoming classes - this would come from class sessions service
        const upcomingClasses = assignedCourses.slice(0, 2).map((course, index) => ({
          id: course.id,
          course: `${course.code} - ${course.name}`,
          time: index === 0 ? "Today, 2:00 PM" : "Tomorrow, 10:30 AM",
          room: index === 0 ? "Room 305" : "Online - Zoom",
          students: course.students
        }));

        setLecturerData({
          assignedCourses,
          pendingGrading,
          upcomingClasses
        });
      } catch (error) {
        console.error('Error fetching lecturer data:', error);
      }
    };

    fetchLecturerData();
  }, [dbUser?.auth_id]);

  const lecturerInfo = {
    name: dbUser?.full_name || "Dr. Lecturer",
    employeeId: dbUser?.id || "EMP-2024-001",
    department: dbUser?.department || dbUser?.faculty || "Faculty of Computing and Information Technology",
    ...lecturerData
  };

  const totalStudents = analytics?.totalStudents || lecturerInfo.assignedCourses.reduce((sum, course) => sum + course.students, 0);
  const totalCourses = analytics?.totalCourses || lecturerInfo.assignedCourses.length;
  const pendingGradingCount = lecturerInfo.pendingGrading.length;
  const averageGrade = analytics?.averageGrade || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Lecturer Dashboard</h1>
          <p className="text-muted-foreground">
            {lecturerInfo.name} • {lecturerInfo.department}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-green-100 dark:bg-green-900/30 rounded-full">
          <GraduationCap className="h-4 w-4 text-green-600 dark:text-green-400" />
          <span className="text-sm font-medium text-green-600 dark:text-green-400">Lecturer</span>
        </div>
      </div>

      {/* Announcements Banner */}
      <AnnouncementBanner maxAnnouncements={2} compact={false} />

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Assigned Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCourses}</div>
            <p className="text-xs text-muted-foreground">
              This semester
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Grading</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingGradingCount}</div>
            <p className="text-xs text-muted-foreground">
              Assignments to grade
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{averageGrade}%</div>
            <p className="text-xs text-muted-foreground">
              Across all courses
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Course Overview */}
      <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle>My Courses</CardTitle>
          <CardDescription>Courses you're teaching this semester</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lecturerInfo.assignedCourses.map(course => (
              <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-semibold">{course.code} - {course.name}</h4>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Users className="h-3 w-3" />
                      {course.students} students
                    </span>

                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      Next: {course.nextClass}
                    </span>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Manage Course
                </Button>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Analytics Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="students">Students</TabsTrigger>
          <TabsTrigger value="courses">Courses</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            {/* Enrollment Trends */}
            <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Enrollment Trends
                </CardTitle>
                <CardDescription>Student enrollments over the last 6 months</CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="h-64 flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height={250}>
                    <LineChart data={analytics?.enrollmentTrends || []}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Line type="monotone" dataKey="enrollments" stroke="#3B82F6" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            {/* Grade Distribution */}
            <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <PieChart className="h-5 w-5" />
                  Grade Distribution
                </CardTitle>
                <CardDescription>Student performance across all courses</CardDescription>
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
                        data={analytics?.gradeDistribution || []}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {analytics?.gradeDistribution?.map((entry: any, index: number) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </RechartsPieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          {/* Course Performance */}
          <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Course Performance
              </CardTitle>
              <CardDescription>Performance metrics for each course</CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="h-64 flex items-center justify-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics?.coursePerformance || []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="students" fill="#3B82F6" name="Students" />
                    <Bar dataKey="averageGrade" fill="#10B981" name="Avg Grade" />
                    <Bar dataKey="completionRate" fill="#F59E0B" name="Completion %" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="students" className="space-y-6">
          <div className="grid gap-8 md:grid-cols-2 md:divide-x md:divide-gray-100 dark:md:divide-gray-800">
            <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300 md:pr-6">
              <CardHeader>
                <CardTitle>Upcoming Classes</CardTitle>
                <CardDescription>Your scheduled classes for the next 24 hours</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {lecturerInfo.upcomingClasses.map(classInfo => (
                  <div key={classInfo.id} className="flex items-start space-x-4 rounded-md border p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                      <Clock className="h-5 w-5 text-primary" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="text-sm font-semibold">{classInfo.course}</h4>
                      <div className="flex items-center text-xs text-muted-foreground">
                        <Clock className="h-3.5 w-3.5 mr-1" />
                        <span>{classInfo.time}</span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>{classInfo.room}</span>
                        <span className="text-muted-foreground">{classInfo.students} students</span>
                      </div>
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Classes
                </Button>
              </CardContent>
            </Card>

            <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300 md:pl-6">
              <CardHeader>
                <CardTitle>Pending Grading</CardTitle>
                <CardDescription>Assignments waiting for your review</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {lecturerInfo.pendingGrading.map(item => (
                  <div key={item.id} className="flex items-start space-x-4 rounded-md border p-4">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-orange-100 dark:bg-orange-900/30">
                      <AlertCircle className="h-5 w-5 text-orange-600 dark:text-orange-400" />
                    </div>
                    <div className="space-y-1 flex-1">
                      <h4 className="text-sm font-semibold">{item.assignment}</h4>
                      <p className="text-xs text-muted-foreground">{item.course}</p>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          {item.submissions}/{item.totalStudents} submitted
                        </div>
                        <div className="text-xs text-orange-600 dark:text-orange-400">
                          Due {item.dueDate}
                        </div>
                      </div>
                      <Progress
                        value={(item.submissions / item.totalStudents) * 100}
                        className="h-2 mt-2"
                      />
                    </div>
                  </div>
                ))}
                <Button variant="outline" className="w-full">
                  View All Assignments
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="courses" className="space-y-6">
          {/* Course Overview */}
          <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle>My Courses</CardTitle>
              <CardDescription>Courses you're teaching this semester</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {lecturerInfo.assignedCourses.map(course => (
                  <div key={course.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="space-y-1">
                      <h4 className="font-semibold">{course.code} - {course.name}</h4>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          {course.students} students
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {course.schedule}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="outline" size="sm">
                        View Details
                      </Button>
                      <Button size="sm">
                        Manage
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default LecturerDashboard;
