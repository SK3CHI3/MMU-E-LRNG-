import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Smartphone, Wifi, WifiOff, RefreshCw, CheckCircle } from 'lucide-react';

const PWAStatus: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isStandalone, setIsStandalone] = useState(false);
  const [updateAvailable, setUpdateAvailable] = useState(false);
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    // Check if app is running in standalone mode
    const checkStandalone = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              (window.navigator as any).standalone ||
                              document.referrer.includes('android-app://');
      setIsStandalone(isStandaloneMode);
      setShowStatus(isStandaloneMode);
    };

    checkStandalone();

    // Listen for online/offline events
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Listen for service worker updates
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        setUpdateAvailable(true);
      });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const handleRefresh = () => {
    window.location.reload();
  };

  if (!showStatus) return null;

  return (
    <div className="fixed top-4 right-4 z-40">
      <Card className="w-64 shadow-lg">
        <CardHeader className="pb-2">
          <div className="flex items-center gap-2">
            <Smartphone className="h-4 w-4 text-blue-600" />
            <CardTitle className="text-sm">PWA Status</CardTitle>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-3">
          {/* Installation Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm">App Installed</span>
            <Badge variant="default" className="bg-green-600">
              <CheckCircle className="h-3 w-3 mr-1" />
              Active
            </Badge>
          </div>

          {/* Network Status */}
          <div className="flex items-center justify-between">
            <span className="text-sm">Network</span>
            <Badge variant={isOnline ? "default" : "destructive"}>
              {isOnline ? (
                <>
                  <Wifi className="h-3 w-3 mr-1" />
                  Online
                </>
              ) : (
                <>
                  <WifiOff className="h-3 w-3 mr-1" />
                  Offline
                </>
              )}
            </Badge>
          </div>

          {/* Update Available */}
          {updateAvailable && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm">Update Available</span>
                <Badge variant="secondary">
                  <RefreshCw className="h-3 w-3 mr-1" />
                  New Version
                </Badge>
              </div>
              <Button
                size="sm"
                onClick={handleRefresh}
                className="w-full"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Update Now
              </Button>
            </div>
          )}

          {/* Offline Capabilities */}
          {!isOnline && (
            <div className="text-xs text-muted-foreground bg-yellow-50 dark:bg-yellow-950/20 p-2 rounded">
              <p>You're offline, but you can still:</p>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>View cached assignments</li>
                <li>Access study materials</li>
                <li>Use offline features</li>
              </ul>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PWAStatus;
