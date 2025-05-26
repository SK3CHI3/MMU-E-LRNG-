import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { BookOpen, Users, FileText, BarChart3, Clock, AlertCircle, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const LecturerDashboard = () => {
  const { dbUser } = useAuth();

  // Lecturer-specific data
  const lecturerInfo = {
    name: dbUser?.full_name || "Dr. Lecturer",
    employeeId: dbUser?.id || "EMP-2024-001",
    department: dbUser?.department || "Faculty of Computing and Information Technology",
    assignedCourses: [
      {
        id: 1,
        code: "CS301",
        name: "Advanced Database Systems",
        students: 45,
        semester: "2.1",

        nextClass: "Today, 2:00 PM"
      },
      {
        id: 2,
        code: "CS401",
        name: "Software Engineering",
        students: 38,
        semester: "2.1",

        nextClass: "Tomorrow, 10:30 AM"
      },
      {
        id: 3,
        code: "CS201",
        name: "Data Structures",
        students: 52,
        semester: "2.1",

        nextClass: "Friday, 9:00 AM"
      }
    ],
    pendingGrading: [
      {
        id: 1,
        course: "CS301",
        assignment: "Database Design Project",
        submissions: 42,
        totalStudents: 45,
        dueDate: "2 days ago"
      },
      {
        id: 2,
        course: "CS401",
        assignment: "Software Requirements Analysis",
        submissions: 35,
        totalStudents: 38,
        dueDate: "1 day ago"
      }
    ],
    upcomingClasses: [
      {
        id: 1,
        course: "CS301 - Advanced Database Systems",
        time: "Today, 2:00 PM",
        room: "Room 305",
        students: 45
      },
      {
        id: 2,
        course: "CS401 - Software Engineering",
        time: "Tomorrow, 10:30 AM",
        room: "Online - Zoom",
        students: 38
      }
    ]
  };

  const totalStudents = lecturerInfo.assignedCourses.reduce((sum, course) => sum + course.students, 0);
  const totalCourses = lecturerInfo.assignedCourses.length;
  const pendingGradingCount = lecturerInfo.pendingGrading.length;

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
            <CardTitle className="text-sm font-medium">Average Class Size</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.round(totalStudents / totalCourses)}</div>
            <p className="text-xs text-muted-foreground">
              Students per course
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

      {/* Main Content Grid */}
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
    </div>
  );
};

export default LecturerDashboard;
