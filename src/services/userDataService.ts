import { supabase } from '@/lib/supabaseClient';

export interface StudentData {
  name: string;
  admissionNumber: string;
  faculty: string;
  semester: string;
  academicYear: string;
  gpa: number;
  feeBalance: number;
  feeRequired: number;
  feePaid: number;
  enrolledCourses: number;
  upcomingClasses: ClassSchedule[];
  pendingAssignments: PendingAssignment[];
  currentSemesterUnits: number;
  totalUnitsRegistered: number;
  unitsCompleted: number;
  unitsPassed: number;
  unitsFailed: number;
  programmeTitle: string;
  yearOfStudy: number;
}

export interface LecturerData {
  name: string;
  employeeId: string;
  department: string;
  assignedCourses: CourseInfo[];
  totalStudents: number;
  pendingGrading: number;
  upcomingClasses: ClassSchedule[];
  recentActivity: ActivityItem[];
}

export interface DeanData {
  name: string;
  faculty: string;
  facultyCode: string;
  departments: DepartmentInfo[];
  facultyStats: FacultyStatistics;
  recentActivity: ActivityItem[];
}

export interface ClassSchedule {
  id: string;
  unit: string;
  time: string;
  location: string;
  isOnline: boolean;
  course_code?: string;
}

export interface PendingAssignment {
  id: string;
  unit: string;
  title: string;
  dueDate: string;
  daysRemaining: number;
  course_code?: string;
}

export interface CourseInfo {
  id: string;
  code: string;
  name: string;
  students: number;
  semester: string;
  nextClass?: string;
}

export interface DepartmentInfo {
  id: string;
  name: string;
  head: string;
  lecturers: number;
  students: number;
  courses: number;
}

export interface FacultyStatistics {
  totalLecturers: number;
  totalStudents: number;
  totalCourses: number;
  totalProgrammes: number;
  graduationRate: number;
  employmentRate: number;
  researchProjects: number;
  publications: number;
}

export interface ActivityItem {
  id: string;
  type: string;
  description: string;
  timestamp: string;
  severity?: 'info' | 'warning' | 'success' | 'error';
}

// Helper function to get current academic calendar
const getCurrentAcademicCalendar = async () => {
  try {
    const { data, error } = await supabase
      .from('academic_calendar')
      .select('*')
      .eq('is_current', true)
      .single();

    if (error) {
      console.error('Error fetching academic calendar:', error);
      return { semester: null, academicYear: null };
    }

    return {
      semester: data.current_semester,
      academicYear: data.academic_year
    };
  } catch (error) {
    console.error('Error fetching academic calendar:', error);
    return { semester: null, academicYear: null };
  }
};

// Helper function to calculate GPA (simplified unit-based calculation)
const calculateStudentGPA = async (userId: string): Promise<number> => {
  try {
    const { data: grades, error } = await supabase
      .from('assignment_submissions')
      .select(`
        grade,
        assignments!inner (
          course_id,
          total_points
        )
      `)
      .eq('user_id', userId)
      .not('grade', 'is', null);

    if (error || !grades || grades.length === 0) {
      return 0;
    }

    // Calculate simple GPA based on unit averages (not credit-weighted)
    let totalGradePoints = 0;
    let totalUnits = 0;

    const courseGrades: { [courseId: string]: { totalPoints: number, earnedPoints: number } } = {};

    grades.forEach(submission => {
      const courseId = submission.assignments[0]?.course_id;
      const grade = submission.grade;
      const totalPoints = submission.assignments[0]?.total_points;

      if (!courseGrades[courseId]) {
        courseGrades[courseId] = { totalPoints: 0, earnedPoints: 0 };
      }

      courseGrades[courseId].totalPoints += totalPoints;
      courseGrades[courseId].earnedPoints += grade;
    });

    // Convert to GPA scale (4.0) - each unit weighted equally
    Object.values(courseGrades).forEach(course => {
      const percentage = (course.earnedPoints / course.totalPoints) * 100;
      let gradePoint = 0;

      if (percentage >= 90) gradePoint = 4.0;
      else if (percentage >= 80) gradePoint = 3.5;
      else if (percentage >= 70) gradePoint = 3.0;
      else if (percentage >= 60) gradePoint = 2.5;
      else if (percentage >= 50) gradePoint = 2.0;
      else gradePoint = 0;

      totalGradePoints += gradePoint;
      totalUnits += 1;
    });

    return totalUnits > 0 ? Math.round((totalGradePoints / totalUnits) * 100) / 100 : 0;
  } catch (error) {
    console.error('Error calculating GPA:', error);
    return 0;
  }
};

// Helper function to get fee information
const getStudentFeeInfo = async (userId: string) => {
  try {
    const { data, error } = await supabase
      .from('student_fees')
      .select('*')
      .eq('student_id', userId)
      .eq('is_active', true)
      .single();

    if (error) {
      console.error('Error fetching fee information:', error);
      return { feeBalance: null, feeRequired: null, feePaid: null };
    }

    const feePaid = data.amount_paid || 0;
    const feeRequired = data.total_fees || 0;
    const feeBalance = feeRequired - feePaid;

    return { feeBalance, feeRequired, feePaid };
  } catch (error) {
    console.error('Error fetching fee information:', error);
    return { feeBalance: null, feeRequired: null, feePaid: null };
  }
};

// Helper function to get upcoming classes
const getUpcomingClasses = async (userId: string): Promise<ClassSchedule[]> => {
  try {
    const { data, error } = await supabase
      .from('class_schedules')
      .select(`
        *,
        courses (
          code,
          title
        )
      `)
      .eq('user_id', userId)
      .gte('scheduled_date', new Date().toISOString())
      .order('scheduled_date', { ascending: true })
      .limit(5);

    if (error) return [];

    return data?.map(schedule => ({
      id: schedule.id,
      unit: schedule.courses?.title || 'Unknown Course',
      time: new Date(schedule.scheduled_date).toLocaleString(),
      location: schedule.location || 'TBA',
      isOnline: schedule.is_online || false,
      course_code: schedule.courses?.code
    })) || [];
  } catch (error) {
    console.error('Error fetching upcoming classes:', error);
    return [];
  }
};

// Helper function to get programme information
const getStudentProgrammeInfo = async (userId: string) => {
  try {
    const { data: user, error: userError } = await supabase
      .from('users')
      .select(`
        *,
        programmes (
          title,
          total_units,
          duration_years
        )
      `)
      .eq('auth_id', userId)
      .single();

    if (userError) throw userError;

    return {
      programmeTitle: user.programmes?.title || null,
      totalUnits: user.programmes?.total_units || null,
      yearOfStudy: user.year_of_study || (user.current_semester ? Math.ceil(user.current_semester / 2) : null)
    };
  } catch (error) {
    console.error('Error fetching programme information:', error);
    return {
      programmeTitle: null,
      totalUnits: null,
      yearOfStudy: null
    };
  }
};

// Get dynamic student data
export const getStudentData = async (userId: string): Promise<StudentData | null> => {
  try {
    console.log('getStudentData: Starting data fetch for userId:', userId);

    // Get user info first - this is the most critical part
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', userId)
      .single();

    if (userError) {
      console.error('getStudentData: User fetch error:', userError);
      // If user doesn't exist in database, return basic info from auth
      console.log('getStudentData: User not found in database, creating basic profile');
      return {
        name: 'Student User',
        admissionNumber: 'Not Set',
        faculty: 'Not Assigned',
        semester: 'Current',
        academicYear: '2024/2025',
        gpa: 0,
        feeBalance: 0,
        feeRequired: 0,
        feePaid: 0,
        enrolledCourses: 0,
        upcomingClasses: [],
        pendingAssignments: [],
        currentSemesterUnits: 0,
        totalUnitsRegistered: 0,
        unitsCompleted: 0,
        unitsPassed: 0,
        unitsFailed: 0,
        programmeTitle: 'Not Set',
        yearOfStudy: 1
      };
    }

    console.log('getStudentData: User data fetched successfully:', user);

    // Try to get additional data, but don't fail if it's not available
    let academicCalendar = { semester: 'Current Semester', academicYear: '2024/2025' };
    let gpa = 0;
    let feeInfo = { feeBalance: 0, feeRequired: 0, feePaid: 0 };
    let upcomingClasses: ClassSchedule[] = [];
    let programmeInfo = { programmeTitle: 'Not Set', totalUnits: 40, yearOfStudy: 1 };
    let enrollments = { data: [], error: null };
    let assignments = { data: [], error: null };
    let unitStats = { data: [], error: null };

    try {
      console.log('getStudentData: Attempting to fetch additional data...');

      // Try to get academic calendar
      try {
        academicCalendar = await getCurrentAcademicCalendar();
        console.log('getStudentData: Academic calendar fetched:', academicCalendar);
      } catch (error) {
        console.log('getStudentData: Academic calendar not available, using defaults');
      }

      // Try to get programme info
      try {
        programmeInfo = await getStudentProgrammeInfo(userId);
        console.log('getStudentData: Programme info fetched:', programmeInfo);
      } catch (error) {
        console.log('getStudentData: Programme info not available, using defaults');
      }

      // Try to get enrollments
      try {
        enrollments = await supabase
          .from('course_enrollments')
          .select(`
            *,
            courses (
              id,
              code,
              title
            )
          `)
          .eq('user_id', user.id)
          .eq('status', 'enrolled');
        console.log('getStudentData: Enrollments fetched:', enrollments);
      } catch (error) {
        console.log('getStudentData: Enrollments not available, using defaults');
      }

    } catch (error) {
      console.log('getStudentData: Some additional data not available, continuing with basic info');
    }

    // Calculate basic statistics from available data
    const currentEnrollments = enrollments.data || [];
    const allEnrollments = unitStats.data || [];
    const completedUnits = allEnrollments.filter(e => e.status === 'completed');
    const passedUnits = completedUnits.filter(e => e.final_grade && e.final_grade >= 50);
    const failedUnits = completedUnits.filter(e => e.final_grade && e.final_grade < 50);

    // Calculate basic statistics
    const enrolledCourses = currentEnrollments.length;

    // Create empty assignments array for now
    const pendingAssignments: PendingAssignment[] = [];

    console.log('getStudentData: Returning student data with user info:', {
      name: user.full_name,
      email: user.email,
      role: user.role,
      department: user.department
    });

    return {
      name: user.full_name || user.email || 'Student',
      admissionNumber: user.student_id || user.id || 'Not Set',
      faculty: user.department || 'Not Assigned',
      semester: academicCalendar.semester || 'Current Semester',
      academicYear: academicCalendar.academicYear || '2024/2025',
      gpa,
      feeBalance: feeInfo.feeBalance || 0,
      feeRequired: feeInfo.feeRequired || 0,
      feePaid: feeInfo.feePaid || 0,
      enrolledCourses,
      upcomingClasses,
      pendingAssignments,
      currentSemesterUnits: enrolledCourses,
      totalUnitsRegistered: allEnrollments.length,
      unitsCompleted: completedUnits.length,
      unitsPassed: passedUnits.length,
      unitsFailed: failedUnits.length,
      programmeTitle: programmeInfo.programmeTitle || 'Not Set',
      yearOfStudy: programmeInfo.yearOfStudy || 1
    };
  } catch (error) {
    console.error('getStudentData: Error fetching student data:', error);

    // Return a basic fallback object instead of null to prevent crashes
    return {
      name: 'Student',
      admissionNumber: 'Loading...',
      faculty: 'Loading...',
      semester: 'Loading...',
      academicYear: 'Loading...',
      gpa: 0,
      feeBalance: 0,
      feeRequired: 0,
      feePaid: 0,
      enrolledCourses: 0,
      upcomingClasses: [],
      pendingAssignments: [],
      currentSemesterUnits: 0,
      totalUnitsRegistered: 0,
      unitsCompleted: 0,
      unitsPassed: 0,
      unitsFailed: 0,
      programmeTitle: 'Loading...',
      yearOfStudy: 0
    };
  }
};

// Get dynamic lecturer data
export const getLecturerData = async (userId: string): Promise<LecturerData | null> => {
  try {
    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', userId)
      .single();

    if (userError) throw userError;

    // Get assigned courses
    const { data: courses, error: courseError } = await supabase
      .from('courses')
      .select(`
        *,
        course_enrollments (
          id,
          user_id
        )
      `)
      .eq('created_by', user.id)
      .eq('is_active', true);

    if (courseError) throw courseError;

    // Format course info
    const assignedCourses: CourseInfo[] = courses?.map(course => ({
      id: course.id,
      code: course.code,
      name: course.title,
      students: course.course_enrollments?.length || 0,
      semester: course.semester,

      nextClass: 'TBA' // This should come from timetable system
    })) || [];

    const totalStudents = assignedCourses.reduce((sum, course) => sum + course.students, 0);

    return {
      name: user.full_name,
      employeeId: user.id,
      department: user.department || 'N/A',
      assignedCourses,
      totalStudents,
      pendingGrading: 0, // This should be calculated from ungraded submissions
      upcomingClasses: [], // This should come from timetable system
      recentActivity: [] // This should come from activity logs
    };
  } catch (error) {
    console.error('Error fetching lecturer data:', error);
    return null;
  }
};

// Get dynamic dean data
export const getDeanData = async (userId: string): Promise<DeanData | null> => {
  try {
    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', userId)
      .single();

    if (userError) throw userError;

    // Get faculty statistics
    const { data: facultyUsers, error: facultyError } = await supabase
      .from('users')
      .select('role')
      .eq('department', user.department);

    if (facultyError) throw facultyError;

    const { data: facultyCourses, error: coursesError } = await supabase
      .from('courses')
      .select('id')
      .eq('department', user.department);

    if (coursesError) throw coursesError;

    // Calculate faculty stats
    const roleCounts = facultyUsers?.reduce((acc, u) => {
      acc[u.role] = (acc[u.role] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number }) || {};

    const facultyStats: FacultyStatistics = {
      totalLecturers: roleCounts.lecturer || 0,
      totalStudents: roleCounts.student || 0,
      totalCourses: facultyCourses?.length || 0,
      totalProgrammes: 9, // This should come from programme data
      graduationRate: 87, // This should be calculated from graduation data
      employmentRate: 92, // This should come from alumni tracking
      researchProjects: 15, // This should come from research database
      publications: 23 // This should come from publications database
    };

    return {
      name: user.full_name,
      faculty: user.department || 'N/A',
      facultyCode: 'FoCIT', // This should be derived from faculty mapping
      departments: [], // This should come from department structure
      facultyStats,
      recentActivity: [] // This should come from activity logs
    };
  } catch (error) {
    console.error('Error fetching dean data:', error);
    return null;
  }
};

// Create sample data for testing (remove in production)
export const createSampleStudentData = async (userId: string): Promise<boolean> => {
  try {
    // This function would create sample data in the database for testing
    // In a real application, this data would come from actual academic operations

    console.log('Sample data creation would happen here for user:', userId);

    // You could implement actual database insertions here for testing
    // For example:
    // - Create sample course enrollments
    // - Create sample assignments
    // - Create sample fee records
    // - Create sample class schedules

    return true;
  } catch (error) {
    console.error('Error creating sample data:', error);
    return false;
  }
};
