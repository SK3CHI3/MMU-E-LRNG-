import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { BookOpen, Users, FileText, Calendar, BarChart3, Settings, Plus } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getLecturerCourses, CourseWithStats } from '@/services/courseService';
import { getLecturerAssignments } from '@/services/assignmentService';

const LecturerCourses = () => {
  const { dbUser } = useAuth();
  const [courses, setCourses] = useState<CourseWithStats[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!dbUser?.auth_id) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch courses and assignments in parallel
        const [coursesData, assignmentsData] = await Promise.all([
          getLecturerCourses(dbUser.auth_id),
          getLecturerAssignments(dbUser.auth_id)
        ]);

        // Enhance courses with assignment data
        const enhancedCourses = coursesData.map(course => {
          const courseAssignments = assignmentsData.filter(a => a.course_id === course.id);
          const pendingGrades = courseAssignments.reduce((sum, a) => sum + (a.total_submissions - a.graded_submissions), 0);

          return {
            ...course,
            assignments: courseAssignments.length,
            pendingGrades,
            enrolledStudents: course.total_students,
            maxCapacity: course.max_students || 50,
            schedule: 'View Schedule', // This would come from class sessions
            room: 'TBD', // This would come from class sessions
            status: course.is_active ? 'active' : 'inactive',
            progress: course.completion_rate || 0
          };
        });

        setCourses(enhancedCourses);
      } catch (error) {
        console.error('Error fetching courses:', error);
        setError('Failed to load courses. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchCourses();
  }, [dbUser?.auth_id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="text-sm text-muted-foreground">Loading courses...</p>
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

  const activeCourses = courses.filter(course => course.status === 'active');
  const totalStudents = activeCourses.reduce((sum, course) => sum + (course.enrolledStudents || 0), 0);
  const totalPendingGrades = activeCourses.reduce((sum, course) => sum + (course.pendingGrades || 0), 0);
  const averageClassSize = activeCourses.length > 0 ? Math.round(totalStudents / activeCourses.length) : 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Courses</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage your teaching courses and track student progress</p>
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Plus className="h-4 w-4 mr-2" />
          Create New Course
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Courses</p>
                <p className="text-2xl font-bold text-green-600">{activeCourses.length}</p>
              </div>
              <BookOpen className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Grades</p>
                <p className="text-2xl font-bold text-orange-600">{totalPendingGrades}</p>
              </div>
              <FileText className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Class Size</p>
                <p className="text-2xl font-bold text-purple-600">{averageClassSize}</p>
              </div>
              <BarChart3 className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Courses Grid */}
      {courses.length === 0 ? (
        <div className="text-center py-12">
          <BookOpen className="h-12 w-12 mx-auto text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No courses yet</h3>
          <p className="text-gray-600 dark:text-gray-400 mb-4">
            You haven't been assigned any courses yet. Contact your administrator.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {courses.map((course) => (
            <Card key={course.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-3 h-3 rounded-full ${
                      course.status === 'active' ? 'bg-green-500' : 'bg-gray-500'
                    }`} />
                    <div>
                      <CardTitle className="text-lg">{course.code}</CardTitle>
                      <CardDescription className="font-medium">{course.title}</CardDescription>
                    </div>
                  </div>
                  <Badge variant={course.status === 'active' ? 'default' : 'secondary'}>
                    {course.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Semester:</span>
                    <p className="font-medium">{course.semester}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Level:</span>
                    <p className="font-medium">{course.level}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Schedule:</span>
                    <p className="font-medium">{course.schedule}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Department:</span>
                    <p className="font-medium">{course.department}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Enrollment</span>
                    <span>{course.enrolledStudents}/{course.maxCapacity}</span>
                  </div>
                  <Progress
                    value={course.maxCapacity > 0 ? (course.enrolledStudents / course.maxCapacity) * 100 : 0}
                    className="h-2"
                  />
                </div>

                {course.status === 'active' && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Course Progress</span>
                      <span>{Math.round(course.progress)}%</span>
                    </div>
                    <Progress value={course.progress} className="h-2" />
                  </div>
                )}

                <div className="grid grid-cols-3 gap-4 text-center text-sm">
                  <div className="bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                    <p className="font-bold text-blue-600">{course.assignments || 0}</p>
                    <p className="text-blue-600">Assignments</p>
                  </div>
                  <div className="bg-orange-50 dark:bg-orange-900/20 p-2 rounded">
                    <p className="font-bold text-orange-600">{course.pendingGrades || 0}</p>
                    <p className="text-orange-600">Pending</p>
                  </div>
                  <div className="bg-green-50 dark:bg-green-900/20 p-2 rounded">
                    <p className="font-bold text-green-600">{Math.round(course.average_grade || 0)}%</p>
                    <p className="text-green-600">Avg Grade</p>
                  </div>
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button size="sm" className="flex-1">
                    <BookOpen className="h-4 w-4 mr-2" />
                    Manage Course
                  </Button>
                  <Button size="sm" variant="outline">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    Analytics
                  </Button>
                  <Button size="sm" variant="outline">
                    <Settings className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default LecturerCourses;
