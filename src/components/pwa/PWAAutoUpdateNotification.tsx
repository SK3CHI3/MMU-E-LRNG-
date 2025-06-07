import React from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { RefreshCw, CheckCircle, Download } from 'lucide-react';
import { usePWA } from './PWAManager';

const PWAAutoUpdateNotification: React.FC = () => {
  const { isOfflineReady, isUpdating } = usePWA();

  // Show updating notification
  if (isUpdating) {
    return (
      <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 duration-300">
        <Card className="border-blue-200 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm shadow-lg max-w-xs">
          <CardContent className="p-3">
            <div className="flex items-center gap-3">
              <div className="p-1.5 bg-blue-600 rounded-full">
                <RefreshCw className="h-3 w-3 text-white animate-spin" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium text-blue-800 dark:text-blue-200 truncate">
                  Updating App
                </p>
                <p className="text-xs text-blue-600 dark:text-blue-400 truncate">
                  Installing latest version...
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show offline ready notification (also used for update completion)
  if (isOfflineReady) {
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
                  App Updated
                </p>
                <p className="text-xs text-green-600 dark:text-green-400 truncate">
                  Ready for offline use
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
};

export default PWAAutoUpdateNotification;
