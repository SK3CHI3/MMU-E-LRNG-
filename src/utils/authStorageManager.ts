/**
 * Comprehensive Auth Storage Manager
 * Handles validation, cleanup, and recovery of authentication storage
 */

export interface AuthStorageData {
  access_token?: string;
  refresh_token?: string;
  expires_at?: number;
  expires_in?: number;
  token_type?: string;
  user?: any;
}

export interface StorageValidationResult {
  isValid: boolean;
  isExpired: boolean;
  isCorrupted: boolean;
  needsCleanup: boolean;
  errors: string[];
}

/**
 * Validates Supabase auth storage data
 */
export const validateAuthStorage = (): StorageValidationResult => {
  const result: StorageValidationResult = {
    isValid: true,
    isExpired: false,
    isCorrupted: false,
    needsCleanup: false,
    errors: []
  };

  try {
    // Check main Supabase auth storage
    const authData = localStorage.getItem('mmu-lms-auth');
    
    if (!authData) {
      result.isValid = false;
      result.errors.push('No auth data found');
      return result;
    }

    let parsedData: AuthStorageData;
    try {
      parsedData = JSON.parse(authData);
    } catch (error) {
      result.isCorrupted = true;
      result.needsCleanup = true;
      result.errors.push('Auth data is corrupted JSON');
      return result;
    }

    // Validate token structure
    if (!parsedData.access_token || typeof parsedData.access_token !== 'string') {
      result.isCorrupted = true;
      result.needsCleanup = true;
      result.errors.push('Invalid or missing access token');
    }

    // Check token expiration - only flag for cleanup if severely expired
    if (parsedData.expires_at) {
      const now = Math.floor(Date.now() / 1000);
      const expiresAt = parsedData.expires_at;

      // Only cleanup tokens that expired more than 1 hour ago
      // Let Supabase handle normal token refresh for recently expired tokens
      if (expiresAt < (now - 3600)) { // Expired more than 1 hour ago
        result.isExpired = true;
        result.needsCleanup = true;
        result.errors.push('Token severely expired (>1 hour)');
      } else if (expiresAt < now) {
        result.isExpired = true;
        result.errors.push('Token expired but within refresh window');
      }
    }

    // Validate user data
    if (parsedData.user) {
      if (!parsedData.user.id || !parsedData.user.email) {
        result.isCorrupted = true;
        result.needsCleanup = true;
        result.errors.push('Invalid user data structure');
      }
    }

    // Check for malformed tokens
    if (parsedData.access_token) {
      const tokenParts = parsedData.access_token.split('.');
      if (tokenParts.length !== 3) {
        result.isCorrupted = true;
        result.needsCleanup = true;
        result.errors.push('Malformed JWT token');
      }
    }

    result.isValid = result.errors.length === 0;

  } catch (error) {
    result.isCorrupted = true;
    result.needsCleanup = true;
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};

/**
 * Cleans up all Supabase-related storage
 */
export const cleanupSupabaseStorage = (): void => {
  console.log('AuthStorageManager: Starting Supabase storage cleanup');

  // Clear localStorage items
  const localStorageKeys = [
    'mmu-lms-auth',
    'supabase.auth.token',
    'sb-auth-token',
    'sb-refresh-token',
    'supabase-auth-token',
    'supabase.auth.session'
  ];

  localStorageKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`Removed localStorage: ${key}`);
    }
  });

  // Clear any other Supabase keys
  Object.keys(localStorage).forEach(key => {
    if (key.includes('supabase') || key.includes('sb-')) {
      localStorage.removeItem(key);
      console.log(`Removed localStorage: ${key}`);
    }
  });

  // Clear sessionStorage
  const sessionStorageKeys = Object.keys(sessionStorage).filter(key => 
    key.includes('supabase') || 
    key.includes('auth') || 
    key.includes('sb-')
  );

  sessionStorageKeys.forEach(key => {
    sessionStorage.removeItem(key);
    console.log(`Removed sessionStorage: ${key}`);
  });

  // Clear auth-related cookies
  const authCookies = [
    'mmu-lms-auth',
    'supabase-auth-token',
    'sb-auth-token',
    'auth-token',
    'session-token'
  ];

  authCookies.forEach(cookieName => {
    // Clear cookie for current domain
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
    // Clear cookie for subdomain
    document.cookie = `${cookieName}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    console.log(`Cleared cookie: ${cookieName}`);
  });

  console.log('AuthStorageManager: Supabase storage cleanup completed');
};

/**
 * Performs a comprehensive auth storage check and cleanup
 */
export const performAuthStorageCheck = (): boolean => {
  console.log('AuthStorageManager: Performing comprehensive storage check');

  const validation = validateAuthStorage();
  
  if (validation.needsCleanup) {
    console.warn('AuthStorageManager: Storage issues detected:', validation.errors);
    cleanupSupabaseStorage();
    return true; // Cleanup was performed
  }

  if (!validation.isValid) {
    console.log('AuthStorageManager: Storage validation failed but no cleanup needed:', validation.errors);
  }

  return false; // No cleanup needed
};

/**
 * Emergency storage reset - clears everything auth-related
 */
export const emergencyAuthStorageReset = (): void => {
  console.warn('AuthStorageManager: Performing emergency storage reset');

  try {
    // Clear all localStorage
    const allLocalStorageKeys = Object.keys(localStorage);
    allLocalStorageKeys.forEach(key => {
      if (key.includes('auth') || 
          key.includes('supabase') || 
          key.includes('session') || 
          key.includes('token') ||
          key.includes('user') ||
          key === 'mmu-lms-auth') {
        localStorage.removeItem(key);
        console.log(`Emergency cleanup: ${key}`);
      }
    });

    // Clear all sessionStorage
    sessionStorage.clear();

    // Clear all cookies
    document.cookie.split(";").forEach(cookie => {
      const eqPos = cookie.indexOf("=");
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=${window.location.hostname};`;
    });

    console.log('AuthStorageManager: Emergency reset completed');
  } catch (error) {
    console.error('AuthStorageManager: Emergency reset failed:', error);
  }
};

/**
 * Checks if storage was recently cleaned
 */
export const wasStorageRecentlyCleaned = (): boolean => {
  const lastCleanup = sessionStorage.getItem('auth-storage-cleanup');
  if (!lastCleanup) return false;

  const cleanupTime = parseInt(lastCleanup);
  const now = Date.now();
  const fiveMinutes = 5 * 60 * 1000;

  return (now - cleanupTime) < fiveMinutes;
};

/**
 * Marks that storage cleanup was performed
 */
export const markStorageCleanup = (): void => {
  sessionStorage.setItem('auth-storage-cleanup', Date.now().toString());
};

// Make available globally in development
if (import.meta.env.DEV) {
  (window as any).authStorageManager = {
    validateAuthStorage,
    cleanupSupabaseStorage,
    performAuthStorageCheck,
    emergencyAuthStorageReset
  };
  console.log('Auth Storage Manager available at window.authStorageManager');
}
