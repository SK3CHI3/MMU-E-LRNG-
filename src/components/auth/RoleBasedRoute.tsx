import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { UserRole } from '@/types/auth';
import { hasPermission } from '@/config/dashboards';

interface RoleBasedRouteProps {
  children: React.ReactNode;
  allowedRoles: UserRole[];
  requiredPermission?: string;
  fallbackPath?: string;
}

export const RoleBasedRoute: React.FC<RoleBasedRouteProps> = ({
  children,
  allowedRoles,
  requiredPermission,
  fallbackPath = '/unauthorized'
}) => {
  const { user, isLoading } = useAuth();

  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  // Check if user role is allowed
  if (!allowedRoles.includes(user.role)) {
    return <Navigate to={fallbackPath} replace />;
  }

  // Check specific permission if required
  if (requiredPermission && !hasPermission(user.role, requiredPermission)) {
    return <Navigate to={fallbackPath} replace />;
  }

  return <>{children}</>;
};

// Higher-order component for role-based access
export const withRoleAccess = (
  Component: React.ComponentType,
  allowedRoles: UserRole[],
  requiredPermission?: string
) => {
  return (props: any) => (
    <RoleBasedRoute allowedRoles={allowedRoles} requiredPermission={requiredPermission}>
      <Component {...props} />
    </RoleBasedRoute>
  );
};

// Individual role guards
export const StudentRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute allowedRoles={['student']}>{children}</RoleBasedRoute>
);

export const LecturerRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute allowedRoles={['lecturer']}>{children}</RoleBasedRoute>
);

export const DeanRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute allowedRoles={['dean']}>{children}</RoleBasedRoute>
);

export const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute allowedRoles={['admin']}>{children}</RoleBasedRoute>
);

// Multi-role guards
export const TeachingStaffRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute allowedRoles={['lecturer', 'dean']}>{children}</RoleBasedRoute>
);

export const ManagementRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute allowedRoles={['dean', 'admin']}>{children}</RoleBasedRoute>
);

export const AllUsersRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <RoleBasedRoute allowedRoles={['student', 'lecturer', 'dean', 'admin']}>{children}</RoleBasedRoute>
);
