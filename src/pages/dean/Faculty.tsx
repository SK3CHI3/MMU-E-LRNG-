import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Building, Users, BookOpen, TrendingUp, Award, Calendar, Plus, BarChart3 } from 'lucide-react';

const Faculty = () => {
  const facultyOverview = {
    name: 'Faculty of Computing and Information Technology',
    dean: 'Dr. Jane Smith',
    established: '1995',
    totalStaff: 45,
    totalStudents: 1250,
    departments: 4,
    programs: 12,
    researchProjects: 18
  };

  const departments = [
    {
      id: 1,
      name: 'Computer Science',
      head: 'Dr. Michael Johnson',
      staff: 15,
      students: 450,
      programs: ['BSc Computer Science', 'MSc Computer Science', 'PhD Computer Science'],
      budget: 850000,
      budgetUsed: 65,
      performance: 92
    },
    {
      id: 2,
      name: 'Information Technology',
      head: 'Prof. Sarah Wilson',
      staff: 12,
      students: 380,
      programs: ['BSc Information Technology', 'MSc IT Management'],
      budget: 720000,
      budgetUsed: 58,
      performance: 88
    },
    {
      id: 3,
      name: 'Software Engineering',
      head: 'Dr. Robert Chen',
      staff: 10,
      students: 320,
      programs: ['BSc Software Engineering', 'MSc Software Engineering'],
      budget: 680000,
      budgetUsed: 72,
      performance: 90
    },
    {
      id: 4,
      name: 'Data Science',
      head: 'Dr. Emily Rodriguez',
      staff: 8,
      students: 100,
      programs: ['BSc Data Science', 'MSc Data Analytics'],
      budget: 450000,
      budgetUsed: 45,
      performance: 95
    }
  ];

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
                    <p className="font-medium">{dept.staff} members</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Students:</span>
                    <p className="font-medium">{dept.students}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Programs:</span>
                    <p className="font-medium">{dept.programs.length}</p>
                  </div>
                  <div>
                    <span className="text-gray-600 dark:text-gray-400">Budget:</span>
                    <p className="font-medium">${(dept.budget / 1000).toFixed(0)}K</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Budget Utilization</span>
                    <span>{dept.budgetUsed}%</span>
                  </div>
                  <Progress value={dept.budgetUsed} className="h-2" />
                </div>

                <div className="space-y-1">
                  <p className="text-sm font-medium">Programs Offered:</p>
                  <div className="flex flex-wrap gap-1">
                    {dept.programs.map((program, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {program}
                      </Badge>
                    ))}
                  </div>
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
