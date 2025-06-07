import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';
import {
  Users,
  UserPlus,
  UserCheck,
  UserX,
  Search,
  Filter,
  Download,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  Mail,
  Phone,
  Calendar,
  MapPin,
  GraduationCap,
  Briefcase,
  Shield,
  Settings,
  AlertTriangle,
  Loader2
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Skeleton } from '@/components/ui/skeleton';
import { mmuFaculties } from '@/data/mmuData';
import {
  deleteUserCompletely,
  deleteUserCompletelyServer,
  deleteUserDirect,
  checkRemainingReferences,
  forceCleanupReferences,
  testAuthDeletion,
  deactivateUser,
  reactivateUser,
  bulkDeleteUsers,
  bulkDeactivateUsers,
  getUserDeletionInfo,
  logAdminAction,
  checkUserExists
} from '@/services/adminService';
import { useAuth } from '@/contexts/AuthContext';

interface User {
  id: string;
  email: string;
  full_name: string;
  role: 'student' | 'lecturer' | 'dean' | 'admin';
  faculty?: string;
  department?: string;
  admission_number?: string;
  phone?: string;
  created_at: string;
  last_login?: string;
  status: 'active' | 'inactive' | 'suspended';
  email_verified: boolean;
}

const UserManagement = () => {
  const { dbUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedRole, setSelectedRole] = useState('all');
  const [selectedFaculty, setSelectedFaculty] = useState('all');
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedTab, setSelectedTab] = useState('all');

  // Deletion state
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null);
  const [deletionInfo, setDeletionInfo] = useState<any>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState(false);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
  const [bulkActionLoading, setBulkActionLoading] = useState(false);
  const [showDebugPanel, setShowDebugPanel] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, selectedRole, selectedFaculty, selectedStatus, selectedTab]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      console.log('Fetching users from database...');

      const { data: usersData, error } = await supabase
        .from('users')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching users:', error);
        toast({
          title: "Error",
          description: "Failed to fetch users from database.",
          variant: "destructive"
        });
        throw error;
      }

      console.log(`Fetched ${usersData?.length || 0} users from database`);

      // Transform data to match our interface
      const transformedUsers: User[] = (usersData || []).map(user => ({
        id: user.id,
        email: user.email,
        full_name: user.full_name || user.email.split('@')[0],
        role: user.role,
        faculty: user.faculty,
        department: user.department,
        admission_number: user.admission_number,
        phone: user.phone,
        created_at: user.created_at,
        last_login: user.last_login,
        status: user.status || 'active',
        email_verified: user.email_verified || false
      }));

      setUsers(transformedUsers);

      // Clear any selected users after refresh
      setSelectedUsers([]);

    } catch (error) {
      console.error('Error in fetchUsers:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching users.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    // Filter by tab
    if (selectedTab !== 'all') {
      filtered = filtered.filter(user => user.role === selectedTab);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (user.admission_number && user.admission_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (user.department && user.department.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Filter by role
    if (selectedRole !== 'all') {
      filtered = filtered.filter(user => user.role === selectedRole);
    }

    // Filter by faculty
    if (selectedFaculty !== 'all') {
      filtered = filtered.filter(user => user.faculty === selectedFaculty);
    }

    // Filter by status
    if (selectedStatus !== 'all') {
      filtered = filtered.filter(user => user.status === selectedStatus);
    }

    setFilteredUsers(filtered);
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'student': return <GraduationCap className="h-4 w-4 text-blue-600" />;
      case 'lecturer': return <Briefcase className="h-4 w-4 text-green-600" />;
      case 'dean': return <Shield className="h-4 w-4 text-purple-600" />;
      case 'admin': return <Settings className="h-4 w-4 text-red-600" />;
      default: return <Users className="h-4 w-4 text-gray-600" />;
    }
  };

  const getRoleBadge = (role: string) => {
    const variants = {
      student: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400',
      lecturer: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      dean: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400',
      admin: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return variants[role as keyof typeof variants] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBadge = (status: string) => {
    const variants = {
      active: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400',
      inactive: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
      suspended: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400'
    };
    return variants[status as keyof typeof variants] || variants.active;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      relative: getTimeAgo(date)
    };
  };

  const getTimeAgo = (date: Date): string => {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));

    if (diffInMinutes < 1) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;

    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  };

  const exportUsers = () => {
    const csvContent = [
      ['Name', 'Email', 'Role', 'Faculty', 'Department', 'Admission Number', 'Status', 'Created At'].join(','),
      ...filteredUsers.map(user => [
        `"${user.full_name}"`,
        user.email,
        user.role,
        user.faculty || '',
        user.department || '',
        user.admission_number || '',
        user.status,
        user.created_at
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `users-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getUserStats = () => {
    return {
      total: users.length,
      students: users.filter(u => u.role === 'student').length,
      lecturers: users.filter(u => u.role === 'lecturer').length,
      deans: users.filter(u => u.role === 'dean').length,
      admins: users.filter(u => u.role === 'admin').length,
      active: users.filter(u => u.status === 'active').length,
      inactive: users.filter(u => u.status === 'inactive').length,
      suspended: users.filter(u => u.status === 'suspended').length,
      verified: users.filter(u => u.email_verified).length
    };
  };

  const stats = getUserStats();

  // Deletion functions
  const handleDeleteUser = async (userId: string) => {
    // Prevent self-deletion
    if (dbUser?.id === userId) {
      toast({
        title: "Cannot Delete",
        description: "You cannot delete your own account.",
        variant: "destructive"
      });
      return;
    }

    try {
      setDeleteLoading(true);
      const info = await getUserDeletionInfo(userId);
      if (info) {
        setDeletionInfo(info);
        setDeletingUserId(userId);
        setShowDeleteDialog(true);
      } else {
        toast({
          title: "Error",
          description: "Could not load user information for deletion.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error preparing user deletion:', error);
      toast({
        title: "Error",
        description: "Failed to prepare user deletion.",
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(false);
    }
  };

  const confirmDeleteUser = async () => {
    if (!deletingUserId || !dbUser) return;

    try {
      setDeleteLoading(true);
      console.log('Starting user deletion for ID:', deletingUserId);

      // Use server-side deletion to bypass RLS issues
      const result = await deleteUserCompletelyServer(deletingUserId);
      console.log('Server-side deletion result:', result);

      if (result.success) {
        // Log the admin action
        await logAdminAction(
          dbUser.auth_id,
          'delete_user',
          deletingUserId,
          { user_email: deletionInfo?.user?.email }
        );

        toast({
          title: "User Deleted",
          description: "User has been permanently deleted from the system.",
        });

        // Verify deletion and refresh users list
        console.log('Verifying user deletion...');
        setTimeout(async () => {
          const userStillExists = await checkUserExists(deletingUserId);
          console.log('User still exists after deletion:', userStillExists);

          if (userStillExists) {
            console.warn('User still exists in database after deletion!');
            toast({
              title: "Warning",
              description: "User may not have been completely deleted. Please refresh and check.",
              variant: "destructive"
            });
          }

          await fetchUsers();
          console.log('User list refreshed');
        }, 1000);

      } else {
        console.error('Deletion failed:', result.error);
        toast({
          title: "Deletion Failed",
          description: result.error || "Failed to delete user.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deleting user:', error);
      toast({
        title: "Error",
        description: "An unexpected error occurred while deleting the user.",
        variant: "destructive"
      });
    } finally {
      setDeleteLoading(false);
      setShowDeleteDialog(false);
      setDeletingUserId(null);
      setDeletionInfo(null);
    }
  };

  const handleDeactivateUser = async (userId: string) => {
    if (!dbUser) return;

    try {
      const result = await deactivateUser(userId);

      if (result.success) {
        await logAdminAction(dbUser.auth_id, 'deactivate_user', userId);
        toast({
          title: "User Deactivated",
          description: "User has been deactivated and cannot log in.",
        });
        await fetchUsers();
      } else {
        toast({
          title: "Deactivation Failed",
          description: result.error || "Failed to deactivate user.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error deactivating user:', error);
      toast({
        title: "Error",
        description: "Failed to deactivate user.",
        variant: "destructive"
      });
    }
  };

  const handleReactivateUser = async (userId: string) => {
    if (!dbUser) return;

    try {
      const result = await reactivateUser(userId);

      if (result.success) {
        await logAdminAction(dbUser.auth_id, 'reactivate_user', userId);
        toast({
          title: "User Reactivated",
          description: "User has been reactivated and can now log in.",
        });
        await fetchUsers();
      } else {
        toast({
          title: "Reactivation Failed",
          description: result.error || "Failed to reactivate user.",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Error reactivating user:', error);
      toast({
        title: "Error",
        description: "Failed to reactivate user.",
        variant: "destructive"
      });
    }
  };

  const handleBulkDelete = async () => {
    if (!dbUser || selectedUsers.length === 0) return;

    // Check if trying to delete self
    if (selectedUsers.includes(dbUser.id)) {
      toast({
        title: "Cannot Delete",
        description: "You cannot delete your own account.",
        variant: "destructive"
      });
      return;
    }

    try {
      setBulkActionLoading(true);
      const result = await bulkDeleteUsers(selectedUsers);

      await logAdminAction(
        dbUser.auth_id,
        'bulk_delete_users',
        undefined,
        { user_count: selectedUsers.length, results: result.summary }
      );

      toast({
        title: "Bulk Deletion Complete",
        description: `${result.summary.successful} users deleted successfully. ${result.summary.failed} failed.`,
        variant: result.summary.failed > 0 ? "destructive" : "default"
      });

      setSelectedUsers([]);
      await fetchUsers();
    } catch (error) {
      console.error('Error in bulk delete:', error);
      toast({
        title: "Error",
        description: "Failed to perform bulk deletion.",
        variant: "destructive"
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  const handleBulkDeactivate = async () => {
    if (!dbUser || selectedUsers.length === 0) return;

    try {
      setBulkActionLoading(true);
      const result = await bulkDeactivateUsers(selectedUsers);

      await logAdminAction(
        dbUser.auth_id,
        'bulk_deactivate_users',
        undefined,
        { user_count: selectedUsers.length, results: result.summary }
      );

      toast({
        title: "Bulk Deactivation Complete",
        description: `${result.summary.successful} users deactivated successfully. ${result.summary.failed} failed.`,
        variant: result.summary.failed > 0 ? "destructive" : "default"
      });

      setSelectedUsers([]);
      await fetchUsers();
    } catch (error) {
      console.error('Error in bulk deactivate:', error);
      toast({
        title: "Error",
        description: "Failed to perform bulk deactivation.",
        variant: "destructive"
      });
    } finally {
      setBulkActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">User Management</h1>
          <p className="text-gray-600 dark:text-gray-400">Comprehensive user administration and management</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Bulk Actions */}
          {selectedUsers.length > 0 && (
            <>
              <Button
                variant="outline"
                onClick={handleBulkDeactivate}
                disabled={bulkActionLoading}
                className="text-orange-600 hover:text-orange-700"
              >
                {bulkActionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <UserX className="h-4 w-4 mr-2" />
                )}
                Deactivate ({selectedUsers.length})
              </Button>
              <Button
                variant="outline"
                onClick={handleBulkDelete}
                disabled={bulkActionLoading}
                className="text-red-600 hover:text-red-700"
              >
                {bulkActionLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4 mr-2" />
                )}
                Delete ({selectedUsers.length})
              </Button>
            </>
          )}

          <Button variant="outline" onClick={exportUsers}>
            <Download className="h-4 w-4 mr-2" />
            Export Users
          </Button>
          <Button
            onClick={fetchUsers}
            disabled={loading}
            variant="outline"
          >
            {loading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="h-4 w-4 mr-2" />
            )}
            Refresh ({users.length})
          </Button>

          {/* Debug Panel Toggle */}
          <Button
            onClick={() => setShowDebugPanel(!showDebugPanel)}
            variant="outline"
            size="sm"
            className="text-xs"
          >
            🔧 Debug
          </Button>
          <Dialog>
            <DialogTrigger asChild>
              <Button>
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New User</DialogTitle>
                <DialogDescription>Create a new user account in the system</DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <Input placeholder="Full Name" />
                <Input placeholder="Email Address" type="email" />
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="student">Student</SelectItem>
                    <SelectItem value="lecturer">Lecturer</SelectItem>
                    <SelectItem value="dean">Dean</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
                <Select>
                  <SelectTrigger>
                    <SelectValue placeholder="Select Faculty" />
                  </SelectTrigger>
                  <SelectContent>
                    {mmuFaculties.map(faculty => (
                      <SelectItem key={faculty.id} value={faculty.name}>
                        {faculty.shortName} - {faculty.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline">Cancel</Button>
                  <Button>Create User</Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* User Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Users</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <Users className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Students</p>
                <p className="text-2xl font-bold text-blue-600">{stats.students}</p>
              </div>
              <GraduationCap className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Lecturers</p>
                <p className="text-2xl font-bold text-green-600">{stats.lecturers}</p>
              </div>
              <Briefcase className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Users</p>
                <p className="text-2xl font-bold text-green-600">{stats.active}</p>
              </div>
              <UserCheck className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters & Search
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search users..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={selectedRole} onValueChange={setSelectedRole}>
              <SelectTrigger>
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="student">Students</SelectItem>
                <SelectItem value="lecturer">Lecturers</SelectItem>
                <SelectItem value="dean">Deans</SelectItem>
                <SelectItem value="admin">Admins</SelectItem>
              </SelectContent>
            </Select>
            <Select value={selectedFaculty} onValueChange={setSelectedFaculty}>
              <SelectTrigger>
                <SelectValue placeholder="Faculty" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Faculties</SelectItem>
                {mmuFaculties.map(faculty => (
                  <SelectItem key={faculty.id} value={faculty.name}>
                    {faculty.shortName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="inactive">Inactive</SelectItem>
                <SelectItem value="suspended">Suspended</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" onClick={() => {
              setSearchTerm('');
              setSelectedRole('all');
              setSelectedFaculty('all');
              setSelectedStatus('all');
            }}>
              Clear Filters
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Users Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All Users</TabsTrigger>
          <TabsTrigger value="student">Students</TabsTrigger>
          <TabsTrigger value="lecturer">Lecturers</TabsTrigger>
          <TabsTrigger value="dean">Deans</TabsTrigger>
          <TabsTrigger value="admin">Admins</TabsTrigger>
        </TabsList>

        <TabsContent value={selectedTab} className="mt-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>
                    {selectedTab === 'all' ? 'All Users' :
                     selectedTab === 'student' ? 'Students' :
                     selectedTab === 'lecturer' ? 'Lecturers' :
                     selectedTab === 'dean' ? 'Deans' : 'Administrators'}
                    ({filteredUsers.length} users)
                  </CardTitle>
                  <CardDescription>
                    Manage user accounts, roles, and permissions • Last updated: {new Date().toLocaleTimeString()}
                  </CardDescription>
                </div>

                {filteredUsers.length > 0 && (
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={selectedUsers.length === filteredUsers.filter(u => dbUser?.id !== u.id).length && filteredUsers.filter(u => dbUser?.id !== u.id).length > 0}
                      onCheckedChange={(checked) => {
                        if (checked) {
                          // Select all users except self
                          const selectableUsers = filteredUsers.filter(u => dbUser?.id !== u.id).map(u => u.id);
                          setSelectedUsers(selectableUsers);
                        } else {
                          setSelectedUsers([]);
                        }
                      }}
                    />
                    <span className="text-sm text-muted-foreground">
                      Select All ({filteredUsers.filter(u => dbUser?.id !== u.id).length})
                    </span>
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="flex items-center space-x-4 p-4 border rounded-lg">
                      <Skeleton className="h-12 w-12 rounded-full" />
                      <div className="flex-1 space-y-2">
                        <Skeleton className="h-4 w-full" />
                        <Skeleton className="h-3 w-3/4" />
                        <Skeleton className="h-3 w-1/2" />
                      </div>
                      <div className="space-x-2">
                        <Skeleton className="h-8 w-16 inline-block" />
                        <Skeleton className="h-8 w-16 inline-block" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredUsers.length > 0 ? (
                <div className="space-y-4">
                  {filteredUsers.map((user) => {
                    const createdAt = formatDate(user.created_at);
                    const isSelected = selectedUsers.includes(user.id);
                    const isSelf = dbUser?.id === user.id;

                    return (
                      <div key={user.id} className="flex items-center space-x-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                        <Checkbox
                          checked={isSelected}
                          onCheckedChange={(checked) => {
                            if (checked) {
                              setSelectedUsers(prev => [...prev, user.id]);
                            } else {
                              setSelectedUsers(prev => prev.filter(id => id !== user.id));
                            }
                          }}
                          disabled={isSelf}
                          title={isSelf ? "Cannot select your own account" : "Select user"}
                        />
                        <div className="flex items-center justify-center w-12 h-12 rounded-full bg-muted">
                          {getRoleIcon(user.role)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-sm">{user.full_name}</h4>
                              <Badge className={getRoleBadge(user.role)}>
                                <span className="capitalize">{user.role}</span>
                              </Badge>
                              <Badge className={getStatusBadge(user.status)}>
                                <span className="capitalize">{user.status}</span>
                              </Badge>
                              {user.email_verified && (
                                <Badge variant="outline" className="text-green-600">
                                  <UserCheck className="h-3 w-3 mr-1" />
                                  Verified
                                </Badge>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground">
                              {createdAt.relative}
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {user.email}
                              </span>
                              {user.admission_number && (
                                <span>ID: {user.admission_number}</span>
                              )}
                              {user.faculty && (
                                <span>Faculty: {user.faculty}</span>
                              )}
                            </div>
                            {user.department && (
                              <div className="text-sm text-muted-foreground">
                                Department: {user.department}
                              </div>
                            )}
                            <div className="flex items-center gap-4 text-xs text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3" />
                                Joined: {createdAt.date}
                              </span>
                              {user.last_login && (
                                <span>Last login: {formatDate(user.last_login).relative}</span>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button size="sm" variant="outline" title="View Details">
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Button size="sm" variant="outline" title="Edit User">
                            <Edit className="h-4 w-4" />
                          </Button>

                          {/* Status toggle button */}
                          {user.status === 'active' ? (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-orange-600 hover:text-orange-700"
                              onClick={() => handleDeactivateUser(user.id)}
                              title="Deactivate User"
                            >
                              <UserX className="h-4 w-4" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-green-600 hover:text-green-700"
                              onClick={() => handleReactivateUser(user.id)}
                              title="Reactivate User"
                            >
                              <UserCheck className="h-4 w-4" />
                            </Button>
                          )}

                          {/* Delete button */}
                          <Button
                            size="sm"
                            variant="outline"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => handleDeleteUser(user.id)}
                            disabled={deleteLoading && deletingUserId === user.id}
                            title="Delete User Permanently"
                          >
                            {deleteLoading && deletingUserId === user.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-12">
                  <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">No users found</h3>
                  <p className="text-gray-600 dark:text-gray-400">
                    Try adjusting your filters or search criteria.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-600" />
              Confirm User Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                You are about to permanently delete <strong>{deletionInfo?.user?.full_name}</strong> ({deletionInfo?.user?.email}).
              </p>
              <p className="text-red-600 font-medium">
                This action cannot be undone. All user data will be permanently removed.
              </p>

              {deletionInfo?.relatedData && (
                <div className="bg-muted p-3 rounded-lg space-y-2">
                  <p className="font-medium">Related data that will be deleted:</p>
                  <ul className="text-sm space-y-1">
                    {deletionInfo.relatedData.enrollments > 0 && (
                      <li>• {deletionInfo.relatedData.enrollments} course enrollments</li>
                    )}
                    {deletionInfo.relatedData.submissions > 0 && (
                      <li>• {deletionInfo.relatedData.submissions} assignment submissions</li>
                    )}
                    {deletionInfo.relatedData.createdCourses > 0 && (
                      <li>• {deletionInfo.relatedData.createdCourses} created courses (will be orphaned)</li>
                    )}
                    {deletionInfo.relatedData.createdAssignments > 0 && (
                      <li>• {deletionInfo.relatedData.createdAssignments} created assignments (will be orphaned)</li>
                    )}
                    {deletionInfo.relatedData.messages > 0 && (
                      <li>• {deletionInfo.relatedData.messages} messages</li>
                    )}
                  </ul>
                </div>
              )}

              <p>
                Type <strong>DELETE</strong> to confirm this action.
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4">
            <Input
              placeholder="Type DELETE to confirm"
              onChange={(e) => {
                // You can add confirmation text validation here
              }}
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleteLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteUser}
              disabled={deleteLoading}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleteLoading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete User
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Debug Panel */}
      {showDebugPanel && (
        <Card className="mt-4 border-yellow-200 bg-yellow-50">
          <CardHeader>
            <CardTitle className="text-sm flex items-center gap-2">
              🔧 Debug Panel
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setShowDebugPanel(false)}
                className="ml-auto"
              >
                ✕
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="text-sm">
              <p><strong>Total Users:</strong> {users.length}</p>
              <p><strong>Filtered Users:</strong> {filteredUsers.length}</p>
              <p><strong>Selected Users:</strong> {selectedUsers.length}</p>
            </div>

            <div className="space-y-2">
              <p className="text-sm font-medium">Debug Functions (check browser console):</p>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    console.log('Current users:', users);
                    console.log('Filtered users:', filteredUsers);
                  }}
                >
                  Log Users
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    console.log('Debug functions available:', window.debugUserDeletion);
                    console.log('Example: await window.debugUserDeletion.checkUserExists("user-id")');
                  }}
                >
                  Show Debug Help
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={async () => {
                    console.log('Force refreshing user list...');
                    await fetchUsers();
                  }}
                >
                  Force Refresh
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    const userIds = filteredUsers.slice(0, 5).map(u => u.id);
                    console.log('Sample user IDs for testing:', userIds);
                  }}
                >
                  Get Sample IDs
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-red-600"
                  onClick={async () => {
                    const userId = prompt('Enter user ID for direct deletion test:');
                    if (userId) {
                      console.log('Testing direct deletion...');
                      const result = await deleteUserDirect(userId);
                      console.log('Direct deletion result:', result);
                      if (result.success) {
                        await fetchUsers();
                        toast({
                          title: "Direct Deletion",
                          description: "User deleted directly. Check console for details.",
                        });
                      } else {
                        toast({
                          title: "Direct Deletion Failed",
                          description: result.error,
                          variant: "destructive"
                        });
                      }
                    }
                  }}
                >
                  Test Direct Delete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-orange-600"
                  onClick={async () => {
                    const authId = prompt('Enter auth_id to check remaining references:');
                    if (authId) {
                      console.log('Checking remaining references...');
                      const refs = await checkRemainingReferences(authId);
                      console.log('Remaining references:', refs);
                      toast({
                        title: "Reference Check",
                        description: "Check console for remaining references.",
                      });
                    }
                  }}
                >
                  Check References
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-purple-600"
                  onClick={async () => {
                    const authId = prompt('Enter auth_id to force cleanup:');
                    if (authId) {
                      console.log('Force cleaning up references...');
                      const result = await forceCleanupReferences(authId);
                      console.log('Force cleanup result:', result);
                      await fetchUsers();
                      toast({
                        title: "Force Cleanup",
                        description: "Check console for cleanup results.",
                      });
                    }
                  }}
                >
                  Force Cleanup
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-blue-600"
                  onClick={async () => {
                    const authId = prompt('Enter auth_id to test Edge Function deletion:');
                    if (authId) {
                      console.log('Testing Edge Function auth deletion...');
                      const result = await testAuthDeletion(authId);
                      console.log('Edge Function test result:', result);
                      toast({
                        title: "Edge Function Test",
                        description: result.success ? "Auth deletion successful!" : `Failed: ${result.error}`,
                        variant: result.success ? "default" : "destructive"
                      });
                    }
                  }}
                >
                  Test Auth Delete
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="text-green-600"
                  onClick={async () => {
                    const userId = prompt('Enter user ID for server-side deletion:');
                    if (userId) {
                      console.log('Testing server-side deletion...');
                      const result = await deleteUserCompletelyServer(userId);
                      console.log('Server-side deletion result:', result);
                      if (result.success) {
                        await fetchUsers();
                        toast({
                          title: "Server-Side Deletion",
                          description: "User deleted successfully via server!",
                        });
                      } else {
                        toast({
                          title: "Server-Side Deletion Failed",
                          description: result.error,
                          variant: "destructive"
                        });
                      }
                    }
                  }}
                >
                  Test Server Delete
                </Button>
              </div>
            </div>

            <div className="text-xs text-gray-600 bg-gray-100 p-2 rounded">
              <p><strong>How to test deletion:</strong></p>
              <p>1. Open browser console (F12)</p>
              <p>2. Get a user ID from the list above</p>
              <p>3. Run: <code>await window.debugUserDeletion.testUserDeletion("user-id")</code></p>
              <p>4. Watch the console for detailed logs</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default UserManagement;
