import { supabase } from '@/lib/supabaseClient';

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string;
  attachments?: string[];
  topic: string;
  extension: string;
  payload?: any;
  event?: string;
  private?: boolean;
  message_type?: string;
  is_read: boolean;
  read_at?: string;
  reply_to?: string;
  inserted_at: string;
  updated_at: string;
  created_at: string;
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
  priority: 'normal' | 'high' | 'urgent';
  last_message?: string;
  last_message_at?: string;
  unread_count: number;
  created_at: string;
  updated_at: string;
}

export interface ConversationWithDetails extends Conversation {
  other_participant: {
    id: string;
    full_name: string;
    email: string;
    role: string;
    avatar_url?: string;
  };
  course?: {
    id: string;
    title: string;
    code: string;
  };
  messages: Message[];
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

// Send a new message
export const sendMessage = async (messageData: NewMessage, senderId: string): Promise<Message> => {
  try {
    let conversationId = messageData.conversation_id;

    // If no conversation ID, create a new conversation
    if (!conversationId && messageData.recipient_id) {
      const { data: conversation, error: convError } = await supabase
        .from('conversations')
        .insert({
          participants: [senderId, messageData.recipient_id],
          subject: messageData.subject || 'New Conversation',
          course_id: messageData.course_id,
          priority: messageData.priority || 'normal',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      if (convError) throw convError;
      conversationId = conversation.id;
    }

    if (!conversationId) {
      throw new Error('No conversation ID provided');
    }

    // Handle file attachments
    let attachmentUrls: string[] = [];
    if (messageData.attachments && messageData.attachments.length > 0) {
      attachmentUrls = await uploadAttachments(messageData.attachments, senderId);
    }

    // Create the message with required fields for the database schema
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: senderId,
        content: messageData.content,
        attachments: attachmentUrls,
        topic: messageData.subject || 'Message',
        extension: 'text',
        message_type: 'text',
        private: false,
        is_read: false,
        inserted_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        created_at: new Date().toISOString()
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // Update conversation with last message
    await supabase
      .from('conversations')
      .update({
        last_message: messageData.content.substring(0, 100),
        last_message_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', conversationId);

    // Create notification for recipient(s)
    const { data: conversation } = await supabase
      .from('conversations')
      .select('participants')
      .eq('id', conversationId)
      .single();

    if (conversation) {
      const recipients = conversation.participants.filter((id: string) => id !== senderId);

      const notifications = recipients.map((recipientId: string) => ({
        user_id: recipientId,
        title: 'New Message',
        message: `You have a new message: ${messageData.content.substring(0, 50)}...`,
        type: 'message',
        is_read: false,
        related_id: message.id,
        created_at: new Date().toISOString()
      }));

      await supabase
        .from('notifications')
        .insert(notifications);
    }

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

// Get conversations for a user
export const getUserConversations = async (userId: string): Promise<ConversationWithDetails[]> => {
  try {
    const { data: conversations, error } = await supabase
      .from('conversations')
      .select(`
        *,
        messages!inner(
          id,
          sender_id,
          content,
          attachments,
          created_at,
          is_read
        )
      `)
      .contains('participants', [userId])
      .order('updated_at', { ascending: false });

    if (error) throw error;

    // Get detailed information for each conversation
    const conversationsWithDetails = await Promise.all(
      conversations.map(async (conv) => {
        // Get other participant details
        const otherParticipantId = conv.participants.find((id: string) => id !== userId);
        const { data: otherParticipant } = await supabase
          .from('users')
          .select('id, full_name, email, role, avatar_url')
          .eq('auth_id', otherParticipantId)
          .single();

        // Get course details if applicable
        let course = null;
        if (conv.course_id) {
          const { data: courseData } = await supabase
            .from('courses')
            .select('id, title, code')
            .eq('id', conv.course_id)
            .single();
          course = courseData;
        }

        // Get unread count for this user
        const { count: unreadCount } = await supabase
          .from('messages')
          .select('*', { count: 'exact', head: true })
          .eq('conversation_id', conv.id)
          .eq('is_read', false)
          .neq('sender_id', userId);

        // Sort messages by created_at
        const sortedMessages = conv.messages.sort((a: any, b: any) =>
          new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
        );

        return {
          ...conv,
          other_participant: otherParticipant,
          course,
          messages: sortedMessages,
          unread_count: unreadCount || 0
        };
      })
    );

    return conversationsWithDetails;
  } catch (error) {
    console.error('Error fetching conversations:', error);
    throw error;
  }
};

// Get messages for a conversation with sender details
export const getConversationMessages = async (conversationId: string): Promise<Message[]> => {
  try {
    const { data: messages, error } = await supabase
      .from('messages')
      .select(`
        *,
        users!messages_sender_id_fkey (
          full_name,
          role,
          avatar_url
        )
      `)
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) throw error;

    // Transform the data to include sender information
    const messagesWithSenderInfo = messages?.map(message => ({
      ...message,
      sender_name: message.users?.full_name || 'Unknown User',
      sender_role: message.users?.role || 'user',
      sender_avatar: message.users?.avatar_url || null
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
        staff_id,
        department,
        faculty_id
      `)
      .neq('auth_id', currentUserId)
      .not('full_name', 'is', null); // Exclude users without names

    if (usersError) {
      console.error('Error fetching users:', usersError);
      throw new Error(`Failed to fetch users: ${usersError.message}`);
    }

    console.log('Raw users from database:', allUsers);

    if (!allUsers || allUsers.length === 0) {
      console.log('No users found in database - this might mean:');
      console.log('1. Database is empty');
      console.log('2. All users have null names');
      console.log('3. Current user is the only user');
      return [];
    }

    // Get current user's info for faculty filtering
    const { data: currentUser, error: currentUserError } = await supabase
      .from('users')
      .select('auth_id, faculty_id, department, role')
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
      faculty_name: user.department || 'No Department',
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
