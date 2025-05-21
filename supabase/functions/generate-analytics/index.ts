// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/supabase

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

interface RequestBody {
  courseId?: string;
  userId?: string;
  type: 'course' | 'student' | 'overview';
  timeRange: 'week' | 'month' | 'semester' | 'year';
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { courseId, userId, type, timeRange } = await req.json() as RequestBody

    // Create a Supabase client with the Auth context of the logged in user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    )

    // Get the requesting user's role
    const { data: { user } } = await supabaseClient.auth.getUser()
    
    if (!user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    const { data: userData } = await supabaseClient
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single()

    const userRole = userData?.role

    // Determine time range in days
    let daysAgo = 7;
    switch (timeRange) {
      case 'month':
        daysAgo = 30;
        break;
      case 'semester':
        daysAgo = 120;
        break;
      case 'year':
        daysAgo = 365;
        break;
    }

    let analyticsData = {};

    // Generate different analytics based on the type
    if (type === 'course' && courseId) {
      // Verify the user has access to this course
      if (userRole !== 'admin') {
        const { data: courseAccess } = await supabaseClient.rpc(
          'user_has_course_access',
          { user_auth_id: user.id, course_id_param: courseId }
        )
        
        if (!courseAccess) {
          return new Response(
            JSON.stringify({ error: 'Access denied to this course' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 403,
            }
          )
        }
      }

      // Get course statistics
      const { data: courseStats } = await supabaseClient.rpc(
        'get_course_statistics',
        { course_id: courseId }
      )

      // Get activity over time
      const { data: activityData } = await supabaseClient
        .from('analytics_data')
        .select('created_at, activity_type, count(*)')
        .eq('course_id', courseId)
        .gte('created_at', new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString())
        .group('activity_type, created_at')
        .order('created_at')

      // Get assignment completion rates
      const { data: assignmentStats } = await supabaseClient.rpc(
        'get_assignment_completion_stats',
        { course_id_param: courseId }
      )

      analyticsData = {
        courseStats,
        activityData,
        assignmentStats
      }
    } 
    else if (type === 'student' && userId) {
      // Verify the user has access to this student's data
      if (userRole !== 'admin' && user.id !== userId) {
        const { data: isTeacher } = await supabaseClient.rpc(
          'is_teacher_for_student',
          { teacher_auth_id: user.id, student_id_param: userId }
        )
        
        if (!isTeacher) {
          return new Response(
            JSON.stringify({ error: 'Access denied to this student data' }),
            {
              headers: { ...corsHeaders, 'Content-Type': 'application/json' },
              status: 403,
            }
          )
        }
      }

      // Get student progress across all courses
      const { data: courseProgress } = await supabaseClient.rpc(
        'get_student_progress_all_courses',
        { student_id_param: userId }
      )

      // Get activity over time
      const { data: activityData } = await supabaseClient
        .from('analytics_data')
        .select('created_at, activity_type, course_id, count(*)')
        .eq('user_id', userId)
        .gte('created_at', new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString())
        .group('activity_type, course_id, created_at')
        .order('created_at')

      analyticsData = {
        courseProgress,
        activityData
      }
    }
    else if (type === 'overview') {
      // Only admins can access overview data
      if (userRole !== 'admin') {
        return new Response(
          JSON.stringify({ error: 'Access denied to overview data' }),
          {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 403,
          }
        )
      }

      // Get system-wide statistics
      const { data: systemStats } = await supabaseClient.rpc(
        'get_system_statistics'
      )

      // Get activity over time
      const { data: activityData } = await supabaseClient
        .from('analytics_data')
        .select('created_at, activity_type, count(*)')
        .gte('created_at', new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000).toISOString())
        .group('activity_type, created_at')
        .order('created_at')

      analyticsData = {
        systemStats,
        activityData
      }
    }

    return new Response(
      JSON.stringify(analyticsData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    return new Response(
      JSON.stringify({ error: error.message }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    )
  }
})
