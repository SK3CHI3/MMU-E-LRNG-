import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Send, 
  Eye, 
  BarChart3,
  TrendingUp,
  TrendingDown,
  Clock,
  CheckCircle,
  AlertCircle,
  Mail,
  Phone,
  Calendar,
  BookOpen,
  Award,
  MessageSquare
} from 'lucide-react';

const Students = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const courses = [
    { id: 'all', name: 'All Courses' },
    { id: 'cs301', name: 'CS 301 - Data Structures and Algorithms' },
    { id: 'cs205', name: 'CS 205 - Database Management Systems' },
    { id: 'cs401', name: 'CS 401 - Software Engineering' }
  ];

  const students = [
    {
      id: 1,
      studentId: 'CS2021001',
      name: 'John Doe',
      email: 'john.doe@student.mmu.ac.ke',
      phone: '+254 712 345 678',
      avatar: '/avatars/john.jpg',
      courses: ['CS 301', 'CS 205'],
      enrollmentDate: '2024-01-15',
      status: 'active',
      attendance: 92,
      averageGrade: 87.5,
      assignmentsCompleted: 8,
      totalAssignments: 10,
      lastActivity: '2024-01-20 14:30',
      performance: 'excellent',
      year: '3rd Year',
      program: 'Computer Science'
    },
    {
      id: 2,
      studentId: 'CS2021002',
      name: 'Jane Smith',
      email: 'jane.smith@student.mmu.ac.ke',
      phone: '+254 723 456 789',
      avatar: '/avatars/jane.jpg',
      courses: ['CS 301', 'CS 401'],
      enrollmentDate: '2024-01-15',
      status: 'active',
      attendance: 88,
      averageGrade: 92.3,
      assignmentsCompleted: 9,
      totalAssignments: 10,
      lastActivity: '2024-01-20 16:45',
      performance: 'excellent',
      year: '3rd Year',
      program: 'Computer Science'
    },
    {
      id: 3,
      studentId: 'CS2021003',
      name: 'Mike Johnson',
      email: 'mike.johnson@student.mmu.ac.ke',
      phone: '+254 734 567 890',
      avatar: '/avatars/mike.jpg',
      courses: ['CS 205', 'CS 401'],
      enrollmentDate: '2024-01-15',
      status: 'active',
      attendance: 76,
      averageGrade: 73.8,
      assignmentsCompleted: 6,
      totalAssignments: 10,
      lastActivity: '2024-01-19 10:20',
      performance: 'needs-attention',
      year: '3rd Year',
      program: 'Computer Science'
    },
    {
      id: 4,
      studentId: 'CS2021004',
      name: 'Sarah Wilson',
      email: 'sarah.wilson@student.mmu.ac.ke',
      phone: '+254 745 678 901',
      avatar: '/avatars/sarah.jpg',
      courses: ['CS 301', 'CS 205', 'CS 401'],
      enrollmentDate: '2024-01-15',
      status: 'active',
      attendance: 95,
      averageGrade: 89.7,
      assignmentsCompleted: 10,
      totalAssignments: 10,
      lastActivity: '2024-01-20 18:15',
      performance: 'excellent',
      year: '3rd Year',
      program: 'Computer Science'
    },
    {
      id: 5,
      studentId: 'CS2021005',
      name: 'David Brown',
      email: 'david.brown@student.mmu.ac.ke',
      phone: '+254 756 789 012',
      avatar: '/avatars/david.jpg',
      courses: ['CS 301'],
      enrollmentDate: '2024-01-15',
      status: 'inactive',
      attendance: 45,
      averageGrade: 58.2,
      assignmentsCompleted: 3,
      totalAssignments: 10,
      lastActivity: '2024-01-15 09:30',
      performance: 'at-risk',
      year: '3rd Year',
      program: 'Computer Science'
    }
  ];

  const getPerformanceColor = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'text-green-600';
      case 'good': return 'text-blue-600';
      case 'needs-attention': return 'text-yellow-600';
      case 'at-risk': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPerformanceBadge = (performance: string) => {
    switch (performance) {
      case 'excellent': return 'default';
      case 'good': return 'secondary';
      case 'needs-attention': return 'outline';
      case 'at-risk': return 'destructive';
      default: return 'secondary';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'inactive': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const filteredStudents = students.filter(student => {
    const matchesSearch = student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.studentId.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         student.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesCourse = selectedCourse === 'all' || 
                         student.courses.some(course => course.includes(selectedCourse.replace('cs', 'CS ')));
    
    return matchesSearch && matchesCourse;
  });

  const StudentDetailDialog = () => (
    <Dialog open={isDetailDialogOpen} onOpenChange={setIsDetailDialogOpen}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Student Details</DialogTitle>
          <DialogDescription>
            Comprehensive view of student performance and engagement
          </DialogDescription>
        </DialogHeader>
        {selectedStudent && (
          <div className="grid gap-6 py-4">
            {/* Student Info Header */}
            <div className="flex items-center space-x-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
              <Avatar className="h-16 w-16">
                <AvatarImage src={selectedStudent.avatar} />
                <AvatarFallback className="text-lg">
                  {selectedStudent.name.split(' ').map((n: string) => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="text-xl font-semibold">{selectedStudent.name}</h3>
                <p className="text-gray-600 dark:text-gray-400">{selectedStudent.studentId}</p>
                <p className="text-sm text-gray-500">{selectedStudent.program} • {selectedStudent.year}</p>
                <div className="flex items-center space-x-4 mt-2">
                  <div className="flex items-center space-x-1">
                    <Mail className="h-4 w-4" />
                    <span className="text-sm">{selectedStudent.email}</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span className="text-sm">{selectedStudent.phone}</span>
                  </div>
                </div>
              </div>
              <Badge variant={getPerformanceBadge(selectedStudent.performance)}>
                {selectedStudent.performance.replace('-', ' ')}
              </Badge>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-green-600">{selectedStudent.averageGrade}%</div>
                  <p className="text-sm text-gray-600">Average Grade</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-blue-600">{selectedStudent.attendance}%</div>
                  <p className="text-sm text-gray-600">Attendance</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-purple-600">
                    {selectedStudent.assignmentsCompleted}/{selectedStudent.totalAssignments}
                  </div>
                  <p className="text-sm text-gray-600">Assignments</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="p-4 text-center">
                  <div className="text-2xl font-bold text-orange-600">
                    {selectedStudent.courses.length}
                  </div>
                  <p className="text-sm text-gray-600">Courses</p>
                </CardContent>
              </Card>
            </div>

            {/* Course Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Course Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {selectedStudent.courses.map((course: string, index: number) => (
                    <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                      <div>
                        <h4 className="font-medium">{course}</h4>
                        <p className="text-sm text-gray-600">Current Grade: {85 + Math.floor(Math.random() * 15)}%</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-medium">Progress</p>
                        <Progress value={75 + Math.floor(Math.random() * 25)} className="w-24 h-2" />
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex items-center space-x-3 p-2 border-l-4 border-l-green-500">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <div>
                      <p className="text-sm font-medium">Submitted Assignment: Binary Tree Implementation</p>
                      <p className="text-xs text-gray-500">2 hours ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 border-l-4 border-l-blue-500">
                    <Eye className="h-4 w-4 text-blue-600" />
                    <div>
                      <p className="text-sm font-medium">Viewed Material: Database Normalization Guide</p>
                      <p className="text-xs text-gray-500">1 day ago</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-3 p-2 border-l-4 border-l-purple-500">
                    <MessageSquare className="h-4 w-4 text-purple-600" />
                    <div>
                      <p className="text-sm font-medium">Sent Message: Question about Project Requirements</p>
                      <p className="text-xs text-gray-500">2 days ago</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsDetailDialogOpen(false)}>
            Close
          </Button>
          <Button>
            <MessageSquare className="h-4 w-4 mr-2" />
            Send Message
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Student Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Monitor and manage your students' progress</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <Send className="h-4 w-4 mr-2" />
            Send Announcement
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{students.length}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Students</p>
                <p className="text-2xl font-bold text-green-600">
                  {students.filter(s => s.status === 'active').length}
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
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Average Grade</p>
                <p className="text-2xl font-bold text-purple-600">
                  {Math.round(students.reduce((sum, s) => sum + s.averageGrade, 0) / students.length)}%
                </p>
              </div>
              <Award className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">At Risk</p>
                <p className="text-2xl font-bold text-red-600">
                  {students.filter(s => s.performance === 'at-risk').length}
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Search students by name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="w-full md:w-64">
              <Select value={selectedCourse} onValueChange={setSelectedCourse}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by course" />
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
          </div>
        </CardContent>
      </Card>

      {/* Students List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStudents.map((student) => (
          <Card key={student.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={student.avatar} />
                    <AvatarFallback>
                      {student.name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{student.name}</CardTitle>
                    <CardDescription className="font-medium">{student.studentId}</CardDescription>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  {getStatusIcon(student.status)}
                  <Badge variant={getPerformanceBadge(student.performance)}>
                    {student.performance.replace('-', ' ')}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-3 gap-4 text-center text-sm">
                <div>
                  <p className="font-bold text-green-600">{student.averageGrade}%</p>
                  <p className="text-gray-600">Avg Grade</p>
                </div>
                <div>
                  <p className="font-bold text-blue-600">{student.attendance}%</p>
                  <p className="text-gray-600">Attendance</p>
                </div>
                <div>
                  <p className="font-bold text-purple-600">
                    {student.assignmentsCompleted}/{student.totalAssignments}
                  </p>
                  <p className="text-gray-600">Assignments</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Assignment Progress</span>
                  <span>{Math.round((student.assignmentsCompleted / student.totalAssignments) * 100)}%</span>
                </div>
                <Progress value={(student.assignmentsCompleted / student.totalAssignments) * 100} className="h-2" />
              </div>

              <div className="flex flex-wrap gap-1">
                {student.courses.map((course, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {course}
                  </Badge>
                ))}
              </div>

              <div className="flex space-x-2 pt-2">
                <Button 
                  size="sm" 
                  onClick={() => {
                    setSelectedStudent(student);
                    setIsDetailDialogOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button size="sm" variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button size="sm" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Analytics
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <StudentDetailDialog />
    </div>
  );
};

export default Students;
