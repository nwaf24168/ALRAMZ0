
-- إنشاء جدول CSAT للواتساب
CREATE TABLE IF NOT EXISTS csat_whatsapp (
  id SERIAL PRIMARY KEY,
  period VARCHAR(10) NOT NULL CHECK (period IN ('weekly', 'yearly')),
  score NUMERIC(3,2) NOT NULL CHECK (score >= 0 AND score <= 5),
  total_responses INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_csat_whatsapp_period ON csat_whatsapp(period);

-- إدراج بيانات افتراضية
INSERT INTO csat_whatsapp (period, score, total_responses) VALUES 
('weekly', 4.2, 0),
('yearly', 4.5, 0);
