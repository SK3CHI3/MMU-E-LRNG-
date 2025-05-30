import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Calendar, Clock, MapPin, Video, Users, Bell, Plus, Edit, X, Trash2, AlertTriangle } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  getStudentSessions,
  getLecturerSessions,
  createClassSession,
  updateClassSession,
  cancelClassSession,
  deleteClassSession,
  ClassSession,
  CreateSessionData,
  UpdateSessionData
} from '@/services/classSchedulingService';
import { getLecturerCoursesSimple } from '@/services/courseService';
import {
  uploadMultipleSessionFiles,
  getSessionAttachments,
  deleteSessionAttachment,
  SessionAttachment,
  formatFileSize,
  getFileIcon,
  isFileTypeAllowed
} from '@/services/fileUploadService';
import { Skeleton } from '@/components/ui/skeleton';
import { showErrorToast, showSuccessToast } from '@/utils/ui/toast';

const Schedule = () => {
  const { user, dbUser } = useAuth();
  const [selectedDay, setSelectedDay] = useState('monday');
  const [sessions, setSessions] = useState<ClassSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isCancelDialogOpen, setIsCancelDialogOpen] = useState(false);
  const [selectedSession, setSelectedSession] = useState<ClassSession | null>(null);
  const [cancellationReason, setCancellationReason] = useState('');
  const [lecturerCourses, setLecturerCourses] = useState<{id: string, title: string, code: string}[]>([]);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [sessionAttachments, setSessionAttachments] = useState<SessionAttachment[]>([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  const isLecturer = dbUser?.role === 'lecturer';

  const weekDays = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday'];
  const dayLabels = {
    monday: 'Monday',
    tuesday: 'Tuesday',
    wednesday: 'Wednesday',
    thursday: 'Thursday',
    friday: 'Friday'
  };

  // Form state for creating/editing sessions (lecturer only)
  const [formData, setFormData] = useState<CreateSessionData>({
    courseId: '',
    title: '',
    description: '',
    sessionDate: '',
    startTime: '',
    endTime: '',
    location: '',
    isOnline: false,
    meetingLink: '',
    meetingPassword: '',
    maxAttendees: undefined,
    sessionType: 'lecture',
    notes: '',
    isRecurring: false
  });

  // Load sessions and courses on component mount
  useEffect(() => {
    if (user?.id) {
      loadSessions();
      if (isLecturer) {
        loadLecturerCourses();
      }
    }
  }, [user?.id, isLecturer]);

  const loadSessions = async () => {
    if (!user?.id) return;

    setLoading(true);
    try {
      // Load different sessions based on user role
      const userSessions = isLecturer
        ? await getLecturerSessions(user.id)
        : await getStudentSessions(user.id);
      setSessions(userSessions);
    } catch (error) {
      console.error('Error loading sessions:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadLecturerCourses = async () => {
    if (!user?.id) return;

    try {
      const courses = await getLecturerCoursesSimple(user.id);
      setLecturerCourses(courses);
    } catch (error) {
      console.error('Error loading lecturer courses:', error);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const validFiles = files.filter(file => {
      if (!isFileTypeAllowed(file.type)) {
        showErrorToast(`File type ${file.type} is not allowed`);
        return false;
      }
      if (file.size > 50 * 1024 * 1024) { // 50MB limit
        showErrorToast(`File ${file.name} is too large (max 50MB)`);
        return false;
      }
      return true;
    });

    setSelectedFiles(prev => [...prev, ...validFiles]);
  };

  const removeSelectedFile = (index: number) => {
    setSelectedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const uploadSessionFiles = async (sessionId: string) => {
    if (selectedFiles.length === 0 || !user?.id) return;

    setUploadingFiles(true);
    try {
      const uploadedFiles = await uploadMultipleSessionFiles(
        selectedFiles,
        sessionId,
        user.id
      );

      if (uploadedFiles.length > 0) {
        showSuccessToast(`${uploadedFiles.length} file(s) uploaded successfully`);
        setSelectedFiles([]);
        // Reload attachments if viewing session details
        if (selectedSession?.id === sessionId) {
          const attachments = await getSessionAttachments(sessionId);
          setSessionAttachments(attachments);
        }
      }
    } catch (error) {
      console.error('Error uploading files:', error);
      showErrorToast('Failed to upload files');
    } finally {
      setUploadingFiles(false);
    }
  };

  // Convert sessions to the format expected by the existing component
  const convertSessionsToSchedule = (sessions: ClassSession[]) => {
    const schedule: { [key: string]: any[] } = {
      monday: [],
      tuesday: [],
      wednesday: [],
      thursday: [],
      friday: []
    };

    sessions.forEach(session => {
      const sessionDate = new Date(session.sessionDate);
      const dayOfWeek = sessionDate.getDay(); // 0 = Sunday, 1 = Monday, etc.

      let dayKey = '';
      switch (dayOfWeek) {
        case 1: dayKey = 'monday'; break;
        case 2: dayKey = 'tuesday'; break;
        case 3: dayKey = 'wednesday'; break;
        case 4: dayKey = 'thursday'; break;
        case 5: dayKey = 'friday'; break;
        default: return; // Skip weekends
      }

      schedule[dayKey].push({
        id: session.id,
        course: session.courseCode || session.courseName || 'N/A',
        title: session.title,
        instructor: session.instructorName || 'Instructor',
        time: `${session.startTime} - ${session.endTime}`,
        location: session.isOnline ? 'Online' : (session.location || 'TBA'),
        type: session.sessionType,
        isOnline: session.isOnline,
        meetingLink: session.meetingLink,
        status: session.status,
        cancellationReason: session.cancellationReason,
        students: session.maxAttendees || 0,
        description: session.description,
        notes: session.notes,
        // Keep reference to original session for actions
        sessionData: session
      });
    });

    return schedule;
  };

  const schedule = convertSessionsToSchedule(sessions);

  // Lecturer-specific functions
  const handleCreateSession = async () => {
    if (!user?.id) return;

    try {
      const newSession = await createClassSession(formData, user.id);
      if (newSession) {
        setSessions(prev => [...prev, newSession]);

        // Upload files if any are selected
        if (selectedFiles.length > 0) {
          await uploadSessionFiles(newSession.id);
        }

        setIsCreateDialogOpen(false);
        resetForm();
        showSuccessToast('Class session created successfully');
      } else {
        showErrorToast('Failed to create class session');
      }
    } catch (error) {
      console.error('Error creating session:', error);
      showErrorToast('Failed to create class session');
    }
  };

  const handleUpdateSession = async () => {
    if (!selectedSession) return;

    try {
      const updateData: UpdateSessionData = {
        title: formData.title,
        description: formData.description,
        sessionDate: formData.sessionDate,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        isOnline: formData.isOnline,
        meetingLink: formData.meetingLink,
        meetingPassword: formData.meetingPassword,
        maxAttendees: formData.maxAttendees,
        sessionType: formData.sessionType,
        notes: formData.notes
      };

      const updatedSession = await updateClassSession(selectedSession.id, updateData);
      if (updatedSession) {
        setSessions(prev => prev.map(s => s.id === selectedSession.id ? updatedSession : s));
        setIsEditDialogOpen(false);
        setSelectedSession(null);
        resetForm();
        showSuccessToast('Class session updated successfully');
      } else {
        showErrorToast('Failed to update class session');
      }
    } catch (error) {
      console.error('Error updating session:', error);
      showErrorToast('Failed to update class session');
    }
  };

  const handleCancelSession = async () => {
    if (!selectedSession) return;

    try {
      const success = await cancelClassSession(selectedSession.id, cancellationReason);
      if (success) {
        setSessions(prev => prev.map(s =>
          s.id === selectedSession.id
            ? { ...s, status: 'cancelled', cancellationReason }
            : s
        ));
        setIsCancelDialogOpen(false);
        setSelectedSession(null);
        setCancellationReason('');
        showSuccessToast('Class session cancelled successfully');
      } else {
        showErrorToast('Failed to cancel class session');
      }
    } catch (error) {
      console.error('Error cancelling session:', error);
      showErrorToast('Failed to cancel class session');
    }
  };

  const handleDeleteSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session? This action cannot be undone.')) {
      return;
    }

    try {
      const success = await deleteClassSession(sessionId);
      if (success) {
        setSessions(prev => prev.filter(s => s.id !== sessionId));
        showSuccessToast('Class session deleted successfully');
      } else {
        showErrorToast('Failed to delete class session');
      }
    } catch (error) {
      console.error('Error deleting session:', error);
      showErrorToast('Failed to delete class session');
    }
  };

  const resetForm = () => {
    setFormData({
      courseId: '',
      title: '',
      description: '',
      sessionDate: '',
      startTime: '',
      endTime: '',
      location: '',
      isOnline: false,
      meetingLink: '',
      meetingPassword: '',
      maxAttendees: undefined,
      sessionType: 'lecture',
      notes: '',
      isRecurring: false
    });
    setSelectedFiles([]);
    setSessionAttachments([]);
  };

  const openEditDialog = (session: ClassSession) => {
    setSelectedSession(session);
    setFormData({
      courseId: session.courseId,
      title: session.title,
      description: session.description || '',
      sessionDate: session.sessionDate,
      startTime: session.startTime,
      endTime: session.endTime,
      location: session.location || '',
      isOnline: session.isOnline,
      meetingLink: session.meetingLink || '',
      meetingPassword: session.meetingPassword || '',
      maxAttendees: session.maxAttendees,
      sessionType: session.sessionType,
      notes: session.notes || '',
      isRecurring: session.isRecurring
    });
    setIsEditDialogOpen(true);
  };

  const openCancelDialog = (session: ClassSession) => {
    setSelectedSession(session);
    setIsCancelDialogOpen(true);
  };

  // Always use dynamic schedule - remove fallback for production
  const currentSchedule = schedule;

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'bg-blue-500';
      case 'lab':
        return 'bg-green-500';
      case 'project':
        return 'bg-purple-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'lecture':
        return 'default';
      case 'lab':
        return 'secondary';
      case 'project':
        return 'outline';
      default:
        return 'secondary';
    }
  };

  const todayClasses = selectedDay === 'week' ? [] : (currentSchedule[selectedDay] || []);
  const totalClassesToday = todayClasses.length;
  const onlineClassesToday = todayClasses.filter(c => c.isOnline).length;
  const labsToday = todayClasses.filter(c => c.type === 'lab').length;

  // Get all sessions for the week (for lecturer full week view)
  const weekSessions = sessions.filter(session => {
    const sessionDate = new Date(session.sessionDate);
    const today = new Date();
    const startOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 1)); // Monday
    const endOfWeek = new Date(today.setDate(today.getDate() - today.getDay() + 7)); // Sunday
    return sessionDate >= startOfWeek && sessionDate <= endOfWeek;
  });

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Class Schedule</h1>
            <p className="text-gray-600 dark:text-gray-400">Loading your class schedule...</p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-20 mb-2" />
                <Skeleton className="h-8 w-12" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {[1, 2, 3].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-4 w-3/4 mb-2" />
                <Skeleton className="h-3 w-1/2" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {isLecturer ? 'Class Management' : 'Class Schedule'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {isLecturer
              ? 'Schedule and manage your class sessions'
              : 'View your weekly class schedule and upcoming sessions'
            }
          </p>
        </div>
        <div className="flex gap-2">
          {isLecturer && (
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Class
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>Schedule New Class Session</DialogTitle>
                  <DialogDescription>
                    Create a new class session for your students
                  </DialogDescription>
                </DialogHeader>

                <div className="grid gap-4 py-4">
                  <div>
                    <Label htmlFor="courseId">Course</Label>
                    <Select value={formData.courseId} onValueChange={(value) => setFormData(prev => ({ ...prev, courseId: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a course" />
                      </SelectTrigger>
                      <SelectContent>
                        {lecturerCourses.map((course) => (
                          <SelectItem key={course.id} value={course.id}>
                            {course.code} - {course.title}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {lecturerCourses.length === 0 && (
                      <p className="text-xs text-gray-500 mt-1">
                        No courses found. Make sure you are assigned as an instructor to courses.
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="title">Session Title</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                        placeholder="e.g., Introduction to Algorithms"
                      />
                    </div>
                    <div>
                      <Label htmlFor="sessionType">Session Type</Label>
                      <Select value={formData.sessionType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, sessionType: value }))}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="lecture">Lecture</SelectItem>
                          <SelectItem value="lab">Lab</SelectItem>
                          <SelectItem value="tutorial">Tutorial</SelectItem>
                          <SelectItem value="seminar">Seminar</SelectItem>
                          <SelectItem value="exam">Exam</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                      placeholder="Session description..."
                    />
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <Label htmlFor="sessionDate">Date</Label>
                      <Input
                        id="sessionDate"
                        type="date"
                        value={formData.sessionDate}
                        onChange={(e) => setFormData(prev => ({ ...prev, sessionDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="startTime">Start Time</Label>
                      <Input
                        id="startTime"
                        type="time"
                        value={formData.startTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="endTime">End Time</Label>
                      <Input
                        id="endTime"
                        type="time"
                        value={formData.endTime}
                        onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="isOnline"
                      checked={formData.isOnline}
                      onChange={(e) => setFormData(prev => ({ ...prev, isOnline: e.target.checked }))}
                    />
                    <Label htmlFor="isOnline">Online Session</Label>
                  </div>

                  {formData.isOnline ? (
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="meetingLink">Meeting Link</Label>
                        <Input
                          id="meetingLink"
                          value={formData.meetingLink}
                          onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                          placeholder="https://zoom.us/j/..."
                        />
                      </div>
                      <div>
                        <Label htmlFor="meetingPassword">Meeting Password</Label>
                        <Input
                          id="meetingPassword"
                          value={formData.meetingPassword}
                          onChange={(e) => setFormData(prev => ({ ...prev, meetingPassword: e.target.value }))}
                          placeholder="Optional"
                        />
                      </div>
                    </div>
                  ) : (
                    <div>
                      <Label htmlFor="location">Location</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                        placeholder="e.g., Room 201, Computer Science Building"
                      />
                    </div>
                  )}

                  <div>
                    <Label htmlFor="notes">Notes</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                      placeholder="Additional notes for students..."
                    />
                  </div>

                  {/* File Upload Section */}
                  <div>
                    <Label htmlFor="files">Attach Files</Label>
                    <Input
                      id="files"
                      type="file"
                      multiple
                      onChange={handleFileSelect}
                      className="mt-2"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Supported: PDF, Word, Excel, PowerPoint, Images, Archives (Max 50MB each)
                    </p>

                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <Label className="text-sm font-medium">Selected Files:</Label>
                        {selectedFiles.map((file, index) => (
                          <div key={index} className="flex items-center justify-between p-2 bg-gray-50 dark:bg-gray-800 rounded">
                            <div className="flex items-center space-x-2">
                              <span className="text-lg">{getFileIcon(file.type)}</span>
                              <div>
                                <p className="text-sm font-medium">{file.name}</p>
                                <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                              </div>
                            </div>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => removeSelectedFile(index)}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateSession}
                    disabled={uploadingFiles || !formData.courseId || !formData.title}
                  >
                    {uploadingFiles ? 'Creating & Uploading...' : 'Schedule Session'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
          <Button className="bg-blue-600 hover:bg-blue-700">
            <Calendar className="h-4 w-4 mr-2" />
            Export Classes
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {selectedDay === 'week' && isLecturer ? 'Total Sessions' : "Today's Classes"}
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {selectedDay === 'week' && isLecturer ? sessions.length : totalClassesToday}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {selectedDay === 'week' && isLecturer ? 'Scheduled' : 'Online Classes'}
                </p>
                <p className="text-2xl font-bold text-green-600">
                  {selectedDay === 'week' && isLecturer
                    ? sessions.filter(s => s.status === 'scheduled').length
                    : onlineClassesToday
                  }
                </p>
              </div>
              <Video className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {selectedDay === 'week' && isLecturer ? 'Cancelled' : 'Lab Sessions'}
                </p>
                <p className="text-2xl font-bold text-purple-600">
                  {selectedDay === 'week' && isLecturer
                    ? sessions.filter(s => s.status === 'cancelled').length
                    : labsToday
                  }
                </p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  {selectedDay === 'week' && isLecturer ? 'Online Sessions' : 'Next Class'}
                </p>
                <p className="text-2xl font-bold text-orange-600">
                  {selectedDay === 'week' && isLecturer
                    ? sessions.filter(s => s.isOnline).length
                    : (todayClasses.length > 0 ? todayClasses[0].time.split(' - ')[0] : 'None')
                  }
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Day Selector - Enhanced for lecturers */}
      <div className="flex space-x-2 overflow-x-auto pb-2">
        {isLecturer && (
          <Button
            variant={selectedDay === 'week' ? 'default' : 'outline'}
            onClick={() => setSelectedDay('week')}
            className="min-w-[120px]"
          >
            Full Week
          </Button>
        )}
        {weekDays.map((day) => (
          <Button
            key={day}
            variant={selectedDay === day ? 'default' : 'outline'}
            onClick={() => setSelectedDay(day)}
            className="min-w-[120px]"
          >
            {dayLabels[day]}
          </Button>
        ))}
      </div>

      {/* Schedule Display - Week View for Lecturers, Day View for Students */}
      {selectedDay === 'week' && isLecturer ? (
        // Full Week View for Lecturers
        <div className="space-y-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            Weekly Classes Overview
          </h2>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
            {weekDays.map((day) => {
              const dayClasses = currentSchedule[day] || [];
              return (
                <Card key={day} className="min-h-[400px]">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg text-center">
                      {dayLabels[day]}
                    </CardTitle>
                    <CardDescription className="text-center">
                      {dayClasses.length} {dayClasses.length === 1 ? 'session' : 'sessions'}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {dayClasses.length === 0 ? (
                      <div className="text-center text-gray-500 py-8">
                        <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No classes</p>
                      </div>
                    ) : (
                      dayClasses.map((classItem, index) => (
                        <Card key={index} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                          <CardContent className="p-3">
                            <div className="space-y-2">
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <h4 className="font-medium text-sm truncate">{classItem.title}</h4>
                                  <p className="text-xs text-gray-600">{classItem.course}</p>
                                </div>
                                <div className="flex items-center space-x-1 ml-2">
                                  {classItem.status === 'cancelled' && (
                                    <Badge variant="destructive" className="text-xs">
                                      Cancelled
                                    </Badge>
                                  )}
                                  <Badge variant={getTypeBadge(classItem.type)} className="text-xs">
                                    {classItem.type}
                                  </Badge>
                                </div>
                              </div>

                              <div className="space-y-1 text-xs text-gray-600">
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-3 w-3" />
                                  <span>{classItem.time}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  {classItem.isOnline ? (
                                    <Video className="h-3 w-3" />
                                  ) : (
                                    <MapPin className="h-3 w-3" />
                                  )}
                                  <span className="truncate">{classItem.location}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Users className="h-3 w-3" />
                                  <span>{classItem.students} students</span>
                                </div>
                              </div>

                              {/* Cancellation notice */}
                              {classItem.status === 'cancelled' && classItem.cancellationReason && (
                                <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-xs">
                                  <p className="text-red-700 dark:text-red-300">
                                    <strong>Cancelled:</strong> {classItem.cancellationReason}
                                  </p>
                                </div>
                              )}

                              {/* Action buttons for lecturers */}
                              {classItem.status === 'scheduled' && (
                                <div className="flex space-x-1 pt-2">
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => {
                                      if (classItem.sessionData) openEditDialog(classItem.sessionData);
                                    }}
                                  >
                                    <Edit className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => {
                                      if (classItem.sessionData) openCancelDialog(classItem.sessionData);
                                    }}
                                  >
                                    <X className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    className="h-6 px-2 text-xs"
                                    onClick={() => handleDeleteSession(classItem.id)}
                                  >
                                    <Trash2 className="h-3 w-3" />
                                  </Button>
                                </div>
                              )}
                            </div>
                          </CardContent>
                        </Card>
                      ))
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      ) : (
        // Day View for Students and Individual Day View for Lecturers
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {dayLabels[selectedDay]} Classes
          </h2>

          {todayClasses.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center">
                <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  {isLecturer ? 'No Sessions Scheduled' : 'No Classes Today'}
                </h3>
                <p className="text-gray-600 dark:text-gray-400">
                  {isLecturer
                    ? `You haven't scheduled any sessions for ${dayLabels[selectedDay]}. Click "Schedule Class" to create one.`
                    : `You have no scheduled classes for ${dayLabels[selectedDay]}.`
                  }
                </p>
                {isLecturer && (
                  <Button
                    className="mt-4 bg-blue-600 hover:bg-blue-700"
                    onClick={() => setIsCreateDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Schedule Class
                  </Button>
                )}
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {todayClasses.map((classItem) => (
              <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getTypeColor(classItem.type)}`} />
                      <div>
                        <CardTitle className="text-lg">{classItem.course}</CardTitle>
                        <CardDescription className="font-medium">{classItem.title}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getTypeBadge(classItem.type)}>
                        {classItem.type}
                      </Badge>
                      {classItem.isOnline && (
                        <Badge variant="outline" className="text-green-600">
                          <Video className="h-3 w-3 mr-1" />
                          Online
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div className="flex items-center space-x-2">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <span>{classItem.time}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>{classItem.students} students</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      {classItem.isOnline ? (
                        <Video className="h-4 w-4 text-gray-500" />
                      ) : (
                        <MapPin className="h-4 w-4 text-gray-500" />
                      )}
                      <span>{classItem.location}</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Users className="h-4 w-4 text-gray-500" />
                      <span>Instructor: {classItem.instructor}</span>
                    </div>
                  </div>

                  {/* Show cancellation reason if cancelled */}
                  {classItem.status === 'cancelled' && (
                    <Alert className="mt-3">
                      <AlertTriangle className="h-4 w-4" />
                      <AlertDescription>
                        <strong>Cancelled:</strong> {classItem.cancellationReason || 'No reason provided'}
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="flex space-x-2 pt-2">
                    {isLecturer && classItem.status === 'scheduled' ? (
                      // Lecturer action buttons
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (classItem.sessionData) openEditDialog(classItem.sessionData);
                          }}
                        >
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (classItem.sessionData) openCancelDialog(classItem.sessionData);
                          }}
                        >
                          <X className="h-4 w-4 mr-2" />
                          Cancel
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleDeleteSession(classItem.id)}
                        >
                          <Trash2 className="h-4 w-4 mr-2" />
                          Delete
                        </Button>
                      </>
                    ) : classItem.status === 'cancelled' ? (
                      // Cancelled session - no actions
                      <div className="flex-1 text-center text-gray-500">
                        This session has been cancelled
                      </div>
                    ) : (
                      // Student action buttons or lecturer view for completed sessions
                      <>
                        {classItem.isOnline ? (
                          <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700">
                            <Video className="h-4 w-4 mr-2" />
                            {isLecturer ? 'Start Online Class' : 'Join Online Class'}
                          </Button>
                        ) : (
                          <Button size="sm" className="flex-1">
                            <MapPin className="h-4 w-4 mr-2" />
                            Get Directions
                          </Button>
                        )}
                        <Button size="sm" variant="outline">
                          <Bell className="h-4 w-4 mr-2" />
                          {isLecturer ? 'Notify Students' : 'Set Reminder'}
                        </Button>
                      </>
                    )}
                  </div>
                </CardContent>
              </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Edit Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Class Session</DialogTitle>
            <DialogDescription>
              Update the details of your class session
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="edit-title">Session Title</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-sessionType">Session Type</Label>
                <Select value={formData.sessionType} onValueChange={(value: any) => setFormData(prev => ({ ...prev, sessionType: value }))}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lecture">Lecture</SelectItem>
                    <SelectItem value="lab">Lab</SelectItem>
                    <SelectItem value="tutorial">Tutorial</SelectItem>
                    <SelectItem value="seminar">Seminar</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="edit-sessionDate">Date</Label>
                <Input
                  id="edit-sessionDate"
                  type="date"
                  value={formData.sessionDate}
                  onChange={(e) => setFormData(prev => ({ ...prev, sessionDate: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-startTime">Start Time</Label>
                <Input
                  id="edit-startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="edit-endTime">End Time</Label>
                <Input
                  id="edit-endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, endTime: e.target.value }))}
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <input
                type="checkbox"
                id="edit-isOnline"
                checked={formData.isOnline}
                onChange={(e) => setFormData(prev => ({ ...prev, isOnline: e.target.checked }))}
              />
              <Label htmlFor="edit-isOnline">Online Session</Label>
            </div>

            {formData.isOnline ? (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="edit-meetingLink">Meeting Link</Label>
                  <Input
                    id="edit-meetingLink"
                    value={formData.meetingLink}
                    onChange={(e) => setFormData(prev => ({ ...prev, meetingLink: e.target.value }))}
                  />
                </div>
                <div>
                  <Label htmlFor="edit-meetingPassword">Meeting Password</Label>
                  <Input
                    id="edit-meetingPassword"
                    value={formData.meetingPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, meetingPassword: e.target.value }))}
                  />
                </div>
              </div>
            ) : (
              <div>
                <Label htmlFor="edit-location">Location</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData(prev => ({ ...prev, location: e.target.value }))}
                />
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateSession}>
              Update Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Cancel Dialog */}
      <Dialog open={isCancelDialogOpen} onOpenChange={setIsCancelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancel Class Session</DialogTitle>
            <DialogDescription>
              Are you sure you want to cancel this class session? Students will be notified.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <Label htmlFor="cancellationReason">Reason for Cancellation</Label>
            <Textarea
              id="cancellationReason"
              value={cancellationReason}
              onChange={(e) => setCancellationReason(e.target.value)}
              placeholder="Please provide a reason for cancelling this session..."
              className="mt-2"
            />
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCancelDialogOpen(false)}>
              Keep Session
            </Button>
            <Button variant="destructive" onClick={handleCancelSession}>
              Cancel Session
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Schedule;
