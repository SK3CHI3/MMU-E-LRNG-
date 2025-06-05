/**
 * Secure Logger Utility
 * 
 * This utility provides secure logging functions that prevent sensitive data
 * from being exposed in console logs. It automatically filters out sensitive
 * information and only logs in development mode.
 */

// List of sensitive keys that should never be logged
const SENSITIVE_KEYS = [
  'password',
  'token',
  'secret',
  'key',
  'auth',
  'email',
  'phone',
  'address',
  'ssn',
  'credit',
  'card',
  'id',
  'auth_id',
  'user_id',
  'session',
  'cookie'
];

// Check if we're in development mode
const isDevelopment = import.meta.env.DEV;

/**
 * Sanitizes an object by removing sensitive data
 */
function sanitizeObject(obj: any): any {
  if (obj === null || obj === undefined) {
    return obj;
  }

  if (typeof obj !== 'object') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item));
  }

  const sanitized: any = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const lowerKey = key.toLowerCase();
    const isSensitive = SENSITIVE_KEYS.some(sensitiveKey => 
      lowerKey.includes(sensitiveKey)
    );

    if (isSensitive) {
      sanitized[key] = '[REDACTED]';
    } else if (typeof value === 'object') {
      sanitized[key] = sanitizeObject(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}

/**
 * Secure console.log that only works in development and sanitizes data
 */
export function secureLog(message: string, data?: any): void {
  if (!isDevelopment) {
    return;
  }

  if (data !== undefined) {
    const sanitizedData = sanitizeObject(data);
    console.log(message, sanitizedData);
  } else {
    console.log(message);
  }
}

/**
 * Secure console.error that sanitizes error data
 */
export function secureError(message: string, error?: any): void {
  if (error && typeof error === 'object') {
    // Only log the error message, not the full error object
    const errorMessage = error.message || error.toString();
    console.error(message, errorMessage);
  } else {
    console.error(message, error);
  }
}

/**
 * Secure console.warn that only works in development
 */
export function secureWarn(message: string, data?: any): void {
  if (!isDevelopment) {
    return;
  }

  if (data !== undefined) {
    const sanitizedData = sanitizeObject(data);
    console.warn(message, sanitizedData);
  } else {
    console.warn(message);
  }
}

/**
 * Log user action without exposing sensitive data
 */
export function logUserAction(action: string, userId?: string): void {
  if (!isDevelopment) {
    return;
  }

  if (userId) {
    console.log(`User Action: ${action} (User: [REDACTED])`);
  } else {
    console.log(`User Action: ${action}`);
  }
}

/**
 * Log database operation without exposing data
 */
export function logDatabaseOperation(operation: string, table?: string, recordCount?: number): void {
  if (!isDevelopment) {
    return;
  }

  let message = `Database: ${operation}`;
  if (table) {
    message += ` on ${table}`;
  }
  if (recordCount !== undefined) {
    message += ` (${recordCount} records)`;
  }
  
  console.log(message);
}

/**
 * Log authentication events safely
 */
export function logAuthEvent(event: string, success: boolean = true): void {
  if (!isDevelopment) {
    return;
  }

  const status = success ? 'SUCCESS' : 'FAILED';
  console.log(`Auth: ${event} - ${status}`);
}

/**
 * Log API calls without exposing sensitive data
 */
export function logApiCall(method: string, endpoint: string, status?: number): void {
  if (!isDevelopment) {
    return;
  }

  let message = `API: ${method} ${endpoint}`;
  if (status) {
    message += ` (${status})`;
  }
  
  console.log(message);
}

export default {
  log: secureLog,
  error: secureError,
  warn: secureWarn,
  userAction: logUserAction,
  dbOperation: logDatabaseOperation,
  authEvent: logAuthEvent,
  apiCall: logApiCall
};
