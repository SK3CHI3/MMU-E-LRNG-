-- Create student_activities table for tracking platform interactions
CREATE TABLE IF NOT EXISTS student_activities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    activity_type TEXT NOT NULL CHECK (activity_type IN (
        'login',
        'study_session', 
        'assignment_view',
        'assignment_submit',
        'class_attend',
        'resource_access',
        'quiz_attempt',
        'discussion_post'
    )),
    duration_minutes INTEGER,
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_student_activities_student_id ON student_activities(student_id);
CREATE INDEX IF NOT EXISTS idx_student_activities_type ON student_activities(activity_type);
CREATE INDEX IF NOT EXISTS idx_student_activities_created_at ON student_activities(created_at);
CREATE INDEX IF NOT EXISTS idx_student_activities_student_type_date ON student_activities(student_id, activity_type, created_at);

-- Enable Row Level Security
ALTER TABLE student_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view their own activities" ON student_activities
    FOR SELECT USING (auth.uid() = student_id);

CREATE POLICY "Users can insert their own activities" ON student_activities
    FOR INSERT WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Users can update their own activities" ON student_activities
    FOR UPDATE USING (auth.uid() = student_id);

-- Create a function to automatically track login activities
CREATE OR REPLACE FUNCTION track_user_login()
RETURNS TRIGGER AS $$
BEGIN
    -- Only track if this is a new session (not just a token refresh)
    IF NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at THEN
        INSERT INTO student_activities (student_id, activity_type, created_at)
        VALUES (NEW.id, 'login', NEW.last_sign_in_at);
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically track logins
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
    AFTER UPDATE ON auth.users
    FOR EACH ROW
    WHEN (NEW.last_sign_in_at IS DISTINCT FROM OLD.last_sign_in_at)
    EXECUTE FUNCTION track_user_login();

-- Create a function to get study metrics for a student
CREATE OR REPLACE FUNCTION get_student_study_metrics(student_uuid UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
    weekly_hours NUMERIC;
    attendance_rate NUMERIC;
    completed_assignments INTEGER;
    total_classes INTEGER;
BEGIN
    -- Calculate weekly study hours
    SELECT COALESCE(SUM(duration_minutes), 0) / 60.0
    INTO weekly_hours
    FROM student_activities
    WHERE student_id = student_uuid
    AND activity_type = 'study_session'
    AND created_at >= NOW() - INTERVAL '7 days';

    -- Calculate attendance rate
    SELECT COUNT(*)
    INTO total_classes
    FROM student_activities
    WHERE student_id = student_uuid
    AND activity_type = 'class_attend'
    AND created_at >= NOW() - INTERVAL '30 days';

    -- Assume 60 total classes per month (3 per day * 20 days)
    attendance_rate := CASE 
        WHEN total_classes > 0 THEN (total_classes::NUMERIC / 60.0) * 100
        ELSE 0
    END;

    -- Calculate completed assignments
    SELECT COUNT(*)
    INTO completed_assignments
    FROM student_activities
    WHERE student_id = student_uuid
    AND activity_type = 'assignment_submit'
    AND created_at >= NOW() - INTERVAL '30 days';

    -- Build result JSON
    result := json_build_object(
        'weeklyStudyHours', weekly_hours,
        'attendanceRate', LEAST(100, attendance_rate),
        'completedAssignments', completed_assignments,
        'totalClasses', GREATEST(total_classes, 60),
        'classesAttended', total_classes
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON student_activities TO authenticated;
GRANT EXECUTE ON FUNCTION get_student_study_metrics(UUID) TO authenticated;

-- Insert some sample data for testing (optional)
-- This will be removed in production
INSERT INTO student_activities (student_id, activity_type, duration_minutes, created_at)
SELECT 
    auth.uid(),
    'study_session',
    (random() * 120 + 30)::INTEGER,
    NOW() - (random() * INTERVAL '7 days')
FROM generate_series(1, 10)
WHERE auth.uid() IS NOT NULL
ON CONFLICT DO NOTHING;
