
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
