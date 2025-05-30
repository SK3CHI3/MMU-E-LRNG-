import { supabase } from '@/lib/supabaseClient';

export interface GradeData {
  id: string;
  assignment_title: string;
  course_title: string;
  course_code: string;
  grade: number;
  total_points: number;
  percentage: number;
  graded_at: string;
  feedback?: string;
  instructor_name?: string;
}

export interface CourseGrade {
  course_id: string;
  course_code: string;
  course_title: string;
  instructor_name: string;
  credits: number;
  assignments: GradeData[];
  average_percentage: number;
  letter_grade: string;
  gpa_points: number;
}

export interface SemesterGrades {
  semester: string;
  academic_year: string;
  courses: CourseGrade[];
  semester_gpa: number;
  total_credits: number;
}

export interface StudentGradeOverview {
  overall_gpa: number;
  total_credits: number;
  completed_courses: number;
  current_semester: SemesterGrades;
  previous_semesters: SemesterGrades[];
  grade_trends: GradeTrend[];
}

export interface GradeTrend {
  semester: string;
  gpa: number;
  average_percentage: number;
  courses_completed: number;
}

// Convert percentage to letter grade
export const getLetterGrade = (percentage: number): string => {
  if (percentage >= 90) return 'A';
  if (percentage >= 85) return 'A-';
  if (percentage >= 80) return 'B+';
  if (percentage >= 75) return 'B';
  if (percentage >= 70) return 'B-';
  if (percentage >= 65) return 'C+';
  if (percentage >= 60) return 'C';
  if (percentage >= 55) return 'C-';
  if (percentage >= 50) return 'D+';
  if (percentage >= 45) return 'D';
  if (percentage >= 40) return 'D-';
  return 'F';
};

// Convert letter grade to GPA points
export const getGPAPoints = (letterGrade: string): number => {
  const gradePoints: { [key: string]: number } = {
    'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'D-': 0.7,
    'F': 0.0
  };
  return gradePoints[letterGrade] || 0.0;
};

// Calculate weighted GPA
export const calculateGPA = (courses: CourseGrade[]): number => {
  if (courses.length === 0) return 0.0;
  
  const totalPoints = courses.reduce((sum, course) => sum + (course.gpa_points * course.credits), 0);
  const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
  
  return totalCredits > 0 ? totalPoints / totalCredits : 0.0;
};

// Get student's grades for a specific semester
export const getStudentSemesterGrades = async (
  userId: string, 
  semester: string, 
  academicYear: string
): Promise<SemesterGrades | null> => {
  try {
    // Get current academic calendar if not specified
    if (!semester || !academicYear) {
      const { data: calendar } = await supabase
        .from('academic_calendar')
        .select('current_semester, academic_year')
        .eq('is_current', true)
        .single();
      
      semester = semester || calendar?.current_semester || 'Semester 1';
      academicYear = academicYear || calendar?.academic_year || '2024/2025';
    }

    // Get enrolled courses for the semester - simplified to avoid RLS issues
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('course_enrollments')
      .select('course_id')
      .eq('user_id', userId)
      .eq('status', 'enrolled');

    if (enrollmentError) {
      console.error('Error fetching enrollments:', enrollmentError);
      // Return empty semester data if there's an error
      return {
        semester,
        academic_year: academicYear,
        courses: [],
        semester_gpa: 0.0,
        total_credits: 0
      };
    }

    const courseGrades: CourseGrade[] = [];

    for (const enrollment of enrollments || []) {
      // Get course details separately
      const { data: course, error: courseError } = await supabase
        .from('courses')
        .select(`
          id,
          code,
          title,
          credits,
          created_by
        `)
        .eq('id', enrollment.course_id)
        .single();

      if (courseError || !course) continue;

      // Get lecturer details separately
      const { data: lecturer } = await supabase
        .from('users')
        .select('full_name')
        .eq('id', course.created_by)
        .single();

      // Get all graded assignments for this course
      const { data: submissions, error: submissionError } = await supabase
        .from('assignment_submissions')
        .select(`
          *,
          assignment:assignments!inner (
            title,
            total_points,
            course_id
          )
        `)
        .eq('user_id', userId)
        .eq('assignment.course_id', course.id)
        .not('grade', 'is', null)
        .order('graded_at', { ascending: false });

      if (submissionError) continue;

      // Transform submissions to grade data
      const assignments: GradeData[] = submissions?.map(sub => ({
        id: sub.id,
        assignment_title: sub.assignment.title,
        course_title: course.title,
        course_code: course.code,
        grade: sub.grade,
        total_points: sub.assignment.total_points,
        percentage: (sub.grade / sub.assignment.total_points) * 100,
        graded_at: sub.graded_at,
        feedback: sub.feedback,
        instructor_name: lecturer?.full_name
      })) || [];

      // Calculate course average
      const average_percentage = assignments.length > 0 
        ? assignments.reduce((sum, a) => sum + a.percentage, 0) / assignments.length 
        : 0;

      const letter_grade = getLetterGrade(average_percentage);
      const gpa_points = getGPAPoints(letter_grade);

      courseGrades.push({
        course_id: course.id,
        course_code: course.code,
        course_title: course.title,
        instructor_name: lecturer?.full_name || 'TBA',
        credits: course.credits || 3,
        assignments,
        average_percentage,
        letter_grade,
        gpa_points
      });
    }

    const semester_gpa = calculateGPA(courseGrades);
    const total_credits = courseGrades.reduce((sum, course) => sum + course.credits, 0);

    return {
      semester,
      academic_year: academicYear,
      courses: courseGrades,
      semester_gpa,
      total_credits
    };

  } catch (error) {
    console.error('Error fetching semester grades:', error);
    return null;
  }
};

// Get comprehensive student grade overview
export const getStudentGradeOverview = async (userId: string): Promise<StudentGradeOverview | null> => {
  try {
    // Get current academic calendar
    const { data: calendar } = await supabase
      .from('academic_calendar')
      .select('current_semester, academic_year')
      .eq('is_current', true)
      .single();

    const currentSemester = calendar?.current_semester || 'Semester 1';
    const currentYear = calendar?.academic_year || '2024/2025';

    // Get current semester grades
    const current_semester = await getStudentSemesterGrades(userId, currentSemester, currentYear);

    // Get previous semesters (simplified - would need more complex logic for real implementation)
    const previous_semesters: SemesterGrades[] = [];
    
    // For now, we'll just get the current semester data
    // In a real implementation, you'd query historical data

    // Calculate overall statistics
    const all_courses = current_semester?.courses || [];
    const overall_gpa = calculateGPA(all_courses);
    const total_credits = all_courses.reduce((sum, course) => sum + course.credits, 0);
    const completed_courses = all_courses.length;

    // Generate grade trends (simplified)
    const grade_trends: GradeTrend[] = current_semester ? [{
      semester: `${current_semester.semester} ${current_semester.academic_year}`,
      gpa: current_semester.semester_gpa,
      average_percentage: current_semester.courses.reduce((sum, c) => sum + c.average_percentage, 0) / current_semester.courses.length || 0,
      courses_completed: current_semester.courses.length
    }] : [];

    return {
      overall_gpa,
      total_credits,
      completed_courses,
      current_semester: current_semester!,
      previous_semesters,
      grade_trends
    };

  } catch (error) {
    console.error('Error fetching student grade overview:', error);
    return null;
  }
};

// Get grade distribution for analytics
export const getGradeDistribution = async (userId: string): Promise<{ grade: string; count: number }[]> => {
  try {
    const { data: submissions, error } = await supabase
      .from('assignment_submissions')
      .select('grade, assignment:assignments!inner(total_points)')
      .eq('user_id', userId)
      .not('grade', 'is', null);

    if (error) throw error;

    const gradeDistribution: { [key: string]: number } = {
      'A': 0, 'B': 0, 'C': 0, 'D': 0, 'F': 0
    };

    submissions?.forEach(sub => {
      const percentage = (sub.grade / sub.assignment.total_points) * 100;
      const letterGrade = getLetterGrade(percentage);
      const gradeCategory = letterGrade.charAt(0); // Get just the letter part
      gradeDistribution[gradeCategory] = (gradeDistribution[gradeCategory] || 0) + 1;
    });

    return Object.entries(gradeDistribution).map(([grade, count]) => ({ grade, count }));

  } catch (error) {
    console.error('Error fetching grade distribution:', error);
    return [];
  }
};
