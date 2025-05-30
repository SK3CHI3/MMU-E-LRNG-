-- =============================================
-- MMU LMS Announcement Triggers & Policies Check
-- This script checks for any triggers or policies that might be
-- automatically creating notifications when announcements are inserted
-- =============================================

-- 1. Check for triggers on announcements table
SELECT 
    'Triggers on announcements table:' as info,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'announcements'
  AND event_object_schema = 'public';

-- 2. Check for triggers on notifications table
SELECT 
    'Triggers on notifications table:' as info,
    trigger_name,
    event_manipulation,
    action_timing,
    action_statement
FROM information_schema.triggers
WHERE event_object_table = 'notifications'
  AND event_object_schema = 'public';

-- 3. Check RLS policies on announcements table
SELECT 
    'RLS policies on announcements:' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'announcements';

-- 4. Check RLS policies on notifications table
SELECT 
    'RLS policies on notifications:' as info,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies
WHERE tablename = 'notifications';

-- 5. Check for functions that might be called by triggers
SELECT 
    'Functions that might be triggers:' as info,
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND (routine_name LIKE '%announcement%' OR routine_name LIKE '%notification%')
  AND routine_type = 'FUNCTION';

-- 6. Check foreign key constraints
SELECT 
    'Foreign key constraints:' as info,
    tc.constraint_name,
    tc.table_name,
    kcu.column_name,
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name
FROM information_schema.table_constraints AS tc 
JOIN information_schema.key_column_usage AS kcu
    ON tc.constraint_name = kcu.constraint_name
    AND tc.table_schema = kcu.table_schema
JOIN information_schema.constraint_column_usage AS ccu
    ON ccu.constraint_name = tc.constraint_name
    AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND tc.table_name IN ('announcements', 'notifications');

-- 7. Check table structure
SELECT 
    'Announcements table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'announcements'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 8. Check notifications table structure
SELECT 
    'Notifications table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'notifications'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- 9. Test announcement creation (safe test)
-- This will help identify exactly where the error occurs
-- Uncomment to test with valid data

/*
-- Test 1: Try to create announcement without notifications
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
    'Test Announcement',
    'This is a test announcement to check for triggers',
    'normal',
    true,
    'all',
    'Test',
    (SELECT auth_id FROM users WHERE role = 'admin' LIMIT 1),
    true
) RETURNING id, title, created_by;

-- Clean up test
DELETE FROM announcements WHERE title = 'Test Announcement';
*/

-- 10. Check for any Edge Functions or webhooks
SELECT 
    'Database extensions that might affect announcements:' as info,
    extname as extension_name,
    extversion as version
FROM pg_extension
WHERE extname IN ('supabase_vault', 'pg_net', 'http');

-- 11. Show recent failed operations (if any logs exist)
-- This might help identify the exact issue
SELECT 
    'Recent announcements (last 5):' as info,
    id,
    title,
    created_by,
    is_public,
    target_audience,
    created_at
FROM announcements
WHERE is_active = true
ORDER BY created_at DESC
LIMIT 5;
