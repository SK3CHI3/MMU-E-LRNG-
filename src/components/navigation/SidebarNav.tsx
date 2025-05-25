import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  FileText,
  GraduationCap,
  Bell,
  Bot,
  FolderArchive,
  DollarSign,
  User,
  Settings,
  HelpCircle,
  Calendar,
  Users,
  BarChart3,
  Building,
  Shield,
  Database,
  UserCheck,
  ClipboardList,
  Award,
  MessageSquare,
  Library,
  CreditCard,
  School,
  UserCog,
  TrendingUp,
  FileBarChart,
  Globe,
  Briefcase
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
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

// Role-specific navigation items
const getNavItemsForRole = (role: string): NavItem[] => {
  const commonItems: NavItem[] = [
    {
      title: 'Dashboard',
      href: getDashboardUrl,
      icon: <LayoutDashboard className="h-4 w-4" />,
    },
    {
      title: 'Profile',
      href: '/profile',
      icon: <User className="h-4 w-4" />,
    },
    {
      title: 'Settings',
      href: '/settings',
      icon: <Settings className="h-4 w-4" />,
    },
    {
      title: 'Support',
      href: '/support',
      icon: <HelpCircle className="h-4 w-4" />,
    },
  ];

  switch (role) {
    case 'student':
      return [
        ...commonItems.slice(0, 1), // Dashboard
        {
          title: 'My Courses',
          href: '/courses',
          icon: <BookOpen className="h-4 w-4" />,
        },
        {
          title: 'Assignments',
          href: '/assignments',
          icon: <FileText className="h-4 w-4" />,
        },
        {
          title: 'Grades',
          href: '/grades',
          icon: <GraduationCap className="h-4 w-4" />,
        },
        {
          title: 'Schedule',
          href: '/schedule',
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          title: 'Library',
          href: '/library',
          icon: <Library className="h-4 w-4" />,
        },
        {
          title: 'Fees & Payments',
          href: '/fees',
          icon: <CreditCard className="h-4 w-4" />,
        },
        {
          title: 'Announcements',
          href: '/announcements',
          icon: <Bell className="h-4 w-4" />,
        },
        {
          title: 'Study AI Assistant',
          href: '/ai-assistant',
          icon: <Bot className="h-4 w-4" />,
        },
        ...commonItems.slice(1), // Profile, Settings, Support
      ];

    case 'lecturer':
      return [
        ...commonItems.slice(0, 1), // Dashboard
        {
          title: 'My Courses',
          href: '/lecturer/courses',
          icon: <School className="h-4 w-4" />,
        },
        {
          title: 'Students',
          href: '/students',
          icon: <Users className="h-4 w-4" />,
        },
        {
          title: 'Assignment Management',
          href: '/lecturer/assignments',
          icon: <ClipboardList className="h-4 w-4" />,
        },
        {
          title: 'Grading',
          href: '/grading',
          icon: <Award className="h-4 w-4" />,
        },
        {
          title: 'Schedule',
          href: '/schedule',
          icon: <Calendar className="h-4 w-4" />,
        },
        {
          title: 'Course Materials',
          href: '/materials',
          icon: <FolderArchive className="h-4 w-4" />,
        },
        {
          title: 'Analytics',
          href: '/analytics',
          icon: <BarChart3 className="h-4 w-4" />,
        },
        {
          title: 'Messages',
          href: '/messages',
          icon: <MessageSquare className="h-4 w-4" />,
        },
        {
          title: 'Teaching AI',
          href: '/teaching-ai',
          icon: <Bot className="h-4 w-4" />,
        },
        ...commonItems.slice(1), // Profile, Settings, Support
      ];

    case 'dean':
      return [
        ...commonItems.slice(0, 1), // Dashboard
        {
          title: 'Faculty Overview',
          href: '/faculty',
          icon: <Building className="h-4 w-4" />,
        },
        {
          title: 'Departments',
          href: '/departments',
          icon: <Briefcase className="h-4 w-4" />,
        },
        {
          title: 'Faculty Staff',
          href: '/staff',
          icon: <UserCheck className="h-4 w-4" />,
        },
        {
          title: 'Students',
          href: '/students',
          icon: <Users className="h-4 w-4" />,
        },
        {
          title: 'Performance',
          href: '/performance',
          icon: <TrendingUp className="h-4 w-4" />,
        },
        {
          title: 'Reports',
          href: '/reports',
          icon: <FileBarChart className="h-4 w-4" />,
        },
        {
          title: 'Budget & Resources',
          href: '/budget',
          icon: <DollarSign className="h-4 w-4" />,
        },
        {
          title: 'Announcements',
          href: '/announcements',
          icon: <Bell className="h-4 w-4" />,
        },
        {
          title: 'Management AI',
          href: '/management-ai',
          icon: <Bot className="h-4 w-4" />,
        },
        ...commonItems.slice(1), // Profile, Settings, Support
      ];

    case 'admin':
      return [
        ...commonItems.slice(0, 1), // Dashboard
        {
          title: 'User Management',
          href: '/users',
          icon: <UserCog className="h-4 w-4" />,
        },
        {
          title: 'System Overview',
          href: '/system',
          icon: <Database className="h-4 w-4" />,
        },
        {
          title: 'Faculties',
          href: '/faculties',
          icon: <Building className="h-4 w-4" />,
        },
        {
          title: 'Security',
          href: '/security',
          icon: <Shield className="h-4 w-4" />,
        },
        {
          title: 'Analytics',
          href: '/analytics',
          icon: <BarChart3 className="h-4 w-4" />,
        },
        {
          title: 'Reports',
          href: '/reports',
          icon: <FileBarChart className="h-4 w-4" />,
        },
        {
          title: 'Global Settings',
          href: '/global-settings',
          icon: <Globe className="h-4 w-4" />,
        },
        {
          title: 'Announcements',
          href: '/announcements',
          icon: <Bell className="h-4 w-4" />,
        },
        {
          title: 'Admin AI',
          href: '/admin-ai',
          icon: <Bot className="h-4 w-4" />,
        },
        ...commonItems.slice(1), // Profile, Settings, Support
      ];

    default:
      return commonItems;
  }
};

// Get role display info
const getRoleInfo = (role: string) => {
  switch (role) {
    case 'student':
      return { label: 'Student Portal', color: 'text-blue-600 dark:text-blue-400' };
    case 'lecturer':
      return { label: 'Lecturer Portal', color: 'text-green-600 dark:text-green-400' };
    case 'dean':
      return { label: 'Dean Portal', color: 'text-purple-600 dark:text-purple-400' };
    case 'admin':
      return { label: 'Admin Portal', color: 'text-red-600 dark:text-red-400' };
    default:
      return { label: 'Portal', color: 'text-gray-600 dark:text-gray-400' };
  }
};

export function SidebarNav() {
  const location = useLocation();
  const { dbUser } = useAuth();

  // Get role-specific navigation items
  const navItems = getNavItemsForRole(dbUser?.role || 'student');
  const roleInfo = getRoleInfo(dbUser?.role || 'student');

  return (
    <div className="space-y-4">
      {/* Role Indicator */}
      <div className="px-3 py-2">
        <div className="flex items-center gap-2">
          <div className={cn("w-2 h-2 rounded-full",
            dbUser?.role === 'student' ? 'bg-blue-500' :
            dbUser?.role === 'lecturer' ? 'bg-green-500' :
            dbUser?.role === 'dean' ? 'bg-purple-500' :
            dbUser?.role === 'admin' ? 'bg-red-500' : 'bg-gray-500'
          )} />
          <span className={cn("text-xs font-medium", roleInfo.color)}>
            {roleInfo.label}
          </span>
        </div>
      </div>

      {/* Navigation Menu */}
      <SidebarMenu>
        {navItems.map((item) => {
          // Get the actual href - if it's a function, call it with user role
          const actualHref = typeof item.href === 'function'
            ? item.href(dbUser?.role || 'student')
            : item.href;

          const isActive = location.pathname === actualHref;
          const itemKey = typeof item.href === 'function' ? item.title : item.href;

          return (
            <SidebarMenuItem key={itemKey}>
              <SidebarMenuButton
                asChild
                className={cn(
                  "transition-colors duration-200",
                  isActive ? "bg-accent text-accent-foreground" : "hover:bg-accent/50"
                )}
              >
                <Link
                  to={actualHref}
                  className={cn(
                    "flex items-center gap-3 px-3 py-2 rounded-md",
                    isActive && "font-medium"
                  )}
                >
                  {item.icon}
                  <span>{item.title}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          );
        })}
      </SidebarMenu>
    </div>
  );
}
