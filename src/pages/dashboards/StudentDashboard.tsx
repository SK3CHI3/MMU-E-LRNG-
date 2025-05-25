import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Clock, FileText, ArrowRight, BookOpen, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { getStudentData, StudentData } from "@/services/userDataService";
import { getUserNotifications, getCourseAnnouncements } from "@/services/notificationService";
import { Skeleton } from "@/components/ui/skeleton";

const StudentDashboard = () => {
  const { dbUser, user } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);
  const [announcements, setAnnouncements] = useState([]);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        // Fetch dynamic student data
        const data = await getStudentData(user.id);
        setStudentData(data);

        // Fetch notifications
        const userNotifications = await getUserNotifications(user.id);
        setNotifications(userNotifications);

        // If we have course enrollments, fetch course announcements
        if (data?.enrolledCourses) {
          // This would need course IDs - we'll implement this when we have enrollment data
          // const courseAnnouncements = await getCourseAnnouncements(courseIds);
          // setAnnouncements(courseAnnouncements);
        }
      } catch (error) {
        console.error('Error fetching student data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
  }, [user?.id]);

  // Fallback data if dynamic data is not available
  const studentInfo = studentData || {
    name: dbUser?.full_name || "Student",
    admissionNumber: dbUser?.student_id || "FoCIT/2024/001",
    faculty: dbUser?.department || "Faculty of Computing and Information Technology",
    semester: "2.1",
    gpa: 3.7,
    feeBalance: 15000,
    feeRequired: 45000,
    enrolledCourses: 6,
    completedCredits: 45,
    requiredCredits: 120,
    upcomingClasses: [],
    pendingAssignments: [],
  };

  // Calculate percentages
  const feePercentage = Math.round((1 - studentInfo.feeBalance / studentInfo.feeRequired) * 100);
  const creditPercentage = Math.round((studentInfo.completedCredits / studentInfo.requiredCredits) * 100);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Student Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {studentInfo.name} • {studentInfo.admissionNumber}
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <GraduationCap className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">Student</span>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current Semester</CardTitle>
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentInfo.semester}</div>
            <p className="text-xs text-muted-foreground">
              Academic Year 2024/2025
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentInfo.gpa}</div>
            <p className="text-xs text-muted-foreground">
              {studentInfo.gpa >= 3.5 ? "Excellent" : studentInfo.gpa >= 3.0 ? "Good" : "Average"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Enrolled Courses</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentInfo.enrolledCourses}</div>
            <p className="text-xs text-muted-foreground">
              This semester
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Credit Progress</CardTitle>
            <GraduationCap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentInfo.completedCredits}/{studentInfo.requiredCredits}</div>
            <p className="text-xs text-muted-foreground">
              {creditPercentage}% completed
            </p>
            <Progress value={creditPercentage} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* Academic Progress Card */}
      <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle>Academic Progress</CardTitle>
          <CardDescription>Your academic journey overview</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Faculty:</span>
                <span className="font-medium">{studentInfo.faculty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Current Semester:</span>
                <span className="font-medium">{studentInfo.semester}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GPA:</span>
                <span className="font-medium">{studentInfo.gpa}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Completed Credits:</span>
                <span className="font-medium">{studentInfo.completedCredits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Required Credits:</span>
                <span className="font-medium">{studentInfo.requiredCredits}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Progress:</span>
                <span className="font-medium">{creditPercentage}%</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee Balance:</span>
                <span className="font-medium">KSh {studentInfo.feeBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee Paid:</span>
                <span className="font-medium">{feePercentage}%</span>
              </div>
              <Progress value={feePercentage} className="h-2 mt-2" />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Upcoming Classes</CardTitle>
            <CardDescription>Your scheduled classes for the next 24 hours</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {studentInfo.upcomingClasses.map(classInfo => (
              <div key={classInfo.id} className="flex items-start space-x-4 rounded-md border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  {classInfo.isOnline ? (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M15 10l5 -5"></path>
                      <path d="M20 5v5h-5"></path>
                      <path d="M18 12v6a2 2 0 0 1 -2 2h-10a2 2 0 0 1 -2 -2v-10a2 2 0 0 1 2 -2h6"></path>
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M3 21l18 0"></path>
                      <path d="M3 7v1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1m0 1a3 3 0 0 0 6 0v-1"></path>
                      <path d="M3 7l18 0"></path>
                      <path d="M3 11l18 0"></path>
                      <path d="M9 8v13"></path>
                      <path d="M15 8v13"></path>
                    </svg>
                  )}
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="text-sm font-semibold">{classInfo.unit}</h4>
                  <div className="flex items-center text-xs text-muted-foreground">
                    <Clock className="h-3.5 w-3.5 mr-1" />
                    <span>{classInfo.time}</span>
                  </div>
                  <div className="flex items-center text-xs">
                    {classInfo.isOnline ? (
                      <a href={classInfo.location} className="text-primary hover:underline flex items-center">
                        <span>Join Online Class</span>
                        <ArrowRight className="h-3.5 w-3.5 ml-1" />
                      </a>
                    ) : (
                      <span>{classInfo.location}</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Classes
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Pending Assignments</CardTitle>
            <CardDescription>Assignments due in the next 7 days</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {studentInfo.pendingAssignments.map(assignment => (
              <div key={assignment.id} className="flex items-start space-x-4 rounded-md border p-4">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                  <FileText className="h-5 w-5 text-primary" />
                </div>
                <div className="space-y-1 flex-1">
                  <h4 className="text-sm font-semibold">{assignment.title}</h4>
                  <p className="text-xs text-muted-foreground">{assignment.unit}</p>
                  <div className="flex items-center justify-between">
                    <div className="text-xs text-muted-foreground">Due: {assignment.dueDate}</div>
                    <div className={`px-2 py-0.5 rounded-full text-xs ${
                      assignment.daysRemaining <= 2 ? "bg-destructive/10 text-destructive" : "bg-primary/10 text-primary"
                    }`}>
                      {assignment.daysRemaining} days left
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View All Assignments
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StudentDashboard;
