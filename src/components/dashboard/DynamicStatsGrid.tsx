import React, { useState, useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  TrendingUp, 
  TrendingDown, 
  Clock, 
  Target, 
  Zap, 
  Award,
  BookOpen,
  Calendar,
  Users,
  Activity,
  BarChart3,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatItem {
  id: string;
  label: string;
  value: string | number;
  change?: {
    value: number;
    isPositive: boolean;
    period: string;
  };
  progress?: {
    current: number;
    total: number;
    color?: string;
  };
  icon: React.ReactNode;
  color: string;
  size: 'small' | 'medium' | 'large';
}

interface DynamicStatsGridProps {
  studentData: any;
  loading?: boolean;
}

const StatCard: React.FC<{
  stat: StatItem;
  index: number;
  onClick?: () => void;
}> = ({ stat, index, onClick }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(true), index * 100);
    return () => clearTimeout(timer);
  }, [index]);

  const sizeClasses = {
    small: "col-span-1 row-span-1",
    medium: "col-span-1 sm:col-span-2 row-span-1",
    large: "col-span-1 sm:col-span-2 lg:col-span-3 row-span-2"
  };

  const colorClasses = {
    blue: "bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50 border-blue-200 dark:border-blue-800",
    green: "bg-gradient-to-br from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50 border-green-200 dark:border-green-800",
    purple: "bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50 border-purple-200 dark:border-purple-800",
    orange: "bg-gradient-to-br from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50 border-orange-200 dark:border-orange-800",
    red: "bg-gradient-to-br from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50 border-red-200 dark:border-red-800",
    indigo: "bg-gradient-to-br from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50 border-indigo-200 dark:border-indigo-800"
  };

  const iconColorClasses = {
    blue: "text-blue-600 dark:text-blue-400",
    green: "text-green-600 dark:text-green-400",
    purple: "text-purple-600 dark:text-purple-400",
    orange: "text-orange-600 dark:text-orange-400",
    red: "text-red-600 dark:text-red-400",
    indigo: "text-indigo-600 dark:text-indigo-400"
  };

  return (
    <Card
      className={cn(
        "cursor-pointer transition-all duration-300 hover:shadow-md active:scale-98 overflow-hidden border-0",
        "bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl shadow-sm",
        sizeClasses[stat.size],
        isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
        isHovered && "scale-102"
      )}
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <CardContent className={cn(
        "p-3 h-full flex flex-col justify-between",
        stat.size === 'large' ? "p-4" : "p-3"
      )}>
        <div className="flex items-start justify-between mb-2">
          <div className={cn(
            "p-1.5 rounded-lg bg-gradient-to-br shadow-sm",
            stat.color === 'blue' && "from-blue-50 to-blue-100 dark:from-blue-950/50 dark:to-blue-900/50",
            stat.color === 'green' && "from-green-50 to-green-100 dark:from-green-950/50 dark:to-green-900/50",
            stat.color === 'purple' && "from-purple-50 to-purple-100 dark:from-purple-950/50 dark:to-purple-900/50",
            stat.color === 'orange' && "from-orange-50 to-orange-100 dark:from-orange-950/50 dark:to-orange-900/50",
            stat.color === 'red' && "from-red-50 to-red-100 dark:from-red-950/50 dark:to-red-900/50",
            stat.color === 'indigo' && "from-indigo-50 to-indigo-100 dark:from-indigo-950/50 dark:to-indigo-900/50",
            iconColorClasses[stat.color as keyof typeof iconColorClasses]
          )}>
            {stat.icon}
          </div>
          {stat.change && (
            <Badge
              variant="secondary"
              className={cn(
                "text-xs font-medium px-1.5 py-0.5 rounded-full",
                stat.change.isPositive
                  ? "bg-green-50 text-green-600 dark:bg-green-950/30 dark:text-green-400"
                  : "bg-red-50 text-red-600 dark:bg-red-950/30 dark:text-red-400"
              )}
            >
              {stat.change.isPositive ? (
                <TrendingUp className="h-2.5 w-2.5 mr-1" />
              ) : (
                <TrendingDown className="h-2.5 w-2.5 mr-1" />
              )}
              {stat.change.value}%
            </Badge>
          )}
        </div>

        <div className="space-y-1">
          <div className={cn(
            "font-bold tracking-tight leading-none",
            stat.size === 'large' ? "text-2xl" : stat.size === 'medium' ? "text-xl" : "text-lg"
          )}>
            {stat.value}
          </div>

          <p className={cn(
            "text-muted-foreground font-medium leading-tight",
            stat.size === 'large' ? "text-sm" : "text-xs"
          )}>
            {stat.label}
          </p>

          {stat.progress && (
            <div className="space-y-1 pt-1">
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground/70">Progress</span>
                <span className="font-medium text-xs">
                  {Math.round((stat.progress.current / stat.progress.total) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-1">
                <div
                  className={cn(
                    "h-1 rounded-full transition-all duration-1000 ease-out",
                    stat.color === 'blue' && "bg-gradient-to-r from-blue-400 to-blue-500",
                    stat.color === 'green' && "bg-gradient-to-r from-green-400 to-green-500",
                    stat.color === 'purple' && "bg-gradient-to-r from-purple-400 to-purple-500",
                    stat.color === 'orange' && "bg-gradient-to-r from-orange-400 to-orange-500",
                    stat.color === 'red' && "bg-gradient-to-r from-red-400 to-red-500",
                    stat.color === 'indigo' && "bg-gradient-to-r from-indigo-400 to-indigo-500"
                  )}
                  style={{ width: `${Math.round((stat.progress.current / stat.progress.total) * 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-muted-foreground/60">
                <span>{stat.progress.current}</span>
                <span>{stat.progress.total}</span>
              </div>
            </div>
          )}

          {stat.change && (
            <p className="text-xs text-muted-foreground/70 leading-tight">
              {stat.change.period}
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export const DynamicStatsGrid: React.FC<DynamicStatsGridProps> = ({ 
  studentData, 
  loading = false 
}) => {
  const [refreshKey, setRefreshKey] = useState(0);

  // Refresh stats every 30 seconds for dynamic feel
  useEffect(() => {
    const interval = setInterval(() => {
      setRefreshKey(prev => prev + 1);
    }, 30000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2.5 auto-rows-fr">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="animate-pulse bg-white/70 dark:bg-gray-900/70 backdrop-blur-sm rounded-xl p-3 shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <div className="h-7 w-7 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
              <div className="h-4 w-8 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
            </div>
            <div className="space-y-1">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
              <div className="h-1 bg-gray-200 dark:bg-gray-700 rounded w-full mt-2"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  const stats: StatItem[] = [
    {
      id: 'gpa',
      label: 'Current GPA',
      value: studentData?.gpa?.toFixed(2) || 'N/A',
      change: {
        value: 5.2,
        isPositive: true,
        period: 'vs last semester'
      },
      progress: studentData?.gpa ? {
        current: studentData.gpa,
        total: 4.0,
        color: 'blue'
      } : undefined,
      icon: <Award className="h-5 w-5" />,
      color: 'blue',
      size: 'medium'
    },
    {
      id: 'units',
      label: 'Units Completed',
      value: `${studentData?.unitsCompleted || 0}/${studentData?.totalUnitsRegistered || 0}`,
      progress: {
        current: studentData?.unitsCompleted || 0,
        total: studentData?.totalUnitsRegistered || 1,
        color: 'green'
      },
      icon: <BookOpen className="h-5 w-5" />,
      color: 'green',
      size: 'small'
    },
    {
      id: 'attendance',
      label: 'Attendance Rate',
      value: '92%',
      change: {
        value: 3.1,
        isPositive: true,
        period: 'this month'
      },
      icon: <CheckCircle className="h-5 w-5" />,
      color: 'green',
      size: 'small'
    },
    {
      id: 'assignments',
      label: 'Pending Tasks',
      value: studentData?.pendingAssignments?.length || 0,
      icon: <Target className="h-5 w-5" />,
      color: (studentData?.pendingAssignments?.length || 0) > 3 ? 'red' : 'green',
      size: 'small'
    },
    {
      id: 'study-time',
      label: 'Study Hours',
      value: '28h',
      change: {
        value: 12,
        isPositive: true,
        period: 'this week'
      },
      icon: <Clock className="h-5 w-5" />,
      color: 'purple',
      size: 'small'
    },
    {
      id: 'performance',
      label: 'Performance Score',
      value: '87%',
      change: {
        value: 8.5,
        isPositive: true,
        period: 'overall improvement'
      },
      progress: {
        current: 87,
        total: 100,
        color: 'indigo'
      },
      icon: <BarChart3 className="h-5 w-5" />,
      color: 'indigo',
      size: 'medium'
    },
    {
      id: 'engagement',
      label: 'Class Engagement',
      value: '94%',
      icon: <Activity className="h-5 w-5" />,
      color: 'orange',
      size: 'small'
    },
    {
      id: 'next-class',
      label: 'Next Class',
      value: studentData?.upcomingClasses?.[0]?.time || 'No classes',
      icon: <Calendar className="h-5 w-5" />,
      color: 'blue',
      size: 'small'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 auto-rows-fr">
      {stats.map((stat, index) => (
        <StatCard
          key={`${stat.id}-${refreshKey}`}
          stat={stat}
          index={index}
          onClick={() => {
            // Handle stat card click - could navigate to detailed view
            if (import.meta.env.DEV) {
              console.log(`Clicked on ${stat.label}`);
            }
          }}
        />
      ))}
    </div>
  );
};

export default DynamicStatsGrid;
