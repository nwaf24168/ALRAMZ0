
-- جدول المؤشرات
CREATE TABLE IF NOT EXISTS metrics (
  id SERIAL PRIMARY KEY,
  period VARCHAR(10) NOT NULL CHECK (period IN ('weekly', 'yearly')),
  metric_index INTEGER NOT NULL,
  title VARCHAR(255) NOT NULL,
  value VARCHAR(50) NOT NULL,
  target VARCHAR(50) NOT NULL,
  change DECIMAL(10,2) NOT NULL DEFAULT 0,
  is_positive BOOLEAN NOT NULL DEFAULT false,
  reached_target BOOLEAN NOT NULL DEFAULT false,
  is_lower_better BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(period, metric_index)
);

-- جدول خدمة العملاء
CREATE TABLE IF NOT EXISTS customer_service (
  id SERIAL PRIMARY KEY,
  period VARCHAR(10) NOT NULL CHECK (period IN ('weekly', 'yearly')),
  complaints INTEGER NOT NULL DEFAULT 0,
  contact_requests INTEGER NOT NULL DEFAULT 0,
  maintenance_requests INTEGER NOT NULL DEFAULT 0,
  inquiries INTEGER NOT NULL DEFAULT 0,
  office_interested INTEGER NOT NULL DEFAULT 0,
  projects_interested INTEGER NOT NULL DEFAULT 0,
  customers_interested INTEGER NOT NULL DEFAULT 0,
  total INTEGER NOT NULL DEFAULT 0,
  general_inquiries INTEGER NOT NULL DEFAULT 0,
  document_requests INTEGER NOT NULL DEFAULT 0,
  deed_inquiries INTEGER NOT NULL DEFAULT 0,
  apartment_rentals INTEGER NOT NULL DEFAULT 0,
  sold_projects INTEGER NOT NULL DEFAULT 0,
  cancelled_maintenance INTEGER NOT NULL DEFAULT 0,
  resolved_maintenance INTEGER NOT NULL DEFAULT 0,
  in_progress_maintenance INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(period)
);

-- جدول رضا العملاء
CREATE TABLE IF NOT EXISTS satisfaction (
  id SERIAL PRIMARY KEY,
  period VARCHAR(10) NOT NULL CHECK (period IN ('weekly', 'yearly')),
  category VARCHAR(50) NOT NULL CHECK (category IN ('serviceQuality', 'closureTime', 'firstTimeResolution')),
  very_happy INTEGER NOT NULL DEFAULT 0,
  happy INTEGER NOT NULL DEFAULT 0,
  neutral INTEGER NOT NULL DEFAULT 0,
  unhappy INTEGER NOT NULL DEFAULT 0,
  very_unhappy INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(period, category)
);

-- جدول التعليقات
CREATE TABLE IF NOT EXISTS comments (
  id SERIAL PRIMARY KEY,
  period VARCHAR(10) NOT NULL CHECK (period IN ('weekly', 'yearly')),
  text TEXT NOT NULL,
  username VARCHAR(100) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء الفهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_metrics_period ON metrics(period);
CREATE INDEX IF NOT EXISTS idx_customer_service_period ON customer_service(period);
CREATE INDEX IF NOT EXISTS idx_satisfaction_period_category ON satisfaction(period, category);
CREATE INDEX IF NOT EXISTS idx_comments_period ON comments(period);

-- إنشاء الدوال لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- إنشاء المحفزات
CREATE TRIGGER update_metrics_updated_at BEFORE UPDATE ON metrics
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_customer_service_updated_at BEFORE UPDATE ON customer_service
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_satisfaction_updated_at BEFORE UPDATE ON satisfaction
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
