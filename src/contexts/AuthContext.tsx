import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, User as DbUser } from '@/lib/supabaseClient';
import { showErrorToast } from '@/utils/ui/toast';
import { assignInitialSemester } from '@/services/academicService';

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

  // Simple loading timeout - no complex recovery mechanisms
  const loadingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    console.log('AuthContext: Initializing...');
    setIsLoading(true);

    // Simple timeout - if loading takes more than 10 seconds, something is wrong
    loadingTimeoutRef.current = setTimeout(() => {
      console.warn('AuthContext: Loading timeout reached, setting loading to false');
      setIsLoading(false);
    }, 10000);

    // Get initial session - simple and clean
    supabase.auth.getSession().then(({ data: { session }, error }) => {
      // Clear timeout since we got a response
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }

      if (error) {
        console.error('AuthContext: Session error:', error);
        setSession(null);
        setUser(null);
        setDbUser(null);
        setIsLoading(false);
        return;
      }

      console.log('AuthContext: Session check completed', session ? 'Session found' : 'No session');

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        // Fetch database user
        fetchDbUser(session.user.id);
      } else {
        setDbUser(null);
        setIsLoading(false);
      }
    }).catch(error => {
      console.error('AuthContext: Unexpected error:', error);
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
        loadingTimeoutRef.current = null;
      }
      setSession(null);
      setUser(null);
      setDbUser(null);
      setIsLoading(false);
    });

    // Listen for auth changes - simple and clean
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed', event, session ? 'Session exists' : 'No session');

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          // Only fetch DB user for actual sign-in events, not initial session
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            await fetchDbUser(session.user.id);
          }
        } else {
          setDbUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      console.log('AuthContext: Cleaning up...');

      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current);
      }

      subscription.unsubscribe();
    };
  }, []);

  // Simple, clean database user fetch
  const fetchDbUser = async (authId: string): Promise<void> => {
    console.log('fetchDbUser: Fetching user for authId:', authId);

    try {
      const { data, error } = await supabase
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single();

      if (error) {
        console.error('fetchDbUser: Error:', error);

        // Only sign out for actual auth errors, not missing user records
        if (error.message?.includes('JWT') || error.message?.includes('invalid_token')) {
          console.log('fetchDbUser: Invalid token, signing out');
          await supabase.auth.signOut();
          return;
        }

        // For other errors (like user not found), just set null but keep session
        setDbUser(null);
      } else if (data) {
        console.log('fetchDbUser: User found with role:', data.role);
        setDbUser(data as DbUser);
      } else {
        setDbUser(null);
      }
    } catch (error) {
      console.error('fetchDbUser: Unexpected error:', error);
      setDbUser(null);
    } finally {
      setIsLoading(false);
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
