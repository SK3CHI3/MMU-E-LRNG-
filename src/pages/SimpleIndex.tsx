import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

const SimpleIndex = () => {
  const { user, dbUser, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto p-8">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold mb-4">MMU Learning Management System</h1>
          <p className="text-xl text-muted-foreground">Welcome to the MMU LMS</p>
        </div>

        {user ? (
          <div className="mb-8 p-4 border rounded-lg">
            <h2 className="text-2xl font-bold mb-2">Current User</h2>
            <p><strong>Email:</strong> {user.email}</p>
            <p><strong>Name:</strong> {dbUser?.full_name || 'Not available'}</p>
            <p><strong>Role:</strong> {dbUser?.role || 'Not available'}</p>
            <button
              onClick={handleSignOut}
              className="mt-4 px-4 py-2 bg-destructive text-destructive-foreground rounded-md"
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div className="mb-8 p-4 border rounded-lg text-center">
            <p className="mb-4">You are not signed in</p>
            <div className="flex justify-center gap-4">
              <Link
                to="/simple-login"
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md"
              >
                Sign In
              </Link>
              <Link
                to="/simple-register"
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md"
              >
                Register
              </Link>
            </div>
          </div>
        )}

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-bold mb-4">Public Pages</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/" className="text-primary hover:underline">Home</Link>
              </li>
              <li>
                <Link to="/login" className="text-primary hover:underline">Login</Link>
              </li>
              <li>
                <Link to="/simple-login" className="text-primary hover:underline">Simple Login</Link>
              </li>
              <li>
                <Link to="/register" className="text-primary hover:underline">Register</Link>
              </li>
              <li>
                <Link to="/forgot-password" className="text-primary hover:underline">Forgot Password</Link>
              </li>
              <li>
                <Link to="/test" className="text-primary hover:underline">Test Page</Link>
              </li>
            </ul>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-bold mb-4">Dashboard Pages</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/direct-dashboard" className="text-primary hover:underline">Direct Dashboard</Link>
              </li>
              <li>
                <Link to="/dashboard" className="text-primary hover:underline">Protected Dashboard</Link>
              </li>
              <li>
                <Link to="/class-sessions" className="text-primary hover:underline">Class Sessions</Link>
              </li>
              <li>
                <Link to="/assignments" className="text-primary hover:underline">Assignments</Link>
              </li>
              <li>
                <Link to="/grades" className="text-primary hover:underline">Grades</Link>
              </li>
            </ul>
          </div>

          <div className="p-6 border rounded-lg">
            <h2 className="text-xl font-bold mb-4">Other Pages</h2>
            <ul className="space-y-2">
              <li>
                <Link to="/profile" className="text-primary hover:underline">Profile</Link>
              </li>
              <li>
                <Link to="/settings" className="text-primary hover:underline">Settings</Link>
              </li>
              <li>
                <Link to="/support" className="text-primary hover:underline">Support</Link>
              </li>
              <li>
                <Link to="/unauthorized" className="text-primary hover:underline">Unauthorized</Link>
              </li>
              <li>
                <Link to="/non-existent-page" className="text-primary hover:underline">404 Page</Link>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SimpleIndex;
