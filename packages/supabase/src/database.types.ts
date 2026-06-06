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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      activities: {
        Row: {
          attendees_count: number | null
          created_at: string
          id: string
          is_deferred: boolean
          location: string | null
          occurred_at: string | null
          organization_id: string
          program_id: string | null
          qualitative_notes: string | null
          raw_event_id: string | null
          status: string
          title: string | null
          volunteers_count: number | null
        }
        Insert: {
          attendees_count?: number | null
          created_at?: string
          id?: string
          is_deferred?: boolean
          location?: string | null
          occurred_at?: string | null
          organization_id: string
          program_id?: string | null
          qualitative_notes?: string | null
          raw_event_id?: string | null
          status?: string
          title?: string | null
          volunteers_count?: number | null
        }
        Update: {
          attendees_count?: number | null
          created_at?: string
          id?: string
          is_deferred?: boolean
          location?: string | null
          occurred_at?: string | null
          organization_id?: string
          program_id?: string | null
          qualitative_notes?: string | null
          raw_event_id?: string | null
          status?: string
          title?: string | null
          volunteers_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "activities_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "programs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activities_raw_event_id_fkey"
            columns: ["raw_event_id"]
            isOneToOne: false
            referencedRelation: "raw_events"
            referencedColumns: ["id"]
          },
        ]
      }
      activity_beneficiaries: {
        Row: {
          activity_id: string
          beneficiary_id: string
          id: string
          role_or_status: string | null
        }
        Insert: {
          activity_id: string
          beneficiary_id: string
          id?: string
          role_or_status?: string | null
        }
        Update: {
          activity_id?: string
          beneficiary_id?: string
          id?: string
          role_or_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "activity_beneficiaries_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "activity_beneficiaries_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
        ]
      }
      attachments: {
        Row: {
          activity_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          organization_id: string
          raw_event_id: string | null
          type: string | null
          url: string | null
        }
        Insert: {
          activity_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          organization_id: string
          raw_event_id?: string | null
          type?: string | null
          url?: string | null
        }
        Update: {
          activity_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          organization_id?: string
          raw_event_id?: string | null
          type?: string | null
          url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "attachments_activity_id_fkey"
            columns: ["activity_id"]
            isOneToOne: false
            referencedRelation: "activities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attachments_raw_event_id_fkey"
            columns: ["raw_event_id"]
            isOneToOne: false
            referencedRelation: "raw_events"
            referencedColumns: ["id"]
          },
        ]
      }
      beneficiaries: {
        Row: {
          created_at: string
          demographics: Json | null
          external_ref: string | null
          full_name: string | null
          id: string
          notes: string | null
          organization_id: string
        }
        Insert: {
          created_at?: string
          demographics?: Json | null
          external_ref?: string | null
          full_name?: string | null
          id?: string
          notes?: string | null
          organization_id: string
        }
        Update: {
          created_at?: string
          demographics?: Json | null
          external_ref?: string | null
          full_name?: string | null
          id?: string
          notes?: string | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      decisions: {
        Row: {
          created_at: string
          created_by_member_id: string | null
          decided_at: string | null
          description: string | null
          id: string
          organization_id: string
          raw_event_id: string | null
        }
        Insert: {
          created_at?: string
          created_by_member_id?: string | null
          decided_at?: string | null
          description?: string | null
          id?: string
          organization_id: string
          raw_event_id?: string | null
        }
        Update: {
          created_at?: string
          created_by_member_id?: string | null
          decided_at?: string | null
          description?: string | null
          id?: string
          organization_id?: string
          raw_event_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "decisions_created_by_member_id_fkey"
            columns: ["created_by_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "decisions_raw_event_id_fkey"
            columns: ["raw_event_id"]
            isOneToOne: false
            referencedRelation: "raw_events"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          auth_user_id: string | null
          created_at: string
          full_name: string | null
          id: string
          organization_id: string
          phone: string | null
          role: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          organization_id: string
          phone?: string | null
          role?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          organization_id?: string
          phone?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          created_at: string
          id: string
          name: string
          timezone: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          timezone?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          timezone?: string | null
        }
        Relationships: []
      }
      programs: {
        Row: {
          description: string | null
          id: string
          name: string | null
          organization_id: string
        }
        Insert: {
          description?: string | null
          id?: string
          name?: string | null
          organization_id: string
        }
        Update: {
          description?: string | null
          id?: string
          name?: string | null
          organization_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "programs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      raw_events: {
        Row: {
          channel: string | null
          confidence: number | null
          contains_sensitive_data: boolean
          content_text: string | null
          created_at: string
          detected_intent: string | null
          external_id: string | null
          id: string
          is_deferred: boolean
          media_type: string | null
          media_url: string | null
          occurred_at: string | null
          organization_id: string
          raw_payload: Json | null
          received_at: string | null
          sender_member_id: string | null
          status: string | null
        }
        Insert: {
          channel?: string | null
          confidence?: number | null
          contains_sensitive_data?: boolean
          content_text?: string | null
          created_at?: string
          detected_intent?: string | null
          external_id?: string | null
          id?: string
          is_deferred?: boolean
          media_type?: string | null
          media_url?: string | null
          occurred_at?: string | null
          organization_id: string
          raw_payload?: Json | null
          received_at?: string | null
          sender_member_id?: string | null
          status?: string | null
        }
        Update: {
          channel?: string | null
          confidence?: number | null
          contains_sensitive_data?: boolean
          content_text?: string | null
          created_at?: string
          detected_intent?: string | null
          external_id?: string | null
          id?: string
          is_deferred?: boolean
          media_type?: string | null
          media_url?: string | null
          occurred_at?: string | null
          organization_id?: string
          raw_payload?: Json | null
          received_at?: string | null
          sender_member_id?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "raw_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "raw_events_sender_member_id_fkey"
            columns: ["sender_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          audience: string | null
          content: Json | null
          format: string | null
          generated_at: string
          id: string
          organization_id: string
          period_end: string | null
          period_start: string | null
          title: string | null
        }
        Insert: {
          audience?: string | null
          content?: Json | null
          format?: string | null
          generated_at?: string
          id?: string
          organization_id: string
          period_end?: string | null
          period_start?: string | null
          title?: string | null
        }
        Update: {
          audience?: string | null
          content?: Json | null
          format?: string | null
          generated_at?: string
          id?: string
          organization_id?: string
          period_end?: string | null
          period_start?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      tasks: {
        Row: {
          assignee_member_id: string | null
          created_at: string
          created_by_member_id: string | null
          description: string | null
          due_date: string | null
          id: string
          organization_id: string
          raw_event_id: string | null
          status: string
          task_type: string | null
          title: string | null
        }
        Insert: {
          assignee_member_id?: string | null
          created_at?: string
          created_by_member_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id: string
          raw_event_id?: string | null
          status?: string
          task_type?: string | null
          title?: string | null
        }
        Update: {
          assignee_member_id?: string | null
          created_at?: string
          created_by_member_id?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string
          raw_event_id?: string | null
          status?: string
          task_type?: string | null
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tasks_assignee_member_id_fkey"
            columns: ["assignee_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_created_by_member_id_fkey"
            columns: ["created_by_member_id"]
            isOneToOne: false
            referencedRelation: "members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_raw_event_id_fkey"
            columns: ["raw_event_id"]
            isOneToOne: false
            referencedRelation: "raw_events"
            referencedColumns: ["id"]
          },
        ]
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
    Enums: {},
  },
} as const
