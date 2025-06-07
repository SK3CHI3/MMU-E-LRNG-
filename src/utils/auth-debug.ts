/**
 * Authentication debugging utilities
 * Helps identify and resolve authentication-related issues
 */

export const logAuthState = (context: string, state: any) => {
  if (import.meta.env.DEV) {
    console.group(`🔐 Auth Debug - ${context}`);
    console.log('Timestamp:', new Date().toISOString());
    console.log('State:', state);
    console.log('User Agent:', navigator.userAgent);
    console.log('Current URL:', window.location.href);
    console.log('Local Storage Keys:', Object.keys(localStorage));
    
    // Check for auth-related storage
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('auth') || key.includes('supabase')
    );
    
    if (authKeys.length > 0) {
      console.log('Auth Storage Keys:', authKeys);
      authKeys.forEach(key => {
        try {
          const value = localStorage.getItem(key);
          if (value) {
            const parsed = JSON.parse(value);
            console.log(`${key}:`, {
              hasAccessToken: !!parsed.access_token,
              hasRefreshToken: !!parsed.refresh_token,
              expiresAt: parsed.expires_at ? new Date(parsed.expires_at * 1000).toISOString() : 'N/A'
            });
          }
        } catch (e) {
          console.log(`${key}: (non-JSON)`, localStorage.getItem(key)?.substring(0, 50) + '...');
        }
      });
    }
    
    console.groupEnd();
  }
};

export const clearAuthDebugStorage = () => {
  if (import.meta.env.DEV) {
    console.log('🧹 Clearing auth debug storage...');
    const authKeys = Object.keys(localStorage).filter(key => 
      key.includes('auth') || key.includes('supabase')
    );
    
    authKeys.forEach(key => {
      localStorage.removeItem(key);
      console.log(`Removed: ${key}`);
    });
    
    console.log('Auth storage cleared. Please refresh the page.');
  }
};

export const checkNetworkConnectivity = async () => {
  if (import.meta.env.DEV) {
    try {
      const response = await fetch('/ping', { 
        method: 'HEAD',
        cache: 'no-cache'
      });
      console.log('🌐 Network connectivity: OK');
      return true;
    } catch (error) {
      console.warn('🌐 Network connectivity: FAILED', error);
      return false;
    }
  }
  return true;
};

// Add to window for debugging in console
if (import.meta.env.DEV && typeof window !== 'undefined') {
  (window as any).authDebug = {
    logAuthState,
    clearAuthDebugStorage,
    checkNetworkConnectivity
  };
  
  console.log('🔧 Auth debug utilities available at window.authDebug');
}
