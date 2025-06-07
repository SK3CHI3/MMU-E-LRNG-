import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface RequestBody {
  userId: string;
  authId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    // Get the authorization header
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'Missing authorization header' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Create a regular Supabase client to verify the requesting user
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: authHeader },
        },
      }
    )

    // Verify the requesting user is authenticated and is an admin
    const { data: { user }, error: userError } = await supabaseClient.auth.getUser()
    
    if (userError || !user) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized - invalid token' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 401,
        }
      )
    }

    // Check if the user is an admin
    const { data: userData, error: roleError } = await supabaseClient
      .from('users')
      .select('role')
      .eq('auth_id', user.id)
      .single()

    if (roleError || !userData || userData.role !== 'admin') {
      return new Response(
        JSON.stringify({ error: 'Forbidden - admin access required' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      )
    }

    // Parse the request body
    const { userId, authId } = await req.json() as RequestBody

    if (!userId || !authId) {
      return new Response(
        JSON.stringify({ error: 'Missing userId or authId parameter' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        }
      )
    }

    // Create admin client with service role key (bypasses RLS)
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const deletionSteps = []

    // 1. Delete all related data using admin client (bypasses RLS)
    const tablesToClean = [
      'course_enrollments',
      'assignment_submissions', 
      'exam_attempts',
      'class_attendance',
      'notifications',
      'announcement_reads',
      'analytics_data'
    ]

    for (const table of tablesToClean) {
      try {
        const { error, data } = await supabaseAdmin
          .from(table)
          .delete()
          .eq('user_id', authId)
          .select()

        if (error) {
          console.error(`Error deleting from ${table}:`, error)
          deletionSteps.push(`Warning: Failed to delete from ${table}`)
        } else {
          const deletedCount = data?.length || 0
          deletionSteps.push(`Deleted ${deletedCount} records from ${table}`)
        }
      } catch (err) {
        console.error(`Exception deleting from ${table}:`, err)
        deletionSteps.push(`Error: Could not process ${table}`)
      }
    }

    // 2. Update creator/grader references to null
    const creatorTables = [
      { table: 'courses', column: 'created_by' },
      { table: 'assignments', column: 'created_by' },
      { table: 'assignment_submissions', column: 'graded_by' },
      { table: 'exam_answers', column: 'graded_by' },
      { table: 'class_attendance', column: 'marked_by' },
      { table: 'course_materials', column: 'created_by' },
      { table: 'announcements', column: 'created_by' },
      { table: 'system_settings', column: 'created_by' },
      { table: 'system_settings', column: 'updated_by' }
    ]

    for (const { table, column } of creatorTables) {
      try {
        const { error } = await supabaseAdmin
          .from(table)
          .update({ [column]: null })
          .eq(column, authId)

        if (!error) {
          deletionSteps.push(`Updated ${table}.${column} to null`)
        }
      } catch (err) {
        console.error(`Error updating ${table}.${column}:`, err)
      }
    }

    // 3. Delete messages
    try {
      const { error } = await supabaseAdmin
        .from('messages')
        .delete()
        .eq('sender_id', authId)

      if (!error) {
        deletionSteps.push('Deleted messages')
      }
    } catch (err) {
      console.error('Error deleting messages:', err)
    }

    // 4. Delete the user record
    const { error: userDeleteError, data: deletedUser } = await supabaseAdmin
      .from('users')
      .delete()
      .eq('id', userId)
      .select()

    if (userDeleteError) {
      console.error('Error deleting user record:', userDeleteError)
      return new Response(
        JSON.stringify({ 
          success: false, 
          error: `Failed to delete user record: ${userDeleteError.message}`,
          steps: deletionSteps
        }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500,
        }
      )
    }

    deletionSteps.push('Deleted user record')

    // 5. Delete from Supabase auth
    try {
      const { error: authDeleteError } = await supabaseAdmin.auth.admin.deleteUser(authId)
      
      if (authDeleteError) {
        deletionSteps.push('Warning: Auth record not deleted - user may still be able to authenticate')
      } else {
        deletionSteps.push('Deleted from Supabase auth - login completely prevented')
      }
    } catch (authError) {
      deletionSteps.push('Warning: Could not delete auth record')
    }

    console.log(`User ${userId} deleted successfully:`, deletionSteps)

    return new Response(
      JSON.stringify({ 
        success: true,
        message: 'User deleted completely',
        steps: deletionSteps
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    )

  } catch (error) {
    console.error('Error in admin-delete-user-complete function:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: 'Internal server error' 
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    )
  }
})
