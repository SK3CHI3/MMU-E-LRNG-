import { supabase } from '@/lib/supabaseClient';

export interface StudyResource {
  id: string;
  title: string;
  description?: string;
  type: 'document' | 'video' | 'audio' | 'link' | 'recording';
  url: string;
  fileSize?: number;
  duration?: number; // for video/audio in seconds
  courseId: string;
  courseName: string;
  courseCode: string;
  lecturerId: string;
  lecturerName: string;
  uploadDate: string;
  tags: string[];
  isPublic: boolean;
  downloadCount: number;
  viewCount: number;
}

export interface ResourceFilter {
  courseId?: string;
  type?: string;
  lecturerId?: string;
  searchTerm?: string;
  tags?: string[];
}

// Get all study resources for a student's enrolled courses
export const getStudentResources = async (studentId: string, filter?: ResourceFilter): Promise<StudyResource[]> => {
  try {
    // First get the student's enrolled courses
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('student_id', studentId)
      .eq('status', 'active');

    if (enrollmentError) throw enrollmentError;

    const courseIds = enrollments?.map(e => e.course_id) || [];
    
    if (courseIds.length === 0) {
      return [];
    }

    // Build query for course materials
    let query = supabase
      .from('course_materials')
      .select(`
        *,
        course:courses!inner(
          id,
          title,
          code,
          lecturer:users!courses_lecturer_id_fkey(
            id,
            full_name
          )
        )
      `)
      .in('course_id', courseIds)
      .eq('is_active', true);

    // Apply filters
    if (filter?.courseId && filter.courseId !== 'all') {
      query = query.eq('course_id', filter.courseId);
    }

    if (filter?.type && filter.type !== 'all') {
      query = query.eq('type', filter.type);
    }

    if (filter?.lecturerId) {
      query = query.eq('created_by', filter.lecturerId);
    }

    // Add text search
    if (filter?.searchTerm) {
      query = query.or(`title.ilike.%${filter.searchTerm}%,description.ilike.%${filter.searchTerm}%`);
    }

    const { data: materials, error } = await query
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Transform the data
    const resources: StudyResource[] = materials?.map(material => ({
      id: material.id,
      title: material.title,
      description: material.description,
      type: material.type,
      url: material.url,
      fileSize: material.file_size,
      duration: material.duration,
      courseId: material.course_id,
      courseName: material.course.title,
      courseCode: material.course.code,
      lecturerId: material.created_by,
      lecturerName: material.course.lecturer?.full_name || 'Unknown',
      uploadDate: material.created_at,
      tags: material.tags || [],
      isPublic: material.is_public,
      downloadCount: material.download_count || 0,
      viewCount: material.view_count || 0
    })) || [];

    return resources;
  } catch (error) {
    console.error('Error fetching student resources:', error);
    return [];
  }
};

// Get resources by course
export const getResourcesByCourse = async (courseId: string): Promise<StudyResource[]> => {
  try {
    const { data: materials, error } = await supabase
      .from('course_materials')
      .select(`
        *,
        course:courses!inner(
          id,
          title,
          code,
          lecturer:users!courses_lecturer_id_fkey(
            id,
            full_name
          )
        )
      `)
      .eq('course_id', courseId)
      .eq('is_active', true)
      .order('created_at', { ascending: false });

    if (error) throw error;

    return materials?.map(material => ({
      id: material.id,
      title: material.title,
      description: material.description,
      type: material.type,
      url: material.url,
      fileSize: material.file_size,
      duration: material.duration,
      courseId: material.course_id,
      courseName: material.course.title,
      courseCode: material.course.code,
      lecturerId: material.created_by,
      lecturerName: material.course.lecturer?.full_name || 'Unknown',
      uploadDate: material.created_at,
      tags: material.tags || [],
      isPublic: material.is_public,
      downloadCount: material.download_count || 0,
      viewCount: material.view_count || 0
    })) || [];
  } catch (error) {
    console.error('Error fetching course resources:', error);
    return [];
  }
};

// Track resource access (download/view)
export const trackResourceAccess = async (
  resourceId: string, 
  studentId: string, 
  accessType: 'view' | 'download'
): Promise<void> => {
  try {
    // Log the access
    const { error: logError } = await supabase
      .from('resource_access_logs')
      .insert({
        resource_id: resourceId,
        student_id: studentId,
        access_type: accessType,
        accessed_at: new Date().toISOString()
      });

    if (logError) {
      console.error('Error logging resource access:', logError);
    }

    // Update the resource counters
    const updateField = accessType === 'view' ? 'view_count' : 'download_count';
    
    const { error: updateError } = await supabase.rpc('increment_resource_counter', {
      resource_id: resourceId,
      counter_type: updateField
    });

    if (updateError) {
      console.error('Error updating resource counter:', updateError);
    }
  } catch (error) {
    console.error('Error tracking resource access:', error);
  }
};

// Get popular resources for a student
export const getPopularResources = async (studentId: string, limit: number = 10): Promise<StudyResource[]> => {
  try {
    // Get student's enrolled courses
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('student_id', studentId)
      .eq('status', 'active');

    if (enrollmentError) throw enrollmentError;

    const courseIds = enrollments?.map(e => e.course_id) || [];
    
    if (courseIds.length === 0) {
      return [];
    }

    const { data: materials, error } = await supabase
      .from('course_materials')
      .select(`
        *,
        course:courses!inner(
          id,
          title,
          code,
          lecturer:users!courses_lecturer_id_fkey(
            id,
            full_name
          )
        )
      `)
      .in('course_id', courseIds)
      .eq('is_active', true)
      .order('view_count', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return materials?.map(material => ({
      id: material.id,
      title: material.title,
      description: material.description,
      type: material.type,
      url: material.url,
      fileSize: material.file_size,
      duration: material.duration,
      courseId: material.course_id,
      courseName: material.course.title,
      courseCode: material.course.code,
      lecturerId: material.created_by,
      lecturerName: material.course.lecturer?.full_name || 'Unknown',
      uploadDate: material.created_at,
      tags: material.tags || [],
      isPublic: material.is_public,
      downloadCount: material.download_count || 0,
      viewCount: material.view_count || 0
    })) || [];
  } catch (error) {
    console.error('Error fetching popular resources:', error);
    return [];
  }
};

// Get recent resources for a student
export const getRecentResources = async (studentId: string, limit: number = 10): Promise<StudyResource[]> => {
  try {
    // Get student's enrolled courses
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('student_id', studentId)
      .eq('status', 'active');

    if (enrollmentError) throw enrollmentError;

    const courseIds = enrollments?.map(e => e.course_id) || [];
    
    if (courseIds.length === 0) {
      return [];
    }

    const { data: materials, error } = await supabase
      .from('course_materials')
      .select(`
        *,
        course:courses!inner(
          id,
          title,
          code,
          lecturer:users!courses_lecturer_id_fkey(
            id,
            full_name
          )
        )
      `)
      .in('course_id', courseIds)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) throw error;

    return materials?.map(material => ({
      id: material.id,
      title: material.title,
      description: material.description,
      type: material.type,
      url: material.url,
      fileSize: material.file_size,
      duration: material.duration,
      courseId: material.course_id,
      courseName: material.course.title,
      courseCode: material.course.code,
      lecturerId: material.created_by,
      lecturerName: material.course.lecturer?.full_name || 'Unknown',
      uploadDate: material.created_at,
      tags: material.tags || [],
      isPublic: material.is_public,
      downloadCount: material.download_count || 0,
      viewCount: material.view_count || 0
    })) || [];
  } catch (error) {
    console.error('Error fetching recent resources:', error);
    return [];
  }
};

// Search resources across all student's courses
export const searchResources = async (
  studentId: string, 
  searchTerm: string, 
  filters?: ResourceFilter
): Promise<StudyResource[]> => {
  try {
    return await getStudentResources(studentId, {
      ...filters,
      searchTerm
    });
  } catch (error) {
    console.error('Error searching resources:', error);
    return [];
  }
};

// Get resource statistics for a student
export const getResourceStats = async (studentId: string): Promise<{
  totalResources: number;
  totalDownloads: number;
  totalViews: number;
  resourcesByType: { [key: string]: number };
}> => {
  try {
    const resources = await getStudentResources(studentId);
    
    const stats = {
      totalResources: resources.length,
      totalDownloads: resources.reduce((sum, r) => sum + r.downloadCount, 0),
      totalViews: resources.reduce((sum, r) => sum + r.viewCount, 0),
      resourcesByType: resources.reduce((acc, r) => {
        acc[r.type] = (acc[r.type] || 0) + 1;
        return acc;
      }, {} as { [key: string]: number })
    };

    return stats;
  } catch (error) {
    console.error('Error fetching resource stats:', error);
    return {
      totalResources: 0,
      totalDownloads: 0,
      totalViews: 0,
      resourcesByType: {}
    };
  }
};

// Get all available tags for filtering
export const getResourceTags = async (studentId: string): Promise<string[]> => {
  try {
    const resources = await getStudentResources(studentId);
    const allTags = resources.flatMap(r => r.tags);
    const uniqueTags = [...new Set(allTags)].filter(tag => tag && tag.trim() !== '');
    return uniqueTags.sort();
  } catch (error) {
    console.error('Error fetching resource tags:', error);
    return [];
  }
};
