
-- إنشاء جدول بيانات 3CX
CREATE TABLE IF NOT EXISTS threecx_data (
    id SERIAL PRIMARY KEY,
    call_time TIMESTAMP NOT NULL,
    call_id TEXT NOT NULL,
    from_number TEXT,
    to_number TEXT,
    direction TEXT CHECK (direction IN ('Inbound', 'Outbound')),
    status TEXT CHECK (status IN ('Answered', 'Unanswered')),
    ringing_duration INTEGER DEFAULT 0,
    talking_duration INTEGER DEFAULT 0,
    agent_name TEXT,
    is_business_hours BOOLEAN DEFAULT TRUE,
    response_time INTEGER DEFAULT 0,
    period TEXT CHECK (period IN ('weekly', 'yearly')) DEFAULT 'weekly',
    created_by TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- إنشاء فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_threecx_call_time ON threecx_data(call_time);
CREATE INDEX IF NOT EXISTS idx_threecx_agent_name ON threecx_data(agent_name);
CREATE INDEX IF NOT EXISTS idx_threecx_period ON threecx_data(period);
CREATE INDEX IF NOT EXISTS idx_threecx_business_hours ON threecx_data(is_business_hours);

-- تفعيل RLS
ALTER TABLE threecx_data ENABLE ROW LEVEL SECURITY;

-- سياسات الأمان
CREATE POLICY "Users can view all 3CX data" ON threecx_data
    FOR SELECT USING (true);

CREATE POLICY "Users can insert 3CX data" ON threecx_data
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update 3CX data" ON threecx_data
    FOR UPDATE USING (true);

CREATE POLICY "Users can delete 3CX data" ON threecx_data
    FOR DELETE USING (true);
