
-- إنشاء جدول سجلات الزوار
CREATE TABLE IF NOT EXISTS public.visitor_records (
    id BIGSERIAL PRIMARY KEY,
    name TEXT NOT NULL,
    phone_number TEXT,
    visit_reason TEXT,
    requested_employee TEXT,
    date DATE,
    time TIME,
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إضافة RLS (Row Level Security)
ALTER TABLE public.visitor_records ENABLE ROW LEVEL SECURITY;

-- إضافة سياسة للسماح بكل العمليات (يمكن تخصيصها لاحقاً)
CREATE POLICY "Allow all operations for visitor_records" ON public.visitor_records
    FOR ALL USING (true);

-- إضافة فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_visitor_records_created_at ON public.visitor_records(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_visitor_records_date ON public.visitor_records(date);
CREATE INDEX IF NOT EXISTS idx_visitor_records_name ON public.visitor_records(name);
