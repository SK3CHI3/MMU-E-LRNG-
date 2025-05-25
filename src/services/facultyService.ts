import { supabase } from '@/lib/supabaseClient';
import { mmuFaculties, mmuStats, mmuContact } from '@/data/mmuData';

export interface FacultyStats {
  id: string;
  name: string;
  shortName: string;
  dean: string;
  totalStudents: number;
  totalLecturers: number;
  totalCourses: number;
  totalDepartments: number;
}

export interface SystemStats {
  totalUsers: number;
  totalStudents: number;
  totalLecturers: number;
  totalDeans: number;
  totalAdmins: number;
  totalCourses: number;
  totalFaculties: number;
  totalDepartments: number;
  activeNotifications: number;
}

// Get all MMU faculties from mmuData.ts
export const getMMUFaculties = () => {
  return mmuFaculties;
};

// Get MMU statistics from mmuData.ts
export const getMMUStats = () => {
  return mmuStats;
};

// Get MMU contact information
export const getMMUContact = () => {
  return mmuContact;
};

// Get faculty names for dropdowns
export const getFacultyNames = () => {
  return mmuFaculties.map(faculty => faculty.name);
};

// Get faculty by ID
export const getFacultyById = (id: string) => {
  return mmuFaculties.find(faculty => faculty.id === id);
};

// Get faculty by name
export const getFacultyByName = (name: string) => {
  return mmuFaculties.find(faculty => faculty.name === name);
};

// Get dynamic faculty statistics from database
export const getFacultyStats = async (): Promise<FacultyStats[]> => {
  try {
    const { data: facultyData, error } = await supabase
      .from('users')
      .select('department, role')
      .not('department', 'is', null);

    if (error) throw error;

    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('department');

    if (courseError) throw courseError;

    // Group by faculty and calculate stats
    const facultyStats: { [key: string]: FacultyStats } = {};

    // Initialize with MMU faculty data
    mmuFaculties.forEach(faculty => {
      facultyStats[faculty.name] = {
        id: faculty.id,
        name: faculty.name,
        shortName: faculty.shortName,
        dean: faculty.dean || 'TBA',
        totalStudents: 0,
        totalLecturers: 0,
        totalCourses: 0,
        totalDepartments: faculty.departments.length
      };
    });

    // Count users by faculty
    facultyData?.forEach(user => {
      if (facultyStats[user.department]) {
        if (user.role === 'student') {
          facultyStats[user.department].totalStudents++;
        } else if (user.role === 'lecturer') {
          facultyStats[user.department].totalLecturers++;
        }
      }
    });

    // Count courses by faculty
    courseData?.forEach(course => {
      if (facultyStats[course.department]) {
        facultyStats[course.department].totalCourses++;
      }
    });

    return Object.values(facultyStats);
  } catch (error) {
    console.error('Error fetching faculty stats:', error);
    return [];
  }
};

// Get system-wide statistics from database
export const getSystemStats = async (): Promise<SystemStats> => {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('role');

    if (userError) throw userError;

    const { data: courseData, error: courseError } = await supabase
      .from('courses')
      .select('id');

    if (courseError) throw courseError;

    const { data: notificationData, error: notificationError } = await supabase
      .from('announcements')
      .select('id')
      .eq('is_public', true);

    if (notificationError) throw notificationError;

    // Count users by role
    const roleCounts = userData?.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as { [key: string]: number }) || {};

    return {
      totalUsers: userData?.length || 0,
      totalStudents: roleCounts.student || 0,
      totalLecturers: roleCounts.lecturer || 0,
      totalDeans: roleCounts.dean || 0,
      totalAdmins: roleCounts.admin || 0,
      totalCourses: courseData?.length || 0,
      totalFaculties: mmuFaculties.length,
      totalDepartments: mmuFaculties.reduce((acc, faculty) => acc + faculty.departments.length, 0),
      activeNotifications: notificationData?.length || 0
    };
  } catch (error) {
    console.error('Error fetching system stats:', error);
    return {
      totalUsers: 0,
      totalStudents: 0,
      totalLecturers: 0,
      totalDeans: 0,
      totalAdmins: 0,
      totalCourses: 0,
      totalFaculties: 0,
      totalDepartments: 0,
      activeNotifications: 0
    };
  }
};

// Get departments for a specific faculty
export const getDepartmentsByFaculty = (facultyName: string) => {
  const faculty = getFacultyByName(facultyName);
  return faculty?.departments.map(dept => dept.name) || [];
};

// Get programmes for a specific faculty
export const getProgrammesByFaculty = (facultyName: string) => {
  const faculty = getFacultyByName(facultyName);
  return faculty?.programmes || [];
};
