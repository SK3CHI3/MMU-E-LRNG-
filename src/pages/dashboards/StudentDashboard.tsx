import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Clock, FileText, ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { getStudentData, StudentData } from "@/services/userDataService";
import AnnouncementBanner from "@/components/announcements/AnnouncementBanner";

const StudentDashboard = () => {
  const { user, dbUser } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
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
        // Fetch dynamic student data
        const data = await getStudentData(user.id);
        console.log('StudentDashboard: Successfully fetched student data:', data);
        setStudentData(data);
        setError(null); // Clear any previous errors
      } catch (error) {
        console.error('StudentDashboard: Error fetching student data:', error);
        setError('Failed to load student data. Using basic profile information.');
        // Use dbUser information as fallback
        setStudentData({
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
          pendingAssignments: []
        });
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user?.id]);

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

  // Calculate percentages safely
  const feePercentage = studentInfo && studentInfo.feeRequired > 0
    ? Math.round((studentInfo.feePaid / studentInfo.feeRequired) * 100)
    : 0;

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin h-8 w-8 md:h-12 md:w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-lg md:text-xl font-semibold mb-2">Loading Dashboard</h2>
          <p className="text-sm md:text-base text-muted-foreground">Please wait while we load your student data...</p>
        </div>
      </div>
    );
  }

  // Show error state if there's an error
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-lg md:text-xl font-semibold mb-2 text-destructive">Dashboard Error</h2>
          <p className="text-sm md:text-base text-muted-foreground mb-4">{error}</p>
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
      <div className="space-y-4 md:space-y-6 p-4 md:p-6">
        {/* Header - Mobile Optimized */}
        <div className="flex flex-col space-y-2 md:flex-row md:items-center md:justify-between md:space-y-0">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-primary">Student Dashboard</h1>
            <p className="text-sm md:text-base text-muted-foreground">
              Welcome back, {displayValue(studentInfo?.name)} • {displayValue(studentInfo?.admissionNumber)}
            </p>
          </div>
          <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full w-fit">
            <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
            <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Student</span>
          </div>
        </div>

        {/* Announcements Banner */}
        <AnnouncementBanner maxAnnouncements={2} compact={false} />

        {/* Stats Cards - Mobile First Grid */}
        <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
          <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
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

          <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
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

          <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300 sm:col-span-2 lg:col-span-1">
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

        {/* Academic Progress Card - Mobile Optimized */}
        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">Academic Progress</CardTitle>
            <CardDescription>Your academic journey overview</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:gap-8 grid-cols-1 md:grid-cols-2">
              <div className="space-y-3">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-muted-foreground">Faculty:</span>
                  <span className="font-medium text-sm">{displayValue(studentInfo?.faculty)}</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800"></div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-muted-foreground">Current Semester:</span>
                  <span className="font-medium text-sm">{displayValue(studentInfo?.semester)}</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800"></div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-muted-foreground">GPA:</span>
                  <span className="font-medium text-sm">{displayValue(studentInfo?.gpa, 'number')}</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-muted-foreground">Fee Balance:</span>
                  <span className="font-medium text-sm">{displayValue(studentInfo?.feeBalance, 'currency')}</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800"></div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-muted-foreground">Fee Paid:</span>
                  <span className="font-medium text-sm">{displayValue(studentInfo?.feePaid, 'currency')}</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800"></div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-muted-foreground">Total Required:</span>
                  <span className="font-medium text-sm">{displayValue(studentInfo?.feeRequired, 'currency')}</span>
                </div>
                <div className="border-t border-gray-100 dark:border-gray-800"></div>
                <div className="flex justify-between items-center gap-2">
                  <span className="text-sm text-muted-foreground">Payment Progress:</span>
                  <span className="font-medium text-sm">{studentInfo ? `${feePercentage}%` : "N/A"}</span>
                </div>
                {studentInfo && <Progress value={feePercentage} className="h-2 mt-2" />}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* My Units Statistics Card - Mobile Optimized */}
        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">My Units</CardTitle>
            <CardDescription>Semester-specific unit statistics and progress</CardDescription>
          </CardHeader>
          <CardContent>
            {studentInfo ? (
              <>
                <div className="grid gap-4 grid-cols-2 md:grid-cols-4">
                  <div className="text-center space-y-2">
                    <div className="text-xl md:text-2xl font-bold text-blue-600">{displayValue(studentInfo.currentSemesterUnits, 'number')}</div>
                    <p className="text-xs text-muted-foreground">Units Registered</p>
                    <p className="text-xs text-muted-foreground">Current Semester</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-xl md:text-2xl font-bold text-green-600">{displayValue(studentInfo.unitsCompleted, 'number')}</div>
                    <p className="text-xs text-muted-foreground">Units Completed</p>
                    <p className="text-xs text-muted-foreground">Total So Far</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-xl md:text-2xl font-bold text-emerald-600">{displayValue(studentInfo.unitsPassed, 'number')}</div>
                    <p className="text-xs text-muted-foreground">Units Passed</p>
                    <p className="text-xs text-muted-foreground">Grade ≥ 50%</p>
                  </div>
                  <div className="text-center space-y-2">
                    <div className="text-xl md:text-2xl font-bold text-red-600">{displayValue(studentInfo.unitsFailed, 'number')}</div>
                    <p className="text-xs text-muted-foreground">Units Failed</p>
                    <p className="text-xs text-muted-foreground">Grade < 50%</p>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t space-y-2">
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-sm text-muted-foreground">Programme:</span>
                    <span className="text-sm font-medium">{displayValue(studentInfo.programmeTitle)}</span>
                  </div>
                  <div className="flex flex-col sm:flex-row sm:justify-between gap-1">
                    <span className="text-sm text-muted-foreground">Year of Study:</span>
                    <span className="text-sm font-medium">{studentInfo.yearOfStudy > 0 ? `Year ${studentInfo.yearOfStudy}` : "N/A"}</span>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p>No academic data available</p>
                <p className="text-sm">Please contact the academic office if this is an error</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Main Content Grid - Mobile Optimized */}
        <div className="grid gap-4 md:gap-8 grid-cols-1 lg:grid-cols-2">
          <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Upcoming Classes</CardTitle>
              <CardDescription>Your scheduled classes for the next 24 hours</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ) : studentInfo?.upcomingClasses && studentInfo.upcomingClasses.length > 0 ? (
                studentInfo.upcomingClasses.map(classInfo => (
                <div key={classInfo.id} className="flex items-start space-x-3 rounded-md border p-3">
                  <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                    {classInfo.isOnline ? (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M15 10l5 -5"></path>
                        <path d="M20 5v5h-5"></path>
                        <path d="M18 12v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h6"></path>
                      </svg>
                    ) : (
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 md:h-5 md:w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M3 21l18 0"></path>
                        <path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1"></path>
                        <path d="M3 7l18 0"></path>
                        <path d="M3 11l18 0"></path>
                        <path d="M9 8v13"></path>
                        <path d="M15 8v13"></path>
                      </svg>
                    )}
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate">{classInfo.unit}</h4>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="truncate">{classInfo.time}</span>
                    </div>
                    <div className="flex items-center text-xs">
                      {classInfo.isOnline ? (
                        <a href={classInfo.location} className="text-primary hover:underline flex items-center truncate">
                          <span className="truncate">Join Online Class</span>
                          <ArrowRight className="h-3 w-3 ml-1 flex-shrink-0" />
                        </a>
                      ) : (
                        <span className="truncate">{classInfo.location}</span>
                      )}
                    </div>
                  </div>
                </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No upcoming classes scheduled</p>
                </div>
              )}
              <Button variant="outline" className="w-full text-sm">
                View All Classes
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <CardTitle className="text-lg md:text-xl">Pending Assignments</CardTitle>
              <CardDescription>Assignments due in the next 7 days</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {loading ? (
                <div className="space-y-4">
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                </div>
              ) : studentInfo?.pendingAssignments && studentInfo.pendingAssignments.length > 0 ? (
                studentInfo.pendingAssignments.map(assignment => (
                <div key={assignment.id} className="flex items-start space-x-3 rounded-md border p-3">
                  <div className="flex h-8 w-8 md:h-10 md:w-10 items-center justify-center rounded-full bg-primary/10 flex-shrink-0">
                    <FileText className="h-4 w-4 md:h-5 md:w-5 text-primary" />
                  </div>
                  <div className="space-y-1 flex-1 min-w-0">
                    <h4 className="text-sm font-semibold truncate">{assignment.title}</h4>
                    <p className="text-xs text-muted-foreground truncate">{assignment.unit}</p>
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1">
                      <div className="text-xs text-muted-foreground">Due: {assignment.dueDate}</div>
                      <div className={`px-2 py-0.5 rounded-full text-xs w-fit ${
                        assignment.daysRemaining <= 2 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                      }`}>
                        {assignment.daysRemaining} days left
                      </div>
                    </div>
                  </div>
                </div>
                ))
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No pending assignments</p>
                </div>
              )}
              <Button variant="outline" className="w-full text-sm">
                View All Assignments
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  } catch (renderError) {
    console.error('StudentDashboard: Render error:', renderError);
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="text-center max-w-md">
          <h2 className="text-lg md:text-xl font-semibold mb-2 text-destructive">Dashboard Render Error</h2>
          <p className="text-sm md:text-base text-muted-foreground mb-4">There was an error displaying your dashboard.</p>
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
