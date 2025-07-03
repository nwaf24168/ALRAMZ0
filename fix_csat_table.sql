
-- حذف الجدول القديم إذا كان موجوداً
DROP TABLE IF EXISTS csat_whatsapp CASCADE;

-- إنشاء جدول نتائج CSAT للواتس اب مع جميع الأعمدة المطلوبة
CREATE TABLE csat_whatsapp (
  id SERIAL PRIMARY KEY,
  score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
  source TEXT NOT NULL DEFAULT 'whatsapp',
  period TEXT NOT NULL CHECK (period IN ('weekly', 'yearly')),
  created_by TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهارس للأداء
CREATE INDEX IF NOT EXISTS idx_csat_whatsapp_period ON csat_whatsapp(period);
CREATE INDEX IF NOT EXISTS idx_csat_whatsapp_source ON csat_whatsapp(source);
CREATE INDEX IF NOT EXISTS idx_csat_whatsapp_created_at ON csat_whatsapp(created_at);

-- تمكين RLS
ALTER TABLE csat_whatsapp ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسة للسماح بجميع العمليات
CREATE POLICY "Enable all operations on csat_whatsapp" ON csat_whatsapp
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- إضافة بعض البيانات التجريبية
INSERT INTO csat_whatsapp (score, period, created_by) VALUES
(74.0, 'weekly', 'System'),
(78.0, 'yearly', 'System');

-- تحديث الإحصائيات لتحسين الأداء
ANALYZE csat_whatsapp;
