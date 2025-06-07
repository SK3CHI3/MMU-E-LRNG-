/**
 * PWA Debug utilities for testing and troubleshooting
 */

export const pwaDebug = {
  /**
   * Get current service worker status
   */
  getServiceWorkerStatus: async () => {
    if (!('serviceWorker' in navigator)) {
      return { supported: false };
    }

    try {
      const registration = await navigator.serviceWorker.getRegistration();
      
      return {
        supported: true,
        registered: !!registration,
        active: !!registration?.active,
        waiting: !!registration?.waiting,
        installing: !!registration?.installing,
        scope: registration?.scope,
        updateViaCache: registration?.updateViaCache,
        activeState: registration?.active?.state,
        waitingState: registration?.waiting?.state,
        installingState: registration?.installing?.state,
      };
    } catch (error) {
      return {
        supported: true,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  },

  /**
   * Force check for updates
   */
  forceUpdateCheck: async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration) {
      throw new Error('No service worker registered');
    }

    console.log('PWA Debug: Forcing update check...');
    await registration.update();
    return true;
  },

  /**
   * Force service worker to skip waiting
   */
  forceSkipWaiting: async () => {
    if (!('serviceWorker' in navigator)) {
      throw new Error('Service Worker not supported');
    }

    const registration = await navigator.serviceWorker.getRegistration();
    if (!registration?.waiting) {
      throw new Error('No service worker waiting');
    }

    console.log('PWA Debug: Forcing skip waiting...');
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
    return true;
  },

  /**
   * Unregister all service workers (for testing)
   */
  unregisterAll: async () => {
    if (!('serviceWorker' in navigator)) {
      return false;
    }

    const registrations = await navigator.serviceWorker.getRegistrations();
    const results = await Promise.allSettled(
      registrations.map(reg => reg.unregister())
    );

    console.log('PWA Debug: Unregistered', results.length, 'service workers');
    return results.every(result => result.status === 'fulfilled' && result.value);
  },

  /**
   * Clear all caches
   */
  clearAllCaches: async () => {
    if (!('caches' in window)) {
      return false;
    }

    const cacheNames = await caches.keys();
    const results = await Promise.allSettled(
      cacheNames.map(name => caches.delete(name))
    );

    console.log('PWA Debug: Cleared', cacheNames.length, 'caches');
    return results.every(result => result.status === 'fulfilled' && result.value);
  },

  /**
   * Get cache information
   */
  getCacheInfo: async () => {
    if (!('caches' in window)) {
      return { supported: false };
    }

    const cacheNames = await caches.keys();
    const cacheInfo = await Promise.all(
      cacheNames.map(async (name) => {
        const cache = await caches.open(name);
        const keys = await cache.keys();
        return {
          name,
          size: keys.length,
          urls: keys.map(req => req.url).slice(0, 5) // First 5 URLs
        };
      })
    );

    return {
      supported: true,
      totalCaches: cacheNames.length,
      caches: cacheInfo
    };
  },

  /**
   * Simulate update available (for testing)
   */
  simulateUpdate: () => {
    console.log('PWA Debug: Simulating update...');
    
    // Dispatch a custom event that our PWA manager can listen to
    window.dispatchEvent(new CustomEvent('pwa-debug-update', {
      detail: { type: 'simulate-update' }
    }));
  },

  /**
   * Log all PWA-related information
   */
  logFullStatus: async () => {
    console.group('PWA Debug Status');
    
    const swStatus = await pwaDebug.getServiceWorkerStatus();
    console.log('Service Worker Status:', swStatus);
    
    const cacheInfo = await pwaDebug.getCacheInfo();
    console.log('Cache Info:', cacheInfo);
    
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const isInstalled = (window.navigator as any).standalone || 
                       document.referrer.includes('android-app://') ||
                       isStandalone;
    
    console.log('Installation Status:', {
      isStandalone,
      isInstalled,
      displayMode: window.matchMedia('(display-mode: standalone)').matches ? 'standalone' : 'browser',
      userAgent: navigator.userAgent
    });
    
    console.groupEnd();
  }
};

// Make it available globally in development
if (import.meta.env.DEV) {
  (window as any).pwaDebug = pwaDebug;
  console.log('PWA Debug utilities available at window.pwaDebug');
}
