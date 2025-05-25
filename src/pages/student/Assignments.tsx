import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import { FileText, Clock, Calendar, Upload, CheckCircle, AlertCircle, XCircle } from 'lucide-react';

const Assignments = () => {
  const [activeTab, setActiveTab] = useState('pending');

  const assignments = [
    {
      id: 1,
      title: 'Binary Search Tree Implementation',
      course: 'CS 301 - Data Structures',
      dueDate: '2024-01-20',
      dueTime: '11:59 PM',
      status: 'pending',
      priority: 'high',
      points: 100,
      description: 'Implement a binary search tree with insertion, deletion, and traversal methods.',
      submitted: false,
      timeLeft: '3 days',
      progress: 60
    },
    {
      id: 2,
      title: 'Database Design Project',
      course: 'CS 205 - Database Management',
      dueDate: '2024-01-25',
      dueTime: '11:59 PM',
      status: 'pending',
      priority: 'medium',
      points: 150,
      description: 'Design and implement a database schema for a library management system.',
      submitted: false,
      timeLeft: '8 days',
      progress: 30
    },
    {
      id: 3,
      title: 'Software Requirements Document',
      course: 'CS 401 - Software Engineering',
      dueDate: '2024-01-18',
      dueTime: '11:59 PM',
      status: 'pending',
      priority: 'high',
      points: 80,
      description: 'Create a comprehensive requirements document for a mobile application.',
      submitted: false,
      timeLeft: '1 day',
      progress: 85
    },
    {
      id: 4,
      title: 'Network Protocol Analysis',
      course: 'CS 350 - Computer Networks',
      dueDate: '2024-01-15',
      dueTime: '11:59 PM',
      status: 'overdue',
      priority: 'high',
      points: 75,
      description: 'Analyze TCP/IP protocol behavior using Wireshark.',
      submitted: false,
      timeLeft: 'Overdue',
      progress: 20
    },
    {
      id: 5,
      title: 'Java OOP Final Project',
      course: 'CS 201 - Object-Oriented Programming',
      dueDate: '2024-01-10',
      dueTime: '11:59 PM',
      status: 'submitted',
      priority: 'medium',
      points: 200,
      description: 'Complete Java application demonstrating OOP principles.',
      submitted: true,
      timeLeft: 'Submitted',
      progress: 100,
      grade: 95,
      feedback: 'Excellent work! Great implementation of design patterns.'
    },
    {
      id: 6,
      title: 'Algorithm Complexity Analysis',
      course: 'CS 301 - Data Structures',
      dueDate: '2024-01-05',
      dueTime: '11:59 PM',
      status: 'graded',
      priority: 'medium',
      points: 50,
      description: 'Analyze time and space complexity of sorting algorithms.',
      submitted: true,
      timeLeft: 'Graded',
      progress: 100,
      grade: 88,
      feedback: 'Good analysis, but could improve on space complexity explanation.'
    }
  ];

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
    switch (activeTab) {
      case 'pending':
        return assignment.status === 'pending' || assignment.status === 'overdue';
      case 'submitted':
        return assignment.status === 'submitted';
      case 'graded':
        return assignment.status === 'graded';
      default:
        return true;
    }
  });

  const stats = {
    pending: assignments.filter(a => a.status === 'pending').length,
    overdue: assignments.filter(a => a.status === 'overdue').length,
    submitted: assignments.filter(a => a.status === 'submitted').length,
    graded: assignments.filter(a => a.status === 'graded').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Assignments</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage your course assignments</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
              </div>
              <Clock className="h-8 w-8 text-yellow-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Overdue</p>
                <p className="text-2xl font-bold text-red-600">{stats.overdue}</p>
              </div>
              <XCircle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Submitted</p>
                <p className="text-2xl font-bold text-blue-600">{stats.submitted}</p>
              </div>
              <Upload className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Graded</p>
                <p className="text-2xl font-bold text-green-600">{stats.graded}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Assignments Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pending">Pending & Overdue</TabsTrigger>
          <TabsTrigger value="submitted">Submitted</TabsTrigger>
          <TabsTrigger value="graded">Graded</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          {filteredAssignments.map((assignment) => (
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
                  </div>
                </div>

                {assignment.status === 'pending' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Progress</span>
                      <span>{assignment.progress}%</span>
                    </div>
                    <Progress value={assignment.progress} className="h-2" />
                  </div>
                )}

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
                      <Button size="sm" className="flex-1">
                        <Upload className="h-4 w-4 mr-2" />
                        Submit Assignment
                      </Button>
                      <Button size="sm" variant="outline">
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
          ))}
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Assignments;
