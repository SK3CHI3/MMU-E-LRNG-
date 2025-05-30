# 🔄 MMU LMS Data Flow & User Interaction Mapping

## Overview
This document provides a comprehensive mapping of WHO creates data and WHO consumes it in the MMU Learning Management System. Understanding these relationships is crucial for implementing dynamic data flows and ensuring proper access controls.

## 📊 Data Creation Matrix

### 👨‍💼 ADMIN Creates:
| Data Type | Table | Purpose | Consumed By |
|-----------|-------|---------|-------------|
| **User Accounts** | `users` | System user management | All Users |
| **Programmes** | `programmes` | Academic program catalog | Students, Deans, Lecturers |
| **Fee Structures** | `student_fees` | Fee management setup | Students, Deans |
| **System Announcements** | `announcements` | University-wide communications | All Users |
| **Academic Calendar** | `academic_calendar` | Semester/term scheduling | All Users |
| **System Analytics** | `analytics_data` | Platform usage monitoring | Admin only |

### 👩‍🎓 DEAN Creates:
| Data Type | Table | Purpose | Consumed By |
|-----------|-------|---------|-------------|
| **Faculty Announcements** | `announcements` | Faculty-specific communications | Faculty Members |
| **Course Assignments** | `courses.created_by` | Assign lecturers to courses | Lecturers, Students |
| **Faculty Analytics** | `analytics_data` | Faculty performance monitoring | Dean, Admin |
| **Programme Oversight** | `programmes` | Faculty program management | Students, Lecturers |

### 👨‍🏫 LECTURER Creates:
| Data Type | Table | Purpose | Consumed By |
|-----------|-------|---------|-------------|
| **Courses** | `courses` | Course catalog and management | Students, Dean |
| **Assignments** | `assignments` | Student assessments | Students |
| **Course Materials** | `course_materials` | Learning resources | Students |
| **Grades** | `assignment_submissions.grade` | Student performance evaluation | Students, Dean |
| **Course Announcements** | `announcements` | Course-specific communications | Enrolled Students |
| **Messages** | `messages` | Direct communication | Recipients |
| **Class Sessions** | `class_sessions` | Scheduled class meetings | Students |

### 👨‍🎓 STUDENT Creates:
| Data Type | Table | Purpose | Consumed By |
|-----------|-------|---------|-------------|
| **Course Enrollments** | `course_enrollments` | Course registration | Lecturers, Dean, Admin |
| **Assignment Submissions** | `assignment_submissions` | Assignment responses | Lecturers |
| **Messages** | `messages` | Communication with faculty | Recipients |
| **Fee Payments** | `payment_history` | Financial transactions | Admin, Dean |
| **Activity Data** | `analytics_data` | Learning engagement tracking | Lecturers, Dean, Admin |

## 📈 Data Consumption Patterns

### 👨‍🎓 STUDENT Consumes:
- **Personal Data**: Own profile, grades, enrollments, fee status
- **Course Data**: Enrolled courses, assignments, materials, announcements
- **Communication**: Messages from faculty, course announcements
- **Academic**: Personal academic progress, GPA, transcript

### 👨‍🏫 LECTURER Consumes:
- **Teaching Data**: Courses they teach, enrolled students, submissions
- **Student Data**: Submissions, grades, attendance for their courses
- **Communication**: Messages from students and colleagues
- **Analytics**: Course performance metrics, student engagement

### 👩‍🎓 DEAN Consumes:
- **Faculty Data**: All courses, lecturers, students in their faculty
- **Performance**: Faculty-wide analytics, graduation rates, enrollment stats
- **Communication**: Faculty-wide messages and announcements
- **Oversight**: Programme performance, resource allocation

### 👨‍💼 ADMIN Consumes:
- **System Data**: All users, courses, programmes, system health
- **Analytics**: Platform-wide usage, performance metrics
- **Management**: User management, system configuration
- **Financial**: System-wide fee collection, payment tracking

## 🔐 Access Control Implementation

### Row Level Security (RLS) Policies:

#### Students:
```sql
-- Students can only see their own data
CREATE POLICY student_own_data ON course_enrollments
FOR SELECT USING (user_id = auth.uid());

CREATE POLICY student_assignments ON assignments
FOR SELECT USING (course_id IN (
  SELECT course_id FROM course_enrollments 
  WHERE user_id = auth.uid()
));
```

#### Lecturers:
```sql
-- Lecturers can see data for courses they teach
CREATE POLICY lecturer_courses ON courses
FOR ALL USING (created_by = auth.uid());

CREATE POLICY lecturer_students ON course_enrollments
FOR SELECT USING (course_id IN (
  SELECT id FROM courses WHERE created_by = auth.uid()
));
```

#### Deans:
```sql
-- Deans can see faculty-wide data
CREATE POLICY dean_faculty_data ON users
FOR SELECT USING (faculty = (
  SELECT faculty FROM users WHERE auth_id = auth.uid()
));
```

## 🚀 Dynamic Data Implementation Strategy

### Phase 1: Core Data Services
1. **User Data Service** - Handles user-specific data retrieval
2. **Course Service** - Manages course creation and enrollment
3. **Assignment Service** - Handles assignment lifecycle
4. **Grade Service** - Manages grading and analytics

### Phase 2: Real-time Updates
1. **Notification Service** - Real-time alerts for data changes
2. **Activity Tracking** - User engagement monitoring
3. **Analytics Service** - Performance metrics calculation

### Phase 3: Advanced Features
1. **Messaging Service** - Inter-user communication
2. **Resource Management** - File and material handling
3. **Fee Management** - Financial transaction processing

## 📋 Data Validation Rules

### Course Creation (Lecturer):
- Must be assigned to lecturer's department
- Cannot exceed maximum student capacity
- Must have valid programme association

### Assignment Creation (Lecturer):
- Must belong to lecturer's course
- Due date must be in the future
- Must have valid point allocation

### Enrollment (Student):
- Must meet prerequisite requirements
- Cannot exceed course capacity
- Must have adequate fee payment (60% minimum)

### Grade Assignment (Lecturer):
- Can only grade own course assignments
- Grade must be within valid range (0-total_points)
- Must provide feedback for failing grades

## 🔄 Data Synchronization

### Real-time Updates:
- **Assignments**: Notify students when new assignments are created
- **Grades**: Notify students when assignments are graded
- **Announcements**: Immediate delivery to target audience
- **Messages**: Real-time chat functionality

### Batch Updates:
- **Analytics**: Daily aggregation of activity data
- **Reports**: Weekly/monthly performance summaries
- **Backups**: Daily database snapshots

## 🎯 Key Implementation Points

### 1. Service Layer Architecture
Each user role has dedicated service functions that respect access boundaries:
- `studentService.ts` - Student-specific data operations
- `lecturerService.ts` - Lecturer-specific data operations
- `deanService.ts` - Dean-specific data operations
- `adminService.ts` - Admin-specific data operations

### 2. Data Filtering
All data queries include user context filtering:
```typescript
// Example: Student can only see their enrolled courses
const getStudentCourses = async (userId: string) => {
  return supabase
    .from('course_enrollments')
    .select('courses(*)')
    .eq('user_id', userId)
    .eq('status', 'enrolled');
};
```

### 3. Error Handling
Graceful handling of access violations and data not found scenarios:
- Empty state components for no data
- Loading states during data fetching
- Error messages for access violations

### 4. Performance Optimization
- Efficient queries with proper indexing
- Pagination for large datasets
- Caching for frequently accessed data
- Lazy loading for non-critical data

This mapping ensures that every piece of data in the system has a clear origin and consumption path, maintaining data integrity and security while providing a seamless user experience.
