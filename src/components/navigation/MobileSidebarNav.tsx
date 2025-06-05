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
  Bell,
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
          title: 'Notifications',
          href: '/notifications',
          icon: <Bell className="h-5 w-5" />,
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
      <div className="flex-1 py-4">
        <nav className="space-y-1 px-3">
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
                  "flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200 mobile-touch-target",
                  isActive 
                    ? "bg-primary text-primary-foreground" 
                    : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                )}
              >
                {item.icon}
                <span className="font-medium">{item.title}</span>
              </Link>
            );
          })}
        </nav>
      </div>
      
      {/* Logout Button */}
      <div className="p-3 border-t border-sidebar-border">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-3 py-3 rounded-lg transition-colors duration-200 mobile-touch-target w-full text-left text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
}
