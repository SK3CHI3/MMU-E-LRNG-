-- =============================================
-- MMU LMS Notification Cleanup Script
-- This script cleans up orphaned notification records
-- Run this in your Supabase SQL Editor to fix foreign key issues
-- =============================================

-- 1. Check for orphaned notifications (notifications with invalid user_id)
SELECT 
    'Orphaned notifications found:' as info,
    COUNT(*) as orphaned_count
FROM notifications n
LEFT JOIN users u ON n.user_id = u.auth_id
WHERE u.auth_id IS NULL;

-- 2. Check for orphaned announcement_reads
SELECT 
    'Orphaned announcement reads found:' as info,
    COUNT(*) as orphaned_count
FROM announcement_reads ar
LEFT JOIN users u ON ar.user_id = u.auth_id
WHERE u.auth_id IS NULL;

-- 3. Clean up orphaned notifications (CAREFUL: This deletes data)
-- Uncomment the lines below only if you want to delete orphaned records

/*
DELETE FROM notifications 
WHERE user_id NOT IN (
    SELECT auth_id FROM users WHERE auth_id IS NOT NULL
);
*/

-- 4. Clean up orphaned announcement_reads (CAREFUL: This deletes data)
-- Uncomment the lines below only if you want to delete orphaned records

/*
DELETE FROM announcement_reads 
WHERE user_id NOT IN (
    SELECT auth_id FROM users WHERE auth_id IS NOT NULL
);
*/

-- 5. Show current valid users for reference
SELECT 
    'Valid users in database:' as info,
    COUNT(*) as user_count,
    COUNT(CASE WHEN role = 'student' THEN 1 END) as students,
    COUNT(CASE WHEN role = 'lecturer' THEN 1 END) as lecturers,
    COUNT(CASE WHEN role = 'dean' THEN 1 END) as deans,
    COUNT(CASE WHEN role = 'admin' THEN 1 END) as admins
FROM users 
WHERE auth_id IS NOT NULL;

-- 6. Show recent announcements
SELECT 
    'Recent announcements:' as info,
    id,
    title,
    is_public,
    target_audience,
    created_at
FROM announcements 
WHERE is_active = true 
ORDER BY created_at DESC 
LIMIT 5;

-- 7. Show notification counts by user
SELECT 
    'Notification distribution:' as info,
    u.role,
    COUNT(n.id) as notification_count
FROM users u
LEFT JOIN notifications n ON u.auth_id = n.user_id
WHERE u.auth_id IS NOT NULL
GROUP BY u.role
ORDER BY notification_count DESC;

-- 8. Verify foreign key constraints are working
SELECT 
    'Foreign key constraint check:' as info,
    constraint_name,
    table_name,
    column_name
FROM information_schema.key_column_usage
WHERE constraint_name LIKE '%notifications%'
  AND table_schema = 'public';

-- 9. Test notification creation (safe test)
-- This will show if the foreign key constraint is working properly
-- Uncomment to test with a valid user ID

/*
-- Replace 'your-valid-user-id' with an actual user auth_id from your users table
INSERT INTO notifications (
    user_id,
    title,
    message,
    type,
    priority,
    is_read
) VALUES (
    'your-valid-user-id',
    'Test Notification',
    'This is a test notification to verify foreign key constraints',
    'info',
    'medium',
    false
) RETURNING id, user_id, title;

-- Clean up the test notification
DELETE FROM notifications WHERE title = 'Test Notification';
*/

-- 10. Summary report
SELECT 
    'Database health summary:' as summary,
    (SELECT COUNT(*) FROM users WHERE auth_id IS NOT NULL) as total_users,
    (SELECT COUNT(*) FROM announcements WHERE is_active = true) as active_announcements,
    (SELECT COUNT(*) FROM announcements WHERE is_public = true AND is_active = true) as public_announcements,
    (SELECT COUNT(*) FROM notifications) as total_notifications,
    (SELECT COUNT(*) FROM announcement_reads) as total_announcement_reads;
