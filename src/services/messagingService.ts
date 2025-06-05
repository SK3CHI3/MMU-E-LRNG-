import { supabase } from '@/lib/supabaseClient';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachments?: string[];
  message_type?: string;
  is_read: boolean;
  read_at?: string;
  reply_to?: string;
  created_at: string;
  updated_at?: string;
  // Joined data for UI
  sender_name?: string;
  sender_role?: string;
  sender_avatar?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  subject: string;
  course_id?: string;
  priority?: 'normal' | 'high' | 'urgent';
  last_message?: string;
  last_message_at?: string;
  unread_count?: number;
  created_at: string;
  updated_at: string;
  is_group?: boolean;
}

export interface ConversationWithDetails extends Conversation {
  other_participant?: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    avatar_url?: string;
    department?: string;
  };
  course?: {
    id: string;
    title: string;
    code: string;
  };
  messages: Message[];
  unread_count: number;
}



export interface NewMessage {
  conversation_id?: string;
  recipient_id?: string;
  course_id?: string;
  subject?: string;
  content: string;
  priority?: 'normal' | 'high' | 'urgent';
  attachments?: File[];
}

// Send a new message - SUPER SIMPLE VERSION
export const sendMessage = async (messageData: NewMessage, senderId: string): Promise<Message> => {
  try {
    // Just insert the message - that's it!
    const { data: message, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: messageData.conversation_id,
        sender_id: senderId,
        content: messageData.content,
        is_read: false
      })
      .select()
      .single();

    if (error) throw error;
    return message;
  } catch (error) {
    console.error('Error sending message:', error);
    throw error;
  }
};

// Upload attachments to storage
const uploadAttachments = async (files: File[], userId: string): Promise<string[]> => {
  const uploadPromises = files.map(async (file) => {
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `message-attachments/${userId}/${fileName}`;

    const { data, error } = await supabase.storage
      .from('message-attachments')
      .upload(filePath, file);

    if (error) throw error;

    const { data: { publicUrl } } = supabase.storage
      .from('message-attachments')
      .getPublicUrl(filePath);

    return publicUrl;
  });

  return Promise.all(uploadPromises);
};

// Get conversations for a user - OPTIMIZED VERSION
export const getUserConversations = async (userId: string): Promise<ConversationWithDetails[]> => {
  try {
    // Single optimized query with all necessary joins
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        id,
        participants,
        subject,
        course_id,
        priority,
        is_group,
        last_message,
        last_message_at,
        created_at,
        updated_at
      `)
      .contains('participants', [userId])
      .order('updated_at', { ascending: false });

    if (error) throw error;

    if (!conversations || conversations.length === 0) {
      return [];
    }

    // Get all unique participant IDs (excluding current user)
    const allParticipantIds = new Set<string>();
    const courseIds = new Set<string>();

    conversations.forEach(conv => {
      conv.participants.forEach((id: string) => {
        if (id !== userId) {
          allParticipantIds.add(id);
        }
      });
      if (conv.course_id) {
        courseIds.add(conv.course_id);
      }
    });

    // Batch fetch all participants in one query
    const { data: participants } = await supabase
      .from('users')
      .select('auth_id, full_name, email, role, avatar_url')
      .in('auth_id', Array.from(allParticipantIds));

    // Batch fetch all courses in one query (if any)
    let courses: any[] = [];
    if (courseIds.size > 0) {
      const { data: courseData } = await supabase
        .from('courses')
        .select('id, title, code')
        .in('id', Array.from(courseIds));
      courses = courseData || [];
    }

    // Create lookup maps for O(1) access
    const participantMap = new Map();
    participants?.forEach(p => participantMap.set(p.auth_id, p));

    const courseMap = new Map();
    courses.forEach(c => courseMap.set(c.id, c));

    // Transform conversations with pre-fetched data
    const conversationsWithDetails = conversations.map(conv => {
      const otherParticipantId = conv.participants.find((id: string) => id !== userId);
      const otherParticipant = participantMap.get(otherParticipantId);
      const course = conv.course_id ? courseMap.get(conv.course_id) : null;

      return {
        ...conv,
        other_participant: otherParticipant || null,
        course,
        messages: [], // We'll load messages separately when needed
        unread_count: 0 // We'll calculate this separately if needed
      };
    });

    return conversationsWithDetails;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

// Get messages for a conversation with sender details - OPTIMIZED
export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    // Optimized query with minimal data and proper indexing
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        id,
        conversation_id,
        sender_id,
        content,
        attachments,
        is_read,
        created_at,
        users!messages_sender_id_fkey (
          full_name,
          role,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true })
      .limit(100); // Limit to last 100 messages for performance

    if (error) throw error;

    // Transform the data to include sender information
    const messagesWithSenderInfo = messages?.map(message => ({
      ...message,
      sender_name: (message as any).users?.full_name || 'Unknown User',
      sender_role: (message as any).users?.role || 'user',
      sender_avatar: (message as any).users?.avatar_url || null
    })) || [];

    return messagesWithSenderInfo;
  } catch (error) {
    console.error('Error fetching conversation messages:', error);
    throw error;
  }
};

// Mark messages as read
export const markMessagesAsRead = async (conversationId: string, userId: string): Promise<void> => {
  try {
    await supabase
      .from('messages')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('conversation_id', conversationId)
      .neq('sender_id', userId);
  } catch (error) {
    console.error('Error marking messages as read:', error);
    throw error;
  }
};

// Subscribe to real-time messages for a conversation
export const subscribeToConversationMessages = (
  conversationId: string,
  onNewMessage: (message: Message) => void,
  onMessageUpdate: (message: Message) => void
) => {
  const subscription = supabase
    .channel(`conversation:${conversationId}`)
    .on(
      'postgres_changes',
      {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      async (payload) => {
        // Get the full message with sender details
        const { data: messageWithSender } = await supabase
          .from('messages')
          .select(`
            *,
            users!messages_sender_id_fkey (
              full_name,
              role,
              avatar_url
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (messageWithSender) {
          const enrichedMessage = {
            ...messageWithSender,
            sender_name: messageWithSender.users?.full_name || 'Unknown User',
            sender_role: messageWithSender.users?.role || 'user',
            sender_avatar: messageWithSender.users?.avatar_url || null
          };
          onNewMessage(enrichedMessage);
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: 'UPDATE',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      },
      async (payload) => {
        // Get the updated message with sender details
        const { data: messageWithSender } = await supabase
          .from('messages')
          .select(`
            *,
            users!messages_sender_id_fkey (
              full_name,
              role,
              avatar_url
            )
          `)
          .eq('id', payload.new.id)
          .single();

        if (messageWithSender) {
          const enrichedMessage = {
            ...messageWithSender,
            sender_name: messageWithSender.users?.full_name || 'Unknown User',
            sender_role: messageWithSender.users?.role || 'user',
            sender_avatar: messageWithSender.users?.avatar_url || null
          };
          onMessageUpdate(enrichedMessage);
        }
      }
    )
    .subscribe();

  return subscription;
};

// Subscribe to conversation updates
export const subscribeToUserConversations = (
  userId: string,
  onConversationUpdate: () => void
) => {
  const subscription = supabase
    .channel(`user_conversations:${userId}`)
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'conversations'
      },
      (payload) => {
        // Check if user is participant in this conversation
        const participants = payload.new?.participants || payload.old?.participants;
        if (participants && participants.includes(userId)) {
          onConversationUpdate();
        }
      }
    )
    .on(
      'postgres_changes',
      {
        event: '*',
        schema: 'public',
        table: 'messages'
      },
      async (payload) => {
        // Check if this message belongs to a conversation the user is part of
        const conversationId = payload.new?.conversation_id || payload.old?.conversation_id;
        if (conversationId) {
          const { data: conversation } = await supabase
            .from('conversations')
            .select('participants')
            .eq('id', conversationId)
            .single();

          if (conversation && conversation.participants.includes(userId)) {
            onConversationUpdate();
          }
        }
      }
    )
    .subscribe();

  return subscription;
};

// Find or create a conversation between two users
export const findOrCreateConversation = async (
  userId1: string,
  userId2: string,
  subject?: string,
  courseId?: string
): Promise<string> => {
  try {
    // First, try to find existing conversation between these two users
    const { data: existingConversations, error: searchError } = await supabase
      .from('conversations')
      .select('*')
      .contains('participants', [userId1])
      .contains('participants', [userId2])
      .eq('is_group', false);

    if (searchError) throw searchError;

    // If conversation exists, return its ID
    if (existingConversations && existingConversations.length > 0) {
      return existingConversations[0].id;
    }

    // Create new conversation
    const { data: newConversation, error: createError } = await supabase
      .from('conversations')
      .insert({
        participants: [userId1, userId2],
        subject: subject || 'Direct Message',
        course_id: courseId,
        is_group: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (createError) throw createError;

    return newConversation.id;
  } catch (error) {
    console.error('Error finding or creating conversation:', error);
    throw error;
  }
};

// Get user by ID for direct messaging
export const getUserById = async (userId: string): Promise<any | null> => {
  try {
    const { data: user, error } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', userId)
      .single();

    if (error) {
      console.error('Error fetching user by ID:', error);
      return null;
    }

    return user;
  } catch (error) {
    console.error('Error in getUserById:', error);
    return null;
  }
};

// Get all users that can be messaged based on faculty and role
export const getMessageableUsers = async (currentUserId: string, currentUserRole: string): Promise<any[]> => {
  try {
    console.log('getMessageableUsers called with:', { currentUserId, currentUserRole });

    // First check if we have a valid connection to Supabase
    const { data: testConnection, error: connectionError } = await supabase
      .from('users')
      .select('count')
      .limit(1);

    if (connectionError) {
      console.error('Supabase connection error:', connectionError);
      throw new Error(`Database connection failed: ${connectionError.message}`);
    }

    // Get all users except current user
    const { data: allUsers, error: usersError } = await supabase
      .from('users')
      .select(`
        auth_id,
        full_name,
        email,
        role,
        avatar_url,
        student_id,
        department,
        faculty
      `)
      .neq('auth_id', currentUserId)
      .not('full_name', 'is', null); // Exclude users without names

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    if (import.meta.env.DEV) {
      console.log('Raw users from database:', allUsers?.length || 0);
    }

    if (!allUsers || allUsers.length === 0) {
      if (import.meta.env.DEV) {
        console.log('No users found in database - this might mean:');
        console.log('1. Database is empty');
        console.log('2. All users have null names');
        console.log('3. Current user is the only user');
      }
      return [];
    }

    // Get current user's info for faculty filtering
    const { data: currentUser, error: currentUserError } = await supabase
      .from('users')
      .select('auth_id, faculty, department, role')
      .eq('auth_id', currentUserId)
      .single();

    if (currentUserError) {
      console.error('Error fetching current user:', currentUserError);
      console.log('Proceeding without faculty filtering');
    }

    console.log('Current user info:', currentUser);

    // Role-based filtering (simplified for now)
    let filteredUsers = [];

    if (currentUserRole === 'student') {
      // Students can message lecturers, other students, deans, and admins
      filteredUsers = allUsers.filter(user =>
        user.role === 'lecturer' ||
        user.role === 'student' ||
        user.role === 'dean' ||
        user.role === 'admin'
      );
    } else if (currentUserRole === 'lecturer') {
      // Lecturers can message students, other lecturers, deans, and admins
      filteredUsers = allUsers.filter(user =>
        user.role === 'student' ||
        user.role === 'lecturer' ||
        user.role === 'dean' ||
        user.role === 'admin'
      );
    } else if (currentUserRole === 'dean') {
      // Deans can message everyone
      filteredUsers = allUsers;
    } else if (currentUserRole === 'admin') {
      // Admins can message everyone
      filteredUsers = allUsers;
    } else {
      console.log('Unknown user role:', currentUserRole);
      // Default: can message everyone
      filteredUsers = allUsers;
    }

    console.log('Users after role filtering:', filteredUsers);

    // Transform the data to include display information
    const transformedUsers = filteredUsers.map(user => ({
      ...user,
      faculty_name: user.faculty || user.department || 'No Faculty',
      programme_title: null
    }));

    console.log('Final transformed users:', transformedUsers);
    return transformedUsers;
  } catch (error) {
    console.error('Error in getMessageableUsers:', error);
    throw error;
  }
};

// Send announcement to all students in a course
export const sendCourseAnnouncement = async (
  courseId: string,
  subject: string,
  content: string,
  senderId: string,
  priority: 'normal' | 'high' | 'urgent' = 'normal'
): Promise<void> => {
  try {
    // Get all enrolled students
    const { data: enrollments, error: enrollError } = await supabase
      .from('course_enrollments')
      .select('user_id')
      .eq('course_id', courseId)
      .eq('status', 'enrolled');

    if (enrollError) throw enrollError;

    // Create conversations and messages for each student
    const conversationPromises = enrollments.map(async (enrollment) => {
      // Check if conversation already exists
      const { data: existingConv } = await supabase
        .from('conversations')
        .select('id')
        .contains('participants', [senderId, enrollment.user_id])
        .eq('course_id', courseId)
        .single();

      let conversationId;
      if (existingConv) {
        conversationId = existingConv.id;
      } else {
        // Create new conversation
        const { data: newConv, error: convError } = await supabase
          .from('conversations')
          .insert({
            participants: [senderId, enrollment.user_id],
            subject: subject,
            course_id: courseId,
            priority: priority,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          })
          .select()
          .single();

        if (convError) throw convError;
        conversationId = newConv.id;
      }

      // Send message
      return sendMessage({
        conversation_id: conversationId,
        content: content,
        priority: priority
      }, senderId);
    });

    await Promise.all(conversationPromises);

    // Create a general announcement record
    await supabase
      .from('announcements')
      .insert({
        title: subject,
        content: content,
        course_id: courseId,
        is_public: false,
        created_by: senderId,
        created_at: new Date().toISOString()
      });

  } catch (error) {
    console.error('Error sending course announcement:', error);
    throw error;
  }
};

// Search conversations
export const searchConversations = async (
  userId: string,
  query: string
): Promise<ConversationWithDetails[]> => {
  try {
    const conversations = await getUserConversations(userId);

    return conversations.filter(conv =>
      conv.subject.toLowerCase().includes(query.toLowerCase()) ||
      conv.other_participant.full_name.toLowerCase().includes(query.toLowerCase()) ||
      conv.last_message?.toLowerCase().includes(query.toLowerCase()) ||
      conv.course?.title.toLowerCase().includes(query.toLowerCase())
    );
  } catch (error) {
    console.error('Error searching conversations:', error);
    throw error;
  }
};

// Delete conversation
export const deleteConversation = async (conversationId: string, userId: string): Promise<void> => {
  try {
    // Verify user is participant
    const { data: conversation } = await supabase
      .from('conversations')
      .select('participants')
      .eq('id', conversationId)
      .single();

    if (!conversation || !conversation.participants.includes(userId)) {
      throw new Error('Unauthorized to delete this conversation');
    }

    // Delete all messages in the conversation
    await supabase
      .from('messages')
      .delete()
      .eq('conversation_id', conversationId);

    // Delete the conversation
    await supabase
      .from('conversations')
      .delete()
      .eq('id', conversationId);

  } catch (error) {
    console.error('Error deleting conversation:', error);
    throw error;
  }
};
