import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { FileText, Clock, Calendar, Upload, CheckCircle, AlertCircle, XCircle, Brain, Timer, Users, File } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getStudentAssignments, Assignment, submitAssignment } from '@/services/assignmentService';
import {
  startExamAttempt,
  getExamQuestions,
  getStudentExamAttempts,
  getExamGrade,
  isAssignmentAvailable,
  getAssignmentDetails,
  type ExamGrade
} from '@/services/examService';
import { uploadAssignmentFiles, validateAssignmentFile, formatFileSize, getFileIcon } from '@/services/assignmentFileService';
import ExamInterface from '@/components/exam/ExamInterface';
import { showErrorToast, showSuccessToast } from '@/utils/ui/toast';

const Assignments = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('pending');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);

  // Exam state
  const [currentExam, setCurrentExam] = useState<any>(null);
  const [examQuestions, setExamQuestions] = useState<any[]>([]);
  const [examAttempt, setExamAttempt] = useState<any>(null);
  const [showExamDialog, setShowExamDialog] = useState(false);
  const [examLoading, setExamLoading] = useState(false);

  // Assignment details state
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Assignment submission state
  const [showSubmissionDialog, setShowSubmissionDialog] = useState(false);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionForm, setSubmissionForm] = useState({
    text: '',
    url: '',
    files: [] as File[]
  });

  // Exam results state
  const [showResultsDialog, setShowResultsDialog] = useState(false);
  const [selectedExamGrade, setSelectedExamGrade] = useState<ExamGrade | null>(null);
  const [examAttempts, setExamAttempts] = useState<any[]>([]);
  const [showAttemptsDialog, setShowAttemptsDialog] = useState(false);

  // Filter and category state
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'assignments' | 'cats' | 'exams'>('all');

  useEffect(() => {
    if (user?.id) {
      fetchAssignments();
    }
  }, [user?.id]);

  const fetchAssignments = async () => {
    if (!user?.id) return;

    try {
      setLoading(true);
      const data = await getStudentAssignments(user.id);
      setAssignments(data);
    } catch (error) {
      console.error('Error fetching assignments:', error);
      showErrorToast('Failed to load assignments');
      setAssignments([]);
    } finally {
      setLoading(false);
    }
  };

  // Handle starting an exam
  const handleStartExam = async (assignment: Assignment) => {
    if (!user?.id) return;

    try {
      setExamLoading(true);
      setCurrentExam(assignment);

      // Check if this is an exam/quiz/cat
      if (!['exam', 'quiz', 'cat'].includes(assignment.assignment_type || '')) {
        showErrorToast('This is not an exam or quiz');
        return;
      }

      // Check assignment availability
      const availability = await isAssignmentAvailable(assignment.id);
      if (!availability.isAvailable) {
        if (!availability.isPublished) {
          showErrorToast('This exam is not yet published');
        } else if (availability.availableFrom && new Date() < availability.availableFrom) {
          showErrorToast(`This exam will be available from ${availability.availableFrom.toLocaleString()}`);
        } else if (availability.availableUntil && new Date() > availability.availableUntil) {
          showErrorToast('This exam is no longer available');
        }
        return;
      }

      // Check if student has exceeded maximum attempts
      const attempts = await getStudentExamAttempts(assignment.id, user.id);
      if (assignment.max_attempts && attempts.length >= assignment.max_attempts) {
        showErrorToast(`You have used all ${assignment.max_attempts} attempts for this exam`);
        return;
      }

      // Check if there's an active attempt
      const activeAttempt = attempts.find(attempt => attempt.status === 'in_progress');
      if (activeAttempt) {
        // Resume existing attempt
        const questions = await getExamQuestions(assignment.id);
        setExamQuestions(questions);
        setExamAttempt(activeAttempt);
        setShowExamDialog(true);
        return;
      }

      // Get exam questions
      const questions = await getExamQuestions(assignment.id);
      if (questions.length === 0) {
        showErrorToast('No questions found for this exam');
        return;
      }

      // Start new exam attempt
      const attempt = await startExamAttempt(assignment.id, user.id);

      setExamQuestions(questions);
      setExamAttempt(attempt);
      setShowExamDialog(true);
    } catch (error: any) {
      console.error('Error starting exam:', error);
      showErrorToast(error.message || 'Failed to start exam');
    } finally {
      setExamLoading(false);
    }
  };

  // Handle exam completion
  const handleExamComplete = async (completedAttempt: any) => {
    setShowExamDialog(false);
    setCurrentExam(null);
    setExamQuestions([]);
    setExamAttempt(null);

    showSuccessToast('Exam submitted successfully!');

    // Get the grade for this attempt
    try {
      const grade = await getExamGrade(completedAttempt.id);
      if (grade) {
        setSelectedExamGrade(grade);
        setShowResultsDialog(true);
      }
    } catch (error) {
      console.error('Error fetching exam grade:', error);
    }

    // Refresh assignments to update status
    fetchAssignments();
  };

  // Handle viewing exam results
  const handleViewResults = async (assignment: Assignment) => {
    if (!user?.id) return;

    try {
      const attempts = await getStudentExamAttempts(assignment.id, user.id);
      const completedAttempts = attempts.filter(attempt => attempt.status === 'submitted' || attempt.status === 'graded');

      if (completedAttempts.length === 0) {
        showErrorToast('No completed attempts found');
        return;
      }

      // Get the best attempt or latest attempt
      const bestAttempt = completedAttempts.reduce((best, current) => {
        if (!best.grade || !current.grade) return best;
        return current.grade.percentage > best.grade.percentage ? current : best;
      });

      if (bestAttempt.grade) {
        setSelectedExamGrade(bestAttempt.grade);
        setShowResultsDialog(true);
      }
    } catch (error) {
      console.error('Error fetching exam results:', error);
      showErrorToast('Failed to load exam results');
    }
  };

  // Handle viewing all attempts
  const handleViewAttempts = async (assignment: Assignment) => {
    if (!user?.id) return;

    try {
      const attempts = await getStudentExamAttempts(assignment.id, user.id);
      setExamAttempts(attempts);
      setShowAttemptsDialog(true);
    } catch (error) {
      console.error('Error fetching exam attempts:', error);
      showErrorToast('Failed to load exam attempts');
    }
  };

  // Handle viewing assignment details
  const handleViewDetails = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setShowDetailsDialog(true);
  };

  // Handle assignment submission
  const handleSubmitAssignment = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setSubmissionForm({ text: '', url: '', files: [] });
    setShowSubmissionDialog(true);
  };

  // Handle submission form submission
  const handleSubmissionSubmit = async () => {
    if (!selectedAssignment || !user?.id) return;

    try {
      setSubmissionLoading(true);

      // Validate submission based on format
      const format = selectedAssignment.submission_format || 'text';
      let submissionData: any = {};

      switch (format) {
        case 'text':
          if (!submissionForm.text.trim()) {
            showErrorToast('Please enter your submission text');
            return;
          }
          submissionData.submission_text = submissionForm.text;
          break;
        case 'url':
          if (!submissionForm.url.trim()) {
            showErrorToast('Please enter a valid URL');
            return;
          }
          submissionData.submission_url = submissionForm.url;
          break;
        case 'file':
          if (submissionForm.files.length === 0) {
            showErrorToast('Please select at least one file');
            return;
          }

          // Validate all files
          for (const file of submissionForm.files) {
            const validation = validateAssignmentFile(file);
            if (!validation.valid) {
              showErrorToast(`File "${file.name}": ${validation.error}`);
              return;
            }
          }

          // Files will be uploaded after submission is created
          submissionData.has_files = true;
          submissionData.file_count = submissionForm.files.length;
          break;
        default:
          submissionData.submission_text = submissionForm.text;
      }

      // Submit the assignment first
      const submission = await submitAssignment(selectedAssignment.id, user.id, submissionData);

      // If there are files, upload them
      if (format === 'file' && submissionForm.files.length > 0) {
        try {
          await uploadAssignmentFiles(submissionForm.files, submission.id, user.id);
        } catch (fileError) {
          console.error('Error uploading files:', fileError);
          showErrorToast('Assignment submitted but file upload failed. Please contact support.');
          return;
        }
      }

      showSuccessToast('Assignment submitted successfully!');
      setShowSubmissionDialog(false);
      setSelectedAssignment(null);

      // Refresh assignments to update status
      fetchAssignments();
    } catch (error: any) {
      console.error('Error submitting assignment:', error);
      showErrorToast(error.message || 'Failed to submit assignment');
    } finally {
      setSubmissionLoading(false);
    }
  };

  // Check if assignment is an exam type
  const isExamType = (assignment: Assignment) => {
    return ['exam', 'quiz', 'cat'].includes(assignment.assignment_type || '') &&
           assignment.submission_format === 'online_exam';
  };

  // Check if assignment is a CAT
  const isCATType = (assignment: Assignment) => {
    return assignment.assignment_type === 'cat';
  };

  // Check if assignment is a regular assignment
  const isRegularAssignment = (assignment: Assignment) => {
    return !['exam', 'quiz', 'cat'].includes(assignment.assignment_type || '') ||
           assignment.submission_format !== 'online_exam';
  };

  // Get assignment type display info
  const getAssignmentTypeInfo = (assignment: Assignment) => {
    const type = assignment.assignment_type || 'assignment';
    const colors = {
      'exam': 'bg-red-100 text-red-800 border-red-200',
      'quiz': 'bg-blue-100 text-blue-800 border-blue-200',
      'cat': 'bg-purple-100 text-purple-800 border-purple-200',
      'project': 'bg-green-100 text-green-800 border-green-200',
      'homework': 'bg-gray-100 text-gray-800 border-gray-200'
    };

    return {
      label: type.toUpperCase(),
      className: colors[type as keyof typeof colors] || colors.homework
    };
  };

  // Format duration for display
  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes} minutes`;
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return mins > 0 ? `${hours}h ${mins}m` : `${hours}h`;
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4" />;
      case 'submitted':
        return <CheckCircle className="h-4 w-4" />;
      case 'graded':
        return <CheckCircle className="h-4 w-4" />;
      case 'overdue':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertCircle className="h-4 w-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-500';
      case 'submitted':
        return 'bg-blue-500';
      case 'graded':
        return 'bg-green-500';
      case 'overdue':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'destructive';
      case 'medium':
        return 'default';
      case 'low':
        return 'secondary';
      default:
        return 'secondary';
    }
  };

  const filteredAssignments = assignments.filter(assignment => {
    // First filter by status (activeTab)
    let statusMatch = false;
    switch (activeTab) {
      case 'pending':
        statusMatch = assignment.status === 'pending' || assignment.status === 'overdue';
        break;
      case 'submitted':
        statusMatch = assignment.status === 'submitted';
        break;
      case 'graded':
        statusMatch = assignment.status === 'graded';
        break;
      default:
        statusMatch = true;
    }

    // Then filter by category
    let categoryMatch = false;
    switch (categoryFilter) {
      case 'assignments':
        categoryMatch = isRegularAssignment(assignment);
        break;
      case 'cats':
        categoryMatch = isCATType(assignment);
        break;
      case 'exams':
        categoryMatch = isExamType(assignment) && !isCATType(assignment);
        break;
      case 'all':
      default:
        categoryMatch = true;
    }

    return statusMatch && categoryMatch;
  });

  const stats = {
    pending: assignments.filter(a => a.status === 'pending').length,
    overdue: assignments.filter(a => a.status === 'overdue').length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    graded: assignments.filter(a => a.status === 'graded').length,
    // Category stats
    totalAssignments: assignments.filter(a => isRegularAssignment(a)).length,
    totalCATs: assignments.filter(a => isCATType(a)).length,
    totalExams: assignments.filter(a => isExamType(a) && !isCATType(a)).length
  };

  // Loading state
  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <Skeleton className="h-8 w-48 mb-2" />
            <Skeleton className="h-4 w-96" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <Skeleton className="h-16 w-full" />
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <Skeleton className="h-6 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </CardHeader>
              <CardContent>
                <Skeleton className="h-4 w-full mb-2" />
                <Skeleton className="h-4 w-2/3" />
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            {categoryFilter === 'assignments' ? 'Assignments' :
             categoryFilter === 'cats' ? 'CATs (Continuous Assessment Tests)' :
             categoryFilter === 'exams' ? 'Exams & Quizzes' :
             'All Assessments'}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            {categoryFilter === 'assignments' ? 'Track and submit your course assignments' :
             categoryFilter === 'cats' ? 'Take your continuous assessment tests' :
             categoryFilter === 'exams' ? 'Take your exams and quizzes' :
             'Track and manage all your course assessments'}
          </p>
        </div>

        {/* Category Filter Buttons */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={categoryFilter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('all')}
            className="flex items-center gap-1"
          >
            <FileText className="h-4 w-4" />
            All ({assignments.length})
          </Button>
          <Button
            variant={categoryFilter === 'assignments' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('assignments')}
            className="flex items-center gap-1"
          >
            <Upload className="h-4 w-4" />
            Assignments ({stats.totalAssignments})
          </Button>
          <Button
            variant={categoryFilter === 'cats' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('cats')}
            className="flex items-center gap-1"
          >
            <Brain className="h-4 w-4" />
            CATs ({stats.totalCATs})
          </Button>
          <Button
            variant={categoryFilter === 'exams' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setCategoryFilter('exams')}
            className="flex items-center gap-1"
          >
            <Timer className="h-4 w-4" />
            Exams ({stats.totalExams})
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">
                  {filteredAssignments.filter(a => a.status === 'pending').length}
                </p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-2xl font-bold text-red-600">
                  {filteredAssignments.filter(a => a.status === 'overdue').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Submitted</p>
                <p className="text-2xl font-bold text-blue-600">
                  {filteredAssignments.filter(a => a.status === 'submitted').length}
                </p>
              </div>
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Graded</p>
                <p className="text-2xl font-bold text-green-600">
                  {filteredAssignments.filter(a => a.status === 'graded').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Summary */}
      {categoryFilter === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950/20 dark:to-blue-900/20 border-blue-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-blue-700 dark:text-blue-300">Regular Assignments</p>
                  <p className="text-xl font-bold text-blue-800 dark:text-blue-200">{stats.totalAssignments}</p>
                  <p className="text-xs text-blue-600 dark:text-blue-400">File uploads, essays, projects</p>
                </div>
                <Upload className="h-6 w-6 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-purple-50 to-purple-100 dark:from-purple-950/20 dark:to-purple-900/20 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-purple-700 dark:text-purple-300">CATs</p>
                  <p className="text-xl font-bold text-purple-800 dark:text-purple-200">{stats.totalCATs}</p>
                  <p className="text-xs text-purple-600 dark:text-purple-400">Continuous Assessment Tests</p>
                </div>
                <Brain className="h-6 w-6 text-purple-600" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-r from-red-50 to-red-100 dark:from-red-950/20 dark:to-red-900/20 border-red-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-700 dark:text-red-300">Exams & Quizzes</p>
                  <p className="text-xl font-bold text-red-800 dark:text-red-200">{stats.totalExams}</p>
                  <p className="text-xs text-red-600 dark:text-red-400">Formal assessments</p>
                </div>
                <Timer className="h-6 w-6 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Assignments Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending & Overdue</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="graded">Graded</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredAssignments.length > 0 ? (
            filteredAssignments.map((assignment) => (
            <Card key={assignment.id} className={`hover:shadow-lg transition-all duration-200 ${
              isCATType(assignment) ? 'border-l-4 border-l-purple-500 bg-gradient-to-r from-purple-50/30 to-transparent dark:from-purple-950/10' :
              isExamType(assignment) && !isCATType(assignment) ? 'border-l-4 border-l-red-500 bg-gradient-to-r from-red-50/30 to-transparent dark:from-red-950/10' :
              'border-l-4 border-l-blue-500 bg-gradient-to-r from-blue-50/30 to-transparent dark:from-blue-950/10'
            }`}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(assignment.status)}`} />
                    <div className="flex items-center gap-2">
                      {/* Type Icon */}
                      {isCATType(assignment) && <Brain className="h-5 w-5 text-purple-600" />}
                      {isExamType(assignment) && !isCATType(assignment) && <Timer className="h-5 w-5 text-red-600" />}
                      {isRegularAssignment(assignment) && <FileText className="h-5 w-5 text-blue-600" />}
                      <div>
                        <CardTitle className="text-lg">{assignment.title}</CardTitle>
                        <CardDescription className="font-medium">{assignment.course}</CardDescription>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    {/* Assignment Type Badge */}
                    <Badge className={getAssignmentTypeInfo(assignment).className}>
                      {getAssignmentTypeInfo(assignment).label}
                    </Badge>
                    <Badge variant={getPriorityColor(assignment.priority)}>
                      {assignment.priority}
                    </Badge>
                    <Badge variant="outline">
                      {assignment.points} pts
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
                      <span>Due: {assignment.dueDate} at {assignment.dueTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      {getStatusIcon(assignment.status)}
                      <span className={assignment.status === 'overdue' ? 'text-red-600' : ''}>
                        {assignment.timeLeft}
                      </span>
                    </div>
                    {/* Show duration for exams/CATs */}
                    {isExamType(assignment) && assignment.duration_minutes && (
                      <div className="flex items-center space-x-1">
                        <Timer className="h-4 w-4" />
                        <span>{formatDuration(assignment.duration_minutes)}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Exam-specific information */}
                {isExamType(assignment) && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                    <div className="flex items-center gap-4 text-sm">
                      {assignment.duration_minutes && (
                        <div className="flex items-center gap-1">
                          <Timer className="h-3 w-3" />
                          <span>Duration: {formatDuration(assignment.duration_minutes)}</span>
                        </div>
                      )}
                      {assignment.max_attempts && (
                        <div className="flex items-center gap-1">
                          <Users className="h-3 w-3" />
                          <span>Attempts: {assignment.max_attempts}</span>
                        </div>
                      )}
                      {assignment.passing_score && (
                        <div className="flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" />
                          <span>Pass: {assignment.passing_score}%</span>
                        </div>
                      )}
                    </div>
                    {assignment.instructions && (
                      <p className="text-xs text-muted-foreground mt-2">
                        {assignment.instructions.substring(0, 150)}
                        {assignment.instructions.length > 150 ? '...' : ''}
                      </p>
                    )}
                  </div>
                )}

                {/* Grade display for completed exams */}
                {assignment.status === 'graded' && assignment.grade && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Grade:</span>
                          <Badge variant="default" className="bg-green-600">
                            {assignment.grade.letter_grade}
                          </Badge>
                          <span className="text-sm">{assignment.grade.percentage.toFixed(1)}%</span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1">
                          {assignment.grade.points_earned}/{assignment.grade.total_points} points
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleViewResults(assignment)}
                        >
                          View Results
                        </Button>
                        {assignment.max_attempts && assignment.max_attempts > 1 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewAttempts(assignment)}
                          >
                            View Attempts
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {assignment.status === 'pending' && !isExamType(assignment) && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{assignment.progress}%</span>
                    </div>
                    <Progress value={assignment.progress} className="h-2" />
                  </div>
                )}

                {/* Action buttons */}
                <div className="flex items-center justify-between pt-4 border-t">
                  <div className="flex items-center gap-2">
                    {/* Status indicator */}
                    <div className="flex items-center gap-1 text-sm">
                      {getStatusIcon(assignment.status)}
                      <span className={assignment.status === 'overdue' ? 'text-red-600 font-medium' : ''}>
                        {assignment.status === 'pending' ? 'Not Started' :
                         assignment.status === 'submitted' ? 'Submitted' :
                         assignment.status === 'graded' ? 'Graded' :
                         assignment.status === 'overdue' ? 'Overdue' : assignment.status}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {/* View Details Button */}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleViewDetails(assignment)}
                    >
                      <FileText className="h-4 w-4 mr-1" />
                      Details
                    </Button>

                    {/* Exam/CAT specific buttons */}
                    {isExamType(assignment) ? (
                      <>
                        {assignment.status === 'pending' && (
                          <Button
                            size="sm"
                            onClick={() => handleStartExam(assignment)}
                            disabled={examLoading}
                            className="bg-blue-600 hover:bg-blue-700"
                          >
                            <Brain className="h-4 w-4 mr-1" />
                            {examLoading ? 'Loading...' : 'Start Exam'}
                          </Button>
                        )}
                        {assignment.status === 'graded' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewResults(assignment)}
                          >
                            <CheckCircle className="h-4 w-4 mr-1" />
                            View Results
                          </Button>
                        )}
                        {assignment.max_attempts && assignment.max_attempts > 1 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleViewAttempts(assignment)}
                          >
                            <Users className="h-4 w-4 mr-1" />
                            Attempts
                          </Button>
                        )}
                      </>
                    ) : (
                      /* Regular assignment buttons */
                      assignment.status === 'pending' && (
                        <Button
                          size="sm"
                          onClick={() => handleSubmitAssignment(assignment)}
                          className="bg-green-600 hover:bg-green-700"
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Submit
                        </Button>
                      )
                    )}
                  </div>
                </div>

                {assignment.grade && (
                  <div className="bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-medium text-green-800 dark:text-green-200">Grade: {assignment.grade}/{assignment.points}</span>
                      <Badge variant="outline" className="text-green-600">
                        {Math.round((assignment.grade / assignment.points) * 100)}%
                      </Badge>
                    </div>
                    {assignment.feedback && (
                      <p className="text-sm text-green-700 dark:text-green-300">{assignment.feedback}</p>
                    )}
                  </div>
                )}

                <div className="flex space-x-2 pt-2">
                  {assignment.status === 'pending' && (
                    <>
                      {isExamType(assignment) ? (
                        <Button
                          size="sm"
                          className="flex-1 bg-blue-600 hover:bg-blue-700"
                          onClick={() => handleStartExam(assignment)}
                          disabled={examLoading}
                        >
                          <Brain className="h-4 w-4 mr-2" />
                          {examLoading ? 'Loading...' : `Start ${assignment.assignment_type?.toUpperCase()}`}
                        </Button>
                      ) : (
                        <Button
                          size="sm"
                          className="flex-1"
                          onClick={() => handleSubmitAssignment(assignment)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Submit Assignment
                        </Button>
                      )}
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleViewDetails(assignment)}
                      >
                        <FileText className="h-4 w-4 mr-2" />
                        View Details
                      </Button>
                    </>
                  )}
                  {assignment.status === 'submitted' && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      View Submission
                    </Button>
                  )}
                  {assignment.status === 'graded' && (
                    <Button size="sm" variant="outline" className="flex-1">
                      <FileText className="h-4 w-4 mr-2" />
                      View Feedback
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
            ))
          ) : (
            <Card>
              <CardContent className="p-12 text-center">
                <div className="text-muted-foreground">
                  {categoryFilter === 'assignments' && (
                    <>
                      <Upload className="h-16 w-16 mx-auto mb-4 opacity-50 text-blue-400" />
                      <h3 className="text-lg font-semibold mb-2">No Regular Assignments</h3>
                      <p>You don't have any regular assignments {activeTab === 'pending' ? 'pending' : `in "${activeTab}" status`} yet.</p>
                      <p className="text-sm mt-2">Regular assignments include file uploads, essays, and projects.</p>
                    </>
                  )}
                  {categoryFilter === 'cats' && (
                    <>
                      <Brain className="h-16 w-16 mx-auto mb-4 opacity-50 text-purple-400" />
                      <h3 className="text-lg font-semibold mb-2">No CATs Available</h3>
                      <p>You don't have any Continuous Assessment Tests {activeTab === 'pending' ? 'pending' : `in "${activeTab}" status`} yet.</p>
                      <p className="text-sm mt-2">CATs are online tests that contribute to your continuous assessment.</p>
                    </>
                  )}
                  {categoryFilter === 'exams' && (
                    <>
                      <Timer className="h-16 w-16 mx-auto mb-4 opacity-50 text-red-400" />
                      <h3 className="text-lg font-semibold mb-2">No Exams or Quizzes</h3>
                      <p>You don't have any exams or quizzes {activeTab === 'pending' ? 'pending' : `in "${activeTab}" status`} yet.</p>
                      <p className="text-sm mt-2">Exams and quizzes are formal timed assessments.</p>
                    </>
                  )}
                  {categoryFilter === 'all' && (
                    <>
                      <FileText className="h-16 w-16 mx-auto mb-4 opacity-50" />
                      <h3 className="text-lg font-semibold mb-2">No Assessments Found</h3>
                      <p>You don't have any assessments {activeTab === 'pending' ? 'pending' : `in "${activeTab}" status`} yet.</p>
                      <p className="text-sm mt-2">This includes assignments, CATs, exams, and quizzes.</p>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Exam Interface Dialog */}
      <Dialog open={showExamDialog} onOpenChange={() => {}}>
        <DialogContent className="max-w-6xl max-h-[95vh] overflow-hidden p-0">
          <DialogHeader className="p-6 pb-0">
            <DialogTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5" />
              {currentExam?.title}
            </DialogTitle>
            <DialogDescription>
              {currentExam?.assignment_type?.toUpperCase()} • {currentExam?.course}
              {currentExam?.duration_minutes && (
                <span className="ml-2 flex items-center gap-1">
                  <Timer className="h-3 w-3" />
                  {currentExam.duration_minutes} minutes
                </span>
              )}
            </DialogDescription>
          </DialogHeader>
          <div className="p-6 overflow-y-auto">
            {examAttempt && examQuestions.length > 0 && (
              <ExamInterface
                attempt={examAttempt}
                questions={examQuestions}
                onExamComplete={handleExamComplete}
                onAutoSave={(questionId, answer) => {
                  // Handle auto-save if needed
                  console.log('Auto-saved:', questionId, answer);
                }}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Assignment Details Dialog */}
      <Dialog open={showDetailsDialog} onOpenChange={setShowDetailsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              {selectedAssignment?.title}
            </DialogTitle>
            <DialogDescription>
              {selectedAssignment?.course} • {getAssignmentTypeInfo(selectedAssignment || {} as Assignment).label}
            </DialogDescription>
          </DialogHeader>

          {selectedAssignment && (
            <div className="space-y-6">
              {/* Basic Information */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium">Due Date</Label>
                  <p className="text-sm">{selectedAssignment.dueDate} at {selectedAssignment.dueTime}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Points</Label>
                  <p className="text-sm">{selectedAssignment.points} points</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <Badge variant="outline" className="w-fit">
                    {selectedAssignment.status}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">Priority</Label>
                  <Badge variant={getPriorityColor(selectedAssignment.priority)} className="w-fit">
                    {selectedAssignment.priority}
                  </Badge>
                </div>
              </div>

              {/* Exam/CAT Specific Details */}
              {isExamType(selectedAssignment) && (
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg">
                  <h4 className="font-medium mb-3">Assessment Details</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {selectedAssignment.duration_minutes && (
                      <div>
                        <Label className="text-xs font-medium">Duration</Label>
                        <p>{formatDuration(selectedAssignment.duration_minutes)}</p>
                      </div>
                    )}
                    {selectedAssignment.max_attempts && (
                      <div>
                        <Label className="text-xs font-medium">Max Attempts</Label>
                        <p>{selectedAssignment.max_attempts}</p>
                      </div>
                    )}
                    {selectedAssignment.passing_score && (
                      <div>
                        <Label className="text-xs font-medium">Passing Score</Label>
                        <p>{selectedAssignment.passing_score}%</p>
                      </div>
                    )}
                    <div>
                      <Label className="text-xs font-medium">Question Format</Label>
                      <p>Mixed (MCQ, Essay, Short Answer)</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Description */}
              {selectedAssignment.description && (
                <div>
                  <Label className="text-sm font-medium">Description</Label>
                  <p className="text-sm mt-1 text-muted-foreground">
                    {selectedAssignment.description}
                  </p>
                </div>
              )}

              {/* Instructions */}
              {selectedAssignment.instructions && (
                <div>
                  <Label className="text-sm font-medium">Instructions</Label>
                  <div className="text-sm mt-1 p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                    <p className="whitespace-pre-wrap">{selectedAssignment.instructions}</p>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex gap-2 pt-4 border-t">
                {selectedAssignment.status === 'pending' && (
                  <>
                    {isExamType(selectedAssignment) ? (
                      <Button
                        className="flex-1 bg-blue-600 hover:bg-blue-700"
                        onClick={() => {
                          setShowDetailsDialog(false);
                          handleStartExam(selectedAssignment);
                        }}
                        disabled={examLoading}
                      >
                        <Brain className="h-4 w-4 mr-2" />
                        {examLoading ? 'Loading...' : `Start ${selectedAssignment.assignment_type?.toUpperCase()}`}
                      </Button>
                    ) : (
                      <Button
                        className="flex-1"
                        onClick={() => {
                          setShowDetailsDialog(false);
                          handleSubmitAssignment(selectedAssignment);
                        }}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Assignment
                      </Button>
                    )}
                  </>
                )}
                <Button variant="outline" onClick={() => setShowDetailsDialog(false)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Assignment Submission Dialog */}
      <Dialog open={showSubmissionDialog} onOpenChange={setShowSubmissionDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Submit Assignment
            </DialogTitle>
            <DialogDescription>
              {selectedAssignment?.title} • {selectedAssignment?.course}
            </DialogDescription>
          </DialogHeader>

          {selectedAssignment && (
            <div className="space-y-6">
              {/* Assignment Info */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">Due Date</Label>
                    <p>{selectedAssignment.dueDate} at {selectedAssignment.dueTime}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Points</Label>
                    <p>{selectedAssignment.points} points</p>
                  </div>
                  <div>
                    <Label className="font-medium">Format</Label>
                    <p className="capitalize">{selectedAssignment.submission_format || 'text'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Status</Label>
                    <Badge variant="outline">{selectedAssignment.status}</Badge>
                  </div>
                </div>
              </div>

              {/* Submission Form */}
              <div className="space-y-4">
                {selectedAssignment.submission_format === 'text' && (
                  <div>
                    <Label htmlFor="submission-text">Your Submission</Label>
                    <Textarea
                      id="submission-text"
                      placeholder="Enter your assignment submission here..."
                      value={submissionForm.text}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, text: e.target.value }))}
                      rows={8}
                      className="mt-1"
                    />
                  </div>
                )}

                {selectedAssignment.submission_format === 'url' && (
                  <div>
                    <Label htmlFor="submission-url">Submission URL</Label>
                    <Input
                      id="submission-url"
                      type="url"
                      placeholder="https://example.com/your-submission"
                      value={submissionForm.url}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, url: e.target.value }))}
                      className="mt-1"
                    />
                  </div>
                )}

                {selectedAssignment.submission_format === 'file' && (
                  <div>
                    <Label htmlFor="submission-files">Upload Files</Label>
                    <div className="mt-1 space-y-2">
                      <Input
                        id="submission-files"
                        type="file"
                        multiple
                        onChange={(e) => {
                          const files = Array.from(e.target.files || []);
                          setSubmissionForm(prev => ({ ...prev, files }));
                        }}
                        accept=".pdf,.doc,.docx,.ppt,.pptx,.txt,.csv,.zip,.jpg,.jpeg,.png,.mp4,.mp3"
                      />
                      <div className="text-xs text-muted-foreground">
                        Allowed: PDF, Word, PowerPoint, Text, Images, Videos, Audio, ZIP (Max 100MB each)
                      </div>
                    </div>
                    {submissionForm.files.length > 0 && (
                      <div className="mt-3 space-y-2">
                        <Label className="text-sm font-medium">Selected Files:</Label>
                        {submissionForm.files.map((file, index) => {
                          const validation = validateAssignmentFile(file);
                          return (
                            <div key={index} className={`flex items-center gap-2 p-2 rounded border ${
                              validation.valid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                            }`}>
                              <span className="text-lg">{getFileIcon(file.type)}</span>
                              <div className="flex-1 min-w-0">
                                <div className="text-sm font-medium truncate">{file.name}</div>
                                <div className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)} • {file.type}
                                </div>
                                {!validation.valid && (
                                  <div className="text-xs text-red-600 mt-1">
                                    ⚠️ {validation.error}
                                  </div>
                                )}
                              </div>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => {
                                  const newFiles = submissionForm.files.filter((_, i) => i !== index);
                                  setSubmissionForm(prev => ({ ...prev, files: newFiles }));
                                }}
                              >
                                ✕
                              </Button>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                )}

                {/* Default text area for other formats */}
                {!['text', 'url', 'file'].includes(selectedAssignment.submission_format || '') && (
                  <div>
                    <Label htmlFor="submission-default">Your Submission</Label>
                    <Textarea
                      id="submission-default"
                      placeholder="Enter your assignment submission here..."
                      value={submissionForm.text}
                      onChange={(e) => setSubmissionForm(prev => ({ ...prev, text: e.target.value }))}
                      rows={6}
                      className="mt-1"
                    />
                  </div>
                )}
              </div>

              {/* Instructions */}
              {selectedAssignment.instructions && (
                <div>
                  <Label className="font-medium">Instructions</Label>
                  <div className="text-sm mt-1 p-3 bg-blue-50 dark:bg-blue-900/20 rounded border">
                    <p className="whitespace-pre-wrap">{selectedAssignment.instructions}</p>
                  </div>
                </div>
              )}
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowSubmissionDialog(false)}
              disabled={submissionLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmissionSubmit}
              disabled={submissionLoading}
            >
              {submissionLoading ? 'Submitting...' : 'Submit Assignment'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Exam Results Dialog */}
      {showResultsDialog && selectedExamGrade && (
        <Dialog open={showResultsDialog} onOpenChange={setShowResultsDialog}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Exam Results</DialogTitle>
              <DialogDescription>
                Your performance summary for this assessment
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-6">
              {/* Grade Summary */}
              <div className="text-center p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/20 dark:to-indigo-950/20 rounded-lg">
                <div className="text-4xl font-bold text-blue-600 mb-2">
                  {selectedExamGrade.letter_grade}
                </div>
                <div className="text-2xl font-semibold mb-1">
                  {selectedExamGrade.percentage.toFixed(1)}%
                </div>
                <div className="text-sm text-muted-foreground">
                  {selectedExamGrade.points_earned}/{selectedExamGrade.total_points} points
                </div>
                <Badge
                  variant={selectedExamGrade.is_passing ? "default" : "destructive"}
                  className="mt-2"
                >
                  {selectedExamGrade.is_passing ? "PASSED" : "FAILED"}
                </Badge>
              </div>

              {/* Detailed Breakdown */}
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Auto-Graded</div>
                  <div className="text-lg font-semibold">
                    {selectedExamGrade.auto_graded_points} pts
                  </div>
                </div>
                <div className="p-4 border rounded-lg">
                  <div className="text-sm text-muted-foreground">Manual Review</div>
                  <div className="text-lg font-semibold">
                    {selectedExamGrade.manual_graded_points} pts
                  </div>
                </div>
              </div>

              {/* Grading Status */}
              <div className="p-4 border rounded-lg">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">Grading Status:</span>
                  <Badge variant="outline">
                    {selectedExamGrade.grading_status.replace('_', ' ').toUpperCase()}
                  </Badge>
                </div>
                {selectedExamGrade.graded_at && (
                  <div className="text-xs text-muted-foreground mt-1">
                    Graded on {new Date(selectedExamGrade.graded_at).toLocaleString()}
                  </div>
                )}
              </div>

              {/* Feedback */}
              {selectedExamGrade.feedback && (
                <div className="p-4 border rounded-lg">
                  <div className="text-sm font-medium mb-2">Instructor Feedback:</div>
                  <p className="text-sm text-muted-foreground">
                    {selectedExamGrade.feedback}
                  </p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => setShowResultsDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}

      {/* Exam Attempts Dialog */}
      {showAttemptsDialog && (
        <Dialog open={showAttemptsDialog} onOpenChange={setShowAttemptsDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Exam Attempts</DialogTitle>
              <DialogDescription>
                All your attempts for this assessment
              </DialogDescription>
            </DialogHeader>

            <div className="space-y-4">
              {examAttempts.map((attempt, index) => (
                <Card key={attempt.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">
                          Attempt #{attempt.attempt_number}
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Started: {new Date(attempt.started_at).toLocaleString()}
                        </div>
                        {attempt.submitted_at && (
                          <div className="text-sm text-muted-foreground">
                            Submitted: {new Date(attempt.submitted_at).toLocaleString()}
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <Badge variant={
                          attempt.status === 'completed' ? 'default' :
                          attempt.status === 'in_progress' ? 'secondary' :
                          'outline'
                        }>
                          {attempt.status.replace('_', ' ').toUpperCase()}
                        </Badge>
                        {attempt.grade && (
                          <div className="mt-2">
                            <div className="text-lg font-semibold">
                              {attempt.grade.letter_grade} ({attempt.grade.percentage.toFixed(1)}%)
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {attempt.grade.points_earned}/{attempt.grade.total_points} points
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {examAttempts.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No attempts found</p>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button onClick={() => setShowAttemptsDialog(false)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};

export default Assignments;
