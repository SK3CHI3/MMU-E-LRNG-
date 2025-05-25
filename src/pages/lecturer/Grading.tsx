import React, { useState } from 'react';
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
  const [selectedSubmission, setSelectedSubmission] = useState<any>(null);
  const [isGradingDialogOpen, setIsGradingDialogOpen] = useState(false);

  const assignments = [
    {
      id: 1,
      title: 'Binary Search Tree Implementation',
      course: 'CS 301',
      dueDate: '2024-01-20',
      totalStudents: 45,
      submissions: 42,
      graded: 15,
      pending: 27,
      averageGrade: 87.5,
      status: 'active'
    },
    {
      id: 2,
      title: 'Database Design Project',
      course: 'CS 205',
      dueDate: '2024-01-25',
      totalStudents: 38,
      submissions: 35,
      graded: 28,
      pending: 7,
      averageGrade: 82.3,
      status: 'active'
    },
    {
      id: 3,
      title: 'Software Requirements Analysis',
      course: 'CS 401',
      dueDate: '2024-01-18',
      totalStudents: 42,
      submissions: 42,
      graded: 42,
      pending: 0,
      averageGrade: 89.1,
      status: 'completed'
    }
  ];

  const submissions = [
    {
      id: 1,
      assignmentId: 1,
      studentName: 'John Doe',
      studentId: 'CS2021001',
      submissionDate: '2024-01-19',
      submissionTime: '10:30 PM',
      status: 'pending',
      grade: null,
      feedback: '',
      files: ['bst_implementation.py', 'test_cases.py', 'documentation.pdf'],
      lateSubmission: false
    },
    {
      id: 2,
      assignmentId: 1,
      studentName: 'Jane Smith',
      studentId: 'CS2021002',
      submissionDate: '2024-01-20',
      submissionTime: '11:45 PM',
      status: 'graded',
      grade: 92,
      feedback: 'Excellent implementation with comprehensive test cases. Well documented code.',
      files: ['binary_tree.py', 'tests.py', 'readme.md'],
      lateSubmission: false
    },
    {
      id: 3,
      assignmentId: 1,
      studentName: 'Mike Johnson',
      studentId: 'CS2021003',
      submissionDate: '2024-01-21',
      submissionTime: '02:15 AM',
      status: 'pending',
      grade: null,
      feedback: '',
      files: ['bst.py', 'main.py'],
      lateSubmission: true
    },
    {
      id: 4,
      assignmentId: 2,
      studentName: 'Sarah Wilson',
      studentId: 'CS2021004',
      submissionDate: '2024-01-24',
      submissionTime: '08:30 PM',
      status: 'graded',
      grade: 88,
      feedback: 'Good database design with proper normalization. Minor issues with indexing strategy.',
      files: ['database_schema.sql', 'er_diagram.pdf', 'report.docx'],
      lateSubmission: false
    }
  ];

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

  const GradingDialog = () => (
    <Dialog open={isGradingDialogOpen} onOpenChange={setIsGradingDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Grade Submission</DialogTitle>
          <DialogDescription>
            {selectedSubmission && `${selectedSubmission.studentName} - ${selectedSubmission.studentId}`}
          </DialogDescription>
        </DialogHeader>
        {selectedSubmission && (
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Student</Label>
                <p className="text-sm font-medium">{selectedSubmission.studentName}</p>
                <p className="text-xs text-gray-500">{selectedSubmission.studentId}</p>
              </div>
              <div className="space-y-2">
                <Label>Submission Date</Label>
                <p className="text-sm">{selectedSubmission.submissionDate} at {selectedSubmission.submissionTime}</p>
                {selectedSubmission.lateSubmission && (
                  <Badge variant="destructive" className="text-xs">Late Submission</Badge>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Submitted Files</Label>
              <div className="flex flex-wrap gap-2">
                {selectedSubmission.files.map((file: string, index: number) => (
                  <Badge key={index} variant="outline" className="cursor-pointer hover:bg-gray-100">
                    <FileText className="h-3 w-3 mr-1" />
                    {file}
                  </Badge>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="grade">Grade (0-100)</Label>
                <Input 
                  id="grade" 
                  type="number" 
                  min="0" 
                  max="100" 
                  defaultValue={selectedSubmission.grade || ''} 
                  placeholder="Enter grade"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rubric">Rubric Score</Label>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select rubric score" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent (90-100)</SelectItem>
                    <SelectItem value="good">Good (80-89)</SelectItem>
                    <SelectItem value="satisfactory">Satisfactory (70-79)</SelectItem>
                    <SelectItem value="needs-improvement">Needs Improvement (60-69)</SelectItem>
                    <SelectItem value="unsatisfactory">Unsatisfactory (0-59)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedback">Feedback</Label>
              <Textarea 
                id="feedback" 
                placeholder="Provide detailed feedback for the student"
                rows={6}
                defaultValue={selectedSubmission.feedback}
              />
            </div>

            <div className="space-y-2">
              <Label>Quick Feedback Templates</Label>
              <div className="flex flex-wrap gap-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const textarea = document.getElementById('feedback') as HTMLTextAreaElement;
                    if (textarea) textarea.value += 'Excellent work! ';
                  }}
                >
                  Excellent work
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const textarea = document.getElementById('feedback') as HTMLTextAreaElement;
                    if (textarea) textarea.value += 'Good implementation, but consider... ';
                  }}
                >
                  Good with suggestions
                </Button>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    const textarea = document.getElementById('feedback') as HTMLTextAreaElement;
                    if (textarea) textarea.value += 'Please review the requirements and resubmit. ';
                  }}
                >
                  Needs revision
                </Button>
              </div>
            </div>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsGradingDialogOpen(false)}>
            <Save className="h-4 w-4 mr-2" />
            Save Draft
          </Button>
          <Button onClick={() => setIsGradingDialogOpen(false)}>
            <Send className="h-4 w-4 mr-2" />
            Submit Grade
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
                  {assignments.reduce((sum, a) => sum + a.pending, 0)}
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
                  {assignments.reduce((sum, a) => sum + a.graded, 0)}
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
                  {assignments.reduce((sum, a) => sum + a.submissions, 0)}
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
                  {Math.round(assignments.reduce((sum, a) => sum + a.averageGrade, 0) / assignments.length)}%
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
          <div className="space-y-4">
            {assignments.map((assignment) => (
              <div key={assignment.id} className="border rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div>
                    <h4 className="font-semibold">{assignment.title}</h4>
                    <p className="text-sm text-gray-600 dark:text-gray-400">{assignment.course}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={assignment.status === 'completed' ? 'default' : 'outline'}>
                      {assignment.status}
                    </Badge>
                    <span className="text-sm text-gray-500">Due: {assignment.dueDate}</span>
                  </div>
                </div>
                
                <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                  <div className="text-center">
                    <p className="font-bold text-blue-600">{assignment.submissions}</p>
                    <p className="text-gray-600">Submitted</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-green-600">{assignment.graded}</p>
                    <p className="text-gray-600">Graded</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-orange-600">{assignment.pending}</p>
                    <p className="text-gray-600">Pending</p>
                  </div>
                  <div className="text-center">
                    <p className="font-bold text-purple-600">{assignment.averageGrade}%</p>
                    <p className="text-gray-600">Avg Grade</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Grading Progress</span>
                    <span>{Math.round((assignment.graded / assignment.submissions) * 100)}%</span>
                  </div>
                  <Progress value={(assignment.graded / assignment.submissions) * 100} className="h-2" />
                </div>
              </div>
            ))}
          </div>
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
          {submissions.filter(s => s.status === 'pending').map((submission) => (
            <Card key={submission.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(submission.status)}`} />
                    <div>
                      <CardTitle className="text-lg">{submission.studentName}</CardTitle>
                      <CardDescription className="font-medium">{submission.studentId}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusBadge(submission.status)}>
                      {submission.status}
                    </Badge>
                    {submission.lateSubmission && (
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
                      <span>Submitted: {submission.submissionDate} at {submission.submissionTime}</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <FileText className="h-4 w-4" />
                      <span>{submission.files.length} files</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {submission.files.map((file, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {file}
                    </Badge>
                  ))}
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button 
                    size="sm" 
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setIsGradingDialogOpen(true);
                    }}
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Grade Submission
                  </Button>
                  <Button size="sm" variant="outline">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Files
                  </Button>
                  <Button size="sm" variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Download All
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="graded" className="space-y-4">
          {submissions.filter(s => s.status === 'graded').map((submission) => (
            <Card key={submission.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(submission.status)}`} />
                    <div>
                      <CardTitle className="text-lg">{submission.studentName}</CardTitle>
                      <CardDescription className="font-medium">{submission.studentId}</CardDescription>
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

      <GradingDialog />
    </div>
  );
};

export default Grading;
