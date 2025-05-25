import { supabaseAdmin } from '@/lib/supabaseClient';

// Sample data for testing the dynamic backend
export const initializeDatabase = async () => {
  try {
    console.log('🚀 Starting database initialization...');

    // 1. Create sample users
    const users = [
      {
        auth_id: 'lecturer-001',
        email: 'john.doe@mmu.ac.ke',
        full_name: 'Dr. John Doe',
        role: 'lecturer',
        department: 'Computer Science',
        student_id: null
      },
      {
        auth_id: 'student-001',
        email: 'jane.smith@student.mmu.ac.ke',
        full_name: 'Jane Smith',
        role: 'student',
        department: 'Computer Science',
        student_id: 'CS/2021/001'
      },
      {
        auth_id: 'student-002',
        email: 'mike.johnson@student.mmu.ac.ke',
        full_name: 'Mike Johnson',
        role: 'student',
        department: 'Computer Science',
        student_id: 'CS/2021/002'
      },
      {
        auth_id: 'student-003',
        email: 'sarah.wilson@student.mmu.ac.ke',
        full_name: 'Sarah Wilson',
        role: 'student',
        department: 'Computer Science',
        student_id: 'CS/2021/003'
      }
    ];

    console.log('📝 Creating users...');
    const { data: createdUsers, error: usersError } = await supabaseAdmin
      .from('users')
      .upsert(users, { onConflict: 'auth_id' })
      .select();

    if (usersError) {
      console.error('Error creating users:', usersError);
      return;
    }

    console.log(`✅ Created ${createdUsers.length} users`);

    // 2. Create sample courses
    const courses = [
      {
        id: 'course-001',
        code: 'CS301',
        title: 'Data Structures and Algorithms',
        description: 'Advanced data structures and algorithmic problem solving',
        credit_hours: 3,
        department: 'Computer Science',
        level: 'undergraduate',
        semester: 'fall',
        year: 2024,
        created_by: 'lecturer-001'
      },
      {
        id: 'course-002',
        code: 'CS205',
        title: 'Database Management Systems',
        description: 'Relational databases, SQL, and database design principles',
        credit_hours: 3,
        department: 'Computer Science',
        level: 'undergraduate',
        semester: 'fall',
        year: 2024,
        created_by: 'lecturer-001'
      },
      {
        id: 'course-003',
        code: 'CS401',
        title: 'Software Engineering',
        description: 'Software development lifecycle and project management',
        credit_hours: 4,
        department: 'Computer Science',
        level: 'undergraduate',
        semester: 'fall',
        year: 2024,
        created_by: 'lecturer-001'
      }
    ];

    console.log('📚 Creating courses...');
    const { data: createdCourses, error: coursesError } = await supabaseAdmin
      .from('courses')
      .upsert(courses, { onConflict: 'id' })
      .select();

    if (coursesError) {
      console.error('Error creating courses:', coursesError);
      return;
    }

    console.log(`✅ Created ${createdCourses.length} courses`);

    // 3. Create course enrollments
    const enrollments = [
      { user_id: 'student-001', course_id: 'course-001', status: 'enrolled' },
      { user_id: 'student-001', course_id: 'course-002', status: 'enrolled' },
      { user_id: 'student-001', course_id: 'course-003', status: 'enrolled' },
      { user_id: 'student-002', course_id: 'course-001', status: 'enrolled' },
      { user_id: 'student-002', course_id: 'course-002', status: 'enrolled' },
      { user_id: 'student-003', course_id: 'course-001', status: 'enrolled' },
      { user_id: 'student-003', course_id: 'course-003', status: 'enrolled' }
    ];

    console.log('🎓 Creating enrollments...');
    const { data: createdEnrollments, error: enrollmentsError } = await supabaseAdmin
      .from('course_enrollments')
      .upsert(enrollments, { onConflict: 'user_id,course_id' })
      .select();

    if (enrollmentsError) {
      console.error('Error creating enrollments:', enrollmentsError);
      return;
    }

    console.log(`✅ Created ${createdEnrollments.length} enrollments`);

    // 4. Create assignments
    const assignments = [
      {
        id: 'assignment-001',
        course_id: 'course-001',
        title: 'Binary Search Tree Implementation',
        description: 'Implement a binary search tree with insert, delete, and search operations',
        due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days from now
        total_points: 100,
        created_by: 'lecturer-001'
      },
      {
        id: 'assignment-002',
        course_id: 'course-002',
        title: 'Database Design Project',
        description: 'Design and implement a database for a library management system',
        due_date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days from now
        total_points: 150,
        created_by: 'lecturer-001'
      },
      {
        id: 'assignment-003',
        course_id: 'course-003',
        title: 'Software Requirements Document',
        description: 'Create a comprehensive SRS for a mobile application',
        due_date: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(), // 10 days from now
        total_points: 120,
        created_by: 'lecturer-001'
      }
    ];

    console.log('📋 Creating assignments...');
    const { data: createdAssignments, error: assignmentsError } = await supabaseAdmin
      .from('assignments')
      .upsert(assignments, { onConflict: 'id' })
      .select();

    if (assignmentsError) {
      console.error('Error creating assignments:', assignmentsError);
      return;
    }

    console.log(`✅ Created ${createdAssignments.length} assignments`);

    // 5. Create assignment submissions
    const submissions = [
      {
        assignment_id: 'assignment-001',
        user_id: 'student-001',
        submission_url: 'https://example.com/submission1.zip',
        submitted_at: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        grade: 85,
        feedback: 'Good implementation, but could improve error handling',
        graded_by: 'lecturer-001',
        graded_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        assignment_id: 'assignment-001',
        user_id: 'student-002',
        submission_url: 'https://example.com/submission2.zip',
        submitted_at: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        grade: 92,
        feedback: 'Excellent work! Clean code and good documentation',
        graded_by: 'lecturer-001',
        graded_at: new Date().toISOString()
      },
      {
        assignment_id: 'assignment-002',
        user_id: 'student-001',
        submission_url: 'https://example.com/submission3.zip',
        submitted_at: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        grade: null, // Not graded yet
        feedback: null,
        graded_by: null,
        graded_at: null
      }
    ];

    console.log('📤 Creating submissions...');
    const { data: createdSubmissions, error: submissionsError } = await supabaseAdmin
      .from('assignment_submissions')
      .upsert(submissions, { onConflict: 'assignment_id,user_id' })
      .select();

    if (submissionsError) {
      console.error('Error creating submissions:', submissionsError);
      return;
    }

    console.log(`✅ Created ${createdSubmissions.length} submissions`);

    // 6. Create course materials
    const materials = [
      {
        course_id: 'course-001',
        title: 'Introduction to Data Structures',
        description: 'Basic concepts and overview',
        type: 'document',
        url: 'https://example.com/materials/ds-intro.pdf',
        created_by: 'lecturer-001'
      },
      {
        course_id: 'course-001',
        title: 'Tree Algorithms Video Lecture',
        description: 'Video explaining tree traversal algorithms',
        type: 'video',
        url: 'https://example.com/materials/tree-algorithms.mp4',
        created_by: 'lecturer-001'
      },
      {
        course_id: 'course-002',
        title: 'SQL Fundamentals',
        description: 'Basic SQL queries and operations',
        type: 'document',
        url: 'https://example.com/materials/sql-fundamentals.pdf',
        created_by: 'lecturer-001'
      }
    ];

    console.log('📖 Creating course materials...');
    const { data: createdMaterials, error: materialsError } = await supabaseAdmin
      .from('course_materials')
      .upsert(materials)
      .select();

    if (materialsError) {
      console.error('Error creating materials:', materialsError);
      return;
    }

    console.log(`✅ Created ${createdMaterials.length} course materials`);

    // 7. Create analytics data
    const analyticsData = [];
    const activityTypes = ['login', 'material_view', 'assignment_submission', 'discussion_post'];
    const studentIds = ['student-001', 'student-002', 'student-003'];
    const courseIds = ['course-001', 'course-002', 'course-003'];

    // Generate analytics data for the past 30 days
    for (let i = 0; i < 30; i++) {
      const date = new Date();
      date.setDate(date.getDate() - i);

      studentIds.forEach(studentId => {
        courseIds.forEach(courseId => {
          // Random number of activities per day
          const numActivities = Math.floor(Math.random() * 5) + 1;
          
          for (let j = 0; j < numActivities; j++) {
            const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
            analyticsData.push({
              user_id: studentId,
              course_id: courseId,
              activity_type: activityType,
              duration_seconds: activityType === 'material_view' ? Math.floor(Math.random() * 1800) + 300 : null,
              created_at: date.toISOString()
            });
          }
        });
      });
    }

    console.log('📊 Creating analytics data...');
    const { data: createdAnalytics, error: analyticsError } = await supabaseAdmin
      .from('analytics_data')
      .upsert(analyticsData)
      .select();

    if (analyticsError) {
      console.error('Error creating analytics data:', analyticsError);
      return;
    }

    console.log(`✅ Created ${createdAnalytics.length} analytics records`);

    // 8. Create notifications
    const notifications = [
      {
        user_id: 'student-001',
        title: 'Assignment Graded',
        message: 'Your Binary Search Tree assignment has been graded. Score: 85/100',
        type: 'grade',
        is_read: false,
        related_id: 'assignment-001'
      },
      {
        user_id: 'student-002',
        title: 'Assignment Graded',
        message: 'Your Binary Search Tree assignment has been graded. Score: 92/100',
        type: 'grade',
        is_read: false,
        related_id: 'assignment-001'
      },
      {
        user_id: 'student-001',
        title: 'New Assignment Posted',
        message: 'A new assignment "Software Requirements Document" has been posted in CS401',
        type: 'assignment',
        is_read: true,
        related_id: 'assignment-003'
      }
    ];

    console.log('🔔 Creating notifications...');
    const { data: createdNotifications, error: notificationsError } = await supabaseAdmin
      .from('notifications')
      .upsert(notifications)
      .select();

    if (notificationsError) {
      console.error('Error creating notifications:', notificationsError);
      return;
    }

    console.log(`✅ Created ${createdNotifications.length} notifications`);

    console.log('🎉 Database initialization completed successfully!');
    console.log('📊 Summary:');
    console.log(`   - Users: ${createdUsers.length}`);
    console.log(`   - Courses: ${createdCourses.length}`);
    console.log(`   - Enrollments: ${createdEnrollments.length}`);
    console.log(`   - Assignments: ${createdAssignments.length}`);
    console.log(`   - Submissions: ${createdSubmissions.length}`);
    console.log(`   - Materials: ${createdMaterials.length}`);
    console.log(`   - Analytics: ${createdAnalytics.length}`);
    console.log(`   - Notifications: ${createdNotifications.length}`);

  } catch (error) {
    console.error('❌ Error initializing database:', error);
  }
};

// Run the initialization if this file is executed directly
if (typeof window === 'undefined') {
  initializeDatabase();
}
