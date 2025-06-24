
-- إنشاء جدول سجلات الزوار
CREATE TABLE IF NOT EXISTS visitor_records (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  visit_reason TEXT NOT NULL,
  requested_employee TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT NOT NULL,
  created_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_visitor_records_date ON visitor_records(date);
CREATE INDEX IF NOT EXISTS idx_visitor_records_name ON visitor_records(name);
CREATE INDEX IF NOT EXISTS idx_visitor_records_created_by ON visitor_records(created_by);

-- إضافة trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_visitor_records_updated_at 
    BEFORE UPDATE ON visitor_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- تمكين RLS
ALTER TABLE visitor_records ENABLE ROW LEVEL SECURITY;

-- إضافة سياسات RLS
CREATE POLICY "Enable read access for all users" ON visitor_records FOR SELECT USING (true);
CREATE POLICY "Enable insert for authenticated users" ON visitor_records FOR INSERT WITH CHECK (true);
CREATE POLICY "Enable update for authenticated users" ON visitor_records FOR UPDATE USING (true);
CREATE POLICY "Enable delete for authenticated users" ON visitor_records FOR DELETE USING (true);
