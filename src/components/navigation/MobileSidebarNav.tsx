import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Calendar,
  User,
  Users,
  BarChart3,
  Building,
  Settings,
  FileText,
  GraduationCap,
  HelpCircle,
  LogOut,
  CreditCard,
  Megaphone,
  Brain,
  Library
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';

interface MobileNavItem {
  title: string;
  href: string | ((role: string) => string);
  icon: React.ReactNode;
  roles?: string[];
}

// Function to get role-specific dashboard URL
const getDashboardUrl = (role: string) => {
  switch (role) {
    case 'student': return '/dashboard/student';
    case 'lecturer': return '/dashboard/lecturer';
    case 'dean': return '/dashboard/dean';
    case 'admin': return '/dashboard/admin';
    default: return '/dashboard';
  }
};

// Role-specific mobile navigation items
const getMobileNavItemsForRole = (role: string): MobileNavItem[] => {
  switch (role) {
    case 'student':
      return [
        {
          title: 'Dashboard',
          href: getDashboardUrl,
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          title: 'My Units',
          href: '/courses',
          icon: <BookOpen className="h-5 w-5" />,
        },
        {
          title: 'Messages',
          href: '/messages',
          icon: <MessageSquare className="h-5 w-5" />,
        },
        {
          title: 'Classes',
          href: '/schedule',
          icon: <Calendar className="h-5 w-5" />,
        },
        {
          title: 'Fee',
          href: '/fees',
          icon: <CreditCard className="h-5 w-5" />,
        },
        {
          title: 'Announcements',
          href: '/student/announcements',
          icon: <Megaphone className="h-5 w-5" />,
        },
        {
          title: 'Study AI',
          href: '/study-ai',
          icon: <Brain className="h-5 w-5" />,
        },
        {
          title: 'Resources',
          href: '/resources',
          icon: <Library className="h-5 w-5" />,
        },
        {
          title: 'Assignments',
          href: '/assignments',
          icon: <FileText className="h-5 w-5" />,
        },
        {
          title: 'Grades',
          href: '/grades',
          icon: <GraduationCap className="h-5 w-5" />,
        },
        {
          title: 'Profile',
          href: '/profile',
          icon: <User className="h-5 w-5" />,
        },
        {
          title: 'Help & Support',
          href: '/support',
          icon: <HelpCircle className="h-5 w-5" />,
        },
      ];

    case 'lecturer':
      return [
        {
          title: 'Dashboard',
          href: getDashboardUrl,
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          title: 'My Units',
          href: '/lecturer/courses',
          icon: <BookOpen className="h-5 w-5" />,
        },
        {
          title: 'Students',
          href: '/students',
          icon: <Users className="h-5 w-5" />,
        },
        {
          title: 'Messages',
          href: '/messages',
          icon: <MessageSquare className="h-5 w-5" />,
        },
        {
          title: 'Schedule',
          href: '/schedule',
          icon: <Calendar className="h-5 w-5" />,
        },
        {
          title: 'Assignments',
          href: '/lecturer/assignments',
          icon: <FileText className="h-5 w-5" />,
        },
        {
          title: 'Grades',
          href: '/lecturer/grades',
          icon: <GraduationCap className="h-5 w-5" />,
        },
        {
          title: 'Profile',
          href: '/profile',
          icon: <User className="h-5 w-5" />,
        },
        {
          title: 'Help & Support',
          href: '/support',
          icon: <HelpCircle className="h-5 w-5" />,
        },
      ];

    case 'dean':
      return [
        {
          title: 'Dashboard',
          href: getDashboardUrl,
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          title: 'Faculty Management',
          href: '/faculty',
          icon: <Building className="h-5 w-5" />,
        },
        {
          title: 'Students',
          href: '/dean/students',
          icon: <Users className="h-5 w-5" />,
        },
        {
          title: 'Unit Management',
          href: '/unit-management',
          icon: <BookOpen className="h-5 w-5" />,
        },
        {
          title: 'Messages',
          href: '/messages',
          icon: <MessageSquare className="h-5 w-5" />,
        },
        {
          title: 'Analytics',
          href: '/dean/analytics',
          icon: <BarChart3 className="h-5 w-5" />,
        },
        {
          title: 'Profile',
          href: '/profile',
          icon: <User className="h-5 w-5" />,
        },
        {
          title: 'Help & Support',
          href: '/support',
          icon: <HelpCircle className="h-5 w-5" />,
        },
      ];

    case 'admin':
      return [
        {
          title: 'Dashboard',
          href: getDashboardUrl,
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          title: 'User Management',
          href: '/user-management',
          icon: <Users className="h-5 w-5" />,
        },
        {
          title: 'Analytics',
          href: '/admin/analytics',
          icon: <BarChart3 className="h-5 w-5" />,
        },
        {
          title: 'Messages',
          href: '/messages',
          icon: <MessageSquare className="h-5 w-5" />,
        },
        {
          title: 'Global Settings',
          href: '/global-settings',
          icon: <Settings className="h-5 w-5" />,
        },
        {
          title: 'Profile',
          href: '/profile',
          icon: <User className="h-5 w-5" />,
        },
        {
          title: 'Help & Support',
          href: '/support',
          icon: <HelpCircle className="h-5 w-5" />,
        },
      ];

    default:
      return [
        {
          title: 'Dashboard',
          href: getDashboardUrl,
          icon: <LayoutDashboard className="h-5 w-5" />,
        },
        {
          title: 'Profile',
          href: '/profile',
          icon: <User className="h-5 w-5" />,
        },
        {
          title: 'Help & Support',
          href: '/support',
          icon: <HelpCircle className="h-5 w-5" />,
        },
      ];
  }
};

interface MobileSidebarNavProps {
  onItemClick?: () => void;
}

export function MobileSidebarNav({ onItemClick }: MobileSidebarNavProps) {
  const location = useLocation();
  const { dbUser, logout } = useAuth();

  // Get role-specific navigation items
  const navItems = getMobileNavItemsForRole(dbUser?.role || 'student');

  const handleLogout = () => {
    logout();
    onItemClick?.();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 py-2">
        <nav className="space-y-0.5 px-3">
          {navItems.map((item) => {
            // Get the actual href - if it's a function, call it with user role
            const actualHref = typeof item.href === 'function'
              ? item.href(dbUser?.role || 'student')
              : item.href;

            const isActive = location.pathname === actualHref || 
              (actualHref.includes('/dashboard') && location.pathname.includes('/dashboard'));
            const itemKey = typeof item.href === 'function' ? item.title : item.href;

            return (
              <Link
                key={itemKey}
                to={actualHref}
                onClick={onItemClick}
                className={cn(
                  "flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 mobile-touch-target group relative overflow-hidden",
                  isActive
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg shadow-blue-500/25"
                    : "text-gray-700 dark:text-gray-200 hover:bg-gradient-to-r hover:from-gray-50 hover:to-gray-100 dark:hover:from-gray-800 dark:hover:to-gray-700 hover:shadow-md active:scale-[0.98]"
                )}
              >
                <div className="transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
                  {item.icon}
                </div>
                <span className="font-semibold tracking-wide">{item.title}</span>
                {isActive && (
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-400/20 to-blue-600/20 rounded-xl animate-pulse" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Logout Button */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3.5 rounded-xl transition-all duration-300 mobile-touch-target w-full text-left text-red-600 dark:text-red-400 hover:bg-gradient-to-r hover:from-red-50 hover:to-red-100 dark:hover:from-red-950/50 dark:hover:to-red-900/50 hover:shadow-md active:scale-[0.98] group"
        >
          <div className="transition-transform duration-300 group-hover:scale-110 group-active:scale-95">
            <LogOut className="h-5 w-5" />
          </div>
          <span className="font-semibold tracking-wide">Logout</span>
        </button>
      </div>
    </div>
  );
}
