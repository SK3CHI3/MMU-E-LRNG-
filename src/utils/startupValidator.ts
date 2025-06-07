/**
 * Startup Validator - Runs critical checks before app initialization
 */

import { performAuthStorageCheck, emergencyAuthStorageReset } from './authStorageManager';
import { detectCorruptedStorage } from './storageCleanup';

export interface StartupValidationResult {
  isValid: boolean;
  needsReload: boolean;
  errors: string[];
  actions: string[];
}

/**
 * Performs comprehensive startup validation
 */
export const validateStartup = (): StartupValidationResult => {
  const result: StartupValidationResult = {
    isValid: true,
    needsReload: false,
    errors: [],
    actions: []
  };

  console.log('StartupValidator: Beginning startup validation');

  try {
    // Check for repeated reload loops - but be less aggressive
    const reloadCount = parseInt(sessionStorage.getItem('startup-reload-count') || '0');
    if (reloadCount > 5) { // Increased threshold from 3 to 5
      console.error('StartupValidator: Too many reloads detected, but not performing automatic reset');
      // Don't automatically reset - just log the issue
      sessionStorage.removeItem('startup-reload-count');
      result.errors.push('Multiple reload loops detected');
      return result;
    }

    // Increment reload count
    sessionStorage.setItem('startup-reload-count', (reloadCount + 1).toString());

    // Clear reload count after successful startup (delayed)
    setTimeout(() => {
      sessionStorage.removeItem('startup-reload-count');
    }, 15000); // Increased from 10s to 15s

    // Check auth storage
    const authCleanupPerformed = performAuthStorageCheck();
    if (authCleanupPerformed) {
      result.needsReload = true;
      result.actions.push('Auth storage cleanup performed');
      return result;
    }

    // Check for general storage corruption
    if (detectCorruptedStorage()) {
      console.warn('StartupValidator: General storage corruption detected');
      result.errors.push('Storage corruption detected');
      result.needsReload = true;
      result.actions.push('Storage cleanup required');
      return result;
    }

    // Check for stuck loading indicators
    const stuckLoadingIndicators = [
      'auth-loading-start',
      'page-reloaded',
      'app-initializing'
    ];

    stuckLoadingIndicators.forEach(indicator => {
      const value = sessionStorage.getItem(indicator);
      if (value) {
        const timestamp = parseInt(value);
        const now = Date.now();
        const maxAge = 30000; // 30 seconds

        if (now - timestamp > maxAge) {
          console.warn(`StartupValidator: Stuck loading indicator found: ${indicator}`);
          sessionStorage.removeItem(indicator);
          result.errors.push(`Stuck loading indicator: ${indicator}`);
        }
      }
    });

    // Check for browser compatibility issues
    if (!window.localStorage) {
      result.errors.push('localStorage not available');
      result.isValid = false;
    }

    if (!window.sessionStorage) {
      result.errors.push('sessionStorage not available');
      result.isValid = false;
    }

    // Check for required APIs
    const requiredAPIs = [
      'fetch',
      'Promise',
      'JSON'
    ];

    requiredAPIs.forEach(api => {
      if (!(api in window)) {
        result.errors.push(`Required API not available: ${api}`);
        result.isValid = false;
      }
    });

    // Check for memory issues
    if (performance.memory) {
      const memoryInfo = performance.memory;
      const memoryUsage = memoryInfo.usedJSHeapSize / memoryInfo.totalJSHeapSize;
      
      if (memoryUsage > 0.9) {
        console.warn('StartupValidator: High memory usage detected');
        result.errors.push('High memory usage');
      }
    }

    console.log('StartupValidator: Validation completed', {
      isValid: result.isValid,
      needsReload: result.needsReload,
      errorCount: result.errors.length,
      actionCount: result.actions.length
    });

  } catch (error) {
    console.error('StartupValidator: Validation failed:', error);
    result.isValid = false;
    result.errors.push(`Validation error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return result;
};

/**
 * Handles startup validation results
 */
export const handleStartupValidation = (result: StartupValidationResult): void => {
  if (result.needsReload) {
    console.log('StartupValidator: Reload required, reloading page...');
    
    // Add a small delay to ensure logging is visible
    setTimeout(() => {
      window.location.reload();
    }, 100);
    return;
  }

  if (!result.isValid) {
    console.error('StartupValidator: Startup validation failed:', result.errors);
    
    // Show user-friendly error message
    const errorDiv = document.createElement('div');
    errorDiv.innerHTML = `
      <div style="
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background: white;
        border: 2px solid #ef4444;
        border-radius: 8px;
        padding: 20px;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        z-index: 10000;
        max-width: 400px;
        text-align: center;
        font-family: system-ui, -apple-system, sans-serif;
      ">
        <h3 style="color: #ef4444; margin: 0 0 10px 0;">Startup Error</h3>
        <p style="margin: 0 0 15px 0; color: #374151;">
          The application encountered startup issues. Please try refreshing the page.
        </p>
        <button onclick="window.location.reload()" style="
          background: #ef4444;
          color: white;
          border: none;
          padding: 8px 16px;
          border-radius: 4px;
          cursor: pointer;
          font-size: 14px;
        ">
          Refresh Page
        </button>
      </div>
    `;
    document.body.appendChild(errorDiv);
  }

  if (result.actions.length > 0) {
    console.log('StartupValidator: Actions performed:', result.actions);
  }
};

/**
 * Runs startup validation and handles results
 */
export const runStartupValidation = (): boolean => {
  const result = validateStartup();
  handleStartupValidation(result);
  return result.isValid && !result.needsReload;
};

// DISABLED: Auto-run validation was causing infinite reload loops
// The startup validator should only be called manually when needed
// if (typeof window !== 'undefined') {
//   setTimeout(() => {
//     const isValid = runStartupValidation();
//     if (isValid) {
//       console.log('StartupValidator: ✅ Startup validation passed');
//     }
//   }, 0);
// }
