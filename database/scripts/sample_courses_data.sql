-- =============================================
-- MMU LMS Sample Courses and Registration Data
-- Populates the database with sample courses and registration periods
-- =============================================

-- =============================================
-- 1. SAMPLE COURSES DATA
-- =============================================

-- Insert sample courses for different programmes
INSERT INTO courses (id, code, title, description, department, level, semester, year, credits, programme_id, created_by, is_active) VALUES
-- Computer Science Courses (Year 1)
('30000000-0000-0000-0000-000000000001', 'CS101', 'Introduction to Programming', 'Basic programming concepts using Python', 'Computer Science', 'undergraduate', 'fall', 2024, 3, '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', true),
('30000000-0000-0000-0000-000000000002', 'CS102', 'Data Structures and Algorithms', 'Fundamental data structures and algorithms', 'Computer Science', 'undergraduate', 'spring', 2024, 4, '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', true),
('30000000-0000-0000-0000-000000000003', 'CS103', 'Mathematics for Computer Science', 'Discrete mathematics and logic', 'Computer Science', 'undergraduate', 'fall', 2024, 3, '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', true),
('30000000-0000-0000-0000-000000000004', 'CS104', 'Computer Systems Architecture', 'Introduction to computer hardware and systems', 'Computer Science', 'undergraduate', 'spring', 2024, 3, '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', true),

-- Computer Science Courses (Year 2)
('30000000-0000-0000-0000-000000000005', 'CS201', 'Object-Oriented Programming', 'Advanced programming using Java', 'Computer Science', 'undergraduate', 'fall', 2024, 4, '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', true),
('30000000-0000-0000-0000-000000000006', 'CS202', 'Database Systems', 'Database design and management', 'Computer Science', 'undergraduate', 'spring', 2024, 4, '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', true),
('30000000-0000-0000-0000-000000000007', 'CS203', 'Web Development', 'Full-stack web development', 'Computer Science', 'undergraduate', 'fall', 2024, 3, '10000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000003', true),

-- Information Technology Courses (Year 1)
('30000000-0000-0000-0000-000000000008', 'IT101', 'Computer Fundamentals', 'Basic computer concepts and applications', 'Information Technology', 'undergraduate', 'fall', 2024, 3, '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', true),
('30000000-0000-0000-0000-000000000009', 'IT102', 'Introduction to Programming', 'Programming basics with multiple languages', 'Information Technology', 'undergraduate', 'spring', 2024, 3, '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', true),
('30000000-0000-0000-0000-000000000010', 'IT103', 'Digital Literacy', 'Essential digital skills and tools', 'Information Technology', 'undergraduate', 'fall', 2024, 2, '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', true),
('30000000-0000-0000-0000-000000000011', 'IT104', 'Mathematics for IT', 'Mathematical foundations for IT', 'Information Technology', 'undergraduate', 'spring', 2024, 3, '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', true),

-- Information Technology Courses (Year 2)
('30000000-0000-0000-0000-000000000012', 'IT201', 'Network Administration', 'Computer networking and administration', 'Information Technology', 'undergraduate', 'fall', 2024, 4, '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', true),
('30000000-0000-0000-0000-000000000013', 'IT202', 'System Administration', 'Server and system management', 'Information Technology', 'undergraduate', 'spring', 2024, 3, '10000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000004', true),

-- Business Courses (Year 1)
('30000000-0000-0000-0000-000000000014', 'BUS101', 'Introduction to Business', 'Fundamentals of business management', 'Business Administration', 'undergraduate', 'fall', 2024, 3, '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', true),
('30000000-0000-0000-0000-000000000015', 'BUS102', 'Accounting Principles', 'Basic accounting concepts and practices', 'Business Administration', 'undergraduate', 'spring', 2024, 3, '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', true),
('30000000-0000-0000-0000-000000000016', 'BUS103', 'Business Mathematics', 'Mathematical applications in business', 'Business Administration', 'undergraduate', 'fall', 2024, 3, '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', true),
('30000000-0000-0000-0000-000000000017', 'BUS104', 'Business Communication', 'Effective business communication skills', 'Business Administration', 'undergraduate', 'spring', 2024, 2, '10000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000005', true),

-- Engineering Courses (Year 1)
('30000000-0000-0000-0000-000000000018', 'ENG101', 'Engineering Mathematics I', 'Calculus and linear algebra for engineers', 'Engineering', 'undergraduate', 'fall', 2024, 4, '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', true),
('30000000-0000-0000-0000-000000000019', 'ENG102', 'Engineering Physics', 'Physics principles for engineering applications', 'Engineering', 'undergraduate', 'spring', 2024, 4, '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', true),
('30000000-0000-0000-0000-000000000020', 'ENG103', 'Engineering Drawing', 'Technical drawing and CAD fundamentals', 'Engineering', 'undergraduate', 'fall', 2024, 3, '10000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', true)

ON CONFLICT (id) DO NOTHING;

-- =============================================
-- 2. AVAILABLE UNITS FOR CURRENT REGISTRATION
-- =============================================

-- Get the current registration period ID and populate available units
DO $$
DECLARE
    current_reg_period_id UUID;
BEGIN
    SELECT id INTO current_reg_period_id 
    FROM registration_periods 
    WHERE is_active = true 
    LIMIT 1;
    
    IF current_reg_period_id IS NOT NULL THEN
        -- Insert available units for current registration period
        INSERT INTO available_units (course_id, programme_id, registration_period_id, semester, academic_year, year_level, max_students) VALUES
        
        -- Year 1 Computer Science Units
        ('30000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', current_reg_period_id, '1.1', '2024/2025', 1, 50),
        ('30000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', current_reg_period_id, '1.1', '2024/2025', 1, 45),
        ('30000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000001', current_reg_period_id, '1.1', '2024/2025', 1, 40),
        
        -- Year 1 Information Technology Units
        ('30000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000002', current_reg_period_id, '1.1', '2024/2025', 1, 40),
        ('30000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000002', current_reg_period_id, '1.1', '2024/2025', 1, 35),
        ('30000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000002', current_reg_period_id, '1.1', '2024/2025', 1, 30),
        
        -- Year 1 Business Units
        ('30000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000004', current_reg_period_id, '1.1', '2024/2025', 1, 60),
        ('30000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000004', current_reg_period_id, '1.1', '2024/2025', 1, 55),
        ('30000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000004', current_reg_period_id, '1.1', '2024/2025', 1, 50),
        
        -- Year 1 Engineering Units
        ('30000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000003', current_reg_period_id, '1.1', '2024/2025', 1, 45),
        ('30000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000003', current_reg_period_id, '1.1', '2024/2025', 1, 40)
        
        ON CONFLICT DO NOTHING;
    END IF;
END $$;

-- =============================================
-- 3. UNIT PREREQUISITES
-- =============================================

INSERT INTO unit_prerequisites (unit_id, prerequisite_code, is_mandatory) VALUES
-- Computer Science Prerequisites
('30000000-0000-0000-0000-000000000002', 'CS101', true), -- Data Structures requires Intro to Programming
('30000000-0000-0000-0000-000000000005', 'CS101', true), -- OOP requires Intro to Programming
('30000000-0000-0000-0000-000000000005', 'CS102', true), -- OOP requires Data Structures
('30000000-0000-0000-0000-000000000006', 'CS102', true), -- Database Systems requires Data Structures
('30000000-0000-0000-0000-000000000007', 'CS101', true), -- Web Dev requires Intro to Programming

-- Information Technology Prerequisites
('30000000-0000-0000-0000-000000000009', 'IT101', true), -- Intro to Programming requires Computer Fundamentals
('30000000-0000-0000-0000-000000000012', 'IT101', true), -- Network Admin requires Computer Fundamentals
('30000000-0000-0000-0000-000000000013', 'IT101', true), -- System Admin requires Computer Fundamentals
('30000000-0000-0000-0000-000000000013', 'IT102', true), -- System Admin requires Intro to Programming

-- Business Prerequisites
('30000000-0000-0000-0000-000000000015', 'BUS101', true), -- Accounting requires Intro to Business

-- Engineering Prerequisites
('30000000-0000-0000-0000-000000000019', 'ENG101', true)  -- Engineering Physics requires Engineering Math I

ON CONFLICT DO NOTHING;

-- =============================================
-- 4. TRIGGERS FOR AUTOMATIC UPDATES
-- =============================================

-- Trigger to update academic records when enrollments change
CREATE OR REPLACE FUNCTION update_academic_record_trigger()
RETURNS TRIGGER AS $$
BEGIN
    -- Update academic record when enrollment status changes
    IF TG_OP = 'UPDATE' AND OLD.status != NEW.status THEN
        PERFORM update_student_academic_record(
            NEW.user_id,
            COALESCE(NEW.academic_year, '2024/2025'),
            COALESCE(NEW.semester, '1.1')
        );
    ELSIF TG_OP = 'INSERT' THEN
        PERFORM update_student_academic_record(
            NEW.user_id,
            COALESCE(NEW.academic_year, '2024/2025'),
            COALESCE(NEW.semester, '1.1')
        );
    END IF;
    
    RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

-- Create trigger on course_enrollments
DROP TRIGGER IF EXISTS academic_record_update_trigger ON course_enrollments;
CREATE TRIGGER academic_record_update_trigger
    AFTER INSERT OR UPDATE ON course_enrollments
    FOR EACH ROW
    EXECUTE FUNCTION update_academic_record_trigger();

-- =============================================
-- 5. INDEXES FOR PERFORMANCE
-- =============================================

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_course_enrollments_user_id ON course_enrollments(user_id);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_status ON course_enrollments(status);
CREATE INDEX IF NOT EXISTS idx_course_enrollments_academic_year ON course_enrollments(academic_year);
CREATE INDEX IF NOT EXISTS idx_student_academic_records_student_id ON student_academic_records(student_id);
CREATE INDEX IF NOT EXISTS idx_student_academic_records_current ON student_academic_records(is_current);
CREATE INDEX IF NOT EXISTS idx_available_units_programme ON available_units(programme_id);
CREATE INDEX IF NOT EXISTS idx_available_units_year_level ON available_units(year_level);
CREATE INDEX IF NOT EXISTS idx_registration_periods_active ON registration_periods(is_active);
CREATE INDEX IF NOT EXISTS idx_courses_programme_id ON courses(programme_id);
CREATE INDEX IF NOT EXISTS idx_courses_academic_year ON courses(academic_year);

-- =============================================
-- 6. HELPER FUNCTIONS FOR STUDENT PORTAL
-- =============================================

-- Function to get current academic period
CREATE OR REPLACE FUNCTION get_current_academic_period()
RETURNS TABLE(academic_year VARCHAR(20), semester_code VARCHAR(10)) AS $$
BEGIN
    RETURN QUERY
    SELECT ac.academic_year, ac.semester_code
    FROM academic_calendar ac
    WHERE ac.is_current = true
    LIMIT 1;
END;
$$ LANGUAGE plpgsql;

-- Function to assign initial semester to new student
CREATE OR REPLACE FUNCTION assign_initial_semester_to_student(student_auth_id UUID)
RETURNS void AS $$
DECLARE
    current_academic_year VARCHAR(20);
    current_semester VARCHAR(10);
BEGIN
    -- Get current academic period
    SELECT academic_year, semester_code 
    INTO current_academic_year, current_semester
    FROM get_current_academic_period()
    LIMIT 1;
    
    -- If no current period found, use default
    IF current_academic_year IS NULL THEN
        current_academic_year := '2024/2025';
        current_semester := '1.1';
    END IF;
    
    -- Update student with initial semester and year
    UPDATE users 
    SET current_semester = 1,
        year_of_study = 1,
        updated_at = NOW()
    WHERE auth_id = student_auth_id 
    AND role = 'student';
    
    -- Create initial academic record
    INSERT INTO student_academic_records (
        student_id, academic_year, semester, year_of_study,
        semester_gpa, cumulative_gpa, units_registered, 
        units_completed, units_failed, is_current
    ) VALUES (
        student_auth_id, current_academic_year, current_semester, 1,
        0.00, 0.00, 0, 0, 0, true
    )
    ON CONFLICT (student_id, academic_year, semester) DO NOTHING;
    
    -- Create initial fee record
    INSERT INTO student_fees (
        student_id, academic_year, semester, total_fees, amount_paid,
        due_date, registration_threshold, is_active
    ) VALUES (
        student_auth_id, current_academic_year, current_semester, 50000, 0,
        CURRENT_DATE + INTERVAL '90 days', 60, true
    )
    ON CONFLICT (student_id, academic_year, semester) DO NOTHING;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- DEPLOYMENT COMPLETE
-- =============================================

-- Log deployment
DO $$
BEGIN
    -- Create deployment_logs table if it doesn't exist
    CREATE TABLE IF NOT EXISTS deployment_logs (
        id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
        script_name VARCHAR(255) NOT NULL,
        deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        description TEXT,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
    );
    
    -- Insert deployment log
    INSERT INTO deployment_logs (script_name, deployed_at, description) VALUES
    ('sample_courses_data.sql', NOW(), 'Sample courses, registration periods, and helper functions for student portal');
END $$;
