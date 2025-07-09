
-- تحديث الحالات في جدول reception_records
UPDATE public.reception_records 
SET status = CASE 
    WHEN status = 'جديد' THEN 'جديدة'
    WHEN status = 'قيد المعالجة' THEN 'قائمة'
    WHEN status = 'مكتمل' THEN 'تمت'
    WHEN status = 'مؤجل' THEN 'قائمة'
    WHEN status = 'تم التحويل للشكاوى' THEN 'تمت'
    ELSE status
END
WHERE status IN ('جديد', 'قيد المعالجة', 'مكتمل', 'مؤجل', 'تم التحويل للشكاوى');

-- إضافة تعليق للجدول
COMMENT ON COLUMN public.reception_records.status IS 'حالة السجل: جديدة، قائمة، تمت';
