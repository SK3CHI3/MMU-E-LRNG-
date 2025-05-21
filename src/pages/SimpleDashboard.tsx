import React from 'react';
import { useAuth } from '@/contexts/AuthContext';

const SimpleDashboard = () => {
  const { user, dbUser, isLoading } = useAuth();

  console.log('SimpleDashboard: Rendering with auth state', { 
    isLoading, 
    userExists: !!user, 
    dbUserExists: !!dbUser,
    userEmail: user?.email,
    dbUserRole: dbUser?.role
  });

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="p-8 border rounded-lg shadow-lg max-w-md w-full text-center">
          <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <h2 className="text-xl font-semibold mb-2">Loading...</h2>
          <p className="text-muted-foreground">Please wait while we load your dashboard</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Simple Dashboard</h1>
        <p className="text-muted-foreground">Welcome to your dashboard</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">User Information</h2>
          <div className="space-y-2">
            <p><strong>Email:</strong> {user?.email || 'Not available'}</p>
            <p><strong>Name:</strong> {dbUser?.full_name || 'Not available'}</p>
            <p><strong>Role:</strong> {dbUser?.role || 'Not available'}</p>
            <p><strong>Department:</strong> {dbUser?.department || 'Not available'}</p>
            {dbUser?.student_id && (
              <p><strong>Student ID:</strong> {dbUser.student_id}</p>
            )}
          </div>
        </div>

        <div className="p-6 border rounded-lg shadow-sm">
          <h2 className="text-xl font-semibold mb-4">Quick Links</h2>
          <div className="space-y-2">
            <a href="/class-sessions" className="block p-3 border rounded-md hover:bg-accent">
              Class Sessions
            </a>
            <a href="/assignments" className="block p-3 border rounded-md hover:bg-accent">
              Assignments
            </a>
            <a href="/grades" className="block p-3 border rounded-md hover:bg-accent">
              Grades
            </a>
            <a href="/profile" className="block p-3 border rounded-md hover:bg-accent">
              Profile
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleDashboard;
