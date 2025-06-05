import { supabase } from '@/lib/supabaseClient';

export interface StudentActivity {
  id: string;
  student_id: string;
  activity_type: 'login' | 'study_session' | 'assignment_view' | 'assignment_submit' | 'class_attend' | 'resource_access' | 'quiz_attempt' | 'discussion_post';
  duration_minutes?: number;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface StudyMetrics {
  weeklyStudyHours: number;
  weeklyStudyData: number[]; // 7 days
  studyActivityTrend: number;
  attendanceRate: number;
  attendanceTrend: number;
  classesAttended: number;
  totalClasses: number;
  completedAssignments: number;
  overdueAssignments: number;
  studyPattern: number[];
  lastWeekAvgHours: number;
  weeklyStudyTrend: number;
  performanceTrend: number;
  gpaHistory: Array<{ gpa: number; date: string }>;
  overallProgress: number;
}

class StudentActivityService {
  // Track student activity
  async trackActivity(
    studentId: string, 
    activityType: StudentActivity['activity_type'], 
    durationMinutes?: number,
    metadata?: Record<string, any>
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('student_activities')
        .insert({
          student_id: studentId,
          activity_type: activityType,
          duration_minutes: durationMinutes,
          metadata: metadata || {},
          created_at: new Date().toISOString()
        });

      if (error) {
        console.error('Error tracking activity:', error);
      }
    } catch (error) {
      console.error('Error tracking activity:', error);
    }
  }

  // Get student study metrics based on platform interactions
  async getStudyMetrics(studentId: string): Promise<StudyMetrics> {
    try {
      const oneWeekAgo = new Date();
      oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
      
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);

      // Get activities from the last two weeks
      const { data: activities, error } = await supabase
        .from('student_activities')
        .select('*')
        .eq('student_id', studentId)
        .gte('created_at', twoWeeksAgo.toISOString())
        .order('created_at', { ascending: true });

      if (error) {
        console.error('Error fetching activities:', error);
        return this.getDefaultMetrics();
      }

      return this.calculateMetrics(activities || []);
    } catch (error) {
      console.error('Error getting study metrics:', error);
      return this.getDefaultMetrics();
    }
  }

  private calculateMetrics(activities: StudentActivity[]): StudyMetrics {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

    // Filter activities by time periods
    const thisWeekActivities = activities.filter(a => new Date(a.created_at) >= oneWeekAgo);
    const lastWeekActivities = activities.filter(a => 
      new Date(a.created_at) >= twoWeeksAgo && new Date(a.created_at) < oneWeekAgo
    );

    // Calculate study hours for each day of the week
    const weeklyStudyData = Array(7).fill(0);
    const dayOfWeek = (date: Date) => (date.getDay() + 6) % 7; // Monday = 0, Sunday = 6

    thisWeekActivities
      .filter(a => a.activity_type === 'study_session' && a.duration_minutes)
      .forEach(activity => {
        const day = dayOfWeek(new Date(activity.created_at));
        weeklyStudyData[day] += (activity.duration_minutes || 0) / 60;
      });

    const weeklyStudyHours = weeklyStudyData.reduce((sum, hours) => sum + hours, 0);

    // Calculate last week's average for comparison
    const lastWeekStudyHours = lastWeekActivities
      .filter(a => a.activity_type === 'study_session' && a.duration_minutes)
      .reduce((sum, a) => sum + (a.duration_minutes || 0), 0) / 60;
    
    const lastWeekAvgHours = lastWeekStudyHours / 7;

    // Calculate trends
    const studyActivityTrend = lastWeekAvgHours > 0 
      ? Math.round(((weeklyStudyHours / 7 - lastWeekAvgHours) / lastWeekAvgHours) * 100)
      : 0;

    const weeklyStudyTrend = studyActivityTrend;

    // Calculate attendance metrics
    const attendanceActivities = thisWeekActivities.filter(a => a.activity_type === 'class_attend');
    const totalClassesThisWeek = 15; // Assume 3 classes per day * 5 days
    const classesAttended = attendanceActivities.length;
    const attendanceRate = totalClassesThisWeek > 0 ? Math.round((classesAttended / totalClassesThisWeek) * 100) : 0;

    const lastWeekAttendance = lastWeekActivities.filter(a => a.activity_type === 'class_attend').length;
    const attendanceTrend = lastWeekAttendance > 0 
      ? Math.round(((classesAttended - lastWeekAttendance) / lastWeekAttendance) * 100)
      : 0;

    // Calculate assignment metrics
    const completedAssignments = thisWeekActivities.filter(a => a.activity_type === 'assignment_submit').length;
    const overdueAssignments = 0; // This would come from assignment due dates vs submission dates

    // Generate study pattern (weekday vs weekend preference)
    const studyPattern = weeklyStudyData.map(hours => Math.max(0.1, hours / Math.max(1, Math.max(...weeklyStudyData))));

    // Calculate performance trend based on activity consistency
    const activityConsistency = weeklyStudyData.filter(h => h > 0).length / 7;
    const performanceTrend = Math.round(activityConsistency * studyActivityTrend);

    // Generate GPA history (simplified - would come from actual grade data)
    const gpaHistory = Array.from({ length: 6 }, (_, i) => ({
      gpa: 3.0 + (performanceTrend / 100) * 0.5 + Math.random() * 0.3,
      date: new Date(now.getTime() - (5 - i) * 30 * 24 * 60 * 60 * 1000).toISOString()
    }));

    // Calculate overall progress
    const overallProgress = Math.min(100, Math.max(0, 
      (attendanceRate * 0.3) + 
      (activityConsistency * 100 * 0.4) + 
      (completedAssignments * 10 * 0.3)
    ));

    return {
      weeklyStudyHours: Math.round(weeklyStudyHours * 10) / 10,
      weeklyStudyData: weeklyStudyData.map(h => Math.round(h * 10) / 10),
      studyActivityTrend,
      attendanceRate,
      attendanceTrend,
      classesAttended,
      totalClasses: totalClassesThisWeek,
      completedAssignments,
      overdueAssignments,
      studyPattern,
      lastWeekAvgHours: Math.round(lastWeekAvgHours * 10) / 10,
      weeklyStudyTrend,
      performanceTrend,
      gpaHistory,
      overallProgress: Math.round(overallProgress)
    };
  }

  private getDefaultMetrics(): StudyMetrics {
    return {
      weeklyStudyHours: 0,
      weeklyStudyData: Array(7).fill(0),
      studyActivityTrend: 0,
      attendanceRate: 0,
      attendanceTrend: 0,
      classesAttended: 0,
      totalClasses: 0,
      completedAssignments: 0,
      overdueAssignments: 0,
      studyPattern: Array(7).fill(0.1),
      lastWeekAvgHours: 0,
      weeklyStudyTrend: 0,
      performanceTrend: 0,
      gpaHistory: [],
      overallProgress: 0
    };
  }

  // Track study session
  async trackStudySession(studentId: string, durationMinutes: number, subject?: string): Promise<void> {
    await this.trackActivity(studentId, 'study_session', durationMinutes, { subject });
  }

  // Track class attendance
  async trackClassAttendance(studentId: string, classId: string, className: string): Promise<void> {
    await this.trackActivity(studentId, 'class_attend', undefined, { classId, className });
  }

  // Track assignment submission
  async trackAssignmentSubmission(studentId: string, assignmentId: string, assignmentName: string): Promise<void> {
    await this.trackActivity(studentId, 'assignment_submit', undefined, { assignmentId, assignmentName });
  }

  // Track resource access
  async trackResourceAccess(studentId: string, resourceType: string, resourceId: string): Promise<void> {
    await this.trackActivity(studentId, 'resource_access', undefined, { resourceType, resourceId });
  }

  // Track login
  async trackLogin(studentId: string): Promise<void> {
    await this.trackActivity(studentId, 'login');
  }
}

export const studentActivityService = new StudentActivityService();
export default studentActivityService;
