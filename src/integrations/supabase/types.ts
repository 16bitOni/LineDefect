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
      defects: {
        Row: {
          created_at: string
          created_by: string | null
          defect_category: string
          defect_notes: string | null
          id: string
          image_url: string | null
          model_name: string
          report_id: string
          status: Database["public"]["Enums"]["defect_status"]
          targeted_zones: Database["public"]["Enums"]["zone_type"][]
          updated_at: string
          vehicle_frame_no: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          defect_category: string
          defect_notes?: string | null
          id?: string
          image_url?: string | null
          model_name: string
          report_id: string
          status?: Database["public"]["Enums"]["defect_status"]
          targeted_zones: Database["public"]["Enums"]["zone_type"][]
          updated_at?: string
          vehicle_frame_no: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          defect_category?: string
          defect_notes?: string | null
          id?: string
          image_url?: string | null
          model_name?: string
          report_id?: string
          status?: Database["public"]["Enums"]["defect_status"]
          targeted_zones?: Database["public"]["Enums"]["zone_type"][]
          updated_at?: string
          vehicle_frame_no?: string
        }
        Relationships: []
      }
      manager_analysis: {
        Row: {
          defect_id: string
          id: string
          machine: string | null
          manager_name: string | null
          manpower: string | null
          material: string | null
          method: string | null
          updated_at: string
        }
        Insert: {
          defect_id: string
          id?: string
          machine?: string | null
          manager_name?: string | null
          manpower?: string | null
          material?: string | null
          method?: string | null
          updated_at?: string
        }
        Update: {
          defect_id?: string
          id?: string
          machine?: string | null
          manager_name?: string | null
          manpower?: string | null
          material?: string | null
          method?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "manager_analysis_defect_id_fkey"
            columns: ["defect_id"]
            isOneToOne: true
            referencedRelation: "defects"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
          user_id: string
          zone: Database["public"]["Enums"]["zone_type"] | null
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
          user_id: string
          zone?: Database["public"]["Enums"]["zone_type"] | null
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
          zone?: Database["public"]["Enums"]["zone_type"] | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      zone_responses: {
        Row: {
          action_taken: string | null
          created_at: string
          created_by: string | null
          defect_id: string
          id: string
          involved: boolean
          manpower_ein: string | null
          manpower_name: string | null
          root_cause: string | null
          updated_at: string
          zone: Database["public"]["Enums"]["zone_type"]
        }
        Insert: {
          action_taken?: string | null
          created_at?: string
          created_by?: string | null
          defect_id: string
          id?: string
          involved: boolean
          manpower_ein?: string | null
          manpower_name?: string | null
          root_cause?: string | null
          updated_at?: string
          zone: Database["public"]["Enums"]["zone_type"]
        }
        Update: {
          action_taken?: string | null
          created_at?: string
          created_by?: string | null
          defect_id?: string
          id?: string
          involved?: boolean
          manpower_ein?: string | null
          manpower_name?: string | null
          root_cause?: string | null
          updated_at?: string
          zone?: Database["public"]["Enums"]["zone_type"]
        }
        Relationships: [
          {
            foreignKeyName: "zone_responses_defect_id_fkey"
            columns: ["defect_id"]
            isOneToOne: false
            referencedRelation: "defects"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_user_zone: {
        Args: { _user_id: string }
        Returns: Database["public"]["Enums"]["zone_type"]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "final_inspector" | "group_leader" | "manager"
      defect_status: "OPEN" | "CLOSED"
      zone_type: "L1" | "L2" | "L3" | "L4" | "R0" | "R1" | "R2" | "R3" | "R4"
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
      app_role: ["final_inspector", "group_leader", "manager"],
      defect_status: ["OPEN", "CLOSED"],
      zone_type: ["L1", "L2", "L3", "L4", "R0", "R1", "R2", "R3", "R4"],
    },
  },
} as const
