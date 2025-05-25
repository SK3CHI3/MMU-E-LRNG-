-- =============================================
-- MMU LMS Database Schema
-- Complete database structure for the MMU Learning Management System
-- =============================================
--
-- This script creates a comprehensive database schema for the MMU LMS including:
-- - User management with role-based access
-- - Course and enrollment management
-- - Assignment and submission tracking
-- - Course materials and file management
-- - Messaging and communication system
-- - Announcements and notifications
-- - Analytics and activity tracking
-- - Row Level Security (RLS) policies
-- - Storage bucket configurations
--
-- =============================================

-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =============================================
-- USERS AND AUTHENTICATION
-- =============================================

-- Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    auth_id UUID UNIQUE NOT NULL, -- References auth.users.id
    email VARCHAR(255) UNIQUE NOT NULL,
    full_name VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('student', 'lecturer', 'dean', 'admin')),
    department VARCHAR(255),
    student_id VARCHAR(50) UNIQUE, -- Only for students
    phone VARCHAR(20),
    avatar_url TEXT,
    date_of_birth DATE,
    address TEXT,
    emergency_contact JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- COURSES AND ACADEMIC STRUCTURE
-- =============================================

-- Courses table
CREATE TABLE IF NOT EXISTS courses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    credit_hours INTEGER NOT NULL DEFAULT 3,
    department VARCHAR(255) NOT NULL,
    level VARCHAR(50) NOT NULL CHECK (level IN ('undergraduate', 'graduate', 'postgraduate')),
    semester VARCHAR(20) NOT NULL CHECK (semester IN ('fall', 'spring', 'summer')),
    year INTEGER NOT NULL,
    max_students INTEGER DEFAULT 50,
    prerequisites TEXT[], -- Array of course codes
    syllabus_url TEXT,
    created_by UUID NOT NULL REFERENCES users(auth_id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Course enrollments
CREATE TABLE IF NOT EXISTS course_enrollments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(auth_id),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    status VARCHAR(20) NOT NULL DEFAULT 'enrolled' CHECK (status IN ('enrolled', 'completed', 'dropped', 'withdrawn')),
    grade VARCHAR(5), -- A+, A, B+, B, C+, C, D+, D, F
    grade_points DECIMAL(3,2), -- GPA points
    enrollment_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    completion_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, course_id)
);

-- =============================================
-- ASSIGNMENTS AND SUBMISSIONS
-- =============================================

-- Assignments table
CREATE TABLE IF NOT EXISTS assignments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    instructions TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    total_points INTEGER NOT NULL DEFAULT 100,
    assignment_type VARCHAR(50) DEFAULT 'homework' CHECK (assignment_type IN ('homework', 'quiz', 'exam', 'project', 'lab')),
    submission_format VARCHAR(50) DEFAULT 'file' CHECK (submission_format IN ('file', 'text', 'url', 'code')),
    max_file_size INTEGER DEFAULT 10485760, -- 10MB in bytes
    allowed_file_types TEXT[], -- ['pdf', 'doc', 'docx', 'zip']
    is_group_assignment BOOLEAN DEFAULT false,
    max_group_size INTEGER DEFAULT 1,
    late_submission_allowed BOOLEAN DEFAULT true,
    late_penalty_per_day DECIMAL(5,2) DEFAULT 5.00, -- Percentage
    auto_grade BOOLEAN DEFAULT false,
    rubric JSONB, -- Grading rubric
    created_by UUID NOT NULL REFERENCES users(auth_id),
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assignment submissions
CREATE TABLE IF NOT EXISTS assignment_submissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(auth_id),
    submission_text TEXT,
    submission_url TEXT, -- File URL or external link
    submission_files JSONB, -- Array of file objects
    submitted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_late BOOLEAN DEFAULT false,
    grade DECIMAL(5,2), -- Actual points earned
    percentage DECIMAL(5,2), -- Percentage score
    feedback TEXT,
    rubric_scores JSONB, -- Detailed rubric scoring
    graded_by UUID REFERENCES users(auth_id),
    graded_at TIMESTAMP WITH TIME ZONE,
    status VARCHAR(20) DEFAULT 'submitted' CHECK (status IN ('draft', 'submitted', 'graded', 'returned')),
    attempt_number INTEGER DEFAULT 1,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(assignment_id, user_id, attempt_number)
);

-- =============================================
-- COURSE MATERIALS
-- =============================================

-- Course materials table
CREATE TABLE IF NOT EXISTS course_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL CHECK (type IN ('document', 'video', 'audio', 'link', 'image', 'presentation', 'code', 'other')),
    url TEXT NOT NULL,
    file_size INTEGER, -- Size in bytes
    file_type VARCHAR(50), -- MIME type
    thumbnail_url TEXT,
    duration INTEGER, -- For videos/audio in seconds
    tags TEXT[], -- Array of tags
    is_public BOOLEAN DEFAULT false,
    download_allowed BOOLEAN DEFAULT true,
    view_count INTEGER DEFAULT 0,
    download_count INTEGER DEFAULT 0,
    folder_path TEXT, -- For organizing materials
    created_by UUID NOT NULL REFERENCES users(auth_id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- MESSAGING AND COMMUNICATION
-- =============================================

-- Conversations table
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    participants UUID[] NOT NULL, -- Array of user IDs
    subject VARCHAR(255) NOT NULL,
    course_id UUID REFERENCES courses(id),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
    is_group BOOLEAN DEFAULT false,
    last_message TEXT,
    last_message_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Messages table
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(auth_id),
    content TEXT NOT NULL,
    attachments TEXT[], -- Array of file URLs
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'file', 'image', 'video', 'audio')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    reply_to UUID REFERENCES messages(id), -- For threaded conversations
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ANNOUNCEMENTS AND NOTIFICATIONS
-- =============================================

-- Announcements table
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    course_id UUID REFERENCES courses(id),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('normal', 'high', 'urgent')),
    is_public BOOLEAN DEFAULT false, -- Public announcements visible to all
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'lecturers', 'specific')),
    target_users UUID[], -- Specific users if target_audience is 'specific'
    expires_at TIMESTAMP WITH TIME ZONE,
    attachments TEXT[], -- Array of file URLs
    is_pinned BOOLEAN DEFAULT false,
    view_count INTEGER DEFAULT 0,
    created_by UUID NOT NULL REFERENCES users(auth_id),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(auth_id),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL CHECK (type IN ('assignment', 'grade', 'message', 'announcement', 'reminder', 'system')),
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP WITH TIME ZONE,
    related_id UUID, -- ID of related object (assignment, message, etc.)
    related_type VARCHAR(50), -- Type of related object
    action_url TEXT, -- URL to navigate to when clicked
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ANALYTICS AND TRACKING
-- =============================================

-- Analytics data table
CREATE TABLE IF NOT EXISTS analytics_data (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(auth_id),
    course_id UUID REFERENCES courses(id),
    activity_type VARCHAR(50) NOT NULL, -- login, logout, material_view, assignment_submission, etc.
    activity_details JSONB, -- Additional activity-specific data
    duration_seconds INTEGER, -- For activities with duration
    ip_address INET,
    user_agent TEXT,
    device_type VARCHAR(50), -- desktop, mobile, tablet
    browser VARCHAR(50),
    os VARCHAR(50),
    related_id UUID, -- ID of related object
    related_type VARCHAR(50), -- Type of related object
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- STORAGE BUCKETS (for Supabase Storage)
-- =============================================

-- Note: These are created through Supabase dashboard or API, not SQL
-- But documenting the bucket structure:
-- - course-materials: For course material files
-- - assignment-submissions: For student submission files
-- - message-attachments: For message attachment files
-- - user-avatars: For user profile pictures
-- - announcement-attachments: For announcement files

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);

-- Courses indexes
CREATE INDEX IF NOT EXISTS idx_courses_code ON courses(code);
CREATE INDEX IF NOT EXISTS idx_courses_department ON courses(department);
CREATE INDEX IF NOT EXISTS idx_courses_created_by ON courses(created_by);
CREATE INDEX IF NOT EXISTS idx_courses_semester_year ON courses(semester, year);

-- Course enrollments indexes
CREATE INDEX IF NOT EXISTS idx_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_course_id ON course_enrollments(course_id);
CREATE INDEX IF NOT EXISTS idx_enrollments_status ON course_enrollments(status);

-- Assignments indexes
CREATE INDEX IF NOT EXISTS idx_assignments_course_id ON assignments(course_id);
CREATE INDEX IF NOT EXISTS idx_assignments_due_date ON assignments(due_date);
CREATE INDEX IF NOT EXISTS idx_assignments_created_by ON assignments(created_by);

-- Assignment submissions indexes
CREATE INDEX IF NOT EXISTS idx_submissions_assignment_id ON assignment_submissions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_submissions_user_id ON assignment_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_submissions_submitted_at ON assignment_submissions(submitted_at);
CREATE INDEX IF NOT EXISTS idx_submissions_graded_by ON assignment_submissions(graded_by);

-- Course materials indexes
CREATE INDEX IF NOT EXISTS idx_materials_course_id ON course_materials(course_id);
CREATE INDEX IF NOT EXISTS idx_materials_type ON course_materials(type);
CREATE INDEX IF NOT EXISTS idx_materials_created_by ON course_materials(created_by);
CREATE INDEX IF NOT EXISTS idx_materials_tags ON course_materials USING GIN(tags);

-- Messages and conversations indexes
CREATE INDEX IF NOT EXISTS idx_conversations_participants ON conversations USING GIN(participants);
CREATE INDEX IF NOT EXISTS idx_conversations_course_id ON conversations(course_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at);

-- Notifications indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_data(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_course_id ON analytics_data(course_id);
CREATE INDEX IF NOT EXISTS idx_analytics_activity_type ON analytics_data(activity_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_data(created_at);

-- Announcements indexes
CREATE INDEX IF NOT EXISTS idx_announcements_course_id ON announcements(course_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_announcements_is_public ON announcements(is_public);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data ENABLE ROW LEVEL SECURITY;

-- =============================================
-- USERS TABLE POLICIES
-- =============================================

-- Users can read their own profile and other users in their courses
CREATE POLICY "Users can read own profile" ON users
    FOR SELECT USING (auth_id = auth.uid());

-- Users can update their own profile
CREATE POLICY "Users can update own profile" ON users
    FOR UPDATE USING (auth_id = auth.uid());

-- Allow user registration (insert)
CREATE POLICY "Allow user registration" ON users
    FOR INSERT WITH CHECK (auth_id = auth.uid());

-- =============================================
-- COURSES TABLE POLICIES
-- =============================================

-- Lecturers can read/update their own courses
CREATE POLICY "Lecturers can manage own courses" ON courses
    FOR ALL USING (created_by = auth.uid());

-- Students can read courses they're enrolled in
CREATE POLICY "Students can read enrolled courses" ON courses
    FOR SELECT USING (
        id IN (
            SELECT course_id FROM course_enrollments
            WHERE user_id = auth.uid() AND status = 'enrolled'
        )
    );

-- Admins and deans can read all courses
CREATE POLICY "Admins can read all courses" ON courses
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'dean')
        )
    );

-- =============================================
-- COURSE ENROLLMENTS POLICIES
-- =============================================

-- Users can read their own enrollments
CREATE POLICY "Users can read own enrollments" ON course_enrollments
    FOR SELECT USING (user_id = auth.uid());

-- Lecturers can read enrollments for their courses
CREATE POLICY "Lecturers can read course enrollments" ON course_enrollments
    FOR SELECT USING (
        course_id IN (
            SELECT id FROM courses WHERE created_by = auth.uid()
        )
    );

-- Lecturers can update enrollments for their courses
CREATE POLICY "Lecturers can update course enrollments" ON course_enrollments
    FOR UPDATE USING (
        course_id IN (
            SELECT id FROM courses WHERE created_by = auth.uid()
        )
    );

-- =============================================
-- ASSIGNMENTS POLICIES
-- =============================================

-- Lecturers can manage assignments for their courses
CREATE POLICY "Lecturers can manage assignments" ON assignments
    FOR ALL USING (
        course_id IN (
            SELECT id FROM courses WHERE created_by = auth.uid()
        )
    );

-- Students can read assignments for enrolled courses
CREATE POLICY "Students can read course assignments" ON assignments
    FOR SELECT USING (
        course_id IN (
            SELECT course_id FROM course_enrollments
            WHERE user_id = auth.uid() AND status = 'enrolled'
        )
    );

-- =============================================
-- ASSIGNMENT SUBMISSIONS POLICIES
-- =============================================

-- Students can manage their own submissions
CREATE POLICY "Students can manage own submissions" ON assignment_submissions
    FOR ALL USING (user_id = auth.uid());

-- Lecturers can read/grade submissions for their assignments
CREATE POLICY "Lecturers can grade submissions" ON assignment_submissions
    FOR ALL USING (
        assignment_id IN (
            SELECT a.id FROM assignments a
            JOIN courses c ON a.course_id = c.id
            WHERE c.created_by = auth.uid()
        )
    );

-- =============================================
-- COURSE MATERIALS POLICIES
-- =============================================

-- Lecturers can manage materials for their courses
CREATE POLICY "Lecturers can manage course materials" ON course_materials
    FOR ALL USING (created_by = auth.uid());

-- Students can read materials for enrolled courses
CREATE POLICY "Students can read course materials" ON course_materials
    FOR SELECT USING (
        course_id IN (
            SELECT course_id FROM course_enrollments
            WHERE user_id = auth.uid() AND status = 'enrolled'
        )
    );

-- Public materials can be read by anyone
CREATE POLICY "Public materials readable by all" ON course_materials
    FOR SELECT USING (is_public = true);

-- =============================================
-- MESSAGING POLICIES
-- =============================================

-- Users can read conversations they participate in
CREATE POLICY "Users can read own conversations" ON conversations
    FOR SELECT USING (auth.uid() = ANY(participants));

-- Users can create conversations
CREATE POLICY "Users can create conversations" ON conversations
    FOR INSERT WITH CHECK (auth.uid() = ANY(participants));

-- Users can update conversations they participate in
CREATE POLICY "Users can update own conversations" ON conversations
    FOR UPDATE USING (auth.uid() = ANY(participants));

-- Users can read messages in their conversations
CREATE POLICY "Users can read conversation messages" ON messages
    FOR SELECT USING (
        conversation_id IN (
            SELECT id FROM conversations
            WHERE auth.uid() = ANY(participants)
        )
    );

-- Users can send messages to their conversations
CREATE POLICY "Users can send messages" ON messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid() AND
        conversation_id IN (
            SELECT id FROM conversations
            WHERE auth.uid() = ANY(participants)
        )
    );

-- =============================================
-- NOTIFICATIONS POLICIES
-- =============================================

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications" ON notifications
    FOR SELECT USING (user_id = auth.uid());

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications" ON notifications
    FOR UPDATE USING (user_id = auth.uid());

-- System can create notifications for any user
CREATE POLICY "System can create notifications" ON notifications
    FOR INSERT WITH CHECK (true);

-- =============================================
-- ANNOUNCEMENTS POLICIES
-- =============================================

-- Lecturers can manage announcements for their courses
CREATE POLICY "Lecturers can manage course announcements" ON announcements
    FOR ALL USING (created_by = auth.uid());

-- Students can read announcements for enrolled courses
CREATE POLICY "Students can read course announcements" ON announcements
    FOR SELECT USING (
        course_id IN (
            SELECT course_id FROM course_enrollments
            WHERE user_id = auth.uid() AND status = 'enrolled'
        ) OR is_public = true
    );

-- Public announcements can be read by anyone
CREATE POLICY "Public announcements readable by all" ON announcements
    FOR SELECT USING (is_public = true);

-- =============================================
-- ANALYTICS POLICIES
-- =============================================

-- Users can read their own analytics data
CREATE POLICY "Users can read own analytics" ON analytics_data
    FOR SELECT USING (user_id = auth.uid());

-- Lecturers can read analytics for their courses
CREATE POLICY "Lecturers can read course analytics" ON analytics_data
    FOR SELECT USING (
        course_id IN (
            SELECT id FROM courses WHERE created_by = auth.uid()
        )
    );

-- System can insert analytics data
CREATE POLICY "System can insert analytics" ON analytics_data
    FOR INSERT WITH CHECK (true);

-- =============================================
-- FUNCTIONS AND TRIGGERS
-- =============================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add updated_at triggers to all tables
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_courses_updated_at BEFORE UPDATE ON courses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enrollments_updated_at BEFORE UPDATE ON course_enrollments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assignments_updated_at BEFORE UPDATE ON assignments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_submissions_updated_at BEFORE UPDATE ON assignment_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON course_materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_conversations_updated_at BEFORE UPDATE ON conversations
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at BEFORE UPDATE ON messages
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_announcements_updated_at BEFORE UPDATE ON announcements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_notifications_updated_at BEFORE UPDATE ON notifications
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
