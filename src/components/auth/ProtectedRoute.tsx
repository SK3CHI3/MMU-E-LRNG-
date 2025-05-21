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
    console.log('ProtectedRoute: Current auth state', {
      isLoading,
      userExists: !!user,
      dbUserExists: !!dbUser,
      userEmail: user?.email,
      dbUserRole: dbUser?.role
    });
  }, [isLoading, user, dbUser]);

  // Show loading spinner while checking authentication
  if (isLoading) {
    console.log('ProtectedRoute: Still loading authentication state');
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
    console.log('ProtectedRoute: No authenticated user, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // If no database user yet, we'll use a minimal user object
  // This allows navigation to proceed without waiting for the full user data
  if (!dbUser) {
    console.log('ProtectedRoute: Auth user exists but no DB user yet, proceeding with minimal data');
    // We'll continue with the route - the AuthContext will load the full user data in the background
  }

  // If roles are specified and user doesn't have the required role, redirect to unauthorized
  if (allowedRoles && dbUser && !allowedRoles.includes(dbUser.role)) {
    console.log('ProtectedRoute: User does not have required role, redirecting to unauthorized');
    return <Navigate to="/unauthorized" replace />;
  }

  console.log('ProtectedRoute: User is authenticated and authorized, rendering content');
  // If authenticated and authorized, render the protected content
  return <Outlet />;
};

export default ProtectedRoute;
