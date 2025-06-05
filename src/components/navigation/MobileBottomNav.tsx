import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  BookOpen,
  MessageSquare,
  Calendar,
  User,
  Bell,
  FileText,
  GraduationCap,
  Users,
  BarChart3,
  Building,
  Settings,
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

// Role-specific mobile navigation items (max 5 items for mobile)
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
          title: 'Classes',
          href: '/schedule',
          icon: <Calendar className="h-5 w-5" />,
        },
        {
          title: 'Assignments',
          href: '/assignments',
          icon: <FileText className="h-5 w-5" />,
        },
        {
          title: 'Study AI',
          href: '/study-ai',
          icon: <Brain className="h-5 w-5" />,
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
          title: 'Classes',
          href: '/schedule',
          icon: <Calendar className="h-5 w-5" />,
        },
        {
          title: 'Assignments',
          href: '/lecturer/assignments',
          icon: <FileText className="h-5 w-5" />,
        },
        {
          title: 'Teaching AI',
          href: '/teaching-ai',
          icon: <Brain className="h-5 w-5" />,
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
          title: 'Faculty',
          href: '/faculty',
          icon: <Building className="h-5 w-5" />,
        },
        {
          title: 'Analytics',
          href: '/analytics',
          icon: <BarChart3 className="h-5 w-5" />,
        },
        {
          title: 'Management AI',
          href: '/management-ai',
          icon: <Brain className="h-5 w-5" />,
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
          title: 'Users',
          href: '/user-management',
          icon: <Users className="h-5 w-5" />,
        },
        {
          title: 'Analytics',
          href: '/admin/analytics',
          icon: <BarChart3 className="h-5 w-5" />,
        },
        {
          title: 'Admin AI',
          href: '/admin-ai',
          icon: <Brain className="h-5 w-5" />,
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
      ];
  }
};

export function MobileBottomNav() {
  const location = useLocation();
  const { dbUser } = useAuth();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Get role-specific navigation items
  const navItems = getMobileNavItemsForRole(dbUser?.role || 'student');

  // Remove the assignment page check that was preventing auto-hide

  // Force navigation to be visible on initial load and component mount
  useEffect(() => {
    setIsVisible(true);
    setLastScrollY(0);
    setIsInitialLoad(true);

    // Force scroll to top immediately
    window.scrollTo(0, 0);

    // Set initial load to false after a delay
    const timer = setTimeout(() => {
      setIsInitialLoad(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  // Handle scroll to show/hide navigation
  useEffect(() => {
    const handleScroll = () => {
      // Don't hide navigation during initial load period
      if (isInitialLoad) {
        setIsVisible(true);
        return;
      }

      const currentScrollY = window.scrollY;

      // Always show nav when at top of page or scrolling up
      if (currentScrollY < lastScrollY || currentScrollY < 50) {
        setIsVisible(true);
      } else if (currentScrollY > lastScrollY && currentScrollY > 150) {
        // Only hide when scrolling down significantly
        setIsVisible(false);
      }

      setLastScrollY(currentScrollY);
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener('scroll', throttledHandleScroll, { passive: true });
    return () => window.removeEventListener('scroll', throttledHandleScroll);
  }, [lastScrollY, isInitialLoad]);

  // Reset navigation visibility when route changes
  useEffect(() => {
    // Immediately show navigation and reset state
    setIsVisible(true);
    setLastScrollY(0);
    setIsInitialLoad(true);

    // Force immediate scroll to top
    window.scrollTo(0, 0);

    // Multiple checks to ensure navigation stays visible
    const timers = [
      setTimeout(() => {
        setIsVisible(true);
        window.scrollTo(0, 0);
      }, 50),
      setTimeout(() => {
        setIsVisible(true);
      }, 200),
      setTimeout(() => {
        setIsVisible(true);
        setIsInitialLoad(false);
      }, 500),
      setTimeout(() => {
        setIsVisible(true);
      }, 1000)
    ];

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [location.pathname]);

  return (
    <div className={cn(
      "fixed bottom-0 left-0 right-0 z-50 transition-transform duration-300 ease-out",
      "flex justify-center items-end",
      // Show/hide based on scroll behavior
      (isVisible || isInitialLoad) ? "translate-y-0" : "translate-y-full"
    )}>
      <div className="safe-area-bottom pb-4 px-4">
        <div className={cn(
          "bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl",
          "border border-gray-200/30 dark:border-slate-700/30",
          "rounded-full shadow-lg shadow-black/8 dark:shadow-black/25",
          "px-2 py-1.5"
        )}>
          <div className="flex items-center justify-center space-x-1">
            {navItems.map((item) => {
              // Get the actual href - if it's a function, call it with user role
              const actualHref = typeof item.href === 'function'
                ? item.href(dbUser?.role || 'student')
                : item.href;

              // Fix the active state detection for assignments
              const isActive = location.pathname === actualHref ||
                (actualHref.includes('/dashboard') && location.pathname.includes('/dashboard')) ||
                (actualHref.includes('/assignments') && location.pathname.includes('/assignments'));
              const itemKey = typeof item.href === 'function' ? item.title : item.href;

              return (
                <Link
                  key={itemKey}
                  to={actualHref}
                  className={cn(
                    "flex flex-col items-center justify-center py-1.5 px-2 rounded-full transition-all duration-200",
                    "min-h-[40px] min-w-[40px] relative group active:scale-95",
                    isActive
                      ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50"
                      : "text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800/50"
                  )}
                >
                  {/* Icon container - compact */}
                  <div className={cn(
                    "flex items-center justify-center transition-all duration-200",
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "group-hover:scale-105 group-active:scale-95"
                  )}>
                    {React.cloneElement(item.icon as React.ReactElement, {
                      className: "w-4 h-4",
                      strokeWidth: isActive ? 2.5 : 2
                    })}
                  </div>

                  {/* Label - very small */}
                  <span className={cn(
                    "text-[8px] mt-0.5 font-medium transition-colors duration-200 text-center leading-none",
                    isActive
                      ? "text-blue-600 dark:text-blue-400"
                      : "text-gray-500 dark:text-gray-500 group-hover:text-gray-700 dark:group-hover:text-gray-300"
                  )}>
                    {item.title}
                  </span>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
