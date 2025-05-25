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
  Download
} from 'lucide-react';

const AssignmentManagement = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [selectedCourse, setSelectedCourse] = useState('');

  const courses = [
    { id: 'cs301', name: 'CS 301 - Data Structures and Algorithms', students: 45 },
    { id: 'cs205', name: 'CS 205 - Database Management Systems', students: 38 },
    { id: 'cs401', name: 'CS 401 - Software Engineering', students: 42 }
  ];

  const assignments = [
    {
      id: 1,
      title: 'Binary Search Tree Implementation',
      course: 'CS 301',
      courseId: 'cs301',
      description: 'Implement a binary search tree with insertion, deletion, and traversal methods.',
      dueDate: '2024-01-25',
      dueTime: '11:59 PM',
      points: 100,
      status: 'active',
      submissions: 32,
      totalStudents: 45,
      graded: 15,
      createdDate: '2024-01-10',
      type: 'Programming'
    },
    {
      id: 2,
      title: 'Database Design Project',
      course: 'CS 205',
      courseId: 'cs205',
      description: 'Design and implement a database schema for a library management system.',
      dueDate: '2024-01-30',
      dueTime: '11:59 PM',
      points: 150,
      status: 'active',
      submissions: 28,
      totalStudents: 38,
      graded: 20,
      createdDate: '2024-01-12',
      type: 'Project'
    },
    {
      id: 3,
      title: 'Software Requirements Analysis',
      course: 'CS 401',
      courseId: 'cs401',
      description: 'Analyze and document software requirements for a given system.',
      dueDate: '2024-01-18',
      dueTime: '11:59 PM',
      points: 75,
      status: 'closed',
      submissions: 42,
      totalStudents: 42,
      graded: 42,
      createdDate: '2024-01-05',
      type: 'Report'
    }
  ];

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignment Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Create, manage, and track assignments for your courses</p>
        </div>
        <CreateAssignmentDialog />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Assignments</p>
                <p className="text-2xl font-bold text-green-600">
                  {assignments.filter(a => a.status === 'active').length}
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
                  {assignments.reduce((sum, a) => sum + (a.submissions - a.graded), 0)}
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
                  {assignments.reduce((sum, a) => sum + a.submissions, 0)}
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
          {assignments.map((assignment) => (
            <Card key={assignment.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${getStatusColor(assignment.status)}`} />
                    <div>
                      <CardTitle className="text-lg">{assignment.title}</CardTitle>
                      <CardDescription className="font-medium">{assignment.course}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge variant={getStatusBadge(assignment.status)}>
                      {assignment.status}
                    </Badge>
                    <Badge variant="outline">
                      {assignment.type}
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
                      <Users className="h-4 w-4" />
                      <span>{assignment.submissions}/{assignment.totalStudents} submitted</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Submission Progress</span>
                    <span>{Math.round((assignment.submissions / assignment.totalStudents) * 100)}%</span>
                  </div>
                  <Progress value={(assignment.submissions / assignment.totalStudents) * 100} className="h-2" />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Grading Progress</span>
                    <span>{Math.round((assignment.graded / assignment.submissions) * 100)}%</span>
                  </div>
                  <Progress value={(assignment.graded / assignment.submissions) * 100} className="h-2" />
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
                  {assignment.status === 'active' && (
                    <Button size="sm" variant="outline">
                      <Send className="h-4 w-4 mr-2" />
                      Send Reminder
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AssignmentManagement;
