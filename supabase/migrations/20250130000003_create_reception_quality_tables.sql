
-- إنشاء جدول سجلات الاستقبال
CREATE TABLE IF NOT EXISTS reception_records (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  date TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  project TEXT NOT NULL,
  employee TEXT NOT NULL,
  contact_method TEXT NOT NULL,
  type TEXT NOT NULL,
  customer_request TEXT NOT NULL,
  action TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'جديد',
  created_by TEXT NOT NULL,
  updated_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء جدول مكالمات الجودة
CREATE TABLE IF NOT EXISTS quality_calls (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  call_id TEXT UNIQUE NOT NULL,
  call_date TEXT NOT NULL,
  customer_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  project TEXT NOT NULL,
  unit_number TEXT,
  call_type TEXT NOT NULL,
  call_duration INTEGER, -- بالدقائق
  evaluation_score INTEGER CHECK (evaluation_score >= 1 AND evaluation_score <= 5),
  qualification_status TEXT DEFAULT 'قيد المراجعة',
  qualification_reason TEXT,
  notes TEXT,
  audio_file_url TEXT,
  created_by TEXT NOT NULL,
  updated_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_reception_records_date ON reception_records(date);
CREATE INDEX IF NOT EXISTS idx_reception_records_customer ON reception_records(customer_name);
CREATE INDEX IF NOT EXISTS idx_reception_records_status ON reception_records(status);
CREATE INDEX IF NOT EXISTS idx_reception_records_created_by ON reception_records(created_by);

CREATE INDEX IF NOT EXISTS idx_quality_calls_date ON quality_calls(call_date);
CREATE INDEX IF NOT EXISTS idx_quality_calls_customer ON quality_calls(customer_name);
CREATE INDEX IF NOT EXISTS idx_quality_calls_project ON quality_calls(project);
CREATE INDEX IF NOT EXISTS idx_quality_calls_status ON quality_calls(qualification_status);
CREATE INDEX IF NOT EXISTS idx_quality_calls_created_by ON quality_calls(created_by);

-- إضافة trigger لتحديث updated_at تلقائياً
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_reception_records_updated_at 
    BEFORE UPDATE ON reception_records 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_quality_calls_updated_at 
    BEFORE UPDATE ON quality_calls 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- إدراج بعض البيانات التجريبية
INSERT INTO reception_records (date, customer_name, phone_number, project, employee, contact_method, type, customer_request, action, status, created_by) VALUES
('2025-01-30', 'أحمد محمد', '0501234567', 'مشروع الرمز', 'سارة أحمد', 'اتصال هاتفي', 'استفسار', 'استفسار عن موعد التسليم', 'تم التوجيه لقسم المبيعات', 'مكتمل', 'nawaf'),
('2025-01-30', 'فاطمة علي', '0509876543', 'سديم تاون', 'محمد خالد', 'واتساب', 'شكوى', 'تأخير في أعمال الصيانة', 'تم إنشاء طلب صيانة عاجل', 'قيد المتابعة', 'nawaf');

INSERT INTO quality_calls (call_id, call_date, customer_name, phone_number, project, unit_number, call_type, call_duration, evaluation_score, qualification_status, qualification_reason, notes, created_by) VALUES
('QC-2025-001', '2025-01-30', 'عبدالله السعيد', '0551234567', 'مشروع الرمز', 'A-101', 'مكالمة تأهيل', 15, 4, 'مؤهل', 'عميل جاد ومهتم بالشراء', 'العميل أبدى اهتماماً كبيراً بالمشروع', 'nawaf'),
('QC-2025-002', '2025-01-30', 'نورا أحمد', '0559876543', 'سديم تاون', 'B-205', 'مكالمة متابعة', 8, 3, 'قيد المراجعة', '', 'يحتاج إلى مزيد من المتابعة', 'nawaf');
