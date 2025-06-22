
-- إنشاء جدول تحديثات الشكاوى مع التأكد من وجود جميع الأعمدة
DROP TABLE IF EXISTS complaint_updates;

CREATE TABLE complaint_updates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  complaint_id TEXT NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  updated_by TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- إضافة فهرس لتحسين الأداء
CREATE INDEX IF NOT EXISTS idx_complaint_updates_complaint_id ON complaint_updates(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_updates_created_at ON complaint_updates(created_at);

-- تمكين RLS
ALTER TABLE complaint_updates ENABLE ROW LEVEL SECURITY;

-- السماح بالقراءة والكتابة للجميع (يمكن تعديلها حسب الحاجة)
CREATE POLICY IF NOT EXISTS "Enable read access for all users" ON complaint_updates
FOR SELECT USING (true);

CREATE POLICY IF NOT EXISTS "Enable insert access for all users" ON complaint_updates
FOR INSERT WITH CHECK (true);

CREATE POLICY IF NOT EXISTS "Enable update access for all users" ON complaint_updates
FOR UPDATE USING (true);

CREATE POLICY IF NOT EXISTS "Enable delete access for all users" ON complaint_updates
FOR DELETE USING (true);
