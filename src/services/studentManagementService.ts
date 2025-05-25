import { supabase } from '@/lib/supabaseClient';
import { sendMessage } from './messagingService';

export interface StudentWithStats {
  id: string;
  full_name: string;
  email: string;
  student_id: string;
  avatar_url?: string;
  enrollment_date: string;
  status: string;
  course_id: string;
  course_name: string;
  course_code: string;
  completion_rate: number;
  average_grade: number;
  attendance_score: number;
  total_assignments: number;
  submitted_assignments: number;
  last_activity: string;
  performance_trend: 'up' | 'down' | 'stable';
  risk_level: 'low' | 'medium' | 'high';
}

export interface StudentAnalytics {
  student_id: string;
  weekly_activity: {
    week: string;
    logins: number;
    submissions: number;
    materials_viewed: number;
  }[];
  grade_progression: {
    assignment: string;
    grade: number;
    date: string;
  }[];
  engagement_metrics: {
    total_logins: number;
    avg_session_duration: number;
    materials_accessed: number;
    discussions_participated: number;
  };
}

// Get all students for a lecturer's courses
export const getLecturerStudents = async (lecturerId: string): Promise<StudentWithStats[]> => {
  try {
    // Get lecturer's courses
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, code')
      .eq('created_by', lecturerId);

    if (!courses || courses.length === 0) return [];

    const courseIds = courses.map(c => c.id);

    // Get all enrollments for these courses
    const { data: enrollments, error } = await supabase
      .from('course_enrollments')
      .select(`
        *,
        student:users!user_id(
          id,
          full_name,
          email,
          student_id,
          avatar_url
        ),
        course:courses!course_id(
          id,
          title,
          code
        )
      `)
      .in('course_id', courseIds)
      .eq('status', 'enrolled')
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Get detailed stats for each student
    const studentsWithStats = await Promise.all(
      enrollments.map(async (enrollment) => {
        const studentId = enrollment.user_id;
        const courseId = enrollment.course_id;

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
          .eq('user_id', studentId)
          .eq('assignment.course_id', courseId);

        // Get average grade
        const { data: grades } = await supabase
          .from('assignment_submissions')
          .select(`
            grade,
            assignment:assignments!inner(course_id)
          `)
          .eq('user_id', studentId)
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
          .eq('user_id', studentId)
          .eq('course_id', courseId)
          .eq('activity_type', 'login')
          .gte('created_at', sevenDaysAgo.toISOString());

        // Get last activity
        const { data: lastActivity } = await supabase
          .from('analytics_data')
          .select('created_at')
          .eq('user_id', studentId)
          .eq('course_id', courseId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Calculate performance trend
        const oneMonthAgo = new Date();
        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

        const { data: recentGrades } = await supabase
          .from('assignment_submissions')
          .select(`
            grade,
            assignment:assignments!inner(course_id)
          `)
          .eq('user_id', studentId)
          .eq('assignment.course_id', courseId)
          .gte('graded_at', oneMonthAgo.toISOString())
          .not('grade', 'is', null);

        const { data: olderGrades } = await supabase
          .from('assignment_submissions')
          .select(`
            grade,
            assignment:assignments!inner(course_id)
          `)
          .eq('user_id', studentId)
          .eq('assignment.course_id', courseId)
          .lt('graded_at', oneMonthAgo.toISOString())
          .not('grade', 'is', null);

        let performanceTrend: 'up' | 'down' | 'stable' = 'stable';
        if (recentGrades && olderGrades && recentGrades.length > 0 && olderGrades.length > 0) {
          const recentAvg = recentGrades.reduce((sum, g) => sum + g.grade, 0) / recentGrades.length;
          const olderAvg = olderGrades.reduce((sum, g) => sum + g.grade, 0) / olderGrades.length;
          const diff = recentAvg - olderAvg;
          
          if (diff > 5) performanceTrend = 'up';
          else if (diff < -5) performanceTrend = 'down';
        }

        // Calculate risk level
        const completionRate = totalAssignments > 0 ? (submittedAssignments / totalAssignments) * 100 : 0;
        const attendanceScore = Math.min((loginCount / 7) * 100, 100);
        
        let riskLevel: 'low' | 'medium' | 'high' = 'low';
        if (averageGrade < 60 || completionRate < 50 || attendanceScore < 30) {
          riskLevel = 'high';
        } else if (averageGrade < 75 || completionRate < 75 || attendanceScore < 60) {
          riskLevel = 'medium';
        }

        return {
          id: enrollment.student.id,
          full_name: enrollment.student.full_name,
          email: enrollment.student.email,
          student_id: enrollment.student.student_id,
          avatar_url: enrollment.student.avatar_url,
          enrollment_date: enrollment.created_at,
          status: enrollment.status,
          course_id: courseId,
          course_name: enrollment.course.title,
          course_code: enrollment.course.code,
          completion_rate: Math.round(completionRate * 100) / 100,
          average_grade: Math.round(averageGrade * 100) / 100,
          attendance_score: Math.round(attendanceScore * 100) / 100,
          total_assignments: totalAssignments || 0,
          submitted_assignments: submittedAssignments || 0,
          last_activity: lastActivity?.created_at || enrollment.created_at,
          performance_trend: performanceTrend,
          risk_level: riskLevel
        };
      })
    );

    return studentsWithStats;
  } catch (error) {
    console.error('Error fetching lecturer students:', error);
    throw error;
  }
};

// Get detailed analytics for a specific student
export const getStudentAnalytics = async (studentId: string, courseId: string): Promise<StudentAnalytics> => {
  try {
    // Get weekly activity for the past 8 weeks
    const weeklyActivity = [];
    for (let i = 7; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      const { count: logins } = await supabase
        .from('analytics_data')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', studentId)
        .eq('course_id', courseId)
        .eq('activity_type', 'login')
        .gte('created_at', weekStart.toISOString())
        .lt('created_at', weekEnd.toISOString());

      const { count: submissions } = await supabase
        .from('analytics_data')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', studentId)
        .eq('course_id', courseId)
        .eq('activity_type', 'assignment_submission')
        .gte('created_at', weekStart.toISOString())
        .lt('created_at', weekEnd.toISOString());

      const { count: materialsViewed } = await supabase
        .from('analytics_data')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', studentId)
        .eq('course_id', courseId)
        .eq('activity_type', 'material_view')
        .gte('created_at', weekStart.toISOString())
        .lt('created_at', weekEnd.toISOString());

      weeklyActivity.push({
        week: `Week ${8 - i}`,
        logins: logins || 0,
        submissions: submissions || 0,
        materials_viewed: materialsViewed || 0
      });
    }

    // Get grade progression
    const { data: submissions } = await supabase
      .from('assignment_submissions')
      .select(`
        grade,
        graded_at,
        assignment:assignments!inner(title, course_id)
      `)
      .eq('user_id', studentId)
      .eq('assignment.course_id', courseId)
      .not('grade', 'is', null)
      .order('graded_at', { ascending: true });

    const gradeProgression = submissions?.map(s => ({
      assignment: s.assignment.title,
      grade: s.grade,
      date: s.graded_at
    })) || [];

    // Get engagement metrics
    const { count: totalLogins } = await supabase
      .from('analytics_data')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', studentId)
      .eq('course_id', courseId)
      .eq('activity_type', 'login');

    const { data: sessions } = await supabase
      .from('analytics_data')
      .select('duration_seconds')
      .eq('user_id', studentId)
      .eq('course_id', courseId)
      .not('duration_seconds', 'is', null);

    const avgSessionDuration = sessions && sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessions.length
      : 0;

    const { count: materialsAccessed } = await supabase
      .from('analytics_data')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', studentId)
      .eq('course_id', courseId)
      .eq('activity_type', 'material_view');

    const { count: discussionsParticipated } = await supabase
      .from('analytics_data')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', studentId)
      .eq('course_id', courseId)
      .eq('activity_type', 'discussion_post');

    return {
      student_id: studentId,
      weekly_activity: weeklyActivity,
      grade_progression: gradeProgression,
      engagement_metrics: {
        total_logins: totalLogins || 0,
        avg_session_duration: Math.round(avgSessionDuration),
        materials_accessed: materialsAccessed || 0,
        discussions_participated: discussionsParticipated || 0
      }
    };
  } catch (error) {
    console.error('Error fetching student analytics:', error);
    throw error;
  }
};

// Send message to student
export const sendMessageToStudent = async (
  studentId: string,
  subject: string,
  content: string,
  senderId: string,
  courseId?: string
): Promise<void> => {
  try {
    await sendMessage({
      recipient_id: studentId,
      subject: subject,
      content: content,
      course_id: courseId,
      priority: 'normal'
    }, senderId);
  } catch (error) {
    console.error('Error sending message to student:', error);
    throw error;
  }
};

// Export student data for a course
export const exportStudentData = async (courseId: string, format: 'csv' | 'json' = 'csv') => {
  try {
    const { data: enrollments, error } = await supabase
      .from('course_enrollments')
      .select(`
        *,
        student:users!user_id(
          full_name,
          email,
          student_id
        )
      `)
      .eq('course_id', courseId)
      .eq('status', 'enrolled');

    if (error) throw error;

    const exportData = enrollments.map(enrollment => ({
      student_name: enrollment.student.full_name,
      student_email: enrollment.student.email,
      student_id: enrollment.student.student_id,
      enrollment_date: enrollment.created_at,
      status: enrollment.status,
      grade: enrollment.grade || 'Not graded'
    }));

    if (format === 'csv') {
      const headers = Object.keys(exportData[0] || {});
      const csvContent = [
        headers.join(','),
        ...exportData.map(row => 
          headers.map(header => 
            typeof row[header as keyof typeof row] === 'string' 
              ? `"${row[header as keyof typeof row]}"` 
              : row[header as keyof typeof row]
          ).join(',')
        )
      ].join('\n');
      
      return csvContent;
    }

    return JSON.stringify(exportData, null, 2);
  } catch (error) {
    console.error('Error exporting student data:', error);
    throw error;
  }
};
