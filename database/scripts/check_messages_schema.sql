-- =============================================
-- MMU LMS Messages Table Schema Check
-- This script checks the actual structure of your messages table
-- Run this in your Supabase SQL Editor to see what columns exist
-- =============================================

-- Check if messages table exists and show its structure
SELECT 
    'Messages table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'messages' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Check if conversations table exists and show its structure
SELECT 
    'Conversations table structure:' as info,
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns 
WHERE table_name = 'conversations' 
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Show sample data from messages table (if any exists)
SELECT 
    'Sample messages data:' as info,
    COUNT(*) as total_messages
FROM messages;

-- Show sample data from conversations table (if any exists)
SELECT 
    'Sample conversations data:' as info,
    COUNT(*) as total_conversations
FROM conversations;

-- Check if the tables have the expected foreign key relationships
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
  AND tc.table_name IN ('messages', 'conversations');

-- Test a simple insert to see what columns are actually required
-- (This will show an error if columns don't exist)
SELECT 
    'Testing message insert compatibility...' as test_info;

-- Note: Uncomment the lines below to test actual insert
-- (Comment them back after testing)

/*
INSERT INTO messages (
    conversation_id,
    sender_id,
    content,
    is_read,
    created_at
) VALUES (
    '00000000-0000-0000-0000-000000000000'::uuid,  -- dummy conversation_id
    '00000000-0000-0000-0000-000000000000'::uuid,  -- dummy sender_id
    'Test message',
    false,
    NOW()
) RETURNING id, conversation_id, sender_id, content, is_read, created_at;

-- Clean up the test message
DELETE FROM messages WHERE content = 'Test message';
*/
