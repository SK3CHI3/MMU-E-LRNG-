import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';
import { generateTestData } from '@/utils/testDataGenerator';
import { supabaseAdmin } from '@/lib/supabaseClient';
import { Loader2, Database, Trash2, RefreshCw } from 'lucide-react';

const TestDataGenerator = () => {
  const { dbUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string>('');
  const [error, setError] = useState<string>('');

  const handleGenerateTestData = async () => {
    if (!dbUser?.auth_id) {
      setError('No authenticated user found');
      return;
    }

    try {
      setLoading(true);
      setError('');
      setStatus('Generating test data...');

      // First, update the test data generator to use the current user's ID
      const success = await generateTestDataForUser(dbUser.auth_id);
      
      if (success) {
        setStatus('✅ Test data generated successfully! Refresh the page to see the changes.');
      } else {
        setError('Failed to generate test data');
      }
    } catch (err) {
      console.error('Error generating test data:', err);
      setError('An error occurred while generating test data');
    } finally {
      setLoading(false);
    }
  };

  const handleClearTestData = async () => {
    try {
      setLoading(true);
      setError('');
      setStatus('Clearing test data...');

      // Clear test data (keep user data)
      await supabaseAdmin.from('analytics_data').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabaseAdmin.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabaseAdmin.from('assignment_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabaseAdmin.from('course_materials').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabaseAdmin.from('assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabaseAdmin.from('course_enrollments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
      await supabaseAdmin.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');

      setStatus('✅ Test data cleared successfully!');
    } catch (err) {
      console.error('Error clearing test data:', err);
      setError('An error occurred while clearing test data');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Database className="h-5 w-5" />
          <span>Test Data Generator</span>
        </CardTitle>
        <CardDescription>
          Generate sample data for testing the MMU LMS backend integration
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {dbUser && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
            <p className="text-sm">
              <strong>Current User:</strong> {dbUser.full_name} ({dbUser.role})
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Test data will be created for this user account
            </p>
          </div>
        )}

        {status && (
          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
            <p className="text-sm text-green-800 dark:text-green-200">{status}</p>
          </div>
        )}

        {error && (
          <div className="p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
            <p className="text-sm text-red-800 dark:text-red-200">{error}</p>
          </div>
        )}

        <div className="space-y-3">
          <Button
            onClick={handleGenerateTestData}
            disabled={loading || !dbUser}
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Database className="h-4 w-4 mr-2" />
                Generate Test Data
              </>
            )}
          </Button>

          <Button
            onClick={handleClearTestData}
            disabled={loading}
            variant="outline"
            className="w-full"
          >
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Clearing...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Clear Test Data
              </>
            )}
          </Button>

          <Button
            onClick={() => window.location.reload()}
            variant="secondary"
            className="w-full"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh Page
          </Button>
        </div>

        <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
          <p><strong>What this generates:</strong></p>
          <ul className="list-disc list-inside space-y-1 ml-2">
            <li>5 sample courses with realistic content</li>
            <li>15-25 assignments across all courses</li>
            <li>25-40 course materials (PDFs, videos, links)</li>
            <li>Analytics data for the past 8 weeks</li>
            <li>Sample notifications and activity tracking</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper function to generate test data for a specific user
const generateTestDataForUser = async (userId: string): Promise<boolean> => {
  try {
    console.log('🚀 Generating test data for user:', userId);

    // Clear existing test data first
    await supabaseAdmin.from('analytics_data').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('notifications').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('assignment_submissions').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('course_materials').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('assignments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('course_enrollments').delete().neq('id', '00000000-0000-0000-0000-000000000000');
    await supabaseAdmin.from('courses').delete().neq('id', '00000000-0000-0000-0000-000000000000');

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
        created_by: userId
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
        created_by: userId
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
        created_by: userId
      }
    ];

    const { data: createdCourses, error: coursesError } = await supabaseAdmin
      .from('courses')
      .insert(courses)
      .select();

    if (coursesError) throw coursesError;

    // 2. Create assignments
    const assignments = [];
    createdCourses.forEach((course, courseIndex) => {
      for (let i = 0; i < 3; i++) {
        const daysFromNow = (i + 1) * 7;
        const dueDate = new Date();
        dueDate.setDate(dueDate.getDate() + daysFromNow);

        assignments.push({
          course_id: course.id,
          title: `Assignment ${i + 1}: ${course.code} Project`,
          description: `Complete the assigned project for ${course.title}`,
          due_date: dueDate.toISOString(),
          total_points: 100,
          created_by: userId
        });
      }
    });

    const { data: createdAssignments, error: assignmentsError } = await supabaseAdmin
      .from('assignments')
      .insert(assignments)
      .select();

    if (assignmentsError) throw assignmentsError;

    // 3. Create course materials
    const materials = [];
    createdCourses.forEach(course => {
      for (let i = 0; i < 5; i++) {
        materials.push({
          course_id: course.id,
          title: `${course.code} - Lecture ${i + 1}`,
          description: `Study material for ${course.title}`,
          type: i % 2 === 0 ? 'document' : 'video',
          url: `https://example.com/materials/${course.code.toLowerCase()}-${i + 1}.pdf`,
          created_by: userId
        });
      }
    });

    const { data: createdMaterials, error: materialsError } = await supabaseAdmin
      .from('course_materials')
      .insert(materials)
      .select();

    if (materialsError) throw materialsError;

    // 4. Generate analytics data
    const analyticsData = [];
    const activityTypes = ['login', 'material_view', 'assignment_submission', 'discussion_post'];
    
    for (let week = 0; week < 8; week++) {
      for (let day = 0; day < 7; day++) {
        const date = new Date();
        date.setDate(date.getDate() - (week * 7 + day));
        
        const isWeekend = date.getDay() === 0 || date.getDay() === 6;
        const numActivities = isWeekend ? 2 : 6;
        
        createdCourses.forEach(course => {
          for (let i = 0; i < numActivities; i++) {
            const activityType = activityTypes[Math.floor(Math.random() * activityTypes.length)];
            
            analyticsData.push({
              user_id: userId,
              course_id: course.id,
              activity_type: activityType,
              duration_seconds: activityType === 'material_view' ? 
                Math.floor(Math.random() * 1800) + 300 : null,
              created_at: date.toISOString()
            });
          }
        });
      }
    }

    const { data: createdAnalytics, error: analyticsError } = await supabaseAdmin
      .from('analytics_data')
      .insert(analyticsData)
      .select();

    if (analyticsError) throw analyticsError;

    console.log('✅ Test data generated successfully');
    console.log(`   - Courses: ${createdCourses.length}`);
    console.log(`   - Assignments: ${createdAssignments.length}`);
    console.log(`   - Materials: ${createdMaterials.length}`);
    console.log(`   - Analytics: ${createdAnalytics.length}`);

    return true;
  } catch (error) {
    console.error('❌ Error generating test data:', error);
    return false;
  }
};

export default TestDataGenerator;
