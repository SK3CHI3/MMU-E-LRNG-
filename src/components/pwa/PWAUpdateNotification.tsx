import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { RefreshCw, X, Download, CheckCircle } from 'lucide-react';
import { usePWA } from './PWAManager';

const PWAUpdateNotification: React.FC = () => {
  const { isOfflineReady, needsRefresh, updateApp, dismissOfflineReady, dismissUpdate } = usePWA();
  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const handleUpdate = async () => {
    if (isUpdating) return;

    setIsUpdating(true);
    setUpdateError(null);

    try {
      console.log('PWA Update: User clicked update button');
      await updateApp();
      // Note: updateApp will reload the page, so we won't reach this point normally
    } catch (error) {
      console.error('PWA Update: Error during update:', error);
      setUpdateError(error instanceof Error ? error.message : 'Update failed');
      setIsUpdating(false);

      // Auto-hide error after 5 seconds
      setTimeout(() => {
        setUpdateError(null);
      }, 5000);
    }
  };

  const handleDismiss = () => {
    if (isUpdating) return;
    dismissUpdate();
  };

  // Show offline ready notification (compact and professional)
  if (isOfflineReady && !needsRefresh) {
    return (
      <div className="fixed top-4 right-4 z-40 animate-in slide-in-from-top-2 duration-300">
        <Card className="border-green-200 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg max-w-xs">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-green-600 rounded-full">
                <CheckCircle className="h-3 w-3 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-green-800 dark:text-green-200 truncate">
                  App Ready for Offline Use
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 truncate">
                  Content cached successfully
                </p>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={dismissOfflineReady}
                className="h-5 w-5 p-0 text-green-600 hover:text-green-800 hover:bg-green-100 dark:text-green-400 dark:hover:text-green-200 dark:hover:bg-green-950/30 shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show update notification (professional and non-intrusive)
  if (needsRefresh) {
    return (
      <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
        <Card className="border-blue-200 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg max-w-sm">
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="p-1.5 bg-blue-600 rounded-full">
                  <RefreshCw className="h-3 w-3 text-white" />
                </div>
                <div className="flex-1 min-w-0">
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
                className="h-5 w-5 p-0 text-blue-600 hover:text-blue-800 hover:bg-blue-100 dark:text-blue-400 dark:hover:text-blue-200 dark:hover:bg-blue-950/30 shrink-0"
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="pt-0 space-y-3">
            <p className="text-xs text-blue-700 dark:text-blue-300 leading-relaxed">
              A new version is available with improvements and bug fixes.
            </p>

            {updateError && (
              <p className="text-xs text-red-600 dark:text-red-400 leading-relaxed">
                Update failed: {updateError}. Please try again.
              </p>
            )}

            <div className="flex gap-2">
              <Button
                size="sm"
                onClick={handleUpdate}
                disabled={isUpdating}
                className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white text-xs h-8"
              >
                <RefreshCw className={`h-3 w-3 mr-1 ${isUpdating ? 'animate-spin' : ''}`} />
                {isUpdating ? 'Updating...' : 'Update Now'}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDismiss}
                disabled={isUpdating}
                className="flex-1 border-blue-200 text-blue-700 hover:bg-blue-50 dark:border-blue-700 dark:text-blue-300 dark:hover:bg-blue-950/30 disabled:opacity-50 text-xs h-8"
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
