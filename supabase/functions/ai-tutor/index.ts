// Follow this setup guide to integrate the Deno runtime into your application:
// https://deno.land/manual/examples/supabase

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'
import { corsHeaders } from '../_shared/cors.ts'

const OPENAI_API_KEY = Deno.env.get('OPENAI_API_KEY') || ''

interface RequestBody {
  query: string;
  courseId: string;
  userId: string;
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { query, courseId, userId } = await req.json() as RequestBody

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

    // Verify the user is enrolled in the course
    const { data: enrollment, error: enrollmentError } = await supabaseClient
      .from('course_enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    if (enrollmentError || !enrollment) {
      return new Response(
        JSON.stringify({ error: 'User is not enrolled in this course' }),
        {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 403,
        }
      )
    }

    // Get course materials to provide context to the AI
    const { data: materials } = await supabaseClient
      .from('course_materials')
      .select('title, description')
      .eq('course_id', courseId)
      .order('created_at', { ascending: false })
      .limit(5)

    // Get course details
    const { data: course } = await supabaseClient
      .from('courses')
      .select('title, description')
      .eq('id', courseId)
      .single()

    // Create context for the AI
    const context = `
      Course: ${course?.title}
      Description: ${course?.description}
      
      Recent course materials:
      ${materials?.map(m => `- ${m.title}: ${m.description}`).join('\n')}
      
      Student question: ${query}
    `

    // Call OpenAI API
    const openAIResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: 'You are an AI tutor for an online learning platform. Provide helpful, educational responses to student questions about their course materials. Be concise, accurate, and supportive.'
          },
          {
            role: 'user',
            content: context
          }
        ],
        max_tokens: 500,
      }),
    })

    const aiResponse = await openAIResponse.json()

    // Log the interaction in analytics
    await supabaseClient
      .from('analytics_data')
      .insert({
        user_id: userId,
        course_id: courseId,
        activity_type: 'ai_tutor_query',
      })

    return new Response(
      JSON.stringify({ 
        response: aiResponse.choices[0].message.content,
        course: course?.title
      }),
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
