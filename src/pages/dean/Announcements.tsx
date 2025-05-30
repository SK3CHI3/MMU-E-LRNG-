import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import {
  Bell,
  Plus,
  Search,
  Filter,
  Calendar,
  Users,
  AlertCircle,
  Info,
  CheckCircle,
  Clock,
  Edit,
  Trash2,
  Send,
  Eye
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { showSuccessToast, showErrorToast } from '@/utils/ui/toast';

interface AnnouncementData {
  id?: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isPublic: boolean;
  targetAudience: 'all' | 'students' | 'lecturers' | 'faculty';
  faculty?: string;
  expiresAt?: string;
  externalLink?: string;
  category: string;
}

interface ExistingAnnouncement extends AnnouncementData {
  id: string;
  created_at: string;
  updated_at: string;
  created_by: string;
  is_active: boolean;
  users?: {
    full_name: string;
    role: string;
  };
}

const Announcements = () => {
  const { dbUser } = useAuth();
  const [announcements, setAnnouncements] = useState<ExistingAnnouncement[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedPriority, setSelectedPriority] = useState('all');
  const [selectedAudience, setSelectedAudience] = useState('all');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<ExistingAnnouncement | null>(null);
  const [loading, setLoading] = useState(false);

  const [newAnnouncement, setNewAnnouncement] = useState<AnnouncementData>({
    title: '',
    content: '',
    priority: 'normal',
    isPublic: false,
    targetAudience: 'faculty',
    faculty: dbUser?.faculty || '',
    expiresAt: '',
    externalLink: '',
    category: 'Faculty Notice'
  });

  // Fetch existing announcements
  useEffect(() => {
    fetchAnnouncements();
  }, [dbUser]);

  const fetchAnnouncements = async () => {
    if (!dbUser?.auth_id || !dbUser?.faculty) return;

    try {
      setLoading(true);
      // Dean should see announcements for their faculty
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          users!announcements_created_by_fkey (
            full_name,
            role
          )
        `)
        .eq('is_active', true)
        .eq('faculty', dbUser.faculty)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching announcements:', error);
        throw error;
      }

      console.log('Fetched announcements:', data);
      setAnnouncements(data || []);
    } catch (error) {
      console.error('Error loading announcements:', error);
      showErrorToast('Failed to load announcements');
      setAnnouncements([]);
    } finally {
      setLoading(false);
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      case 'high':
        return <AlertCircle className="h-4 w-4 text-orange-600" />;
      case 'normal':
        return <Info className="h-4 w-4 text-blue-600" />;
      case 'low':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      default:
        return <Info className="h-4 w-4 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'high':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400';
      case 'normal':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      case 'low':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getAudienceIcon = (audience: string) => {
    switch (audience) {
      case 'students':
        return <Users className="h-4 w-4 text-blue-600" />;
      case 'lecturers':
        return <Users className="h-4 w-4 text-green-600" />;
      case 'faculty':
        return <Users className="h-4 w-4 text-purple-600" />;
      case 'all':
        return <Users className="h-4 w-4 text-gray-600" />;
      default:
        return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    if (searchTerm && !announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) &&
        !announcement.content.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    if (selectedPriority !== 'all' && announcement.priority !== selectedPriority) {
      return false;
    }
    if (selectedAudience !== 'all' && announcement.target_audience !== selectedAudience) {
      return false;
    }
    return true;
  });

  const handleCreateAnnouncement = async () => {
    if (!newAnnouncement.title.trim() || !newAnnouncement.content.trim()) {
      showErrorToast('Please fill in all required fields');
      return;
    }

    if (!dbUser?.auth_id || !dbUser?.faculty) {
      showErrorToast('User authentication error. Please refresh and try again.');
      return;
    }

    try {
      setLoading(true);
      console.log('Creating faculty announcement with data:', {
        title: newAnnouncement.title,
        content: newAnnouncement.content,
        priority: newAnnouncement.priority,
        is_public: newAnnouncement.isPublic,
        target_audience: newAnnouncement.targetAudience,
        faculty: dbUser.faculty,
        created_by: dbUser.auth_id
      });

      // First, verify the user exists in the database
      const { data: userCheck, error: userError } = await supabase
        .from('users')
        .select('auth_id, full_name, role')
        .eq('auth_id', dbUser.auth_id)
        .single();

      if (userError || !userCheck) {
        throw new Error(`User not found in database: ${dbUser.auth_id}`);
      }

      console.log('User verified:', userCheck);

      // Create announcement in database
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          priority: newAnnouncement.priority,
          is_public: newAnnouncement.isPublic,
          target_audience: newAnnouncement.targetAudience,
          faculty: dbUser.faculty, // Dean's faculty
          expires_at: newAnnouncement.expiresAt || null,
          external_link: newAnnouncement.externalLink || null,
          category: newAnnouncement.category,
          created_by: dbUser.auth_id,
          is_active: true
        })
        .select()
        .single();

      if (error) {
        console.error('Announcement creation error:', error);
        throw error;
      }

      console.log('Announcement created successfully:', data);

      // Send notifications to faculty members
      await sendNotificationsToFaculty(data);

      showSuccessToast('Faculty announcement created successfully!');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);

      // Provide more specific error messages
      if (error.code === '23503') {
        showErrorToast('Database error: Invalid user reference. Please try logging out and back in.');
      } else if (error.code === '23505') {
        showErrorToast('Duplicate announcement detected. Please check if this announcement already exists.');
      } else if (error.message?.includes('User not found')) {
        showErrorToast('User authentication error. Please refresh the page and try again.');
      } else {
        showErrorToast(`Failed to create announcement: ${error.message || 'Unknown error'}`);
      }
    } finally {
      setLoading(false);
    }
  };

  // Send notifications to faculty members
  const sendNotificationsToFaculty = async (announcement: any) => {
    try {
      console.log('Sending notifications for faculty announcement:', announcement.title);

      // Get users based on target audience and faculty
      let userQuery = supabase
        .from('users')
        .select('auth_id, full_name, role, faculty')
        .eq('faculty', dbUser.faculty);

      // Filter by target audience
      if (announcement.target_audience === 'students') {
        userQuery = userQuery.eq('role', 'student');
      } else if (announcement.target_audience === 'lecturers') {
        userQuery = userQuery.eq('role', 'lecturer');
      }
      // 'faculty' and 'all' include everyone in the faculty

      const { data: users, error: usersError } = await userQuery;

      if (usersError) {
        console.error('Error fetching users for notifications:', usersError);
        return;
      }

      if (!users || users.length === 0) {
        console.log('No users found for notifications');
        return;
      }

      console.log(`Found ${users.length} users to notify`);

      // Create notifications in batches
      const batchSize = 50;
      for (let i = 0; i < users.length; i += batchSize) {
        const batch = users.slice(i, i + batchSize);
        const notifications = batch.map(user => ({
          user_id: user.auth_id,
          title: `Faculty Announcement: ${announcement.title}`,
          message: announcement.content.substring(0, 200) + (announcement.content.length > 200 ? '...' : ''),
          type: 'announcement',
          priority: announcement.priority,
          is_read: false,
          related_id: announcement.id,
          related_type: 'announcement',
          created_at: new Date().toISOString()
        }));

        const { error: notificationError } = await supabase
          .from('notifications')
          .insert(notifications);

        if (notificationError) {
          console.error('Error creating notifications batch:', notificationError);
        }

        // Small delay between batches
        if (i + batchSize < users.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      }

      console.log(`Successfully created notifications for faculty announcement: ${announcement.title}`);
    } catch (error) {
      console.error('Error sending notifications:', error);
      // Don't throw the error - announcement creation should still succeed
    }
  };

  const resetForm = () => {
    setNewAnnouncement({
      title: '',
      content: '',
      priority: 'normal',
      isPublic: false,
      targetAudience: 'faculty',
      faculty: dbUser?.faculty || '',
      expiresAt: '',
      externalLink: '',
      category: 'Faculty Notice'
    });
  };

  const handleEditAnnouncement = (announcement: ExistingAnnouncement) => {
    setEditingAnnouncement(announcement);
    setIsEditDialogOpen(true);
  };

  const handleUpdateAnnouncement = async () => {
    if (!editingAnnouncement?.id) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('announcements')
        .update({
          title: editingAnnouncement.title,
          content: editingAnnouncement.content,
          priority: editingAnnouncement.priority,
          is_public: editingAnnouncement.isPublic,
          target_audience: editingAnnouncement.targetAudience,
          faculty: editingAnnouncement.faculty,
          expires_at: editingAnnouncement.expiresAt || null,
          external_link: editingAnnouncement.externalLink || null,
          category: editingAnnouncement.category
        })
        .eq('id', editingAnnouncement.id);

      if (error) throw error;

      showSuccessToast('Announcement updated successfully!');
      setIsEditDialogOpen(false);
      setEditingAnnouncement(null);
      fetchAnnouncements();
    } catch (error) {
      console.error('Error updating announcement:', error);
      showErrorToast('Failed to update announcement');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteAnnouncement = async (id: string) => {
    if (!confirm('Are you sure you want to delete this announcement?')) return;

    try {
      setLoading(true);
      const { error } = await supabase
        .from('announcements')
        .update({ is_active: false })
        .eq('id', id);

      if (error) throw error;

      showSuccessToast('Announcement deleted successfully!');
      fetchAnnouncements();
    } catch (error) {
      console.error('Error deleting announcement:', error);
      showErrorToast('Failed to delete announcement');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Faculty Announcements</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage announcements for {dbUser?.faculty}</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700 text-white shadow-lg hover:shadow-xl transition-all duration-200">
              <Plus className="h-4 w-4 mr-2" />
              New Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Create New Announcement</DialogTitle>
              <DialogDescription>
                Create a new announcement for <strong>{dbUser?.faculty}</strong> faculty members and students.
                This announcement will only be visible to people in your faculty.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                  placeholder="Enter announcement title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement({...newAnnouncement, content: e.target.value})}
                  placeholder="Enter announcement content"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={newAnnouncement.priority} onValueChange={(value: any) => setNewAnnouncement({...newAnnouncement, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Target Audience</label>
                  <p className="text-xs text-gray-500 mb-2">All options are limited to {dbUser?.faculty} faculty only</p>
                  <Select value={newAnnouncement.targetAudience} onValueChange={(value: any) => setNewAnnouncement({...newAnnouncement, targetAudience: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="faculty">All Faculty Members</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                      <SelectItem value="lecturers">Lecturers Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Category</label>
                  <Input
                    value={newAnnouncement.category}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, category: e.target.value})}
                    placeholder="e.g., Faculty Notice, Academic Update"
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="isPublic"
                    checked={newAnnouncement.isPublic}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, isPublic: e.target.checked})}
                    className="rounded"
                  />
                  <label htmlFor="isPublic" className="text-sm font-medium">
                    Make Public (visible to all users)
                  </label>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Expiry Date (Optional)</label>
                  <Input
                    type="datetime-local"
                    value={newAnnouncement.expiresAt}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, expiresAt: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">External Link (Optional)</label>
                  <Input
                    placeholder="https://example.com"
                    value={newAnnouncement.externalLink}
                    onChange={(e) => setNewAnnouncement({...newAnnouncement, externalLink: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateAnnouncement} disabled={loading}>
                  {loading ? 'Creating...' : 'Create Announcement'}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Announcements</p>
                <p className="text-2xl font-bold text-blue-600">{announcements.length}</p>
              </div>
              <Bell className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600">
                  {announcements.filter(a => a.is_active).length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Public</p>
                <p className="text-2xl font-bold text-blue-600">
                  {announcements.filter(a => a.is_public).length}
                </p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Urgent</p>
                <p className="text-2xl font-bold text-red-600">
                  {announcements.filter(a => a.priority === 'urgent').length}
                </p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search announcements..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedPriority} onValueChange={setSelectedPriority}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedAudience} onValueChange={setSelectedAudience}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by audience" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Audiences</SelectItem>
                <SelectItem value="students">Students</SelectItem>
                <SelectItem value="lecturers">Lecturers</SelectItem>
                <SelectItem value="faculty">Faculty</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {filteredAnnouncements.map((announcement) => (
          <Card key={announcement.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    {getPriorityIcon(announcement.priority)}
                    <CardTitle className="text-lg">{announcement.title}</CardTitle>
                    <span className="text-lg">{getAudienceIcon(announcement.target_audience)}</span>
                  </div>
                  <CardDescription className="text-sm">
                    {announcement.content}
                  </CardDescription>
                  {announcement.category && (
                    <Badge variant="outline" className="w-fit mt-2">
                      {announcement.category}
                    </Badge>
                  )}
                </div>
                <div className="flex flex-col space-y-2 ml-4">
                  <Badge className={getPriorityColor(announcement.priority)}>
                    {announcement.priority}
                  </Badge>
                  {announcement.is_public && (
                    <Badge variant="secondary">
                      Public
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                  <div className="flex items-center space-x-1">
                    <Calendar className="h-4 w-4" />
                    <span>{new Date(announcement.created_at).toLocaleDateString()}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{announcement.target_audience}</span>
                  </div>
                  <span>By {announcement.users?.full_name || 'Dean'}</span>
                  {announcement.expires_at && (
                    <div className="flex items-center space-x-1">
                      <Clock className="h-4 w-4" />
                      <span>Expires: {new Date(announcement.expires_at).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleEditAnnouncement(announcement)}
                    disabled={loading}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleDeleteAnnouncement(announcement.id)}
                    disabled={loading}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </Button>
                  {announcement.external_link && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => window.open(announcement.external_link, '_blank')}
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      View Link
                    </Button>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredAnnouncements.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No announcements found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria or create a new announcement.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Announcement</DialogTitle>
            <DialogDescription>
              Update the announcement details.
            </DialogDescription>
          </DialogHeader>
          {editingAnnouncement && (
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={editingAnnouncement.title}
                  onChange={(e) => setEditingAnnouncement({...editingAnnouncement, title: e.target.value})}
                  placeholder="Enter announcement title"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Content</label>
                <Textarea
                  value={editingAnnouncement.content}
                  onChange={(e) => setEditingAnnouncement({...editingAnnouncement, content: e.target.value})}
                  placeholder="Enter announcement content"
                  rows={4}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium">Priority</label>
                  <Select value={editingAnnouncement.priority} onValueChange={(value: any) => setEditingAnnouncement({...editingAnnouncement, priority: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="normal">Normal</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="urgent">Urgent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Target Audience</label>
                  <p className="text-xs text-gray-500 mb-2">All options are limited to {dbUser?.faculty} faculty only</p>
                  <Select value={editingAnnouncement.targetAudience} onValueChange={(value: any) => setEditingAnnouncement({...editingAnnouncement, targetAudience: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="faculty">All Faculty Members</SelectItem>
                      <SelectItem value="students">Students Only</SelectItem>
                      <SelectItem value="lecturers">Lecturers Only</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleUpdateAnnouncement} disabled={loading}>
                  {loading ? 'Updating...' : 'Update Announcement'}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Announcements;
