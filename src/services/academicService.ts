import { supabase } from '@/lib/supabaseClient';

// Calculate current academic year and semester based on date
export const getCurrentAcademicPeriod = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth() + 1; // JavaScript months are 0-indexed

  // Academic year typically runs from September to August
  // Semester 1: September - December
  // Semester 2: January - April  
  // Semester 3 (Summer): May - August
  
  let academicYear: string;
  let semester: string;

  if (currentMonth >= 9) {
    // September onwards - new academic year starts
    academicYear = `${currentYear}/${currentYear + 1}`;
    semester = '1.1'; // First semester, first year
  } else if (currentMonth >= 5) {
    // May - August (Summer semester)
    academicYear = `${currentYear - 1}/${currentYear}`;
    semester = '1.3'; // Third semester
  } else {
    // January - April (Second semester)
    academicYear = `${currentYear - 1}/${currentYear}`;
    semester = '1.2'; // Second semester
  }

  return { academicYear, semester };
};

// Calculate semester based on student's year of study and current period
export const calculateStudentSemester = (yearOfStudy: number, currentSemesterInYear: number) => {
  // Format: [year].[semester] e.g., 1.1, 1.2, 2.1, 2.2, etc.
  return `${yearOfStudy}.${currentSemesterInYear}`;
};

// Auto-assign semester to new student based on signup date
export const assignInitialSemester = async (studentAuthId: string) => {
  try {
    const { academicYear, semester } = getCurrentAcademicPeriod();
    
    // Update student with initial semester and year
    const { error } = await supabase
      .from('users')
      .update({
        current_semester: 1, // First semester number
        year_of_study: 1,    // First year
        updated_at: new Date().toISOString()
      })
      .eq('auth_id', studentAuthId)
      .eq('role', 'student');

    if (error) {
      console.error('Error assigning initial semester:', error);
      throw error;
    }

    // Create initial academic record
    await createAcademicRecord(studentAuthId, academicYear, semester);
    
    return { academicYear, semester };
  } catch (error) {
    console.error('Error in assignInitialSemester:', error);
    throw error;
  }
};

// Create academic record for tracking
const createAcademicRecord = async (studentAuthId: string, academicYear: string, semester: string) => {
  try {
    // Check if record already exists
    const { data: existingRecord } = await supabase
      .from('student_fees')
      .select('id')
      .eq('student_id', studentAuthId)
      .eq('academic_year', academicYear)
      .eq('semester', semester)
      .single();

    if (!existingRecord) {
      // Create new academic record
      const { error } = await supabase
        .from('student_fees')
        .insert({
          student_id: studentAuthId,
          academic_year: academicYear,
          semester: semester,
          total_fees: 50000, // Default fee amount
          amount_paid: 0,
          due_date: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0] // 90 days from now
        });

      if (error) {
        console.error('Error creating academic record:', error);
      }
    }
  } catch (error) {
    console.error('Error in createAcademicRecord:', error);
  }
};

// Get student's current semester progress
export const getStudentSemesterProgress = async (studentAuthId: string) => {
  try {
    // Get student info
    const { data: student, error: studentError } = await supabase
      .from('users')
      .select('current_semester, year_of_study, created_at')
      .eq('auth_id', studentAuthId)
      .eq('role', 'student')
      .single();

    if (studentError || !student) {
      throw new Error('Student not found');
    }

    // Calculate current academic period
    const { academicYear } = getCurrentAcademicPeriod();
    const currentSemester = calculateStudentSemester(student.year_of_study, student.current_semester);

    // Get current semester enrollments
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('course_enrollments')
      .select(`
        id,
        status,
        grade,
        grade_points,
        courses (
          id,
          code,
          title
        )
      `)
      .eq('user_id', studentAuthId);

    if (enrollmentError) {
      console.error('Error fetching enrollments:', enrollmentError);
      // Return empty state instead of throwing error
      return {
        academicYear,
        currentSemester,
        totalUnits: 0,
        completedUnits: 0,
        inProgressUnits: 0,
        failedUnits: 0,
        gpa: 0,
        enrollments: []
      };
    }

    // Calculate progress statistics
    const totalUnits = enrollments?.length || 0;
    const completedUnits = enrollments?.filter(e => e.status === 'completed' && e.grade && e.grade !== 'F').length || 0;
    const inProgressUnits = enrollments?.filter(e => e.status === 'enrolled').length || 0;
    const failedUnits = enrollments?.filter(e => e.grade === 'F').length || 0;

    // Calculate GPA
    const gradedEnrollments = enrollments?.filter(e => e.grade_points !== null) || [];
    const totalGradePoints = gradedEnrollments.reduce((sum, e) => sum + (e.grade_points || 0), 0);
    const gpa = gradedEnrollments.length > 0 ? (totalGradePoints / gradedEnrollments.length).toFixed(2) : '0.00';

    return {
      academicYear,
      currentSemester,
      totalUnits,
      completedUnits,
      inProgressUnits,
      failedUnits,
      gpa: parseFloat(gpa),
      enrollments: enrollments || []
    };
  } catch (error) {
    console.error('Error getting semester progress:', error);
    throw error;
  }
};

// Get student's academic history
export const getStudentAcademicHistory = async (studentAuthId: string) => {
  try {
    // Get all enrollments grouped by academic period
    const { data: enrollments, error } = await supabase
      .from('course_enrollments')
      .select(`
        id,
        status,
        grade,
        grade_points,
        enrollment_date,
        completion_date,
        courses (
          id,
          code,
          title,
          semester,
          year
        )
      `)
      .eq('user_id', studentAuthId)
      .order('enrollment_date', { ascending: false });

    if (error) {
      console.error('Error fetching academic history:', error);
      // Return empty state instead of throwing error
      return {
        semesters: [],
        overall: {
          totalUnits: 0,
          passedUnits: 0,
          failedUnits: 0,
          gpa: 0,
          passRate: 0
        }
      };
    }

    // Group by academic year and semester
    const groupedHistory = (enrollments || []).reduce((acc, enrollment) => {
      const course = enrollment.courses;
      if (!course) return acc;

      const academicYear = `${course.year}/${course.year + 1}`;
      const semester = course.semester;
      const key = `${academicYear}-${semester}`;

      if (!acc[key]) {
        acc[key] = {
          academicYear,
          semester,
          enrollments: [],
          totalUnits: 0,
          passedUnits: 0,
          failedUnits: 0,
          gpa: 0
        };
      }

      acc[key].enrollments.push(enrollment);
      acc[key].totalUnits++;

      if (enrollment.grade && enrollment.grade !== 'F') {
        acc[key].passedUnits++;
      } else if (enrollment.grade === 'F') {
        acc[key].failedUnits++;
      }

      return acc;
    }, {} as Record<string, any>);

    // Calculate GPA for each semester
    Object.values(groupedHistory).forEach((semester: any) => {
      const gradedEnrollments = semester.enrollments.filter((e: any) => e.grade_points !== null);
      if (gradedEnrollments.length > 0) {
        const totalGradePoints = gradedEnrollments.reduce((sum: number, e: any) => sum + (e.grade_points || 0), 0);
        semester.gpa = parseFloat((totalGradePoints / gradedEnrollments.length).toFixed(2));
      }
    });

    // Convert to array and sort by date
    const historyArray = Object.values(groupedHistory).sort((a: any, b: any) => {
      return new Date(b.academicYear.split('/')[0]).getTime() - new Date(a.academicYear.split('/')[0]).getTime();
    });

    // Calculate overall statistics
    const totalUnits = enrollments?.length || 0;
    const passedUnits = enrollments?.filter(e => e.grade && e.grade !== 'F').length || 0;
    const failedUnits = enrollments?.filter(e => e.grade === 'F').length || 0;
    
    const gradedEnrollments = enrollments?.filter(e => e.grade_points !== null) || [];
    const overallGPA = gradedEnrollments.length > 0 
      ? parseFloat((gradedEnrollments.reduce((sum, e) => sum + (e.grade_points || 0), 0) / gradedEnrollments.length).toFixed(2))
      : 0;

    const passRate = totalUnits > 0 ? Math.round((passedUnits / totalUnits) * 100) : 0;

    return {
      semesters: historyArray,
      overall: {
        totalUnits,
        passedUnits,
        failedUnits,
        gpa: overallGPA,
        passRate
      }
    };
  } catch (error) {
    console.error('Error getting academic history:', error);
    throw error;
  }
};

// Update student semester (for progression)
export const updateStudentSemester = async (studentAuthId: string, newSemester: number, newYear: number) => {
  try {
    const { error } = await supabase
      .from('users')
      .update({
        current_semester: newSemester,
        year_of_study: newYear,
        updated_at: new Date().toISOString()
      })
      .eq('auth_id', studentAuthId)
      .eq('role', 'student');

    if (error) {
      console.error('Error updating student semester:', error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error in updateStudentSemester:', error);
    throw error;
  }
};
