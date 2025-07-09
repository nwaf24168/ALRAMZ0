
-- إضافة عمود المنشئ إلى جدول سجلات الاستقبال
ALTER TABLE reception_records 
ADD COLUMN IF NOT EXISTS creator_name TEXT;

-- تحديث السجلات الموجودة لتعيين المنشئ بناءً على created_by
UPDATE reception_records 
SET creator_name = created_by 
WHERE creator_name IS NULL;

-- إنشاء فهرس للبحث السريع
CREATE INDEX IF NOT EXISTS idx_reception_records_creator ON reception_records(creator_name);
