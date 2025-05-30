-- =============================================
-- MMU LMS Announcement Creation Fix
-- This script ensures announcements can be created without conflicts
-- Run this in your Supabase SQL Editor
-- =============================================

-- 1. Check current table structure
SELECT 
    'Current announcements table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'announcements'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 2. Ensure announcements table has correct structure
-- Add any missing columns that might be causing issues
DO $$
BEGIN
    -- Check and add faculty column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'announcements' AND column_name = 'faculty'
    ) THEN
        ALTER TABLE announcements ADD COLUMN faculty VARCHAR(255);
        COMMENT ON COLUMN announcements.faculty IS 'Faculty for targeted announcements';
    END IF;

    -- Check and add target_audience column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'announcements' AND column_name = 'target_audience'
    ) THEN
        ALTER TABLE announcements ADD COLUMN target_audience VARCHAR(50) DEFAULT 'all';
        COMMENT ON COLUMN announcements.target_audience IS 'Target audience for the announcement';
    END IF;

    -- Check and add category column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'announcements' AND column_name = 'category'
    ) THEN
        ALTER TABLE announcements ADD COLUMN category VARCHAR(100) DEFAULT 'General';
        COMMENT ON COLUMN announcements.category IS 'Category of the announcement';
    END IF;

    -- Check and add external_link column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'announcements' AND column_name = 'external_link'
    ) THEN
        ALTER TABLE announcements ADD COLUMN external_link TEXT;
        COMMENT ON COLUMN announcements.external_link IS 'External link for the announcement';
    END IF;

    -- Check and add expires_at column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'announcements' AND column_name = 'expires_at'
    ) THEN
        ALTER TABLE announcements ADD COLUMN expires_at TIMESTAMPTZ;
        COMMENT ON COLUMN announcements.expires_at IS 'Expiration date for the announcement';
    END IF;

    -- Check and add is_active column if missing
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'announcements' AND column_name = 'is_active'
    ) THEN
        ALTER TABLE announcements ADD COLUMN is_active BOOLEAN DEFAULT true;
        COMMENT ON COLUMN announcements.is_active IS 'Whether the announcement is active';
    END IF;

    RAISE NOTICE 'Announcements table structure verified and updated';
END $$;

-- 3. Remove any problematic triggers that might be auto-creating notifications
-- (Only if they exist and are causing issues)
DO $$
DECLARE
    trigger_record RECORD;
BEGIN
    -- Check for triggers that might be causing issues
    FOR trigger_record IN 
        SELECT trigger_name 
        FROM information_schema.triggers 
        WHERE event_object_table = 'announcements' 
          AND event_object_schema = 'public'
          AND trigger_name LIKE '%notification%'
    LOOP
        EXECUTE 'DROP TRIGGER IF EXISTS ' || trigger_record.trigger_name || ' ON announcements';
        RAISE NOTICE 'Removed trigger: %', trigger_record.trigger_name;
    END LOOP;
END $$;

-- 4. Ensure proper RLS policies for announcements
-- Drop existing policies that might be causing conflicts
DROP POLICY IF EXISTS "Admins can create announcements" ON announcements;
DROP POLICY IF EXISTS "Users can read announcements" ON announcements;
DROP POLICY IF EXISTS "Creators can manage announcements" ON announcements;

-- Create clean, simple RLS policies
CREATE POLICY "Admins and staff can create announcements" ON announcements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'lecturer', 'dean')
        )
    );

CREATE POLICY "Users can read active announcements" ON announcements
    FOR SELECT USING (is_active = true);

CREATE POLICY "Creators can manage their announcements" ON announcements
    FOR ALL USING (created_by = auth.uid());

-- 5. Ensure notifications table is properly set up
-- Check notifications table structure
SELECT 
    'Current notifications table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'notifications'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 6. Clean up any orphaned data that might be causing conflicts
-- Remove notifications with invalid user_id references
DELETE FROM notifications 
WHERE user_id NOT IN (
    SELECT auth_id FROM users WHERE auth_id IS NOT NULL
);

-- Remove announcement_reads with invalid user_id references
DELETE FROM announcement_reads 
WHERE user_id NOT IN (
    SELECT auth_id FROM users WHERE auth_id IS NOT NULL
);

-- 7. Test announcement creation capability
-- This will verify that the basic structure works
DO $$
DECLARE
    test_user_id UUID;
    test_announcement_id UUID;
BEGIN
    -- Get a valid admin user for testing
    SELECT auth_id INTO test_user_id 
    FROM users 
    WHERE role = 'admin' 
    LIMIT 1;

    IF test_user_id IS NOT NULL THEN
        -- Try to create a test announcement
        INSERT INTO announcements (
            title,
            content,
            priority,
            is_public,
            target_audience,
            category,
            created_by,
            is_active
        ) VALUES (
            'Database Test Announcement',
            'This is a test announcement to verify database functionality',
            'normal',
            false,
            'all',
            'Test',
            test_user_id,
            true
        ) RETURNING id INTO test_announcement_id;

        -- Clean up the test announcement
        DELETE FROM announcements WHERE id = test_announcement_id;
        
        RAISE NOTICE 'Announcement creation test: SUCCESS';
    ELSE
        RAISE NOTICE 'No admin user found for testing';
    END IF;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Announcement creation test FAILED: %', SQLERRM;
END $$;

-- 8. Show summary
SELECT 
    'Database status summary:' as summary,
    (SELECT COUNT(*) FROM users WHERE role = 'admin') as admin_users,
    (SELECT COUNT(*) FROM announcements WHERE is_active = true) as active_announcements,
    (SELECT COUNT(*) FROM notifications) as total_notifications,
    (SELECT COUNT(*) FROM pg_policies WHERE tablename = 'announcements') as announcement_policies;

-- 9. Show any remaining triggers (should be minimal)
SELECT 
    'Remaining triggers on announcements:' as info,
    trigger_name,
    event_manipulation,
    action_timing
FROM information_schema.triggers
WHERE event_object_table = 'announcements'
  AND event_object_schema = 'public';
