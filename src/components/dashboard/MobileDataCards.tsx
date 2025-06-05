import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useNavigate } from 'react-router-dom';
import {
  TrendingUp,
  TrendingDown,
  Activity,
  Target,
  Zap,
  BarChart3,
  PieChart,
  Clock,
  BookOpen,
  Award,
  DollarSign,
  Calendar,
  FileText,
  Users,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileDataCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: {
    value: number;
    isPositive: boolean;
    label: string;
  };
  progress?: {
    value: number;
    max: number;
    color?: string;
  };
  icon: React.ReactNode;
  color?: string;
  onClick?: () => void;
  className?: string;
}

interface MobileDataCardsProps {
  studentData: any;
  loading?: boolean;
}

const MobileDataCard: React.FC<MobileDataCardProps> = ({
  title,
  value,
  subtitle,
  trend,
  progress,
  icon,
  color = "blue",
  onClick,
  className
}) => {
  const [isAnimated, setIsAnimated] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsAnimated(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const colorClasses = {
    blue: "bg-blue-50 dark:bg-blue-950/30 border-blue-200 dark:border-blue-800",
    green: "bg-green-50 dark:bg-green-950/30 border-green-200 dark:border-green-800",
    purple: "bg-purple-50 dark:bg-purple-950/30 border-purple-200 dark:border-purple-800",
    orange: "bg-orange-50 dark:bg-orange-950/30 border-orange-200 dark:border-orange-800",
    red: "bg-red-50 dark:bg-red-950/30 border-red-200 dark:border-red-800",
  };

  const iconColorClasses = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    purple: "text-purple-600 dark:text-purple-400",
    orange: "text-orange-600 dark:text-orange-400",
    red: "text-red-600 dark:text-red-400",
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-md active:scale-98 border-0 bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm",
        "rounded-xl p-3 shadow-sm hover:shadow-lg",
        isAnimated ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0",
        className
      )}
      onClick={onClick}
    >
      <div className="flex items-start justify-between mb-2">
        <div className={cn(
          "p-1.5 rounded-lg bg-gradient-to-br shadow-sm",
          color === 'blue' && "from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50",
          color === 'green' && "from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50",
          color === 'purple' && "from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50",
          color === 'orange' && "from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50",
          color === 'red' && "from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50"
        )}>
          <div className={cn("h-4 w-4", iconColorClasses[color as keyof typeof iconColorClasses])}>
            {icon}
          </div>
        </div>
        {trend && (
          <div className={cn(
            "flex items-center gap-1 text-xs font-medium px-1.5 py-0.5 rounded-full",
            trend.isPositive
              ? "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400"
              : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
          )}>
            {trend.isPositive ? (
              <TrendingUp className="h-2.5 w-2.5" />
            ) : (
              <TrendingDown className="h-2.5 w-2.5" />
            )}
            {trend.value}%
          </div>
        )}
      </div>

      <div className="space-y-1">
        <div className="text-xl font-bold tracking-tight leading-none">
          {value}
        </div>

        <p className="text-xs text-muted-foreground font-medium leading-tight">
          {title}
        </p>

        {subtitle && (
          <p className="text-xs text-muted-foreground/80 leading-tight">
            {subtitle}
          </p>
        )}

        {progress && (
          <div className="space-y-1 pt-1">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground/70">Progress</span>
              <span className="font-medium text-xs">
                {Math.round((progress.value / progress.max) * 100)}%
              </span>
            </div>
            <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1">
              <div
                className={cn(
                  "h-1 rounded-full transition-all duration-1000 ease-out",
                  color === 'blue' && "bg-gradient-to-r from-blue-400 to-blue-500",
                  color === 'green' && "bg-gradient-to-r from-green-400 to-green-500",
                  color === 'purple' && "bg-gradient-to-r from-purple-400 to-purple-500",
                  color === 'orange' && "bg-gradient-to-r from-orange-400 to-orange-500",
                  color === 'red' && "bg-gradient-to-r from-red-400 to-red-500"
                )}
                style={{ width: `${Math.round((progress.value / progress.max) * 100)}%` }}
              />
            </div>
          </div>
        )}
      </div>
    </Card>
  );
};

export const MobileDataCards: React.FC<MobileDataCardsProps> = ({
  studentData,
  loading = false
}) => {
  const navigate = useNavigate();

  if (loading) {
    return (
      <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm rounded-xl p-3 shadow-sm">
            <div className="flex items-start justify-between mb-2">
              <div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
            <div className="space-y-1">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  // Calculate dynamic data from student interactions
  const gpaPercentage = studentData?.gpa ? (studentData.gpa / 4.0) * 100 : 0;
  const feePercentage = studentData?.feeRequired > 0
    ? (studentData.feePaid / studentData.feeRequired) * 100
    : 0;
  const unitsProgress = studentData?.totalUnitsRegistered > 0
    ? (studentData.unitsCompleted / studentData.totalUnitsRegistered) * 100
    : 0;

  // Calculate attendance rate from actual data
  const attendanceRate = studentData?.attendanceRate ||
    (studentData?.classesAttended && studentData?.totalClasses
      ? Math.round((studentData.classesAttended / studentData.totalClasses) * 100)
      : 0);

  // Calculate study activity from platform interactions
  const studyActivity = studentData?.studyActivity ||
    (studentData?.weeklyStudyHours
      ? Math.min(100, Math.round((studentData.weeklyStudyHours / 40) * 100))
      : 0);

  // Calculate assignment completion rate
  const totalAssignments = (studentData?.completedAssignments || 0) + (studentData?.pendingAssignments?.length || 0);
  const assignmentCompletionRate = totalAssignments > 0
    ? Math.round(((studentData?.completedAssignments || 0) / totalAssignments) * 100)
    : 0;

  const cards = [
    {
      title: "Current GPA",
      value: studentData?.gpa?.toFixed(2) || "N/A",
      subtitle: studentData?.gpa ? (
        studentData.gpa >= 3.5 ? "Excellent Performance" :
        studentData.gpa >= 3.0 ? "Good Performance" : "Needs Improvement"
      ) : "No grades yet",
      trend: studentData?.gpa ? {
        value: Math.round(gpaPercentage),
        isPositive: studentData.gpa >= 3.0,
        label: "vs 4.0 scale"
      } : undefined,
      progress: studentData?.gpa ? {
        value: studentData.gpa,
        max: 4.0,
        color: "blue"
      } : undefined,
      icon: <Award className="h-5 w-5" />,
      color: "blue",
      onClick: () => navigate('/grades')
    },
    {
      title: "Units Progress",
      value: `${studentData?.unitsCompleted || 0}/${studentData?.totalUnitsRegistered || 0}`,
      subtitle: "Units completed this semester",
      progress: {
        value: studentData?.unitsCompleted || 0,
        max: studentData?.totalUnitsRegistered || 1,
        color: "green"
      },
      icon: <BookOpen className="h-5 w-5" />,
      color: "green",
      onClick: () => navigate('/courses')
    },
    {
      title: "Fee Status",
      value: `${Math.round(feePercentage)}%`,
      subtitle: `KSh ${(studentData?.feePaid || 0).toLocaleString()} paid`,
      progress: {
        value: studentData?.feePaid || 0,
        max: studentData?.feeRequired || 1,
        color: "purple"
      },
      trend: {
        value: Math.round(feePercentage),
        isPositive: feePercentage > 50,
        label: "payment progress"
      },
      icon: <DollarSign className="h-5 w-5" />,
      color: "purple",
      onClick: () => navigate('/fees')
    },
    {
      title: "Study Activity",
      value: `${studyActivity}%`,
      subtitle: `${studentData?.weeklyStudyHours || 0}h this week`,
      trend: {
        value: studentData?.studyActivityTrend || 12,
        isPositive: (studentData?.studyActivityTrend || 12) > 0,
        label: "vs last week"
      },
      icon: <Activity className="h-5 w-5" />,
      color: "orange",
      onClick: () => navigate('/study-ai')
    },
    {
      title: "Assignments",
      value: `${studentData?.pendingAssignments?.length || 0}`,
      subtitle: `${assignmentCompletionRate}% completion rate`,
      progress: {
        value: studentData?.completedAssignments || 0,
        max: totalAssignments || 1,
        color: assignmentCompletionRate >= 80 ? "green" : "orange"
      },
      icon: <FileText className="h-5 w-5" />,
      color: studentData?.pendingAssignments?.length > 3 ? "red" : "green",
      onClick: () => navigate('/assignments')
    },
    {
      title: "Attendance",
      value: `${attendanceRate}%`,
      subtitle: `${studentData?.classesAttended || 0}/${studentData?.totalClasses || 0} classes`,
      trend: {
        value: studentData?.attendanceTrend || 8,
        isPositive: (studentData?.attendanceTrend || 8) > 0,
        label: "this month"
      },
      progress: {
        value: studentData?.classesAttended || 0,
        max: studentData?.totalClasses || 1,
        color: attendanceRate >= 80 ? "green" : attendanceRate >= 60 ? "orange" : "red"
      },
      icon: <CheckCircle className="h-5 w-5" />,
      color: attendanceRate >= 80 ? "green" : attendanceRate >= 60 ? "orange" : "red",
      onClick: () => navigate('/schedule')
    },
    {
      title: "Next Class",
      value: studentData?.upcomingClasses?.[0]?.time || "No classes",
      subtitle: studentData?.upcomingClasses?.[0]?.unit || "Today",
      icon: <Calendar className="h-5 w-5" />,
      color: "blue",
      onClick: () => navigate('/schedule')
    },
    {
      title: "Study Groups",
      value: studentData?.studyGroups?.length || 0,
      subtitle: "Active groups",
      icon: <Users className="h-5 w-5" />,
      color: "indigo",
      onClick: () => navigate('/study-groups')
    }
  ];

  return (
    <div className="grid gap-2.5 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
      {cards.map((card, index) => (
        <MobileDataCard
          key={index}
          {...card}
          className={`delay-${index * 50}`}
        />
      ))}
    </div>
  );
};

export default MobileDataCards;
