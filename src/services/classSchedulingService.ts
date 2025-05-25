import { supabase } from '@/lib/supabaseClient';
import { createNotification } from './notificationService';

export interface ClassSession {
  id: string;
  courseId: string;
  courseName?: string;
  courseCode?: string;
  title: string;
  description?: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  isOnline: boolean;
  meetingLink?: string;
  meetingPassword?: string;
  maxAttendees?: number;
  sessionType: 'lecture' | 'lab' | 'tutorial' | 'seminar' | 'exam' | 'other';
  status: 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | 'postponed';
  cancellationReason?: string;
  notes?: string;
  createdBy: string;
  instructorName?: string;
  isRecurring: boolean;
  recurrencePattern?: any;
  parentSessionId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSessionData {
  courseId: string;
  title: string;
  description?: string;
  sessionDate: string;
  startTime: string;
  endTime: string;
  location?: string;
  isOnline: boolean;
  meetingLink?: string;
  meetingPassword?: string;
  maxAttendees?: number;
  sessionType: 'lecture' | 'lab' | 'tutorial' | 'seminar' | 'exam' | 'other';
  notes?: string;
  isRecurring?: boolean;
  recurrencePattern?: any;
}

export interface UpdateSessionData extends Partial<CreateSessionData> {
  status?: 'scheduled' | 'ongoing' | 'completed' | 'cancelled' | 'postponed';
  cancellationReason?: string;
}

// Get class sessions for a lecturer's courses
export const getLecturerSessions = async (lecturerId: string): Promise<ClassSession[]> => {
  try {
    const { data, error } = await supabase
      .from('class_sessions')
      .select(`
        *,
        courses (
          title,
          code
        ),
        users!class_sessions_created_by_fkey (
          full_name
        )
      `)
      .eq('created_by', lecturerId)
      .order('session_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;

    return data?.map(session => ({
      id: session.id,
      courseId: session.course_id,
      courseName: session.courses?.title,
      courseCode: session.courses?.code,
      title: session.title,
      description: session.description,
      sessionDate: session.session_date,
      startTime: session.start_time,
      endTime: session.end_time,
      location: session.location,
      isOnline: session.is_online,
      meetingLink: session.meeting_link,
      meetingPassword: session.meeting_password,
      maxAttendees: session.max_attendees,
      sessionType: session.session_type,
      status: session.status,
      cancellationReason: session.cancellation_reason,
      notes: session.notes,
      createdBy: session.created_by,
      instructorName: session.users?.full_name || 'Instructor',
      isRecurring: session.is_recurring,
      recurrencePattern: session.recurrence_pattern,
      parentSessionId: session.parent_session_id,
      createdAt: session.created_at,
      updatedAt: session.updated_at
    })) || [];
  } catch (error) {
    console.error('Error fetching lecturer sessions:', error);
    return [];
  }
};

// Get class sessions for a student's enrolled courses
export const getStudentSessions = async (studentId: string): Promise<ClassSession[]> => {
  try {
    // First get the enrolled course IDs
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('user_id', studentId)
      .eq('status', 'enrolled');

    if (enrollmentError) throw enrollmentError;

    const courseIds = enrollments?.map(e => e.course_id) || [];

    if (courseIds.length === 0) {
      return [];
    }

    const { data, error } = await supabase
      .from('class_sessions')
      .select(`
        *,
        courses (
          title,
          code
        ),
        users!class_sessions_created_by_fkey (
          full_name
        )
      `)
      .in('course_id', courseIds)
      .neq('status', 'cancelled')
      .order('session_date', { ascending: true })
      .order('start_time', { ascending: true });

    if (error) throw error;

    return data?.map(session => ({
      id: session.id,
      courseId: session.course_id,
      courseName: session.courses?.title,
      courseCode: session.courses?.code,
      title: session.title,
      description: session.description,
      sessionDate: session.session_date,
      startTime: session.start_time,
      endTime: session.end_time,
      location: session.location,
      isOnline: session.is_online,
      meetingLink: session.meeting_link,
      meetingPassword: session.meeting_password,
      maxAttendees: session.max_attendees,
      sessionType: session.session_type,
      status: session.status,
      cancellationReason: session.cancellation_reason,
      notes: session.notes,
      createdBy: session.created_by,
      instructorName: session.users?.full_name || 'Instructor',
      isRecurring: session.is_recurring,
      recurrencePattern: session.recurrence_pattern,
      parentSessionId: session.parent_session_id,
      createdAt: session.created_at,
      updatedAt: session.updated_at
    })) || [];
  } catch (error) {
    console.error('Error fetching student sessions:', error);
    return [];
  }
};

// Create a new class session
export const createClassSession = async (
  sessionData: CreateSessionData,
  createdBy: string
): Promise<ClassSession | null> => {
  try {
    const { data, error } = await supabase
      .from('class_sessions')
      .insert({
        course_id: sessionData.courseId,
        title: sessionData.title,
        description: sessionData.description,
        session_date: sessionData.sessionDate,
        start_time: sessionData.startTime,
        end_time: sessionData.endTime,
        location: sessionData.location,
        is_online: sessionData.isOnline,
        meeting_link: sessionData.meetingLink,
        meeting_password: sessionData.meetingPassword,
        max_attendees: sessionData.maxAttendees,
        session_type: sessionData.sessionType,
        notes: sessionData.notes,
        created_by: createdBy,
        is_recurring: sessionData.isRecurring || false,
        recurrence_pattern: sessionData.recurrencePattern
      })
      .select(`
        *,
        courses (
          title,
          code
        )
      `)
      .single();

    if (error) throw error;

    // Notify enrolled students about the new session immediately
    await notifyStudentsAboutSession(data.course_id, 'new', data);

    return {
      id: data.id,
      courseId: data.course_id,
      courseName: data.courses?.title,
      courseCode: data.courses?.code,
      title: data.title,
      description: data.description,
      sessionDate: data.session_date,
      startTime: data.start_time,
      endTime: data.end_time,
      location: data.location,
      isOnline: data.is_online,
      meetingLink: data.meeting_link,
      meetingPassword: data.meeting_password,
      maxAttendees: data.max_attendees,
      sessionType: data.session_type,
      status: data.status,
      cancellationReason: data.cancellation_reason,
      notes: data.notes,
      createdBy: data.created_by,
      isRecurring: data.is_recurring,
      recurrencePattern: data.recurrence_pattern,
      parentSessionId: data.parent_session_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error creating class session:', error);
    return null;
  }
};

// Update a class session
export const updateClassSession = async (
  sessionId: string,
  updateData: UpdateSessionData
): Promise<ClassSession | null> => {
  try {
    const { data, error } = await supabase
      .from('class_sessions')
      .update({
        title: updateData.title,
        description: updateData.description,
        session_date: updateData.sessionDate,
        start_time: updateData.startTime,
        end_time: updateData.endTime,
        location: updateData.location,
        is_online: updateData.isOnline,
        meeting_link: updateData.meetingLink,
        meeting_password: updateData.meetingPassword,
        max_attendees: updateData.maxAttendees,
        session_type: updateData.sessionType,
        status: updateData.status,
        cancellation_reason: updateData.cancellationReason,
        notes: updateData.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
      .select(`
        *,
        courses (
          title,
          code
        )
      `)
      .single();

    if (error) throw error;

    // Notify students about session updates
    const notificationType = updateData.status === 'cancelled' ? 'cancelled' : 'updated';
    await notifyStudentsAboutSession(data.course_id, notificationType, data);

    return {
      id: data.id,
      courseId: data.course_id,
      courseName: data.courses?.title,
      courseCode: data.courses?.code,
      title: data.title,
      description: data.description,
      sessionDate: data.session_date,
      startTime: data.start_time,
      endTime: data.end_time,
      location: data.location,
      isOnline: data.is_online,
      meetingLink: data.meeting_link,
      meetingPassword: data.meeting_password,
      maxAttendees: data.max_attendees,
      sessionType: data.session_type,
      status: data.status,
      cancellationReason: data.cancellation_reason,
      notes: data.notes,
      createdBy: data.created_by,
      isRecurring: data.is_recurring,
      recurrencePattern: data.recurrence_pattern,
      parentSessionId: data.parent_session_id,
      createdAt: data.created_at,
      updatedAt: data.updated_at
    };
  } catch (error) {
    console.error('Error updating class session:', error);
    return null;
  }
};

// Cancel a class session
export const cancelClassSession = async (
  sessionId: string,
  cancellationReason: string
): Promise<boolean> => {
  try {
    const result = await updateClassSession(sessionId, {
      status: 'cancelled',
      cancellationReason
    });

    return result !== null;
  } catch (error) {
    console.error('Error cancelling class session:', error);
    return false;
  }
};

// Delete a class session
export const deleteClassSession = async (sessionId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('class_sessions')
      .delete()
      .eq('id', sessionId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting class session:', error);
    return false;
  }
};

// Helper function to notify students about session changes
const notifyStudentsAboutSession = async (
  courseId: string,
  notificationType: 'new' | 'updated' | 'cancelled',
  sessionData: any
): Promise<void> => {
  try {
    // Get enrolled students with course information
    const { data: enrollments, error } = await supabase
      .from('course_enrollments')
      .select(`
        user_id,
        courses (
          title,
          code
        )
      `)
      .eq('course_id', courseId)
      .eq('status', 'enrolled');

    if (error) throw error;

    const studentIds = enrollments?.map(e => e.user_id) || [];
    const courseInfo = enrollments?.[0]?.courses as any;

    if (studentIds.length === 0) {
      console.log('No enrolled students found for course:', courseId);
      return;
    }

    // Format date and time for better readability
    const sessionDate = new Date(sessionData.session_date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });

    const sessionTime = new Date(`2000-01-01T${sessionData.start_time}`).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    // Create notifications for each student
    const notificationPromises = studentIds.map(studentId => {
      let title = '';
      let message = '';
      let type: 'info' | 'warning' | 'success' | 'error' = 'info';
      let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';

      switch (notificationType) {
        case 'new':
          title = '📅 New Class Scheduled';
          message = `A new ${sessionData.session_type} "${sessionData.title}" has been scheduled for ${courseInfo?.code || 'your course'}.\n\n📅 Date: ${sessionDate}\n⏰ Time: ${sessionTime}\n📍 Location: ${sessionData.is_online ? 'Online' : (sessionData.location || 'TBA')}\n\nDon't miss it!`;
          type = 'info';
          priority = 'medium';
          break;
        case 'updated':
          title = '📝 Class Schedule Updated';
          message = `The schedule for "${sessionData.title}" (${courseInfo?.code}) has been updated.\n\n📅 New Date: ${sessionDate}\n⏰ New Time: ${sessionTime}\n📍 Location: ${sessionData.is_online ? 'Online' : (sessionData.location || 'TBA')}\n\nPlease check the latest details in your schedule.`;
          type = 'warning';
          priority = 'high';
          break;
        case 'cancelled':
          title = '❌ Class Cancelled';
          message = `The ${sessionData.session_type} "${sessionData.title}" (${courseInfo?.code}) scheduled for ${sessionDate} has been cancelled.\n\n${sessionData.cancellation_reason ? `Reason: ${sessionData.cancellation_reason}` : 'No reason provided.'}\n\nPlease check for any rescheduled sessions.`;
          type = 'error';
          priority = 'urgent';
          break;
      }

      return createNotification(studentId, title, message, type, priority);
    });

    const results = await Promise.all(notificationPromises);
    const successCount = results.filter(result => result !== null).length;

    console.log(`Successfully sent ${successCount}/${studentIds.length} notifications for ${notificationType} session: ${sessionData.title}`);
  } catch (error) {
    console.error('Error notifying students about session:', error);
    // Don't throw error to prevent session creation from failing
  }
};
