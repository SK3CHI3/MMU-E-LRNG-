import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Calendar, Edit, Eye, Globe, Lock, Megaphone, Plus, Search, Trash2, BookOpen } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/lib/supabaseClient";
import { createNotification } from "@/services/notificationService";
import { showSuccessToast, showErrorToast } from "@/utils/ui/toast";

interface Course {
  id: string;
  title: string;
  code: string;
}

interface AnnouncementData {
  id?: string;
  title: string;
  content: string;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  isPublic: boolean;
  targetAudience: 'all' | 'students' | 'course';
  courseId?: string;
  expiresAt?: string;
  externalLink?: string;
  category: string;
}

interface ExistingAnnouncement extends AnnouncementData {
  id: string;
  createdBy: string;
  authorName: string;
  createdAt: string;
  isActive: boolean;
  courseName?: string;
}

const LecturerAnnouncementManagement = () => {
  const { dbUser } = useAuth();
  const [announcements, setAnnouncements] = useState<ExistingAnnouncement[]>([]);
  const [courses, setCourses] = useState<Course[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<ExistingAnnouncement | null>(null);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPriority, setFilterPriority] = useState('all');
  const [filterType, setFilterType] = useState('all');

  const [newAnnouncement, setNewAnnouncement] = useState<AnnouncementData>({
    title: '',
    content: '',
    priority: 'normal',
    isPublic: false,
    targetAudience: 'students',
    courseId: '',
    expiresAt: '',
    externalLink: '',
    category: 'Academic'
  });

  // Fetch lecturer's courses and announcements
  useEffect(() => {
    if (dbUser?.auth_id) {
      fetchCourses();
      fetchAnnouncements();
    }
  }, [dbUser]);

  const fetchCourses = async () => {
    if (!dbUser?.auth_id) return;

    try {
      const { data, error } = await supabase
        .from('courses')
        .select('id, title, code')
        .eq('created_by', dbUser.auth_id);

      if (error) throw error;
      setCourses(data || []);
    } catch (error) {
      console.error('Error fetching courses:', error);
    }
  };

  const fetchAnnouncements = async () => {
    if (!dbUser?.auth_id) return;

    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('announcements')
        .select(`
          *,
          users!announcements_created_by_fkey (
            full_name,
            role
          ),
          courses (
            title,
            code
          )
        `)
        .eq('created_by', dbUser.auth_id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      const formattedAnnouncements: ExistingAnnouncement[] = data?.map(announcement => ({
        id: announcement.id,
        title: announcement.title,
        content: announcement.content,
        priority: announcement.priority,
        isPublic: announcement.is_public,
        targetAudience: announcement.target_audience || 'students',
        courseId: announcement.course_id,
        expiresAt: announcement.expires_at,
        externalLink: announcement.external_link,
        category: announcement.category || 'Academic',
        createdBy: announcement.created_by,
        authorName: announcement.users?.full_name || 'Unknown',
        createdAt: announcement.created_at,
        isActive: announcement.is_active,
        courseName: announcement.courses ? `${announcement.courses.code} - ${announcement.courses.title}` : undefined
      })) || [];

      setAnnouncements(formattedAnnouncements);
    } catch (error) {
      console.error('Error fetching announcements:', error);
      showErrorToast('Failed to fetch announcements');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateAnnouncement = async () => {
    if (!dbUser?.auth_id || !newAnnouncement.title || !newAnnouncement.content) {
      showErrorToast('Please fill in all required fields');
      return;
    }

    if (newAnnouncement.targetAudience === 'course' && !newAnnouncement.courseId) {
      showErrorToast('Please select a course for course-specific announcements');
      return;
    }

    try {
      setLoading(true);

      // Create announcement in database
      const { data, error } = await supabase
        .from('announcements')
        .insert({
          title: newAnnouncement.title,
          content: newAnnouncement.content,
          priority: newAnnouncement.priority,
          is_public: newAnnouncement.isPublic,
          target_audience: newAnnouncement.targetAudience,
          course_id: newAnnouncement.targetAudience === 'course' ? newAnnouncement.courseId : null,
          faculty: dbUser.faculty,
          expires_at: newAnnouncement.expiresAt || null,
          external_link: newAnnouncement.externalLink || null,
          category: newAnnouncement.category,
          created_by: dbUser.auth_id,
          is_active: true
        })
        .select()
        .single();

      if (error) throw error;

      // Send notifications to target users
      await sendNotificationsToUsers(data.id, newAnnouncement);

      showSuccessToast('Announcement created successfully!');
      setIsCreateDialogOpen(false);
      resetForm();
      fetchAnnouncements();
    } catch (error) {
      console.error('Error creating announcement:', error);
      showErrorToast('Failed to create announcement');
    } finally {
      setLoading(false);
    }
  };

  const sendNotificationsToUsers = async (announcementId: string, announcement: AnnouncementData) => {
    try {
      let targetUsers: any[] = [];

      // Get target users based on audience
      if (announcement.targetAudience === 'all') {
        const { data } = await supabase
          .from('users')
          .select('auth_id')
          .eq('faculty', dbUser?.faculty)
          .neq('auth_id', dbUser?.auth_id);
        targetUsers = data || [];
      } else if (announcement.targetAudience === 'students') {
        const { data } = await supabase
          .from('users')
          .select('auth_id')
          .eq('role', 'student')
          .eq('faculty', dbUser?.faculty);
        targetUsers = data || [];
      } else if (announcement.targetAudience === 'course' && announcement.courseId) {
        // Get students enrolled in the specific course
        const { data: enrollmentData } = await supabase
          .from('course_enrollments')
          .select(`
            user_id,
            users!course_enrollments_user_id_fkey (
              auth_id
            )
          `)
          .eq('course_id', announcement.courseId);

        // Transform enrollment data to target users with proper type safety
        targetUsers = enrollmentData?.reduce((acc: any[], enrollment: any) => {
          if (enrollment.users && enrollment.users.auth_id) {
            acc.push({ auth_id: enrollment.users.auth_id });
          }
          return acc;
        }, []) || [];
      }

      // Create notifications for each target user
      const notificationPromises = targetUsers.map(user =>
        createNotification(
          user.auth_id,
          announcement.title,
          announcement.content,
          'announcement',
          announcement.priority === 'urgent' ? 'urgent' :
          announcement.priority === 'high' ? 'high' : 'medium',
          announcement.externalLink,
          announcementId
        )
      );

      await Promise.all(notificationPromises);
    } catch (error) {
      console.error('Error sending notifications:', error);
    }
  };

  const resetForm = () => {
    setNewAnnouncement({
      title: '',
      content: '',
      priority: 'normal',
      isPublic: false,
      targetAudience: 'students',
      courseId: '',
      expiresAt: '',
      externalLink: '',
      category: 'Academic'
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
          course_id: editingAnnouncement.targetAudience === 'course' ? editingAnnouncement.courseId : null,
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'high': return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200';
      case 'normal': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'low': return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const filteredAnnouncements = announcements.filter(announcement => {
    const matchesSearch = announcement.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         announcement.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPriority = filterPriority === 'all' || announcement.priority === filterPriority;
    const matchesType = filterType === 'all' ||
                       (filterType === 'public' && announcement.isPublic) ||
                       (filterType === 'internal' && !announcement.isPublic) ||
                       (filterType === 'course' && announcement.targetAudience === 'course');

    return matchesSearch && matchesPriority && matchesType && announcement.isActive;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">My Announcements</h1>
          <p className="text-muted-foreground">Create and manage announcements for your students and courses</p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button className="flex items-center gap-2">
              <Plus className="h-4 w-4" />
              Create Announcement
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Megaphone className="h-5 w-5" />
                Create New Announcement
              </DialogTitle>
              <DialogDescription>
                Create announcements for your students and courses
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Enter announcement title"
                  value={newAnnouncement.title}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="content">Content *</Label>
                <Textarea
                  id="content"
                  placeholder="Enter announcement content"
                  rows={4}
                  value={newAnnouncement.content}
                  onChange={(e) => setNewAnnouncement(prev => ({ ...prev, content: e.target.value }))}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={newAnnouncement.priority} onValueChange={(value: any) => setNewAnnouncement(prev => ({ ...prev, priority: value }))}>
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

                {/* Category */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={newAnnouncement.category} onValueChange={(value) => setNewAnnouncement(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="Assignment">Assignment</SelectItem>
                      <SelectItem value="Exam">Exam</SelectItem>
                      <SelectItem value="Class">Class</SelectItem>
                      <SelectItem value="Deadline">Deadline</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select value={newAnnouncement.targetAudience} onValueChange={(value: any) => setNewAnnouncement(prev => ({ ...prev, targetAudience: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="students">All My Students</SelectItem>
                    <SelectItem value="course">Specific Course</SelectItem>
                    <SelectItem value="all">All Faculty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Course Selection (if course-specific) */}
              {newAnnouncement.targetAudience === 'course' && (
                <div className="space-y-2">
                  <Label>Select Course</Label>
                  <Select value={newAnnouncement.courseId} onValueChange={(value) => setNewAnnouncement(prev => ({ ...prev, courseId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            {course.code} - {course.title}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Public/Internal Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {newAnnouncement.isPublic ? <Globe className="h-4 w-4 text-green-600" /> : <Lock className="h-4 w-4 text-gray-600" />}
                    <Label className="font-medium">
                      {newAnnouncement.isPublic ? 'Public Announcement' : 'Internal Announcement'}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {newAnnouncement.isPublic
                      ? 'Will be displayed on the public landing page and all dashboards'
                      : 'Will only be visible to logged-in users on their dashboards'
                    }
                  </p>
                </div>
                <Switch
                  checked={newAnnouncement.isPublic}
                  onCheckedChange={(checked) => setNewAnnouncement(prev => ({ ...prev, isPublic: checked }))}
                />
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-2 gap-4">
                {/* Expiry Date */}
                <div className="space-y-2">
                  <Label htmlFor="expires">Expires At (Optional)</Label>
                  <Input
                    id="expires"
                    type="datetime-local"
                    value={newAnnouncement.expiresAt}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, expiresAt: e.target.value }))}
                  />
                </div>

                {/* External Link */}
                <div className="space-y-2">
                  <Label htmlFor="link">External Link (Optional)</Label>
                  <Input
                    id="link"
                    placeholder="https://example.com"
                    value={newAnnouncement.externalLink}
                    onChange={(e) => setNewAnnouncement(prev => ({ ...prev, externalLink: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateAnnouncement} disabled={loading}>
                {loading ? 'Creating...' : 'Create Announcement'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            Filter Announcements
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Input
                placeholder="Search announcements..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={filterPriority} onValueChange={setFilterPriority}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Priority" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Priorities</SelectItem>
                <SelectItem value="urgent">Urgent</SelectItem>
                <SelectItem value="high">High</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="low">Low</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filterType} onValueChange={setFilterType}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Types</SelectItem>
                <SelectItem value="public">Public</SelectItem>
                <SelectItem value="internal">Internal</SelectItem>
                <SelectItem value="course">Course-Specific</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Announcements List */}
      <div className="space-y-4">
        {loading ? (
          <Card>
            <CardContent className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </CardContent>
          </Card>
        ) : filteredAnnouncements.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-8">
              <Megaphone className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium text-muted-foreground">No announcements found</h3>
              <p className="text-sm text-muted-foreground">Create your first announcement to get started</p>
            </CardContent>
          </Card>
        ) : (
          filteredAnnouncements.map((announcement) => (
            <Card key={announcement.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg font-semibold">{announcement.title}</h3>
                      <Badge className={getPriorityColor(announcement.priority)}>
                        {announcement.priority}
                      </Badge>
                      <Badge variant="outline">
                        {announcement.category}
                      </Badge>
                      {announcement.isPublic ? (
                        <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                          <Globe className="h-3 w-3 mr-1" />
                          Public
                        </Badge>
                      ) : (
                        <Badge variant="secondary">
                          <Lock className="h-3 w-3 mr-1" />
                          Internal
                        </Badge>
                      )}
                      {announcement.courseName && (
                        <Badge className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                          <BookOpen className="h-3 w-3 mr-1" />
                          {announcement.courseName}
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">
                      Target: {announcement.targetAudience} • Created: {new Date(announcement.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={() => handleEditAnnouncement(announcement)}>
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="outline" size="sm" onClick={() => handleDeleteAnnouncement(announcement.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-700 dark:text-gray-300 mb-3">
                  {announcement.content}
                </p>
                {announcement.externalLink && (
                  <Button variant="outline" size="sm" asChild>
                    <a href={announcement.externalLink} target="_blank" rel="noopener noreferrer">
                      <Eye className="h-3 w-3 mr-1" />
                      View Link
                    </a>
                  </Button>
                )}
                {announcement.expiresAt && (
                  <div className="flex items-center gap-1 text-xs text-muted-foreground mt-2">
                    <Calendar className="h-3 w-3" />
                    Expires: {new Date(announcement.expiresAt).toLocaleDateString()}
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Edit Announcement
            </DialogTitle>
            <DialogDescription>
              Update your announcement details
            </DialogDescription>
          </DialogHeader>

          {editingAnnouncement && (
            <div className="space-y-4">
              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="edit-title">Title *</Label>
                <Input
                  id="edit-title"
                  placeholder="Enter announcement title"
                  value={editingAnnouncement.title}
                  onChange={(e) => setEditingAnnouncement(prev => prev ? { ...prev, title: e.target.value } : null)}
                />
              </div>

              {/* Content */}
              <div className="space-y-2">
                <Label htmlFor="edit-content">Content *</Label>
                <Textarea
                  id="edit-content"
                  placeholder="Enter announcement content"
                  rows={4}
                  value={editingAnnouncement.content}
                  onChange={(e) => setEditingAnnouncement(prev => prev ? { ...prev, content: e.target.value } : null)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Priority */}
                <div className="space-y-2">
                  <Label>Priority</Label>
                  <Select value={editingAnnouncement.priority} onValueChange={(value: any) => setEditingAnnouncement(prev => prev ? { ...prev, priority: value } : null)}>
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

                {/* Category */}
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select value={editingAnnouncement.category} onValueChange={(value) => setEditingAnnouncement(prev => prev ? { ...prev, category: value } : null)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Academic">Academic</SelectItem>
                      <SelectItem value="Assignment">Assignment</SelectItem>
                      <SelectItem value="Exam">Exam</SelectItem>
                      <SelectItem value="Class">Class</SelectItem>
                      <SelectItem value="Deadline">Deadline</SelectItem>
                      <SelectItem value="General">General</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Target Audience */}
              <div className="space-y-2">
                <Label>Target Audience</Label>
                <Select value={editingAnnouncement.targetAudience} onValueChange={(value: any) => setEditingAnnouncement(prev => prev ? { ...prev, targetAudience: value } : null)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="students">All My Students</SelectItem>
                    <SelectItem value="course">Specific Course</SelectItem>
                    <SelectItem value="all">All Faculty</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Course Selection (if course-specific) */}
              {editingAnnouncement.targetAudience === 'course' && (
                <div className="space-y-2">
                  <Label>Select Course</Label>
                  <Select value={editingAnnouncement.courseId || ''} onValueChange={(value) => setEditingAnnouncement(prev => prev ? { ...prev, courseId: value } : null)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a course" />
                    </SelectTrigger>
                    <SelectContent>
                      {courses.map(course => (
                        <SelectItem key={course.id} value={course.id}>
                          <div className="flex items-center gap-2">
                            <BookOpen className="h-4 w-4" />
                            {course.code} - {course.title}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              )}

              {/* Public/Internal Toggle */}
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    {editingAnnouncement.isPublic ? <Globe className="h-4 w-4 text-green-600" /> : <Lock className="h-4 w-4 text-gray-600" />}
                    <Label className="font-medium">
                      {editingAnnouncement.isPublic ? 'Public Announcement' : 'Internal Announcement'}
                    </Label>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    {editingAnnouncement.isPublic
                      ? 'Will be displayed on the public landing page and all dashboards'
                      : 'Will only be visible to logged-in users on their dashboards'
                    }
                  </p>
                </div>
                <Switch
                  checked={editingAnnouncement.isPublic}
                  onCheckedChange={(checked) => setEditingAnnouncement(prev => prev ? { ...prev, isPublic: checked } : null)}
                />
              </div>

              {/* Optional Fields */}
              <div className="grid grid-cols-2 gap-4">
                {/* Expiry Date */}
                <div className="space-y-2">
                  <Label htmlFor="edit-expires">Expires At (Optional)</Label>
                  <Input
                    id="edit-expires"
                    type="datetime-local"
                    value={editingAnnouncement.expiresAt || ''}
                    onChange={(e) => setEditingAnnouncement(prev => prev ? { ...prev, expiresAt: e.target.value } : null)}
                  />
                </div>

                {/* External Link */}
                <div className="space-y-2">
                  <Label htmlFor="edit-link">External Link (Optional)</Label>
                  <Input
                    id="edit-link"
                    placeholder="https://example.com"
                    value={editingAnnouncement.externalLink || ''}
                    onChange={(e) => setEditingAnnouncement(prev => prev ? { ...prev, externalLink: e.target.value } : null)}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateAnnouncement} disabled={loading}>
              {loading ? 'Updating...' : 'Update Announcement'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default LecturerAnnouncementManagement;
