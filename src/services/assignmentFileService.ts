import { supabase } from '@/lib/supabaseClient';

export interface AssignmentFile {
  id: string;
  submission_id: string;
  file_name: string;
  original_name: string;
  file_size: number;
  file_type: string;
  file_path: string;
  uploaded_at: string;
}

// Upload files for assignment submission
export const uploadAssignmentFiles = async (
  files: File[],
  submissionId: string,
  userId: string
): Promise<AssignmentFile[]> => {
  try {
    const uploadPromises = files.map(async (file) => {
      // Generate unique filename
      const fileExt = file.name.split('.').pop();
      const fileName = `${submissionId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      
      // Upload to Supabase Storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('assignment-submissions')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Save file metadata to database
      const { data: fileData, error: dbError } = await supabase
        .from('assignment_files')
        .insert({
          submission_id: submissionId,
          file_name: fileName,
          original_name: file.name,
          file_size: file.size,
          file_type: file.type,
          file_path: uploadData.path,
          uploaded_by: userId
        })
        .select()
        .single();

      if (dbError) throw dbError;

      return fileData;
    });

    const results = await Promise.all(uploadPromises);
    return results;
  } catch (error) {
    console.error('Error uploading assignment files:', error);
    throw error;
  }
};

// Get download URL for assignment file
export const getAssignmentFileUrl = async (filePath: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('assignment-submissions')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting file download URL:', error);
    return null;
  }
};

// Get files for a submission
export const getSubmissionFiles = async (submissionId: string): Promise<AssignmentFile[]> => {
  try {
    const { data, error } = await supabase
      .from('assignment_files')
      .select('*')
      .eq('submission_id', submissionId)
      .order('uploaded_at', { ascending: true });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching submission files:', error);
    return [];
  }
};

// Delete assignment file
export const deleteAssignmentFile = async (fileId: string): Promise<boolean> => {
  try {
    // Get file path first
    const { data: file, error: fetchError } = await supabase
      .from('assignment_files')
      .select('file_path')
      .eq('id', fileId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('assignment-submissions')
      .remove([file.file_path]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await supabase
      .from('assignment_files')
      .delete()
      .eq('id', fileId);

    if (dbError) throw dbError;

    return true;
  } catch (error) {
    console.error('Error deleting assignment file:', error);
    return false;
  }
};

// Validate file type and size
export const validateAssignmentFile = (file: File): { valid: boolean; error?: string } => {
  const maxSize = 100 * 1024 * 1024; // 100MB
  const allowedTypes = [
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
  ];

  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 100MB' };
  }

  if (!allowedTypes.includes(file.type)) {
    return { valid: false, error: 'File type not allowed' };
  }

  return { valid: true };
};

// Format file size for display
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Get file icon based on type
export const getFileIcon = (fileType: string): string => {
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📊';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📈';
  if (fileType.includes('image')) return '🖼️';
  if (fileType.includes('video')) return '🎥';
  if (fileType.includes('audio')) return '🎵';
  if (fileType.includes('zip') || fileType.includes('compressed')) return '📦';
  if (fileType.includes('text')) return '📄';
  return '📎';
};
