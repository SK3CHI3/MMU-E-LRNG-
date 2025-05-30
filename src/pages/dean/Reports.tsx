import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  FileBarChart, 
  Download, 
  Calendar, 
  Users, 
  BookOpen, 
  TrendingUp,
  FileText,
  BarChart3,
  PieChart,
  Activity,
  Clock,
  CheckCircle
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getDeanStats } from '@/services/deanService';

interface ReportItem {
  id: string;
  title: string;
  description: string;
  type: 'academic' | 'financial' | 'performance' | 'compliance';
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annual';
  lastGenerated: string;
  status: 'ready' | 'generating' | 'scheduled';
  icon: React.ReactNode;
}

const Reports = () => {
  const { dbUser } = useAuth();
  const [selectedPeriod, setSelectedPeriod] = useState('current');
  const [selectedType, setSelectedType] = useState('all');
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalLecturers: 0,
    totalCourses: 0,
    graduationRate: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      if (!dbUser?.faculty) return;
      
      try {
        setLoading(true);
        const deanStats = await getDeanStats(dbUser.faculty);
        setStats(deanStats);
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dbUser?.faculty]);

  const reports: ReportItem[] = [
    {
      id: 'enrollment-report',
      title: 'Student Enrollment Report',
      description: 'Comprehensive analysis of student enrollment trends and demographics',
      type: 'academic',
      frequency: 'monthly',
      lastGenerated: '2024-01-15',
      status: 'ready',
      icon: <Users className="h-5 w-5" />
    },
    {
      id: 'academic-performance',
      title: 'Academic Performance Analysis',
      description: 'Faculty-wide academic performance metrics and grade distributions',
      type: 'academic',
      frequency: 'quarterly',
      lastGenerated: '2024-01-10',
      status: 'ready',
      icon: <TrendingUp className="h-5 w-5" />
    },
    {
      id: 'course-completion',
      title: 'Course Completion Report',
      description: 'Analysis of course completion rates and student progression',
      type: 'academic',
      frequency: 'monthly',
      lastGenerated: '2024-01-12',
      status: 'ready',
      icon: <BookOpen className="h-5 w-5" />
    },
    {
      id: 'faculty-utilization',
      title: 'Faculty Utilization Report',
      description: 'Teaching load distribution and faculty resource allocation',
      type: 'performance',
      frequency: 'monthly',
      lastGenerated: '2024-01-08',
      status: 'ready',
      icon: <BarChart3 className="h-5 w-5" />
    },
    {
      id: 'graduation-analytics',
      title: 'Graduation Analytics',
      description: 'Graduation rates, time-to-degree, and employment outcomes',
      type: 'academic',
      frequency: 'annual',
      lastGenerated: '2023-12-20',
      status: 'ready',
      icon: <Activity className="h-5 w-5" />
    },
    {
      id: 'research-output',
      title: 'Research Output Report',
      description: 'Faculty research publications, grants, and collaboration metrics',
      type: 'performance',
      frequency: 'quarterly',
      lastGenerated: '2024-01-05',
      status: 'ready',
      icon: <FileText className="h-5 w-5" />
    },
    {
      id: 'compliance-report',
      title: 'Regulatory Compliance Report',
      description: 'Compliance with academic standards and regulatory requirements',
      type: 'compliance',
      frequency: 'quarterly',
      lastGenerated: '2024-01-01',
      status: 'scheduled',
      icon: <CheckCircle className="h-5 w-5" />
    },
    {
      id: 'resource-allocation',
      title: 'Resource Allocation Analysis',
      description: 'Analysis of resource distribution and utilization efficiency',
      type: 'performance',
      frequency: 'monthly',
      lastGenerated: '2024-01-14',
      status: 'generating',
      icon: <PieChart className="h-5 w-5" />
    }
  ];

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'academic':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'financial':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'performance':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'compliance':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'ready':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'generating':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      case 'scheduled':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const filteredReports = reports.filter(report => {
    if (selectedType !== 'all' && report.type !== selectedType) return false;
    return true;
  });

  const handleGenerateReport = (reportId: string) => {
    console.log(`Generating report: ${reportId}`);
    // Here you would implement the actual report generation logic
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-32 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Faculty Reports</h1>
          <p className="text-gray-600 dark:text-gray-400">Generate and manage reports for {dbUser?.faculty}</p>
        </div>
        <Button>
          <FileBarChart className="h-4 w-4 mr-2" />
          Custom Report
        </Button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Faculty Staff</p>
                <p className="text-2xl font-bold text-green-600">{stats.totalLecturers}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Courses</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalCourses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Graduation Rate</p>
                <p className="text-2xl font-bold text-orange-600">{stats.graduationRate}%</p>
              </div>
              <TrendingUp className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select period" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="current">Current Period</SelectItem>
                <SelectItem value="last-month">Last Month</SelectItem>
                <SelectItem value="last-quarter">Last Quarter</SelectItem>
                <SelectItem value="last-year">Last Year</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedType} onValueChange={setSelectedType}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="academic">Academic</SelectItem>
                <SelectItem value="performance">Performance</SelectItem>
                <SelectItem value="compliance">Compliance</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Reports Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredReports.map((report) => (
          <Card key={report.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-800 rounded-lg">
                    {report.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{report.title}</CardTitle>
                    <CardDescription className="mt-1">{report.description}</CardDescription>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Badge className={getTypeColor(report.type)}>
                    {report.type}
                  </Badge>
                  <Badge className={getStatusColor(report.status)}>
                    {report.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4" />
                  <span>Frequency: {report.frequency}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Last: {report.lastGenerated}</span>
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button 
                  size="sm" 
                  onClick={() => handleGenerateReport(report.id)}
                  disabled={report.status === 'generating'}
                >
                  <Download className="h-4 w-4 mr-2" />
                  {report.status === 'generating' ? 'Generating...' : 'Download'}
                </Button>
                <Button size="sm" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Preview
                </Button>
                <Button size="sm" variant="outline">
                  <Calendar className="h-4 w-4 mr-2" />
                  Schedule
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Report Actions</CardTitle>
          <CardDescription>Generate commonly requested reports instantly</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button variant="outline" className="h-20 flex-col">
              <Users className="h-6 w-6 mb-2" />
              <span>Student Summary</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <TrendingUp className="h-6 w-6 mb-2" />
              <span>Performance Dashboard</span>
            </Button>
            <Button variant="outline" className="h-20 flex-col">
              <FileBarChart className="h-6 w-6 mb-2" />
              <span>Executive Summary</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Reports;
