import { supabase, supabaseAdmin, Course, Assignment, AssignmentSubmission, CourseMaterial } from '@/lib/supabaseClient';
import { trackActivity } from './analyticsService';

export interface StudentCourse extends Course {
  enrollment_id: string;
  enrollment_status: string;
  grade?: string;
  progress: number;
  next_assignment?: Assignment;
  recent_materials: CourseMaterial[];
}

export interface StudentAssignment extends Assignment {
  course_title: string;
  course_code: string;
  submission?: AssignmentSubmission;
  status: 'pending' | 'submitted' | 'graded' | 'overdue';
  days_until_due: number;
}

export interface StudentDashboard {
  enrolledCourses: StudentCourse[];
  upcomingAssignments: StudentAssignment[];
  recentGrades: GradeData[];
  progressOverview: ProgressOverview;
  notifications: NotificationData[];
  schedule: ScheduleItem[];
}

export interface GradeData {
  assignment_title: string;
  course_title: string;
  grade: number;
  total_points: number;
  percentage: number;
  graded_at: string;
  feedback?: string;
}

export interface ProgressOverview {
  overallGPA: number;
  completedCourses: number;
  totalCourses: number;
  completedAssignments: number;
  totalAssignments: number;
  averageGrade: number;
  improvementTrend: 'up' | 'down' | 'stable';
}

export interface NotificationData {
  id: string;
  title: string;
  message: string;
  type: string;
  is_read: boolean;
  created_at: string;
  related_id?: string;
}

export interface ScheduleItem {
  id: string;
  title: string;
  type: 'assignment' | 'exam' | 'lecture' | 'event';
  course_title?: string;
  date: string;
  time?: string;
  location?: string;
}

// Get student dashboard data
export const getStudentDashboard = async (userId: string): Promise<StudentDashboard> => {
  try {
    // Track dashboard view
    await trackActivity(userId, 'dashboard', 'dashboard_view');

    // Get enrolled courses with progress
    const enrolledCourses = await getStudentCourses(userId);

    // Get upcoming assignments
    const upcomingAssignments = await getStudentUpcomingAssignments(userId);

    // Get recent grades
    const recentGrades = await getStudentRecentGrades(userId);

    // Get progress overview
    const progressOverview = await getStudentProgressOverview(userId);

    // Get notifications
    const notifications = await getStudentNotifications(userId);

    // Get schedule
    const schedule = await getStudentSchedule(userId);

    return {
      enrolledCourses,
      upcomingAssignments,
      recentGrades,
      progressOverview,
      notifications,
      schedule
    };
  } catch (error) {
    console.error('Error fetching student dashboard:', error);
    throw error;
  }
};

// Get student's enrolled courses with progress
export const getStudentCourses = async (userId: string): Promise<StudentCourse[]> => {
  try {
    const { data: enrollments, error } = await supabaseAdmin
      .from('course_enrollments')
      .select(`
        *,
        course:courses(*)
      `)
      .eq('user_id', userId)
      .eq('status', 'enrolled')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const coursesWithProgress = await Promise.all(
      enrollments.map(async (enrollment) => {
        const course = enrollment.course;

        // Calculate progress based on completed assignments
        const { count: totalAssignments } = await supabaseAdmin
          .from('assignments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', course.id);

        const { count: submittedAssignments } = await supabaseAdmin
          .from('assignment_submissions')
          .select('*', { count: 'exact', head: true })
          .eq('user_id', userId);

        const progress = totalAssignments > 0 ? (submittedAssignments / totalAssignments) * 100 : 0;

        // Get next assignment
        const { data: nextAssignment } = await supabaseAdmin
          .from('assignments')
          .select('*')
          .eq('course_id', course.id)
          .gt('due_date', new Date().toISOString())
          .order('due_date', { ascending: true })
          .limit(1)
          .single();

        // Get recent materials
        const { data: recentMaterials } = await supabaseAdmin
          .from('course_materials')
          .select('*')
          .eq('course_id', course.id)
          .order('created_at', { ascending: false })
          .limit(3);

        return {
          ...course,
          enrollment_id: enrollment.id,
          enrollment_status: enrollment.status,
          grade: enrollment.grade,
          progress: Math.round(progress),
          next_assignment: nextAssignment,
          recent_materials: recentMaterials || []
        };
      })
    );

    return coursesWithProgress;
  } catch (error) {
    console.error('Error fetching student courses:', error);
    throw error;
  }
};

// Get student's upcoming assignments
export const getStudentUpcomingAssignments = async (userId: string): Promise<StudentAssignment[]> => {
  try {
    // Get enrolled course IDs
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('user_id', userId)
      .eq('status', 'enrolled');

    if (!enrollments || enrollments.length === 0) return [];

    const courseIds = enrollments.map(e => e.course_id);

    // Get assignments for enrolled courses
    const { data: assignments, error } = await supabase
      .from('assignments')
      .select(`
        *,
        course:courses(title, code)
      `)
      .in('course_id', courseIds)
      .order('due_date', { ascending: true })
      .limit(10);

    if (error) throw error;

    const assignmentsWithStatus = await Promise.all(
      assignments.map(async (assignment) => {
        // Check if student has submitted
        const { data: submission } = await supabase
          .from('assignment_submissions')
          .select('*')
          .eq('assignment_id', assignment.id)
          .eq('user_id', userId)
          .single();

        // Calculate days until due
        const dueDate = new Date(assignment.due_date);
        const today = new Date();
        const daysDiff = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

        // Determine status
        let status: 'pending' | 'submitted' | 'graded' | 'overdue';
        if (submission) {
          status = submission.grade !== null ? 'graded' : 'submitted';
        } else {
          status = daysDiff < 0 ? 'overdue' : 'pending';
        }

        return {
          ...assignment,
          course_title: assignment.course.title,
          course_code: assignment.course.code,
          submission,
          status,
          days_until_due: daysDiff
        };
      })
    );

    return assignmentsWithStatus;
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    throw error;
  }
};

// Get student's recent grades
export const getStudentRecentGrades = async (userId: string): Promise<GradeData[]> => {
  try {
    const { data: submissions, error } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        assignment:assignments(title, total_points, course:courses(title))
      `)
      .eq('user_id', userId)
      .not('grade', 'is', null)
      .order('graded_at', { ascending: false })
      .limit(10);

    if (error) throw error;

    return submissions.map(submission => ({
      assignment_title: submission.assignment.title,
      course_title: submission.assignment.course.title,
      grade: submission.grade,
      total_points: submission.assignment.total_points,
      percentage: Math.round((submission.grade / submission.assignment.total_points) * 100),
      graded_at: submission.graded_at,
      feedback: submission.feedback
    }));
  } catch (error) {
    console.error('Error fetching student grades:', error);
    throw error;
  }
};

// Get student's progress overview
export const getStudentProgressOverview = async (userId: string): Promise<ProgressOverview> => {
  try {
    // Get all grades
    const { data: submissions } = await supabase
      .from('assignment_submissions')
      .select(`
        grade,
        assignment:assignments(total_points)
      `)
      .eq('user_id', userId)
      .not('grade', 'is', null);

    // Calculate overall GPA (assuming 4.0 scale)
    let overallGPA = 0;
    let averageGrade = 0;

    if (submissions && submissions.length > 0) {
      const percentages = submissions.map(s => (s.grade / s.assignment.total_points) * 100);
      averageGrade = percentages.reduce((sum, p) => sum + p, 0) / percentages.length;

      // Convert to 4.0 scale
      if (averageGrade >= 90) overallGPA = 4.0;
      else if (averageGrade >= 80) overallGPA = 3.0;
      else if (averageGrade >= 70) overallGPA = 2.0;
      else if (averageGrade >= 60) overallGPA = 1.0;
      else overallGPA = 0.0;
    }

    // Get course completion stats
    const { count: totalCourses } = await supabase
      .from('course_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    const { count: completedCourses } = await supabase
      .from('course_enrollments')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('status', 'completed');

    // Get assignment completion stats
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('user_id', userId)
      .eq('status', 'enrolled');

    const courseIds = enrollments?.map(e => e.course_id) || [];

    const { count: totalAssignments } = await supabase
      .from('assignments')
      .select('*', { count: 'exact', head: true })
      .in('course_id', courseIds);

    const { count: completedAssignments } = await supabase
      .from('assignment_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId);

    // Calculate improvement trend
    const oneMonthAgo = new Date();
    oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

    const { data: recentSubmissions } = await supabase
      .from('assignment_submissions')
      .select(`
        grade,
        assignment:assignments(total_points)
      `)
      .eq('user_id', userId)
      .gte('graded_at', oneMonthAgo.toISOString())
      .not('grade', 'is', null);

    const { data: olderSubmissions } = await supabase
      .from('assignment_submissions')
      .select(`
        grade,
        assignment:assignments(total_points)
      `)
      .eq('user_id', userId)
      .lt('graded_at', oneMonthAgo.toISOString())
      .not('grade', 'is', null);

    let improvementTrend: 'up' | 'down' | 'stable' = 'stable';

    if (recentSubmissions && olderSubmissions && recentSubmissions.length > 0 && olderSubmissions.length > 0) {
      const recentAvg = recentSubmissions.reduce((sum, s) => sum + (s.grade / s.assignment.total_points) * 100, 0) / recentSubmissions.length;
      const olderAvg = olderSubmissions.reduce((sum, s) => sum + (s.grade / s.assignment.total_points) * 100, 0) / olderSubmissions.length;

      const diff = recentAvg - olderAvg;
      if (diff > 5) improvementTrend = 'up';
      else if (diff < -5) improvementTrend = 'down';
    }

    return {
      overallGPA: Math.round(overallGPA * 100) / 100,
      completedCourses: completedCourses || 0,
      totalCourses: totalCourses || 0,
      completedAssignments: completedAssignments || 0,
      totalAssignments: totalAssignments || 0,
      averageGrade: Math.round(averageGrade * 100) / 100,
      improvementTrend
    };
  } catch (error) {
    console.error('Error fetching student progress:', error);
    return {
      overallGPA: 0,
      completedCourses: 0,
      totalCourses: 0,
      completedAssignments: 0,
      totalAssignments: 0,
      averageGrade: 0,
      improvementTrend: 'stable'
    };
  }
};

// Get student notifications
export const getStudentNotifications = async (userId: string): Promise<NotificationData[]> => {
  try {
    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(10);

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching student notifications:', error);
    return [];
  }
};

// Get student schedule
export const getStudentSchedule = async (userId: string): Promise<ScheduleItem[]> => {
  try {
    const schedule: ScheduleItem[] = [];

    // Get upcoming assignments
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('user_id', userId)
      .eq('status', 'enrolled');

    if (enrollments && enrollments.length > 0) {
      const courseIds = enrollments.map(e => e.course_id);

      const { data: assignments } = await supabase
        .from('assignments')
        .select(`
          *,
          course:courses(title)
        `)
        .in('course_id', courseIds)
        .gte('due_date', new Date().toISOString())
        .order('due_date', { ascending: true })
        .limit(20);

      if (assignments) {
        assignments.forEach(assignment => {
          schedule.push({
            id: assignment.id,
            title: assignment.title,
            type: 'assignment',
            course_title: assignment.course.title,
            date: assignment.due_date,
            time: new Date(assignment.due_date).toLocaleTimeString('en-US', {
              hour: '2-digit',
              minute: '2-digit'
            })
          });
        });
      }
    }

    return schedule.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  } catch (error) {
    console.error('Error fetching student schedule:', error);
    return [];
  }
};

// Note: Assignment submission functionality moved to assignmentService.ts
// Use submitAssignment() from assignmentService instead

// Get available units for registration (generated by dean)
export const getAvailableUnitsForRegistration = async (studentId: string) => {
  try {
    // Get current registration period
    const { data: registrationPeriod, error: periodError } = await supabase
      .from('registration_periods')
      .select('*')
      .eq('is_active', true)
      .single();

    if (periodError) {
      console.error('No active registration period found');
      return [];
    }

    // Get student's program and year to filter relevant units
    const { data: studentInfo, error: studentError } = await supabase
      .from('users')
      .select('program_id, current_year, faculty_id')
      .eq('id', studentId)
      .single();

    if (studentError) throw studentError;

    // Get units available for the student's program and year
    const { data: availableUnits, error: unitsError } = await supabase
      .from('available_units')
      .select(`
        *,
        course:courses!inner(
          id,
          title,
          code,
          credits,
          description,
          lecturer:users!courses_lecturer_id_fkey(
            id,
            full_name
          )
        ),
        prerequisites:unit_prerequisites(
          prerequisite_code
        )
      `)
      .eq('registration_period_id', registrationPeriod.id)
      .eq('program_id', studentInfo.program_id)
      .eq('year_level', studentInfo.current_year)
      .eq('is_active', true);

    if (unitsError) throw unitsError;

    // Get student's completed units to check prerequisites
    const { data: completedUnits, error: completedError } = await supabase
      .from('course_enrollments')
      .select('course:courses!inner(code)')
      .eq('user_id', studentId)
      .eq('status', 'completed');

    if (completedError) throw completedError;

    const completedCodes = completedUnits?.map(enrollment => enrollment.course.code) || [];

    // Transform and check prerequisites
    return availableUnits?.map(unit => {
      const prerequisites = unit.prerequisites?.map(p => p.prerequisite_code) || [];
      const isPrerequisiteMet = prerequisites.length === 0 ||
        prerequisites.every(prereq => completedCodes.includes(prereq));

      return {
        id: unit.course.id,
        code: unit.course.code,
        name: unit.course.title,
        instructor: unit.course.lecturer?.full_name || 'TBA',
        credits: unit.course.credits,
        prerequisites,
        description: unit.course.description || 'No description available',
        semester: unit.semester,
        academicYear: unit.academic_year,
        maxStudents: unit.max_students,
        enrolledStudents: unit.current_enrollment || 0,
        isPrerequisiteMet
      };
    }) || [];
  } catch (error) {
    console.error('Error fetching available units:', error);
    return [];
  }
};

// Register student for selected units
export const registerForUnits = async (studentId: string, unitIds: string[]) => {
  try {
    // Check if registration period is still open
    const { data: registrationPeriod, error: periodError } = await supabase
      .from('registration_periods')
      .select('*')
      .eq('is_active', true)
      .single();

    if (periodError || !registrationPeriod) {
      return { success: false, error: 'Registration period is not active' };
    }

    // Check if student is eligible (fees paid)
    const { data: feeStatus, error: feeError } = await supabase
      .from('student_fees')
      .select('amount_paid, total_fees')
      .eq('student_id', studentId)
      .eq('is_active', true)
      .single();

    if (feeError || !feeStatus) {
      return { success: false, error: 'Unable to verify fee payment status' };
    }

    const feePercentage = (feeStatus.amount_paid / feeStatus.total_fees) * 100;
    if (feePercentage < 60) {
      return { success: false, error: 'You need to pay at least 60% of your fees to register' };
    }

    // Create enrollment records
    const enrollmentData = unitIds.map(unitId => ({
      user_id: studentId,
      course_id: unitId,
      semester: registrationPeriod.semester,
      academic_year: registrationPeriod.academic_year,
      status: 'enrolled',
      created_at: new Date().toISOString()
    }));

    const { error: enrollmentError } = await supabase
      .from('course_enrollments')
      .insert(enrollmentData);

    if (enrollmentError) {
      console.error('Error creating enrollments:', enrollmentError);
      return { success: false, error: 'Failed to register for units' };
    }

    // Update enrollment counts for the units
    for (const unitId of unitIds) {
      await supabase.rpc('increment_unit_enrollment', {
        unit_id: unitId
      });
    }

    // Log the registration activity
    await supabase
      .from('registration_logs')
      .insert({
        student_id: studentId,
        action: 'unit_registration',
        details: { registered_units: unitIds },
        timestamp: new Date().toISOString()
      });

    return { success: true };
  } catch (error) {
    console.error('Error registering for units:', error);
    return { success: false, error: 'An error occurred during registration' };
  }
};
