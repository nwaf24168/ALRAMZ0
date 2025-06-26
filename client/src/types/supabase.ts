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
      bookings: {
        Row: {
          booking_date: string
          booking_id: string
          building: string
          construction_end_date: string | null
          created_at: string | null
          customer_name: string
          delivery_date: string | null
          electricity_transfer_date: string | null
          evaluation_score: number | null
          final_receipt_date: string | null
          id: number
          is_evaluated: boolean | null
          payment_method: string
          project: string
          sale_type: string
          sales_employee: string
          status: string
          status_customer_filled: boolean | null
          status_projects_filled: boolean | null
          status_sales_filled: boolean | null
          transfer_date: string | null
          unit: string
          unit_value: number
          updated_at: string | null
          water_transfer_date: string | null
        }
        Insert: {
          booking_date: string
          booking_id: string
          building: string
          construction_end_date?: string | null
          created_at?: string | null
          customer_name: string
          delivery_date?: string | null
          electricity_transfer_date?: string | null
          evaluation_score?: number | null
          final_receipt_date?: string | null
          id?: number
          is_evaluated?: boolean | null
          payment_method: string
          project: string
          sale_type: string
          sales_employee: string
          status: string
          status_customer_filled?: boolean | null
          status_projects_filled?: boolean | null
          status_sales_filled?: boolean | null
          transfer_date?: string | null
          unit: string
          unit_value: number
          updated_at?: string | null
          water_transfer_date?: string | null
        }
        Update: {
          booking_date?: string
          booking_id?: string
          building?: string
          construction_end_date?: string | null
          created_at?: string | null
          customer_name?: string
          delivery_date?: string | null
          electricity_transfer_date?: string | null
          evaluation_score?: number | null
          final_receipt_date?: string | null
          id?: number
          is_evaluated?: boolean | null
          payment_method?: string
          project?: string
          sale_type?: string
          sales_employee?: string
          status?: string
          status_customer_filled?: boolean | null
          status_projects_filled?: boolean | null
          status_sales_filled?: boolean | null
          transfer_date?: string | null
          unit?: string
          unit_value?: number
          updated_at?: string | null
          water_transfer_date?: string | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          created_at: string | null
          id: number
          period: string
          text: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          period: string
          text: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: number
          period?: string
          text?: string
          username?: string
        }
        Relationships: []
      }
      complaint_updates: {
        Row: {
          complaint_id: string | null
          field: string
          id: string
          new_value: string | null
          old_value: string | null
          updated_at: string | null
          updated_by: string
        }
        Insert: {
          complaint_id?: string | null
          field: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          updated_at?: string | null
          updated_by: string
        }
        Update: {
          complaint_id?: string | null
          field?: string
          id?: string
          new_value?: string | null
          old_value?: string | null
          updated_at?: string | null
          updated_by?: string
        }
        Relationships: [
          {
            foreignKeyName: "complaint_updates_complaint_id_fkey"
            columns: ["complaint_id"]
            isOneToOne: false
            referencedRelation: "complaints"
            referencedColumns: ["id"]
          },
        ]
      }
      complaints: {
        Row: {
          action: string | null
          complaint_id: string
          created_at: string | null
          created_by: string
          customer_name: string
          date: string
          description: string
          duration: number | null
          expected_closure_time: string | null
          id: string
          maintenance_delivery_action: string | null
          priority: string | null
          project: string
          request_number: string | null
          source: string
          status: string
          unit_number: string | null
          updated_at: string | null
          updated_by: string | null
        }
        Insert: {
          action?: string | null
          complaint_id: string
          created_at?: string | null
          created_by: string
          customer_name: string
          date: string
          description: string
          duration?: number | null
          expected_closure_time?: string | null
          id?: string
          maintenance_delivery_action?: string | null
          priority?: string | null
          project: string
          request_number?: string | null
          source: string
          status: string
          unit_number?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Update: {
          action?: string | null
          complaint_id?: string
          created_at?: string | null
          created_by?: string
          customer_name?: string
          date?: string
          description?: string
          duration?: number | null
          expected_closure_time?: string | null
          id?: string
          maintenance_delivery_action?: string | null
          priority?: string | null
          project?: string
          request_number?: string | null
          source?: string
          status?: string
          unit_number?: string | null
          updated_at?: string | null
          updated_by?: string | null
        }
        Relationships: []
      }
      customer_service: {
        Row: {
          apartment_rentals: number
          cancelled_maintenance: number
          complaints: number
          contact_requests: number
          created_at: string | null
          customers_interested: number
          deed_inquiries: number
          document_requests: number
          general_inquiries: number
          id: number
          in_progress_maintenance: number
          inquiries: number
          maintenance_requests: number
          office_interested: number
          period: string
          projects_interested: number
          resolved_maintenance: number
          sold_projects: number
          total: number
          updated_at: string | null
        }
        Insert: {
          apartment_rentals?: number
          cancelled_maintenance?: number
          complaints?: number
          contact_requests?: number
          created_at?: string | null
          customers_interested?: number
          deed_inquiries?: number
          document_requests?: number
          general_inquiries?: number
          id?: number
          in_progress_maintenance?: number
          inquiries?: number
          maintenance_requests?: number
          office_interested?: number
          period: string
          projects_interested?: number
          resolved_maintenance?: number
          sold_projects?: number
          total?: number
          updated_at?: string | null
        }
        Update: {
          apartment_rentals?: number
          cancelled_maintenance?: number
          complaints?: number
          contact_requests?: number
          created_at?: string | null
          customers_interested?: number
          deed_inquiries?: number
          document_requests?: number
          general_inquiries?: number
          id?: number
          in_progress_maintenance?: number
          inquiries?: number
          maintenance_requests?: number
          office_interested?: number
          period?: string
          projects_interested?: number
          resolved_maintenance?: number
          sold_projects?: number
          total?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      metrics: {
        Row: {
          change: number
          created_at: string | null
          id: number
          is_lower_better: boolean
          is_positive: boolean
          metric_index: number
          period: string
          reached_target: boolean
          target: string
          title: string
          updated_at: string | null
          value: string
        }
        Insert: {
          change?: number
          created_at?: string | null
          id?: number
          is_lower_better?: boolean
          is_positive?: boolean
          metric_index: number
          period: string
          reached_target?: boolean
          target: string
          title: string
          updated_at?: string | null
          value: string
        }
        Update: {
          change?: number
          created_at?: string | null
          id?: number
          is_lower_better?: boolean
          is_positive?: boolean
          metric_index?: number
          period?: string
          reached_target?: boolean
          target?: string
          title?: string
          updated_at?: string | null
          value?: string
        }
        Relationships: []
      }
      satisfaction: {
        Row: {
          category: string
          created_at: string | null
          happy: number
          id: number
          neutral: number
          period: string
          unhappy: number
          updated_at: string | null
          very_happy: number
          very_unhappy: number
        }
        Insert: {
          category: string
          created_at?: string | null
          happy?: number
          id?: number
          neutral?: number
          period: string
          unhappy?: number
          updated_at?: string | null
          very_happy?: number
          very_unhappy?: number
        }
        Update: {
          category?: string
          created_at?: string | null
          happy?: number
          id?: number
          neutral?: number
          period?: string
          unhappy?: number
          updated_at?: string | null
          very_happy?: number
          very_unhappy?: number
        }
        Relationships: []
      }
      users: {
        Row: {
          created_at: string | null
          id: number
          password: string
          role: string
          updated_at: string | null
          user_id: string
          username: string
        }
        Insert: {
          created_at?: string | null
          id?: number
          password: string
          role: string
          updated_at?: string | null
          user_id: string
          username: string
        }
        Update: {
          created_at?: string | null
          id?: number
          password?: string
          role?: string
          updated_at?: string | null
          user_id?: string
          username?: string
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