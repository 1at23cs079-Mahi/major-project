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
      interviews: {
        Row: {
          analysis_result: Json | null
          created_at: string | null
          id: string
          resume_id: string | null
          status: string | null
          transcript: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_result?: Json | null
          created_at?: string | null
          id?: string
          resume_id?: string | null
          status?: string | null
          transcript?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_result?: Json | null
          created_at?: string | null
          id?: string
          resume_id?: string | null
          status?: string | null
          transcript?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "interviews_resume_id_fkey"
            columns: ["resume_id"]
            isOneToOne: false
            referencedRelation: "resumes"
            referencedColumns: ["id"]
          },
        ]
      }
      proctoring_flags: {
        Row: {
          id: string
          session_id: string
          flag_type: string
          confidence_score: number | null
          screenshot_url: string | null
          source: string
          details: Json | null
          timestamp: string
        }
        Insert: {
          id?: string
          session_id: string
          flag_type: string
          confidence_score?: number | null
          screenshot_url?: string | null
          source?: string
          details?: Json | null
          timestamp?: string
        }
        Update: {
          id?: string
          session_id?: string
          flag_type?: string
          confidence_score?: number | null
          screenshot_url?: string | null
          source?: string
          details?: Json | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "proctoring_flags_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "proctoring_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      proctoring_sessions: {
        Row: {
          id: string
          interview_id: string
          status: string
          start_time: string
          end_time: string | null
          created_at: string | null
          updated_at: string | null
        }
        Insert: {
          id?: string
          interview_id: string
          status?: string
          start_time?: string
          end_time?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Update: {
          id?: string
          interview_id?: string
          status?: string
          start_time?: string
          end_time?: string | null
          created_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "proctoring_sessions_interview_id_fkey"
            columns: ["interview_id"]
            isOneToOne: false
            referencedRelation: "interviews"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      resume_logs: {
        Row: {
          communication_score: number
          created_at: string | null
          experience_score: number
          file_name: string
          file_size: number | null
          id: string
          overall_score: number | null
          recommendations: Json
          skills_score: number
          summary: string
          user_id: string
        }
        Insert: {
          communication_score: number
          created_at?: string | null
          experience_score: number
          file_name: string
          file_size?: number | null
          id?: string
          overall_score?: number | null
          recommendations: Json
          skills_score: number
          summary: string
          user_id: string
        }
        Update: {
          communication_score?: number
          created_at?: string | null
          experience_score?: number
          file_name?: string
          file_size?: number | null
          id?: string
          overall_score?: number | null
          recommendations?: Json
          skills_score?: number
          summary?: string
          user_id?: string
        }
        Relationships: []
      }
      resumes: {
        Row: {
          analysis_result: Json | null
          created_at: string | null
          experience_level: string | null
          extracted_text: string | null
          file_name: string
          file_url: string
          id: string
          target_role: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          analysis_result?: Json | null
          created_at?: string | null
          experience_level?: string | null
          extracted_text?: string | null
          file_name: string
          file_url: string
          id?: string
          target_role?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          analysis_result?: Json | null
          created_at?: string | null
          experience_level?: string | null
          extracted_text?: string | null
          file_name?: string
          file_url?: string
          id?: string
          target_role?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
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
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof Database
}
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
