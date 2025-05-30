import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Server,
  Database,
  Shield,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Download,
  Filter,
  RefreshCw,
  Eye,
  Calendar,
  Activity
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';

interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  service: string;
  message: string;
  details?: string;
  userId?: string;
  ipAddress?: string;
  userAgent?: string;
}

const SystemLogs = () => {
  const [logs, setLogs] = useState<SystemLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<SystemLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedLevel, setSelectedLevel] = useState('all');
  const [selectedService, setSelectedService] = useState('all');
  const [selectedTimeRange, setSelectedTimeRange] = useState('24h');

  useEffect(() => {
    fetchSystemLogs();
  }, [selectedTimeRange]);

  useEffect(() => {
    filterLogs();
  }, [logs, searchTerm, selectedLevel, selectedService]);

  const fetchSystemLogs = async () => {
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

      // Generate comprehensive system logs (in real app, this would come from actual log files/database)
      const systemLogs: SystemLog[] = [
        {
          id: '1',
          timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(),
          level: 'info',
          service: 'Database',
          message: 'Database connection pool optimized',
          details: 'Connection pool size adjusted from 10 to 15 connections for better performance',
          ipAddress: '192.168.1.100'
        },
        {
          id: '2',
          timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(),
          level: 'success',
          service: 'Authentication',
          message: 'User authentication successful',
          details: 'Student login completed successfully',
          userId: 'user_123',
          ipAddress: '192.168.1.105'
        },
        {
          id: '3',
          timestamp: new Date(now.getTime() - 30 * 60 * 1000).toISOString(),
          level: 'warning',
          service: 'Storage',
          message: 'Storage usage approaching limit',
          details: 'Current usage: 78% of allocated storage. Consider cleanup or expansion.',
          ipAddress: '192.168.1.100'
        },
        {
          id: '4',
          timestamp: new Date(now.getTime() - 45 * 60 * 1000).toISOString(),
          level: 'error',
          service: 'Email',
          message: 'Failed to send notification email',
          details: 'SMTP connection timeout after 30 seconds. Retrying...',
          ipAddress: '192.168.1.100'
        },
        {
          id: '5',
          timestamp: new Date(now.getTime() - 60 * 60 * 1000).toISOString(),
          level: 'info',
          service: 'Backup',
          message: 'Automated backup completed',
          details: 'Daily backup of user data and course materials completed successfully. Size: 2.3GB',
          ipAddress: '192.168.1.100'
        }
      ];

      // Add more logs based on actual user activities from database
      const { data: recentUsers } = await supabase
        .from('users')
        .select('id, email, created_at')
        .gte('created_at', startTime.toISOString())
        .order('created_at', { ascending: false });

      if (recentUsers) {
        recentUsers.forEach((user, index) => {
          systemLogs.push({
            id: `user-${user.id}`,
            timestamp: user.created_at,
            level: 'success',
            service: 'User Management',
            message: `New user registered: ${user.email}`,
            details: `User account created successfully with email verification pending`,
            userId: user.id,
            ipAddress: `192.168.1.${110 + index}`
          });
        });
      }

      setLogs(systemLogs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()));
    } catch (error) {
      console.error('Error fetching system logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterLogs = () => {
    let filtered = logs;

    if (searchTerm) {
      filtered = filtered.filter(log =>
        log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
        log.service.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (log.details && log.details.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    if (selectedLevel !== 'all') {
      filtered = filtered.filter(log => log.level === selectedLevel);
    }

    if (selectedService !== 'all') {
      filtered = filtered.filter(log => log.service === selectedService);
    }

    setFilteredLogs(filtered);
  };

  const getLevelIcon = (level: string) => {
    switch (level) {
      case 'success': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'warning': return <AlertTriangle className="h-4 w-4 text-yellow-600" />;
      case 'error': return <AlertTriangle className="h-4 w-4 text-red-600" />;
      default: return <Activity className="h-4 w-4 text-blue-600" />;
    }
  };

  const getLevelBadge = (level: string) => {
    const variants = {
      success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400',
      error: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400',
      info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    };
    return variants[level as keyof typeof variants] || variants.info;
  };

  const getServiceIcon = (service: string) => {
    switch (service.toLowerCase()) {
      case 'database': return <Database className="h-4 w-4" />;
      case 'authentication': return <Shield className="h-4 w-4" />;
      case 'storage': case 'backup': return <Server className="h-4 w-4" />;
      default: return <Activity className="h-4 w-4" />;
    }
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

  const exportLogs = () => {
    const csvContent = [
      ['Timestamp', 'Level', 'Service', 'Message', 'Details', 'IP Address'].join(','),
      ...filteredLogs.map(log => [
        log.timestamp,
        log.level,
        log.service,
        `"${log.message}"`,
        `"${log.details || ''}"`,
        log.ipAddress || ''
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `system-logs-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">System Logs</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive system activity and error logs</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportLogs}>
            <Download className="h-4 w-4 mr-2" />
            Export Logs
          </Button>
          <Button onClick={fetchSystemLogs}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
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
                placeholder="Search logs..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedLevel} onValueChange={setSelectedLevel}>
              <SelectTrigger>
                <SelectValue placeholder="Log Level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Levels</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="warning">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedService} onValueChange={setSelectedService}>
              <SelectTrigger>
                <SelectValue placeholder="Service" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Services</SelectItem>
                <SelectItem value="Database">Database</SelectItem>
                <SelectItem value="Authentication">Authentication</SelectItem>
                <SelectItem value="Storage">Storage</SelectItem>
                <SelectItem value="Email">Email</SelectItem>
                <SelectItem value="User Management">User Management</SelectItem>
                <SelectItem value="Backup">Backup</SelectItem>
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

      {/* Log Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Logs</p>
                <p className="text-2xl font-bold">{filteredLogs.length}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Errors</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredLogs.filter(log => log.level === 'error').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Warnings</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredLogs.filter(log => log.level === 'warning').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Success</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredLogs.filter(log => log.level === 'success').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Logs Table */}
      <Card>
        <CardHeader>
          <CardTitle>System Logs ({filteredLogs.length} entries)</CardTitle>
          <CardDescription>
            Showing logs from {selectedTimeRange} • Last updated: {new Date().toLocaleTimeString()}
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
          ) : filteredLogs.length > 0 ? (
            <div className="space-y-4">
              {filteredLogs.map((log) => {
                const timestamp = formatTimestamp(log.timestamp);
                return (
                  <div key={log.id} className="flex items-start space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                    <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
                      {getServiceIcon(log.service)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge className={getLevelBadge(log.level)}>
                            {getLevelIcon(log.level)}
                            <span className="ml-1 capitalize">{log.level}</span>
                          </Badge>
                          <Badge variant="outline">{log.service}</Badge>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          {timestamp.relative}
                        </div>
                      </div>
                      <h4 className="font-medium text-sm mb-1">{log.message}</h4>
                      {log.details && (
                        <p className="text-sm text-muted-foreground mb-2">{log.details}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {timestamp.date} {timestamp.time}
                        </span>
                        {log.ipAddress && (
                          <span>IP: {log.ipAddress}</span>
                        )}
                        {log.userId && (
                          <span>User: {log.userId}</span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <Server className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No logs found</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Try adjusting your filters or time range to see more logs.
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemLogs;
