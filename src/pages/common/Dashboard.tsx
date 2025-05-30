
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { CalendarDays, Clock, FileText, AlertTriangle, ArrowRight } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentData, StudentData } from '@/services/userDataService';
import { showErrorToast } from '@/utils/ui/toast';

const Dashboard = () => {
  const { user, dbUser } = useAuth();
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.id && dbUser?.role === 'student') {
      fetchStudentData();
    } else if (dbUser?.role !== 'student') {
      // For non-students, show basic info without student-specific data
      setLoading(false);
    }
  }, [user?.id, dbUser?.role]);

  const fetchStudentData = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await getStudentData(user.id);
      setStudentData(data);
      setError(null);
    } catch (error) {
      console.error('Dashboard: Error fetching student data:', error);
      setError('Failed to load student data');
      showErrorToast('Failed to load dashboard data');
      // Set fallback data
      setStudentData({
        name: dbUser?.full_name || 'Student',
        admissionNumber: dbUser?.student_id || 'Not Set',
        faculty: dbUser?.department || 'Not Assigned',
        semester: 'Current Semester',
        academicYear: '2024/2025',
        gpa: 0,
        feeBalance: 0,
        feeRequired: 0,
        feePaid: 0,
        enrolledCourses: 0,
        upcomingClasses: [],
        pendingAssignments: [],
        currentSemesterUnits: 0,
        totalUnitsRegistered: 0,
        unitsCompleted: 0,
        unitsPassed: 0,
        unitsFailed: 0,
        programmeTitle: 'Not Set',
        yearOfStudy: 1
      });
    } finally {
      setLoading(false);
    }
  };

  // For non-student users, show basic dashboard
  if (dbUser?.role !== 'student') {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Welcome back, {dbUser?.full_name || 'User'}
            </p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-muted-foreground">
              Please use the sidebar to navigate to your role-specific dashboard.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Loading state for students
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <Skeleton className="h-4 w-48 mt-2" />
          </div>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">Welcome back</p>
          </div>
        </div>
        <Card>
          <CardContent className="p-6 text-center">
            <AlertTriangle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground">Unable to load student data</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Calculate fee percentage
  const feePercentage = studentData.feeRequired > 0
    ? Math.round(((studentData.feeRequired - studentData.feeBalance) / studentData.feeRequired) * 100)
    : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Welcome back, {studentData.name}
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
            <div className="text-2xl font-bold">{studentData.semester}</div>
            <p className="text-xs text-muted-foreground">
              Academic Year {studentData.academicYear}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Current GPA</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.gpa.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">
              {studentData.gpa >= 3.5 ? "Excellent" : studentData.gpa >= 3.0 ? "Good" : studentData.gpa > 0 ? "Average" : "No GPA"}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Assignments</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{studentData.pendingAssignments.length}</div>
            <p className="text-xs text-muted-foreground">
              {studentData.pendingAssignments.length > 0 ? 'Check assignment details' : 'No pending assignments'}
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Fee Balance</CardTitle>
            <AlertTriangle className={`h-4 w-4 ${feePercentage < 70 ? "text-destructive" : "text-muted-foreground"}`} />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">KSh {studentData.feeBalance.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              {feePercentage}% paid of KSh {studentData.feeRequired.toLocaleString()}
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
                <span className="font-medium">{studentData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Admission Number:</span>
                <span className="font-medium">{studentData.admissionNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Department:</span>
                <span className="font-medium">{studentData.faculty}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Programme:</span>
                <span className="font-medium">{studentData.programmeTitle}</span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Semester:</span>
                <span className="font-medium">{studentData.semester}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Year of Study:</span>
                <span className="font-medium">{studentData.yearOfStudy}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">GPA:</span>
                <span className="font-medium">{studentData.gpa.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee Balance:</span>
                <span className="font-medium">KSh {studentData.feeBalance.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Fee Paid:</span>
                <span className="font-medium">{feePercentage}%</span>
              </div>
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
            {studentData.upcomingClasses.length > 0 ? (
              studentData.upcomingClasses.map((classInfo: any) => (
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
                    <h4 className="text-sm font-semibold">{classInfo.unit || classInfo.course_title}</h4>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Clock className="h-3.5 w-3.5 mr-1" />
                      <span>{classInfo.time || classInfo.scheduled_time}</span>
                    </div>
                    <div className="flex items-center text-xs">
                      {classInfo.isOnline ? (
                        <a href={classInfo.location} className="text-primary hover:underline flex items-center">
                          <span>Join Online Class</span>
                          <ArrowRight className="h-3.5 w-3.5 ml-1" />
                        </a>
                      ) : (
                        <span>{classInfo.location || classInfo.venue}</span>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No upcoming classes scheduled</p>
              </div>
            )}
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
            {studentData.pendingAssignments.length > 0 ? (
              studentData.pendingAssignments.map((assignment: any) => (
                <div key={assignment.id} className="flex items-start space-x-4 rounded-md border p-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="space-y-1 flex-1">
                    <h4 className="text-sm font-semibold">{assignment.title || assignment.assignment_title}</h4>
                    <p className="text-xs text-muted-foreground">{assignment.unit || assignment.course_title}</p>
                    <div className="flex items-center justify-between">
                      <div className="text-xs text-muted-foreground">
                        Due: {assignment.dueDate || assignment.due_date}
                      </div>
                      <div className="px-2 py-0.5 rounded-full text-xs bg-primary/10 text-primary">
                        Pending
                      </div>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No pending assignments</p>
              </div>
            )}
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
