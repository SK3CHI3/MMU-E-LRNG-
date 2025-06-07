import { supabase } from '@/lib/supabaseClient';

// Note: All admin operations now use regular supabase client with proper RLS policies
// This is more secure than using service role keys in client-side code

// Types for admin operations
export interface SystemMetrics {
  totalUsers: number;
  totalStudents: number;
  totalLecturers: number;
  totalDeans: number;
  totalAdmins: number;
  totalCourses: number;
  totalEnrollments: number;
  totalAssignments: number;
  totalSubmissions: number;
  storageUsed: number;
  systemUptime: number;
  activeUsers: number;
}

export interface SecurityEvent {
  id: string;
  type: 'login_attempt' | 'failed_login' | 'password_change' | 'role_change' | 'data_access';
  user_id?: string;
  user_email?: string;
  ip_address?: string;
  user_agent?: string;
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  timestamp: string;
  resolved: boolean;
}

export interface FacultyManagement {
  id: string;
  name: string;
  shortName: string;
  dean: string;
  totalStudents: number;
  totalLecturers: number;
  totalCourses: number;
  totalDepartments: number;
  status: 'active' | 'inactive';
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  department: string;
  faculty: string;
  phone?: string;
  studentId?: string;
  lastLogin: string;
}

// Get all users for admin management
export const getAllUsers = async (): Promise<User[]> => {
  try {

    const { data: users, error } = await supabase
      .from('users')
      .select(`
        id,
        auth_id,
        email,
        full_name,
        role,
        faculty,
        department,
        phone_number,
        admission_number,
        last_sign_in_at,
        created_at
      `)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching users:', error.message);
      throw error;
    }

    if (import.meta.env.DEV) {
      console.log('getAllUsers: Found users:', users?.length || 0);
    }

    // Transform the data to match the User interface
    const transformedUsers: User[] = users?.map(user => ({
      id: user.auth_id || user.id,
      name: user.full_name || 'Unknown',
      email: user.email || 'No email',
      role: user.role || 'student',
      status: 'active', // You might want to add a status field to your users table
      department: user.department || 'Not assigned',
      faculty: user.faculty || 'Not assigned',
      phone: user.phone_number || undefined,
      studentId: user.admission_number || undefined,
      lastLogin: user.last_sign_in_at
        ? new Date(user.last_sign_in_at).toLocaleDateString()
        : 'Never'
    })) || [];

    console.log('getAllUsers: Returning transformed users:', transformedUsers.length);
    return transformedUsers;
  } catch (error) {
    console.error('Error fetching all users:', error);
    throw error;
  }
};

// Get comprehensive system metrics
export const getSystemMetrics = async (): Promise<SystemMetrics> => {
  try {

    // Get user counts by role
    const { data: users, error: usersError } = await supabase
      .from('users')
      .select('role, faculty, department');

    if (usersError) {
      console.error('Error fetching users:', usersError.message);
      throw usersError;
    }

    const roleCounts = users?.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    console.log('getSystemMetrics: Role counts:', roleCounts);

    // Get course count
    const { data: courses, error: coursesError } = await supabase
      .from('courses')
      .select('id');

    if (coursesError) throw coursesError;

    // Get enrollment count
    const { data: enrollments, error: enrollmentsError } = await supabase
      .from('course_enrollments')
      .select('id');

    if (enrollmentsError) throw enrollmentsError;

    // Get assignment count
    const { data: assignments, error: assignmentsError } = await supabase
      .from('assignments')
      .select('id');

    if (assignmentsError) throw assignmentsError;

    // Get submission count
    const { data: submissions, error: submissionsError } = await supabase
      .from('assignment_submissions')
      .select('id');

    if (submissionsError) throw submissionsError;

    // Get active users (users who logged in within last 24 hours)
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);

    const { data: activeUsers, error: activeError } = await supabase
      .from('users')
      .select('id')
      .gte('last_sign_in_at', yesterday.toISOString());

    const result = {
      totalUsers: users?.length || 0,
      totalStudents: roleCounts.student || 0,
      totalLecturers: roleCounts.lecturer || 0,
      totalDeans: roleCounts.dean || 0,
      totalAdmins: roleCounts.admin || 0,
      totalCourses: courses?.length || 0,
      totalEnrollments: enrollments?.length || 0,
      totalAssignments: assignments?.length || 0,
      totalSubmissions: submissions?.length || 0,
      storageUsed: 67, // This would come from actual storage metrics
      systemUptime: 99.9,
      activeUsers: activeUsers?.length || 0
    };

    return result;
  } catch (error) {
    console.error('Error fetching system metrics:', error);
    throw error;
  }
};

// Get security events and logs
export const getSecurityEvents = async (limit: number = 50): Promise<SecurityEvent[]> => {
  try {
    // This would typically come from a security_logs table
    // For now, we'll generate some mock data based on actual user activity
    const { data: users, error } = await supabase
      .from('users')
      .select('id, email, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    // Generate mock security events
    const mockEvents: SecurityEvent[] = [
      {
        id: '1',
        type: 'login_attempt',
        user_email: 'admin@mmu.ac.ke',
        ip_address: '192.168.1.100',
        description: 'Successful admin login',
        severity: 'low',
        timestamp: new Date().toISOString(),
        resolved: true
      },
      {
        id: '2',
        type: 'failed_login',
        user_email: 'unknown@example.com',
        ip_address: '10.0.0.1',
        description: 'Multiple failed login attempts detected',
        severity: 'medium',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        resolved: false
      },
      {
        id: '3',
        type: 'role_change',
        user_email: users?.[0]?.email,
        description: 'User role changed from student to lecturer',
        severity: 'medium',
        timestamp: new Date(Date.now() - 7200000).toISOString(),
        resolved: true
      }
    ];

    return mockEvents;
  } catch (error) {
    console.error('Error fetching security events:', error);
    return [];
  }
};

// Get faculty management data
export const getFacultyManagement = async (): Promise<FacultyManagement[]> => {
  try {
    // Get all faculties from users table
    const { data: facultyData, error } = await supabase
      .from('users')
      .select('faculty, role, department')
      .not('faculty', 'is', null);

    if (error) throw error;

    // Group by faculty
    const facultyGroups = facultyData?.reduce((acc, user) => {
      if (!acc[user.faculty]) {
        acc[user.faculty] = {
          students: 0,
          lecturers: 0,
          deans: 0,
          departments: new Set()
        };
      }
      
      if (user.role === 'student') acc[user.faculty].students++;
      if (user.role === 'lecturer') acc[user.faculty].lecturers++;
      if (user.role === 'dean') acc[user.faculty].deans++;
      if (user.department) acc[user.faculty].departments.add(user.department);
      
      return acc;
    }, {} as Record<string, any>) || {};

    // Get course counts by faculty
    const { data: courses } = await supabase
      .from('courses')
      .select('department');

    const courseCounts = courses?.reduce((acc, course) => {
      acc[course.department] = (acc[course.department] || 0) + 1;
      return acc;
    }, {} as Record<string, number>) || {};

    // Convert to FacultyManagement array
    return Object.entries(facultyGroups).map(([facultyName, data]) => ({
      id: facultyName.toLowerCase().replace(/\s+/g, '-'),
      name: facultyName,
      shortName: facultyName.split(' ').map(word => word[0]).join(''),
      dean: 'TBD', // This would come from a specific dean assignment
      totalStudents: data.students,
      totalLecturers: data.lecturers,
      totalCourses: courseCounts[facultyName] || 0,
      totalDepartments: data.departments.size,
      status: 'active' as const,
      created_at: new Date().toISOString()
    }));
  } catch (error) {
    console.error('Error fetching faculty management data:', error);
    return [];
  }
};

// Update user role
export const updateUserRole = async (userId: string, newRole: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({ role: newRole })
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating user role:', error);
    return false;
  }
};

// Delete user (basic - only from users table)
export const deleteUser = async (userId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', userId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting user:', error);
    return false;
  }
};

// Comprehensive user deletion with all related data
export const deleteUserCompletely = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    // First, get the user data to find auth_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('auth_id, email, full_name, role')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return { success: false, error: 'User not found' };
    }

    const authId = userData.auth_id;

    // Start transaction-like operations
    // Note: Supabase doesn't support transactions in client, so we'll do sequential operations
    // with error handling to rollback if needed

    const deletionSteps = [];

    try {
      // 1. Delete from tables that reference users(auth_id)
      // Only include tables that actually exist and have the correct column names
      const tablesToClean = [
        'course_enrollments',
        'assignment_submissions',
        'exam_attempts',
        'class_attendance',
        'notifications',
        'announcement_reads',
        'analytics_data'
        // Removed: student_fees, payment_history (columns don't exist)
      ];

      for (const table of tablesToClean) {
        try {
          // First check if there are records to delete
          const { data: existingRecords, error: checkError } = await supabase
            .from(table)
            .select('id')
            .eq('user_id', authId);

          if (checkError) {
            console.warn(`Warning: Could not check ${table}:`, checkError.message);
            deletionSteps.push(`Warning: Could not check ${table} - ${checkError.message}`);
            continue;
          }

          const recordCount = existingRecords?.length || 0;
          console.log(`Found ${recordCount} records in ${table}`);

          if (recordCount === 0) {
            deletionSteps.push(`Deleted 0 records from ${table}`);
            continue;
          }

          // Attempt deletion
          const { error, data } = await supabase
            .from(table)
            .delete()
            .eq('user_id', authId)
            .select();

          if (error) {
            console.warn(`Warning: Could not delete from ${table}:`, error.message);
            deletionSteps.push(`Warning: Failed to delete from ${table} - ${error.message}`);
          } else {
            const deletedCount = data?.length || 0;
            console.log(`Deleted ${deletedCount} records from ${table}`);
            deletionSteps.push(`Deleted ${deletedCount} records from ${table}`);

            // Verify deletion was complete
            if (deletedCount < recordCount) {
              console.warn(`Warning: Only deleted ${deletedCount}/${recordCount} records from ${table}`);
            }
          }
        } catch (tableError) {
          console.warn(`Error processing ${table}:`, tableError);
          deletionSteps.push(`Error: Could not process ${table}`);
        }
      }

      // 2. Delete records where user is referenced as creator/grader
      // Only include tables and columns that actually exist
      const creatorTables = [
        { table: 'courses', column: 'created_by' },
        { table: 'assignments', column: 'created_by' },
        { table: 'assignment_submissions', column: 'graded_by' },
        { table: 'exam_answers', column: 'graded_by' },
        { table: 'class_attendance', column: 'marked_by' },
        { table: 'course_materials', column: 'created_by' },
        { table: 'announcements', column: 'created_by' },
        { table: 'system_settings', column: 'created_by' },
        { table: 'system_settings', column: 'updated_by' }
        // Removed: class_sessions.created_by, session_attachments.uploaded_by (don't exist)
      ];

      for (const { table, column } of creatorTables) {
        // For creator/grader references, we'll set them to null instead of deleting the records
        const { error } = await supabase
          .from(table)
          .update({ [column]: null })
          .eq(column, authId);

        if (error) {
          console.warn(`Warning: Could not update ${table}.${column}:`, error.message);
        } else {
          deletionSteps.push(`Updated ${table}.${column} to null`);
        }
      }

      // 3. Delete from conversations and messages
      const { error: messagesError } = await supabase
        .from('messages')
        .delete()
        .eq('sender_id', authId);

      if (!messagesError) {
        deletionSteps.push('Deleted messages');
      }

      // 4. Final cleanup check - verify no remaining references
      console.log('Checking for remaining references...');

      // Check notifications specifically since it caused the error
      const { data: remainingNotifications, error: checkError } = await supabase
        .from('notifications')
        .select('id')
        .eq('user_id', authId);

      if (checkError) {
        console.warn('Could not check remaining notifications:', checkError.message);
      } else if (remainingNotifications && remainingNotifications.length > 0) {
        console.log(`Found ${remainingNotifications.length} remaining notifications, force deleting...`);

        // Try multiple deletion approaches
        let deletionSuccess = false;

        // Approach 1: Direct deletion
        const { error: forceNotifError, data: deletedNotifs } = await supabase
          .from('notifications')
          .delete()
          .eq('user_id', authId)
          .select();

        if (forceNotifError) {
          console.error('Force notification deletion failed:', forceNotifError);

          // Approach 2: Delete by individual IDs
          console.log('Trying individual notification deletion...');
          let individualDeleteCount = 0;
          for (const notif of remainingNotifications) {
            const { error: individualError } = await supabase
              .from('notifications')
              .delete()
              .eq('id', notif.id);

            if (!individualError) {
              individualDeleteCount++;
            }
          }

          if (individualDeleteCount > 0) {
            deletionSteps.push(`Force deleted ${individualDeleteCount} notifications individually`);
            deletionSuccess = true;
          }
        } else {
          const deletedCount = deletedNotifs?.length || 0;
          deletionSteps.push(`Force deleted ${deletedCount} remaining notifications`);
          deletionSuccess = true;
        }

        if (!deletionSuccess) {
          console.error('Could not delete remaining notifications - deletion may fail');
        }
      } else {
        console.log('No remaining notifications found');
      }

      // 5. Delete from users table
      console.log(`Attempting to delete user with ID: ${userId}`);
      console.log(`User auth_id: ${authId}`);

      // Try deleting by ID first
      const { error: userDeleteError, data: deletedData } = await supabase
        .from('users')
        .delete()
        .eq('id', userId)
        .select();

      if (userDeleteError) {
        console.error('User deletion error (by ID):', userDeleteError);

        // If deletion by ID fails, try by auth_id
        console.log('Trying deletion by auth_id...');
        const { error: authDeleteError, data: authDeletedData } = await supabase
          .from('users')
          .delete()
          .eq('auth_id', authId)
          .select();

        if (authDeleteError) {
          console.error('User deletion error (by auth_id):', authDeleteError);
          throw new Error(`Failed to delete user record: ${authDeleteError.message}`);
        }

        console.log('User deletion result (by auth_id):', authDeletedData);
      } else {
        console.log('User deletion result (by ID):', deletedData);
      }

      deletionSteps.push('Deleted user record');

      // 5. Delete from Supabase auth (this will prevent login completely)
      console.log('Attempting to delete from Supabase auth...');
      try {
        const { data, error } = await supabase.functions.invoke('admin-delete-user', {
          body: { authId }
        });

        if (error) {
          console.warn('Could not delete from Supabase auth:', error.message);
          console.warn('User can still authenticate but has no profile data');
          deletionSteps.push('Warning: Auth record not deleted - user may still be able to authenticate');
        } else if (data?.success) {
          console.log('Successfully deleted from Supabase auth');
          deletionSteps.push('Deleted from Supabase auth - login completely prevented');
        } else {
          console.warn('Auth deletion failed:', data?.error || 'Unknown error');
          deletionSteps.push('Warning: Auth record not deleted - user may still be able to authenticate');
        }
      } catch (authError) {
        console.warn('Error deleting from Supabase auth:', authError);
        deletionSteps.push('Warning: Could not delete auth record');
      }

      // Log the successful deletion
      console.log(`User ${userData.email} (${userData.full_name}) deleted successfully:`, deletionSteps);

      return { success: true };

    } catch (error) {
      console.error('Error during user deletion:', error);
      return { success: false, error: error.message };
    }

  } catch (error) {
    console.error('Error in deleteUserCompletely:', error);
    return { success: false, error: 'Failed to delete user completely' };
  }
};

// Check for remaining foreign key references
export const checkRemainingReferences = async (authId: string): Promise<any> => {
  try {
    console.log('Checking for remaining foreign key references...');

    const checks = [
      { table: 'notifications', column: 'user_id' },
      { table: 'course_enrollments', column: 'user_id' },
      { table: 'assignment_submissions', column: 'user_id' },
      { table: 'exam_attempts', column: 'user_id' },
      { table: 'class_attendance', column: 'user_id' },
      { table: 'announcement_reads', column: 'user_id' },
      { table: 'analytics_data', column: 'user_id' },
      { table: 'messages', column: 'sender_id' }
    ];

    const results = {};

    for (const check of checks) {
      try {
        const { data, error } = await supabase
          .from(check.table)
          .select('id')
          .eq(check.column, authId);

        if (!error && data) {
          results[check.table] = data.length;
          if (data.length > 0) {
            console.log(`Found ${data.length} remaining references in ${check.table}`);
          }
        }
      } catch (error) {
        console.log(`Could not check ${check.table}:`, error.message);
        results[check.table] = 'error';
      }
    }

    return results;
  } catch (error) {
    console.error('Error checking remaining references:', error);
    return null;
  }
};

// Force cleanup of remaining references
export const forceCleanupReferences = async (authId: string): Promise<{ success: boolean; results: any }> => {
  try {
    console.log('Force cleaning up remaining references...');

    const tablesToForceClean = [
      'notifications',
      'course_enrollments',
      'assignment_submissions',
      'exam_attempts',
      'class_attendance',
      'announcement_reads',
      'analytics_data'
    ];

    const results = {};

    for (const table of tablesToForceClean) {
      try {
        const { error, data } = await supabase
          .from(table)
          .delete()
          .eq('user_id', authId)
          .select();

        if (error) {
          results[table] = { success: false, error: error.message };
        } else {
          results[table] = { success: true, deleted: data?.length || 0 };
        }
      } catch (error) {
        results[table] = { success: false, error: error.message };
      }
    }

    // Also clean messages
    try {
      const { error, data } = await supabase
        .from('messages')
        .delete()
        .eq('sender_id', authId)
        .select();

      if (error) {
        results['messages'] = { success: false, error: error.message };
      } else {
        results['messages'] = { success: true, deleted: data?.length || 0 };
      }
    } catch (error) {
      results['messages'] = { success: false, error: error.message };
    }

    return { success: true, results };
  } catch (error) {
    console.error('Error in force cleanup:', error);
    return { success: false, results: { error: error.message } };
  }
};

// Simple direct user deletion (for testing RLS issues)
export const deleteUserDirect = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log(`Direct deletion attempt for user ID: ${userId}`);

    // First check if user exists
    const existsBefore = await checkUserExists(userId);
    console.log('User exists before direct deletion:', existsBefore);

    const { error, data } = await supabase
      .from('users')
      .delete()
      .eq('id', userId)
      .select();

    if (error) {
      console.error('Direct deletion error:', error);
      return { success: false, error: error.message };
    }

    console.log('Direct deletion result:', data);
    console.log('Number of rows deleted:', data?.length || 0);

    // Verify deletion
    const existsAfter = await checkUserExists(userId);
    console.log('User exists after direct deletion:', existsAfter);

    const actuallyDeleted = existsBefore && !existsAfter;
    console.log('Actually deleted:', actuallyDeleted);

    return {
      success: actuallyDeleted,
      error: actuallyDeleted ? undefined : 'User still exists after deletion attempt'
    };
  } catch (error) {
    console.error('Error in deleteUserDirect:', error);
    return { success: false, error: 'Failed to delete user directly' };
  }
};

// Debug function to check if user exists
export const checkUserExists = async (userId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();

    if (error) {
      console.log('User does not exist or error:', error.message);
      return false;
    }

    console.log('User exists:', !!data);
    return !!data;
  } catch (error) {
    console.error('Error checking user existence:', error);
    return false;
  }
};

// Check if user still exists in Supabase auth
export const checkAuthUserExists = async (authId: string): Promise<boolean> => {
  try {
    // For now, we'll assume auth user exists if we can't check directly
    // This is because checking auth users also requires admin privileges
    // In practice, if the profile is deleted, the user is effectively locked out
    console.log('Auth user existence check - assuming exists (requires admin privileges to verify)');
    return true; // Conservative assumption
  } catch (error) {
    console.error('Error checking auth user existence:', error);
    return true; // Conservative assumption
  }
};

// Comprehensive deletion status check
export const checkDeletionStatus = async (userId: string) => {
  try {
    // Get user info first
    const { data: userData } = await supabase
      .from('users')
      .select('auth_id, email, full_name')
      .eq('id', userId)
      .single();

    const profileExists = !!userData;
    const authExists = userData ? await checkAuthUserExists(userData.auth_id) : false;

    const status = {
      userId,
      authId: userData?.auth_id,
      email: userData?.email,
      profileExists,
      authExists,
      canLogin: authExists,
      fullyDeleted: !profileExists && !authExists,
      partiallyDeleted: !profileExists && authExists
    };

    console.log('Deletion Status:', status);
    return status;
  } catch (error) {
    console.error('Error checking deletion status:', error);
    return null;
  }
};

// Test function for debugging deletion issues (defined after getUserDeletionInfo)
// This will be defined at the end of the file to avoid circular references

// Soft delete user (mark as inactive instead of permanent deletion)
export const deactivateUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        is_active: false,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error deactivating user:', error);
    return { success: false, error: 'Failed to deactivate user' };
  }
};

// Reactivate user
export const reactivateUser = async (userId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        is_active: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  } catch (error) {
    console.error('Error reactivating user:', error);
    return { success: false, error: 'Failed to reactivate user' };
  }
};

// Bulk delete users
export const bulkDeleteUsers = async (userIds: string[]): Promise<{
  success: boolean;
  results: Array<{ userId: string; success: boolean; error?: string }>;
  summary: { successful: number; failed: number; total: number };
}> => {
  const results = [];
  let successful = 0;
  let failed = 0;

  for (const userId of userIds) {
    const result = await deleteUserCompletely(userId);
    results.push({
      userId,
      success: result.success,
      error: result.error
    });

    if (result.success) {
      successful++;
    } else {
      failed++;
    }
  }

  return {
    success: failed === 0,
    results,
    summary: {
      successful,
      failed,
      total: userIds.length
    }
  };
};

// Bulk deactivate users
export const bulkDeactivateUsers = async (userIds: string[]): Promise<{
  success: boolean;
  results: Array<{ userId: string; success: boolean; error?: string }>;
  summary: { successful: number; failed: number; total: number };
}> => {
  const results = [];
  let successful = 0;
  let failed = 0;

  for (const userId of userIds) {
    const result = await deactivateUser(userId);
    results.push({
      userId,
      success: result.success,
      error: result.error
    });

    if (result.success) {
      successful++;
    } else {
      failed++;
    }
  }

  return {
    success: failed === 0,
    results,
    summary: {
      successful,
      failed,
      total: userIds.length
    }
  };
};

// Log admin action for audit trail
export const logAdminAction = async (
  adminId: string,
  action: string,
  targetUserId?: string,
  details?: any
): Promise<void> => {
  try {
    // Simplified logging - just log to console for now since analytics_data schema is different
    console.log('Admin Action:', {
      admin_id: adminId,
      action,
      target_user_id: targetUserId,
      details,
      timestamp: new Date().toISOString()
    });

    // Try to insert into analytics_data with simpler structure
    const { error } = await supabase
      .from('analytics_data')
      .insert({
        user_id: adminId,
        activity_type: 'admin_action',
        created_at: new Date().toISOString()
      });

    if (error) {
      console.warn('Could not log to analytics_data:', error.message);
    }
  } catch (error) {
    console.error('Error in logAdminAction:', error);
  }
};

// Get user deletion confirmation data
export const getUserDeletionInfo = async (userId: string): Promise<{
  user: any;
  relatedData: {
    enrollments: number;
    submissions: number;
    createdCourses: number;
    createdAssignments: number;
    messages: number;
  };
} | null> => {
  try {
    // Get user data
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return null;
    }

    const authId = userData.auth_id;

    // Get related data counts
    const [enrollments, submissions, createdCourses, createdAssignments, messages] = await Promise.all([
      supabase.from('course_enrollments').select('id', { count: 'exact', head: true }).eq('user_id', authId),
      supabase.from('assignment_submissions').select('id', { count: 'exact', head: true }).eq('user_id', authId),
      supabase.from('courses').select('id', { count: 'exact', head: true }).eq('created_by', authId),
      supabase.from('assignments').select('id', { count: 'exact', head: true }).eq('created_by', authId),
      supabase.from('messages').select('id', { count: 'exact', head: true }).eq('sender_id', authId)
    ]);

    return {
      user: userData,
      relatedData: {
        enrollments: enrollments.count || 0,
        submissions: submissions.count || 0,
        createdCourses: createdCourses.count || 0,
        createdAssignments: createdAssignments.count || 0,
        messages: messages.count || 0
      }
    };
  } catch (error) {
    console.error('Error getting user deletion info:', error);
    return null;
  }
};

// Get system settings
export const getSystemSettings = async () => {
  try {
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value, setting_type');

    if (error) {
      console.error('Error fetching system settings:', error);
      throw error;
    }

    // Transform the array of settings into a flat object
    const settingsObject: any = {};

    if (settings) {
      settings.forEach((setting) => {
        let value = setting.setting_value;

        // Parse JSON values based on type
        if (setting.setting_type === 'string') {
          // For strings, the value is already properly parsed by Supabase JSONB
          value = setting.setting_value;
        } else if (setting.setting_type === 'boolean' || setting.setting_type === 'number') {
          // Booleans and numbers are stored directly in JSONB
          value = setting.setting_value;
        } else if (setting.setting_type === 'object' || setting.setting_type === 'array') {
          // Objects and arrays are already parsed as JSON by Supabase
          value = setting.setting_value;
        }

        settingsObject[setting.setting_key] = value;
      });
    }

    // Ensure we have default values for critical settings
    const defaultSettings = {
      site_name: 'MMU Learning Management System',
      site_description: 'Elevating Learning, Empowering Futures',
      site_url: 'https://lms.mmu.ac.ke',
      maintenance_mode: false,
      registration_enabled: true,
      signup_page_visible: true,
      welcome_message: 'Welcome to MMU Digital Campus Experience',
      email_notifications: true,
      max_file_size: 50,
      session_timeout: 30,
      max_login_attempts: 5,
      lockout_duration: 15,
      password_policy: {
        minLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumbers: true,
        requireSpecialChars: false
      },
      two_factor_enabled: false,
      force_password_change: false,
      backup_frequency: 'daily',
      log_retention: 90,
      max_concurrent_sessions: 3,
      system_maintenance_window: '02:00-04:00',
      theme: 'light',
      primary_color: '#2563eb',
      secondary_color: '#dc2626',
      logo_url: '',
      favicon_url: '',
      custom_css: '',
      show_mmu_branding: true,
      push_notifications: true,
      notification_retention: 30,
      digest_frequency: 'daily',
      announcement_notifications: true,
      assignment_notifications: true,
      grade_notifications: true,
      system_alerts: true,
      default_language: 'en',
      timezone: 'Africa/Nairobi'
    };

    return { ...defaultSettings, ...settingsObject };
  } catch (error) {
    console.error('Error fetching system settings:', error);
    throw error;
  }
};

// Update system settings
export const updateSystemSettings = async (settings: any): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get current user info to verify admin role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    // Get existing settings to preserve category information
    const { data: existingSettings, error: fetchError } = await supabase
      .from('system_settings')
      .select('setting_key, category, description, is_public');

    if (fetchError) {
      console.error('Error fetching existing settings:', fetchError);
      throw fetchError;
    }

    // Create a map of existing settings for quick lookup
    const existingSettingsMap = new Map();
    if (existingSettings) {
      existingSettings.forEach(setting => {
        existingSettingsMap.set(setting.setting_key, setting);
      });
    }

    // Define category mapping for new settings
    const categoryMapping: Record<string, string> = {
      // General settings
      'site_name': 'general',
      'site_description': 'general',
      'site_url': 'general',
      'maintenance_mode': 'general',
      'registration_enabled': 'general',
      'signup_page_visible': 'general',
      'default_language': 'general',
      'timezone': 'general',
      'welcome_message': 'general',
      'show_mmu_branding': 'general',

      // Security settings
      'session_timeout': 'security',
      'max_login_attempts': 'security',
      'lockout_duration': 'security',
      'password_policy': 'security',
      'two_factor_enabled': 'security',
      'force_password_change': 'security',

      // Email settings
      'email_notifications': 'email',
      'smtp_host': 'email',
      'smtp_port': 'email',
      'smtp_username': 'email',
      'smtp_password': 'email',
      'smtp_encryption': 'email',
      'from_email': 'email',
      'from_name': 'email',

      // System settings
      'max_file_size': 'system',
      'allowed_file_types': 'system',
      'backup_frequency': 'system',
      'log_retention': 'system',
      'max_concurrent_sessions': 'system',
      'system_maintenance_window': 'system',
      'auto_logout_warning': 'system',

      // Appearance settings
      'theme': 'appearance',
      'primary_color': 'appearance',
      'secondary_color': 'appearance',
      'logo_url': 'appearance',
      'favicon_url': 'appearance',
      'custom_css': 'appearance',

      // Notification settings
      'push_notifications': 'notifications',
      'notification_retention': 'notifications',
      'digest_frequency': 'notifications',
      'announcement_notifications': 'notifications',
      'assignment_notifications': 'notifications',
      'grade_notifications': 'notifications',
      'system_alerts': 'notifications'
    };

    const updates = [];

    // Prepare updates for each setting
    for (const [key, value] of Object.entries(settings)) {
      let settingValue: any;
      let settingType: string;

      // Determine the type and format the value for JSONB storage
      if (typeof value === 'string') {
        settingValue = value; // Store strings directly without JSON.stringify
        settingType = 'string';
      } else if (typeof value === 'number') {
        settingValue = value;
        settingType = 'number';
      } else if (typeof value === 'boolean') {
        settingValue = value; // Boolean values can be stored directly in JSONB
        settingType = 'boolean';
      } else if (Array.isArray(value)) {
        settingValue = value;
        settingType = 'array';
      } else if (typeof value === 'object' && value !== null) {
        settingValue = value;
        settingType = 'object';
      } else {
        continue; // Skip invalid values
      }

      // Get existing setting info or use defaults
      const existingSetting = existingSettingsMap.get(key);
      const category = existingSetting?.category || categoryMapping[key] || 'general';
      const description = existingSetting?.description || `Setting for ${key}`;
      const isPublic = existingSetting?.is_public || false;

      updates.push({
        setting_key: key,
        setting_value: settingValue,
        setting_type: settingType,
        category: category,
        description: description,
        is_public: isPublic,
        updated_by: user.id
      });
    }

    // Perform batch update using upsert
    const { error } = await supabase
      .from('system_settings')
      .upsert(updates, {
        onConflict: 'setting_key',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error updating system settings:', error);
      throw error;
    }

    console.log('System settings updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating system settings:', error);
    return false;
  }
};

// Get settings by category
export const getSettingsByCategory = async (category: string) => {
  try {
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value, setting_type, description')
      .eq('category', category);

    if (error) {
      console.error('Error fetching settings by category:', error);
      throw error;
    }

    const settingsObject: any = {};

    if (settings) {
      settings.forEach((setting) => {
        // Value is already properly parsed by Supabase JSONB
        settingsObject[setting.setting_key] = setting.setting_value;
      });
    }

    return settingsObject;
  } catch (error) {
    console.error('Error fetching settings by category:', error);
    throw error;
  }
};

// Get public settings (for non-admin users)
export const getPublicSettings = async () => {
  try {
    const { data: settings, error } = await supabase
      .from('system_settings')
      .select('setting_key, setting_value, setting_type')
      .eq('is_public', true);

    if (error) {
      console.error('Error fetching public settings:', error);
      throw error;
    }

    const settingsObject: any = {};

    if (settings) {
      settings.forEach((setting) => {
        // Value is already properly parsed by Supabase JSONB
        settingsObject[setting.setting_key] = setting.setting_value;
      });
    }

    // Log warning if critical registration settings are missing (only in development)
    if (import.meta.env.DEV) {
      if (settingsObject.registration_enabled === undefined) {
        console.warn('Registration enabled setting NOT found in public settings');
      }

      if (settingsObject.signup_page_visible === undefined) {
        console.warn('Signup page visible setting NOT found in public settings');
      }
    }

    return settingsObject;
  } catch (error) {
    console.error('Error fetching public settings:', error);
    throw error;
  }
};

// Update a single setting
export const updateSingleSetting = async (key: string, value: any): Promise<boolean> => {
  try {
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('User not authenticated');
    }

    // Get current user info to verify admin role
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single();

    if (userError || userData?.role !== 'admin') {
      throw new Error('Unauthorized: Admin access required');
    }

    // Get existing setting to preserve category and other fields
    const { data: existingSetting } = await supabase
      .from('system_settings')
      .select('category, description, is_public')
      .eq('setting_key', key)
      .single();

    let settingValue: any;
    let settingType: string;

    // Determine the type and format the value for JSONB storage
    if (typeof value === 'string') {
      settingValue = value; // Store strings directly without JSON.stringify
      settingType = 'string';
    } else if (typeof value === 'number') {
      settingValue = value;
      settingType = 'number';
    } else if (typeof value === 'boolean') {
      settingValue = value; // Boolean values can be stored directly in JSONB
      settingType = 'boolean';
    } else if (Array.isArray(value)) {
      settingValue = value;
      settingType = 'array';
    } else if (typeof value === 'object' && value !== null) {
      settingValue = value;
      settingType = 'object';
    } else {
      throw new Error('Invalid setting value type');
    }

    const { error } = await supabase
      .from('system_settings')
      .upsert({
        setting_key: key,
        setting_value: settingValue,
        setting_type: settingType,
        category: existingSetting?.category || 'general',
        description: existingSetting?.description || `Setting for ${key}`,
        is_public: existingSetting?.is_public || false,
        updated_by: user.id
      }, {
        onConflict: 'setting_key',
        ignoreDuplicates: false
      });

    if (error) {
      console.error('Error updating setting:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error updating setting:', error);
    return false;
  }
};

// Get database statistics
export const getDatabaseStats = async () => {
  try {
    const tables = ['users', 'courses', 'course_enrollments', 'assignments', 'assignment_submissions'];
    const stats = {};

    for (const table of tables) {
      const { count, error } = await supabase
        .from(table)
        .select('*', { count: 'exact', head: true });

      if (!error) {
        stats[table] = count || 0;
      }
    }

    return {
      tables: stats,
      totalRecords: Object.values(stats).reduce((sum: number, count: any) => sum + count, 0),
      databaseSize: '2.3 GB', // This would come from actual database metrics
      connections: 15,
      queries: 1247
    };
  } catch (error) {
    console.error('Error fetching database stats:', error);
    throw error;
  }
};

// Test function for debugging deletion issues (defined at end to avoid circular references)
export const testUserDeletion = async (userId: string) => {
  console.log('🧪 Testing user deletion for ID:', userId);

  // Check if user exists before deletion
  const existsBefore = await checkUserExists(userId);
  console.log('User exists before deletion:', existsBefore);

  if (!existsBefore) {
    console.log('❌ User does not exist, cannot test deletion');
    return;
  }

  // Get user info
  const userInfo = await getUserDeletionInfo(userId);
  console.log('User info:', userInfo);

  // Test the deletion
  console.log('🗑️ Attempting deletion...');
  const result = await deleteUserCompletely(userId);
  console.log('Deletion result:', result);

  // Check if user exists after deletion
  const existsAfter = await checkUserExists(userId);
  console.log('User exists after deletion:', existsAfter);

  if (result.success && !existsAfter) {
    console.log('✅ Deletion successful and verified');
  } else if (result.success && existsAfter) {
    console.log('⚠️ Deletion reported success but user still exists');
  } else {
    console.log('❌ Deletion failed');
  }

  return {
    existsBefore,
    deletionResult: result,
    existsAfter,
    success: result.success && !existsAfter
  };
};

// Complete user deletion using server-side Edge Function (bypasses RLS)
export const deleteUserCompletelyServer = async (userId: string): Promise<{ success: boolean; error?: string; steps?: string[] }> => {
  try {
    // First get the user data to find auth_id
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('auth_id, email, full_name')
      .eq('id', userId)
      .single();

    if (userError || !userData) {
      return { success: false, error: 'User not found' };
    }

    console.log('Using server-side deletion for user:', userData.email);

    try {
      const { data, error } = await supabase.functions.invoke('admin-delete-user-complete', {
        body: {
          userId: userId,
          authId: userData.auth_id
        }
      });

      if (error) {
        console.error('Server-side deletion error:', error);
        console.log('Falling back to direct database deletion...');
        return await deleteUserDirectDatabase(userId, userData.auth_id);
      }

      console.log('Server-side deletion response:', data);
      return data;
    } catch (edgeFunctionError) {
      console.error('Edge Function failed:', edgeFunctionError);
      console.log('Falling back to direct database deletion...');
      return await deleteUserDirectDatabase(userId, userData.auth_id);
    }
  } catch (error) {
    console.error('Error in server-side deletion:', error);
    return { success: false, error: 'Failed to delete user' };
  }
};

// Direct database deletion as fallback (uses SQL queries)
export const deleteUserDirectDatabase = async (userId: string, authId: string): Promise<{ success: boolean; error?: string; steps?: string[] }> => {
  try {
    console.log('Using direct database deletion via SQL function...');

    // Use comprehensive SQL function for deletion (bypasses RLS)
    const { data, error } = await supabase.rpc('delete_user_completely_sql', {
      target_user_id: userId,
      target_auth_id: authId
    });

    if (error) {
      console.error('SQL function error:', error);
      console.log('Trying manual cleanup approach...');

      // Fallback to manual cleanup
      const result = await forceCleanupReferences(authId);
      if (result.success) {
        // Try regular deletion after cleanup
        const regularResult = await deleteUserCompletely(userId);
        return regularResult;
      } else {
        return { success: false, error: 'Manual cleanup failed' };
      }
    }

    console.log('SQL deletion result:', data);

    if (data?.success) {
      // Also try to delete from Supabase auth
      try {
        const authResult = await testAuthDeletion(authId);
        if (authResult.success) {
          data.steps.push('Deleted from Supabase auth');
        } else {
          data.steps.push('Warning: Auth record not deleted');
        }
      } catch (authError) {
        data.steps.push('Warning: Could not delete auth record');
      }
    }

    return data;

  } catch (error) {
    console.error('Error in direct database deletion:', error);
    return { success: false, error: 'Direct database deletion failed' };
  }
};

// Test the Edge Function for auth deletion
export const testAuthDeletion = async (authId: string): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Testing Edge Function auth deletion for:', authId);

    const { data, error } = await supabase.functions.invoke('admin-delete-user', {
      body: { authId }
    });

    if (error) {
      console.error('Edge Function error:', error);
      return { success: false, error: error.message };
    }

    console.log('Edge Function response:', data);
    return data;
  } catch (error) {
    console.error('Error calling Edge Function:', error);
    return { success: false, error: 'Failed to call Edge Function' };
  }
};

// Make functions available in browser console for debugging
if (typeof window !== 'undefined') {
  (window as any).debugUserDeletion = {
    checkUserExists,
    checkAuthUserExists,
    checkDeletionStatus,
    checkRemainingReferences,
    forceCleanupReferences,
    testUserDeletion,
    testAuthDeletion,
    deleteUserCompletely,
    deleteUserCompletelyServer,
    deleteUserDirect,
    getUserDeletionInfo
  };
  console.log('🔧 Debug functions available: window.debugUserDeletion');
  console.log('🔧 Try: await window.debugUserDeletion.deleteUserCompletelyServer("user-id")');
  console.log('🔧 Try: await window.debugUserDeletion.testAuthDeletion("auth-id")');
}
