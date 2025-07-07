
-- إضافة عمود الفرع إلى جدول سجلات الزوار
ALTER TABLE public.visitor_records 
ADD COLUMN IF NOT EXISTS branch TEXT;

-- تحديث السجلات الموجودة لتعيين الفرع بناءً على اسم المنشئ
UPDATE public.visitor_records 
SET branch = CASE 
    WHEN LOWER(created_by) = 'nouf' THEN 'فرع المبيعات'
    WHEN LOWER(created_by) = 'abdulrahman' THEN 'الفرع الرئيسي'
    WHEN LOWER(created_by) = 'fahad' THEN 'فرع الشرقية'
    ELSE 'غير محدد'
END
WHERE branch IS NULL;

-- إضافة فهرس للبحث السريع على الفرع
CREATE INDEX IF NOT EXISTS idx_visitor_records_branch ON public.visitor_records(branch);
