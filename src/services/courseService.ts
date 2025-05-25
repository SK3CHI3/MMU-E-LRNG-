import { supabase, Course, CourseMaterial } from '@/lib/supabaseClient';

export interface CourseWithStats extends Course {
  total_students: number;
  total_assignments: number;
  total_materials: number;
  average_grade?: number;
  completion_rate?: number;
}

export interface CourseAnalytics {
  course_id: string;
  total_students: number;
  active_students: number;
  average_grade: number;
  assignment_completion_rate: number;
  material_views: number;
  discussion_posts: number;
  attendance_rate: number;
  performance_trend: 'up' | 'down' | 'stable';
  trend_percentage: number;
}

// Get all courses for a lecturer
export const getLecturerCourses = async (lecturerId: string): Promise<CourseWithStats[]> => {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select(`
        *,
        course_enrollments(count),
        assignments(count),
        course_materials(count)
      `)
      .eq('created_by', lecturerId)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Calculate stats for each course
    const coursesWithStats = await Promise.all(
      courses.map(async (course) => {
        // Get enrollment count
        const { count: enrollmentCount } = await supabase
          .from('course_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id)
          .eq('status', 'enrolled');

        // Get assignment count
        const { count: assignmentCount } = await supabase
          .from('assignments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id);

        // Get material count
        const { count: materialCount } = await supabase
          .from('course_materials')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id);

        // Get average grade
        const { data: grades } = await supabase
          .from('course_enrollments')
          .select('grade')
          .eq('course_id', course.id)
          .not('grade', 'is', null);

        let averageGrade = 0;
        if (grades && grades.length > 0) {
          const numericGrades = grades
            .map(g => parseFloat(g.grade))
            .filter(g => !isNaN(g));

          if (numericGrades.length > 0) {
            averageGrade = numericGrades.reduce((sum, grade) => sum + grade, 0) / numericGrades.length;
          }
        }

        // Calculate completion rate
        const { count: completedCount } = await supabase
          .from('course_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id)
          .eq('status', 'completed');

        const completionRate = enrollmentCount > 0 ? (completedCount / enrollmentCount) * 100 : 0;

        return {
          ...course,
          total_students: enrollmentCount || 0,
          total_assignments: assignmentCount || 0,
          total_materials: materialCount || 0,
          average_grade: Math.round(averageGrade * 100) / 100,
          completion_rate: Math.round(completionRate * 100) / 100
        };
      })
    );

    return coursesWithStats;
  } catch (error) {
    console.error('Error fetching lecturer courses:', error);
    throw error;
  }
};

// Get course analytics for lecturer dashboard
export const getCourseAnalytics = async (lecturerId: string): Promise<CourseAnalytics[]> => {
  try {
    const { data: courses, error } = await supabase
      .from('courses')
      .select('id, title, code')
      .eq('created_by', lecturerId);

    if (error) throw error;

    const analytics = await Promise.all(
      courses.map(async (course) => {
        // Get total and active students
        const { count: totalStudents } = await supabase
          .from('course_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id)
          .eq('status', 'enrolled');

        // Get active students (logged in within last 7 days)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { count: activeStudents } = await supabase
          .from('analytics_data')
          .select('user_id', { count: 'exact', head: true })
          .eq('course_id', course.id)
          .eq('activity_type', 'login')
          .gte('created_at', sevenDaysAgo.toISOString());

        // Get average grade
        const { data: grades } = await supabase
          .from('assignment_submissions')
          .select(`
            grade,
            assignment:assignments!inner(course_id)
          `)
          .eq('assignment.course_id', course.id)
          .not('grade', 'is', null);

        let averageGrade = 0;
        if (grades && grades.length > 0) {
          const numericGrades = grades
            .map(g => g.grade)
            .filter(g => g !== null && g !== undefined);

          if (numericGrades.length > 0) {
            averageGrade = numericGrades.reduce((sum, grade) => sum + grade, 0) / numericGrades.length;
          }
        }

        // Get assignment completion rate
        const { count: totalAssignments } = await supabase
          .from('assignments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id);

        const { count: submittedAssignments } = await supabase
          .from('assignment_submissions')
          .select(`
            *,
            assignment:assignments!inner(course_id)
          `, { count: 'exact', head: true })
          .eq('assignment.course_id', course.id);

        const assignmentCompletionRate = totalAssignments > 0
          ? (submittedAssignments / (totalAssignments * (totalStudents || 1))) * 100
          : 0;

        // Get material views
        const { count: materialViews } = await supabase
          .from('analytics_data')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id)
          .eq('activity_type', 'material_view');

        // Get discussion posts
        const { count: discussionPosts } = await supabase
          .from('analytics_data')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id)
          .eq('activity_type', 'discussion_post');

        // Calculate attendance rate (based on login frequency)
        const { count: loginCount } = await supabase
          .from('analytics_data')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id)
          .eq('activity_type', 'login')
          .gte('created_at', sevenDaysAgo.toISOString());

        const attendanceRate = totalStudents > 0 ? (loginCount / (totalStudents * 7)) * 100 : 0;

        // Calculate performance trend (compare with previous month)
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const { data: previousGrades } = await supabase
          .from('assignment_submissions')
          .select(`
            grade,
            assignment:assignments!inner(course_id)
          `)
          .eq('assignment.course_id', course.id)
          .lt('submitted_at', oneMonthAgo.toISOString())
          .not('grade', 'is', null);

        let previousAverageGrade = 0;
        if (previousGrades && previousGrades.length > 0) {
          const numericGrades = previousGrades
            .map(g => g.grade)
            .filter(g => g !== null && g !== undefined);

          if (numericGrades.length > 0) {
            previousAverageGrade = numericGrades.reduce((sum, grade) => sum + grade, 0) / numericGrades.length;
          }
        }

        const trendPercentage = previousAverageGrade > 0
          ? ((averageGrade - previousAverageGrade) / previousAverageGrade) * 100
          : 0;

        const performanceTrend: 'up' | 'down' | 'stable' = trendPercentage > 2 ? 'up' : trendPercentage < -2 ? 'down' : 'stable';

        return {
          course_id: course.id,
          total_students: totalStudents || 0,
          active_students: activeStudents || 0,
          average_grade: Math.round(averageGrade * 100) / 100,
          assignment_completion_rate: Math.round(assignmentCompletionRate * 100) / 100,
          material_views: materialViews || 0,
          discussion_posts: discussionPosts || 0,
          attendance_rate: Math.round(attendanceRate * 100) / 100,
          performance_trend: performanceTrend,
          trend_percentage: Math.round(trendPercentage * 100) / 100
        };
      })
    );

    return analytics;
  } catch (error) {
    console.error('Error fetching course analytics:', error);
    throw error;
  }
};

// Create a new course
export const createCourse = async (courseData: Omit<Course, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .insert(courseData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating course:', error);
    throw error;
  }
};

// Update a course
export const updateCourse = async (courseId: string, updates: Partial<Course>) => {
  try {
    const { data, error } = await supabase
      .from('courses')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', courseId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating course:', error);
    throw error;
  }
};

// Delete a course
export const deleteCourse = async (courseId: string) => {
  try {
    const { error } = await supabase
      .from('courses')
      .delete()
      .eq('id', courseId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting course:', error);
    throw error;
  }
};

// Get course materials
export const getCourseMaterials = async (courseId: string) => {
  try {
    const { data, error } = await supabase
      .from('course_materials')
      .select(`
        *,
        creator:users!created_by(full_name, email)
      `)
      .eq('course_id', courseId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching course materials:', error);
    throw error;
  }
};

// Add course material
export const addCourseMaterial = async (materialData: Omit<CourseMaterial, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('course_materials')
      .insert(materialData)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error adding course material:', error);
    throw error;
  }
};

// Get course assignments
export const getCourseAssignments = async (courseId: string) => {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        creator:users!created_by(full_name, email),
        submissions:assignment_submissions(count)
      `)
      .eq('course_id', courseId)
      .order('due_date', { ascending: true });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching course assignments:', error);
    throw error;
  }
};

// Enroll student in course
export const enrollStudent = async (userId: string, courseId: string) => {
  try {
    const { data, error } = await supabase
      .from('course_enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        status: 'enrolled'
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error enrolling student:', error);
    throw error;
  }
};

// Get enrolled students for a course
export const getCourseStudents = async (courseId: string) => {
  try {
    const { data, error } = await supabase
      .from('course_enrollments')
      .select(`
        *,
        student:users!user_id(
          id,
          full_name,
          email,
          student_id,
          avatar_url
        )
      `)
      .eq('course_id', courseId)
      .eq('status', 'enrolled')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get additional stats for each student
    const studentsWithStats = await Promise.all(
      data.map(async (enrollment) => {
        // Get assignment completion rate
        const { count: totalAssignments } = await supabase
          .from('assignments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', courseId);

        const { count: submittedAssignments } = await supabase
          .from('assignment_submissions')
          .select(`
            *,
            assignment:assignments!inner(course_id)
          `, { count: 'exact', head: true })
          .eq('user_id', enrollment.user_id)
          .eq('assignment.course_id', courseId);

        // Get average grade
        const { data: grades } = await supabase
          .from('assignment_submissions')
          .select(`
            grade,
            assignment:assignments!inner(course_id)
          `)
          .eq('user_id', enrollment.user_id)
          .eq('assignment.course_id', courseId)
          .not('grade', 'is', null);

        const averageGrade = grades && grades.length > 0
          ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
          : 0;

        // Get attendance (login frequency)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { count: loginCount } = await supabase
          .from('analytics_data')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', enrollment.user_id)
          .eq('course_id', courseId)
          .eq('activity_type', 'login')
          .gte('created_at', sevenDaysAgo.toISOString());

        return {
          ...enrollment,
          completion_rate: totalAssignments > 0 ? (submittedAssignments / totalAssignments) * 100 : 0,
          average_grade: Math.round(averageGrade * 100) / 100,
          attendance_score: Math.min((loginCount / 7) * 100, 100), // Max 100%
          total_assignments: totalAssignments || 0,
          submitted_assignments: submittedAssignments || 0
        };
      })
    );

    return studentsWithStats;
  } catch (error) {
    console.error('Error fetching course students:', error);
    throw error;
  }
};

// Export course data
export const exportCourseData = async (courseId: string, format: 'csv' | 'json' = 'csv') => {
  try {
    // Get course details
    const { data: course } = await supabase
      .from('courses')
      .select('*')
      .eq('id', courseId)
      .single();

    // Get students with stats
    const students = await getCourseStudents(courseId);

    // Get assignments
    const assignments = await getCourseAssignments(courseId);

    const exportData = {
      course,
      students: students.map(s => ({
        name: s.student.full_name,
        email: s.student.email,
        student_id: s.student.student_id,
        enrollment_date: s.created_at,
        completion_rate: s.completion_rate,
        average_grade: s.average_grade,
        attendance_score: s.attendance_score
      })),
      assignments: assignments.map(a => ({
        title: a.title,
        due_date: a.due_date,
        total_points: a.total_points,
        submissions: a.submissions?.length || 0
      }))
    };

    if (format === 'csv') {
      // Convert to CSV format
      const csvData = convertToCSV(exportData.students);
      return csvData;
    }

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting course data:', error);
    throw error;
  }
};

// Helper function to convert data to CSV
const convertToCSV = (data: any[]) => {
  if (data.length === 0) return '';

  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row =>
      headers.map(header =>
        typeof row[header] === 'string' ? `"${row[header]}"` : row[header]
      ).join(',')
    )
  ].join('\n');

  return csvContent;
};
