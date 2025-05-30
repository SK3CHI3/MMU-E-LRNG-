# 🗄️ Database Schema Documentation - MMU LMS

## 📋 Table of Contents
- [Overview](#overview)
- [Core Tables](#core-tables)
- [Academic Tables](#academic-tables)
- [Assessment Tables](#assessment-tables)
- [Communication Tables](#communication-tables)
- [Analytics Tables](#analytics-tables)
- [Security & Audit Tables](#security--audit-tables)
- [Relationships](#relationships)
- [Indexes & Performance](#indexes--performance)

---

## 🎯 Overview

The MMU LMS database is built on PostgreSQL with a focus on data integrity, security, and performance. The schema supports multi-role access with Row Level Security (RLS) policies ensuring data privacy and access control.

### 🏗️ Database Architecture
- **Database Engine**: PostgreSQL 15+
- **Security Model**: Row Level Security (RLS)
- **Authentication**: Supabase Auth integration
- **Real-time**: WebSocket subscriptions
- **Storage**: Supabase Storage integration

---

## 👥 Core Tables

### 🔐 `users`
Primary user information table for all system users.

```sql
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE NOT NULL REFERENCES auth.users(id),
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    admission_number VARCHAR(50) UNIQUE, -- For students
    faculty_id UUID REFERENCES faculties(id),
    department_id UUID REFERENCES departments(id),
    profile_picture_url TEXT,
    phone_number VARCHAR(20),
    date_of_birth DATE,
    gender VARCHAR(10),
    address TEXT,
    emergency_contact JSONB,
    academic_year INTEGER,
    semester VARCHAR(10),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

**Key Features:**
- Links to Supabase Auth via `auth_id`
- Role-based user classification
- Student-specific fields (admission_number, academic_year)
- Faculty/department associations
- JSONB for flexible emergency contact data

### 🏛️ `faculties`
Academic faculty/school information.

```sql
CREATE TABLE faculties (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) UNIQUE NOT NULL,
    description TEXT,
    dean_id UUID REFERENCES users(auth_id),
    established_year INTEGER,
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    location VARCHAR(255),
    website_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 🏢 `departments`
Department information within faculties.

```sql
CREATE TABLE departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    faculty_id UUID NOT NULL REFERENCES faculties(id),
    name VARCHAR(255) NOT NULL,
    code VARCHAR(10) NOT NULL,
    description TEXT,
    head_id UUID REFERENCES users(auth_id),
    contact_email VARCHAR(255),
    contact_phone VARCHAR(20),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(faculty_id, code)
);
```

---

## 📚 Academic Tables

### 📖 `courses`
Course/unit information and management.

```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    code VARCHAR(20) UNIQUE NOT NULL,
    description TEXT,
    credit_hours INTEGER NOT NULL DEFAULT 3,
    semester VARCHAR(10) NOT NULL,
    academic_year INTEGER NOT NULL,
    department_id UUID REFERENCES departments(id),
    created_by UUID NOT NULL REFERENCES users(auth_id),
    prerequisites TEXT[],
    learning_objectives TEXT[],
    course_outline JSONB,
    max_enrollment INTEGER,
    enrollment_status VARCHAR(20) DEFAULT 'open',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 👥 `course_enrollments`
Student course enrollment tracking.

```sql
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id),
    student_id UUID NOT NULL REFERENCES users(auth_id),
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    status VARCHAR(20) DEFAULT 'active',
    final_grade DECIMAL(5,2),
    grade_letter VARCHAR(2),
    completion_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(course_id, student_id)
);
```

### 📅 `class_sessions`
Class schedule and session management.

```sql
CREATE TABLE class_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    session_type VARCHAR(50) DEFAULT 'lecture',
    scheduled_start TIMESTAMP WITH TIME ZONE NOT NULL,
    scheduled_end TIMESTAMP WITH TIME ZONE NOT NULL,
    location VARCHAR(255),
    virtual_link TEXT,
    status VARCHAR(20) DEFAULT 'scheduled',
    lecturer_id UUID NOT NULL REFERENCES users(auth_id),
    max_attendance INTEGER,
    materials JSONB,
    recording_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### ✅ `class_attendance`
Student attendance tracking.

```sql
CREATE TABLE class_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES class_sessions(id),
    student_id UUID NOT NULL REFERENCES users(auth_id),
    status VARCHAR(20) DEFAULT 'present',
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    marked_by UUID REFERENCES users(auth_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, student_id)
);
```

---

## 📝 Assessment Tables

### 📋 `assignments`
Assignment definitions and metadata.

```sql
CREATE TABLE assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    total_points INTEGER NOT NULL DEFAULT 100,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    submission_format VARCHAR(20) DEFAULT 'text',
    allowed_file_types TEXT[],
    max_file_size BIGINT,
    max_attempts INTEGER DEFAULT 1,
    late_submission_penalty DECIMAL(5,2),
    rubric JSONB,
    is_published BOOLEAN DEFAULT false,
    created_by UUID NOT NULL REFERENCES users(auth_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 📤 `assignment_submissions`
Student assignment submissions.

```sql
CREATE TABLE assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES assignments(id),
    user_id UUID NOT NULL REFERENCES users(auth_id),
    submission_text TEXT,
    submission_url TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_late BOOLEAN DEFAULT false,
    attempt_number INTEGER DEFAULT 1,
    grade DECIMAL(5,2),
    feedback TEXT,
    graded_by UUID REFERENCES users(auth_id),
    graded_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'submitted',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(assignment_id, user_id, attempt_number)
);
```

### 📁 `assignment_files`
File attachments for assignments.

```sql
CREATE TABLE assignment_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    submission_id UUID NOT NULL REFERENCES assignment_submissions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(auth_id),
    uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 🎯 `exams`
Exam definitions and configuration.

```sql
CREATE TABLE exams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    total_points INTEGER NOT NULL DEFAULT 100,
    duration_minutes INTEGER NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE,
    end_time TIMESTAMP WITH TIME ZONE,
    exam_type VARCHAR(50) DEFAULT 'midterm',
    is_published BOOLEAN DEFAULT false,
    randomize_questions BOOLEAN DEFAULT false,
    show_results_immediately BOOLEAN DEFAULT false,
    max_attempts INTEGER DEFAULT 1,
    created_by UUID NOT NULL REFERENCES users(auth_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### ❓ `exam_questions`
Individual exam questions.

```sql
CREATE TABLE exam_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    exam_id UUID NOT NULL REFERENCES exams(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL,
    points INTEGER NOT NULL DEFAULT 1,
    order_index INTEGER NOT NULL,
    options JSONB, -- For multiple choice questions
    correct_answer TEXT,
    explanation TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 💬 Communication Tables

### 📨 `messages`
Real-time messaging system.

```sql
CREATE TABLE messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    sender_id UUID NOT NULL REFERENCES users(auth_id),
    recipient_id UUID NOT NULL REFERENCES users(auth_id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text',
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    reply_to UUID REFERENCES messages(id),
    attachments JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 📢 `announcements`
System and course announcements.

```sql
CREATE TABLE announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    author_id UUID NOT NULL REFERENCES users(auth_id),
    target_audience VARCHAR(20) DEFAULT 'all',
    course_id UUID REFERENCES courses(id),
    faculty_id UUID REFERENCES faculties(id),
    priority VARCHAR(20) DEFAULT 'normal',
    is_published BOOLEAN DEFAULT false,
    publish_date TIMESTAMP WITH TIME ZONE,
    expiry_date TIMESTAMP WITH TIME ZONE,
    external_link TEXT,
    category VARCHAR(50),
    attachments JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 👁️ `announcement_reads`
Track announcement read status.

```sql
CREATE TABLE announcement_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(auth_id),
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(announcement_id, user_id)
);
```

---

## 📊 Analytics Tables

### 📈 `analytics_data`
User activity and engagement tracking.

```sql
CREATE TABLE analytics_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(auth_id),
    course_id UUID REFERENCES courses(id),
    activity_type VARCHAR(50) NOT NULL,
    activity_data JSONB,
    session_id UUID,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 🎯 `performance_metrics`
Academic performance tracking.

```sql
CREATE TABLE performance_metrics (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(auth_id),
    course_id UUID REFERENCES courses(id),
    metric_type VARCHAR(50) NOT NULL,
    metric_value DECIMAL(10,2) NOT NULL,
    calculation_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    academic_period VARCHAR(20),
    additional_data JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔒 Security & Audit Tables

### 📋 `audit_logs`
System activity audit trail.

```sql
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(auth_id),
    action VARCHAR(100) NOT NULL,
    table_name VARCHAR(100),
    record_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### ⚙️ `system_settings`
Global system configuration.

```sql
CREATE TABLE system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    description TEXT,
    is_public BOOLEAN DEFAULT false,
    updated_by UUID REFERENCES users(auth_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## 🔗 Relationships

### 🎯 Key Relationships
1. **Users ↔ Faculties**: Many-to-one relationship
2. **Faculties ↔ Departments**: One-to-many relationship
3. **Courses ↔ Enrollments**: One-to-many relationship
4. **Assignments ↔ Submissions**: One-to-many relationship
5. **Submissions ↔ Files**: One-to-many relationship
6. **Exams ↔ Questions**: One-to-many relationship

### 🔐 Security Policies (RLS)
All tables implement Row Level Security with policies based on:
- User roles and permissions
- Course enrollment status
- Faculty/department associations
- Data ownership principles

---

## ⚡ Indexes & Performance

### 📊 Critical Indexes
```sql
-- User lookups
CREATE INDEX idx_users_auth_id ON users(auth_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_admission_number ON users(admission_number);

-- Course relationships
CREATE INDEX idx_course_enrollments_student ON course_enrollments(student_id);
CREATE INDEX idx_course_enrollments_course ON course_enrollments(course_id);

-- Assignment performance
CREATE INDEX idx_assignments_course ON assignments(course_id);
CREATE INDEX idx_assignment_submissions_assignment ON assignment_submissions(assignment_id);
CREATE INDEX idx_assignment_submissions_user ON assignment_submissions(user_id);

-- Communication indexes
CREATE INDEX idx_messages_sender ON messages(sender_id);
CREATE INDEX idx_messages_recipient ON messages(recipient_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);

-- Analytics indexes
CREATE INDEX idx_analytics_user_activity ON analytics_data(user_id, activity_type);
CREATE INDEX idx_analytics_course_activity ON analytics_data(course_id, activity_type);
```

---

*This database schema documentation is maintained to reflect the current database structure and is updated with any schema changes.*
