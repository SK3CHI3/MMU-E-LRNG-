import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Building, Users, BookOpen, TrendingUp, Award, Calendar, Plus, BarChart3 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { getDeanStats, getFacultyDepartments, DeanStats, DepartmentData } from '@/services/deanService';

const Faculty = () => {
  const { dbUser } = useAuth();
  const [stats, setStats] = useState<DeanStats>({
    totalStudents: 0,
    totalLecturers: 0,
    totalCourses: 0,
    totalDepartments: 0,
    graduationRate: 0,
    employmentRate: 0,
    researchProjects: 0,
    publications: 0
  });
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchFacultyData = async () => {
      if (!dbUser?.faculty) return;

      try {
        setLoading(true);
        const [deanStats, facultyDepartments] = await Promise.all([
          getDeanStats(dbUser.faculty),
          getFacultyDepartments(dbUser.faculty)
        ]);

        setStats(deanStats);
        setDepartments(facultyDepartments);
      } catch (error) {
        console.error('Error fetching faculty data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFacultyData();
  }, [dbUser?.faculty]);

  const facultyOverview = {
    name: dbUser?.faculty || 'Faculty of Computing and Information Technology',
    dean: dbUser?.full_name || 'Dr. Jane Smith',
    established: '1995',
    totalStaff: stats.totalLecturers,
    totalStudents: stats.totalStudents,
    departments: stats.totalDepartments,
    programs: 12, // This would come from programmes table
    researchProjects: stats.researchProjects
  };



  const recentActivities = [
    {
      id: 1,
      type: 'achievement',
      title: 'Research Grant Awarded',
      description: 'Dr. Michael Johnson received $500K NSF grant for AI research',
      date: '2024-01-15',
      department: 'Computer Science'
    },
    {
      id: 2,
      type: 'event',
      title: 'Industry Partnership',
      description: 'New partnership with TechCorp for student internships',
      date: '2024-01-12',
      department: 'Software Engineering'
    },
    {
      id: 3,
      type: 'milestone',
      title: 'Accreditation Renewed',
      description: 'ABET accreditation renewed for all CS programs',
      date: '2024-01-10',
      department: 'Computer Science'
    }
  ];

  const getPerformanceColor = (performance: number) => {
    if (performance >= 90) return 'text-green-600';
    if (performance >= 80) return 'text-blue-600';
    if (performance >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getBudgetColor = (used: number) => {
    if (used <= 60) return 'bg-green-500';
    if (used <= 80) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-2"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="animate-pulse">
              <div className="h-24 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Faculty Overview</h1>
          <p className="text-gray-600 dark:text-gray-400">{facultyOverview.name}</p>
        </div>
        <Button className="bg-purple-600 hover:bg-purple-700">
          <Plus className="h-4 w-4 mr-2" />
          New Initiative
        </Button>
      </div>

      {/* Faculty Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Staff</p>
                <p className="text-2xl font-bold text-purple-600">{facultyOverview.totalStaff}</p>
              </div>
              <Users className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-blue-600">{facultyOverview.totalStudents}</p>
              </div>
              <BookOpen className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Departments</p>
                <p className="text-2xl font-bold text-green-600">{facultyOverview.departments}</p>
              </div>
              <Building className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Research Projects</p>
                <p className="text-2xl font-bold text-orange-600">{facultyOverview.researchProjects}</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Departments Overview */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Department Performance</h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {departments.map((dept) => (
            <Card key={dept.id} className="hover:shadow-lg transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-lg">{dept.name}</CardTitle>
                    <CardDescription className="font-medium">Head: {dept.head}</CardDescription>
                  </div>
                  <Badge className={getPerformanceColor(dept.performance)}>
                    {dept.performance}% Performance
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Staff:</span>
                    <p className="font-medium">{dept.lecturers} members</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Students:</span>
                    <p className="font-medium">{dept.students}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Courses:</span>
                    <p className="font-medium">{dept.courses}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Performance:</span>
                    <p className="font-medium">{dept.performance}%</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Department Performance</span>
                    <span>{dept.performance}%</span>
                  </div>
                  <Progress value={dept.performance} className="h-2" />
                </div>

                <div className="flex space-x-2 pt-2">
                  <Button size="sm" className="flex-1">
                    <BarChart3 className="h-4 w-4 mr-2" />
                    View Details
                  </Button>
                  <Button size="sm" variant="outline">
                    <TrendingUp className="h-4 w-4 mr-2" />
                    Reports
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Recent Activities */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Recent Faculty Activities</h2>
        <div className="space-y-3">
          {recentActivities.map((activity) => (
            <Card key={activity.id}>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-3">
                    <div className={`w-3 h-3 rounded-full mt-2 ${
                      activity.type === 'achievement' ? 'bg-green-500' :
                      activity.type === 'event' ? 'bg-blue-500' : 'bg-purple-500'
                    }`} />
                    <div>
                      <h3 className="font-medium text-gray-900 dark:text-white">{activity.title}</h3>
                      <p className="text-sm text-gray-600 dark:text-gray-400">{activity.description}</p>
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>{activity.department}</span>
                        <span>{activity.date}</span>
                      </div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {activity.type}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Faculty;
