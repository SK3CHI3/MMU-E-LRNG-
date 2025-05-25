import { supabase } from '@/lib/supabaseClient';

export interface SessionAttachment {
  id: string;
  sessionId: string;
  fileName: string;
  originalName: string;
  fileSize: number;
  fileType: string;
  filePath: string;
  uploadedBy: string;
  uploadedAt: string;
  description?: string;
}

// Upload file to Supabase Storage
export const uploadSessionFile = async (
  file: File,
  sessionId: string,
  uploadedBy: string,
  description?: string
): Promise<SessionAttachment | null> => {
  try {
    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${sessionId}/${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
    
    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage
      .from('session-attachments')
      .upload(fileName, file);

    if (uploadError) throw uploadError;

    // Save file metadata to database
    const { data: attachmentData, error: dbError } = await supabase
      .from('session_attachments')
      .insert({
        session_id: sessionId,
        file_name: fileName,
        original_name: file.name,
        file_size: file.size,
        file_type: file.type,
        file_path: uploadData.path,
        uploaded_by: uploadedBy,
        description: description
      })
      .select()
      .single();

    if (dbError) throw dbError;

    return {
      id: attachmentData.id,
      sessionId: attachmentData.session_id,
      fileName: attachmentData.file_name,
      originalName: attachmentData.original_name,
      fileSize: attachmentData.file_size,
      fileType: attachmentData.file_type,
      filePath: attachmentData.file_path,
      uploadedBy: attachmentData.uploaded_by,
      uploadedAt: attachmentData.created_at,
      description: attachmentData.description
    };
  } catch (error) {
    console.error('Error uploading session file:', error);
    return null;
  }
};

// Get session attachments
export const getSessionAttachments = async (sessionId: string): Promise<SessionAttachment[]> => {
  try {
    const { data, error } = await supabase
      .from('session_attachments')
      .select(`
        *,
        uploader:users!uploaded_by(full_name)
      `)
      .eq('session_id', sessionId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(attachment => ({
      id: attachment.id,
      sessionId: attachment.session_id,
      fileName: attachment.file_name,
      originalName: attachment.original_name,
      fileSize: attachment.file_size,
      fileType: attachment.file_type,
      filePath: attachment.file_path,
      uploadedBy: attachment.uploaded_by,
      uploadedAt: attachment.created_at,
      description: attachment.description
    })) || [];
  } catch (error) {
    console.error('Error fetching session attachments:', error);
    return [];
  }
};

// Get file download URL
export const getFileDownloadUrl = async (filePath: string): Promise<string | null> => {
  try {
    const { data, error } = await supabase.storage
      .from('session-attachments')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    if (error) throw error;
    return data.signedUrl;
  } catch (error) {
    console.error('Error getting file download URL:', error);
    return null;
  }
};

// Delete session attachment
export const deleteSessionAttachment = async (attachmentId: string): Promise<boolean> => {
  try {
    // Get file path first
    const { data: attachment, error: fetchError } = await supabase
      .from('session_attachments')
      .select('file_path')
      .eq('id', attachmentId)
      .single();

    if (fetchError) throw fetchError;

    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('session-attachments')
      .remove([attachment.file_path]);

    if (storageError) throw storageError;

    // Delete from database
    const { error: dbError } = await supabase
      .from('session_attachments')
      .delete()
      .eq('id', attachmentId);

    if (dbError) throw dbError;

    return true;
  } catch (error) {
    console.error('Error deleting session attachment:', error);
    return false;
  }
};

// Upload multiple files
export const uploadMultipleSessionFiles = async (
  files: File[],
  sessionId: string,
  uploadedBy: string,
  descriptions?: string[]
): Promise<SessionAttachment[]> => {
  const uploadPromises = files.map((file, index) => 
    uploadSessionFile(file, sessionId, uploadedBy, descriptions?.[index])
  );

  const results = await Promise.all(uploadPromises);
  return results.filter(result => result !== null) as SessionAttachment[];
};

// Get file size in human readable format
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Check if file type is allowed
export const isFileTypeAllowed = (fileType: string): boolean => {
  const allowedTypes = [
    // Documents
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv',
    
    // Images
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/gif',
    'image/webp',
    
    // Archives
    'application/zip',
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    
    // Code files
    'text/javascript',
    'text/html',
    'text/css',
    'application/json',
    'text/xml',
    
    // Audio/Video (for educational content)
    'audio/mpeg',
    'audio/wav',
    'video/mp4',
    'video/webm'
  ];
  
  return allowedTypes.includes(fileType);
};

// Get file icon based on file type
export const getFileIcon = (fileType: string): string => {
  if (fileType.startsWith('image/')) return '🖼️';
  if (fileType.startsWith('video/')) return '🎥';
  if (fileType.startsWith('audio/')) return '🎵';
  if (fileType.includes('pdf')) return '📄';
  if (fileType.includes('word') || fileType.includes('document')) return '📝';
  if (fileType.includes('excel') || fileType.includes('spreadsheet')) return '📊';
  if (fileType.includes('powerpoint') || fileType.includes('presentation')) return '📽️';
  if (fileType.includes('zip') || fileType.includes('rar') || fileType.includes('7z')) return '🗜️';
  if (fileType.includes('text') || fileType.includes('javascript') || fileType.includes('html')) return '📋';
  return '📎';
};
