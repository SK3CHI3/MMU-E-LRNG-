import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { useAuth } from '@/contexts/AuthContext';
import { getLecturerCourses } from '@/services/courseService';
import { getLecturerAssignments, AssignmentWithStats, createAssignment } from '@/services/assignmentService';
import { createExamQuestions } from '@/services/examService';
import CreateExamDialog from '@/components/exam/CreateExamDialog';
import { showSuccessToast, showErrorToast } from '@/utils/ui/toast';
import {
  Plus,
  Edit,
  Trash2,
  Send,
  Users,
  Calendar,
  FileText,
  Clock,
  CheckCircle,
  AlertCircle,
  Eye,
  Download,
  BookOpen,
  Brain,
  ClipboardCheck
} from 'lucide-react';

const AssignmentManagement = () => {
  const { dbUser } = useAuth();
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isCreateExamDialogOpen, setIsCreateExamDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');
  const [courses, setCourses] = useState<any[]>([]);
  const [assignments, setAssignments] = useState<AssignmentWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!dbUser?.auth_id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch courses and assignments in parallel
        const [coursesData, assignmentsData] = await Promise.all([
          getLecturerCourses(dbUser.auth_id),
          getLecturerAssignments(dbUser.auth_id)
        ]);

        setCourses(coursesData.map(course => ({
          id: course.id,
          name: `${course.code} - ${course.title}`,
          students: course.total_students || 0
        })));

        setAssignments(assignmentsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load assignments. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dbUser?.auth_id]);

  const handleCreateExam = async (examData: any) => {
    try {
      if (!dbUser?.auth_id) throw new Error('User not authenticated');

      // Create the assignment first
      const assignmentPayload = {
        course_id: examData.course_id,
        title: examData.title,
        description: examData.description,
        instructions: examData.instructions,
        due_date: `${examData.due_date}T${examData.due_time}:00`,
        total_points: examData.total_points,
        assignment_type: examData.assignment_type,
        submission_format: 'online_exam',
        duration_minutes: examData.duration_minutes,
        max_attempts: examData.max_attempts,
        shuffle_questions: examData.shuffle_questions,
        shuffle_options: examData.shuffle_options,
        show_results_immediately: examData.show_results_immediately,
        show_correct_answers: examData.show_correct_answers,
        allow_backtrack: examData.allow_backtrack,
        question_per_page: examData.question_per_page,
        passing_score: examData.passing_score,
        available_from: examData.available_from ? new Date(examData.available_from).toISOString() : null,
        available_until: examData.available_until ? new Date(examData.available_until).toISOString() : null,
        created_by: dbUser.auth_id,
        is_published: true
      };

      const assignment = await createAssignment(assignmentPayload);

      // Create the questions
      if (examData.questions && examData.questions.length > 0) {
        await createExamQuestions(assignment.id, examData.questions);
      }

      showSuccessToast(`${examData.assignment_type.toUpperCase()} created successfully!`);

      // Refresh the assignments list
      const updatedAssignments = await getLecturerAssignments(dbUser.auth_id);
      setAssignments(updatedAssignments);

    } catch (error) {
      console.error('Error creating exam:', error);
      showErrorToast('Failed to create exam. Please try again.');
      throw error;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading assignments...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => window.location.reload()}>Try Again</Button>
        </div>
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500';
      case 'closed': return 'bg-gray-500';
      case 'draft': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'closed': return 'secondary';
      case 'draft': return 'outline';
      default: return 'secondary';
    }
  };

  const CreateAssignmentDialog = () => (
    <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
      <DialogTrigger asChild>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Create New Assignment</DialogTitle>
          <DialogDescription>
            Create a new assignment for your students
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="course">Course</Label>
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Select course" />
                </SelectTrigger>
                <SelectContent>
                  {courses.map(course => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="type">Assignment Type</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="programming">Programming</SelectItem>
                  <SelectItem value="project">Project</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                  <SelectItem value="quiz">Quiz</SelectItem>
                  <SelectItem value="exam">Exam</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="title">Assignment Title</Label>
            <Input id="title" placeholder="Enter assignment title" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              placeholder="Provide detailed instructions for the assignment"
              rows={4}
            />
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="points">Points</Label>
              <Input id="points" type="number" placeholder="100" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueDate">Due Date</Label>
              <Input id="dueDate" type="date" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dueTime">Due Time</Label>
              <Input id="dueTime" type="time" defaultValue="23:59" />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
            Save as Draft
          </Button>
          <Button onClick={() => setIsCreateDialogOpen(false)}>
            <Send className="h-4 w-4 mr-2" />
            Publish Assignment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignment & Exam Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Create, manage, and track assignments, exams, and CATs for your courses</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsCreateExamDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Brain className="h-4 w-4 mr-2" />
            Create Exam/CAT
          </Button>
          <CreateAssignmentDialog />
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Assignments</p>
                <p className="text-2xl font-bold text-green-600">
                  {assignments.filter(a => a.status === 'published').length}
                </p>
              </div>
              <FileText className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Grading</p>
                <p className="text-2xl font-bold text-orange-600">
                  {assignments.reduce((sum, a) => sum + (a.total_submissions - a.graded_submissions), 0)}
                </p>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Submissions</p>
                <p className="text-2xl font-bold text-blue-600">
                  {assignments.reduce((sum, a) => sum + a.total_submissions, 0)}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Completed</p>
                <p className="text-2xl font-bold text-purple-600">
                  {assignments.filter(a => a.status === 'closed').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      <Tabs defaultValue="all" className="space-y-4">
        <TabsList>
          <TabsTrigger value="all">All Assignments</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="closed">Closed</TabsTrigger>
          <TabsTrigger value="draft">Drafts</TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="space-y-4">
          {assignments.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assignments yet</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                Create your first assignment to get started
              </p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Assignment
              </Button>
            </div>
          ) : (
            assignments.map((assignment) => (
              <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full ${getStatusColor(assignment.status)}`} />
                      <div>
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription className="font-medium">{assignment.course?.code} - {assignment.course?.title}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getStatusBadge(assignment.status)}>
                        {assignment.status}
                      </Badge>
                      <Badge variant="outline">
                        {assignment.assignment_type || 'Assignment'}
                      </Badge>
                      <Badge variant="outline">
                        {assignment.total_points} pts
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {assignment.description}
                  </p>

                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Users className="h-4 w-4" />
                        <span>{assignment.total_submissions}/{assignment.total_enrolled || 0} submitted</span>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Submission Progress</span>
                      <span>{assignment.total_enrolled > 0 ? Math.round((assignment.total_submissions / assignment.total_enrolled) * 100) : 0}%</span>
                    </div>
                    <Progress value={assignment.total_enrolled > 0 ? (assignment.total_submissions / assignment.total_enrolled) * 100 : 0} className="h-2" />
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Grading Progress</span>
                      <span>{assignment.total_submissions > 0 ? Math.round((assignment.graded_submissions / assignment.total_submissions) * 100) : 0}%</span>
                    </div>
                    <Progress value={assignment.total_submissions > 0 ? (assignment.graded_submissions / assignment.total_submissions) * 100 : 0} className="h-2" />
                  </div>

                  <div className="flex space-x-2 pt-2">
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Submissions
                    </Button>
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download All
                    </Button>
                    <Button size="sm" variant="outline">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Button>
                    {assignment.status === 'published' && (
                      <Button size="sm" variant="outline">
                        <Send className="h-4 w-4 mr-2" />
                        Send Reminder
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>

      {/* Create Exam Dialog */}
      <CreateExamDialog
        open={isCreateExamDialogOpen}
        onOpenChange={setIsCreateExamDialogOpen}
        courses={courses}
        onCreateExam={handleCreateExam}
      />
    </div>
  );
};

export default AssignmentManagement;
