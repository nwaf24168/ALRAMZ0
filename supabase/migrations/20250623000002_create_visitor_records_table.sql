
-- إنشاء جدول سجلات الزوار
CREATE TABLE IF NOT EXISTS visitor_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
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
CREATE TRIGGER update_visitor_records_updated_at 
    BEFORE UPDATE ON visitor_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إدراج بعض البيانات التجريبية
INSERT INTO visitor_records (name, phone_number, visit_reason, requested_employee, date, time, created_by) VALUES
('محمد أحمد', '0501234567', 'اجتماع عمل', 'سارة محمد', '2025-01-30', '10:30', 'admin'),
('فاطمة علي', '0509876543', 'استشارة', 'أحمد خالد', '2025-01-30', '14:00', 'admin');
