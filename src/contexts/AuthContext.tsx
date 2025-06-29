import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseAdmin, User as DbUser, getCurrentUser } from '@/lib/supabaseClient';
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

  useEffect(() => {
    // Set loading state
    setIsLoading(true);

    if (import.meta.env.DEV) {
      console.log('AuthContext: Initializing auth state');
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (import.meta.env.DEV) {
        console.log('AuthContext: Initial session check', session ? 'Session found' : 'No session');
      }

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        if (import.meta.env.DEV) {
          console.log('AuthContext: User found in session, fetching DB user');
        }
        // Fetch DB user immediately without timeout for faster loading
        fetchDbUser(session.user.id);
      } else {
        if (import.meta.env.DEV) {
          console.log('AuthContext: No user in session');
        }
        setIsLoading(false);
      }
    }).catch(error => {
      console.error('AuthContext: Error getting session');
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (import.meta.env.DEV) {
          console.log('AuthContext: Auth state changed', event, session ? 'Session exists' : 'No session');
        }

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          if (import.meta.env.DEV) {
            console.log('AuthContext: User found in auth change, fetching DB user');
          }

          // For all events with a user, fetch the database user immediately
          // This ensures we have the correct user data regardless of the event type
          await fetchDbUser(session.user.id);
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
      subscription.unsubscribe();
    };
  }, []);

  // Fetch the database user record
  const fetchDbUser = async (authId: string) => {
    setIsLoading(true);
    if (import.meta.env.DEV) {
      console.log('fetchDbUser: Fetching user data');
    }

    try {
      // Check if admin client is available
      if (!supabaseAdmin) {
        console.error('fetchDbUser: Admin client not available');
        setDbUser(null);
        setIsLoading(false);
        return;
      }

      // Use admin client directly to bypass RLS and speed up the process
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single();

      if (error) {
        console.error('fetchDbUser: Error fetching user:', error);

        // If the user doesn't exist in the database, this is an error
        if (error.code === 'PGRST116') { // No rows returned
          console.error('fetchDbUser: User not found in database');
          setDbUser(null);
        } else {
          setDbUser(null);
        }
      } else {
        // Only log in development mode and without sensitive data
        if (import.meta.env.DEV) {
          console.log('fetchDbUser: User found in database');
          console.log('fetchDbUser: User role verified');
        }
        setDbUser(data as DbUser);
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
      const { data: existingEmailUser } = await supabaseAdmin
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
        const { data: existingStudentId } = await supabaseAdmin
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
          const { data: existingUser } = await supabaseAdmin
            .from('users')
            .select('auth_id')
            .eq('auth_id', data.user.id)
            .single();

          if (existingUser) {
            console.log('User already exists in database, registration successful');
            return { data: { user: data.user, session: data.session }, error: null };
          }

          // Insert user record into database using admin client to bypass RLS
          if (import.meta.env.DEV) {
            console.log('Attempting to insert user into database');
          }
          const { error: dbError, data: insertedUser } = await supabaseAdmin
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
              const { data: duplicateUser } = await supabaseAdmin
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
        const { data: userData, error: lookupError } = await supabaseAdmin
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

        const { data: userData, error: lookupError } = await supabaseAdmin
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
