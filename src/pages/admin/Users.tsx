import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { UserCog, Users, Search, Plus, Edit, Trash2, Shield, Mail, Phone } from 'lucide-react';

const AdminUsers = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const users = [
    {
      id: 1,
      name: 'Dr. Sarah Johnson',
      email: 'sarah.johnson@mmu.ac.ke',
      role: 'lecturer',
      department: 'Computer Science',
      faculty: 'Computing and IT',
      status: 'active',
      lastLogin: '2024-01-15 09:30',
      joinDate: '2020-08-15',
      phone: '+254 700 123 456'
    },
    {
      id: 2,
      name: 'John Doe',
      email: 'john.doe@student.mmu.ac.ke',
      role: 'student',
      department: 'Computer Science',
      faculty: 'Computing and IT',
      status: 'active',
      lastLogin: '2024-01-15 14:20',
      joinDate: '2022-09-01',
      studentId: 'MCS-234-178/2024'
    },
    {
      id: 3,
      name: 'Dr. Jane Smith',
      email: 'jane.smith@mmu.ac.ke',
      role: 'dean',
      department: 'Computer Science',
      faculty: 'Computing and IT',
      status: 'active',
      lastLogin: '2024-01-15 08:45',
      joinDate: '2018-01-10',
      phone: '+254 700 987 654'
    },
    {
      id: 4,
      name: 'Prof. Michael Chen',
      email: 'michael.chen@mmu.ac.ke',
      role: 'lecturer',
      department: 'Information Technology',
      faculty: 'Computing and IT',
      status: 'active',
      lastLogin: '2024-01-14 16:30',
      joinDate: '2019-03-20',
      phone: '+254 700 555 123'
    },
    {
      id: 5,
      name: 'System Administrator',
      email: 'admin@mmu.ac.ke',
      role: 'admin',
      department: 'IT Services',
      faculty: 'Administration',
      status: 'active',
      lastLogin: '2024-01-15 07:00',
      joinDate: '2015-06-01',
      phone: '+254 700 000 001'
    },
    {
      id: 6,
      name: 'Mary Wilson',
      email: 'mary.wilson@student.mmu.ac.ke',
      role: 'student',
      department: 'Software Engineering',
      faculty: 'Computing and IT',
      status: 'inactive',
      lastLogin: '2024-01-10 12:15',
      joinDate: '2021-09-01',
      studentId: 'MSE-156-089/2023'
    }
  ];

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'student':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'lecturer':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'dean':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'admin':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusColor = (status: string) => {
    return status === 'active' 
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         user.department.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    return matchesSearch && user.role === activeTab;
  });

  const userStats = {
    total: users.length,
    students: users.filter(u => u.role === 'student').length,
    lecturers: users.filter(u => u.role === 'lecturer').length,
    deans: users.filter(u => u.role === 'dean').length,
    admins: users.filter(u => u.role === 'admin').length,
    active: users.filter(u => u.status === 'active').length
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all system users and their permissions</p>
        </div>
        <Button className="bg-red-600 hover:bg-red-700">
          <Plus className="h-4 w-4 mr-2" />
          Add New User
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Users</p>
                <p className="text-2xl font-bold text-red-600">{userStats.total}</p>
              </div>
              <Users className="h-6 w-6 text-red-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Students</p>
                <p className="text-2xl font-bold text-blue-600">{userStats.students}</p>
              </div>
              <Users className="h-6 w-6 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Lecturers</p>
                <p className="text-2xl font-bold text-green-600">{userStats.lecturers}</p>
              </div>
              <Users className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Deans</p>
                <p className="text-2xl font-bold text-purple-600">{userStats.deans}</p>
              </div>
              <Users className="h-6 w-6 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Admins</p>
                <p className="text-2xl font-bold text-orange-600">{userStats.admins}</p>
              </div>
              <Shield className="h-6 w-6 text-orange-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active</p>
                <p className="text-2xl font-bold text-green-600">{userStats.active}</p>
              </div>
              <UserCog className="h-6 w-6 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            placeholder="Search users by name, email, or department..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Users Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="student">Students</TabsTrigger>
          <TabsTrigger value="lecturer">Lecturers</TabsTrigger>
          <TabsTrigger value="dean">Deans</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="space-y-4">
          <div className="grid grid-cols-1 gap-4">
            {filteredUsers.map((user) => (
              <Card key={user.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-start space-x-4">
                      <div className="w-12 h-12 bg-gray-200 dark:bg-gray-700 rounded-full flex items-center justify-center">
                        <Users className="h-6 w-6 text-gray-600 dark:text-gray-300" />
                      </div>
                      <div className="space-y-1">
                        <h3 className="font-semibold text-lg text-gray-900 dark:text-white">{user.name}</h3>
                        <div className="flex items-center space-x-2">
                          <Badge className={getRoleColor(user.role)}>
                            {user.role}
                          </Badge>
                          <Badge className={getStatusColor(user.status)}>
                            {user.status}
                          </Badge>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center space-x-1">
                            <Mail className="h-4 w-4" />
                            <span>{user.email}</span>
                          </div>
                          {user.phone && (
                            <div className="flex items-center space-x-1">
                              <Phone className="h-4 w-4" />
                              <span>{user.phone}</span>
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Department:</span> {user.department}
                          </div>
                          <div>
                            <span className="font-medium">Faculty:</span> {user.faculty}
                          </div>
                          {user.studentId && (
                            <div>
                              <span className="font-medium">Student ID:</span> {user.studentId}
                            </div>
                          )}
                          <div>
                            <span className="font-medium">Last Login:</span> {user.lastLogin}
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button size="sm" variant="outline">
                        <Edit className="h-4 w-4 mr-2" />
                        Edit
                      </Button>
                      <Button size="sm" variant="outline">
                        <Shield className="h-4 w-4 mr-2" />
                        Permissions
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminUsers;
