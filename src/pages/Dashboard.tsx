
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { CalendarDays, Clock, FileText, AlertTriangle, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Dashboard = () => {
  const { dbUser } = useAuth();

  // Use real user data from context and add some sample data
  const studentInfo = {
    name: dbUser?.full_name || "Student",
    admissionNumber: dbUser?.student_id || "FoCIT/2024/001",
    faculty: dbUser?.department || "Faculty of Computing and Information Technology",
    role: dbUser?.role || "student",
    semester: "2.1",
    gpa: 3.7,
    feeBalance: 15000,
    feeRequired: 45000,
    upcomingClasses: [
      {
        id: 1,
        unit: "Advanced Database Systems",
        time: "Today, 2:00 PM",
        location: "Room 305",
        isOnline: false,
      },
      {
        id: 2,
        unit: "Software Engineering",
        time: "Tomorrow, 10:30 AM",
        location: "https://zoom.us/j/123456",
        isOnline: true,
      },
    ],
    pendingAssignments: [
      {
        id: 1,
        unit: "Data Structures and Algorithms",
        title: "Assignment 3: Binary Trees",
        dueDate: "May 25, 2025",
        daysRemaining: 5,
      },
      {
        id: 2,
        unit: "Operating Systems",
        title: "Lab 4: Process Scheduling",
        dueDate: "May 23, 2025",
        daysRemaining: 3,
      },
    ],
  };

  // Calculate fee percentage
  const feePercentage = Math.round((1 - studentInfo.feeBalance / studentInfo.feeRequired) * 100);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {studentInfo.name}
          </p>
        </div>
      </div>

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
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentInfo.pendingAssignments.length}</div>
            <p className="text-xs text-muted-foreground">
              Next due in {Math.min(...studentInfo.pendingAssignments.map(a => a.daysRemaining))} days
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fee Balance</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${feePercentage < 70 ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {studentInfo.feeBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {feePercentage}% paid of KSh {studentInfo.feeRequired.toLocaleString()}
            </p>
            <Progress value={feePercentage} className="h-2 mt-2" />
          </CardContent>
        </Card>
      </div>

      {/* User Information Card */}
      <Card className="col-span-full bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle>User Information</CardTitle>
          <CardDescription>Your account details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Name:</span>
                <span className="font-medium">{studentInfo.name}</span>
              </div>
              {studentInfo.role === 'student' && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Admission Number:</span>
                  <span className="font-medium">{studentInfo.admissionNumber}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-medium">{studentInfo.faculty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Role:</span>
                <span className="font-medium capitalize">{studentInfo.role}</span>
              </div>
            </div>

            <div className="space-y-2">
              {studentInfo.role === 'student' && (
                <>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Semester:</span>
                    <span className="font-medium">{studentInfo.semester}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">GPA:</span>
                    <span className="font-medium">{studentInfo.gpa}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee Balance:</span>
                    <span className="font-medium">KSh {studentInfo.feeBalance.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Fee Paid:</span>
                    <span className="font-medium">{feePercentage}%</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Email:</span>
                <span className="font-medium">{dbUser?.email || 'Not available'}</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1 bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
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

        <Card className="col-span-1 bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
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

export default Dashboard;
