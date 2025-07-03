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

-- تحديث جدول 3CX ليشمل البيانات المطلوبة
DROP TABLE IF EXISTS threecx_data;

CREATE TABLE threecx_data (
    id SERIAL PRIMARY KEY,
    call_time TIMESTAMP NOT NULL,
    call_id TEXT NOT NULL,
    from_number TEXT,
    to_number TEXT,
    direction TEXT CHECK (direction IN ('Inbound', 'Outbound')),
    status TEXT CHECK (status IN ('Answered', 'Unanswered')),
    ringing_duration INTEGER DEFAULT 0, -- بالثواني
    talking_duration INTEGER DEFAULT 0, -- بالثواني
    agent_name TEXT,
    is_business_hours BOOLEAN DEFAULT TRUE,
    response_time INTEGER DEFAULT 0, -- بالثواني
    period TEXT CHECK (period IN ('weekly', 'yearly')) DEFAULT 'weekly',
    created_by TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- إضافة جدول إعدادات أوقات الدوام
CREATE TABLE IF NOT EXISTS business_hours_settings (
    id SERIAL PRIMARY KEY,
    day_of_week INTEGER CHECK (day_of_week >= 0 AND day_of_week <= 6), -- 0=Sunday, 6=Saturday
    start_hour INTEGER CHECK (start_hour >= 0 AND start_hour <= 23),
    end_hour INTEGER CHECK (end_hour >= 0 AND end_hour <= 23),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- إدراج أوقات الدوام الافتراضية
INSERT INTO business_hours_settings (day_of_week, start_hour, end_hour, is_active) VALUES
(0, 9, 22, true),  -- الأحد
(1, 9, 22, true),  -- الاثنين
(2, 9, 22, true),  -- الثلاثاء
(3, 9, 22, true),  -- الأربعاء
(4, 9, 22, true),  -- الخميس
(5, 14, 22, true), -- الجمعة
(6, 14, 22, true); -- السبت

-- إنشاء فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_threecx_call_time ON threecx_data(call_time);
CREATE INDEX IF NOT EXISTS idx_threecx_agent_name ON threecx_data(agent_name);
CREATE INDEX IF NOT EXISTS idx_threecx_period ON threecx_data(period);
CREATE INDEX IF NOT EXISTS idx_threecx_business_hours ON threecx_data(is_business_hours);
CREATE INDEX IF NOT EXISTS idx_threecx_status ON threecx_data(status);
CREATE INDEX IF NOT EXISTS idx_threecx_direction ON threecx_data(direction);

CREATE INDEX IF NOT EXISTS idx_threecx_period ON threecx_data(period);

-- تفعيل RLS
ALTER TABLE threecx_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_hours_settings ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Users can view all 3CX data" ON threecx_data FOR SELECT USING (true);
CREATE POLICY "Users can insert 3CX data" ON threecx_data FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update 3CX data" ON threecx_data FOR UPDATE USING (true);
CREATE POLICY "Users can delete 3CX data" ON threecx_data FOR DELETE USING (true);

CREATE POLICY "Users can view business hours" ON business_hours_settings FOR SELECT USING (true);
CREATE POLICY "Users can update business hours" ON business_hours_settings FOR UPDATE USING (true);