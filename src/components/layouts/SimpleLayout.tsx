import React, { ReactNode } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Link } from 'react-router-dom';
import { ThemeToggle } from '@/components/theme/ThemeToggle';

interface SimpleLayoutProps {
  children: ReactNode;
}

const SimpleLayout = ({ children }: SimpleLayoutProps) => {
  const { user, dbUser, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="border-b bg-background">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <img src="/logo.png" alt="MMU Logo" className="h-8 w-8" />
            <div className="flex flex-col">
              <span className="font-bold leading-none">MMU LMS</span>
              <span className="text-xs text-muted-foreground">Learning Portal</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <ThemeToggle />
            
            {user ? (
              <div className="flex items-center gap-4">
                <span className="text-sm hidden md:inline-block">
                  {dbUser?.full_name || user.email}
                </span>
                <button 
                  onClick={handleSignOut}
                  className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link 
                to="/login"
                className="text-sm px-3 py-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>
      
      {/* Sidebar and Main Content */}
      <div className="flex flex-1">
        {/* Simple Sidebar */}
        {user && (
          <aside className="w-64 border-r bg-background hidden md:block">
            <nav className="p-4 space-y-1">
              <Link to="/direct-dashboard" className="block p-2 rounded-md hover:bg-accent">Dashboard</Link>
              <Link to="/class-sessions" className="block p-2 rounded-md hover:bg-accent">Class Sessions</Link>
              <Link to="/assignments" className="block p-2 rounded-md hover:bg-accent">Assignments</Link>
              <Link to="/grades" className="block p-2 rounded-md hover:bg-accent">Grades</Link>
              <Link to="/announcements" className="block p-2 rounded-md hover:bg-accent">Announcements</Link>
              <Link to="/profile" className="block p-2 rounded-md hover:bg-accent">Profile</Link>
              <Link to="/settings" className="block p-2 rounded-md hover:bg-accent">Settings</Link>
            </nav>
          </aside>
        )}
        
        {/* Main Content */}
        <main className="flex-1 p-4">
          {children}
        </main>
      </div>
    </div>
  );
};

export default SimpleLayout;
