import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Shield, Users, Database, Settings, Bell, Activity, AlertTriangle, CheckCircle, TrendingUp } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { useState, useEffect } from "react";
import { getSystemStats, getFacultyStats, SystemStats, FacultyStats } from "@/services/facultyService";
import { Skeleton } from "@/components/ui/skeleton";

const AdminDashboard = () => {
  const { dbUser } = useAuth();
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [facultyStats, setFacultyStats] = useState<FacultyStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAdminData = async () => {
      setLoading(true);
      try {
        // Fetch dynamic system statistics
        const sysStats = await getSystemStats();
        setSystemStats(sysStats);

        // Fetch dynamic faculty statistics
        const facStats = await getFacultyStats();
        setFacultyStats(facStats);
      } catch (error) {
        console.error('Error fetching admin data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAdminData();
  }, []);

  // Fallback data if dynamic data is not available
  const adminInfo = {
    name: dbUser?.full_name || "System Administrator",
    systemStats: systemStats || {
      totalUsers: 0,
      totalStudents: 0,
      totalLecturers: 0,
      totalDeans: 0,
      totalAdmins: 0,
      totalCourses: 0,
      totalFaculties: 0,
      totalDepartments: 0,
      activeNotifications: 0
    },
    systemHealth: [
      {
        service: "Database",
        status: "healthy",
        uptime: 99.9,
        lastCheck: "2 minutes ago"
      },
      {
        service: "Authentication",
        status: "healthy",
        uptime: 100,
        lastCheck: "1 minute ago"
      },
      {
        service: "File Storage",
        status: "warning",
        uptime: 98.5,
        lastCheck: "5 minutes ago"
      },
      {
        service: "Email Service",
        status: "healthy",
        uptime: 99.7,
        lastCheck: "3 minutes ago"
      }
    ],
    recentActivities: [
      {
        id: 1,
        type: "user_registration",
        message: "25 new students registered today",
        timestamp: "10 minutes ago",
        severity: "info"
      },
      {
        id: 2,
        type: "system_alert",
        message: "Storage usage exceeded 65% threshold",
        timestamp: "1 hour ago",
        severity: "warning"
      },
      {
        id: 3,
        type: "security",
        message: "Failed login attempts detected from IP 192.168.1.100",
        timestamp: "2 hours ago",
        severity: "alert"
      },
      {
        id: 4,
        type: "maintenance",
        message: "Database backup completed successfully",
        timestamp: "6 hours ago",
        severity: "success"
      }
    ],
    facultyOverview: facultyStats.length > 0 ? facultyStats : [
      {
        id: "focit",
        name: "Faculty of Computing and Information Technology",
        shortName: "FoCIT",
        dean: "Dr. Moses O. Odeo",
        totalStudents: 0,
        totalLecturers: 0,
        totalCourses: 0,
        totalDepartments: 0
      }
    ],
    pendingApprovals: [
      {
        id: 1,
        type: "Course Creation",
        description: "New course: Advanced AI & Machine Learning",
        faculty: "Faculty of Computing and Information Technology",
        requestedBy: "Dr. Sarah Njeri",
        daysWaiting: 3
      },
      {
        id: 2,
        type: "User Role Change",
        description: "Promote lecturer to department head",
        faculty: "Faculty of Business and Economics",
        requestedBy: "Dr. Dorcas Kerre",
        daysWaiting: 1
      }
    ]
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Admin Dashboard</h1>
          <p className="text-muted-foreground">
            System Administration & Management
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-red-100 dark:bg-red-900/30 rounded-full">
          <Shield className="h-4 w-4 text-red-600 dark:text-red-400" />
          <span className="text-sm font-medium text-red-600 dark:text-red-400">Administrator</span>
        </div>
      </div>

      {/* System Overview Banner */}
      <Card className="bg-gradient-to-r from-red-600 to-pink-600 text-white border-0">
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{adminInfo.systemStats.totalUsers.toLocaleString()}</div>
              <div className="text-red-100">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{adminInfo.systemStats.systemUptime}%</div>
              <div className="text-red-100">System Uptime</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{adminInfo.systemStats.dailyActiveUsers.toLocaleString()}</div>
              <div className="text-red-100">Daily Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{adminInfo.systemStats.activeNotifications}</div>
              <div className="text-red-100">Active Notifications</div>
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
            <div className="text-2xl font-bold">{adminInfo.systemStats.totalStudents.toLocaleString()}</div>
            <p className="text-xs text-muted-foreground">
              Across all faculties
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Faculty Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminInfo.systemStats.totalLecturers}</div>
            <p className="text-xs text-muted-foreground">
              Teaching staff
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Storage Usage</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{adminInfo.systemStats.storageUsed}%</div>
            <p className="text-xs text-muted-foreground">
              Of total capacity
            </p>
            <Progress value={adminInfo.systemStats.storageUsed} className="h-2 mt-2" />
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Health</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">Healthy</div>
            <p className="text-xs text-muted-foreground">
              All systems operational
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Faculty Overview */}
      <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
        <CardHeader>
          <CardTitle>Faculty Overview</CardTitle>
          <CardDescription>University-wide faculty statistics and management</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {adminInfo.facultyOverview.map(faculty => (
              <div key={faculty.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <h4 className="font-semibold">{faculty.name}</h4>
                  <p className="text-sm text-muted-foreground">Dean: {faculty.dean}</p>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="text-center">
                    <div className="font-semibold">{faculty.totalStudents || faculty.students || 0}</div>
                    <div className="text-muted-foreground">Students</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{faculty.totalLecturers || faculty.lecturers || 0}</div>
                    <div className="text-muted-foreground">Lecturers</div>
                  </div>
                  <div className="text-center">
                    <div className="font-semibold">{faculty.totalCourses || faculty.courses || 0}</div>
                    <div className="text-muted-foreground">Courses</div>
                  </div>
                  <Button variant="outline" size="sm">
                    Manage
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Main Content Grid */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>System Health</CardTitle>
            <CardDescription>Real-time system service monitoring</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {adminInfo.systemHealth.map((service, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-3">
                  <div className={`w-3 h-3 rounded-full ${
                    service.status === 'healthy' ? 'bg-green-500' :
                    service.status === 'warning' ? 'bg-yellow-500' : 'bg-red-500'
                  }`}></div>
                  <div>
                    <div className="font-medium">{service.service}</div>
                    <div className="text-xs text-muted-foreground">Last check: {service.lastCheck}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-semibold">{service.uptime}%</div>
                  <div className="text-xs text-muted-foreground">Uptime</div>
                </div>
              </div>
            ))}
            <Button variant="outline" className="w-full">
              View System Logs
            </Button>
          </CardContent>
        </Card>

        <Card className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
          <CardHeader>
            <CardTitle>Recent System Activities</CardTitle>
            <CardDescription>Latest system events and alerts</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {adminInfo.recentActivities.map(activity => (
              <div key={activity.id} className="flex items-start space-x-4 rounded-md border p-4">
                <div className={`flex h-10 w-10 items-center justify-center rounded-full ${
                  activity.severity === 'success' ? 'bg-green-100 dark:bg-green-900/30' :
                  activity.severity === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30' :
                  activity.severity === 'alert' ? 'bg-red-100 dark:bg-red-900/30' :
                  'bg-blue-100 dark:bg-blue-900/30'
                }`}>
                  {activity.severity === 'success' ? (
                    <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />
                  ) : activity.severity === 'warning' ? (
                    <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                  ) : activity.severity === 'alert' ? (
                    <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />
                  ) : (
                    <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                  )}
                </div>
                <div className="space-y-1 flex-1">
                  <p className="text-sm">{activity.message}</p>
                  <div className="text-xs text-muted-foreground">{activity.timestamp}</div>
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

export default AdminDashboard;
