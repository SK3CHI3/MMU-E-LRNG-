// Email availability checker utility

import { supabase } from '@/lib/supabaseClient';
import { comprehensiveEmailCheck } from './authCleanup';

export interface EmailCheckResult {
  isAvailable: boolean;
  suggestions?: string[];
  message?: string;
}

// Check if an email is already registered
export const checkEmailAvailability = async (email: string): Promise<EmailCheckResult> => {
  try {
    // Use comprehensive check to verify both database and auth
    const result = await comprehensiveEmailCheck(email);

    return {
      isAvailable: result.isAvailable,
      message: result.isAvailable ? 'Email is available' : 'This email is already registered'
    };
  } catch (error) {
    console.error('Error checking email availability:', error);
    return {
      isAvailable: null,
      message: 'Unable to verify email availability'
    };
  }
};

// Generate available email suggestions based on a taken email
export const generateAvailableEmailSuggestions = async (
  baseEmail: string,
  role: string,
  maxSuggestions: number = 5
): Promise<string[]> => {
  const [localPart, domain] = baseEmail.split('@');
  const suggestions: string[] = [];

  // Generate potential alternatives
  const potentialEmails = [
    // Add numbers
    ...Array.from({ length: 10 }, (_, i) => `${localPart}${i + 1}@${domain}`),
    // Add role prefix
    `${role}.${localPart}@${domain}`,
    // Add year
    `${localPart}.${new Date().getFullYear()}@${domain}`,
    // Add common suffixes
    `${localPart}.new@${domain}`,
    `${localPart}.user@${domain}`,
    // MMU specific alternatives
    `${localPart}@mmu.ac.ke`,
    `${localPart}@student.mmu.ac.ke`,
    `${role}.${localPart}@mmu.ac.ke`
  ];

  // Check each potential email
  for (const email of potentialEmails) {
    if (suggestions.length >= maxSuggestions) break;

    try {
      const result = await checkEmailAvailability(email);
      if (result.isAvailable) {
        suggestions.push(email);
      }
    } catch (error) {
      // Skip this suggestion if check fails
      continue;
    }
  }

  return suggestions;
};

// Real-time email validation as user types
export const validateEmailRealTime = async (email: string): Promise<{
  isValid: boolean;
  isAvailable?: boolean;
  message?: string;
}> => {
  // Basic email format validation
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return {
      isValid: false,
      message: 'Please enter a valid email address'
    };
  }

  // Check availability
  try {
    const result = await checkEmailAvailability(email);
    return {
      isValid: true,
      isAvailable: result.isAvailable,
      message: result.message
    };
  } catch (error) {
    return {
      isValid: true,
      message: 'Unable to verify email availability'
    };
  }
};

// Debounced email checker for real-time validation
export const createDebouncedEmailChecker = (delay: number = 500) => {
  let timeoutId: NodeJS.Timeout;

  return (email: string, callback: (result: any) => void) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(async () => {
      const result = await validateEmailRealTime(email);
      callback(result);
    }, delay);
  };
};

export default {
  checkEmailAvailability,
  generateAvailableEmailSuggestions,
  validateEmailRealTime,
  createDebouncedEmailChecker
};
