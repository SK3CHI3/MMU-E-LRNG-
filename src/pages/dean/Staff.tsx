import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { 
  Users, 
  Search, 
  Filter, 
  Download, 
  Send, 
  Eye, 
  MessageSquare, 
  BarChart3,
  UserCheck,
  Award,
  BookOpen,
  Plus,
  Mail,
  Phone
} from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabaseClient';
import { useMessageNavigation } from '@/utils/messaging/messagingUtils';

interface FacultyStaff {
  id: string;
  auth_id: string;
  staff_id: string;
  full_name: string;
  email: string;
  phone?: string;
  department: string;
  role: 'lecturer' | 'dean';
  specialization?: string;
  courses_taught: number;
  students_supervised: number;
  research_projects: number;
  status: 'active' | 'inactive' | 'on_leave';
  hire_date: string;
}

const Staff = () => {
  const { dbUser } = useAuth();
  const navigateToMessage = useMessageNavigation();
  const [staff, setStaff] = useState<FacultyStaff[]>([]);
  const [filteredStaff, setFilteredStaff] = useState<FacultyStaff[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedDepartment, setSelectedDepartment] = useState('all');
  const [selectedRole, setSelectedRole] = useState('all');
  const [stats, setStats] = useState({
    totalStaff: 0,
    activeLecturers: 0,
    totalCourses: 0,
    averageStudentsPerLecturer: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStaffData = async () => {
      if (!dbUser?.faculty) return;
      
      try {
        setLoading(true);
        
        // Fetch faculty staff
        const { data: staffData, error: staffError } = await supabase
          .from('users')
          .select('*')
          .eq('faculty', dbUser.faculty)
          .in('role', ['lecturer', 'dean'])
          .order('full_name');

        if (staffError) throw staffError;

        // Get course counts for each lecturer
        const staffWithCourses = await Promise.all(
          (staffData || []).map(async (member) => {
            const { data: courses } = await supabase
              .from('courses')
              .select('id')
              .eq('created_by', member.auth_id);

            const { data: enrollments } = await supabase
              .from('course_enrollments')
              .select('user_id')
              .in('course_id', courses?.map(c => c.id) || []);

            return {
              id: member.id,
              auth_id: member.auth_id,
              staff_id: member.staff_id || `STAFF-${member.id.slice(0, 8)}`,
              full_name: member.full_name,
              email: member.email,
              phone: member.phone,
              department: member.department || 'General',
              role: member.role as 'lecturer' | 'dean',
              specialization: 'Computer Science', // This would come from a profile table
              courses_taught: courses?.length || 0,
              students_supervised: enrollments?.length || 0,
              research_projects: Math.floor(Math.random() * 5), // This would come from research table
              status: 'active' as const,
              hire_date: member.created_at
            };
          })
        );
        
        setStaff(staffWithCourses);
        setFilteredStaff(staffWithCourses);
        
        // Calculate stats
        const totalCourses = staffWithCourses.reduce((sum, s) => sum + s.courses_taught, 0);
        const totalStudents = staffWithCourses.reduce((sum, s) => sum + s.students_supervised, 0);
        
        setStats({
          totalStaff: staffWithCourses.length,
          activeLecturers: staffWithCourses.filter(s => s.role === 'lecturer').length,
          totalCourses,
          averageStudentsPerLecturer: staffWithCourses.length > 0 ? Math.round(totalStudents / staffWithCourses.length) : 0
        });
      } catch (error) {
        console.error('Error fetching staff data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStaffData();
  }, [dbUser?.faculty]);

  useEffect(() => {
    let filtered = staff;

    if (searchTerm) {
      filtered = filtered.filter(member =>
        member.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.staff_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        member.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedDepartment !== 'all') {
      filtered = filtered.filter(member => member.department === selectedDepartment);
    }

    if (selectedRole !== 'all') {
      filtered = filtered.filter(member => member.role === selectedRole);
    }

    setFilteredStaff(filtered);
  }, [staff, searchTerm, selectedDepartment, selectedRole]);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400';
      case 'on_leave':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'dean':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'lecturer':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400';
    }
  };

  const uniqueDepartments = [...new Set(staff.map(s => s.department))];

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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Faculty Staff</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage staff members in {dbUser?.faculty}</p>
        </div>
        <div className="flex space-x-2">
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export Data
          </Button>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Staff Member
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Staff</p>
                <p className="text-2xl font-bold text-blue-600">{stats.totalStaff}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Lecturers</p>
                <p className="text-2xl font-bold text-green-600">{stats.activeLecturers}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Courses Taught</p>
                <p className="text-2xl font-bold text-purple-600">{stats.totalCourses}</p>
              </div>
              <BookOpen className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Avg Students/Lecturer</p>
                <p className="text-2xl font-bold text-orange-600">{stats.averageStudentsPerLecturer}</p>
              </div>
              <Award className="h-8 w-8 text-orange-600" />
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
                  placeholder="Search staff by name, ID, or email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Filter by department" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Departments</SelectItem>
                {uniqueDepartments.map(dept => (
                  <SelectItem key={dept} value={dept}>{dept}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger className="w-[150px]">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="lecturer">Lecturers</SelectItem>
                <SelectItem value="dean">Deans</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Staff List */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {filteredStaff.map((member) => (
          <Card key={member.id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <Avatar>
                    <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${member.full_name}`} />
                    <AvatarFallback>
                      {member.full_name.split(' ').map(n => n[0]).join('')}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <CardTitle className="text-lg">{member.full_name}</CardTitle>
                    <CardDescription className="font-medium">{member.staff_id}</CardDescription>
                  </div>
                </div>
                <div className="flex flex-col space-y-2">
                  <Badge className={getRoleBadge(member.role)}>
                    {member.role}
                  </Badge>
                  <Badge className={getStatusBadge(member.status)}>
                    {member.status}
                  </Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Department:</span>
                  <p className="font-medium">{member.department}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Specialization:</span>
                  <p className="font-medium">{member.specialization}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Courses:</span>
                  <p className="font-medium">{member.courses_taught}</p>
                </div>
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Students:</span>
                  <p className="font-medium">{member.students_supervised}</p>
                </div>
              </div>

              <div className="flex items-center space-x-4 text-sm text-gray-600 dark:text-gray-400">
                <div className="flex items-center space-x-1">
                  <Mail className="h-4 w-4" />
                  <span className="truncate">{member.email}</span>
                </div>
                {member.phone && (
                  <div className="flex items-center space-x-1">
                    <Phone className="h-4 w-4" />
                    <span>{member.phone}</span>
                  </div>
                )}
              </div>

              <div className="flex space-x-2 pt-2">
                <Button size="sm" variant="outline">
                  <Eye className="h-4 w-4 mr-2" />
                  View Profile
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => navigateToMessage(member.auth_id)}
                >
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Message
                </Button>
                <Button size="sm" variant="outline">
                  <BarChart3 className="h-4 w-4 mr-2" />
                  Performance
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredStaff.length === 0 && (
        <Card>
          <CardContent className="p-12 text-center">
            <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No staff found</h3>
            <p className="text-gray-600 dark:text-gray-400">
              Try adjusting your search criteria or filters.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default Staff;
