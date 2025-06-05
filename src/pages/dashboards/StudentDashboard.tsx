import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Clock, BookOpen, GraduationCap, BarChart3, PieChart } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { getStudentData, StudentData } from "@/services/userDataService";
import { studentActivityService, StudyMetrics } from "@/services/studentActivityService";
import AnnouncementBanner from "@/components/announcements/AnnouncementBanner";
import { MobileDataCards } from "@/components/dashboard/MobileDataCards";
import { MobileChartWidgets } from "@/components/dashboard/MobileChartWidgets";

const StudentDashboard = () => {
  const { user, dbUser } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [studyMetrics, setStudyMetrics] = useState<StudyMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);


  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user?.id) {
        console.log('StudentDashboard: No user ID available');
        setLoading(false);
        return;
      }

      console.log('StudentDashboard: Starting to fetch data for user:', user.id);
      setLoading(true);

      try {
        // Track login activity
        await studentActivityService.trackLogin(user.id);

        // Fetch dynamic student data and activity metrics in parallel
        const [data, metrics] = await Promise.all([
          getStudentData(user.id),
          studentActivityService.getStudyMetrics(user.id)
        ]);

        if (import.meta.env.DEV) {
          console.log('StudentDashboard: Successfully fetched student data');
          console.log('StudentDashboard: Successfully fetched study metrics');
        }

        // Merge activity metrics with student data
        const enhancedStudentData = {
          ...data,
          ...metrics,
          studyActivity: Math.min(100, (metrics.weeklyStudyHours / 40) * 100), // Convert to percentage
        };

        setStudentData(enhancedStudentData);
        setStudyMetrics(metrics);
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('StudentDashboard: Error fetching student data:', error);
        setError('Failed to load student data. Using basic profile information.');

        // Use dbUser information as fallback
        const fallbackData = {
          name: dbUser?.full_name || user?.email?.split('@')[0] || 'Student',
          admissionNumber: dbUser?.student_id || 'Not Set',
          semester: 'Current Semester',
          academicYear: '2024/2025',
          gpa: 0,
          enrolledCourses: 0,
          faculty: dbUser?.department || 'Not Assigned',
          feeBalance: 0,
          feePaid: 0,
          feeRequired: 0,
          currentSemesterUnits: 0,
          totalUnitsRegistered: 0,
          unitsCompleted: 0,
          unitsPassed: 0,
          unitsFailed: 0,
          programmeTitle: 'Not Set',
          yearOfStudy: 1,
          upcomingClasses: [],
          pendingAssignments: [],
          // Add default activity metrics
          weeklyStudyHours: 0,
          weeklyStudyData: Array(7).fill(0),
          studyActivityTrend: 0,
          attendanceRate: 0,
          attendanceTrend: 0,
          classesAttended: 0,
          totalClasses: 0,
          completedAssignments: 0,
          overdueAssignments: 0,
          studyActivity: 0
        };

        setStudentData(fallbackData);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user?.id, dbUser]);

  // Helper function to display values with proper N/A handling
  const displayValue = (value: any, type: 'text' | 'number' | 'currency' = 'text') => {
    if (loading) return "Loading...";
    if (value === null || value === undefined || value === '') return "N/A";
    if (type === 'number' && value === 0) return "N/A";
    if (type === 'currency') return value === 0 ? "N/A" : `KSh ${value.toLocaleString()}`;
    return value;
  };

  // Use dynamic data only - no fallbacks
  const studentInfo = studentData;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading Dashboard</h2>
          <p className="text-muted-foreground">Please wait while we load your student data...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2 text-destructive">Dashboard Error</h2>
          <p className="text-muted-foreground mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }

  try {
    return (
      <div className="space-y-4 md:space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="min-w-0 flex-1">
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary truncate">
              Student Dashboard
            </h1>
            <p className="text-sm md:text-base text-muted-foreground truncate">
              Welcome back, {displayValue(studentInfo?.name)} • {displayValue(studentInfo?.admissionNumber)}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full shrink-0">
            <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Student</span>
          </div>
        </div>

        {/* Announcements Banner */}
        <AnnouncementBanner maxAnnouncements={2} compact={false} />

        {/* Mobile-First Data Visualization */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Overview</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Charts</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Enhanced Mobile Data Cards */}
            <MobileDataCards studentData={studentData} loading={loading} />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Mobile Chart Widgets - Prioritizing dynamic charts with real activity data */}
            <MobileChartWidgets studentData={studentData} loading={loading} />
          </TabsContent>
        </Tabs>

      {/* Legacy Stats Cards - Hidden on mobile, shown on larger screens */}
      <div className="hidden lg:grid gap-3 sm:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        <Card className="mobile-card bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Semester</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{displayValue(studentInfo?.semester)}</div>
            <p className="text-xs text-muted-foreground">
              Academic Year {displayValue(studentInfo?.academicYear)}
            </p>
          </CardContent>
        </Card>

        <Card className="mobile-card bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{displayValue(studentInfo?.gpa, 'number')}</div>
            <p className="text-xs text-muted-foreground">
              {studentInfo?.gpa ? (
                studentInfo.gpa >= 3.5 ? "Excellent" : studentInfo.gpa >= 3.0 ? "Good" : "Average"
              ) : "No grades yet"}
            </p>
          </CardContent>
        </Card>

        <Card className="mobile-card sm:col-span-2 lg:col-span-1 bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Units</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl md:text-2xl font-bold">{displayValue(studentInfo?.enrolledCourses, 'number')}</div>
            <p className="text-xs text-muted-foreground">
              This semester
            </p>
          </CardContent>
        </Card>
      </div>




    </div>
    );
  } catch (renderError) {
    console.error('StudentDashboard: Render error:', renderError);
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2 text-destructive">Dashboard Render Error</h2>
          <p className="text-muted-foreground mb-4">There was an error displaying your dashboard.</p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-primary text-primary-foreground rounded hover:bg-primary/90"
          >
            Reload Page
          </button>
        </div>
      </div>
    );
  }
};

export default StudentDashboard;
