import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Building,
  Users,
  BookOpen,
  UserCheck,
  Search,
  Eye,
  BarChart3,
  TrendingUp,
  Award,
  Computer,
  Cog,
  Video,
  Atom
} from 'lucide-react';
import { mmuFaculties, Faculty } from '@/data/mmuData';
import { getSystemMetrics, SystemMetrics } from '@/services/adminService';
import { supabase } from '@/lib/supabaseClient';
import { useNavigate } from 'react-router-dom';

interface FacultyWithData extends Faculty {
  totalStudents: number;
  totalLecturers: number;
  totalCourses: number;
  totalDeans: number;
  status: 'active' | 'inactive';
}

const Faculties = () => {
  const navigate = useNavigate();
  const [faculties, setFaculties] = useState<FacultyWithData[]>([]);
  const [filteredFaculties, setFilteredFaculties] = useState<FacultyWithData[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchFaculties();
  }, []);

  useEffect(() => {
    let filtered = faculties;

    if (searchTerm) {
      filtered = filtered.filter(faculty =>
        faculty.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        faculty.shortName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (faculty.dean && faculty.dean.toLowerCase().includes(searchTerm.toLowerCase())) ||
        faculty.description.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedStatus !== 'all') {
      filtered = filtered.filter(faculty => faculty.status === selectedStatus);
    }

    setFilteredFaculties(filtered);
  }, [faculties, searchTerm, selectedStatus]);

  const fetchFaculties = async () => {
    try {
      setLoading(true);

      // Get user data from database
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('faculty, role, department')
        .not('faculty', 'is', null);

      if (userError) throw userError;

      // Get course data from database
      const { data: courseData, error: courseError } = await supabase
        .from('courses')
        .select('department');

      if (courseError) throw courseError;

      // Combine MMU faculty data with dynamic user data
      const facultiesWithData: FacultyWithData[] = mmuFaculties.map(faculty => {
        // Count users by role for this faculty
        const facultyUsers = userData?.filter(user => user.faculty === faculty.name) || [];
        const students = facultyUsers.filter(user => user.role === 'student').length;
        const lecturers = facultyUsers.filter(user => user.role === 'lecturer').length;
        const deans = facultyUsers.filter(user => user.role === 'dean').length;

        // Count courses for this faculty by matching department to faculty
        const facultyCourses = courseData?.filter(course => {
          if (!course.department) return false;

          // Map known departments to faculties
          const dept = course.department.toLowerCase();
          const facultyName = faculty.name.toLowerCase();

          // Direct mapping for known departments
          if (dept.includes('computing') || dept.includes('computer')) {
            return facultyName.includes('computing') || facultyName.includes('information technology');
          }
          if (dept.includes('media') || dept.includes('communication')) {
            return facultyName.includes('media') || facultyName.includes('communication');
          }

          // For other faculties, try partial name matching
          return dept.includes(facultyName.split(' ')[2]?.toLowerCase() || '');
        }) || [];

        return {
          ...faculty,
          totalStudents: students,
          totalLecturers: lecturers,
          totalCourses: facultyCourses.length,
          totalDeans: deans,
          status: 'active' as const
        };
      });

      setFaculties(facultiesWithData);
      setFilteredFaculties(facultiesWithData);
    } catch (error) {
      console.error('Error fetching faculties:', error);
      // Fallback to MMU faculties with zero data
      const fallbackFaculties: FacultyWithData[] = mmuFaculties.map(faculty => ({
        ...faculty,
        totalStudents: 0,
        totalLecturers: 0,
        totalCourses: 0,
        totalDeans: 0,
        status: 'active' as const
      }));
      setFaculties(fallbackFaculties);
      setFilteredFaculties(fallbackFaculties);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getIconComponent = (iconName: string) => {
    switch (iconName) {
      case 'TrendingUp': return <TrendingUp className="h-6 w-6 text-blue-600" />;
      case 'Computer': return <Computer className="h-6 w-6 text-green-600" />;
      case 'Cog': return <Cog className="h-6 w-6 text-orange-600" />;
      case 'Video': return <Video className="h-6 w-6 text-purple-600" />;
      case 'Atom': return <Atom className="h-6 w-6 text-indigo-600" />;
      case 'Users': return <Users className="h-6 w-6 text-pink-600" />;
      default: return <Building className="h-6 w-6 text-gray-600" />;
    }
  };

  const getColorClasses = (color: string) => {
    switch (color) {
      case 'blue': return 'bg-blue-100 dark:bg-blue-900/30';
      case 'green': return 'bg-green-100 dark:bg-green-900/30';
      case 'orange': return 'bg-orange-100 dark:bg-orange-900/30';
      case 'purple': return 'bg-purple-100 dark:bg-purple-900/30';
      case 'indigo': return 'bg-indigo-100 dark:bg-indigo-900/30';
      case 'pink': return 'bg-pink-100 dark:bg-pink-900/30';
      default: return 'bg-gray-100 dark:bg-gray-900/30';
    }
  };

  const totalStats = {
    totalFaculties: faculties.length,
    totalStudents: faculties.reduce((sum, f) => sum + f.totalStudents, 0),
    totalLecturers: faculties.reduce((sum, f) => sum + f.totalLecturers, 0),
    totalProgrammes: faculties.reduce((sum, f) => sum + f.programmes.length, 0)
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">MMU Faculties Overview</h1>
          <p className="text-gray-600 dark:text-gray-400">Six faculties with dynamic data from user registrations and course enrollments</p>
        </div>
        <div className="flex items-center gap-2 px-3 py-1 bg-blue-100 dark:bg-blue-900/30 rounded-full">
          <Building className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <span className="text-sm font-medium text-blue-600 dark:text-blue-400">{faculties.length} Faculties</span>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Faculties</p>
                <p className="text-2xl font-bold text-blue-600">{totalStats.totalFaculties}</p>
              </div>
              <Building className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Students</p>
                <p className="text-2xl font-bold text-green-600">{totalStats.totalStudents}</p>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Lecturers</p>
                <p className="text-2xl font-bold text-purple-600">{totalStats.totalLecturers}</p>
              </div>
              <UserCheck className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Programmes</p>
                <p className="text-2xl font-bold text-orange-600">{totalStats.totalProgrammes}</p>
              </div>
              <BookOpen className="h-8 w-8 text-orange-600" />
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
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search MMU faculties by name, dean, description..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Faculties Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredFaculties.map((faculty) => (
          <Card key={faculty.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${getColorClasses(faculty.color)}`}>
                    {getIconComponent(faculty.icon)}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{faculty.shortName}</CardTitle>
                    <CardDescription className="font-medium">
                      Dean: {faculty.dean || 'TBD'}
                    </CardDescription>
                  </div>
                </div>
                <Badge className={getStatusBadge(faculty.status)}>
                  {faculty.status}
                </Badge>
              </div>
              <div className="mt-3">
                <h3 className="font-semibold text-sm text-gray-900 dark:text-white">{faculty.name}</h3>
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{faculty.description}</p>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="text-center">
                  <div className="font-semibold text-lg text-blue-600">{faculty.totalStudents}</div>
                  <div className="text-muted-foreground">Students</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg text-green-600">{faculty.totalLecturers}</div>
                  <div className="text-muted-foreground">Lecturers</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg text-purple-600">{faculty.programmes.length}</div>
                  <div className="text-muted-foreground">Programmes</div>
                </div>
                <div className="text-center">
                  <div className="font-semibold text-lg text-orange-600">{faculty.departments.length}</div>
                  <div className="text-muted-foreground">Departments</div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Departments:</div>
                <div className="flex flex-wrap gap-1">
                  {faculty.departments.slice(0, 2).map((dept, index) => (
                    <Badge key={index} variant="outline" className="text-xs">
                      {dept.name.replace('Department of ', '')}
                    </Badge>
                  ))}
                  {faculty.departments.length > 2 && (
                    <Badge variant="outline" className="text-xs">
                      +{faculty.departments.length - 2} more
                    </Badge>
                  )}
                </div>
              </div>

              <div className="flex space-x-2 pt-2">
                <Button
                  size="sm"
                  variant="outline"
                  className="flex-1"
                  onClick={() => navigate(`/faculty/${faculty.id}`)}
                >
                  <Eye className="h-4 w-4 mr-2" />
                  View Details
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigate(`/faculty/${faculty.id}`)}
                >
                  <BarChart3 className="h-4 w-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredFaculties.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Building className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No faculties match your search</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria. All 6 MMU faculties are available.
            </p>
          </CardContent>
        </Card>
      )}

      {/* Faculty Information */}
      <Card>
        <CardHeader>
          <CardTitle>MMU Faculty Information</CardTitle>
          <CardDescription>Official faculty data from MMU Kenya with dynamic user statistics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{faculties.length}</div>
              <div className="text-sm text-muted-foreground">Total Faculties</div>
              <div className="text-xs text-muted-foreground mt-1">Official MMU structure</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-green-600">
                {faculties.reduce((sum, f) => sum + f.departments.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Departments</div>
              <div className="text-xs text-muted-foreground mt-1">Across all faculties</div>
            </div>
            <div className="text-center p-4 border rounded-lg">
              <div className="text-2xl font-bold text-purple-600">
                {faculties.reduce((sum, f) => sum + f.programmes.length, 0)}
              </div>
              <div className="text-sm text-muted-foreground">Total Programmes</div>
              <div className="text-xs text-muted-foreground mt-1">Available for enrollment</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Faculties;
