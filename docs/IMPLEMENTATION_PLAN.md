# MMU LMS RBAC Implementation Plan

## 🚀 Implementation Phases

### Phase 1: Core RBAC Foundation (Week 1-2)

#### 1.1 Authentication System Update
- [ ] Update AuthContext to handle role-based authentication
- [ ] Implement role detection and storage
- [ ] Create role-based JWT tokens
- [ ] Update login/logout flows

#### 1.2 Database Schema
```sql
-- Update users table
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'student';
ALTER TABLE users ADD COLUMN faculty_id UUID;
ALTER TABLE users ADD COLUMN department_id UUID;

-- Create role-specific tables
CREATE TABLE students (...);
CREATE TABLE lecturers (...);
CREATE TABLE deans (...);
CREATE TABLE admins (...);
```

#### 1.3 Route Protection
- [ ] Implement RoleBasedRoute component
- [ ] Create role-specific route guards
- [ ] Update App.tsx with protected routes
- [ ] Add unauthorized page

### Phase 2: Dashboard Separation (Week 3-4)

#### 2.1 Create Separate Dashboard Components
```
src/pages/dashboards/
├── StudentDashboard.tsx
├── LecturerDashboard.tsx
├── DeanDashboard.tsx
└── AdminDashboard.tsx
```

#### 2.2 Role-Specific Layouts
```
src/components/layouts/
├── StudentLayout.tsx
├── LecturerLayout.tsx
├── DeanLayout.tsx
└── AdminLayout.tsx
```

#### 2.3 Navigation Updates
- [ ] Create role-specific navigation menus
- [ ] Implement dynamic sidebar based on role
- [ ] Update header with role-appropriate actions

### Phase 3: Dashboard Widgets (Week 5-6)

#### 3.1 Student Dashboard Widgets
- [ ] EnrolledCoursesWidget
- [ ] UpcomingAssignmentsWidget
- [ ] RecentGradesWidget
- [ ] ClassScheduleWidget
- [ ] AcademicProgressWidget

#### 3.2 Lecturer Dashboard Widgets
- [ ] TeachingCoursesWidget
- [ ] PendingGradingWidget
- [ ] StudentPerformanceWidget
- [ ] ClassAttendanceWidget
- [ ] CourseAnalyticsWidget

#### 3.3 Dean Dashboard Widgets
- [ ] FacultyOverviewWidget
- [ ] LecturerPerformanceWidget
- [ ] EnrollmentStatsWidget
- [ ] FacultyResourcesWidget
- [ ] BudgetOverviewWidget

#### 3.4 Admin Dashboard Widgets
- [ ] SystemHealthWidget
- [ ] UserActivityWidget
- [ ] NotificationManagementWidget
- [ ] SecurityAlertsWidget
- [ ] SystemAnalyticsWidget

### Phase 4: Role-Specific Features (Week 7-8)

#### 4.1 Student Features
- [ ] Course enrollment system
- [ ] Assignment submission portal
- [ ] Grade viewing and analytics
- [ ] Academic calendar integration
- [ ] Resource library access

#### 4.2 Lecturer Features
- [ ] Course management interface
- [ ] Student roster management
- [ ] Assignment creation and grading
- [ ] Attendance tracking
- [ ] Course content upload

#### 4.3 Dean Features
- [ ] Faculty oversight dashboard
- [ ] Lecturer performance monitoring
- [ ] Course approval workflow
- [ ] Resource allocation management
- [ ] Faculty-wide reporting

#### 4.4 Admin Features
- [ ] User management interface
- [ ] System configuration panel
- [ ] Public notification management
- [ ] Security monitoring
- [ ] Audit log viewer

## 🛠️ Technical Implementation

### 1. Update AuthContext
```typescript
// src/contexts/AuthContext.tsx
interface AuthContextType {
  user: AuthUser | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  hasPermission: (permission: string) => boolean;
  canAccess: (resource: string, action: string) => boolean;
}
```

### 2. Create Role-Based Components
```typescript
// Example: Student Dashboard
const StudentDashboard = () => {
  const { user } = useAuth();
  const config = getDashboardConfig('student');
  
  return (
    <StudentLayout>
      <DashboardHeader title={config.title} />
      <DashboardGrid widgets={config.widgets} />
    </StudentLayout>
  );
};
```

### 3. Update Routing
```typescript
// src/App.tsx
<Routes>
  <Route path="/dashboard" element={<DashboardRouter />} />
  <Route path="/dashboard/student/*" element={
    <StudentRoute>
      <StudentDashboard />
    </StudentRoute>
  } />
  <Route path="/dashboard/lecturer/*" element={
    <LecturerRoute>
      <LecturerDashboard />
    </LecturerRoute>
  } />
  {/* ... other routes */}
</Routes>
```

### 4. Database Integration
```typescript
// src/services/authService.ts
export const loginUser = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });
  
  if (data.user) {
    // Fetch user role and additional data
    const userProfile = await fetchUserProfile(data.user.id);
    return userProfile;
  }
};
```

## 🎨 UI/UX Implementation

### 1. Theme System
```typescript
// src/styles/themes.ts
export const roleThemes = {
  student: {
    primary: '#2563eb',
    secondary: '#3b82f6',
    accent: '#ef4444'
  },
  lecturer: {
    primary: '#059669',
    secondary: '#10b981',
    accent: '#ef4444'
  },
  // ... other roles
};
```

### 2. Component Styling
```css
/* Role-specific CSS classes */
.dashboard-student { /* Blue theme */ }
.dashboard-lecturer { /* Green theme */ }
.dashboard-dean { /* Purple theme */ }
.dashboard-admin { /* Red theme */ }
```

## 🔐 Security Implementation

### 1. API Route Protection
```typescript
// Middleware for API routes
export const requireRole = (allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const userRole = req.user?.role;
    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }
    next();
  };
};
```

### 2. Data Filtering
```typescript
// Example: Students can only see their own data
export const getStudentCourses = async (userId: string, userRole: string) => {
  if (userRole !== 'student') {
    throw new Error('Unauthorized');
  }
  
  return await supabase
    .from('enrollments')
    .select('*, courses(*)')
    .eq('student_id', userId);
};
```

## 📊 Testing Strategy

### 1. Role-Based Testing
- [ ] Test each role can only access appropriate routes
- [ ] Verify permission checks work correctly
- [ ] Test role switching scenarios
- [ ] Validate data isolation

### 2. Security Testing
- [ ] Test unauthorized access attempts
- [ ] Verify JWT token validation
- [ ] Test permission escalation attempts
- [ ] Validate data filtering

## 🚀 Deployment Checklist

- [ ] Database migrations completed
- [ ] Environment variables configured
- [ ] Role-based routes tested
- [ ] Permission system validated
- [ ] Security measures in place
- [ ] User documentation updated
- [ ] Admin training completed

This implementation plan ensures a secure, scalable, and user-friendly role-based access control system for the MMU LMS.
