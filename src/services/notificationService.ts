import { supabase } from '@/lib/supabaseClient';
import { sampleNotifications, PublicNotification } from '@/data/mmuData';

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'success' | 'error' | 'assignment' | 'announcement' | 'grade' | 'class';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  isRead: boolean;
  createdAt: string;
  actionUrl?: string;
  relatedId?: string;
  userId: string;
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
  authorRole: string;
  createdAt: string;
  expiresAt?: string;
  category: string;
  externalLink?: string;
  attachments?: string[];
  isActive: boolean;
}

export interface EnhancedNotification {
  id: string;
  title: string;
  content: string;
  category: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  sender: {
    name: string;
    avatar: string;
    role: string;
  };
  date: string;
  isPublic: boolean;
  courseName?: string;
  externalLink?: string;
  isRead: boolean;
  type: 'notification' | 'announcement';
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
      type: notification.type as 'info' | 'warning' | 'success' | 'error' | 'assignment' | 'announcement' | 'grade' | 'class',
      priority: notification.priority as 'low' | 'medium' | 'high' | 'urgent',
      isRead: notification.is_read,
      createdAt: notification.created_at,
      actionUrl: notification.action_url,
      relatedId: notification.related_id,
      userId: notification.user_id
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
      authorRole: announcement.users?.role || 'Unknown',
      createdAt: announcement.created_at,
      expiresAt: announcement.expires_at,
      category: announcement.category || 'General',
      externalLink: announcement.external_link,
      attachments: announcement.attachments,
      isActive: announcement.is_active ?? true
    })) || [];
  } catch (error) {
    console.error('Error fetching course announcements:', error);
    return [];
  }
};



// Get unified notifications and announcements for a user
export const getUnifiedNotifications = async (userId: string): Promise<EnhancedNotification[]> => {
  try {
    // Get user notifications
    const { data: notifications, error: notifError } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(20);

    if (notifError) throw notifError;

    // Get announcements (both public and course-specific)
    const { data: announcements, error: announcementError } = await supabase
      .from('announcements')
      .select(`
        *,
        users!announcements_created_by_fkey (
          full_name,
          role
        ),
        courses (
          title
        )
      `)
      .or(`is_public.eq.true,course_id.in.(${await getUserCourseIds(userId)})`)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(30);

    if (announcementError) throw announcementError;

    // Transform notifications
    const transformedNotifications: EnhancedNotification[] = notifications?.map(notif => ({
      id: notif.id,
      title: notif.title,
      content: notif.message,
      category: getCategoryFromType(notif.type),
      priority: notif.priority as 'low' | 'normal' | 'high' | 'urgent',
      sender: {
        name: 'System',
        avatar: '/placeholder.svg',
        role: 'System'
      },
      date: notif.created_at,
      isPublic: false,
      externalLink: notif.action_url,
      isRead: notif.is_read,
      type: 'notification'
    })) || [];

    // Transform announcements with read status
    const transformedAnnouncements: EnhancedNotification[] = [];
    if (announcements) {
      for (const announcement of announcements) {
        const isRead = await isAnnouncementRead(userId, announcement.id);
        transformedAnnouncements.push({
          id: announcement.id,
          title: announcement.title,
          content: announcement.content,
          category: announcement.category || 'General',
          priority: announcement.priority as 'low' | 'normal' | 'high' | 'urgent',
          sender: {
            name: announcement.users?.full_name || 'Unknown',
            avatar: '/placeholder.svg',
            role: announcement.users?.role || 'Unknown'
          },
          date: announcement.created_at,
          isPublic: announcement.is_public,
          courseName: announcement.courses?.title,
          externalLink: announcement.external_link,
          isRead,
          type: 'announcement'
        });
      }
    }

    // Combine and sort by date
    const combined = [...transformedNotifications, ...transformedAnnouncements];
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  } catch (error) {
    console.error('Error fetching unified notifications:', error);
    return [];
  }
};

// Helper function to get user's course IDs
const getUserCourseIds = async (userId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('enrollments')
      .select('course_id')
      .eq('user_id', userId);

    if (error) throw error;
    return data?.map(enrollment => enrollment.course_id).join(',') || '';
  } catch (error) {
    console.error('Error fetching user course IDs:', error);
    return '';
  }
};

// Helper function to convert notification type to category
const getCategoryFromType = (type: string): string => {
  switch (type) {
    case 'assignment': return 'Assignment';
    case 'announcement': return 'Announcement';
    case 'grade': return 'Grade';
    case 'class': return 'Class';
    case 'warning': return 'Important';
    case 'error': return 'Important';
    default: return 'Information';
  }
};

// Helper function to check if announcement is read
const isAnnouncementRead = async (userId: string, announcementId: string): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('announcement_reads')
      .select('id')
      .eq('user_id', userId)
      .eq('announcement_id', announcementId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return !!data;
  } catch (error) {
    console.error('Error checking announcement read status:', error);
    return false;
  }
};

// Mark announcement as read
export const markAnnouncementAsRead = async (userId: string, announcementId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('announcement_reads')
      .upsert({
        user_id: userId,
        announcement_id: announcementId,
        read_at: new Date().toISOString()
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error marking announcement as read:', error);
    return false;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (userId: string, notificationId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('notifications')
      .update({ is_read: true })
      .eq('id', notificationId)
      .eq('user_id', userId);

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
  type: 'info' | 'warning' | 'success' | 'error' | 'assignment' | 'announcement' | 'grade' | 'class' = 'info',
  priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium',
  actionUrl?: string,
  relatedId?: string
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
        related_id: relatedId,
        is_read: false
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};

// Create sample notifications for testing (remove in production)
export const createSampleNotifications = async (userId: string): Promise<boolean> => {
  try {
    // Create sample notifications
    await createNotification(
      userId,
      "New Assignment Posted",
      "Data Structures Assignment #3 has been posted. Due date: Next Friday",
      "assignment",
      "high",
      "/assignments"
    );

    await createNotification(
      userId,
      "Grade Posted",
      "Your Web Development project grade has been posted",
      "grade",
      "medium",
      "/grades"
    );

    await createNotification(
      userId,
      "Class Schedule Update",
      "Tomorrow's Database Systems class has been moved to Room 204",
      "class",
      "medium"
    );

    return true;
  } catch (error) {
    console.error('Error creating sample notifications:', error);
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
