-- =============================================
-- MMU LMS Student Portal Deployment Script
-- Deploys all necessary database changes for the student portal
-- =============================================

-- This script should be run on the Supabase database to enable
-- the dynamic student portal functionality

-- =============================================
-- DEPLOYMENT INSTRUCTIONS
-- =============================================

-- 1. Connect to your Supabase project dashboard
-- 2. Go to SQL Editor
-- 3. Run this script first: student_portal_update.sql
-- 4. Then run: sample_courses_data.sql
-- 5. Verify deployment by checking the deployment_logs table

-- =============================================
-- PRE-DEPLOYMENT CHECKS
-- =============================================

-- Check if required base tables exist
DO $$
BEGIN
    -- Check if users table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Base users table does not exist. Please run the main schema first.';
    END IF;
    
    -- Check if courses table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'courses') THEN
        RAISE EXCEPTION 'Base courses table does not exist. Please run the main schema first.';
    END IF;
    
    -- Check if course_enrollments table exists
    IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'course_enrollments') THEN
        RAISE EXCEPTION 'Base course_enrollments table does not exist. Please run the main schema first.';
    END IF;
    
    RAISE NOTICE 'Pre-deployment checks passed. Ready to deploy student portal updates.';
END $$;

-- =============================================
-- DEPLOYMENT STATUS
-- =============================================

-- Create deployment tracking if it doesn't exist
CREATE TABLE IF NOT EXISTS deployment_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    script_name VARCHAR(255) NOT NULL,
    deployed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    description TEXT,
    status VARCHAR(50) DEFAULT 'success',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Log deployment start
INSERT INTO deployment_logs (script_name, description, status) VALUES
('deploy_student_portal.sql', 'Starting student portal deployment', 'started');

-- =============================================
-- DEPLOYMENT VERIFICATION QUERIES
-- =============================================

-- Function to verify deployment
CREATE OR REPLACE FUNCTION verify_student_portal_deployment()
RETURNS TABLE(
    table_name TEXT,
    exists BOOLEAN,
    row_count BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        'academic_calendar'::TEXT,
        EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'academic_calendar'),
        CASE WHEN EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'academic_calendar') 
             THEN (SELECT count(*) FROM academic_calendar) 
             ELSE 0 END;
             
    RETURN QUERY
    SELECT 
        'registration_periods'::TEXT,
        EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'registration_periods'),
        CASE WHEN EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'registration_periods') 
             THEN (SELECT count(*) FROM registration_periods) 
             ELSE 0 END;
             
    RETURN QUERY
    SELECT 
        'available_units'::TEXT,
        EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'available_units'),
        CASE WHEN EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'available_units') 
             THEN (SELECT count(*) FROM available_units) 
             ELSE 0 END;
             
    RETURN QUERY
    SELECT 
        'unit_prerequisites'::TEXT,
        EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'unit_prerequisites'),
        CASE WHEN EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'unit_prerequisites') 
             THEN (SELECT count(*) FROM unit_prerequisites) 
             ELSE 0 END;
             
    RETURN QUERY
    SELECT 
        'student_academic_records'::TEXT,
        EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'student_academic_records'),
        CASE WHEN EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'student_academic_records') 
             THEN (SELECT count(*) FROM student_academic_records) 
             ELSE 0 END;
             
    RETURN QUERY
    SELECT 
        'programmes'::TEXT,
        EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'programmes'),
        CASE WHEN EXISTS(SELECT FROM information_schema.tables WHERE table_name = 'programmes') 
             THEN (SELECT count(*) FROM programmes) 
             ELSE 0 END;
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- POST-DEPLOYMENT INSTRUCTIONS
-- =============================================

-- Function to display post-deployment instructions
CREATE OR REPLACE FUNCTION show_deployment_instructions()
RETURNS TEXT AS $$
BEGIN
    RETURN '
==============================================
MMU LMS STUDENT PORTAL DEPLOYMENT COMPLETE
==============================================

NEXT STEPS:

1. VERIFY DEPLOYMENT:
   Run: SELECT * FROM verify_student_portal_deployment();
   
2. CHECK SAMPLE DATA:
   - Academic Calendar: SELECT * FROM academic_calendar;
   - Registration Periods: SELECT * FROM registration_periods;
   - Available Units: SELECT * FROM available_units;
   - Sample Courses: SELECT * FROM courses WHERE created_at > NOW() - INTERVAL ''1 hour'';

3. TEST NEW STUDENT FLOW:
   - Register a new student
   - Check if semester 1.1 is auto-assigned
   - Verify academic records are created

4. TEST STUDENT PORTAL:
   - Login as a student
   - Check semester progress (should show empty state)
   - Check academic history (should show empty state)
   - Verify unit registration interface works

5. FUNCTIONS AVAILABLE:
   - assign_initial_semester_to_student(student_auth_id)
   - calculate_student_gpa(student_auth_id)
   - update_student_academic_record(student_id, academic_year, semester)
   - get_current_academic_period()

6. TROUBLESHOOTING:
   - Check deployment_logs table for any issues
   - Verify RLS policies are working correctly
   - Test with different user roles

==============================================
';
END;
$$ LANGUAGE plpgsql;

-- =============================================
-- FINAL DEPLOYMENT LOG
-- =============================================

-- Log successful deployment
INSERT INTO deployment_logs (script_name, description, status) VALUES
('deploy_student_portal.sql', 'Student portal deployment script completed successfully', 'completed');

-- Show instructions
SELECT show_deployment_instructions() as "DEPLOYMENT INSTRUCTIONS";

-- Show verification results
SELECT * FROM verify_student_portal_deployment();

-- =============================================
-- DEPLOYMENT SUMMARY
-- =============================================

SELECT 
    'DEPLOYMENT SUMMARY' as status,
    COUNT(*) as total_logs,
    MAX(deployed_at) as last_deployment
FROM deployment_logs 
WHERE script_name LIKE '%student_portal%';

-- =============================================
-- END OF DEPLOYMENT SCRIPT
-- =============================================
