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
  HelpCircle
} from 'lucide-react';
import {
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from '@/components/ui/sidebar';
import { useAuth } from '@/contexts/AuthContext';

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
  roles?: string[];
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: <LayoutDashboard className="h-4 w-4" />,
  },
  {
    title: 'Class Sessions',
    href: '/class-sessions',
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
    title: 'Announcements',
    href: '/announcements',
    icon: <Bell className="h-4 w-4" />,
  },
  {
    title: 'Comrade AI',
    href: '/comrade-ai',
    icon: <Bot className="h-4 w-4" />,
  },
  {
    title: 'Resources',
    href: '/resources',
    icon: <FolderArchive className="h-4 w-4" />,
  },
  {
    title: 'Fees',
    href: '/fees',
    icon: <DollarSign className="h-4 w-4" />,
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

export function SidebarNav() {
  const location = useLocation();
  const { dbUser } = useAuth();

  // Filter nav items based on user role
  const filteredNavItems = navItems.filter(item => {
    // If no roles are specified, show to everyone
    if (!item.roles) return true;

    // Otherwise, check if user has the required role
    return dbUser && item.roles.includes(dbUser.role);
  });

  return (
    <SidebarMenu>
      {filteredNavItems.map((item) => {
        const isActive = location.pathname === item.href;

        return (
          <SidebarMenuItem key={item.href}>
            <SidebarMenuButton
              asChild
              className={isActive ? "bg-accent text-accent-foreground" : ""}
            >
              <Link
                to={item.href}
                className={cn(
                  "flex items-center gap-2",
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
  );
}
