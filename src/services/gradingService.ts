import { supabase } from '@/lib/supabaseClient';

export interface AssignmentSubmission {
  id: string;
  assignment_id: string;
  user_id: string;
  submission_text?: string;
  submission_url?: string;
  submitted_at: string;
  is_late: boolean;
  grade?: number;
  feedback?: string;
  graded_by?: string;
  graded_at?: string;
  status: 'submitted' | 'graded' | 'returned';
  
  // Joined data
  assignment?: {
    id: string;
    title: string;
    total_points: number;
    course?: {
      id: string;
      title: string;
      code: string;
    };
  };
  student?: {
    id: string;
    full_name: string;
    admission_number: string;
    email: string;
  };
  files?: any[];
}

// Get all submissions for assignments created by a lecturer
export const getLecturerSubmissions = async (lecturerId: string): Promise<AssignmentSubmission[]> => {
  try {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        assignment:assignments!inner(
          id,
          title,
          total_points,
          course:courses!inner(
            id,
            title,
            code,
            created_by
          )
        ),
        student:users!assignment_submissions_user_id_fkey(
          id,
          full_name,
          admission_number,
          email
        )
      `)
      .eq('assignment.course.created_by', lecturerId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching lecturer submissions:', error);
    throw error;
  }
};

// Get submissions for a specific assignment
export const getAssignmentSubmissions = async (assignmentId: string): Promise<AssignmentSubmission[]> => {
  try {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        assignment:assignments(
          id,
          title,
          total_points,
          course:courses(
            id,
            title,
            code
          )
        ),
        student:users!assignment_submissions_user_id_fkey(
          id,
          full_name,
          admission_number,
          email
        )
      `)
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;

    return data || [];
  } catch (error) {
    console.error('Error fetching assignment submissions:', error);
    throw error;
  }
};

// Grade a submission
export const gradeSubmission = async (
  submissionId: string,
  grade: number,
  feedback: string,
  gradedBy: string
): Promise<AssignmentSubmission> => {
  try {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .update({
        grade,
        feedback,
        graded_by: gradedBy,
        graded_at: new Date().toISOString(),
        status: 'graded'
      })
      .eq('id', submissionId)
      .select(`
        *,
        assignment:assignments(
          id,
          title,
          total_points,
          course:courses(
            id,
            title,
            code
          )
        ),
        student:users!assignment_submissions_user_id_fkey(
          id,
          full_name,
          admission_number,
          email
        )
      `)
      .single();

    if (error) throw error;

    // Track grading activity
    if (data.assignment?.course?.id) {
      await supabase
        .from('analytics_data')
        .insert({
          user_id: gradedBy,
          course_id: data.assignment.course.id,
          activity_type: 'assignment_grading'
        });
    }

    return data;
  } catch (error) {
    console.error('Error grading submission:', error);
    throw error;
  }
};

// Update grade and feedback
export const updateGrade = async (
  submissionId: string,
  grade: number,
  feedback: string,
  gradedBy: string
): Promise<AssignmentSubmission> => {
  try {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .update({
        grade,
        feedback,
        graded_by: gradedBy,
        graded_at: new Date().toISOString()
      })
      .eq('id', submissionId)
      .select(`
        *,
        assignment:assignments(
          id,
          title,
          total_points
        ),
        student:users!assignment_submissions_user_id_fkey(
          id,
          full_name,
          admission_number,
          email
        )
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating grade:', error);
    throw error;
  }
};

// Get grading statistics for a lecturer
export const getGradingStats = async (lecturerId: string) => {
  try {
    // Get total submissions
    const { count: totalSubmissions } = await supabase
      .from('assignment_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('assignment.course.created_by', lecturerId);

    // Get graded submissions
    const { count: gradedSubmissions } = await supabase
      .from('assignment_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('assignment.course.created_by', lecturerId)
      .not('grade', 'is', null);

    // Get pending submissions
    const pendingSubmissions = (totalSubmissions || 0) - (gradedSubmissions || 0);

    // Get average grade
    const { data: grades } = await supabase
      .from('assignment_submissions')
      .select('grade')
      .eq('assignment.course.created_by', lecturerId)
      .not('grade', 'is', null);

    const averageGrade = grades && grades.length > 0
      ? grades.reduce((sum, g) => sum + (g.grade || 0), 0) / grades.length
      : 0;

    return {
      totalSubmissions: totalSubmissions || 0,
      gradedSubmissions: gradedSubmissions || 0,
      pendingSubmissions,
      averageGrade: Math.round(averageGrade)
    };
  } catch (error) {
    console.error('Error fetching grading stats:', error);
    return {
      totalSubmissions: 0,
      gradedSubmissions: 0,
      pendingSubmissions: 0,
      averageGrade: 0
    };
  }
};

// Return submission to student for revision
export const returnSubmission = async (
  submissionId: string,
  feedback: string,
  gradedBy: string
): Promise<AssignmentSubmission> => {
  try {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .update({
        feedback,
        graded_by: gradedBy,
        graded_at: new Date().toISOString(),
        status: 'returned'
      })
      .eq('id', submissionId)
      .select(`
        *,
        assignment:assignments(
          id,
          title,
          total_points
        ),
        student:users!assignment_submissions_user_id_fkey(
          id,
          full_name,
          admission_number,
          email
        )
      `)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error returning submission:', error);
    throw error;
  }
};

// Bulk grade submissions
export const bulkGradeSubmissions = async (
  submissions: Array<{
    submissionId: string;
    grade: number;
    feedback?: string;
  }>,
  gradedBy: string
): Promise<void> => {
  try {
    const updates = submissions.map(({ submissionId, grade, feedback }) => ({
      id: submissionId,
      grade,
      feedback: feedback || '',
      graded_by: gradedBy,
      graded_at: new Date().toISOString(),
      status: 'graded'
    }));

    const { error } = await supabase
      .from('assignment_submissions')
      .upsert(updates);

    if (error) throw error;
  } catch (error) {
    console.error('Error bulk grading submissions:', error);
    throw error;
  }
};
