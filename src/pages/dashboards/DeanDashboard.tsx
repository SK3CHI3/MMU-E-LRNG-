import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Building, Users, BookOpen, TrendingUp, UserCheck, AlertTriangle, BarChart3, GraduationCap } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const DeanDashboard = () => {
  const { dbUser } = useAuth();

  // Dean-specific data (faculty-scoped)
  const deanInfo = {
    name: dbUser?.full_name || "Prof. Dean",
    faculty: dbUser?.department || "Faculty of Computing and Information Technology",
    facultyCode: "FoCIT",
    departments: [
      {
        id: 1,
        name: "Department of Computer Science",
        head: "Dr. John Kamau",
        lecturers: 12,
        students: 245,
        courses: 18
      },
      {
        id: 2,
        name: "Department of Information Technology",
        head: "Dr. Mary Wanjiku",
        lecturers: 8,
        students: 189,
        courses: 14
      },
      {
        id: 3,
        name: "Kenya-Korea IAC Centre",
        head: "Dr. Peter Mwangi",
        lecturers: 5,
        students: 67,
        courses: 8
      }
    ],
    facultyStats: {
      totalLecturers: 25,
      totalStudents: 501,
      totalCourses: 40,
      totalProgrammes: 9,
      graduationRate: 87,
      employmentRate: 92,
      researchProjects: 15,
      publications: 23
    },
    recentActivities: [
      {
        id: 1,
        type: "enrollment",
        message: "45 new students enrolled in Computer Science",
        timestamp: "2 hours ago",
        department: "Computer Science"
      },
      {
        id: 2,
        type: "achievement",
        message: "Dr. Sarah Njeri published research paper in IEEE",
        timestamp: "1 day ago",
        department: "Information Technology"
      },
      {
        id: 3,
        type: "alert",
        message: "Low attendance in CS301 - Advanced Databases",
        timestamp: "2 days ago",
        department: "Computer Science"
      }
    ],
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

  const totalLecturers = deanInfo.departments.reduce((sum, dept) => sum + dept.lecturers, 0);
  const totalStudents = deanInfo.departments.reduce((sum, dept) => sum + dept.students, 0);
  const totalCourses = deanInfo.departments.reduce((sum, dept) => sum + dept.courses, 0);

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
              <div className="text-blue-100">{deanInfo.departments.length} Departments</div>
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
            <div className="text-2xl font-bold">{totalStudents}</div>
            <p className="text-xs text-muted-foreground">
              Across {deanInfo.departments.length} departments
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faculty Lecturers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalLecturers}</div>
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
            <div className="text-2xl font-bold">{totalCourses}</div>
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
            <div className="text-2xl font-bold">{deanInfo.facultyStats.graduationRate}%</div>
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
            {deanInfo.departments.map(department => (
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

      {/* Main Content Grid */}
      <div className="grid gap-8 md:grid-cols-2 md:divide-x md:divide-gray-100 dark:md:divide-gray-800">
        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300 md:pr-6">
          <CardHeader>
            <CardTitle>Faculty Performance</CardTitle>
            <CardDescription>Key performance indicators for your faculty</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {deanInfo.performanceMetrics.map((metric, index) => (
              <div key={index} className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{metric.metric}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{metric.value}{metric.maxValue === 5 ? '/5' : '%'}</span>
                    {metric.trend === 'up' ? (
                      <TrendingUp className="h-4 w-4 text-green-500" />
                    ) : (
                      <BarChart3 className="h-4 w-4 text-gray-500" />
                    )}
                  </div>
                </div>
                <Progress
                  value={(metric.value / metric.maxValue) * 100}
                  className="h-2"
                />
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
    </div>
  );
};

export default DeanDashboard;
