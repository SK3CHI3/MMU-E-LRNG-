import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  MessageSquare,
  Send,
  Search,
  Plus,
  Paperclip,
  MoreVertical,
  Clock,
  CheckCheck,
  User,
  BookOpen,
  Filter,
  ArrowLeft,
  Users,
  RefreshCw
} from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { getStudentCourses } from "@/services/studentService";
import { Skeleton } from "@/components/ui/skeleton";
import {
  getUserConversations,
  getConversationMessages,
  sendMessage,
  markMessagesAsRead,
  subscribeToConversationMessages,
  subscribeToUserConversations,
  findOrCreateConversation,
  getMessageableUsers,
  Message,
  Conversation as ConversationType
} from "@/services/messagingService";

interface ConversationUI extends ConversationType {
  participantName: string;
  participantRole: string;
  participantAvatar: string;
  messages: Message[];
}

const Messages = () => {
  const { user, dbUser } = useAuth();
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

  useEffect(() => {
    if (user?.id && dbUser?.role) {
      loadConversations();
      loadMessageableUsers();
      setupRealtimeSubscriptions();
    }

    return () => {
      // Cleanup subscriptions
      subscriptions.forEach(sub => sub.unsubscribe());
    };
  }, [user?.id, dbUser?.role]);

  const loadConversations = async () => {
    try {
      setLoading(true);

      // Get user conversations from the database
      const userConversations = await getUserConversations(user!.id);

      // Transform conversations to include UI-specific data
      const conversationsWithMessages = await Promise.all(
        userConversations.map(async (conv) => {
          // Get messages for this conversation
          const messages = await getConversationMessages(conv.id);

          return {
            ...conv,
            participantName: conv.participant_names?.[0] || 'Unknown User',
            participantRole: conv.participant_roles?.[0] || 'User',
            participantAvatar: '', // Will be populated from user data
            messages: messages || []
          } as ConversationUI;
        })
      );

      setConversations(conversationsWithMessages);
      if (conversationsWithMessages.length > 0) {
        setSelectedConversation(conversationsWithMessages[0].id);
      }
    } catch (error) {
      console.error('Error loading conversations:', error);
      // Show empty state instead of mock data
      setConversations([]);
    } finally {
      setLoading(false);
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

    // Subscribe to messages for the selected conversation
    if (selectedConversation) {
      const messagesSub = subscribeToConversationMessages(
        selectedConversation,
        (newMessage) => {
          // Add new message to the conversation
          setConversations(prev =>
            prev.map(conv =>
              conv.id === selectedConversation
                ? { ...conv, messages: [...conv.messages, newMessage] }
                : conv
            )
          );
        },
        (updatedMessage) => {
          // Update existing message
          setConversations(prev =>
            prev.map(conv =>
              conv.id === selectedConversation
                ? {
                    ...conv,
                    messages: conv.messages.map(msg =>
                      msg.id === updatedMessage.id ? updatedMessage : msg
                    )
                  }
                : conv
            )
          );
        }
      );

      setSubscriptions(prev => [...prev, conversationSub, messagesSub]);
    } else {
      setSubscriptions(prev => [...prev, conversationSub]);
    }
  };

  // Update subscriptions when selected conversation changes
  useEffect(() => {
    if (selectedConversation && user?.id) {
      // Clean up existing message subscription
      const messagesSub = subscriptions.find(sub => sub.topic?.includes('conversation:'));
      if (messagesSub) {
        messagesSub.unsubscribe();
        setSubscriptions(prev => prev.filter(sub => sub !== messagesSub));
      }

      // Set up new subscription for selected conversation
      const newMessagesSub = subscribeToConversationMessages(
        selectedConversation,
        (newMessage) => {
          setConversations(prev =>
            prev.map(conv =>
              conv.id === selectedConversation
                ? { ...conv, messages: [...conv.messages, newMessage] }
                : conv
            )
          );

          // Mark messages as read if this conversation is selected
          markMessagesAsRead(selectedConversation, user.id);
        },
        (updatedMessage) => {
          setConversations(prev =>
            prev.map(conv =>
              conv.id === selectedConversation
                ? {
                    ...conv,
                    messages: conv.messages.map(msg =>
                      msg.id === updatedMessage.id ? updatedMessage : msg
                    )
                  }
                : conv
            )
          );
        }
      );

      setSubscriptions(prev => [...prev, newMessagesSub]);
    }
  }, [selectedConversation, user?.id]);



  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedConversation || !user?.id) return;

    try {
      setSendingMessage(true);

      await sendMessage({
        conversation_id: selectedConversation,
        content: newMessage.trim(),
        subject: 'Message'
      }, user.id);

      setNewMessage("");

      // The message will be added via real-time subscription
    } catch (error) {
      console.error('Error sending message:', error);
    } finally {
      setSendingMessage(false);
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



  const formatTime = (timestamp: string) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

    if (diffInHours < 1) {
      return "Just now";
    } else if (diffInHours < 24) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredConversations = conversations.filter(conv =>
    conv.participantName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    conv.lastMessage.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (conv.courseName && conv.courseName.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const selectedConv = conversations.find(conv => conv.id === selectedConversation);
  const totalUnread = conversations.reduce((sum, conv) => sum + conv.unreadCount, 0);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <Skeleton className="h-8 w-48 mb-2" />
          <Skeleton className="h-4 w-96" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[600px]">
          <Card className="lg:col-span-1">
            <CardContent className="p-4">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
          <Card className="lg:col-span-2">
            <CardContent className="p-4">
              <Skeleton className="h-full w-full" />
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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

        {/* Chat Messages */}
        <Card className="h-[600px] flex flex-col">
          <CardContent className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-4">
              {conversation?.messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${message.sender_id === user?.id ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[70%] rounded-lg p-3 ${
                      message.sender_id === user?.id
                        ? 'bg-blue-600 text-white'
                        : 'bg-muted'
                    }`}
                  >
                    <p className="text-sm">{message.content}</p>
                    <p className={`text-xs mt-1 ${
                      message.sender_id === user?.id ? 'text-blue-100' : 'text-muted-foreground'
                    }`}>
                      {formatTime(message.created_at)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>

          {/* Message Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                className="flex-1"
              />
              <Button
                onClick={handleSendMessage}
                disabled={!newMessage.trim() || sendingMessage}
              >
                {sendingMessage ? (
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </div>
        </Card>
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
              Choose someone from your faculty to start a conversation
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
            {['lecturer', 'student', 'dean', 'admin'].map(role => {
              const usersInRole = messageableUsers.filter(user =>
                user.role === role &&
                (searchTerm === '' ||
                 user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                 user.department?.toLowerCase().includes(searchTerm.toLowerCase())
                )
              );

              if (usersInRole.length === 0) return null;

              return (
                <div key={role}>
                  <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                    {role === 'lecturer' ? '👨‍🏫 Lecturers' :
                     role === 'student' ? '👨‍🎓 Fellow Students' :
                     role === 'dean' ? '👔 Deans' : '⚙️ Administration'}
                    <Badge variant="outline">{usersInRole.length}</Badge>
                  </h3>
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {usersInRole.map((user) => (
                      <Card
                        key={user.auth_id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => handleStartConversationWithUser(user)}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center gap-3">
                            <Avatar>
                              <AvatarImage src={user.avatar_url} />
                              <AvatarFallback>
                                {user.full_name.split(' ').map((n: string) => n[0]).join('')}
                              </AvatarFallback>
                            </Avatar>
                            <div className="flex-1 min-w-0">
                              <h4 className="font-medium truncate">{user.full_name}</h4>
                              <p className="text-sm text-muted-foreground truncate">
                                {user.department || user.faculty_name}
                              </p>
                              {user.student_id && (
                                <p className="text-xs text-muted-foreground">ID: {user.student_id}</p>
                              )}
                              {user.staff_id && (
                                <p className="text-xs text-muted-foreground">Staff: {user.staff_id}</p>
                              )}
                            </div>
                            <MessageSquare className="h-5 w-5 text-muted-foreground" />
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              );
            })}

            {messageableUsers.length === 0 && (
              <div className="text-center py-12">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No People Found</h3>
                <p className="text-muted-foreground mb-4">
                  No users available to message in your faculty
                </p>
                <Button onClick={loadMessageableUsers}>
                  <RefreshCw className="mr-2 h-4 w-4" />
                  Retry
                </Button>
              </div>
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Messages</h1>
          <p className="text-gray-600 dark:text-gray-400">
            Your conversations with lecturers, fellow students, and staff
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
                  Start a conversation with lecturers, fellow students, or staff within your faculty
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

export default Messages;
