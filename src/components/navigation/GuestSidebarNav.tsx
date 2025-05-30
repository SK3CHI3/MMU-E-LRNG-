import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  Home, 
  BookOpen, 
  FileText, 
  GraduationCap, 
  Calendar, 
  Library, 
  CreditCard, 
  Bell, 
  MessageSquare, 
  Brain,
  Settings,
  User,
  HelpCircle,
  Lock
} from 'lucide-react';
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';

const guestNavItems = [
  {
    title: 'Dashboard',
    href: '/guest-portal/dashboard',
    icon: <Home className="h-4 w-4" />,
    enabled: true,
  },
  {
    title: 'My Units',
    href: '/guest-portal/courses',
    icon: <BookOpen className="h-4 w-4" />,
    enabled: true,
  },
  {
    title: 'Assignments',
    href: '/guest-portal/assignments',
    icon: <FileText className="h-4 w-4" />,
    enabled: true,
  },
  {
    title: 'Grades',
    href: '/guest-portal/grades',
    icon: <GraduationCap className="h-4 w-4" />,
    enabled: true,
  },
  {
    title: 'Classes',
    href: '/guest-portal/schedule',
    icon: <Calendar className="h-4 w-4" />,
    enabled: true,
  },
  {
    title: 'Resources',
    href: '/guest-portal/resources',
    icon: <Library className="h-4 w-4" />,
    enabled: true,
  },
  {
    title: 'Fees & Payments',
    href: '/guest-portal/fees',
    icon: <CreditCard className="h-4 w-4" />,
    enabled: true,
  },
  {
    title: 'Announcements',
    href: '/guest-portal/announcements',
    icon: <Bell className="h-4 w-4" />,
    enabled: true,
  },
  {
    title: 'Study AI Assistant',
    href: '/guest-portal/study-ai',
    icon: <Brain className="h-4 w-4" />,
    enabled: true,
  },
  {
    title: 'Messages',
    href: '/guest-portal/messages',
    icon: <MessageSquare className="h-4 w-4" />,
    enabled: true,
  },
];

const guestSharedItems = [
  {
    title: 'Profile',
    href: '#',
    icon: <User className="h-4 w-4" />,
    enabled: false,
  },
  {
    title: 'Settings',
    href: '#',
    icon: <Settings className="h-4 w-4" />,
    enabled: false,
  },
  {
    title: 'Support',
    href: '#',
    icon: <HelpCircle className="h-4 w-4" />,
    enabled: false,
  },
];

export const GuestSidebarNav = () => {
  const location = useLocation();

  return (
    <div className="space-y-4">
      <SidebarGroup>
        <SidebarGroupLabel>Student Portal</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {guestNavItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  asChild={item.enabled}
                  className={cn(
                    "w-full justify-start",
                    location.pathname === item.href && "bg-accent text-accent-foreground",
                    !item.enabled && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {item.enabled ? (
                    <Link to={item.href} className="flex items-center gap-2">
                      {item.icon}
                      <span>{item.title}</span>
                    </Link>
                  ) : (
                    <div className="flex items-center gap-2 w-full">
                      {item.icon}
                      <span>{item.title}</span>
                      <Lock className="h-3 w-3 ml-auto" />
                    </div>
                  )}
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>

      <SidebarGroup>
        <SidebarGroupLabel>Account</SidebarGroupLabel>
        <SidebarGroupContent>
          <SidebarMenu>
            {guestSharedItems.map((item) => (
              <SidebarMenuItem key={item.href}>
                <SidebarMenuButton
                  className="w-full justify-start opacity-50 cursor-not-allowed"
                >
                  <div className="flex items-center gap-2 w-full">
                    {item.icon}
                    <span>{item.title}</span>
                    <Lock className="h-3 w-3 ml-auto" />
                  </div>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </SidebarGroupContent>
      </SidebarGroup>
    </div>
  );
};
