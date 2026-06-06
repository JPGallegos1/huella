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
          contact_id: string | null
          created_at: string
          demographics: Json | null
          external_ref: string | null
          full_name: string | null
          id: string
          location: string | null
          needs: Json
          notes: string | null
          organization_id: string
          status: string
        }
        Insert: {
          contact_id?: string | null
          created_at?: string
          demographics?: Json | null
          external_ref?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          needs?: Json
          notes?: string | null
          organization_id: string
          status?: string
        }
        Update: {
          contact_id?: string | null
          created_at?: string
          demographics?: Json | null
          external_ref?: string | null
          full_name?: string | null
          id?: string
          location?: string | null
          needs?: Json
          notes?: string | null
          organization_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "beneficiaries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaign_needs: {
        Row: {
          campaign_id: string
          created_at: string
          id: string
          item_name: string
          organization_id: string
          priority: string
          quantity_needed: number | null
          quantity_received: number
          status: string
        }
        Insert: {
          campaign_id: string
          created_at?: string
          id?: string
          item_name: string
          organization_id: string
          priority?: string
          quantity_needed?: number | null
          quantity_received?: number
          status?: string
        }
        Update: {
          campaign_id?: string
          created_at?: string
          id?: string
          item_name?: string
          organization_id?: string
          priority?: string
          quantity_needed?: number | null
          quantity_received?: number
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_needs_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_needs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      campaigns: {
        Row: {
          campaign_type: string
          created_at: string
          currency: string
          current_amount: number
          description: string | null
          ends_at: string | null
          goal_amount: number | null
          id: string
          metadata: Json
          name: string
          organization_id: string
          starts_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          campaign_type: string
          created_at?: string
          currency?: string
          current_amount?: number
          description?: string | null
          ends_at?: string | null
          goal_amount?: number | null
          id?: string
          metadata?: Json
          name: string
          organization_id: string
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          campaign_type?: string
          created_at?: string
          currency?: string
          current_amount?: number
          description?: string | null
          ends_at?: string | null
          goal_amount?: number | null
          id?: string
          metadata?: Json
          name?: string
          organization_id?: string
          starts_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaigns_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      contacts: {
        Row: {
          created_at: string
          email: string | null
          external_id: string | null
          id: string
          metadata: Json
          name: string | null
          organization_id: string
          phone: string
          updated_at: string
          wa_id: string | null
        }
        Insert: {
          created_at?: string
          email?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json
          name?: string | null
          organization_id: string
          phone: string
          updated_at?: string
          wa_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string | null
          external_id?: string | null
          id?: string
          metadata?: Json
          name?: string | null
          organization_id?: string
          phone?: string
          updated_at?: string
          wa_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contacts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_history: {
        Row: {
          contact_id: string | null
          content: string
          conversation_ref: string | null
          created_at: string
          id: string
          intent: string | null
          metadata: Json
          organization_id: string
          role: string
        }
        Insert: {
          contact_id?: string | null
          content: string
          conversation_ref?: string | null
          created_at?: string
          id?: string
          intent?: string | null
          metadata?: Json
          organization_id: string
          role: string
        }
        Update: {
          contact_id?: string | null
          content?: string
          conversation_ref?: string | null
          created_at?: string
          id?: string
          intent?: string | null
          metadata?: Json
          organization_id?: string
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_history_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversation_history_organization_id_fkey"
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
      donations: {
        Row: {
          amount: number | null
          campaign_id: string | null
          contact_id: string | null
          created_at: string
          currency: string
          description: string | null
          donation_type: string
          donor_id: string | null
          id: string
          items: Json
          metadata: Json
          organization_id: string
          payment_link: string | null
          raw_event_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          donation_type: string
          donor_id?: string | null
          id?: string
          items?: Json
          metadata?: Json
          organization_id: string
          payment_link?: string | null
          raw_event_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          campaign_id?: string | null
          contact_id?: string | null
          created_at?: string
          currency?: string
          description?: string | null
          donation_type?: string
          donor_id?: string | null
          id?: string
          items?: Json
          metadata?: Json
          organization_id?: string
          payment_link?: string | null
          raw_event_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_raw_event_id_fkey"
            columns: ["raw_event_id"]
            isOneToOne: false
            referencedRelation: "raw_events"
            referencedColumns: ["id"]
          },
        ]
      }
      donors: {
        Row: {
          capacity: Json
          contact_id: string | null
          created_at: string
          donor_type: string | null
          id: string
          metadata: Json
          organization_id: string
          status: string
          updated_at: string
        }
        Insert: {
          capacity?: Json
          contact_id?: string | null
          created_at?: string
          donor_type?: string | null
          id?: string
          metadata?: Json
          organization_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          capacity?: Json
          contact_id?: string | null
          created_at?: string
          donor_type?: string | null
          id?: string
          metadata?: Json
          organization_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donors_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      matches: {
        Row: {
          beneficiary_id: string | null
          created_at: string
          donation_id: string | null
          donor_id: string | null
          id: string
          match_score: number | null
          notes: string | null
          organization_id: string
          status: string
          updated_at: string
        }
        Insert: {
          beneficiary_id?: string | null
          created_at?: string
          donation_id?: string | null
          donor_id?: string | null
          id?: string
          match_score?: number | null
          notes?: string | null
          organization_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          beneficiary_id?: string | null
          created_at?: string
          donation_id?: string | null
          donor_id?: string | null
          id?: string
          match_score?: number | null
          notes?: string | null
          organization_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "matches_beneficiary_id_fkey"
            columns: ["beneficiary_id"]
            isOneToOne: false
            referencedRelation: "beneficiaries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_donation_id_fkey"
            columns: ["donation_id"]
            isOneToOne: false
            referencedRelation: "donations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "donors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "matches_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      members: {
        Row: {
          auth_user_id: string | null
          contact_id: string | null
          created_at: string
          full_name: string | null
          id: string
          organization_id: string
          phone: string | null
          role: string | null
        }
        Insert: {
          auth_user_id?: string | null
          contact_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          organization_id: string
          phone?: string | null
          role?: string | null
        }
        Update: {
          auth_user_id?: string | null
          contact_id?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          organization_id?: string
          phone?: string | null
          role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "members_contact_id_fkey"
            columns: ["contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
            referencedColumns: ["id"]
          },
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
          sender_contact_id: string | null
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
          sender_contact_id?: string | null
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
          sender_contact_id?: string | null
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
            foreignKeyName: "raw_events_sender_contact_id_fkey"
            columns: ["sender_contact_id"]
            isOneToOne: false
            referencedRelation: "contacts"
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
