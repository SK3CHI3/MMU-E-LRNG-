-- =============================================
-- MMU LMS System Settings Migration
-- =============================================
-- This migration creates the system_settings table and populates it with default values
-- Run this script in your Supabase SQL editor

-- Create system_settings table
CREATE TABLE IF NOT EXISTS system_settings (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    setting_key VARCHAR(100) UNIQUE NOT NULL,
    setting_value JSONB NOT NULL,
    setting_type VARCHAR(50) NOT NULL CHECK (setting_type IN ('string', 'number', 'boolean', 'object', 'array')),
    category VARCHAR(50) NOT NULL CHECK (category IN ('general', 'email', 'security', 'system', 'appearance', 'notifications')),
    description TEXT,
    is_public BOOLEAN DEFAULT false, -- Whether this setting can be read by non-admin users
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES users(auth_id),
    updated_by UUID REFERENCES users(auth_id)
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_system_settings_category ON system_settings(category);
CREATE INDEX IF NOT EXISTS idx_system_settings_key ON system_settings(setting_key);
CREATE INDEX IF NOT EXISTS idx_system_settings_public ON system_settings(is_public);

-- Insert default system settings
INSERT INTO system_settings (setting_key, setting_value, setting_type, category, description, is_public) VALUES
-- General Settings
('site_name', '"MMU Learning Management System"', 'string', 'general', 'The name of the learning management system', true),
('site_description', '"Elevating Learning, Empowering Futures"', 'string', 'general', 'Site description or tagline', true),
('site_url', '"https://lms.mmu.ac.ke"', 'string', 'general', 'The main URL of the LMS', true),
('maintenance_mode', 'false', 'boolean', 'general', 'Enable maintenance mode to restrict access', false),
('registration_enabled', 'true', 'boolean', 'general', 'Allow new user registration', false),
('default_language', '"en"', 'string', 'general', 'Default system language', true),
('timezone', '"Africa/Nairobi"', 'string', 'general', 'Default system timezone', true),

-- Email Settings
('email_notifications', 'true', 'boolean', 'email', 'Enable email notifications', false),
('smtp_host', '""', 'string', 'email', 'SMTP server host', false),
('smtp_port', '587', 'number', 'email', 'SMTP server port', false),
('smtp_username', '""', 'string', 'email', 'SMTP username', false),
('smtp_password', '""', 'string', 'email', 'SMTP password', false),
('smtp_encryption', '"tls"', 'string', 'email', 'SMTP encryption method', false),
('from_email', '"noreply@mmu.ac.ke"', 'string', 'email', 'Default from email address', false),
('from_name', '"MMU LMS"', 'string', 'email', 'Default from name', false),

-- Security Settings
('session_timeout', '30', 'number', 'security', 'Session timeout in minutes', false),
('max_login_attempts', '5', 'number', 'security', 'Maximum login attempts before lockout', false),
('lockout_duration', '15', 'number', 'security', 'Account lockout duration in minutes', false),
('password_policy', '{"minLength": 8, "requireUppercase": true, "requireLowercase": true, "requireNumbers": true, "requireSpecialChars": false}', 'object', 'security', 'Password policy requirements', false),
('two_factor_enabled', 'false', 'boolean', 'security', 'Enable two-factor authentication', false),

-- System Settings
('max_file_size', '50', 'number', 'system', 'Maximum file upload size in MB', false),
('allowed_file_types', '["pdf", "doc", "docx", "ppt", "pptx", "xls", "xlsx", "txt", "zip", "jpg", "jpeg", "png", "gif", "mp4", "mp3"]', 'array', 'system', 'Allowed file types for uploads', false),
('backup_frequency', '"daily"', 'string', 'system', 'Automatic backup frequency', false),
('log_retention', '90', 'number', 'system', 'Log retention period in days', false),
('max_concurrent_sessions', '3', 'number', 'system', 'Maximum concurrent sessions per user', false),
('system_maintenance_window', '"02:00-04:00"', 'string', 'system', 'Daily maintenance window', false),

-- Appearance Settings
('theme', '"light"', 'string', 'appearance', 'Default theme (light/dark/auto)', true),
('primary_color', '"#2563eb"', 'string', 'appearance', 'Primary brand color', true),
('secondary_color', '"#dc2626"', 'string', 'appearance', 'Secondary accent color', true),
('logo_url', '""', 'string', 'appearance', 'URL to the system logo', true),
('favicon_url', '""', 'string', 'appearance', 'URL to the favicon', true),

-- Notification Settings
('push_notifications', 'true', 'boolean', 'notifications', 'Enable push notifications', false),
('notification_retention', '30', 'number', 'notifications', 'Notification retention period in days', false),
('digest_frequency', '"daily"', 'string', 'notifications', 'Email digest frequency', false),
('announcement_notifications', 'true', 'boolean', 'notifications', 'Send notifications for new announcements', false),
('assignment_notifications', 'true', 'boolean', 'notifications', 'Send notifications for assignment updates', false),
('grade_notifications', 'true', 'boolean', 'notifications', 'Send notifications for new grades', false)

ON CONFLICT (setting_key) DO NOTHING;

-- Create function to update setting timestamp
CREATE OR REPLACE FUNCTION update_setting_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
DROP TRIGGER IF EXISTS trigger_update_setting_timestamp ON system_settings;
CREATE TRIGGER trigger_update_setting_timestamp
    BEFORE UPDATE ON system_settings
    FOR EACH ROW
    EXECUTE FUNCTION update_setting_timestamp();

-- Create function to get settings by category
CREATE OR REPLACE FUNCTION get_settings_by_category(category_name TEXT)
RETURNS TABLE (
    setting_key VARCHAR(100),
    setting_value JSONB,
    setting_type VARCHAR(50),
    description TEXT,
    is_public BOOLEAN
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.setting_key,
        s.setting_value,
        s.setting_type,
        s.description,
        s.is_public
    FROM system_settings s
    WHERE s.category = category_name
    ORDER BY s.setting_key;
END;
$$ LANGUAGE plpgsql;

-- Create function to get public settings (for non-admin users)
CREATE OR REPLACE FUNCTION get_public_settings()
RETURNS TABLE (
    setting_key VARCHAR(100),
    setting_value JSONB,
    setting_type VARCHAR(50)
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        s.setting_key,
        s.setting_value,
        s.setting_type
    FROM system_settings s
    WHERE s.is_public = true
    ORDER BY s.setting_key;
END;
$$ LANGUAGE plpgsql;

-- Enable RLS on system_settings table
ALTER TABLE system_settings ENABLE ROW LEVEL SECURITY;

-- Create policies for system_settings
-- Admins can read and write all settings
CREATE POLICY "Admins can manage all settings" ON system_settings
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM users 
            WHERE users.auth_id = auth.uid() 
            AND users.role = 'admin'
        )
    );

-- All authenticated users can read public settings
CREATE POLICY "Users can read public settings" ON system_settings
    FOR SELECT USING (
        is_public = true AND auth.role() = 'authenticated'
    );

-- Verification queries
-- Check if table was created successfully
SELECT 'System settings table created' as status, COUNT(*) as total_settings
FROM system_settings;

-- Check if indexes were created
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'system_settings' 
AND indexname LIKE 'idx_system_settings_%';

-- Check if functions were created
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_name IN ('get_settings_by_category', 'get_public_settings', 'update_setting_timestamp');

-- Check if policies were created
SELECT policyname 
FROM pg_policies 
WHERE tablename = 'system_settings';
