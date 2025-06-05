import { supabase } from '@/lib/supabaseClient';

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

    console.log('getAllUsers: Found users:', users?.length || 0);

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

// Delete user
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
