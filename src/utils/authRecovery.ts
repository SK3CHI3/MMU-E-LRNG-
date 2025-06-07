/**
 * Emergency auth recovery utilities for handling stuck loading states
 */

export interface AuthRecoveryOptions {
  clearAuth?: boolean;
  clearStorage?: boolean;
  forceReload?: boolean;
}

/**
 * Detects if the app is stuck in a loading state
 */
export const detectStuckLoading = (): boolean => {
  const loadingStartTime = sessionStorage.getItem('auth-loading-start');
  if (!loadingStartTime) return false;
  
  const now = Date.now();
  const startTime = parseInt(loadingStartTime);
  const maxLoadingTime = 15000; // 15 seconds
  
  return (now - startTime) > maxLoadingTime;
};

/**
 * Records when loading starts
 */
export const recordLoadingStart = (): void => {
  sessionStorage.setItem('auth-loading-start', Date.now().toString());
};

/**
 * Clears loading tracking
 */
export const clearLoadingTracking = (): void => {
  sessionStorage.removeItem('auth-loading-start');
};

/**
 * Emergency recovery from stuck loading state
 */
export const emergencyAuthRecovery = async (options: AuthRecoveryOptions = {}): Promise<void> => {
  const { clearAuth = false, clearStorage = false, forceReload = true } = options;
  
  console.warn('AuthRecovery: Performing emergency recovery');
  
  try {
    // Clear loading tracking
    clearLoadingTracking();
    
    // Clear auth-related storage if requested
    if (clearAuth) {
      const authKeys = Object.keys(localStorage).filter(key => 
        key.includes('supabase') || 
        key.includes('auth') ||
        key.includes('session') ||
        key === 'mmu-lms-auth'
      );
      
      authKeys.forEach(key => {
        localStorage.removeItem(key);
        console.log(`AuthRecovery: Removed ${key}`);
      });
      
      // Also clear sessionStorage
      const sessionAuthKeys = Object.keys(sessionStorage).filter(key => 
        key.includes('supabase') || 
        key.includes('auth') ||
        key.includes('session')
      );
      
      sessionAuthKeys.forEach(key => {
        sessionStorage.removeItem(key);
        console.log(`AuthRecovery: Removed session ${key}`);
      });
    }
    
    // Clear all storage if requested
    if (clearStorage) {
      localStorage.clear();
      sessionStorage.clear();
      console.log('AuthRecovery: Cleared all storage');
    }
    
    // Force reload if requested
    if (forceReload) {
      console.log('AuthRecovery: Forcing page reload');
      window.location.reload();
    }
    
  } catch (error) {
    console.error('AuthRecovery: Error during recovery:', error);
    // Force reload as last resort
    window.location.reload();
  }
};

/**
 * Check if recovery was recently performed
 */
export const wasRecentlyRecovered = (): boolean => {
  const recoveryTime = sessionStorage.getItem('auth-recovery-time');
  if (!recoveryTime) return false;
  
  const now = Date.now();
  const recoveryTimestamp = parseInt(recoveryTime);
  const fiveMinutes = 5 * 60 * 1000;
  
  return (now - recoveryTimestamp) < fiveMinutes;
};

/**
 * Mark that recovery was performed
 */
export const markRecoveryPerformed = (): void => {
  sessionStorage.setItem('auth-recovery-time', Date.now().toString());
};

/**
 * Auto-recovery mechanism that can be called from components
 * Made less aggressive to prevent infinite reload loops
 */
export const autoRecovery = (): void => {
  if (detectStuckLoading() && !wasRecentlyRecovered()) {
    console.warn('AuthRecovery: Auto-recovery triggered - clearing auth storage only');
    markRecoveryPerformed();

    // Only clear auth storage, don't force reload to prevent loops
    emergencyAuthRecovery({
      clearAuth: true,
      clearStorage: false,
      forceReload: false // Changed to false to prevent reload loops
    });

    // Let the user manually reload if needed
    console.log('AuthRecovery: Auth storage cleared. Please refresh the page manually if issues persist.');
  } else if (wasRecentlyRecovered()) {
    console.log('AuthRecovery: Recovery was recently performed, skipping to prevent loops');
  }
};

// Make it available globally in development
if (import.meta.env.DEV) {
  (window as any).authRecovery = {
    detectStuckLoading,
    emergencyAuthRecovery,
    autoRecovery,
    wasRecentlyRecovered
  };
  console.log('Auth recovery utilities available at window.authRecovery');
}
