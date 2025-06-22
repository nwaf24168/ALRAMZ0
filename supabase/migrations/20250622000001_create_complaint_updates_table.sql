
-- إنشاء جدول تحديثات الشكاوى
CREATE TABLE IF NOT EXISTS complaint_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id TEXT NOT NULL REFERENCES complaints(complaint_id) ON DELETE CASCADE,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهرس لتحسين الأداء
CREATE INDEX idx_complaint_updates_complaint_id ON complaint_updates(complaint_id);
CREATE INDEX idx_complaint_updates_created_at ON complaint_updates(created_at DESC);

-- تمكين RLS
ALTER TABLE complaint_updates ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسة للسماح بالقراءة والكتابة
CREATE POLICY "Enable all operations for complaint_updates" ON complaint_updates
  FOR ALL USING (true) WITH CHECK (true);
