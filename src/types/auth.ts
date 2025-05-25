// Authentication and Role-Based Access Control Types

export type UserRole = 'student' | 'lecturer' | 'dean' | 'admin';

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  facultyId?: string;
  departmentId?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Student extends User {
  role: 'student';
  studentNumber: string;
  programId: string;
  yearOfStudy: number;
  enrollmentDate: string;
  gpa?: number;
}

export interface Lecturer extends User {
  role: 'lecturer';
  employeeId: string;
  departmentId: string;
  specialization: string;
  hireDate: string;
  courses?: string[];
}

export interface Dean extends User {
  role: 'dean';
  facultyId: string;
  appointmentDate: string;
  faculty?: {
    id: string;
    name: string;
    shortName: string;
  };
}

export interface Admin extends User {
  role: 'admin';
  adminLevel: 'super' | 'system' | 'support';
  permissions: string[];
}

export type AuthUser = Student | Lecturer | Dean | Admin;

// Permission system
export interface Permission {
  resource: string;
  action: 'create' | 'read' | 'update' | 'delete' | 'manage';
  scope?: 'own' | 'department' | 'faculty' | 'all';
}

export interface RolePermissions {
  student: Permission[];
  lecturer: Permission[];
  dean: Permission[];
  admin: Permission[];
}

// Dashboard route configuration
export interface DashboardRoute {
  path: string;
  component: string;
  roles: UserRole[];
  permissions?: string[];
}

// Authentication context
export interface AuthContextType {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  canAccess: (resource: string, action: string) => boolean;
}

// Dashboard configuration by role
export interface DashboardConfig {
  title: string;
  theme: {
    primary: string;
    secondary: string;
    accent: string;
  };
  navigation: NavigationItem[];
  widgets: DashboardWidget[];
}

export interface NavigationItem {
  label: string;
  path: string;
  icon: string;
  roles: UserRole[];
  children?: NavigationItem[];
}

export interface DashboardWidget {
  id: string;
  title: string;
  component: string;
  size: 'small' | 'medium' | 'large';
  roles: UserRole[];
  permissions?: string[];
}

// Faculty and Department types
export interface Faculty {
  id: string;
  name: string;
  shortName: string;
  deanId?: string;
  departments: Department[];
}

export interface Department {
  id: string;
  name: string;
  facultyId: string;
  headId?: string;
}

// Course and enrollment types
export interface Course {
  id: string;
  code: string;
  name: string;
  description: string;
  credits: number;
  departmentId: string;
  lecturerId: string;
  semester: string;
  year: number;
}

export interface Enrollment {
  id: string;
  studentId: string;
  courseId: string;
  enrollmentDate: string;
  status: 'active' | 'completed' | 'dropped';
  grade?: string;
}

// Assignment and submission types
export interface Assignment {
  id: string;
  courseId: string;
  title: string;
  description: string;
  dueDate: string;
  maxPoints: number;
  createdBy: string;
}

export interface Submission {
  id: string;
  assignmentId: string;
  studentId: string;
  content: string;
  submittedAt: string;
  grade?: number;
  feedback?: string;
}
