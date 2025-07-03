
-- إنشاء جدول لحفظ نتائج CSAT
CREATE TABLE IF NOT EXISTS csat_scores (
    id SERIAL PRIMARY KEY,
    score DECIMAL(5,2) NOT NULL CHECK (score >= 0 AND score <= 100),
    source TEXT NOT NULL DEFAULT 'whatsapp',
    period TEXT NOT NULL DEFAULT 'weekly' CHECK (period IN ('weekly', 'yearly')),
    created_by TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- إضافة RLS (Row Level Security)
ALTER TABLE csat_scores ENABLE ROW LEVEL SECURITY;

-- إنشاء سياسة للسماح بالقراءة والكتابة لجميع المستخدمين المصرح لهم
CREATE POLICY "Enable read access for all users" ON csat_scores
    FOR SELECT USING (true);

CREATE POLICY "Enable insert access for all users" ON csat_scores
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Enable update access for all users" ON csat_scores
    FOR UPDATE USING (true);

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_csat_scores_period ON csat_scores (period);
CREATE INDEX IF NOT EXISTS idx_csat_scores_source ON csat_scores (source);
CREATE INDEX IF NOT EXISTS idx_csat_scores_created_at ON csat_scores (created_at);
