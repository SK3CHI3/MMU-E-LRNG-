import { supabase } from '@/lib/supabaseClient';

export interface StudentData {
  name: string;
  admissionNumber: string;
  faculty: string;
  semester: string;
  gpa: number;
  feeBalance: number;
  feeRequired: number;
  enrolledCourses: number;
  completedCredits: number;
  requiredCredits: number;
  upcomingClasses: ClassSchedule[];
  pendingAssignments: PendingAssignment[];
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
  credits: number;
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

// Get dynamic student data
export const getStudentData = async (userId: string): Promise<StudentData | null> => {
  try {
    // Get user info
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('auth_id', userId)
      .single();

    if (userError) throw userError;

    // Get enrolled courses
    const { data: enrollments, error: enrollmentError } = await supabase
      .from('course_enrollments')
      .select(`
        *,
        courses (
          id,
          code,
          title,
          credit_hours
        )
      `)
      .eq('user_id', user.id)
      .eq('status', 'enrolled');

    if (enrollmentError) throw enrollmentError;

    // Get pending assignments
    const { data: assignments, error: assignmentError } = await supabase
      .from('assignments')
      .select(`
        *,
        courses (
          code,
          title
        )
      `)
      .in('course_id', enrollments?.map(e => e.course_id) || [])
      .eq('is_published', true)
      .gte('due_date', new Date().toISOString());

    if (assignmentError) throw assignmentError;

    // Calculate stats
    const enrolledCourses = enrollments?.length || 0;
    const completedCredits = enrollments?.reduce((sum, e) => sum + (e.courses?.credit_hours || 0), 0) || 0;

    // Format pending assignments
    const pendingAssignments: PendingAssignment[] = assignments?.map(assignment => {
      const dueDate = new Date(assignment.due_date);
      const today = new Date();
      const daysRemaining = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));

      return {
        id: assignment.id,
        unit: assignment.courses?.title || 'Unknown Course',
        title: assignment.title,
        dueDate: dueDate.toLocaleDateString(),
        daysRemaining,
        course_code: assignment.courses?.code
      };
    }) || [];

    return {
      name: user.full_name,
      admissionNumber: user.student_id || 'N/A',
      faculty: user.department || 'N/A',
      semester: '2.1', // This should come from academic calendar
      gpa: 3.7, // This should be calculated from grades
      feeBalance: 15000, // This should come from finance system
      feeRequired: 45000, // This should come from finance system
      enrolledCourses,
      completedCredits,
      requiredCredits: 120, // This should come from programme requirements
      upcomingClasses: [], // This should come from timetable system
      pendingAssignments
    };
  } catch (error) {
    console.error('Error fetching student data:', error);
    return null;
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
      credits: course.credit_hours,
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
