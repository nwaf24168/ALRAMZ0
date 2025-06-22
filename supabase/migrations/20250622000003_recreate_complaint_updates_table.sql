
-- حذف الجدول القديم إذا كان موجود
DROP TABLE IF EXISTS complaint_updates;

-- إنشاء جدول complaint_updates بالهيكل الصحيح
CREATE TABLE complaint_updates (
  id SERIAL PRIMARY KEY,
  complaint_id TEXT NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  updated_by TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء المؤشرات لتحسين الأداء
CREATE INDEX idx_complaint_updates_complaint_id ON complaint_updates(complaint_id);
CREATE INDEX idx_complaint_updates_updated_at ON complaint_updates(updated_at DESC);

-- تمكين Row Level Security
ALTER TABLE complaint_updates ENABLE ROW LEVEL SECURITY;

-- إنشاء السياسات
CREATE POLICY "Enable read access for all users" ON complaint_updates
  FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON complaint_updates
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON complaint_updates
  FOR UPDATE USING (true);

CREATE POLICY "Enable delete access for all users" ON complaint_updates
  FOR DELETE USING (true);
