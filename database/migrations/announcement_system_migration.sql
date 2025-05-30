-- =============================================
-- MMU LMS Announcement System Migration
-- =============================================
-- This migration adds comprehensive announcement system support
-- Run this script in your Supabase SQL editor

-- Add faculty column to announcements table if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'announcements' 
        AND column_name = 'faculty'
    ) THEN
        ALTER TABLE announcements ADD COLUMN faculty VARCHAR(255);
    END IF;
END $$;

-- Update target_audience check constraint to include new values
ALTER TABLE announcements DROP CONSTRAINT IF EXISTS announcements_target_audience_check;
ALTER TABLE announcements ADD CONSTRAINT announcements_target_audience_check 
    CHECK (target_audience IN ('all', 'students', 'lecturers', 'faculty', 'course'));

-- Update category default value
ALTER TABLE announcements ALTER COLUMN category SET DEFAULT 'General';

-- Add new indexes for better performance
CREATE INDEX IF NOT EXISTS idx_announcements_faculty ON announcements(faculty);
CREATE INDEX IF NOT EXISTS idx_announcements_target_audience ON announcements(target_audience);
CREATE INDEX IF NOT EXISTS idx_announcements_priority ON announcements(priority);
CREATE INDEX IF NOT EXISTS idx_announcements_is_active ON announcements(is_active);
CREATE INDEX IF NOT EXISTS idx_announcements_expires_at ON announcements(expires_at);

-- Drop old announcement policies
DROP POLICY IF EXISTS "Lecturers can manage course announcements" ON announcements;
DROP POLICY IF EXISTS "Students can read course announcements" ON announcements;
DROP POLICY IF EXISTS "Public announcements readable by all" ON announcements;

-- Create new comprehensive announcement policies
CREATE POLICY "Admins and lecturers can create announcements" ON announcements
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE auth_id = auth.uid()
            AND role IN ('admin', 'lecturer', 'dean')
        )
    );

CREATE POLICY "Users can manage own announcements" ON announcements
    FOR ALL USING (created_by = auth.uid());

CREATE POLICY "Users can read targeted announcements" ON announcements
    FOR SELECT USING (
        is_public = true OR
        created_by = auth.uid() OR
        (
            is_active = true AND
            (expires_at IS NULL OR expires_at > NOW()) AND
            (
                target_audience = 'all' OR
                (target_audience = 'students' AND EXISTS (
                    SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'student'
                )) OR
                (target_audience = 'lecturers' AND EXISTS (
                    SELECT 1 FROM users WHERE auth_id = auth.uid() AND role = 'lecturer'
                )) OR
                (target_audience = 'faculty' AND EXISTS (
                    SELECT 1 FROM users WHERE auth_id = auth.uid() AND faculty = announcements.faculty
                )) OR
                (target_audience = 'course' AND course_id IN (
                    SELECT course_id FROM course_enrollments
                    WHERE user_id = auth.uid() AND status = 'enrolled'
                ))
            )
        )
    );

-- Update existing announcements to have proper faculty values
UPDATE announcements 
SET faculty = (
    SELECT u.faculty 
    FROM users u 
    WHERE u.auth_id = announcements.created_by
)
WHERE faculty IS NULL AND created_by IS NOT NULL;

-- Create a function to automatically set faculty for new announcements
CREATE OR REPLACE FUNCTION set_announcement_faculty()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.faculty IS NULL THEN
        SELECT faculty INTO NEW.faculty
        FROM users
        WHERE auth_id = NEW.created_by;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically set faculty
DROP TRIGGER IF EXISTS trigger_set_announcement_faculty ON announcements;
CREATE TRIGGER trigger_set_announcement_faculty
    BEFORE INSERT ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION set_announcement_faculty();

-- Create a function to clean up expired announcements
CREATE OR REPLACE FUNCTION cleanup_expired_announcements()
RETURNS void AS $$
BEGIN
    UPDATE announcements 
    SET is_active = false 
    WHERE expires_at IS NOT NULL 
    AND expires_at < NOW() 
    AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Create a function to get announcement statistics
CREATE OR REPLACE FUNCTION get_announcement_stats(user_auth_id UUID)
RETURNS TABLE (
    total_announcements BIGINT,
    public_announcements BIGINT,
    urgent_announcements BIGINT,
    recent_announcements BIGINT
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        COUNT(*) as total_announcements,
        COUNT(*) FILTER (WHERE is_public = true) as public_announcements,
        COUNT(*) FILTER (WHERE priority = 'urgent') as urgent_announcements,
        COUNT(*) FILTER (WHERE created_at >= NOW() - INTERVAL '7 days') as recent_announcements
    FROM announcements
    WHERE created_by = user_auth_id AND is_active = true;
END;
$$ LANGUAGE plpgsql;

-- Insert sample announcement categories if they don't exist
INSERT INTO announcements (
    title, content, priority, is_public, target_audience, category, created_by, faculty
) 
SELECT 
    'Welcome to MMU Digital Campus',
    'Welcome to the new MMU Digital Campus Experience! This platform will enhance your learning journey with modern tools and seamless communication.',
    'normal',
    true,
    'all',
    'General',
    (SELECT auth_id FROM users WHERE role = 'admin' LIMIT 1),
    'All Faculties'
WHERE NOT EXISTS (
    SELECT 1 FROM announcements WHERE title = 'Welcome to MMU Digital Campus'
) AND EXISTS (
    SELECT 1 FROM users WHERE role = 'admin'
);

-- Create view for public announcements (for landing page)
CREATE OR REPLACE VIEW public_announcements AS
SELECT 
    a.id,
    a.title,
    a.content,
    a.priority,
    a.category,
    a.external_link,
    a.created_at,
    a.expires_at,
    u.full_name as author_name,
    u.role as author_role
FROM announcements a
JOIN users u ON a.created_by = u.auth_id
WHERE a.is_public = true 
AND a.is_active = true 
AND (a.expires_at IS NULL OR a.expires_at > NOW())
ORDER BY 
    CASE a.priority 
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'normal' THEN 3
        WHEN 'low' THEN 4
    END,
    a.created_at DESC;

-- Grant permissions on the view
GRANT SELECT ON public_announcements TO anon, authenticated;

-- Create view for user-specific announcements
CREATE OR REPLACE VIEW user_announcements AS
SELECT 
    a.id,
    a.title,
    a.content,
    a.priority,
    a.category,
    a.target_audience,
    a.external_link,
    a.created_at,
    a.expires_at,
    u.full_name as author_name,
    u.role as author_role,
    c.title as course_name,
    c.code as course_code
FROM announcements a
JOIN users u ON a.created_by = u.auth_id
LEFT JOIN courses c ON a.course_id = c.id
WHERE a.is_active = true 
AND (a.expires_at IS NULL OR a.expires_at > NOW())
ORDER BY 
    CASE a.priority 
        WHEN 'urgent' THEN 1
        WHEN 'high' THEN 2
        WHEN 'normal' THEN 3
        WHEN 'low' THEN 4
    END,
    a.created_at DESC;

-- Grant permissions on the view
GRANT SELECT ON user_announcements TO authenticated;

-- Create notification trigger for new announcements
CREATE OR REPLACE FUNCTION notify_announcement_created()
RETURNS TRIGGER AS $$
BEGIN
    -- This function can be extended to send real-time notifications
    -- For now, it just logs the announcement creation
    INSERT INTO analytics_data (
        user_id, 
        activity_type, 
        activity_details,
        related_id,
        related_type
    ) VALUES (
        NEW.created_by,
        'announcement_created',
        jsonb_build_object(
            'title', NEW.title,
            'priority', NEW.priority,
            'target_audience', NEW.target_audience,
            'is_public', NEW.is_public
        ),
        NEW.id,
        'announcement'
    );
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for announcement notifications
DROP TRIGGER IF EXISTS trigger_notify_announcement_created ON announcements;
CREATE TRIGGER trigger_notify_announcement_created
    AFTER INSERT ON announcements
    FOR EACH ROW
    EXECUTE FUNCTION notify_announcement_created();

-- Verification queries
-- Run these to verify the migration was successful

-- Check if faculty column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'announcements' AND column_name = 'faculty';

-- Check if new indexes exist
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'announcements' 
AND indexname LIKE 'idx_announcements_%';

-- Check if policies exist
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'announcements';

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN (
    'set_announcement_faculty',
    'cleanup_expired_announcements',
    'get_announcement_stats',
    'notify_announcement_created'
);

-- Check if views exist
SELECT table_name 
FROM information_schema.views 
WHERE table_name IN ('public_announcements', 'user_announcements');

-- Success message
SELECT 'Announcement system migration completed successfully!' as status;
