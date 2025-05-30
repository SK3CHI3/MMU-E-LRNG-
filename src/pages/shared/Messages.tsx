import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  ArrowLeft,
  Users,
  RefreshCw,
  GraduationCap,
  UserCheck,
  Shield,
  Settings,
  Clock,
  CheckCheck,
  User
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToConversationMessages,
  subscribeToUserConversations,
  findOrCreateConversation,
  getMessageableUsers,
  getUserById,
  Message,
  Conversation as ConversationType
} from "@/services/messagingService";

interface ConversationUI extends ConversationType {
  participantName: string;
  participantRole: string;
  participantAvatar: string;
  messages: Message[];
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  courseName?: string;
  participant_names?: string[];
  participant_roles?: string[];
}

// Helper function to get role icon
const getRoleIcon = (role: string) => {
  switch (role) {
    case 'student':
      return <GraduationCap className="h-4 w-4" />;
    case 'lecturer':
      return <UserCheck className="h-4 w-4" />;
    case 'dean':
      return <Shield className="h-4 w-4" />;
    case 'admin':
      return <Settings className="h-4 w-4" />;
    default:
      return <User className="h-4 w-4" />;
  }
};

// Helper function to get role color
const getRoleColor = (role: string) => {
  switch (role) {
    case 'student':
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
    case 'lecturer':
      return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
    case 'dean':
      return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300';
    case 'admin':
      return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
  }
};

// Helper function to group users by role
const groupUsersByRole = (users: any[]) => {
  const grouped = users.reduce((acc, user) => {
    const role = user.role || 'other';
    if (!acc[role]) {
      acc[role] = [];
    }
    acc[role].push(user);
    return acc;
  }, {} as Record<string, any[]>);

  // Sort users within each group by name
  Object.keys(grouped).forEach(role => {
    grouped[role].sort((a, b) => a.full_name.localeCompare(b.full_name));
  });

  return grouped;
};

// Helper function to get role display name and count
const getRoleDisplayInfo = (role: string, count: number) => {
  const roleNames = {
    student: 'Students',
    lecturer: 'Lecturers',
    dean: 'Deans',
    admin: 'Administrators'
  };

  return {
    name: roleNames[role as keyof typeof roleNames] || 'Others',
    count,
    icon: getRoleIcon(role)
  };
};

// Message status component
const MessageStatus = ({ message, isOwnMessage }: { message: any, isOwnMessage: boolean }) => {
  if (!isOwnMessage) return null;

  const getStatusIcon = () => {
    // Check if message was just sent (very recent)
    const messageTime = new Date(message.created_at).getTime();
    const now = new Date().getTime();
    const timeDiff = now - messageTime;

    // If message is less than 5 seconds old, show sending status
    if (timeDiff < 5000) {
      return (
        <div className="flex items-center" title="Sending...">
          <div className="h-3 w-3 rounded-full border-2 border-blue-300 border-t-transparent animate-spin" />
        </div>
      );
    }

    // If message is read, show double check
    if (message.is_read) {
      return (
        <div className="flex items-center" title="Read">
          <CheckCheck className="h-3 w-3 text-blue-200" />
        </div>
      );
    }

    // Default: show single check (delivered)
    return (
      <div className="flex items-center" title="Delivered">
        <svg
          className="h-3 w-3 text-blue-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M5 13l4 4L19 7"
          />
        </svg>
      </div>
    );
  };

  return (
    <div className="flex items-center ml-1">
      {getStatusIcon()}
    </div>
  );
};

const SharedMessages = () => {
  const { user, dbUser } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState<ConversationUI[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
  const [selectedUser, setSelectedUser] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sendingMessage, setSendingMessage] = useState(false);
  const [messageableUsers, setMessageableUsers] = useState<any[]>([]);
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [viewMode, setViewMode] = useState<'conversations' | 'users' | 'chat'>('conversations');
  const [subscriptions, setSubscriptions] = useState<any[]>([]);
  const [currentMessageSubscription, setCurrentMessageSubscription] = useState<any>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when new messages arrive
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Helper function to format time
  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);

    if (diffInHours < 1) {
      return `${Math.floor(diffInHours * 60)}m ago`;
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  // Filter conversations based on search
  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Calculate total unread messages
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  useEffect(() => {
    if (user?.id && dbUser?.role) {
      loadConversations();
      loadMessageableUsers();
      setupRealtimeSubscriptions();

      // Check for URL parameters for direct messaging
      const userId = searchParams.get('user');
      if (userId) {
        handleDirectMessage(userId);
      }
    }

    return () => {
      // Cleanup subscriptions
      subscriptions.forEach(sub => sub.unsubscribe());
      if (currentMessageSubscription) {
        currentMessageSubscription.unsubscribe();
      }
    };
  }, [user?.id, dbUser?.role, searchParams]);

  const loadConversations = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);

      // Get user conversations from the database (WITHOUT messages for speed)
      const userConversations = await getUserConversations(user.id);

      // Transform conversations to include UI-specific data (NO message loading)
      const conversationsWithoutMessages = userConversations.map((conv) => {
        // Extract participant information from the conversation data
        const otherParticipant = conv.other_participant;

        return {
          ...conv,
          participantName: otherParticipant?.full_name || 'Unknown User',
          participantRole: otherParticipant?.role || 'User',
          participantAvatar: otherParticipant?.avatar_url || '',
          messages: [], // Empty - will load when conversation is selected
          lastMessage: conv.last_message || 'No messages yet',
          lastMessageTime: conv.last_message_at || conv.created_at,
          unreadCount: conv.unread_count || 0,
          courseName: conv.course?.title || undefined,
          participant_names: [otherParticipant?.full_name || 'Unknown User'],
          participant_roles: [otherParticipant?.role || 'User']
        } as ConversationUI;
      });

      setConversations(conversationsWithoutMessages);

      // Auto-select first conversation but don't load messages yet
      if (conversationsWithoutMessages.length > 0) {
        const firstConversation = conversationsWithoutMessages[0];
        setSelectedConversation(firstConversation.id);
        setSelectedUser({
          auth_id: firstConversation.other_participant?.id || '',
          full_name: firstConversation.participantName,
          role: firstConversation.participantRole,
          avatar_url: firstConversation.participantAvatar,
          department: firstConversation.other_participant?.department || '',
          email: firstConversation.other_participant?.email || ''
        });

        // Load messages for the selected conversation only
        loadMessagesForConversation(firstConversation.id);
        // Set up realtime subscription for instant messages
        setupMessageSubscription(firstConversation.id);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      setConversations([]);
    } finally {
      setLoading(false);
    }
  };

  // Load messages for a specific conversation (lazy loading)
  const loadMessagesForConversation = async (conversationId: string) => {
    try {
      const messages = await getConversationMessages(conversationId);

      // Update the specific conversation with its messages
      setConversations(prev => prev.map(conv => {
        if (conv.id === conversationId) {
          return {
            ...conv,
            messages: messages || []
          };
        }
        return conv;
      }));

      // Auto-scroll to bottom after loading messages
      setTimeout(scrollToBottom, 200);
    } catch (error) {
      console.error('Error loading messages for conversation:', error);
    }
  };

  const loadMessageableUsers = async () => {
    if (!user?.id || !dbUser?.role) {
      console.log('Missing user data:', { userId: user?.id, userRole: dbUser?.role });
      return;
    }

    try {
      setLoadingUsers(true);
      console.log('Loading messageable users for:', { userId: user.id, role: dbUser.role });

      const users = await getMessageableUsers(user.id, dbUser.role);
      console.log('Loaded messageable users:', users);

      // Always use real data from database - no test data fallback
      setMessageableUsers(users || []);
      
      if (users.length === 0) {
        console.log('No users found in database - this could mean:');
        console.log('1. User has no faculty assignment');
        console.log('2. No other users exist in the same faculty');
        console.log('3. Database connection issue');
      }
    } catch (error) {
      console.error('Error loading messageable users:', error);
      // Don't add test data - show real empty state
      setMessageableUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const setupRealtimeSubscriptions = () => {
    if (!user?.id) return;

    // Subscribe to conversation updates
    const conversationSub = subscribeToUserConversations(user.id, () => {
      loadConversations(); // Reload conversations when there are updates
    });

    setSubscriptions(prev => [...prev, conversationSub]);
  };

  // Set up realtime subscription for current conversation messages
  const setupMessageSubscription = (conversationId: string) => {
    if (!conversationId) return;

    // Clean up existing message subscription
    if (currentMessageSubscription) {
      currentMessageSubscription.unsubscribe();
      setCurrentMessageSubscription(null);
    }

    // Subscribe to new messages in this conversation
    const messageSubscription = supabase
      .channel(`messages:${conversationId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `conversation_id=eq.${conversationId}`
        },
        async (payload) => {
          console.log('New message received via realtime:', payload);

          // Get sender details for the new message
          const { data: senderData } = await supabase
            .from('users')
            .select('full_name, role, avatar_url')
            .eq('auth_id', payload.new.sender_id)
            .single();

          const newMessage = {
            ...payload.new,
            sender_name: senderData?.full_name || 'Unknown User',
            sender_role: senderData?.role || 'user',
            sender_avatar: senderData?.avatar_url || null
          };

          // Add message to conversation instantly (avoid duplicates)
          setConversations(prev => prev.map(conv => {
            if (conv.id === conversationId) {
              // Check if message already exists (avoid duplicates from optimistic updates)
              const messageExists = conv.messages.some(msg =>
                msg.id === newMessage.id ||
                (msg.content === newMessage.content && msg.sender_id === newMessage.sender_id)
              );

              if (!messageExists) {
                return {
                  ...conv,
                  messages: [...conv.messages, newMessage],
                  lastMessage: newMessage.content,
                  lastMessageTime: newMessage.created_at
                };
              }
            }
            return conv;
          }));

          // Auto-scroll to bottom when new message arrives
          setTimeout(scrollToBottom, 100);
        }
      )
      .subscribe();

    setCurrentMessageSubscription(messageSubscription);
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user?.id) return;

    const messageContent = newMessage.trim();
    setNewMessage(""); // Clear input immediately - instant feedback

    // Create optimistic message for instant UI feedback
    const optimisticMessage = {
      id: `temp-${Date.now()}`,
      conversation_id: selectedConversation,
      sender_id: user.id,
      content: messageContent,
      created_at: new Date().toISOString(),
      is_read: false,
      sender_name: user.user_metadata?.full_name || 'You',
      sender_role: dbUser?.role || 'user',
      sender_avatar: user.user_metadata?.avatar_url || null,
      sending: true
    };

    // Add optimistic message immediately
    setConversations(prev => prev.map(conv => {
      if (conv.id === selectedConversation) {
        return {
          ...conv,
          messages: [...conv.messages, optimisticMessage],
          lastMessage: messageContent,
          lastMessageTime: new Date().toISOString()
        };
      }
      return conv;
    }));

    // Auto-scroll to show the new message
    setTimeout(scrollToBottom, 100);

    // Send message in background
    try {
      const result = await sendMessage({
        conversation_id: selectedConversation,
        content: messageContent,
        subject: 'Message'
      }, user.id);

      // Replace optimistic message with real message when it comes back
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversation) {
          return {
            ...conv,
            messages: conv.messages.map(msg =>
              msg.id === optimisticMessage.id ? {
                ...result,
                sender_name: user.user_metadata?.full_name || 'You',
                sender_role: dbUser?.role || 'user',
                sender_avatar: user.user_metadata?.avatar_url || null
              } : msg
            )
          };
        }
        return conv;
      }));
    } catch (error) {
      console.error('Error sending message:', error);
      // Remove optimistic message on error
      setConversations(prev => prev.map(conv => {
        if (conv.id === selectedConversation) {
          return {
            ...conv,
            messages: conv.messages.filter(msg => msg.id !== optimisticMessage.id)
          };
        }
        return conv;
      }));
      alert('Failed to send message. Please try again.');
    }
  };

  const handleDirectMessage = async (userId: string) => {
    try {
      console.log('Handling direct message for user ID:', userId);

      // Get user information
      const targetUser = await getUserById(userId);
      if (!targetUser) {
        console.error('User not found:', userId);
        // Clear the URL parameter
        setSearchParams({});
        return;
      }

      console.log('Found target user:', targetUser);

      // Start conversation with this user
      await handleStartConversationWithUser(targetUser);

      // Clear the URL parameter
      setSearchParams({});
    } catch (error) {
      console.error('Error handling direct message:', error);
      // Clear the URL parameter
      setSearchParams({});
    }
  };

  const handleStartConversationWithUser = async (selectedUser: any) => {
    if (!user?.id) return;

    try {
      console.log('Starting conversation with user:', selectedUser);

      // Find or create conversation with this user
      const conversationId = await findOrCreateConversation(
        user.id,
        selectedUser.auth_id,
        `Chat with ${selectedUser.full_name}`,
        undefined
      );

      console.log('Conversation ID:', conversationId);

      // Load the conversation messages
      const messages = await getConversationMessages(conversationId);
      console.log('Loaded messages:', messages);

      // Set up the conversation in state with proper structure
      const conversation: ConversationUI = {
        id: conversationId,
        participants: [user.id, selectedUser.auth_id],
        subject: `Chat with ${selectedUser.full_name}`,
        participantName: selectedUser.full_name,
        participantRole: selectedUser.role,
        participantAvatar: selectedUser.avatar_url || '',
        messages: messages || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        // Add missing properties that might be expected
        lastMessage: messages && messages.length > 0 ? messages[messages.length - 1].content : 'Start a conversation',
        lastMessageTime: messages && messages.length > 0 ? messages[messages.length - 1].created_at : new Date().toISOString(),
        unreadCount: 0,
        courseName: undefined,
        participant_names: [selectedUser.full_name],
        participant_roles: [selectedUser.role]
      };

      // Add to conversations if not already there
      setConversations(prev => {
        const exists = prev.find(conv => conv.id === conversationId);
        if (!exists) {
          return [conversation, ...prev];
        }
        return prev.map(conv => conv.id === conversationId ? conversation : conv);
      });

      // Set the selected user and conversation
      setSelectedUser(selectedUser);
      setSelectedConversation(conversationId);

      // Switch to chat view
      setViewMode('chat');

      console.log('Successfully switched to chat view');
    } catch (error) {
      console.error('Error starting conversation with user:', error);
      // Show user-friendly error
      alert('Failed to start conversation. Please try again.');
    }
  };

  // Get role-specific title and description
  const getRoleSpecificContent = () => {
    switch (dbUser?.role) {
      case 'student':
        return {
          title: 'Messages',
          description: 'Communicate with lecturers, fellow students, and staff within your faculty',
          newChatDescription: 'Choose someone from your faculty to start a conversation'
        };
      case 'lecturer':
        return {
          title: 'Messages',
          description: 'Communicate with students, fellow lecturers, and staff within your faculty',
          newChatDescription: 'Choose someone from your faculty to start a conversation'
        };
      case 'dean':
        return {
          title: 'Messages',
          description: 'Communicate with faculty staff, students, and other administrators',
          newChatDescription: 'Choose someone to start a conversation'
        };
      case 'admin':
        return {
          title: 'Messages',
          description: 'Communicate with all users across the system',
          newChatDescription: 'Choose someone to start a conversation'
        };
      default:
        return {
          title: 'Messages',
          description: 'Communicate with other users',
          newChatDescription: 'Choose someone to start a conversation'
        };
    }
  };

  const roleContent = getRoleSpecificContent();

  // Show chat interface when a conversation is selected
  if (viewMode === 'chat' && selectedConversation) {
    const conversation = conversations.find(conv => conv.id === selectedConversation);
    
    return (
      <div className="space-y-6">
        {/* Chat Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" onClick={() => setViewMode('conversations')}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div className="flex items-center gap-3">
              <Avatar>
                <AvatarImage src={selectedUser?.avatar_url} />
                <AvatarFallback>
                  {selectedUser?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-xl font-semibold">{selectedUser?.full_name}</h2>
                <p className="text-sm text-muted-foreground">
                  {selectedUser?.role} • {selectedUser?.department}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Modern Chat Interface */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700 h-[70vh] flex flex-col overflow-hidden">
          {/* Chat Header */}
          <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4 flex items-center gap-3">
            <Avatar className="h-10 w-10 border-2 border-white/20">
              <AvatarImage src={selectedUser?.avatar_url} />
              <AvatarFallback className="bg-white/20 text-white">
                {selectedUser?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="font-semibold text-lg">{selectedUser?.full_name}</h3>
              <p className="text-blue-100 text-sm">
                {selectedUser?.role} • {selectedUser?.department || 'MMU'}
              </p>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-xs text-blue-100">Online</span>
            </div>
          </div>

          {/* Messages Area */}
          <div className="flex-1 overflow-hidden bg-gradient-to-b from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-3">
                {conversation?.messages.length === 0 ? (
                  <div className="text-center py-16">
                    <div className="bg-blue-100 dark:bg-blue-900/30 rounded-full w-20 h-20 flex items-center justify-center mx-auto mb-4">
                      <MessageSquare className="h-10 w-10 text-blue-600 dark:text-blue-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">Start the conversation</h3>
                    <p className="text-gray-600 dark:text-gray-400">
                      Send a message to {selectedUser?.full_name} to get started
                    </p>
                  </div>
                ) : (
                  <>
                    {conversation?.messages.map((message, index) => {
                      const isOwn = message.sender_id === user?.id;
                      const prevMessage = index > 0 ? conversation.messages[index - 1] : null;
                      const isGrouped = prevMessage && prevMessage.sender_id === message.sender_id;

                      return (
                        <div
                          key={message.id}
                          className={`flex ${isOwn ? 'justify-end' : 'justify-start'} ${
                            isGrouped ? 'mt-1' : 'mt-4'
                          }`}
                        >
                          <div className={`flex items-end gap-2 max-w-[75%] ${
                            isOwn ? 'flex-row-reverse' : 'flex-row'
                          }`}>
                            {!isOwn && !isGrouped && (
                              <Avatar className="h-7 w-7 mb-1">
                                <AvatarImage src={selectedUser?.avatar_url} />
                                <AvatarFallback className="text-xs bg-gray-200 dark:bg-gray-700">
                                  {selectedUser?.full_name?.split(' ').map((n: string) => n[0]).join('') || 'U'}
                                </AvatarFallback>
                              </Avatar>
                            )}
                            {!isOwn && isGrouped && <div className="w-7"></div>}

                            <div
                              className={`rounded-2xl px-4 py-2 shadow-sm max-w-full ${
                                isOwn
                                  ? `bg-blue-600 text-white rounded-br-md ${(message as any).sending ? 'opacity-70' : ''}`
                                  : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-bl-md'
                              }`}
                            >
                              <p className="text-sm leading-relaxed break-words">{message.content}</p>
                              <div className={`flex items-center gap-1 mt-1 ${
                                isOwn ? 'justify-end' : 'justify-start'
                              }`}>
                                <span className={`text-xs ${
                                  isOwn ? 'text-blue-100' : 'text-gray-500 dark:text-gray-400'
                                }`}>
                                  {new Date(message.created_at).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                  })}
                                </span>
                                {isOwn && (
                                  (message as any).sending ? (
                                    <div className="h-3 w-3 animate-spin rounded-full border border-current border-t-transparent" />
                                  ) : (
                                    <MessageStatus
                                      message={message}
                                      isOwnMessage={true}
                                    />
                                  )
                                )}
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4">
            <div className="flex gap-3 items-end">
              <div className="flex-1">
                <Textarea
                  placeholder={`Type a message to ${selectedUser?.full_name}...`}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSendMessage();
                    }
                  }}
                  className="min-h-[44px] max-h-32 resize-none border-gray-300 dark:border-gray-600 focus:border-blue-500 focus:ring-blue-500 rounded-xl"
                  disabled={sendingMessage}
                  rows={1}
                />
              </div>
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-11 w-11 p-0 shadow-lg hover:shadow-xl transition-all duration-200"
                size="sm"
              >
                <Send className="h-5 w-5" />
              </Button>
            </div>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-2 text-center">
              Press Enter to send • Shift+Enter for new line
            </p>
          </div>
        </div>
      </div>
    );
  }

  // Show users list when in 'users' mode
  if (viewMode === 'users') {
    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Start New Chat</h1>
            <p className="text-gray-600 dark:text-gray-400">
              {roleContent.newChatDescription}
            </p>
          </div>
          <Button variant="outline" onClick={() => setViewMode('conversations')}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Conversations
          </Button>
        </div>

        {/* Search and Debug */}
        <div className="flex gap-4 items-center">
          <div className="relative max-w-md flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search people..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Button 
            variant="outline" 
            onClick={loadMessageableUsers}
            disabled={loadingUsers}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${loadingUsers ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>

        {/* Debug Info */}
        {process.env.NODE_ENV === 'development' && (
          <div className="bg-muted p-4 rounded-lg text-sm">
            <p><strong>Debug Info:</strong></p>
            <p>User ID: {user?.id}</p>
            <p>User Role: {dbUser?.role}</p>
            <p>Users Found: {messageableUsers.length}</p>
            <p>Loading: {loadingUsers ? 'Yes' : 'No'}</p>
          </div>
        )}

        {/* Users List */}
        {loadingUsers ? (
          <div className="text-center py-12">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-current border-t-transparent mx-auto mb-4" />
            <p>Loading people...</p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Group users by role */}
            {(() => {
              const groupedUsers = groupUsersByRole(messageableUsers.filter(user =>
                searchTerm === '' ||
                user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.department?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                user.faculty?.toLowerCase().includes(searchTerm.toLowerCase())
              ));

              const roleOrder = ['lecturer', 'student', 'dean', 'admin'];

              return roleOrder.map(role => {
                const usersInRole = groupedUsers[role] || [];
                if (usersInRole.length === 0) return null;

                const roleInfo = getRoleDisplayInfo(role, usersInRole.length);

                return (
                  <Card key={role} className="overflow-hidden">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${getRoleColor(role)}`}>
                            {roleInfo.icon}
                          </div>
                          <div>
                            <CardTitle className="text-lg">{roleInfo.name}</CardTitle>
                            <CardDescription>
                              {roleInfo.count} {roleInfo.count === 1 ? 'person' : 'people'} available
                            </CardDescription>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-sm">
                          {roleInfo.count}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <ScrollArea className="h-64">
                        <div className="space-y-2">
                          {usersInRole.map((user) => (
                            <div
                              key={user.auth_id}
                              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
                              onClick={() => handleStartConversationWithUser(user)}
                            >
                              <Avatar className="h-10 w-10">
                                <AvatarImage src={user.avatar_url} />
                                <AvatarFallback className="text-sm">
                                  {user.full_name.split(' ').map((n: string) => n[0]).join('')}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between">
                                  <h4 className="font-medium text-sm truncate">{user.full_name}</h4>
                                  <MessageSquare className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
                                </div>
                                <p className="text-xs text-muted-foreground truncate">
                                  {user.faculty || user.department || 'No Department'}
                                </p>
                                <div className="flex items-center gap-2 mt-1">
                                  <Badge variant="outline" className="text-xs px-2 py-0">
                                    {user.role}
                                  </Badge>
                                  {user.student_id && (
                                    <span className="text-xs text-muted-foreground">
                                      ID: {user.student_id}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                );
              });
            })()}

            {messageableUsers.length === 0 && (
              <Card>
                <CardContent className="text-center py-12">
                  <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No People Found</h3>
                  <p className="text-muted-foreground mb-4">
                    No users available to message in your faculty
                  </p>
                  <Button onClick={loadMessageableUsers}>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Retry
                  </Button>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{roleContent.title}</h1>
          <p className="text-gray-600 dark:text-gray-400">
            {roleContent.description}
          </p>
        </div>
        <div className="flex items-center gap-4">
          {conversations.length > 0 && (
            <Badge variant="outline">
              {totalUnread} unread
            </Badge>
          )}
          <Button onClick={() => {
            setViewMode('users');
            loadMessageableUsers();
          }}>
            <Plus className="mr-2 h-4 w-4" />
            New Chat
          </Button>
        </div>
      </div>

      {/* Conversations List */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle>Your Conversations</CardTitle>
            <Badge variant="outline">{conversations.length}</Badge>
          </div>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search conversations..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="space-y-1 max-h-[500px] overflow-y-auto">
            {filteredConversations.length > 0 ? (
              filteredConversations.map((conversation) => (
              <div
                key={conversation.id}
                className={`p-3 cursor-pointer hover:bg-muted/50 transition-colors border-l-2 ${
                  selectedConversation === conversation.id
                    ? 'bg-muted border-l-primary'
                    : 'border-l-transparent'
                }`}
                onClick={() => {
                  setSelectedConversation(conversation.id);
                  // Set the selected user from the conversation data
                  setSelectedUser({
                    auth_id: conversation.other_participant?.id || '',
                    full_name: conversation.participantName,
                    role: conversation.participantRole,
                    avatar_url: conversation.participantAvatar,
                    department: conversation.other_participant?.department || '',
                    email: conversation.other_participant?.email || ''
                  });
                  // Load messages for this conversation if not already loaded
                  if (conversation.messages.length === 0) {
                    loadMessagesForConversation(conversation.id);
                  }
                  // Set up realtime subscription for instant messages
                  setupMessageSubscription(conversation.id);
                  setViewMode('chat');
                }}
              >
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={conversation.participantAvatar} />
                    <AvatarFallback>
                      {conversation.participantName.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium text-sm truncate">
                        {conversation.participantName}
                      </p>
                      <span className="text-xs text-muted-foreground">
                        {formatTime(conversation.lastMessageTime)}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-1">
                      {conversation.participantRole}
                      {conversation.courseName && ` • ${conversation.courseName}`}
                    </p>
                    <p className="text-sm text-muted-foreground truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unreadCount > 0 && (
                      <Badge variant="default" className="mt-1 text-xs">
                        {conversation.unreadCount} new
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
              ))
            ) : (
              <div className="p-8 text-center">
                <MessageSquare className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Conversations Yet</h3>
                <p className="text-muted-foreground mb-4">
                  Start a conversation with people in your network
                </p>
                <Button onClick={() => {
                  setViewMode('users');
                  loadMessageableUsers();
                }} size="sm">
                  <Plus className="mr-2 h-4 w-4" />
                  Start Conversation
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SharedMessages;
