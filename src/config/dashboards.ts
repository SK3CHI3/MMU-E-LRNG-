import { DashboardConfig, UserRole } from '@/types/auth';

// Dashboard configurations for each role
export const dashboardConfigs: Record<UserRole, DashboardConfig> = {
  student: {
    title: 'Student Dashboard',
    theme: {
      primary: '#2563eb', // Blue
      secondary: '#3b82f6',
      accent: '#ef4444'
    },
    navigation: [
      {
        label: 'Overview',
        path: '/dashboard/student',
        icon: 'Home',
        roles: ['student']
      },
      {
        label: 'My Courses',
        path: '/dashboard/student/courses',
        icon: 'Book',
        roles: ['student']
      },
      {
        label: 'Assignments',
        path: '/dashboard/student/assignments',
        icon: 'FileText',
        roles: ['student']
      },
      {
        label: 'Grades',
        path: '/dashboard/student/grades',
        icon: 'Award',
        roles: ['student']
      },
      {
        label: 'Schedule',
        path: '/dashboard/student/schedule',
        icon: 'Calendar',
        roles: ['student']
      },
      {
        label: 'Resources',
        path: '/dashboard/student/resources',
        icon: 'Library',
        roles: ['student']
      }
    ],
    widgets: [
      {
        id: 'enrolled-courses',
        title: 'My Courses',
        component: 'StudentCoursesWidget',
        size: 'large',
        roles: ['student']
      },
      {
        id: 'upcoming-assignments',
        title: 'Upcoming Assignments',
        component: 'UpcomingAssignmentsWidget',
        size: 'medium',
        roles: ['student']
      },
      {
        id: 'recent-grades',
        title: 'Recent Grades',
        component: 'RecentGradesWidget',
        size: 'medium',
        roles: ['student']
      },
      {
        id: 'class-schedule',
        title: 'Today\'s Schedule',
        component: 'ClassScheduleWidget',
        size: 'medium',
        roles: ['student']
      }
    ]
  },

  lecturer: {
    title: 'Lecturer Dashboard',
    theme: {
      primary: '#059669', // Green
      secondary: '#10b981',
      accent: '#ef4444'
    },
    navigation: [
      {
        label: 'Overview',
        path: '/dashboard/lecturer',
        icon: 'Home',
        roles: ['lecturer']
      },
      {
        label: 'My Courses',
        path: '/dashboard/lecturer/courses',
        icon: 'Book',
        roles: ['lecturer']
      },
      {
        label: 'Students',
        path: '/dashboard/lecturer/students',
        icon: 'Users',
        roles: ['lecturer']
      },
      {
        label: 'Grading',
        path: '/dashboard/lecturer/grading',
        icon: 'CheckSquare',
        roles: ['lecturer']
      },
      {
        label: 'Content',
        path: '/dashboard/lecturer/content',
        icon: 'FileText',
        roles: ['lecturer']
      },
      {
        label: 'Analytics',
        path: '/dashboard/lecturer/analytics',
        icon: 'BarChart',
        roles: ['lecturer']
      }
    ],
    widgets: [
      {
        id: 'teaching-courses',
        title: 'Teaching Courses',
        component: 'TeachingCoursesWidget',
        size: 'large',
        roles: ['lecturer']
      },
      {
        id: 'pending-grading',
        title: 'Pending Grading',
        component: 'PendingGradingWidget',
        size: 'medium',
        roles: ['lecturer']
      },
      {
        id: 'student-performance',
        title: 'Student Performance',
        component: 'StudentPerformanceWidget',
        size: 'medium',
        roles: ['lecturer']
      },
      {
        id: 'class-attendance',
        title: 'Class Attendance',
        component: 'ClassAttendanceWidget',
        size: 'medium',
        roles: ['lecturer']
      }
    ]
  },

  dean: {
    title: 'Dean Dashboard',
    theme: {
      primary: '#7c3aed', // Purple
      secondary: '#8b5cf6',
      accent: '#ef4444'
    },
    navigation: [
      {
        label: 'Faculty Overview',
        path: '/dashboard/dean',
        icon: 'Building',
        roles: ['dean']
      },
      {
        label: 'Lecturers',
        path: '/dashboard/dean/lecturers',
        icon: 'Users',
        roles: ['dean']
      },
      {
        label: 'Courses',
        path: '/dashboard/dean/courses',
        icon: 'Book',
        roles: ['dean']
      },
      {
        label: 'Students',
        path: '/dashboard/dean/students',
        icon: 'GraduationCap',
        roles: ['dean']
      },
      {
        label: 'Analytics',
        path: '/dashboard/dean/analytics',
        icon: 'TrendingUp',
        roles: ['dean']
      },
      {
        label: 'Resources',
        path: '/dashboard/dean/resources',
        icon: 'Settings',
        roles: ['dean']
      }
    ],
    widgets: [
      {
        id: 'faculty-overview',
        title: 'Faculty Overview',
        component: 'FacultyOverviewWidget',
        size: 'large',
        roles: ['dean']
      },
      {
        id: 'lecturer-performance',
        title: 'Lecturer Performance',
        component: 'LecturerPerformanceWidget',
        size: 'medium',
        roles: ['dean']
      },
      {
        id: 'enrollment-stats',
        title: 'Enrollment Statistics',
        component: 'EnrollmentStatsWidget',
        size: 'medium',
        roles: ['dean']
      },
      {
        id: 'faculty-resources',
        title: 'Faculty Resources',
        component: 'FacultyResourcesWidget',
        size: 'medium',
        roles: ['dean']
      }
    ]
  },

  admin: {
    title: 'Admin Dashboard',
    theme: {
      primary: '#dc2626', // Red
      secondary: '#ef4444',
      accent: '#059669'
    },
    navigation: [
      {
        label: 'System Overview',
        path: '/dashboard/admin',
        icon: 'Monitor',
        roles: ['admin']
      },
      {
        label: 'User Management',
        path: '/dashboard/admin/users',
        icon: 'Users',
        roles: ['admin']
      },
      {
        label: 'Notifications',
        path: '/dashboard/admin/notifications',
        icon: 'Bell',
        roles: ['admin']
      },
      {
        label: 'System Settings',
        path: '/dashboard/admin/settings',
        icon: 'Settings',
        roles: ['admin']
      },
      {
        label: 'Analytics',
        path: '/dashboard/admin/analytics',
        icon: 'BarChart',
        roles: ['admin']
      },
      {
        label: 'Security',
        path: '/dashboard/admin/security',
        icon: 'Shield',
        roles: ['admin']
      }
    ],
    widgets: [
      {
        id: 'system-health',
        title: 'System Health',
        component: 'SystemHealthWidget',
        size: 'large',
        roles: ['admin']
      },
      {
        id: 'user-activity',
        title: 'User Activity',
        component: 'UserActivityWidget',
        size: 'medium',
        roles: ['admin']
      },
      {
        id: 'notification-management',
        title: 'Notification Management',
        component: 'NotificationManagementWidget',
        size: 'medium',
        roles: ['admin']
      },
      {
        id: 'security-alerts',
        title: 'Security Alerts',
        component: 'SecurityAlertsWidget',
        size: 'medium',
        roles: ['admin']
      }
    ]
  }
};

// Role-based permissions
export const rolePermissions = {
  student: [
    'read:own_courses',
    'read:own_grades',
    'read:own_assignments',
    'create:assignment_submissions',
    'read:course_materials',
    'create:forum_posts'
  ],
  lecturer: [
    'read:assigned_courses',
    'manage:course_content',
    'manage:assignments',
    'manage:grades',
    'read:enrolled_students',
    'create:announcements'
  ],
  dean: [
    'read:faculty_data',
    'manage:faculty_courses',
    'manage:lecturer_assignments',
    'read:faculty_analytics',
    'approve:course_changes',
    'manage:faculty_resources'
  ],
  admin: [
    'manage:all_users',
    'manage:system_settings',
    'manage:public_notifications',
    'read:system_analytics',
    'manage:security_settings',
    'access:audit_logs'
  ]
};

// Helper function to get dashboard config by role
export const getDashboardConfig = (role: UserRole): DashboardConfig => {
  return dashboardConfigs[role];
};

// Helper function to check if user has permission
export const hasPermission = (userRole: UserRole, permission: string): boolean => {
  return rolePermissions[userRole].includes(permission);
};
