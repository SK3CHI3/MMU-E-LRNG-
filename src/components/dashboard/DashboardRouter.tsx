import { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';

// Dashboard route mapping
const dashboardRoutes: Record<UserRole, string> = {
  student: '/dashboard/student',
  lecturer: '/dashboard/lecturer',
  dean: '/dashboard/dean',
  admin: '/dashboard/admin'
};

export const DashboardRouter: React.FC = () => {
  const { dbUser, isLoading } = useAuth();
  const location = useLocation();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-background">
        <div className="text-center p-6 rounded-lg border border-border shadow-lg">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-lg font-medium">Loading your dashboard...</p>
          <p className="text-muted-foreground mt-2">Determining your role and permissions</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!dbUser) {
    return <Navigate to="/login" replace />;
  }

  console.log('DashboardRouter: User role:', dbUser.role, 'Current path:', location.pathname);
  console.log('DashboardRouter: Available routes:', dashboardRoutes);
  console.log('DashboardRouter: User role type:', typeof dbUser.role);

  // If user is on base dashboard route, redirect to role-specific dashboard
  if (location.pathname === '/dashboard' || location.pathname === '/dashboard/') {
    const roleBasedRoute = dashboardRoutes[dbUser.role as UserRole];
    console.log('DashboardRouter: Redirecting to role-based route:', roleBasedRoute);
    console.log('DashboardRouter: Role lookup result:', dbUser.role, '->', roleBasedRoute);
    return <Navigate to={roleBasedRoute} replace />;
  }

  // If user is trying to access wrong dashboard, redirect to correct one
  const currentPath = location.pathname;
  const userDashboardPath = dashboardRoutes[dbUser.role as UserRole];

  // Check if user is trying to access a different role's dashboard
  const isAccessingWrongDashboard = Object.values(dashboardRoutes).some(route =>
    currentPath.startsWith(route) && route !== userDashboardPath
  );

  if (isAccessingWrongDashboard) {
    console.log('DashboardRouter: User accessing wrong dashboard, redirecting to:', userDashboardPath);
    return <Navigate to={userDashboardPath} replace />;
  }

  // If we reach here, the user is on the correct path
  console.log('DashboardRouter: User is on correct path');
  return null;
};

// Hook to get the correct dashboard path for current user
export const useUserDashboard = () => {
  const { dbUser } = useAuth();

  if (!dbUser) return '/login';

  return dashboardRoutes[dbUser.role as UserRole];
};

// Component to redirect to user's dashboard
export const RedirectToDashboard: React.FC = () => {
  const dashboardPath = useUserDashboard();
  return <Navigate to={dashboardPath} replace />;
};
