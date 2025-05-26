-- =============================================
-- MMU LMS Backend-Frontend Compatibility Migration
-- This script updates the existing database to ensure compatibility with frontend changes
-- Run this script on existing Supabase deployments
-- =============================================

-- =============================================
-- 1. ADD MISSING COLUMNS TO USERS TABLE
-- =============================================

-- Add faculty column if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS faculty VARCHAR(255);

-- Add staff_id column for lecturers and deans if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS staff_id VARCHAR(50) UNIQUE;

-- Add comments to clarify field usage
COMMENT ON COLUMN users.department IS 'For deans: faculty they head; For students/lecturers: auto-determined from programme';
COMMENT ON COLUMN users.faculty IS 'Faculty name (required for all roles except admin)';
COMMENT ON COLUMN users.programme_id IS 'Reference to programmes table (for students and lecturers)';
COMMENT ON COLUMN users.staff_id IS 'Staff ID for lecturers and deans';

-- =============================================
-- 2. FIX SESSION ATTACHMENTS TABLE REFERENCE
-- =============================================

-- Drop the existing foreign key constraint if it exists
ALTER TABLE session_attachments DROP CONSTRAINT IF EXISTS session_attachments_uploaded_by_fkey;

-- Add the correct foreign key constraint
ALTER TABLE session_attachments
ADD CONSTRAINT session_attachments_uploaded_by_fkey
FOREIGN KEY (uploaded_by) REFERENCES users(auth_id) ON DELETE CASCADE;

-- =============================================
-- 3. ADD NEW INDEXES FOR PERFORMANCE
-- =============================================

-- Add index for faculty field
CREATE INDEX IF NOT EXISTS idx_users_faculty ON users(faculty);

-- Add index for staff_id field
CREATE INDEX IF NOT EXISTS idx_users_staff_id ON users(staff_id);

-- =============================================
-- 4. UPDATE EXISTING USER DATA
-- =============================================

-- Update users to include faculty information based on their existing department
UPDATE users SET faculty = 'Faculty of Computing and Information Technology'
WHERE department LIKE '%Computer%' OR department LIKE '%Information Technology%' OR department LIKE '%Software%' OR department LIKE '%ICT%';

UPDATE users SET faculty = 'Faculty of Business and Economics'
WHERE department LIKE '%Business%' OR department LIKE '%Commerce%' OR department LIKE '%Finance%' OR department LIKE '%Marketing%' OR department LIKE '%Procurement%' OR department LIKE '%Economics%';

UPDATE users SET faculty = 'Faculty of Engineering and Technology'
WHERE department LIKE '%Engineering%';

UPDATE users SET faculty = 'Faculty of Media and Communication'
WHERE department LIKE '%Media%' OR department LIKE '%Communication%' OR department LIKE '%Journalism%' OR department LIKE '%Film%' OR department LIKE '%Broadcast%';

UPDATE users SET faculty = 'Faculty of Science & Technology'
WHERE department LIKE '%Chemistry%' OR department LIKE '%Physics%' OR department LIKE '%Mathematics%' OR department LIKE '%Science%';

UPDATE users SET faculty = 'Faculty of Social Sciences and Technology'
WHERE department LIKE '%Psychology%' OR department LIKE '%Sociology%' OR department LIKE '%Political%';

-- Set default faculty for users without a specific match
UPDATE users SET faculty = 'Faculty of Computing and Information Technology'
WHERE faculty IS NULL AND role IN ('student', 'lecturer', 'dean');

-- For deans, set department to the faculty they head
UPDATE users SET department = faculty
WHERE role = 'dean' AND faculty IS NOT NULL;

-- =============================================
-- 5. UPDATE PROGRAMMES TABLE WITH PROPER DEPARTMENT MAPPING
-- =============================================

-- Update existing programmes to have proper department mapping
UPDATE programmes SET department = 'Department of Computer Science'
WHERE title LIKE '%Computer Science%' OR title LIKE '%Software Engineering%';

UPDATE programmes SET department = 'Department of Information Technology'
WHERE title LIKE '%Information Technology%' OR title LIKE '%ICT%';

UPDATE programmes SET department = 'Department of Marketing and Management'
WHERE title LIKE '%Business%' OR title LIKE '%Commerce%' OR title LIKE '%Management%';

UPDATE programmes SET department = 'Department of Finance and Accounting'
WHERE title LIKE '%Finance%' OR title LIKE '%Accounting%' OR title LIKE '%Economics%';

-- =============================================
-- 6. ADD RLS POLICIES FOR NEW FIELDS
-- =============================================

-- Update existing RLS policies to handle faculty field
-- Users can read other users in their faculty
DROP POLICY IF EXISTS "Users can read faculty members" ON users;
CREATE POLICY "Users can read faculty members" ON users
    FOR SELECT USING (
        auth_id = auth.uid() OR
        faculty IN (
            SELECT faculty FROM users WHERE auth_id = auth.uid()
        )
    );

-- =============================================
-- 7. VALIDATION QUERIES
-- =============================================

-- Check that all active users have faculty assigned (except admins)
-- SELECT role, COUNT(*) as count, COUNT(faculty) as with_faculty
-- FROM users
-- WHERE is_active = true
-- GROUP BY role;

-- Check programme-department mapping
-- SELECT faculty, department, COUNT(*) as programme_count
-- FROM programmes
-- GROUP BY faculty, department
-- ORDER BY faculty, department;

-- Check user-faculty distribution
-- SELECT faculty, role, COUNT(*) as user_count
-- FROM users
-- WHERE is_active = true
-- GROUP BY faculty, role
-- ORDER BY faculty, role;

-- =============================================
-- 8. CLEANUP AND OPTIMIZATION
-- =============================================

-- Update table statistics for better query planning
ANALYZE users;
ANALYZE programmes;
ANALYZE session_attachments;

-- =============================================
-- MIGRATION COMPLETE
-- =============================================

-- Log migration completion
INSERT INTO analytics_data (user_id, activity_type, activity_details, created_at)
SELECT
    '00000000-0000-0000-0000-000000000000'::uuid,
    'system_migration',
    '{"migration": "backend_compatibility", "version": "1.0", "timestamp": "' || NOW() || '"}'::jsonb,
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM analytics_data
    WHERE activity_type = 'system_migration'
    AND activity_details->>'migration' = 'backend_compatibility'
);

-- Display completion message
SELECT 'Backend-Frontend Compatibility Migration Completed Successfully!' as status;
