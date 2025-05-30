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
    department VARCHAR(255), -- For deans: faculty they head; For students/lecturers: auto-determined from programme
    faculty VARCHAR(255), -- Faculty name (required for all roles except admin)
    student_id VARCHAR(50) UNIQUE, -- Only for students
    staff_id VARCHAR(50) UNIQUE, -- For lecturers and deans
    phone VARCHAR(20),
    avatar_url TEXT,
    date_of_birth DATE,
    address TEXT,
    emergency_contact JSONB,
    programme_id UUID REFERENCES programmes(id), -- Reference to programmes table (for students and lecturers)
    current_semester INTEGER DEFAULT 1,
    year_of_study INTEGER DEFAULT 1,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- ACADEMIC STRUCTURE
-- =============================================

-- Programmes table
CREATE TABLE IF NOT EXISTS programmes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    level VARCHAR(50) NOT NULL CHECK (level IN ('certificate', 'diploma', 'bachelors', 'masters', 'phd')),
    faculty VARCHAR(255) NOT NULL,
    department VARCHAR(255),
    duration_years INTEGER NOT NULL DEFAULT 4,
    total_units INTEGER NOT NULL DEFAULT 40,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Academic calendar table
CREATE TABLE IF NOT EXISTS academic_calendar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year VARCHAR(20) NOT NULL, -- e.g., "2024/2025"
    current_semester VARCHAR(20) NOT NULL, -- e.g., "Semester 1", "Semester 2"
    semester_start_date DATE NOT NULL,
    semester_end_date DATE NOT NULL,
    registration_start_date DATE,
    registration_end_date DATE,
    exam_start_date DATE,
    exam_end_date DATE,
    is_current BOOLEAN DEFAULT false,
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
    department VARCHAR(255) NOT NULL,
    level VARCHAR(50) NOT NULL CHECK (level IN ('undergraduate', 'graduate', 'postgraduate')),
    semester VARCHAR(20) NOT NULL CHECK (semester IN ('fall', 'spring', 'summer')),
    year INTEGER NOT NULL,
    max_students INTEGER DEFAULT 50,
    prerequisites TEXT[], -- Array of course codes
    syllabus_url TEXT,
    programme_id UUID REFERENCES programmes(id),
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
    assignment_type VARCHAR(50) DEFAULT 'homework' CHECK (assignment_type IN ('homework', 'quiz', 'exam', 'project', 'lab', 'cat')),
    submission_format VARCHAR(50) DEFAULT 'file' CHECK (submission_format IN ('file', 'text', 'url', 'code', 'online_exam')),
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

    -- Exam/Quiz specific fields
    duration_minutes INTEGER, -- Time limit for exams/quizzes in minutes
    max_attempts INTEGER DEFAULT 1, -- Maximum number of attempts allowed
    shuffle_questions BOOLEAN DEFAULT false, -- Randomize question order
    shuffle_options BOOLEAN DEFAULT false, -- Randomize MCQ option order
    show_results_immediately BOOLEAN DEFAULT false, -- Show results after submission
    show_correct_answers BOOLEAN DEFAULT false, -- Show correct answers after submission
    require_lockdown_browser BOOLEAN DEFAULT false, -- Require secure browser
    allow_backtrack BOOLEAN DEFAULT true, -- Allow going back to previous questions
    question_per_page INTEGER DEFAULT 1, -- Questions per page (1 = one question per page)
    passing_score DECIMAL(5,2), -- Minimum score to pass (percentage)

    -- Scheduling
    available_from TIMESTAMP WITH TIME ZONE, -- When exam becomes available
    available_until TIMESTAMP WITH TIME ZONE, -- When exam is no longer available

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
-- EXAM AND QUIZ SYSTEM
-- =============================================

-- Exam questions table
CREATE TABLE IF NOT EXISTS exam_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('mcq', 'essay', 'short_answer', 'true_false')),
    question_order INTEGER NOT NULL DEFAULT 1,
    points DECIMAL(5,2) NOT NULL DEFAULT 1,

    -- MCQ specific fields
    options JSONB, -- Array of option objects: [{"text": "Option A", "is_correct": true}, ...]
    correct_answers JSONB, -- Array of correct option indices for multiple correct answers

    -- Essay specific fields
    max_words INTEGER, -- Maximum word count for essays
    rubric JSONB, -- Grading rubric for essays

    -- Short answer specific fields
    expected_keywords JSONB, -- Array of expected keywords for auto-grading
    case_sensitive BOOLEAN DEFAULT false,

    -- General settings
    explanation TEXT, -- Explanation shown after submission
    time_limit INTEGER, -- Time limit in seconds for this question (optional)
    is_required BOOLEAN DEFAULT true,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exam attempts table (for tracking student exam sessions)
CREATE TABLE IF NOT EXISTS exam_attempts (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    assignment_id UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(auth_id),
    attempt_number INTEGER NOT NULL DEFAULT 1,
    started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    submitted_at TIMESTAMP WITH TIME ZONE,
    time_remaining INTEGER, -- Remaining time in seconds
    is_completed BOOLEAN DEFAULT false,
    auto_submitted BOOLEAN DEFAULT false, -- True if submitted due to time limit
    ip_address INET,
    user_agent TEXT,
    status VARCHAR(20) DEFAULT 'in_progress' CHECK (status IN ('in_progress', 'submitted', 'graded', 'abandoned')),

    -- Proctoring fields (for future use)
    browser_lock_enabled BOOLEAN DEFAULT false,
    tab_switches INTEGER DEFAULT 0,
    suspicious_activity JSONB,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(assignment_id, user_id, attempt_number)
);

-- Exam answers table (student responses to questions)
CREATE TABLE IF NOT EXISTS exam_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    attempt_id UUID NOT NULL REFERENCES exam_attempts(id) ON DELETE CASCADE,
    question_id UUID NOT NULL REFERENCES exam_questions(id) ON DELETE CASCADE,

    -- Answer content
    answer_text TEXT, -- For essay and short answer questions
    selected_options JSONB, -- Array of selected option indices for MCQ
    answer_files JSONB, -- File attachments for answers

    -- Grading
    points_earned DECIMAL(5,2) DEFAULT 0,
    is_correct BOOLEAN, -- For auto-gradable questions
    auto_graded BOOLEAN DEFAULT false,
    manual_feedback TEXT,
    graded_by UUID REFERENCES users(auth_id),
    graded_at TIMESTAMP WITH TIME ZONE,

    -- Timing
    time_spent INTEGER, -- Time spent on this question in seconds
    answered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(attempt_id, question_id)
);

-- Exam templates table (for reusable exam structures)
CREATE TABLE IF NOT EXISTS exam_templates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    created_by UUID NOT NULL REFERENCES users(auth_id),
    template_name VARCHAR(255) NOT NULL,
    description TEXT,
    subject_area VARCHAR(255),
    difficulty_level VARCHAR(20) CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    estimated_duration INTEGER, -- In minutes
    question_structure JSONB, -- Template structure for questions
    is_public BOOLEAN DEFAULT false, -- Can other lecturers use this template
    usage_count INTEGER DEFAULT 0,

    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
-- CLASS SCHEDULING AND TIMETABLES
-- =============================================

-- Class sessions table for scheduling
CREATE TABLE IF NOT EXISTS class_sessions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    session_date DATE NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    location VARCHAR(255),
    is_online BOOLEAN DEFAULT false,
    meeting_link TEXT,
    meeting_password VARCHAR(50),
    max_attendees INTEGER,
    session_type VARCHAR(50) DEFAULT 'lecture' CHECK (session_type IN ('lecture', 'lab', 'tutorial', 'seminar', 'exam', 'other')),
    status VARCHAR(20) DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled', 'postponed')),
    cancellation_reason TEXT,
    notes TEXT,
    created_by UUID NOT NULL REFERENCES users(auth_id),
    is_recurring BOOLEAN DEFAULT false,
    recurrence_pattern JSONB, -- For recurring sessions
    parent_session_id UUID REFERENCES class_sessions(id), -- For recurring sessions
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Class attendance tracking
CREATE TABLE IF NOT EXISTS class_attendance (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(auth_id),
    status VARCHAR(20) DEFAULT 'absent' CHECK (status IN ('present', 'absent', 'late', 'excused')),
    check_in_time TIMESTAMP WITH TIME ZONE,
    check_out_time TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    marked_by UUID REFERENCES users(auth_id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(session_id, user_id)
);

-- Session materials and resources
CREATE TABLE IF NOT EXISTS session_materials (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
    material_id UUID REFERENCES course_materials(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    url TEXT,
    material_type VARCHAR(50) DEFAULT 'document' CHECK (material_type IN ('document', 'video', 'audio', 'link', 'presentation', 'code')),
    is_required BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
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
    faculty VARCHAR(255), -- Faculty for targeting announcements
    priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
    is_public BOOLEAN DEFAULT false, -- Public announcements visible to all
    target_audience VARCHAR(50) DEFAULT 'all' CHECK (target_audience IN ('all', 'students', 'lecturers', 'faculty', 'course')),
    target_users UUID[], -- Specific users if target_audience is 'specific'
    expires_at TIMESTAMP WITH TIME ZONE,
    attachments JSONB, -- JSON array of attachment objects
    external_link TEXT, -- External link for clickable notifications
    category VARCHAR(50) DEFAULT 'General', -- Category for filtering
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

-- Announcement reads table (for tracking which announcements users have read)
CREATE TABLE IF NOT EXISTS announcement_reads (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(auth_id),
    announcement_id UUID NOT NULL REFERENCES announcements(id) ON DELETE CASCADE,
    read_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, announcement_id)
);

-- =============================================
-- STUDENT FEES AND PAYMENTS
-- =============================================

-- Student fees table
CREATE TABLE IF NOT EXISTS student_fees (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(auth_id),
    academic_year VARCHAR(20) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    total_fees DECIMAL(10,2) NOT NULL DEFAULT 0,
    amount_paid DECIMAL(10,2) NOT NULL DEFAULT 0,
    due_date DATE,
    registration_threshold INTEGER DEFAULT 60, -- Percentage required for registration
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, academic_year, semester)
);

-- Payment history table
CREATE TABLE IF NOT EXISTS payment_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(auth_id),
    amount DECIMAL(10,2) NOT NULL,
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('mpesa', 'bank_transfer', 'cash', 'cheque', 'card')),
    reference_number VARCHAR(100) UNIQUE NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
    description TEXT,
    phone_number VARCHAR(20),
    account_number VARCHAR(50),
    transaction_id VARCHAR(100),
    processed_at TIMESTAMP WITH TIME ZONE,
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
-- SYSTEM SETTINGS TABLE
-- =============================================

-- System settings table for global configuration
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    setting_type VARCHAR(50) NOT NULL CHECK (setting_type IN ('string', 'number', 'boolean', 'object', 'array')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('general', 'email', 'security', 'system', 'appearance', 'notifications')),
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- Whether this setting can be read by non-admin users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(auth_id),
    updated_by UUID REFERENCES users(auth_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_public ON system_settings(is_public);

-- =============================================
-- SESSION ATTACHMENTS TABLE
-- =============================================

CREATE TABLE session_attachments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES class_sessions(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    original_name VARCHAR(255) NOT NULL,
    file_size BIGINT NOT NULL,
    file_type VARCHAR(100) NOT NULL,
    file_path TEXT NOT NULL,
    uploaded_by UUID NOT NULL REFERENCES users(auth_id) ON DELETE CASCADE,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

-- Users indexes
CREATE INDEX IF NOT EXISTS idx_users_auth_id ON users(auth_id);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_users_department ON users(department);
CREATE INDEX IF NOT EXISTS idx_users_faculty ON users(faculty);
CREATE INDEX IF NOT EXISTS idx_users_student_id ON users(student_id);
CREATE INDEX IF NOT EXISTS idx_users_staff_id ON users(staff_id);
CREATE INDEX IF NOT EXISTS idx_users_programme_id ON users(programme_id);

-- Programmes indexes
CREATE INDEX IF NOT EXISTS idx_programmes_code ON programmes(code);
CREATE INDEX IF NOT EXISTS idx_programmes_faculty ON programmes(faculty);
CREATE INDEX IF NOT EXISTS idx_programmes_level ON programmes(level);

-- Academic calendar indexes
CREATE INDEX IF NOT EXISTS idx_academic_calendar_year ON academic_calendar(academic_year);
CREATE INDEX IF NOT EXISTS idx_academic_calendar_current ON academic_calendar(is_current);

-- Student fees indexes
CREATE INDEX IF NOT EXISTS idx_student_fees_student_id ON student_fees(student_id);
CREATE INDEX IF NOT EXISTS idx_student_fees_academic_year ON student_fees(academic_year);
CREATE INDEX IF NOT EXISTS idx_student_fees_active ON student_fees(is_active);

-- Payment history indexes
CREATE INDEX IF NOT EXISTS idx_payment_history_student_id ON payment_history(student_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_reference ON payment_history(reference_number);
CREATE INDEX IF NOT EXISTS idx_payment_history_status ON payment_history(status);

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

-- Announcement reads indexes
CREATE INDEX IF NOT EXISTS idx_announcement_reads_user_id ON announcement_reads(user_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_announcement_id ON announcement_reads(announcement_id);
CREATE INDEX IF NOT EXISTS idx_announcement_reads_read_at ON announcement_reads(read_at);

-- Exam questions indexes
CREATE INDEX IF NOT EXISTS idx_exam_questions_assignment_id ON exam_questions(assignment_id);
CREATE INDEX IF NOT EXISTS idx_exam_questions_type ON exam_questions(question_type);
CREATE INDEX IF NOT EXISTS idx_exam_questions_order ON exam_questions(question_order);

-- Exam attempts indexes
CREATE INDEX IF NOT EXISTS idx_exam_attempts_assignment_id ON exam_attempts(assignment_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_user_id ON exam_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_status ON exam_attempts(status);
CREATE INDEX IF NOT EXISTS idx_exam_attempts_started_at ON exam_attempts(started_at);

-- Exam answers indexes
CREATE INDEX IF NOT EXISTS idx_exam_answers_attempt_id ON exam_answers(attempt_id);
CREATE INDEX IF NOT EXISTS idx_exam_answers_question_id ON exam_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_exam_answers_graded_by ON exam_answers(graded_by);

-- Exam templates indexes
CREATE INDEX IF NOT EXISTS idx_exam_templates_created_by ON exam_templates(created_by);
CREATE INDEX IF NOT EXISTS idx_exam_templates_subject_area ON exam_templates(subject_area);
CREATE INDEX IF NOT EXISTS idx_exam_templates_difficulty ON exam_templates(difficulty_level);
CREATE INDEX IF NOT EXISTS idx_exam_templates_public ON exam_templates(is_public);

-- Analytics indexes
CREATE INDEX IF NOT EXISTS idx_analytics_user_id ON analytics_data(user_id);
CREATE INDEX IF NOT EXISTS idx_analytics_course_id ON analytics_data(course_id);
CREATE INDEX IF NOT EXISTS idx_analytics_activity_type ON analytics_data(activity_type);
CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_data(created_at);

-- Session attachments indexes
CREATE INDEX IF NOT EXISTS idx_session_attachments_session_id ON session_attachments(session_id);
CREATE INDEX IF NOT EXISTS idx_session_attachments_uploaded_by ON session_attachments(uploaded_by);

-- Announcements indexes
CREATE INDEX IF NOT EXISTS idx_announcements_course_id ON announcements(course_id);
CREATE INDEX IF NOT EXISTS idx_announcements_created_by ON announcements(created_by);
CREATE INDEX IF NOT EXISTS idx_announcements_is_public ON announcements(is_public);
CREATE INDEX IF NOT EXISTS idx_announcements_faculty ON announcements(faculty);
CREATE INDEX IF NOT EXISTS idx_announcements_target_audience ON announcements(target_audience);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
CREATE INDEX IF NOT EXISTS idx_announcements_created_at ON announcements(created_at);

-- Class sessions indexes
CREATE INDEX IF NOT EXISTS idx_class_sessions_course_id ON class_sessions(course_id);
CREATE INDEX IF NOT EXISTS idx_class_sessions_created_by ON class_sessions(created_by);
CREATE INDEX IF NOT EXISTS idx_class_sessions_date ON class_sessions(session_date);
CREATE INDEX IF NOT EXISTS idx_class_sessions_status ON class_sessions(status);
CREATE INDEX IF NOT EXISTS idx_class_sessions_date_time ON class_sessions(session_date, start_time);

-- Class attendance indexes
CREATE INDEX IF NOT EXISTS idx_class_attendance_session_id ON class_attendance(session_id);
CREATE INDEX IF NOT EXISTS idx_class_attendance_user_id ON class_attendance(user_id);
CREATE INDEX IF NOT EXISTS idx_class_attendance_status ON class_attendance(status);

-- Session materials indexes
CREATE INDEX IF NOT EXISTS idx_session_materials_session_id ON session_materials(session_id);
CREATE INDEX IF NOT EXISTS idx_session_materials_material_id ON session_materials(material_id);

-- =============================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- =============================================

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE programmes ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_fees ENABLE ROW LEVEL SECURITY;
ALTER TABLE payment_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignment_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE course_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE class_attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_materials ENABLE ROW LEVEL SECURITY;
ALTER TABLE conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_templates ENABLE ROW LEVEL SECURITY;

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

-- Admins and lecturers can create announcements
CREATE POLICY "Admins and lecturers can create announcements" ON announcements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'lecturer', 'dean')
        )
    );

-- Users can manage their own announcements
CREATE POLICY "Users can manage own announcements" ON announcements
    FOR ALL USING (created_by = auth.uid());

-- Users can read announcements targeted to them
CREATE POLICY "Users can read targeted announcements" ON announcements
    FOR SELECT USING (
        is_public = true OR
        created_by = auth.uid() OR
        (
            target_audience = 'all' OR
            (target_audience = 'students' AND EXISTS (
                SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'student'
            )) OR
            (target_audience = 'lecturers' AND EXISTS (
                SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'lecturer'
            )) OR
            (target_audience = 'faculty' AND EXISTS (
                SELECT 1 FROM users WHERE auth_id = auth.uid() AND faculty = announcements.faculty
            )) OR
            (target_audience = 'course' AND course_id IN (
                SELECT course_id FROM course_enrollments
                WHERE user_id = auth.uid() AND status = 'enrolled'
            ))
        )
    );

-- =============================================
-- CLASS SESSIONS POLICIES
-- =============================================

-- Lecturers can manage sessions for their courses
CREATE POLICY "Lecturers can manage class sessions" ON class_sessions
    FOR ALL USING (
        course_id IN (
            SELECT id FROM courses WHERE created_by = auth.uid()
        )
    );

-- Students can read sessions for enrolled courses
CREATE POLICY "Students can read class sessions" ON class_sessions
    FOR SELECT USING (
        course_id IN (
            SELECT course_id FROM course_enrollments
            WHERE user_id = auth.uid() AND status = 'enrolled'
        )
    );

-- Admins and deans can read all sessions
CREATE POLICY "Admins can read all class sessions" ON class_sessions
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'dean')
        )
    );

-- =============================================
-- CLASS ATTENDANCE POLICIES
-- =============================================

-- Users can read their own attendance
CREATE POLICY "Users can read own attendance" ON class_attendance
    FOR SELECT USING (user_id = auth.uid());

-- Lecturers can manage attendance for their sessions
CREATE POLICY "Lecturers can manage attendance" ON class_attendance
    FOR ALL USING (
        session_id IN (
            SELECT cs.id FROM class_sessions cs
            JOIN courses c ON cs.course_id = c.id
            WHERE c.created_by = auth.uid()
        )
    );

-- =============================================
-- SESSION MATERIALS POLICIES
-- =============================================

-- Students can read session materials for enrolled courses
CREATE POLICY "Students can read session materials" ON session_materials
    FOR SELECT USING (
        session_id IN (
            SELECT cs.id FROM class_sessions cs
            JOIN course_enrollments ce ON cs.course_id = ce.course_id
            WHERE ce.user_id = auth.uid() AND ce.status = 'enrolled'
        )
    );

-- Lecturers can manage session materials for their courses
CREATE POLICY "Lecturers can manage session materials" ON session_materials
    FOR ALL USING (
        session_id IN (
            SELECT cs.id FROM class_sessions cs
            JOIN courses c ON cs.course_id = c.id
            WHERE c.created_by = auth.uid()
        )
    );

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

CREATE TRIGGER update_programmes_updated_at BEFORE UPDATE ON programmes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_academic_calendar_updated_at BEFORE UPDATE ON academic_calendar
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_student_fees_updated_at BEFORE UPDATE ON student_fees
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payment_history_updated_at BEFORE UPDATE ON payment_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =============================================
-- ADDITIONAL RLS POLICIES FOR NEW TABLES
-- =============================================

-- Programmes policies (readable by all authenticated users)
CREATE POLICY "All users can read programmes" ON programmes
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Academic calendar policies (readable by all authenticated users)
CREATE POLICY "All users can read academic calendar" ON academic_calendar
    FOR SELECT USING (auth.uid() IS NOT NULL);

-- Student fees policies
CREATE POLICY "Students can read own fees" ON student_fees
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Admins can read all fees" ON student_fees
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'dean')
        )
    );

-- Payment history policies
CREATE POLICY "Students can read own payment history" ON payment_history
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Students can insert own payments" ON payment_history
    FOR INSERT WITH CHECK (student_id = auth.uid());

CREATE POLICY "Admins can read all payment history" ON payment_history
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'dean')
        )
    );

-- =============================================
-- EXAM SYSTEM RLS POLICIES
-- =============================================

-- Exam questions policies
CREATE POLICY "Lecturers can manage exam questions" ON exam_questions
    FOR ALL USING (
        assignment_id IN (
            SELECT a.id FROM assignments a
            JOIN courses c ON a.course_id = c.id
            WHERE c.created_by = auth.uid()
        )
    );

CREATE POLICY "Students can read exam questions during attempts" ON exam_questions
    FOR SELECT USING (
        assignment_id IN (
            SELECT assignment_id FROM exam_attempts
            WHERE user_id = auth.uid() AND status = 'in_progress'
        )
    );

-- Exam attempts policies
CREATE POLICY "Students can manage own exam attempts" ON exam_attempts
    FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Lecturers can read exam attempts for their assignments" ON exam_attempts
    FOR SELECT USING (
        assignment_id IN (
            SELECT a.id FROM assignments a
            JOIN courses c ON a.course_id = c.id
            WHERE c.created_by = auth.uid()
        )
    );

-- Exam answers policies
CREATE POLICY "Students can manage own exam answers" ON exam_answers
    FOR ALL USING (
        attempt_id IN (
            SELECT id FROM exam_attempts WHERE user_id = auth.uid()
        )
    );

CREATE POLICY "Lecturers can read/grade exam answers" ON exam_answers
    FOR ALL USING (
        attempt_id IN (
            SELECT ea.id FROM exam_attempts ea
            JOIN assignments a ON ea.assignment_id = a.id
            JOIN courses c ON a.course_id = c.id
            WHERE c.created_by = auth.uid()
        )
    );

-- Exam templates policies
CREATE POLICY "Lecturers can manage own exam templates" ON exam_templates
    FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Lecturers can read public exam templates" ON exam_templates
    FOR SELECT USING (
        is_public = true OR created_by = auth.uid()
    );

-- Announcement reads policies
CREATE POLICY "Users can manage own announcement reads" ON announcement_reads
    FOR ALL USING (user_id = auth.uid());
