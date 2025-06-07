import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface PWAContextType {
  isOfflineReady: boolean;
  needsRefresh: boolean;
  isOnline: boolean;
  dismissOfflineReady: () => void;
  dismissUpdate: () => void;
  updateApp: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

interface PWAProviderProps {
  children: ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);

  useEffect(() => {
    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Register service worker
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then((reg) => {
          setRegistration(reg);
          
          if (import.meta.env.DEV) {
            console.log('PWA: Service Worker registered');
          }

          // Show offline ready notification
          setIsOfflineReady(true);
          
          // Auto-dismiss after 5 seconds
          setTimeout(() => {
            setIsOfflineReady(false);
          }, 5000);

          // Listen for updates
          reg.addEventListener('updatefound', () => {
            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  setNeedsRefresh(true);
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('PWA: Service Worker registration failed:', error);
        });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const dismissOfflineReady = () => {
    setIsOfflineReady(false);
  };

  const dismissUpdate = () => {
    setNeedsRefresh(false);
  };

  const updateApp = async () => {
    if (registration && registration.waiting) {
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });
      window.location.reload();
    }
  };

  const value: PWAContextType = {
    isOfflineReady,
    needsRefresh,
    isOnline,
    dismissOfflineReady,
    dismissUpdate,
    updateApp,
  };

  return <PWAContext.Provider value={value}>{children}</PWAContext.Provider>;
};

export const usePWA = () => {
  const context = useContext(PWAContext);
  if (context === undefined) {
    throw new Error('usePWA must be used within a PWAProvider');
  }
  return context;
};

// Utility hook for PWA status
export const usePWAStatus = () => {
  const { isOfflineReady, needsRefresh, isOnline } = usePWA();
  
  return {
    isOfflineReady,
    needsRefresh,
    isOnline,
    isPWACapable: 'serviceWorker' in navigator,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone ||
                  document.referrer.includes('android-app://'),
  };
};
