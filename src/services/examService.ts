import { supabase } from '@/lib/supabaseClient';

// Types for exam system
export interface ExamQuestion {
  id: string;
  assignment_id: string;
  question_text: string;
  question_type: 'mcq' | 'essay' | 'short_answer' | 'true_false';
  question_order: number;
  points: number;
  options?: Array<{
    text: string;
    is_correct: boolean;
  }>;
  correct_answers?: number[];
  max_words?: number;
  rubric?: any;
  expected_keywords?: string[];
  case_sensitive?: boolean;
  explanation?: string;
  time_limit?: number;
  is_required: boolean;
  created_at: string;
  updated_at: string;
}

export interface ExamAttempt {
  id: string;
  assignment_id: string;
  user_id: string;
  attempt_number: number;
  started_at: string;
  submitted_at?: string;
  time_remaining?: number;
  is_completed: boolean;
  auto_submitted: boolean;
  status: 'in_progress' | 'submitted' | 'graded' | 'abandoned';
  created_at: string;
  updated_at: string;
}

export interface ExamAnswer {
  id: string;
  attempt_id: string;
  question_id: string;
  answer_text?: string;
  selected_options?: number[];
  answer_files?: any[];
  points_earned: number;
  is_correct?: boolean;
  auto_graded: boolean;
  manual_feedback?: string;
  graded_by?: string;
  graded_at?: string;
  time_spent?: number;
  answered_at: string;
  created_at: string;
  updated_at: string;
}

export interface ExamTemplate {
  id: string;
  created_by: string;
  template_name: string;
  description?: string;
  subject_area?: string;
  difficulty_level?: 'easy' | 'medium' | 'hard';
  estimated_duration?: number;
  question_structure?: any;
  is_public: boolean;
  usage_count: number;
  created_at: string;
  updated_at: string;
}

export interface ExamGrade {
  id: string;
  attempt_id: string;
  assignment_id: string;
  user_id: string;
  total_points: number;
  points_earned: number;
  percentage: number;
  letter_grade: string;
  is_passing: boolean;
  auto_graded_points: number;
  manual_graded_points: number;
  grading_status: 'pending' | 'auto_graded' | 'manual_review' | 'completed';
  graded_by?: string;
  graded_at?: string;
  feedback?: string;
  created_at: string;
  updated_at: string;
}

// Create exam questions for an assignment
export const createExamQuestions = async (
  assignmentId: string,
  questions: Omit<ExamQuestion, 'id' | 'assignment_id' | 'created_at' | 'updated_at'>[]
) => {
  try {
    const questionsWithAssignment = questions.map(q => ({
      ...q,
      assignment_id: assignmentId
    }));

    const { data, error } = await supabase
      .from('exam_questions')
      .insert(questionsWithAssignment)
      .select();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error creating exam questions:', error);
    throw error;
  }
};

// Get exam questions for an assignment
export const getExamQuestions = async (assignmentId: string) => {
  try {
    const { data, error } = await supabase
      .from('exam_questions')
      .select('*')
      .eq('assignment_id', assignmentId)
      .order('question_order', { ascending: true });

    if (error) throw error;
    return data as ExamQuestion[];
  } catch (error) {
    console.error('Error fetching exam questions:', error);
    throw error;
  }
};

// Start an exam attempt
export const startExamAttempt = async (assignmentId: string, userId: string) => {
  try {
    // Check if user already has an active attempt
    const { data: existingAttempt } = await supabase
      .from('exam_attempts')
      .select('*')
      .eq('assignment_id', assignmentId)
      .eq('user_id', userId)
      .eq('status', 'in_progress')
      .single();

    if (existingAttempt) {
      return existingAttempt;
    }

    // Get assignment details for time limit
    const { data: assignment } = await supabase
      .from('assignments')
      .select('duration_minutes, max_attempts')
      .eq('id', assignmentId)
      .single();

    if (!assignment) throw new Error('Assignment not found');

    // Count existing attempts
    const { count } = await supabase
      .from('exam_attempts')
      .select('*', { count: 'exact', head: true })
      .eq('assignment_id', assignmentId)
      .eq('user_id', userId);

    const attemptNumber = (count || 0) + 1;

    if (assignment.max_attempts && attemptNumber > assignment.max_attempts) {
      throw new Error('Maximum attempts exceeded');
    }

    const { data, error } = await supabase
      .from('exam_attempts')
      .insert({
        assignment_id: assignmentId,
        user_id: userId,
        attempt_number: attemptNumber,
        time_remaining: assignment.duration_minutes ? assignment.duration_minutes * 60 : null
      })
      .select()
      .single();

    if (error) throw error;
    return data as ExamAttempt;
  } catch (error) {
    console.error('Error starting exam attempt:', error);
    throw error;
  }
};

// Submit exam answer
export const submitExamAnswer = async (
  attemptId: string,
  questionId: string,
  answer: {
    answer_text?: string;
    selected_options?: number[];
    answer_files?: any[];
  }
) => {
  try {
    const { data, error } = await supabase
      .from('exam_answers')
      .upsert({
        attempt_id: attemptId,
        question_id: questionId,
        ...answer,
        answered_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data as ExamAnswer;
  } catch (error) {
    console.error('Error submitting exam answer:', error);
    throw error;
  }
};

// Auto-grade MCQ questions
export const autoGradeMCQAnswers = async (attemptId: string) => {
  try {
    // Get all MCQ answers for this attempt
    const { data: answers } = await supabase
      .from('exam_answers')
      .select(`
        *,
        question:exam_questions(*)
      `)
      .eq('attempt_id', attemptId);

    if (!answers) return;

    const gradingUpdates = [];

    for (const answer of answers) {
      if (answer.question.question_type === 'mcq' && answer.selected_options) {
        const correctAnswers = answer.question.correct_answers || [];
        const selectedOptions = answer.selected_options || [];
        
        // Check if selected options match correct answers
        const isCorrect = correctAnswers.length === selectedOptions.length &&
          correctAnswers.every(correct => selectedOptions.includes(correct));

        gradingUpdates.push({
          id: answer.id,
          is_correct: isCorrect,
          points_earned: isCorrect ? answer.question.points : 0,
          auto_graded: true,
          graded_at: new Date().toISOString()
        });
      }
    }

    if (gradingUpdates.length > 0) {
      const { error } = await supabase
        .from('exam_answers')
        .upsert(gradingUpdates);

      if (error) throw error;
    }

    return gradingUpdates;
  } catch (error) {
    console.error('Error auto-grading MCQ answers:', error);
    throw error;
  }
};

// Complete exam attempt
export const completeExamAttempt = async (attemptId: string, autoSubmitted = false) => {
  try {
    // Auto-grade MCQ questions first
    await autoGradeMCQAnswers(attemptId);

    // Update attempt status
    const { data, error } = await supabase
      .from('exam_attempts')
      .update({
        submitted_at: new Date().toISOString(),
        is_completed: true,
        auto_submitted: autoSubmitted,
        status: 'submitted'
      })
      .eq('id', attemptId)
      .select()
      .single();

    if (error) throw error;
    return data as ExamAttempt;
  } catch (error) {
    console.error('Error completing exam attempt:', error);
    throw error;
  }
};

// Get exam attempt with answers
export const getExamAttemptWithAnswers = async (attemptId: string) => {
  try {
    const { data, error } = await supabase
      .from('exam_attempts')
      .select(`
        *,
        assignment:assignments(*),
        answers:exam_answers(
          *,
          question:exam_questions(*)
        )
      `)
      .eq('id', attemptId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching exam attempt:', error);
    throw error;
  }
};

// Get student's exam attempts for an assignment
export const getStudentExamAttempts = async (assignmentId: string, userId: string) => {
  try {
    const { data, error } = await supabase
      .from('exam_attempts')
      .select(`
        *,
        grade:exam_grades(*)
      `)
      .eq('assignment_id', assignmentId)
      .eq('user_id', userId)
      .order('attempt_number', { ascending: false });

    if (error) throw error;
    return data as (ExamAttempt & { grade?: ExamGrade })[];
  } catch (error) {
    console.error('Error fetching student exam attempts:', error);
    throw error;
  }
};

// Get exam grade for an attempt
export const getExamGrade = async (attemptId: string) => {
  try {
    const { data, error } = await supabase
      .from('exam_grades')
      .select('*')
      .eq('attempt_id', attemptId)
      .single();

    if (error && error.code !== 'PGRST116') throw error;
    return data as ExamGrade | null;
  } catch (error) {
    console.error('Error fetching exam grade:', error);
    throw error;
  }
};

// Calculate and record exam grade
export const calculateExamGrade = async (attemptId: string) => {
  try {
    const { data, error } = await supabase.rpc('calculate_exam_grade', {
      attempt_id_param: attemptId
    });

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error calculating exam grade:', error);
    throw error;
  }
};

// Check if assignment is available for taking
export const isAssignmentAvailable = async (assignmentId: string) => {
  try {
    const { data: assignment, error } = await supabase
      .from('assignments')
      .select('available_from, available_until, is_published')
      .eq('id', assignmentId)
      .single();

    if (error) throw error;

    const now = new Date();
    const availableFrom = assignment.available_from ? new Date(assignment.available_from) : null;
    const availableUntil = assignment.available_until ? new Date(assignment.available_until) : null;

    const isAvailable = assignment.is_published &&
      (!availableFrom || now >= availableFrom) &&
      (!availableUntil || now <= availableUntil);

    return {
      isAvailable,
      availableFrom,
      availableUntil,
      isPublished: assignment.is_published
    };
  } catch (error) {
    console.error('Error checking assignment availability:', error);
    throw error;
  }
};

// Get assignment with questions count
export const getAssignmentDetails = async (assignmentId: string) => {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select(`
        *,
        course:courses(title, code),
        questions:exam_questions(count)
      `)
      .eq('id', assignmentId)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching assignment details:', error);
    throw error;
  }
};
