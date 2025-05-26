import { createClient } from '@supabase/supabase-js';

// Initialize the Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

// Log the environment variables (without exposing full key)
console.log('Supabase URL:', supabaseUrl);
console.log('Supabase Key available:', supabaseAnonKey ? 'Yes (length: ' + supabaseAnonKey.length + ')' : 'No');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables. Please check your .env file.');
}

// Create the Supabase client with anon key (for regular operations)
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storageKey: 'mmu-lms-auth',
  },
});

// Service role key for admin operations (only used in secure server contexts)
const supabaseServiceKey = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImVla2FqbWZ2cW50YmxvcWdpendrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0NjIyOTk1MiwiZXhwIjoyMDYxODA1OTUyfQ.IQgAFxPi-0Oy9KX4MVFXsoTymxSVCzgPNIw76Um9UCQ';

// Create a separate admin client with service role key
// WARNING: This should only be used for operations that require admin privileges
// and should never be exposed to the client
export const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});

// Test the connection
supabase.auth.getSession().then(({ data }) => {
  console.log('Supabase client initialized and connected successfully');
  if (data.session) {
    console.log('User is authenticated:', data.session.user.email);
  } else {
    console.log('No active session found');
  }
}).catch(error => {
  console.error('Error connecting to Supabase:', error);
});

// Types for database tables
export type User = {
  id: string;
  auth_id: string;
  email: string;
  full_name: string;
  avatar_url?: string;
  role: 'student' | 'lecturer' | 'dean' | 'admin';
  student_id?: string;
  staff_id?: string;
  department?: string;
  faculty?: string;
  programme_id?: string;
  current_semester?: number;
  year_of_study?: number;
  phone?: string;
  date_of_birth?: string;
  address?: string;
  emergency_contact?: any;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
};

export type Profile = {
  id: string;
  bio?: string;
  phone?: string;
  address?: string;
  date_of_birth?: string;
  gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say';
  created_at: string;
  updated_at: string;
};

export type Course = {
  id: string;
  code: string;
  title: string;
  description?: string;
  credit_hours: number;
  department: string;
  level: 'undergraduate' | 'postgraduate';
  semester: 'fall' | 'spring' | 'summer';
  year: number;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type CourseEnrollment = {
  id: string;
  user_id: string;
  course_id: string;
  status: 'enrolled' | 'completed' | 'dropped';
  grade?: string;
  created_at: string;
  updated_at: string;
};

export type CourseMaterial = {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  type: 'document' | 'video' | 'audio' | 'link' | 'other';
  url: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Assignment = {
  id: string;
  course_id: string;
  title: string;
  description: string;
  due_date: string;
  total_points: number;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type AssignmentSubmission = {
  id: string;
  assignment_id: string;
  user_id: string;
  submission_url: string;
  submitted_at: string;
  grade?: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: string;
};

export type Discussion = {
  id: string;
  course_id: string;
  title: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type DiscussionReply = {
  id: string;
  discussion_id: string;
  content: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type Notification = {
  id: string;
  user_id: string;
  title: string;
  message: string;
  type: 'assignment' | 'discussion' | 'announcement' | 'grade' | 'other';
  is_read: boolean;
  related_id?: string;
  created_at: string;
};

export type Announcement = {
  id: string;
  title: string;
  content: string;
  is_public: boolean;
  course_id?: string;
  created_by: string;
  created_at: string;
  updated_at: string;
};

export type AnalyticsData = {
  id: string;
  user_id: string;
  course_id: string;
  activity_type: 'login' | 'material_view' | 'assignment_submission' | 'discussion_post' | 'quiz_attempt';
  duration_seconds?: number;
  score?: number;
  created_at: string;
};

// Helper functions for common database operations
export const getUser = async (userId: string) => {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('id', userId)
    .single();

  if (error) throw error;
  return data as User;
};

export const getCurrentUser = async () => {
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return null;

  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('auth_id', user.id)
    .single();

  if (error) throw error;
  return data as User;
};

export const getCourse = async (courseId: string) => {
  const { data, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', courseId)
    .single();

  if (error) throw error;
  return data as Course;
};

export const getUserCourses = async (userId: string) => {
  const { data, error } = await supabase
    .from('course_enrollments')
    .select(`
      *,
      course:courses(*)
    `)
    .eq('user_id', userId);

  if (error) throw error;
  return data.map(item => ({
    ...item.course,
    enrollment_status: item.status,
    enrollment_id: item.id,
    grade: item.grade
  })) as (Course & { enrollment_status: string; enrollment_id: string; grade?: string })[];
};

export const getNotifications = async (userId: string, limit = 10) => {
  const { data, error } = await supabase
    .from('notifications')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(limit);

  if (error) throw error;
  return data as Notification[];
};

export const markNotificationAsRead = async (notificationId: string) => {
  const { error } = await supabase
    .from('notifications')
    .update({ is_read: true })
    .eq('id', notificationId);

  if (error) throw error;
  return true;
};

export const trackActivity = async (userId: string, courseId: string, activityType: string) => {
  const { error } = await supabase
    .from('analytics_data')
    .insert({
      user_id: userId,
      course_id: courseId,
      activity_type: activityType
    });

  if (error) console.error('Error tracking activity:', error);
};
