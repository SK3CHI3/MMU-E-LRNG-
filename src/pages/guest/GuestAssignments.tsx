import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { FileText, Clock, Calendar, Upload, Lock, AlertCircle, CheckCircle } from 'lucide-react';

const GuestAssignments = () => {
  const mockAssignments = [
    {
      id: 1,
      title: "Database Design Project",
      course: "CS202 - Database Systems",
      dueDate: "2024-02-20",
      daysRemaining: 5,
      status: "pending",
      type: "Project",
      points: 100,
      description: "Design and implement a complete database system for a library management system.",
      submitted: false,
      grade: null
    },
    {
      id: 2,
      title: "Algorithm Analysis Report",
      course: "CS201 - Data Structures",
      dueDate: "2024-02-25",
      daysRemaining: 10,
      status: "pending",
      type: "Report",
      points: 50,
      description: "Analyze the time and space complexity of various sorting algorithms.",
      submitted: false,
      grade: null
    },
    {
      id: 3,
      title: "Web App Development",
      course: "CS203 - Web Development",
      dueDate: "2024-02-28",
      daysRemaining: 13,
      status: "pending",
      type: "Project",
      points: 150,
      description: "Create a responsive web application using React and Node.js.",
      submitted: false,
      grade: null
    },
    {
      id: 4,
      title: "Software Requirements Document",
      course: "CS204 - Software Engineering",
      dueDate: "2024-02-15",
      daysRemaining: 0,
      status: "submitted",
      type: "Document",
      points: 75,
      description: "Write a comprehensive software requirements specification document.",
      submitted: true,
      grade: 68
    },
    {
      id: 5,
      title: "Network Protocol Analysis",
      course: "CS205 - Computer Networks",
      dueDate: "2024-03-05",
      daysRemaining: 20,
      status: "pending",
      type: "Lab Report",
      points: 60,
      description: "Analyze different network protocols and their performance characteristics.",
      submitted: false,
      grade: null
    },
    {
      id: 6,
      title: "Operating System Simulation",
      course: "CS206 - Operating Systems",
      dueDate: "2024-01-30",
      daysRemaining: -15,
      status: "graded",
      type: "Project",
      points: 120,
      description: "Implement a basic operating system scheduler simulation.",
      submitted: true,
      grade: 95
    }
  ];

  const getStatusColor = (status: string, daysRemaining: number) => {
    if (status === 'graded') return "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400";
    if (status === 'submitted') return "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400";
    if (daysRemaining <= 2) return "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400";
    if (daysRemaining <= 7) return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400";
    return "bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400";
  };

  const getStatusIcon = (status: string, daysRemaining: number) => {
    if (status === 'graded') return <CheckCircle className="h-4 w-4" />;
    if (status === 'submitted') return <Clock className="h-4 w-4" />;
    if (daysRemaining <= 2) return <AlertCircle className="h-4 w-4" />;
    return <FileText className="h-4 w-4" />;
  };

  const getStatusText = (status: string, daysRemaining: number) => {
    if (status === 'graded') return 'Graded';
    if (status === 'submitted') return 'Submitted';
    if (daysRemaining < 0) return 'Overdue';
    if (daysRemaining === 0) return 'Due Today';
    if (daysRemaining === 1) return 'Due Tomorrow';
    return `${daysRemaining} days left`;
  };

  const pendingAssignments = mockAssignments.filter(a => a.status === 'pending' && a.daysRemaining >= 0);
  const submittedAssignments = mockAssignments.filter(a => a.status === 'submitted');
  const gradedAssignments = mockAssignments.filter(a => a.status === 'graded');
  const overdueAssignments = mockAssignments.filter(a => a.status === 'pending' && a.daysRemaining < 0);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Assignments</h1>
          <p className="text-muted-foreground">
            Track and manage your course assignments
          </p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <FileText className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{mockAssignments.length} Total</span>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{pendingAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Need attention</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Submitted</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{submittedAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Awaiting grades</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Graded</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{gradedAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Overdue</CardTitle>
            <AlertCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{overdueAssignments.length}</div>
            <p className="text-xs text-muted-foreground">Past deadline</p>
          </CardContent>
        </Card>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {mockAssignments.map((assignment) => (
          <Card key={assignment.id} className="bg-white/80 dark:bg-card backdrop-blur-sm border-white/40 dark:border-border shadow-lg hover:shadow-xl transition-all duration-300">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <CardTitle className="text-lg">{assignment.title}</CardTitle>
                  <CardDescription className="font-medium">{assignment.course}</CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={getStatusColor(assignment.status, assignment.daysRemaining)}>
                    {getStatusIcon(assignment.status, assignment.daysRemaining)}
                    <span className="ml-1">{getStatusText(assignment.status, assignment.daysRemaining)}</span>
                  </Badge>
                  {assignment.grade && (
                    <Badge variant="outline">
                      {assignment.grade}/{assignment.points}
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{assignment.description}</p>
              
              <div className="grid gap-4 md:grid-cols-3">
                <div className="flex items-center gap-2 text-sm">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span>Due: {assignment.dueDate}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <FileText className="h-4 w-4 text-muted-foreground" />
                  <span>Type: {assignment.type}</span>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  <span className="font-medium">Points: {assignment.points}</span>
                </div>
              </div>

              <div className="flex gap-2">
                <Button variant="outline" size="sm" disabled>
                  View Details
                  <Lock className="h-3 w-3 ml-2" />
                </Button>
                {!assignment.submitted && (
                  <Button size="sm" disabled>
                    Submit Assignment
                    <Lock className="h-3 w-3 ml-2" />
                  </Button>
                )}
                {assignment.grade && (
                  <Button variant="outline" size="sm" disabled>
                    View Feedback
                    <Lock className="h-3 w-3 ml-2" />
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button disabled className="flex items-center gap-2">
          <Upload className="h-4 w-4" />
          Upload Assignment
          <Lock className="h-3 w-3" />
        </Button>
        <Button variant="outline" disabled className="flex items-center gap-2">
          <FileText className="h-4 w-4" />
          Assignment Calendar
          <Lock className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
};

export default GuestAssignments;
