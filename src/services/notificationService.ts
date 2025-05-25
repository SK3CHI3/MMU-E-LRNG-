import { supabase } from '@/lib/supabaseClient';
import { sampleNotifications, PublicNotification } from '@/data/mmuData';

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
}

export interface Announcement {
  id: string;
  title: string;
  content: string;
  courseId?: string;
  courseName?: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isPublic: boolean;
  createdBy: string;
  authorName: string;
  createdAt: string;
  expiresAt?: string;
}

// Get public notifications for landing page
export const getPublicNotifications = async (): Promise<PublicNotification[]> => {
  try {
    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        users!announcements_created_by_fkey (
          full_name
        )
      `)
      .eq('is_public', true)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching public notifications:', error);
      // Fallback to sample notifications
      return sampleNotifications;
    }

    // Transform database data to PublicNotification format
    const notifications: PublicNotification[] = data?.map(announcement => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      excerpt: announcement.content.substring(0, 100) + '...',
      category: 'academic' as const, // This should be a field in the database
      priority: announcement.priority as 'low' | 'medium' | 'high' | 'urgent',
      publishedAt: announcement.created_at,
      expiresAt: announcement.expires_at,
      isActive: true,
      authorId: announcement.created_by,
      authorName: announcement.users?.full_name || 'Unknown',
      clickable: true,
      externalLink: announcement.external_link,
      attachments: announcement.attachments
    })) || [];

    return notifications.length > 0 ? notifications : sampleNotifications;
  } catch (error) {
    console.error('Error in getPublicNotifications:', error);
    return sampleNotifications;
  }
};

// Get user-specific notifications
export const getUserNotifications = async (userId: string): Promise<SystemNotification[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (error) throw error;

    return data?.map(notification => ({
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type as 'info' | 'warning' | 'success' | 'error',
      priority: notification.priority as 'low' | 'medium' | 'high' | 'urgent',
      isRead: notification.is_read,
      createdAt: notification.created_at,
      actionUrl: notification.action_url
    })) || [];
  } catch (error) {
    console.error('Error fetching user notifications:', error);
    return [];
  }
};

// Get course announcements for students/lecturers
export const getCourseAnnouncements = async (courseIds: string[]): Promise<Announcement[]> => {
  try {
    if (courseIds.length === 0) return [];

    const { data, error } = await supabase
      .from('announcements')
      .select(`
        *,
        courses (
          title
        ),
        users!announcements_created_by_fkey (
          full_name
        )
      `)
      .in('course_id', courseIds)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return data?.map(announcement => ({
      id: announcement.id,
      title: announcement.title,
      content: announcement.content,
      courseId: announcement.course_id,
      courseName: announcement.courses?.title,
      priority: announcement.priority as 'low' | 'normal' | 'high' | 'urgent',
      isPublic: announcement.is_public,
      createdBy: announcement.created_by,
      authorName: announcement.users?.full_name || 'Unknown',
      createdAt: announcement.created_at,
      expiresAt: announcement.expires_at
    })) || [];
  } catch (error) {
    console.error('Error fetching course announcements:', error);
    return [];
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Create a new notification
export const createNotification = async (
  userId: string,
  title: string,
  message: string,
  type: 'info' | 'warning' | 'success' | 'error' = 'info',
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  actionUrl?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .insert({
        user_id: userId,
        title,
        message,
        type,
        priority,
        action_url: actionUrl,
        is_read: false
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};

// Create a new announcement
export const createAnnouncement = async (
  title: string,
  content: string,
  createdBy: string,
  courseId?: string,
  priority: 'low' | 'normal' | 'high' | 'urgent' = 'normal',
  isPublic: boolean = false,
  expiresAt?: string,
  externalLink?: string
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('announcements')
      .insert({
        title,
        content,
        course_id: courseId,
        priority,
        is_public: isPublic,
        created_by: createdBy,
        expires_at: expiresAt,
        external_link: externalLink,
        is_active: true
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating announcement:', error);
    return false;
  }
};

// Get unread notification count
export const getUnreadNotificationCount = async (userId: string): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('is_read', false);

    if (error) throw error;
    return count || 0;
  } catch (error) {
    console.error('Error getting unread notification count:', error);
    return 0;
  }
};
