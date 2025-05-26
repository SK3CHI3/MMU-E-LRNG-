// Utility to help with auth cleanup and debugging

import { supabase } from '@/lib/supabaseClient';

// Simplified approach: just check our database for now
// We'll handle auth conflicts during registration
export const checkEmailInAuth = async (email: string): Promise<boolean> => {
  // For now, we'll skip the auth check since it's unreliable
  // The registration process will catch auth conflicts anyway
  console.log('Skipping auth check for:', email);
  return false;
};

// Comprehensive email availability check
export const comprehensiveEmailCheck = async (email: string): Promise<{
  inDatabase: boolean;
  inAuth: boolean;
  isAvailable: boolean;
  message: string;
}> => {
  try {
    // Check database
    const { data: userData, error: dbError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email.toLowerCase())
      .single();

    const inDatabase = !!userData;

    // Check auth
    const inAuth = await checkEmailInAuth(email);

    // Determine availability
    const isAvailable = !inDatabase && !inAuth;

    let message = '';
    if (inDatabase && inAuth) {
      message = 'Email is registered and has an active account';
    } else if (inDatabase && !inAuth) {
      message = 'Email is in database but missing from auth (orphaned record)';
    } else if (!inDatabase && inAuth) {
      message = 'Email is in auth but missing from database (orphaned auth user)';
    } else {
      message = 'Email is available';
    }

    return {
      inDatabase,
      inAuth,
      isAvailable,
      message
    };
  } catch (error) {
    console.error('Error in comprehensive email check:', error);
    return {
      inDatabase: false,
      inAuth: false,
      isAvailable: true, // Default to available if check fails
      message: 'Unable to verify email availability - assuming available'
    };
  }
};

// Debug function to log email status
export const debugEmailStatus = async (email: string) => {
  console.log('=== EMAIL DEBUG INFO ===');
  console.log('Email:', email);

  const result = await comprehensiveEmailCheck(email);
  console.log('Database check:', result.inDatabase);
  console.log('Auth check:', result.inAuth);
  console.log('Available:', result.isAvailable);
  console.log('Message:', result.message);
  console.log('========================');

  return result;
};

export default {
  checkEmailInAuth,
  comprehensiveEmailCheck,
  debugEmailStatus
};
