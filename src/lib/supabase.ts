
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://gfzeqvxsmeeehvqixidp.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdmemVxdnhzbWVlZWh2cWl4aWRwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDg3NjYzNjMsImV4cCI6MjA2NDM0MjM2M30.ubs51a9Vkx2FQ0UGqk2W5TXuzDs_xwEy4DXAuZ2AZ_A'

export const supabase = createClient(supabaseUrl, supabaseKey)

// تعريف أنواع البيانات
export interface MetricRecord {
  id?: number
  period: 'weekly' | 'yearly'
  metric_index: number
  title: string
  value: string
  target: string
  change: number
  is_positive: boolean
  reached_target: boolean
  is_lower_better: boolean
  created_at?: string
  updated_at?: string
}

export interface CustomerServiceRecord {
  id?: number
  period: 'weekly' | 'yearly'
  complaints: number
  contact_requests: number
  maintenance_requests: number
  inquiries: number
  office_interested: number
  projects_interested: number
  customers_interested: number
  total: number
  general_inquiries: number
  document_requests: number
  deed_inquiries: number
  apartment_rentals: number
  sold_projects: number
  cancelled_maintenance: number
  resolved_maintenance: number
  in_progress_maintenance: number
  created_at?: string
  updated_at?: string
}

export interface SatisfactionRecord {
  id?: number
  period: 'weekly' | 'yearly'
  category: 'serviceQuality' | 'closureTime' | 'firstTimeResolution'
  very_happy: number
  happy: number
  neutral: number
  unhappy: number
  very_unhappy: number
  created_at?: string
  updated_at?: string
}

export interface CommentRecord {
  id?: number
  period: 'weekly' | 'yearly'
  text: string
  username: string
  created_at?: string
}
