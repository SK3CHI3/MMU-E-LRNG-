import React, { createContext, useContext, useEffect, useState } from 'react';
import { Session, User } from '@supabase/supabase-js';
import { supabase, supabaseAdmin, User as DbUser, getCurrentUser } from '@/lib/supabaseClient';
import { showErrorToast } from '@/utils/toast';

interface AuthContextType {
  session: Session | null;
  user: User | null;
  dbUser: DbUser | null;
  isLoading: boolean;
  signUp: (email: string, password: string, userData: Partial<DbUser>) => Promise<{ error: any | null; data: any | null }>;
  signIn: (email: string, password: string) => Promise<{ error: any | null; data: any | null }>;
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

    console.log('AuthContext: Initializing auth state');

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log('AuthContext: Initial session check', session ? 'Session found' : 'No session');

      setSession(session);
      setUser(session?.user ?? null);

      if (session?.user) {
        console.log('AuthContext: User found in session, fetching DB user immediately');
        // Fetch DB user immediately without timeout for faster loading
        fetchDbUser(session.user.id);
      } else {
        console.log('AuthContext: No user in session');
        setIsLoading(false);
      }
    }).catch(error => {
      console.error('AuthContext: Error getting session', error);
      setIsLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('AuthContext: Auth state changed', event, session ? 'Session exists' : 'No session');

        setSession(session);
        setUser(session?.user ?? null);

        if (session?.user) {
          console.log('AuthContext: User found in auth change, fetching DB user');

          // For all events with a user, fetch the database user immediately
          // This ensures we have the correct user data regardless of the event type
          await fetchDbUser(session.user.id);
        } else {
          console.log('AuthContext: No user in auth change');
          setDbUser(null);
          setIsLoading(false);
        }
      }
    );

    return () => {
      console.log('AuthContext: Cleaning up auth subscription');
      subscription.unsubscribe();
    };
  }, []);

  // Fetch the database user record
  const fetchDbUser = async (authId: string) => {
    setIsLoading(true);
    console.log('fetchDbUser: Fetching user with authId', authId);

    try {
      // Use admin client directly to bypass RLS and speed up the process
      const { data, error } = await supabaseAdmin
        .from('users')
        .select('*')
        .eq('auth_id', authId)
        .single();

      if (error) {
        console.error('fetchDbUser: Error fetching user:', error);

        // If the user doesn't exist in the database yet, create a default user
        if (error.code === 'PGRST116') { // No rows returned
          console.log('fetchDbUser: User not found in database, creating default user');

          // Get user email from auth
          const { data: authUser } = await supabase.auth.getUser();
          if (!authUser.user) {
            throw new Error('No authenticated user found');
          }

          // Create a default user record
          const defaultUser = {
            auth_id: authId,
            email: authUser.user.email,
            full_name: authUser.user.email?.split('@')[0] || 'New User',
            role: 'student',
            department: 'General',
          };

          console.log('fetchDbUser: Creating default user', defaultUser);

          // Use admin client to bypass RLS and speed up the process
          const { error: insertError } = await supabaseAdmin
            .from('users')
            .insert(defaultUser);

          if (insertError) {
            console.error('fetchDbUser: Error creating default user:', insertError);
            setDbUser(null);
          } else {
            console.log('fetchDbUser: Default user created successfully');
            setDbUser(defaultUser as DbUser);
          }
        } else {
          setDbUser(null);
        }
      } else {
        console.log('fetchDbUser: User found in database', data);
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
      console.log('Starting signup process with:', { email, userData });

      // Create auth user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        console.error('Auth signup error:', error);

        // Transform Supabase auth errors to user-friendly messages
        let userFriendlyError = error;

        if (error.message?.includes('User already registered')) {
          userFriendlyError = {
            ...error,
            message: 'This email address is already registered. Please use a different email or sign in instead.'
          };
        } else if (error.message?.includes('Invalid email')) {
          userFriendlyError = {
            ...error,
            message: 'Please enter a valid email address.'
          };
        } else if (error.message?.includes('Password should be at least 6 characters')) {
          userFriendlyError = {
            ...error,
            message: 'Password must be at least 6 characters long.'
          };
        }

        return { error: userFriendlyError, data: null };
      }

      console.log('Auth signup successful:', data);

      if (data.user) {
        // Create user record in the database using admin client to bypass RLS
        const userRecord = {
          auth_id: data.user.id,
          email: data.user.email,
          ...userData
        };

        console.log('Creating user record:', userRecord);

        try {
          // Use the admin client to bypass RLS policies
          const { error: dbError } = await supabaseAdmin
            .from('users')
            .insert(userRecord);

          if (dbError) {
            console.error('Database user creation error:', dbError);

            // Transform database errors to user-friendly messages
            let userFriendlyError = dbError;

            if (dbError.message?.includes('duplicate key value violates unique constraint "users_email_key"')) {
              userFriendlyError = {
                ...dbError,
                message: 'An account with this email already exists. Please use a different email address or sign in to your existing account.'
              };
            } else if (dbError.message?.includes('duplicate key value violates unique constraint "users_student_id_key"')) {
              userFriendlyError = {
                ...dbError,
                message: 'This student ID is already registered. Please check your student ID or contact support if you believe this is an error.'
              };
            } else if (dbError.message?.includes('duplicate key value violates unique constraint')) {
              userFriendlyError = {
                ...dbError,
                message: 'Some of the information you provided is already registered. Please check your details and try again.'
              };
            } else if (dbError.message?.includes('violates foreign key constraint')) {
              userFriendlyError = {
                ...dbError,
                message: 'Invalid department or faculty selected. Please choose a valid option.'
              };
            } else if (dbError.message?.includes('permission denied')) {
              userFriendlyError = {
                ...dbError,
                message: 'Registration is currently unavailable. Please contact support for assistance.'
              };
            }

            // If there's an error creating the DB user, delete the auth user
            try {
              // Use the admin client for deletion as well
              await supabaseAdmin.auth.admin.deleteUser(data.user.id);
              console.log('Cleaned up orphaned auth user');
            } catch (deleteError) {
              console.error('Failed to delete auth user after DB error:', deleteError);
            }

            return { error: userFriendlyError, data: null };
          }
        } catch (insertError) {
          console.error('Unexpected error during user creation:', insertError);
          return { error: insertError, data: null };
        }

        console.log('User record created successfully');

        // Create empty profile using admin client to bypass RLS
        console.log('Creating user profile');
        try {
          const { error: profileError } = await supabaseAdmin
            .from('profiles')
            .insert({
              id: userRecord.auth_id
            });

          if (profileError) {
            console.error('Profile creation error:', profileError);
            // We don't fail the signup if profile creation fails
            // Just log the error
          } else {
            console.log('Profile created successfully');
          }
        } catch (profileCreateError) {
          console.error('Unexpected error during profile creation:', profileCreateError);
          // Continue anyway - we don't want to fail signup just because profile creation failed
        }

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
  const signIn = async (email: string, password: string) => {
    console.log('signIn: Attempting to sign in with email', email);

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('signIn: Authentication error:', error);
        return { data: null, error };
      }

      console.log('signIn: Authentication successful', data);

      // We'll fetch the user data in the auth state change handler
      // This allows the login to complete faster
      if (data.user) {
        console.log('signIn: Authentication successful, user data will be fetched asynchronously');
        // The fetchDbUser will be called by the auth state change handler
      }

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
