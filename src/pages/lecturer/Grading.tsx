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
import { getLecturerAssignments, AssignmentWithStats } from '@/services/assignmentService';
import { getAssignmentSubmissions, gradeSubmission, AssignmentSubmission } from '@/services/gradingService';
import { getSubmissionFiles, getAssignmentFileUrl } from '@/services/assignmentFileService';
import { showErrorToast, showSuccessToast } from '@/utils/ui/toast';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  FileText,
  Download,
  Send,
  Edit,
  Eye,
  Calendar,
  Users,
  Star,
  MessageSquare,
  Save
} from 'lucide-react';

const Grading = () => {
  const { dbUser } = useAuth();
  const [selectedSubmission, setSelectedSubmission] = useState<AssignmentSubmission | null>(null);
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);
  const [assignments, setAssignments] = useState<AssignmentWithStats[]>([]);
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [submissionFiles, setSubmissionFiles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [grading, setGrading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gradeForm, setGradeForm] = useState({
    grade: '',
    feedback: ''
  });

  useEffect(() => {
    const fetchData = async () => {
      if (!dbUser?.auth_id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch assignments and submissions in parallel
        const [assignmentsData, submissionsData] = await Promise.all([
          getLecturerAssignments(dbUser.auth_id),
          getLecturerSubmissions(dbUser.auth_id)
        ]);

        setAssignments(assignmentsData);
        setSubmissions(submissionsData);
      } catch (error) {
        console.error('Error fetching data:', error);
        setError('Failed to load grading data. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [dbUser?.auth_id]);

  // Handle opening grading dialog
  const handleGradeSubmission = async (submission: AssignmentSubmission) => {
    setSelectedSubmission(submission);
    setGradeForm({
      grade: submission.grade?.toString() || '',
      feedback: submission.feedback || ''
    });

    // Load submission files
    try {
      const files = await getSubmissionFiles(submission.id);
      setSubmissionFiles(files);
    } catch (error) {
      console.error('Error loading submission files:', error);
      setSubmissionFiles([]);
    }

    setIsGradingDialogOpen(true);
  };

  // Handle grade submission
  const handleSubmitGrade = async () => {
    if (!selectedSubmission || !dbUser?.auth_id) return;

    const grade = parseFloat(gradeForm.grade);
    if (isNaN(grade) || grade < 0 || grade > 100) {
      showErrorToast('Please enter a valid grade between 0 and 100');
      return;
    }

    try {
      setGrading(true);

      await gradeSubmission(
        selectedSubmission.id,
        grade,
        gradeForm.feedback,
        dbUser.auth_id
      );

      showSuccessToast('Grade submitted successfully!');
      setIsGradingDialogOpen(false);

      // Refresh submissions
      const updatedSubmissions = await getLecturerSubmissions(dbUser.auth_id);
      setSubmissions(updatedSubmissions);
    } catch (error) {
      console.error('Error submitting grade:', error);
      showErrorToast('Failed to submit grade. Please try again.');
    } finally {
      setGrading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading grading data...</p>
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

  // Calculate stats from real submissions
  const pendingSubmissions = submissions.filter(s => !s.grade).length;
  const gradedSubmissions = submissions.filter(s => s.grade).length;
  const totalSubmissions = submissions.length;
  const averageGrade = gradedSubmissions > 0
    ? Math.round(submissions.filter(s => s.grade).reduce((sum, s) => sum + (s.grade || 0), 0) / gradedSubmissions)
    : 0;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-orange-500';
      case 'graded': return 'bg-green-500';
      case 'late': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending': return 'outline';
      case 'graded': return 'default';
      case 'late': return 'destructive';
      default: return 'secondary';
    }
  };

  const getGradeColor = (grade: number) => {
    if (grade >= 90) return 'text-green-600';
    if (grade >= 80) return 'text-blue-600';
    if (grade >= 70) return 'text-yellow-600';
    if (grade >= 60) return 'text-orange-600';
    return 'text-red-600';
  };



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Grading Center</h1>
          <p className="text-gray-600 dark:text-gray-400">Review and grade student submissions</p>
        </div>
        <Button variant="outline">
          <Download className="h-4 w-4 mr-2" />
          Export Grades
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Grading</p>
                <p className="text-2xl font-bold text-orange-600">
                  {pendingSubmissions}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Graded</p>
                <p className="text-2xl font-bold text-green-600">
                  {gradedSubmissions}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Submissions</p>
                <p className="text-2xl font-bold text-blue-600">
                  {totalSubmissions}
                </p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Grade</p>
                <p className="text-2xl font-bold text-purple-600">
                  {averageGrade}%
                </p>
              </div>
              <Star className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Assignments Overview</CardTitle>
          <CardDescription>Track grading progress across all assignments</CardDescription>
        </CardHeader>
        <CardContent>
          {assignments.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No assignments to grade</h3>
              <p className="text-gray-600 dark:text-gray-400">
                Create assignments to start tracking grading progress
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignments.map((assignment) => (
                <div key={assignment.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{assignment.title}</h4>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{assignment.course?.code} - {assignment.course?.title}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={assignment.status === 'closed' ? 'default' : 'outline'}>
                        {assignment.status}
                      </Badge>
                      <span className="text-sm text-gray-500">Due: {new Date(assignment.due_date).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                    <div className="text-center">
                      <p className="font-bold text-blue-600">{assignment.total_submissions}</p>
                      <p className="text-gray-600">Submitted</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-green-600">{assignment.graded_submissions}</p>
                      <p className="text-gray-600">Graded</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-orange-600">{assignment.total_submissions - assignment.graded_submissions}</p>
                      <p className="text-gray-600">Pending</p>
                    </div>
                    <div className="text-center">
                      <p className="font-bold text-purple-600">{Math.round(assignment.average_grade || 0)}%</p>
                      <p className="text-gray-600">Avg Grade</p>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Grading Progress</span>
                      <span>{assignment.total_submissions > 0 ? Math.round((assignment.graded_submissions / assignment.total_submissions) * 100) : 0}%</span>
                    </div>
                    <Progress value={assignment.total_submissions > 0 ? (assignment.graded_submissions / assignment.total_submissions) * 100 : 0} className="h-2" />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Submissions List */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending">Pending Grading</TabsTrigger>
          <TabsTrigger value="graded">Recently Graded</TabsTrigger>
          <TabsTrigger value="all">All Submissions</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {submissions.filter(s => !s.grade).length === 0 ? (
            <div className="text-center py-12">
              <Clock className="h-12 w-12 mx-auto text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No pending submissions</h3>
              <p className="text-gray-600 dark:text-gray-400">
                All submissions have been graded or there are no submissions yet
              </p>
            </div>
          ) : (
            submissions.filter(s => !s.grade).map((submission) => (
              <Card key={submission.id} className="hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`w-3 h-3 rounded-full bg-orange-500`} />
                      <div>
                        <CardTitle className="text-lg">{submission.student?.full_name}</CardTitle>
                        <CardDescription className="font-medium">{submission.student?.admission_number}</CardDescription>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant="outline">
                        Pending
                      </Badge>
                      {submission.is_late && (
                        <Badge variant="destructive">Late</Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-4 w-4" />
                        <span>Submitted: {new Date(submission.submitted_at).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <FileText className="h-4 w-4" />
                        <span>{submission.assignment?.title}</span>
                      </div>
                    </div>
                  </div>

                  {submission.submission_text && (
                    <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded border">
                      <p className="text-sm">{submission.submission_text.substring(0, 200)}...</p>
                    </div>
                  )}

                  {submission.submission_url && (
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">URL Submission</Badge>
                      <a href={submission.submission_url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline text-sm">
                        View Submission
                      </a>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-2">
                    <Button
                      size="sm"
                      onClick={() => handleGradeSubmission(submission)}
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Grade Submission
                    </Button>
                    <Button size="sm" variant="outline">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="graded" className="space-y-4">
          {submissions.filter(s => s.grade).map((submission) => (
            <Card key={submission.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(submission.status)}`} />
                    <div>
                      <CardTitle className="text-lg">{submission.student?.full_name}</CardTitle>
                      <CardDescription className="font-medium">{submission.student?.admission_number}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusBadge(submission.status)}>
                      {submission.status}
                    </Badge>
                    {submission.grade && (
                      <Badge variant="outline" className={getGradeColor(submission.grade)}>
                        {submission.grade}%
                      </Badge>
                    )}
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                  {submission.feedback}
                </p>

                <div className="flex space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    variant="outline"
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setIsGradingDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Grade
                  </Button>
                  <Button size="sm" variant="outline">
                    <MessageSquare className="h-4 w-4 mr-2" />
                    Send Message
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>

      {/* Grading Dialog */}
      <Dialog open={isGradingDialogOpen} onOpenChange={setIsGradingDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Edit className="h-5 w-5" />
              Grade Submission
            </DialogTitle>
            <DialogDescription>
              {selectedSubmission?.assignment?.title} • {selectedSubmission?.student?.full_name}
            </DialogDescription>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-6">
              {/* Submission Info */}
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">Student</Label>
                    <p>{selectedSubmission.student?.full_name}</p>
                    <p className="text-muted-foreground">{selectedSubmission.student?.admission_number}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Submitted</Label>
                    <p>{new Date(selectedSubmission.submitted_at).toLocaleString()}</p>
                    {selectedSubmission.is_late && (
                      <Badge variant="destructive" className="mt-1">Late Submission</Badge>
                    )}
                  </div>
                  <div>
                    <Label className="font-medium">Assignment</Label>
                    <p>{selectedSubmission.assignment?.title}</p>
                    <p className="text-muted-foreground">Max Points: {selectedSubmission.assignment?.total_points}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Current Grade</Label>
                    <p>{selectedSubmission.grade ? `${selectedSubmission.grade}%` : 'Not graded'}</p>
                  </div>
                </div>
              </div>

              {/* Submission Content */}
              <div className="space-y-4">
                {selectedSubmission.submission_text && (
                  <div>
                    <Label className="font-medium">Text Submission</Label>
                    <div className="mt-2 p-4 border rounded-lg bg-white dark:bg-gray-900">
                      <p className="whitespace-pre-wrap">{selectedSubmission.submission_text}</p>
                    </div>
                  </div>
                )}

                {selectedSubmission.submission_url && (
                  <div>
                    <Label className="font-medium">URL Submission</Label>
                    <div className="mt-2">
                      <a
                        href={selectedSubmission.submission_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline"
                      >
                        {selectedSubmission.submission_url}
                      </a>
                    </div>
                  </div>
                )}

                {submissionFiles.length > 0 && (
                  <div>
                    <Label className="font-medium">Submitted Files</Label>
                    <div className="mt-2 space-y-2">
                      {submissionFiles.map((file) => (
                        <div key={file.id} className="flex items-center justify-between p-3 border rounded">
                          <div className="flex items-center gap-2">
                            <FileText className="h-4 w-4" />
                            <span>{file.original_name}</span>
                            <span className="text-sm text-muted-foreground">
                              ({(file.file_size / 1024).toFixed(1)} KB)
                            </span>
                          </div>
                          <Button size="sm" variant="outline">
                            <Download className="h-4 w-4 mr-2" />
                            Download
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Grading Form */}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="grade">Grade (0-100)</Label>
                    <Input
                      id="grade"
                      type="number"
                      min="0"
                      max="100"
                      value={gradeForm.grade}
                      onChange={(e) => setGradeForm(prev => ({ ...prev, grade: e.target.value }))}
                      placeholder="Enter grade"
                    />
                  </div>
                  <div>
                    <Label>Grade Status</Label>
                    <div className="flex items-center gap-2 mt-2">
                      {gradeForm.grade && (
                        <Badge variant={
                          parseFloat(gradeForm.grade) >= 70 ? 'default' :
                          parseFloat(gradeForm.grade) >= 50 ? 'secondary' : 'destructive'
                        }>
                          {parseFloat(gradeForm.grade) >= 70 ? 'Pass' :
                           parseFloat(gradeForm.grade) >= 50 ? 'Marginal' : 'Fail'}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <Label htmlFor="feedback">Feedback</Label>
                  <Textarea
                    id="feedback"
                    value={gradeForm.feedback}
                    onChange={(e) => setGradeForm(prev => ({ ...prev, feedback: e.target.value }))}
                    placeholder="Provide detailed feedback for the student..."
                    rows={6}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsGradingDialogOpen(false)}
              disabled={grading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmitGrade}
              disabled={grading || !gradeForm.grade}
            >
              {grading ? 'Submitting...' : 'Submit Grade'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Grading;
