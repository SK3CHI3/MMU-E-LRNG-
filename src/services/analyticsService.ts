import { supabase } from '@/lib/supabaseClient';

export interface LecturerAnalytics {
  overview: {
    totalStudents: number;
    activeStudents: number;
    averageGrade: number;
    attendanceRate: number;
    assignmentCompletion: number;
    courseCompletion: number;
    improvementRate: number;
  };
  coursePerformance: CoursePerformanceData[];
  studentDistribution: StudentDistribution;
  weeklyTrends: WeeklyTrend[];
  engagementMetrics: EngagementMetrics;
}

export interface CoursePerformanceData {
  course_id: string;
  course: string;
  students: number;
  averageGrade: number;
  attendance: number;
  completion: number;
  trend: 'up' | 'down' | 'stable';
  trendValue: number;
}

export interface StudentDistribution {
  highPerformers: number;
  averagePerformers: number;
  needsAttention: number;
  atRisk: number;
}

export interface WeeklyTrend {
  week: string;
  logins: number;
  submissions: number;
  materials: number;
  discussions: number;
}

export interface EngagementMetrics {
  materialViews: number;
  forumPosts: number;
  aiTutorQueries: number;
  messagesSent: number;
  averageSessionDuration: number;
  peakActivityHour: number;
}

// Get comprehensive analytics for a lecturer
// Track user activity
export const trackActivity = async (
  userId: string,
  courseId: string,
  activityType: string,
  durationSeconds?: number
) => {
  try {
    await supabase
      .from('analytics_data')
      .insert({
        user_id: userId,
        course_id: courseId,
        activity_type: activityType,
        duration_seconds: durationSeconds
      });
  } catch (error) {
    console.error('Error tracking activity:', error);
  }
};

export const getLecturerAnalytics = async (lecturerId: string): Promise<LecturerAnalytics> => {
  try {
    // Get lecturer's courses
    const { data: courses } = await supabase
      .from('courses')
      .select('id, title, code')
      .eq('created_by', lecturerId);

    if (!courses || courses.length === 0) {
      return getEmptyAnalytics();
    }

    const courseIds = courses.map(c => c.id);

    // Get overview statistics
    const overview = await getOverviewStats(courseIds);

    // Get course performance data
    const coursePerformance = await getCoursePerformanceData(courses);

    // Get student distribution
    const studentDistribution = await getStudentDistribution(courseIds);

    // Get weekly trends
    const weeklyTrends = await getWeeklyTrends(courseIds);

    // Get engagement metrics
    const engagementMetrics = await getEngagementMetrics(courseIds);

    return {
      overview,
      coursePerformance,
      studentDistribution,
      weeklyTrends,
      engagementMetrics
    };
  } catch (error) {
    console.error('Error fetching lecturer analytics:', error);
    throw error;
  }
};

// Get overview statistics
const getOverviewStats = async (courseIds: string[]) => {
  try {
    // Total students across all courses
    const { count: totalStudents } = await supabase
      .from('course_enrollments')
      .select('*', { count: 'exact', head: true })
      .in('course_id', courseIds)
      .eq('status', 'enrolled');

    // Active students (logged in within last 7 days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const { data: activeStudentData } = await supabase
      .from('analytics_data')
      .select('user_id')
      .in('course_id', courseIds)
      .eq('activity_type', 'login')
      .gte('created_at', sevenDaysAgo.toISOString());

    const activeStudents = new Set(activeStudentData?.map(d => d.user_id) || []).size;

    // Average grade across all courses
    const { data: grades } = await supabase
      .from('assignment_submissions')
      .select(`
        grade,
        assignment:assignments!inner(course_id)
      `)
      .in('assignment.course_id', courseIds)
      .not('grade', 'is', null);

    const averageGrade = grades && grades.length > 0
      ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
      : 0;

    // Attendance rate (based on login frequency)
    const { count: loginCount } = await supabase
      .from('analytics_data')
      .select('*', { count: 'exact', head: true })
      .in('course_id', courseIds)
      .eq('activity_type', 'login')
      .gte('created_at', sevenDaysAgo.toISOString());

    const attendanceRate = totalStudents > 0 ? (loginCount / (totalStudents * 7)) * 100 : 0;

    // Assignment completion rate
    const { count: totalAssignments } = await supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true })
      .in('course_id', courseIds);

    const { count: submittedAssignments } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        assignment:assignments!inner(course_id)
      `, { count: 'exact', head: true })
      .in('assignment.course_id', courseIds);

    const assignmentCompletion = totalAssignments > 0 && totalStudents > 0
      ? (submittedAssignments / (totalAssignments * totalStudents)) * 100
      : 0;

    // Course completion rate
    const { count: completedCourses } = await supabase
      .from('course_enrollments')
      .select('*', { count: 'exact', head: true })
      .in('course_id', courseIds)
      .eq('status', 'completed');

    const courseCompletion = totalStudents > 0 ? (completedCourses / totalStudents) * 100 : 0;

    // Calculate improvement rate (compare with previous month)
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const { data: previousGrades } = await supabase
      .from('assignment_submissions')
      .select(`
        grade,
        assignment:assignments!inner(course_id)
      `)
      .in('assignment.course_id', courseIds)
      .lt('submitted_at', oneMonthAgo.toISOString())
      .not('grade', 'is', null);

    const previousAverageGrade = previousGrades && previousGrades.length > 0
      ? previousGrades.reduce((sum, g) => sum + g.grade, 0) / previousGrades.length
      : 0;

    const improvementRate = previousAverageGrade > 0
      ? ((averageGrade - previousAverageGrade) / previousAverageGrade) * 100
      : 0;

    return {
      totalStudents: totalStudents || 0,
      activeStudents,
      averageGrade: Math.round(averageGrade * 100) / 100,
      attendanceRate: Math.round(attendanceRate * 100) / 100,
      assignmentCompletion: Math.round(assignmentCompletion * 100) / 100,
      courseCompletion: Math.round(courseCompletion * 100) / 100,
      improvementRate: Math.round(improvementRate * 100) / 100
    };
  } catch (error) {
    console.error('Error fetching overview stats:', error);
    return {
      totalStudents: 0,
      activeStudents: 0,
      averageGrade: 0,
      attendanceRate: 0,
      assignmentCompletion: 0,
      courseCompletion: 0,
      improvementRate: 0
    };
  }
};

// Get course performance data
const getCoursePerformanceData = async (courses: any[]): Promise<CoursePerformanceData[]> => {
  try {
    const performanceData = await Promise.all(
      courses.map(async (course) => {
        // Get enrolled students count
        const { count: students } = await supabase
          .from('course_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id)
          .eq('status', 'enrolled');

        // Get average grade for this course
        const { data: grades } = await supabase
          .from('assignment_submissions')
          .select(`
            grade,
            assignment:assignments!inner(course_id)
          `)
          .eq('assignment.course_id', course.id)
          .not('grade', 'is', null);

        const averageGrade = grades && grades.length > 0
          ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
          : 0;

        // Get attendance rate
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

        const { count: loginCount } = await supabase
          .from('analytics_data')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id)
          .eq('activity_type', 'login')
          .gte('created_at', sevenDaysAgo.toISOString());

        const attendance = students > 0 ? (loginCount / (students * 7)) * 100 : 0;

        // Get completion rate
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

        const completion = totalAssignments > 0 && students > 0
          ? (submittedAssignments / (totalAssignments * students)) * 100
          : 0;

        // Calculate trend
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

        const previousAverageGrade = previousGrades && previousGrades.length > 0
          ? previousGrades.reduce((sum, g) => sum + g.grade, 0) / previousGrades.length
          : 0;

        const trendValue = previousAverageGrade > 0
          ? ((averageGrade - previousAverageGrade) / previousAverageGrade) * 100
          : 0;

        const trend = trendValue > 2 ? 'up' : trendValue < -2 ? 'down' : 'stable';

        return {
          course_id: course.id,
          course: `${course.code} - ${course.title}`,
          students: students || 0,
          averageGrade: Math.round(averageGrade * 100) / 100,
          attendance: Math.round(attendance * 100) / 100,
          completion: Math.round(completion * 100) / 100,
          trend: trend as 'up' | 'down' | 'stable',
          trendValue: Math.round(trendValue * 100) / 100
        };
      })
    );

    return performanceData;
  } catch (error) {
    console.error('Error fetching course performance data:', error);
    return [];
  }
};

// Get student distribution
const getStudentDistribution = async (courseIds: string[]): Promise<StudentDistribution> => {
  try {
    // Get all students with their average grades
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('user_id')
      .in('course_id', courseIds)
      .eq('status', 'enrolled');

    if (!enrollments || enrollments.length === 0) {
      return { highPerformers: 0, averagePerformers: 0, needsAttention: 0, atRisk: 0 };
    }

    const studentIds = enrollments.map(e => e.user_id);

    // Get grades for each student
    const studentGrades = await Promise.all(
      studentIds.map(async (studentId) => {
        const { data: grades } = await supabase
          .from('assignment_submissions')
          .select(`
            grade,
            assignment:assignments!inner(course_id)
          `)
          .eq('user_id', studentId)
          .in('assignment.course_id', courseIds)
          .not('grade', 'is', null);

        const averageGrade = grades && grades.length > 0
          ? grades.reduce((sum, g) => sum + g.grade, 0) / grades.length
          : 0;

        return averageGrade;
      })
    );

    // Categorize students based on performance
    const highPerformers = studentGrades.filter(grade => grade >= 90).length;
    const averagePerformers = studentGrades.filter(grade => grade >= 70 && grade < 90).length;
    const needsAttention = studentGrades.filter(grade => grade >= 60 && grade < 70).length;
    const atRisk = studentGrades.filter(grade => grade < 60).length;

    return {
      highPerformers,
      averagePerformers,
      needsAttention,
      atRisk
    };
  } catch (error) {
    console.error('Error fetching student distribution:', error);
    return { highPerformers: 0, averagePerformers: 0, needsAttention: 0, atRisk: 0 };
  }
};

// Get weekly trends
const getWeeklyTrends = async (courseIds: string[]): Promise<WeeklyTrend[]> => {
  try {
    const trends = [];

    for (let i = 4; i >= 0; i--) {
      const weekStart = new Date();
      weekStart.setDate(weekStart.getDate() - (i * 7));
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekEnd.getDate() + 6);

      // Get logins for this week
      const { count: logins } = await supabase
        .from('analytics_data')
        .select('*', { count: 'exact', head: true })
        .in('course_id', courseIds)
        .eq('activity_type', 'login')
        .gte('created_at', weekStart.toISOString())
        .lt('created_at', weekEnd.toISOString());

      // Get submissions for this week
      const { count: submissions } = await supabase
        .from('analytics_data')
        .select('*', { count: 'exact', head: true })
        .in('course_id', courseIds)
        .eq('activity_type', 'assignment_submission')
        .gte('created_at', weekStart.toISOString())
        .lt('created_at', weekEnd.toISOString());

      // Get material views for this week
      const { count: materials } = await supabase
        .from('analytics_data')
        .select('*', { count: 'exact', head: true })
        .in('course_id', courseIds)
        .eq('activity_type', 'material_view')
        .gte('created_at', weekStart.toISOString())
        .lt('created_at', weekEnd.toISOString());

      // Get discussion posts for this week
      const { count: discussions } = await supabase
        .from('analytics_data')
        .select('*', { count: 'exact', head: true })
        .in('course_id', courseIds)
        .eq('activity_type', 'discussion_post')
        .gte('created_at', weekStart.toISOString())
        .lt('created_at', weekEnd.toISOString());

      trends.push({
        week: `Week ${5 - i}`,
        logins: logins || 0,
        submissions: submissions || 0,
        materials: materials || 0,
        discussions: discussions || 0
      });
    }

    return trends;
  } catch (error) {
    console.error('Error fetching weekly trends:', error);
    return [];
  }
};

// Get engagement metrics
const getEngagementMetrics = async (courseIds: string[]): Promise<EngagementMetrics> => {
  try {
    // Get material views
    const { count: materialViews } = await supabase
      .from('analytics_data')
      .select('*', { count: 'exact', head: true })
      .in('course_id', courseIds)
      .eq('activity_type', 'material_view');

    // Get forum posts
    const { count: forumPosts } = await supabase
      .from('analytics_data')
      .select('*', { count: 'exact', head: true })
      .in('course_id', courseIds)
      .eq('activity_type', 'discussion_post');

    // Get AI tutor queries (placeholder - would need AI service integration)
    const aiTutorQueries = Math.floor(Math.random() * 200) + 100;

    // Get messages sent (placeholder - would need messaging service)
    const messagesSent = Math.floor(Math.random() * 300) + 150;

    // Calculate average session duration
    const { data: sessions } = await supabase
      .from('analytics_data')
      .select('duration_seconds')
      .in('course_id', courseIds)
      .not('duration_seconds', 'is', null);

    const averageSessionDuration = sessions && sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.duration_seconds || 0), 0) / sessions.length
      : 0;

    // Calculate peak activity hour (placeholder)
    const peakActivityHour = 14; // 2 PM

    return {
      materialViews: materialViews || 0,
      forumPosts: forumPosts || 0,
      aiTutorQueries,
      messagesSent,
      averageSessionDuration: Math.round(averageSessionDuration),
      peakActivityHour
    };
  } catch (error) {
    console.error('Error fetching engagement metrics:', error);
    return {
      materialViews: 0,
      forumPosts: 0,
      aiTutorQueries: 0,
      messagesSent: 0,
      averageSessionDuration: 0,
      peakActivityHour: 0
    };
  }
};

// Get empty analytics structure
const getEmptyAnalytics = (): LecturerAnalytics => ({
  overview: {
    totalStudents: 0,
    activeStudents: 0,
    averageGrade: 0,
    attendanceRate: 0,
    assignmentCompletion: 0,
    courseCompletion: 0,
    improvementRate: 0
  },
  coursePerformance: [],
  studentDistribution: {
    highPerformers: 0,
    averagePerformers: 0,
    needsAttention: 0,
    atRisk: 0
  },
  weeklyTrends: [],
  engagementMetrics: {
    materialViews: 0,
    forumPosts: 0,
    aiTutorQueries: 0,
    messagesSent: 0,
    averageSessionDuration: 0,
    peakActivityHour: 0
  }
});
