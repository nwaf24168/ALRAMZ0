
-- إضافة عمود maintenance_delivery_action المفقود إلى جدول complaints
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS maintenance_delivery_action TEXT;

-- تحديث البيانات الموجودة لتعيين قيمة افتراضية
UPDATE complaints 
SET maintenance_delivery_action = '' 
WHERE maintenance_delivery_action IS NULL;

-- التأكد من وجود جميع الأعمدة المطلوبة
ALTER TABLE complaints 
ADD COLUMN IF NOT EXISTS priority TEXT DEFAULT 'متوسطة',
ADD COLUMN IF NOT EXISTS request_number TEXT,
ADD COLUMN IF NOT EXISTS expected_closure_time TEXT;

-- تحديث البيانات الموجودة للأعمدة الأخرى إذا كانت مفقودة
UPDATE complaints 
SET priority = 'متوسطة' 
WHERE priority IS NULL;

UPDATE complaints 
SET request_number = 'REQ-' || LPAD(id::text, 6, '0') 
WHERE request_number IS NULL;

UPDATE complaints 
SET expected_closure_time = '' 
WHERE expected_closure_time IS NULL;
