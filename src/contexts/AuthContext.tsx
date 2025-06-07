import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, User as DbUser, getCurrentUser } from '@/lib/supabaseClient';
import { showErrorToast } from '@/utils/ui/toast';
import { assignInitialSemester } from '@/services/academicService';
import { logAuthState } from '@/utils/auth-debug';
import { recordLoadingStart, clearLoadingTracking } from '@/utils/authRecovery';
import {
  performAuthStorageCheck,
  wasStorageRecentlyCleaned,
  markStorageCleanup,
  emergencyAuthStorageReset
} from '@/utils/authStorageManager';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  dbUser: DbUser | null;
  isLoading: boolean;
  signUp: (email: string, password: string, userData: Partial<DbUser>) => Promise<{ error: any | null; data: any | null }>;
  signIn: (emailOrAdmissionNumber: string, password: string) => Promise<{ error: any | null; data: any | null }>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: any | null; data: any | null }>;
  updatePassword: (password: string) => Promise<{ error: any | null; data: any | null }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [dbUser, setDbUser] = useState<DbUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Track if we're currently fetching user data to prevent race conditions
  const isFetchingUser = React.useRef(false);
  const fetchTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);
  const fallbackTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  // Detect if this is a page reload
  const isPageReload = React.useRef(
    performance.navigation?.type === 1 || // Navigation type reload
    performance.getEntriesByType('navigation')[0]?.type === 'reload' ||
    sessionStorage.getItem('page-reloaded') === 'true'
  );

  React.useEffect(() => {
    if (isPageReload.current) {
      sessionStorage.setItem('page-reloaded', 'true');
      console.log('AuthContext: Page reload detected');
    }

    // Clear the flag after a short delay
    const clearReloadFlag = setTimeout(() => {
      sessionStorage.removeItem('page-reloaded');
    }, 2000);

    return () => clearTimeout(clearReloadFlag);
  }, []);

  useEffect(() => {
    // Set loading state and record start time
    setIsLoading(true);
    recordLoadingStart();

    if (import.meta.env.DEV) {
      console.log('AuthContext: Initializing auth state');
    }

    // Comprehensive storage validation and cleanup
    if (!wasStorageRecentlyCleaned()) {
      const needsCleanup = performAuthStorageCheck();
      if (needsCleanup) {
        console.log('AuthContext: Storage cleanup performed, reloading...');
        markStorageCleanup();
        window.location.reload();
        return;
      }
    }

    // Shorter fallback timeout for reloads, longer for initial loads
    const timeoutDuration = isPageReload.current ? 4000 : 8000;
    fallbackTimeoutRef.current = setTimeout(() => {
      if (import.meta.env.DEV) {
        console.warn(`AuthContext: Fallback timeout triggered after ${timeoutDuration}ms - setting loading to false`);
      }
      setIsLoading(false);
    }, timeoutDuration);

    // Emergency timeout for storage corruption
    const emergencyTimeoutRef = setTimeout(() => {
      console.error('AuthContext: Emergency timeout - possible storage corruption');
      if (!wasStorageRecentlyCleaned()) {
        console.log('AuthContext: Performing emergency storage reset');
        emergencyAuthStorageReset();
        markStorageCleanup();
        window.location.reload();
      } else {
        setIsLoading(false);
      }
    }, 15000); // 15 second emergency timeout

    // Get initial session with additional debugging
    console.log('AuthContext: Starting initial session check...');
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      console.log('AuthContext: Initial session check completed', session ? 'Session found' : 'No session');

      // Clear fallback timeout immediately since we got a response
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
      clearTimeout(emergencyTimeoutRef);

      if (error) {
        console.error('AuthContext: Session error:', error);
        setIsLoading(false);
        return;
      }

      if (import.meta.env.DEV) {
        logAuthState('Initial Session Check', {
          hasSession: !!session,
          hasUser: !!session?.user,
          userId: session?.user?.id,
          timestamp: new Date().toISOString()
        });
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        console.log('AuthContext: User found in session, fetching DB user for ID:', session.user.id);

        // Set a safety timeout to ensure loading doesn't stay true forever
        const safetyTimeout = setTimeout(() => {
          console.warn('AuthContext: Safety timeout - forcing loading to false after 10 seconds');
          setIsLoading(false);
        }, 10000);

        // Fetch DB user with a shorter timeout for reload scenarios
        fetchDbUser(session.user.id).catch(error => {
          console.error('AuthContext: Failed to fetch DB user:', error);
          setIsLoading(false);
        }).finally(() => {
          clearTimeout(safetyTimeout);
        });
      } else {
        console.log('AuthContext: No user in session, setting loading to false');
        setIsLoading(false);
      }
    }).catch(error => {
      console.error('AuthContext: Error getting session:', error);
      console.error('AuthContext: Session error details:', {
        message: error.message,
        code: error.code,
        status: error.status
      });
      if (import.meta.env.DEV) {
        logAuthState('Session Error', { error: error.message });
      }
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
        fallbackTimeoutRef.current = null;
      }
      clearTimeout(emergencyTimeoutRef);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (import.meta.env.DEV) {
          console.log('AuthContext: Auth state changed', event, session ? 'Session exists' : 'No session');
        }

        // Handle INITIAL_SESSION differently - only skip if we already processed it
        if (event === 'INITIAL_SESSION') {
          if (import.meta.env.DEV) {
            console.log('AuthContext: INITIAL_SESSION event - checking if already processed');
          }

          // If we already have session and user data, skip to avoid duplicate processing
          if (session && user && session.user.id === user.id) {
            if (import.meta.env.DEV) {
              console.log('AuthContext: INITIAL_SESSION already processed, skipping');
            }
            return;
          }

          if (import.meta.env.DEV) {
            console.log('AuthContext: Processing INITIAL_SESSION event');
          }
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          if (import.meta.env.DEV) {
            console.log('AuthContext: User found in auth change, event:', event);
          }

          // Fetch user data for relevant events
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
            try {
              await fetchDbUser(session.user.id);
            } catch (error) {
              console.error('AuthContext: Error in fetchDbUser during auth state change:', error);
              setIsLoading(false);
            }
          } else {
            // For other events, just ensure loading is false if we have a user
            if (import.meta.env.DEV) {
              console.log('AuthContext: Auth event does not require DB user fetch:', event);
            }
            setIsLoading(false);
          }
        } else {
          if (import.meta.env.DEV) {
            console.log('AuthContext: No user in auth change');
          }
          setDbUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      if (import.meta.env.DEV) {
        console.log('AuthContext: Cleaning up auth subscription');
      }

      // Clear all timeouts
      if (fallbackTimeoutRef.current) {
        clearTimeout(fallbackTimeoutRef.current);
      }
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      clearTimeout(emergencyTimeoutRef);

      // Reset fetch flag
      isFetchingUser.current = false;

      subscription.unsubscribe();
    };
  }, []);

  // Fetch the database user record with improved error handling
  const fetchDbUser = async (authId: string): Promise<void> => {
    // Prevent concurrent fetches
    if (isFetchingUser.current) {
      console.log('fetchDbUser: Already fetching user, skipping duplicate request');
      return;
    }

    isFetchingUser.current = true;

    console.log('fetchDbUser: Starting fetch for authId:', authId);
    console.log('fetchDbUser: Current loading state:', isLoading);
    console.log('fetchDbUser: Is page reload:', isPageReload.current);

    // Clear any existing timeout
    if (fetchTimeoutRef.current) {
      clearTimeout(fetchTimeoutRef.current);
    }

    // Set timeout with different durations for reload vs initial load
    const timeoutDuration = isPageReload.current ? 3000 : 5000;
    fetchTimeoutRef.current = setTimeout(() => {
      console.error(`fetchDbUser: Database request timed out after ${timeoutDuration}ms - forcing loading to false`);
      isFetchingUser.current = false;
      setIsLoading(false);
      setDbUser(null);
      clearLoadingTracking();
    }, timeoutDuration);

    try {
      // Use regular client with proper authentication
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single();

      // Clear timeout since we got a response
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }

      if (error) {
        console.error('fetchDbUser: Error fetching user:', error);

        // Handle specific error cases
        if (error.code === 'PGRST116') {
          console.error('fetchDbUser: User not found in database');
        } else if (error.message?.includes('JWT')) {
          console.error('fetchDbUser: JWT/Auth error, user may need to re-login');
          // Clear auth storage if JWT is invalid
          localStorage.removeItem('mmu-lms-auth');
        } else {
          console.error('fetchDbUser: Database error:', error.code || error.message);
        }

        setDbUser(null);
        // CRITICAL: Always set loading to false on error
        setIsLoading(false);
      } else if (data) {
        console.log('fetchDbUser: User found in database with role:', data.role);
        setDbUser(data as DbUser);
        // CRITICAL: Set loading to false on success
        setIsLoading(false);
      } else {
        console.warn('fetchDbUser: No data returned but no error');
        setDbUser(null);
        // CRITICAL: Set loading to false even if no data
        setIsLoading(false);
      }
    } catch (error) {
      // Clear timeout on error
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
        fetchTimeoutRef.current = null;
      }

      console.error('fetchDbUser: Unexpected error:', error);

      // Check if it's a network error
      if (error instanceof Error) {
        if (error.message.includes('fetch') || error.message.includes('network')) {
          console.error('fetchDbUser: Network error detected');
        }
      }

      setDbUser(null);
    } finally {
      isFetchingUser.current = false;
      clearLoadingTracking();
      console.log('fetchDbUser: Fetch completed, isFetchingUser reset to false');
    }
  };

  // Sign up a new user
  const signUp = async (email: string, password: string, userData: Partial<DbUser>) => {
    try {
      if (import.meta.env.DEV) {
        console.log('Starting signup process');
      }

      // First, check if email already exists in database
      const { data: existingEmailUser } = await supabase
        .from('users')
        .select('id, email')
        .eq('email', email)
        .single();

      if (existingEmailUser) {
        return {
          error: {
            message: 'This email address is already registered. Please use a different email or sign in to your existing account.'
          },
          data: null
        };
      }

      // Check if student ID already exists (for students)
      if (userData.student_id) {
        const { data: existingStudentId } = await supabase
          .from('users')
          .select('auth_id, student_id')
          .eq('student_id', userData.student_id)
          .single();

        if (existingStudentId) {
          return {
            error: {
              message: `The admission number ${userData.student_id} is already registered. Please check your admission number or contact support if this is an error.`
            },
            data: null
          };
        }
      }

      // Check admin limit (maximum 2 admins allowed)
      if (userData.role === 'admin') {
        const { data: adminCount, error: adminCountError } = await supabase
          .from('users')
          .select('id', { count: 'exact', head: true })
          .eq('role', 'admin');

        if (adminCountError) {
          console.error('Error checking admin count:', adminCountError);
          return {
            error: {
              message: 'Unable to verify admin registration. Please try again later.'
            },
            data: null
          };
        }

        if (adminCount && adminCount >= 2) {
          return {
            error: {
              message: 'Maximum number of administrators (2) has been reached. Please contact an existing administrator for assistance with admin account creation.'
            },
            data: null
          };
        }
      }

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Auth signup error:', error.message);
        return { error, data: null };
      }

      if (data.user) {
        // Create user record in the database
        const userRecord = {
          auth_id: data.user.id,
          email: data.user.email,
          ...userData
        };

        if (import.meta.env.DEV) {
          console.log('Creating user record in database');
        }

        try {
          // First, check if a user with this auth_id already exists
          const { data: existingUser } = await supabase
            .from('users')
            .select('auth_id')
            .eq('auth_id', data.user.id)
            .single();

          if (existingUser) {
            console.log('User already exists in database, registration successful');
            return { data: { user: data.user, session: data.session }, error: null };
          }

          // Insert user record into database
          if (import.meta.env.DEV) {
            console.log('Attempting to insert user into database');
          }
          const { error: dbError, data: insertedUser } = await supabase
            .from('users')
            .insert(userRecord)
            .select()
            .single();

          if (import.meta.env.DEV) {
            console.log('Database insert completed');
          }

          if (dbError) {
            console.error('Database user creation error:', dbError.message);

            // If it's a duplicate key error, check if the user actually exists
            if (dbError.message?.includes('duplicate key value violates unique constraint')) {
              const { data: duplicateUser } = await supabase
                .from('users')
                .select('auth_id')
                .eq('auth_id', data.user.id)
                .single();

              if (duplicateUser) {
                if (import.meta.env.DEV) {
                  console.log('User was created successfully despite error message');
                }
                return { data: { user: data.user, session: data.session }, error: null };
              }
            }

            // Clean up the auth user if database creation fails
            try {
              await supabase.auth.signOut();
              if (import.meta.env.DEV) {
                console.log('Signed out user after DB error');
              }
            } catch (deleteError) {
              console.error('Failed to sign out user after DB error');
            }

            // Return a more specific error message based on the error type
            let errorMessage = 'Registration failed. Please try again.';

            if (dbError.code === 'PGRST204') {
              errorMessage = 'Database configuration error. Please contact support.';
            } else if (dbError.code === '22P02') {
              errorMessage = 'Invalid data format. Please check your input and try again.';
            } else if (dbError.code === '23505') {
              errorMessage = 'This email or student ID is already registered. Please use a different one.';
            } else if (dbError.message?.includes('programme')) {
              errorMessage = 'Programme selection error. Please try selecting a different programme.';
            }

            return {
              error: {
                message: errorMessage
              },
              data: null
            };
          }
        } catch (insertError) {
          console.error('Unexpected error during user creation:', insertError);
          return { error: insertError, data: null };
        }

        if (import.meta.env.DEV) {
          console.log('User record created successfully');
        }

        // Auto-assign semester for new students
        if (userData.role === 'student' && data.user) {
          try {
            if (import.meta.env.DEV) {
              console.log('Assigning initial semester to new student');
            }
            await assignInitialSemester(data.user.id);
            if (import.meta.env.DEV) {
              console.log('Initial semester assigned successfully');
            }
          } catch (semesterError) {
            console.error('Error assigning initial semester');
            // Don't fail the registration if semester assignment fails
          }
        }

        // Note: Profile creation removed to avoid foreign key constraint issues
        // The users table contains all necessary user information

        return { data, error: null };
      }

      return { data, error: null };
    } catch (error) {
      console.error('Unexpected error in signUp:', error);
      showErrorToast('Registration failed', {
        description: 'An unexpected error occurred. Please try again later.'
      });
      return { error, data: null };
    }
  };

  // Sign in an existing user
  const signIn = async (emailOrAdmissionNumber: string, password: string) => {

    try {
      let email = emailOrAdmissionNumber;

      // Check if input looks like an admission number (format: ABC-123-456/2024)
      const admissionNumberRegex = /^[A-Z]{2,4}-\d{3}-\d{3}\/\d{4}$/;
      if (admissionNumberRegex.test(emailOrAdmissionNumber)) {

        // Look up the user's email from the database using admission number
        const { data: userData, error: lookupError } = await supabase
          .from('users')
          .select('email')
          .eq('student_id', emailOrAdmissionNumber)
          .single();

        if (lookupError || !userData) {
          return {
            data: null,
            error: { message: 'Invalid admission number. Please check your admission number and try again.' }
          };
        }

        email = userData.email;
        if (import.meta.env.DEV) {
          console.log('signIn: Found email for admission number');
        }
      } else {
        // For email login, check if the email exists in our system first
        if (import.meta.env.DEV) {
          console.log('signIn: Input detected as email, checking if user exists');
        }

        const { data: userData, error: lookupError } = await supabase
          .from('users')
          .select('email')
          .eq('email', email.toLowerCase())
          .single();

        if (lookupError || !userData) {
          if (import.meta.env.DEV) {
            console.error('signIn: Email not found in system');
          }
          return {
            data: null,
            error: { message: 'No account found with this email address. Please check your email or register for a new account.' }
          };
        }

        if (import.meta.env.DEV) {
          console.log('signIn: Email found in system, proceeding with authentication');
        }
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('signIn: Authentication error:', error.message);
        return { data: null, error };
      }

      // We'll fetch the user data in the auth state change handler
      // This allows the login to complete faster

      return { data, error: null };
    } catch (error) {
      console.error('signIn: Unexpected error:', error);
      return { error, data: null };
    }
  };

  // Sign out
  const signOut = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Error in signOut:', error);
    }
  };

  // Reset password
  const resetPassword = async (email: string) => {
    try {
      const { data, error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      return { data, error };
    } catch (error) {
      console.error('Error in resetPassword:', error);
      return { error, data: null };
    }
  };

  // Update password
  const updatePassword = async (password: string) => {
    try {
      const { data, error } = await supabase.auth.updateUser({
        password,
      });

      return { data, error };
    } catch (error) {
      console.error('Error in updatePassword:', error);
      return { error, data: null };
    }
  };

  const value = {
    session,
    user,
    dbUser,
    isLoading,
    signUp,
    signIn,
    signOut,
    resetPassword,
    updatePassword,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
