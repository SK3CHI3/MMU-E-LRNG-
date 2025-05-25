import { supabaseAdmin } from '@/lib/supabaseClient';

// Generate test data for the MMU LMS
export const generateTestData = async () => {
  try {
    console.log('🚀 Generating test data for MMU LMS...');

    // Clear existing test data (optional)
    console.log('🧹 Clearing existing test data...');
    
    // Delete in reverse order of dependencies
    await supabaseAdmin.from('analytics_data').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('assignment_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('course_materials').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('course_enrollments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');

    // Generate realistic test data
    const currentYear = new Date().getFullYear();
    const currentSemester = new Date().getMonth() < 6 ? 'spring' : 'fall';

    // 1. Create courses
    const courses = [
      {
        code: 'CS301',
        title: 'Data Structures and Algorithms',
        description: 'Advanced study of data structures including trees, graphs, and hash tables. Algorithm analysis and design techniques.',
        credit_hours: 3,
        department: 'Computer Science',
        level: 'undergraduate' as const,
        semester: currentSemester as 'fall' | 'spring',
        year: currentYear,
        created_by: 'current-lecturer-id' // This will be replaced with actual lecturer ID
      },
      {
        code: 'CS205',
        title: 'Database Management Systems',
        description: 'Relational database design, SQL programming, normalization, and database administration.',
        credit_hours: 3,
        department: 'Computer Science',
        level: 'undergraduate' as const,
        semester: currentSemester as 'fall' | 'spring',
        year: currentYear,
        created_by: 'current-lecturer-id'
      },
      {
        code: 'CS401',
        title: 'Software Engineering',
        description: 'Software development lifecycle, project management, testing, and quality assurance.',
        credit_hours: 4,
        department: 'Computer Science',
        level: 'undergraduate' as const,
        semester: currentSemester as 'fall' | 'spring',
        year: currentYear,
        created_by: 'current-lecturer-id'
      },
      {
        code: 'CS350',
        title: 'Computer Networks',
        description: 'Network protocols, architecture, security, and distributed systems.',
        credit_hours: 3,
        department: 'Computer Science',
        level: 'undergraduate' as const,
        semester: currentSemester as 'fall' | 'spring',
        year: currentYear,
        created_by: 'current-lecturer-id'
      },
      {
        code: 'CS450',
        title: 'Machine Learning',
        description: 'Introduction to machine learning algorithms, neural networks, and AI applications.',
        credit_hours: 4,
        department: 'Computer Science',
        level: 'undergraduate' as const,
        semester: currentSemester as 'fall' | 'spring',
        year: currentYear,
        created_by: 'current-lecturer-id'
      }
    ];

    console.log('📚 Creating courses...');
    const { data: createdCourses, error: coursesError } = await supabaseAdmin
      .from('courses')
      .insert(courses)
      .select();

    if (coursesError) {
      console.error('Error creating courses:', coursesError);
      return false;
    }

    console.log(`✅ Created ${createdCourses.length} courses`);

    // 2. Create assignments for each course
    const assignments = [];
    createdCourses.forEach((course, courseIndex) => {
      // Create 3-5 assignments per course
      const numAssignments = Math.floor(Math.random() * 3) + 3;
      
      for (let i = 0; i < numAssignments; i++) {
        const daysFromNow = (i + 1) * 7 + Math.floor(Math.random() * 7); // Spread assignments over weeks
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + daysFromNow);

        assignments.push({
          course_id: course.id,
          title: `Assignment ${i + 1}: ${getAssignmentTitle(course.code, i)}`,
          description: getAssignmentDescription(course.code, i),
          due_date: dueDate.toISOString(),
          total_points: Math.floor(Math.random() * 50) + 50, // 50-100 points
          created_by: 'current-lecturer-id'
        });
      }
    });

    console.log('📋 Creating assignments...');
    const { data: createdAssignments, error: assignmentsError } = await supabaseAdmin
      .from('assignments')
      .insert(assignments)
      .select();

    if (assignmentsError) {
      console.error('Error creating assignments:', assignmentsError);
      return false;
    }

    console.log(`✅ Created ${createdAssignments.length} assignments`);

    // 3. Create course materials
    const materials = [];
    createdCourses.forEach(course => {
      // Create 5-8 materials per course
      const numMaterials = Math.floor(Math.random() * 4) + 5;
      
      for (let i = 0; i < numMaterials; i++) {
        materials.push({
          course_id: course.id,
          title: getMaterialTitle(course.code, i),
          description: getMaterialDescription(course.code, i),
          type: getMaterialType(i),
          url: `https://example.com/materials/${course.code.toLowerCase()}-${i + 1}.pdf`,
          created_by: 'current-lecturer-id'
        });
      }
    });

    console.log('📖 Creating course materials...');
    const { data: createdMaterials, error: materialsError } = await supabaseAdmin
      .from('course_materials')
      .insert(materials)
      .select();

    if (materialsError) {
      console.error('Error creating materials:', materialsError);
      return false;
    }

    console.log(`✅ Created ${createdMaterials.length} course materials`);

    // 4. Generate analytics data for the past 8 weeks
    const analyticsData = [];
    const activityTypes = ['login', 'material_view', 'assignment_submission', 'discussion_post'];
    
    // Simulate data for past 8 weeks
    for (let week = 0; week < 8; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date();
        date.setDate(date.getDate() - (week * 7 + day));
        
        // Simulate different activity levels throughout the week
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const baseActivities = isWeekend ? 2 : 8;
        const numActivities = Math.floor(Math.random() * baseActivities) + 1;
        
        createdCourses.forEach(course => {
          for (let i = 0; i < numActivities; i++) {
            const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
            
            analyticsData.push({
              user_id: 'current-lecturer-id', // This represents student activity
              course_id: course.id,
              activity_type: activityType,
              duration_seconds: activityType === 'material_view' ? 
                Math.floor(Math.random() * 1800) + 300 : // 5-35 minutes for material views
                null,
              created_at: date.toISOString()
            });
          }
        });
      }
    }

    console.log('📊 Creating analytics data...');
    const { data: createdAnalytics, error: analyticsError } = await supabaseAdmin
      .from('analytics_data')
      .insert(analyticsData)
      .select();

    if (analyticsError) {
      console.error('Error creating analytics data:', analyticsError);
      return false;
    }

    console.log(`✅ Created ${createdAnalytics.length} analytics records`);

    console.log('🎉 Test data generation completed successfully!');
    return true;

  } catch (error) {
    console.error('❌ Error generating test data:', error);
    return false;
  }
};

// Helper functions for generating realistic content
function getAssignmentTitle(courseCode: string, index: number): string {
  const titles = {
    'CS301': [
      'Binary Search Tree Implementation',
      'Graph Algorithms Project',
      'Hash Table Design',
      'Dynamic Programming Solutions',
      'Algorithm Analysis Report'
    ],
    'CS205': [
      'Database Design Project',
      'SQL Query Optimization',
      'Normalization Exercise',
      'Transaction Management',
      'Database Security Analysis'
    ],
    'CS401': [
      'Software Requirements Document',
      'System Design Specification',
      'Testing Strategy Plan',
      'Code Review Process',
      'Project Management Report'
    ],
    'CS350': [
      'Network Protocol Analysis',
      'Socket Programming Project',
      'Network Security Assessment',
      'Routing Algorithm Implementation',
      'Performance Monitoring Tool'
    ],
    'CS450': [
      'Linear Regression Model',
      'Classification Algorithm',
      'Neural Network Implementation',
      'Data Preprocessing Pipeline',
      'Model Evaluation Report'
    ]
  };
  
  return titles[courseCode as keyof typeof titles]?.[index] || `Assignment ${index + 1}`;
}

function getAssignmentDescription(courseCode: string, index: number): string {
  const descriptions = {
    'CS301': [
      'Implement a complete binary search tree with insertion, deletion, and traversal methods.',
      'Design and implement graph algorithms including BFS, DFS, and shortest path.',
      'Create an efficient hash table with collision resolution strategies.',
      'Solve complex problems using dynamic programming techniques.',
      'Analyze time and space complexity of various algorithms.'
    ],
    'CS205': [
      'Design a normalized database schema for a real-world application.',
      'Write complex SQL queries and optimize their performance.',
      'Apply normalization rules to eliminate data redundancy.',
      'Implement transaction management with ACID properties.',
      'Assess database security vulnerabilities and propose solutions.'
    ],
    'CS401': [
      'Create a comprehensive software requirements specification document.',
      'Design system architecture and component interactions.',
      'Develop a complete testing strategy with test cases.',
      'Establish code review guidelines and quality metrics.',
      'Plan and manage a software development project.'
    ],
    'CS350': [
      'Analyze network protocols and their implementation details.',
      'Develop client-server applications using socket programming.',
      'Evaluate network security threats and countermeasures.',
      'Implement routing algorithms for network optimization.',
      'Create tools for monitoring network performance.'
    ],
    'CS450': [
      'Build and train a linear regression model for prediction.',
      'Implement classification algorithms for data categorization.',
      'Design and train neural networks for pattern recognition.',
      'Develop data preprocessing pipelines for ML workflows.',
      'Evaluate and compare different machine learning models.'
    ]
  };
  
  return descriptions[courseCode as keyof typeof descriptions]?.[index] || 
    'Complete the assigned project according to the specifications provided in class.';
}

function getMaterialTitle(courseCode: string, index: number): string {
  const titles = {
    'CS301': [
      'Introduction to Data Structures',
      'Array and Linked List Operations',
      'Tree Data Structures',
      'Graph Theory Fundamentals',
      'Sorting Algorithms',
      'Search Algorithms',
      'Hash Tables and Maps',
      'Algorithm Complexity Analysis'
    ],
    'CS205': [
      'Database Fundamentals',
      'Relational Model Concepts',
      'SQL Basics and Advanced Queries',
      'Database Design Principles',
      'Normalization Techniques',
      'Transaction Processing',
      'Database Security',
      'Performance Optimization'
    ],
    'CS401': [
      'Software Development Lifecycle',
      'Requirements Engineering',
      'System Design Patterns',
      'Testing Methodologies',
      'Project Management',
      'Quality Assurance',
      'Version Control Systems',
      'Agile Development'
    ],
    'CS350': [
      'Network Architecture Overview',
      'TCP/IP Protocol Suite',
      'Network Security Fundamentals',
      'Routing and Switching',
      'Wireless Networks',
      'Network Performance',
      'Distributed Systems',
      'Cloud Computing'
    ],
    'CS450': [
      'Machine Learning Introduction',
      'Supervised Learning Algorithms',
      'Unsupervised Learning',
      'Neural Networks Basics',
      'Deep Learning Concepts',
      'Feature Engineering',
      'Model Evaluation',
      'AI Ethics and Applications'
    ]
  };
  
  return titles[courseCode as keyof typeof titles]?.[index] || `Lecture ${index + 1}`;
}

function getMaterialDescription(courseCode: string, index: number): string {
  return `Comprehensive study material covering key concepts and practical applications for ${courseCode}.`;
}

function getMaterialType(index: number): 'document' | 'video' | 'audio' | 'link' {
  const types: ('document' | 'video' | 'audio' | 'link')[] = ['document', 'video', 'document', 'link', 'document'];
  return types[index % types.length];
}
