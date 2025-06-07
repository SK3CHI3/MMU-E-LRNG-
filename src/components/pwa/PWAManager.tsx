import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PWAInstallPrompt, PWAUpdateNotification, PWAOfflineIndicator } from './index';

interface PWAContextType {
  isOfflineReady: boolean;
  needsRefresh: boolean;
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  dismissOfflineReady: () => void;
  dismissUpdate: () => void;
  updateApp: () => Promise<void>;
  installApp: () => Promise<void>;
}

const PWAContext = createContext<PWAContextType | undefined>(undefined);

interface PWAProviderProps {
  children: ReactNode;
}

export const PWAProvider: React.FC<PWAProviderProps> = ({ children }) => {
  const [isOfflineReady, setIsOfflineReady] = useState(false);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check if app is already installed
    const checkInstalled = () => {
      const isStandaloneMode = window.matchMedia('(display-mode: standalone)').matches ||
                              (window.navigator as any).standalone ||
                              document.referrer.includes('android-app://');
      setIsInstalled(isStandaloneMode);
    };

    // Handle beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);

      if (import.meta.env.DEV) {
        console.log('PWA: Install prompt available');
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

    checkInstalled();

    // Register service worker using VitePWA's generated files
    if ('serviceWorker' in navigator) {
      // VitePWA generates these files automatically
      const swUrl = import.meta.env.DEV ? '/dev-sw.js?dev-sw' : '/sw.js';

      navigator.serviceWorker.register(swUrl, { scope: '/' })
        .then((reg) => {
          setRegistration(reg);

          if (import.meta.env.DEV) {
            console.log('PWA: Service Worker registered successfully');
          }

          // Only show offline ready notification for first-time users
          const hasShownBefore = localStorage.getItem('pwa-offline-ready-shown');
          if (!hasShownBefore && !import.meta.env.DEV) {
            setIsOfflineReady(true);
            localStorage.setItem('pwa-offline-ready-shown', 'true');

            // Auto-dismiss after 3 seconds
            setTimeout(() => {
              setIsOfflineReady(false);
            }, 3000);
          }

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
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
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

  const installApp = async () => {
    if (!deferredPrompt) return;

    try {
      await deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;

      if (outcome === 'accepted') {
        setIsInstallable(false);
        setIsInstalled(true);
        localStorage.setItem('pwa-installed', 'true');
      }
    } catch (error) {
      console.error('Error during PWA installation:', error);
    } finally {
      setDeferredPrompt(null);
    }
  };

  const value: PWAContextType = {
    isOfflineReady,
    needsRefresh,
    isOnline,
    isInstallable,
    isInstalled,
    dismissOfflineReady,
    dismissUpdate,
    updateApp,
    installApp,
  };

  return (
    <PWAContext.Provider value={value}>
      {children}
      {/* PWA Components */}
      <PWAInstallPrompt />
      <PWAUpdateNotification />
      <PWAOfflineIndicator />
    </PWAContext.Provider>
  );
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
  const { isOfflineReady, needsRefresh, isOnline, isInstallable, isInstalled } = usePWA();

  return {
    isOfflineReady,
    needsRefresh,
    isOnline,
    isInstallable,
    isInstalled,
    isPWACapable: 'serviceWorker' in navigator,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone ||
                  document.referrer.includes('android-app://'),
  };
};
