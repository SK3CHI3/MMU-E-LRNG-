export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      academic_calendar: {
        Row: {
          academic_year: string
          created_at: string | null
          current_semester: string
          exam_end_date: string | null
          exam_start_date: string | null
          id: string
          is_active: boolean | null
          is_current: boolean | null
          registration_end_date: string | null
          registration_start_date: string | null
          semester_end_date: string
          semester_start_date: string
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          created_at?: string | null
          current_semester: string
          exam_end_date?: string | null
          exam_start_date?: string | null
          id?: string
          is_active?: boolean | null
          is_current?: boolean | null
          registration_end_date?: string | null
          registration_start_date?: string | null
          semester_end_date: string
          semester_start_date: string
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          created_at?: string | null
          current_semester?: string
          exam_end_date?: string | null
          exam_start_date?: string | null
          id?: string
          is_active?: boolean | null
          is_current?: boolean | null
          registration_end_date?: string | null
          registration_start_date?: string | null
          semester_end_date?: string
          semester_start_date?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      analytics_data: {
        Row: {
          activity_type: string
          course_id: string | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          score: number | null
          user_id: string | null
        }
        Insert: {
          activity_type: string
          course_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          score?: number | null
          user_id?: string | null
        }
        Update: {
          activity_type?: string
          course_id?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          score?: number | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_data_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_data_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
        ]
      }
      announcement_reads: {
        Row: {
          announcement_id: string
          created_at: string | null
          id: string
          read_at: string | null
          user_id: string
        }
        Insert: {
          announcement_id: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          user_id: string
        }
        Update: {
          announcement_id?: string
          created_at?: string | null
          id?: string
          read_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "announcement_reads_announcement_id_fkey"
            columns: ["announcement_id"]
            isOneToOne: false
            referencedRelation: "announcements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcement_reads_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
        ]
      }
      announcements: {
        Row: {
          attachments: string[] | null
          category: string | null
          content: string
          course_id: string | null
          created_at: string | null
          created_by: string | null
          expires_at: string | null
          external_link: string | null
          faculty: string | null
          id: string
          is_active: boolean | null
          is_pinned: boolean | null
          is_public: boolean | null
          priority: string | null
          target_audience: string | null
          target_users: string[] | null
          title: string
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          attachments?: string[] | null
          category?: string | null
          content: string
          course_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          external_link?: string | null
          faculty?: string | null
          id?: string
          is_active?: boolean | null
          is_pinned?: boolean | null
          is_public?: boolean | null
          priority?: string | null
          target_audience?: string | null
          target_users?: string[] | null
          title: string
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          attachments?: string[] | null
          category?: string | null
          content?: string
          course_id?: string | null
          created_at?: string | null
          created_by?: string | null
          expires_at?: string | null
          external_link?: string | null
          faculty?: string | null
          id?: string
          is_active?: boolean | null
          is_pinned?: boolean | null
          is_public?: boolean | null
          priority?: string | null
          target_audience?: string | null
          target_users?: string[] | null
          title?: string
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "announcements_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
        ]
      }
      assignment_files: {
        Row: {
          created_at: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          original_name: string
          submission_id: string
          uploaded_at: string | null
          uploaded_by: string
        }
        Insert: {
          created_at?: string | null
          file_name: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          original_name: string
          submission_id: string
          uploaded_at?: string | null
          uploaded_by: string
        }
        Update: {
          created_at?: string | null
          file_name?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          original_name?: string
          submission_id?: string
          uploaded_at?: string | null
          uploaded_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_files_submission_id_fkey"
            columns: ["submission_id"]
            isOneToOne: false
            referencedRelation: "assignment_submissions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_files_uploaded_by_fkey"
            columns: ["uploaded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          assignment_id: string | null
          attempt_number: number | null
          created_at: string | null
          feedback: string | null
          grade: number | null
          graded_at: string | null
          graded_by: string | null
          id: string
          is_late: boolean | null
          percentage: number | null
          rubric_scores: Json | null
          status: string | null
          submission_files: Json | null
          submission_text: string | null
          submission_url: string
          submitted_at: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assignment_id?: string | null
          attempt_number?: number | null
          created_at?: string | null
          feedback?: string | null
          grade?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          is_late?: boolean | null
          percentage?: number | null
          rubric_scores?: Json | null
          status?: string | null
          submission_files?: Json | null
          submission_text?: string | null
          submission_url: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assignment_id?: string | null
          attempt_number?: number | null
          created_at?: string | null
          feedback?: string | null
          grade?: number | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          is_late?: boolean | null
          percentage?: number | null
          rubric_scores?: Json | null
          status?: string | null
          submission_files?: Json | null
          submission_text?: string | null
          submission_url?: string
          submitted_at?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignment_submissions_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
          {
            foreignKeyName: "assignment_submissions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
        ]
      }
      assignments: {
        Row: {
          allow_backtrack: boolean | null
          allowed_file_types: string[] | null
          assignment_type: string | null
          auto_grade: boolean | null
          available_from: string | null
          available_until: string | null
          course_id: string
          created_at: string | null
          created_by: string | null
          description: string
          due_date: string
          duration_minutes: number | null
          id: string
          instructions: string | null
          is_group_assignment: boolean | null
          is_published: boolean | null
          late_penalty_per_day: number | null
          late_submission_allowed: boolean | null
          max_attempts: number | null
          max_file_size: number | null
          max_group_size: number | null
          passing_score: number | null
          question_per_page: number | null
          rubric: Json | null
          show_correct_answers: boolean | null
          show_results_immediately: boolean | null
          shuffle_options: boolean | null
          shuffle_questions: boolean | null
          submission_format: string | null
          title: string
          total_points: number
          updated_at: string | null
        }
        Insert: {
          allow_backtrack?: boolean | null
          allowed_file_types?: string[] | null
          assignment_type?: string | null
          auto_grade?: boolean | null
          available_from?: string | null
          available_until?: string | null
          course_id: string
          created_at?: string | null
          created_by?: string | null
          description: string
          due_date: string
          duration_minutes?: number | null
          id?: string
          instructions?: string | null
          is_group_assignment?: boolean | null
          is_published?: boolean | null
          late_penalty_per_day?: number | null
          late_submission_allowed?: boolean | null
          max_attempts?: number | null
          max_file_size?: number | null
          max_group_size?: number | null
          passing_score?: number | null
          question_per_page?: number | null
          rubric?: Json | null
          show_correct_answers?: boolean | null
          show_results_immediately?: boolean | null
          shuffle_options?: boolean | null
          shuffle_questions?: boolean | null
          submission_format?: string | null
          title: string
          total_points: number
          updated_at?: string | null
        }
        Update: {
          allow_backtrack?: boolean | null
          allowed_file_types?: string[] | null
          assignment_type?: string | null
          auto_grade?: boolean | null
          available_from?: string | null
          available_until?: string | null
          course_id?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          due_date?: string
          duration_minutes?: number | null
          id?: string
          instructions?: string | null
          is_group_assignment?: boolean | null
          is_published?: boolean | null
          late_penalty_per_day?: number | null
          late_submission_allowed?: boolean | null
          max_attempts?: number | null
          max_file_size?: number | null
          max_group_size?: number | null
          passing_score?: number | null
          question_per_page?: number | null
          rubric?: Json | null
          show_correct_answers?: boolean | null
          show_results_immediately?: boolean | null
          shuffle_options?: boolean | null
          shuffle_questions?: boolean | null
          submission_format?: string | null
          title?: string
          total_points?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assignments_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
        ]
      }
      class_attendance: {
        Row: {
          attended: boolean | null
          check_in_time: string | null
          check_out_time: string | null
          created_at: string | null
          id: string
          marked_by: string | null
          notes: string | null
          session_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          attended?: boolean | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          id?: string
          marked_by?: string | null
          notes?: string | null
          session_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          attended?: boolean | null
          check_in_time?: string | null
          check_out_time?: string | null
          created_at?: string | null
          id?: string
          marked_by?: string | null
          notes?: string | null
          session_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "class_attendance_marked_by_fkey"
            columns: ["marked_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
          {
            foreignKeyName: "class_attendance_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_attendance_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
        ]
      }
      class_sessions: {
        Row: {
          cancellation_reason: string | null
          course_id: string
          created_at: string | null
          description: string | null
          end_time: string
          id: string
          instructor_id: string
          is_online: boolean | null
          location: string | null
          max_attendees: number | null
          meeting_link: string | null
          notes: string | null
          session_type: string | null
          start_time: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          cancellation_reason?: string | null
          course_id: string
          created_at?: string | null
          description?: string | null
          end_time: string
          id?: string
          instructor_id: string
          is_online?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_link?: string | null
          notes?: string | null
          session_type?: string | null
          start_time: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          cancellation_reason?: string | null
          course_id?: string
          created_at?: string | null
          description?: string | null
          end_time?: string
          id?: string
          instructor_id?: string
          is_online?: boolean | null
          location?: string | null
          max_attendees?: number | null
          meeting_link?: string | null
          notes?: string | null
          session_type?: string | null
          start_time?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_sessions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_sessions_instructor_id_fkey"
            columns: ["instructor_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
        ]
      }
      conversations: {
        Row: {
          course_id: string | null
          created_at: string | null
          id: string
          is_group: boolean | null
          last_message: string | null
          last_message_at: string | null
          participants: string[]
          priority: string | null
          subject: string
          updated_at: string | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_group?: boolean | null
          last_message?: string | null
          last_message_at?: string | null
          participants: string[]
          priority?: string | null
          subject: string
          updated_at?: string | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          id?: string
          is_group?: boolean | null
          last_message?: string | null
          last_message_at?: string | null
          participants?: string[]
          priority?: string | null
          subject?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversations_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          completion_date: string | null
          course_id: string | null
          created_at: string | null
          enrollment_date: string | null
          grade: string | null
          grade_points: number | null
          id: string
          status: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completion_date?: string | null
          course_id?: string | null
          created_at?: string | null
          enrollment_date?: string | null
          grade?: string | null
          grade_points?: number | null
          id?: string
          status: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completion_date?: string | null
          course_id?: string | null
          created_at?: string | null
          enrollment_date?: string | null
          grade?: string | null
          grade_points?: number | null
          id?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
        ]
      }
      course_materials: {
        Row: {
          course_id: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          download_allowed: boolean | null
          download_count: number | null
          duration: number | null
          file_size: number | null
          file_type: string | null
          folder_path: string | null
          id: string
          is_active: boolean | null
          is_public: boolean | null
          tags: string[] | null
          thumbnail_url: string | null
          title: string
          type: string
          updated_at: string | null
          url: string
          view_count: number | null
        }
        Insert: {
          course_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          download_allowed?: boolean | null
          download_count?: number | null
          duration?: number | null
          file_size?: number | null
          file_type?: string | null
          folder_path?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title: string
          type: string
          updated_at?: string | null
          url: string
          view_count?: number | null
        }
        Update: {
          course_id?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          download_allowed?: boolean | null
          download_count?: number | null
          duration?: number | null
          file_size?: number | null
          file_type?: string | null
          folder_path?: string | null
          id?: string
          is_active?: boolean | null
          is_public?: boolean | null
          tags?: string[] | null
          thumbnail_url?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          url?: string
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "course_materials_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_materials_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
        ]
      }
      courses: {
        Row: {
          code: string
          created_at: string | null
          created_by: string | null
          department: string
          description: string | null
          id: string
          is_active: boolean | null
          level: string
          max_students: number | null
          prerequisites: string[] | null
          programme_id: string | null
          semester: string
          syllabus_url: string | null
          title: string
          updated_at: string | null
          year: number
        }
        Insert: {
          code: string
          created_at?: string | null
          created_by?: string | null
          department: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          level: string
          max_students?: number | null
          prerequisites?: string[] | null
          programme_id?: string | null
          semester: string
          syllabus_url?: string | null
          title: string
          updated_at?: string | null
          year: number
        }
        Update: {
          code?: string
          created_at?: string | null
          created_by?: string | null
          department?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          level?: string
          max_students?: number | null
          prerequisites?: string[] | null
          programme_id?: string | null
          semester?: string
          syllabus_url?: string | null
          title?: string
          updated_at?: string | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "courses_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
          {
            foreignKeyName: "courses_programme_id_fkey"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
        ]
      }
      discussion_replies: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          discussion_id: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          discussion_id?: string | null
          id?: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          discussion_id?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussion_replies_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
          {
            foreignKeyName: "discussion_replies_discussion_id_fkey"
            columns: ["discussion_id"]
            isOneToOne: false
            referencedRelation: "discussions"
            referencedColumns: ["id"]
          },
        ]
      }
      discussions: {
        Row: {
          content: string
          course_id: string | null
          created_at: string | null
          created_by: string | null
          id: string
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          course_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          course_id?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "discussions_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "discussions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
        ]
      }
      exam_answers: {
        Row: {
          answer_files: Json | null
          answer_text: string | null
          answered_at: string | null
          attempt_id: string
          auto_graded: boolean | null
          created_at: string | null
          graded_at: string | null
          graded_by: string | null
          id: string
          is_correct: boolean | null
          manual_feedback: string | null
          points_earned: number | null
          question_id: string
          selected_options: Json | null
          time_spent: number | null
          updated_at: string | null
        }
        Insert: {
          answer_files?: Json | null
          answer_text?: string | null
          answered_at?: string | null
          attempt_id: string
          auto_graded?: boolean | null
          created_at?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          is_correct?: boolean | null
          manual_feedback?: string | null
          points_earned?: number | null
          question_id: string
          selected_options?: Json | null
          time_spent?: number | null
          updated_at?: string | null
        }
        Update: {
          answer_files?: Json | null
          answer_text?: string | null
          answered_at?: string | null
          attempt_id?: string
          auto_graded?: boolean | null
          created_at?: string | null
          graded_at?: string | null
          graded_by?: string | null
          id?: string
          is_correct?: boolean | null
          manual_feedback?: string | null
          points_earned?: number | null
          question_id?: string
          selected_options?: Json | null
          time_spent?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_answers_attempt_id_fkey"
            columns: ["attempt_id"]
            isOneToOne: false
            referencedRelation: "exam_attempts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_answers_graded_by_fkey"
            columns: ["graded_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
          {
            foreignKeyName: "exam_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "exam_questions"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_attempts: {
        Row: {
          assignment_id: string
          attempt_number: number
          auto_submitted: boolean | null
          browser_lock_enabled: boolean | null
          created_at: string | null
          id: string
          ip_address: unknown | null
          is_completed: boolean | null
          started_at: string | null
          status: string | null
          submitted_at: string | null
          suspicious_activity: Json | null
          tab_switches: number | null
          time_remaining: number | null
          updated_at: string | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          assignment_id: string
          attempt_number?: number
          auto_submitted?: boolean | null
          browser_lock_enabled?: boolean | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_completed?: boolean | null
          started_at?: string | null
          status?: string | null
          submitted_at?: string | null
          suspicious_activity?: Json | null
          tab_switches?: number | null
          time_remaining?: number | null
          updated_at?: string | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          assignment_id?: string
          attempt_number?: number
          auto_submitted?: boolean | null
          browser_lock_enabled?: boolean | null
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          is_completed?: boolean | null
          started_at?: string | null
          status?: string | null
          submitted_at?: string | null
          suspicious_activity?: Json | null
          tab_switches?: number | null
          time_remaining?: number | null
          updated_at?: string | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "exam_attempts_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "exam_attempts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
        ]
      }
      exam_questions: {
        Row: {
          assignment_id: string
          case_sensitive: boolean | null
          correct_answers: Json | null
          created_at: string | null
          expected_keywords: Json | null
          explanation: string | null
          id: string
          is_required: boolean | null
          max_words: number | null
          options: Json | null
          points: number
          question_order: number
          question_text: string
          question_type: string
          rubric: Json | null
          time_limit: number | null
          updated_at: string | null
        }
        Insert: {
          assignment_id: string
          case_sensitive?: boolean | null
          correct_answers?: Json | null
          created_at?: string | null
          expected_keywords?: Json | null
          explanation?: string | null
          id?: string
          is_required?: boolean | null
          max_words?: number | null
          options?: Json | null
          points?: number
          question_order?: number
          question_text: string
          question_type: string
          rubric?: Json | null
          time_limit?: number | null
          updated_at?: string | null
        }
        Update: {
          assignment_id?: string
          case_sensitive?: boolean | null
          correct_answers?: Json | null
          created_at?: string | null
          expected_keywords?: Json | null
          explanation?: string | null
          id?: string
          is_required?: boolean | null
          max_words?: number | null
          options?: Json | null
          points?: number
          question_order?: number
          question_text?: string
          question_type?: string
          rubric?: Json | null
          time_limit?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_questions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      exam_templates: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          difficulty_level: string | null
          estimated_duration: number | null
          id: string
          is_public: boolean | null
          question_structure: Json | null
          subject_area: string | null
          template_name: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          difficulty_level?: string | null
          estimated_duration?: number | null
          id?: string
          is_public?: boolean | null
          question_structure?: Json | null
          subject_area?: string | null
          template_name: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          difficulty_level?: string | null
          estimated_duration?: number | null
          id?: string
          is_public?: boolean | null
          question_structure?: Json | null
          subject_area?: string | null
          template_name?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "exam_templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
        ]
      }
      messages: {
        Row: {
          attachments: string[] | null
          content: string
          conversation_id: string
          created_at: string | null
          id: string
          is_read: boolean | null
          message_type: string | null
          read_at: string | null
          reply_to: string | null
          sender_id: string
          updated_at: string | null
        }
        Insert: {
          attachments?: string[] | null
          content: string
          conversation_id: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          read_at?: string | null
          reply_to?: string | null
          sender_id: string
          updated_at?: string | null
        }
        Update: {
          attachments?: string[] | null
          content?: string
          conversation_id?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message_type?: string | null
          read_at?: string | null
          reply_to?: string | null
          sender_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_fkey"
            columns: ["reply_to"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          priority: string | null
          related_id: string | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          priority?: string | null
          related_id?: string | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          priority?: string | null
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
        ]
      }
      payment_history: {
        Row: {
          account_number: string | null
          amount: number
          created_at: string | null
          description: string | null
          id: string
          payment_method: string
          phone_number: string | null
          processed_at: string | null
          reference_number: string
          status: string | null
          student_id: string
          transaction_id: string | null
          updated_at: string | null
        }
        Insert: {
          account_number?: string | null
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          payment_method: string
          phone_number?: string | null
          processed_at?: string | null
          reference_number: string
          status?: string | null
          student_id: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Update: {
          account_number?: string | null
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          payment_method?: string
          phone_number?: string | null
          processed_at?: string | null
          reference_number?: string
          status?: string | null
          student_id?: string
          transaction_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_history_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          bio: string | null
          created_at: string | null
          date_of_birth: string | null
          gender: string | null
          id: string
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          gender?: string | null
          id: string
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          bio?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          gender?: string | null
          id?: string
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      programmes: {
        Row: {
          code: string
          created_at: string | null
          department: string | null
          description: string | null
          duration_years: number
          faculty: string
          id: string
          is_active: boolean | null
          level: string
          title: string
          total_units: number
          updated_at: string | null
        }
        Insert: {
          code: string
          created_at?: string | null
          department?: string | null
          description?: string | null
          duration_years?: number
          faculty: string
          id?: string
          is_active?: boolean | null
          level: string
          title: string
          total_units?: number
          updated_at?: string | null
        }
        Update: {
          code?: string
          created_at?: string | null
          department?: string | null
          description?: string | null
          duration_years?: number
          faculty?: string
          id?: string
          is_active?: boolean | null
          level?: string
          title?: string
          total_units?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      session_materials: {
        Row: {
          available_from: string | null
          available_until: string | null
          created_at: string | null
          id: string
          is_required: boolean | null
          material_id: string
          session_id: string
        }
        Insert: {
          available_from?: string | null
          available_until?: string | null
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          material_id: string
          session_id: string
        }
        Update: {
          available_from?: string | null
          available_until?: string | null
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          material_id?: string
          session_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_materials_material_id_fkey"
            columns: ["material_id"]
            isOneToOne: false
            referencedRelation: "course_materials"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_materials_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "class_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      student_fees: {
        Row: {
          academic_year: string
          amount_paid: number
          created_at: string | null
          due_date: string | null
          id: string
          is_active: boolean | null
          registration_threshold: number | null
          semester: string
          student_id: string
          total_fees: number
          updated_at: string | null
        }
        Insert: {
          academic_year: string
          amount_paid?: number
          created_at?: string | null
          due_date?: string | null
          id?: string
          is_active?: boolean | null
          registration_threshold?: number | null
          semester: string
          student_id: string
          total_fees?: number
          updated_at?: string | null
        }
        Update: {
          academic_year?: string
          amount_paid?: number
          created_at?: string | null
          due_date?: string | null
          id?: string
          is_active?: boolean | null
          registration_threshold?: number | null
          semester?: string
          student_id?: string
          total_fees?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "student_fees_student_id_fkey"
            columns: ["student_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
        ]
      }
      system_settings: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_public: boolean | null
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key: string
          setting_type: string
          setting_value: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          setting_key?: string
          setting_type?: string
          setting_value?: Json
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "system_settings_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
          {
            foreignKeyName: "system_settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["auth_id"]
          },
        ]
      }
      users: {
        Row: {
          address: string | null
          auth_id: string
          avatar_url: string | null
          created_at: string | null
          current_semester: number | null
          date_of_birth: string | null
          department: string | null
          email: string
          emergency_contact: Json | null
          faculty: string | null
          full_name: string
          id: string
          is_active: boolean | null
          phone: string | null
          programme_id: string | null
          role: string
          student_id: string | null
          updated_at: string | null
          year_of_study: number | null
        }
        Insert: {
          address?: string | null
          auth_id: string
          avatar_url?: string | null
          created_at?: string | null
          current_semester?: number | null
          date_of_birth?: string | null
          department?: string | null
          email: string
          emergency_contact?: Json | null
          faculty?: string | null
          full_name: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          programme_id?: string | null
          role: string
          student_id?: string | null
          updated_at?: string | null
          year_of_study?: number | null
        }
        Update: {
          address?: string | null
          auth_id?: string
          avatar_url?: string | null
          created_at?: string | null
          current_semester?: number | null
          date_of_birth?: string | null
          department?: string | null
          email?: string
          emergency_contact?: Json | null
          faculty?: string | null
          full_name?: string
          id?: string
          is_active?: boolean | null
          phone?: string | null
          programme_id?: string | null
          role?: string
          student_id?: string | null
          updated_at?: string | null
          year_of_study?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "fk_users_programme"
            columns: ["programme_id"]
            isOneToOne: false
            referencedRelation: "programmes"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      calculate_course_average: {
        Args: { course_id: string }
        Returns: number
      }
      get_assignment_completion_stats: {
        Args: { course_id_param: string }
        Returns: Json
      }
      get_course_statistics: {
        Args: { course_id: string }
        Returns: Json
      }
      get_student_progress: {
        Args: { student_id: string; course_id: string }
        Returns: Json
      }
      get_student_progress_all_courses: {
        Args: { student_id_param: string }
        Returns: Json
      }
      get_system_statistics: {
        Args: Record<PropertyKey, never>
        Returns: Json
      }
      is_submission_late: {
        Args: { submission_id: string }
        Returns: boolean
      }
      is_teacher_for_student: {
        Args: { teacher_auth_id: string; student_id_param: string }
        Returns: boolean
      }
      track_material_view: {
        Args: { p_user_id: string; p_material_id: string }
        Returns: undefined
      }
      user_has_course_access: {
        Args: { user_auth_id: string; course_id_param: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
