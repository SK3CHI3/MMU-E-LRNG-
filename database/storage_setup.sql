-- MMU LMS Storage Buckets Setup
-- This script sets up the necessary storage buckets and policies for file uploads

-- =============================================
-- CREATE STORAGE BUCKETS
-- =============================================

-- Create bucket for course materials
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'course-materials',
    'course-materials',
    true,
    52428800, -- 50MB limit
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'text/plain',
        'text/csv',
        'application/zip',
        'application/x-zip-compressed',
        'video/mp4',
        'video/avi',
        'video/quicktime',
        'audio/mpeg',
        'audio/wav',
        'audio/mp3',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
    ]
) ON CONFLICT (id) DO NOTHING;

-- Create bucket for assignment submissions
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'assignment-submissions',
    'assignment-submissions',
    false, -- Private bucket
    104857600, -- 100MB limit for assignments
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'text/csv',
        'application/zip',
        'application/x-zip-compressed',
        'image/jpeg',
        'image/png',
        'video/mp4',
        'audio/mpeg'
    ]
) ON CONFLICT (id) DO NOTHING;

-- Create bucket for message attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'message-attachments',
    'message-attachments',
    false, -- Private bucket
    20971520, -- 20MB limit
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'application/zip',
        'application/x-zip-compressed'
    ]
) ON CONFLICT (id) DO NOTHING;

-- Create bucket for user avatars
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'user-avatars',
    'user-avatars',
    true,
    5242880, -- 5MB limit
    ARRAY[
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp'
    ]
) ON CONFLICT (id) DO NOTHING;

-- Create bucket for announcement attachments
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'announcement-attachments',
    'announcement-attachments',
    true,
    31457280, -- 30MB limit
    ARRAY[
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-powerpoint',
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        'text/plain',
        'image/jpeg',
        'image/png',
        'image/gif',
        'image/webp',
        'video/mp4',
        'audio/mpeg'
    ]
) ON CONFLICT (id) DO NOTHING;

-- =============================================
-- STORAGE POLICIES
-- =============================================

-- =============================================
-- COURSE MATERIALS BUCKET POLICIES
-- =============================================

-- Allow lecturers to upload materials for their courses
CREATE POLICY "Lecturers can upload course materials" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'course-materials' AND
        EXISTS (
            SELECT 1 FROM courses c
            WHERE c.created_by = auth.uid()
            AND (storage.foldername(name))[1] = 'materials'
            AND (storage.foldername(name))[2] = auth.uid()::text
        )
    );

-- Allow lecturers to update their own materials
CREATE POLICY "Lecturers can update own materials" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'course-materials' AND
        (storage.foldername(name))[2] = auth.uid()::text
    );

-- Allow lecturers to delete their own materials
CREATE POLICY "Lecturers can delete own materials" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'course-materials' AND
        (storage.foldername(name))[2] = auth.uid()::text
    );

-- Allow students to view materials for enrolled courses
CREATE POLICY "Students can view course materials" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'course-materials' AND
        EXISTS (
            SELECT 1 FROM course_enrollments ce
            JOIN courses c ON ce.course_id = c.id
            WHERE ce.user_id = auth.uid()
            AND ce.status = 'enrolled'
            AND (storage.foldername(name))[2] = c.created_by::text
        )
    );

-- =============================================
-- ASSIGNMENT SUBMISSIONS BUCKET POLICIES
-- =============================================

-- Allow students to upload their own submissions
CREATE POLICY "Students can upload submissions" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'assignment-submissions' AND
        (storage.foldername(name))[1] = 'submissions' AND
        (storage.foldername(name))[2] = auth.uid()::text
    );

-- Allow students to update their own submissions
CREATE POLICY "Students can update own submissions" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'assignment-submissions' AND
        (storage.foldername(name))[2] = auth.uid()::text
    );

-- Allow students to view their own submissions
CREATE POLICY "Students can view own submissions" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'assignment-submissions' AND
        (storage.foldername(name))[2] = auth.uid()::text
    );

-- Allow lecturers to view submissions for their assignments
CREATE POLICY "Lecturers can view assignment submissions" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'assignment-submissions' AND
        EXISTS (
            SELECT 1 FROM assignment_submissions asub
            JOIN assignments a ON asub.assignment_id = a.id
            JOIN courses c ON a.course_id = c.id
            WHERE c.created_by = auth.uid()
            AND (storage.foldername(name))[2] = asub.user_id::text
        )
    );

-- =============================================
-- MESSAGE ATTACHMENTS BUCKET POLICIES
-- =============================================

-- Allow users to upload message attachments
CREATE POLICY "Users can upload message attachments" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'message-attachments' AND
        (storage.foldername(name))[1] = 'message-attachments' AND
        (storage.foldername(name))[2] = auth.uid()::text
    );

-- Allow users to view attachments in their conversations
CREATE POLICY "Users can view conversation attachments" ON storage.objects
    FOR SELECT USING (
        bucket_id = 'message-attachments' AND
        EXISTS (
            SELECT 1 FROM conversations c
            WHERE auth.uid() = ANY(c.participants)
        )
    );

-- =============================================
-- USER AVATARS BUCKET POLICIES
-- =============================================

-- Allow users to upload their own avatar
CREATE POLICY "Users can upload own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'user-avatars' AND
        (storage.foldername(name))[1] = 'avatars' AND
        (storage.foldername(name))[2] = auth.uid()::text
    );

-- Allow users to update their own avatar
CREATE POLICY "Users can update own avatar" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'user-avatars' AND
        (storage.foldername(name))[2] = auth.uid()::text
    );

-- Allow users to delete their own avatar
CREATE POLICY "Users can delete own avatar" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'user-avatars' AND
        (storage.foldername(name))[2] = auth.uid()::text
    );

-- Allow everyone to view avatars (public bucket)
CREATE POLICY "Anyone can view avatars" ON storage.objects
    FOR SELECT USING (bucket_id = 'user-avatars');

-- =============================================
-- ANNOUNCEMENT ATTACHMENTS BUCKET POLICIES
-- =============================================

-- Allow lecturers and admins to upload announcement attachments
CREATE POLICY "Lecturers can upload announcement attachments" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'announcement-attachments' AND
        EXISTS (
            SELECT 1 FROM users u
            WHERE u.auth_id = auth.uid()
            AND u.role IN ('lecturer', 'admin', 'dean')
        ) AND
        (storage.foldername(name))[1] = 'announcements' AND
        (storage.foldername(name))[2] = auth.uid()::text
    );

-- Allow lecturers to update their own announcement attachments
CREATE POLICY "Lecturers can update own announcement attachments" ON storage.objects
    FOR UPDATE USING (
        bucket_id = 'announcement-attachments' AND
        (storage.foldername(name))[2] = auth.uid()::text
    );

-- Allow lecturers to delete their own announcement attachments
CREATE POLICY "Lecturers can delete own announcement attachments" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'announcement-attachments' AND
        (storage.foldername(name))[2] = auth.uid()::text
    );

-- Allow everyone to view announcement attachments (public bucket)
CREATE POLICY "Anyone can view announcement attachments" ON storage.objects
    FOR SELECT USING (bucket_id = 'announcement-attachments');

-- =============================================
-- HELPER FUNCTIONS FOR STORAGE
-- =============================================

-- Function to get file extension
CREATE OR REPLACE FUNCTION get_file_extension(filename text)
RETURNS text AS $$
BEGIN
    RETURN lower(substring(filename from '\.([^.]*)$'));
END;
$$ LANGUAGE plpgsql;

-- Function to validate file type
CREATE OR REPLACE FUNCTION is_valid_file_type(filename text, allowed_types text[])
RETURNS boolean AS $$
BEGIN
    RETURN get_file_extension(filename) = ANY(allowed_types);
END;
$$ LANGUAGE plpgsql;

-- Function to generate unique filename
CREATE OR REPLACE FUNCTION generate_unique_filename(original_filename text, user_id uuid)
RETURNS text AS $$
DECLARE
    file_ext text;
    timestamp_str text;
    random_str text;
BEGIN
    file_ext := get_file_extension(original_filename);
    timestamp_str := extract(epoch from now())::text;
    random_str := substr(md5(random()::text), 1, 8);
    
    RETURN timestamp_str || '-' || random_str || '.' || file_ext;
END;
$$ LANGUAGE plpgsql;
