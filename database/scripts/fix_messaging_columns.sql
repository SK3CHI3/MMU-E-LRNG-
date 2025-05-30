-- =============================================
-- MMU LMS Messaging Column Fix
-- This script ensures the users table has all required columns for messaging
-- Run this in your Supabase SQL Editor
-- =============================================

-- Check if staff_id column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'staff_id'
    ) THEN
        ALTER TABLE users ADD COLUMN staff_id VARCHAR(50) UNIQUE;
        COMMENT ON COLUMN users.staff_id IS 'Staff ID for lecturers and deans';
        
        -- Create index for performance
        CREATE INDEX IF NOT EXISTS idx_users_staff_id ON users(staff_id);
        
        RAISE NOTICE 'Added staff_id column to users table';
    ELSE
        RAISE NOTICE 'staff_id column already exists';
    END IF;
END $$;

-- Check if faculty column exists, if not add it
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'users' AND column_name = 'faculty'
    ) THEN
        ALTER TABLE users ADD COLUMN faculty VARCHAR(255);
        COMMENT ON COLUMN users.faculty IS 'Faculty name (required for all roles except admin)';
        
        -- Create index for performance
        CREATE INDEX IF NOT EXISTS idx_users_faculty ON users(faculty);
        
        RAISE NOTICE 'Added faculty column to users table';
    ELSE
        RAISE NOTICE 'faculty column already exists';
    END IF;
END $$;

-- Update existing users with faculty information if they don't have it
UPDATE users SET faculty = 'Faculty of Computing and Information Technology'
WHERE faculty IS NULL 
  AND (department LIKE '%Computer%' OR department LIKE '%Information Technology%' OR department LIKE '%Software%' OR department LIKE '%ICT%')
  AND role IN ('student', 'lecturer', 'dean');

UPDATE users SET faculty = 'Faculty of Business and Economics'
WHERE faculty IS NULL 
  AND (department LIKE '%Business%' OR department LIKE '%Commerce%' OR department LIKE '%Finance%' OR department LIKE '%Marketing%' OR department LIKE '%Economics%')
  AND role IN ('student', 'lecturer', 'dean');

UPDATE users SET faculty = 'Faculty of Engineering and Technology'
WHERE faculty IS NULL 
  AND department LIKE '%Engineering%'
  AND role IN ('student', 'lecturer', 'dean');

UPDATE users SET faculty = 'Faculty of Media and Communication'
WHERE faculty IS NULL 
  AND (department LIKE '%Media%' OR department LIKE '%Communication%' OR department LIKE '%Journalism%' OR department LIKE '%Film%')
  AND role IN ('student', 'lecturer', 'dean');

UPDATE users SET faculty = 'Faculty of Science & Technology'
WHERE faculty IS NULL 
  AND (department LIKE '%Chemistry%' OR department LIKE '%Physics%' OR department LIKE '%Mathematics%' OR department LIKE '%Science%')
  AND role IN ('student', 'lecturer', 'dean');

-- Set default faculty for remaining users without faculty
UPDATE users SET faculty = 'Faculty of Computing and Information Technology'
WHERE faculty IS NULL AND role IN ('student', 'lecturer', 'dean');

-- Generate staff_id for lecturers and deans who don't have one
UPDATE users 
SET staff_id = 'STAFF-' || UPPER(SUBSTRING(id::text, 1, 8))
WHERE staff_id IS NULL 
  AND role IN ('lecturer', 'dean');

-- Display summary
SELECT 
    'Users table column status:' as status,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'staff_id') 
         THEN '✅ staff_id exists' 
         ELSE '❌ staff_id missing' END as staff_id_status,
    CASE WHEN EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'faculty') 
         THEN '✅ faculty exists' 
         ELSE '❌ faculty missing' END as faculty_status;

-- Display user counts by faculty
SELECT 
    faculty,
    role,
    COUNT(*) as user_count
FROM users 
WHERE faculty IS NOT NULL
GROUP BY faculty, role
ORDER BY faculty, role;
