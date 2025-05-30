import { supabase, Assignment, AssignmentSubmission } from '@/lib/supabaseClient';

export interface AssignmentWithStats extends Assignment {
  total_submissions: number;
  graded_submissions: number;
  average_grade: number;
  on_time_submissions: number;
  late_submissions: number;
  pending_submissions: number;
  submission_rate: number;
}

export interface AssignmentAnalytics {
  assignment_id: string;
  assignment_title: string;
  course_title: string;
  total_students: number;
  submissions: number;
  on_time: number;
  late: number;
  pending: number;
  average_grade: number;
  submission_rate: number;
  grading_progress: number;
}

export interface StudentSubmission extends AssignmentSubmission {
  student: {
    full_name: string;
    email: string;
    student_id?: string;
  };
  assignment: {
    title: string;
    total_points: number;
  };
}

// Get all assignments for a lecturer
export const getLecturerAssignments = async (lecturerId: string): Promise<AssignmentWithStats[]> => {
  try {
    const { data: assignments, error } = await supabase
      .from('assignments')
      .select(`
        *,
        course:courses!inner(title, code),
        submissions:assignment_submissions(*)
      `)
      .eq('created_by', lecturerId)
      .order('due_date', { ascending: true });

    if (error) throw error;

    const assignmentsWithStats = await Promise.all(
      assignments.map(async (assignment) => {
        // Get total enrolled students for this course
        const { count: totalStudents } = await supabase
          .from('course_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', assignment.course_id)
          .eq('status', 'enrolled');

        // Get submission statistics
        const { data: submissions } = await supabase
          .from('assignment_submissions')
          .select('*')
          .eq('assignment_id', assignment.id);

        const totalSubmissions = submissions?.length || 0;
        const gradedSubmissions = submissions?.filter(s => s.grade !== null).length || 0;
        
        // Calculate average grade
        const gradedScores = submissions?.filter(s => s.grade !== null).map(s => s.grade) || [];
        const averageGrade = gradedScores.length > 0 
          ? gradedScores.reduce((sum, grade) => sum + grade, 0) / gradedScores.length 
          : 0;

        // Calculate on-time vs late submissions
        const dueDate = new Date(assignment.due_date);
        const onTimeSubmissions = submissions?.filter(s => new Date(s.submitted_at) <= dueDate).length || 0;
        const lateSubmissions = submissions?.filter(s => new Date(s.submitted_at) > dueDate).length || 0;
        const pendingSubmissions = (totalStudents || 0) - totalSubmissions;

        const submissionRate = totalStudents > 0 ? (totalSubmissions / totalStudents) * 100 : 0;

        return {
          ...assignment,
          total_submissions: totalSubmissions,
          graded_submissions: gradedSubmissions,
          average_grade: Math.round(averageGrade * 100) / 100,
          on_time_submissions: onTimeSubmissions,
          late_submissions: lateSubmissions,
          pending_submissions: pendingSubmissions,
          submission_rate: Math.round(submissionRate * 100) / 100
        };
      })
    );

    return assignmentsWithStats;
  } catch (error) {
    console.error('Error fetching lecturer assignments:', error);
    throw error;
  }
};

// Get assignment analytics for dashboard
export const getAssignmentAnalytics = async (lecturerId: string): Promise<AssignmentAnalytics[]> => {
  try {
    const { data: assignments, error } = await supabase
      .from('assignments')
      .select(`
        *,
        course:courses!inner(title, code)
      `)
      .eq('created_by', lecturerId)
      .order('due_date', { ascending: false })
      .limit(10);

    if (error) throw error;

    const analytics = await Promise.all(
      assignments.map(async (assignment) => {
        // Get total enrolled students
        const { count: totalStudents } = await supabase
          .from('course_enrollments')
          .select('*', { count: 'exact', head: true })
          .eq('course_id', assignment.course_id)
          .eq('status', 'enrolled');

        // Get submissions
        const { data: submissions } = await supabase
          .from('assignment_submissions')
          .select('*')
          .eq('assignment_id', assignment.id);

        const totalSubmissions = submissions?.length || 0;
        const dueDate = new Date(assignment.due_date);
        const onTime = submissions?.filter(s => new Date(s.submitted_at) <= dueDate).length || 0;
        const late = submissions?.filter(s => new Date(s.submitted_at) > dueDate).length || 0;
        const pending = (totalStudents || 0) - totalSubmissions;

        // Calculate average grade
        const gradedSubmissions = submissions?.filter(s => s.grade !== null) || [];
        const averageGrade = gradedSubmissions.length > 0
          ? gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length
          : 0;

        const submissionRate = totalStudents > 0 ? (totalSubmissions / totalStudents) * 100 : 0;
        const gradingProgress = totalSubmissions > 0 ? (gradedSubmissions.length / totalSubmissions) * 100 : 0;

        return {
          assignment_id: assignment.id,
          assignment_title: assignment.title,
          course_title: assignment.course.title,
          total_students: totalStudents || 0,
          submissions: totalSubmissions,
          on_time: onTime,
          late: late,
          pending: pending,
          average_grade: Math.round(averageGrade * 100) / 100,
          submission_rate: Math.round(submissionRate * 100) / 100,
          grading_progress: Math.round(gradingProgress * 100) / 100
        };
      })
    );

    return analytics;
  } catch (error) {
    console.error('Error fetching assignment analytics:', error);
    throw error;
  }
};

// Create a new assignment
export const createAssignment = async (assignmentData: Omit<Assignment, 'id' | 'created_at' | 'updated_at'>) => {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .insert(assignmentData)
      .select()
      .single();

    if (error) throw error;

    // Create notifications for all enrolled students
    const { data: enrollments } = await supabase
      .from('course_enrollments')
      .select('user_id')
      .eq('course_id', assignmentData.course_id)
      .eq('status', 'enrolled');

    if (enrollments && enrollments.length > 0) {
      const notifications = enrollments.map(enrollment => ({
        user_id: enrollment.user_id,
        title: 'New Assignment Posted',
        message: `A new assignment "${assignmentData.title}" has been posted.`,
        type: 'assignment' as const,
        is_read: false,
        related_id: data.id
      }));

      await supabase
        .from('notifications')
        .insert(notifications);
    }

    return data;
  } catch (error) {
    console.error('Error creating assignment:', error);
    throw error;
  }
};

// Update an assignment
export const updateAssignment = async (assignmentId: string, updates: Partial<Assignment>) => {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', assignmentId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error updating assignment:', error);
    throw error;
  }
};

// Delete an assignment
export const deleteAssignment = async (assignmentId: string) => {
  try {
    const { error } = await supabase
      .from('assignments')
      .delete()
      .eq('id', assignmentId);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting assignment:', error);
    throw error;
  }
};

// Get assignment submissions for grading
export const getAssignmentSubmissions = async (assignmentId: string): Promise<StudentSubmission[]> => {
  try {
    const { data, error } = await supabase
      .from('assignment_submissions')
      .select(`
        *,
        student:users!user_id(full_name, email, student_id),
        assignment:assignments!assignment_id(title, total_points)
      `)
      .eq('assignment_id', assignmentId)
      .order('submitted_at', { ascending: false });

    if (error) throw error;
    return data as StudentSubmission[];
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
) => {
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
        student:users!user_id(full_name, email),
        assignment:assignments!assignment_id(title)
      `)
      .single();

    if (error) throw error;

    // Create notification for student
    await supabase
      .from('notifications')
      .insert({
        user_id: data.user_id,
        title: 'Assignment Graded',
        message: `Your assignment "${data.assignment.title}" has been graded. Score: ${grade}/${data.assignment.total_points}`,
        type: 'grade',
        is_read: false,
        related_id: submissionId
      });

    return data;
  } catch (error) {
    console.error('Error grading submission:', error);
    throw error;
  }
};

// Get assignments for a specific course
export const getCourseAssignments = async (courseId: string) => {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        creator:users!created_by(full_name, email)
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

// Submit assignment (for students)
export const submitAssignment = async (
  assignmentId: string,
  userId: string,
  submissionData: any
) => {
  try {
    // Check if assignment due date has passed
    const { data: assignment } = await supabase
      .from('assignments')
      .select('due_date, course_id, late_submission_allowed')
      .eq('id', assignmentId)
      .single();

    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const dueDate = new Date(assignment.due_date);
    const now = new Date();
    const isLate = now > dueDate;

    if (isLate && !assignment.late_submission_allowed) {
      throw new Error('Late submissions are not allowed for this assignment');
    }

    // Prepare submission data
    const submissionRecord = {
      assignment_id: assignmentId,
      user_id: userId,
      submitted_at: new Date().toISOString(),
      is_late: isLate,
      ...submissionData
    };

    const { data, error } = await supabase
      .from('assignment_submissions')
      .insert(submissionRecord)
      .select()
      .single();

    if (error) throw error;

    // Track activity
    if (assignment.course_id) {
      await supabase
        .from('analytics_data')
        .insert({
          user_id: userId,
          course_id: assignment.course_id,
          activity_type: 'assignment_submission'
        });
    }

    return data;
  } catch (error) {
    console.error('Error submitting assignment:', error);
    throw error;
  }
};

// Get student's assignments
export const getStudentAssignments = async (userId: string) => {
  try {
    // First, get the courses the student is enrolled in
    const { data: enrolledCourses, error: enrollmentError } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('user_id', userId)
      .eq('status', 'enrolled');

    if (enrollmentError) {
      console.error('Error fetching enrolled courses:', enrollmentError);
      // Return empty array instead of throwing error for better UX
      return [];
    }

    // If no enrolled courses, return empty array
    if (!enrolledCourses || enrolledCourses.length === 0) {
      console.log('Student has no enrolled courses, returning empty assignments array');
      return [];
    }

    // Extract course IDs
    const courseIds = enrolledCourses.map(enrollment => enrollment.course_id);

    // Get assignments for enrolled courses
    const { data: assignments, error: assignmentError } = await supabase
      .from('assignments')
      .select(`
        *,
        course:courses!inner(title, code),
        submission:assignment_submissions(
          id,
          user_id,
          submission_text,
          submission_url,
          submitted_at,
          grade,
          percentage,
          feedback,
          is_late
        )
      `)
      .in('course_id', courseIds)
      .order('due_date', { ascending: true });

    if (assignmentError) {
      console.error('Error fetching assignments:', assignmentError);
      // Return empty array instead of throwing error for better UX
      return [];
    }

    // Filter submissions to only include the current user's submissions and transform data
    const assignmentsWithUserSubmissions = assignments?.map(assignment => {
      const userSubmission = assignment.submission?.find((sub: any) => sub.user_id === userId);

      // Calculate status
      const dueDate = new Date(assignment.due_date);
      const now = new Date();
      const isOverdue = now > dueDate;

      let status: 'pending' | 'submitted' | 'graded' | 'overdue';
      if (userSubmission) {
        status = userSubmission.grade !== null ? 'graded' : 'submitted';
      } else {
        status = isOverdue ? 'overdue' : 'pending';
      }

      // Calculate time left
      const timeDiff = dueDate.getTime() - now.getTime();
      const daysLeft = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
      let timeLeft: string;
      if (daysLeft < 0) {
        timeLeft = `${Math.abs(daysLeft)} days overdue`;
      } else if (daysLeft === 0) {
        timeLeft = 'Due today';
      } else if (daysLeft === 1) {
        timeLeft = '1 day left';
      } else {
        timeLeft = `${daysLeft} days left`;
      }

      // Determine priority based on days left
      let priority: 'high' | 'medium' | 'low';
      if (daysLeft <= 1) {
        priority = 'high';
      } else if (daysLeft <= 7) {
        priority = 'medium';
      } else {
        priority = 'low';
      }

      // Calculate progress (for pending assignments)
      const progress = status === 'pending' ? Math.floor(Math.random() * 30) : 100;

      return {
        ...assignment,
        // Transform field names to match UI expectations
        course: assignment.course?.title || 'Unknown Course',
        dueDate: dueDate.toLocaleDateString(),
        dueTime: dueDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        points: assignment.total_points,
        timeLeft,
        status,
        priority,
        progress,
        grade: userSubmission?.grade || null,
        feedback: userSubmission?.feedback || null,
        submission: userSubmission || null
      };
    }) || [];

    return assignmentsWithUserSubmissions;
  } catch (error) {
    console.error('Error fetching student assignments:', error);
    throw error;
  }
};
