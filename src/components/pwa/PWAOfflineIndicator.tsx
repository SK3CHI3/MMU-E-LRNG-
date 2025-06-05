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
      // Hide the "back online" indicator after 3 seconds
      setTimeout(() => setShowIndicator(false), 3000);
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
    <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50">
      <Badge
        variant={isOnline ? "default" : "destructive"}
        className={`px-3 py-1 shadow-lg transition-all duration-300 ${
          isOnline 
            ? 'bg-green-600 hover:bg-green-700' 
            : 'bg-red-600 hover:bg-red-700 animate-pulse'
        }`}
      >
        {isOnline ? (
          <>
            <Wifi className="h-3 w-3 mr-1" />
            Back Online
          </>
        ) : (
          <>
            <WifiOff className="h-3 w-3 mr-1" />
            You're Offline
          </>
        )}
      </Badge>
    </div>
  );
};

export default PWAOfflineIndicator;
