import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { 
  TrendingUp, 
  Calendar, 
  Clock, 
  Target,
  ChevronRight,
  BarChart3,
  PieChart as PieChartIcon,
  Activity
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileChartWidgetsProps {
  studentData: any;
  loading?: boolean;
}

const COLORS = {
  primary: '#3b82f6',
  secondary: '#10b981',
  accent: '#8b5cf6',
  warning: '#f59e0b',
  danger: '#ef4444',
  muted: '#6b7280'
};

const CHART_COLORS = [COLORS.primary, COLORS.secondary, COLORS.accent, COLORS.warning, COLORS.danger];

// Generate dynamic data based on student interactions and platform usage
const generateGPATrendData = (studentData: any) => {
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const currentGPA = studentData?.gpa || 0;

  // Use actual GPA history if available, otherwise simulate based on current performance
  if (studentData?.gpaHistory && studentData.gpaHistory.length > 0) {
    return studentData.gpaHistory.map((entry: any, index: number) => ({
      month: months[index] || `Month ${index + 1}`,
      gpa: entry.gpa,
      target: 3.5
    }));
  }

  // Generate realistic trend based on current GPA and performance indicators
  const performanceTrend = studentData?.performanceTrend || 0;
  return months.map((month, index) => {
    const baseGPA = Math.max(0, currentGPA - (months.length - index - 1) * 0.1);
    const trendAdjustment = (performanceTrend / 100) * 0.5;
    return {
      month,
      gpa: Math.max(0, Math.min(4.0, baseGPA + trendAdjustment)),
      target: 3.5
    };
  });
};

const generateStudyTimeData = (studentData: any) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  // Use actual study time data if available from platform interactions
  if (studentData?.weeklyStudyData && studentData.weeklyStudyData.length === 7) {
    return days.map((day, index) => ({
      day,
      hours: studentData.weeklyStudyData[index] || 0,
      target: 6
    }));
  }

  // Generate based on total weekly study hours and platform activity
  const totalWeeklyHours = studentData?.weeklyStudyHours || 0;
  const avgDailyHours = totalWeeklyHours / 7;
  const activityPattern = studentData?.studyPattern || [0.8, 1.2, 1.0, 1.1, 0.9, 0.6, 0.4]; // Weekday vs weekend pattern

  return days.map((day, index) => ({
    day,
    hours: Math.round(avgDailyHours * activityPattern[index] * 10) / 10,
    target: 6
  }));
};

const generateAssignmentData = (studentData: any) => {
  const completed = studentData?.completedAssignments || 0;
  const pending = studentData?.pendingAssignments?.length || 0;
  const overdue = studentData?.overdueAssignments || 0;

  return [
    { name: 'Completed', value: completed, color: COLORS.secondary },
    { name: 'Pending', value: pending, color: COLORS.warning },
    { name: 'Overdue', value: overdue, color: COLORS.danger }
  ];
};

const generateCourseProgressData = (studentData: any) => {
  // Use actual enrolled courses if available
  if (studentData?.enrolledCourses && Array.isArray(studentData.enrolledCourses)) {
    return studentData.enrolledCourses.map((course: any) => ({
      course: course.name || course.code || 'Unknown Course',
      progress: course.progress || 0,
      grade: course.currentGrade || 0
    }));
  }

  // Fallback to basic course structure based on student data
  const courseCount = studentData?.currentSemesterUnits || 5;
  const avgProgress = studentData?.overallProgress || 70;
  const avgGrade = studentData?.gpa ? (studentData.gpa / 4.0) * 100 : 75;

  return Array.from({ length: Math.min(courseCount, 6) }, (_, index) => ({
    course: `Course ${index + 1}`,
    progress: Math.max(0, Math.min(100, avgProgress + (Math.random() - 0.5) * 20)),
    grade: Math.max(0, Math.min(100, avgGrade + (Math.random() - 0.5) * 15))
  }));
};

const MobileChart: React.FC<{
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}> = ({ title, subtitle, children, action, className }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), 200);
    return () => clearTimeout(timer);
  }, []);

  return (
    <Card className={cn(
      "mobile-card transition-all duration-700 hover:shadow-lg",
      isVisible ? "translate-y-0 opacity-100" : "translate-y-8 opacity-0",
      className
    )}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-base font-semibold">{title}</CardTitle>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>
            )}
          </div>
          {action}
        </div>
      </CardHeader>
      <CardContent className="pt-0">
        {children}
      </CardContent>
    </Card>
  );
};

export const MobileChartWidgets: React.FC<MobileChartWidgetsProps> = ({ 
  studentData, 
  loading = false 
}) => {
  const [activeChart, setActiveChart] = useState<string | null>(null);

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="mobile-card animate-pulse">
            <CardHeader>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-48 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const gpaData = generateGPATrendData(studentData);
  const studyTimeData = generateStudyTimeData(studentData);
  const assignmentData = generateAssignmentData(studentData);
  const courseProgressData = generateCourseProgressData(studentData);

  // Calculate dynamic metrics from platform interactions
  const totalStudyHours = studyTimeData.reduce((sum, day) => sum + day.hours, 0);
  const avgDailyStudyHours = totalStudyHours / 7;
  const studyGoalProgress = Math.min(100, (avgDailyStudyHours / 6) * 100);
  const weeklyTrend = studentData?.weeklyStudyTrend ||
    (avgDailyStudyHours > (studentData?.lastWeekAvgHours || 5) ? 15 : -5);

  return (
    <div className="space-y-4">
      {/* Activity/Heartbeat Charts - Prioritized at the top */}

      {/* Study Time Activity Chart */}
      <MobileChart
        title="Study Activity Heartbeat"
        subtitle="Your daily study engagement this week"
        action={
          <Badge variant="secondary" className="text-xs">
            <Activity className="h-3 w-3 mr-1" />
            Live
          </Badge>
        }
      >
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={studyTimeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="day"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Bar
                dataKey="hours"
                fill={COLORS.secondary}
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between mt-2">
          <Badge variant="outline" className="text-xs">
            Avg: {avgDailyStudyHours.toFixed(1)}h/day
          </Badge>
          <Badge variant={weeklyTrend > 0 ? "secondary" : "destructive"} className="text-xs">
            {weeklyTrend > 0 ? '+' : ''}{weeklyTrend}% vs last week
          </Badge>
        </div>
      </MobileChart>

      {/* GPA Performance Trend */}
      <MobileChart
        title="Academic Performance"
        subtitle="GPA trend and momentum over time"
        action={
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
            <ChevronRight className="h-4 w-4" />
          </Button>
        }
      >
        <div className="h-48">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={gpaData}>
              <defs>
                <linearGradient id="gpaGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={COLORS.primary} stopOpacity={0.3}/>
                  <stop offset="95%" stopColor={COLORS.primary} stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <YAxis
                domain={[0, 4]}
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: '#6b7280' }}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: 'white',
                  border: '1px solid #e5e7eb',
                  borderRadius: '8px',
                  fontSize: '12px'
                }}
              />
              <Area
                type="monotone"
                dataKey="gpa"
                stroke={COLORS.primary}
                strokeWidth={2}
                fill="url(#gpaGradient)"
              />
              <Line
                type="monotone"
                dataKey="target"
                stroke={COLORS.muted}
                strokeDasharray="5 5"
                strokeWidth={1}
                dot={false}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="flex items-center justify-between mt-2">
          <Badge variant="secondary" className="text-xs">
            Current: {studentData?.gpa?.toFixed(2) || 'N/A'}
          </Badge>
          <Badge variant="outline" className="text-xs">
            Target: 3.50
          </Badge>
        </div>
      </MobileChart>


    </div>
  );
};

export default MobileChartWidgets;
