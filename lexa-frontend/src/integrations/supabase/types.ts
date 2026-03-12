export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          conversation_id: string | null
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          model_used: string | null
          response_time_ms: number | null
          tokens_used: number | null
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          model_used?: string | null
          response_time_ms?: number | null
          tokens_used?: number | null
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          model_used?: string | null
          response_time_ms?: number | null
          tokens_used?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      artifacts: {
        Row: {
          artifact_type: string
          content: string
          conversation_id: string | null
          created_at: string
          id: string
          is_pinned: boolean
          language: string | null
          metadata: Json | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          artifact_type?: string
          content: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean
          language?: string | null
          metadata?: Json | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          artifact_type?: string
          content?: string
          conversation_id?: string | null
          created_at?: string
          id?: string
          is_pinned?: boolean
          language?: string | null
          metadata?: Json | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "artifacts_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_shares: {
        Row: {
          conversation_id: string
          created_at: string
          expires_at: string | null
          id: string
          permission: string
          shared_by: string
          shared_with_user_id: string | null
          shared_with_workspace_id: string | null
        }
        Insert: {
          conversation_id: string
          created_at?: string
          expires_at?: string | null
          id?: string
          permission?: string
          shared_by: string
          shared_with_user_id?: string | null
          shared_with_workspace_id?: string | null
        }
        Update: {
          conversation_id?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          permission?: string
          shared_by?: string
          shared_with_user_id?: string | null
          shared_with_workspace_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "conversation_shares_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_shares_shared_with_workspace_id_fkey"
            columns: ["shared_with_workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          model: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          model?: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          model?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_instructions: {
        Row: {
          content: string
          created_at: string
          id: string
          is_active: boolean
          name: string
          priority: number
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          priority?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          priority?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      image_generations: {
        Row: {
          conversation_id: string | null
          created_at: string
          error_message: string | null
          file_path: string | null
          id: string
          image_url: string | null
          model: string
          prompt: string
          quality: string
          revised_prompt: string | null
          size: string
          status: string
          style: string
          user_id: string
        }
        Insert: {
          conversation_id?: string | null
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          id?: string
          image_url?: string | null
          model?: string
          prompt: string
          quality?: string
          revised_prompt?: string | null
          size?: string
          status?: string
          style?: string
          user_id: string
        }
        Update: {
          conversation_id?: string | null
          created_at?: string
          error_message?: string | null
          file_path?: string | null
          id?: string
          image_url?: string | null
          model?: string
          prompt?: string
          quality?: string
          revised_prompt?: string | null
          size?: string
          status?: string
          style?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "image_generations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      knowledge_documents: {
        Row: {
          content_text: string | null
          created_at: string
          description: string | null
          embedding_status: string
          file_path: string
          file_size: number
          file_type: string
          id: string
          metadata: Json | null
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content_text?: string | null
          created_at?: string
          description?: string | null
          embedding_status?: string
          file_path: string
          file_size: number
          file_type: string
          id?: string
          metadata?: Json | null
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content_text?: string | null
          created_at?: string
          description?: string | null
          embedding_status?: string
          file_path?: string
          file_size?: number
          file_type?: string
          id?: string
          metadata?: Json | null
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      learning_profiles: {
        Row: {
          communication_preferences: Json | null
          created_at: string
          expertise_levels: Json | null
          id: string
          interaction_patterns: Json | null
          last_analyzed_at: string | null
          topics_of_interest: Json | null
          total_conversations: number
          total_messages: number
          updated_at: string
          user_id: string
          writing_style: Json | null
        }
        Insert: {
          communication_preferences?: Json | null
          created_at?: string
          expertise_levels?: Json | null
          id?: string
          interaction_patterns?: Json | null
          last_analyzed_at?: string | null
          topics_of_interest?: Json | null
          total_conversations?: number
          total_messages?: number
          updated_at?: string
          user_id: string
          writing_style?: Json | null
        }
        Update: {
          communication_preferences?: Json | null
          created_at?: string
          expertise_levels?: Json | null
          id?: string
          interaction_patterns?: Json | null
          last_analyzed_at?: string | null
          topics_of_interest?: Json | null
          total_conversations?: number
          total_messages?: number
          updated_at?: string
          user_id?: string
          writing_style?: Json | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachments: Json | null
          citations: Json | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          model: string | null
          role: string
        }
        Insert: {
          attachments?: Json | null
          citations?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          model?: string | null
          role: string
        }
        Update: {
          attachments?: Json | null
          citations?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          model?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      productivity_scores: {
        Row: {
          achievements: Json | null
          created_at: string
          efficiency_score: number | null
          engagement_score: number | null
          goal_completion_score: number | null
          id: string
          overall_score: number | null
          score_date: string
          streak_days: number | null
          user_id: string
        }
        Insert: {
          achievements?: Json | null
          created_at?: string
          efficiency_score?: number | null
          engagement_score?: number | null
          goal_completion_score?: number | null
          id?: string
          overall_score?: number | null
          score_date: string
          streak_days?: number | null
          user_id: string
        }
        Update: {
          achievements?: Json | null
          created_at?: string
          efficiency_score?: number | null
          engagement_score?: number | null
          goal_completion_score?: number | null
          id?: string
          overall_score?: number | null
          score_date?: string
          streak_days?: number | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string | null
          id: string
          preferred_model: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_model?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string | null
          id?: string
          preferred_model?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      rate_limits: {
        Row: {
          created_at: string
          endpoint: string
          id: string
          last_request: string
          request_count: number
          user_id: string
          window_start: string
        }
        Insert: {
          created_at?: string
          endpoint: string
          id?: string
          last_request?: string
          request_count?: number
          user_id: string
          window_start?: string
        }
        Update: {
          created_at?: string
          endpoint?: string
          id?: string
          last_request?: string
          request_count?: number
          user_id?: string
          window_start?: string
        }
        Relationships: []
      }
      scheduled_tasks: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          last_result: string | null
          last_run_at: string | null
          name: string
          next_run_at: string | null
          prompt: string
          run_count: number
          schedule_day: number | null
          schedule_time: string | null
          schedule_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_result?: string | null
          last_run_at?: string | null
          name: string
          next_run_at?: string | null
          prompt: string
          run_count?: number
          schedule_day?: number | null
          schedule_time?: string | null
          schedule_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          last_result?: string | null
          last_run_at?: string | null
          name?: string
          next_run_at?: string | null
          prompt?: string
          run_count?: number
          schedule_day?: number | null
          schedule_time?: string | null
          schedule_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      smart_templates: {
        Row: {
          category: string
          content: string
          created_at: string
          description: string | null
          icon: string | null
          id: string
          is_favorite: boolean
          name: string
          updated_at: string
          usage_count: number
          user_id: string
          variables: Json | null
        }
        Insert: {
          category?: string
          content: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_favorite?: boolean
          name: string
          updated_at?: string
          usage_count?: number
          user_id: string
          variables?: Json | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          is_favorite?: boolean
          name?: string
          updated_at?: string
          usage_count?: number
          user_id?: string
          variables?: Json | null
        }
        Relationships: []
      }
      usage_statistics: {
        Row: {
          average_response_time_ms: number | null
          created_at: string
          id: string
          models_used: Json | null
          peak_usage_hour: number | null
          period_end: string
          period_start: string
          period_type: string
          sentiment_breakdown: Json | null
          topics_discussed: Json | null
          total_conversations: number | null
          total_messages: number | null
          total_tokens: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          average_response_time_ms?: number | null
          created_at?: string
          id?: string
          models_used?: Json | null
          peak_usage_hour?: number | null
          period_end: string
          period_start: string
          period_type: string
          sentiment_breakdown?: Json | null
          topics_discussed?: Json | null
          total_conversations?: number | null
          total_messages?: number | null
          total_tokens?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          average_response_time_ms?: number | null
          created_at?: string
          id?: string
          models_used?: Json | null
          peak_usage_hour?: number | null
          period_end?: string
          period_start?: string
          period_type?: string
          sentiment_breakdown?: Json | null
          topics_discussed?: Json | null
          total_conversations?: number | null
          total_messages?: number | null
          total_tokens?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_goals: {
        Row: {
          ai_suggestions: Json | null
          created_at: string
          description: string | null
          id: string
          last_check_in: string | null
          milestones: Json | null
          priority: string
          progress: number
          status: string
          target_date: string | null
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          ai_suggestions?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          last_check_in?: string | null
          milestones?: Json | null
          priority?: string
          progress?: number
          status?: string
          target_date?: string | null
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          ai_suggestions?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          last_check_in?: string | null
          milestones?: Json | null
          priority?: string
          progress?: number
          status?: string
          target_date?: string | null
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_memories: {
        Row: {
          content: string
          created_at: string
          id: string
          importance: number
          last_accessed_at: string | null
          memory_type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string
          id?: string
          importance?: number
          last_accessed_at?: string | null
          memory_type?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string
          id?: string
          importance?: number
          last_accessed_at?: string | null
          memory_type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          auto_model_routing: boolean | null
          created_at: string
          custom_instructions_enabled: boolean | null
          id: string
          personality: string
          preferred_complexity: string | null
          preferred_search_model: string | null
          search_cooldown_seconds: number
          updated_at: string
          user_id: string
          voice_enabled: boolean
          voice_id: string | null
        }
        Insert: {
          auto_model_routing?: boolean | null
          created_at?: string
          custom_instructions_enabled?: boolean | null
          id?: string
          personality?: string
          preferred_complexity?: string | null
          preferred_search_model?: string | null
          search_cooldown_seconds?: number
          updated_at?: string
          user_id: string
          voice_enabled?: boolean
          voice_id?: string | null
        }
        Update: {
          auto_model_routing?: boolean | null
          created_at?: string
          custom_instructions_enabled?: boolean | null
          id?: string
          personality?: string
          preferred_complexity?: string | null
          preferred_search_model?: string | null
          search_cooldown_seconds?: number
          updated_at?: string
          user_id?: string
          voice_enabled?: boolean
          voice_id?: string | null
        }
        Relationships: []
      }
      video_generations: {
        Row: {
          aspect_ratio: string
          conversation_id: string | null
          created_at: string
          duration: number
          error_message: string | null
          file_path: string | null
          id: string
          model: string
          prompt: string
          revised_prompt: string | null
          status: string
          thumbnail_url: string | null
          user_id: string
          video_url: string | null
        }
        Insert: {
          aspect_ratio?: string
          conversation_id?: string | null
          created_at?: string
          duration?: number
          error_message?: string | null
          file_path?: string | null
          id?: string
          model?: string
          prompt: string
          revised_prompt?: string | null
          status?: string
          thumbnail_url?: string | null
          user_id: string
          video_url?: string | null
        }
        Update: {
          aspect_ratio?: string
          conversation_id?: string | null
          created_at?: string
          duration?: number
          error_message?: string | null
          file_path?: string | null
          id?: string
          model?: string
          prompt?: string
          revised_prompt?: string | null
          status?: string
          thumbnail_url?: string | null
          user_id?: string
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_generations_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_invites: {
        Row: {
          created_at: string
          email: string
          expires_at: string
          id: string
          invited_by: string
          role: Database["public"]["Enums"]["workspace_role"]
          status: string
          token: string
          workspace_id: string
        }
        Insert: {
          created_at?: string
          email: string
          expires_at?: string
          id?: string
          invited_by: string
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: string
          token?: string
          workspace_id: string
        }
        Update: {
          created_at?: string
          email?: string
          expires_at?: string
          id?: string
          invited_by?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          status?: string
          token?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_invites_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          id: string
          invited_by: string | null
          joined_at: string
          role: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Insert: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id: string
          workspace_id: string
        }
        Update: {
          id?: string
          invited_by?: string | null
          joined_at?: string
          role?: Database["public"]["Enums"]["workspace_role"]
          user_id?: string
          workspace_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_workspace_id_fkey"
            columns: ["workspace_id"]
            isOneToOne: false
            referencedRelation: "workspaces"
            referencedColumns: ["id"]
          },
        ]
      }
      workspaces: {
        Row: {
          avatar_url: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_personal: boolean
          name: string
          settings: Json | null
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_personal?: boolean
          name: string
          settings?: Json | null
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_personal?: boolean
          name?: string
          settings?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_conversation: {
        Args: { p_conversation_id: string; p_user_id: string }
        Returns: boolean
      }
      check_rate_limit: {
        Args: {
          p_endpoint: string
          p_max_requests?: number
          p_user_id: string
          p_window_seconds?: number
        }
        Returns: boolean
      }
      get_rate_limit_remaining: {
        Args: {
          p_endpoint: string
          p_max_requests?: number
          p_user_id: string
          p_window_seconds?: number
        }
        Returns: {
          remaining: number
          reset_at: string
        }[]
      }
      get_user_analytics_summary: {
        Args: { p_days?: number; p_user_id: string }
        Returns: {
          avg_messages_per_day: number
          avg_response_time: number
          most_used_model: string
          total_conversations: number
          total_messages: number
          total_tokens_used: number
        }[]
      }
      get_workspace_role: {
        Args: { p_user_id: string; p_workspace_id: string }
        Returns: Database["public"]["Enums"]["workspace_role"]
      }
      is_workspace_member: {
        Args: { p_user_id: string; p_workspace_id: string }
        Returns: boolean
      }
      log_analytics_event: {
        Args: {
          p_conversation_id?: string
          p_event_data?: Json
          p_event_type: string
          p_model_used?: string
          p_response_time_ms?: number
          p_tokens_used?: number
          p_user_id: string
        }
        Returns: string
      }
    }
    Enums: {
      workspace_role: "owner" | "admin" | "member" | "viewer"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      workspace_role: ["owner", "admin", "member", "viewer"],
    },
  },
} as const
