import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';
import { chartColors, defaultChartOptions, formatActivityData, generateColorArray } from '@/utils/chartUtils';
import { supabase } from '@/lib/supabaseClient';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface DashboardAnalyticsProps {
  userId?: string;
  courseId?: string;
  role: 'student' | 'lecturer' | 'admin';
}

const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ userId, courseId, role }) => {
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('month');
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');

  useEffect(() => {
    const fetchAnalytics = async () => {
      setLoading(true);
      try {
        // Determine the type of analytics to fetch based on role and active tab
        let type = 'overview';
        if (role === 'student' && userId) {
          type = 'student';
        } else if (role === 'lecturer' && courseId && activeTab === 'course') {
          type = 'course';
        } else if (role === 'admin' && activeTab === 'system') {
          type = 'overview';
        }

        // Call the Supabase Edge Function to get analytics data
        const { data, error } = await supabase.functions.invoke('generate-analytics', {
          body: {
            userId: type === 'student' ? userId : undefined,
            courseId: type === 'course' ? courseId : undefined,
            type,
            timeRange
          }
        });

        if (error) {
          console.error('Error fetching analytics:', error);
          return;
        }

        setAnalyticsData(data);
      } catch (error) {
        console.error('Error in analytics fetch:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [userId, courseId, role, timeRange, activeTab]);

  // Render activity chart
  const renderActivityChart = () => {
    if (!analyticsData || !analyticsData.activityData || analyticsData.activityData.length === 0) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No activity data available</p>
        </div>
      );
    }

    const chartData = formatActivityData(analyticsData.activityData, timeRange);
    
    return (
      <div className="h-80">
        <Line 
          data={chartData} 
          options={{
            ...defaultChartOptions,
            plugins: {
              ...defaultChartOptions.plugins,
              title: {
                display: true,
                text: 'Activity Over Time',
                font: {
                  size: 16,
                  weight: 'bold'
                }
              }
            }
          }} 
        />
      </div>
    );
  };

  // Render grade distribution chart
  const renderGradeDistribution = () => {
    if (!analyticsData || !analyticsData.courseStats || !analyticsData.courseStats.grade_distribution) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No grade data available</p>
        </div>
      );
    }

    const gradeData = analyticsData.courseStats.grade_distribution;
    
    const data = {
      labels: gradeData.map((item: any) => item.range),
      datasets: [
        {
          label: 'Number of Students',
          data: gradeData.map((item: any) => item.count),
          backgroundColor: generateColorArray(gradeData.length),
          borderWidth: 1
        }
      ]
    };

    return (
      <div className="h-80">
        <Bar 
          data={data} 
          options={{
            ...defaultChartOptions,
            plugins: {
              ...defaultChartOptions.plugins,
              title: {
                display: true,
                text: 'Grade Distribution',
                font: {
                  size: 16,
                  weight: 'bold'
                }
              }
            }
          }} 
        />
      </div>
    );
  };

  // Render enrollment stats chart
  const renderEnrollmentStats = () => {
    if (!analyticsData || !analyticsData.courseStats || !analyticsData.courseStats.enrollment_stats) {
      return (
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No enrollment data available</p>
        </div>
      );
    }

    const enrollmentStats = analyticsData.courseStats.enrollment_stats;
    
    const data = {
      labels: ['Enrolled', 'Completed', 'Dropped'],
      datasets: [
        {
          data: [
            enrollmentStats.enrolled,
            enrollmentStats.completed,
            enrollmentStats.dropped
          ],
          backgroundColor: [
            chartColors.primary,
            chartColors.success,
            chartColors.danger
          ],
          borderWidth: 1
        }
      ]
    };

    return (
      <div className="h-64">
        <Doughnut 
          data={data} 
          options={{
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'right',
                labels: {
                  font: {
                    family: "'Inter', sans-serif",
                    size: 12
                  },
                  usePointStyle: true,
                  padding: 20
                }
              },
              title: {
                display: true,
                text: 'Enrollment Status',
                font: {
                  size: 16,
                  weight: 'bold'
                }
              }
            },
            cutout: '70%'
          }} 
        />
      </div>
    );
  };

  // Render loading skeletons
  if (loading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Skeleton className="h-80 w-full" />
          <Skeleton className="h-80 w-full" />
        </div>
        <Skeleton className="h-80 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <Tabs defaultValue={activeTab} onValueChange={setActiveTab} className="w-full sm:w-auto">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            {role === 'lecturer' && <TabsTrigger value="course">Course</TabsTrigger>}
            {role === 'admin' && <TabsTrigger value="system">System</TabsTrigger>}
          </TabsList>
        </Tabs>
        
        <Select value={timeRange} onValueChange={setTimeRange}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="week">Last 7 days</SelectItem>
            <SelectItem value="month">Last 30 days</SelectItem>
            <SelectItem value="semester">This Semester</SelectItem>
            <SelectItem value="year">This Year</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Students</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.courseStats?.enrollment_stats?.total || 0}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {analyticsData?.courseStats?.enrollment_stats?.enrolled || 0} currently enrolled
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Average Grade</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.courseStats?.average_grade?.toFixed(1) || 'N/A'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Out of 100 points
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {analyticsData?.assignmentStats ? 
                `${(analyticsData.assignmentStats.reduce((acc: number, curr: any) => 
                  acc + curr.completion_rate, 0) / analyticsData.assignmentStats.length).toFixed(1)}%` : 
                'N/A'
              }
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Average assignment completion
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Activity Overview</CardTitle>
            <CardDescription>
              Student activity over the selected time period
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderActivityChart()}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Grade Distribution</CardTitle>
            <CardDescription>
              Distribution of grades across assignments
            </CardDescription>
          </CardHeader>
          <CardContent>
            {renderGradeDistribution()}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enrollment Statistics</CardTitle>
          <CardDescription>
            Current enrollment status for the course
          </CardDescription>
        </CardHeader>
        <CardContent>
          {renderEnrollmentStats()}
        </CardContent>
      </Card>
    </div>
  );
};

export default DashboardAnalytics;
