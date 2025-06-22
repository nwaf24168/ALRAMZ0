import { createClient } from "@supabase/supabase-js";

const supabaseUrl = "https://gfzeqvxsmeeehvqixidp.supabase.co";
const supabaseKey =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmemVxdnhzbWVlZWh2cWl4aWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NjYzNjMsImV4cCI6MjA2NDM0MjM2M30.ubs51a9Vkx2FQ0UGqk2W5TXuzDs_xwEy4DXAuZ2AZ_A";

export const supabase = createClient(supabaseUrl, supabaseKey);

// تعريف أنواع البيانات
export interface MetricRecord {
  id?: number;
  period: "weekly" | "yearly";
  metric_index: number;
  title: string;
  value: string;
  target: string;
  change: number;
  is_positive: boolean;
  reached_target: boolean;
  is_lower_better: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CustomerServiceRecord {
  id?: number;
  period: "weekly" | "yearly";
  complaints: number;
  contact_requests: number;
  maintenance_requests: number;
  inquiries: number;
  office_interested: number;
  projects_interested: number;
  customers_interested: number;
  total: number;
  general_inquiries: number;
  document_requests: number;
  deed_inquiries: number;
  apartment_rentals: number;
  sold_projects: number;
  cancelled_maintenance: number;
  resolved_maintenance: number;
  in_progress_maintenance: number;
  created_at?: string;
  updated_at?: string;
}

export interface SatisfactionRecord {
  id?: number;
  period: "weekly" | "yearly";
  category: "serviceQuality" | "closureTime" | "firstTimeResolution";
  very_happy: number;
  happy: number;
  neutral: number;
  unhappy: number;
  very_unhappy: number;
  created_at?: string;
  updated_at?: string;
}

export interface CommentRecord {
  id?: number;
  period: "weekly" | "yearly";
  text: string;
  username: string;
  created_at?: string;
}

export interface ComplaintRecord {
  id?: number;
  complaint_id: string;
  date: string;
  customer_name: string;
  project: string;
  unit_number?: string;
  source: string;
  status: string;
  description: string;
  action?: string;
  duration?: number;
  created_by: string;
  updated_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ComplaintUpdateRecord {
  id?: number;
  complaint_id: string;
  field_name: string;
  old_value?: string;
  new_value?: string;
  updated_by: string;
  created_at?: string;
}

export interface UserRecord {
  id?: number;
  username: string;
  password: string;
  role: string;
}

export interface BookingRecord {
  id?: number;
  booking_id: string;
  booking_date: string;
  customer_name: string;
  project: string;
  building: string;
  unit: string;
  payment_method: string;
  sale_type: string;
  unit_value: number;
  transfer_date: string;
  sales_employee: string;
  construction_end_date?: string;
  final_receipt_date?: string;
  electricity_transfer_date?: string;
  water_transfer_date?: string;
  delivery_date?: string;
  status: string;
  status_sales_filled: boolean;
  status_projects_filled: boolean;
  status_customer_filled: boolean;
  is_evaluated: boolean;
  evaluation_score?: number;
  created_at?: string;
  updated_at?: string;
  created_by: string;
  updated_by?: string;
}

// دالة فحص الاتصال مع Supabase
export async function testSupabaseConnection(): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from("metrics")
      .select("count")
      .limit(1);

    if (error) {
      console.error("خطأ في الاتصال مع Supabase:", error);
      return false;
    }

    console.log("تم الاتصال بنجاح مع Supabase");
    return true;
  } catch (error) {
    console.error("خطأ في اختبار الاتصال:", error);
    return false;
  }
}