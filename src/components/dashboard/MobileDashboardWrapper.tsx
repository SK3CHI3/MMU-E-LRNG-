import React, { useState, useEffect, useCallback } from 'react';
import { RefreshCw, Wifi, WifiOff } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface MobileDashboardWrapperProps {
  children: React.ReactNode;
  onRefresh?: () => Promise<void>;
  loading?: boolean;
  lastUpdated?: Date;
}

export const MobileDashboardWrapper: React.FC<MobileDashboardWrapperProps> = ({
  children,
  onRefresh,
  loading = false,
  lastUpdated
}) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isPulling, setIsPulling] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [touchStart, setTouchStart] = useState<{ y: number; time: number } | null>(null);

  // Monitor online status
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Pull-to-refresh functionality
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    if (window.scrollY === 0) {
      setTouchStart({
        y: e.touches[0].clientY,
        time: Date.now()
      });
    }
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (!touchStart || window.scrollY > 0) return;

    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStart.y;

    if (distance > 0 && distance < 150) {
      setPullDistance(distance);
      setIsPulling(true);
      
      // Prevent default scrolling when pulling
      if (distance > 10) {
        e.preventDefault();
      }
    }
  }, [touchStart]);

  const handleTouchEnd = useCallback(async () => {
    if (isPulling && pullDistance > 80 && onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
    
    setIsPulling(false);
    setPullDistance(0);
    setTouchStart(null);
  }, [isPulling, pullDistance, onRefresh, isRefreshing]);

  const handleManualRefresh = async () => {
    if (onRefresh && !isRefreshing) {
      setIsRefreshing(true);
      try {
        await onRefresh();
      } catch (error) {
        console.error('Manual refresh failed:', error);
      } finally {
        setIsRefreshing(false);
      }
    }
  };

  const formatLastUpdated = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes}m ago`;
    
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    
    return date.toLocaleDateString();
  };

  return (
    <div className="relative min-h-screen">
      {/* Pull-to-refresh indicator */}
      {isPulling && (
        <div 
          className="fixed top-0 left-0 right-0 z-50 flex items-center justify-center bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm transition-all duration-200"
          style={{ 
            height: `${Math.min(pullDistance, 80)}px`,
            opacity: pullDistance / 80 
          }}
        >
          <div className={cn(
            "flex items-center gap-2 text-sm font-medium transition-all duration-200",
            pullDistance > 80 ? "text-green-600 dark:text-green-400" : "text-gray-600 dark:text-gray-400"
          )}>
            <RefreshCw 
              className={cn(
                "h-4 w-4 transition-transform duration-200",
                pullDistance > 80 && "rotate-180"
              )} 
            />
            {pullDistance > 80 ? "Release to refresh" : "Pull to refresh"}
          </div>
        </div>
      )}

      {/* Status bar */}
      <div className="sticky top-0 z-40 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-800">
        <div className="flex items-center justify-between px-4 py-2">
          <div className="flex items-center gap-2">
            <Badge 
              variant={isOnline ? "default" : "destructive"} 
              className="text-xs"
            >
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
            {lastUpdated && (
              <span className="text-xs text-muted-foreground">
                Updated {formatLastUpdated(lastUpdated)}
              </span>
            )}
          </div>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={handleManualRefresh}
            disabled={isRefreshing || loading}
            className="h-8 w-8 p-0"
          >
            <RefreshCw 
              className={cn(
                "h-4 w-4 transition-transform duration-500",
                (isRefreshing || loading) && "animate-spin"
              )} 
            />
          </Button>
        </div>
      </div>

      {/* Main content */}
      <div 
        className={cn(
          "transition-transform duration-200 ease-out",
          isPulling && `translate-y-[${Math.min(pullDistance / 2, 40)}px]`
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
      >
        {children}
      </div>

      {/* Loading overlay */}
      {(isRefreshing || loading) && (
        <div className="fixed inset-0 z-30 bg-black/10 backdrop-blur-[1px] flex items-center justify-center">
          <div className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-lg flex items-center gap-3">
            <RefreshCw className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium">
              {isRefreshing ? 'Refreshing...' : 'Loading...'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MobileDashboardWrapper;
