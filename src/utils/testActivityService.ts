// Test utility for the student activity service
import { studentActivityService } from '@/services/studentActivityService';

export const testActivityService = async (userId: string) => {
  try {
    if (import.meta.env.DEV) {
      console.log('Testing Student Activity Service...');
    }

    // Test tracking a study session
    await studentActivityService.trackStudySession(userId, 60, 'Mathematics');
    if (import.meta.env.DEV) {
      console.log('✅ Study session tracked successfully');
    }

    // Test tracking class attendance
    await studentActivityService.trackClassAttendance(userId, 'class-123', 'Advanced Calculus');
    if (import.meta.env.DEV) {
      console.log('✅ Class attendance tracked successfully');
    }

    // Test tracking assignment submission
    await studentActivityService.trackAssignmentSubmission(userId, 'assignment-456', 'Calculus Problem Set 1');
    if (import.meta.env.DEV) {
      console.log('✅ Assignment submission tracked successfully');
    }
    
    // Test getting study metrics
    const metrics = await studentActivityService.getStudyMetrics(userId);
    console.log('✅ Study metrics retrieved successfully:', metrics);
    
    return metrics;
  } catch (error) {
    console.error('❌ Error testing activity service:', error);
    throw error;
  }
};

// Helper function to add sample data for testing
export const addSampleActivityData = async (userId: string) => {
  try {
    if (import.meta.env.DEV) {
      console.log('Adding sample activity data...');
    }
    
    // Add study sessions for the past week
    const studySessions = [
      { duration: 90, subject: 'Mathematics', daysAgo: 1 },
      { duration: 75, subject: 'Physics', daysAgo: 2 },
      { duration: 120, subject: 'Chemistry', daysAgo: 3 },
      { duration: 60, subject: 'Biology', daysAgo: 4 },
      { duration: 45, subject: 'English', daysAgo: 5 },
      { duration: 80, subject: 'Mathematics', daysAgo: 6 },
      { duration: 65, subject: 'Physics', daysAgo: 7 }
    ];
    
    for (const session of studySessions) {
      await studentActivityService.trackStudySession(userId, session.duration, session.subject);
    }
    
    // Add class attendance
    const classes = [
      { classId: 'math-101', className: 'Calculus I', daysAgo: 1 },
      { classId: 'phys-201', className: 'Physics II', daysAgo: 1 },
      { classId: 'chem-101', className: 'General Chemistry', daysAgo: 2 },
      { classId: 'bio-101', className: 'Biology I', daysAgo: 2 },
      { classId: 'eng-101', className: 'English Composition', daysAgo: 3 }
    ];
    
    for (const classInfo of classes) {
      await studentActivityService.trackClassAttendance(userId, classInfo.classId, classInfo.className);
    }
    
    // Add assignment submissions
    const assignments = [
      { assignmentId: 'assign-1', name: 'Math Problem Set 1', daysAgo: 2 },
      { assignmentId: 'assign-2', name: 'Physics Lab Report', daysAgo: 4 },
      { assignmentId: 'assign-3', name: 'Chemistry Essay', daysAgo: 6 }
    ];
    
    for (const assignment of assignments) {
      await studentActivityService.trackAssignmentSubmission(userId, assignment.assignmentId, assignment.name);
    }
    
    if (import.meta.env.DEV) {
      console.log('✅ Sample activity data added successfully');
    }

    // Get and return the updated metrics
    const metrics = await studentActivityService.getStudyMetrics(userId);
    if (import.meta.env.DEV) {
      console.log('📊 Updated metrics');
    }
    
    return metrics;
  } catch (error) {
    console.error('❌ Error adding sample data:', error);
    throw error;
  }
};
