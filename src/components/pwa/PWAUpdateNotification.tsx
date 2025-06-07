import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, X, Download, CheckCircle } from 'lucide-react';

const PWAUpdateNotification: React.FC = () => {
  const [showUpdatePrompt, setShowUpdatePrompt] = useState(false);
  const [offlineReady, setOfflineReady] = useState(false);
  const [needRefresh, setNeedRefresh] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    // Register service worker and listen for updates
    if ('serviceWorker' in navigator && !isRegistering) {
      setIsRegistering(true);

      navigator.serviceWorker.register('/sw.js')
        .then((registration) => {
          if (import.meta.env.DEV) {
            console.log('PWA: Service Worker registered successfully');
          }

          // Show offline ready notification briefly
          setOfflineReady(true);

          // Auto-hide the offline ready notification after 4 seconds
          setTimeout(() => {
            setOfflineReady(false);
          }, 4000);

          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setNeedRefresh(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('PWA: Service Worker registration failed:', error);
        })
        .finally(() => {
          setIsRegistering(false);
        });
    }
  }, [isRegistering]);

  useEffect(() => {
    if (needRefresh) {
      setShowUpdatePrompt(true);
    }
  }, [needRefresh]);

  const handleUpdate = async () => {
    try {
      // Skip waiting and claim clients
      if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
        navigator.serviceWorker.controller.postMessage({ type: 'SKIP_WAITING' });
      }
      window.location.reload();
      setShowUpdatePrompt(false);
      setNeedRefresh(false);
    } catch (error) {
      console.error('Error updating service worker:', error);
    }
  };

  const handleDismiss = () => {
    setShowUpdatePrompt(false);
    setNeedRefresh(false);
  };

  // Show offline ready notification
  if (offlineReady && !needRefresh) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80 animate-in slide-in-from-bottom-2 duration-300">
        <Card className="border-green-200 bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-950/20 dark:to-emerald-950/20 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-600 rounded-full">
                  <CheckCircle className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-green-800 dark:text-green-200">
                    Ready for Offline Use
                  </CardTitle>
                  <CardDescription className="text-xs text-green-600 dark:text-green-300">
                    Content cached and available offline
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOfflineReady(false)}
                className="h-6 w-6 p-0 text-green-600 hover:text-green-800 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-200 dark:hover:bg-green-950/30"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Show update notification
  if (showUpdatePrompt && needRefresh) {
    return (
      <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80 animate-in slide-in-from-bottom-2 duration-300">
        <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 shadow-lg">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-600 rounded-full animate-pulse">
                  <RefreshCw className="h-4 w-4 text-white" />
                </div>
                <div>
                  <CardTitle className="text-sm font-semibold text-blue-800 dark:text-blue-200">
                    Update Available
                  </CardTitle>
                  <CardDescription className="text-xs text-blue-600 dark:text-blue-300">
                    New version ready to install
                  </CardDescription>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleDismiss}
                className="h-6 w-6 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-200 dark:hover:bg-blue-950/30"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0 space-y-3">
            <p className="text-xs text-blue-700 dark:text-blue-300">
              A new version of MMU Digital Campus is available with improvements and bug fixes.
            </p>

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleUpdate}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              >
                <RefreshCw className="h-3 w-3 mr-1" />
                Update Now
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950/30"
              >
                Later
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default PWAUpdateNotification;
