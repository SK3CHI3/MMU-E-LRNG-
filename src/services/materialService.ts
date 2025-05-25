import { supabase, CourseMaterial } from '@/lib/supabaseClient';

export interface MaterialUpload {
  title: string;
  description: string;
  course_id: string;
  type: 'document' | 'video' | 'audio' | 'link' | 'other';
  file?: File;
  url?: string;
  tags: string[];
  is_public: boolean;
}

export interface MaterialWithStats extends CourseMaterial {
  downloads: number;
  views: number;
  course_name: string;
  course_code: string;
}

// Upload a new material
export const uploadMaterial = async (materialData: MaterialUpload, userId: string): Promise<CourseMaterial> => {
  try {
    let fileUrl = materialData.url || '';

    // If there's a file, upload it to Supabase Storage
    if (materialData.file) {
      const fileExt = materialData.file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `materials/${userId}/${fileName}`;

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('course-materials')
        .upload(filePath, materialData.file);

      if (uploadError) {
        throw new Error(`File upload failed: ${uploadError.message}`);
      }

      // Get the public URL
      const { data: { publicUrl } } = supabase.storage
        .from('course-materials')
        .getPublicUrl(filePath);

      fileUrl = publicUrl;
    }

    // Create the material record
    const { data, error } = await supabase
      .from('course_materials')
      .insert({
        title: materialData.title,
        description: materialData.description,
        course_id: materialData.course_id,
        type: materialData.type,
        url: fileUrl,
        created_by: userId,
        // Store tags as JSON array
        tags: materialData.tags
      })
      .select()
      .single();

    if (error) throw error;

    // Track the upload activity
    await supabase
      .from('analytics_data')
      .insert({
        user_id: userId,
        course_id: materialData.course_id,
        activity_type: 'material_upload',
        created_at: new Date().toISOString()
      });

    return data;
  } catch (error) {
    console.error('Error uploading material:', error);
    throw error;
  }
};

// Get materials for a lecturer
export const getLecturerMaterials = async (lecturerId: string): Promise<MaterialWithStats[]> => {
  try {
    const { data: materials, error } = await supabase
      .from('course_materials')
      .select(`
        *,
        course:courses!inner(title, code)
      `)
      .eq('created_by', lecturerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get stats for each material
    const materialsWithStats = await Promise.all(
      materials.map(async (material) => {
        // Get download count
        const { count: downloads } = await supabase
          .from('analytics_data')
          .select('*', { count: 'exact', head: true })
          .eq('activity_type', 'material_download')
          .eq('related_id', material.id);

        // Get view count
        const { count: views } = await supabase
          .from('analytics_data')
          .select('*', { count: 'exact', head: true })
          .eq('activity_type', 'material_view')
          .eq('related_id', material.id);

        return {
          ...material,
          downloads: downloads || 0,
          views: views || 0,
          course_name: material.course.title,
          course_code: material.course.code
        };
      })
    );

    return materialsWithStats;
  } catch (error) {
    console.error('Error fetching lecturer materials:', error);
    throw error;
  }
};

// Get materials for a specific course
export const getCourseMaterials = async (courseId: string): Promise<MaterialWithStats[]> => {
  try {
    const { data: materials, error } = await supabase
      .from('course_materials')
      .select(`
        *,
        course:courses!inner(title, code),
        creator:users!created_by(full_name)
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get stats for each material
    const materialsWithStats = await Promise.all(
      materials.map(async (material) => {
        // Get download count
        const { count: downloads } = await supabase
          .from('analytics_data')
          .select('*', { count: 'exact', head: true })
          .eq('activity_type', 'material_download')
          .eq('related_id', material.id);

        // Get view count
        const { count: views } = await supabase
          .from('analytics_data')
          .select('*', { count: 'exact', head: true })
          .eq('activity_type', 'material_view')
          .eq('related_id', material.id);

        return {
          ...material,
          downloads: downloads || 0,
          views: views || 0,
          course_name: material.course.title,
          course_code: material.course.code
        };
      })
    );

    return materialsWithStats;
  } catch (error) {
    console.error('Error fetching course materials:', error);
    throw error;
  }
};

// Update a material
export const updateMaterial = async (
  materialId: string, 
  updates: Partial<CourseMaterial>
): Promise<CourseMaterial> => {
  try {
    const { data, error } = await supabase
      .from('course_materials')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', materialId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating material:', error);
    throw error;
  }
};

// Delete a material
export const deleteMaterial = async (materialId: string, userId: string): Promise<boolean> => {
  try {
    // Get the material to check if user owns it and get file path
    const { data: material, error: fetchError } = await supabase
      .from('course_materials')
      .select('*')
      .eq('id', materialId)
      .eq('created_by', userId)
      .single();

    if (fetchError) throw fetchError;

    // Delete the file from storage if it exists
    if (material.url && material.url.includes('supabase')) {
      const filePath = material.url.split('/').slice(-3).join('/'); // Extract path from URL
      await supabase.storage
        .from('course-materials')
        .remove([filePath]);
    }

    // Delete the material record
    const { error: deleteError } = await supabase
      .from('course_materials')
      .delete()
      .eq('id', materialId)
      .eq('created_by', userId);

    if (deleteError) throw deleteError;

    return true;
  } catch (error) {
    console.error('Error deleting material:', error);
    throw error;
  }
};

// Track material download
export const trackMaterialDownload = async (materialId: string, userId: string): Promise<void> => {
  try {
    // Get the material to get course_id
    const { data: material } = await supabase
      .from('course_materials')
      .select('course_id')
      .eq('id', materialId)
      .single();

    if (material) {
      await supabase
        .from('analytics_data')
        .insert({
          user_id: userId,
          course_id: material.course_id,
          activity_type: 'material_download',
          related_id: materialId,
          created_at: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Error tracking material download:', error);
  }
};

// Track material view
export const trackMaterialView = async (materialId: string, userId: string): Promise<void> => {
  try {
    // Get the material to get course_id
    const { data: material } = await supabase
      .from('course_materials')
      .select('course_id')
      .eq('id', materialId)
      .single();

    if (material) {
      await supabase
        .from('analytics_data')
        .insert({
          user_id: userId,
          course_id: material.course_id,
          activity_type: 'material_view',
          related_id: materialId,
          created_at: new Date().toISOString()
        });
    }
  } catch (error) {
    console.error('Error tracking material view:', error);
  }
};

// Search materials
export const searchMaterials = async (
  query: string, 
  courseId?: string, 
  type?: string
): Promise<MaterialWithStats[]> => {
  try {
    let queryBuilder = supabase
      .from('course_materials')
      .select(`
        *,
        course:courses!inner(title, code)
      `);

    // Add filters
    if (courseId && courseId !== 'all') {
      queryBuilder = queryBuilder.eq('course_id', courseId);
    }

    if (type && type !== 'all') {
      queryBuilder = queryBuilder.eq('type', type);
    }

    // Add text search
    if (query) {
      queryBuilder = queryBuilder.or(`title.ilike.%${query}%,description.ilike.%${query}%`);
    }

    const { data: materials, error } = await queryBuilder
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get stats for each material
    const materialsWithStats = await Promise.all(
      materials.map(async (material) => {
        // Get download count
        const { count: downloads } = await supabase
          .from('analytics_data')
          .select('*', { count: 'exact', head: true })
          .eq('activity_type', 'material_download')
          .eq('related_id', material.id);

        // Get view count
        const { count: views } = await supabase
          .from('analytics_data')
          .select('*', { count: 'exact', head: true })
          .eq('activity_type', 'material_view')
          .eq('related_id', material.id);

        return {
          ...material,
          downloads: downloads || 0,
          views: views || 0,
          course_name: material.course.title,
          course_code: material.course.code
        };
      })
    );

    return materialsWithStats;
  } catch (error) {
    console.error('Error searching materials:', error);
    throw error;
  }
};
