-- =============================================
-- MMU LMS Student Portal Database Update
-- Creates necessary tables and functions for dynamic student portal
-- =============================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =============================================
-- 1. UPDATE EXISTING TABLES
-- =============================================

-- Update users table to ensure semester tracking fields exist
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS current_semester INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS year_of_study INTEGER DEFAULT 1,
ADD COLUMN IF NOT EXISTS programme_id UUID;

-- Update courses table to ensure required fields exist
ALTER TABLE courses 
ADD COLUMN IF NOT EXISTS credits INTEGER DEFAULT 3,
ADD COLUMN IF NOT EXISTS academic_year VARCHAR(20) DEFAULT '2024/2025';

-- =============================================
-- 2. ACADEMIC CALENDAR TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS academic_calendar (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year VARCHAR(20) NOT NULL, -- e.g., "2024/2025"
    semester_name VARCHAR(50) NOT NULL, -- e.g., "Semester 1", "Semester 2"
    semester_code VARCHAR(10) NOT NULL, -- e.g., "1.1", "1.2", "2.1", "2.2"
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

-- Insert current academic calendar data
INSERT INTO academic_calendar (academic_year, semester_name, semester_code, semester_start_date, semester_end_date, registration_start_date, registration_end_date, is_current, is_active) VALUES
('2024/2025', 'Semester 1', '1.1', '2024-09-01', '2024-12-15', '2024-08-15', '2024-09-15', true, true),
('2024/2025', 'Semester 2', '1.2', '2025-01-15', '2025-05-15', '2024-12-01', '2025-01-10', false, true),
('2024/2025', 'Summer Semester', '1.3', '2025-05-20', '2025-08-20', '2025-05-01', '2025-05-15', false, true)
ON CONFLICT DO NOTHING;

-- =============================================
-- 3. REGISTRATION PERIODS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS registration_periods (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    academic_year VARCHAR(20) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    max_units_per_student INTEGER DEFAULT 7,
    min_fee_percentage INTEGER DEFAULT 60, -- Minimum fee percentage required for registration
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert current registration period
INSERT INTO registration_periods (academic_year, semester, start_date, end_date, is_active) VALUES
('2024/2025', '1.1', CURRENT_DATE, CURRENT_DATE + INTERVAL '30 days', true)
ON CONFLICT DO NOTHING;

-- =============================================
-- 4. PROGRAMMES TABLE (if not exists)
-- =============================================

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

-- Insert sample programmes
INSERT INTO programmes (id, code, title, level, faculty, department, duration_years, total_units) VALUES
('10000000-0000-0000-0000-000000000001', 'BSCS', 'Bachelor of Science in Computer Science', 'bachelors', 'Faculty of Computing and Information Technology', 'Computer Science', 4, 40),
('10000000-0000-0000-0000-000000000002', 'BSIT', 'Bachelor of Science in Information Technology', 'bachelors', 'Faculty of Computing and Information Technology', 'Information Technology', 4, 40),
('10000000-0000-0000-0000-000000000003', 'BENG', 'Bachelor of Engineering', 'bachelors', 'Faculty of Engineering', 'Engineering', 4, 40),
('10000000-0000-0000-0000-000000000004', 'BCOM', 'Bachelor of Commerce', 'bachelors', 'Faculty of Business and Economics', 'Business Administration', 4, 40),
('10000000-0000-0000-0000-000000000005', 'MSIT', 'Master of Science in Information Technology', 'masters', 'Faculty of Computing and Information Technology', 'Information Technology', 2, 16)
ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 5. AVAILABLE UNITS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS available_units (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    course_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    programme_id UUID NOT NULL REFERENCES programmes(id),
    registration_period_id UUID NOT NULL REFERENCES registration_periods(id),
    semester VARCHAR(20) NOT NULL,
    academic_year VARCHAR(20) NOT NULL,
    year_level INTEGER NOT NULL, -- Which year of study this unit is for
    max_students INTEGER DEFAULT 50,
    current_enrollment INTEGER DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 6. UNIT PREREQUISITES TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS unit_prerequisites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    unit_id UUID NOT NULL REFERENCES courses(id) ON DELETE CASCADE,
    prerequisite_code VARCHAR(20) NOT NULL, -- Course code that is required
    is_mandatory BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 7. STUDENT ACADEMIC RECORDS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS student_academic_records (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(auth_id),
    academic_year VARCHAR(20) NOT NULL,
    semester VARCHAR(20) NOT NULL,
    year_of_study INTEGER NOT NULL,
    semester_gpa DECIMAL(3,2) DEFAULT 0.00,
    cumulative_gpa DECIMAL(3,2) DEFAULT 0.00,
    units_registered INTEGER DEFAULT 0,
    units_completed INTEGER DEFAULT 0,
    units_failed INTEGER DEFAULT 0,
    total_credit_hours INTEGER DEFAULT 0,
    is_current BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(student_id, academic_year, semester)
);

-- =============================================
-- 8. REGISTRATION LOGS TABLE
-- =============================================

CREATE TABLE IF NOT EXISTS registration_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id UUID NOT NULL REFERENCES users(auth_id),
    action VARCHAR(50) NOT NULL, -- 'unit_registration', 'unit_drop', etc.
    details JSONB, -- Additional details about the action
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =============================================
-- 9. DATABASE FUNCTIONS
-- =============================================

-- Function to increment unit enrollment count
CREATE OR REPLACE FUNCTION increment_unit_enrollment(unit_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE available_units 
    SET current_enrollment = current_enrollment + 1,
        updated_at = NOW()
    WHERE course_id = unit_id;
END;
$$ LANGUAGE plpgsql;

-- Function to decrement unit enrollment count
CREATE OR REPLACE FUNCTION decrement_unit_enrollment(unit_id UUID)
RETURNS void AS $$
BEGIN
    UPDATE available_units 
    SET current_enrollment = GREATEST(current_enrollment - 1, 0),
        updated_at = NOW()
    WHERE course_id = unit_id;
END;
$$ LANGUAGE plpgsql;

-- Function to calculate student GPA
CREATE OR REPLACE FUNCTION calculate_student_gpa(student_auth_id UUID)
RETURNS DECIMAL(3,2) AS $$
DECLARE
    total_grade_points DECIMAL(10,2) := 0;
    total_credit_hours INTEGER := 0;
    gpa DECIMAL(3,2) := 0;
BEGIN
    SELECT 
        COALESCE(SUM(ce.grade_points * c.credits), 0),
        COALESCE(SUM(c.credits), 0)
    INTO total_grade_points, total_credit_hours
    FROM course_enrollments ce
    JOIN courses c ON ce.course_id = c.id
    WHERE ce.user_id = student_auth_id 
    AND ce.grade_points IS NOT NULL;
    
    IF total_credit_hours > 0 THEN
        gpa := total_grade_points / total_credit_hours;
    END IF;
    
    RETURN ROUND(gpa, 2);
END;
$$ LANGUAGE plpgsql;

-- Function to update student academic record
CREATE OR REPLACE FUNCTION update_student_academic_record(
    student_auth_id UUID,
    academic_year_param VARCHAR(20),
    semester_param VARCHAR(20)
)
RETURNS void AS $$
DECLARE
    student_year INTEGER;
    semester_gpa DECIMAL(3,2);
    cumulative_gpa DECIMAL(3,2);
    units_registered INTEGER;
    units_completed INTEGER;
    units_failed INTEGER;
BEGIN
    -- Get student's year of study
    SELECT year_of_study INTO student_year
    FROM users WHERE auth_id = student_auth_id;
    
    -- Calculate semester statistics
    SELECT 
        COUNT(*) as registered,
        COUNT(CASE WHEN ce.status = 'completed' AND ce.grade != 'F' THEN 1 END) as completed,
        COUNT(CASE WHEN ce.grade = 'F' THEN 1 END) as failed
    INTO units_registered, units_completed, units_failed
    FROM course_enrollments ce
    JOIN courses c ON ce.course_id = c.id
    WHERE ce.user_id = student_auth_id;
    
    -- Calculate GPAs
    semester_gpa := calculate_student_gpa(student_auth_id);
    cumulative_gpa := semester_gpa; -- For now, same as semester GPA
    
    -- Insert or update academic record
    INSERT INTO student_academic_records (
        student_id, academic_year, semester, year_of_study,
        semester_gpa, cumulative_gpa, units_registered, 
        units_completed, units_failed, is_current
    ) VALUES (
        student_auth_id, academic_year_param, semester_param, student_year,
        semester_gpa, cumulative_gpa, units_registered,
        units_completed, units_failed, true
    )
    ON CONFLICT (student_id, academic_year, semester)
    DO UPDATE SET
        semester_gpa = EXCLUDED.semester_gpa,
        cumulative_gpa = EXCLUDED.cumulative_gpa,
        units_registered = EXCLUDED.units_registered,
        units_completed = EXCLUDED.units_completed,
        units_failed = EXCLUDED.units_failed,
        updated_at = NOW();
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- 10. ROW LEVEL SECURITY POLICIES
-- =============================================

-- Enable RLS on new tables
ALTER TABLE academic_calendar ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE available_units ENABLE ROW LEVEL SECURITY;
ALTER TABLE unit_prerequisites ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_academic_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE registration_logs ENABLE ROW LEVEL SECURITY;

-- Academic Calendar Policies (readable by all authenticated users)
CREATE POLICY "Academic calendar readable by all" ON academic_calendar
    FOR SELECT USING (auth.role() = 'authenticated');

-- Registration Periods Policies
CREATE POLICY "Registration periods readable by all" ON registration_periods
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Registration periods manageable by admin" ON registration_periods
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'dean')
        )
    );

-- Available Units Policies
CREATE POLICY "Available units readable by students" ON available_units
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Available units manageable by lecturers" ON available_units
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'dean', 'lecturer')
        )
    );

-- Unit Prerequisites Policies
CREATE POLICY "Unit prerequisites readable by all" ON unit_prerequisites
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Unit prerequisites manageable by lecturers" ON unit_prerequisites
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'dean', 'lecturer')
        )
    );

-- Student Academic Records Policies
CREATE POLICY "Students can read own academic records" ON student_academic_records
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Lecturers can read student records in their courses" ON student_academic_records
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'dean', 'lecturer')
        )
    );

CREATE POLICY "Academic records manageable by admin" ON student_academic_records
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'dean')
        )
    );

-- Registration Logs Policies
CREATE POLICY "Students can read own registration logs" ON registration_logs
    FOR SELECT USING (student_id = auth.uid());

CREATE POLICY "Registration logs manageable by admin" ON registration_logs
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'dean')
        )
    );
