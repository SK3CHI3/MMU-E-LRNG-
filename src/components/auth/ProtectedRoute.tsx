import React, { useEffect } from 'react';
import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';

interface ProtectedRouteProps {
  allowedRoles?: string[];
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ allowedRoles }) => {
  const { user, dbUser, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (import.meta.env.DEV) {
      console.log('ProtectedRoute: Current auth state', {
        isLoading,
        userExists: !!user,
        dbUserExists: !!dbUser,
        hasAllowedRoles: !!allowedRoles,
        currentPath: window.location.pathname
      });
    }
  }, [isLoading, user, dbUser, allowedRoles]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    if (import.meta.env.DEV) {
      console.log('ProtectedRoute: Still loading authentication state');
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If not authenticated, redirect to login
  if (!user) {
    if (import.meta.env.DEV) {
      console.log('ProtectedRoute: No authenticated user, redirecting to login');
    }
    return <Navigate to="/login" replace />;
  }

  // If roles are specified but no database user yet, wait for user data to load
  // Give it a bit more time to load the user data before showing unauthorized
  if (allowedRoles && !dbUser) {
    if (import.meta.env.DEV) {
      console.log('ProtectedRoute: Roles required but DB user not loaded yet, showing loading...');
    }
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="text-sm text-muted-foreground">Loading user data...</p>
          <p className="text-xs text-muted-foreground">Please wait while we verify your permissions</p>
        </div>
      </div>
    );
  }

  // If roles are specified and user doesn't have the required role, redirect to unauthorized
  if (allowedRoles && dbUser && !allowedRoles.includes(dbUser.role)) {
    if (import.meta.env.DEV) {
      console.log('ProtectedRoute: User role not in allowed roles, redirecting to unauthorized');
    }
    return <Navigate to="/unauthorized" replace />;
  }

  // If no database user yet but no specific roles required, proceed
  if (!dbUser) {
    if (import.meta.env.DEV) {
      console.log('ProtectedRoute: Auth user exists but no DB user yet, proceeding with minimal data');
    }
  }

  if (import.meta.env.DEV) {
    console.log('ProtectedRoute: User is authenticated and authorized, rendering content');
  }
  // If authenticated and authorized, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;
