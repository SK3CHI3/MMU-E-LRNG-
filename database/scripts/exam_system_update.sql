-- =============================================
-- MMU LMS EXAM SYSTEM DATABASE UPDATE
-- =============================================
-- This script adds the missing tables and updates for the exam system
-- Run this on your Supabase database to fix the announcement_reads error
-- and enable the complete exam functionality

-- =============================================
-- 1. CREATE MISSING ANNOUNCEMENT_READS TABLE
-- =============================================

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
-- 2. UPDATE ASSIGNMENTS TABLE FOR EXAM FEATURES
-- =============================================

-- Add exam-specific columns to assignments table if they don't exist
DO $$ 
BEGIN
    -- Check and add duration_minutes column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assignments' AND column_name = 'duration_minutes') THEN
        ALTER TABLE assignments ADD COLUMN duration_minutes INTEGER;
    END IF;

    -- Check and add max_attempts column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assignments' AND column_name = 'max_attempts') THEN
        ALTER TABLE assignments ADD COLUMN max_attempts INTEGER DEFAULT 1;
    END IF;

    -- Check and add shuffle_questions column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assignments' AND column_name = 'shuffle_questions') THEN
        ALTER TABLE assignments ADD COLUMN shuffle_questions BOOLEAN DEFAULT false;
    END IF;

    -- Check and add shuffle_options column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assignments' AND column_name = 'shuffle_options') THEN
        ALTER TABLE assignments ADD COLUMN shuffle_options BOOLEAN DEFAULT false;
    END IF;

    -- Check and add show_results_immediately column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assignments' AND column_name = 'show_results_immediately') THEN
        ALTER TABLE assignments ADD COLUMN show_results_immediately BOOLEAN DEFAULT false;
    END IF;

    -- Check and add show_correct_answers column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assignments' AND column_name = 'show_correct_answers') THEN
        ALTER TABLE assignments ADD COLUMN show_correct_answers BOOLEAN DEFAULT false;
    END IF;

    -- Check and add allow_backtrack column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assignments' AND column_name = 'allow_backtrack') THEN
        ALTER TABLE assignments ADD COLUMN allow_backtrack BOOLEAN DEFAULT true;
    END IF;

    -- Check and add question_per_page column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assignments' AND column_name = 'question_per_page') THEN
        ALTER TABLE assignments ADD COLUMN question_per_page INTEGER DEFAULT 1;
    END IF;

    -- Check and add passing_score column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assignments' AND column_name = 'passing_score') THEN
        ALTER TABLE assignments ADD COLUMN passing_score DECIMAL(5,2);
    END IF;

    -- Check and add available_from column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assignments' AND column_name = 'available_from') THEN
        ALTER TABLE assignments ADD COLUMN available_from TIMESTAMP WITH TIME ZONE;
    END IF;

    -- Check and add available_until column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'assignments' AND column_name = 'available_until') THEN
        ALTER TABLE assignments ADD COLUMN available_until TIMESTAMP WITH TIME ZONE;
    END IF;
END $$;

-- Update assignment_type constraint to include 'cat'
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'assignments_assignment_type_check' 
               AND table_name = 'assignments') THEN
        ALTER TABLE assignments DROP CONSTRAINT assignments_assignment_type_check;
    END IF;
    
    -- Add updated constraint
    ALTER TABLE assignments ADD CONSTRAINT assignments_assignment_type_check 
        CHECK (assignment_type IN ('homework', 'quiz', 'exam', 'project', 'lab', 'cat'));
END $$;

-- Update submission_format constraint to include 'online_exam'
DO $$
BEGIN
    -- Drop existing constraint if it exists
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints 
               WHERE constraint_name = 'assignments_submission_format_check' 
               AND table_name = 'assignments') THEN
        ALTER TABLE assignments DROP CONSTRAINT assignments_submission_format_check;
    END IF;
    
    -- Add updated constraint
    ALTER TABLE assignments ADD CONSTRAINT assignments_submission_format_check 
        CHECK (submission_format IN ('file', 'text', 'url', 'code', 'online_exam'));
END $$;

-- =============================================
-- 3. CREATE EXAM SYSTEM TABLES
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
-- 4. CREATE INDEXES FOR PERFORMANCE
-- =============================================

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

-- =============================================
-- 5. ENABLE ROW LEVEL SECURITY
-- =============================================

-- Enable RLS on new tables
ALTER TABLE announcement_reads ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam_templates ENABLE ROW LEVEL SECURITY;

-- =============================================
-- 6. CREATE RLS POLICIES
-- =============================================

-- Announcement reads policies
CREATE POLICY "Users can manage own announcement reads" ON announcement_reads
    FOR ALL USING (user_id = auth.uid());

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

-- =============================================
-- 7. SUCCESS MESSAGE
-- =============================================

DO $$
BEGIN
    RAISE NOTICE 'MMU LMS Exam System database update completed successfully!';
    RAISE NOTICE 'The following tables have been created/updated:';
    RAISE NOTICE '- announcement_reads (fixes 404 error)';
    RAISE NOTICE '- assignments (enhanced with exam fields)';
    RAISE NOTICE '- exam_questions';
    RAISE NOTICE '- exam_attempts';
    RAISE NOTICE '- exam_answers';
    RAISE NOTICE '- exam_templates';
    RAISE NOTICE 'All indexes and RLS policies have been applied.';
    RAISE NOTICE 'The exam system is now ready for use!';
END $$;
