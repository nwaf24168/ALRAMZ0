
-- إضافة الحقول الجديدة لجدول الحجوزات
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS customer_phone TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS project_notes TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS created_by TEXT;
ALTER TABLE public.bookings ADD COLUMN IF NOT EXISTS updated_by TEXT;

-- تحديث القيم الفارغة
UPDATE public.bookings SET created_by = 'system' WHERE created_by IS NULL;
UPDATE public.bookings SET status_sales_filled = false WHERE status_sales_filled IS NULL;
UPDATE public.bookings SET status_projects_filled = false WHERE status_projects_filled IS NULL;
UPDATE public.bookings SET status_customer_filled = false WHERE status_customer_filled IS NULL;

-- إضافة فهرس للحالات
CREATE INDEX IF NOT EXISTS idx_bookings_status_stages ON public.bookings(status_sales_filled, status_projects_filled, status_customer_filled);
-- إنشاء جدول الحجوزات مع نظام المراحل الثلاث
CREATE TABLE IF NOT EXISTS public.delivery_bookings (
    id BIGSERIAL PRIMARY KEY,
    
    -- بيانات المرحلة الأولى - المبيعات
    booking_date DATE,
    customer_name TEXT NOT NULL,
    customer_phone TEXT,
    project TEXT,
    building TEXT,
    unit TEXT,
    payment_method TEXT,
    sale_type TEXT CHECK (sale_type IN ('بيع على الخارطة', 'جاهز')),
    unit_value DECIMAL(15,2),
    handover_date DATE,
    sales_employee TEXT,
    sales_completed BOOLEAN DEFAULT FALSE,
    
    -- بيانات المرحلة الثانية - إدارة المشاريع
    construction_completion_date DATE,
    final_handover_date DATE,
    electricity_meter_transfer_date DATE,
    water_meter_transfer_date DATE,
    customer_delivery_date DATE,
    project_notes TEXT,
    projects_completed BOOLEAN DEFAULT FALSE,
    
    -- بيانات المرحلة الثالثة - راحة العملاء
    customer_evaluation_done BOOLEAN DEFAULT FALSE,
    evaluation_percentage DECIMAL(5,2),
    customer_service_completed BOOLEAN DEFAULT FALSE,
    
    -- بيانات عامة
    status TEXT DEFAULT 'في المبيعات' CHECK (status IN ('في المبيعات', 'في إدارة المشاريع', 'في راحة العملاء', 'مكتمل')),
    created_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- إضافة RLS
ALTER TABLE public.delivery_bookings ENABLE ROW LEVEL SECURITY;

-- إضافة سياسة للسماح بكل العمليات
CREATE POLICY "Allow all operations for delivery_bookings" ON public.delivery_bookings
    FOR ALL USING (true);

-- إضافة فهارس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_delivery_bookings_status ON public.delivery_bookings(status);
CREATE INDEX IF NOT EXISTS idx_delivery_bookings_customer_name ON public.delivery_bookings(customer_name);
CREATE INDEX IF NOT EXISTS idx_delivery_bookings_created_at ON public.delivery_bookings(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_delivery_bookings_booking_date ON public.delivery_bookings(booking_date DESC);

-- دالة لتحديث التاريخ عند التعديل
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إضافة trigger لتحديث updated_at تلقائياً
CREATE TRIGGER update_delivery_bookings_updated_at 
    BEFORE UPDATE ON public.delivery_bookings 
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- دالة لتحديث الحالة تلقائياً بناءً على المراحل المكتملة
CREATE OR REPLACE FUNCTION update_booking_status()
RETURNS TRIGGER AS $$
BEGIN
    -- تحديث الحالة بناءً على المراحل المكتملة
    IF NEW.customer_service_completed = TRUE THEN
        NEW.status = 'مكتمل';
    ELSIF NEW.projects_completed = TRUE THEN
        NEW.status = 'في راحة العملاء';
    ELSIF NEW.sales_completed = TRUE THEN
        NEW.status = 'في إدارة المشاريع';
    ELSE
        NEW.status = 'في المبيعات';
    END IF;
    
    -- السماح للمراحل اللاحقة بالتعديل حتى لو لم تكن المرحلة السابقة مكتملة
    -- (هذا يعطي مرونة أكثر في الاستخدام)
    
    RETURN NEW;
END;
$$ language 'plpgsql';

-- إضافة trigger لتحديث الحالة تلقائياً
CREATE TRIGGER update_booking_status_trigger 
    BEFORE INSERT OR UPDATE ON public.delivery_bookings 
    FOR EACH ROW EXECUTE FUNCTION update_booking_status();
