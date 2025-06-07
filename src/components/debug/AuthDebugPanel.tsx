import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const AuthDebugPanel = () => {
  const { session, user, dbUser, isLoading } = useAuth();
  const [debugInfo, setDebugInfo] = useState<any>({});
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const checkAuthState = async () => {
      try {
        const { data: { session: currentSession }, error } = await supabase.auth.getSession();
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        
        setDebugInfo({
          timestamp: new Date().toISOString(),
          contextSession: !!session,
          contextUser: !!user,
          contextDbUser: !!dbUser,
          contextIsLoading: isLoading,
          supabaseSession: !!currentSession,
          supabaseUser: !!currentUser,
          sessionUserId: session?.user?.id,
          supabaseUserId: currentUser?.id,
          error: error?.message,
          userAgent: navigator.userAgent,
          url: window.location.href
        });
      } catch (error) {
        console.error('Debug panel error:', error);
        setDebugInfo({
          error: error instanceof Error ? error.message : 'Unknown error',
          timestamp: new Date().toISOString()
        });
      }
    };

    checkAuthState();
    const interval = setInterval(checkAuthState, 2000); // Update every 2 seconds

    return () => clearInterval(interval);
  }, [session, user, dbUser, isLoading]);

  const forceStopLoading = () => {
    console.log('DEBUG: Force stopping loading state');
    // This is a hack to force stop loading - only for debugging
    window.location.reload();
  };

  const clearAuthAndReload = async () => {
    console.log('DEBUG: Clearing auth and reloading');
    await supabase.auth.signOut();
    window.location.reload();
  };

  if (!import.meta.env.DEV) {
    return null; // Only show in development
  }

  return (
    <div className="fixed bottom-4 right-4 z-50">
      <Button
        onClick={() => setIsVisible(!isVisible)}
        variant="outline"
        size="sm"
        className="mb-2"
      >
        {isVisible ? 'Hide' : 'Show'} Auth Debug
      </Button>
      
      {isVisible && (
        <Card className="w-80 max-h-96 overflow-y-auto">
          <CardHeader>
            <CardTitle className="text-sm">Auth Debug Panel</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs space-y-1">
              <div className={`p-2 rounded ${isLoading ? 'bg-yellow-100' : 'bg-green-100'}`}>
                <strong>Loading:</strong> {isLoading ? 'TRUE' : 'FALSE'}
              </div>
              
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div>Context Session: {debugInfo.contextSession ? '✅' : '❌'}</div>
                <div>Context User: {debugInfo.contextUser ? '✅' : '❌'}</div>
                <div>Context DB User: {debugInfo.contextDbUser ? '✅' : '❌'}</div>
                <div>Supabase Session: {debugInfo.supabaseSession ? '✅' : '❌'}</div>
                <div>Supabase User: {debugInfo.supabaseUser ? '✅' : '❌'}</div>
              </div>

              {debugInfo.sessionUserId && (
                <div>
                  <strong>User ID:</strong> {debugInfo.sessionUserId.substring(0, 8)}...
                </div>
              )}

              {debugInfo.error && (
                <div className="bg-red-100 p-2 rounded">
                  <strong>Error:</strong> {debugInfo.error}
                </div>
              )}

              <div className="text-xs text-gray-500">
                Last updated: {debugInfo.timestamp?.substring(11, 19)}
              </div>
            </div>

            <div className="space-y-1">
              <Button
                onClick={forceStopLoading}
                variant="destructive"
                size="sm"
                className="w-full text-xs"
              >
                Force Stop Loading
              </Button>
              <Button
                onClick={clearAuthAndReload}
                variant="outline"
                size="sm"
                className="w-full text-xs"
              >
                Clear Auth & Reload
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default AuthDebugPanel;
