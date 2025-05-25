# MMU LMS Database Documentation

## Overview

This directory contains the complete database schema and setup scripts for the MMU Learning Management System. The database is built on PostgreSQL with Supabase and includes comprehensive Row Level Security (RLS) policies, storage configurations, and sample data.

## Database Architecture

### Core Tables

#### 1. **Users Table**
- **Purpose**: Extends Supabase auth.users with additional profile information
- **Key Fields**: auth_id (FK to auth.users), email, full_name, role, department, student_id
- **Roles**: student, lecturer, dean, admin
- **Features**: Role-based access control, profile management

#### 2. **Courses Table**
- **Purpose**: Course catalog and management
- **Key Fields**: code, title, description, credit_hours, department, level, semester, year
- **Features**: Prerequisites tracking, enrollment limits, lecturer assignment

#### 3. **Course Enrollments Table**
- **Purpose**: Student-course relationships and academic records
- **Key Fields**: user_id, course_id, status, grade, grade_points
- **Features**: Enrollment tracking, grade management, completion status

#### 4. **Assignments Table**
- **Purpose**: Assignment creation and management
- **Key Fields**: course_id, title, description, due_date, total_points, assignment_type
- **Features**: Multiple assignment types, rubric support, late submission policies

#### 5. **Assignment Submissions Table**
- **Purpose**: Student assignment submissions and grading
- **Key Fields**: assignment_id, user_id, submission_text, submission_url, grade, feedback
- **Features**: File uploads, grading workflow, attempt tracking

#### 6. **Course Materials Table**
- **Purpose**: Learning resources and file management
- **Key Fields**: course_id, title, type, url, tags, is_public
- **Features**: Multiple file types, tagging system, public/private access

#### 7. **Conversations & Messages Tables**
- **Purpose**: Internal messaging system
- **Key Fields**: participants, subject, course_id, priority
- **Features**: Group conversations, file attachments, read status

#### 8. **Announcements Table**
- **Purpose**: Course and system-wide announcements
- **Key Fields**: title, content, course_id, priority, is_public
- **Features**: Priority levels, expiration dates, targeted audiences

#### 9. **Notifications Table**
- **Purpose**: System notifications and alerts
- **Key Fields**: user_id, title, message, type, priority, is_read
- **Features**: Multiple notification types, read tracking, action URLs

#### 10. **Analytics Data Table**
- **Purpose**: User activity tracking and system analytics
- **Key Fields**: user_id, course_id, activity_type, created_at
- **Features**: Activity logging, performance metrics, engagement tracking

## Security Features

### Row Level Security (RLS)

All tables implement comprehensive RLS policies:

- **Users**: Can read own profile and update personal information
- **Courses**: Lecturers manage own courses, students access enrolled courses
- **Enrollments**: Users see own enrollments, lecturers see course enrollments
- **Assignments**: Lecturers manage course assignments, students access enrolled course assignments
- **Submissions**: Students manage own submissions, lecturers grade course submissions
- **Materials**: Lecturers manage course materials, students access enrolled course materials
- **Messages**: Users access own conversations and messages
- **Notifications**: Users access own notifications
- **Announcements**: Course-specific and public announcement access
- **Analytics**: Users see own data, lecturers see course analytics

### Storage Security

- **Bucket Policies**: File access based on user roles and course enrollment
- **File Size Limits**: Configurable limits per bucket type
- **MIME Type Restrictions**: Allowed file types per bucket
- **Path-based Access**: Organized folder structure with access controls

## Storage Buckets

### 1. **course-materials** (Public)
- **Purpose**: Course learning materials
- **Size Limit**: 50MB per file
- **Access**: Lecturers upload, enrolled students download
- **File Types**: PDF, DOC, PPT, videos, images, archives

### 2. **assignment-submissions** (Private)
- **Purpose**: Student assignment files
- **Size Limit**: 100MB per file
- **Access**: Students upload own submissions, lecturers access course submissions
- **File Types**: PDF, DOC, code files, images, archives

### 3. **message-attachments** (Private)
- **Purpose**: Message file attachments
- **Size Limit**: 20MB per file
- **Access**: Conversation participants only
- **File Types**: PDF, images, documents, archives

### 4. **user-avatars** (Public)
- **Purpose**: User profile pictures
- **Size Limit**: 5MB per file
- **Access**: Users upload own avatars, public viewing
- **File Types**: Images only (JPEG, PNG, GIF, WebP)

### 5. **announcement-attachments** (Public)
- **Purpose**: Announcement file attachments
- **Size Limit**: 30MB per file
- **Access**: Lecturers/admins upload, public viewing
- **File Types**: PDF, DOC, images, videos, audio

## Setup Instructions

### 1. **Database Schema Setup**
```sql
-- Run the main schema file
\i database/schema.sql
```

### 2. **Storage Buckets Setup**
```sql
-- Create storage buckets and policies
\i database/storage_setup.sql
```

### 3. **Sample Data (Optional)**
```sql
-- Insert sample data for testing
\i database/sample_data.sql
```

## Key Features

### 🔐 **Security**
- Row Level Security on all tables
- Role-based access control
- Secure file storage with access policies
- Foreign key constraints and data validation

### 📊 **Analytics**
- Comprehensive activity tracking
- User engagement metrics
- Course performance analytics
- Real-time dashboard data

### 💬 **Communication**
- Internal messaging system
- Course announcements
- System notifications
- File sharing capabilities

### 📚 **Academic Management**
- Course catalog and enrollment
- Assignment creation and submission
- Grading and feedback system
- Learning materials management

### 🎯 **User Experience**
- Role-specific dashboards
- Real-time notifications
- File upload/download
- Mobile-responsive design

## Database Statistics

Current sample data includes:
- **14 Users** (admin, dean, lecturer, student roles)
- **4 Courses** (CS102, CS205, CS301, CS401)
- **11 Course Enrollments**
- **4 Assignments** (homework and project types)
- **4 Course Materials**
- **4 Announcements**
- **17 Analytics Records**

## Maintenance

### Regular Tasks
1. **Backup**: Regular database backups
2. **Analytics Cleanup**: Archive old analytics data
3. **File Cleanup**: Remove orphaned files
4. **Performance Monitoring**: Query optimization

### Monitoring
- Table sizes and growth
- Query performance
- Storage usage
- User activity patterns

## API Integration

The database integrates seamlessly with:
- **Supabase Auth**: User authentication and session management
- **Supabase Storage**: File upload and management
- **Supabase Realtime**: Live updates and notifications
- **Frontend Services**: React components and API calls

## Support

For database-related issues:
1. Check RLS policies for access issues
2. Verify foreign key constraints
3. Review storage bucket policies
4. Monitor query performance

---

**Last Updated**: May 2024  
**Version**: 1.0.0  
**Database**: PostgreSQL with Supabase
