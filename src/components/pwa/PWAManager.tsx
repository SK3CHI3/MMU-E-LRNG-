import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { PWAInstallPrompt, PWAUpdateNotification, PWAOfflineIndicator } from './index';
import { pwaDebug } from '@/utils/pwaDebug';

interface PWAContextType {
  isOfflineReady: boolean;
  needsRefresh: boolean;
  isOnline: boolean;
  isInstallable: boolean;
  isInstalled: boolean;
  isCheckingForUpdates: boolean;
  isUpdating: boolean;
  dismissOfflineReady: () => void;
  dismissUpdate: () => void;
  updateApp: () => Promise<void>;
  installApp: () => Promise<void>;
  checkForUpdates: () => Promise<void>;
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
  const [isCheckingForUpdates, setIsCheckingForUpdates] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    // Handle online/offline status
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    // Check for updates when app regains focus
    const handleFocus = () => {
      if (registration && !isCheckingForUpdates) {
        console.log('PWA: App focused, checking for updates...');
        setTimeout(() => {
          registration.update().catch(error => {
            console.error('PWA: Focus update check failed:', error);
          });
        }, 1000); // Small delay to avoid too frequent checks
      }
    };

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

    // Clear stale PWA data on version mismatch
    const clearStaleData = () => {
      const currentVersion = '1.2.0'; // Should match package.json version
      const storedVersion = localStorage.getItem('app-version');

      if (storedVersion && storedVersion !== currentVersion) {
        console.log('PWA: Version mismatch detected, clearing stale data');

        // Clear PWA-related localStorage items
        const keysToRemove = [
          'pwa-offline-ready-shown',
          'pwa-install-dismissed',
          'pwa-install-last-shown',
          'pwa-installed'
        ];

        keysToRemove.forEach(key => localStorage.removeItem(key));

        // Clear service worker caches
        if ('caches' in window) {
          caches.keys().then(cacheNames => {
            cacheNames.forEach(cacheName => {
              if (cacheName.includes('workbox') || cacheName.includes('api-cache')) {
                caches.delete(cacheName);
              }
            });
          });
        }
      }

      localStorage.setItem('app-version', currentVersion);
    };

    // Debug event listener for testing
    const handleDebugEvent = (event: CustomEvent) => {
      if (event.detail.type === 'simulate-update') {
        console.log('PWA: Simulating update for testing');
        setNeedsRefresh(true);
      }
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('focus', handleFocus);

    if (import.meta.env.DEV) {
      window.addEventListener('pwa-debug-update', handleDebugEvent as EventListener);
    }

    checkInstalled();
    clearStaleData();

    // Register service worker using VitePWA's generated files
    if ('serviceWorker' in navigator) {
      // Log debug info in development
      if (import.meta.env.DEV) {
        pwaDebug.logFullStatus();
      }

      // Clear any existing service workers first
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          if (registration.scope !== window.location.origin + '/') {
            registration.unregister();
          }
        });
      });

      // VitePWA generates these files automatically
      const swUrl = import.meta.env.DEV ? '/dev-sw.js?dev-sw' : '/sw.js';

      navigator.serviceWorker.register(swUrl, {
        scope: '/',
        updateViaCache: 'none' // Prevent caching of the service worker itself
      })
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
            console.log('PWA: Update found, new service worker installing...');
            setIsUpdating(true);

            const newWorker = reg.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                console.log('PWA: New service worker state:', newWorker.state);
                if (newWorker.state === 'installed') {
                  setIsUpdating(false);

                  if (navigator.serviceWorker.controller) {
                    // New update available - show notification for user to decide
                    console.log('PWA: New update available, showing notification');
                    setNeedsRefresh(true);
                  } else {
                    // First time install
                    console.log('PWA: App installed for first time');
                    setIsOfflineReady(true);
                    setTimeout(() => {
                      setIsOfflineReady(false);
                    }, 5000);
                  }
                }
              });
            }
          });

          // Force update check
          reg.update();

          // Set up automatic update checking every 30 minutes
          const updateCheckInterval = setInterval(() => {
            console.log('PWA: Performing automatic update check...');
            reg.update().catch(error => {
              console.error('PWA: Automatic update check failed:', error);
            });
          }, 30 * 60 * 1000); // 30 minutes

          // Store interval reference for cleanup
          (window as any).pwaUpdateInterval = updateCheckInterval;
        })
        .catch((error) => {
          console.error('PWA: Service Worker registration failed:', error);

          // If service worker fails, clear related data
          const keysToRemove = [
            'pwa-offline-ready-shown',
            'pwa-install-dismissed',
            'pwa-install-last-shown'
          ];
          keysToRemove.forEach(key => localStorage.removeItem(key));
        });
    }

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('focus', handleFocus);

      // Clear PWA update interval
      if ((window as any).pwaUpdateInterval) {
        clearInterval((window as any).pwaUpdateInterval);
      }

      if (import.meta.env.DEV) {
        window.removeEventListener('pwa-debug-update', handleDebugEvent as EventListener);
      }
    };
  }, []);

  const dismissOfflineReady = () => {
    setIsOfflineReady(false);
  };

  const dismissUpdate = () => {
    setNeedsRefresh(false);
  };

  const updateApp = async () => {
    if (!registration || !registration.waiting) {
      console.warn('PWA: No service worker waiting for update');
      // Force reload anyway in case of edge cases
      window.location.reload();
      return;
    }

    try {
      console.log('PWA: Starting manual update...');

      // Set up one-time listener for controller change
      const handleControllerChange = () => {
        console.log('PWA: New service worker activated, reloading...');
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
        window.location.reload();
      };

      navigator.serviceWorker.addEventListener('controllerchange', handleControllerChange);

      // Send skip waiting message to the waiting service worker
      registration.waiting.postMessage({ type: 'SKIP_WAITING' });

      // Fallback reload if controller change doesn't fire within 5 seconds
      setTimeout(() => {
        console.log('PWA: Fallback reload triggered');
        navigator.serviceWorker.removeEventListener('controllerchange', handleControllerChange);
        window.location.reload();
      }, 5000);

    } catch (error) {
      console.error('PWA: Error updating app:', error);
      // Force reload as fallback
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

  const checkForUpdates = async () => {
    if (!registration || isCheckingForUpdates) return;

    setIsCheckingForUpdates(true);

    try {
      console.log('PWA: Checking for updates...');
      await registration.update();

      // Give some time for the update check to complete
      setTimeout(() => {
        setIsCheckingForUpdates(false);
        if (!needsRefresh) {
          console.log('PWA: No updates available');
        }
      }, 2000);
    } catch (error) {
      console.error('PWA: Error checking for updates:', error);
      setIsCheckingForUpdates(false);
    }
  };

  const value: PWAContextType = {
    isOfflineReady,
    needsRefresh,
    isOnline,
    isInstallable,
    isInstalled,
    isCheckingForUpdates,
    isUpdating,
    dismissOfflineReady,
    dismissUpdate,
    updateApp,
    installApp,
    checkForUpdates,
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
  const {
    isOfflineReady,
    needsRefresh,
    isOnline,
    isInstallable,
    isInstalled,
    isCheckingForUpdates,
    isUpdating
  } = usePWA();

  return {
    isOfflineReady,
    needsRefresh,
    isOnline,
    isInstallable,
    isInstalled,
    isCheckingForUpdates,
    isUpdating,
    isPWACapable: 'serviceWorker' in navigator,
    isStandalone: window.matchMedia('(display-mode: standalone)').matches ||
                  (window.navigator as any).standalone ||
                  document.referrer.includes('android-app://'),
  };
};
