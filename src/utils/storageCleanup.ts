/**
 * Storage cleanup utilities to handle corrupted data and version mismatches
 */

import { validateAuthStorage, cleanupSupabaseStorage } from './authStorageManager';

export interface StorageCleanupOptions {
  clearAuth?: boolean;
  clearPWA?: boolean;
  clearCache?: boolean;
  force?: boolean;
}

/**
 * Detects if the current storage state is corrupted or incompatible
 */
export const detectCorruptedStorage = (): boolean => {
  try {
    // Use the comprehensive auth storage validation
    const authValidation = validateAuthStorage();
    if (authValidation.needsCleanup) {
      console.log('Storage corruption detected via auth validation:', authValidation.errors);
      return true;
    }

    // Check for common corruption indicators
    const indicators = [
      // Version mismatch
      () => {
        const storedVersion = localStorage.getItem('app-version');
        const currentVersion = '1.2.0';
        return storedVersion && storedVersion !== currentVersion;
      },

      // Inconsistent PWA state
      () => {
        const hasOfflineReady = localStorage.getItem('pwa-offline-ready-shown');
        const hasInstalled = localStorage.getItem('pwa-installed');
        const hasDismissed = localStorage.getItem('pwa-install-dismissed');

        // If all PWA flags are set but service worker isn't available
        if (hasOfflineReady && hasInstalled && hasDismissed && !('serviceWorker' in navigator)) {
          return true;
        }
        return false;
      },

      // Check for malformed localStorage entries
      () => {
        try {
          const keys = Object.keys(localStorage);
          for (const key of keys) {
            if (key.includes('auth') || key.includes('supabase')) {
              const value = localStorage.getItem(key);
              if (value && value.startsWith('{')) {
                JSON.parse(value); // This will throw if corrupted
              }
            }
          }
          return false;
        } catch {
          return true; // JSON parsing failed
        }
      }
    ];

    return indicators.some(check => check());
  } catch (error) {
    console.error('Error detecting corrupted storage:', error);
    return true; // Assume corruption if we can't even check
  }
};

/**
 * Safely cleans up storage based on options
 */
export const cleanupStorage = async (options: StorageCleanupOptions = {}): Promise<void> => {
  const { clearAuth = false, clearPWA = true, clearCache = true, force = false } = options;

  try {
    console.log('Storage cleanup started with options:', options);

    // Only proceed if corruption is detected or force is true
    if (!force && !detectCorruptedStorage()) {
      console.log('No storage corruption detected, skipping cleanup');
      return;
    }

    // Clear PWA-related data
    if (clearPWA) {
      const pwaKeys = [
        'pwa-offline-ready-shown',
        'pwa-install-dismissed',
        'pwa-install-last-shown',
        'pwa-installed'
      ];
      
      pwaKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`Removed PWA key: ${key}`);
      });
    }

    // Clear authentication data (use with caution)
    if (clearAuth) {
      console.log('Performing comprehensive auth storage cleanup');
      cleanupSupabaseStorage();
    }

    // Clear caches
    if (clearCache && 'caches' in window) {
      const cacheNames = await caches.keys();
      const cachesToDelete = cacheNames.filter(name => 
        name.includes('workbox') || 
        name.includes('api-cache') ||
        name.includes('runtime-cache')
      );
      
      await Promise.all(
        cachesToDelete.map(async (cacheName) => {
          await caches.delete(cacheName);
          console.log(`Deleted cache: ${cacheName}`);
        })
      );
    }

    // Update version marker
    localStorage.setItem('app-version', '1.2.0');
    localStorage.setItem('storage-cleanup-timestamp', Date.now().toString());

    console.log('Storage cleanup completed successfully');
  } catch (error) {
    console.error('Error during storage cleanup:', error);
    throw error;
  }
};

/**
 * Performs a safe reload after cleanup
 */
export const cleanupAndReload = async (options: StorageCleanupOptions = {}): Promise<void> => {
  try {
    await cleanupStorage(options);
    
    // Give a moment for cleanup to complete
    setTimeout(() => {
      window.location.reload();
    }, 100);
  } catch (error) {
    console.error('Error during cleanup and reload:', error);
    // Force reload even if cleanup failed
    window.location.reload();
  }
};

/**
 * Checks if a cleanup was recently performed
 */
export const wasRecentlyCleanedUp = (): boolean => {
  const timestamp = localStorage.getItem('storage-cleanup-timestamp');
  if (!timestamp) return false;
  
  const cleanupTime = parseInt(timestamp);
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;
  
  return (now - cleanupTime) < fiveMinutes;
};

/**
 * Emergency cleanup function for critical failures
 */
export const emergencyCleanup = (): void => {
  try {
    // Clear all localStorage except essential items
    const essentialKeys = ['theme', 'language', 'user-preferences'];
    const allKeys = Object.keys(localStorage);
    
    allKeys.forEach(key => {
      if (!essentialKeys.includes(key)) {
        localStorage.removeItem(key);
      }
    });
    
    // Clear all sessionStorage
    sessionStorage.clear();
    
    console.log('Emergency cleanup completed');
  } catch (error) {
    console.error('Emergency cleanup failed:', error);
  }
};
