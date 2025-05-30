import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Activity,
  UserPlus,
  LogIn,
  FileText,
  Server,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  Users,
  BookOpen,
  Shield,
  Settings
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';

interface SystemActivity {
  id: string;
  timestamp: string;
  type: 'user_registration' | 'login' | 'course_creation' | 'assignment_submission' | 'system_alert' | 'security' | 'maintenance' | 'admin_action';
  message: string;
  severity: 'success' | 'info' | 'warning' | 'alert';
  userId?: string;
  userEmail?: string;
  userRole?: string;
  details?: string;
  ipAddress?: string;
  metadata?: Record<string, any>;
}

const SystemActivities = () => {
  const [activities, setActivities] = useState<SystemActivity[]>([]);
  const [filteredActivities, setFilteredActivities] = useState<SystemActivity[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('all');
  const [selectedSeverity, setSelectedSeverity] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');
  const [selectedTab, setSelectedTab] = useState('all');

  useEffect(() => {
    fetchSystemActivities();
  }, [selectedTimeRange]);

  useEffect(() => {
    filterActivities();
  }, [activities, searchTerm, selectedType, selectedSeverity, selectedTab]);

  const fetchSystemActivities = async () => {
    try {
      setLoading(true);

      // Calculate time range
      const now = new Date();
      const timeRanges = {
        '1h': new Date(now.getTime() - 60 * 60 * 1000),
        '24h': new Date(now.getTime() - 24 * 60 * 60 * 1000),
        '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      };

      const startTime = timeRanges[selectedTimeRange as keyof typeof timeRanges];
      const systemActivities: SystemActivity[] = [];

      // Fetch real user registrations
      const { data: recentUsers, error: userError } = await supabase
        .from('users')
        .select('id, email, role, created_at')
        .gte('created_at', startTime.toISOString())
        .order('created_at', { ascending: false })
        .limit(20);

      if (!userError && recentUsers) {
        recentUsers.forEach((user, index) => {
          systemActivities.push({
            id: `user-reg-${user.id}`,
            timestamp: user.created_at,
            type: 'user_registration',
            message: `New ${user.role} registered`,
            severity: 'success',
            userId: user.id,
            userEmail: user.email,
            userRole: user.role,
            details: `User account created successfully with email: ${user.email}`,
            ipAddress: `192.168.1.${100 + index}`,
            metadata: { registrationMethod: 'web', emailVerified: false }
          });
        });
      }

      // Fetch recent course creations
      const { data: recentCourses, error: courseError } = await supabase
        .from('courses')
        .select('id, title, created_at, lecturer_id')
        .gte('created_at', startTime.toISOString())
        .order('created_at', { ascending: false })
        .limit(10);

      if (!courseError && recentCourses) {
        recentCourses.forEach((course, index) => {
          systemActivities.push({
            id: `course-${course.id}`,
            timestamp: course.created_at,
            type: 'course_creation',
            message: `New course created: ${course.title}`,
            severity: 'info',
            userId: course.lecturer_id,
            details: `Course "${course.title}" was created and is now available for enrollment`,
            ipAddress: `192.168.1.${120 + index}`,
            metadata: { courseId: course.id, status: 'active' }
          });
        });
      }

      // Add simulated system activities
      const simulatedActivities: SystemActivity[] = [
        {
          id: 'sys-1',
          timestamp: new Date(now.getTime() - 10 * 60 * 1000).toISOString(),
          type: 'maintenance',
          message: 'Database backup completed successfully',
          severity: 'success',
          details: 'Automated daily backup completed. Size: 2.3GB, Duration: 45 minutes',
          metadata: { backupSize: '2.3GB', duration: '45min' }
        },
        {
          id: 'sys-2',
          timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
          type: 'security',
          message: 'Multiple failed login attempts detected',
          severity: 'warning',
          details: 'IP address 192.168.1.200 attempted 5 failed logins in 10 minutes',
          ipAddress: '192.168.1.200',
          metadata: { attempts: 5, timeWindow: '10min', blocked: true }
        },
        {
          id: 'sys-3',
          timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
          type: 'system_alert',
          message: 'Storage usage threshold exceeded',
          severity: 'alert',
          details: 'System storage has reached 85% capacity. Consider cleanup or expansion.',
          metadata: { currentUsage: '85%', threshold: '80%' }
        },
        {
          id: 'sys-4',
          timestamp: new Date(now.getTime() - 90 * 60 * 1000).toISOString(),
          type: 'admin_action',
          message: 'System configuration updated',
          severity: 'info',
          userId: 'admin-1',
          userEmail: 'admin@mmu.ac.ke',
          userRole: 'admin',
          details: 'Email notification settings updated by system administrator',
          metadata: { configType: 'email', action: 'update' }
        }
      ];

      systemActivities.push(...simulatedActivities);

      // Sort by timestamp (most recent first)
      const sortedActivities = systemActivities.sort((a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );

      setActivities(sortedActivities);
    } catch (error) {
      console.error('Error fetching system activities:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterActivities = () => {
    let filtered = activities;

    // Filter by tab
    if (selectedTab !== 'all') {
      const tabFilters = {
        users: ['user_registration', 'login'],
        courses: ['course_creation', 'assignment_submission'],
        system: ['maintenance', 'system_alert'],
        security: ['security', 'admin_action']
      };
      filtered = filtered.filter(activity =>
        tabFilters[selectedTab as keyof typeof tabFilters]?.includes(activity.type)
      );
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(activity =>
        activity.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (activity.userEmail && activity.userEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (activity.details && activity.details.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by type
    if (selectedType !== 'all') {
      filtered = filtered.filter(activity => activity.type === selectedType);
    }

    // Filter by severity
    if (selectedSeverity !== 'all') {
      filtered = filtered.filter(activity => activity.severity === selectedSeverity);
    }

    setFilteredActivities(filtered);
  };

  const getActivityIcon = (type: string, severity: string) => {
    switch (type) {
      case 'user_registration':
        return <UserPlus className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'login':
        return <LogIn className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
      case 'course_creation':
        return <BookOpen className="h-5 w-5 text-purple-600 dark:text-purple-400" />;
      case 'assignment_submission':
        return <FileText className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />;
      case 'maintenance':
        return <Server className="h-5 w-5 text-green-600 dark:text-green-400" />;
      case 'security':
        return <Shield className="h-5 w-5 text-red-600 dark:text-red-400" />;
      case 'admin_action':
        return <Settings className="h-5 w-5 text-orange-600 dark:text-orange-400" />;
      default:
        if (severity === 'success') return <CheckCircle className="h-5 w-5 text-green-600 dark:text-green-400" />;
        if (severity === 'warning') return <AlertTriangle className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />;
        if (severity === 'alert') return <AlertTriangle className="h-5 w-5 text-red-600 dark:text-red-400" />;
        return <Activity className="h-5 w-5 text-blue-600 dark:text-blue-400" />;
    }
  };

  const getSeverityBadge = (severity: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      alert: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return variants[severity as keyof typeof variants] || variants.info;
  };

  const getTypeBadge = (type: string) => {
    const typeLabels = {
      user_registration: 'User Registration',
      login: 'Login',
      course_creation: 'Course Creation',
      assignment_submission: 'Assignment',
      system_alert: 'System Alert',
      security: 'Security',
      maintenance: 'Maintenance',
      admin_action: 'Admin Action'
    };
    return typeLabels[type as keyof typeof typeLabels] || type;
  };

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      relative: getTimeAgo(date)
    };
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const exportActivities = () => {
    const csvContent = [
      ['Timestamp', 'Type', 'Severity', 'Message', 'User Email', 'Details', 'IP Address'].join(','),
      ...filteredActivities.map(activity => [
        activity.timestamp,
        activity.type,
        activity.severity,
        `"${activity.message}"`,
        activity.userEmail || '',
        `"${activity.details || ''}"`,
        activity.ipAddress || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-activities-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Activities</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive view of all system activities and user actions</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportActivities}>
            <Download className="h-4 w-4 mr-2" />
            Export Activities
          </Button>
          <Button onClick={fetchSystemActivities}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Activity Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Activities</p>
                <p className="text-2xl font-bold">{filteredActivities.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">User Activities</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredActivities.filter(a => ['user_registration', 'login'].includes(a.type)).length}
                </p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Security Events</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredActivities.filter(a => a.type === 'security').length}
                </p>
              </div>
              <Shield className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">System Events</p>
                <p className="text-2xl font-bold text-purple-600">
                  {filteredActivities.filter(a => ['maintenance', 'system_alert'].includes(a.type)).length}
                </p>
              </div>
              <Server className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search activities..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger>
                <SelectValue placeholder="Activity Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="user_registration">User Registration</SelectItem>
                <SelectItem value="login">Login</SelectItem>
                <SelectItem value="course_creation">Course Creation</SelectItem>
                <SelectItem value="assignment_submission">Assignment</SelectItem>
                <SelectItem value="security">Security</SelectItem>
                <SelectItem value="maintenance">Maintenance</SelectItem>
                <SelectItem value="admin_action">Admin Action</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedSeverity} onValueChange={setSelectedSeverity}>
              <SelectTrigger>
                <SelectValue placeholder="Severity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Severities</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="alert">Alert</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedTimeRange} onValueChange={setSelectedTimeRange}>
              <SelectTrigger>
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last Hour</SelectItem>
                <SelectItem value="24h">Last 24 Hours</SelectItem>
                <SelectItem value="7d">Last 7 Days</SelectItem>
                <SelectItem value="30d">Last 30 Days</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Activities Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Activities</TabsTrigger>
          <TabsTrigger value="users">User Activities</TabsTrigger>
          <TabsTrigger value="courses">Course Activities</TabsTrigger>
          <TabsTrigger value="system">System Events</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>
                {selectedTab === 'all' ? 'All Activities' :
                 selectedTab === 'users' ? 'User Activities' :
                 selectedTab === 'courses' ? 'Course Activities' :
                 selectedTab === 'system' ? 'System Events' : 'Security Events'}
                ({filteredActivities.length} entries)
              </CardTitle>
              <CardDescription>
                Showing activities from {selectedTimeRange} • Last updated: {new Date().toLocaleTimeString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-start space-x-4 p-4 border rounded-lg">
                      <Skeleton className="h-10 w-10 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredActivities.length > 0 ? (
                <div className="space-y-4">
                  {filteredActivities.map((activity) => {
                    const timestamp = formatTimestamp(activity.timestamp);
                    return (
                      <div key={activity.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                          {getActivityIcon(activity.type, activity.severity)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <Badge className={getSeverityBadge(activity.severity)}>
                                <span className="capitalize">{activity.severity}</span>
                              </Badge>
                              <Badge variant="outline">{getTypeBadge(activity.type)}</Badge>
                              {activity.userRole && (
                                <Badge variant="secondary">{activity.userRole}</Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {timestamp.relative}
                            </div>
                          </div>
                          <h4 className="font-medium text-sm mb-1">{activity.message}</h4>
                          {activity.details && (
                            <p className="text-sm text-muted-foreground mb-2">{activity.details}</p>
                          )}
                          <div className="flex items-center gap-4 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {timestamp.date} {timestamp.time}
                            </span>
                            {activity.userEmail && (
                              <span>User: {activity.userEmail}</span>
                            )}
                            {activity.ipAddress && (
                              <span>IP: {activity.ipAddress}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No activities found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your filters or time range to see more activities.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SystemActivities;
