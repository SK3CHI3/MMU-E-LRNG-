import React, { useState, useEffect } from 'react';
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
import { Skeleton } from '@/components/ui/skeleton';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
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
  const { dbUser } = useAuth();
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

  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (dbUser?.auth_id) {
      fetchLecturerStudents();
    }
  }, [dbUser?.auth_id]);

  const fetchLecturerStudents = async () => {
    if (!dbUser?.auth_id) return;

    try {
      setLoading(true);
      console.log('Fetching students for lecturer:', dbUser.auth_id);

      // Get lecturer's courses
      const { data: courses, error: coursesError } = await supabase
        .from('courses')
        .select('id, title, code')
        .eq('created_by', dbUser.auth_id);

      if (coursesError) throw coursesError;

      if (!courses || courses.length === 0) {
        setStudents([]);
        return;
      }

      const courseIds = courses.map(c => c.id);

      // Get students enrolled in lecturer's courses
      const { data: enrollments, error: enrollmentsError } = await supabase
        .from('course_enrollments')
        .select(`
          *,
          users!course_enrollments_user_id_users_auth_id_fkey (
            id,
            full_name,
            email,
            phone,
            student_id,
            year_of_study,
            created_at
          ),
          courses!inner (
            id,
            title,
            code
          )
        `)
        .in('course_id', courseIds);

      if (enrollmentsError) throw enrollmentsError;

      // Transform data to match component interface
      const transformedStudents = (enrollments || []).map((enrollment, index) => ({
        id: enrollment.users?.id || index,
        studentId: enrollment.users?.student_id || `STU${index + 1}`,
        name: enrollment.users?.full_name || 'Unknown Student',
        email: enrollment.users?.email || '',
        phone: enrollment.users?.phone || '',
        avatar: '',
        courses: [enrollment.courses?.code || ''],
        enrollmentDate: enrollment.created_at?.split('T')[0] || '',
        status: enrollment.status || 'active',
        attendance: Math.floor(Math.random() * 20) + 80, // Random for demo
        averageGrade: Math.floor(Math.random() * 30) + 70, // Random for demo
        assignmentsCompleted: Math.floor(Math.random() * 5) + 5,
        totalAssignments: 10,
        lastActivity: new Date().toISOString().split('T')[0],
        performance: enrollment.grade ? 'excellent' : 'good',
        year: `${enrollment.users?.year_of_study || 1}${getOrdinalSuffix(enrollment.users?.year_of_study || 1)} Year`,
        program: 'Computer Science'
      }));

      // Remove duplicates based on student ID
      const uniqueStudents = transformedStudents.filter((student, index, self) =>
        index === self.findIndex(s => s.studentId === student.studentId)
      );

      setStudents(uniqueStudents);
      console.log('Fetched students:', uniqueStudents.length);
    } catch (error) {
      console.error('Error fetching lecturer students:', error);
      setStudents([]);
    } finally {
      setLoading(false);
    }
  };

  const getOrdinalSuffix = (num: number) => {
    const j = num % 10;
    const k = num % 100;
    if (j === 1 && k !== 11) return 'st';
    if (j === 2 && k !== 12) return 'nd';
    if (j === 3 && k !== 13) return 'rd';
    return 'th';
  };



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
                  {students.length > 0 ? Math.round(students.reduce((sum, s) => sum + s.averageGrade, 0) / students.length) : 0}%
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
        {loading ? (
          // Loading skeleton
          Array.from({ length: 6 }).map((_, index) => (
            <Card key={index} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="h-12 w-12 rounded-full" />
                    <div>
                      <Skeleton className="h-5 w-32 mb-2" />
                      <Skeleton className="h-4 w-24" />
                    </div>
                  </div>
                  <Skeleton className="h-6 w-16" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <Skeleton className="h-4 w-full" />
                  <Skeleton className="h-4 w-3/4" />
                  <div className="flex space-x-2">
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                    <Skeleton className="h-8 w-20" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        ) : filteredStudents.length > 0 ? (
          filteredStudents.map((student) => (
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
        ))
        ) : (
          // Empty state
          <div className="col-span-full">
            <Card>
              <CardContent className="p-12 text-center">
                <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Students Found</h3>
                <p className="text-muted-foreground">
                  {searchTerm || selectedCourse !== 'all'
                    ? "Try adjusting your filters to find more students."
                    : "You don't have any students enrolled in your courses yet."}
                </p>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      <StudentDetailDialog />
    </div>
  );
};

export default Students;
