import React, { useState, useEffect } from 'react';
import { Badge } from '@/components/ui/badge';
import { Wifi, WifiOff, Cloud, CloudOff } from 'lucide-react';

const PWAOfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [showIndicator, setShowIndicator] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setShowIndicator(true);
      // Hide the "back online" indicator after 4 seconds
      setTimeout(() => setShowIndicator(false), 4000);
    };

    const handleOffline = () => {
      setIsOnline(false);
      setShowIndicator(true);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Show indicator initially if offline
    if (!navigator.onLine) {
      setShowIndicator(true);
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (!showIndicator) return null;

  return (
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 animate-in slide-in-from-top-2 duration-300">
      <Badge
        variant={isOnline ? "default" : "destructive"}
        className={`px-4 py-2 shadow-lg transition-all duration-300 font-medium ${
          isOnline
            ? 'bg-green-600 hover:bg-green-700 text-white'
            : 'bg-red-600 hover:bg-red-700 text-white animate-pulse'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="h-4 w-4 mr-2" />
            Connection Restored
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 mr-2" />
            Working Offline
          </>
        )}
      </Badge>
    </div>
  );
};

export default PWAOfflineIndicator;
