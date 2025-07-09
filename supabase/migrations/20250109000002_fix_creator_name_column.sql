
-- إضافة عمود creator_name إذا لم يكن موجوداً
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name='reception_records' AND column_name='creator_name') THEN
        ALTER TABLE public.reception_records ADD COLUMN creator_name text;
    END IF;
END $$;

-- تحديث السجلات الموجودة بقيمة افتراضية
UPDATE public.reception_records 
SET creator_name = 'غير محدد' 
WHERE creator_name IS NULL;
